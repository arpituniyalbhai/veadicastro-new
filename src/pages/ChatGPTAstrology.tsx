import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import AdBanner from "@/components/AdBanner";
import { ArrowUp, Loader2, MapPin, MessageSquare, Plus, Search, X } from "lucide-react";
import { getPlanetaryData, type AstroPayload } from "@/lib/astroCalc";
import { generateGeminiStream, type ChatTurn } from "@/lib/gemini";
import { persistAstroPayload } from "@/lib/astroStorage";
import { useAuth } from "@/context/AuthContext";

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

const thinkingMessages = [
  "Analyzing your planetary positions...",
  "Studying your birth Kundali...",
  "Mapping your life timeline...",
  "Calculating dasha periods...",
  "Preparing your personalized prediction...",
];

const internalLinks = [
  { label: "Home", href: "/" },
  { label: "Free AI Astrologer", href: "/free-ai-astrologer-chat" },
  { label: "5 Minutes Astrology", href: "/free-5-minutes-astrology-ai" },
  { label: "Marriage Timing AI", href: "/ai-marriage-prediction-by-date-of-birth" },
  { label: "AI Astrology Prediction", href: "/ai-astrology-prediction" },
  { label: "Free Kundli Generator", href: "/free-kundli-generator" },
  { label: "AI Astrology", href: "/ai-astrology" },
];

const inputClass =
  "h-10 w-full rounded-md border border-white/15 bg-[#0f0f0f] px-3 text-sm text-white outline-none transition focus:border-[#d9277a] placeholder:text-white/35";

const selectClass =
  "h-10 w-full rounded-md border border-white/15 bg-[#0f0f0f] px-3 text-sm text-white outline-none transition focus:border-[#d9277a]";

