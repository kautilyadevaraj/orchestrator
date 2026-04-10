import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-[opacity,transform] duration-150 ease-enter",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-muted text-ink",
        approved:
          "border-transparent bg-status-approved/15 text-status-approved",
        rejected:
          "border-transparent bg-status-rejected/15 text-status-rejected",
        pending:
          "border-transparent bg-status-pending/15 text-status-pending",
        accent: "border-transparent bg-accent/15 text-accent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
