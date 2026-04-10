import { z } from "zod";

export const claimFormSchema = z
  .object({
    claim_id: z.string().min(1, "Claim ID is required"),
    description: z
      .string()
      .min(20, "Use at least 20 characters so assessors have context"),
    policy_type: z.enum(["Comprehensive", "Third-Party"]),
    claim_amount: z.coerce
      .number({ invalid_type_error: "Enter a valid amount" })
      .min(1, "Amount must be at least ₹1"),
    past_claims: z.coerce
      .number()
      .int()
      .min(0)
      .max(99),
    documents_status: z.enum(["Complete", "Missing"]),
    image_mode: z.enum(["none", "url", "file"]),
    image_url: z.string().optional(),
    preferred_language: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.image_mode === "url") {
      const u = (data.image_url ?? "").trim();
      if (!u) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter an image URL or switch image input off",
          path: ["image_url"],
        });
        return;
      }
      try {
        // eslint-disable-next-line no-new
        new URL(u);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a well-formed URL (https://…)",
          path: ["image_url"],
        });
      }
    }
  });

export type ClaimFormValues = z.infer<typeof claimFormSchema>;

export function toClaimContext(values: ClaimFormValues): {
  context: import("@/lib/types").ClaimContext;
  imageUrl: string | null;
} {
  const image_url =
    values.image_mode === "url" && values.image_url?.trim()
      ? values.image_url.trim()
      : null;
  return {
    context: {
      claim_id: values.claim_id.trim(),
      description: values.description.trim(),
      policy_type: values.policy_type,
      claim_amount: values.claim_amount,
      past_claims: values.past_claims,
      documents_status: values.documents_status,
      image_url,
      preferred_language: values.preferred_language?.trim() || undefined,
    },
    imageUrl: image_url,
  };
}
