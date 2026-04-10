"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClaims } from "@/lib/claims-store";
import type { FinalStatus } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { cn, formatInr } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

type SortKey = "confidence" | "amount" | "time";

export function ClaimsTable() {
  const { claims } = useClaims();
  const [statusFilter, setStatusFilter] = useState<FinalStatus | "all">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "time",
    dir: "desc",
  });

  const filtered = useMemo(() => {
    let list = [...claims];
    if (statusFilter !== "all")
      list = list.filter((c) => c.result.status === statusFilter);
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "confidence")
        return (a.result.confidence_score - b.result.confidence_score) * dir;
      if (sort.key === "amount")
        return (a.result.final_payout - b.result.final_payout) * dir;
      return (
        (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) *
        dir
      );
    });
    return list;
  }, [claims, statusFilter, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );
  };

  if (!claims.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-12 text-center text-sm text-ink-muted">
        No claims yet.{" "}
        <Link href="/submit" className="font-medium text-accent underline-offset-4 hover:underline">
          Submit a claim
        </Link>{" "}
        or run a batch.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All"],
            ["Approved", "Approved"],
            ["Rejected", "Rejected"],
            ["Pending", "Pending"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatusFilter(id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-[transform,opacity,border-color,background-color] duration-200 ease-enter active:scale-[0.98]",
              statusFilter === id
                ? "border-accent bg-accent/10 text-ink"
                : "border-border bg-surface-elevated text-ink-muted hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-xs text-ink-muted">
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
          <button
            type="button"
            className="rounded-md px-2 py-1 hover:bg-surface-muted"
            onClick={() => toggleSort("confidence")}
          >
            Confidence
          </button>
          <button
            type="button"
            className="rounded-md px-2 py-1 hover:bg-surface-muted"
            onClick={() => toggleSort("amount")}
          >
            Payout
          </button>
          <button
            type="button"
            className="rounded-md px-2 py-1 hover:bg-surface-muted"
            onClick={() => toggleSort("time")}
          >
            Time
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface-elevated shadow-card">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-xs text-ink-muted">
              <th className="px-4 py-3 font-medium">Claim ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payout</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Damage</th>
              <th className="px-4 py-3 font-medium">Time (mock)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={`${c.context.claim_id}-${c.submittedAt}`}
                className="border-b border-border/70 transition-[background-color,opacity,transform] duration-200 ease-enter hover:bg-surface-muted/50 animate-fade-in"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/results/${encodeURIComponent(c.context.claim_id)}`}
                    className="font-mono text-xs font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {c.context.claim_id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.result.status} />
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatInr(c.result.final_payout)}
                </td>
                <td className="px-4 py-3 w-40">
                  <ConfidenceMeter value={c.result.confidence_score} />
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate text-ink-muted">
                  {c.result.damage_type}
                </td>
                <td className="px-4 py-3 tabular-nums text-ink-muted">
                  {c.result.processing_time_ms} ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
