"use client";

import Link from "next/link";
import Image from "next/image";
import { useClaims } from "@/lib/claims-store";
import { ClaimSummaryCard } from "@/components/claim-summary-card";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { WorkflowDiagram } from "@/components/workflow-diagram";
import { AgentOutputAccordion } from "@/components/agent-output-accordion";
import { CustomerMessage } from "@/components/customer-message";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ClaimDetailClient({ claimId }: { claimId: string }) {
  const { getById } = useClaims();
  const record = getById(claimId);

  if (!record) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-12 text-center">
        <p className="text-sm text-ink-muted">
          No claim <span className="font-mono font-medium text-ink">{claimId}</span>{" "}
          in this session. Submit a claim first.
        </p>
        <Button variant="secondary" asChild>
          <Link href="/submit">Go to submit</Link>
        </Button>
      </div>
    );
  }

  const { result, context } = record;
  const src = result.image_preview_url;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1 px-0" asChild>
          <Link href="/results">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All results
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Claim detail
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Explainability view: outcome, workflow path, and structured agent
          outputs (mock).
        </p>
      </div>

      <ClaimSummaryCard result={result} />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">Workflow timeline</h2>
          <WorkflowTimeline steps={result.workflow_log} />
        </section>
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">Customer message</h2>
          <CustomerMessage text={result.customer_message} />
          {src && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Image
              </h3>
              <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface-muted">
                <Image
                  src={src}
                  alt="Claim attachment"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              {result.raw.agent4?.image_text_match === false && (
                <p className="text-xs text-status-pending">
                  Agent 4 flagged a possible mismatch with the description.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Pipeline diagram</h2>
        <p className="text-xs text-ink-muted">
          Nodes on the executed path are emphasized; skipped branches are muted
          (React Flow).
        </p>
        <WorkflowDiagram result={result} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Submitted context</h2>
        <pre className="overflow-auto rounded-xl border border-border bg-surface-muted/60 p-4 font-mono text-[11px] text-ink">
          {JSON.stringify(context, null, 2)}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Agent outputs</h2>
        <AgentOutputAccordion result={result} />
      </section>
    </div>
  );
}
