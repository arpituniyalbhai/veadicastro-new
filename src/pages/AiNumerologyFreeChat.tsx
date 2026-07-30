import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Send, Sparkles, User, Loader2, CheckCircle2, Brain, Shield, Star,
  MessageSquare, ChevronRight, Award, Heart, TrendingUp, Zap, Globe, Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AdBanner from "@/components/AdBanner";
import { useAuth } from "@/context/AuthContext";
import { calculateNumerology, getLifePathMeaning, getDestinyMeaning, type NumerologyResult } from "@/lib/numerology";
import { generateGeminiStream, type ChatTurn } from "@/lib/gemini";

const loadingMessages = [
  "Calculating your Life Path Number...",
  "Analysing your Destiny Number...",
  "Finding your lucky numbers...",
  "Understanding your numerology profile...",
  "Preparing your AI Numerologist...",
];

const suggestionChips = [
  "What career suits me",
  "What is my lucky number",
  "How is my love life",
  "Best business for me",
  "How can I improve my finances",
  "What are my strengths",
  "What are my weaknesses",
  "What should I focus on this year",
  "Which year is best for marriage",
  "What does my Life Path Number mean",
];

const internalLinks = [
  { label: "Home", href: "/" },
  { label: "Free AI Astrologer", href: "/free-ai-astrologer-chat" },
  { label: "AI Astrology", href: "/ai-astrology" },
  { label: "Marriage Timing AI", href: "/ai-marriage-prediction-by-date-of-birth" },
  { label: "Free Kundli Generator", href: "/free-kundli-generator" },
  { label: "Angel Number Calculator", href: "/angel-number-calculator" },
];

