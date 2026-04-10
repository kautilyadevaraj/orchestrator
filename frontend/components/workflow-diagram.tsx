"use client";

import dynamic from "next/dynamic";
import type { FinalOutput } from "@/lib/types";

const Inner = dynamic(() => import("./workflow-diagram-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/40 text-sm text-ink-muted">
      Loading diagram…
    </div>
  ),
});

export function WorkflowDiagram({ result }: { result: FinalOutput }) {
  return <Inner result={result} />;
}
