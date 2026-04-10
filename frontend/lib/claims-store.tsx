"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ClaimContext, ClaimRecord, FinalOutput } from "@/lib/types";
import { mapBackendResponseToFinalOutput } from "@/lib/api-mapper";

interface ClaimsState {
  claims: ClaimRecord[];
  batchSummary: BatchSummary | null;
  /** Last completed batch outputs — used for JSON export. */
  lastBatchResults: FinalOutput[] | null;
}

export interface BatchSummary {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  avgConfidence: number;
  totalPayoutExposure: number;
  fraudRejections: number;
}

interface ClaimsContextValue extends ClaimsState {
  addClaim: (
    context: ClaimContext,
    imagePreviewUrl: string | null,
    file: File | null
  ) => Promise<FinalOutput>;
  addBatch: (
    items: { context: ClaimContext; imagePreviewUrl: string | null }[],
    onProgress?: (index: number, result: FinalOutput) => void
  ) => Promise<FinalOutput[]>;
  getById: (claimId: string) => ClaimRecord | undefined;
  clearBatchSummary: () => void;
}

const ClaimsContext = createContext<ClaimsContextValue | null>(null);

function computeBatchSummary(results: FinalOutput[]): BatchSummary {
  const approved = results.filter((r) => r.status === "Approved").length;
  const rejected = results.filter((r) => r.status === "Rejected").length;
  const pending = results.filter((r) => r.status === "Pending").length;
  const avgConfidence =
    results.reduce((s, r) => s + r.confidence_score, 0) /
    Math.max(results.length, 1);
  const totalPayoutExposure = results
    .filter((r) => r.status === "Approved")
    .reduce((s, r) => s + r.final_payout, 0);
  const fraudRejections = results.filter(
    (r) =>
      r.status === "Rejected" &&
      /fraud/i.test(r.reason_summary)
  ).length;
  return {
    total: results.length,
    approved,
    rejected,
    pending,
    avgConfidence,
    totalPayoutExposure,
    fraudRejections,
  };
}

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [lastBatchResults, setLastBatchResults] = useState<FinalOutput[] | null>(
    null
  );

  const addClaim = useCallback(
    async (
      context: ClaimContext,
      imagePreviewUrl: string | null,
      file: File | null
    ) => {
      const start = Date.now();
      const formData = new FormData();
      formData.append("claim_data", JSON.stringify(context));
      if (file) {
        formData.append("image", file);
      }

      const res = await fetch("/api/process-claim", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const backendRes = await res.json();
      const processingTime = Date.now() - start;
      const result = mapBackendResponseToFinalOutput(backendRes, context, imagePreviewUrl, processingTime);

      const record: ClaimRecord = {
        context,
        result,
        submittedAt: new Date().toISOString(),
      };
      setClaims((prev) => [record, ...prev]);
      return result;
    },
    []
  );

  // Note: addBatch uses the mock implementation fallback for now unless batch route is provided
  // But we can just iterate the fetch
  const addBatch = useCallback(
    async (
      items: { context: ClaimContext; imagePreviewUrl: string | null }[],
      onProgress?: (index: number, result: FinalOutput) => void
    ) => {
      const out: FinalOutput[] = [];
      const records: ClaimRecord[] = [];
      const submittedAt = new Date().toISOString();
      for (let i = 0; i < items.length; i++) {
        const start = Date.now();
        const formData = new FormData();
        formData.append("claim_data", JSON.stringify(items[i].context));
        
        const res = await fetch("/api/process-claim", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
           throw new Error("Batch processing failed at claim " + items[i].context.claim_id);
        }
        
        const backendRes = await res.json();
        const processingTime = Date.now() - start;
        const result = mapBackendResponseToFinalOutput(backendRes, items[i].context, items[i].imagePreviewUrl, processingTime);
        
        out.push(result);
        records.push({ context: items[i].context, result, submittedAt });
        onProgress?.(i, result);
      }
      setClaims((prev) => [...records.reverse(), ...prev]);
      setBatchSummary(computeBatchSummary(out));
      setLastBatchResults(out);
      return out;
    },
    []
  );

  const getById = useCallback(
    (claimId: string) => claims.find((c) => c.context.claim_id === claimId),
    [claims]
  );

  const clearBatchSummary = useCallback(() => {
    setBatchSummary(null);
    setLastBatchResults(null);
  }, []);

  const value = useMemo(
    () => ({
      claims,
      batchSummary,
      lastBatchResults,
      addClaim,
      addBatch,
      getById,
      clearBatchSummary,
    }),
    [
      claims,
      batchSummary,
      lastBatchResults,
      addClaim,
      addBatch,
      getById,
      clearBatchSummary,
    ]
  );

  return (
    <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>
  );
}

export function useClaims() {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used within ClaimsProvider");
  return ctx;
}
