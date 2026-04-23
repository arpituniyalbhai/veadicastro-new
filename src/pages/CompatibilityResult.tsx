import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { getPlanetaryData } from "@/lib/astroCalc";
import { useI18n } from "@/context/I18nContext";

// Import the same function used in chat.tsx
async function generateGemini(prompt: string, history: any[] = [], systemExtra?: string): Promise<string> {
  // Proxy through serverless function to avoid exposing keys
  // Backend automatically includes current date/time in IST
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
  const res = await fetch(`${API_BASE}/api/mistral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history, systemExtra }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return String(data?.text || '').trim();
}

// Function to clean and format AI response
const sanitizeAIResponse = (text: string): string => {
  // Remove all markdown formatting
  let cleaned = text
    // Remove bold (both ** and ***)
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    // Remove italic
    .replace(/\*(.*?)\*/g, "$1")
    // Remove headers
    .replace(/^#{1,6}\s*/gm, "")
    // Remove blockquotes
    .replace(/^>\s?/gm, "")
    // Remove inline code
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, "$1")
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove horizontal rules
    .replace(/^-{3,}$/gm, "")
    // Remove bullet points and convert to plain text
    .replace(/^[-*+]\s+/gm, "")
    // Remove numbered lists
    .replace(/^\d+\.\s+/gm, "")
    // Remove multiple spaces
    .replace(/\s+/g, " ")
    .trim();
  
  // Truncate to under 400 words
  const words = cleaned.split(/\s+/);
  if (words.length > 400) {
    cleaned = words.slice(0, 400).join(" ") + "...";
  }
  
  return cleaned;
};

type MatchType = "marriage" | "love" | "siblings" | "parent" | "business";

interface CompatibilityData {
  score: number;
  analysis: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

const CompatibilityResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState<CompatibilityData | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [matchType, setMatchType] = useState<MatchType | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type") as MatchType;

    if (!type) {
      navigate("/compatibility");
      return;
    }

    setMatchType(type);
    
    // Get second person data from localStorage
    try {
      const secondPersonData = JSON.parse(localStorage.getItem("compatibility_second_person") || "{}");
      if (!secondPersonData.name || !secondPersonData.dob) {
        setError("Second person details not found");
        setLoading(false);
        return;
      }
      setSelectedPerson(secondPersonData);
      fetchCompatibility(secondPersonData, type);
    } catch (e) {
      setError("Unable to load person details");
      setLoading(false);
    }
  }, [location.search, navigate]);

  const fetchCompatibility = async (person: any, type: MatchType) => {
    try {
      setLoading(true);
      
      // Get user details
      let userDetails = null;
      try {
        userDetails = JSON.parse(localStorage.getItem("onboarding_details") || "null");
      } catch {
        /* ignore */
      }

      if (!userDetails?.dob || !person.dob) {
        setError("Birth details not available for compatibility analysis");
        setLoading(false);
        return;
      }

      // Get planetary data for both people
      let userPlanets = "";
      let personPlanets = person.planets ? JSON.stringify(person.planets) : "";

      // If user planets not available, calculate them
      if (!userPlanets) {
        try {
          const [y, m, d] = userDetails.dob.split('-').map((n: string) => parseInt(n, 10));
          const [hh, mm] = userDetails.time.split(':').map((n: string) => parseInt(n, 10));
          const tzone = typeof userDetails.tzone === 'number' ? userDetails.tzone : (-new Date().getTimezoneOffset() / 60);
          
          const userPayload = await getPlanetaryData({
            day: d,
            month: m,
            year: y,
            hour: hh,
            min: mm,
            lat: userDetails.lat,
            lon: userDetails.lng,
            tzone: tzone,
          });
          userPlanets = JSON.stringify(userPayload);
        } catch (e) {
          console.error("Failed to fetch user planetary data:", e);
        }
      }

      // Build relationship type context
      const relationshipContext = {
        marriage: "marriage compatibility and long-term partnership potential",
        love: "romantic compatibility and relationship harmony",
        siblings: "sibling relationships and family dynamics",
        parent: "parent-child compatibility and relationship dynamics",
        business: "professional partnership and business compatibility"
      };

      // Build system prompt for Mistral
      const langInstruction = lang === "hi" 
        ? "CRITICAL: You MUST respond ONLY in pure Hindi (Devanagari script). Do NOT use any English words, Hinglish, or mixed language. Write everything in complete Hindi sentences using Devanagari script. Never use English words - always use Hindi equivalents. If you use any English words, the response is incorrect. Respond entirely in Hindi Devanagari script only."
        : "Respond in English.";

      const systemBlock = `You are an expert Vedic astrologer specializing in compatibility analysis. Analyze the compatibility between two people based on their birth charts and planetary positions.

${langInstruction}

User 1 Details:
DOB: ${userDetails?.dob}
Time: ${userDetails?.time}
Place: ${userDetails?.place}
Planetary Data: ${userPlanets || 'Not available'}

User 2 Details (${person.name}):
DOB: ${person.dob}
Time: ${person.time || 'Unknown'}
Place: ${person.place || 'Unknown'}
Planetary Data: ${personPlanets || 'Not available'}

Relationship Type: ${relationshipContext[type]}

Provide a compatibility score out of 10, followed by a concise analysis in under 400 words total. Include:
1. Compatibility Score: X.X/10
2. Overall Analysis (brief, under 300 words)
3. 2-3 key strengths
4. 2-3 challenges
5. 2-3 recommendations

Keep it practical and insightful. Use plain text only - no markdown, bold, or formatting. Total response must be under 400 words.`.trim();

      const promptText = lang === "hi" 
        ? `मेरे और ${person.name} के बीच ${relationshipContext[type]} का विस्तृत विश्लेषण प्रदान करें।`
        : `Provide detailed compatibility analysis between me and ${person.name} for ${relationshipContext[type]}.`;

      // Use Mistral API (same as chat.tsx)
      const response = await generateGemini(promptText, [], systemBlock);
      const aiResponse = sanitizeAIResponse(response);

      // Parse the response
      const parsedData = parseCompatibilityResponse(aiResponse);
      setCompatibility(parsedData);

    } catch (error) {
      console.error("Error fetching compatibility:", error);
      setError("Unable to generate compatibility analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseCompatibilityResponse = (response: string): CompatibilityData => {
    console.log('Raw AI Response:', response); // Debug log
    
    try {
      // Extract score - more flexible pattern
      const scoreMatch = response.match(/(?:Compatibility Score:?\s*|Score:?\s*)?(\d+(?:\.\d+)?)(?:\s*\/\s*10)?/i);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 7.5;
      
      console.log('Extracted score:', score); // Debug log

      // Try to extract analysis - more flexible patterns
      let analysis = "";
      
      // Pattern 1: Look for "Overall Analysis"
      const analysisMatch1 = response.match(/(?:Overall Analysis:?|Analysis:?)(.*?)(?=\n*(?:Strengths?|Challenges?|Recommendations?|$))/si);
      if (analysisMatch1) {
        analysis = analysisMatch1[1].trim();
      } else {
        // Pattern 2: Look for any text before the first section
        const analysisMatch2 = response.match(/^(.*?)(?=\n*(?:Strengths?|Challenges?|Recommendations?|\d+\.))/si);
        if (analysisMatch2) {
          analysis = analysisMatch2[1].trim();
        } else {
          // Pattern 3: Use first paragraph
          const paragraphs = response.split('\n\n').filter(p => p.trim());
          analysis = paragraphs[0] || response.substring(0, 200);
        }
      }
      
      console.log('Extracted analysis:', analysis); // Debug log

      // Extract strengths - more flexible
      const strengthsMatch = response.match(/(?:Strengths:?|Key Strengths:?|Positive Points:?)(.*?)(?=\n*(?:Challenges?|Recommendations?|\d+\.|$))/si);
      const strengthsText = strengthsMatch ? strengthsMatch[1].trim() : "";
      const strengths = strengthsText.split('\n').filter(s => s.trim()).map(s => s.replace(/^[-•*\d+\.]\s*/, '').trim()).filter(s => s.length > 0);

      // Extract challenges - more flexible  
      const challengesMatch = response.match(/(?:Challenges:?|Areas to Work On:?|Weaknesses:?)(.*?)(?=\n*(?:Recommendations?|\d+\.|$))/si);
      const challengesText = challengesMatch ? challengesMatch[1].trim() : "";
      const challenges = challengesText.split('\n').filter(s => s.trim()).map(s => s.replace(/^[-•*\d+\.]\s*/, '').trim()).filter(s => s.length > 0);

      // Extract recommendations - more flexible
      const recommendationsMatch = response.match(/(?:Recommendations:?|Advice:?|Suggestions:?)(.*?)(?=$)/si);
      const recommendationsText = recommendationsMatch ? recommendationsMatch[1].trim() : "";
      const recommendations = recommendationsText.split('\n').filter(s => s.trim()).map(s => s.replace(/^[-•*\d+\.]\s*/, '').trim()).filter(s => s.length > 0);

      const result = {
        score: Math.min(10, Math.max(0, score)),
        analysis: analysis || response.substring(0, 300) || "Compatibility analysis generated successfully.",
        strengths: strengths.length > 0 ? strengths.slice(0, 3) : ["Good planetary alignment", "Compatible moon signs"],
        challenges: challenges.length > 0 ? challenges.slice(0, 3) : ["Minor timing considerations"],
        recommendations: recommendations.length > 0 ? recommendations.slice(0, 3) : ["Focus on communication", "Build trust gradually"]
      };
      
      console.log('Parsed result:', result); // Debug log
      return result;
    } catch (error) {
      console.error("Error parsing response:", error);
      console.log('Falling back to default data due to parsing error');
      return {
        score: 7.5,
        analysis: response || "Unable to generate detailed analysis at this moment.",
        strengths: ["Good planetary alignment", "Compatible moon signs"],
        challenges: ["Minor timing considerations"],
        recommendations: ["Focus on communication", "Build trust gradually"]
      };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Moderate";
    return "Challenging";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-white/70">Analyzing compatibility...</p>
        </div>
      </div>
    );
  }

  if (error || !compatibility || !selectedPerson) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
            <p className="text-white/70 mb-6">{error || "Unable to generate compatibility analysis"}</p>
            <Button onClick={() => navigate("/compatibility")}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-10">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/compatibility")}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold">Compatibility Results</h1>
        </div>

        {/* Score Card - Now shows score out of 10 */}
        <Card className="p-6 sm:p-8 bg-card/40 backdrop-blur border border-white/10 rounded-2xl mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-pink-400" />
              <h2 className="text-2xl font-bold">Compatibility Score</h2>
            </div>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(compatibility.score)}`}>
              {compatibility.score}/10
            </div>
            <div className="text-lg text-white/80 mb-4">{getScoreLabel(compatibility.score)}</div>
            <div className="text-sm text-white/60">
              Your compatibility with {selectedPerson.name} for {matchType}
            </div>
          </div>
        </Card>

        {/* Analysis */}
        <Card className="p-6 sm:p-8 bg-card/40 backdrop-blur border border-white/10 rounded-2xl mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Overall Analysis
          </h3>
          <p className="text-white/90 leading-relaxed">
            {compatibility.analysis}
          </p>
        </Card>

        {/* Strengths */}
        <Card className="p-6 sm:p-8 bg-card/40 backdrop-blur border border-white/10 rounded-2xl mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {compatibility.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                <span className="text-white/90">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Challenges */}
        <Card className="p-6 sm:p-8 bg-card/40 backdrop-blur border border-white/10 rounded-2xl mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            Areas to Work On
          </h3>
          <ul className="space-y-2">
            {compatibility.challenges.map((challenge, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                <span className="text-white/90">{challenge}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 sm:p-8 bg-card/40 backdrop-blur border border-white/10 rounded-2xl mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-400">
            <Star className="w-5 h-5" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {compatibility.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                <span className="text-white/90">{recommendation}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/compatibility")}>
            Compare with Someone Else
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityResult;
