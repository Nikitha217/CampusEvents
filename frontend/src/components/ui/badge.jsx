import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-purple-500/30 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
        secondary: "border-white/15 bg-white/10 text-slate-300 hover:bg-white/15",
        destructive: "border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30",
        outline: "border-white/20 text-slate-300 hover:bg-white/10",
        success: "border-green-500/30 bg-green-500/20 text-green-300",
        warning: "border-amber-500/30 bg-amber-500/20 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
