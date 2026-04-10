"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FinalOutput } from "@/lib/types";

const sections: { key: keyof FinalOutput["raw"]; title: string }[] = [
  { key: "agent1", title: "Agent 1 — Claim analyzer" },
  { key: "agent2", title: "Agent 2 — Coverage validator" },
  { key: "agent3", title: "Agent 3 — Fraud detector" },
  { key: "agent4", title: "Agent 4 — Damage assessor" },
  { key: "agent5", title: "Agent 5 — Payout estimator" },
  { key: "agent6", title: "Agent 6 — Communication writer" },
];

export function AgentOutputAccordion({ result }: { result: FinalOutput }) {
  const defaults = sections
    .filter((s) => result.raw[s.key] != null)
    .map((s) => s.key);

  return (
    <Accordion
      type="multiple"
      defaultValue={defaults}
      className="w-full rounded-xl border border-border bg-surface-elevated px-4"
    >
      {sections.map(({ key, title }) => {
        const data = result.raw[key];
        if (data == null) return null;
        return (
          <AccordionItem value={key} key={key}>
            <AccordionTrigger>{title}</AccordionTrigger>
            <AccordionContent>
              <pre className="max-h-[280px] overflow-auto rounded-lg bg-surface-muted/80 p-3 font-mono text-[11px] leading-relaxed text-ink">
                {JSON.stringify(data, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
