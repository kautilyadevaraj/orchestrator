import type {
  ClaimContext,
  FinalOutput,
  WorkflowStep,
} from "@/lib/types";

type Scenario = "c1_clean" | "c2_fraud" | "c3_policy" | "c4_mismatch" | "c5_docs";

function scenarioFromContext(ctx: ClaimContext): Scenario {
  const d = ctx.description.toLowerCase();
  if (ctx.documents_status === "Missing") return "c5_docs";
  if (ctx.past_claims >= 5 && ctx.claim_amount >= 50000) return "c2_fraud";
  if (ctx.policy_type === "Third-Party" && /own|vehicle damage|my car/i.test(d))
    return "c3_policy";
  if (/airbag|crumple|major damage|mismatch/i.test(d)) return "c4_mismatch";
  return "c1_clean";
}

function baseSteps(): Omit<WorkflowStep, "status" | "detail" | "output">[] {
  return [
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
}

function mark(
  defs: Omit<WorkflowStep, "status" | "detail" | "output">[],
  completed: Set<string>,
  skipped: Set<string>,
  extras: Partial<Record<string, Pick<WorkflowStep, "detail" | "output">>>
): WorkflowStep[] {
  return defs.map((s) => {
    const extra = extras[s.id];
    if (skipped.has(s.id)) {
      return {
        ...s,
        status: "skipped",
        detail: "Skipped by pipeline guard",
        ...extra,
      };
    }
    if (completed.has(s.id)) {
      return { ...s, status: "completed", ...extra };
    }
    return { ...s, status: "skipped", detail: "Not reached" };
  });
}

export function buildMockFinalOutput(
  ctx: ClaimContext,
  imagePreviewUrl: string | null
): FinalOutput {
  const scenario = scenarioFromContext(ctx);
  const defs = baseSteps();
  const now = Date.now();

  const agent1Base = {
    completeness_score:
      ctx.documents_status === "Missing" ? 0.45 : 0.92,
    missing_fields:
      ctx.documents_status === "Missing" ? ["policy_documents"] : ([] as string[]),
    damage_type: "Minor scratch",
  };

  if (scenario === "c5_docs") {
    const workflow = mark(
      defs,
      new Set(["parser", "a1", "gate_a", "a6", "log"]),
      new Set(["a2", "a3", "gate_b", "a4", "gate_c", "a5"]),
      {
        gate_a: {
          detail: "Missing critical fields — routed to pending message",
        },
        a1: {
          output: {
            ...agent1Base,
            completeness_score: 0.45,
            missing_fields: ["policy_documents"],
          },
        },
        a6: {
          output: {
            customer_message:
              "We need additional documentation before we can proceed. Please upload your policy schedule and repair estimate.",
          },
        },
      }
    );
    return {
      claim_id: ctx.claim_id,
      status: "Pending",
      pipeline_status: "pending",
      reason_summary: "Missing critical fields",
      final_payout: 0,
      confidence_score: 0.55,
      damage_type: agent1Base.damage_type,
      processing_time_ms: 800 + (now % 400),
      human_review_recommended: true,
      customer_message:
        "We need additional documentation before we can proceed. Please upload your policy schedule and repair estimate.",
      image_preview_url: imagePreviewUrl,
      workflow_log: workflow,
      executed_step_ids: [
        "parser",
        "a1",
        "gate_a",
        "a6",
        "log",
      ],
      raw: {
        agent1: {
          completeness_score: 0.45,
          missing_fields: ["policy_documents"],
          damage_type: agent1Base.damage_type,
        },
        agent6: {
          customer_message:
            "We need additional documentation before we can proceed.",
        },
      },
    };
  }

  if (scenario === "c2_fraud") {
    const workflow = mark(
      defs,
      new Set(["parser", "a1", "gate_a", "a2", "a3", "gate_b", "a6", "log"]),
      new Set(["a4", "gate_c", "a5"]),
      {
        gate_b: {
          detail: "High fraud risk — rejection path",
        },
        a3: {
          output: {
            fraud_risk: "high",
            fraud_flags: ["past_claims_exceeded"],
            fraud_score: 0.72,
          },
        },
        a2: {
          output: { coverage_valid: true, validity_reason: "Within policy" },
        },
      }
    );
    return {
      claim_id: ctx.claim_id,
      status: "Rejected",
      pipeline_status: "rejected",
      reason_summary: "Fraud indicators: past_claims_exceeded",
      final_payout: 0,
      confidence_score: 0.35,
      damage_type: "Minor scratch",
      processing_time_ms: 1200 + (now % 500),
      human_review_recommended: false,
      customer_message:
        "Your claim cannot be approved at this time based on our automated review. A specialist will contact you with details.",
      image_preview_url: imagePreviewUrl,
      workflow_log: workflow,
      executed_step_ids: [
        "parser",
        "a1",
        "gate_a",
        "a2",
        "a3",
        "gate_b",
        "a6",
        "log",
      ],
      raw: {
        agent1: {
          completeness_score: 0.88,
          missing_fields: [],
          damage_type: "Minor scratch",
        },
        agent2: { coverage_valid: true, validity_reason: "Within policy" },
        agent3: {
          fraud_risk: "high",
          fraud_flags: ["past_claims_exceeded"],
          fraud_score: 0.72,
        },
        agent6: {
          customer_message:
            "Your claim cannot be approved at this time based on our automated review.",
        },
      },
    };
  }

  if (scenario === "c3_policy") {
    const workflow = mark(
      defs,
      new Set(["parser", "a1", "gate_a", "a2", "a3", "gate_b", "a6", "log"]),
      new Set(["a4", "gate_c", "a5"]),
      {
        gate_b: {
          detail: "Coverage invalid — third-party policy",
        },
        a2: {
          output: {
            coverage_valid: false,
            validity_reason: "Own-damage not covered under Third-Party policy",
          },
        },
        a3: {
          output: {
            fraud_risk: "low",
            fraud_flags: [],
            fraud_score: 0.12,
          },
        },
      }
    );
    return {
      claim_id: ctx.claim_id,
      status: "Rejected",
      pipeline_status: "rejected",
      reason_summary: "Coverage invalid: Third-Party policy",
      final_payout: 0,
      confidence_score: 0.42,
      damage_type: "Own vehicle damage",
      processing_time_ms: 900 + (now % 400),
      human_review_recommended: false,
      customer_message:
        "Your policy type does not cover this kind of damage. Please review your coverage or contact your insurer.",
      image_preview_url: imagePreviewUrl,
      workflow_log: workflow,
      executed_step_ids: [
        "parser",
        "a1",
        "gate_a",
        "a2",
        "a3",
        "gate_b",
        "a6",
        "log",
      ],
      raw: {
        agent1: {
          completeness_score: 0.9,
          missing_fields: [],
          damage_type: "Own vehicle damage",
        },
        agent2: {
          coverage_valid: false,
          validity_reason: "Own-damage not covered under Third-Party policy",
        },
        agent3: {
          fraud_risk: "low",
          fraud_flags: [],
          fraud_score: 0.12,
        },
        agent6: {
          customer_message:
            "Your policy type does not cover this kind of damage.",
        },
      },
    };
  }

  if (scenario === "c4_mismatch") {
    const workflow = mark(
      defs,
      new Set([
        "parser",
        "a1",
        "gate_a",
        "a2",
        "a3",
        "gate_b",
        "a4",
        "gate_c",
        "a5",
        "a6",
        "log",
      ]),
      new Set([]),
      {
        gate_c: {
          detail: "Image/text mismatch — confidence penalty",
        },
        a4: {
          output: {
            confirmed_damage_type: "Major collision",
            image_text_match: false,
            mismatch_detail: "Image shows airbag deployment; text describes minor dent",
          },
        },
      }
    );
    return {
      claim_id: ctx.claim_id,
      status: "Pending",
      pipeline_status: "pending",
      reason_summary: "Clarification needed: image vs description mismatch",
      final_payout: 8500,
      confidence_score: 0.64,
      damage_type: "Major collision (image)",
      processing_time_ms: 2100 + (now % 600),
      human_review_recommended: true,
      customer_message:
        "We need a short clarification: your photos suggest heavier damage than the written description. Please confirm the extent of damage or add repair shop notes.",
      image_preview_url: imagePreviewUrl,
      workflow_log: workflow,
      executed_step_ids: [
        "parser",
        "a1",
        "gate_a",
        "a2",
        "a3",
        "gate_b",
        "a4",
        "gate_c",
        "a5",
        "a6",
        "log",
      ],
      raw: {
        agent1: {
          completeness_score: 0.91,
          missing_fields: [],
          damage_type: "Minor dent",
        },
        agent2: { coverage_valid: true, validity_reason: "Within policy" },
        agent3: {
          fraud_risk: "low",
          fraud_flags: [],
          fraud_score: 0.18,
        },
        agent4: {
          confirmed_damage_type: "Major collision",
          image_text_match: false,
          mismatch_detail:
            "Image shows airbag deployment; text describes minor dent",
        },
        agent5: {
          final_payout: 8500,
          confidence_score: 0.64,
          payout_range: "₹7,000–₹10,000",
        },
        agent6: {
          customer_message:
            "We need a short clarification: your photos suggest heavier damage than the written description.",
        },
      },
    };
  }

  // c1_clean
  const workflow = mark(
    defs,
    new Set([
      "parser",
      "a1",
      "gate_a",
      "a2",
      "a3",
      "gate_b",
      "a4",
      "gate_c",
      "a5",
      "a6",
      "log",
    ]),
    new Set([]),
    {
      a5: {
        output: {
          final_payout: 19500,
          confidence_score: 0.88,
          payout_range: "₹18,000–₹22,000",
        },
      },
    }
  );
  return {
    claim_id: ctx.claim_id,
    status: "Approved",
    pipeline_status: "active",
    reason_summary: "All checks passed — standard approval",
    final_payout: 19500,
    confidence_score: 0.88,
    damage_type: "Minor scratch",
    processing_time_ms: 1600 + (now % 500),
    human_review_recommended: false,
    customer_message:
      "Good news — your claim is approved. Estimated settlement ₹19,500 will be processed within 3–5 business days.",
    image_preview_url: imagePreviewUrl,
    workflow_log: workflow,
    executed_step_ids: [
      "parser",
      "a1",
      "gate_a",
      "a2",
      "a3",
      "gate_b",
      "a4",
      "gate_c",
      "a5",
      "a6",
      "log",
    ],
    raw: {
      agent1: {
        completeness_score: 0.92,
        missing_fields: [],
        damage_type: "Minor scratch",
      },
      agent2: { coverage_valid: true, validity_reason: "Within policy" },
      agent3: {
        fraud_risk: "low",
        fraud_flags: [],
        fraud_score: 0.08,
      },
      agent4: {
        confirmed_damage_type: "Minor scratch",
        image_text_match: imagePreviewUrl ? true : null,
        mismatch_detail: null,
      },
      agent5: {
        final_payout: 19500,
        confidence_score: 0.88,
        payout_range: "₹18,000–₹22,000",
      },
      agent6: {
        customer_message:
          "Good news — your claim is approved. Estimated settlement ₹19,500 will be processed within 3–5 business days.",
      },
    },
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
