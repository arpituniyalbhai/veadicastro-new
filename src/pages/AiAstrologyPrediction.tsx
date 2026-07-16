import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  GraduationCap,
  Heart,
  HeartHandshake,
  Loader2,
  MapPin,
  Plane,
  Search,
  ShieldPlus,
  TrendingUp,
  Users,
} from "lucide-react";
import { getPlanetaryData, type AstroPayload } from "@/lib/astroCalc";
import { persistAstroPayload } from "@/lib/astroStorage";
import { useAuth } from "@/context/AuthContext";

type Gender = "male" | "female";
type Lang = "en" | "hi";
type Step = "form" | "loading" | "results";

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

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface OpenCageResult {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

interface PredictionItem {
  topic: string;
  prediction: string;
}

const inputClass =
  "h-12 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-[#d9277a] focus:ring-2 focus:ring-[#d9277a]/20";

const selectClass =
  "h-12 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none transition hover:border-white/25 focus:border-[#d9277a] focus:ring-2 focus:ring-[#d9277a]/20";

const labelClass = "space-y-2 text-sm font-medium text-white/75";

const loadingMessages = [
  "Preparing your birth details...",
  "Loading Swiss Ephemeris data...",
  "Calculating your Vedic birth chart...",
  "Reading your planetary positions...",
  "Checking your Moon sign, Lagna, and Nakshatra...",
  "Generating your 10 personal predictions...",
];

const internalLinks = [
  { label: "Free AI Astrologer", href: "/free-ai-astrologer-chat" },
  { label: "5 Minutes Astrology", href: "/free-5-minutes-astrology-ai" },
  { label: "Free Kundli Generator", href: "/free-kundli-generator" },
  { label: "AI Astrology", href: "/ai-astrology" },
  { label: "Horoscope by Date of Birth", href: "/horoscope-by-date-of-birth" },
  { label: "KundliGPT Alternative", href: "/kundligpt-alternative" },
];

const calculateAge = (day: number, month: number, year: number) => {
  const today = new Date();
  let age = today.getFullYear() - year;
  const hasBirthdayPassed =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hasBirthdayPassed) age -= 1;
  return Math.max(age, 0);
};

const getTopicIcon = (topic: string) => {
  const normalized = topic.toLowerCase();
  if (normalized.includes("career")) return <Briefcase className="h-5 w-5" />;
  if (normalized.includes("marriage") || normalized.includes("relationship")) return <HeartHandshake className="h-5 w-5" />;
  if (normalized.includes("money") || normalized.includes("finance")) return <TrendingUp className="h-5 w-5" />;
  if (normalized.includes("business")) return <Building2 className="h-5 w-5" />;
  if (normalized.includes("health")) return <ShieldPlus className="h-5 w-5" />;
  if (normalized.includes("family")) return <Users className="h-5 w-5" />;
  if (normalized.includes("travel")) return <Plane className="h-5 w-5" />;
  if (normalized.includes("education")) return <GraduationCap className="h-5 w-5" />;
  if (normalized.includes("love")) return <Heart className="h-5 w-5" />;
  if (normalized.includes("lucky") || normalized.includes("timing")) return <CalendarDays className="h-5 w-5" />;
  return <BookOpen className="h-5 w-5" />;
};

const parsePredictionJson = (text: string): PredictionItem[] => {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const jsonText = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
  try {
    const parsed = JSON.parse(jsonText) as { predictions?: PredictionItem[] };
    return Array.isArray(parsed.predictions) ? parsed.predictions.slice(0, 10) : [];
  } catch {
    const repaired = jsonText
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/}\s*{/g, "},{")
      .replace(/]\s*{/g, "],{");

    try {
      const parsed = JSON.parse(repaired) as { predictions?: PredictionItem[] };
      return Array.isArray(parsed.predictions) ? parsed.predictions.slice(0, 10) : [];
    } catch {
      const matches = Array.from(
        cleaned.matchAll(/"topic"\s*:\s*"([^"]+)"[\s\S]*?"prediction"\s*:\s*"([^"]+)"/g)
      );
      return matches.slice(0, 10).map((match) => ({
        topic: match[1],
        prediction: match[2],
      }));
    }
  }
};

