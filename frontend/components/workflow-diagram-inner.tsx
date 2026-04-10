"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import type { FinalOutput } from "@/lib/types";

const layout: { id: string; label: string; x: number; y: number }[] = [
  { id: "parser", label: "Input parser", x: 0, y: 120 },
  { id: "a1", label: "Claim analyzer", x: 200, y: 120 },
  { id: "gate_a", label: "Gate A", x: 400, y: 120 },
  { id: "a2", label: "Coverage", x: 600, y: 40 },
  { id: "a3", label: "Fraud", x: 600, y: 200 },
  { id: "gate_b", label: "Gate B", x: 820, y: 120 },
  { id: "a4", label: "Damage (vision)", x: 1040, y: 120 },
  { id: "gate_c", label: "Gate C", x: 1260, y: 120 },
  { id: "a5", label: "Payout", x: 1480, y: 120 },
  { id: "a6", label: "Comm. writer", x: 1700, y: 120 },
  { id: "log", label: "Log agg.", x: 1920, y: 120 },
];

const edgePairs: [string, string][] = [
  ["parser", "a1"],
  ["a1", "gate_a"],
  ["gate_a", "a2"],
  ["gate_a", "a3"],
  ["a2", "gate_b"],
  ["a3", "gate_b"],
  ["gate_b", "a4"],
  ["a4", "gate_c"],
  ["gate_c", "a5"],
  ["a5", "a6"],
  ["a6", "log"],
];

export default function WorkflowDiagramInner({
  result,
}: {
  result: FinalOutput;
}) {
  const executed = useMemo(
    () => new Set(result.executed_step_ids),
    [result.executed_step_ids]
  );

  const nodes: Node[] = useMemo(
    () =>
      layout.map((n) => {
        const onPath = executed.has(n.id);
        const step = result.workflow_log.find((s) => s.id === n.id);
        const skipped = step?.status === "skipped";
        return {
          id: n.id,
          type: "default",
          position: { x: n.x, y: n.y },
          data: { label: n.label },
          style: {
            fontSize: 11,
            padding: "8px 12px",
            borderRadius: 10,
            borderWidth: 1.5,
            borderStyle: skipped && !onPath ? "dashed" : "solid",
            borderColor: onPath
              ? "hsl(173 58% 32% / 0.85)"
              : "hsl(210 18% 78% / 0.9)",
            background: onPath
              ? "hsl(173 58% 32% / 0.12)"
              : "hsl(0 0% 100% / 0.92)",
            color: "hsl(215 32% 12%)",
            minWidth: 100,
            textAlign: "center" as const,
            boxShadow: onPath
              ? "0 8px 24px -12px hsl(173 58% 32% / 0.35)"
              : "0 4px 12px -8px hsl(215 32% 12% / 0.2)",
            opacity: onPath ? 1 : skipped ? 0.45 : 0.72,
            transition: "opacity 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms cubic-bezier(0.22,1,0.36,1), border-color 200ms cubic-bezier(0.22,1,0.36,1)",
          },
        };
      }),
    [executed, result.workflow_log]
  );

  const edges: Edge[] = useMemo(
    () =>
      edgePairs.map(([source, target], i) => {
        const active = executed.has(source) && executed.has(target);
        return {
          id: `e-${source}-${target}-${i}`,
          source,
          target,
          animated: active,
          style: {
            stroke: active
              ? "hsl(173 58% 32% / 0.55)"
              : "hsl(215 14% 40% / 0.25)",
            strokeWidth: active ? 2 : 1,
          },
        };
      }),
    [executed]
  );

  return (
    <div className="h-[320px] w-full rounded-xl border border-border bg-surface-muted/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="hsl(210 18% 88% / 0.6)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={2}
          zoomable
          pannable
          className="!bg-surface-elevated/90"
        />
      </ReactFlow>
    </div>
  );
}
