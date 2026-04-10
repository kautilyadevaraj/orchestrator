"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  claimFormSchema,
  toClaimContext,
  type ClaimFormValues,
} from "@/lib/claim-schema";
import { useClaims } from "@/lib/claims-store";
import { useToast } from "@/components/toast-host";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const defaultValues: ClaimFormValues = {
  claim_id: "",
  description: "",
  policy_type: "Comprehensive",
  claim_amount: 5000,
  past_claims: 0,
  documents_status: "Complete",
  image_mode: "none",
  image_url: "",
  preferred_language: "English",
};

const ALLOWED_IMAGE = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export function ClaimForm() {
  const router = useRouter();
  const { addClaim } = useClaims();
  const { show } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const imageMode = form.watch("image_mode");
  const description = form.watch("description");

  const descCount = description?.length ?? 0;

  const newId = useCallback(() => {
    form.setValue("claim_id", crypto.randomUUID().slice(0, 8).toUpperCase());
  }, [form]);

  const onFile = useCallback((f: File | null) => {
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED_IMAGE.has(f.type)) {
      setFileError("Use JPEG, PNG, or WebP only.");
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("Image must be 5MB or smaller.");
      setFile(null);
      return;
    }
    setFile(f);
  }, []);

  const busy = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.image_mode === "file" && !file) {
      setFileError("Choose an image file or switch to URL / no image.");
      return;
    }
    let preview: string | null = null;
    if (values.image_mode === "file" && file) {
      preview = URL.createObjectURL(file);
    } else if (values.image_mode === "url" && values.image_url?.trim()) {
      preview = values.image_url.trim();
    }
    const { context } = toClaimContext(values);
    if (values.image_mode === "file" && file) {
      context.image_url = null;
    }
    try {
      await addClaim(context, preview, 950);
      router.push(`/results/${encodeURIComponent(context.claim_id)}`);
    } catch {
      show("Something went wrong during the mock run.", "error");
    }
  });

  const policyRadios = useMemo(
    () =>
      [
        { value: "Comprehensive" as const, label: "Comprehensive" },
        { value: "Third-Party" as const, label: "Third-Party" },
      ] as const,
    []
  );

  return (
    <Card className="max-w-2xl animate-fade-in bg-surface-elevated/95">
      <CardHeader>
        <CardTitle>Submit a claim</CardTitle>
        <CardDescription>
          Fields mirror the orchestration blueprint. Processing is simulated
          locally — no API calls.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="claim_id">Claim ID</Label>
              <Input
                id="claim_id"
                disabled={busy}
                {...form.register("claim_id")}
                aria-invalid={!!form.formState.errors.claim_id}
              />
              {form.formState.errors.claim_id && (
                <p className="text-xs text-status-rejected">
                  {form.formState.errors.claim_id.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={newId}
              className="h-10 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Generate ID
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="description">Description</Label>
              <span
                className={cn(
                  "text-xs tabular-nums text-ink-muted",
                  descCount > 0 && descCount < 20 && "text-status-pending"
                )}
              >
                {descCount} / 20 min
              </span>
            </div>
            <Textarea
              id="description"
              disabled={busy}
              {...form.register("description")}
              placeholder="Describe the incident with enough detail for review…"
              aria-invalid={!!form.formState.errors.description}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-status-rejected">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Policy type</Label>
            <div className="flex flex-wrap gap-3">
              {policyRadios.map((p) => (
                <label
                  key={p.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-[border-color,background-color,transform] duration-200 ease-enter",
                    form.watch("policy_type") === p.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:bg-surface-muted"
                  )}
                >
                  <input
                    type="radio"
                    value={p.value}
                    disabled={busy}
                    className="accent-accent"
                    {...form.register("policy_type")}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="claim_amount">Claim amount (₹)</Label>
              <Input
                id="claim_amount"
                type="number"
                min={1}
                step={1}
                disabled={busy}
                {...form.register("claim_amount")}
              />
              {form.formState.errors.claim_amount && (
                <p className="text-xs text-status-rejected">
                  {form.formState.errors.claim_amount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="past_claims">Past claims (0–99)</Label>
              <Input
                id="past_claims"
                type="number"
                min={0}
                max={99}
                step={1}
                disabled={busy}
                {...form.register("past_claims")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Documents</Label>
            <select
              disabled={busy}
              className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm shadow-sm transition-[border-color] duration-200 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
              {...form.register("documents_status")}
            >
              <option value="Complete">Complete</option>
              <option value="Missing">Missing</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_language">Preferred language (optional)</Label>
            <select
              id="preferred_language"
              disabled={busy}
              className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm shadow-sm"
              {...form.register("preferred_language")}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
            </select>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-surface-muted/50 p-4">
            <Label>Image (optional)</Label>
            <p className="text-xs text-ink-muted">
              Choose one: no image, public URL, or file upload (JPEG / PNG /
              WebP, max 5MB).
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["none", "No image"],
                  ["url", "Image URL"],
                  ["file", "File upload"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    form.setValue("image_mode", value, { shouldValidate: true });
                    setFile(null);
                    setFileError(null);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-[transform,opacity,border-color,background-color] duration-200 ease-enter active:scale-[0.98]",
                    imageMode === value
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-border bg-surface-elevated text-ink-muted hover:text-ink"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {imageMode === "url" && (
              <div className="space-y-2 pt-1">
                <Input
                  placeholder="https://…"
                  disabled={busy}
                  {...form.register("image_url")}
                />
                {form.formState.errors.image_url && (
                  <p className="text-xs text-status-rejected">
                    {form.formState.errors.image_url.message}
                  </p>
                )}
              </div>
            )}
            {imageMode === "file" && (
              <div className="pt-1">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
                {file && (
                  <p className="mt-2 text-xs text-ink-muted">
                    Selected: {file.name}
                  </p>
                )}
                {fileError && (
                  <p className="mt-2 text-xs text-status-rejected">{fileError}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Processing…
                </>
              ) : (
                "Submit claim"
              )}
            </Button>
            <p className="text-xs text-ink-muted">
              Demo routing: try{" "}
              <span className="font-medium text-ink">
                high past claims + large amount
              </span>{" "}
              for fraud,{" "}
              <span className="font-medium text-ink">Third-Party + own damage</span>{" "}
              for rejection, or{" "}
              <span className="font-medium text-ink">airbag / mismatch</span> in
              text for pending mismatch.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
