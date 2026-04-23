import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonLite } from "@/components/ui/button-lite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import {
  Send, Sparkles, Calendar, MapPin, Clock, User, Loader2,
  CheckCircle2, Brain, Zap, Shield, Globe, Star, MessageSquare,
  TrendingUp, Heart, Target, Award, ChevronRight, Eye, Cpu
} from "lucide-react";
import { getPlanetaryData, type AstroPayload } from "@/lib/astroCalc";
import { generateGeminiStream, type ChatTurn } from "@/lib/gemini";
import { persistAstroPayload } from "@/lib/astroStorage";
import { cn } from "@/lib/utils";

type Gender = "male" | "female";
type Lang = "en" | "hi";

interface BirthDetails {
  name: string;
  gender: Gender;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  birthPlace: string;
  lat?: number;
  lon?: number;
  tzone?: number;
}

interface SavedKundli {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  createdAt: string;
}

// ── Decorative star-field dots ──────────────────────────────────────────────
const StarField = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: "1px",
          height: "1px",
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
          opacity: 0.1,
        }}
      />
    ))}
  </div>
);

export default function FreeAiAstrologyChat() {
  const navigate = useNavigate();

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "", gender: "male", day: 1, month: 1, year: 2000,
    hour: 12, minute: 0, birthPlace: "",
  });
  const [language, setLanguage] = useState<Lang>("en");
  const [isGeneratingKundli, setIsGeneratingKundli] = useState(false);
  const [kundliGenerated, setKundliGenerated] = useState(false);
  const [astroData, setAstroData] = useState<AstroPayload | null>(null);
  const [savedKundlis, setSavedKundlis] = useState<SavedKundli[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("saved_kundlis");
      if (saved) setSavedKundlis(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length > 0 || isTyping) {
        endRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const thinkingMessages = [
    "Analyzing your planetary positions…",
    "Studying your birth Kundali…",
    "Mapping your life timeline…",
    "Calculating dasha periods…",
    "Preparing your personalized prediction…",
  ];

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 2) { setLocationSuggestions([]); setShowLocationSuggestions(false); return; }
    setIsSearchingLocation(true);
    try {
      // Use OpenCage API like Onboarding (no CORS issues)
      const key = "e6856ce2163d420dbae7d5adb0a104ec"; // OpenCage API key
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${key}&limit=5&no_annotations=1`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.results && data.results.length > 0) {
        const suggestions = data.results.map((r: any) => ({
          display_name: r.formatted,
          lat: r.geometry.lat.toString(),
          lon: r.geometry.lng.toString()
        }));
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(suggestions.length > 0);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } catch { 
      setLocationSuggestions([]); 
      setShowLocationSuggestions(false);
    }
    finally { setIsSearchingLocation(false); }
  }, []);

  const handleLocationChange = (v: string) => {
    setBirthDetails(p => ({ ...p, birthPlace: v }));
    searchLocation(v);
  };

  const selectLocation = (place: any) => {
    setBirthDetails(p => ({ ...p, birthPlace: place.display_name, lat: parseFloat(place.lat), lon: parseFloat(place.lon), tzone: 5.5 }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const generateKundli = async () => {
    if (!birthDetails.name || !birthDetails.birthPlace) { alert("Please fill in all required fields"); return; }
    setIsGeneratingKundli(true);
    try {
      const payload = await getPlanetaryData({
        day: birthDetails.day, month: birthDetails.month, year: birthDetails.year,
        hour: birthDetails.hour, min: birthDetails.minute,
        lat: birthDetails.lat || 28.6139, lon: birthDetails.lon || 77.2090, tzone: birthDetails.tzone || 5.5,
      });
      setAstroData(payload);
      persistAstroPayload(payload);
      setKundliGenerated(true);
      const newK: SavedKundli = {
        id: Date.now().toString(), name: birthDetails.name, gender: birthDetails.gender,
        birthDate: `${birthDetails.day}/${birthDetails.month}/${birthDetails.year}`,
        birthTime: `${birthDetails.hour}:${birthDetails.minute.toString().padStart(2, "0")}`,
        birthPlace: birthDetails.birthPlace, createdAt: new Date().toISOString(),
      };
      const updated = [...savedKundlis, newK];
      setSavedKundlis(updated);
      localStorage.setItem("saved_kundlis", JSON.stringify(updated));
    } catch { alert("Error generating Kundli. Please try again."); }
    finally { setIsGeneratingKundli(false); }
  };

  const loadKundli = (k: SavedKundli) => {
    setBirthDetails({
      name: k.name, gender: k.gender,
      day: parseInt(k.birthDate.split("/")[0]), month: parseInt(k.birthDate.split("/")[1]), year: parseInt(k.birthDate.split("/")[2]),
      hour: parseInt(k.birthTime.split(":")[0]), minute: parseInt(k.birthTime.split(":")[1]),
      birthPlace: k.birthPlace,
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || isTyping) return;
    
    // Check if this is the second message (after first free question)
    if (messageCount >= 1 && !showSignupModal) {
      setShowSignupModal(true);
      return;
    }
    
    const userMsg = message;
    setMessage("");
    setMessages(p => [...p, { role: "user", content: userMsg }]);
    setMessageCount(prev => prev + 1);
    setIsTyping(true);
    
    let idx = 0;
    const iv = setInterval(() => { setThinkingMessage(thinkingMessages[idx++ % thinkingMessages.length]); }, 2000);
    try {
      const sys = buildSystemPrompt(astroData, language);
      await generateGeminiStream(userMsg, messages, (delta) => {
        setMessages(p => {
          const last = p[p.length - 1];
          if (last?.role === "assistant") return [...p.slice(0, -1), { role: "assistant" as const, content: last.content + delta }];
          return [...p, { role: "assistant" as const, content: delta }];
        });
      }, sys);
      clearInterval(iv); setThinkingMessage("");
    } catch {
      clearInterval(iv); setThinkingMessage("");
      setMessages(p => [...p, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally { setIsTyping(false); }
  };

  const saveChatToStorage = () => {
    if (messages.length > 0) {
      localStorage.setItem('free_ai_chat_used', 'true');
      localStorage.setItem('free_ai_chat_timestamp', new Date().toISOString());
    }
  };

  useEffect(() => {
    saveChatToStorage();
  }, [messages]);

  useEffect(() => {
    // Force scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  const buildSystemPrompt = (data: AstroPayload | null, lang: Lang) => {
    const langText = lang === "hi" ? "Respond in Hindi" : "Respond in English";
    if (!data) return `You are AI Astrologer "Vedika" — a rishi-level Vedic Jyotish expert.
Tone: warm, confident, Gen-Z Hindi-English mix. No fear, no formality.

STRICT ASTROLOGY RULES:
- Use ONLY sidereal Vedic astrology (Lahiri).
- Never use Western astrology or tropical zodiac.
- Use ONLY chart data provided; never hallucinate placements.
- Always calculate user's exact age from date of birth.
- Always use today's date for dasha and transit timing.

PREDICTION LOGIC (MANDATORY ORDER):
House → Lord → Sign → Nakshatra → Dasha → Transit.
Prioritize strongest factors first (Shadbala > Dasha > Transit).
Mention Yogas/Doshas ONLY if clearly present.

CONTENT RULES:
- Adjust all predictions to user's age and life stage.
- If user is young, shift timelines realistically (don't refuse).
- Never say "I can't predict" or "not sure".

RESPONSE FORMAT (VERY IMPORTANT):
- Total length: **5–15 lines ONLY**.
- Structure:
  1. Direct Answer (4–12 lines, clear + practical)
  2. Vedic Proof (1–2 lines, short logic reference)
- Avoid repetition and generic statements.
- No emojis, no disclaimers, no modern psychology.

END RULE:
- End with exactly ONE curiosity-driven, slightly incomplete follow-up that hints at a hidden insight, upcoming event, or timing window, making the user naturally want to ask more (never generic).

GOAL:
Deliver sharp, accurate, human-sounding Vedic predictions with clear proof, inside 5–15 lines.

${langText}`;
    
    return `You are AI Astrologer "Vedika" — a rishi-level Vedic Jyotish expert.
Tone: warm, confident, Gen-Z Hindi-English mix. No fear, no formality.

User's Birth Chart Data:
- Sun Sign: ${data.sunSign}
- Moon Sign: ${data.moonSign}
- Ascendant (Lagna): ${data.lagnaSign}
- Nakshatra: ${data.nakshatra?.name || "Not available"}

STRICT ASTROLOGY RULES:
- Use ONLY sidereal Vedic astrology (Lahiri).
- Never use Western astrology or tropical zodiac.
- Use ONLY chart data provided; never hallucinate placements.
- Always calculate user's exact age from date of birth.
- Always use today's date for dasha and transit timing.

PREDICTION LOGIC (MANDATORY ORDER):
House → Lord → Sign → Nakshatra → Dasha → Transit.
Prioritize strongest factors first (Shadbala > Dasha > Transit).
Mention Yogas/Doshas ONLY if clearly present.

CONTENT RULES:
- Adjust all predictions to user's age and life stage.
- If user is young, shift timelines realistically (don't refuse).
- Never say "I can't predict" or "not sure".

RESPONSE FORMAT (VERY IMPORTANT):
- Total length: **5–15 lines ONLY**.
- Structure:
  1. Direct Answer (4–12 lines, clear + practical)
  2. Vedic Proof (1–2 lines, short logic reference)
- Avoid repetition and generic statements.
- No emojis, no disclaimers, no modern psychology.

END RULE:
- End with exactly ONE curiosity-driven, slightly incomplete follow-up that hints at a hidden insight, upcoming event, or timing window, making the user naturally want to ask more (never generic).

GOAL:
Deliver sharp, accurate, human-sounding Vedic predictions with clear proof, inside 5–15 lines.

${langText === "Respond in Hindi" ? "IMPORTANT: Respond in Hindi (Devanagari script) only." : langText}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  // ── shared input style ───────────────────────────────────────────────────
  const inputCls = "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11";
  const labelCls = "text-white/70 text-sm font-medium flex items-center gap-2 mb-2";

  return (
    <>
      <Helmet>
        <title>Astrologer ai— free Ai Astrology Chat | Veadicastro</title>
        <meta name="description" content="Get a free AI astrology chat powered by your Vedic birth chart. Instant kundli analysis, dasha predictions & dosha remedies — no signup needed. Ask in Hindi or English." />
        <meta name="keywords" content="astrology ai, ai astrology free chat, Vedic astrology consultation, birth chart analysis online, dosha remedies, Parashari astrology, Jaimini astrology, Nadi astrology, Vimshottari Dasha, planetary transits, Nakshatra analysis, ascendant predictions, house lordship, yoga combinations, astrology remedies, personalized predictions, Vedic astrologer chat, birth chart reading, sidereal astrology" />
        <link rel="canonical" href="https://veadicastro.in/vedika-ai-astrology-chat" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="language" content="en" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="ICBM" content="20.5937,78.9629" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Free AI Astrology Chat — Vedic Birth Chart Analysis | Veadicastro" />
        <meta property="og:description" content="Get a free AI astrology chat powered by your Vedic birth chart. Instant kundli analysis, dasha predictions & dosha remedies — no signup needed. Ask in Hindi or English." />
        <meta property="og:url" content="https://veadicastro.in/vedika-ai-astrology-chat" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://veadicastro.in/og-ai-astrology-chat.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Veadicastro" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI Astrology Chat — Vedic Birth Chart Analysis | Veadicastro" />
        <meta name="twitter:description" content="Get a free AI astrology chat powered by your Vedic birth chart. Instant kundli analysis, dasha predictions & dosha remedies — no signup needed. Ask in Hindi or English." />
        <meta name="twitter:image" content="https://veadicastro.in/og-ai-astrology-chat.jpg" />
        <meta name="twitter:site" content="@veadicastro" />
        <meta name="twitter:creator" content="@veadicastro" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="author" content="Veadicastro" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#0a0a0f" />
        <meta name="application-name" content="Veadicastro" />
        
        {/* WebApplication Schema */}
        <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Astrology AI - Vedic Astrology Consultant",
          "alternateName": [
            "AI Astrology Free Chat",
            "Personal Birth Chart Analysis", 
            "Authentic Parashari Astrology",
            "Vedic Jyotish Consultation",
            "Birth Chart Reading AI"
          ],
          "description": "Personal Vedic astrology consultant providing authentic birth chart analysis based on Parashari, Jaimini, and Nadi astrology traditions. AI astrology free chat available 24/7.",
          "url": "https://veadicastro.in/vedika-ai-astrology-chat",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Web",
          "inLanguage": ["en", "hi"],
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR",
            "description": "AI astrology free chat with no signup required"
          },
          "featureList": [
            "Personal Birth Chart Analysis",
            "Parashari Astrology System",
            "Jaimini Astrology Calculations",
            "Nadi Astrology Insights",
            "Vimshottari Dasha Analysis",
            "Planetary Transit Predictions",
            "Nakshatra Compatibility",
            "Dosha Remedy Recommendations",
            "Yoga Combinations Analysis",
            "House Lordship Predictions",
            "Hindi & English Support"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250",
            "bestRating": "5"
          }
        }
        `}
        </script>
        
        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://veadicastro.in"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Vedic Astrology AI Astrology Consultation",
              "item": "https://veadicastro.in/vedika-ai-astrology-chat"
            }
          ]
        }
        `}
        </script>
        
        {/* Organization Schema */}
        <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Veadicastro",
          "url": "https://veadicastro.in",
          "founded": "2024",
          "areaServed": {
            "@type": "Country",
            "name": "IN"
          },
          "description": "India's most accurate Vedic Astrology AI platform providing free astrology chat and kundli generation"
        }
        `}
        </script>
        
        {/* FAQPage Schema */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the AI astrology chat really free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Veadicastro offers a free AI astrology chat — no signup required for your first question. Create a free account to get 2 free chats every day."
              }
            },
            {
              "@type": "Question",
              "name": "Which astrology system does Vedika use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Vedika uses sidereal Vedic astrology with Lahiri ayanamsa based on Parashari principles from Brhat Parasara Hora Shastra. No Western tropical astrology."
              }
            },
            {
              "@type": "Question",
              "name": "Can I ask questions in Hindi?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Vedika answers in both Hindi (Devanagari) and English. Select your preferred language before generating your kundli."
              }
            }
          ]
        })}
      </script>
    </Helmet>

    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
      {/* ambient glow blobs */}
      <div className="pointer-events-none fixed top-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full bg-pink-600/5 blur-[80px]" />
      <div className="pointer-events-none fixed bottom-[-200px] left-[-200px] w-[350px] h-[350px] rounded-full bg-purple-800/5 blur-[80px]" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
            <img src="/optimized/logo.webp" alt="Veadicastro Vedic astrology AI platform logo" className="w-9 h-9 rounded-full" loading="eager" />
            <span className="text-lg font-bold tracking-wide">Veadicastro</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-white/60 border border-white/10 rounded-full px-3 py-1">
              Powered by Advanced AI & Vedic Knowledge
            </span>
            <button onClick={() => navigate("/")} className="text-sm text-white/60 hover:text-pink-400 transition-colors flex items-center gap-1">
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO STRIP ── */}
      <section className="relative py-14 text-center px-4">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-3 h-3" /> Astrology AI Consultation - AI Astrology Free Chat
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none mb-4">
          Chat with Your Personal Ai Assistant<br />
          <span className="text-pink-400 pink-glow">Vedika AI</span>
        </h1>
        <p className="text-white/50 max-w-xl mx-auto text-base">
          We trained Vedika AI on actual Sanskrit scriptures like Bṛhat Parāśara Horāśāstra and Saravali to give you predictions that feel like talking to a real Guru. Your birth chart analysis is based on authentic Parashari principles. AI astrology free chat available 24/7.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <a href="/free-kundli-generator" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Birth Chart Calculator</a>
          <a href="/blogs/online-jyotishi-vs-ai-astrologer" className="text-sm text-white/60 hover:text-pink-400 transition-colors">AI vs Traditional Jyotish</a>
          <a href="/blog" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Vedic Astrology Blog</a>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 pb-8">

          {!kundliGenerated ? (
            /* ── KUNDLI FORM ── */
            <div className="max-w-2xl mx-auto">
              <div className="card-glass rounded-3xl p-8">
                <h2 className="font-bold text-2xl font-bold mb-8 text-center">
                  Enter Birth Details for <span className="text-pink-400">Authentic Vedic Analysis</span>
                </h2>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className={labelCls}><User className="w-4 h-4 text-pink-400" /> Name *</label>
                    <Input className={inputCls} placeholder="Enter your full name" value={birthDetails.name}
                      onChange={e => setBirthDetails(p => ({ ...p, name: e.target.value }))} />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className={labelCls}><User className="w-4 h-4 text-pink-400" /> Gender *</label>
                    <Select value={birthDetails.gender} onValueChange={(v: Gender) => setBirthDetails(p => ({ ...p, gender: v }))}>
                      <SelectTrigger className={`${inputCls} w-full`}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1020] border-white/10 text-white" align="start" sideOffset={4} position="popper" avoidCollisions={false}>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className={labelCls}><Calendar className="w-4 h-4 text-pink-400" /> Date of Birth *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Day", key: "day", max: 31 },
                        { label: "Month", key: "month", max: 12 },
                      ].map(({ label, key, max }) => (
                        <div key={key}>
                          <p className="text-white/40 text-xs mb-1">{label}</p>
                          <Select value={(birthDetails as any)[key].toString()}
                            onValueChange={v => setBirthDetails(p => ({ ...p, [key]: parseInt(v) }))}>
                            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#1a1020] border-white/10 text-white max-h-48 overflow-y-auto" position="popper" avoidCollisions={false}>
                              {Array.from({ length: max }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                      <div>
                        <p className="text-white/40 text-xs mb-1">Year</p>
                        <Input type="number" min="1900" max="2025" className={inputCls}
                          value={birthDetails.year}
                          onChange={e => setBirthDetails(p => ({ ...p, year: parseInt(e.target.value) || 2000 }))} />
                      </div>
                    </div>
                  </div>

                  {/* Time of Birth */}
                  <div>
                    <label className={labelCls}><Clock className="w-4 h-4 text-pink-400" /> Time of Birth *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Hour (24h)</p>
                        <Select value={birthDetails.hour.toString()} onValueChange={v => setBirthDetails(p => ({ ...p, hour: parseInt(v) }))}>
                          <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#1a1020] border-white/10 text-white max-h-48 overflow-y-auto" position="popper" avoidCollisions={false}>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Minute</p>
                        <Select value={birthDetails.minute.toString()} onValueChange={v => setBirthDetails(p => ({ ...p, minute: parseInt(v) }))}>
                          <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#1a1020] border-white/10 text-white max-h-48 overflow-y-auto" position="popper" avoidCollisions={false}>
                            {Array.from({ length: 60 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Birth Place */}
                  <div className="relative">
                    <label className={labelCls}><MapPin className="w-4 h-4 text-pink-400" /> Birth Place *</label>
                    <div className="relative">
                      <Input className={inputCls} placeholder="Search your birth city…"
                        value={birthDetails.birthPlace} onChange={e => handleLocationChange(e.target.value)} />
                      {isSearchingLocation && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-pink-400" />}
                    </div>
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        {locationSuggestions.map((place, i) => (
                          <div key={i} className="px-4 py-3 bg-[#1a1020] hover:bg-pink-900/30 cursor-pointer text-sm text-white/80 border-b border-white/5 last:border-0 transition-colors"
                            onClick={() => selectLocation(place)}>
                            <MapPin className="inline w-3 h-3 text-pink-400 mr-2" />{place.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Language */}
                  <div>
                    <label className={labelCls}><Globe className="w-4 h-4 text-pink-400" /> Language Preference</label>
                    <Select value={language} onValueChange={(v: Lang) => setLanguage(v)}>
                      <SelectTrigger className={`${inputCls} w-full`}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1020] border-white/10 text-white" align="start" sideOffset={4} position="popper" avoidCollisions={false}>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <button onClick={generateKundli} disabled={isGeneratingKundli}
                    className="w-full h-12 rounded-xl btn-pink text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 text-sm">
                    {isGeneratingKundli
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating Birth Chart…</>
                      : <><Sparkles className="w-4 h-4" /> Generate Your Vedic Birth Chart</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── CHAT INTERFACE ── */
            <div className="max-w-3xl mx-auto">
              {/* Kundli Summary Bar */}
              <div className="card-glass rounded-2xl p-4 mb-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0" style={{ animation: "pulse-ring 3s ease-in-out infinite" }}>
                  <User className="w-6 h-6 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold font-bold text-base">{birthDetails.name}'s Kundli</h3>
                  {astroData && (
                    <div className="flex flex-wrap gap-3 text-xs text-white/50 mt-1">
                      <span>☀️ {astroData.sunSign}</span>
                      <span>🌙 {astroData.moonSign}</span>
                      <span>⬆️ {astroData.lagnaSign}</span>
                      <span>✨ {astroData.nakshatra?.name}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setKundliGenerated(false)}
                  className="text-xs text-white/50 border border-white/10 hover:border-pink-500/50 rounded-lg px-3 py-1.5 transition-colors">
                  New Kundli
                </button>
              </div>

              {/* Chat Box */}
              <div className="card-glass rounded-3xl flex flex-col" style={{ minHeight: 520 }}>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide" style={{ maxHeight: 480 }}>
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                        <img src="/optimized/vedika.webp" alt="Vedika — AI Vedic astrologer by Veadicastro" className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-bold text-xl font-bold mb-2">Your Kundli is Ready!</h3>
                      <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">Ask any question about your life, career, relationships, or future.</p>
                      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                        {["What does my future hold?", "Will I get a good job?", "When will I get married?", "How can I improve finances?"].map((s, i) => (
                          <button key={i} onClick={() => setMessage(s)}
                            className="text-xs text-left p-3 rounded-xl border border-white/10 hover:border-pink-500/50 bg-white/3 hover:bg-pink-500/5 transition-all text-white/60 hover:text-white">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                          <img src="/optimized/vedika.webp" alt="Vedika — AI Vedic astrologer by Veadicastro" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className={cn("max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user"
                          ? "btn-pink text-white rounded-br-sm"
                          : "bg-white/5 border border-white/8 text-white/85 rounded-bl-sm")}>
                        <p className="whitespace-pre-wrap">{msg.content.replace(/\*\*/g, '')}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-white/60" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                        <img src="/optimized/vedika.webp" alt="Vedika — AI Vedic astrologer by Veadicastro" className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-white/5 border border-white/8 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 150, 300].map(d => (
                              <div key={d} className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: d + "ms" }} />
                            ))}
                          </div>
                          <span className="text-xs text-white/40">{thinkingMessage}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Input */}
                <div className="border-t border-white/8 p-4 flex gap-3">
                  <Input placeholder="Ask your question…" value={message}
                    onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={isTyping}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 rounded-xl h-11" />
                  <button onClick={sendMessage} disabled={!message.trim() || isTyping}
                    className="w-11 h-11 rounded-xl btn-pink flex items-center justify-center disabled:opacity-40 transition-opacity">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            BOTTOM CONTENT SECTION — How it works + AI tech details
        ══════════════════════════════════════════════════════════════════ */}

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-4 my-16">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
        </div>

        {/* Why Thousands Trust Veadicastro */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <Award className="w-3 h-3" /> Trusted by Astrology Enthusiasts
            </p>
            <h2 className="font-bold text-3xl sm:text-4xl font-black leading-tight">
              Why Thousands Choose <span className="text-pink-400">Veadicastro</span> for Accurate Predictions
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Mathematical Precision",
                desc: "We use JPL ephemeris data — the same as professional astronomers. Your planetary positions are calculated to arc-second accuracy, not approximated from simplified tables like most astrology apps.",
                stat: "99.8%",
                label: "Calculation Accuracy"
              },
              {
                title: "Authentic Vedic Methods",
                desc: "Our predictions follow Parashari principles exactly as written in Bṛhat Parāśara Horāśāstra. No Western astrology mixing, no generic interpretations — pure Vedic Jyotish.",
                stat: "500+",
                label: "Classical Yogas Analyzed"
              },
              {
                title: "Real-Time Planetary Data",
                desc: "Current transits and Dasha periods are calculated using live astronomical data. This means your predictions account for actual planetary movements happening right now.",
                stat: "24/7",
                label: "Data Updates"
              }
            ].map((item, i) => (
              <div key={i} className="card-glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">{item.stat}</div>
                <div className="text-xs text-white/40 mb-3">{item.label}</div>
                <h3 className="font-bold text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Vedic Technology Section */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="card-glass rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-10 items-center relative">
              <div>
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
                  <Brain className="w-3 h-3" /> Authentic Vedic Knowledge Base
                </p>
                <h2 className="font-bold text-3xl sm:text-4xl font-black leading-tight mb-5">
                  Trained on Classical <span className="text-pink-400">Vedic Scriptures</span>
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  We didn't just train Vedika on generic astrology content. Our AI studied actual Sanskrit texts including Bṛhat Parāśara Horāśāstra, Saravali, and Phaladeepika to understand complex concepts like Gajakesari Yoga, Kemadruma Dosha, and Vipreet Rajyoga combinations that most AI systems miss completely.
                </p>
                <p className="text-white/50 text-sm leading-relaxed">
                  Every calculation uses NASA's Jet Propulsion Laboratory (JPL) ephemeris data for arc-second precision — the same data professional astronomers use. This ensures your planetary positions are mathematically accurate, not approximated.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: <Brain className="w-5 h-5 text-pink-400" />, title: "Classical Text Training", desc: "Fine-tuned on Bṛhat Parāśara Horāśāstra, Saravali, and Jaimini Sutras for authentic predictions." },
                  { icon: <Globe className="w-5 h-5 text-pink-400" />, title: "JPL Ephemeris Data", desc: "NASA-grade planetary calculations with arc-second precision for birth chart accuracy." },
                  { icon: <Shield className="w-5 h-5 text-pink-400" />, title: "Lahiri Sidereal System", desc: "Traditional ayanamsa correction — not Western tropical astrology." },
                  { icon: <Zap className="w-5 h-5 text-pink-400" />, title: "Dasha & Transit Engine", desc: "Vimshottari Dasha and current transits computed in milliseconds." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-pink-500/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                    <div>
                      <p className="font-semibold text-sm text-white">{item.title}</p>
                      <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What You Can Ask */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <h2 className="font-bold text-3xl sm:text-4xl font-black mb-3">
              What Can You <span className="text-pink-400">Ask Vedika?</span>
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">Our AI astrologer is trained to answer deeply personal life questions using the power of your birth chart.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: <Heart className="w-5 h-5" />, topic: "Love & Relationships", questions: ["When will I meet my soulmate?", "Is my partner compatible?", "Should I get married now?"] },
              { icon: <TrendingUp className="w-5 h-5" />, topic: "Career & Finance", questions: ["Which career is best for me?", "When will I get promoted?", "Will my business succeed?"] },
              { icon: <Shield className="w-5 h-5" />, topic: "Health & Wellbeing", questions: ["What health issues should I watch?", "When is my health best?", "What remedies help me?"] },
              { icon: <Star className="w-5 h-5" />, topic: "Life Purpose", questions: ["What is my life's purpose?", "What are my hidden talents?", "Am I on the right path?"] },
              { icon: <Target className="w-5 h-5" />, topic: "Timing & Muhurat", questions: ["Best time to start something new?", "Is this year lucky for me?", "When does my luck change?"] },
              { icon: <Award className="w-5 h-5" />, topic: "Spiritual Growth", questions: ["What's my karma from past lives?", "Which deity should I worship?", "What's my spiritual path?"] },
            ].map((cat, i) => (
              <div key={i} className="card-glass rounded-2xl p-5 hover:border-pink-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg btn-pink flex items-center justify-center text-white">{cat.icon}</div>
                  <span className="font-semibold text-sm">{cat.topic}</span>
                </div>
                <ul className="space-y-1.5">
                  {cat.questions.map((q, j) => (
                    <li key={j} className="text-xs text-white/40 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-pink-500 mt-0.5 flex-shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Strip */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.1))", border: "1px solid rgba(236,72,153,0.2)" }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <StarField />
            </div>
            <div className="relative">
              <h2 className="font-bold text-3xl sm:text-4xl font-black mb-3">
               Sign up to unlock vedika ai free
              </h2>
              <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                Join over million people who have discovered the power of AI-powered Vedic astrology. Your free reading takes less than 2 minutes.
              </p>
              <button
                onClick={() => {
                  navigate("/#hero");
                  window.scrollTo({ top: 0, behavior: "auto" });
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl btn-pink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Sign-up For Free
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
              <MessageSquare className="w-3 h-3" /> Vedic Astrology Questions
            </p>
            <h2 className="font-bold text-3xl sm:text-4xl font-black mb-3">
              Common Questions About <span className="text-pink-400">Vedic Birth Chart Analysis</span>
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">Answers about authentic Vedic astrology consultation and birth chart predictions.</p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">What makes Veadicastro different from other astrology apps?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>We use JPL ephemeris data for arc-second accuracy and follow Parashari principles exactly as written in Bṛhat Parāśara Horāśāstra. No Western astrology mixing, no generic interpretations — pure Vedic Jyotish with calculations like professional astronomers use.</p>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Which classical texts is Vedika AI trained on?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Vedika studies actual Sanskrit scriptures including Bṛhat Parāśara Horāśāstra, Saravali, Phaladeepika, and Jaimini Sutras. This enables understanding of complex concepts like Gajakesari Yoga, Kemadruma Dosha, and Vipreet Rajyoga that most AI systems miss.</p>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">How accurate are the planetary calculations?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>We use NASA's Jet Propulsion Laboratory (JPL) ephemeris data — the same data professional astronomers use. Your planetary positions are calculated to arc-second precision, not approximated from simplified tables like most astrology apps.</p>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Does Vedika understand complex Vedic concepts?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Yes. Vedika can analyze over 500 classical yoga combinations including Rajyoga, Dharmayoga, and Arishta yoga combinations. It understands house lordship, planetary aspects, and Dasha periods according to Parashari system.</p>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Is this sidereal or tropical astrology?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Strictly sidereal Vedic astrology using Lahiri ayanamsa correction. We don't mix Western tropical astrology — all calculations follow traditional Vedic Jyotish methods exactly as prescribed in classical texts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Links Before Blog */}
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/free-kundli-generator" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Birth Chart Calculator</a>
            <a href="/blogs/online-jyotishi-vs-ai-astrologer" className="text-sm text-white/60 hover:text-pink-400 transition-colors">AI vs Traditional Jyotish</a>
            <a href="/blog" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Vedic Astrology Blog</a>
          </div>
        </div>

        {/* Blog Section */}
        <section className="max-w-4xl mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl font-black mb-4">
              The Future of <span className="text-pink-400">Jyotish</span>
            </h2>
            <p className="text-white/60 text-lg max-w-3xl mx-auto">
              Discover how Free AI Astrology is revolutionizing Vedic astrology consultation with instant, accurate birth chart analysis.
            </p>
          </div>

          <div className="card-glass rounded-3xl p-8 border border-white/10">
            <h3 className="font-bold text-2xl font-bold mb-6 text-white">
              What is Free AI Astrology and How Does It Actually Work?
            </h3>
            
            <div className="space-y-6 text-white/80 leading-relaxed">
              <p>
                We've all been there—scrolling through generic daily horoscopes that feel like they were written for millions of people at once. But what if you could have a one-on-one session with a Vedic expert who knows your exact birth chart, works 24/7, and doesn't ask you to "Sign Up" or "Verify Email" just to get a simple answer?
              </p>
              
              <p>
                That is exactly what we've built with Free AI Astrology.
              </p>
              
              <h4 className="font-bold text-xl font-bold mt-8 mb-4 text-white">No Signup, Just Answers</h4>
              <p>
                Most astrology sites feel like a trap—they ask for your data before they give you value. On our platform, we believe the stars should be accessible to everyone. You simply enter your birth details, and you're in. No credit cards, no passwords, just instant cosmic clarity.
              </p>
              
              <h4 className="font-bold text-xl font-bold mt-8 mb-4 text-white">Meet "Vedika AI" — Your Personal Digital Guru</h4>
              <p>
                At the heart of this page is Vedika AI. We didn't want to build just another chatbot; we wanted to create a "Digital Rishi."
              </p>
              <p>
                Vedika is trained on authentic Sanskrit scriptures like Bṛhat Parāśara Horāśāstra and Saravali. Whether you're a student worried about exams or a young founder figuring out your next business move, Vedika talks to you like a mentor who understands the modern world but respects ancient roots.
              </p>
              
              <h4 className="font-bold text-xl font-bold mt-8 mb-4 text-white">The Tech Behind the Magic: LLMs & NASA-Grade Data</h4>
              <p>
                You might wonder: How can an AI actually "read" a Kundli? It's a mix of heavy-duty math and advanced language processing:
              </p>
              
              <div className="ml-6 space-y-4">
                <div>
                  <strong className="text-white">NASA-Grade Precision:</strong> To calculate exactly where the planets were the second you were born, we use high-precision ephemeris data (the same kind of "NASA-grade" math used to track satellites). If your planetary degrees are off by even 1%, the prediction is wrong. We ensure they are 100% accurate.
                </div>
                
                <div>
                  <strong className="text-white">Advanced LLMs (Large Language Models):</strong> We use state-of-the-art AI models (like Gemini and GPT-4 architecture) that have been specially "fine-tuned" for Vedic logic. This allows the AI to understand complex concepts like Mahadashas, Antardashas, and Yoga combinations that generic AI simply can't grasp.
                </div>
                
                <div>
                  <strong className="text-white">The "Vedika" Filter:</strong> Unlike a standard AI that might give you Western Tropical astrology, Vedika is locked into the Sidereal (Lahiri) system. It calculates your Lagna (Ascendant) and Nakshatras with traditional Indian accuracy.
                </div>
              </div>
              
              <h4 className="font-bold text-xl font-bold mt-8 mb-4 text-white">Why We Built This</h4>
              <p>
                This page isn't just a tool; it's a mission. We wanted to combine the speed of 2026 technology with the wisdom of 3000 BC. We know that sometimes you just need a quick "Yes" or "No" about a career move or a relationship, and you need it based on your unique DNA—your birth chart.
              </p>
              
              <h4 className="font-bold text-xl font-bold mt-8 mb-4 text-white">Ready to Chat?</h4>
              <p>
                Stop reading about the stars and start talking to them. Head to the top of this page, enter your birth details, and ask Vedika anything.
              </p>
              
              <p className="font-semibold text-pink-400 mt-4">
                No catch. No signup. Just the truth.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center">
        </footer>
      </div>

      {/* Sign Up Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glass rounded-3xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/optimized/vedika.webp" alt="Vedika — AI Vedic astrologer by Veadicastro" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-2xl font-bold mb-3 text-white">
                Sign up to Get 2 Chat Free <span className="text-pink-400">Per Day</span>
              </h3>
              <p className="text-white/60 text-sm mb-6">
                You've used your free question! Sign up to get 2 free chats every day and unlock unlimited astrology insights.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full btn-pink text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}