import { Check, X, TrendingUp, Shield, Brain, Heart } from "lucide-react";

const ComparisonSection = () => {
  const comparisonData = [
    {
      feature: "AI-Powered Vedic Analysis",
      veadicastro: { value: true, text: "Advanced AI + Vedic Wisdom", icon: Brain },
      astrotalk: { value: false, text: "Manual astrologers only", icon: X },
      melooha: { value: false, text: "Basic AI only", icon: X }
    },
    {
      feature: "Transparent Pricing",
      veadicastro: { value: true, text: "No hidden fees", icon: Shield },
      astrotalk: { value: false, text: "Expensive per minute", icon: X },
      melooha: { value: false, text: "Complex pricing", icon: X }
    },
    {
      feature: "Fear-Free Predictions",
      veadicastro: { value: true, text: "Science-based guidance", icon: Heart },
      astrotalk: { value: false, text: "Fear-based tactics", icon: X },
      melooha: { value: false, text: "Generic predictions", icon: X }
    },
        {
      feature: "Instant Results",
      veadicastro: { value: true, text: "AI-powered speed", icon: Check },
      astrotalk: { value: false, text: "Wait for astrologers", icon: X },
      melooha: { value: false, text: "Slow processing", icon: X }
    },
    {
      feature: "Free Basic Features",
      veadicastro: { value: true, text: "Always free to start", icon: Check },
      astrotalk: { value: false, text: "Pay for everything", icon: X },
      melooha: { value: false, text: "Limited free trial", icon: X }
    }
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-md shadow-lg">
            <TrendingUp className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-sm font-medium text-secondary">Platform Comparison</span>
          </div>
          
          <h2 className="font-sans text-4xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-normal">
            Why Veadicastro Leaves Other
            <span className="block md:inline bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent"> Astrology Apps Behind</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Astrotalk, Melooha, and most astrology apps still use generic scripts, fear-based lines, and overpricing.
            Veadicastro flips the game with AI-powered Vedic intelligence, transparency, and way more value.
            Below is the truth, side-by-side.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 bg-gradient-to-r from-secondary/20 to-primary/20 border-b border-border/60">
              <div className="p-4 md:p-6">
                <h3 className="font-semibold text-foreground">Features</h3>
              </div>
              <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/40 mb-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span className="font-semibold text-secondary">Veadicastro</span>
                </div>
                <p className="text-sm text-muted-foreground">AI + Vedic Wisdom</p>
              </div>
              <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                <div className="font-medium text-foreground mb-2">Astrotalk</div>
                <p className="text-sm text-muted-foreground">Traditional Platform</p>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="font-medium text-foreground mb-2">Melooha</div>
                <p className="text-sm text-muted-foreground">Basic AI App</p>
              </div>
            </div>

            {/* Table Rows */}
            {comparisonData.map((row, index) => (
              <div 
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 border-b border-border/30 last:border-b-0 hover:bg-card/20 transition-colors"
              >
                {/* Feature Name */}
                <div className="p-4 md:p-6 border-b md:border-b-0 border-border/30">
                  <div className="font-medium text-foreground">{row.feature}</div>
                </div>

                {/* Veadicastro Column */}
                <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center text-white">
                      {row.veadicastro.icon && <row.veadicastro.icon className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-secondary">{row.veadicastro.text}</span>
                  </div>
                </div>

                {/* Astrotalk Column */}
                <div className="p-4 md:p-6 text-center md:border-x border-border/30">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">{row.astrotalk.text}</span>
                  </div>
                </div>

                {/* Melooha Column */}
                <div className="p-4 md:p-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">{row.melooha.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30 backdrop-blur-md">
              <Check className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-foreground">Clear Winner: Veadicastro</span>
            </div>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Experience the difference with AI-powered Vedic astrology that's transparent, accurate, and fear-free.
            </p>
          </div>
        </div>
      </div>

      {/* Animated stars */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-secondary rounded-full animate-sparkle shadow-lg shadow-secondary/50"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-primary rounded-full animate-sparkle shadow-lg shadow-primary/50" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-accent rounded-full animate-sparkle shadow-lg shadow-accent/50" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default ComparisonSection;
