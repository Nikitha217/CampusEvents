import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 text-sm text-white",
        "placeholder:text-slate-500",
        "ring-offset-[#0F172A]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:border-purple-500/50",
        "hover:border-white/20 hover:bg-white/8",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-200 resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
