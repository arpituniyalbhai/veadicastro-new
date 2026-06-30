import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Sparkles, X, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import InternalLinksSection from "@/components/InternalLinksSection";

const SITE_URL = "https://veadicastro.in";
const PAGE_PATH = "/horoscope-by-date-of-birth";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_IMAGE = `${SITE_URL}/optimized/ai-horoscope-by-date-of-birth.webp`;

const faqs = [
  {
    q: "What is horoscope by date of birth?",
    a: "It is a personalized horoscope created using your birth date, birth time, and birthplace.",
  },
  {
    q: "Can I get a free horoscope by date of birth?",
    a: "Yes. Many platforms including Veadicastro offer free horoscope predictions based on birth details.",
  },
  {
    q: "Is birth time necessary for horoscope prediction?",
    a: "Birth time improves the accuracy of your horoscope and helps calculate important chart details.",
  },
  {
    q: "How accurate are horoscope predictions?",
    a: "Horoscope predictions provide guidance and patterns rather than guaranteed outcomes.",
  },
  {
    q: "What is a birth chart?",
    a: "A birth chart is an astrological map showing planetary positions at the time of your birth.",
  },
  {
    q: "Can horoscope predict marriage?",
    a: "Astrology can provide insights about relationship patterns and possible marriage periods.",
  },
  {
    q: "Can horoscope predict career success?",
    a: "Astrology may reveal strengths and career tendencies, but success also depends on effort and decisions.",
  },
  {
    q: "What is the difference between zodiac signs and horoscope by date of birth?",
    a: "Zodiac signs are general while personalized horoscopes are based on your unique birth details.",
  },
  {
    q: "Can I get horoscope predictions online instantly?",
    a: "Yes. Modern AI systems can generate horoscope insights within seconds.",
  },
  {
    q: "What is Vedic astrology?",
    a: "Vedic astrology is an ancient Indian system of astrology based on planetary positions and birth charts.",
  },
  {
    q: "Can astrology help with relationships?",
    a: "Many people use astrology to understand compatibility and communication patterns.",
  },
  {
    q: "Can AI create horoscope predictions?",
    a: "Yes. AI can analyze birth details and generate personalized astrological insights.",
  },
  {
    q: "Is horoscope by date of birth free on Veadicastro?",
    a: "Veadicastro offers free horoscope tools and personalized astrology insights through Vedika AI.",
  },
  {
    q: "Can horoscope reveal personality traits?",
    a: "Yes. Your birth chart can provide insights into your strengths, weaknesses, emotions, and behavior patterns.",
  },
  {
    q: "Why do millions of people use astrology?",
    a: "Many people use astrology for self understanding, guidance, and personal growth.",
  },
];

