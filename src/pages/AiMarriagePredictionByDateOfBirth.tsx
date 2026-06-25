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
const PAGE_PATH = "/ai-marriage-prediction-by-date-of-birth";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_IMAGE = `${SITE_URL}/optimized/ai-marriage-prediction-v2.webp`;

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
    q: "Can AI predict my marriage by date of birth?",
    a: "AI can explain marriage indicators from your Vedic birth chart when your date, time, and place of birth are provided. It gives a timing window and relationship themes, not a guaranteed event date.",
  },
  {
    q: "Is birth time required for marriage prediction?",
    a: "Birth time is strongly recommended because it sets the ascendant, houses, and Navamsa context. Without it, the reading becomes more general.",
  },
  {
    q: "Can this tell love marriage or arranged marriage?",
    a: "Yes, the reading can discuss love marriage and arranged marriage tendencies by studying the 5th house, 7th house, Venus, Jupiter, Rahu, and related dasha periods.",
  },
  {
    q: "How does Vedic astrology check marriage timing?",
    a: "Vedic astrology checks the 7th house, its lord, Venus, Jupiter, Navamsa, Vimshottari dasha, and supportive transits to estimate likely timing windows.",
  },
  {
    q: "What if I do not know my exact birth time?",
    a: "You can still try an approximate time, but treat the answer as broad guidance. For serious decisions, birth-time rectification with a human astrologer is better.",
  },
  {
    q: "Can AI marriage prediction be 100% accurate?",
    a: "No prediction should be treated as 100% guaranteed. Astrology works best as a clarity tool, especially when birth details are accurate and the reading is used responsibly.",
  },
  {
    q: "Which houses are checked for marriage?",
    a: "The 7th house is primary. Astrologers also study the 2nd, 5th, 8th, 11th, and 12th houses depending on compatibility, attraction, family support, and married life.",
  },
  {
    q: "What are simple remedies for marriage delay?",
    a: "Simple remedies may include strengthening Venus or Jupiter, prayer, charity, mantra practice, and practical relationship effort. Remedies should be gentle, not fear-based.",
  },
  {
    q: "Is this prediction based on Vedic astrology?",
    a: "Yes. Veadicastro uses a chart-first Vedic astrology approach with Lahiri sidereal calculations, dasha logic, and transit context.",
  },
  {
    q: "Can I ask more personal questions after the result?",
    a: "Yes. Sign up to ask Vedika any personal question about marriage timing, compatibility, relationships, career, or other life topics.",
  },
  {
    q: "Is AI marriage prediction better than a horoscope?",
    a: "It is usually more personal than a generic horoscope because it uses your birth details, chart houses, dasha, and transit context instead of one zodiac sign.",
  },
  {
    q: "How is this different from ChatGPT astrology?",
    a: "Generic ChatGPT astrology may answer from broad text patterns. Vedika is framed around Veadicastro's chart-first flow, birth details, and Vedic astrology interpretation.",
  },
  {
    q: "Can AI replace a human astrologer for marriage decisions?",
    a: "No. AI can explain patterns and timing windows, but important relationship decisions should also include personal judgment, family context, and, when needed, a human astrologer.",
  },
];

const buildMarriagePrompt = (details: BirthDetails, question: string) => {
  const nameLine = details.name.trim() ? `Name: ${details.name.trim()}` : "Name: not provided";
  const genderLine = details.gender !== "not-specified" ? `Gender: ${details.gender}` : "Gender: not provided";
  return `${nameLine}
${genderLine}
Birth date: ${details.day} ${months[details.month - 1]} ${details.year}
Birth time: ${String(details.hour).padStart(2, "0")}:${String(details.minute).padStart(2, "0")}
Birth place: ${details.birthPlace}
Main question: ${question.trim() || "When will I get married?"}

Give a personalized AI marriage prediction by date of birth. Focus only on marriage and relationships.`;
};

const buildMarriageSystemPrompt = (data: AstroPayload | null) => {
  const chartLines = data
    ? `User's Vedic chart data:
- Sun Sign: ${data.sunSign}
- Moon Sign: ${data.moonSign}
- Ascendant/Lagna: ${data.lagnaSign}
- Nakshatra: ${data.nakshatra?.name || "Not available"} Pada ${data.nakshatra?.pada || ""}`
    : "Use only the provided birth details and avoid inventing exact planetary placements.";

  return `You are Vedika, Veadicastro's AI Vedic astrologer.
Respond in calm, simple English. Be marriage-specific, warm, practical, and non-fear-based.

${chartLines}

Rules:
- Use sidereal Vedic astrology and chart-first interpretation.
- Do not promise certainty. Give timing as a window, not an exact guaranteed date.
- Do not create fear or pressure.
- Explain any technical point in easy language.
- Mention 7th house, Venus, Jupiter, dasha/transit, and Navamsa only when helpful.
- Keep the answer structured and useful.

Required result format:
Marriage Timing Window:
Love or Arranged Marriage Possibility:
Relationship Strengths:
Possible Delays or Challenges:
Spouse Qualities:
Current Dasha/Transit Influence:
Simple Remedies:
Next Best Question to Ask Vedika:`;
};

