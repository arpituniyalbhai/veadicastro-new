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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const key = "764ba629707b4648af1b0a7f4da18981";
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
        "secondary"
      );

      setMessages([...nextMessages, { role: "assistant", content: streamed }]);
      setStatus("");
    } catch {
      setError("Something went wrong while preparing the marriage prediction. Please try again.");
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
    "name": "Free Love Astrology by Date of Birth – AI Relationship Predictions",
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
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.18),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(34,197,94,0.10),transparent_28%),linear-gradient(135deg,#080812,#11101a_42%,#090711)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:px-8 lg:py-14">
            <div className="flex flex-col justify-center">
              <Link to="/" className="mb-8 inline-flex w-fit items-center gap-3 text-sm text-white/70 hover:text-pink-300">
                <img src="/optimized/logo.webp" alt="Veadicastro logo" className="h-9 w-9 rounded-full" loading="eager" />
                Veadicastro
              </Link>
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
                <Heart className="h-4 w-4" />
                Free love astrology tool
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                AI Love Predictions by Date of Birth – Free, Instant & Chart-Based
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Enter your birth details to discover your romantic tendencies, emotional compatibility, relationship strengths, and love life outlook through an authentic Vedic reading.
              </p>
              <div className="mt-6 grid max-w-2xl gap-3 text-sm text-white/75 sm:grid-cols-2">
                {["No signup required", "No payment", "Instant streaming result", "Real Vedic chart - not a generic horoscope"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:flex-wrap">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-300/25 bg-green-300/10 px-4 py-2 text-green-100">
                  <ShieldCheck className="h-4 w-4" />
                  Powered by Swiss Ephemeris calculations
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-pink-200" />
                  Thousands of love readings given | Trusted across India, UK & Canada
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#marriage-tool" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-400">
                  Get My Love Prediction <ArrowRight className="h-4 w-4" />
                </a>
                <button type="button" onClick={() => setAuthOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white/85 hover:border-pink-400/60 hover:text-pink-200">
                  Ask any question to AI
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
              <img
                src="/optimized/ai-marriage-prediction-v2.webp"
                alt="Love astrology by date of birth with Vedic relationship insights"
                className="h-full min-h-[320px] w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-center px-4 mt-8">
          <AdBanner adSlot="5098435505" className="w-full max-w-[728px]" />
        </div>

        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-pink-400/20 bg-pink-400/10 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-200">How Vedika reads your love chart</p>
                <h2 className="mt-2 text-2xl font-black text-white">From birth details to instant chart-based answer</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Step 1", "Enter your birth details"],
                  ["Step 2", "Swiss Ephemeris calculates the chart"],
                  ["Step 3", "5th house, Venus, and Mars are analyzed"],
                  ["Step 4", "Instant streaming AI result"],
                ].map(([step, text]) => (
                  <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-200">{step}</p>
                    <p className="mt-2 text-sm leading-6 text-white/75">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="marriage-tool" className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-pink-300">Birth Details</p>
                <h2 className="mt-1 text-2xl font-black">Love astrology calculator</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-pink-200">
                <Heart className="h-6 w-6" />
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label className={labelClass}><User className="h-4 w-4" /> Name optional</Label>
                <Input className={inputClass} value={birthDetails.name} onChange={(e) => setField("name", e.target.value)} placeholder="Your name" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className={labelClass}><Calendar className="h-4 w-4" /> Day</Label>
                  <Select value={String(birthDetails.day)} onValueChange={(v) => setField("day", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{days.map((day) => <SelectItem key={day} value={String(day)}>{day}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Month</Label>
                  <Select value={String(birthDetails.month)} onValueChange={(v) => setField("month", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{months.map((month, i) => <SelectItem key={month} value={String(i + 1)}>{month}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Year</Label>
                  <Select value={String(birthDetails.year)} onValueChange={(v) => setField("year", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className={labelClass}><Clock className="h-4 w-4" /> Hour</Label>
                  <Select value={String(birthDetails.hour)} onValueChange={(v) => setField("hour", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{hours.map((hour) => <SelectItem key={hour} value={String(hour)}>{String(hour).padStart(2, "0")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Minute</Label>
                  <Select value={String(birthDetails.minute)} onValueChange={(v) => setField("minute", Number(v))}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>{minutes.map((minute) => <SelectItem key={minute} value={String(minute)}>{String(minute).padStart(2, "0")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Gender</Label>
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

              <div className="relative">
                <Label className={labelClass}><MapPin className="h-4 w-4" /> Birth place</Label>
                <div className="relative">
                  <Input
                    className={`${inputClass} pr-10`}
                    value={birthDetails.birthPlace}
                    onChange={(e) => {
                      setField("birthPlace", e.target.value);
                      searchLocation(e.target.value);
                    }}
                    onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
                    placeholder="Start typing your city"
                  />
                  {isSearchingLocation ? <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-pink-300" /> : <Search className="absolute right-3 top-3.5 h-5 w-5 text-white/35" />}
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

              <div>
                <Label className={labelClass}><MessageCircle className="h-4 w-4" /> Main question optional</Label>
                <Textarea
                  className="min-h-[92px] rounded-2xl border-white/10 bg-white/[0.06] text-white placeholder:text-white/35 focus:border-pink-400 focus:ring-pink-400"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What is the outlook for my love life?"
                />
              </div>

              {error && <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}

              <ButtonLite
                type="button"
                disabled={!canSubmit}
                onClick={() => runPrediction()}
                className="h-14 rounded-2xl bg-pink-500 text-base font-black text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Get My Marriage Prediction
              </ButtonLite>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[#0d0d16] p-5 shadow-xl shadow-black/20 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-2xl border border-pink-400/25 bg-pink-500/15">
                <img src="/optimized/vedika.webp" alt="Vedika AI astrologer" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div>
                <p className="text-sm font-semibold text-pink-300">Vedika's love reading</p>
                <h2 className="text-2xl font-black">Your result appears here</h2>
              </div>
            </div>

            <div className="min-h-[420px] rounded-[1.25rem] border border-white/10 bg-black/25 p-5">
              {!result && !isLoading && (
                <div className="flex h-full min-h-[360px] flex-col justify-center">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-pink-200">
                      Sample Result
                    </span>
                    <span className="text-xs font-semibold text-white/45">Preview</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      ["Romantic Nature:", "Venus shows a deep need for emotional connection and loyalty in love."],
                      ["Emotional Compatibility:", "You match best with partners who understand your need for steady affection."],
                      ["Relationship Strengths:", "You bring stability and patience into your romantic partnerships."],
                      ["Areas to Improve:", "Learning to express your needs openly will prevent misunderstandings."],
                      ["Love Outlook:", "A supportive period for meeting someone meaningful begins during the next Jupiter transit."],
                    ].map(([label, text]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-bold text-white">{label}</p>
                        <p className="mt-2 select-none text-sm leading-6 text-white/45 blur-[2px]">{text}</p>
                      </div>
                    ))}
                  </div>
                  <a href="#marriage-tool" className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-bold text-white hover:bg-pink-400">
                    Get Your Real Love Reading <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              )}

              {status && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status}
                </div>
              )}

              {result && <div className="whitespace-pre-wrap text-sm leading-7 text-white/82">{result}</div>}
            </div>

            {result && (
              <div className="mt-5 rounded-[1.25rem] border border-pink-400/20 bg-pink-400/10 p-5">
                <h3 className="font-bold text-white">Want a deeper love reading about romance, compatibility, and relationships?</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Sign up to ask Vedika any personal question about your love life, soulmate connections, relationship challenges, or dating patterns.
                </p>
                <div className="mt-4">
                  <ButtonLite
                    onClick={() => setAuthOpen(true)}
                    className="h-12 rounded-2xl bg-white text-sm font-bold text-black hover:bg-pink-100"
                  >
                    Ask any question to AI
                  </ButtonLite>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <button type="button" onClick={() => setAuthOpen(true)} className="text-pink-200 underline-offset-4 hover:underline">Ask any question to AI</button>
                  <Link to="/talk-to-astrologer" className="text-pink-200 underline-offset-4 hover:underline">Talk to an astrologer</Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-center px-4 mt-8">
          <AdBanner adSlot="6711166008" className="w-full max-w-[400px]" />
        </div>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-4">
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

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="mb-8 border-b border-white/10 pb-8">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
                Love Astrology Guide
              </p>
              <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">
                Understanding Love Astrology by Date of Birth
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
                Your birth chart holds profound insights into your romantic life. By providing your exact birth details, our AI analyzes planetary positions to reveal your romantic tendencies, emotional compatibility, and relationship patterns. This tool focuses entirely on how you give and receive love.
              </p>
            </div>

            <div className="space-y-9">
              <section>
                <h3 className="text-2xl font-black text-white">How Vedic Astrology Reads Your Love Life</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  In Vedic astrology, romance and relationships are primarily governed by the fifth house and the planet Venus. The fifth house rules courtship, romance, and creative expression of love. Venus is the natural indicator of affection, attraction, and how we bond with others. By studying these elements along with Mars, which brings passion and drive, Vedika builds a complete picture of your romantic nature.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">Sample Love Astrology Reading</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base mb-4">
                  Wondering what a reading looks like? Here is an example of what Vedika might reveal about your love life:
                </p>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-pink-300 font-bold mb-2">Romantic Nature:</p>
                  <p className="text-sm leading-6 text-white/80 mb-4">You have a deeply passionate and devoted approach to love. With Venus positioned strongly, you value loyalty and meaningful emotional connection over superficial dating.</p>
                  
                  <p className="text-pink-300 font-bold mb-2">Emotional Compatibility:</p>
                  <p className="text-sm leading-6 text-white/80 mb-4">You align best with partners who offer stability and open communication. Fire signs or strong Mars placements may complement your nurturing energy.</p>
                  
                  <p className="text-pink-300 font-bold mb-2">Relationship Strengths:</p>
                  <p className="text-sm leading-6 text-white/80 mb-4">Your patience and willingness to support your partner are your greatest strengths. You create a safe space for vulnerability.</p>
                  
                  <p className="text-pink-300 font-bold mb-2">Areas to Improve:</p>
                  <p className="text-sm leading-6 text-white/80 mb-4">You may sometimes sacrifice your own needs to keep peace. Learning to set healthy boundaries will greatly improve your relationship satisfaction.</p>
                  
                  <p className="text-pink-300 font-bold mb-2">Love Outlook:</p>
                  <p className="text-sm leading-6 text-white/80">The upcoming Jupiter transit over your fifth house brings a highly supportive period for finding genuine romance or deepening an existing bond.</p>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">Why Your Exact Birth Time Matters</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  While your birth date provides the general position of planets like Venus and Mars, your exact birth time determines your rising sign and the specific houses these planets occupy. A Venus in the fifth house behaves very differently from a Venus in the eighth house. Precise details ensure your relationship patterns are read accurately.
                </p>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  If you want to see exactly where your planets are placed, you can also use our <Link to="/free-kundli-generator" className="text-pink-300 underline-offset-4 hover:underline">Free Kundli Generator</Link> to generate your complete birth chart.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">Exploring Your Relationship Journey</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Understanding your love astrology is just the beginning. The goal is to bring awareness to your choices and emotional needs. It helps you recognize why certain dynamics repeat and how you can foster healthier, more fulfilling connections.
                </p>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  If you are curious about deeper marriage timing, you can try our <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-pink-300 underline-offset-4 hover:underline">Marriage Prediction by Date of Birth</Link> tool. Alternatively, if you want to chat directly with Vedika about a specific romantic situation, visit the <Link to="/free-ai-astrologer-chat" className="text-pink-300 underline-offset-4 hover:underline">Free AI Astrologer Chat</Link>. We also offer a <Link to="/free-5-minutes-astrology-ai" className="text-pink-300 underline-offset-4 hover:underline">Free 5 Minutes Astrology</Link> session for quick, personalized insights.
                </p>
              </section>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 flex-shrink-0 text-green-300" />
              <div>
                <h2 className="text-2xl font-black">Chart-first, calm, and responsible</h2>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  Vedika does not replace personal judgment or a human consultation. The page is designed to help you understand marriage indications with clarity, without fear-based pressure.
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

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-black">FAQs</h2>
          <p className="mb-6 text-sm leading-7 text-white/65">
            These marriage FAQs are part of the larger <Link to="/" className="text-pink-300 underline-offset-4 hover:underline">Veadicastro homepage</Link> experience, where users can compare AI astrology tools, start Vedika chat, generate Kundli details, and explore daily horoscope guidance.
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

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#0d0d16] p-6 sm:p-8">
            <h2 className="text-2xl font-black">Where to go next</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-white/65 sm:text-base">
              <p>
                If you are still building your birth-chart foundation, start with the <Link to="/free-kundli-generator" className="text-pink-300 underline-offset-4 hover:underline">Free Kundli Generator</Link>. If you already have a partner in mind, use <Link to="/free-kundali-matching" className="text-pink-300 underline-offset-4 hover:underline">Free Kundali Matching</Link> to understand compatibility before focusing only on timing.
              </p>
              <p>
                For broader relationship questions, continue with <Link to="/free-ai-astrologer-chat" className="text-pink-300 underline-offset-4 hover:underline">Vedika's free AI astrologer chat</Link>. For human support on sensitive decisions, the <Link to="/talk-to-astrologer" className="text-pink-300 underline-offset-4 hover:underline">Talk to Astrologer</Link> page is the better path.
              </p>
              <p>
                You can also read related guides on <Link to="/blog/marriage-muhurat-2026" className="text-pink-300 underline-offset-4 hover:underline">Marriage Muhurat 2026</Link>, <Link to="/blog/manglik-dosha-myths-vs-reality" className="text-pink-300 underline-offset-4 hover:underline">Manglik Dosha myths</Link>, <Link to="/blog/marriage-compatibility-based-on-your-zodiac-sign" className="text-pink-300 underline-offset-4 hover:underline">marriage compatibility by zodiac sign</Link>, and <Link to="/blog/is-ai-astrology-accurate" className="text-pink-300 underline-offset-4 hover:underline">whether AI astrology is accurate</Link>.
              </p>
              <p>
                To understand the AI side better, read <Link to="/ai-astrology" className="text-pink-300 underline-offset-4 hover:underline">AI Astrology</Link>, <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-pink-300 underline-offset-4 hover:underline">how AI is transforming Vedic astrology</Link>, <Link to="/blog/ai-jyotish-vedic-astrology" className="text-pink-300 underline-offset-4 hover:underline">AI Jyotish</Link>, <Link to="/blog/ai-astrologer-vs-human-astrologer" className="text-pink-300 underline-offset-4 hover:underline">AI astrologer vs human astrologer</Link>, <Link to="/blog/ai-astrology-real-or-fake" className="text-pink-300 underline-offset-4 hover:underline">AI astrology real or fake</Link>, <Link to="/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" className="text-pink-300 underline-offset-4 hover:underline">why ChatGPT fails at astrology</Link>, <Link to="/blog/ai-astrology-prediction-for-2026" className="text-pink-300 underline-offset-4 hover:underline">AI astrology prediction for 2026</Link>, <Link to="/blog/free-ai-astrology-chat-india" className="text-pink-300 underline-offset-4 hover:underline">free AI astrology chat India</Link>, <Link to="/blog/vedika-ai-astrologer-india" className="text-pink-300 underline-offset-4 hover:underline">Vedika AI astrologer India</Link>, <Link to="/blog/top-10-vedic-astrology-platform" className="text-pink-300 underline-offset-4 hover:underline">top Vedic astrology platforms</Link>, <Link to="/blog/online-jyotishi-vs-ai-astrologer" className="text-pink-300 underline-offset-4 hover:underline">online jyotishi vs AI astrologer</Link>, and <Link to="/blog/vedic-astrology-ai-kese-kaam-karta-ha" className="text-pink-300 underline-offset-4 hover:underline">Vedic astrology AI kaise kaam karta hai</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-pink-400/20 bg-pink-400/10 p-8 text-center">
            <h2 className="text-3xl font-black">Ready to understand your marriage timing?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Start with the free AI marriage prediction by date of birth, then go deeper with Vedika or a human astrologer when you need more context.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#marriage-tool" className="inline-flex items-center justify-center rounded-2xl bg-pink-500 px-6 py-4 text-sm font-bold text-white hover:bg-pink-400">Get My Marriage Prediction</a>
              <Link to="/free-ai-astrologer-chat" className="rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white/85 hover:border-pink-400/50">Ask any question to AI</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