const buildPrompt = (birthDetails: BirthDetails, astroData: AstroPayload, language: Lang) => {
  const calculatedAge = calculateAge(birthDetails.day, birthDetails.month, birthDetails.year);

  return `You are Vedika, a rishi-level Vedic astrology AI.

User Details:
- Name: ${birthDetails.name}
- Age: ${calculatedAge}
- Sun Sign: ${astroData.sunSign}
- Moon Sign: ${astroData.moonSign}
- Ascendant (Lagna): ${astroData.lagnaSign}
- Nakshatra: ${astroData.nakshatra?.name}
- Gender: ${birthDetails.gender}

Generate exactly 10 future predictions for this person based on their Vedic birth chart and current age.

IMPORTANT RULES:
- Make predictions age-specific. If age is 18-22, focus on education, early career, first relationships. If 23-28, focus on career growth, marriage timing, money. If 30+, focus on stability, family, business.
- Each prediction must be 2-3 lines. Direct and specific. No vague statements.
- Use real Vedic logic. Mention relevant house, planet, or dasha briefly.
- No emojis. No disclaimers. No "it depends" statements.
- Never say "I cannot predict". Always give a clear answer.

Return response in this EXACT JSON format only. No extra text:
{
  "predictions": [
    { "topic": "Career", "prediction": "..." },
    { "topic": "Marriage", "prediction": "..." },
    { "topic": "Money", "prediction": "..." },
    { "topic": "Business", "prediction": "..." },
    { "topic": "Health", "prediction": "..." },
    { "topic": "Family", "prediction": "..." },
    { "topic": "Travel", "prediction": "..." },
    { "topic": "Education", "prediction": "..." },
    { "topic": "Love Life", "prediction": "..." },
    { "topic": "Lucky Period", "prediction": "..." }
  ]
}

${language === "hi" ? "Respond in Hindi (Devanagari script)." : "Respond in English."}`;
};

