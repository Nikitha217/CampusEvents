import { cn } from "../lib/utils";

const variantStyles = {
  default: "bg-card border border-border",
  primary: "gradient-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "gradient-accent text-accent-foreground",
};

function StatCard({ title, value, icon: Icon, trend, variant = "default" }) {
  return (
    <div
      className={cn(
        "rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">

        <div>
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}
          >
            {title}
          </p>

          <p className="text-2xl font-bold mt-1">
            {value}
          </p>

          {trend && (
            <p
              className={cn(
                "text-xs mt-1",
                variant === "default" ? "text-green-500" : "opacity-70"
              )}
            >
              {trend}
            </p>
          )}
        </div>

        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            variant === "default"
              ? "bg-primary/10"
              : "bg-white/20"
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>

      </div>
    </div>
  );
}

export default StatCard;