export default function AiNumerologyFreeChat() {
  const navigate = useNavigate();
  const { setAuthOpen } = useAuth();

  const [name, setName] = useState("");
  const [dobDay, setDobDay] = useState(1);
  const [dobMonth, setDobMonth] = useState(1);
  const [dobYear, setDobYear] = useState(2000);
  const [numerology, setNumerology] = useState<NumerologyResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [chatLocked, setChatLocked] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length > 0 || isTyping) {
        endRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const handleContinue = () => {
    if (!name.trim()) return;
    setShowForm(false);
    setShowLoading(true);

    const result = calculateNumerology(name.trim(), dobDay, dobMonth, dobYear);
    setNumerology(result);

    let idx = 0;
    setLoadingMessage(loadingMessages[0]);
    const iv = setInterval(() => {
      idx += 1;
      if (idx < loadingMessages.length) {
        setLoadingMessage(loadingMessages[idx]);
      }
    }, 1200);

    setTimeout(() => {
      clearInterval(iv);
      setShowLoading(false);
      setShowSummary(true);
    }, 6000);
  };

  const startChat = () => {
    setShowSummary(false);
    setShowChat(true);
    setChatStarted(true);
  };

  const buildNumerologyPrompt = (num: NumerologyResult): string => {
    return `You are an expert numerologist with deep knowledge of Pythagorean and Chaldean numerology systems. You have access to the user's complete numerology profile calculated locally. Always base your answers on this data and never invent numbers.

User's Numerology Profile:
- Name: ${num.name}
- Life Path Number: ${num.lifePath}${num.isMasterNumber ? " (Master Number " + num.masterNumberType + ")" : ""}
- Destiny Number: ${num.destiny}
- Birthday Number: ${num.birthday}
- Soul Urge Number: ${num.soulUrge}
- Personality Number: ${num.personality}
- Personal Year Number: ${num.personalYear}
- Lucky Number: ${num.luckyNumber}${num.karmicDebt ? "\n- Karmic Debt: " + num.karmicDebt : ""}

Life Path Meaning: ${getLifePathMeaning(num.lifePath)}
Destiny Meaning: ${getDestinyMeaning(num.destiny)}

Guidelines:
1. Always reference the user's actual numerology numbers when answering.
2. Never calculate or fabricate numerology numbers yourself.
3. Never claim certainty about specific future events.
4. Explain insights in a balanced, helpful way without making absolute predictions.
5. Keep responses personalised to the user's name and numbers.
6. Encourage self-reflection rather than making deterministic claims.
7. Maintain a warm, human, conversational tone like a trusted mentor.
8. Keep responses concise and meaningful, ideally 4-8 sentences.
9. Never mention that you are an AI or language model.
10. If the user asks about a topic not covered by numerology, gently guide them back to what the numbers reveal.`;
  };

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || isTyping || chatLocked) return;

    if (messageCount >= 2) {
      setShowSignupModal(true);
      return;
    }

    if (!numerology) return;

    const userMsg = msg;
    setMessage("");
    setMessages(p => [...p, { role: "user", content: userMsg }]);
    setMessageCount(prev => prev + 1);
    setIsTyping(true);

    let idx = 0;
    const iv = setInterval(() => {
      const thinkMessages = ["Consulting your numerology chart...", "Interpreting your numbers...", "Finding insights in your profile...", "Preparing your personalised answer..."];
      setThinkingMessage(thinkMessages[idx++ % thinkMessages.length]);
    }, 2000);

    try {
      const systemPrompt = buildNumerologyPrompt(numerology);
      const payload = JSON.stringify(numerology);
      await generateGeminiStream(
        userMsg,
        messages,
        (delta) => {
          setMessages(p => {
            const last = p[p.length - 1];
            if (last?.role === "assistant") {
              return [...p.slice(0, -1), { role: "assistant" as const, content: last.content + delta }];
            }
            return [...p, { role: "assistant" as const, content: delta }];
          });
        },
        systemPrompt + "\n\nNumerology Data:\n" + payload,
        "en",
        name,
        "secondary"
      );
      clearInterval(iv);
      setThinkingMessage("");
    } catch {
      clearInterval(iv);
      setThinkingMessage("");
      setMessages(p => [...p, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
      if (messageCount + 1 >= 2) {
        setChatLocked(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  const summaryCards = numerology
    ? [
        { label: "Life Path Number", value: numerology.lifePath, desc: getLifePathMeaning(numerology.lifePath).split(".")[0] + "." },
        { label: "Destiny Number", value: numerology.destiny, desc: getDestinyMeaning(numerology.destiny).split(".")[0] + "." },
        { label: "Lucky Number", value: numerology.luckyNumber, desc: "Your personal lucky number based on your chart." },
        { label: "Personality Number", value: numerology.personality, desc: "How others perceive you at first glance." },
        { label: "Personal Year", value: numerology.personalYear, desc: "The energy theme of your current year." },
      ]
    : [];

  return (
    <>
      <Helmet>
        <title>AI Numerology Free Chat — Ask Free AI Numerologist | Veadicastro</title>
        <meta name="description" content="Chat with a free AI numerologist. Enter your name and date of birth to get personalised numerology insights including Life Path, Destiny, and Lucky Numbers. Ask unlimited questions during your session." />
        <meta name="keywords" content="AI Numerology Free Chat, Free AI Numerologist, AI Numerology Chat, Numerology AI, Free Numerology AI, Numerology Chatbot, AI Numerology Reading, AI Numerology Calculator, Name and Date of Birth Numerology, Ask AI Numerologist" />
        <link rel="canonical" href="https://veadicastro.in/ai-numerology-free-chat" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="language" content="en" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />

        <meta property="og:title" content="AI Numerology Free Chat — Ask Free AI Numerologist | Veadicastro" />
        <meta property="og:description" content="Chat with a free AI numerologist. Enter your name and date of birth to get personalised numerology insights including Life Path, Destiny, and Lucky Numbers." />
        <meta property="og:url" content="https://veadicastro.in/ai-numerology-free-chat" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://veadicastro.in/og-ai-numerology.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Veadicastro" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Numerology Free Chat — Ask Free AI Numerologist | Veadicastro" />
        <meta name="twitter:description" content="Chat with a free AI numerologist. Get personalised numerology insights including Life Path, Destiny, and Lucky Numbers." />
        <meta name="twitter:image" content="https://veadicastro.in/og-ai-numerology.jpg" />
        <meta name="twitter:site" content="@veadicastro" />
        <meta name="twitter:creator" content="@veadicastro" />

        <meta name="author" content="Veadicastro" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "AI Numerology Free Chat",
          "alternateName": ["Free AI Numerologist", "AI Numerology Chat", "Numerology AI", "Numerology Chatbot"],
          "description": "Free AI numerology chat that calculates your Life Path, Destiny, and Lucky Numbers from your name and date of birth. Ask personalised numerology questions and get AI-powered insights.",
          "url": "https://veadicastro.in/ai-numerology-free-chat",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Web",
          "inLanguage": ["en"],
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "featureList": ["Life Path Number Calculator", "Destiny Number Calculator", "Lucky Number Finder", "AI Numerology Chat", "Personalised Numerology Insights"],
          "screenshot": "https://veadicastro.in/og-ai-numerology.jpg",
          "author": { "@type": "Organization", "name": "Veadicastro", "url": "https://veadicastro.in" },
          "provider": { "@type": "Organization", "name": "Veadicastro", "url": "https://veadicastro.in" }
        }
        `}</script>

        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veadicastro.in" },
            { "@type": "ListItem", "position": 2, "name": "AI Numerology Free Chat", "item": "https://veadicastro.in/ai-numerology-free-chat" }
          ]
        }
        `}</script>

        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Veadicastro",
          "url": "https://veadicastro.in",
          "logo": "https://veadicastro.in/optimized/logo.webp",
          "founded": "2024",
          "areaServed": { "@type": "Country", "name": "IN" },
          "description": "India's most accurate Vedic Astrology and Numerology AI platform",
          "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "url": "https://veadicastro.in/contact" },
          "sameAs": ["https://twitter.com/veadicastro", "https://facebook.com/veadicastro", "https://instagram.com/veadicastro"]
        }
        `}</script>

        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is AI Numerology Free Chat?", "acceptedAnswer": { "@type": "Answer", "text": "AI Numerology Free Chat is a tool that calculates your numerology profile from your name and date of birth, then lets you chat with an AI numerologist to understand your Life Path Number, Destiny Number, Lucky Number, and more." } },
            { "@type": "Question", "name": "Is AI Numerology accurate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, the calculations are based on standard Pythagorean numerology principles. The AI interprets your numbers using established numerology meanings. However, numerology is a tool for self-reflection and guidance, not a deterministic science." } },
            { "@type": "Question", "name": "How does AI calculate numerology?", "acceptedAnswer": { "@type": "Answer", "text": "All numerology calculations happen locally on your device using a TypeScript engine. The AI does not calculate anything. It only interprets the numbers that have already been computed from your name and birth date." } },
            { "@type": "Question", "name": "Do I need my birth time?", "acceptedAnswer": { "@type": "Answer", "text": "No. Numerology only requires your full name and date of birth. Birth time and birth place are not needed for any numerology calculation." } },
            { "@type": "Question", "name": "Why is only my name and date of birth required?", "acceptedAnswer": { "@type": "Answer", "text": "Numerology is based on the numbers derived from your name letters and your birth date. Unlike astrology which needs precise time and location, numerology calculations are independent of birth time." } },
            { "@type": "Question", "name": "Can I ask follow up questions?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can ask multiple questions during your session. Free users get 2 AI responses. Sign up to unlock unlimited conversations with the AI numerologist." } },
            { "@type": "Question", "name": "What is my Life Path Number?", "acceptedAnswer": { "@type": "Answer", "text": "Your Life Path Number is the most important number in numerology. It is calculated from your date of birth and reveals your life's purpose, natural talents, and the challenges you may face." } },
            { "@type": "Question", "name": "Can AI predict my future?", "acceptedAnswer": { "@type": "Answer", "text": "No, AI cannot predict your future with certainty. Numerology provides insights into your personality, strengths, challenges, and timing patterns. It is a tool for self-awareness, not fortune telling." } },
            { "@type": "Question", "name": "How is AI Numerology different from astrology?", "acceptedAnswer": { "@type": "Answer", "text": "Numerology uses numbers derived from your name and birth date to reveal personality traits and life patterns. Astrology uses planetary positions at your birth time. Both offer valuable insights but use completely different systems." } },
            { "@type": "Question", "name": "Is AI Numerology free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, the AI Numerology Free Chat is completely free to start. You get your full numerology profile and 2 AI responses without any payment. Sign up to unlock unlimited conversations." } }
          ]
        })}
        </script>

        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "AI Numerology Free Chat — What Is It and How It Works",
          "description": "Learn how AI Numerology Free Chat works, what numbers it calculates, and how to get a personalised numerology reading from an AI numerologist based on your name and date of birth.",
          "author": { "@type": "Organization", "name": "Veadicastro", "url": "https://veadicastro.in" },
          "publisher": { "@type": "Organization", "name": "Veadicastro", "url": "https://veadicastro.in" },
          "datePublished": "2025-06-15",
          "dateModified": "2025-06-15",
          "mainEntityOfPage": { "@type": "WebPage", "@id": "https://veadicastro.in/ai-numerology-free-chat" }
        }
        `}</script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
        <div className="pointer-events-none fixed top-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full bg-pink-600/5 blur-[80px]" />
        <div className="pointer-events-none fixed bottom-[-200px] left-[-200px] w-[350px] h-[350px] rounded-full bg-purple-800/5 blur-[80px]" />

        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
              <img src="/optimized/logo.webp" alt="Veadicastro" className="w-9 h-9 rounded-full" loading="eager" />
              <span className="text-lg font-bold tracking-wide">Veadicastro</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-white/60 border border-white/10 rounded-full px-3 py-1">
                Powered by Advanced AI & Numerology
              </span>
              <button onClick={() => navigate("/")} className="text-sm text-white/60 hover:text-pink-400 transition-colors flex items-center gap-1">
                ← Back to Home
              </button>
            </div>
          </div>
        </header>

        <section className="relative py-14 text-center px-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3 h-3" /> Free AI Numerology Chat
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none mb-2">
            AI Numerology Free Chat
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-pink-400 pink-glow mb-6">
            Your Personal AI Numerologist
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Discover your numerology profile and chat with an AI Numerologist for free. Enter your name and date of birth to receive personalised numerology insights and ask unlimited numerology related questions during your session.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm text-white/75">
            {["No birth time needed", "Name & DOB only", "Free AI insights"].map((chip) => (
              <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                {chip}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {internalLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-sm text-white/60 hover:text-pink-400 transition-colors">{link.label}</Link>
            ))}
          </div>
        </section>
        <div className="flex justify-center mt-6 mb-2 min-h-[120px]">
          <AdBanner adSlot="4969456887" className="w-full max-w-[728px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-8">
          {showForm && (
            <div className="max-w-2xl mx-auto">
              <div className="card-glass rounded-3xl p-8">
                <h2 className="font-bold text-2xl font-bold mb-8 text-center">
                  Enter Your Details for <span className="text-pink-400">Personalised Numerology</span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-pink-400" /> Full Name *
                    </label>
                    <Input
                      className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-pink-400" /> Date of Birth *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Day</p>
                        <select
                          value={dobDay}
                          onChange={e => setDobDay(parseInt(e.target.value))}
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-pink-500"
                        >
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1} className="bg-[#1a1020]">{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Month</p>
                        <select
                          value={dobMonth}
                          onChange={e => setDobMonth(parseInt(e.target.value))}
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-pink-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1} className="bg-[#1a1020]">{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Year</p>
                        <input
                          type="number"
                          min={1900}
                          max={new Date().getFullYear()}
                          value={dobYear}
                          onChange={e => setDobYear(parseInt(e.target.value) || 2000)}
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    disabled={!name.trim()}
                    className="w-full h-12 rounded-xl btn-pink text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    <Sparkles className="w-4 h-4" /> Start Free Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {showLoading && (
            <div className="max-w-md mx-auto">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-pink-500/30 border-t-pink-500 animate-spin" />
                  </div>
                </div>
                <p className="text-white font-medium text-base">{loadingMessage}</p>
                <p className="text-white/40 text-sm mt-2">Generating your personalised numerology profile...</p>
              </div>
            </div>
          )}

          {showSummary && numerology && (
            <div className="max-w-3xl mx-auto">
              <div className="card-glass rounded-3xl p-8 text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2">
                  {numerology.name}'s Numerology Profile
                </h2>
                <p className="text-white/40 text-sm mb-6">
                  Your personal numbers revealed. Chat with Vedika to understand what they mean for your life.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="card-glass rounded-2xl p-4 text-center border border-white/10 hover:border-pink-500/30 transition-all">
                      <div className="text-3xl font-black text-pink-400 mb-1">{card.value}</div>
                      <div className="text-xs text-white/40 mb-2">{card.label}</div>
                      <div className="text-[11px] text-white/50 leading-relaxed">{card.desc}</div>
                    </div>
                  ))}
                </div>
                {numerology.isMasterNumber && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 text-sm text-yellow-300 mb-6">
                    <Award className="w-4 h-4" /> Master Number {numerology.masterNumberType} Detected
                  </div>
                )}
                {numerology.karmicDebt && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/30 px-4 py-2 text-sm text-orange-300 mb-6 ml-3">
                    <Shield className="w-4 h-4" /> Karmic Debt {numerology.karmicDebt}
                  </div>
                )}
                <button
                  onClick={startChat}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl btn-pink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Chat with AI Numerologist <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-center my-2 min-h-[120px]">
                <AdBanner adSlot="4969456887" className="w-full max-w-[728px]" />
              </div>
            </div>
          )}

          {showChat && (
            <div className="max-w-3xl mx-auto">
              {numerology && (
                <div className="card-glass rounded-2xl p-4 mb-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base">{numerology.name}'s Numerology</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-white/50 mt-1">
                      <span>Life Path {numerology.lifePath}</span>
                      <span>Destiny {numerology.destiny}</span>
                      <span>Lucky {numerology.luckyNumber}</span>
                      <span>Personal Year {numerology.personalYear}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-glass rounded-3xl flex flex-col" style={{ minHeight: 520 }}>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide" style={{ maxHeight: 480 }}>
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">Your Numerology Profile is Ready!</h3>
                      <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">Ask any question about your life, career, relationships, or what your numbers mean.</p>
                      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                        {suggestionChips.map((s) => (
                          <button
                            key={s}
                            onClick={() => setMessage(s)}
                            className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-pink-500/50 bg-white/3 hover:bg-pink-500/5 transition-all text-white/60 hover:text-white"
                          >
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
                          <img src="/optimized/vedika.webp" alt="Vedika AI Numerologist" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className={cn("max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user" ? "btn-pink text-white rounded-br-sm" : "bg-white/5 border border-white/8 text-white/85 rounded-bl-sm"
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content.replace(/\*\*/g, "")}</p>
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
                        <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" />
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

                  {chatLocked && !isTyping && (
                    <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-5 text-center">
                      <h4 className="font-semibold text-white mb-2">Unlock Unlimited Numerology Conversations</h4>
                      <p className="text-white/50 text-sm mb-4">Sign up to continue asking questions and get deeper insights from your numerology profile.</p>
                      <button
                        onClick={() => setShowSignupModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-pink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                      >
                        Sign Up Free
                      </button>
                    </div>
                  )}

                  <div ref={endRef} />
                </div>

                <div className="border-t border-white/8 p-4 flex gap-3">
                  <Input
                    placeholder="Ask about your numerology..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping || chatLocked}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 rounded-xl h-11"
                  />
                  <button
                    onClick={() => sendMessage(message)}
                    disabled={!message.trim() || isTyping || chatLocked}
                    className="w-11 h-11 rounded-xl btn-pink flex items-center justify-center disabled:opacity-40 transition-opacity"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center my-2 min-h-[120px]">
          <AdBanner adSlot="4969456887" className="w-full max-w-[728px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 my-16">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
        </div>

        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <Award className="w-3 h-3" /> Trusted by Numerology Enthusiasts
            </p>
            <h2 className="font-bold text-3xl sm:text-4xl font-black leading-tight">
              Why Thousands Choose <span className="text-pink-400">Veadicastro</span> for Numerology Insights
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Instant Calculations", desc: "Your Life Path, Destiny, and Lucky Numbers are calculated locally in milliseconds using standard Pythagorean numerology. No waiting, no servers, no delays.", stat: "100%", label: "Local Calculation" },
              { title: "AI Powered Interpretation", desc: "Our AI numerologist understands the deeper meaning behind every number. It interprets your profile with the wisdom of an experienced numerologist.", stat: "2M+", label: "AI Responses Delivered" },
              { title: "Privacy First", desc: "All numerology calculations happen directly in your browser. Your name and birth date never leave your device for the calculation step.", stat: "100%", label: "Client Side" },
            ].map((item, i) => (
              <div key={i} className="card-glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">{item.stat}</div>
                <div className="text-xs text-white/40 mb-3">{item.label}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center my-8 min-h-[120px]">
          <AdBanner adSlot="4969456887" className="w-full max-w-[728px]" />
        </div>

        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="card-glass rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative text-center">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
                <Brain className="w-3 h-3" /> AI Numerology Engine
              </p>
              <h2 className="font-bold text-3xl sm:text-4xl font-black leading-tight mb-5">
                Built on Classical <span className="text-pink-400">Numerology Principles</span>
              </h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-3xl mx-auto mb-8">
                Our AI numerologist is trained on Pythagorean numerology, the most widely used system worldwide. Every interpretation is grounded in established numerology meanings, not generic content. The AI references your actual numbers to give you insights that are personal and meaningful.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: <Star className="w-5 h-5 text-pink-400" />, title: "Pythagorean System", desc: "Standard Western numerology methodology" },
                  { icon: <Zap className="w-5 h-5 text-pink-400" />, title: "7 Core Numbers", desc: "Life Path, Destiny, Soul Urge, and more" },
                  { icon: <Shield className="w-5 h-5 text-pink-400" />, title: "Master Numbers", desc: "11, 22, 33 properly identified" },
                  { icon: <Brain className="w-5 h-5 text-pink-400" />, title: "Karmic Debt", desc: "13, 14, 16, 19 detected automatically" },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                    <div className="flex justify-center mb-2">{item.icon}</div>
                    <p className="font-semibold text-sm text-white mb-1">{item.title}</p>
                    <p className="text-white/40 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 mb-20">
          <div className="prose prose-invert max-w-none">
            <article>
              <h2 className="text-3xl font-black text-white mb-6">AI Numerology Free Chat — What Is It and How It Works</h2>
              <p className="text-white/80 leading-relaxed mb-6">
                AI Numerology Free Chat is the simplest way to discover what your numbers say about you. Instead of reading generic descriptions online, you get a personalised numerology reading generated from your actual name and date of birth. Then you can ask follow up questions and get answers from an AI that understands numerology deeply. For those interested in Vedic birth chart readings, our <a href="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Free AI Astrologer Chat</a> offers a similar experience based on your Kundli.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                The system works in two parts. First, a local TypeScript engine calculates your core numerology numbers using standard Pythagorean formulas. Second, an AI numerologist interprets those numbers and answers your questions. The AI never calculates anything. It only reads and explains the numbers that were already computed. If you prefer a quick snapshot instead of a chat, try the <a href="/free-5-minutes-astrology-ai" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Free 5 Minute Astrology</a> tool for instant Vedic insights.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                This approach gives you the accuracy of real numerology mathematics combined with the depth of an AI that can have a natural conversation about your life. You can explore topics like career, relationships, finances, and personal growth all through the lens of your unique numerology profile. For a deeper look at your Vedic birth chart, use our <a href="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Free Kundli Generator</a> to calculate your exact planetary positions.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">How AI Numerology Chat Works</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                The process is simple. You enter your full name and date of birth on the page. The system immediately calculates your core numerology numbers directly in your browser. No data is sent to any server for the calculation step. Once your profile is ready, you see a summary of your most important numbers including your Life Path, Destiny, Lucky Number, Personality Number, and Personal Year Number. For another number based tool, check the <a href="/angel-number-calculator" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Angel Number Calculator</a> which reveals your ruling planet and lucky stone.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                After reviewing your summary, you enter the chat interface where you can ask the AI numerologist anything. The AI has access to your complete numerology profile and answers based on what the numbers reveal. You can ask about career direction, relationship patterns, financial timing, or simply what a specific number in your chart means. For marriage specific questions, our <a href="/ai-marriage-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Marriage Prediction</a> tool provides detailed timing insights based on your birth chart.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                Free users get two AI responses. This is enough to ask a main question and a follow up. If you want unlimited conversations, you can sign up for a free account and continue exploring your numerology profile in depth. You can also use our <a href="/ai-career-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Career Prediction</a> and <a href="/love-astrology-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Love Astrology</a> tools for specialised readings on specific life areas.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">What Information Is Needed</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                AI Numerology Free Chat only requires two pieces of information: your full name and your date of birth. Unlike astrology which needs your exact birth time and birth location, numerology calculations are independent of time and place. This makes numerology much simpler to access and use. For those who want a complete Vedic chart, the <a href="/ai-kundli-analysis" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Kundli Analysis</a> tool requires your full birth details for accurate planetary calculations.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                Your full name is used to calculate your Destiny Number, Soul Urge Number, and Personality Number. Each letter in your name corresponds to a specific number, and those numbers reveal different aspects of your personality and life purpose. Your date of birth is used to calculate your Life Path Number, Birthday Number, and Personal Year Number. To understand your Vedic Moon sign and Nakshatra, use our <a href="/rashi-calculator-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Rashi Calculator by Date of Birth</a>.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                All calculations happen locally in your browser using a TypeScript numerology engine. Your personal information is not stored or transmitted for the calculation step. For daily astrological guidance based on your zodiac sign, check <a href="/today-horoscope" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Today Horoscope</a> and <a href="/lucky-colour-for-today" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Lucky Colour Today</a>.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">How Numerology Is Calculated</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                Numerology follows a simple but powerful mathematical system. Every number from 1 to 9 has a specific meaning, and master numbers 11, 22, and 33 carry higher spiritual significance. The calculations involve adding digits together until a single digit or master number is reached. Our <a href="/ai-astrology-prediction" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Astrology Prediction</a> tool uses similar mathematical precision for Vedic chart analysis.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                Your Life Path Number is the sum of all digits in your birth date, reduced to a single digit or master number. This is the most important number in your numerology chart. Your Destiny Number is calculated by adding the numerical values of all letters in your full name, then reducing to a single digit. For AI powered future insights, explore <a href="/ai-future-spouse-prediction" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Future Spouse Prediction</a>.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                The Soul Urge Number uses only the vowels in your name and reveals your inner desires and motivations. The Personality Number uses only the consonants and shows how others perceive you. Your Personal Year Number changes each year and reveals the energy theme you are currently experiencing. Our comprehensive <a href="/ai-astrology" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Astrology Complete Guide</a> explains how these concepts relate to Vedic astrology.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                Karmic Debt numbers 13, 14, 16, and 19 are detected when certain calculations produce these specific numbers before reduction. Master Numbers 11, 22, and 33 are identified and preserved because they carry special significance in numerology. For broader life predictions based on your complete birth chart, try <a href="/astrology-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Astrology by Date of Birth</a>.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">What Is a Life Path Number</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                Your Life Path Number is the single most important number in your numerology chart. It is calculated from your date of birth and reveals the path you are meant to walk in this lifetime. Think of it as your soul's curriculum for this incarnation the lessons you came to learn, the experiences you came to have, and the person you came to become. For a comparison between AI tools and traditional methods, read <a href="/chatgpt-astrology" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">ChatGPT Astrology</a>.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                Each Life Path Number from 1 to 9 has a distinct set of characteristics. Life Path 1 is the leader and pioneer. Life Path 2 is the peacemaker and diplomat. Life Path 3 is the creative communicator. Life Path 4 is the builder and organiser. Life Path 5 is the freedom seeker and adventurer. Life Path 6 is the nurturer and caregiver. Life Path 7 is the thinker and spiritual seeker. Life Path 8 is the achiever and authority figure. Life Path 9 is the humanitarian and visionary. For personalised remedies and spiritual guidance, explore <a href="/ai-pandit" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Pandit</a>.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                Master Numbers 11, 22, and 33 carry the energy of their root numbers but at a higher vibration. They indicate a soul that has advanced spiritual work to do in this lifetime. Knowing your Life Path Number gives you clarity about your natural strengths, your biggest challenges, and the direction that will bring you the most fulfilment. Complete your self discovery journey with <a href="/horoscope-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Horoscope by Date of Birth</a>.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">What Is a Destiny Number</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                Your Destiny Number, also called the Expression Number, reveals the talents, abilities, and shortcomings you were born with. It is calculated from the full name on your birth certificate and represents the potential you are meant to fulfil in this lifetime. While your Life Path Number shows the direction you should take, your Destiny Number shows the tools you have to get there. Relationship compatibility can also be explored through <a href="/free-kundali-matching" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Kundli Matching</a>.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                If your Life Path Number is about your core nature, your Destiny Number is about your purpose. It describes what you are meant to do with your life and the unique contribution you are here to make. The AI numerologist considers both numbers together to give you a complete picture of your strengths and direction. For spiritual products that complement your journey, visit the <a href="/astrology-store" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Astrology Store</a>.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">Can AI Understand Numerology</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                AI can understand numerology in the sense that it can interpret calculated numbers using established numerology meanings. The key distinction is that the AI does not perform any calculations. The numerology engine handles the mathematics locally in TypeScript. The AI receives the calculated numbers and provides interpretation and guidance based on those numbers. This is similar to how our <a href="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Free AI Astrologer Chat</a> works with pre calculated birth chart data.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                This separation of concerns is important. The calculation is deterministic and verifiable. Anyone can check that the Life Path Number is correct using pen and paper. The interpretation is where the AI adds value by connecting the numbers to your specific questions and life situation. For instant Vedic readings without chat, our <a href="/free-5-minutes-astrology-ai" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Free 5 Minute Astrology</a> tool provides quick personalised reports.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                The AI numerologist is trained on standard numerology meanings and can explain how your numbers relate to each other. It can identify patterns, highlight strengths, and suggest areas for growth all while staying grounded in your actual numerology profile. For a complete overview of all our AI tools, visit the <a href="/" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Veadicastro homepage</a>.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">AI Numerology vs Traditional Numerology</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                Traditional numerology requires studying number meanings, learning calculation methods, and understanding how numbers interact. A human numerologist might spend years mastering these concepts. AI Numerology Free Chat makes this knowledge instantly accessible to anyone. Similarly, our <a href="/ai-marriage-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Marriage Prediction</a> and <a href="/ai-career-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Career Prediction</a> tools democratize access to Vedic astrology.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                The difference is in speed and accessibility. A human numerologist consultation might take hours and cost money. The AI numerologist gives you instant access to your complete numerology profile and can answer your questions in real time. The calculations are handled automatically so you do not need to learn any mathematics. For love and relationship insights, our <a href="/love-astrology-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Love Astrology by Date of Birth</a> tool provides detailed compatibility analysis.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                That said, AI numerology is best used as a tool for self reflection and guidance. It is not a replacement for professional life advice. The insights come from the numbers in your chart, which reflect your inherent patterns and tendencies. What you do with that knowledge is entirely up to you. Expand your understanding with our <a href="/ai-astrology" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Astrology Complete Guide</a> and <a href="/angel-number-calculator" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Angel Number Calculator</a>.
              </p>

              <h3 className="text-2xl font-bold text-white mt-10 mb-4">Benefits of AI Numerology Chat</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                There are several advantages to using an AI numerology chat instead of static numerology websites or human consultations. First, you get instant results. Your numerology profile is calculated in seconds and the AI responds immediately. There is no waiting for an appointment or sitting through a long consultation. For daily guidance, check <a href="/today-horoscope" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Today Horoscope</a> and <a href="/lucky-colour-for-today" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Lucky Colour Today</a>.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                Second, the chat format allows you to ask follow up questions. If the AI mentions something interesting about your Life Path Number, you can ask for more detail. If you want to know how your numbers relate to a specific life situation, you can ask that too. The conversation flows naturally like talking to a knowledgeable friend. For Kundli based conversations, our <a href="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Free AI Astrologer Chat</a> offers a similar interactive experience.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                Third, it is completely free to start. You get your full numerology profile and two AI responses without paying anything. If you want more, you can sign up for a free account and unlock unlimited conversations. There is no pressure, no hidden charges, and no automatic billing. Use our <a href="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Free Kundli Generator</a> and <a href="/rashi-calculator-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Rashi Calculator</a> for additional free tools.
              </p>
              <p className="text-white/80 leading-relaxed mb-6">
                Fourth, the AI numerologist is available 24/7. Whether it is 3 PM or 3 AM, you can open the page, enter your details, and start asking questions immediately. No scheduling, no time zone issues, no waiting lists. Explore more tools including <a href="/ai-future-spouse-prediction" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Future Spouse Prediction</a>, <a href="/ai-pandit" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">AI Pandit</a>, and <a href="/chatgpt-astrology" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">ChatGPT Astrology</a> for a complete spiritual toolkit.
              </p>
            </article>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 my-8 min-h-[120px]">
          <AdBanner adSlot="4969456887" className="w-full max-w-[728px]" />
        </div>

        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
              <MessageSquare className="w-3 h-3" /> Numerology Questions
            </p>
            <h2 className="font-bold text-3xl sm:text-4xl font-black mb-3">
              Common Questions About <span className="text-pink-400">AI Numerology Free Chat</span>
            </h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">Everything you need to know about AI powered numerology readings and chats.</p>
          </div>
          <div className="space-y-4">
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">What is AI Numerology Free Chat?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>AI Numerology Free Chat is a tool that calculates your complete numerology profile from your name and date of birth and lets you chat with an AI numerologist about what the numbers mean. You get your Life Path Number, Destiny Number, Lucky Number, and more, all calculated locally on your device using standard Pythagorean numerology methods. The AI numerologist then interprets these numbers and answers your personal questions based on your unique profile.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Is AI Numerology accurate?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>The mathematics behind the numerology calculations is 100 percent accurate. Your Life Path Number, Destiny Number, and other core numbers are calculated using standard Pythagorean formulas that have been used for centuries. The AI interpretation of those numbers is based on established numerology meanings. However, numerology is a tool for self reflection and guidance. It is not a science and should not be treated as absolute truth. The most accurate readings come when you combine the numerical insights with your own self knowledge.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">How does AI calculate numerology?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>The AI does not calculate anything. All numerology calculations are performed by a local TypeScript engine that runs directly in your browser. The engine adds the digits of your birth date to find your Life Path Number, converts the letters of your name to numbers for your Destiny Number, and computes all other core numbers. The AI only receives the already calculated numbers and provides interpretation and guidance based on them. This separation ensures that the mathematics is always correct and verifiable.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Do I need my birth time?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>No. Numerology does not require your birth time. Unlike astrology, which depends on the exact position of planets at your moment of birth, numerology works purely with the numbers derived from your name and date of birth. Your birth time has no impact on any numerology calculation. This makes numerology much simpler and more accessible than astrology. You only need your full name and the day, month, and year you were born.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Why is only my name and date of birth required?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Numerology is based on two fundamental sources of numerical data: the letters of your name and the digits of your birth date. Your name reveals your Destiny Number, Soul Urge Number, and Personality Number. Your birth date reveals your Life Path Number, Birthday Number, and Personal Year Number. These two pieces of information are sufficient to generate a complete and meaningful numerology profile. No additional information is needed because numerology does not factor in time, location, or any other variables.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Can I ask follow up questions?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Yes, absolutely. The AI numerology chat is designed for conversation. After your initial numerology profile is calculated, you can ask as many follow up questions as your free session allows. Free users get two AI responses. You might start by asking about your Life Path Number, then follow up with a question about how it relates to your career or relationships. The AI remembers your numerology profile throughout the conversation and tailors each response to your specific numbers.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">What is my Life Path Number?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Your Life Path Number is the most important number in your numerology chart. It is calculated by adding together all the digits of your birth date and reducing to a single digit or master number. This number reveals your life purpose, the lessons you came to learn, the challenges you will face, and the natural gifts you possess. Knowing your Life Path Number gives you a powerful framework for understanding why certain patterns keep appearing in your life and what direction will bring you the most fulfilment.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Can AI predict my future?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>No, AI cannot predict your future with certainty. Numerology provides insights into your personality, natural tendencies, strengths, challenges, and timing patterns. These insights can help you make better decisions and understand yourself more deeply, but they are not deterministic predictions. The AI numerologist can tell you what your numbers suggest about your natural career path, relationship patterns, or personal growth areas, but the future is shaped by your choices and actions. Use numerology as a tool for self awareness, not as a fortune telling device.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">How is AI Numerology different from astrology?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Numerology and astrology are completely different systems. Numerology uses the numbers derived from your name and date of birth to reveal personality traits and life patterns. Astrology uses the positions of planets, the Sun, and the Moon at your exact time and place of birth to create a birth chart. Numerology does not require birth time or location. Astrology does. Both systems can provide valuable insights, but they work in fundamentally different ways. Many people find value in using both systems together for a more complete understanding of themselves.</p>
              </div>
            </div>
            <div className="card-glass rounded-2xl p-6 border-l-4 border-pink-500/50">
              <h3 className="font-semibold text-white/90 text-lg mb-3">Is AI Numerology free?</h3>
              <div className="text-white/50 text-sm leading-relaxed">
                <p>Yes, AI Numerology Free Chat is completely free to use. You get your full numerology profile calculated instantly and two AI responses to ask your most important questions. There is no payment required and no credit card needed. If you want to continue exploring your numerology profile with unlimited questions, you can sign up for a free account. The free account gives you access to unlimited conversations with the AI numerologist and deeper insights into your numbers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 mb-20">
          <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.1))", border: "1px solid rgba(236,72,153,0.2)" }}>
            <div className="relative">
              <h2 className="font-bold text-3xl sm:text-4xl font-black mb-3">
                Discover What Your Numbers Reveal
              </h2>
              <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                Your name and birth date hold the blueprint of your life. Enter your details above and let the AI numerologist guide you.
              </p>
              <button
                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl btn-pink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Try AI Numerology Free Chat
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {internalLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-sm text-white/60 hover:text-pink-400 transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>

        <footer className="border-t border-white/5 py-8 text-center">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40">
              <span>&copy; {new Date().getFullYear()} Veadicastro. All rights reserved.</span>
              <Link to="/privacy" className="text-white/40 hover:text-pink-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white/40 hover:text-pink-400 transition-colors">Terms of Service</Link>
              <Link to="/contact" className="text-white/40 hover:text-pink-400 transition-colors">Contact Us</Link>
            </div>
          </div>
        </footer>
      </div>

      {showSignupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="card-glass rounded-3xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/optimized/vedika.webp" alt="Vedika AI Numerologist" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Numerology Conversations</h3>
              <p className="text-white/70 text-sm leading-6 mb-6">
                You have used your free responses. Sign up to continue exploring your numerology profile with unlimited questions and deeper insights from the AI numerologist.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                <p className="text-pink-400 font-semibold text-lg">Unlimited AI Numerology Chats</p>
                <p className="text-white/60 text-sm mt-2">Ask anything about your career, relationships, finances, and life purpose through the lens of your numbers.</p>
              </div>
              <button
                onClick={() => { setShowSignupModal(false); setAuthOpen(true); }}
                className="w-full btn-pink text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Sign Up Free
              </button>
              <p className="text-xs text-white/40 mt-3">Free signup. No payment required.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
