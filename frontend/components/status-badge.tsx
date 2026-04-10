import type { FinalStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: FinalStatus }) {
  const variant =
    status === "Approved"
      ? "approved"
      : status === "Rejected"
        ? "rejected"
        : "pending";
  return <Badge variant={variant}>{status}</Badge>;
}
