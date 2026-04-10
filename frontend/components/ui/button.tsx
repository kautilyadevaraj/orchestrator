import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[transform,opacity,background-color,color,box-shadow] duration-200 ease-enter focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:translate-y-0 motion-safe:hover:-translate-y-[1px] motion-safe:hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground shadow-sm hover:opacity-95 hover:shadow-[0_12px_28px_-18px_hsl(var(--accent)_/_0.55)]",
        secondary:
          "bg-surface-elevated text-ink border border-border shadow-sm hover:bg-surface-muted",
        ghost: "text-ink hover:bg-surface-muted",
        outline:
          "border border-border bg-transparent text-ink hover:bg-surface-muted",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
