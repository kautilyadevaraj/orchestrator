/** Mirrors backend Pydantic shapes — frontend-only; used with mock responses. */

export type PolicyType = "Comprehensive" | "Third-Party";
export type DocumentsStatus = "Complete" | "Missing";
export type PipelineStatus = "active" | "pending" | "rejected";
export type FraudRisk = "low" | "medium" | "high";
export type FinalStatus = "Approved" | "Rejected" | "Pending";

export interface ClaimContext {
  claim_id: string;
  description: string;
  policy_type: PolicyType;
  claim_amount: number;
  past_claims: number;
  documents_status: DocumentsStatus;
  image_url: string | null;
  preferred_language?: string;
}

export interface Agent1Output {
  completeness_score: number;
  missing_fields: string[];
  damage_type: string;
}

export interface Agent2Output {
  coverage_valid: boolean;
  validity_reason: string;
}

export interface Agent3Output {
  fraud_risk: FraudRisk;
  fraud_flags: string[];
  fraud_score: number;
}

export interface Agent4Output {
  confirmed_damage_type: string;
  image_text_match: boolean | null;
  mismatch_detail: string | null;
}

export interface Agent5Output {
  final_payout: number;
  confidence_score: number;
  payout_range: string;
}

export interface Agent6Output {
  customer_message: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  kind: "agent" | "gate" | "parallel";
  status: "completed" | "skipped";
  detail?: string;
  output?: Record<string, unknown>;
}

export interface FinalOutput {
  claim_id: string;
  status: FinalStatus;
  pipeline_status: PipelineStatus;
  reason_summary: string;
  final_payout: number;
  confidence_score: number;
  damage_type: string;
  processing_time_ms: number;
  human_review_recommended: boolean;
  customer_message: string;
  image_preview_url?: string | null;
  workflow_log: WorkflowStep[];
  /** For React Flow: edges actually taken */
  executed_step_ids: string[];
  raw: {
    agent1?: Agent1Output;
    agent2?: Agent2Output;
    agent3?: Agent3Output;
    agent4?: Agent4Output;
    agent5?: Agent5Output;
    agent6?: Agent6Output;
  };
}

export interface ClaimRecord {
  context: ClaimContext;
  result: FinalOutput;
  submittedAt: string;
}
