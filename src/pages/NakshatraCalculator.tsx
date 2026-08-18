import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, CheckCircle2, Clock3, Loader2, MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { getNakshatraLord, getPlanetaryData } from "@/lib/astroCalc";
import NakshatraSeoContent, { NAKSHATRA_FAQS, NAKSHATRA_REFERENCE } from "@/components/NakshatraSeoContent";

const GEOAPIFY_KEY = "ca0423180b57461d82e7dfe404f5bb1b";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SELECT_CLASS = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-pink-500";

type Place = { label: string; lat: number; lon: number; timeZone: string };
type Result = { name: string; number: number; pada: number; lord: string; deity: string; namingSound: string; moonSign: string; longitude: number; within: number; progress: number; timeZone: string };

const formatDegree = (value: number) => {
  const normalized = ((value % 360) + 360) % 360;
  const degrees = Math.floor(normalized);
  const minuteValue = (normalized - degrees) * 60;
  const minutes = Math.floor(minuteValue);
  return `${degrees}° ${minutes}′ ${Math.round((minuteValue - minutes) * 60)}″`;
};

const timeZoneOffset = (year: number, month: number, day: number, hour: number, minute: number, timeZone: string) => {
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const findOffset = (instant: number) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(instant));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return (Date.UTC(+values.year, +values.month - 1, +values.day, +values.hour, +values.minute, +values.second) - instant) / 3600000;
  };
  const first = findOffset(localAsUtc);
  return findOffset(localAsUtc - first * 3600000);
};

