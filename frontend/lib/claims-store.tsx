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
import { buildMockFinalOutput, delay } from "@/lib/mock-pipeline";

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
    simulateMs?: number
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
      simulateMs = 900
    ) => {
      await delay(simulateMs);
      const result = buildMockFinalOutput(context, imagePreviewUrl);
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

  const addBatch = useCallback(
    async (
      items: { context: ClaimContext; imagePreviewUrl: string | null }[],
      onProgress?: (index: number, result: FinalOutput) => void
    ) => {
      const out: FinalOutput[] = [];
      const records: ClaimRecord[] = [];
      const submittedAt = new Date().toISOString();
      for (let i = 0; i < items.length; i++) {
        await delay(350 + (i % 3) * 120);
        const result = buildMockFinalOutput(
          items[i].context,
          items[i].imagePreviewUrl
        );
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
