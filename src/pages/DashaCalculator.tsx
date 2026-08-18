import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, CheckCircle2, ChevronRight, Clock3, Loader2, MapPin, Search, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { calculateVimshottariDasha, getNakshatraLord, getPlanetaryData, type VimshottariDasha } from "@/lib/astroCalc";

const GEOAPIFY_KEY = "ca0423180b57461d82e7dfe404f5bb1b";
const DASHA_YEARS = [
  ["Ketu", "7 years"], ["Venus", "20 years"], ["Sun", "6 years"],
  ["Moon", "10 years"], ["Mars", "7 years"], ["Rahu", "18 years"],
  ["Jupiter", "16 years"], ["Saturn", "19 years"], ["Mercury", "17 years"],
];
const INTERPRETATIONS: Record<string, string> = {
  Ketu: "A period traditionally associated with detachment, inner inquiry, simplification, and releasing what has lost its purpose.",
  Venus: "A period traditionally read through relationships, art, comforts, resources, values, and the wish to create harmony.",
  Sun: "A period traditionally associated with identity, confidence, leadership, visibility, vitality, and responsibility.",
  Moon: "A period traditionally read through emotional life, home, care, belonging, habits, and mental wellbeing.",
  Mars: "A period traditionally associated with initiative, courage, discipline, competition, boundaries, and direct action.",
  Rahu: "A period traditionally associated with ambition, unfamiliar opportunities, material growth, experimentation, and strong desires.",
  Jupiter: "A period traditionally read through learning, guidance, optimism, ethics, expansion, and long-term perspective.",
  Saturn: "A period traditionally associated with patience, structure, work, accountability, maturity, and steady results.",
  Mercury: "A period traditionally read through study, communication, trade, analysis, adaptability, and practical decisions.",
};
const RELATED_PAGES = [
  { href: "/free-5-minutes-astrology-ai", title: "Free 5 Minute Astrology", description: "Get a quick Vedic overview when you want a broader reading beyond Dasha timing." },
  { href: "/free-ai-astrologer-chat", title: "Free AI Astrologer Chat", description: "Ask follow-up questions about the periods shown in your Dasha timeline." },
  { href: "/ai-marriage-prediction-by-date-of-birth", title: "Marriage Prediction by Date of Birth", description: "Explore relationship and marriage timing alongside your active Dasha." },
  { href: "/ai-career-prediction-by-date-of-birth", title: "Career Prediction by Date of Birth", description: "Use your chart and current periods to explore career themes and decisions." },
  { href: "/love-astrology-by-date-of-birth", title: "Love Astrology by Date of Birth", description: "Read relationship patterns through your Vedic birth chart." },
  { href: "/chatgpt-astrology", title: "ChatGPT Astrology", description: "See how chart-based Vedic tools differ from generic AI astrology answers." },
  { href: "/free-kundli-generator", title: "Free Kundli Generator", description: "Generate your full Vedic birth chart with planets, houses, and Nakshatras." },
  { href: "/ai-kundli-analysis", title: "AI Kundli Analysis", description: "Get a guided explanation of the chart factors that support Dasha interpretation." },
  { href: "/rashi-calculator-by-date-of-birth", title: "Rashi Calculator", description: "Find your Moon sign and birth Nakshatra with the same birth details." },
  { href: "/nakshatra-calculator/", title: "Nakshatra Calculator", description: "Calculate your exact birth Nakshatra, pada, ruling planet, and sidereal Moon position." },
  { href: "/today-horoscope", title: "Today Horoscope", description: "Check daily Vedic guidance alongside your longer-term planetary period." },
  { href: "/astrology-by-date-of-birth", title: "Astrology by Date of Birth", description: "Learn how birth date, time, and place shape a complete Vedic reading." },
  { href: "/ai-astrology-prediction", title: "AI Astrology Prediction", description: "Receive a chart-based prediction that considers your current Dasha context." },
  { href: "/ai-future-spouse-prediction", title: "Future Spouse Prediction", description: "Explore marriage-oriented chart themes in more detail." },
  { href: "/free-kundali-matching", title: "Free Kundli Matching", description: "Compare two Vedic charts for marriage compatibility." },
  { href: "/ai-pandit", title: "AI Pandit", description: "Ask for simple Vedic guidance and remedies based on your birth chart." },
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SELECT_CLASS = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-pink-500";

type LocationSuggestion = { label: string; lat: number; lon: number };
type Result = { nakshatra: string; pada: number; lord: string; dasha: VimshottariDasha };

const formatDate = (date: Date) => new Intl.DateTimeFormat("en-IN", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
}).format(date);

