import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader } from "lucide-react";
import { getCachedAstrologyContent } from "@/services/geminiService";

const Future = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Get astrology data from localStorage
        const birthDate = localStorage.getItem('birth_date') || "";
        const birthTime = localStorage.getItem('birth_time') || "";
        const birthPlace = localStorage.getItem('birth_place') || "";
        
        let zodiacSign = "";
        let moonSign = "";
        let ascendant = "";
        
        try {
          const planets = JSON.parse(localStorage.getItem('astrology_planets') || 'null');
          if (Array.isArray(planets)) {
            const sun = planets.find((x: any) => (x.name || x.planet) === 'Sun');
            const moon = planets.find((x: any) => (x.name || x.planet) === 'Moon');
            zodiacSign = sun?.sign || "";
            moonSign = moon?.sign || "";
          }
        } catch {}
        
        ascendant = localStorage.getItem('ascendant') || "";

        const astrologyData = {
          zodiacSign,
          moonSign,
          ascendant,
          birthDate,
          birthTime,
          birthLocation: birthPlace,
        };

        const futureContent = await getCachedAstrologyContent("yourFuture", astrologyData);
        setContent(futureContent);
      } catch (error) {
        console.error("Error fetching future content:", error);
        setContent("Unable to load your future insights at this moment. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [featureAllowed]);

  if (planLoading) {
    return (
      <div className="min-h-screen bg-background px-4 lg:px-6 py-6 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={() => navigate("/dashboard")}
          > 
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-secondary" />
            <h1 className="text-3xl font-bold">Your Future</h1>
          </div>
          <p className="text-muted-foreground">
            Crystal-clear forecasts about love, career and wealth based on your current dasha and transits.
          </p>
        </div>

        <Card className="p-8 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
                <p className="text-muted-foreground">Vedika is analyzing your cosmic blueprint...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {content}
              </div>
            </div>
          )}
        </Card>

        <div className="mt-8 p-6 rounded-xl border border-border/60 bg-background/50">
          <h3 className="font-semibold mb-2">Why this is accurate</h3>
          <p className="text-sm text-muted-foreground">
            Vedika analyzes your exact birth chart with divisional charts, ongoing Mahadasha/Antardasha,
            and present planetary transits. This multi-layer method removes guesswork and delivers
            precise, contextual future insights for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Future;
