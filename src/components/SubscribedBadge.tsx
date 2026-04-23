import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { cn } from "@/lib/utils";

type SubscribedBadgeProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export default function SubscribedBadge({ className, size = "md" }: SubscribedBadgeProps) {
  const { planName } = usePlan();
  
  if (planName === "Free") {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const planColors: Record<string, string> = {
    Basic: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Premium: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Elite: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1.5 font-medium border",
        planColors[planName] || planColors.Basic,
        sizeClasses[size],
        className
      )}
    >
      <Check className="w-3 h-3" />
      <span>{planName} Subscribed</span>
    </Badge>
  );
}