const remainingPeriod = (end: Date) => {
  const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  const years = Math.floor(days / 365.25);
  const months = Math.floor((days - years * 365.25) / 30.44);
  return years ? `${years}y ${months}m remaining` : `${months}m ${days % 30}d remaining`;
};

const faqItems = [
  ["What is my current Dasha?", "Your current Dasha is identified from your Moon's birth Nakshatra, the balance of that Nakshatra at birth, and today's date. Enter your complete birth details above to see your active Mahadasha, Antardasha, and Pratyantardasha."],
  ["How do I calculate my Mahadasha and Antardasha?", "The calculation starts with the sidereal Moon position at birth. Its Nakshatra lord gives the opening Mahadasha, while the Moon's degree within that Nakshatra gives the remaining balance. Antardashas are then calculated as proportional sub-periods within each Mahadasha."],
  ["Can I calculate Dasha using only my date of birth?", "A date alone can sometimes suggest a result, but it is not dependable. The Moon moves quickly and may change Nakshatra on the same day. Use the exact birth time and birthplace for a meaningful Vimshottari Dasha calculation."],
  ["Is exact birth time required for Dasha calculation?", "Yes, especially when the Moon is close to a Nakshatra boundary. A small timing difference can alter the Moon's degree, the balance at birth, and therefore the start and end dates of the periods."],
  ["What is the difference between Mahadasha and Antardasha?", "Mahadasha is the main planetary period and lasts years. Antardasha is a shorter sub-period within it. Reading both together gives the active major theme and the more immediate planetary emphasis."],
  ["How long is the Vimshottari Dasha cycle?", "The complete Vimshottari Dasha cycle totals 120 years. It moves through nine planetary lords in a fixed order: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, and Mercury."],
  ["Which Dasha comes after my current Mahadasha?", "Vimshottari follows a fixed repeating order. The calculator shows the next Mahadasha beside your active period and lists the remaining major periods in your personal timeline."],
  ["What is Pratyantardasha?", "Pratyantardasha is the third level of timing: a sub-period within the Antardasha. It is useful for viewing a shorter layer of the same Vimshottari sequence alongside the active Mahadasha and Antardasha."],
];

