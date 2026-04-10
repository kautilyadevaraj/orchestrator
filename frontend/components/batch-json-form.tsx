"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useClaims } from "@/lib/claims-store";
import { useToast } from "@/components/toast-host";
import {
  claimContextSchema,
  type BatchClaimRow,
} from "@/lib/claim-context-schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatInr } from "@/lib/utils";
import type { ClaimContext } from "@/lib/types";
import { Download, Loader2, Upload } from "lucide-react";

type RowState = {
  raw: unknown;
  index: number;
  parsed?: BatchClaimRow;
  error?: string;
};

function parseJsonFile(text: string): unknown {
  return JSON.parse(text);
}

export function BatchJsonForm() {
  const router = useRouter();
  const { addBatch, lastBatchResults } = useClaims();
  const { show } = useToast();
  const [rows, setRows] = useState<RowState[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Record<number, boolean>>({});

  const onFile = useCallback(async (f: File | null) => {
    if (!f) return;
    try {
      const text = await f.text();
      const data = parseJsonFile(text);
      const arr = Array.isArray(data) ? data : null;
      if (!arr) {
        show("JSON root must be an array of claims.", "error");
        setRows(null);
        return;
      }
      const next: RowState[] = arr.map((raw, index) => {
        const one = claimContextSchema.safeParse(raw);
        if (one.success)
          return { raw, index, parsed: one.data };
        return {
          raw,
          index,
          error: one.error.errors.map((e) => e.message).join("; "),
        };
      });
      setRows(next);
    } catch {
      show("Could not parse JSON file.", "error");
      setRows(null);
    }
  }, [show]);

  const validRows = useMemo(
    () => rows?.filter((r) => r.parsed) as (RowState & { parsed: BatchClaimRow })[],
    [rows]
  );

  const exportResults = useCallback(() => {
    const payload = lastBatchResults?.length
      ? lastBatchResults
      : rows?.map((r) => r.raw);
    if (!payload?.length) {
      show("Nothing to export yet — run a batch first.", "error");
      return;
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `claims-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [lastBatchResults, rows, show]);

  const runBatch = useCallback(async () => {
    if (!validRows?.length) {
      show("No valid rows to submit.", "error");
      return;
    }
    setBusy(true);
    setProgress({});
    try {
      const items = validRows.map((r) => {
        const p = r.parsed;
        const ctx: ClaimContext = {
          claim_id: p.claim_id,
          description: p.description,
          policy_type: p.policy_type,
          claim_amount: p.claim_amount,
          past_claims: p.past_claims,
          documents_status: p.documents_status,
          image_url: p.image_url ?? null,
          preferred_language: p.preferred_language,
        };
        return {
          context: ctx,
          imagePreviewUrl: p.image_url ?? null,
        };
      });
      await addBatch(items, (i) => {
        setProgress((prev) => ({ ...prev, [i]: true }));
      });
      show("Batch complete — open Results for the table and summary.");
      router.push("/results");
    } catch {
      show("Batch run failed (mock).", "error");
    } finally {
      setBusy(false);
    }
  }, [addBatch, router, show, validRows]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Batch JSON</CardTitle>
          <CardDescription>
            Upload an array of claim objects. Invalid rows are highlighted;
            only valid rows are simulated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-muted/40 px-4 py-10 text-center transition-[border-color,background-color,transform] duration-200 ease-enter hover:border-accent/50 hover:bg-surface-muted/60">
            <Upload className="h-8 w-8 text-ink-muted" aria-hidden />
            <span className="text-sm font-medium text-ink">
              Drop a .json file or click to browse
            </span>
            <span className="text-xs text-ink-muted">
              Root must be: <code className="rounded bg-surface px-1">[ ... ]</code>
            </span>
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!rows?.length && !lastBatchResults?.length}
              onClick={exportResults}
            >
              <Download className="h-4 w-4" aria-hidden />
              Export results JSON
            </Button>
            <Button
              type="button"
              disabled={!validRows?.length || busy}
              onClick={runBatch}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Running batch…
                </>
              ) : (
                `Run ${validRows?.length ?? 0} valid claims`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            {rows
              ? `${rows.length} row(s) — ${validRows?.length ?? 0} valid`
              : "No file loaded yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-auto">
          {!rows?.length ? (
            <p className="text-sm text-ink-muted">
              Load a JSON array to see row-level validation.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="py-2 pr-2 font-medium">#</th>
                  <th className="py-2 pr-2 font-medium">ID</th>
                  <th className="py-2 pr-2 font-medium">Amount</th>
                  <th className="py-2 pr-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.index}
                    className={cn(
                      "border-b border-border/70 transition-[background-color,opacity,transform] duration-200 ease-enter animate-fade-in",
                      r.error && "bg-status-rejected/5",
                      progress[r.index] && "bg-accent/5"
                    )}
                  >
                    <td className="py-2 pr-2 tabular-nums text-ink-muted">
                      {r.index + 1}
                    </td>
                    <td className="max-w-[120px] truncate py-2 pr-2 font-mono text-xs">
                      {r.parsed?.claim_id ?? "—"}
                    </td>
                    <td className="py-2 pr-2 tabular-nums">
                      {r.parsed
                        ? formatInr(r.parsed.claim_amount)
                        : "—"}
                    </td>
                    <td className="py-2 pr-2">
                      {r.error ? (
                        <span className="text-xs text-status-rejected">
                          {r.error}
                        </span>
                      ) : progress[r.index] ? (
                        <span className="text-xs text-accent">Done</span>
                      ) : (
                        <span className="text-xs text-ink-muted">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
