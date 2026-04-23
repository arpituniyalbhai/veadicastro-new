import { useEffect, useState } from "react";
import { X, MessageCircle, Heart, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PersonalizedWelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen popup before
    const hasSeenPopup = localStorage.getItem("hasSeenComparisonPopup");
    
    if (!hasSeenPopup) {
      // Get user name and age-based questions
      try {
        const name = localStorage.getItem('profile_name') || localStorage.getItem('user_name') || "Friend";
        setUserName(name);
        
        // Get age-based questions (same logic as dashboard)
        let dobStr: string | null = null;
        try { 
          dobStr = JSON.parse(localStorage.getItem('onboarding_details') || 'null')?.dob ?? null; 
        } catch {}
        
        const now = new Date();
        const age = (() => {
          if (!dobStr) return null;
          const [y, m, d] = dobStr.split('-').map((n: string) => parseInt(n, 10));
          if (!y || !m || !d) return null;
          const b = new Date(y, m - 1, d);
          let a = now.getFullYear() - b.getFullYear();
          const mm = now.getMonth() - b.getMonth();
          if (mm < 0 || (mm === 0 && now.getDate() < b.getDate())) a--;
          return a;
        })();

        let base: string[] = [];
        if (age == null) {
          base = [
            "Will 2026 bring career growth for me?",
            "When will I find my life partner?",  
            "Is this a good year for my finances?",
          ];
        } else if (age <= 17) {
          base = [
            "Will 2026 bring career growth for me?",
            "When will I find my life partner?",  
            "Is this a good year for my finances?",
          ];
        } else if (age <= 25) {
          base = [
            "Will 2026 bring career growth for me?",
            "When will I find my life partner?",  
            "Is this a good year for my finances?",
          ];
        } else if (age <= 35) {
          base = [
            "Will 2026 bring career growth for me?",
            "When will I find my life partner?",  
            "Is this a good year for my finances?",
          ];
        } else if (age <= 50) {
          base = [
            "Will 2026 bring career growth for me?",
            "When will I find my life partner?",  
            "Is this a good year for my finances?",
          ];
        } else {
          base = [
            "Will 2026 bring career growth for me?",
            "When will I find my life partner?",  
            "Is this a good year for my finances?",
          ];
        }
        
        setSuggestedQuestions(base.slice(0, 3));
      } catch (error) {
        console.error("Error loading user data:", error);
        setSuggestedQuestions([
          "Will 2026 bring career growth for me?",
          "When will I find my life partner?",  
          "Is this a good year for my finances?",
        ]);
      }

      // Show popup after a short delay to allow dashboard to load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Save that user has seen popup
    localStorage.setItem("hasSeenComparisonPopup", "true");
  };

  const handleQuestionClick = (question: string) => {
    // Navigate to chat with the question pre-filled
    navigate(`/chat?question=${encodeURIComponent(question)}`);
    handleClose();
  };

  const handleAskSomethingElse = () => {
    navigate("/chat");
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleClose} />
      
      {/* Popup */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[90vh] bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header with Vedika */}
        <div className="relative p-6 md:p-8 text-center border-b border-border/60">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-card/60 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
          
          {/* Vedika Image */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-secondary/30 mx-auto mb-4">
            <img 
              src="/optimized/vedika.webp" 
              alt="Vedika AI" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Personalized Message */}
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              🔮 Welcome {userName} to Veadicastro!
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              From my side, you have 2 free credits and 5 questions in just ₹99.
            </p>
          </div>
        </div>

        {/* Pricing and CTA Section */}
        <div className="p-4 md:p-6 space-y-4 text-center">
          <div className="text-2xl md:text-3xl font-bold text-secondary">
            5 Questions for ₹149
          </div>
          <p className="text-sm text-muted-foreground">
            Unlock deeper insights into your future.
          </p>
          <button
            onClick={handleClose}
            className="w-auto px-6 py-2 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm md:text-base mx-auto block"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Footer - Hidden */}
        {/* <div className="p-4 md:p-6 border-t border-border/60 bg-card/40">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <button
              onClick={handleAskSomethingElse}
              className="flex items-center gap-2 px-4 py-2 text-secondary hover:text-secondary/80 transition-colors text-sm md:text-base"
            >
              Ask Something Else →
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors text-sm md:text-base"
            >
              Maybe Later
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default PersonalizedWelcomePopup;
