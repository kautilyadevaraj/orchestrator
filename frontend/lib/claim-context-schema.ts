import { z } from "zod";

/** Strict shape for batch JSON rows — mirrors ClaimContext. */
export const claimContextSchema = z.object({
  claim_id: z.string().min(1),
  description: z.string().min(1),
  policy_type: z.enum(["Comprehensive", "Third-Party"]),
  claim_amount: z.number().min(1),
  past_claims: z.number().int().min(0).max(99),
  documents_status: z.enum(["Complete", "Missing"]),
  image_url: z.string().url().nullable().optional(),
  preferred_language: z.string().optional(),
});

export const batchClaimsSchema = z.array(claimContextSchema);

export type BatchClaimRow = z.infer<typeof claimContextSchema>;
