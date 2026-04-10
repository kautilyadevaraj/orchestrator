import { ClaimForm } from "@/components/claim-form";

export default function SubmitPage() {
  return (
    <div className="min-h-[calc(100vh-6.5rem)] grid place-items-center py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink">
            Claim submission
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            A guided form with deterministic mock processing — designed for
            speed and clarity.
          </p>
        </div>
        <ClaimForm />
      </div>
    </div>
  );
}
