import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { ButtonLite } from "@/components/ui/button-lite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getPlanetaryData, type AstroPayload } from "@/lib/astroCalc";
import { persistAstroPayload } from "@/lib/astroStorage";
import { generateGeminiStream, type ChatTurn } from "@/lib/gemini";
import { useAuth } from "@/context/AuthContext";
import AdBanner from "@/components/AdBanner";

type Gender = "not-specified" | "male" | "female";

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

const SITE_URL = "https://veadicastro.in";
const PAGE_PATH = "/love-astrology-by-date-of-birth";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_IMAGE = `${SITE_URL}/optimized/love-astrology-bg.webp`;

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const years = Array.from({ length: 95 }, (_, i) => new Date().getFullYear() - i);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

const faqs = [
  {
    q: "Can astrology predict my love life?",
    a: "Yes, Vedic astrology can explain patterns in your love life by studying the 5th house of romance, Venus (the planet of love), and related transits to reveal when meaningful connections are most likely.",
  },
  {
    q: "How does AI analyze love compatibility?",
    a: "AI reads the planetary positions at your exact birth time, checking the strength of romantic planets and houses to explain emotional compatibility, attraction styles, and relationship strengths.",
  },
  {
    q: "When will I find true love?",
    a: "Finding true love is indicated when positive dasha periods and Jupiter or Venus transits activate your 5th or 7th house. The reading provides a window of supportive time rather than a fixed date.",
  },
  {
    q: "Can birth dates reveal relationship patterns?",
    a: "Absolutely. Your birth details determine your chart, which reflects how you approach trust, emotional bonding, and partnership, helping you understand repeating themes in your relationships.",
  },
  {
    q: "Is AI love astrology accurate?",
    a: "AI love astrology is highly insightful because it calculates your real Vedic chart data and explains it clearly. However, it should be used for clarity and guidance, not as a 100% fixed destiny.",
  },
];

const buildLovePrompt = (details: BirthDetails, question: string) => {
  const nameLine = details.name.trim() ? `Name: ${details.name.trim()}` : "Name: not provided";
  const genderLine = details.gender !== "not-specified" ? `Gender: ${details.gender}` : "Gender: not provided";
  return `${nameLine}
${genderLine}
Birth date: ${details.day} ${months[details.month - 1]} ${details.year}
Birth time: ${String(details.hour).padStart(2, "0")}:${String(details.minute).padStart(2, "0")}
Birth place: ${details.birthPlace}
Main question: ${question.trim() || "What is the outlook for my love life?"}

Give a personalized AI love astrology reading by date of birth. Focus only on love life, romance, emotional compatibility, and relationship patterns.`;
};

const buildLoveSystemPrompt = (data: AstroPayload | null) => {
  const chartLines = data
    ? `User's Vedic chart data:
- Sun Sign: ${data.sunSign}
- Moon Sign: ${data.moonSign}
- Ascendant/Lagna: ${data.lagnaSign}
- Nakshatra: ${data.nakshatra?.name || "Not available"} Pada ${data.nakshatra?.pada || ""}`
    : "Use only the provided birth details and avoid inventing exact planetary placements.";

  return `You are Vedika, Veadicastro's AI Vedic astrologer.
Respond in calm, simple English. Be focused on love, romance, dating, and emotional compatibility. Be warm, practical, and non-fear-based.

${chartLines}

Rules:
- Use sidereal Vedic astrology and chart-first interpretation.
- Do not promise certainty. Give timing as a window, not an exact guaranteed date.
- Do not create fear or pressure.
- Explain any technical point in easy language.
- Mention 5th house, 7th house, Venus, Mars, dasha/transit only when helpful.
- Keep the answer structured and useful.

Required result format:
Romantic Nature:
Emotional Compatibility:
Relationship Strengths:
Areas to Improve:
Love Outlook & Timing Window:
Current Dasha/Transit Influence:
Simple Remedies:
Next Best Question to Ask Vedika:`;
};