const inputClass =
  "h-12 rounded-2xl border-white/10 bg-white/[0.06] text-white placeholder:text-white/35 focus:border-pink-400 focus:ring-pink-400";
const labelClass = "mb-2 flex items-center gap-2 text-sm font-medium text-white/75";

export default function AiMarriagePredictionByDateOfBirth() {
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
  const [question, setQuestion] = useState("When will I get married?");
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

      const userPrompt = buildMarriagePrompt(birthDetails, activeQuestion);
      const history = customQuestion ? messages : [];
      const nextMessages: ChatTurn[] = [...history, { role: "user", content: activeQuestion }];
      setMessages(nextMessages);
      setStatus(customQuestion ? "Vedika is reading your question..." : "Vedika is preparing your marriage prediction...");

      let streamed = "";
      await generateGeminiStream(
        userPrompt,
        history,
        (delta) => {
          streamed += delta;
          setResult((prev) => customQuestion ? `${prev}${prev.endsWith("\n\n") ? "" : "\n\n"}Follow-up Answer:\n${streamed}` : streamed);
        },
        buildMarriageSystemPrompt(chart),
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
      { "@type": "ListItem", "position": 2, "name": "AI Marriage Prediction by Date of Birth", "item": PAGE_URL },
    ],
  }), []);

  const appSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Marriage Prediction by Date of Birth",
    "url": PAGE_URL,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "image": PAGE_IMAGE,
    "description": "Free, instant AI marriage prediction by date of birth with Vedika, based on Vedic birth chart, Swiss Ephemeris calculations, dasha, transit, and relationship indicators.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
    },
  }), []);

  return (
    <>
      <Helmet>
        <title>AI Marriage Prediction by Date of Birth - Free, Instant & Chart-Based</title>
        <meta
          name="description"
          content="Enter your birth details and get an instant AI marriage prediction - no signup, no payment. Vedika reads your 7th house, Venus, dasha & Navamsa and gives you a real chart-based answer in seconds."
        />
        <meta
          name="keywords"
          content="AI marriage prediction by date of birth, marriage prediction by date of birth, AI marriage prediction, free marriage prediction, when will I get married astrology, love marriage prediction, arranged marriage prediction, marriage astrology by DOB, marriage prediction calculator"
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:title" content="AI Marriage Prediction by Date of Birth - Free, Instant & Chart-Based" />
        <meta property="og:description" content="Get an instant chart-based AI marriage prediction with no signup and no payment. Vedika reads your 7th house, Venus, dasha, and Navamsa." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={PAGE_IMAGE} />
        <meta property="og:site_name" content="Veadicastro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Marriage Prediction by Date of Birth - Free, Instant & Chart-Based" />
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
                Free marriage astrology tool
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                AI Marriage Prediction by Date of Birth
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Enter your birth details and ask Vedika about marriage timing, love or arranged marriage possibilities, spouse qualities, delays, and simple remedies through a chart-first Vedic reading.
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
                  3,000+ marriage predictions given | Trusted across India, UK & Canada
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#marriage-tool" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-400">
                  Get My Marriage Prediction <ArrowRight className="h-4 w-4" />
                </a>
                <button type="button" onClick={() => setAuthOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold text-white/85 hover:border-pink-400/60 hover:text-pink-200">
                  Ask any question to AI
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
              <img
                src="/optimized/ai-marriage-prediction-v2.webp"
                alt="AI marriage prediction by date of birth with Vedic astrology chart insights"
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
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-200">How Vedika reads your marriage chart</p>
                <h2 className="mt-2 text-2xl font-black text-white">From birth details to instant chart-based answer</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Step 1", "Enter your birth details"],
                  ["Step 2", "Swiss Ephemeris calculates the chart"],
                  ["Step 3", "7th house, Venus, dasha are analyzed"],
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
                <h2 className="mt-1 text-2xl font-black">Marriage prediction calculator</h2>
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
                  placeholder="When will I get married?"
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
                <p className="text-sm font-semibold text-pink-300">Vedika's marriage reading</p>
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
                      ["Marriage Timing Window:", "A stronger window appears after dasha and 7th house support become active."],
                      ["Love or Arranged:", "Chart patterns show whether self-choice, family support, or a mixed path is more likely."],
                      ["Spouse Qualities:", "Vedika reads Venus, Jupiter, 7th lord, and Navamsa for partner traits."],
                      ["Simple Remedies:", "Gentle non-fear-based guidance for clarity, patience, and relationship harmony."],
                    ].map(([label, text]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-bold text-white">{label}</p>
                        <p className="mt-2 select-none text-sm leading-6 text-white/45 blur-[2px]">{text}</p>
                      </div>
                    ))}
                  </div>
                  <a href="#marriage-tool" className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-bold text-white hover:bg-pink-400">
                    Get Your Real Prediction <ArrowRight className="h-4 w-4" />
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
                <h3 className="font-bold text-white">Want a deeper marriage reading with timing, compatibility, and remedies?</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Sign up to ask Vedika any personal question about marriage timing, compatibility, spouse qualities, remedies, or relationship patterns.
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
              ["Marriage timing window", "A practical period instead of a guaranteed date."],
              ["Love vs arranged", "Relationship route indicators from chart patterns."],
              ["Spouse qualities", "Nature, values, and compatibility tendencies."],
              ["Simple remedies", "Gentle actions for clarity and self-reflection."],
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
                Marriage Astrology Article
              </p>
              <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">
                AI Marriage Prediction by Date of Birth: Meaning, Method, and Responsible Use
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
                This guide explains how AI marriage prediction works on <Link to="/" className="text-pink-300 underline-offset-4 hover:underline">Veadicastro</Link>, why complete birth details matter, and how Vedika uses Vedic astrology signals to explain marriage timing, love or arranged marriage possibilities, spouse qualities, and remedies in simple language.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-white">Main focus</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">Marriage timing, relationship pattern, and compatibility signals.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-white">Astrology base</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">7th house, Venus, Jupiter, dasha, transit, and Navamsa context.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-white">Best use</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">Clarity and self-reflection, not fixed promises or fear.</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-pink-400/25 bg-pink-400/10 p-5">
                <h3 className="text-xl font-black text-white">Direct answer</h3>
                <p className="mt-3 text-sm leading-8 text-white/75 sm:text-base">
                  AI marriage prediction by date of birth uses your birth chart, birth time, and birth place to analyze marriage timing, relationship tendencies, love marriage indicators, arranged marriage support, and possible marriage windows. It helps you understand patterns, not guaranteed events.
                </p>
              </div>
              <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-5">
                <p className="text-lg font-black text-yellow-100">★★★★★</p>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  Users from India, the UK, the USA, and Canada use Vedika to understand relationship patterns, marriage timing, and compatibility questions with a calm Vedic astrology approach.
                </p>
              </div>
            </div>

            <div className="space-y-9">
              <section>
                <h3 className="text-2xl font-black text-white">1. What AI marriage prediction by date of birth means</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  AI marriage prediction by date of birth means using your birth details to prepare a Vedic astrology reading about marriage and relationships, then using AI to explain that reading clearly. It is not a random answer and it is not the same as a generic zodiac prediction. Vedika reads the chart foundation first and then explains what the marriage indicators suggest. If you want to see your complete planetary positions before asking about marriage, you can also use the <Link to="/free-kundli-generator" className="text-pink-300 underline-offset-4 hover:underline">Free Kundli Generator</Link>.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">AI marriage prediction vs generic horoscope</h3>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-white/10 text-white">
                      <tr>
                        <th className="p-3 font-bold">Feature</th>
                        <th className="p-3 font-bold">AI Marriage Prediction</th>
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
                        <td className="p-3 text-white/90">Marriage focused</td>
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
                  Date of birth gives the broad planetary background, but time and place complete the chart. Time of birth helps calculate the Lagna, or ascendant, which decides the house structure. Birth place helps calculate accurate planetary positions. These details are important because marriage is mainly studied through houses, especially the 7th house.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">3. When will I get married? How AI reads your Kundli</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  In Vedic astrology, the 7th house shows marriage, partnership, and long-term commitment. The 7th lord shows how that area behaves. Venus is connected with <Link to="/love-astrology-by-date-of-birth" className="text-pink-300 underline-offset-4 hover:underline">affection, attraction, comfort, and relationship harmony</Link>. Jupiter shows support, wisdom, blessings, and maturity. For deeper marriage insight, astrologers may also look at the Navamsa chart because it shows the inner strength of married life.
                </p>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  A proper reading does not depend on one planet alone. It checks how the 5th house of romance connects with the 7th house of marriage, whether family support is visible through the 2nd and 11th houses, and whether planets like Saturn, Rahu, or Mars are creating delay, intensity, unconventional choices, or important lessons.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">4. Love marriage and arranged marriage indicators</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Love marriage indicators are usually connected with the 5th house, Venus, Rahu, and links between the 5th and 7th houses. These patterns can show attraction, personal choice, or a relationship that begins before family involvement. Arranged marriage indicators are often seen when the 7th house, 2nd house, Jupiter, and family-support houses are stronger. Many charts show a mixed path where personal choice and family approval both matter. For partner-to-partner compatibility, the <Link to="/free-kundali-matching" className="text-pink-300 underline-offset-4 hover:underline">Free Kundali Matching</Link> page is a better next step than a single-person timing reading.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">5. Why marriage timing is shown as a window</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Marriage timing is normally checked through dasha and transit. Dasha shows which planetary period is active in your life. Transit shows what current planets are triggering in the chart. When marriage-related houses and planets become active together, the chart can show a stronger window for meeting someone, engagement, commitment, or marriage. A window is more responsible than a fixed guaranteed date because real-life choices and circumstances also matter.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">6. Marriage prediction by Kundli - what Vedika checks</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Vedic astrology can become technical quickly. In marriage prediction by Kundli, Vedika checks the 7th house, 7th lord, Venus, Jupiter, Navamsa, Vimshottari dasha, transit, aspect, and conjunction patterns, then converts the chart logic into easy English. This helps you understand the marriage pattern, possible delay factors, spouse qualities, and simple remedies without needing to study Jyotish first. If you want a broader discussion after the result, continue in the <Link to="/free-ai-astrologer-chat" className="text-pink-300 underline-offset-4 hover:underline">Free AI Astrologer Chat</Link>; if you want to compare AI astrology with general AI tools, read our <Link to="/chatgpt-astrology" className="text-pink-300 underline-offset-4 hover:underline">ChatGPT Astrology</Link> guide.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">7. Use the prediction responsibly</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  A marriage prediction should help you reflect, not make you fearful. If the chart shows delay, it does not mean denial. If the chart shows support, it still asks for wise choices. Use this guidance alongside honest communication, shared values, <Link to="/love-astrology-by-date-of-birth" className="text-pink-300 underline-offset-4 hover:underline">emotional maturity, and practical compatibility</Link>. For deeper personal situations, you can also <Link to="/talk-to-astrologer" className="text-pink-300 underline-offset-4 hover:underline">talk to a human astrologer</Link>.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">8. Example marriage prediction</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Imagine a person born on 14 March 2008 at 10:30 AM in Delhi. A responsible AI marriage prediction would not say, "You will marry on one exact date." Instead, Vedika would first read the 7th house, Venus, Jupiter, and the active dasha period. If the marriage-related dasha becomes stronger in the late twenties and supportive transits touch the 7th house around that time, the result may describe a marriage window such as "stronger chances between age 26 and 29." If the 5th house is also active, Vedika may explain that love marriage or a self-choice connection can become more visible. If Saturn is influencing the 7th house, the answer may mention maturity, delay, or the need to choose carefully.
                </p>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  This example shows why timing is best explained as a window. The chart can show when marriage energy becomes more active, but real life still includes education, career, family readiness, emotional maturity, and the choices of both people involved.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">9. Common reasons marriage gets delayed</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Marriage delay can appear for many reasons in Vedic astrology. Saturn's influence can show maturity, responsibility, or late commitment. Rahu can show unconventional choices, confusion, or attraction outside the expected path. A weak or stressed Venus may show difficulty in comfort, trust, or relationship flow. Sometimes the dasha simply does not activate marriage houses early. Delay can also come from practical life factors like career focus, family expectations, location changes, or emotional unreadiness.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-white">10. What makes a marriage reading more accurate</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Accuracy improves when the birth date, birth time, and birth place are correct. Exact birth time helps the ascendant and house placements become clearer. A specific question also helps: "When will I get married?" is useful, but "Is the next two years supportive for marriage?" can be even more focused. For daily context around timing, you can check the <Link to="/today-horoscope" className="text-pink-300 underline-offset-4 hover:underline">Today Horoscope</Link>, and for broader AI-based predictions you can explore <Link to="/ai-astrology-prediction" className="text-pink-300 underline-offset-4 hover:underline">AI Astrology Prediction</Link>. The <Link to="/" className="text-pink-300 underline-offset-4 hover:underline">Veadicastro homepage</Link> also connects this marriage tool with Vedika AI chat, Kundli matching, daily predictions, and complete Vedic reports.
                </p>
              </section>

              <section className="rounded-2xl border border-green-300/20 bg-green-300/10 p-5">
                <h3 className="text-2xl font-black text-white">Trust and methodology</h3>
                <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
                  Veadicastro uses chart-first interpretation. Birth chart logic, dashas, and transits remain the foundation. AI is used to explain the reading in simple language, not to replace the chart. The guidance is designed for clarity and self-reflection, not fear, pressure, or guaranteed events.
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
