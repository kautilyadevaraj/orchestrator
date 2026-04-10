"use client";

import { Check, CircleSlash, GitBranch } from "lucide-react";
import type { WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WorkflowTimeline({ steps }: { steps: WorkflowStep[] }) {
  return (
    <ol className="relative space-y-0 border-l border-border pl-6">
      {steps.map((step, i) => {
        const done = step.status === "completed";
        const skipped = step.status === "skipped";
        return (
          <li key={step.id} className="pb-8 last:pb-0">
            <span
              className={cn(
                "absolute -left-[9px] mt-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 bg-surface-elevated transition-[transform,opacity,border-color] duration-200 ease-enter",
                done && "border-accent text-accent",
                skipped && "border-border text-ink-muted"
              )}
            >
              {step.kind === "gate" ? (
                <GitBranch className="h-2.5 w-2.5" aria-hidden />
              ) : done ? (
                <Check className="h-2.5 w-2.5" aria-hidden />
              ) : (
                <CircleSlash className="h-2.5 w-2.5" aria-hidden />
              )}
            </span>
            <div
              className="animate-fade-in pl-1"
              style={{
                animationDelay: `${Math.min(i, 8) * 40}ms`,
                animationFillMode: "backwards",
              }}
            >
              <p className="text-sm font-medium text-ink">{step.label}</p>
              <p className="text-xs capitalize text-ink-muted">
                {step.kind.replace("_", " ")} ·{" "}
                {skipped ? "skipped" : "completed"}
              </p>
              {step.detail && (
                <p className="mt-1 text-xs text-ink-muted">{step.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
