import { Card } from "@/components/ui/card";
import { Brain, Heart, TrendingUp, MessageCircle, Calendar, Sparkles } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Daily Predictions",
    description: "Get personalized daily, weekly, and monthly horoscopes powered by AI and ancient astrology wisdom.",
    color: "text-secondary"
  },
  {
    icon: Sparkles,
    title: "Birth Chart Analysis",
    description: "Deep dive into your natal chart with detailed planetary positions, houses, and aspects interpretation.",
    color: "text-accent"
  },
  {
    icon: MessageCircle,
    title: "AI Astrologer Chat",
    description: "Chat with our AI astrologer personality for instant answers to your cosmic questions 24/7.",
    color: "text-secondary"
  },
  {
    icon: Heart,
    title: "Love Compatibility",
    description: "Discover your romantic compatibility with detailed synastry analysis and relationship insights.",
    color: "text-accent"
  },
  {
    icon: TrendingUp,
    title: "Career Guidance",
    description: "Unlock your professional potential with career predictions and optimal timing for major decisions.",
    color: "text-secondary"
  },
  {
    icon: Brain,
    title: "Life Insights",
    description: "Get comprehensive guidance on health, wealth, spirituality, and personal growth journey.",
    color: "text-accent"
  }
];

const Features = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Your Complete
            <span className="text-gradient"> Cosmic Toolkit</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Harness the power of AI combined with time-tested astrological wisdom to navigate life's journey with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.2)] group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-12 h-12" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
