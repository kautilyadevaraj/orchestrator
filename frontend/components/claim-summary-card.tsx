import type { FinalOutput } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceMeter } from "@/components/confidence-meter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatInr } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function ClaimSummaryCard({ result }: { result: FinalOutput }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="font-mono text-base">
              {result.claim_id}
            </CardTitle>
            <CardDescription>{result.reason_summary}</CardDescription>
          </div>
          <StatusBadge status={result.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Estimated payout
          </p>
          <p className="font-display mt-1 text-2xl font-semibold tabular-nums">
            {formatInr(result.final_payout)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Confidence
          </p>
          <div className="mt-2 max-w-xs">
            <ConfidenceMeter value={result.confidence_score} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Damage assessment
          </p>
          <p className="mt-1 text-sm text-ink">{result.damage_type}</p>
        </div>
        {result.human_review_recommended && (
          <div className="sm:col-span-2 flex gap-3 rounded-lg border border-status-pending/35 bg-status-pending/10 px-4 py-3 text-sm text-ink transition-[opacity,transform] duration-200 ease-enter">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-status-pending"
              aria-hidden
            />
            <div>
              <p className="font-medium">Needs human review</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Confidence or evidence warrants a manual check before final
                settlement.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
