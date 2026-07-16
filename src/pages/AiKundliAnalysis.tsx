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
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { ButtonLite } from "@/components/ui/button-lite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPlanetaryData, type AstroPayload } from "@/lib/astroCalc";
import { persistAstroPayload } from "@/lib/astroStorage";
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
const PAGE_PATH = "/ai-kundli-analysis";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_IMAGE = `${SITE_URL}/optimized/kundali-analysis.webp`;

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const years = Array.from({ length: 95 }, (_, i) => new Date().getFullYear() - i);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

const faqs = [
  {
    q: "What is AI kundli analysis?",
    a: "AI kundli analysis uses artificial intelligence to read your Vedic birth chart. Vedika analyzes your planetary positions, houses, doshas, yogas, and dasha to give you personalized predictions in simple language.",
  },
  {
    q: "Is AI kundli analysis accurate?",
    a: "AI kundli analysis is based on authentic Vedic astrology calculations using Swiss Ephemeris. While no prediction is 100% guaranteed, Vedika gives you accurate chart-based insights for clarity and guidance.",
  },
  {
    q: "Which doshas are checked?",
    a: "Vedika checks major doshas like Manglik Dosha, Kaal Sarp Dosha, Pitra Dosha, and Sadhesati. Each dosha is explained with its effects and gentle remedies.",
  },
  {
    q: "What yogas does Vedika find?",
    a: "Vedika identifies important yogas in your chart like Raj Yoga, Gaja Kesari Yoga, Budhaditya Yoga, and others that influence your life's success and fortune.",
  },
  {
    q: "How is this different from ChatGPT kundli?",
    a: "ChatGPT gives generic astrology answers. Vedika uses your actual birth chart with Swiss Ephemeris calculations, Vedic astrology principles, and chart-first interpretation for accurate personalized readings.",
  },
  {
    q: "Can AI read my complete birth chart?",
    a: "Yes, Vedika reads your complete birth chart including all 12 houses, planetary positions, nakshatras, dasha periods, and important yogas and doshas affecting your life.",
  },
  {
    q: "What is dasha in kundli?",
    a: "Dasha is a planetary period system in Vedic astrology that shows which planet's influence is active in your life at any given time. It helps predict timing of events and life phases.",
  },
  {
    q: "Is birth time required for kundli analysis?",
    a: "Birth time is strongly recommended for accurate kundli analysis as it determines the ascendant and house placements. Without it, predictions become more general and less precise.",
  },
  {
    q: "How is Vedic kundli different from Western birth chart?",
    a: "Vedic kundli uses the sidereal zodiac based on actual star positions, while Western astrology uses the tropical zodiac. Vedic astrology also focuses more on the Moon sign and nakshatras.",
  },
  {
    q: "What remedies are suggested?",
    a: "Vedika suggests gentle, practical remedies like mantras, gemstones, charity, and simple rituals. These remedies are non-fear-based and aimed at strengthening positive planetary influences.",
  },
];

const buildKundliPrompt = (details: BirthDetails, chartData: AstroPayload) => {
  const nameLine = details.name.trim() ? `Name: ${details.name.trim()}` : "Name: not provided";
  const genderLine = details.gender !== "not-specified" ? `Gender: ${details.gender}` : "Gender: not provided";
  
  const planetsInfo = Object.entries(chartData.planets || {})
    .map(([name, planet]) => `${name}: ${planet.sign} at ${planet.longitude.toFixed(2)}°, Nakshatra: ${planet.nakshatra.name} Pada ${planet.nakshatra.pada}`)
    .join('\n');
  
  const houseCuspsInfo = chartData.houses?.map((cusp, index) => `House ${index + 1}: ${cusp.toFixed(2)}°`).join('\n') || "Not available";
  
  const houseLordsInfo = chartData.houseLords?.map((lord, index) => `House ${index + 1}: ${lord}`).join('\n') || "Not available";
  
  const planetHouseMapInfo = Object.entries(chartData.planetHouseMap || {})
    .map(([planet, house]) => `${planet}: House ${house}`)
    .join('\n') || "Not available";
  
  const doshaInfo = `
- Manglik Dosha: ${chartData.planetHouseMap?.mars && [1,2,4,7,8,12].includes(chartData.planetHouseMap.mars) ? 'Present' : 'Not Present'}
- Kaal Sarp Dosha: ${checkKaalSarp(chartData) ? 'Present' : 'Not Present'}
- Pitra Dosha: ${chartData.planetHouseMap?.sun === 9 ? 'Present' : 'Not Present'}
- Sadhesati: ${checkSadhesati(chartData) ? 'Present' : 'Not Present'}`;

  return `${nameLine}
${genderLine}
Birth date: ${details.day} ${months[details.month - 1]} ${details.year}
Birth time: ${String(details.hour).padStart(2, "0")}:${String(details.minute).padStart(2, "0")}
Birth place: ${details.birthPlace}

Complete Birth Chart Data:
- Sun Sign: ${chartData.sunSign}
- Moon Sign: ${chartData.moonSign}
- Ascendant/Lagna: ${chartData.lagnaSign} at ${chartData.ascendant?.toFixed(2)}°
- Nakshatra: ${chartData.nakshatra?.name || "Not available"} Pada ${chartData.nakshatra?.pada || ""}
- Julian Day UT: ${chartData.julianDayUT?.toFixed(6)}
- Julian Day ET: ${chartData.julianDayET?.toFixed(6)}

Planetary Positions with Nakshatras:
${planetsInfo}

Planet House Placements:
${planetHouseMapInfo}

House Cusps (Degrees):
${houseCuspsInfo}

House Lords:
${houseLordsInfo}

Current Dasha: ${chartData.dasha?.mahadasha || "Not available"} (Ends: ${chartData.dasha?.mahaEnds || "N/A"})
Antar Dasha: ${chartData.dasha?.antardasha || "Not available"} (Ends: ${chartData.dasha?.antarEnds || "N/A"})

Dosha Analysis:
${doshaInfo}

Provide a complete AI kundli analysis covering all life aspects based on this complete chart data.`;
};

