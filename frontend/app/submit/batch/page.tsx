import { BatchJsonForm } from "@/components/batch-json-form";

export default function BatchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Batch claims (JSON)
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Upload an array of claim objects. Invalid rows stay highlighted; only
          valid rows are simulated.
        </p>
      </div>
      <BatchJsonForm />
    </div>
  );
}
