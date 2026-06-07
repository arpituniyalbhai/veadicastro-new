import { ButtonLite } from "@/components/ui/button-lite";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Hero = () => {
  const { setAuthOpen, user } = useAuth();
  const navigate = useNavigate();
  
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
 const cyclingTexts = [
  "That Guides You",
  "That Knows You",
  "That Directs You",
  "That Sees You",
  "That Feel You",
  "That Shapes You",
  "That Inspires You"
];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % cyclingTexts.length);
        setIsVisible(true);
      }, 500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <section id="hero" className="relative min-h-screen md:min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-20">
      {/* Clean Background with explicit color for Googlebot */}
      <div className="absolute inset-0 z-0 bg-background" style={{ backgroundColor: '#0a0a0f' }} />

      {/* Noscript fallback for Googlebot - static content always visible */}
      <noscript>
        <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', color:'white', zIndex:20}}>
          <h1 style={{fontSize:'2.5rem', fontWeight:'bold', color:'white', marginBottom:'1rem'}}>AI Powered Vedic Astrology</h1>
          <p style={{color:'#d1d5db', marginTop:'1rem', fontSize:'1.125rem'}}>Get your personalized prediction in 60 seconds</p>
          <p style={{color:'#9ca3af', marginTop:'0.5rem', fontSize:'1rem'}}>Knows what's coming next in your love, career and money</p>
        </div>
      </noscript>

      {/* Content */}
      <div className="container relative z-10 px-4 sm:px-6 py-12 md:py-20 mx-auto">
        <div className="flex items-center justify-center">
          {/* Centered Content */}
          <div className="text-center space-y-6 md:space-y-10 max-w-6xl">
            {/* Badge */}

            <div className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-md shadow-lg shadow-secondary/20">
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-secondary animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-secondary">Powered by Advanced AI & Vedic Knowledge</span>
            </div>

            <h1 className="font-sans text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight tracking-normal relative">
              <span className="block" style={{color:'#f2f2f2'}}>
                AI Powered{" "}
                <span style={{color:'#d9277a', fontWeight:'600', WebkitTextFillColor:'#d9277a'}}>Vedic Astrology</span>{" "}—
              </span>
              <div className="relative inline-block h-[1.2em]">
                <div className="hero-headline-wrapper relative">
                  {/* Visible static glow behind the cycling text */}
                  <div className="absolute inset-0 -left-3 -right-3 -top-2 -bottom-2 bg-gradient-to-r from-[#8B0050]/50 via-[#6B0040]/40 to-[#8B0050]/50 blur-xl opacity-70 -z-10"></div>
                  <span className={`text-[#d9277a] relative z-10 block font-bold transition-all duration-500 ease-in-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                  }`}>
                    {cyclingTexts[currentTextIndex]}
                  </span>
                </div>
              </div>
            </h1>
            
            <p style={{color:'#c4c4d4'}} className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-2">
              Get your personalized predictions,<br />
              Knows what's coming next in your{" "}
              <span style={{color:'#d9277a', fontWeight:'600'}}>love</span>,{" "}
              <span style={{color:'#d9277a', fontWeight:'600'}}>career</span> and{" "}
              <span style={{color:'#d9277a', fontWeight:'600'}}>money</span>
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 md:pt-6">
              <ButtonLite
                variant="cosmic"
                size="xl"
                className="px-16 py-6 text-sm font-semibold shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                onClick={() => {
                  if (user) {
                    navigate('/dashboard?referral=hero');
                  } else {
                    setAuthOpen(true);
                  }
                }}
              >
                See My Future 
                <ArrowRight className="w-4 h-4 ml-2" />
              </ButtonLite>
            </div>

            {/* User Trust Section */}
            <div className="mt-8 sm:mt-10 flex flex-col items-center space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 blur-md bg-yellow-400/40 rounded-full scale-150"></div>
                    <div className="absolute inset-0 blur-lg bg-yellow-300/30 rounded-full scale-200"></div>
                    <div className="relative flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 drop-shadow-xl" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  <span style={{color:'#f2f2f2'}} className="font-semibold text-foreground">Chosen by 21500+ Users Worldwide</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;