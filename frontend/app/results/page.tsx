import { BatchSummaryPanel } from "@/components/batch-summary-panel";
import { ClaimsTable } from "@/components/claims-table";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Results
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Session-scoped claims (in-memory). After a batch run, a summary panel
          appears here.
        </p>
      </div>
      <BatchSummaryPanel />
      <ClaimsTable />
    </div>
  );
}
