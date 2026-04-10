"use client";

import { useClaims } from "@/lib/claims-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function BatchSummaryPanel() {
  const { batchSummary, clearBatchSummary } = useClaims();
  if (!batchSummary) return null;
  const b = batchSummary;
  return (
    <Card className="mb-6 border-accent/25 bg-accent/5 animate-fade-in">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base">Last batch summary</CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={clearBatchSummary}>
          Dismiss
        </Button>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-ink-muted">Processed</dt>
            <dd className="font-display text-lg font-semibold">{b.total}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Approved / Rejected / Pending</dt>
            <dd className="text-sm font-medium">
              {b.approved} / {b.rejected} / {b.pending}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Avg confidence</dt>
            <dd className="font-display text-lg font-semibold tabular-nums">
              {(b.avgConfidence * 100).toFixed(0)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Payout exposure (approved)</dt>
            <dd className="font-display text-lg font-semibold tabular-nums">
              {formatInr(b.totalPayoutExposure)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-ink-muted">Fraud-related rejections</dt>
            <dd className="text-sm font-medium">{b.fraudRejections}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
