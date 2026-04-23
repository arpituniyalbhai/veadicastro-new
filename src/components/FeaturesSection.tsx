import { useEffect } from "react";
import { Users, FileText, Target, Brain, Sparkles, BookOpen, Calendar, TrendingUp, Heart, Dice1 } from "lucide-react";

const FeaturesSection = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal-on-scroll-features')) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' }); // Lower threshold and margin for earlier trigger
    
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const features = [
    {
      icon: Users,
      title: "Add Your Loved Ones",
      description: "Just enter their birth details and let AI generate accurate, personalized insights for them.",
      badge: "Family Members",
      color: "from-primary to-accent",
      steps: [
        "Enter Birth Details",
        "AI Generates Insights", 
        "Manage & Compare"
      ],
      stepDetails: [
        "Name, date, time, and place — accuracy matters for better guidance.",
        "From daily tips to full life overview — tailored for each person.",
        "Switch between members, compare trends, and share highlights."
      ]
    },
    {
      icon: FileText,
      title: "Your Personalized Astrology Report",
      description: "A clear, structured, and deeply insightful reading built from your birth details and current planetary positions.",
      badge: "Reports",
      color: "from-secondary to-primary",
      highlights: [
        "Birth Chart Overview",
        "Life Areas & Insights",
        "Timing & Transit"
      ],
      highlightDetails: [
        "Your full Kundli with houses, planets, strengths, and key life indicators — explained in simple language.",
        "Focused guidance for Career, Love, Health, and Finance, including actionable suggestions.",
        "Planetary transits and dasha insights to know when to act and when to pause."
      ]
    },
    {
      icon: Target,
      title: "Unmatched Accuracy. Real Guidance.",
      description: "We combine traditional Vedic calculations with AI to deliver clarity you can trust.",
      badge: "Why Choose Us",
      color: "from-accent to-secondary",
      metrics: [
        "Authentic Vedic Calculations",
        "AI-Enhanced Interpretation", 
        "Actionable Insights"
      ],
      metricDetails: [
        "Precise calculations using authentic Vedic principles and accurate birth data.",
        "AI-enhanced interpretation for clarity, personalization, and simple language.",
        "Clear timing from transits and dashas with actionable guidance you can apply today."
      ]
    },
    {
      icon: Brain,
      title: "Vedika Chat",
      description: "Your personal AI astrologer that combines ancient Vedic wisdom with modern artificial intelligence for instant guidance.",
      badge: "AI Chat",
      color: "from-secondary to-accent",
      capabilities: [
        "Instant AI Responses",
        "Personalized Conversations",
        "24/7 Availability"
      ],
      capabilityDetails: [
        "Get immediate answers to your astrological questions with advanced AI technology.",
        "Chat naturally about your birth chart, transits, and personal concerns.",
        "Access guidance anytime, anywhere without waiting for human astrologers."
      ]
    },
    {
      icon: Sparkles,
      title: "Future Insights",
      description: "Get percentage-based predictions and insights for major life events based on your dashas and planetary transits.",
      badge: "Future Predictions",
      color: "from-primary to-secondary",
      predictions: [
        "Career Opportunities",
        "Relationship Timing",
        "Financial Growth"
      ],
      predictionDetails: [
        "Discover likely career changes and growth opportunities with timing predictions.",
        "Understand relationship patterns and optimal timing for love and marriage.",
        "Identify favorable periods for investments, business ventures, and wealth accumulation."
      ]
    },
    {
      icon: BookOpen,
      title: "Life Instructions",
      description: "Receive personalized daily guidance and instructions based on your birth chart and current planetary positions.",
      badge: "Daily Guidance",
      color: "from-accent to-primary",
      instructions: [
        "Daily Action Plans",
        "Timing Guidance",
        "Life Direction"
      ],
      instructionDetails: [
        "Get specific daily tasks and activities aligned with your planetary energies.",
        "Know the best times for important decisions, meetings, and personal activities.",
        "Receive clear direction for navigating life's challenges and opportunities."
      ]
    },
    {
      icon: Calendar,
      title: "Today & Tomorrow Daily Self",
      description: "Get personalized daily insights and predictions for health, self, and wealth based on your current planetary transits and birth chart.",
      badge: "Daily Insights",
      color: "from-primary to-accent",
      dailyFeatures: [
        "Daily Health Prediction",
        "Daily Self Prediction", 
        "Daily Wealth Prediction"
      ],
      dailyDetails: [
        "We show a daily health prediction for tomorrow and for today to help you plan wellness activities.",
        "We show a daily self prediction for tomorrow and for today to guide personal growth and decisions.",
        "We show a daily wealth prediction for tomorrow and for today to identify financial opportunities."
      ]
    },
    {
      icon: TrendingUp,
      title: "Wealth Prediction",
      description: "Discover your financial potential and optimal timing for investments, business ventures, and wealth accumulation.",
      badge: "Financial Insights",
      color: "from-secondary to-accent",
      wealthFeatures: [
        "Investment Timing",
        "Business Opportunities",
        "Income Potential"
      ],
      wealthDetails: [
        "Identify the best periods for investments and financial decisions based on planetary positions.",
        "Recognize favorable business opportunities and entrepreneurial timing from your chart.",
        "Understand your income potential and wealth accumulation patterns throughout life."
      ]
    },
        {
      icon: Sparkles,
      title: "Lucky Numbers & Colors",
      description: "Discover your personal lucky numbers and colors based on your birth chart, with daily recommendations for important decisions and mood enhancement.",
      badge: "Personal Luck",
      color: "from-primary to-secondary",
      luckyFeatures: [
        "Lucky Numbers",
        "Lucky Colors",
        "Daily Recommendations"
      ],
      luckyDetails: [
        "Calculate your core lucky numbers from birth date and receive daily number picks for important decisions.",
        "Find colors that resonate with your planetary rulers and get daily color recommendations for mood enhancement.",
        "Get combined daily recommendations of lucky numbers and colors for optimal timing and energy."
      ]
    }
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl bg-secondary/20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl bg-primary/20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl bg-accent/10" />
      </div>

      <div className="container mx-auto max-w-7xl relative">
        {/* Header */}
        <header className="mb-12 sm:mb-16 text-center reveal-on-scroll-features opacity-0 translate-y-6 transition-all duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-md shadow-lg mb-6">
            <Target className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-sm font-medium text-secondary">Platform Features</span>
          </div>
          
          <h2 className="font-sans text-4xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-normal px-4 relative">
            <span className="relative z-10 block">
              <span className="relative z-10 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent drop-shadow-lg">
                Everything You Need,
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/15 via-accent/20 to-primary/15 blur-lg -z-10 scale-105"></div>
            </span>
            <span className="relative z-10 block md:inline bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent drop-shadow-lg">
              In One Place
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/15 via-primary/20 to-accent/15 blur-lg -z-10 scale-105"></div>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 mt-6">
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group reveal-on-scroll-features opacity-0 translate-y-6 transition-all duration-500 ease-out"
              style={{ transitionDelay: `${index * 50}ms` }} // Reduced from 150ms to 50ms for faster loading
            >
              <div className="h-full bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-lg border border-border/40 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-secondary/60 relative overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 mb-4">
                  <feature.icon className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-medium text-secondary">{feature.badge}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-xl font-normal text-foreground mb-4 group-hover:text-secondary transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature-specific content */}
                <div className="space-y-4 relative z-10">
                  {feature.steps && (
                    <div className="space-y-3">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-secondary">{stepIndex + 1}</span>
                          </div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{step}</div>
                            <div className="text-xs text-muted-foreground">{feature.stepDetails[stepIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.highlights && (
                    <div className="space-y-3">
                      {feature.highlights.map((highlight, highlightIndex) => (
                        <div key={highlightIndex} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-secondary/50 flex-shrink-0 mt-2"></div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{highlight}</div>
                            <div className="text-xs text-muted-foreground">{feature.highlightDetails[highlightIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.metrics && (
                    <div className="space-y-3">
                      {feature.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <feature.icon className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{metric}</div>
                            <div className="text-xs text-muted-foreground">{feature.metricDetails[metricIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.capabilities && (
                    <div className="space-y-3">
                      {feature.capabilities.map((capability, capabilityIndex) => (
                        <div key={capabilityIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Brain className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{capability}</div>
                            <div className="text-xs text-muted-foreground">{feature.capabilityDetails[capabilityIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.predictions && (
                    <div className="space-y-3">
                      {feature.predictions.map((prediction, predictionIndex) => (
                        <div key={predictionIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{prediction}</div>
                            <div className="text-xs text-muted-foreground">{feature.predictionDetails[predictionIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.instructions && (
                    <div className="space-y-3">
                      {feature.instructions.map((instruction, instructionIndex) => (
                        <div key={instructionIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <BookOpen className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{instruction}</div>
                            <div className="text-xs text-muted-foreground">{feature.instructionDetails[instructionIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.dailyFeatures && (
                    <div className="space-y-3">
                      {feature.dailyFeatures.map((dailyFeature, dailyIndex) => (
                        <div key={dailyIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Calendar className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{dailyFeature}</div>
                            <div className="text-xs text-muted-foreground">{feature.dailyDetails[dailyIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.wealthFeatures && (
                    <div className="space-y-3">
                      {feature.wealthFeatures.map((wealthFeature, wealthIndex) => (
                        <div key={wealthIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                            <TrendingUp className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-normal text-foreground text-sm mb-1">{wealthFeature}</div>
                            <div className="text-xs text-muted-foreground">{feature.wealthDetails[wealthIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  
                  {feature.luckyFeatures && (
                    <div className="space-y-3">
                      {feature.luckyFeatures.map((luckyFeature, luckyIndex) => (
                        <div key={luckyIndex} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm mb-1">{luckyFeature}</div>
                            <div className="text-xs text-muted-foreground">{feature.luckyDetails[luckyIndex]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover effect indicator */}
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <feature.icon className="w-4 h-4 text-secondary" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Animated stars */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-secondary rounded-full animate-sparkle shadow-lg shadow-secondary/50"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-primary rounded-full animate-sparkle shadow-lg shadow-primary/50" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-accent rounded-full animate-sparkle shadow-lg shadow-accent/50" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default FeaturesSection;
