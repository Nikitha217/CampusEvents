import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-sm text-white",
        "placeholder:text-slate-500",
        "ring-offset-[#0F172A]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:border-purple-500/50",
        "hover:border-white/20 hover:bg-white/8",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-200",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