export default function DashaCalculator() {
  const navigate = useNavigate();
  const { setAuthOpen } = useAuth();
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [birthMeridiem, setBirthMeridiem] = useState("AM");
  const [place, setPlace] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const searchTimer = useRef<number | null>(null);
  const placeRef = useRef<HTMLDivElement>(null);
  const daysInSelectedMonth = birthYear && birthMonth ? new Date(Number(birthYear), Number(birthMonth), 0).getDate() : 31;

  useEffect(() => () => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
  }, []);

  useEffect(() => {
    const closeSuggestions = (event: MouseEvent) => {
      if (!placeRef.current?.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", closeSuggestions);
    return () => document.removeEventListener("mousedown", closeSuggestions);
  }, []);

  const findLocations = (query: string) => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimer.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&format=json&apiKey=${GEOAPIFY_KEY}`);
        const data = await response.json();
        const matches = (data.results || []).map((item: any) => ({
          label: item.formatted || [item.city, item.country].filter(Boolean).join(", "),
          lat: Number(item.lat),
          lon: Number(item.lon),
        })).filter((item: LocationSuggestion) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const selectLocation = (location: LocationSuggestion) => {
    setPlace(location.label);
    setCoordinates({ lat: location.lat, lon: location.lon });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const calculate = async () => {
    if (!birthDay || !birthMonth || !birthYear || !birthHour || !birthMinute || !place || !coordinates) {
      setError("Enter your date, exact time, and select your birth place from the suggestions.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const year = Number(birthYear);
      const month = Number(birthMonth);
      const day = Number(birthDay);
      const selectedHour = Number(birthHour);
      const hour = birthMeridiem === "PM" ? (selectedHour % 12) + 12 : selectedHour % 12;
      const min = Number(birthMinute);
      const timezone = -new Date().getTimezoneOffset() / 60;
      const chart = await getPlanetaryData({ day, month, year, hour, min, lat: coordinates.lat, lon: coordinates.lon, tzone: timezone });
      if (!chart.nakshatra || !chart.planets.moon) throw new Error("Moon data was unavailable");
      const birthMoment = new Date(Date.UTC(year, month - 1, day, hour - timezone, min));
      setResult({
        nakshatra: chart.nakshatra.name,
        pada: chart.nakshatra.pada,
        lord: getNakshatraLord(chart.nakshatra.index),
        dasha: calculateVimshottariDasha(birthMoment, chart.nakshatra.index, chart.planets.moon.longitude),
      });
    } catch (calculationError) {
      console.error("Dasha calculation failed", calculationError);
      setError("We could not calculate your Dasha right now. Please check the birth details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  const dashaSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Dasha Calculator",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    url: "https://veadicastro.in/dasha-calculator/",
    description: "Calculate current Vimshottari Mahadasha, Antardasha, Pratyantardasha, birth Nakshatra, and a full Dasha timeline using Swiss Ephemeris.",
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://veadicastro.in/" },
      { "@type": "ListItem", position: 2, name: "Dasha Calculator", item: "https://veadicastro.in/dasha-calculator/" },
    ],
  };

  return <>
    <Helmet>
      <html lang="en-IN" />
      <title>Dasha Calculator - Find Your Mahadasha & Antardasha</title>
      <meta name="description" content="Free Dasha Calculator using Swiss Ephemeris. Find your current Vimshottari Mahadasha, Antardasha, Pratyantardasha, dates, and full Dasha timeline." />
      <link rel="canonical" href="https://veadicastro.in/dasha-calculator/" />
      <link rel="alternate" hrefLang="en-IN" href="https://veadicastro.in/dasha-calculator/" />
      <link rel="alternate" hrefLang="x-default" href="https://veadicastro.in/dasha-calculator/" />
      <meta property="og:title" content="Dasha Calculator - Find Your Mahadasha & Antardasha" />
      <meta property="og:description" content="Find your current Mahadasha, Antardasha, Pratyantardasha, dates, and Vimshottari timeline." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://veadicastro.in/dasha-calculator/" />
      <script type="application/ld+json">{JSON.stringify(dashaSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>

    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
      <div className="pointer-events-none fixed top-[-200px] right-[-200px] h-[400px] w-[400px] rounded-full bg-pink-600/5 blur-[80px]" />
      <div className="pointer-events-none fixed bottom-[-200px] left-[-200px] h-[350px] w-[350px] rounded-full bg-purple-800/5 blur-[80px]" />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button onClick={() => navigate("/")} className="group flex items-center gap-3">
            <img src="/optimized/logo.webp" alt="Veadicastro" className="h-9 w-9 rounded-full" loading="eager" />
            <span className="text-lg font-bold tracking-wide">Veadicastro</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 sm:inline">Powered by Swiss Ephemeris</span>
            <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-pink-400">Back to Home</button>
          </div>
        </div>
      </header>

      <section className="relative px-4 py-14 text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/30 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-pink-400"><Sparkles className="h-3 w-3" />Free Vimshottari Dasha Calculator</p>
        <h1 className="mb-2 text-4xl font-black leading-none sm:text-5xl md:text-6xl">Dasha Calculator</h1>
        <h2 className="pink-glow mb-6 text-xl font-semibold text-pink-400 sm:text-2xl">Find Your Mahadasha & Antardasha</h2>
        <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-white/50">Find your active Mahadasha, Antardasha, Pratyantardasha, and full Vimshottari timeline from your precise birth details.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-white/75">
          {["Swiss Ephemeris", "Lahiri sidereal calculations", "Full Dasha timeline"].map((chip) => <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"><CheckCircle2 className="h-4 w-4 text-green-400" />{chip}</span>)}
        </div>
      </section>

      {!result && <section className="mx-auto max-w-5xl px-4 pb-8" aria-labelledby="calculator-heading">
        <div className="mx-auto max-w-2xl">
          <div className="card-glass rounded-3xl p-8">
            <h2 id="calculator-heading" className="mb-3 text-center text-2xl font-bold">Enter Your Birth Details for <span className="text-pink-400">Vimshottari Dasha</span></h2>
            <p className="mb-8 text-center text-sm leading-relaxed text-white/40">Your exact birth time and birthplace determine the Moon&apos;s Nakshatra and the balance of your starting Dasha.</p>
            {error && <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70"><Calendar className="size-4 text-pink-400" />Date of birth</Label>
                <div className="grid grid-cols-3 gap-3">
                  <select aria-label="Birth day" value={birthDay} onChange={(event) => setBirthDay(event.target.value)} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Day</option>{Array.from({ length: daysInSelectedMonth }, (_, index) => <option key={index + 1} value={index + 1} className="bg-[#1a1020]">{index + 1}</option>)}</select>
                  <select aria-label="Birth month" value={birthMonth} onChange={(event) => { setBirthMonth(event.target.value); setBirthDay(""); }} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Month</option>{MONTHS.map((month, index) => <option key={month} value={index + 1} className="bg-[#1a1020]">{month}</option>)}</select>
                  <select aria-label="Birth year" value={birthYear} onChange={(event) => { setBirthYear(event.target.value); setBirthDay(""); }} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Year</option>{Array.from({ length: new Date().getFullYear() - 1899 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={year} className="bg-[#1a1020]">{year}</option>)}</select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70"><Clock3 className="size-4 text-pink-400" />Time of birth</Label>
                <div className="grid grid-cols-3 gap-3">
                  <select aria-label="Birth hour" value={birthHour} onChange={(event) => setBirthHour(event.target.value)} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Hour</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1} className="bg-[#1a1020]">{index + 1}</option>)}</select>
                  <select aria-label="Birth minute" value={birthMinute} onChange={(event) => setBirthMinute(event.target.value)} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Minute</option>{Array.from({ length: 60 }, (_, index) => <option key={index} value={index} className="bg-[#1a1020]">{String(index).padStart(2, "0")}</option>)}</select>
                  <select aria-label="Birth AM or PM" value={birthMeridiem} onChange={(event) => setBirthMeridiem(event.target.value)} className={SELECT_CLASS}><option value="AM" className="bg-[#1a1020]">AM</option><option value="PM" className="bg-[#1a1020]">PM</option></select>
                </div>
              </div>
              <div className="relative sm:col-span-2" ref={placeRef}>
                <Label htmlFor="birth-place" className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70"><MapPin className="size-4 text-pink-400" />Place of birth</Label>
                <div className="relative">
                  <Input id="birth-place" value={place} onChange={(event) => { setPlace(event.target.value); setCoordinates(null); findLocations(event.target.value); }} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} placeholder="Start typing your city or town" className="h-11 rounded-xl border border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500" autoComplete="off" />
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                  {searching && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-pink-400" />}
                </div>
                {showSuggestions && <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-lg">
                  {suggestions.map((suggestion) => <button key={`${suggestion.lat}-${suggestion.lon}`} type="button" onClick={() => selectLocation(suggestion)} className="flex w-full items-center gap-2 border-b border-white/5 px-4 py-3 text-left text-sm text-white/80 last:border-0 hover:bg-pink-900/30"><MapPin className="size-4 shrink-0 text-pink-400" />{suggestion.label}</button>)}
                </div>}
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/40">Timezone uses your device setting. For a birth in another timezone, use a device set to that local time for the most precise result.</p>
            <Button onClick={calculate} disabled={loading} className="btn-pink mt-6 h-12 w-full rounded-xl text-sm font-semibold text-white hover:opacity-90">
              {loading ? <><Loader2 className="animate-spin" />Calculating Dasha...</> : <><Sparkles />Calculate My Dasha</>}
            </Button>
          </div>
        </div>
      </section>}

      {result && <section className="mx-auto max-w-5xl px-4 py-8" aria-live="polite">
        <div className="card-glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-400">Calculator results</p><h2 className="mt-2 text-3xl font-black">Your current Vimshottari Dasha</h2></div>
            <Button variant="outline" onClick={reset} className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-pink-500/10 hover:text-white">Calculate again</Button>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[["Current Mahadasha", result.dasha.mahadasha.lord, result.dasha.mahadasha], ["Current Antardasha", result.dasha.antardasha.lord, result.dasha.antardasha], ["Pratyantardasha", result.dasha.pratyantardasha.lord, result.dasha.pratyantardasha]].map(([label, lord, period]) => {
              const item = period as VimshottariDasha["mahadasha"];
              return <div key={label as string} className="card-glass rounded-2xl border border-white/10 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">{label as string}</p><p className="mt-2 text-2xl font-black text-pink-400">{lord as string}</p><p className="mt-3 text-sm text-white/70">{formatDate(item.start)} to {formatDate(item.end)}</p><p className="mt-1 text-sm text-white/40">{remainingPeriod(item.end)}</p></div>;
            })}
          </div>
          <div className="mt-7 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="card-glass rounded-2xl border border-white/10 p-5"><h3 className="text-lg font-semibold">Birth Nakshatra</h3><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-white/40">Nakshatra</dt><dd className="font-medium">{result.nakshatra}, Pada {result.pada}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Nakshatra lord</dt><dd className="font-medium">{result.lord}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Balance at birth</dt><dd className="font-medium">{result.dasha.birthDashaBalanceYears.toFixed(2)} years</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Next Mahadasha</dt><dd className="font-medium text-pink-400">{result.dasha.nextMahadasha}</dd></div></dl></div>
            <div className="card-glass rounded-2xl border border-white/10 p-5"><h3 className="text-lg font-semibold">Short interpretation</h3><p className="mt-3 leading-7 text-white/70">{INTERPRETATIONS[result.dasha.mahadasha.lord]} Within it, {result.dasha.antardasha.lord} provides the current sub-period. This is a traditional timing framework for reflection, not a guarantee of specific events.</p></div>
          </div>
          <div className="card-glass mt-7 overflow-hidden rounded-2xl border border-white/10"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h3 className="text-lg font-semibold">Full Vimshottari timeline</h3><span className="text-sm text-white/40">Birth onward</span></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-white/[0.03] text-xs uppercase tracking-[0.12em] text-white/40"><tr><th className="px-5 py-3 font-medium">Mahadasha</th><th className="px-5 py-3 font-medium">Start date</th><th className="px-5 py-3 font-medium">End date</th><th className="px-5 py-3 font-medium">Duration</th></tr></thead><tbody>{result.dasha.timeline.map((period) => <tr key={`${period.lord}-${period.start.toISOString()}`} className={period.lord === result.dasha.mahadasha.lord ? "bg-pink-500/10" : "border-t border-white/5"}><td className="px-5 py-4 font-semibold">{period.lord}{period.lord === result.dasha.mahadasha.lord && <span className="ml-2 text-xs font-medium text-pink-400">Current</span>}</td><td className="px-5 py-4 text-white/70">{formatDate(period.start)}</td><td className="px-5 py-4 text-white/70">{formatDate(period.end)}</td><td className="px-5 py-4 text-white/40">{period.years.toFixed(2)} years</td></tr>)}</tbody></table></div></div>
          <div className="card-glass mt-7 rounded-2xl border border-white/10 p-5"><h3 className="text-lg font-semibold">Upcoming Mahadashas</h3><div className="mt-4 flex flex-wrap gap-2">{result.dasha.timeline.filter((period) => period.start > result.dasha.mahadasha.start).slice(0, 4).map((period) => <span key={period.lord} className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">{period.lord}<ChevronRight className="size-3 text-pink-400" />{formatDate(period.start)}</span>)}</div></div>
          <div className="mt-7 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/15 to-purple-500/10 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-300">Personalised guidance</p>
            <h3 className="mt-3 text-2xl font-black">Chat with Vedika AI for Free</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/65">Ask what your current Mahadasha and Antardasha mean for career, marriage, relationships, finances, upcoming changes, remedies, and the periods ahead.</p>
            <Button onClick={() => setAuthOpen(true)} className="btn-pink mt-5 h-12 rounded-xl px-7 text-sm font-semibold text-white hover:opacity-90"><Sparkles />Chat with Vedika AI for Free</Button>
          </div>
        </div>
      </section>}

      <div className="mx-auto my-16 max-w-5xl px-4"><div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" /></div>
      <article className="mx-auto mb-20 max-w-4xl px-4">
        <div className="prose prose-invert max-w-none space-y-10 text-[17px] leading-8 text-white/80 prose-p:text-white/80 prose-strong:text-white">
          <section><h2 className="text-3xl font-bold text-white">What is a Dasha Calculator?</h2><p className="mt-4">A Dasha Calculator maps the active planetary periods in a Vedic birth chart. This tool calculates your current Vimshottari Mahadasha, its Antardasha, and the shorter Pratyantardasha, then shows their start dates, end dates, remaining time, and future sequence. It uses the Moon&apos;s sidereal position at birth to find your Nakshatra and the balance of the first period. The output is a timing framework used in Jyotish to place birth-chart themes in context.</p></section>
          <section><h2 className="text-3xl font-bold text-white">What is Vimshottari Dasha?</h2><p className="mt-4">Vimshottari is the most widely used Dasha system in Vedic astrology. Its complete cycle lasts 120 years and moves through nine planetary lords: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, and Mercury. Each lord has a fixed Mahadasha duration. The Nakshatra occupied by the Moon at birth decides which lord begins the sequence, while the Moon&apos;s exact degree shows how much of that first Mahadasha remains.</p></section>
          <section><h2 className="text-3xl font-bold text-white">How Does the Dasha Calculator Work?</h2><p className="mt-4">You enter your date of birth, time of birth, and birthplace. Swiss Ephemeris calculates the Moon&apos;s Lahiri sidereal longitude for that moment. From this, the calculator identifies the birth Nakshatra and its lord, measures the Moon&apos;s progress through the Nakshatra, and derives the opening Dasha balance. The fixed Vimshottari sequence then produces the major, sub-period, and sub-sub-period dates.</p></section>
          <section><h2 className="text-3xl font-bold text-white">How to Use the Dasha Calculator</h2><ol className="mt-4 list-decimal space-y-2 pl-6"><li>Enter your date and exact time of birth.</li><li>Search for and select your birthplace from the location list.</li><li>Select <strong className="text-white">Calculate My Dasha</strong>.</li><li>View your current Mahadasha, Antardasha, and Pratyantardasha.</li><li>Check the dates, remaining period, and full Mahadasha timeline.</li></ol></section>
          <section><h2 className="text-3xl font-bold text-white">Vimshottari Dasha Sequence and Duration</h2><div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]"><table className="w-full min-w-[420px] text-left text-sm"><thead className="bg-white/5 text-white/70"><tr><th className="px-4 py-3">Planet</th><th className="px-4 py-3">Mahadasha period</th></tr></thead><tbody>{DASHA_YEARS.map(([planet, duration]) => <tr key={planet} className="border-t border-white/10"><td className="px-4 py-3 font-medium text-white">{planet}</td><td className="px-4 py-3">{duration}</td></tr>)}</tbody></table></div></section>
          <section><h2 className="text-3xl font-bold text-white">What is Mahadasha?</h2><p className="mt-4">Mahadasha is the main planetary period in the Vimshottari system. It sets the longest timing layer and can run from 6 years for the Sun to 20 years for Venus. Astrologers read the Mahadasha lord with its sign, house, strength, aspects, and the whole birth chart rather than treating the planet in isolation.</p></section>
          <section><h2 className="text-3xl font-bold text-white">What is Antardasha?</h2><p className="mt-4">Antardasha, also called Bhukti, is the sub-period inside the current Mahadasha. Each Mahadasha contains all nine lords in the same fixed order, with durations proportional to their Vimshottari years. It adds a closer timing layer to the broader theme of the Mahadasha.</p></section>
          <section><h2 className="text-3xl font-bold text-white">Mahadasha vs Antardasha</h2><div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]"><table className="w-full min-w-[540px] text-left text-sm"><thead className="bg-white/5 text-white/70"><tr><th className="px-4 py-3">Feature</th><th className="px-4 py-3">Mahadasha</th><th className="px-4 py-3">Antardasha</th></tr></thead><tbody><tr className="border-t border-white/10"><td className="px-4 py-3">Level</td><td className="px-4 py-3">Main period</td><td className="px-4 py-3">Sub-period</td></tr><tr className="border-t border-white/10"><td className="px-4 py-3">Duration</td><td className="px-4 py-3">Years</td><td className="px-4 py-3">Months to years</td></tr><tr className="border-t border-white/10"><td className="px-4 py-3">Role</td><td className="px-4 py-3">Broad theme</td><td className="px-4 py-3">Immediate emphasis</td></tr><tr className="border-t border-white/10"><td className="px-4 py-3">Sequence</td><td className="px-4 py-3">Nine lords</td><td className="px-4 py-3">Nine lords within each Mahadasha</td></tr></tbody></table></div></section>
          <section><h2 className="text-3xl font-bold text-white">What is Pratyantardasha?</h2><p className="mt-4">Pratyantardasha is the third level within the same system: a period nested inside the Antardasha. Because this calculator shows it, you can view a shorter active timing layer without losing the larger Mahadasha and Antardasha context.</p></section>
          <section><h2 className="text-3xl font-bold text-white">How is Vimshottari Dasha Calculated?</h2><p className="mt-4">The methodology has five key steps: find the birth Nakshatra from the sidereal Moon, identify its lord, measure the Moon&apos;s degree within that 13 degrees 20 minutes segment, calculate the remaining balance of the lord&apos;s Mahadasha, and continue through the nine-lord sequence. Antardasha and Pratyantardasha durations are proportional subdivisions of their parent period. This page uses Swiss Ephemeris for the astronomical Moon position and Lahiri ayanamsa for the sidereal calculation.</p></section>
          <section><h2 className="text-3xl font-bold text-white">Why Accurate Birth Time and Place Matter</h2><p className="mt-4">The Moon changes Nakshatra roughly every day, and its degree changes continuously. An incorrect time or timezone can shift its Nakshatra position or materially change the Dasha balance at birth. Your birthplace anchors the calculation to the actual local birth moment, which is why selecting a location and providing the most accurate time available matters.</p></section>
          <section><h2 className="text-3xl font-bold text-white">How to Read Your Dasha Results</h2><p className="mt-4">Start with the current Mahadasha for the major period. Read the current Antardasha as the active sub-theme and Pratyantardasha as the short-term layer. The start date and end date indicate each period&apos;s boundaries; remaining period shows the time until the active level changes. Use the next Mahadasha and timeline to understand the sequence ahead, then interpret those lords in the context of the complete birth chart.</p></section>
          <section><h2 className="text-3xl font-bold text-white">Explore Related Vedic Astrology Tools</h2><p className="mt-4">Your Dasha timeline is one part of a complete birth-chart reading. These tools help you explore the same birth details from different, useful angles.</p><div className="not-prose mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{RELATED_PAGES.map((page) => <a key={page.href} href={page.href} className="card-glass block rounded-2xl border border-white/10 p-4 transition-colors hover:border-pink-500/40 hover:bg-pink-500/5"><h3 className="text-sm font-semibold text-pink-400">{page.title}</h3><p className="mt-2 text-xs leading-5 text-white/55">{page.description}</p></a>)}</div></section>
          <section><h2 className="text-3xl font-bold text-white">Frequently Asked Questions About Dasha Calculator</h2><Accordion type="single" collapsible className="mt-4 border-t border-white/10">{faqItems.map(([question, answer]) => <AccordionItem key={question} value={question} className="border-white/10"><AccordionTrigger className="text-left text-base text-white hover:no-underline">{question}</AccordionTrigger><AccordionContent className="text-base leading-7 text-white/70">{answer}</AccordionContent></AccordionItem>)}</Accordion></section>
        </div>
      </article>
    </div>
  </>;
}
