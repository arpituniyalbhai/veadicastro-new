import { Sparkles, CheckCircle2 } from "lucide-react";
import cosmicBg from "@/assets/cosmic-bg.jpg";
import dashboardPreview from "@/assets/planets.png";
import planetsImg from "@/assets/planets-hero.png";
import { useEffect, useRef, useState } from "react";

const AboutSection = () => {

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
    <section ref={sectionRef} id="about" className="py-24 px-4 relative overflow-hidden">
      {/* Enhanced Cosmic Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${cosmicBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-md shadow-lg">
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-sm font-medium text-secondary">Discover the Power of AI Astrology</span>
          </div>
          
          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            What is
            <span className="block md:inline bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent"> Veadicastro?</span>
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Content */}
          <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="space-y-4">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Veadicastro is the world's most advanced AI + Vedic Astrology ecosystem, combining 5,000 years of Vedic wisdom with sophisticated machine learning to deliver clear, actionable cosmic intelligence.
              </p>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                We've removed the complexity of traditional astrology to provide easy-to-understand, fraud-free results you can actually trust.
              </p>
            </div>
            
            <div className="bg-secondary/10 backdrop-blur-sm rounded-xl p-6 border border-secondary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary/30">
                  <img 
                    src="/optimized/vedika.webp" 
                    alt="Vedika AI" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center"><span class="text-white font-bold text-sm">AI</span></div>';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Vedika AI Accuracy</h3>
                  <p className="text-sm text-muted-foreground">Tested with 500+ users</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Based on testing with over 500 people and their reviews, we've achieved 96% accuracy in question answering. No guesswork, no hidden agendas just pure Vedic insight powered by the world's most reliable celestial engine.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Core Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">24/7 AI Astrologer Chat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Family Hub Management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Daily Strategic Insights</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Advanced Tools</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Future Roadmap Predictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Life Instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Real-time Calculations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
              Veadicastro is more than an app—it's your daily blueprint for a confident and purposeful life.
            </p>
          </div>

          {/* Right: Images */}
          <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative">
              {/* Main dashboard preview */}
              <img 
                src={dashboardPreview} 
                alt="Dashboard Preview" 
                loading="eager"
                className="rounded-2xl shadow-2xl border border-secondary/20 w-full"
              />
              
              {/* Floating planets decoration */}
              <img 
                src={planetsImg} 
                alt="" 
                loading="eager"
                className="absolute -top-8 -right-8 w-32 md:w-40 opacity-80 animate-float pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Animated Decorative stars */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-secondary rounded-full animate-sparkle shadow-lg shadow-secondary/50"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-primary rounded-full animate-sparkle shadow-lg shadow-primary/50" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-accent rounded-full animate-sparkle shadow-lg shadow-accent/50" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-60 right-1/4 w-1 h-1 bg-secondary rounded-full animate-float shadow-lg shadow-secondary/50" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute bottom-60 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-float shadow-lg shadow-primary/50" style={{ animationDelay: '0.8s' }}></div>
    </section>
  );
};

export default AboutSection;