export default function AiAstrologyPrediction() {
  const { setAuthOpen } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    gender: "male",
    day: 1,
    month: 1,
    year: 2000,
    hour: 12,
    minute: 0,
    birthPlace: "",
  });
  const [language, setLanguage] = useState<Lang>("en");
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  useEffect(() => {
    if (step !== "loading") return;
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setLoadingMessage(loadingMessages[Math.min(index, loadingMessages.length - 1)]);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [step]);

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const key = "e6856ce2163d420dbae7d5adb0a104ec";
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${key}&limit=5&no_annotations=1`;
      const res = await fetch(url);
      const data = await res.json();
      const suggestions = ((data?.results || []) as OpenCageResult[]).map((result) => ({
        display_name: result.formatted,
        lat: result.geometry.lat.toString(),
        lon: result.geometry.lng.toString(),
      }));
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
    } catch {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  const handleLocationChange = (value: string) => {
    setBirthDetails((prev) => ({ ...prev, birthPlace: value }));
    searchLocation(value);
  };

  const selectLocation = (place: LocationSuggestion) => {
    setBirthDetails((prev) => ({
      ...prev,
      birthPlace: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      tzone: 5.5,
    }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const generatePredictions = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!birthDetails.name.trim() || !birthDetails.birthPlace.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setPredictions([]);
    setLoadingMessage(loadingMessages[0]);
    setStep("loading");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    try {
      const payload = await getPlanetaryData({
        day: birthDetails.day,
        month: birthDetails.month,
        year: birthDetails.year,
        hour: birthDetails.hour,
        min: birthDetails.minute,
        lat: birthDetails.lat || 28.6139,
        lon: birthDetails.lon || 77.209,
        tzone: birthDetails.tzone || 5.5,
      });
      persistAstroPayload(payload);

      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
      const response = await fetch(`${API_BASE}/api/mistral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildPrompt(birthDetails, payload, language),
          history: [],
          systemExtra: "Return valid JSON only. Do not include markdown fences.",
          lang: language,
          apiKeySlot: "secondary",
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      const parsed = parsePredictionJson(String(data?.text || ""));
      if (parsed.length === 0) throw new Error("Unable to read the AI prediction response. Please try again.");

      setPredictions(parsed);
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate predictions. Please try again.");
      setStep("form");
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Astrology predictions by date of birth - No Signup | Veadicastro</title>
        <meta
          name="description"
          content="Get 10 free AI astrology predictions based on your Vedic birth chart. Career, marriage, money, health and more - personalized to your age and kundli."
        />
        <link rel="canonical" href="https://veadicastro.in/ai-astrology-prediction" />
        <script type="application/ld+json">
          {`{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI Astrology Prediction",
  "url": "https://veadicastro.in/ai-astrology-prediction"
}`}
        </script>
        <script type="application/ld+json">
          {`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AI astrology prediction?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI astrology prediction uses your date of birth, time of birth, and birth place to calculate your Vedic birth chart and create personal predictions for important life areas."
      }
    },
    {
      "@type": "Question",
      "name": "Is this AI astrology prediction tool free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, this tool is free to use. You can enter your birth details and generate ten personal Vedic astrology predictions."
      }
    },
    {
      "@type": "Question",
      "name": "Which astrology system does this tool use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This tool uses Vedic astrology with Lahiri sidereal calculations and reads your Sun sign, Moon sign, Lagna, and Nakshatra."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need exact birth time?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Exact birth time is best because it helps calculate the Lagna and house positions. If your time is approximate, the prediction can still be useful, but some timing details may change."
      }
    },
    {
      "@type": "Question",
      "name": "What predictions will I get?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You get ten predictions for career, marriage, money, business, health, family, travel, education, love life, and lucky period."
      }
    },
    {
      "@type": "Question",
      "name": "Can AI astrology predict the future?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI astrology can give future guidance by reading chart patterns, planetary positions, and Vedic timing. It should be used for clarity and planning."
      }
    }
  ]
}`}
        </script>
      </Helmet>

      <main className="min-h-screen bg-black text-white antialiased">
        <header className="border-b border-white/10 bg-[#111111]">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Veadicastro Logo" className="h-7 w-7 rounded" />
              <span className="text-sm font-semibold">Veadicastro</span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-white/55 sm:flex">
              {internalLinks.map((item) => (
                <Link key={item.href} to={item.href} className="hover:text-[#d9277a]">
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => setAuthOpen(true)}
              className="ml-4 rounded-lg bg-[#d9277a] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#c01e6a] transition-colors"
            >
              Try Free AI Astrologer
            </button>
          </div>
        </header>

        {/* Announcement Banner */}
        {/* Announcement Banner */}
<div className="mx-auto max-w-5xl px-4 py-4">
  <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4">
    <div className="absolute inset-0 opacity-20" style={{
      background: 'radial-gradient(circle at 15% 20%, rgba(251,146,60,0.3) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(239,68,68,0.3) 0%, transparent 45%)'
    }} />
    
    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      
      {/* Image + Text row — always together */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <img
            src="/amanuniyalastrologe.webp"
            alt="Acharya ji - Expert Vedic Astrologer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-500/50 shadow-lg"
          />
          <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">Live</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">SPECIAL OFFER</span>
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">Unlimited Call</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-orange-400 leading-snug">
            Talk to Best Astrologer of Uttarakhand — Acharya ji
          </h3>
          <p className="text-xs sm:text-sm text-white/70 mt-0.5">Get personalized guidance from expert Vedic astrologer.</p>
          <p className="text-xs text-green-400 mt-0.5 font-medium">Full refund if not satisfied with Acharya ji</p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => window.location.href = '/talk-to-astrologer'}
        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-bold text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200"
      >
        Book Now — Acharya Aman Uniyal Ji
      </button>
    </div>
  </div>
</div>
        <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-center px-4 py-10 sm:py-12">
          {step === "form" && (
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-8 text-center">
                <p className="text-sm font-medium text-[#d9277a]">Free Vedic Astrology Tool</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                  AI Astrology Prediction
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/60">
                  Enter your date of birth, time of birth, and birth place to generate 10 personalized Vedic predictions.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111111] shadow-2xl shadow-black/30">
                <div className="border-b border-white/10 px-5 py-5 sm:px-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Enter Birth Details</h2>
                      <p className="mt-2 text-sm leading-6 text-white/50">
                        Vedika calculates your Kundli first, then creates your personal predictions.
                      </p>
                    </div>
                    <div className="inline-flex w-fit items-center rounded-full border border-[#d9277a]/30 bg-[#d9277a]/10 px-3 py-1 text-xs font-medium text-[#d9277a]">
                      Free tool
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  {error && <p className="mb-5 rounded-md border border-[#d9277a]/40 bg-[#d9277a]/10 px-3 py-2 text-sm text-white/80">{error}</p>}

                  <form onSubmit={generatePredictions} className="space-y-6">
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase text-white/40">Personal details</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className={labelClass}>
                          <span>Name</span>
                          <input
                            value={birthDetails.name}
                            onChange={(event) => setBirthDetails((prev) => ({ ...prev, name: event.target.value }))}
                            className={inputClass}
                            placeholder="Enter your full name"
                            required
                          />
                        </label>
                        <label className={labelClass}>
                          <span>Gender</span>
                          <select
                            value={birthDetails.gender}
                            onChange={(event) => setBirthDetails((prev) => ({ ...prev, gender: event.target.value as Gender }))}
                            className={selectClass}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase text-white/40">Date of birth</p>
                      <div className="grid grid-cols-3 gap-3">
                        <label className={labelClass}>
                          <span>Day</span>
                          <input type="number" min={1} max={31} value={birthDetails.day} onChange={(event) => setBirthDetails((prev) => ({ ...prev, day: Number(event.target.value) }))} className={inputClass} />
                        </label>
                        <label className={labelClass}>
                          <span>Month</span>
                          <input type="number" min={1} max={12} value={birthDetails.month} onChange={(event) => setBirthDetails((prev) => ({ ...prev, month: Number(event.target.value) }))} className={inputClass} />
                        </label>
                        <label className={labelClass}>
                          <span>Year</span>
                          <input type="number" min={1900} max={new Date().getFullYear()} value={birthDetails.year} onChange={(event) => setBirthDetails((prev) => ({ ...prev, year: Number(event.target.value) }))} className={inputClass} />
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase text-white/40">Time of birth</p>
                        <p className="text-xs text-white/35">Use 24 hour format</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={labelClass}>
                          <span>Hour</span>
                          <input type="number" min={0} max={23} value={birthDetails.hour} onChange={(event) => setBirthDetails((prev) => ({ ...prev, hour: Number(event.target.value) }))} className={inputClass} />
                        </label>
                        <label className={labelClass}>
                          <span>Minute</span>
                          <input type="number" min={0} max={59} value={birthDetails.minute} onChange={(event) => setBirthDetails((prev) => ({ ...prev, minute: Number(event.target.value) }))} className={inputClass} />
                        </label>
                      </div>
                    </div>

                    <label className={`relative block ${labelClass}`}>
                      <span>Birth place</span>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                        <input
                          value={birthDetails.birthPlace}
                          onChange={(event) => handleLocationChange(event.target.value)}
                          className={`${inputClass} pl-9 pr-9`}
                          placeholder="City, state, country"
                          required
                        />
                        {isSearchingLocation && <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />}
                      </div>
                      {showLocationSuggestions && (
                        <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-md border border-white/15 bg-[#0f0f0f] shadow-xl shadow-black/40">
                          {locationSuggestions.map((place) => (
                            <button
                              key={`${place.display_name}-${place.lat}-${place.lon}`}
                              type="button"
                              onClick={() => selectLocation(place)}
                              className="block w-full border-b border-white/10 px-3 py-2 text-left text-sm font-normal text-white/75 last:border-b-0 hover:bg-white/10"
                            >
                              {place.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </label>

                    <label className={labelClass}>
                      <span>Prediction language</span>
                      <select value={language} onChange={(event) => setLanguage(event.target.value as Lang)} className={selectClass}>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </label>

                    <div className="pt-2">
                      <button type="submit" className="flex h-12 w-full items-center justify-center rounded-md bg-[#d9277a] text-sm font-semibold text-white transition hover:bg-[#c1206d] focus:outline-none focus:ring-2 focus:ring-[#d9277a]/40">
                        Generate My Predictions
                      </button>
                      <p className="mt-3 text-center text-xs leading-5 text-white/35">
                        Your chart is calculated from your birth details before the prediction is written.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="mx-auto w-full max-w-xl text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d9277a]/30 bg-[#111111] shadow-2xl shadow-black/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black">
                  <Loader2 className="h-7 w-7 animate-spin text-[#d9277a]" />
                </div>
              </div>
              <p className="text-sm font-medium text-[#d9277a]">Please stay on this page</p>
              <h1 className="mt-3 text-3xl font-semibold">Creating your predictions</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
                This can take 30 to 60 seconds because we calculate your chart first, then ask Vedika to write your predictions.
              </p>

              <div className="mt-7 overflow-hidden rounded-lg border border-white/10 bg-[#111111] text-left">
                <div className="h-1 w-full overflow-hidden bg-white/10">
                  <div className="h-full w-1/2 animate-[pulse_1.4s_ease-in-out_infinite] bg-[#d9277a]" />
                </div>
                <div className="space-y-4 p-5">
                  {loadingMessages.map((message) => {
                    const currentIndex = loadingMessages.indexOf(loadingMessage);
                    const messageIndex = loadingMessages.indexOf(message);
                    const isDone = messageIndex < currentIndex;
                    const isActive = message === loadingMessage;

                    return (
                      <div key={message} className="flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                            isActive
                              ? "border-[#d9277a] bg-[#d9277a] text-white"
                              : isDone
                                ? "border-[#d9277a]/60 bg-[#d9277a]/20 text-[#d9277a]"
                                : "border-white/15 bg-black text-white/35"
                          }`}
                        >
                          {isDone ? "OK" : messageIndex + 1}
                        </div>
                        <p className={`text-sm ${isActive ? "text-white" : isDone ? "text-white/65" : "text-white/35"}`}>
                          {message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="w-full">
              <div className="mb-8 text-center">
                <p className="text-sm font-medium text-[#d9277a]">{birthDetails.name}'s Kundli Predictions</p>
                <h1 className="mt-2 text-3xl font-semibold">Your 10 AI Astrology Predictions</h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Personalized from your Vedic birth chart, Moon sign, Lagna, Nakshatra, and current age.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {predictions.map((item) => (
                  <article key={item.topic} className="rounded-lg border border-white/10 bg-[#111111] p-5">
                    <div className="mb-3 flex items-center gap-3 text-[#d9277a]">
                      {getTopicIcon(item.topic)}
                      <h2 className="text-sm font-semibold uppercase tracking-wide">{item.topic}</h2>
                    </div>
                    <p className="text-sm leading-6 text-white/80">{item.prediction}</p>
                  </article>
                ))}
              </div>

              <div className="mx-auto mt-8 max-w-xl rounded-lg border border-white/10 bg-[#111111] p-6 text-center">
                <h2 className="text-xl font-semibold">Sign up to ask Vedika follow-up questions about your predictions</h2>
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="mt-5 h-11 rounded-md bg-[#d9277a] px-6 text-sm font-semibold text-white transition hover:bg-[#c1206d]"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          )}
        </section>

        <article className="mx-auto max-w-3xl px-4 pb-20 text-white/75">
          <nav className="mb-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link to="/" className="text-[#d9277a] hover:text-white">Home</Link>
            <Link to="/blog/is-ai-astrology-accurate" className="text-[#d9277a] hover:text-white">Is AI Astrology Accurate</Link>
            <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-[#d9277a] hover:text-white">How AI Is Transforming Vedic Astrology</Link>
            <Link to="/blog/ai-astrology-prediction-for-2026" className="text-[#d9277a] hover:text-white">AI Astrology Prediction For 2026</Link>
            <Link to="/free-ai-astrologer-chat" className="text-[#d9277a] hover:text-white">Free AI Astrologer Chat</Link>
          </nav>

          <h2 className="mb-4 text-3xl font-semibold text-white">AI Astrology Prediction</h2>
          <p className="mb-5 leading-7">
            AI Astrology Prediction is a free Vedic astrology tool that reads your birth details and gives you ten personal predictions in clear language. You enter your name, gender, date of birth, time of birth, and birth place. The tool then calculates your birth chart and creates predictions for career, marriage, money, business, health, family, travel, education, love life, and lucky timing.
          </p>
          <p className="mb-5 leading-7">
            The goal of this page is simple. Many people want astrology answers, but they do not want long reports that feel hard to understand. They want direct guidance that feels useful. This tool is built for that. It gives short, focused predictions based on your Vedic chart, not random daily horoscope text. If you are looking for a quick way to understand your future direction, this page is a good starting point. If you have been searching for a <Link to="/kundligpt-alternative" className="text-[#d9277a] hover:text-white">KundliGPT alternative</Link> that delivers real chart based predictions without hidden paywalls, you will find everything you need here.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">How This Tool Works</h2>
          <p className="mb-5 leading-7">
            Your date of birth tells the system when you were born. Your time of birth helps calculate your Lagna, which is also called the ascendant. Your birth place helps calculate the correct sky position for that moment. These three details are important in Vedic astrology because even a small change in birth time or place can change the chart.
          </p>
          <p className="mb-5 leading-7">
            After the chart is ready, Vedika reads important parts of your Kundli. This includes your Sun sign, Moon sign, Lagna, Nakshatra, and planetary positions. The prediction is then written according to your current age. A student, a young professional, and a married person should not receive the same kind of prediction. Your life stage matters, so the answer changes with your age.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">What Details You Should Enter</h2>
          <p className="mb-5 leading-7">
            The better your birth details are, the better your prediction becomes. Enter your full name so the reading feels personal. Choose the correct gender. Add your date of birth in day, month, and year format. Add your time of birth in 24 hour format. If you were born at 7 in the evening, enter 19 as the hour. If you were born at 7 in the morning, enter 7 as the hour.
          </p>
          <p className="mb-5 leading-7">
            Birth place is also important because Vedic astrology depends on the sky at your place of birth. A person born at the same time in Delhi and a person born at the same time in New York will not have the exact same chart. This is why the tool asks for city, state, and country. Choose the correct location from the suggestions when possible.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">Why AI Astrology Can Feel Personal</h2>
          <p className="mb-5 leading-7">
            Most simple horoscope pages only use your zodiac sign. That is not enough for serious Vedic astrology. Millions of people can share the same sign, but their life stories are different. A real reading must look at the full birth chart. This is why AI astrology can be useful when it is connected to real chart calculation.
          </p>
          <p className="mb-5 leading-7">
            AI can read many chart signals quickly and explain them in simple English. It does not replace deep human wisdom, but it helps people get fast clarity. If you want to understand this better, read our guide on <Link to="/blog/is-ai-astrology-accurate" className="text-[#d9277a] hover:text-white">is AI astrology accurate</Link>. We explain where AI astrology works well and where human guidance is still helpful.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">What You Can Learn From Your Predictions</h2>
          <p className="mb-5 leading-7">
            The career prediction can show the kind of work energy that is strong in your chart. The marriage and love life predictions can help you understand relationship timing and emotional patterns. The money and business predictions can show when growth becomes easier and where you should stay careful. Health and family predictions give simple guidance about balance, routine, and responsibility.
          </p>
          <p className="mb-5 leading-7">
            The lucky period prediction is useful because timing is a big part of Vedic astrology. Some periods support action, while some periods ask for patience. A good prediction does not only say what can happen. It also tells you when the energy becomes stronger.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">Who Should Use This AI Astrology Tool</h2>
          <p className="mb-5 leading-7">
            This tool is useful for anyone who wants a simple first reading without booking a call. Students can use it to understand education and early career direction. Working people can use it to understand career growth, money timing, and business chances. People thinking about marriage or relationships can use it to see the emotional patterns and timing shown in their chart.
          </p>
          <p className="mb-5 leading-7">
            It is also useful if you are new to Vedic astrology. You do not need to know what Lagna, Nakshatra, Dasha, or houses mean before using the tool. The answer is written in easy English or Hindi, so you can understand the main message without learning complex astrology first.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">AI Astrology And The Future Of Vedic Guidance</h2>
          <p className="mb-5 leading-7">
            Vedic astrology is old, but the way people use it is changing. Earlier, you had to wait for an astrologer, book a call, or pay a high fee for basic answers. Now AI tools can make chart based guidance easier to access. This does not make astrology less serious. It makes the first step simpler for everyone.
          </p>
          <p className="mb-5 leading-7">
            If you want to explore this topic deeply, read <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-[#d9277a] hover:text-white">how AI is transforming Vedic astrology</Link>. You can also read <Link to="/blog/ai-astrology-prediction-for-2026" className="text-[#d9277a] hover:text-white">AI astrology prediction for 2026</Link> if you want to see how AI and Vedic timing can be used for yearly guidance. While platforms like HiAstro limit what you can access for free, Veadicastro keeps all AI astrology predictions accessible — <Link to="/hi-astro-alternative" className="text-[#d9277a] hover:text-white">see why we are the better choice</Link>.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">How To Use The Prediction In Real Life</h2>
          <p className="mb-5 leading-7">
            Read your prediction slowly. Do not treat it like a fixed rule for your life. Treat it like a map. If the career prediction says a certain period is good for growth, use that time to prepare better, apply for better roles, or start important work. If the money prediction asks for care, use that as a reminder to avoid risky decisions.
          </p>
          <p className="mb-5 leading-7">
            The best use of astrology is awareness. It can help you understand timing, patterns, and personal tendencies. It should make you more practical, not more afraid. Veadicastro focuses on clear guidance, simple language, and useful answers, so you can take action with a calmer mind.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">Why Use Veadicastro</h2>
          <p className="mb-5 leading-7">
            Veadicastro is built for people who want astrology that feels clear, practical, and honest. The main <Link to="/" className="text-[#d9277a] hover:text-white">Veadicastro</Link> gives access to more free tools, including Kundli generation, daily horoscope, matching, and AI chat. If you want to ask follow up questions after your ten predictions, you can use our <Link to="/free-ai-astrologer-chat" className="text-[#d9277a] hover:text-white">free AI astrologer chat</Link>. As a powerful <Link to="/hi-astro-alternative" className="text-[#d9277a] hover:text-white">HiAstro alternative</Link> and <Link to="/astrosage-alternative" className="text-[#d9277a] hover:text-white">AstroSage alternative</Link>, Veadicastro gives you complete free access to AI predictions without requiring payment for basic features.
          </p>
          <p className="mb-10 leading-7">
            Use this page as a simple first reading. Enter your birth details carefully, generate your predictions, and notice which parts feel close to your current life. Astrology works best when it gives you awareness. It should help you think better, choose better, and move through life with more clarity.
          </p>

          <h2 className="mb-5 text-2xl font-semibold text-white">FAQ</h2>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">What is AI astrology prediction?</h3>
            <p className="leading-7">
              AI astrology prediction is a chart based reading made with the help of artificial intelligence. You enter your birth details, the tool calculates your Vedic birth chart, and Vedika creates personal predictions for important areas of life.
            </p>
          </section>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Is this AI astrology prediction tool free?</h3>
            <p className="leading-7">
              Yes, this tool is free to use. You can enter your details and generate ten predictions. After that, you can sign up if you want to ask more personal follow up questions to Vedika.
            </p>
          </section>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">What predictions will I get?</h3>
            <p className="leading-7">
              You will get predictions for career, marriage, money, business, health, family, travel, education, love life, and lucky period. Each answer is short, direct, and based on your birth chart details.
            </p>
          </section>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Do I need exact birth time?</h3>
            <p className="leading-7">
              Exact birth time gives the best result because it helps calculate your Lagna and house positions. If you only know an approximate time, you can still use the tool, but some timing based parts may be less exact.
            </p>
          </section>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Which astrology system does this page use?</h3>
            <p className="leading-7">
              This page uses Vedic astrology. It reads your Kundli, Moon sign, Lagna, Nakshatra, and planetary signals before generating predictions. The focus is on clear Vedic guidance, not generic zodiac text.
            </p>
          </section>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Is AI astrology accurate?</h3>
            <p className="leading-7">
              AI astrology can be useful when it is connected to real birth chart calculation. Accuracy depends on correct birth details and the quality of the astrology logic. You can read more in our guide on <Link to="/blog/is-ai-astrology-accurate" className="text-[#d9277a] hover:text-white">is AI astrology accurate</Link>.
            </p>
          </section>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Can AI astrology predict my future?</h3>
            <p className="leading-7">
              AI astrology can show likely themes, timing, and life patterns based on your chart. It is best used for guidance and planning. It should help you make better choices instead of making you feel stuck.
            </p>
          </section>
          <section className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Can I use this tool in Hindi?</h3>
            <p className="leading-7">
              Yes. You can choose Hindi in the language field. Vedika will then write your predictions in Hindi using Devanagari script.
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-lg font-semibold text-white">Can I ask more questions after the predictions?</h3>
            <p className="leading-7">
              Yes. After reading your predictions, you can sign up and ask Vedika follow up questions about career, marriage, finance, relationship, education, or any specific life topic.
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
