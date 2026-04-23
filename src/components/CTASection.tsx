import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const { user, setAuthOpen } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-20"></div>
          <div className="absolute inset-0 backdrop-blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10 py-16 px-8 md:px-16 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 backdrop-blur-sm animate-sparkle">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm">Start Your Cosmic Journey Today</span>
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
              Ready to Discover Your
              <span className="text-gradient"> Cosmic Blueprint?</span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join millions who trust Astrology AI for accurate predictions, personalized insights, and life-changing guidance.
            </p>

            <div className="flex justify-center pt-4">
              <Button 
                variant="cosmic" 
                size="lg" 
                className="group min-w-[200px]"
                onClick={handleGetStarted}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 justify-center pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <span>Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
