import { ClaimDetailClient } from "@/components/claim-detail-client";

export default function ClaimDetailPage({
  params,
}: {
  params: { claimId: string };
}) {
  const claimId = decodeURIComponent(params.claimId);
  return <ClaimDetailClient claimId={claimId} />;
}
