import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Quick Ask",
    price: 199,
    period: "one-time",
    questions: 5,
    description: "Perfect for urgent questions - get clarity fast",
    buyers: 688,
    recentBuyers: 389,
    benefits: [
      "5 Personalized Questions",
      "Career, love, finance & more",
      "Instant Vedika AI responses",
      "Powered by your exact birth chart",
      "Never expire - use anytime",
      "Cheaper than one pandit visit",
      "Standard AI model",
    ],
  },
  {
    name: "Deep Dive",
    price: 499,
    period: "one-time",
    questions: 15,
    description: "Most popular - serious guidance for life's big decisions",
    buyers: 1243,
    recentBuyers: 901,
    benefits: [
      "15 Personalized Questions",
      "Ideal for career, marriage & life planning",
      "Vedika Advanced AI Model",
      "Deeper analysis & accurate predictions",
      "Never expire - use at your pace",
      "Save 16% vs Quick Ask",
    ],
  },
  {
    name: "The Power Pack",
    price: 799,
    period: "one-time",
    questions: 30,
    description: "Best value - clarity for an entire year of decisions",
    buyers: 241,
    recentBuyers: 321,
    benefits: [
      "30 Personalized Questions",
      "Vedika Advanced AI - Highest Thinking Mode",
      "Never expire - yours forever",
      "Most accurate & detailed readings",
      "Priority response generation",
      "Go beyond basic predictions with in-depth insights",
      "Save 33% vs Quick Ask",
    ],
  },
];

const PricingComponent = () => {
  const [expandedBenefits, setExpandedBenefits] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 border border-border/60 mb-4">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">New Question-Based Packs - Get Instant Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 relative">
            <span className="relative z-10 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent drop-shadow-2xl">
              Choose Your Question Pack
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-accent/50 to-primary/40 blur-2xl -z-10 scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-secondary/40 to-accent/30 blur-xl -z-10 scale-105" />
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3 max-w-6xl mx-auto mb-12">
          {plans.map((plan) => {
            const isDeepDive = plan.name === "Deep Dive";
            const visibleBenefits = expandedBenefits[plan.name]
              ? plan.benefits.slice(1)
              : plan.benefits.slice(1, 6);

            return (
              <Card
                key={plan.name}
                className={`group relative flex min-h-[670px] w-full cursor-pointer flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                  isDeepDive
                    ? "border border-pink-500/60 bg-pink-950/20 shadow-[0_0_40px_rgba(236,72,153,0.12)]"
                    : "border border-border/60 bg-card/40"
                }`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  navigate(`/pricing/onboarding?plan=${encodeURIComponent(plan.name)}&amount=${plan.price}&type=pack`);
                }}
              >
                {isDeepDive && (
                  <div className="absolute -top-3 left-6 z-10">
                    <span className="rounded-full border border-pink-500/40 bg-pink-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-pink-500/20">
                      687 people bought in 24 hour - best seller
                    </span>
                  </div>
                )}
                {plan.name === "Quick Ask" && (
                  <div className="absolute -top-3 left-6 z-10">
                    <span className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1 text-xs font-bold text-green-300">
                      {plan.recentBuyers} bought in 24h
                    </span>
                  </div>
                )}
                {plan.name === "The Power Pack" && (
                  <div className="absolute -top-3 left-6 z-10">
                    <span className="rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1 text-xs font-bold text-green-300">
                      213 people bought in 24h
                    </span>
                  </div>
                )}

                <div className="mb-5 pt-3">
                  <h2 className="mb-5 text-xl font-bold leading-tight text-white">{plan.name}</h2>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold leading-none text-pink-500">
                      ₹{plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                  </div>
                  <div className="mb-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{plan.questions} Questions</span>
                    <span>·</span>
                    <span>{plan.period}</span>
                  </div>
                  <p className="min-h-[52px] text-sm leading-6 text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-4 rounded-lg border border-green-500/25 bg-green-500/10 px-4 py-3">
                  <div className="flex items-start gap-2 text-xs font-medium leading-5 text-green-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{plan.benefits[0]}</span>
                  </div>
                </div>

                <div className="mb-5 flex-1 rounded-xl border border-border/60 bg-background/40 p-4">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">What you get:</h3>
                  <ul className="space-y-3">
                    {visibleBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm leading-5 text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.benefits.length > 6 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedBenefits((prev) => ({ ...prev, [plan.name]: !prev[plan.name] }));
                      }}
                      className="mt-4 w-full text-center text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {expandedBenefits[plan.name] ? "Show less" : `Show ${plan.benefits.length - 6} more benefits`}
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-1">
                  <Button
                    variant="default"
                    className="h-12 w-full rounded-lg border border-pink-500/60 bg-pink-500 text-base font-bold text-white shadow-sm shadow-pink-500/20 hover:bg-pink-600 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pricing/onboarding?plan=${encodeURIComponent(plan.name)}&amount=${plan.price}&type=pack`);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingComponent;
