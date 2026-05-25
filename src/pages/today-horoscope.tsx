import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles, ChevronRight, Loader2, Star, Heart,
  TrendingUp, Shield, MessageSquare, Award, RefreshCw,
  MousePointer, Brain, Zap,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type RashiKey =
  | "mesh" | "vrishabh" | "mithun" | "kark"
  | "singh" | "kanya" | "tula" | "vrishchik"
  | "dhanu" | "makar" | "kumbh" | "meen";

interface Rashi {
  key: RashiKey;
  hindi: string;
  english: string;
  symbol: string;
  element: string;
  lord: string;
}

interface Question {
  id: string;
  text: string;
  emoji: string;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const RASHIS: Rashi[] = [
  { key: "mesh",      hindi: "मेष",      english: "Aries",       symbol: "♈", element: "Fire",  lord: "Mars"    },
  { key: "vrishabh",  hindi: "वृषभ",     english: "Taurus",      symbol: "♉", element: "Earth", lord: "Venus"   },
  { key: "mithun",    hindi: "मिथुन",    english: "Gemini",      symbol: "♊", element: "Air",   lord: "Mercury" },
  { key: "kark",      hindi: "कर्क",     english: "Cancer",      symbol: "♋", element: "Water", lord: "Moon"    },
  { key: "singh",     hindi: "सिंह",     english: "Leo",         symbol: "♌", element: "Fire",  lord: "Sun"     },
  { key: "kanya",     hindi: "कन्या",    english: "Virgo",       symbol: "♍", element: "Earth", lord: "Mercury" },
  { key: "tula",      hindi: "तुला",     english: "Libra",       symbol: "♎", element: "Air",   lord: "Venus"   },
  { key: "vrishchik", hindi: "वृश्चिक",  english: "Scorpio",     symbol: "♏", element: "Water", lord: "Mars"    },
  { key: "dhanu",     hindi: "धनु",      english: "Sagittarius", symbol: "♐", element: "Fire",  lord: "Jupiter" },
  { key: "makar",     hindi: "मकर",      english: "Capricorn",   symbol: "♑", element: "Earth", lord: "Saturn"  },
  { key: "kumbh",     hindi: "कुम्भ",    english: "Aquarius",    symbol: "♒", element: "Air",   lord: "Saturn"  },
  { key: "meen",      hindi: "मीन",      english: "Pisces",      symbol: "♓", element: "Water", lord: "Jupiter" },
];

const QUESTIONS: Question[] = [
  { id: "money",     text: "Will money come today?",              emoji: "💰" },
  { id: "love",      text: "Does someone love me?",               emoji: "❤️" },
  { id: "travel",    text: "Is travel in my stars today?",        emoji: "✈️" },
  { id: "career",    text: "How is my career energy today?",      emoji: "💼" },
  { id: "health",    text: "What does today say about my health?",emoji: "🌿" },
  { id: "luck",      text: "Am I lucky today?",                   emoji: "🍀" },
  { id: "decision",  text: "Should I take a big decision today?", emoji: "🎯" },
  { id: "enemy",     text: "Are there hidden enemies around me?", emoji: "🛡️" },
  { id: "family",    text: "Will family life be peaceful today?", emoji: "🏠" },
  { id: "spiritual", text: "What is my spiritual energy today?",  emoji: "🕉️" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function getTodayIST(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Short date for SEO title e.g. "24 May 2026"
function getShortDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// DD/MM/YYYY for the badge
function getDateBadge(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildPrompt(rashi: Rashi, question: Question): string {
  const today = getTodayIST();
  return `Today's date is ${today} (IST).

The user's Moon Sign (Rashi) is ${rashi.english} (${rashi.hindi}), ruled by ${rashi.lord}, a ${rashi.element} sign.

Their question is: "${question.text}"

Give a Vedic astrology-based daily horoscope answer for this ${rashi.english} native for today. Use the ruling planet ${rashi.lord} and today's planetary transits as the basis.

Rules:
- Write 250 to 400 words only. No more, no less.
- Write in clear, warm English only. No Hindi words, no Devanagari script, no Hinglish.
- Do NOT use bullet points, dashes, asterisks, bold markers, or any markdown.
- Do NOT use "--" or "**" anywhere.
- Start directly with the prediction. No intro like "Sure!" or "Great question!".
- Reference today's date and the specific question topic clearly.
- End with ONE practical tip or remedy related to today.
- Make it feel personal, real, and specific to ${rashi.english}.`;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function TodayHoroscope() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"rashi" | "question" | "result">("rashi");
  const [selectedRashi, setSelectedRashi] = useState<Rashi | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const shortDate = getShortDate();
  const dateBadge = getDateBadge();

  const handleRashiSelect = (rashi: Rashi) => {
    setSelectedRashi(rashi);
    setStep("question");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuestionSelect = async (question: Question) => {
    if (!selectedRashi) return;
    setSelectedQuestion(question);
    setStep("result");
    setResult("");
    setError("");
    setIsLoading(true);

    const prompt = buildPrompt(selectedRashi, question);

    try {
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
      const response = await fetch(`${API_BASE}/api/mistral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          history: [],
          systemExtra: "",
          stream: true,
          lang: "en",
          apiKeySlot: "secondary",
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          full += data;
          setResult(full);
        }
      }
      reader.releaseLock();
    } catch {
      setError("Kuch problem aa gayi. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("rashi");
    setSelectedRashi(null);
    setSelectedQuestion(null);
    setResult("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cardGlass = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
  } as React.CSSProperties;

  /* ── dynamic SEO strings ── */
  const seoTitle = `Today's Horoscope ${shortDate} | Aaj Ka Rashifal AI — Veadicastro`;
  const seoDesc  = `Today's horoscope for all 12 Rashis — ${shortDate}. Free AI-powered Vedic daily horoscope. Ask about money, love, career, health and get instant Vedic astrology predictions. Updated daily. No signup needed.`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={`today horoscope ${shortDate}, aaj ka rashifal, daily horoscope today, free ai horoscope, today rashifal ai, vedic horoscope today, horoscope ${shortDate}, ai rashifal today, free horoscope today india`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://veadicastro.in/today-horoscope" />

        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content="https://veadicastro.in/today-horoscope" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://veadicastro.in/og-today-horoscope.jpg" />
        <meta property="og:site_name" content="Veadicastro" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content="https://veadicastro.in/og-today-horoscope.jpg" />

        {/* WebApplication schema */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": `Today's Horoscope ${shortDate} — Aaj Ka Rashifal AI`,
          "description": seoDesc,
          "url": "https://veadicastro.in/today-horoscope",
          "applicationCategory": "LifestyleApplication",
          "dateModified": new Date().toISOString().split("T")[0],
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "inLanguage": ["en", "hi"],
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1247", "bestRating": "5" },
          "author": { "@type": "Organization", "name": "Veadicastro", "url": "https://veadicastro.in" }
        })}</script>

        {/* FAQ schema */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Is the AI horoscope really free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Veadicastro's daily AI horoscope needs no signup, no credit card. Select your Rashi, pick a question, and get your answer instantly." } },
            { "@type": "Question", "name": "Which astrology system does this use?", "acceptedAnswer": { "@type": "Answer", "text": "We use sidereal Vedic astrology with Lahiri ayanamsa, the same system used by traditional Jyotish pandits across India." } },
            { "@type": "Question", "name": "How is this updated daily?", "acceptedAnswer": { "@type": "Answer", "text": "Our AI uses today's real date and live planetary positions every time you ask a question, so every reading is fresh and date-specific." } },
            { "@type": "Question", "name": "What is Rashi?", "acceptedAnswer": { "@type": "Answer", "text": "Rashi is your Moon sign in Vedic astrology — the zodiac sign the Moon was in when you were born. It is the most important sign for daily horoscope in Jyotish." } },
          ]
        })}</script>

        {/* BreadcrumbList */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veadicastro.in" },
            { "@type": "ListItem", "position": 2, "name": `Today's Horoscope ${shortDate}`, "item": "https://veadicastro.in/today-horoscope" }
          ]
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ambient blobs */}
        <div className="pointer-events-none fixed top-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full bg-pink-600/5 blur-[80px]" />
        <div className="pointer-events-none fixed bottom-[-200px] left-[-200px] w-[350px] h-[350px] rounded-full bg-purple-800/5 blur-[80px]" />

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-3">
              <img src="/optimized/logo.webp" alt="Veadicastro logo" className="w-9 h-9 rounded-full" loading="eager" />
              <span className="text-lg font-bold tracking-wide">Veadicastro</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-white/60 border border-white/10 rounded-full px-3 py-1">
                Today's Horoscope — Free AI
              </span>
              <button onClick={() => navigate("/")} className="text-sm text-white/60 hover:text-pink-400 transition-colors">
                ← Back to Home
              </button>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative py-14 text-center px-4">

          {/* LIVE DATE BADGE */}
          <div className="flex justify-center mb-5">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.15),rgba(168,85,247,0.10))", border: "1px solid rgba(236,72,153,0.35)" }}
            >
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              <span className="text-pink-300">Today's Horoscope for {dateBadge}</span>
              <span className="text-white/40 text-xs">Updated Daily</span>
            </div>
          </div>

          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3 h-3" /> Free AI Vedic Horoscope — No Signup
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4">
            Today's Horoscope{" "}
            <span className="text-pink-400" style={{ textShadow: "0 0 36px rgba(236,72,153,0.5)" }}>
              {shortDate}
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-xl mx-auto mb-6 leading-relaxed">
            Select your sign, choose what you want to know, and get an instant Vedic horoscope powered by AI. No signup required. Updated every day with fresh planetary data.
          </p>

          {/* internal nav links */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <a href="/free-ai-astrologer-chat" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Free AI Astrologer Chat</a>
            <a href="/free-5-minutes-astrology-ai" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Free 5-Min Astrology AI</a>
            <a href="/free-kundli-generator" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Free Kundli Generator</a>
            <a href="/free-kundali-matching" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Kundli Matching</a>
            <a href="/blog/free-ai-astrology-chat-india" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Free AI Astrology Chat India</a>
            <a href="/blog/is-ai-astrology-accurate" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Is AI Astrology Accurate?</a>
            <a href="/blog/ai-astrologer-vs-human-astrologer" className="text-sm text-white/60 hover:text-pink-400 transition-colors">AI vs Human Astrologer</a>
            <a href="/blog/top-10-vedic-astrology-platform" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Top 10 AI Astrology Tools</a>
            <a href="/" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Best Vedic Astrology Platform</a>
          </div>
        </section>

        {/* ── MAIN TOOL ── */}
        <div className="max-w-4xl mx-auto px-4 pb-8">

          <div className="my-6 flex justify-center">
            <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
          </div>

          {/* ── STEP 1: RASHI GRID ── */}
          {step === "rashi" && (
            <div>
              <h2 className="text-center text-2xl font-bold mb-2 text-white">
                Select Your <span className="text-pink-400">Moon Sign</span>
              </h2>
              <p className="text-center text-white/40 text-sm mb-8">
                Choose your Rashi below to get today's personalized Vedic horoscope instantly
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {RASHIS.map((rashi) => (
                  <button
                    key={rashi.key}
                    onClick={() => handleRashiSelect(rashi)}
                    className="group relative rounded-2xl p-5 text-center transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(12px)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(236,72,153,0.5)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(236,72,153,0.06)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
                    }}
                  >
                    {/* element color dot */}
                    <div
                      className="w-2 h-2 rounded-full absolute top-3 right-3"
                      style={{
                        background: rashi.element === "Fire" ? "#f97316"
                          : rashi.element === "Earth" ? "#84cc16"
                          : rashi.element === "Air" ? "#38bdf8"
                          : "#818cf8",
                        boxShadow: `0 0 6px ${rashi.element === "Fire" ? "#f9731640"
                          : rashi.element === "Earth" ? "#84cc1640"
                          : rashi.element === "Air" ? "#38bdf840"
                          : "#818cf840"}`,
                      }}
                    />
                    {/* zodiac symbol */}
                    <div className="text-4xl mb-3 leading-none">{rashi.symbol}</div>
                    {/* hindi name — big and prominent */}
                    <div className="text-xl font-black text-white mb-1" style={{ fontFamily: "serif" }}>{rashi.hindi}</div>
                    {/* english name */}
                    <div className="text-xs font-semibold text-white/60 mb-2">{rashi.english}</div>
                    {/* ruling planet pill */}
                    <div
                      className="inline-block text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", color: "#f9a8d4" }}
                    >
                      {rashi.lord}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: QUESTION ── */}
          {step === "question" && selectedRashi && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={cardGlass}>
                  <span className="text-2xl">{selectedRashi.symbol}</span>
                  <div>
                    <div className="font-bold text-white">{selectedRashi.hindi} — {selectedRashi.english}</div>
                    <div className="text-xs text-white/40">Lord: {selectedRashi.lord} · {selectedRashi.element}</div>
                  </div>
                  <button
                    onClick={() => setStep("rashi")}
                    className="ml-4 text-xs text-white/40 hover:text-pink-400 transition-colors border border-white/10 rounded-lg px-2 py-1"
                  >
                    Change
                  </button>
                </div>
              </div>
              <h2 className="text-center text-xl font-bold mb-2 text-white">
                What Do You Want to Know Today?
              </h2>
              <p className="text-center text-white/40 text-sm mb-6">
                Choose one question and Vedika will give you an instant answer
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionSelect(q)}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:border-pink-500/60 hover:bg-pink-500/5 group"
                    style={{ ...cardGlass, cursor: "pointer" }}
                  >
                    <span className="text-2xl flex-shrink-0">{q.emoji}</span>
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">{q.text}</span>
                    <ChevronRight className="w-4 h-4 text-pink-400/50 ml-auto flex-shrink-0 group-hover:text-pink-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: RESULT ── */}
          {step === "result" && selectedRashi && selectedQuestion && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-4 p-4 rounded-2xl mb-6" style={cardGlass}>
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img src="/optimized/vedika.webp" alt="Vedika AI astrologer" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">
                    {selectedRashi.symbol} {selectedRashi.hindi} — {selectedQuestion.emoji} {selectedQuestion.text}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{getTodayIST()}</div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-white/40 hover:text-pink-400 border border-white/10 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> New
                </button>
              </div>

              <div className="rounded-3xl p-6 sm:p-8 min-h-[260px] flex flex-col" style={cardGlass}>
                {isLoading && !result && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <div key={d} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: d + "ms" }} />
                      ))}
                    </div>
                    <span className="text-sm text-white/40">Vedika is reading today's planetary positions...</span>
                  </div>
                )}
                {error && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-white/50 text-sm">{error}</p>
                    <button
                      onClick={() => handleQuestionSelect(selectedQuestion)}
                      className="px-4 py-2 rounded-xl text-sm border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
                {result && (
                  <>
                    <div className="flex items-center gap-2 mb-5">
                      <img src="/optimized/vedika.webp" alt="Vedika" className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-sm font-semibold text-pink-400">Vedika</span>
                      {isLoading && <Loader2 className="w-3 h-3 animate-spin text-white/30" />}
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.replace(/\*\*/g, "").replace(/--/g, "").replace(/\*/g, "")}
                    </p>
                  </>
                )}
              </div>

              {result && !isLoading && (
                <div
                  className="mt-6 rounded-2xl p-6 text-center"
                  style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.10),rgba(168,85,247,0.07))", border: "1px solid rgba(236,72,153,0.2)" }}
                >
                  <p className="text-white/70 text-sm mb-4">
                    Want deeper insights? Chat directly with Vedika using your full birth chart.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => navigate("/free-ai-astrologer-chat")}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#ec4899,#be185d)" }}
                    >
                      Chat with Vedika Free
                    </button>
                    <button
                      onClick={() => setStep("question")}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 border border-white/10 hover:border-pink-500/30 transition-colors"
                    >
                      Ask Another Question
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-5xl mx-auto px-4 mb-20 mt-8">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <Zap className="w-3 h-3" /> Simple 3-Step Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              How It <span className="text-pink-400">Works</span>
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto mt-3">
              Getting today's horoscope takes less than 30 seconds. No forms, no signup required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* connector line desktop */}
            <div
              className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.4), rgba(236,72,153,0.4), transparent)" }}
            />

            {[
              {
                step: "01",
                icon: <MousePointer className="w-6 h-6 text-pink-400" />,
                title: "Choose Your Moon Sign",
                desc: "Select your Rashi from the grid above. If you do not know your Moon sign, use our Free Kundli Generator with your date and time of birth to find it instantly.",
                hint: "All 12 Rashis available",
              },
              {
                step: "02",
                icon: <MessageSquare className="w-6 h-6 text-pink-400" />,
                title: "Pick Your Question",
                desc: "What do you want to know today? Money, love, career, health, or luck — choose from 10 specific questions. The more specific your question, the more focused your answer.",
                hint: "10 life areas covered",
              },
              {
                step: "03",
                icon: <Brain className="w-6 h-6 text-pink-400" />,
                title: "AI Generates Your Reading",
                desc: "Our advanced AI uses today's real planetary positions, your Moon sign's ruling planet, and classical Vedic Jyotish logic to generate a fresh horoscope specific to you and specific to today.",
                hint: "250 to 400 words, Vedika style",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 text-center relative"
                style={cardGlass}
              >
                {/* step number */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg,#ec4899,#be185d)", color: "white" }}
                >
                  {item.step}
                </div>

                {/* icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)" }}
                >
                  {item.icon}
                </div>

                <h3 className="font-bold text-lg mb-3 text-white">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{item.desc}</p>
                <div
                  className="inline-block text-xs px-3 py-1 rounded-full text-pink-400"
                  style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.15)" }}
                >
                  {item.hint}
                </div>
              </div>
            ))}
          </div>

          {/* bottom note */}
          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm">
              Every reading is generated fresh daily — our AI uses real-time planetary data, not pre-written content.
            </p>
          </div>
        </section>

        {/* ── AD ── */}
        <div className="flex justify-center my-6">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>

        {/* ── DIVIDER ── */}
        <div className="max-w-5xl mx-auto px-4 my-12">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
        </div>

        {/* ── WHY TRUST US ── */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <Award className="w-3 h-3" /> Why Veadicastro
            </p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Why Choose <span className="text-pink-400">Veadicastro</span> for Daily Horoscope
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { stat: "12", label: "Rashis Covered", title: "All Signs Daily", desc: "Every one of the 12 Vedic Moon signs gets a fresh, personalized horoscope every single day based on real planetary transits — not pre-written generic content." },
              { stat: "24/7", label: "Always Available", title: "No Appointment Needed", desc: "Unlike a traditional pandit who keeps fixed hours, Vedika answers your daily horoscope questions any time, including midnight and early morning." },
              { stat: "100%", label: "Free Forever", title: "Zero Cost Always", desc: "Veadicastro's AI horoscope will always be free. No hidden charges, no premium gate, no tricks. Just pure Vedic guidance every single day." },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 text-center" style={cardGlass}>
                <div className="text-3xl font-bold text-pink-400 mb-1">{item.stat}</div>
                <div className="text-xs text-white/40 mb-3">{item.label}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SEO CONTENT ── */}
        <section className="max-w-4xl mx-auto px-4 mb-20">
          <div className="rounded-3xl p-8 sm:p-10" style={cardGlass}>
            <h2 className="text-3xl sm:text-4xl font-black mb-8 text-white">
              Today's Horoscope {shortDate} — Aaj Ka Rashifal, the Vedic Way
            </h2>
            <div className="space-y-6 text-white/75 leading-relaxed text-base">

              <p>
                Every morning, millions of Indians open their phones and look for one thing before anything else — aaj ka rashifal. What does today hold? Is this a good day to start something new? Will there be any trouble with money? Is someone thinking about me? These are not silly questions. These are real questions that come from a place of wanting to navigate life with a little more clarity, a little less anxiety.
              </p>

              <p>
                For thousands of years, Vedic astrology has tried to answer exactly these questions. The problem was always access. A good Jyotish pandit was expensive, appointment-based, and not always available when you actually needed guidance — which is usually 7 am on a Tuesday when you are about to make a big decision at work or wondering whether to call someone you have been thinking about.
              </p>

              <p>
                Veadicastro changes that. Our free AI horoscope tool gives you a Vedic-based daily reading in under 30 seconds, on any device, any time of day, with no signup required. You pick your Moon sign — your Rashi — and then you pick the specific area of life you want guidance on. The AI does the rest, and every reading is generated fresh based on today's actual date and planetary positions.
              </p>

              <h3 className="text-2xl font-bold text-pink-400 mt-8 mb-3">What Makes This Different from Generic Horoscopes</h3>

              <p>
                If you have read daily horoscopes on most apps or websites, you already know how they feel. Vague. Written for everyone and no one. "Something good may happen today. Stay positive. Watch for unexpected changes." This kind of writing is not astrology. It is filler content dressed up as cosmic wisdom, written once and recycled for months.
              </p>

              <p>
                What we do is genuinely different. When you select your Rashi and ask a specific question, the AI reasons through the answer using real Vedic principles with today's actual date baked in. A Mesh rashi person ruled by Mars is going to experience a Saturn-heavy day very differently from a Makar rashi person who is also ruled by Saturn. That distinction matters. That is what we try to capture in every reading.
              </p>

              <h3 className="text-2xl font-bold text-pink-400 mt-8 mb-3">How the 12 Rashis Work in Vedic Astrology</h3>

              <p>
                In Vedic astrology, your Rashi is your Moon sign, not your Sun sign. The Moon represents your mind, your emotions, and your inner world. It is considered far more important for day-to-day life predictions because the Moon moves fast, completing one full cycle of the zodiac roughly every 28 days. This is why today's horoscope is more accurately done through your Moon sign than your Sun sign.
              </p>

              <p>
                The 12 rashis in Vedic astrology are Mesh, Vrishabh, Mithun, Kark, Singh, Kanya, Tula, Vrishchik, Dhanu, Makar, Kumbh, and Meen. Each has a ruling planet, an element, and a set of characteristics. Mesh is a fire sign ruled by Mars and tends to be bold and impulsive. Vrishabh is an earth sign ruled by Venus and tends toward comfort and stability. Each sign has its own rhythm, and understanding yours is the first step to using astrology practically in daily life.
              </p>

              <h3 className="text-2xl font-bold text-pink-400 mt-8 mb-3">Why Specific Questions Give Better Answers</h3>

              <p>
                Instead of showing you a generic daily horoscope paragraph, we ask you what you actually want to know. When you ask "Will money come today?" the AI focuses on second and eleventh house themes — wealth, income, and gains — relative to your Rashi's current planetary conditions. When you ask "Does someone love me?" the focus shifts to seventh house and Venus themes. The question shapes the lens through which the day's energy is read.
              </p>

              <p>
                If you want to go deeper than these questions can take you, our <a href="/free-ai-astrologer-chat" className="text-pink-400 hover:underline">free AI astrologer chat</a> lets you ask anything directly with your full birth chart loaded in. Or try our <a href="/free-kundli-generator" className="text-pink-400 hover:underline">free kundli generator</a> to get your complete Vedic birth chart with planetary positions, dasha timeline, and personalized remedies.
              </p>

              <h3 className="text-2xl font-bold text-pink-400 mt-8 mb-3">The Role of Planetary Transits in Daily Horoscope</h3>

              <p>
                A daily horoscope that does not account for current planetary transits is not really a horoscope. It is a personality description dressed up as a prediction. The whole point of a daily reading is that it changes every day because the planets are actually moving every day. The Moon changes signs every two and a half days. Mercury, Venus, and Mars move relatively quickly. Jupiter takes about a year per sign. Saturn takes about two and a half years. Every single day the planetary arrangement is slightly different from the day before, and those differences have real effects on different rashis in different ways.
              </p>

              <p>
                When you read your horoscope on Veadicastro today, the AI factors in today's actual date. It knows what day of the week it is, which affects which planetary energies are most active. It reasons about which planets are currently strong or weak based on their sign placement, and it applies that to your specific Moon sign's relationship with those planets. This is why the same question asked by a Mesh rashi person and a Kark rashi person on the same day can produce completely different and equally valid answers.
              </p>

              <h3 className="text-2xl font-bold text-pink-400 mt-8 mb-3">Understanding Each of the 12 Rashis and Today's Energy</h3>

              <p>
                Mesh, the first rashi, is ruled by Mars. People with Mesh Moon tend to be action-oriented, impatient, and direct. On days when Mars is strong, Mesh natives feel energized and confident. On days when Mars is weakened or aspected by Saturn, they may feel frustrated by delays or blocked energy. Knowing this helps you understand why some days feel like you can conquer the world and others feel like you are pushing against a wall.
              </p>

              <p>
                Vrishabh is ruled by Venus, the planet of beauty, comfort, and relationships. Vrishabh Moon natives are naturally drawn to stability, good food, and emotional security. Their daily horoscope is heavily influenced by Venus's current strength. When Venus is in a friendly sign, Vrishabh people experience warmth in relationships, financial flow, and a general sense of ease. When Venus is challenged, they may feel unsettled in love or finances.
              </p>

              <p>
                Mithun is ruled by Mercury, the planet of communication and intellect. Mithun Moon people are naturally curious, adaptable, and excellent communicators. Their daily energy is closely tied to Mercury's position. Strong Mercury days are great for negotiations, writing, studying, and networking. Weak Mercury days can bring miscommunications, scattered thinking, and tech-related frustrations.
              </p>

              <p>
                Kark is ruled by the Moon itself. This makes Kark Moon people among the most emotionally sensitive and intuitive of all rashis. Their mood literally follows the Moon through its daily movements. They are deeply affected by lunar phases, and their best days tend to be around Purnima while their most challenging can come around Amavasya.
              </p>

              <p>
                Singh is ruled by the Sun. Singh Moon people carry a natural dignity and need for recognition. They thrive when the Sun is in a strong position and may feel depleted or overlooked when it is weak. Their best days for career moves and public-facing activities align with when the Sun is well-placed in the sky.
              </p>

              <p>
                Kanya is also ruled by Mercury, like Mithun, but expresses this energy very differently. Kanya Moon people are analytical, detail-oriented, and often perfectionists. They excel on days when mental clarity is high and struggle on days when Mercury creates confusion or when the emotional demands of the day override their need for logical structure.
              </p>

              <p>
                Tula is ruled by Venus, like Vrishabh, but Tula expresses Venus through relationships, fairness, and aesthetics rather than material comfort. Tula Moon people need balance and harmony to function well. On days when Venus is strong, they feel socially connected and at peace. On difficult Venus days, they may feel pulled in too many directions or unable to make decisions.
              </p>

              <p>
                Vrishchik is ruled by Mars, but unlike the outward, physical energy of Mesh, Vrishchik expresses Mars energy inward and intensely. Vrishchik Moon people are deeply perceptive, emotionally intense, and not easily fooled. Their best days are when Mars is strong and direct, giving them the power to act on their intuition with conviction.
              </p>

              <p>
                Dhanu is ruled by Jupiter, the planet of expansion, wisdom, and optimism. Dhanu Moon people are naturally philosophical and freedom-loving. Their daily energy surges when Jupiter is well-placed and they feel connected to something larger than themselves. On difficult Jupiter days, they may feel restless, overconfident, or prone to making promises they cannot keep.
              </p>

              <p>
                Makar is ruled by Saturn, the planet of discipline and karma. Makar Moon people are naturally hardworking, patient, and goal-oriented. They are built for the long game. Their best days come when Saturn is strong and structured, allowing them to make steady progress. Saturn's difficult transits can feel especially heavy for Makar natives because it is their own ruling planet creating the pressure.
              </p>

              <p>
                Kumbh is also ruled by Saturn but expresses this through community, innovation, and humanitarian thinking rather than individual ambition. Kumbh Moon people are independent thinkers who work best when they feel they are contributing to something meaningful. Their daily energy is connected to Saturn's ability to give structure to their unconventional ideas.
              </p>

              <p>
                Meen is ruled by Jupiter and is the most spiritually oriented of all rashis. Meen Moon people are empathetic, creative, and deeply intuitive. They absorb the emotional atmosphere around them easily, which makes strong Jupiter days feel blissful and expansive while difficult days can feel overwhelming and unclear. Their best daily guidance often relates to setting boundaries and channeling their emotional sensitivity productively. For deeper insight into any of these rashis and how today's planets are affecting you personally, try our <a href="/free-ai-astrologer-chat" className="text-pink-400 hover:underline">free AI astrologer chat</a> where you can ask Vedika anything with your full birth chart.
              </p>

              <h3 className="text-2xl font-bold text-pink-400 mt-8 mb-3">How to Use Your Daily Horoscope Practically</h3>

              <p>
                A daily horoscope is not meant to replace your own judgment or stop you from doing something you have planned. It is a tool for awareness. When the reading suggests that today is a good day for financial decisions, it means the planetary energy is supportive — but your preparation, your relationships, and your effort still matter far more than any cosmic alignment. When it suggests caution, that is not a command to stay in bed. It is a nudge to proceed thoughtfully, double-check your work, and not rush.
              </p>

              <p>
                The most practical way to use today's horoscope is to read it in the morning, let it set an intention for the day, and then go live your life. Check back in the evening and notice whether the themes that came up actually resonated with how your day went. Over time, this practice builds your own intuition about how planetary energies feel in your body and your decisions. That is the real goal of Vedic astrology — not dependence on readings, but sharpened self-awareness.
              </p>

            </div>
          </div>
        </section>

        {/* ── AD ── */}
        <div className="flex justify-center my-8">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>

        {/* ── WHAT CAN YOU ASK ── */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              What Can You <span className="text-pink-400">Ask Today?</span>
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">Get instant Vedic guidance across all major areas of life — updated daily.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, topic: "Money & Finance", questions: ["Will money come today?", "Is it a good day to invest?", "Any financial stress today?"] },
              { icon: <Heart className="w-5 h-5" />, topic: "Love & Relationships", questions: ["Does someone love me?", "Is my partner loyal?", "Will I meet someone today?"] },
              { icon: <Shield className="w-5 h-5" />, topic: "Health & Energy", questions: ["What's my health energy today?", "Any risk I should avoid?", "How's my mental state today?"] },
              { icon: <Star className="w-5 h-5" />, topic: "Luck & Timing", questions: ["Am I lucky today?", "Best time for important work?", "Is today auspicious?"] },
              { icon: <MessageSquare className="w-5 h-5" />, topic: "Career & Work", questions: ["How's career energy today?", "Will my boss be favorable?", "Any career opportunity today?"] },
              { icon: <Sparkles className="w-5 h-5" />, topic: "Spiritual & Family", questions: ["Is my family at peace today?", "What is my spiritual energy?", "Any remedy for today?"] },
            ].map((cat, i) => (
              <div key={i} className="rounded-2xl p-5 hover:border-pink-500/30 transition-all" style={cardGlass}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#ec4899,#be185d)" }}>
                    {cat.icon}
                  </div>
                  <span className="font-semibold text-sm">{cat.topic}</span>
                </div>
                <ul className="space-y-1.5">
                  {cat.questions.map((q, j) => (
                    <li key={j} className="text-xs text-white/40 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-pink-500 mt-0.5 flex-shrink-0" />{q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div
            className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.15),rgba(168,85,247,0.1))", border: "1px solid rgba(236,72,153,0.2)" }}
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              Want Deeper Insights?
            </h2>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
              Today's horoscope is just the beginning. Chat directly with Vedika using your full birth chart — completely free.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate("/free-ai-astrologer-chat")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#ec4899,#be185d)" }}
              >
                Chat with Vedika Free
              </button>
              <button
                onClick={() => navigate("/free-kundli-generator")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white/70 font-semibold text-sm border border-white/10 hover:border-pink-500/30 transition-colors"
              >
                Generate Free Kundli
              </button>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
              <MessageSquare className="w-3 h-3" /> Common Questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              Today's Horoscope — <span className="text-pink-400">FAQ</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is this AI horoscope really free and does it need signup?",
                a: "Yes, completely free. No signup, no email verification, no credit card. You select your Rashi, choose your question, and get your answer instantly. Veadicastro believes everyone should have access to quality Vedic guidance without paywalls.",
              },
              {
                q: "How is today's horoscope updated daily?",
                a: "Our AI uses your real-time request date and live planetary positions every single time you ask a question. There is no pre-written content that rotates. Every reading is generated fresh based on the actual date you are reading it, which is why the title and readings change every day.",
              },
              {
                q: "Which astrology system does the AI use?",
                a: "We use sidereal Vedic astrology with Lahiri ayanamsa — the same system used by traditional Jyotish pandits across India. This is different from Western sun sign astrology. Our system is based on your Moon sign, which is far more accurate for day-to-day predictions.",
              },
              {
                q: "What is Rashi and how do I know mine?",
                a: "Your Rashi is your Moon sign in Vedic astrology — the zodiac sign the Moon was occupying at the time of your birth. It is different from your Western Sun sign in most cases. If you do not know your Rashi, use our free kundli generator with your date, time, and place of birth to find it accurately.",
              },
              {
                q: "Can I ask multiple questions for the same Rashi today?",
                a: "Yes. After getting your answer, tap 'Ask Another Question' to choose a different area of life. Each question gives a fresh AI-generated answer focused specifically on that topic for your Rashi today.",
              },
              {
                q: "What if I want a deeper reading beyond today's horoscope?",
                a: "Our free AI astrologer chat page lets you enter your full birth details including date, time, and place, and chat with Vedika about anything. You get personalized answers based on your actual birth chart, dasha period, and current transits, not just your Moon sign.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 border-l-4 border-pink-500/50" style={cardGlass}>
                <h3 className="font-semibold text-white/90 text-lg mb-3">{item.q}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM LINKS ── */}
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/free-ai-astrologer-chat" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Free AI Astrologer Chat</a>
            <a href="/free-5-minutes-astrology-ai" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Free 5-Min Astrology</a>
            <a href="/free-kundli-generator" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Birth Chart Calculator</a>
            <a href="/free-kundali-matching" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Kundli Matching</a>
            <a href="/blog" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Vedic Astrology Blog</a>
            <a href="/" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Home</a>
          </div>
        </div>

        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-white/20 text-xs">© Veadicastro — Ancient Vedic Wisdom, Powered by AI</p>
        </footer>

      </div>
    </>
  );
}