export default function ChatGPTAstrology() {
  const { setAuthOpen } = useAuth();
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
  const [astroData, setAstroData] = useState<AstroPayload | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [message, setMessage] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [showAds, setShowAds] = useState(true);
  const [showDobModal, setShowDobModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isGeneratingKundli, setIsGeneratingKundli] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, thinkingMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("free_ai_chat_used", "true");
      localStorage.setItem("free_ai_chat_timestamp", new Date().toISOString());
    }
  }, [messages]);

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

      if (data?.results?.length) {
        const suggestions = (data.results as OpenCageResult[]).map((r) => ({
          display_name: r.formatted,
          lat: r.geometry.lat.toString(),
          lon: r.geometry.lng.toString(),
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

  const sendQuestion = async (question: string, chartData = astroData, lang = language) => {
    if (!question.trim() || isTyping) return;
    if (messageCount >= 1 && !showSignupModal) {
      setShowSignupModal(true);
      return;
    }

    if (!chartData) {
      setPendingQuestion(question);
      setShowDobModal(true);
      return;
    }

    const history = messages;
    setMessage("");
    setChatStarted(true);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setMessageCount((prev) => prev + 1);
    setIsTyping(true);

    let idx = 0;
    setThinkingMessage(thinkingMessages[0]);
    const interval = window.setInterval(() => {
      idx += 1;
      setThinkingMessage(thinkingMessages[idx % thinkingMessages.length]);
    }, 2000);

    try {
      const sys = buildSystemPrompt(chartData, lang);
      await generateGeminiStream(
        question,
        history,
        (delta) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return [...prev.slice(0, -1), { role: "assistant", content: last.content + delta }];
            }
            return [...prev, { role: "assistant", content: delta }];
          });
        },
        sys,
        lang,
        birthDetails.name || undefined,
        "secondary"
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      window.clearInterval(interval);
      setThinkingMessage("");
      setIsTyping(false);
    }
  };

  const submitBirthDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!birthDetails.name.trim() || !birthDetails.birthPlace.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsGeneratingKundli(true);
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
      setAstroData(payload);
      persistAstroPayload(payload);
      setShowDobModal(false);
      await sendQuestion(pendingQuestion, payload, language);
    } catch {
      alert("Error generating Kundli. Please try again.");
    } finally {
      setIsGeneratingKundli(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendQuestion(message);
    }
  };

  const firstUserQuestion = messages.find((item) => item.role === "user")?.content || "ChatGPT Astrology";

  return (
    <>
      <Helmet>
        <title>Free Chatgpt Astrology - Free | Veadicastro</title>
        <meta
          name="description"
          content="ChatGPT for astrology — ask any life question and get instant Vedic predictions powered by AI. Free, no signup needed. Career, love, finance predictions."
        />
        <link rel="canonical" href="https://veadicastro.in/chatgpt-astrology" />
        <script type="application/ld+json">
          {`{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ChatGPT Astrology",
  "url": "https://veadicastro.in/chatgpt-astrology"
}`}
        </script>
        <script type="application/ld+json">
          {`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is ChatGPT Astrology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ChatGPT Astrology means using an AI chatbot to get astrology predictions. Unlike regular ChatGPT, our tool calculates your actual Vedic birth chart and gives personal answers based on your planetary positions."
      }
    },
    {
      "@type": "Question",
      "name": "Is ChatGPT good for astrology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Regular ChatGPT is not good for astrology because it cannot calculate birth charts or Dasha periods. Our ChatGPT Astrology tool is built specifically for Vedic predictions."
      }
    },
    {
      "@type": "Question",
      "name": "Is this tool free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, your first question is completely free with no signup required."
      }
    }
  ]
}`}
        </script>
      </Helmet>

      <div className="min-h-screen bg-black text-white antialiased">
        <style>{`@media (max-width: 767px) { section::-webkit-scrollbar, div::-webkit-scrollbar, body::-webkit-scrollbar, html::-webkit-scrollbar { display: none; width: 0; height: 0; } body { -ms-overflow-style: none; } }`}</style>
        <div className="flex min-h-screen flex-col md:grid md:grid-cols-[260px_1fr]">
          <aside className="hidden border-r border-white/10 bg-[#111111] md:flex md:flex-col">
            <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
              <img src="/favicon.ico" alt="Veadicastro Logo" className="h-7 w-7 rounded" />
              <div>
                <p className="text-sm font-semibold leading-none">Vedika</p>
                <p className="mt-1 text-xs text-white/45">ChatGPT Astrology</p>
              </div>
            </div>
            <div className="p-3">
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setMessage("");
                  setChatStarted(false);
                  setShowAds(true);
                }}
                className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-white/85 hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                New chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3">
              <p className="mb-2 px-3 text-xs text-white/35">Chats</p>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md bg-white/10 px-3 py-2 text-left text-sm text-white/85"
              >
                <MessageSquare className="h-4 w-4 text-[#d9277a]" />
                <span className="line-clamp-1">{firstUserQuestion}</span>
              </button>
            </div>
            <div className="border-t border-white/10 p-4 text-xs text-white/45">
              <div className="space-y-2">
                {internalLinks.map((item) => (
                  <Link key={item.href} to={item.href} className="block hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex min-h-screen flex-col bg-black">
            <header className="flex h-14 items-center justify-between border-b border-white/10 px-4 md:hidden">
              <div className="flex items-center gap-3">
                <img src="/favicon.ico" alt="Veadicastro Logo" className="h-7 w-7 rounded" />
                <span className="text-sm font-semibold">Vedika</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setMessage("");
                  setChatStarted(false);
                  setShowAds(true);
                }}
                className="rounded-md p-2 text-white/75 hover:bg-white/10"
                aria-label="New chat"
              >
                <Plus className="h-5 w-5" />
              </button>
            </header>

            <section className="flex-1 overflow-y-auto px-4 pb-40 pt-8 md:pb-36" style={{ WebkitOverflowScrolling: 'touch' }}>
              {!chatStarted ? (
                <div className="mx-auto flex min-h-[calc(100dvh-14rem)] max-w-4xl flex-col items-center justify-center px-2">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#111111]">
                      <img src="/favicon.ico" alt="Veadicastro Logo" className="h-8 w-8 rounded" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                      ChatGPT Astrology
                    </h1>
                    <p className="mt-2 text-sm text-white/55">Ask Vedika your astrology question</p>
                  </div>
                  {showAds && (
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                      <AdBanner adSlot="3274072156" className="w-full" />
                      <AdBanner adSlot="3274072156" className="hidden w-full sm:block" />
                    </div>
                  )}
                  <nav className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/45">
                    {internalLinks.map((item) => (
                      <Link key={item.href} to={item.href} className="hover:text-[#d9277a]">
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-3xl space-y-6">
                  {messages.map((item, index) => (
                    <div
                      key={`${item.role}-${index}`}
                      className={`flex gap-4 ${item.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {item.role === "assistant" && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111]">
                          <img src="/favicon.ico" alt="Vedika" className="h-5 w-5 rounded" />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                          item.role === "user"
                            ? "bg-[#2f2f2f] text-white"
                            : "bg-transparent text-white/85"
                        }`}
                      >
                        {item.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111]">
                        <img src="/favicon.ico" alt="Vedika" className="h-5 w-5 rounded" />
                      </div>
                      <div className="pt-2 text-sm text-white/50">
                        <span>{thinkingMessage}</span>
                        <span className="ml-2 inline-flex gap-1 align-middle">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </section>

            <div className="fixed bottom-0 left-0 right-0 bg-black px-3 pb-3 pt-3 md:sticky md:pb-5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.75rem)' }}>
              <div className="mx-auto max-w-3xl">
                <div className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-white/15 bg-[#111111] px-4 py-2 md:min-h-[58px] md:py-3">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Vedika anything about your life, career, love, or future..."
                    disabled={isTyping}
                    rows={1}
                    className="max-h-32 flex-1 resize-none bg-transparent text-base leading-6 text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed md:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => sendQuestion(message)}
                    disabled={!message.trim() || isTyping}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9277a] text-white transition hover:bg-[#c1206d] disabled:cursor-not-allowed disabled:bg-white/20 md:h-8 md:w-8"
                    aria-label="Send message"
                  >
                    <ArrowUp className="h-5 w-5 md:h-4 md:w-4" />
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] text-white/35">
                  One free answer. Sign up to continue deeper with Vedika.
                </p>
                <AdBanner adSlot="3274072156" className="mt-4" />
              </div>
            </div>
          </main>
        </div>

        <article className="mx-auto max-w-3xl px-4 pb-20 pt-12 text-white/75">
          <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {internalLinks.map((item) => (
              <Link key={item.href} to={item.href} className="text-[#d9277a] hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>

          <h2 className="mb-4 text-3xl font-semibold text-white">What is ChatGPT Astrology?</h2>
          <p className="mb-5 leading-7">
            ChatGPT Astrology is simply using an AI to answer your astrology questions the same way you chat with ChatGPT. You type a question, the AI reads your birth chart, and you get a personal answer in seconds. No waiting, no appointments, no per minute charges.
          </p>
          <p className="mb-5 leading-7">
            Most people have already tried asking ChatGPT about their future. The problem is ChatGPT does not know Vedic astrology deeply. It gives the same generic answer to everyone. It cannot calculate your Dasha period. You can use our <Link to="/dasha-calculator/" className="text-[#d9277a] hover:text-white">Dasha Calculator</Link> to find your Mahadasha and Antardasha from your actual birth details, or the <Link to="/nakshatra-calculator/" className="text-[#d9277a] hover:text-white">Nakshatra Calculator</Link> to calculate your Moon&apos;s exact birth star and pada. It does not know your Lagna. It has no idea which planets are affecting your life right now. So the answer feels useless.
          </p>
          <p className="mb-10 leading-7">We built this tool to fix exactly that problem.</p>

          <h2 className="mb-4 text-2xl font-semibold text-white">How This Tool Works</h2>
          <p className="mb-5 leading-7">
            When you open this page you will see 12 of the most asked astrology questions. You pick the one that matches what is on your mind. Then we ask for your date of birth, time of birth, and place of birth. These three details are used to calculate your exact Vedic birth chart using Swiss Ephemeris data which is the same system professional Vedic astrologers use worldwide.
          </p>
          <p className="mb-5 leading-7">
            After your chart is ready Vedika reads it before answering your question. So when you ask about your career she is not giving you a motivational quote. She is looking at your 10th house your current Mahadasha and which planets are transiting your chart right now. The answer is personal to you and only you.
          </p>
          <p className="mb-10 leading-7">This is what separates this tool from regular ChatGPT for astrology.</p>

          <h2 className="mb-4 text-2xl font-semibold text-white">Why People Are Switching to AI Astrology</h2>
          <p className="mb-5 leading-7">
            A few years ago getting a proper Vedic astrology reading meant visiting a local pandit or paying high per minute charges on platforms like AstroTalk. The problem was not just the cost. You never really knew if the astrologer was genuinely reading your chart or just saying things to keep you on the call longer.
          </p>
          <p className="mb-5 leading-7">
            AI astrology solves this in a very simple way. The AI has no incentive to keep you engaged. It gives you the answer and stops. No upselling. No fear based predictions. No vague statements designed to make you come back next week.
          </p>
          <p className="mb-10 leading-7">
            Vedika gives you a direct answer based on your actual planetary positions. If your current Dasha is not supporting a career change right now she will tell you that clearly. If Saturn is putting pressure on your relationships she will explain why and what you can do about it. Real answers from a real birth chart.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">What You Can Ask</h2>
          <p className="mb-5 leading-7">
            People use this tool for all kinds of life questions every single day. The most common topics are career growth, marriage timing, money and financial decisions, business success, health concerns, and relationship problems.
          </p>
          <p className="mb-5 leading-7">
            Some of the most asked questions on this tool are when will I get a good job, is this the right time to start a business, will my relationship work out, when will my financial situation improve, and what does my next one year look like based on my chart.
          </p>
          <p className="mb-10 leading-7">
            Vedika answers all of these using your personal birth chart. She does not give zodiac sign based generic answers that apply to millions of people at once. Every answer is calculated fresh using your exact planetary positions.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">Is ChatGPT Astrology Accurate?</h2>
          <p className="mb-5 leading-7">
            This is the most common question people ask before trying the tool. The honest answer is yes but with one condition. The accuracy depends entirely on how correct your birth details are. If your birth time is even 30 minutes off your Lagna can change completely and the predictions will shift.
          </p>
          <p className="mb-10 leading-7">
            If you know your exact birth time the predictions Vedika gives are based on real mathematical calculations not guesswork. Your Dasha period is calculated to the exact day. Your transits are checked against today's planetary positions. The system follows the same Parashari principles that Vedic astrologers have used for thousands of years.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">Can ChatGPT Do Astrology?</h2>
          <p className="mb-5 leading-7">
            Regular ChatGPT can talk about astrology in a general way but it cannot do real Vedic astrology. It does not calculate birth charts. It does not know your Dasha period. It cannot check which planets are transiting your chart today. It reads from general training data and gives an answer that could apply to anyone.
          </p>
          <p className="mb-10 leading-7">
            Our ChatGPT Astrology tool is different because it actually runs the calculations first and then answers. Think of it as ChatGPT but with a real Vedic astrologer brain built inside it.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">The Technology Behind It</h2>
          <p className="mb-10 leading-7">
            Vedika is powered by advanced AI that has been trained specifically on Vedic astrology texts including Brihat Parashara Hora Shastra and Saravali. The birth chart calculations use Swiss Ephemeris which gives planetary positions accurate to arc second precision. The Dasha calculations follow the Vimshottari system exactly as described in classical texts. The combination of accurate chart data and a Vedic trained AI is what makes the predictions feel personal and specific rather than vague and generic.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-white">Why Veadicastro Built This</h2>
          <p className="mb-5 leading-7">
            Our team comes from a family with multiple generations of Vedic astrology knowledge. We have seen firsthand how good astrology can help people make better decisions about their career, relationships, and life timing. We also saw how the online astrology industry was full of fake predictions, fear mongering, and per minute billing designed to drain money rather than give real answers.
          </p>
          <p className="mb-10 leading-7">
            We built this tool because we believe everyone deserves access to real Vedic astrology without paying hundreds of rupees per session. The stars do not charge per minute and neither should we.
          </p>

          <h2 className="mb-5 text-2xl font-semibold text-white">FAQ</h2>
          <div className="space-y-6">
            <section>
              <h3 className="mb-2 text-lg font-semibold text-white">What is ChatGPT Astrology?</h3>
              <p className="leading-7">ChatGPT Astrology means using an AI chatbot to get astrology predictions. Unlike regular ChatGPT, our tool calculates your actual Vedic birth chart and gives personal answers based on your planetary positions.</p>
            </section>
            <section>
              <h3 className="mb-2 text-lg font-semibold text-white">Is ChatGPT good for astrology?</h3>
              <p className="leading-7">Regular ChatGPT is not good for astrology because it cannot calculate birth charts or Dasha periods. Our ChatGPT Astrology tool is built specifically for Vedic predictions and gives accurate personal answers.</p>
            </section>
            <section>
              <h3 className="mb-2 text-lg font-semibold text-white">Can AI predict my future using astrology?</h3>
              <p className="leading-7">Yes. Our AI calculates your exact birth chart using Swiss Ephemeris data and reads your current Mahadasha and transits before answering. The predictions are based on real Vedic calculations not guesswork.</p>
            </section>
            <section>
              <h3 className="mb-2 text-lg font-semibold text-white">Is this tool free?</h3>
              <p className="leading-7">Yes, your first question is completely free with no signup required. You can create a free account to get one full free chat with Vedika.</p>
            </section>
            <section>
              <h3 className="mb-2 text-lg font-semibold text-white">Which astrology system does this tool use?</h3>
              <p className="leading-7">This tool uses sidereal Vedic astrology with Lahiri ayanamsa. It follows Parashari principles from classical Vedic texts. It does not use Western tropical astrology.</p>
            </section>
            <section>
              <h3 className="mb-2 text-lg font-semibold text-white">How accurate is ChatGPT Astrology?</h3>
              <p className="leading-7">Accuracy depends on your birth details. If your birth time is correct the predictions are based on real mathematical calculations including your exact Dasha period and current planetary transits.</p>
            </section>
          </div>
        </article>
      </div>

      {showDobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/15 bg-[#111111] p-5 text-white">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Birth details</h2>
                <p className="mt-1 text-sm text-white/50">Vedika needs your Kundli before answering.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDobModal(false)}
                className="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitBirthDetails} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-white/70">
                  <span>Name</span>
                  <input
                    value={birthDetails.name}
                    onChange={(event) => setBirthDetails((prev) => ({ ...prev, name: event.target.value }))}
                    className={inputClass}
                    placeholder="Your name"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Gender</span>
                  <select
                    value={birthDetails.gender}
                    onChange={(event) =>
                      setBirthDetails((prev) => ({ ...prev, gender: event.target.value as Gender }))
                    }
                    className={selectClass}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-2 text-sm text-white/70">
                  <span>Day</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={birthDetails.day}
                    onChange={(event) => setBirthDetails((prev) => ({ ...prev, day: Number(event.target.value) }))}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Month</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={birthDetails.month}
                    onChange={(event) => setBirthDetails((prev) => ({ ...prev, month: Number(event.target.value) }))}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Year</span>
                  <input
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    value={birthDetails.year}
                    onChange={(event) => setBirthDetails((prev) => ({ ...prev, year: Number(event.target.value) }))}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm text-white/70">
                  <span>Hour</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={birthDetails.hour}
                    onChange={(event) => setBirthDetails((prev) => ({ ...prev, hour: Number(event.target.value) }))}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2 text-sm text-white/70">
                  <span>Minute</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={birthDetails.minute}
                    onChange={(event) => setBirthDetails((prev) => ({ ...prev, minute: Number(event.target.value) }))}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="relative block space-y-2 text-sm text-white/70">
                <span>Birth Place</span>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={birthDetails.birthPlace}
                    onChange={(event) => handleLocationChange(event.target.value)}
                    className={`${inputClass} pl-9 pr-9`}
                    placeholder="City, state, country"
                    required
                  />
                  {isSearchingLocation && (
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  )}
                </div>
                {showLocationSuggestions && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-md border border-white/15 bg-[#0f0f0f]">
                    {locationSuggestions.map((place) => (
                      <button
                        key={`${place.display_name}-${place.lat}-${place.lon}`}
                        type="button"
                        onClick={() => selectLocation(place)}
                        className="block w-full border-b border-white/10 px-3 py-2 text-left text-sm text-white/75 last:border-b-0 hover:bg-white/10"
                      >
                        {place.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </label>

              <label className="space-y-2 text-sm text-white/70">
                <span>Language</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as Lang)}
                  className={selectClass}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={isGeneratingKundli}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#d9277a] text-sm font-semibold text-white transition hover:bg-[#c1206d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingKundli && <Loader2 className="h-4 w-4 animate-spin" />}
                Start chat
              </button>
            </form>
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-white/15 bg-[#111111] p-7 text-center text-white">
            <div className="mx-auto mb-4 h-14 w-14 overflow-hidden rounded-full bg-black">
              <img src="/optimized/vedika.webp" alt="Vedika" className="h-full w-full object-cover" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Sign up to Get 1 Chat Free</h3>
            <p className="mb-6 text-sm text-white/55">
              You've used your free question! Sign up to get 1 free chat and unlock deeper astrology insights.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSignupModal(false);
                setAuthOpen(true);
              }}
              className="h-11 w-full rounded-md bg-[#d9277a] text-sm font-semibold text-white transition hover:bg-[#c1206d]"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </>
  );
}
