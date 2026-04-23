import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { generateGemini } from "@/lib/gemini";

interface DynamicContent {
  title: string;
  reasoning: string;
  actionPoints: string[];
  avoidPoints: string[];
  energyCurve: number[];
  bestDay: string;
  timeRange: string;
}

export default function DynamicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState<DynamicContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const generateContent = async () => {
      if (!user) return;

      setLoading(true);
      
      try {
        // Get query from localStorage
        const storedQuery = localStorage.getItem(`dynamicQuery_${id}`) || "Your personalized astrological guidance";
        setQuery(storedQuery);
        
        const systemPrompt = `You are an expert Vedic astrologer. Generate personalized insights based on user queries.
        
        CRITICAL FORMATTING RULES:
        - Do NOT use markdown, asterisks (**), underscores, or any special formatting
        - Use simple Hindi or English only
        - No bold, italic, or decorative symbols
        - Plain text responses only
        
        Return JSON with:
        {
          "title": "Page title (max 60 chars)",
          "reasoning": "Astrological reasoning (2-3 sentences)",
          "actionPoints": ["3 specific action items"],
          "avoidPoints": ["2 things to avoid"],
          "energyCurve": [7 numbers 1-10 representing energy levels],
          "bestDay": "Best day for action",
          "timeRange": "Time period covered"
        }`;

        const response = await generateGemini(
          `Generate insights for: ${storedQuery}\nUser context: Seeking guidance and actionable advice`,
          [],
          systemPrompt
        );

        const jsonText = response.match(/\{[\s\S]*\}/)?.[0] || response;
        const parsed = JSON.parse(jsonText);

        setContent(parsed);
      } catch (error) {
        console.error("Error generating content:", error);
      } finally {
        setLoading(false);
      }
    };

    generateContent();
  }, [id, user]);

  const renderEnergyCurve = (curve: number[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const maxValue = Math.max(...curve, 10);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end h-20">
          {curve.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-primary/20 to-primary/60 rounded-t"
                style={{ height: `${(value / maxValue) * 100}%` }}
              />
              <span className="text-xs text-muted-foreground mt-1">{days[index]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Turning your question into a feature…</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Unable to generate content</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <p className="text-sm text-muted-foreground">{content.timeRange}</p>
          </div>
        </div>

        {/* Energy Curve */}
        <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Energy Curve
          </h3>
          {renderEnergyCurve(content.energyCurve)}
          <p className="text-sm text-primary mt-3 text-center font-medium">
            Best day: {content.bestDay}
          </p>
        </Card>

        {/* Reasoning */}
        <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" />
            Astrological Reasoning
          </h3>
          <p className="text-muted-foreground leading-relaxed">{content.reasoning}</p>
        </Card>

        {/* Action Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-green-600">✅ Action Points</h3>
            <div className="space-y-3">
              {content.actionPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-500 text-sm">•</span>
                  <span className="text-sm text-muted-foreground">{point}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Things to Avoid
            </h3>
            <div className="space-y-3">
              {content.avoidPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-red-500 text-sm">•</span>
                  <span className="text-sm text-muted-foreground">{point}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
