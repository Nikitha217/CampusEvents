import { cn } from "../lib/utils";
import { TrendingUp } from "lucide-react";

const variantStyles = {
  default: "bg-white/5 border-white/10",
  primary: "bg-gradient-to-br from-[#7C3AED]/30 to-[#5B21B6]/20 border-purple-500/30",
  secondary: "bg-gradient-to-br from-[#5B21B6]/30 to-[#7C3AED]/20 border-purple-400/30",
  accent: "bg-gradient-to-br from-[#A855F7]/25 to-[#7C3AED]/20 border-purple-400/30",
};

const iconStyles = {
  default: "bg-purple-500/20 text-purple-400",
  primary: "bg-white/20 text-white",
  secondary: "bg-white/20 text-white",
  accent: "bg-white/20 text-white",
};

function StatCard({ title, value, icon: Icon, trend, variant = "default" }) {
  return (
    <div className={cn(
      "relative rounded-2xl p-5 border backdrop-blur-xl overflow-hidden",
      "shadow-lg shadow-purple-500/10 transition-all duration-300",
      "hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20",
      "group cursor-default",
      variantStyles[variant]
    )}>
      {/* Subtle glow orb */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/15 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-all duration-500" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-2",
            variant === "default" ? "text-slate-400" : "text-white/70"
          )}>
            {title}
          </p>

          <p className={cn(
            "text-3xl font-bold",
            variant === "default" ? "text-white" : "text-white"
          )}>
            {value}
          </p>

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={cn(
                "h-3 w-3",
                variant === "default" ? "text-green-400" : "text-white/70"
              )} />
              <p className={cn(
                "text-xs font-medium",
                variant === "default" ? "text-green-400" : "text-white/70"
              )}>
                {trend}
              </p>
            </div>
          )}
        </div>

        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
          "group-hover:scale-110",
          iconStyles[variant]
        )}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
