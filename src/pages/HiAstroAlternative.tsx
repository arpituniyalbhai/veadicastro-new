import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, X, Star, Clock, Shield, Globe, Zap, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import InternalLinksSection from "@/components/InternalLinksSection";

const SITE_URL = "https://veadicastro.in";
const PAGE_PATH = "/hi-astro-alternative";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_IMAGE = `${SITE_URL}/Ai-Astrology-image/hi-astro-compititor.webp`;

const faqs = [
  {
    q: "What is HiAstro and how is Veadicastro different?",
    a: "HiAstro is an AI astrology app that offers basic astrology insights. Veadicastro is a more comprehensive platform that provides personalized Vedic astrology chat, detailed birth chart analysis, career and marriage predictions, all powered by Swiss Ephemeris precision and 3 generations of Vedic knowledge from Devbhoomi - Uttrakhand.",
  },
  {
    q: "Is Veadicastro really free compared to HiAstro?",
    a: "Yes. Veadicastro offers free AI astrology chat — just sign up and get your first question answered free, no payment needed. HiAstro has more limited free access. Our paid plans start at just Rs 149 per month, making us significantly more affordable.",
  },
  {
    q: "Does Veadicastro support Hindi like HiAstro?",
    a: "Absolutely. Veadicastro supports both Hindi and English conversations with Vedika AI. You can ask your questions in Hindi and receive detailed Vedic astrology responses in Hindi. HiAstro offers limited Hindi support.",
  },
  {
    q: "Which platform has better astrology accuracy, HiAstro or Veadicastro?",
    a: "Veadicastro uses Swiss Ephemeris for NASA grade planetary calculations combined with 3 generations of authentic Vedic astrology knowledge from Pauri Garhwal, Uttarakhand. This gives us a significant edge in accuracy over generic AI astrology apps like HiAstro.",
  },
  {
    q: "Can I get birth chart analysis on Veadicastro?",
    a: "Yes, Veadicastro provides complete Vedic birth chart (Kundli) analysis including planetary positions, house analysis, dasha periods, and dosha detection. HiAstro offers basic chart analysis with limited depth.",
  },
  {
    q: "What is the pricing difference between HiAstro and Veadicastro?",
    a: "Veadicastro plans start at Rs 149 per month, making it much more affordable than HiAstro's higher pricing. Plus, you get Swiss Ephemeris accuracy, Hindi support, and 3 generations of Vedic knowledge included at no extra cost.",
  },
  {
    q: "Does Veadicastro provide career and marriage predictions?",
    a: "Yes, Veadicastro offers detailed career predictions, marriage timing analysis, and relationship compatibility insights based on your Vedic birth chart. These are powered by authentic astrological calculations, not generic AI responses.",
  },
  {
    q: "Can I switch from HiAstro to Veadicastro easily?",
    a: "Just visit Veadicastro.in, sign up, enter your birth details, and start chatting with Vedika AI. Your first question is completely free.",
  },
];