const inputClass =
  "h-12 rounded-2xl border-white/10 bg-white/[0.06] text-white placeholder:text-white/35 focus:border-pink-400 focus:ring-pink-400";
const labelClass = "mb-2 flex items-center gap-2 text-sm font-medium text-white/75";

export default function AiLoveAstrologyByDateOfBirth() {
  const { setAuthOpen } = useAuth();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    gender: "not-specified",
    day: 1,
    month: 1,
    year: 2000,
    hour: 12,
    minute: 0,
    birthPlace: "",
  });
  const [question, setQuestion] = useState("What is the outlook for my love life?");
  const [astroData, setAstroData] = useState<AstroPayload | null>(null);
  const [result, setResult] = useState("");
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [hasUsedFeature, setHasUsedFeature] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check if user has already used the feature
    const hasUsed = localStorage.getItem("ai_love_astrology_used");
    if (hasUsed === "true") {
      setHasUsedFeature(true);
    }
  }, []);

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
      const suggestions = (data?.results || []).map((r: any) => ({
        display_name: r.formatted,
        lat: String(r.geometry.lat),
        lon: String(r.geometry.lng),
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

  const selectLocation = (place: LocationSuggestion) => {
    setBirthDetails((prev) => ({
      ...prev,
      birthPlace: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      tzone: 5.5,
    }));
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  const setField = <K extends keyof BirthDetails>(key: K, value: BirthDetails[K]) => {
    setBirthDetails((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = birthDetails.birthPlace.trim().length > 1 && !isLoading;

  const runPrediction = async (customQuestion?: string) => {
    const activeQuestion = customQuestion || question;
    if (!birthDetails.birthPlace.trim()) {
      setError("Please enter your birth place and choose a suggestion for better accuracy.");
      return;
    }

    // Check if user has already used the feature
    if (hasUsedFeature) {
      alert("You have already used this feature. Each user can generate only one love prediction.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(customQuestion ? result : "");
    setStatus("Calculating your Vedic birth chart...");

    try {
      const chart = astroData || await getPlanetaryData({
        day: birthDetails.day,
        month: birthDetails.month,
        year: birthDetails.year,
        hour: birthDetails.hour,
        min: birthDetails.minute,
        lat: birthDetails.lat || 28.6139,
        lon: birthDetails.lon || 77.2090,
        tzone: birthDetails.tzone || 5.5,
      });

      if (!astroData) {
        setAstroData(chart);
        persistAstroPayload(chart);
      }

      const userPrompt = buildLovePrompt(birthDetails, activeQuestion);
      const history = customQuestion ? messages : [];
      const nextMessages: ChatTurn[] = [...history, { role: "user", content: activeQuestion }];
      setMessages(nextMessages);
      setStatus(customQuestion ? "Vedika is reading your question..." : "Vedika is preparing your love astrology reading...");

      let streamed = "";
      await generateGeminiStream(
        userPrompt,
        history,
        (delta) => {
          streamed += delta;
          setResult((prev) => customQuestion ? `${prev}${prev.endsWith("\n\n") ? "" : "\n\n"}Follow-up Answer:\n${streamed}` : streamed);
        },
        buildLoveSystemPrompt(chart),
        "en",
        birthDetails.name || undefined,
        "secondary",
        "ministral-8b-latest"
      );

      setMessages([...nextMessages, { role: "assistant", content: streamed }]);
      setStatus("");

      // Mark user as having used the feature
      localStorage.setItem("ai_love_astrology_used", "true");
      setHasUsedFeature(true);
    } catch {
      setError("Something went wrong while preparing the love prediction. Please try again.");
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  }), []);

  const breadcrumbSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Free Love Astrology by Date of Birth – AI Relationship Predictions", "item": PAGE_URL },
    ],
  }), []);

  const appSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": " AI Love Astrology by Date of Birth – AI Relationship Predictions",
    "url": PAGE_URL,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "image": PAGE_IMAGE,
    "description": "Free, instant AI love astrology reading by date of birth. Vedika analyzes your 5th house, Venus, and dasha for relationship patterns and romantic outlook.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
    },
  }), []);

  return (
    <>
      <Helmet>
        <title> AI Love Predictions by Date of Birth – Free, Instant & Chart-Based </title>
        <meta
          name="description"
          content="Enter your birth details to get an instant AI love astrology reading. Vedika reveals romantic tendencies, emotional compatibility, and relationship patterns based on your birth chart."
        />
        <meta
          name="keywords"
          content="love astrology by date of birth, free love astrology, AI relationship prediction, love compatibility astrology, when will I find love astrology, romance prediction by DOB, love life reading, AI love calculator"
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:title" content=" AI Love Predictions by Date of Birth – Free, Instant & Chart-Based  " />
        <meta property="og:description" content="Get an instant chart-based AI love reading with no signup and no payment. Vedika reads your 5th house, Venus, Mars, and relationship patterns." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={PAGE_IMAGE} />
        <meta property="og:site_name" content="Veadicastro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content=" AI Love Predictions by Date of Birth – Free, Instant & Chart-Based" />
        <meta name="twitter:description" content="Get an instant chart-based AI marriage prediction from Vedika using your date, time, and place of birth." />
        <meta name="twitter:image" content={PAGE_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#07070d] text-white">

        {/* ── HERO: Title + Subtitle only ── */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.18),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(34,197,94,0.10),transparent_28%),linear-gradient(135deg,#080812,#11101a_42%,#090711)]" />
          <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex items-center justify-between gap-6">
              {/* Left side: Badge and content */}
              <div className="flex-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
                  <Heart className="h-3.5 w-3.5" />
                  Free · No signup · Instant result
                </div>

                <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                  AI Love Predictions<br className="hidden sm:block" /> by Date of Birth
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                  Enter your birth details below. Vedika reads your 5th house, Venus, Mars, and relationship patterns to give you a chart-based love reading — instantly.
                </p>

                {/* Trust badges */}
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-300/25 bg-green-300/10 px-4 py-2 text-green-100 text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Swiss Ephemeris calculations
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-white/70 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-pink-300" />
                    2,000+ predictions given
                  </span>
                </div>
              </div>

              {/* Right side: Logo */}
              <Link to="/" className="hidden lg:flex items-center gap-2 text-sm text-white/55 hover:text-pink-300 flex-shrink-0">
                <img src="/optimized/logo.webp" alt="Veadicastro logo" className="h-10 w-10 rounded-full" loading="eager" />
                <span className="font-semibold">Veadicastro</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── AD 1: Below hero title ── */}
        <div className="flex justify-center px-4 py-5">
          <AdBanner adSlot="5098435505" className="w-full max-w-[728px]" />
        </div>

        {/* ── MAIN TOOL: Input + Result side by side ── */}
        <section id="love-tool" className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          {/* LEFT: Input form */}
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-300">Step 1 — Your birth details</p>
                <h2 className="mt-1 text-xl font-black">Love prediction calculator</h2>
              </div>
              <div className="rounded-2xl bg-pink-500/20 p-3 text-pink-200">
                <Heart className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-4">
              {/* Name */}
              <div>
                <Label className={labelClass}>
                  <User className="h-4 w-4" /> Name <span className="ml-1 text-white/35">(optional)</span>
                </Label>
                <Input
                  className={inputClass}
                  value={birthDetails.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {/* Date row */}
              <div>
                <Label className={labelClass}>
                  <Calendar className="h-4 w-4" /> Date of Birth
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={String(birthDetails.day)} onValueChange={(v) => setField("day", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Day" /></SelectTrigger>
                    <SelectContent>{days.map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={String(birthDetails.month)} onValueChange={(v) => setField("month", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>{months.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={String(birthDetails.year)} onValueChange={(v) => setField("year", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time + Gender row */}
              <div>
                <Label className={labelClass}>
                  <Clock className="h-4 w-4" /> Birth Time &amp; Gender
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={String(birthDetails.hour)} onValueChange={(v) => setField("hour", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="HH" /></SelectTrigger>
                    <SelectContent>{hours.map((h) => <SelectItem key={h} value={String(h)}>{String(h).padStart(2, "0")}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={String(birthDetails.minute)} onValueChange={(v) => setField("minute", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="MM" /></SelectTrigger>
                    <SelectContent>{minutes.map((m) => <SelectItem key={m} value={String(m)}>{String(m).padStart(2, "0")}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={birthDetails.gender} onValueChange={(v: Gender) => setField("gender", v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-specified">Optional</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Birth Place */}
              <div className="relative">
                <Label className={labelClass}>
                  <MapPin className="h-4 w-4" /> Birth Place
                </Label>
                <div className="relative">
                  <Input
                    className={`${inputClass} pr-10`}
                    value={birthDetails.birthPlace}
                    onChange={(e) => {
                      setField("birthPlace", e.target.value);
                      searchLocation(e.target.value);
                    }}
                    onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
                    placeholder="Start typing your city or town"
                  />
                  {isSearchingLocation
                    ? <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-pink-300" />
                    : <Search className="absolute right-3 top-3.5 h-5 w-5 text-white/35" />
                  }
                </div>
                {showLocationSuggestions && (
                  <div className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-white/10 bg-[#15131f] p-2 shadow-2xl">
                    {locationSuggestions.map((place) => (
                      <button
                        key={`${place.display_name}-${place.lat}`}
                        type="button"
                        onClick={() => selectLocation(place)}
                        className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-pink-300" />
                        {place.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Question */}
              <div>
                <Label className={labelClass}>
                  <MessageCircle className="h-4 w-4" /> Your question <span className="ml-1 text-white/35">(optional)</span>
                </Label>
                <Textarea
                  className="min-h-[88px] rounded-2xl border-white/10 bg-white/[0.06] text-white placeholder:text-white/35 focus:border-pink-400 focus:ring-pink-400"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What is the outlook for my love life?"
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              <ButtonLite
                type="button"
                disabled={!canSubmit}
                onClick={() => runPrediction()}
                className="h-14 rounded-2xl bg-pink-500 text-base font-black text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  : <Sparkles className="mr-2 h-5 w-5" />
                }
                Get My Love Prediction
              </ButtonLite>

              <p className="text-center text-xs text-white/35">
                No signup required · No payment · Instant result
              </p>
            </div>
          </div>

          {/* RIGHT: Result panel */}
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0d0d16] p-5 shadow-xl shadow-black/20 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-pink-400/25 bg-pink-500/15 flex-shrink-0">
                <img src="/optimized/vedika.webp" alt="Vedika AI astrologer" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-300">Step 2 — Vedika's reading</p>
                <h2 className="text-xl font-black">Your result appears here</h2>
              </div>
            </div>

            <div className="min-h-[460px] rounded-[1.25rem] border border-white/10 bg-black/25 p-5">
              {/* Empty state / sample preview */}
              {!result && !isLoading && (
                <div className="flex h-full min-h-[400px] flex-col justify-center">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-pink-200">
                      Sample preview
                    </span>
                    <span className="text-xs text-white/35">Fill the form →</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      ["Romantic Nature:", "Vedika reads Venus, 5th house, and Mars for your love style."],
                      ["Emotional Compatibility:", "Chart patterns show what you need in relationships."],
                      ["Relationship Strengths:", "Your natural gifts in love and partnership."],
                      ["Simple Remedies:", "Gentle non-fear-based guidance for love clarity."],
                    ].map(([label, text]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-bold text-white">{label}</p>
                        <p className="mt-1 select-none text-sm leading-6 text-white/40 blur-[2.5px]">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading status */}
              {status && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                  {status}
                </div>
              )}

              {/* Streamed result */}
              {result && (
                <div className="whitespace-pre-wrap text-sm leading-7 text-white/82">{result}</div>
              )}
            </div>

            {/* Post-result CTA */}
            {result && (
              <div className="mt-5 rounded-[1.25rem] border border-pink-400/20 bg-pink-400/10 p-5">
                <h3 className="font-bold text-white">Want a deeper reading with compatibility, timing, and remedies?</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Sign up to ask Vedika any personal question about love life, soulmate connections, relationship challenges, or dating patterns.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ButtonLite
                    onClick={() => setAuthOpen(true)}
                    className="h-11 rounded-2xl bg-white px-5 text-sm font-bold text-black hover:bg-pink-100"
                  >
                    Ask any question to AI
                  </ButtonLite>
                  <Link
                    to="/talk-to-astrologer"
                    className="inline-flex h-11 items-center rounded-2xl border border-white/15 px-5 text-sm font-bold text-white/80 hover:border-pink-400/50 hover:text-pink-200"
                  >
                    Talk to an astrologer
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── AD 2: After result section ── */}
        <div className="flex justify-center px-4 py-4">
          <AdBanner adSlot="6711166008" className="w-full max-w-[400px]" />
        </div>

        {/* ── HOW IT WORKS strip ── */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-pink-400/20 bg-pink-400/10 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">How Vedika reads your chart</p>
                <h2 className="mt-2 text-xl font-black text-white">From birth details to instant answer</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["1", "Enter your birth details"],
                  ["2", "Swiss Ephemeris calculates the chart"],
                  ["3", "5th house, Venus, Mars are analyzed"],
                  ["4", "Instant streaming AI result"],
                ].map(([step, text]) => (
                  <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-200">Step {step}</p>
                    <p className="mt-2 text-sm leading-6 text-white/75">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              ["Romantic nature", "How you express and seek affection."],
              ["Emotional compatibility", "The core needs for your relationships."],
              ["Relationship strengths", "What makes your connections last."],
              ["Love outlook", "Timing window and upcoming relationship trends."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-green-300" />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARTICLE with image moved here ── */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">

            {/* Image — now lives at top of article */}
            <div className="mb-8 overflow-hidden rounded-[1.5rem] border border-white/10">
              <img
                src="/optimized/ai-marriage-prediction-v2.webp"
                alt="AI love astrology by date of birth with Vedic relationship insights"
                className="w-full object-cover max-h-[340px]"
                loading="lazy"
              />
            </div>

            <div className="mb-8 border-b border-white/10 pb-8">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
                Love Astrology Article
              </p>
              <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">
                AI Love Astrology by Date of Birth: Meaning, Method, and Responsible Use
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
                This guide explains how AI love astrology works on <Link to="/" className="text-pink-300 underline-offset-4 hover:underline">Veadicastro</Link>, why complete birth details matter, and how Vedika uses Vedic astrology signals to explain romantic tendencies, emotional compatibility, relationship strengths, and love outlook in simple language.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-white">Main focus</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">Romantic nature, emotional compatibility, and relationship patterns.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-white">Astrology base</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">5th house, Venus, Mars, dasha, transit, and relationship context.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-white">Best use</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">Clarity and self-reflection, not fixed promises or fear.</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-pink-400/25 bg-pink-400/10 p-5">
                <h3 className="text-xl font-black text-white">Direct answer</h3>
                <p className="mt-3 text-sm leading-8 text-white/75 sm:text-base">
                  AI love astrology by date of birth uses your birth chart, birth time, and birth place to analyze romantic tendencies, emotional compatibility, relationship strengths, and love outlook. It helps you understand patterns, not guaranteed outcomes.
                </p>
              </div>
              <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-5">
                <p className="text-lg font-black text-yellow-100">★★★★★</p>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  Users from India, the UK, the USA, and Canada use Vedika to understand love patterns, relationship timing, and emotional compatibility questions with a calm Vedic astrology approach.
                </p>
              </div>
            </div>

            <div className="space-y-9">
              <section>
                <h3 className="text-2xl font-black text-white">1. What AI love astrology by date of birth means</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  AI love astrology by date of birth means using your birth details to prepare a Vedic astrology reading about love and relationships, then using AI to explain that reading clearly. It is not a random answer and it is not the same as a generic zodiac prediction. Vedika reads the chart foundation first and then explains what the love indicators suggest. If you want to see your complete planetary positions before asking about love, you can also use the <Link to="/free-kundli-generator" className="text-pink-300 underline-offset-4 hover:underline">Free Kundli Generator</Link>.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">AI love astrology vs generic horoscope</h3>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-white/10 text-white">
                      <tr>
                        <th className="p-3 font-bold">Feature</th>
                        <th className="p-3 font-bold">AI Love Astrology</th>
                        <th className="p-3 font-bold">Generic Horoscope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-white/70">
                      <tr>
                        <td className="p-3 text-white/90">Uses date of birth</td>
                        <td className="p-3">Yes</td>
                        <td className="p-3">Usually no</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white/90">Uses birth time and place</td>
                        <td className="p-3">Yes</td>
                        <td className="p-3">No</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white/90">Love focused</td>
                        <td className="p-3">Yes</td>
                        <td className="p-3">Limited</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white/90">Personalized timing window</td>
                        <td className="p-3">Based on chart, dasha, and transit</td>
                        <td className="p-3">Broad and general</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">2. Why DOB, time, and place matter</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Date of birth gives the broad planetary background, but time and place complete the chart. Time of birth helps calculate the Lagna, or ascendant, which decides the house structure. Birth place helps calculate accurate planetary positions. These details are important because love is mainly studied through houses, especially the 5th house.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">3. How AI reads your Kundli for love</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  In Vedic astrology, the 5th house shows romance, courtship, and creative expression of love. Venus is the natural indicator of affection, attraction, and how we bond with others. Mars brings passion and drive to relationships. For deeper love insight, astrologers may also look at the 7th house for partnership and the 2nd and 11th houses for family support and gains.
                </p>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  A proper reading does not depend on one planet alone. It checks how the 5th house connects with other houses, whether Venus or Mars are creating harmony or challenge, and whether dasha periods are activating love-related areas. The <Link to="/" className="text-pink-300 underline-offset-4 hover:underline">Veadicastro homepage</Link> connects this love tool with other Vedic astrology resources for complete guidance.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">4. Love timing and relationship windows</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Love timing is normally checked through dasha and transit. Dasha shows which planetary period is active in your life. Transit shows what current planets are triggering in the chart. When love-related houses and planets become active together, the chart can show a stronger window for meeting someone, falling in love, or deepening a connection. A window is more responsible than a fixed guaranteed date because real-life choices and circumstances also matter.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">5. Love astrology by Kundli - what Vedika checks</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Vedic astrology can become technical quickly. In love astrology by Kundli, Vedika checks the 5th house, 7th house, Venus, Mars, Vimshottari dasha, transit, aspect, and conjunction patterns, then converts the chart logic into easy English. This helps you understand romantic nature, emotional compatibility, relationship strengths, and simple remedies without needing to study Jyotish first. If you want a broader discussion after the result, continue in the <Link to="/free-ai-astrologer-chat" className="text-pink-300 underline-offset-4 hover:underline">Free AI Astrologer Chat</Link>; if you want to compare AI astrology with general AI tools, read our <Link to="/chatgpt-astrology" className="text-pink-300 underline-offset-4 hover:underline">ChatGPT Astrology</Link> guide.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">6. Use the prediction responsibly</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  A love prediction should help you reflect, not make you fearful. If the chart shows delay, it does not mean denial. If the chart shows support, it still asks for wise choices. Use this guidance alongside honest communication, emotional maturity, and practical compatibility. For deeper personal situations, you can also <Link to="/talk-to-astrologer" className="text-pink-300 underline-offset-4 hover:underline">talk to a human astrologer</Link>.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">7. Example love astrology reading</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Imagine a person born on 14 February 1995 at 10:30 AM in Mumbai. A responsible AI love astrology reading would not say, "You will meet your soulmate on one exact date." Instead, Vedika would first read the 5th house, Venus, Mars, and the active dasha period. If the love-related dasha becomes stronger in the late twenties and supportive transits touch the 5th house around that time, the result may describe a love window such as "stronger chances between age 27 and 30." If Venus is strong, Vedika may explain that emotional connection and loyalty are important. If Mars influences the 5th house, the answer may mention passion, drive, and active pursuit of love.
                </p>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  This example shows why timing is best explained as a window. The chart can show when love energy becomes more active, but real life still includes personal growth, timing, mutual effort, and the choices of both people involved.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">8. Common reasons love gets delayed</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Love delay can appear for many reasons in Vedic astrology. Saturn's influence can show maturity, responsibility, or late commitment. Rahu can show unconventional choices, confusion, or attraction outside the expected path. A weak or stressed Venus may show difficulty in comfort, trust, or relationship flow. Sometimes the dasha simply does not activate love houses early. Delay can also come from practical life factors like <Link to="/ai-career-prediction-by-date-of-birth" className="text-pink-300 underline-offset-4 hover:underline">career focus</Link>, family expectations, location changes, or emotional unreadiness.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">9. What makes a love reading more accurate</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Accuracy improves when the birth date, birth time, and birth place are correct. Exact birth time helps the ascendant and house placements become clearer. A specific question also helps: "What is the outlook for my love life?" is useful, but "Is the next two years supportive for meeting someone?" can be even more focused. For daily context around timing, you can check the <Link to="/today-horoscope" className="text-pink-300 underline-offset-4 hover:underline">Today Horoscope</Link>, and for broader AI-based predictions you can explore <Link to="/ai-astrology-prediction" className="text-pink-300 underline-offset-4 hover:underline">AI Astrology Prediction</Link>. The <Link to="/" className="text-pink-300 underline-offset-4 hover:underline">Veadicastro homepage</Link> also connects this love tool with Vedika AI chat, Kundli matching, daily predictions, and complete Vedic reports.
                </p>
              </section>

              <section className="rounded-2xl border border-green-300/20 bg-green-300/10 p-5">
                <h3 className="text-2xl font-black text-white">Trust and methodology</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Veadicastro uses chart-first interpretation. Birth chart logic, dashas, and transits remain the foundation. AI is used to explain the reading in simple language, not to replace the chart. The guidance is designed for clarity and self-reflection, not fear, pressure, or guaranteed outcomes.
                </p>
              </section>
            </div>
          </article>
        </section>

        {/* ── Trust section ── */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 flex-shrink-0 text-green-300" />
              <div>
                <h2 className="text-2xl font-black">Chart-first, calm, and responsible</h2>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  Vedika does not replace personal judgment or a human consultation. The page is designed to help you understand love indications with clarity, without fear-based pressure.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Birth chart first", "Dashas and transits included", "AI explains in simple language"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-semibold text-white/80">{item}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-black">FAQs</h2>
          <p className="mb-6 text-sm leading-7 text-white/65">
            These love FAQs are part of the larger <Link to="/" className="text-pink-300 underline-offset-4 hover:underline">Veadicastro homepage</Link> experience, where users can compare AI astrology tools, start Vedika chat, generate Kundli details, and explore daily horoscope guidance.
          </p>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="font-bold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-white/65">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Where to go next ── */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0d0d16] p-6 sm:p-8">
            <h2 className="text-2xl font-black">Where to go next</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-white/65 sm:text-base">
              <p>
                If you are still building your birth-chart foundation, start with the <Link to="/free-kundli-generator" className="text-pink-300 underline-offset-4 hover:underline">Free Kundli Generator</Link>. For a complete AI-powered birth chart analysis with planetary positions, doshas, yogas, and dasha predictions, try our <Link to="/ai-kundli-analysis" className="text-pink-300 underline-offset-4 hover:underline">AI Kundli Analysis</Link> tool. If you already have a partner in mind, use <Link to="/free-kundali-matching" className="text-pink-300 underline-offset-4 hover:underline">Free Kundali Matching</Link> to understand compatibility before focusing only on timing.
              </p>
              <p>
                For broader relationship questions, continue with <Link to="/free-ai-astrologer-chat" className="text-pink-300 underline-offset-4 hover:underline">Vedika's free AI astrologer chat</Link>. For human support on sensitive decisions, the <Link to="/talk-to-astrologer" className="text-pink-300 underline-offset-4 hover:underline">Talk to Astrologer</Link> page is the better path.
              </p>
              <p>
                You can also read related guides on <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-pink-300 underline-offset-4 hover:underline">Marriage Prediction by Date of Birth</Link>, <Link to="/blog/is-ai-astrology-accurate" className="text-pink-300 underline-offset-4 hover:underline">whether AI astrology is accurate</Link>, <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-pink-300 underline-offset-4 hover:underline">how AI is transforming Vedic astrology</Link>, and <Link to="/blog/ai-astrology-prediction-for-2026" className="text-pink-300 underline-offset-4 hover:underline">AI astrology prediction for 2026</Link>.
              </p>
              <p>
                To understand the AI side better, read <Link to="/ai-astrology" className="text-pink-300 underline-offset-4 hover:underline">AI Astrology</Link>, <Link to="/blog/ai-jyotish-vedic-astrology" className="text-pink-300 underline-offset-4 hover:underline">AI Jyotish</Link>, <Link to="/blog/ai-astrologer-vs-human-astrologer" className="text-pink-300 underline-offset-4 hover:underline">AI astrologer vs human astrologer</Link>, <Link to="/blog/ai-astrology-real-or-fake" className="text-pink-300 underline-offset-4 hover:underline">AI astrology real or fake</Link>, <Link to="/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" className="text-pink-300 underline-offset-4 hover:underline">why ChatGPT fails at astrology</Link>, <Link to="/blog/free-ai-astrology-chat-india" className="text-pink-300 underline-offset-4 hover:underline">free AI astrology chat India</Link>, <Link to="/blog/vedika-ai-astrologer-india" className="text-pink-300 underline-offset-4 hover:underline">Vedika AI astrologer India</Link>, <Link to="/blog/top-10-vedic-astrology-platform" className="text-pink-300 underline-offset-4 hover:underline">top Vedic astrology platforms</Link>, <Link to="/blog/online-jyotishi-vs-ai-astrologer" className="text-pink-300 underline-offset-4 hover:underline">online jyotishi vs AI astrologer</Link>, and <Link to="/blog/vedic-astrology-ai-kese-kaam-karta-ha" className="text-pink-300 underline-offset-4 hover:underline">Vedic astrology AI kaise kaam karta hai</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-pink-400/20 bg-pink-400/10 p-8 text-center">
            <h2 className="text-3xl font-black">Ready to understand your love life?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Start with the free AI love astrology by date of birth, then go deeper with Vedika or a human astrologer when you need more context.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#love-tool" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-6 py-4 text-sm font-bold text-white hover:bg-pink-400">
                Get My Love Prediction <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/free-ai-astrologer-chat" className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white/85 hover:border-pink-400/50">
                Ask any question to AI
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
