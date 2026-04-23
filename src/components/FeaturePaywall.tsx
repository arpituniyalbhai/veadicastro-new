import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type FeaturePaywallProps = {
  title: string;
  description: string;
  className?: string;
  ctaLabel?: string;
};

export const FeaturePaywall = ({ title, description, className, ctaLabel = "View Plans" }: FeaturePaywallProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        "p-8 text-center bg-card/40 border border-dashed border-secondary/60 rounded-3xl flex flex-col items-center gap-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center">
        <Lock className="w-5 h-5 text-secondary" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="cosmic" onClick={() => navigate("/pricing?referral=locked-feature")} className="rounded-xl">
        {ctaLabel}
      </Button>
    </Card>
  );
};