export default function HoroscopeByDateOfBirth() {
  const { setAuthOpen } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1);

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
      { "@type": "ListItem", position: 2, name: "Horoscope by Date of Birth", item: PAGE_URL },
    ],
  }), []);

  return (
    <>
      <Helmet>
        <title>AI Horoscope by Date of Birth - Free Vedic Astrology Predictions | Veadicastro</title>
        <meta
          name="description"
          content="Discover your personality, career, love life, and future with free horoscope predictions by date of birth. Get personalized Vedic astrology insights from Vedika AI."
        />
        <meta
          name="keywords"
          content="horoscope by date of birth, free horoscope, vedic astrology, birth chart, personality prediction, career prediction, love prediction, vedika ai"
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:title" content="Horoscope by Date of Birth — Discover Your Future | Veadicastro" />
        <meta property="og:description" content="Get personalized horoscope predictions based on your birth details. Discover your personality, career, love life, and future." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={PAGE_IMAGE} />
        <meta property="og:site_name" content="Veadicastro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Horoscope by Date of Birth — Discover Your Future | Veadicastro" />
        <meta name="twitter:description" content="Get personalized horoscope predictions based on your birth details. Discover your personality, career, love life, and future." />
        <meta name="twitter:image" content={PAGE_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#07070d] text-white">

        {/* Simple Centered Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.15),transparent_50%)]" />
          <div className="relative max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
              <Star className="h-3.5 w-3.5" />
              Horoscope by Date of Birth
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl mb-6">
              See Your Future in Just 30 Seconds
            </h1>
            <p className="text-lg leading-8 text-white/65 mb-8 max-w-2xl mx-auto">
              Get personalized horoscope predictions based on your birth details. Understand your strengths, relationships, and life path with Vedic astrology.
            </p>

            <button
              onClick={() => setShowPopup(true)}
              className="inline-flex items-center gap-2 rounded-2xl btn-pink px-8 py-4 text-base font-black text-white"
            >
              <Sparkles className="h-5 w-5" />
              Try Free AI Horoscope
            </button>

            <div className="mt-12">
              <img
                src="/optimized/ai-horoscope-by-date-of-birth.webp"
                alt="AI Horoscope by Date of Birth"
                className="mx-auto rounded-2xl shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-3xl font-black text-white mb-6">
              Horoscope by Date of Birth: Discover Your Personality, Career, Love Life, and Future
            </h2>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many people wonder what the future holds for them. Will I have a successful career? Will I find true love? Will I become financially stable? What are my strengths and weaknesses?
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              For thousands of years, astrology has helped people explore these questions. Today, modern technology makes it possible to get personalized horoscope insights in just a few seconds using your birth details.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              A horoscope by date of birth is one of the most popular ways to understand yourself better and discover patterns that may influence your life journey.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              By using your date of birth, time of birth, and place of birth, astrology creates a unique birth chart that can provide insights about your personality, career, relationships, health, education, and future opportunities.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Whether you are a student, a business owner, a working professional, or simply someone who is curious about astrology, your horoscope can reveal interesting details about your life path. You can also try our <Link to="/free-ai-astrologer-chat" className="text-purple-400 hover:text-purple-300 underline">free AI astrologer</Link> for instant guidance, check your <Link to="/today-horoscope" className="text-purple-400 hover:text-purple-300 underline">today horoscope</Link> for daily insights, or explore our <Link to="/blog" className="text-purple-400 hover:text-purple-300 underline">astrology blog</Link> for in-depth guides.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">What is Horoscope by Date of Birth?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              A horoscope by date of birth is a personalized astrological reading created using your birth details.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Unlike newspaper horoscopes that give the same prediction to millions of people born under the same zodiac sign, a personalized horoscope is created only for you.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              No two people have exactly the same birth chart unless they are born at the same time and place. This makes your horoscope unique.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your horoscope is based on the positions of the Sun, Moon, and planets at the exact moment you were born. Astrologers believe these planetary positions can influence different areas of life, including personality, relationships, career choices, and important life events.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Because every person has a unique birth chart, every horoscope is different.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">What Information is Needed for Horoscope Prediction?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              To generate an accurate horoscope, three details are usually required.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Date of Birth</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your birth date helps determine the position of planets and your zodiac sign.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Time of Birth</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Birth time helps calculate your rising sign and house placements. Even a small difference in birth time can change some parts of your horoscope.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Place of Birth</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your birthplace helps calculate the exact planetary positions based on location and time zone. The more accurate your birth details are, the more accurate your horoscope becomes.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">How Does Horoscope by Date of Birth Work?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              When you enter your birth details, astrology creates a birth chart. This chart acts like a map of the sky at the moment you were born. The chart contains several important elements.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Zodiac Signs</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              The zodiac signs represent different personality traits and life themes. Each sign has its own strengths and characteristics.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Planets</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Every planet represents a different area of life. For example, Venus is connected with love and relationships. Mars is connected with energy and ambition. Jupiter is connected with growth and wisdom. Mercury is connected with communication and learning.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Houses</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              The birth chart is divided into twelve houses. Each house represents an important area of life such as career, marriage, money, education, family, and health. To generate your birth chart, you can use our <Link to="/free-kundli-generator" className="text-purple-400 hover:text-purple-300 underline">free kundli generator</Link> or get detailed analysis with <Link to="/ai-kundli-analysis" className="text-purple-400 hover:text-purple-300 underline">AI kundli analysis</Link>. For marriage compatibility, try our <Link to="/free-kundali-matching" className="text-purple-400 hover:text-purple-300 underline">kundli matching</Link> tool.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Planetary Relationships</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              The way planets interact with each other can influence different experiences and opportunities in life. Astrologers study these combinations to understand your unique life path.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">What Can a Horoscope Reveal About You?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              A horoscope can provide insights into many areas of life.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Personality</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your horoscope can reveal your natural strengths and weaknesses. Some people are naturally creative. Some are practical thinkers. Some are emotional and caring. Others are independent and ambitious. Understanding your personality can help you make better decisions and improve your relationships with others.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Career and Profession</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many people use horoscope predictions to understand their career direction. Your birth chart may reveal leadership skills, business potential, creative talents, communication abilities, and areas where you may perform well. These insights can help you choose a career that matches your natural strengths. For detailed career guidance, you can also use our <Link to="/ai-career-prediction-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">AI career prediction by date of birth</Link> tool.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Love and Relationships</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Relationships are one of the biggest reasons people explore astrology. Your horoscope may provide insights about relationship patterns, emotional compatibility, marriage timing, communication style, and romantic preferences. Understanding these patterns can help improve your relationships and expectations. For specific love insights, try our <Link to="/love-astrology-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">love astrology by date of birth</Link> or <Link to="/ai-future-spouse-prediction" className="text-purple-400 hover:text-purple-300 underline">future spouse prediction</Link> tools.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Money and Finance</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Financial success often depends on many factors including skills, effort, opportunities, and decisions. Astrology can help identify periods where financial growth may become stronger or where careful planning may be useful.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Health and Wellbeing</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              A horoscope cannot replace medical advice, but it may provide general insights about lifestyle habits and wellness patterns. Many people use astrology as an additional tool for self awareness and balance.
            </p>

            <h4 className="text-xl font-semibold text-white mb-3 mt-6">Education and Learning</h4>
            <p className="text-base leading-7 text-white/70 mb-6">
              Students often use horoscope readings to understand their learning style and strengths. Some people learn better through practical experience while others enjoy research and analysis. Understanding your strengths can improve confidence and performance.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Why Are Personalized Horoscopes Better Than Daily Zodiac Predictions?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many people read daily zodiac predictions online. While these can be entertaining, they are often very general. For example, millions of people around the world share the same zodiac sign. It is impossible for one prediction to match every person born under that sign. For more detailed yearly insights, you can check our <Link to="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" className="text-purple-400 hover:text-purple-300 underline">yearly horoscope 2026</Link> blog.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              A horoscope by date of birth is different. It uses your exact birth details to create predictions that are unique to you. This makes the reading much more personal and meaningful.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Vedic Astrology and Horoscope Predictions</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedic astrology is one of the oldest forms of astrology in the world. It has been practiced for thousands of years and is deeply connected with Indian culture and traditions.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedic astrology studies planetary positions, birth charts, and life cycles to understand different areas of life. Many people prefer Vedic astrology because it uses detailed calculations and considers factors such as planetary periods and house placements.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Today, millions of people around the world continue to use Vedic astrology for guidance and self understanding. Astrology can also provide insights into major events and predictions, such as our <Link to="/blog/next-pm-india-2029-astrology-prediction" className="text-purple-400 hover:text-purple-300 underline">next PM of India 2029 astrology prediction</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Why Birth Time is Important</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users ask whether birth time is really necessary. The answer is yes. Birth time plays an important role in horoscope calculations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Without an accurate birth time, some important parts of the chart may become less precise. Birth time affects rising sign, house placements, planet positions, marriage predictions, and career predictions.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              If you know your birth time, your horoscope can become much more detailed.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">How Vedika AI from Veadicastro Creates Horoscope Predictions</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Technology has changed the way people access astrology. In the past, people often waited days or weeks to receive a horoscope reading. Today, artificial intelligence can analyze birth details and generate personalized insights almost instantly.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedika AI from Veadicastro combines traditional Vedic astrology principles with modern artificial intelligence technology. Instead of giving generic responses, Vedika AI creates personalized predictions based on your birth details and astrological calculations.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Users can explore topics such as <Link to="/ai-career-prediction-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">career predictions</Link>, <Link to="/love-astrology-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">love predictions</Link>, <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-purple-400 hover:text-purple-300 underline">marriage insights</Link>, daily guidance, personality analysis, and future opportunities. You can also get a quick reading with our <Link to="/free-5-minutes-astrology-ai" className="text-purple-400 hover:text-purple-300 underline">free 5 minutes astrology AI</Link> tool.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The goal is to make astrology simple, accessible, and easy to understand for everyone.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Are Horoscope Predictions Accurate?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              This is one of the most common questions people ask. Astrology should be viewed as guidance rather than certainty.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              A horoscope can highlight patterns, strengths, opportunities, and challenges. However, your choices and actions still play an important role in shaping your future.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Two people with similar birth charts can still live very different lives because of their decisions and experiences. Many people use astrology as a tool for self reflection rather than absolute answers.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Why Are More People Using AI Horoscope Tools?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Interest in AI based astrology has grown rapidly in recent years. People enjoy getting personalized insights quickly and easily.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Some reasons behind this growth include instant results, personalized readings, easy access from anywhere, simple explanations, and better user experience.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              AI has made astrology more accessible to people around the world.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Can Horoscope by Date of Birth Help You Make Better Decisions?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Many users find that horoscope readings help them understand themselves better. When you understand your strengths, weaknesses, habits, and emotional patterns, decision making often becomes easier. Explore more astrology tools and predictions on our <Link to="/" className="text-purple-400 hover:text-purple-300 underline">homepage</Link>.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Astrology cannot make decisions for you. But it can provide a different perspective that may help you think more clearly.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">The Future of Astrology and Artificial Intelligence</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Artificial intelligence is transforming many industries, including astrology. Modern systems can process complex calculations in seconds and generate personalized insights for users across the world.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              As technology continues to improve, AI powered astrology tools are expected to become even more detailed and personalized. The combination of ancient wisdom and modern technology is creating a new generation of astrology experiences.
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
          </div>
        </section>

        <InternalLinksSection />
      </main>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" />
          
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
                  src="/optimized/ai-horoscope-by-date-of-birth.webp" 
                  alt="AI Horoscope" 
                  className="mx-auto mb-6 w-full h-auto rounded-xl"
                />
                <h3 className="text-2xl font-black text-white mb-2">
                  Get Your Free Horoscope
                </h3>
                <p className="text-base leading-7 text-white/75 mb-6">
                  Enter your birth details and discover your personality, career, love life, and future with Vedika AI.
                </p>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-pink-500/20 border border-pink-400/30 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span className="text-sm font-semibold text-pink-200">2 chats are completely free</span>
                </div>
                <button
                  onClick={() => setPopupStep(2)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl btn-pink px-6 py-3 text-base font-black text-white"
                >
                  Continue
                  <Sparkles className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