const NakshatraAd = () => {
  const adRequested = useRef(false);

  useEffect(() => {
    const requestAd = () => {
      if (adRequested.current) return;
      adRequested.current = true;
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (adError) {
        console.warn("Nakshatra ad could not be initialized", adError);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );

    if (existingScript) {
      requestAd();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8272452438501804";
    script.crossOrigin = "anonymous";
    script.onload = requestAd;
    document.head.appendChild(script);
  }, []);

  return (
    <div className="mt-6 min-h-[90px] overflow-hidden rounded-xl" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8272452438501804"
        data-ad-slot="3143111578"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default function NakshatraCalculator() {
  const navigate = useNavigate();
  const { setAuthOpen } = useAuth();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [meridiem, setMeridiem] = useState("AM");
  const [placeText, setPlaceText] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const timer = useRef<number | null>(null);
  const placeBox = useRef<HTMLDivElement>(null);
  const daysInMonth = year && month ? new Date(+year, +month, 0).getDate() : 31;

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!placeBox.current?.contains(event.target as Node)) setShowSuggestions(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const findPlaces = (query: string) => {
    if (timer.current) window.clearTimeout(timer.current);
    if (query.trim().length < 2) return setShowSuggestions(false);
    timer.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&format=json&apiKey=${GEOAPIFY_KEY}`);
        const data = await response.json();
        const fallbackZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const found = (data.results || []).map((item: any) => ({ label: item.formatted, lat: Number(item.lat), lon: Number(item.lon), timeZone: item.timezone?.name || fallbackZone })).filter((item: Place) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
        setSuggestions(found);
        setShowSuggestions(found.length > 0);
      } catch { setSuggestions([]); } finally { setSearching(false); }
    }, 300);
  };

  const calculate = async () => {
    if (!day || !month || !year || !hour || minute === "" || !place) return setError("Enter your date, exact time, and select your birthplace from the suggestions.");
    setError(""); setLoading(true); setResult(null);
    try {
      const localHour = meridiem === "PM" ? (+hour % 12) + 12 : +hour % 12;
      const offset = timeZoneOffset(+year, +month, +day, localHour, +minute, place.timeZone);
      const chart = await getPlanetaryData({ day: +day, month: +month, year: +year, hour: localHour, min: +minute, lat: place.lat, lon: place.lon, tzone: offset });
      const moon = chart.planets.moon;
      if (!moon || !chart.nakshatra) throw new Error("Moon data unavailable");
      const segment = 360 / 27;
      const within = ((moon.longitude % segment) + segment) % segment;
      const reference = NAKSHATRA_REFERENCE[chart.nakshatra.index];
      setResult({ name: chart.nakshatra.name, number: chart.nakshatra.index + 1, pada: chart.nakshatra.pada, lord: getNakshatraLord(chart.nakshatra.index), deity: reference[3], namingSound: reference[4].split(", ")[chart.nakshatra.pada - 1], moonSign: chart.moonSign || moon.sign, longitude: moon.longitude, within, progress: within / segment * 100, timeZone: place.timeZone });
    } catch (reason) {
      console.error("Nakshatra calculation failed", reason);
      setError("We could not calculate your Nakshatra. Please check your birth details and try again.");
    } finally { setLoading(false); }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Nakshatra Calculator",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    url: "https://veadicastro.in/nakshatra-calculator",
    description: "Calculate birth Nakshatra and pada using Swiss Ephemeris and Lahiri sidereal calculations.",
    potentialAction: {
      "@type": "Action",
      name: "Calculate birth Nakshatra",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://veadicastro.in/nakshatra-calculator",
      },
      result: {
        "@type": "Thing",
        name: "Nakshatra calculation result",
        description: "Janma Nakshatra, Pada, Nakshatra Lord, Moon Sign, deity, naming syllable and exact sidereal Moon longitude.",
      },
    },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: NAKSHATRA_FAQS.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const resultSchema = result ? {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: `${result.name} Nakshatra, Pada ${result.pada}`,
    description: `Birth Nakshatra result: ${result.name}, Pada ${result.pada}, ruled by ${result.lord}, with Moon in ${result.moonSign}.`,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Janma Nakshatra", value: result.name },
      { "@type": "PropertyValue", name: "Nakshatra Pada", value: result.pada },
      { "@type": "PropertyValue", name: "Nakshatra Lord", value: result.lord },
      { "@type": "PropertyValue", name: "Moon Sign", value: result.moonSign },
      { "@type": "PropertyValue", name: "Traditional Deity", value: result.deity },
      { "@type": "PropertyValue", name: "Naming Sound", value: result.namingSound },
      { "@type": "PropertyValue", name: "Sidereal Moon Longitude", value: formatDegree(result.longitude) },
      { "@type": "PropertyValue", name: "Ayanamsa", value: "Lahiri" },
    ],
  } : null;

  return <>
    <Helmet>
      <html lang="en-IN" /><title>Nakshatra Calculator: Find Your Birth Star, Pada & Lord</title>
      <meta name="description" content="Use our free Nakshatra Calculator to find your Janma Nakshatra, birth star, Pada, Nakshatra Lord, Rashi, deity, naming syllables and complete Vedic astrology meaning using your birth date, time and place." />
      <link rel="canonical" href="https://veadicastro.in/nakshatra-calculator" /><meta property="og:title" content="Nakshatra Calculator - Find Your Birth Star & Pada" /><meta property="og:url" content="https://veadicastro.in/nakshatra-calculator" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      {resultSchema && <script type="application/ld+json">{JSON.stringify(resultSchema)}</script>}
    </Helmet>
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
      <div className="pointer-events-none fixed top-[-200px] right-[-200px] h-[400px] w-[400px] rounded-full bg-pink-600/5 blur-[80px]" /><div className="pointer-events-none fixed bottom-[-200px] left-[-200px] h-[350px] w-[350px] rounded-full bg-purple-800/5 blur-[80px]" />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><button onClick={() => navigate("/")} className="flex items-center gap-3"><img src="/optimized/logo.webp" alt="Veadicastro" className="h-9 w-9 rounded-full" /><span className="text-lg font-bold">Veadicastro</span></button><div className="flex items-center gap-3"><span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 sm:inline">Powered by Swiss Ephemeris</span><button onClick={() => navigate("/")} className="text-sm text-white/60 hover:text-pink-400">Back to Home</button></div></div></header>
      <section className="relative px-4 py-14 text-center"><p className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/30 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-pink-400"><Sparkles className="h-3 w-3" />Free Vedic Nakshatra Calculator</p><hgroup><h1 className="mb-2 text-4xl font-black sm:text-5xl md:text-6xl">Nakshatra Calculator</h1><p className="pink-glow mb-6 text-xl font-semibold text-pink-400 sm:text-2xl">Find Your Birth Star & Pada</p></hgroup><p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-white/50">Calculate your Janma Nakshatra, pada, ruling planet, Moon sign, and exact lunar position from your birth details.</p><div className="flex flex-wrap justify-center gap-3 text-sm text-white/75">{["Swiss Ephemeris", "Lahiri sidereal calculations", "Exact Moon position"].map((chip) => <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"><CheckCircle2 className="h-4 w-4 text-green-400" />{chip}</span>)}</div></section>
      {!result && <section className="mx-auto max-w-5xl px-4 pb-8" aria-labelledby="calculator-heading"><div className="mx-auto max-w-2xl"><div className="card-glass rounded-3xl p-8">
        <h2 id="calculator-heading" className="mb-3 text-center text-2xl font-bold">Enter Your Birth Details for <span className="text-pink-400">Birth Nakshatra</span></h2>
        <p className="mb-8 text-center text-sm leading-relaxed text-white/40">Your exact birth time and birthplace determine the Moon&apos;s sidereal longitude, Nakshatra, and pada.</p>
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70"><Calendar className="size-4 text-pink-400" />Date of birth</Label><div className="grid grid-cols-3 gap-3">
            <select aria-label="Birth day" value={day} onChange={(event) => setDay(event.target.value)} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Day</option>{Array.from({ length: daysInMonth }, (_, index) => <option key={index + 1} value={index + 1} className="bg-[#1a1020]">{index + 1}</option>)}</select>
            <select aria-label="Birth month" value={month} onChange={(event) => { setMonth(event.target.value); setDay(""); }} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Month</option>{MONTHS.map((name, index) => <option key={name} value={index + 1} className="bg-[#1a1020]">{name}</option>)}</select>
            <select aria-label="Birth year" value={year} onChange={(event) => { setYear(event.target.value); setDay(""); }} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Year</option>{Array.from({ length: new Date().getFullYear() - 1899 }, (_, index) => new Date().getFullYear() - index).map((value) => <option key={value} value={value} className="bg-[#1a1020]">{value}</option>)}</select>
          </div></div>
          <div className="sm:col-span-2"><Label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70"><Clock3 className="size-4 text-pink-400" />Time of birth</Label><div className="grid grid-cols-3 gap-3">
            <select aria-label="Birth hour" value={hour} onChange={(event) => setHour(event.target.value)} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Hour</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1} className="bg-[#1a1020]">{index + 1}</option>)}</select>
            <select aria-label="Birth minute" value={minute} onChange={(event) => setMinute(event.target.value)} className={SELECT_CLASS}><option value="" className="bg-[#1a1020]">Minute</option>{Array.from({ length: 60 }, (_, index) => <option key={index} value={index} className="bg-[#1a1020]">{String(index).padStart(2, "0")}</option>)}</select>
            <select aria-label="Birth AM or PM" value={meridiem} onChange={(event) => setMeridiem(event.target.value)} className={SELECT_CLASS}><option value="AM" className="bg-[#1a1020]">AM</option><option value="PM" className="bg-[#1a1020]">PM</option></select>
          </div></div>
          <div className="relative sm:col-span-2" ref={placeBox}><Label htmlFor="nakshatra-place" className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70"><MapPin className="size-4 text-pink-400" />Place of birth</Label><div className="relative"><Input id="nakshatra-place" value={placeText} onChange={(event) => { setPlaceText(event.target.value); setPlace(null); findPlaces(event.target.value); }} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} placeholder="Start typing your city or town" className="h-11 rounded-xl border border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30 focus:border-pink-500" autoComplete="off" /><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />{searching && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-pink-400" />}</div>
            {showSuggestions && <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-lg">{suggestions.map((item) => <button key={`${item.lat}-${item.lon}`} type="button" onClick={() => { setPlace(item); setPlaceText(item.label); setShowSuggestions(false); }} className="flex w-full items-center gap-2 border-b border-white/5 px-4 py-3 text-left text-sm text-white/80 last:border-0 hover:bg-pink-900/30"><MapPin className="size-4 shrink-0 text-pink-400" />{item.label}</button>)}</div>}
          </div>
        </div>
        <NakshatraAd />
        <p className="mt-4 text-xs leading-5 text-white/40">The selected birthplace supplies its coordinates and timezone for the Swiss Ephemeris calculation.</p>
        <Button onClick={calculate} disabled={loading} className="btn-pink mt-6 h-12 w-full rounded-xl text-sm font-semibold text-white hover:opacity-90">{loading ? <><Loader2 className="animate-spin" />Calculating Nakshatra...</> : <><Sparkles />Calculate My Nakshatra</>}</Button>
      </div></div></section>}

      {result && <section className="mx-auto max-w-5xl px-4 py-8" aria-live="polite"><div className="card-glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-400">Calculator results</p><h2 className="mt-2 text-3xl font-black">Your Birth Nakshatra</h2></div><Button variant="outline" onClick={() => setResult(null)} className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-pink-500/10 hover:text-white">Calculate again</Button></div>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="card-glass rounded-2xl border border-pink-500/30 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Janma Nakshatra</p><p className="mt-2 text-3xl font-black text-pink-400">{result.name}</p><p className="mt-3 text-sm text-white/60">Nakshatra {result.number} of 27</p></div>
          <div className="card-glass rounded-2xl border border-white/10 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Nakshatra Pada</p><p className="mt-2 text-3xl font-black text-pink-400">Pada {result.pada}</p><p className="mt-3 text-sm text-white/60">Quarter {result.pada} of 4</p></div>
          <div className="card-glass rounded-2xl border border-white/10 p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Ruling Planet</p><p className="mt-2 text-3xl font-black text-pink-400">{result.lord}</p><p className="mt-3 text-sm text-white/60">Vimshottari Nakshatra lord</p></div>
        </div>
        <div className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-glass rounded-2xl border border-white/10 p-5"><h3 className="text-lg font-semibold">Swiss calculation details</h3><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-white/40">Moon sign</dt><dd className="font-medium">{result.moonSign}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Traditional deity</dt><dd className="font-medium">{result.deity}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Pada naming sound</dt><dd className="font-medium text-pink-400">{result.namingSound}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Sidereal longitude</dt><dd className="font-medium">{formatDegree(result.longitude)}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Within Nakshatra</dt><dd className="font-medium">{formatDegree(result.within)}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Birth timezone</dt><dd className="max-w-[60%] text-right font-medium">{result.timeZone}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/40">Ayanamsa</dt><dd className="font-medium">Lahiri</dd></div></dl></div>
          <div className="card-glass rounded-2xl border border-white/10 p-5"><h3 className="text-lg font-semibold">Position in {result.name}</h3><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-pink-600 to-purple-500" style={{ width: `${result.progress}%` }} /></div><div className="mt-2 flex justify-between text-xs text-white/40"><span>0° 00′</span><span>{result.progress.toFixed(2)}%</span><span>13° 20′</span></div><p className="mt-6 leading-7 text-white/70">Your Moon falls in {result.name}, Pada {result.pada}, ruled by {result.lord}. This is a traditional Vedic framework for understanding lunar temperament and life themes.</p></div>
        </div>
        <div className="mt-7 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/15 to-purple-500/10 p-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-300">Personalised guidance</p><h3 className="mt-3 text-2xl font-black">Chat with Vedika AI for Free</h3><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/65">Ask what your Nakshatra and pada mean for personality, career, relationships, strengths, and life direction.</p><Button onClick={() => setAuthOpen(true)} className="btn-pink mt-5 h-12 rounded-xl px-7 text-sm font-semibold text-white hover:opacity-90"><Sparkles />Chat with Vedika AI for Free</Button></div>
      </div></section>}

      <div className="mx-auto my-16 max-w-5xl px-4"><div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" /></div>
      <NakshatraSeoContent />
    </div>
  </>;
}
