import type { ClaimContext, FinalOutput, PipelineStatus, FinalStatus, WorkflowStep } from "@/lib/types";

function extractFinalPayout(payoutStr: string | number): number {
  if (typeof payoutStr === "number") return payoutStr;
  if (!payoutStr) return 0;
  const num = parseInt(payoutStr.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

export function mapBackendResponseToFinalOutput(
  backendRes: any,
  context: ClaimContext,
  imagePreviewUrl: string | null,
  processingTimeMs: number
): FinalOutput {
  // Determine the steps completed from workflow_log
  const statusStr = backendRes["Status"] || backendRes.status;
  const finalStatus: FinalStatus = ["Approved", "Rejected", "Pending"].includes(statusStr)
    ? (statusStr as FinalStatus)
    : "Pending";

  const pipelineStatus: PipelineStatus =
    finalStatus === "Approved"
      ? "active"
      : finalStatus === "Rejected"
      ? "rejected"
      : "pending";

  const executedIds = new Set<string>();
  executedIds.add("parser");
  executedIds.add("log");

  const raw: any = {};
  const logArr = backendRes.workflow_log || [];

  logArr.forEach((log: any) => {
    if (log.status === "success" && log.details) {
      raw[log.agent_name] = log.details;
      if (log.agent_name === "agent1") executedIds.add("a1");
      if (log.agent_name === "agent2") executedIds.add("a2");
      if (log.agent_name === "agent3") executedIds.add("a3");
      if (log.agent_name === "agent4") executedIds.add("a4");
      if (log.agent_name === "agent5") executedIds.add("a5");
      if (log.agent_name === "agent6") executedIds.add("a6");
    }
  });

  // Determine gates heuristically
  if (executedIds.has("a1")) executedIds.add("gate_a");
  if (executedIds.has("a2") || executedIds.has("a3")) executedIds.add("gate_b");
  if (executedIds.has("a4")) executedIds.add("gate_c");

  const baseSteps: Omit<WorkflowStep, "status" | "detail" | "output">[] = [
    { id: "parser", label: "Input parser", kind: "agent" },
    { id: "a1", label: "Claim analyzer", kind: "agent" },
    { id: "gate_a", label: "Gate A — Completeness", kind: "gate" },
    { id: "a2", label: "Coverage validator", kind: "agent" },
    { id: "a3", label: "Fraud detector", kind: "agent" },
    { id: "gate_b", label: "Gate B — Coverage + fraud", kind: "gate" },
    { id: "a4", label: "Damage assessor (vision)", kind: "agent" },
    { id: "gate_c", label: "Gate C — Image / text", kind: "gate" },
    { id: "a5", label: "Payout estimator", kind: "agent" },
    { id: "a6", label: "Communication writer", kind: "agent" },
    { id: "log", label: "Log aggregator", kind: "agent" },
  ];

  const workflow_log: WorkflowStep[] = baseSteps.map((step) => {
    if (executedIds.has(step.id)) {
      let output;
      if (step.id === "a1" && raw.agent1) output = raw.agent1;
      if (step.id === "a2" && raw.agent2) output = raw.agent2;
      if (step.id === "a3" && raw.agent3) output = raw.agent3;
      if (step.id === "a4" && raw.agent4) output = raw.agent4;
      if (step.id === "a5" && raw.agent5) output = raw.agent5;
      if (step.id === "a6" && raw.agent6) output = raw.agent6;
      
      let detail;
      if (step.id === "gate_b" && pipelineStatus === "rejected") {
        detail = raw.agent3?.fraud_risk === "high" ? "High fraud risk — rejection path" : "Coverage invalid";
      }

      return {
        ...step,
        status: "completed",
        detail,
        output,
      };
    }
    return {
      ...step,
      status: "skipped",
      detail: "Skipped by pipeline guard",
    };
  });

  let damage_type = raw.agent1?.damage_type || "";
  if (raw.agent4?.confirmed_damage_type) {
    damage_type = raw.agent4.confirmed_damage_type + " (image)";
  }

  const payout = extractFinalPayout(backendRes["Estimated Payout"] || backendRes.estimated_payout || 0);
  const confScore = backendRes["Confidence Score"] ?? backendRes.confidence_score ?? 0;

  return {
    claim_id: backendRes["Claim ID"] || backendRes.claim_id || context.claim_id,
    status: finalStatus,
    pipeline_status: pipelineStatus,
    reason_summary: backendRes["Reason"] || backendRes.reason || "",
    final_payout: payout,
    confidence_score: confScore,
    damage_type,
    processing_time_ms: processingTimeMs,
    human_review_recommended: confScore < 0.8 && confScore >= 0.6,
    customer_message: backendRes["Customer Message"] || backendRes.customer_message || "",
    image_preview_url: imagePreviewUrl,
    workflow_log,
    executed_step_ids: Array.from(executedIds),
    raw,
  };
}