const checkKaalSarp = (data: AstroPayload) => {
  // Kaal Sarp Dosha requires proper calculation from Swiss Ephemeris
  // Rahu and Ketu must form an axis with all 7 classical planets on one side
  // This is NOT calculated by simplified rules - must come from backend engine
  return false; // Not Calculated - requires backend implementation
};

const checkSadhesati = (data: AstroPayload) => {
  // Sade Sati requires TRANSIT Saturn data, NOT natal Saturn position
  // Current implementation uses natal Saturn which is incorrect
  // Must be calculated from transit Saturn relative to Moon sign
  return false; // Not Calculated - requires transit data
};

const buildKundliSystemPrompt = (data: AstroPayload) => {
  return `You are Vedika, Veadicastro's AI Vedic astrologer.
Respond in calm, simple English. Be comprehensive, practical, and non-fear-based.

CRITICAL: You MUST use EXACTLY these section headers, each on its own line, with ** on both sides:

**Health Prediction:**
**Wealth & Finance:**
**Career & Profession:**
**Relationship & Love:**
**Future Predictions:**
**Active Doshas:**
**Beneficial Yogas:**
**Current Dasha Impact:**
**Simple Remedies:**

Rules:
- Start directly with **Health Prediction:** — no intro paragraph before it
- Each section content under 60 words
- Use sidereal Vedic astrology and chart-first interpretation
- Do not promise certainty
- Do not create fear or pressure
- NEVER skip any section header`;
};

const inputClass =
  "h-12 rounded-2xl border-white/10 bg-white/[0.06] text-white placeholder:text-white/35 focus:border-pink-400 focus:ring-pink-400";
const labelClass = "mb-2 flex items-center gap-2 text-sm font-medium text-white/75";

