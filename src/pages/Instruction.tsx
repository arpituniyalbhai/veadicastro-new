import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { generateGemini } from "@/lib/gemini";
import { persistAstroPayload } from "@/lib/astroStorage";
import { getPlanetaryData } from "@/lib/astroCalc";
import { loadMembers } from "@/lib/astroMock";
import { useI18n } from "@/context/I18nContext";
import { usePlan } from "@/context/PlanContext";

const Instruction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useI18n();
  const { planName, loading: planLoading } = usePlan();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const memberId = useMemo(() => new URLSearchParams(location.search).get("member"), [location.search]);
  
  // Cache helpers
  const getCachedContent = (type: string, memberId: string | null, language: string) => {
    try {
      const key = `${type}_${memberId || 'user'}_${language}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        // Cache for 24 hours
        if (now - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch {
      /* ignore */
    }
    return null;
  };

  const setCachedContent = (type: string, data: string, memberId: string | null, language: string) => {
    try {
      const key = `${type}_${memberId || 'user'}_${language}`;
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      /* ignore */
    }
  };
  
  const featureAllowed = planName === "Premium";
  const selectedMember = useMemo(() => {
    if (!memberId) return null;
    try {
      return loadMembers().find((m) => m.id === memberId) || null;
    } catch {
      return null;
    }
  }, [memberId]);

  const sanitizeMarkdown = (text: string) => {
    // Remove all markdown formatting while keeping content
    let out = text
      // Remove bold (both ** and ***)
      .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      // Remove italic
      .replace(/\*(.*?)\*\*/g, "$1")
      // Remove underline
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_[^_]+_/g, (m) => m.slice(1, -1))
      // Remove headers
      .replace(/^#{1,6}\s*/gm, "")
      // Remove blockquotes
      .replace(/^>\s?/gm, "")
      // Remove inline code
      .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
      // Remove strikethrough
      .replace(/~~(.*?)~~/g, "$1")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      // Remove horizontal rules
      .replace(/^---+$/gm, "")
      // Remove multiple spaces
      .replace(/\s+/g, " ")
      .trim();
    return out;
  };

  useEffect(() => {
    // Always fetch content, but show partial for Free/Standard
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Check cache first
        const cached = getCachedContent("instruction", memberId || null, lang);
        if (cached) {
          setContent(cached);
          setLoading(false);
          return;
        }
        const details = (() => {
          if (selectedMember) {
            return {
              dob: selectedMember.date,
              time: selectedMember.time,
              place: selectedMember.place,
              lat: selectedMember.lat,
              lng: selectedMember.lon,
              tzone: selectedMember.tzone,
              gender: selectedMember.gender,
            };
          }
          try {
            return JSON.parse(localStorage.getItem("onboarding_details") || "null");
          } catch {
            /* ignore */
            return null;
          }
        })();

        if (!details?.dob || !details?.time || details?.lat == null || details?.lng == null) {
          setContent("Please complete onboarding (DOB, time, and place) or add this member's details to get precise chart-based guidance.");
          setLoading(false);
          return;
        }

        // Fetch planetary data (try API, fallback to in-browser Swiss Ephemeris)
        let planetsBlock = "";
        try {
          const [y, m, d] = details.dob.split('-').map((n: string) => parseInt(n, 10));
          const [hh, mm] = details.time.split(':').map((n: string) => parseInt(n, 10));
          const tzone = typeof details.tzone === 'number' ? details.tzone : (-new Date().getTimezoneOffset() / 60);
          const body = {
            day: d,
            month: m,
            year: y,
            hour: hh,
            min: mm,
            lat: details.lat,
            lon: details.lng,
            tzone: tzone,
          };
          const payload = await getPlanetaryData(body);
          planetsBlock = `Planetary Data:\n${JSON.stringify(payload)}`;
          try {
            persistAstroPayload(payload);
          } catch {
            /* ignore */
          }
        } catch (e) {
          console.debug('[Instruction] AstrologyAPI fetch failed, trying cache.', e);
          // Try cache
          try {
            const cached = JSON.parse(localStorage.getItem('astrology_planets') || 'null');
            if (cached) planetsBlock = `Planetary Data:\n${JSON.stringify(cached)}`;
          } catch {
            /* ignore */
          }
        }

        // Build details block
        const detailsBlock = `User Details:\nDOB: ${details.dob}\nTime: ${details.time}\nPlace: ${details.place}\nLat: ${details.lat}\nLng: ${details.lng}\nTZ: ${typeof details.tzone === 'number' ? details.tzone : ''}\nGender: ${details.gender}`;

        // Build system prompt (same style as Chat.tsx) with language support
        const langInstruction = lang === "hi" 
          ? "CRITICAL: You MUST respond ONLY in pure Hindi (Devanagari script). Do NOT use any English words, Hinglish, or mixed language. Write everything in complete Hindi sentences using Devanagari script. Never use English words - always use Hindi equivalents. If you use any English words, the response is incorrect. Respond entirely in Hindi Devanagari script only."
          : "Respond in English.";
        
        const systemBlock = `You are an expert Vedic astrologer. Use the following planetary data to interpret the user's birth chart accurately. Keep responses practical and compassionate.

${langInstruction}

${planetsBlock || 'Planetary Data: (not available)'}

${detailsBlock}

Provide "Instruction for 2026" that includes:
1. Life purpose and soul mission for 2026 based on their chart
2. Natural talents and strengths to leverage in 2026
3. Challenges to overcome and how to handle them in 2026
4. Best career paths aligned with their astrological profile for 2026
5. Relationship dynamics and compatibility insights for 2026
6. Daily practices and rituals for spiritual alignment in 2026
7. Decision-making guidance for major life choices in 2026

Focus ONLY on guidance for the year 2026. Do not provide general life instructions or guidance beyond 2026. Keep the response between 300-400 words, inspiring, and deeply insightful. Use Sanskrit terms where appropriate. Output must be plain text only. Do not use Markdown, bold, italics, bullets, asterisks, hyphens, numbered lists, quotes, or decorative symbols.`.trim();

        const promptText = lang === "hi" 
          ? "मेरी जन्म कुंडली और ग्रहों की स्थिति के आधार पर, 2026 के लिए मेरे व्यक्तिगत जीवन निर्देश प्रदान करें।"
          : `Based on my birth chart and planetary positions, provide my personalized 2026 Life Instruction.`;

        // Call Gemini API through backend
        const response = await generateGemini(promptText, [], systemBlock);
        const finalContent = sanitizeMarkdown(response || (lang === "hi" 
          ? "इस समय आपके जीवन निर्देश उत्पन्न करने में असमर्थ। कृपया बाद में पुनः प्रयास करें।"
          : "Unable to generate your life instructions at this moment. Please try again later."));
        setContent(finalContent);
        // Cache the content
        setCachedContent("instruction", finalContent, memberId || null, lang);
      } catch (error) {
        console.error("Error fetching instruction content:", error);
        setContent("Unable to load your life instructions at this moment. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedMember, memberId, lang]);

  if (planLoading) {
    return (
      <div className="min-h-screen bg-background px-4 lg:px-6 py-6 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  // Calculate preview length based on plan
  const getPreviewContent = (text: string) => {
    if (featureAllowed) return text; // Premium - full content
    if (planName === "Standard") {
      // 60% preview
      const words = text.split(/\s+/);
      const previewPoint = Math.floor(words.length * 0.6);
      return words.slice(0, previewPoint).join(" ") + "...";
    }
    // Free - 20% preview
    const words = text.split(/\s+/);
    const previewPoint = Math.floor(words.length * 0.2);
    return words.slice(0, previewPoint).join(" ") + "...";
  };

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
          <h1 className="text-3xl font-bold mb-4">See how 2026 unfolds for you?</h1>
          <p className="text-muted-foreground">
            Get personalized 2026 life instructions and guidance powered by advanced LLM analysis of your birth chart and planetary movements. This report is generated specifically for your year ahead.
          </p>
        </div>

        <Card className="p-8 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          {loading ? (
            <div className="space-y-4">
              {/* Title skeleton */}
              <div className="h-8 bg-muted/20 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-muted/20 rounded-md w-3/4 animate-pulse"></div>
              
              {/* Content skeleton lines */}
              <div className="space-y-3">
                <div className="h-4 bg-muted/20 rounded-md animate-pulse"></div>
                <div className="h-4 bg-muted/20 rounded-md animate-pulse"></div>
                <div className="h-4 bg-muted/20 rounded-md w-5/6 animate-pulse"></div>
                <div className="h-4 bg-muted/20 rounded-md animate-pulse"></div>
                <div className="h-4 bg-muted/20 rounded-md w-4/5 animate-pulse"></div>
                <div className="h-4 bg-muted/20 rounded-md animate-pulse"></div>
                <div className="h-4 bg-muted/20 rounded-md w-3/4 animate-pulse"></div>
              </div>
              
              {/* Upgrade button skeleton */}
              <div className="mt-6 h-10 bg-muted/20 rounded-lg w-32 animate-pulse"></div>
            </div>
          ) : (
            <>
              <div className="prose prose-invert max-w-none">
                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {getPreviewContent(content)}
                </div>
              </div>
            </>
          )}
        </Card>

        <div className="mt-8 p-6 rounded-xl border border-border/60 bg-background/50">
          <h3 className="font-semibold mb-2">Why this is accurate</h3>
          <p className="text-sm text-muted-foreground">
            Vedika analyzes your exact birth chart with divisional charts, ongoing Mahadasha/Antardasha,
            and present planetary transits. This multi-layer method removes guesswork and delivers
            precise, contextual life instructions for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Instruction;
