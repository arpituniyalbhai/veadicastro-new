import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, X, Star, Clock, Shield, Globe, Zap, Users, MapPin, Award, BarChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import InternalLinksSection from "@/components/InternalLinksSection";

const blurReveal = {
  initial: { opacity: 0, y: 40, filter: "blur(12px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.8, ease: "easeOut" },
};

const SITE_URL = "https://veadicastro.in";
const PAGE_PATH = "/ai-pandit";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_IMAGE = `${SITE_URL}/optimized/ai-horoscope-by-date-of-birth.webp`;

const faqs = [
  {
    q: "What is an AI Pandit?",
    a: "An AI Pandit is an artificial intelligence system that provides Vedic astrology guidance, shubh muhurat, graha dosha remedies, puja recommendations, and birth chart analysis — based on your date, time, and place of birth. It combines classical Jyotish knowledge with modern AI to give you instant, personalized Vedic guidance.",
  },
  {
    q: "Is AI Pandit free to use?",
    a: "Yes, Veadicastro offers free AI Pandit services. You can get basic astrology insights without any cost. Premium detailed reports are available for users who want deeper analysis.",
  },
  {
    q: "How accurate is AI Pandit compared to traditional astrologers?",
    a: "AI Pandit uses authentic Vedic astrology calculations and provides consistent, data driven insights. While traditional astrologers offer personalized consultation, AI Pandit delivers instant, accessible guidance 24/7.",
  },
  {
    q: "Do I need to provide my birth time for AI Pandit?",
    a: "Birth time improves accuracy significantly. While you can get basic insights with just date of birth, providing exact birth time and place enables more precise predictions about career, marriage, and life events.",
  },
  {
    q: "Can AI Pandit predict my future?",
    a: "AI Pandit provides astrological insights and patterns based on your birth chart. It offers guidance on potential opportunities, challenges, and favorable periods. However, your choices and actions play a crucial role in shaping your future.",
  },
  {
    q: "Is my personal data safe with AI Pandit?",
    a: "Yes, Veadicastro takes privacy seriously. Your birth details are used only for generating astrology readings. We do not share your personal information with third parties without your consent.",
  },
  {
    q: "Can AI Pandit help with marriage compatibility?",
    a: "Yes, AI Pandit can analyze Kundli matching between two individuals. It examines planetary compatibility, guna matching, and other Vedic astrology factors to provide marriage compatibility insights.",
  },
  {
    q: "What makes Veadicastro AI Pandit different?",
    a: "Veadicastro AI Pandit, also known as Vedika AI, combines authentic Vedic astrology calculations with advanced AI technology. It was developed by experts in both astrology and artificial intelligence to ensure accurate, easy to understand guidance.",
  },
  {
    q: "Can I use AI Pandit for career guidance?",
    a: "Absolutely. AI Pandit analyzes your birth chart to identify career strengths, suitable professions, favorable periods for job changes, and business potential. Many users find these insights helpful for career planning.",
  },
  {
    q: "Is AI Pandit available outside India?",
    a: "Yes, AI Pandit is accessible globally. Anyone with an internet connection can use our services. The system supports multiple time zones and provides insights relevant to users worldwide.",
  },
  {
    q: "How does AI Pandit work?",
    a: "AI Pandit uses your birth details to calculate your Vedic birth chart. It then applies traditional astrology principles and AI analysis to generate personalized insights about various aspects of your life.",
  },
  {
    q: "Can AI Pandit provide daily horoscope?",
    a: "Yes, AI Pandit can generate daily horoscope predictions based on your birth chart. These daily insights help you navigate each day with awareness of favorable and challenging periods.",
  },
  {
    q: "What is the difference between AI Pandit and ChatGPT for astrology?",
    a: "Unlike general AI models like ChatGPT, AI Pandit is specifically trained and designed for Vedic astrology. It uses authentic astrological calculations and specialized knowledge to provide accurate insights.",
  },
  {
    q: "Can AI Pandit help with love and relationship problems?",
    a: "AI Pandit can provide insights about relationship patterns, compatibility with partners, favorable periods for love, and communication styles based on your birth chart. These insights can help you understand your relationships better.",
  },
  {
    q: "How often should I consult AI Pandit?",
    a: "You can consult AI Pandit whenever you need guidance. Many users check their daily horoscope regularly, while others seek specific insights during important life decisions or transitions.",
  },
];

export default function AiPandit() {
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

  // Exit intent popup for desktop
  useEffect(() => {
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showPopup && !scrollTriggered && !timeTriggered) {
        setShowPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleExitIntent);
    return () => document.removeEventListener('mouseleave', handleExitIntent);
  }, [showPopup, scrollTriggered, timeTriggered]);

  // Scroll percentage popup
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !scrollTriggered && !showPopup && !timeTriggered) {
        setScrollTriggered(true);
        setShowPopup(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollTriggered, showPopup, timeTriggered]);

  // Time based popup (after 30 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!timeTriggered && !showPopup && !scrollTriggered) {
        setTimeTriggered(true);
        setShowPopup(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [timeTriggered, showPopup, scrollTriggered]);

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
      { "@type": "ListItem", position: 2, name: "AI Pandit", item: PAGE_URL },
    ],
  }), []);

  const webpageSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Pandit - Free Online Vedic Astrology Guidance",
    "url": PAGE_URL,
    "description": "Get free AI Pandit consultation online. Discover personalized Vedic astrology insights for career, love, marriage, and life guidance with Vedika AI.",
    "publisher": {
      "@type": "Organization",
      "name": "Veadicastro",
      "url": SITE_URL,
    },
  }), []);

  const articleSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "AI Pandit - Free Online Vedic Astrology Guidance",
    "description": "Comprehensive guide to AI Pandit services. Learn how artificial intelligence is transforming Vedic astrology and providing instant guidance.",
    "image": PAGE_IMAGE,
    "author": {
      "@type": "Organization",
      "name": "Veadicastro",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Veadicastro",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/amanuniyalastrologe.webp`,
      },
    },
    "datePublished": "2026-07-10",
    "dateModified": "2026-07-10",
    "mainEntityOfPage": PAGE_URL,
  }), []);

  const organizationSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Veadicastro",
    "url": SITE_URL,
    "logo": `${SITE_URL}/amanuniyalastrologe.webp`,
    "description": "Veadicastro provides AI powered Vedic astrology services including AI Pandit, Kundli analysis, and personalized astrology predictions.",
    "sameAs": [],
  }), []);

  return (
    <>
      <Helmet>
        <title>AI Pandit - Free Online Vedic Astrology Guidance | Veadicastro</title>
        <meta
          name="description"
          content="Free AI Pandit online — get shubh muhurat, graha dosha remedies, puja guidance, and personalized Vedic astrology based on your birth chart. Powered by Vedika AI, Haridwar."
        />
        <meta
          name="keywords"
          content="AI Pandit, AI Pandit online, Free AI Pandit, AI Pandit by date of birth, AI Hindu Pandit, Online AI Pandit, Virtual Pandit AI, AI Vedic Pandit, AI Astrology Pandit, AI Jyotish Pandit, AI Pandit for Kundli, AI Pandit for Horoscope, AI Pandit in India"
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:title" content="AI Pandit — Free Online Vedic Astrology Guidance | Veadicastro" />
        <meta property="og:description" content="Get free AI Pandit consultation online. Discover personalized Vedic astrology insights for career, love, marriage, and life guidance with Vedika AI." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={PAGE_IMAGE} />
        <meta property="og:site_name" content="Veadicastro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Pandit — Free Online Vedic Astrology Guidance | Veadicastro" />
        <meta name="twitter:description" content="Get free AI Pandit consultation online. Discover personalized Vedic astrology insights for career, love, marriage, and life guidance with Vedika AI." />
        <meta name="twitter:image" content={PAGE_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webpageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#07070d] text-white">

        {/* Simple Centered Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.15),transparent_50%)]" />
          <div className="relative max-w-3xl text-center">
            <div className="mb-2 text-sm text-white/50">
              <Link to="/" className="hover:text-pink-300 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/70">AI Pandit</span>
            </div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
              <Star className="h-3.5 w-3.5" />
              AI Pandit Online
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl mb-6">
              Meet Your Personal AI Pandit
            </h1>
            <p className="text-lg leading-8 text-white/65 mb-8 max-w-2xl mx-auto">
              Get authentic Vedic astrology guidance anytime, anywhere. Our AI Pandit combines ancient wisdom with modern technology to provide personalized insights about your life.
            </p>

            <button
              onClick={() => setShowPopup(true)}
              className="inline-flex items-center gap-2 rounded-2xl btn-pink px-8 py-4 text-base font-black text-white"
            >
              Chat with AI Pandit - free
            </button>

            <div className="mt-12">
              <img
                src="/optimized/ai-astrologer-hero.webp"
                alt="AI Pandit - Vedic Astrology Guidance"
                className="mx-auto rounded-2xl shadow-2xl max-w-full h-auto"
              />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <p className="text-sm text-white/70">24/7 Available</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <p className="text-sm text-white/70">100% Private</p>
              </div>
              <div className="text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <p className="text-sm text-white/70">Instant Results</p>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-3xl font-black text-white mb-6">
              AI Pandit: The Future of Vedic Astrology Guidance
            </h2>
            <p className="text-base leading-7 text-white/70 mb-6">
              For centuries, people have sought guidance from Pandits and astrologers to understand their life path. Today, technology has made this wisdom more accessible than ever before. An AI Pandit brings the knowledge of Vedic astrology to your fingertips, combining ancient principles with artificial intelligence to provide personalized insights.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Whether you are facing career decisions, relationship questions, or simply want to understand yourself better, an AI Pandit can help. Our system, Vedika AI, analyzes your birth chart using authentic Vedic astrology calculations and delivers guidance that is both accurate and easy to understand.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">What is an AI Pandit?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              An AI Pandit is an artificial intelligence system trained in Vedic astrology principles. Unlike general AI models that provide generic responses, an AI Pandit is specifically designed to understand astrological calculations, planetary positions, and their influence on human life.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              When you provide your birth details, the AI Pandit calculates your Vedic birth chart, analyzes planetary combinations, and generates personalized insights. It can answer questions about career, love, marriage, finance, health, and spiritual growth.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The beauty of an AI Pandit lies in its accessibility. You do not need to wait for an appointment or travel to meet an astrologer. Guidance is available instantly, anytime you need it. You can also try our <Link to="/free-ai-astrologer-chat" className="text-purple-400 hover:text-purple-300 underline">free AI astrologer chat</Link> for immediate consultation.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">How Does AI Pandit Work?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              The process is simple yet sophisticated. When you enter your date of birth, time of birth, and place of birth, the AI Pandit performs complex Vedic astrology calculations. It determines the positions of planets, your ascendant, moon sign, and various astrological combinations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The system then applies traditional Vedic astrology principles to interpret these calculations. It considers factors such as planetary periods (Dasha), house placements, aspects, and yogas in your chart. This analysis forms the basis of personalized predictions.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              What makes AI Pandit powerful is its ability to process this information quickly and present it in a clear, understandable format. You receive insights that would traditionally require hours of consultation with an expert astrologer. For detailed birth chart analysis, you can use our <Link to="/ai-kundli-analysis" className="text-purple-400 hover:text-purple-300 underline">AI kundli analysis</Link> tool. Curious about reliability? Read our analysis on <Link to="/blog/is-ai-astrology-accurate" className="text-purple-400 hover:text-purple-300 underline">AI astrology accuracy</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit vs Traditional Astrology Consultation</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Traditional astrology consultation has its own value. Sitting with an experienced Pandit allows for interactive dialogue and personalized attention. However, it comes with limitations such as availability, cost, and scheduling constraints.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              AI Pandit complements traditional astrology by making guidance more accessible. It is available 24/7, provides instant results, and is often more affordable. While it may not replace the human touch of a traditional consultation, it offers a convenient alternative for quick insights and regular guidance.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users find that AI Pandit serves as an excellent starting point. They can get initial insights quickly and then seek deeper consultation with traditional astrologers if needed. This hybrid approach works well for many people. Learn more about the differences in our <Link to="/blog/ai-astrologer-vs-human-astrologer" className="text-purple-400 hover:text-purple-300 underline">AI astrologer vs human astrologer</Link> article. Also see how Veadicastro compares with other platforms on our <Link to="/astrosage-alternative" className="text-purple-400 hover:text-purple-300 underline">AstroSage alternative</Link> page.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit Using Date of Birth</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your date of birth is the foundation of Vedic astrology. It determines the positions of planets at the time of your birth and forms the basis of your entire birth chart. AI Pandit uses this information to create a personalized astrological profile.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              While date of birth alone can provide basic insights, adding your birth time and place significantly enhances accuracy. Birth time helps determine your ascendant and house placements, while birth place ensures precise planetary calculations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Even if you do not know your exact birth time, AI Pandit can still provide valuable guidance based on your date of birth. Many users start with this information and later refine their readings when they discover their birth time. You can generate your free birth chart using our <Link to="/free-kundli-generator" className="text-purple-400 hover:text-purple-300 underline">free kundli generator</Link>. When you know your exact time and place, use the <Link to="/nakshatra-calculator" className="text-purple-400 hover:text-purple-300 underline">Nakshatra Calculator</Link> to find your Moon&apos;s birth star, pada, ruling planet, and naming sound.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Kundli Analysis</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Kundli analysis is one of the most detailed aspects of Vedic astrology. Your Kundli, or birth chart, is a map of planetary positions at your birth time. AI Pandit can perform comprehensive Kundli analysis, examining each house, planet, and combination.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The analysis includes your ascendant, moon sign, sun sign, planetary strengths, auspicious and inauspicious yogas, and important life periods. This detailed examination helps you understand your strengths, challenges, and opportunities across different areas of life.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users find Kundli analysis particularly helpful for understanding their life purpose and major life themes. It provides a roadmap for personal growth and decision making. For marriage compatibility, you can also use our <Link to="/free-kundali-matching" className="text-purple-400 hover:text-purple-300 underline">kundli matching</Link> service.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Career Guidance</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Career decisions are among the most important choices we make. AI Pandit can analyze your birth chart to identify career strengths, suitable professions, and favorable periods for professional growth. It examines the tenth house, its lord, and relevant planetary combinations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The analysis can reveal whether you are better suited for jobs or business, creative or analytical work, leadership or supportive roles. It can also indicate periods when job changes, promotions, or business expansions are more likely to succeed.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many professionals use AI Pandit insights when considering career changes, starting a business, or planning their professional development. The guidance helps align career choices with natural strengths and favorable timing. For specific career predictions, try our <Link to="/ai-career-prediction-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">AI career prediction by date of birth</Link> tool.
            </p>

            {/* Mid-content CTA */}
            <div className="my-12 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-8 text-center">
              <h3 className="text-2xl font-black text-white mb-4">Ready to Discover Your Career Path?</h3>
              <p className="text-base leading-7 text-white/70 mb-6">
                Get personalized career guidance from AI Pandit based on your birth chart.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-2 rounded-2xl btn-pink px-6 py-3 text-base font-black text-white"
              >
                <Sparkles className="h-5 w-5" />
                Get Career Insights
              </button>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Love and Relationships</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Relationships play a crucial role in our happiness and wellbeing. AI Pandit can provide insights about your relationship patterns, emotional needs, and compatibility with partners. It analyzes the seventh house, Venus, and relevant planetary combinations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The guidance can help you understand your communication style, romantic preferences, and potential challenges in relationships. It can also indicate favorable periods for finding love or strengthening existing relationships.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users find these insights helpful for improving their relationships and making better choices in love. Understanding your astrological profile can lead to more fulfilling connections. For specific love insights, explore our <Link to="/love-astrology-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">love astrology by date of birth</Link> or <Link to="/ai-future-spouse-prediction" className="text-purple-400 hover:text-purple-300 underline">future spouse prediction</Link> tools.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Marriage Compatibility</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Marriage is one of the most significant decisions in life. AI Pandit can perform Kundli matching between two individuals to assess compatibility. This traditional Vedic astrology practice examines multiple factors to determine the suitability of a match.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The matching process includes Guna Milan, planetary compatibility, mental compatibility, and long term harmony indicators. It provides a comprehensive view of how two people are likely to interact as a couple.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              While no astrological analysis can guarantee a successful marriage, Kundli matching can highlight potential areas of harmony and conflict. This information helps couples make informed decisions and work on their relationship proactively. Use our detailed <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">AI marriage prediction</Link> for deeper insights.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Finance and Wealth Predictions</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Financial stability is a common concern for many people. AI Pandit can analyze your birth chart to identify periods of financial growth, potential challenges, and suitable areas for investment. It examines the second house, eleventh house, and relevant planetary combinations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The analysis can reveal your natural approach to money, risk tolerance, and potential sources of income. It can also indicate favorable periods for financial decisions, investments, or business ventures.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              It is important to remember that astrology provides guidance, not guarantees. Financial success still depends on your decisions, efforts, and external circumstances. However, astrological insights can help you plan better and capitalize on favorable periods.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Daily Horoscope</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Daily horoscope predictions help you navigate each day with awareness. AI Pandit can generate personalized daily horoscopes based on your birth chart, considering current planetary transits and their influence on your chart.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Unlike generic daily horoscopes that apply to everyone born under a zodiac sign, AI Pandit daily horoscopes are personalized to your unique birth chart. This makes them much more relevant and accurate.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users check their daily horoscope each morning to plan their day effectively. It helps them identify favorable times for important activities and be prepared for potential challenges. You can check your <Link to="/today-horoscope" className="text-purple-400 hover:text-purple-300 underline">today horoscope</Link> for daily insights.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Monthly Horoscope</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Monthly horoscopes provide a broader view of upcoming trends and influences. AI Pandit analyzes major planetary transits and their impact on your birth chart to generate monthly predictions.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              These monthly insights help you plan important activities, anticipate challenges, and make the most of favorable periods. They are particularly useful for career planning, relationship decisions, and financial management.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users find monthly horoscopes helpful for medium term planning. They provide enough detail to be actionable without being overwhelming. For comprehensive yearly predictions, you can explore our <Link to="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" className="text-purple-400 hover:text-purple-300 underline">yearly horoscope 2026</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Spiritual Guidance</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Spirituality is an important aspect of Vedic astrology. AI Pandit can provide insights about your spiritual path, suitable practices, and periods of spiritual growth. It examines the ninth house, twelfth house, and relevant planetary combinations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The guidance can help you understand your spiritual inclinations, favorable times for spiritual practices, and potential challenges on your spiritual journey. Many users find this guidance helpful for personal growth and inner peace.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedic astrology has always been connected with spiritual wisdom. AI Pandit continues this tradition by making spiritual insights accessible to modern users. Whether you are seeking clarity, purpose, or deeper understanding, AI Pandit can support your spiritual journey.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit Based on Vedic Astrology Principles</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedic astrology, also known as Jyotish, is one of the oldest forms of astrology in the world. It has been practiced in India for thousands of years and is deeply rooted in Vedic scriptures. AI Pandit is built on these authentic principles.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The system uses traditional Vedic astrology calculations, including planetary positions, house divisions, dasha periods, and yogas. It respects the depth and complexity of this ancient science while making it accessible through modern technology.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              This foundation in authentic Vedic astrology ensures that AI Pandit guidance is grounded in a time tested tradition. Users can trust that the insights they receive are based on principles that have guided people for centuries. Learn more about <Link to="/blog/ai-jyotish-vedic-astrology" className="text-purple-400 hover:text-purple-300 underline">AI Jyotish Vedic astrology</Link> and understand how it differs from <Link to="/blog/vedic-vs-western-astrology" className="text-purple-400 hover:text-purple-300 underline">Vedic vs Western astrology</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Why Younger Users Prefer AI Astrology</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              There has been a noticeable shift in how younger generations approach astrology. Many young people prefer AI astrology because it aligns with their digital lifestyle and expectations for instant access to information.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              AI astrology is available 24/7, requires no appointment, and provides instant results. It is often more affordable than traditional consultation and can be accessed privately from anywhere. These factors make it particularly appealing to younger users.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Additionally, AI astrology often presents insights in a modern, easy to understand format that resonates with younger audiences. The combination of ancient wisdom and modern technology creates an experience that feels both authentic and accessible.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Benefits of Instant Astrology Insights</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              The ability to get instant astrology insights has transformed how people use astrology. In the past, waiting days or weeks for a consultation was common. Today, AI Pandit delivers insights in seconds.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              This instant access allows people to seek guidance when they actually need it, rather than planning around appointment schedules. It enables regular check ins and ongoing support rather than one time consultations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Instant insights also make astrology more practical for decision making. When facing a choice or challenge, you can get astrological perspective immediately and factor it into your decision process. You can try our <Link to="/free-5-minutes-astrology-ai" className="text-purple-400 hover:text-purple-300 underline">free 5 minutes astrology AI</Link> for quick guidance.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Privacy Advantages of AI Astrology</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Privacy is a significant concern for many people seeking astrology guidance. Discussing personal matters with an astrologer can feel uncomfortable, especially for sensitive topics. AI astrology offers a private alternative.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              With AI Pandit, you can explore sensitive questions without fear of judgment or embarrassment. Your interactions are confidential, and you have control over what information you share. This privacy makes it easier to ask questions and seek guidance openly.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Veadicastro takes privacy seriously. Your birth details and consultation history are protected. We do not share your personal information with third parties without your consent. This commitment to privacy allows users to seek guidance with confidence.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit Available Anytime</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Life does not follow a 9 to 5 schedule, and neither does AI Pandit. Guidance is available 24 hours a day, 7 days a week. Whether you have a question at midnight or need insight early in the morning, AI Pandit is ready to help.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              This around the clock availability is particularly valuable for users in different time zones or those with irregular schedules. It also means you never have to wait for an appointment or business hours to get the guidance you need.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The anytime availability of AI Pandit makes astrology a practical tool for modern life. You can seek guidance whenever inspiration strikes or when you face an important decision, regardless of the time.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">AI Pandit for Users Outside India</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedic astrology has traditionally been most accessible to people in India. However, the Indian diaspora and global interest in astrology have created demand for accessible services worldwide. AI Pandit meets this need.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Users outside India can access AI Pandit from anywhere in the world. The system supports multiple time zones and provides insights relevant to users regardless of their location. This global accessibility has made Vedic astrology available to a much wider audience.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              For Indians living abroad, AI Pandit offers a connection to their cultural heritage. They can access authentic Vedic astrology guidance without needing to find local astrologers or travel to India. You can also explore <a href="https://astrovaanii.in/" className="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener noreferrer">Astrovaani</a> for traditional Vedic astrology consultations and personalized readings. This accessibility helps preserve and share traditional wisdom globally.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Future of AI and Vedic Astrology</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              The combination of AI and Vedic astrology is still in its early stages. As technology continues to advance, we can expect even more sophisticated and personalized astrology experiences. AI will likely enable deeper analysis, more accurate predictions, and new ways of understanding astrological patterns.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The future may include AI systems that can learn from feedback, adapt to individual preferences, and provide increasingly nuanced insights. We may see new applications of astrology in areas such as mental health, education, and personal development.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Despite these technological advances, the foundation will remain the authentic principles of Vedic astrology. AI serves as a tool to make this ancient wisdom more accessible and applicable to modern life. The synergy between tradition and technology promises an exciting future for astrology. Read more in our <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-purple-400 hover:text-purple-300 underline">AI transforming Vedic astrology</Link> article. If you are interested in how AI applies to numerology, explore our complete <Link to="/blog/numerology-guide" className="text-purple-400 hover:text-purple-300 underline">AI Numerology Guide</Link>.
            </p>

            <h2 className="text-3xl font-black text-white mb-6 mt-12">
              What Can AI Pandit Help You With?
            </h2>
            <p className="text-base leading-7 text-white/70 mb-6">
              AI Pandit offers comprehensive Vedic astrology guidance for various aspects of life. Whether you need shubh muhurat for important events, remedies for graha doshas, or daily spiritual guidance, our AI system provides authentic solutions based on your birth chart.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              <strong className="text-white">Shubh Muhurat for Marriage, Business, and Travel:</strong> AI Pandit calculates auspicious timing based on planetary positions and your birth chart. It identifies favorable periods for marriage ceremonies, business launches, property purchases, and important travel. The system considers planetary transits, dasha periods, and yogas to recommend the most auspicious dates and times for your important life events.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              <strong className="text-white">Graha Dosha Remedies (Mangal, Shani, Rahu):</strong> If your birth chart shows planetary afflictions like Mangal Dosha, Shani Sade Sati, or Rahu-Ketu effects, AI Pandit provides personalized remedies. These include specific mantras, gemstone recommendations, fasting guidelines, and charitable acts tailored to your chart. The remedies are based on authentic Vedic scriptures and are designed to mitigate the negative effects of planetary doshas.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              <strong className="text-white">Puja Guidance Based on Birth Chart:</strong> AI Pandit recommends specific pujas and rituals based on your planetary positions and current dasha periods. Whether you need Ganesh Puja for removing obstacles, Lakshmi Puja for wealth, or specific planetary pujas for health and prosperity, the guidance is personalized to your astrological needs. The system suggests the right time, method, and materials for performing these pujas.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              <strong className="text-white">Vedic Remedies — Mantra, Gemstone, Charity:</strong> Beyond puja recommendations, AI Pandit provides comprehensive Vedic remedies. This includes specific mantras for different planets and purposes, gemstone recommendations based on your birth chart (including which finger to wear them on), and charitable acts that align with your astrological profile. These remedies are designed to strengthen benefic planets and pacify malefic influences in your chart.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              <strong className="text-white">Nakshatra Based Daily Guidance:</strong> Your nakshatra (birth star) plays a crucial role in Vedic astrology. AI Pandit provides daily guidance based on your nakshatra and current planetary transits. This includes favorable activities for the day, colors to wear, directions to avoid, and general guidance for navigating daily challenges. The nakshatra-based approach ensures that your guidance is uniquely personalized to your cosmic blueprint.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Why Veadicastro AI Pandit (Vedika AI) is Different</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Veadicastro AI Pandit, also known as Vedika AI, was developed with a deep commitment to both Vedic astrology authenticity and technological excellence. Unlike generic AI systems that provide superficial astrology responses, Vedika AI is built on authentic Vedic astrology calculations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The system was developed by experts who understand both the depth of Vedic astrology and the capabilities of modern AI. This dual expertise ensures that Vedika AI provides guidance that is both astrologically sound and technologically advanced.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              What sets Vedika AI apart is its focus on accuracy, privacy, and user experience. The system uses precise Vedic astrology calculations, protects user data, and presents insights in a clear, actionable format. Users can trust that the guidance they receive is grounded in authentic astrology principles. Learn more about <Link to="/blog/vedika-ai-astrologer-india" className="text-purple-400 hover:text-purple-300 underline">Vedika AI astrologer India</Link>.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The founder of Veadicastro, Arpit Uniyal, envisioned a platform that would make authentic Vedic astrology accessible to everyone through technology. Vedika AI represents this vision, combining respect for tradition with innovation for the future. You can learn more about the <Link to="/about-founder" className="text-purple-400 hover:text-purple-300 underline">founder</Link> and the <Link to="/mission" className="text-purple-400 hover:text-purple-300 underline">mission</Link> behind Veadicastro.
            </p>
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
            <div className="mt-8 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-8 text-center">
              <h3 className="text-2xl font-black text-white mb-4">Still Have Questions?</h3>
              <p className="text-base leading-7 text-white/70 mb-6">
                Consult our AI Pandit for personalized answers to your specific questions. Comparing platforms? Check our <Link to="/astrosage-alternative" className="text-purple-400 hover:text-purple-300 underline">AstroSage alternative</Link> page.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-2 rounded-2xl btn-pink px-6 py-3 text-base font-black text-white"
              >
                <Sparkles className="h-5 w-5" />
                Ask AI Pandit
              </button>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-8 text-center">
            <h3 className="text-3xl font-black text-white mb-4">Start Your AI Pandit Journey Today</h3>
            <p className="text-lg leading-8 text-white/70 mb-8 max-w-2xl mx-auto">
              Get authentic Vedic astrology guidance instantly. Your first consultation is completely free.
            </p>
            <button
              onClick={() => setShowPopup(true)}
              className="inline-flex items-center gap-2 rounded-2xl btn-pink px-8 py-4 text-base font-black text-white"
            >
              Consult Free AI Pandit
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
                <img 
                  src="/optimized/vedika.webp" 
                  alt="Vedika AI - Your Personal AI Pandit" 
                  className="mx-auto mb-6 w-32 h-32 rounded-full object-cover shadow-2xl border-2 border-pink-500/30"
                />
                <h3 className="text-2xl font-black text-white mb-2">
                  Consult Vedika AI - Your Personal AI Pandit
                </h3>
                <p className="text-base leading-7 text-white/75 mb-6">
                  Get authentic Vedic astrology guidance based on your birth details. Your first consultation is completely free.
                </p>
                <div className="mb-6">
                  <button onClick={() => setPopupStep(2)} className="relative inline-flex rounded-full overflow-hidden">
                    <div className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#ec4899,#a855f7,#f472b6,#ec4899)] animate-spin-slow" />
                    <div className="relative flex flex-col items-center rounded-full bg-pink-500/20 px-6 py-3">
                      <span className="text-sm font-semibold text-pink-200">First chat is completely free</span>
                      <span className="text-xs text-pink-300/70">Offer expires {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at 11:59 PM GMT+5:30</span>
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setPopupStep(2)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl btn-pink px-6 py-3 text-base font-black text-white"
                >
                  Start Free Consultation
                </button>
                <p className="mt-4 text-xs text-white/50">
                  No credit card required • Instant access
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
