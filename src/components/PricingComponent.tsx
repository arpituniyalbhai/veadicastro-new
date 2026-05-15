import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

const plans = [
  {
    name: "Quick Ask",
    price: 149,
    period: "one-time",
    questions: 5,
    description: "For quick answers to specific questions",
    benefits: [
      "5 Questions",
      "Never expire",
      "Instant Vedika responses",
      "Personalized to your birth chart",
      "Standard AI model",
      "Any topic — career, love, finance"
    ]
  },
  {
    name: "Deep Dive",
    price: 399,
    period: "one-time",
    questions: 15,
    description: "Best Value 🔥 Save 33% vs Quick Ask",
    benefits: [
      "15 Questions",
      "Never expire",
      "Vedika Advanced Model",
      "Higher thinking & deeper analysis",
      "More detailed predictions",
      "Save 33% vs Quick Ask"
    ]
  },
  {
    name: "The Power Pack",
    price: 699,
    period: "one-time",
    questions: 30,
    description: "Save 50% vs Quick Ask - Maximum value",
    benefits: [
      "30 Questions",
      "Never expire",
      "Vedika Advanced Model",
      "Highest thinking mode",
      "Most accurate & detailed readings",
      "Priority response generation",
      "Save 50% vs Quick Ask"
    ]
  }
];

const PricingComponent = () => {
  const navigate = useNavigate();
  const { user, setAuthOpen } = useAuth();

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 border border-border/60 mb-4">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">New Question-Based Packs - Get Instant Answers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 relative">
            <span className="relative z-10 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent drop-shadow-2xl">
              Choose Your Question Pack
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-accent/50 to-primary/40 blur-2xl -z-10 scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-secondary/40 to-accent/30 blur-xl -z-10 scale-105"></div>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {plans.map((plan) => {
            const isDeepDive = plan.name === 'Deep Dive';
            const perQuestionPrice = (plan.price / plan.questions).toFixed(1);
            
            return (
              <Card
                key={plan.name}
                className={`p-8 rounded-2xl border ${isDeepDive ? 'border-accent/60 bg-accent/10' : 'border-border/60 bg-card/40'} transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer relative min-h-[600px] sm:min-h-[650px] md:min-h-[600px]`}
                onClick={() => {
                  if (user) {
                    navigate(`/pricing/onboarding?plan=${encodeURIComponent(plan.name)}&amount=${plan.price}&type=pack`);
                  } else {
                    // Use proper AuthModal
                    setAuthOpen(true);
                  }
                }}
              >
                {isDeepDive && (
                  <div className="absolute -top-3 -right-3">
                    <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-bold">
                      Best Value 🔥
                    </span>
                  </div>
                )}
                
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className={`text-2xl font-bold mb-3 ${isDeepDive ? 'text-accent' : 'text-white'}`}>{plan.name}</h2>
                  <p className="text-white text-sm mb-4">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {plan.questions} Questions
                  </div>
                  <div className="text-lg text-green-400 font-bold mb-4">
                    = ₹{perQuestionPrice}/question
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-4xl font-bold ${isDeepDive ? 'text-accent' : 'text-pink-500'}`}>
                      ₹{plan.price}
                    </span>
                    <span className="text-sm text-white">/ {plan.period}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4 text-center">What you get:</h3>
                  <ul className="space-y-3">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 text-sm mt-1">✓</span>
                        <span className="text-white text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <Button
                    variant={isDeepDive ? "default" : "cosmic"}
                    className={`w-full h-12 rounded-lg font-semibold text-base ${isDeepDive ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
                  >
                    Get Started
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal />
    </section>
  );
};

export default PricingComponent;