export default function HiAstroAlternative() {
  const navigate = useNavigate();
  const { setAuthOpen } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1);
  const [scrollTriggered, setScrollTriggered] = useState(false);
  const [timeTriggered, setTimeTriggered] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (popupStep === 2) {
      setAuthOpen(true);
      setShowPopup(false);
      setPopupStep(1);
    }
  }, [popupStep, setAuthOpen]);

  // Scroll based popup (after 50%)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !scrollTriggered && !showPopup) {
        setScrollTriggered(true);
        setShowPopup(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollTriggered, showPopup]);

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", text: faq.a },
    })),
  }), []);

  const breadcrumbSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "HiAstro Alternative", item: PAGE_URL },
    ],
  }), []);

  const webpageSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "HiAstro Alternative — Free AI Astrology Chat | Veadicastro",
    "url": PAGE_URL,
    "description": "Looking for HiAstro? Try Veadicastro — free AI astrology chat with real Vedic birth chart analysis, career & marriage predictions. No signup for first 2 questions.",
    "publisher": {
      "@type": "Organization",
      "name": "Veadicastro",
      "url": SITE_URL,
    },
  }), []);

  const organizationSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Veadicastro",
    "url": SITE_URL,
    "logo": `${SITE_URL}/amanuniyalastrologe.webp`,
    "description": "Veadicastro provides AI powered Vedic astrology services including free astrology chat, birth chart analysis, career and marriage predictions.",
    "sameAs": [],
  }), []);

  const comparisonData = [
    { feature: "Swiss Ephemeris", veadicastro: "✓", hiastro: "Limited" },
    { feature: "Free chat", veadicastro: "✓", hiastro: "Limited" },
    { feature: "Hindi support", veadicastro: "✓", hiastro: "Limited" },
    { feature: "Family background", veadicastro: "3 gen Vedic", hiastro: "Generic AI" },
    { feature: "Starting price", veadicastro: "₹149", hiastro: "Higher" },
  ];

  return (
    <>
      <Helmet>
        <title>HiAstro Alternative — Free AI Astrology Chat | Veadicastro</title>
        <meta
          name="description"
          content="Looking for HiAstro? Try Veadicastro — free AI astrology chat with real Vedic birth chart analysis, career & marriage predictions. Sign up free & get your first question answered."
        />
        <meta
          name="keywords"
          content="HiAstro alternative, HiAstro vs Veadicastro, free AI astrology chat, Vedic astrology, best AI astrology app, HiAstro competitor, astrology app India, free kundli analysis"
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:title" content="HiAstro Alternative — Free AI Astrology Chat | Veadicastro" />
        <meta property="og:description" content="Looking for HiAstro? Try Veadicastro — free AI astrology chat with real Vedic birth chart analysis, career & marriage predictions. Sign up free & get your first question answered." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={PAGE_IMAGE} />
        <meta property="og:site_name" content="Veadicastro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HiAstro Alternative — Free AI Astrology Chat | Veadicastro" />
        <meta name="twitter:description" content="Looking for HiAstro? Try Veadicastro — free AI astrology chat with real Vedic birth chart analysis, career & marriage predictions. Sign up free & get your first question answered." />
        <meta name="twitter:image" content={PAGE_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webpageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#07070d] text-white">

        {/* Simple Centered Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.15),transparent_50%)]" />
          <div className="relative max-w-3xl text-center">
            <div className="mb-2 text-sm text-white/50">
              <Link to="/" className="hover:text-pink-300 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/70">HiAstro Alternative</span>
            </div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
              <Star className="h-3.5 w-3.5" />
              HiAstro Alternative
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl mb-6">
              HiAstro Alternative — Free AI Astrology Chat
            </h1>
            <p className="text-lg leading-8 text-white/65 mb-8 max-w-2xl mx-auto">
              Looking for HiAstro? Try Veadicastro — India's most trusted AI astrology platform with real Vedic chart calculations.
            </p>

            <button
              onClick={() => { setShowPopup(true); }}
              className="inline-flex items-center gap-2 rounded-2xl btn-pink px-8 py-4 text-base font-black text-white"
            >
              Try Free — Better than HiAstro
            </button>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-lg font-bold text-pink-400">1 Lakh+</p>
                <p className="text-xs text-white/70">Questions Answered</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-pink-400">50K+</p>
                <p className="text-xs text-white/70">Live Guided</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-pink-400">3100+</p>
                <p className="text-xs text-white/70">Daily Predictions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-pink-400">2 Lakh+</p>
                <p className="text-xs text-white/70">Kundlis Generated</p>
              </div>
            </div>

            <div className="mt-10">
              <img
                src="/Ai-Astrology-image/hi-astro-compititor.webp"
                alt="Veadicastro vs HiAstro Comparison"
                className="mx-auto rounded-2xl shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="prose prose-invert prose-lg max-w-none">

            {/* Direct Answer Box */}
            <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-500/5 p-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">Why Choose Veadicastro Over HiAstro?</h2>
                  <p className="text-base leading-7 text-white/75">
                    HiAstro is an AI astrology app. Veadicastro is a free alternative that offers personalized Vedic astrology chat, birth chart analysis, career and marriage predictions, powered by Swiss Ephemeris and 3 generations of Vedic knowledge from Pauri Garhwal, Uttarakhand.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black text-white mb-6">
              Veadicastro vs HiAstro: Which is Better?
            </h2>
            <p className="text-base leading-7 text-white/70 mb-6">
              If you are looking for a HiAstro alternative, you have found it. Veadicastro offers everything HiAstro does and more, with better accuracy, lower pricing, and authentic Vedic astrology knowledge passed down through 3 generations.
            </p>

            {/* Comparison Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden mb-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-white">Feature</th>
                    <th className="text-center p-4 font-semibold text-pink-400">Veadicastro</th>
                    <th className="text-center p-4 font-semibold text-white/50">HiAstro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-4 text-white/70">{row.feature}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-green-400 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          {row.veadicastro}
                        </span>
                      </td>
                      <td className="p-4 text-center text-white/40">
                        <span className="inline-flex items-center gap-1.5">
                          {row.hiastro === "Limited" || row.hiastro === "Higher" ? (
                            <XCircle className="h-4 w-4 text-red-400/60" />
                          ) : (
                            <span className="text-white/40">{row.hiastro}</span>
                          )}
                          {row.hiastro}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-base leading-7 text-white/70 mb-6">
              Veadicastro is built on a foundation of authentic Vedic astrology knowledge passed down through 3 generations from Pauri Garhwal, Uttarakhand. While HiAstro relies on generic AI models, Veadicastro combines Swiss Ephemeris precision with genuine astrological expertise to deliver accurate, personalized readings.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Our platform supports both Hindi and English, so you can ask questions in the language you are most comfortable with. And with plans starting at just Rs 149 per month, we are significantly more affordable than HiAstro.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">What Makes Veadicastro the Best HiAstro Alternative?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Veadicastro is not just another AI astrology app. It is a platform built with genuine Vedic astrology knowledge, passed down through 3 generations from Pauri Garhwal, Uttarakhand. While HiAstro uses generic AI models, Vedika AI uses Swiss Ephemeris calculations and authentic Vedic principles to deliver accurate predictions.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              From birth chart analysis to career predictions, marriage timing to daily horoscopes, Veadicastro covers everything HiAstro offers and more. The key difference is that every reading you get on Veadicastro is rooted in real astrological calculations, not just pattern matching from generic language models. You can explore our <Link to="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline">free AI astrologer chat</Link> or get detailed <Link to="/ai-kundli-analysis" className="text-pink-400 hover:text-pink-300 underline">AI Kundli analysis</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Free AI Astrology Chat — Sign Up in Seconds</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Unlike HiAstro which limits free access significantly, Veadicastro lets you sign up in seconds and ask your first question completely free. Just enter your birth details and start chatting with Vedika AI instantly. No credit card, no long forms, no waiting.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Get answers about your career, love life, marriage, finances, and more, all based on your authentic Vedic birth chart. For daily guidance, check your <Link to="/today-horoscope" className="text-pink-400 hover:text-pink-300 underline">today horoscope</Link> or try our <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">AI marriage prediction</Link> tool.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">The Real Difference: 3 Generations of Vedic Knowledge</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              This is where Veadicastro leaves HiAstro and other AI astrology apps behind. Our platform does not just rely on what a generic AI model learned from the internet. The knowledge powering Vedika AI comes from an unbroken chain of Vedic astrology practice spanning three generations in Pauri Garhwal, Uttarakhand, the spiritual capital of India.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Pauri Garhwal, Uttarakhand has been home to some of the most respected Jyotish acharyas in Indian history. The astrological principles encoded into Vedika AI are the same ones that have been used to guide thousands of families through major life decisions for decades. This is not book knowledge picked up overnight. This is lived wisdom, tested and refined over generations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              When you ask Vedika AI about your career path or marriage timing, the response is filtered through this deep well of authentic Vedic knowledge. HiAstro simply cannot match this because no generic AI model has access to this kind of specialized family lineage of astrological expertise.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Swiss Ephemeris: NASA Grade Planetary Calculations</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Another area where Veadicastro outperforms HiAstro is in the accuracy of planetary calculations. We use Swiss Ephemeris, the same high precision ephemeris data used by NASA and space agencies around the world for tracking celestial bodies. This means every planetary position in your birth chart is calculated with extreme precision.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Why does this matter? In Vedic astrology, even a difference of one degree in a planetary position can change the prediction entirely. If a planet is on the cusp between two houses, the interpretation changes completely. Generic AI astrology apps like HiAstro often use simplified calculations that can be off by several degrees, leading to inaccurate readings.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              With Swiss Ephemeris powering Veadicastro, you can trust that the planetary positions in your chart are accurate to the arcsecond. This level of precision is essential for meaningful astrological analysis, especially when it comes to dasha periods, transit predictions, and dosha detection.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Full Hindi and English Support</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              One of the biggest frustrations users have with HiAstro is the limited language support. Many users prefer to discuss personal astrological matters in their native language, and for millions of Indians, that language is Hindi. Veadicastro offers full bilingual support. You can ask your questions in Hindi and receive detailed responses in Hindi.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              This makes a real difference when discussing sensitive topics like marriage compatibility, financial struggles, or family disputes. People naturally express themselves more clearly and comfortably in their mother tongue. Vedika AI understands this and responds with the same depth and accuracy in both Hindi and English.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              HiAstro offers some Hindi support but it is limited and often feels like a translated version of English content rather than genuine Hindi astrology conversation. With Veadicastro, the Hindi responses are natural and culturally appropriate, reflecting the traditional language of Vedic astrology.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Pricing That Makes Sense for Real People</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Let us talk about money because this matters. HiAstro charges significantly more for its services, and users often find themselves hitting paywalls just when they start getting useful insights. Veadicastro takes a different approach. Our plans start at just Rs 149 per month, making authentic Vedic astrology accessible to students, young professionals, and families.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              There are no per minute charges, no hidden fees, no surprise upgrades. You pay one simple monthly fee and get access to Vedika AI, detailed birth chart analysis, personalized predictions, and regular updates. Compare this to what you would pay for a single session with a traditional astrologer or even what HiAstro charges for basic features.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              We believe that spiritual guidance should not be a luxury reserved for those who can afford premium prices. Vedic astrology is a birthright of every person born in this tradition, and our pricing reflects that belief. Check our <Link to="/pricing" className="text-pink-400 hover:text-pink-300 underline">pricing page</Link> for complete details or visit our <Link to="/" className="text-pink-400 hover:text-pink-300 underline">homepage</Link> to learn more about what Vedika AI can do for you.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">What Actual Users Say About Switching</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              People come to Veadicastro from various platforms including HiAstro, and the feedback has been consistent. Users appreciate the accuracy of the readings, the natural conversation flow in Hindi, and the fact that they are not constantly being pushed to upgrade or pay more.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users have told us that they tried HiAstro first but found the responses too generic. They wanted predictions that felt personal and specific to their situation, not generic statements that could apply to anyone. With Vedika AI, the analysis is based on their actual birth chart, their actual planetary positions, and their actual life circumstances.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Another common theme is trust. Users feel more confident in Veadicastro because they know there is real astrological knowledge behind the technology. Knowing that the platform was built by people with 3 generations of Vedic astrology experience gives them confidence that the readings are meaningful and grounded in authentic tradition.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Complete Birth Chart Analysis You Can Actually Understand</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              HiAstro provides basic chart analysis, but it often leaves users confused about what the results actually mean for their life. Veadicastro takes a different approach. Every birth chart reading is presented in clear, simple language that anyone can understand, whether you are a Vedic astrology expert or a complete beginner.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your analysis includes your ascendant sign, moon sign, sun sign, nakshatra position, planetary strengths, house placements, dasha periods, and dosha detection. But more importantly, Vedika AI explains what each of these means for your specific life situation. How does your chart affect your career choices? What does your seventh house say about your marriage? Which periods are favorable for starting a business?
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              This combination of accuracy and accessibility is what makes Veadicastro the superior choice for anyone looking for a HiAstro alternative. You get professional grade astrological analysis presented in a way that actually helps you make decisions and understand your life path.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Career Predictions Based on Real Astrology</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your career is one of the most important areas where Vedic astrology can provide genuine guidance. Veadicastro analyzes your tenth house, its lord, and the planetary combinations affecting your professional life. The result is a detailed career profile that tells you which fields suit your natural strengths, when to make a job change, and whether entrepreneurship is in your stars.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              HiAstro offers career insights too, but they tend to be generic. Veadicastro's career predictions are specific to your birth chart and updated with current planetary transits. This means you get timely advice about when to take that promotion, start that business, or make that career switch. For deeper insights, try our dedicated <Link to="/ai-career-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">AI career prediction</Link> tool.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Marriage and Relationship Compatibility</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Marriage is a sacred institution in Vedic culture, and astrology has always played a central role in matchmaking. Veadicastro offers comprehensive marriage compatibility analysis that goes far beyond what HiAstro provides. We examine guna matching, planetary compatibility, mental and emotional alignment, and long term harmony indicators.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Whether you are wondering about the right time to get married, checking compatibility with a partner, or trying to understand relationship patterns, Vedika AI can help. The analysis is based on authentic Vedic principles and your actual birth chart, not generic relationship advice. Use our <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">AI marriage prediction</Link> tool or check <Link to="/free-kundali-matching" className="text-pink-400 hover:text-pink-300 underline">Kundli matching</Link> for detailed compatibility analysis.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Make the Switch Today</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Switching from HiAstro to Veadicastro takes about two minutes. You do not need to migrate any data, cancel any subscriptions, or go through a complicated setup. Just visit Veadicastro.in, sign up in seconds, enter your birth details, and start chatting with Vedika AI. Your first question is completely free.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              If you decide to upgrade to a paid plan, it costs just Rs 149 per month, significantly less than what you were probably paying HiAstro. And you get better accuracy, full Hindi support, Swiss Ephemeris precision, and the knowledge of 3 generations of Pauri Garhwal, Uttarakhand astrologers. That is not just a better deal. That is a completely different level of service.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedic astrology has been guiding humanity for thousands of years. With Veadicastro, that ancient wisdom is now available to you in a modern, accessible format. No appointments, no waiting, no high fees. Just the truth, based on your stars.
            </p>

            {/* Mid-content CTA */}
            <div className="my-12 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-500/5 p-8 text-center">
              <h3 className="text-2xl font-black text-white mb-4">Ready to Switch from HiAstro?</h3>
              <p className="text-base leading-7 text-white/70 mb-6">
                Try Veadicastro free with better accuracy, lower price, and authentic Vedic knowledge.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-2 rounded-2xl btn-pink px-6 py-3 text-base font-black text-white"
              >
                <Sparkles className="h-5 w-5" />
                Try Free Better than HiAstro
              </button>
            </div>

          </article>

          {/* FAQ Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                  <p className="text-sm leading-6 text-white/70">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* FAQ CTA */}
            <div className="mt-8 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-500/5 p-8 text-center">
              <h3 className="text-2xl font-black text-white mb-4">Still Comparing?</h3>
              <p className="text-base leading-7 text-white/70 mb-6">
                Try Veadicastro yourself and see why users are switching from HiAstro.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-2 rounded-2xl btn-pink px-6 py-3 text-base font-black text-white"
              >
                <Sparkles className="h-5 w-5" />
                Try Veadicastro Free
              </button>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-500/5 p-8 text-center">
            <h3 className="text-3xl font-black text-white mb-4">The Best HiAstro Alternative</h3>
            <p className="text-lg leading-8 text-white/70 mb-8 max-w-2xl mx-auto">
              Better accuracy, lower price, and authentic Vedic knowledge from 3 generations of Pauri Garhwal, Uttarakhand astrologers.
            </p>
            <button
              onClick={() => setShowPopup(true)}
              className="inline-flex items-center gap-2 rounded-2xl btn-pink px-8 py-4 text-base font-black text-white"
            >
              <Sparkles className="h-5 w-5" />
              Try Free — Better than HiAstro
            </button>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                100% Private
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Global Access
              </span>
            </div>
          </div>
        </section>

        <InternalLinksSection />
      </main>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowPopup(false)} />
          
          {popupStep === 1 ? (
            <div className="relative bg-[#0d0d16] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <div className="relative mx-auto mb-4 w-28 h-28">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/40 to-pink-600/40 animate-pulse blur-xl" />
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 p-0.5 shadow-2xl shadow-pink-500/40">
                    <img
                      src="/optimized/vedika.webp"
                      alt="Vedika AI"
                      className="w-full h-full rounded-full object-cover border-2 border-white/20"
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-1.5 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-xs font-medium text-pink-200">Online now</span>
                </div>

                <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                  Hey, I am Vedika AI
                </h3>
                <p className="text-base text-white/50 mb-1">Your personal AI astrologer</p>
                <p className="text-sm leading-6 text-white/60 mb-6 max-w-xs mx-auto">
                  Guided 25,000+ people from 50+ countries with real Vedic astrology powered by Swiss Ephemeris and 3 generations of Pauri Garhwal, Uttarakhand knowledge.
                </p>

                <button
                  onClick={() => setPopupStep(2)}
                  className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl btn-pink px-6 py-3.5 text-base font-black text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Chat with Me Free
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-pink-400" />
                    Quick signup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-pink-400" />
                    Free first chat
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-pink-400" />
                    Instant answers
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}