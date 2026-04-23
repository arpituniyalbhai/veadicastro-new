import { Brain, Sparkles, CheckCircle2, Target, Zap, Shield, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VedikaAISection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5" />
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-md shadow-lg">
            <Brain className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-sm font-medium text-secondary">Meet Your AI Astrologer</span>
          </div>
          
          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Who is
            <span className="block md:inline bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent"> Vedika AI?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your personal AI astrologer that combines ancient Vedic wisdom with modern artificial intelligence
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Vedika Photo and Info */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            {/* Profile Card */}
            <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col items-center space-y-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-secondary/20 border-2 border-secondary/30 shadow-2xl">
                    <img 
                      src="/optimized/vedika.webp" 
                      alt="Vedika AI" 
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                  {/* Status Badge */}
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full border-2 border-background shadow-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    ONLINE
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="text-center space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">Vedika AI</h3>
                  <p className="text-secondary font-medium">Advanced AI Astrologer</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>4.9/5 Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>96% Accurate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span>24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-foreground">Why Choose Vedika AI?</h4>
              {[
                {
                  icon: <Brain className="w-5 h-5 text-secondary" />,
                  title: "Advanced AI Technology",
                  description: "Powered by sophisticated machine learning algorithms trained on millions of astrological data points"
                },
                {
                  icon: <Shield className="w-5 h-5 text-primary" />,
                  title: "Vedic Astrology Expertise",
                  description: "Deep understanding of ancient Vedic principles combined with modern computational accuracy"
                },
                {
                  icon: <Star className="w-5 h-5 text-secondary" />,
                  title: "Personalized Insights",
                  description: "Tailored guidance based on your unique birth chart and life circumstances"
                }
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-4 p-4 bg-card/20 rounded-xl border border-border/40 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">{feature.title}</h5>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Accuracy and Capabilities */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            {/* Accuracy Card */}
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 backdrop-blur-md border border-secondary/30 rounded-3xl p-8 shadow-xl">
              <div className="text-center space-y-6">
                <div>
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                    96%
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Accuracy Rate</h3>
                  <p className="text-muted-foreground">
                   Based on testing with over 500 people and their reviews, we've achieved 96% accuracy in question answering. No guesswork, no hidden agendas just pure Vedic insight powered by the world's most reliable celestial engine.
                  </p>
                </div>
              </div>
            </div>

            {/* Capabilities Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Birth Chart Analysis", value: "100%" },
                { label: "Future Predictions", value: "99%" },
                { label: "Relationship Guidance", value: "98%" },
                { label: "Career Insights", value: "97%" },
                { label: "Health Forecasts", value: "96%" },
                { label: "Financial Guidance", value: "95%" }
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  className={`bg-card/40 backdrop-blur-md border border-border/60 rounded-xl p-4 text-center transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ transitionDelay: `${(idx + 3) * 100}ms` }}
                >
                  <div className="text-2xl font-bold text-secondary mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial Style Quote */}
            <div className="bg-card/20 backdrop-blur-md border border-border/40 rounded-2xl p-6 relative">
              <div className="absolute top-4 left-4 w-8 h-8 text-secondary/20">
                <Star className="w-full h-full" />
              </div>
              <blockquote className="text-lg text-muted-foreground italic leading-relaxed pl-8">
                "Vedika AI represents the perfect fusion of ancient Vedic wisdom and cutting-edge artificial intelligence, 
                providing you with astrological guidance that is both authentic and technologically advanced."
              </blockquote>
              <div className="mt-4 text-right">
                <div className="font-semibold text-foreground">— Veadicastro Team</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Sparkles */}
      <div className="absolute top-20 right-10 w-2 h-2 bg-secondary rounded-full animate-sparkle shadow-lg shadow-secondary/50"></div>
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-primary rounded-full animate-sparkle shadow-lg shadow-primary/50" style={{ animationDelay: '0.5s' }}></div>
    </section>
  );
};

export default VedikaAISection;