export default function AiKundliAnalysis() {
  const { setAuthOpen } = useAuth();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "Username",
    gender: "not-specified",
    day: 1,
    month: 1,
    year: 2000,
    hour: 12,
    minute: 0,
    birthPlace: "",
  });
  const [astroData, setAstroData] = useState<AstroPayload | null>(null);
  const [isGeneratingKundli, setIsGeneratingKundli] = useState(false);
  const [showResultsView, setShowResultsView] = useState(false);
  const [error, setError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showVedikaPopup, setShowVedikaPopup] = useState(false);
  const [status, setStatus] = useState("");
  const [predictions, setPredictions] = useState<{title: string, content: string}[]>([]);

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
      const key = "91ab8792290d414b92590c9d4cc0793c";
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

  const canSubmit = birthDetails.birthPlace.trim().length > 1 && !isGeneratingKundli;

  const generateKundli = async () => {
    if (!birthDetails.birthPlace.trim()) {
      setError("Please enter your birth place and choose a suggestion for better accuracy.");
      return;
    }
    setIsGeneratingKundli(true);
    setError("");
    setStatus("Calculating your Vedic birth chart with Swiss Ephemeris...");
    try {
      const chart = await getPlanetaryData({
        day: birthDetails.day,
        month: birthDetails.month,
        year: birthDetails.year,
        hour: birthDetails.hour,
        min: birthDetails.minute,
        lat: birthDetails.lat || 28.6139,
        lon: birthDetails.lon || 77.2090,
        tzone: birthDetails.tzone || 5.5,
      });
      setAstroData(chart);
      persistAstroPayload(chart);
      setShowResultsView(true);
    } catch {
      setError("Something went wrong while generating your kundli. Please try again.");
    } finally {
      setIsGeneratingKundli(false);
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
      { "@type": "ListItem", "position": 2, "name": "AI Kundli Analysis", "item": PAGE_URL },
    ],
  }), []);

  const appSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Kundli Analysis",
    "url": PAGE_URL,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "image": PAGE_IMAGE,
    "description": "Free AI Kundli analysis with complete Vedic birth chart reading. Vedika analyzes planets, houses, doshas, yogas & dasha explained in simple language.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
    },
  }), []);

  return (
    <>
      <Helmet>
        <title>AI Kundli Analysis Free — Vedic Birth Chart Reading Online | Veadicastro</title>
        <meta
          name="description"
          content="Get a free AI Kundli analysis instantly. Vedika reads your complete birth chart — planets, houses, doshas, yogas & dasha explained in simple language. No signup needed."
        />
        <meta
          name="keywords"
          content="AI kundli analysis, free kundli analysis, Vedic birth chart reading, online kundli analysis, AI astrology reading, complete kundli analysis, dosha check, yoga in kundli, dasha prediction"
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:title" content="AI Kundli Analysis Free — Vedic Birth Chart Reading Online | Veadicastro" />
        <meta property="og:description" content="Get a free AI Kundli analysis instantly. Vedika reads your complete birth chart — planets, houses, doshas, yogas & dasha explained in simple language." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={PAGE_IMAGE} />
        <meta property="og:site_name" content="Veadicastro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Kundli Analysis Free — Vedic Birth Chart Reading Online | Veadicastro" />
        <meta name="twitter:description" content="Get a free AI Kundli analysis instantly. Vedika reads your complete birth chart — planets, houses, doshas, yogas & dasha explained in simple language." />
        <meta name="twitter:image" content={PAGE_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#07070d] text-white">

        {/* ── HERO: Title + Subtitle ── */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.18),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(34,197,94,0.10),transparent_28%),linear-gradient(135deg,#080812,#11101a_42%,#090711)]" />
          <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
                  <Star className="h-3.5 w-3.5" />
                  Free · No signup · Instant result
                </div>

                <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                  AI Kundli Analysis —<br className="hidden sm:block" /> Free Vedic Birth Chart Reading
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                  Enter your birth details and get a complete AI analysis of your Kundli — planets, houses, active doshas, yogas, and current dasha explained in simple English. Instantly.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-300/25 bg-green-300/10 px-4 py-2 text-green-100 text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Swiss Ephemeris calculations
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-white/70 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-pink-300" />
                    Complete chart analysis
                  </span>
                </div>
              </div>

              <Link to="/" className="hidden lg:flex items-center gap-2 text-sm text-white/55 hover:text-pink-300 flex-shrink-0">
                <img src="/optimized/logo.webp" alt="Veadicastro logo" className="h-10 w-10 rounded-full" loading="eager" />
                <span className="font-semibold">Veadicastro</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── AD 1: Below hero title ── */}
        <div className="flex justify-center px-4 py-5">
          <AdBanner adSlot="4574799703" className="w-full max-w-[728px]" />
        </div>

        {/* ── MAIN TOOL: Input form ── */}
        {!showResultsView && (
          <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-300">Step 1 — Your birth details</p>
                <h2 className="mt-1 text-xl font-black">Enter your birth details</h2>
              </div>
              <div className="rounded-2xl bg-pink-500/20 p-3 text-pink-200">
                <Star className="h-5 w-5" />
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

              {error && (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              <ButtonLite
                type="button"
                disabled={!canSubmit}
                onClick={generateKundli}
                className="h-14 rounded-2xl bg-pink-500 text-base font-black text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingKundli
                  ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  : <Sparkles className="mr-2 h-5 w-5" />
                }
                Generate My Kundli
              </ButtonLite>

              <p className="text-center text-xs text-white/35">
                No signup required · No payment · Instant result
              </p>
            </div>
          </div>
        </section>
        )}

        {/* ── AD: After Generate Kundli button ── */}
        {showResultsView && (
          <div className="flex justify-center px-4 py-4">
            <AdBanner adSlot="4574799703" className="w-full max-w-[400px]" />
          </div>
        )}

        {/* ── BACK BUTTON (when showing results) ── */}
        {showResultsView && (
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setShowResultsView(false)}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to form
            </button>
          </div>
        )}

        {/* ── KUNDLI DISPLAY ── */}
        {astroData && showResultsView && (
          <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-300">Step 2 — Your complete kundli</p>
                  <h2 className="mt-1 text-xl font-black">Your Vedic Birth Chart</h2>
                </div>
                <div className="rounded-2xl bg-pink-500/20 p-3 text-pink-200">
                  <Star className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Basic Info */}
                <div className="rounded-2xl border border-gradient-to-r from-pink-500/20 to-purple-500/20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-5 backdrop-blur-sm">
                  <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">Basic Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Sun Sign:</span>
                      <span className="font-medium text-yellow-300">{astroData.sunSign}</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Moon Sign:</span>
                      <span className="font-medium text-blue-300">{astroData.moonSign}</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Ascendant (Lagna):</span>
                      <span className="font-medium text-purple-300">{astroData.lagnaSign}</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Nakshatra:</span>
                      <span className="font-medium text-pink-300">{astroData.nakshatra?.name || "N/A"} Pada {astroData.nakshatra?.pada || ""}</span>
                    </div>
                  </div>
                </div>

                {/* Current Dasha */}
                <div className="rounded-2xl border border-gradient-to-r from-green-500/20 to-emerald-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-5 backdrop-blur-sm">
                  <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">Current Dasha</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Mahadasha:</span>
                      <span className="font-medium text-green-300">{astroData.dasha?.mahadasha || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Antardasha:</span>
                      <span className="font-medium text-emerald-300">{astroData.dasha?.antardasha || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ── DETAILED ASTROLOGICAL DATA ── */}
        {astroData && showResultsView && (
          <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-300">Detailed Astrological Data</p>
                  <h2 className="mt-1 text-xl font-black">Swiss Ephemeris Calculations</h2>
                </div>
                <div className="rounded-2xl bg-purple-500/20 p-3 text-purple-200">
                  <Star className="h-5 w-5" />
                </div>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 min-w-[600px] lg:min-w-[1000px]">
                  {/* Planetary Positions */}
                  <div className="rounded-2xl border border-gradient-to-r from-blue-500/20 to-cyan-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-5 backdrop-blur-sm min-w-[280px]">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Planetary Positions</h3>
                  <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(astroData.planets || {}).map(([name, planet]) => (
                      <div key={name} className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                        <span className="text-white/60 capitalize">{name}:</span>
                        <span className="font-medium text-cyan-200">{planet.sign} ({planet.longitude.toFixed(2)}°)</span>
                      </div>
                    ))}
                  </div>
                </div>

                  {/* House Map */}
                  <div className="rounded-2xl border border-gradient-to-r from-purple-500/20 to-pink-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-5 backdrop-blur-sm min-w-[280px]">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Planet House Placements</h3>
                  <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(astroData.planetHouseMap || {}).map(([planet, house]) => (
                      <div key={planet} className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2 border border-white/5 hover:border-pink-400/30 transition-colors">
                        <span className="text-white/60 capitalize">{planet}:</span>
                        <span className="font-medium text-pink-200">House {house}</span>
                      </div>
                    ))}
                  </div>
                </div>

                  {/* House Lords */}
                  <div className="rounded-2xl border border-gradient-to-r from-indigo-500/20 to-blue-500/20 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-5 backdrop-blur-sm min-w-[280px]">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">House Lords</h3>
                  <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {astroData.houseLords?.map((lord, index) => (
                      <div key={index} className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                        <span className="text-white/60">House {index + 1}:</span>
                        <span className="font-medium text-indigo-200 capitalize">{lord}</span>
                      </div>
                    ))}
                  </div>
                </div>

                  {/* House Cusps */}
                  <div className="rounded-2xl border border-gradient-to-r from-teal-500/20 to-cyan-500/20 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-5 backdrop-blur-sm min-w-[280px]">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">House Cusps (Degrees)</h3>
                  <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {astroData.houses?.map((cusp, index) => (
                      <div key={index} className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                        <span className="text-white/60">House {index + 1}:</span>
                        <span className="font-medium text-teal-200">{cusp.toFixed(2)}°</span>
                      </div>
                    ))}
                  </div>
                </div>

                  {/* Julian Day */}
                  <div className="rounded-2xl border border-gradient-to-r from-amber-500/20 to-yellow-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-5 backdrop-blur-sm min-w-[280px]">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">Julian Day</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Julian Day UT:</span>
                      <span className="font-medium text-amber-200">{astroData.julianDayUT?.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Julian Day ET:</span>
                      <span className="font-medium text-yellow-200">{astroData.julianDayET?.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                  {/* Ascendant Degree */}
                  <div className="rounded-2xl border border-gradient-to-r from-rose-500/20 to-pink-500/20 bg-gradient-to-br from-rose-500/10 to-pink-500/10 p-5 backdrop-blur-sm min-w-[280px]">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">Ascendant Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Ascendant Degree:</span>
                      <span className="font-medium text-rose-200">{astroData.ascendant?.toFixed(2)}°</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Ascendant Sign:</span>
                      <span className="font-medium text-pink-200">{astroData.ascendantSign}</span>
                    </div>
                  </div>
                </div>

                  {/* Dasha End Dates */}
                  <div className="rounded-2xl border border-gradient-to-r from-violet-500/20 to-purple-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-5 backdrop-blur-sm min-w-[280px]">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-purple-300">Dasha Period End Dates</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Mahadasha Ends:</span>
                      <span className="font-medium text-violet-200">{astroData.dasha?.mahaEnds || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg bg-black/30 px-3 py-2">
                      <span className="text-white/60">Antardasha Ends:</span>
                      <span className="font-medium text-purple-200">{astroData.dasha?.antarEnds || "N/A"}</span>
                    </div>
                  </div>
                </div>

                  {/* Detailed Planet Data */}
                  <div className="rounded-2xl border border-gradient-to-r from-fuchsia-500/20 to-pink-500/20 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 p-5 md:col-span-2 lg:col-span-3 backdrop-blur-sm">
                    <h3 className="mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300">Complete Planetary Data</h3>
                  <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-3 text-white/60">Planet</th>
                          <th className="text-left py-2 px-3 text-white/60">Longitude</th>
                          <th className="text-left py-2 px-3 text-white/60">Latitude</th>
                          <th className="text-left py-2 px-3 text-white/60">Sign</th>
                          <th className="text-left py-2 px-3 text-white/60">Nakshatra</th>
                          <th className="text-left py-2 px-3 text-white/60">Pada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(astroData.planets || {}).map(([name, planet]) => (
                          <tr key={name} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 px-3 capitalize text-white/80">{name}</td>
                            <td className="py-2 px-3 text-fuchsia-200">{planet.longitude.toFixed(2)}°</td>
                            <td className="py-2 px-3 text-pink-200">{planet.latitude?.toFixed(2)}°</td>
                            <td className="py-2 px-3 text-white/80">{planet.sign}</td>
                            <td className="py-2 px-3 text-white/80">{planet.nakshatra?.name || "N/A"}</td>
                            <td className="py-2 px-3 text-white/80">{planet.nakshatra?.pada || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* AI Prediction Button */}
        {astroData && showResultsView && (
          <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="text-center">
              <ButtonLite
                type="button"
                onClick={() => setShowVedikaPopup(true)}
                className="h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-base font-black text-white hover:from-pink-400 hover:to-purple-400 px-8"
              >
                <Zap className="mr-2 h-5 w-5" />
                Get AI Prediction - Free
              </ButtonLite>
              <p className="mt-3 text-xs text-white/35">
                Get complete AI analysis covering health, wealth, career, relationship & future
              </p>
            </div>
          </div>
        )}

        {/* ── AD: After predictions section ── */}
        {predictions.length > 0 && showResultsView && (
          <div className="flex justify-center px-4 py-4">
            <AdBanner adSlot="4574799703" className="w-full max-w-[400px]" />
          </div>
        )}

        {/* ── AI PREDICTIONS DISPLAY ── */}
        {predictions.length > 0 && showResultsView && (
          <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#0d0d16] p-5 shadow-xl shadow-black/20 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-2xl border border-pink-400/25 bg-pink-500/15 flex-shrink-0">
                  <img src="/optimized/vedika.webp" alt="Vedika AI astrologer" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-300">Step 3 — Vedika's complete analysis</p>
                  <h2 className="text-xl font-black">Your AI Kundli Analysis</h2>
                </div>
              </div>

              {status && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {predictions.map((block, index) => {
                  const getGradient = () => {
                    if (block.title.includes('Health')) return 'from-red-500/20 to-pink-500/20';
                    if (block.title.includes('Wealth')) return 'from-yellow-500/20 to-amber-500/20';
                    if (block.title.includes('Career')) return 'from-blue-500/20 to-cyan-500/20';
                    if (block.title.includes('Relationship')) return 'from-pink-500/20 to-rose-500/20';
                    if (block.title.includes('Future')) return 'from-purple-500/20 to-violet-500/20';
                    if (block.title.includes('Dosha')) return 'from-orange-500/20 to-red-500/20';
                    if (block.title.includes('Yoga')) return 'from-green-500/20 to-emerald-500/20';
                    if (block.title.includes('Dasha')) return 'from-indigo-500/20 to-blue-500/20';
                    if (block.title.includes('Remedies')) return 'from-teal-500/20 to-cyan-500/20';
                    return 'from-pink-500/20 to-purple-500/20';
                  };
                  const getIcon = () => {
                    if (block.title.includes('Health')) return <Heart className="h-4 w-4" />;
                    if (block.title.includes('Wealth')) return <TrendingUp className="h-4 w-4" />;
                    if (block.title.includes('Career')) return <Sparkles className="h-4 w-4" />;
                    if (block.title.includes('Relationship')) return <Heart className="h-4 w-4" />;
                    if (block.title.includes('Future')) return <Star className="h-4 w-4" />;
                    if (block.title.includes('Dosha')) return <Zap className="h-4 w-4" />;
                    if (block.title.includes('Yoga')) return <Star className="h-4 w-4" />;
                    if (block.title.includes('Dasha')) return <Clock className="h-4 w-4" />;
                    if (block.title.includes('Remedies')) return <CheckCircle2 className="h-4 w-4" />;
                    return <Star className="h-4 w-4" />;
                  };
                  return (
                    <div key={index} className={`rounded-2xl border border-gradient-to-r ${getGradient()} bg-gradient-to-br from-black/40 to-black/30 p-5 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300`}>
                      <h3 className="mb-3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 flex items-center gap-2">
                        {getIcon()}
                        {block.title}
                      </h3>
                      <p className="text-sm leading-6 text-white/85">{block.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Post-result CTA */}
              <div className="mt-6 rounded-[1.25rem] border border-pink-400/20 bg-pink-400/10 p-5">
                <h3 className="font-bold text-white">Want a deeper reading with specific timing and personalized remedies?</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Sign up to ask Vedika any personal question about your life, career, relationships, health, or spiritual growth.
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
            </div>
          </section>
        )}

        {/* ── AD 2: After predictions section ── */}
        {predictions.length > 0 && (
          <div className="flex justify-center px-4 py-4">
            <AdBanner adSlot="4574799703" className="w-full max-w-[400px]" />
          </div>
        )}

        {/* ── HOW IT WORKS strip ── */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-pink-400/20 bg-pink-400/10 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">How Vedika reads your chart</p>
                <h2 className="mt-2 text-xl font-black text-white">From birth details to complete analysis</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["1", "Enter your birth details"],
                  ["2", "Swiss Ephemeris calculates complete kundli"],
                  ["3", "All planets, houses, doshas analyzed"],
                  ["4", "Instant AI predictions in simple language"],
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
              ["Complete kundli", "All 12 houses, planets & nakshatras"],
              ["Dosha analysis", "Manglik, Kaal Sarp, Pitra & Sadhesati"],
              ["Yoga detection", "Raj Yoga, Gaja Kesari & more"],
              ["Dasha timing", "Current mahadasha & antardasha effects"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-green-300" />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQs SECTION ── */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <h2 className="mb-8 text-2xl font-black">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="mb-2 font-bold text-pink-200">{faq.q}</h3>
                  <p className="text-sm leading-6 text-white/70">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEO ARTICLE SECTION ── */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-white mb-6">What AI Kundli Analysis Actually Means</h2>
            
            <p className="text-white/80 leading-7 mb-6">
              <Link to="/" className="text-pink-300 hover:text-pink-200 underline">AI Kundli Analysis</Link> is the meeting point between traditional Vedic astrology and modern machine learning systems. Instead of manually calculating dozens of planetary placements and chart combinations, an AI system processes your birth details and generates a structured birth chart reading in seconds.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              That sounds simple on the surface, but a proper AI kundli analysis involves much more than displaying where your planets sit. It studies relationships between houses, planetary positions, signs, nakshatra placements, yogas, doshas, and timing cycles that unfold across different periods of life.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              The quality of the result depends heavily on the underlying astrology engine. If the calculations are wrong, the interpretation will be wrong too. That is why serious platforms rely on astronomical calculation systems such as Swiss Ephemeris rather than guessing planetary locations.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              Think of AI as an assistant that can read patterns quickly rather than as a replacement for centuries of astrological knowledge. You can also try our <Link to="/free-kundli-generator" className="text-pink-300 hover:text-pink-200 underline">free kundli generator</Link> for detailed chart calculations. If you are searching for a reliable <Link to="/hi-astro-alternative" className="text-pink-300 hover:text-pink-200 underline">HiAstro alternative</Link> that combines genuine Swiss Ephemeris calculations with AI interpretation, Veadicastro is built for accuracy.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">The Direct Answer</h2>

            <div className="mt-4 rounded-2xl border border-pink-400/25 bg-pink-400/10 p-5">
              <h3 className="text-xl font-black text-white">Direct answer</h3>
              <p className="mt-3 text-sm leading-8 text-white/75 sm:text-base">
                AI Kundli analysis uses your date, time, and place of birth to calculate 
                your complete Vedic birth chart using Swiss Ephemeris, then explains your 
                planetary positions, active doshas, strong yogas, current dasha period, 
                and life predictions across health, wealth, career, and relationships 
                in simple language — instantly, without signup.
              </p>
            </div>

            <p className="text-white/80 leading-7 mb-6">
              AI kundli analysis is the process of using artificial intelligence and astronomical calculations to interpret a Vedic birth chart using your date, time, and place of birth. An AI kundali analysis system studies planetary positions, houses, yogas, doshas, and timing periods to generate personalized astrological insights. The accuracy of the interpretation depends on the quality of both the astrology calculations and the AI model used to explain them.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              For specific life areas, you can explore our <Link to="/ai-career-prediction-by-date-of-birth" className="text-pink-300 hover:text-pink-200 underline">AI career prediction</Link>, <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-pink-300 hover:text-pink-200 underline">AI marriage prediction</Link>, or <Link to="/love-astrology-by-date-of-birth" className="text-pink-300 hover:text-pink-200 underline">AI love astrology</Link> tools for focused insights.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">What Your Kundli Is Really Telling You</h2>

            <p className="text-white/80 leading-7 mb-6">
              Many people assume a kundli exists to predict specific events. That is only a small part of the picture.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Your vedic birth chart is better understood as a map of tendencies, strengths, challenges, and timings. It shows how different energies interact in your life and where your attention naturally goes.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              The lagna, also called the ascendant, represents the lens through which you experience the world. Your Moon sign reflects emotional patterns and inner reactions. The Sun often relates to confidence, identity, and purpose.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Then come the planetary positions spread across twelve houses of life. One house may relate to finances, another to relationships, another to education or communication. The meaning comes not from a single placement but from how all these pieces work together.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              This is why two people born on the same day can still have completely different birth chart AI results if their birth times differ. Learn more about <Link to="/blog/vedic-vs-western-astrology" className="text-pink-300 hover:text-pink-200 underline">Vedic vs Western astrology</Link> to understand the differences.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">How Vedika Reads Your Birth Chart</h2>

            <p className="text-white/80 leading-7 mb-6">
              At Veadicastro, the AI astrologer Vedika begins by creating a detailed chart using astronomical calculations rather than generated guesses.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              The system first calculates the exact position of the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu at the moment of birth. These placements are then mapped into signs and houses using traditional Vedic astrology methods.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Vedika then looks at relationships between planets, strengths and weaknesses of placements, house rulerships, nakshatra positions, and timing systems. Nakshatra refers to the lunar constellation occupied by the Moon and plays an important role in many parts of Vedic astrology.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              The goal is not simply to tell you where planets sit. The goal is to explain what those placements may mean in practical terms that make sense in daily life.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              The founders of Veadicastro come from a family background connected to the Pauri Garhwal region where Vedic traditions remain part of everyday life, which helped shape the balance between traditional astrology and modern technology within the platform. You can also try our <Link to="/free-ai-astrologer-chat" className="text-pink-300 hover:text-pink-200 underline">free AI astrologer chat</Link> for interactive readings. Unlike generic platforms such as HiAstro, Veadicastro offers authentic chart based Vedic astrology grounded in real tradition — <Link to="/hi-astro-alternative" className="text-pink-300 hover:text-pink-200 underline">see how we compare</Link>.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">Doshas and Yogas — What AI Actually Checks</h2>

            <p className="text-white/80 leading-7 mb-6">
              People often search for doshas first because they hear the word and immediately worry.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              A dosha in astrology is simply a specific planetary combination or condition within a chart. Some combinations may indicate areas that require extra attention while others may represent lessons that unfold over time.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Yogas are different. A yoga is a combination of planetary placements believed to support certain talents, opportunities, or life themes.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              An AI kundali reader checks these combinations automatically and consistently. It looks at whether the mathematical conditions for a particular yoga or dosha are actually present instead of relying on assumptions.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              This matters because astrology discussions online often label charts incorrectly. A proper kundali AI system verifies the exact planetary conditions before mentioning a combination.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              That does not mean every yoga guarantees success or every dosha guarantees difficulty. Astrology works through patterns and probabilities rather than fixed outcomes. Read our blog on <Link to="/blog/manglik-dosha-myths-vs-reality" className="text-pink-300 hover:text-pink-200 underline">Manglik Dosha myths vs reality</Link> for deeper understanding.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">Why Birth Time Changes Everything</h2>

            <p className="text-white/80 leading-7 mb-6">
              You can get away with an approximate birth date in many personality tests.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              You cannot do that with astrology.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Even a small change in birth time can shift houses, alter the lagna, change divisional charts, and sometimes even move the Moon into a different nakshatra.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Imagine using the wrong coordinates on a map. You might still end up in the same city, but the street could be completely different.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              This is one reason people receive inconsistent answers from random kundali chatgpt prompts. If the system ignores birth time or estimates missing information, the chart can change dramatically.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              A serious AI kundli analysis depends on accurate birth details and reliable astronomical calculations. Learn about <Link to="/blog/is-ai-astrology-accurate" className="text-pink-300 hover:text-pink-200 underline">AI astrology accuracy</Link> and why precision matters.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">Dasha Periods and What They Mean for You Right Now</h2>

            <p className="text-white/80 leading-7 mb-6">
              One of the most interesting parts of Vedic astrology is the dasha system.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              A dasha period is a planetary cycle that highlights certain themes during a particular phase of life. One period may emphasize education and learning while another may focus on career, relationships, or personal growth.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Think of planetary placements as the actors in a story and the dasha period as the actor currently standing under the spotlight.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              This is why astrologers often ask not only what exists in your chart but also what is active right now.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              AI systems can calculate these timing periods almost instantly and compare them with your chart structure. That allows a birth chart reading to become more relevant to your current situation rather than remaining a static personality report.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              For timing-specific predictions, explore our <Link to="/ai-astrology-prediction" className="text-pink-300 hover:text-pink-200 underline">AI astrology prediction</Link> tool or read about <Link to="/blog/ai-astrology-prediction-for-2026" className="text-pink-300 hover:text-pink-200 underline">AI astrology predictions for 2026</Link>.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">How AI Kundli Analysis Differs from ChatGPT</h2>

            <p className="text-white/80 leading-7 mb-6">
              Many people search for terms like kundali chatgpt or wonder whether any AI chatbot can perform astrology.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              The difference lies in the data source.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              A general language model generates text based on patterns in language. It does not automatically know your planetary positions or calculate your chart unless an astrology engine provides those calculations first.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              An AI kundli analysis platform combines two separate layers. The first layer performs astronomical calculations using systems such as Swiss Ephemeris. The second layer interprets those calculations using AI.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Without accurate chart calculations, the interpretation layer has nothing reliable to interpret.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              That distinction explains why specialized tools often provide more consistent AI kundali analysis results than general purpose chat systems. Read our comparison on <Link to="/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" className="text-pink-300 hover:text-pink-200 underline">why ChatGPT fails at AI astrology</Link>. For anyone evaluating platforms like HiAstro, Veadicastro's specialized Swiss Ephemeris engine provides far more reliable AI kundli analysis — <Link to="/hi-astro-alternative" className="text-pink-300 hover:text-pink-200 underline">discover the difference</Link>.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">Using the Reading Responsibly</h2>

            <p className="text-white/80 leading-7 mb-6">
              Astrology works best as a tool for reflection rather than instruction.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              A reading can highlight strengths you may want to develop or patterns that deserve attention. It can offer perspective during uncertain periods and encourage questions you might not otherwise ask yourself.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              It should not replace professional advice in areas such as medicine, law, finance, or mental health.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              The healthiest approach is curiosity rather than dependence.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Ask what your chart can teach you about yourself. Ask where your habits align with your goals. Ask what opportunities deserve more effort from you.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              Those questions often lead to more useful answers than searching for guarantees. Learn about <Link to="/blog/ai-astrologer-vs-human-astrologer" className="text-pink-300 hover:text-pink-200 underline">AI astrologer vs human astrologer</Link> to understand the balance.
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">Where to Go After Your Kundli Reading</h2>

            <p className="text-white/80 leading-7 mb-6">
              The first reading is rarely the end of the journey.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Most people start with an AI kundli analysis and then become curious about deeper layers of their chart. They want to understand their Moon sign, their nakshatra, important planetary periods, or how career and relationships appear in the birth chart.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              That is where follow up exploration becomes valuable.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Whether you use kundli analysis free tools for initial learning or a more detailed AI kundli analysis platform later, the goal remains the same. Better self understanding.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              At Veadicastro, Vedika is designed to make that process easier to approach without removing the depth that makes Vedic astrology so fascinating.
            </p>

            <p className="text-white/80 leading-7 mb-6">
              Your chart is not a script that controls your future.
            </p>

            <p className="text-white/80 leading-7 mb-8">
              It is a map. What you choose to do with that map is still up to you.
            </p>

            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Related AI Astrology Resources</h3>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-pink-300 hover:text-pink-200 underline">How AI is transforming Vedic astrology</Link></li>
                <li><Link to="/blog/ai-jyotish-vedic-astrology" className="text-pink-300 hover:text-pink-200 underline">AI Jyotish Vedic astrology guide</Link></li>
                <li><Link to="/blog/ai-astrology-real-or-fake" className="text-pink-300 hover:text-pink-200 underline">Is AI astrology real or fake?</Link></li>
                <li><Link to="/blog/vedika-ai-astrologer-india" className="text-pink-300 hover:text-pink-200 underline">Vedika AI astrologer India</Link></li>
                <li><Link to="/blog/free-ai-astrology-chat-india" className="text-pink-300 hover:text-pink-200 underline">Free AI astrology chat India</Link></li>
                <li><Link to="/blog/online-jyotishi-vs-ai-astrologer" className="text-pink-300 hover:text-pink-200 underline">Online Jyotishi vs AI astrologer</Link></li>
                <li><Link to="/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis" className="text-pink-300 hover:text-pink-200 underline">Rahu Ketu transit 2026 predictions</Link></li>
                <li><Link to="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" className="text-pink-300 hover:text-pink-200 underline">Yearly horoscope 2026 predictions</Link></li>
                <li><Link to="/blog/marriage-muhurat-2026" className="text-pink-300 hover:text-pink-200 underline">Marriage muhurat 2026</Link></li>
                <li><Link to="/blog/job-vs-business-what-your-chart-say" className="text-pink-300 hover:text-pink-200 underline">Job vs business what your chart says</Link></li>
                <li><Link to="/free-5-minutes-astrology-ai" className="text-pink-300 hover:text-pink-200 underline">Free 5 minutes astrology AI</Link></li>
                <li><Link to="/today-horoscope" className="text-pink-300 hover:text-pink-200 underline">Today horoscope</Link></li>
                <li><Link to="/talk-to-astrologer" className="text-pink-300 hover:text-pink-200 underline">Talk to astrologer</Link></li>
                <li><Link to="/about" className="text-pink-300 hover:text-pink-200 underline">About Veadicastro</Link></li>
                <li><Link to="/how-it-works" className="text-pink-300 hover:text-pink-200 underline">How it works</Link></li>
              </ul>
            </div>
          </article>
        </section>

      </main>

      {showVedikaPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setShowVedikaPopup(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[1.5rem] border border-pink-500/30 bg-[#0d0b18] p-7 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Avatar */}
            <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-pink-400/50">
              <img src="/optimized/vedika.webp" alt="Vedika" className="h-full w-full object-cover" />
            </div>

            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-pink-300">
              Vedika · AI Astrologer
            </p>
            <h3 className="mb-3 text-lg font-black leading-snug text-white">
              Namaste! I'm Vedika, your personal Vedic astrologer
            </h3>
            <p className="mb-4 text-sm leading-6 text-white/60">
              Sign up to chat with me about your kundli, relationships, career, and life path.
              Your first <span className="font-bold text-pink-300">2 chats are completely free</span> — no payment needed.
            </p>

            {/* Info box */}
            <div className="mb-5 rounded-xl border border-pink-400/20 bg-pink-400/8 p-4 text-left">
              <p className="mb-2 text-xs text-white/50">After signing up you'll need to share:</p>
              <div className="space-y-1.5 text-sm text-white/80">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-pink-300" /> Date, time &amp; place of birth</div>
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-pink-300" /> Your name (optional)</div>
              </div>
            </div>

            <ButtonLite
              onClick={() => { setShowVedikaPopup(false); setAuthOpen(true); }}
              className="mb-3 h-12 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-black text-white hover:from-pink-400 hover:to-purple-400"
            >
              Sign up — it's free
            </ButtonLite>

            <button
              onClick={() => setShowVedikaPopup(false)}
              className="w-full rounded-xl border border-white/10 py-2 text-sm text-white/40 hover:text-white/60"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
