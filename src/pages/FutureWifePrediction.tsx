import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Heart, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SITE_URL = "https://veadicastro.in";
const PAGE_PATH = "/ai-future-spouse-prediction";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PAGE_IMAGE = `${SITE_URL}/optimized/ai-marriage-prediction-v2.webp`;

const faqs = [
  {
    q: "How accurate is spouse prediction by date of birth?",
    a: "Accuracy depends on the precision of your birth details, especially birth time. Vedic astrology reveals tendencies and patterns rather than certainties, but accurate birth data significantly improves the quality of the reading.",
  },
  {
    q: "Can I get free spouse predictions online?",
    a: "Yes. Veadicastro offers free spouse predictions through Vedika AI based on your Vedic birth chart.",
  },
  {
    q: "What information is needed for spouse prediction?",
    a: "You need your date of birth, exact birth time, and birthplace for an accurate Vedic astrology spouse prediction.",
  },
  {
    q: "Can astrology predict when I will get married?",
    a: "Yes. Vedic astrology uses Dasha periods and planetary transits — especially Jupiter — to identify favorable windows for marriage.",
  },
  {
    q: "Can astrology predict my spouse's personality?",
    a: "Yes. The 7th house, Venus or Jupiter placement, and Navamsa chart together reveal likely personality traits, relationship style, and compatibility patterns of your future spouse.",
  },
  {
    q: "Are spouse predictions only for a specific gender?",
    a: "No. Spouse predictions are available for everyone. Venus is analyzed for male charts and Jupiter for female charts in Vedic astrology.",
  },
  {
    q: "What is Darakaraka in spouse prediction?",
    a: "Darakaraka is the planet with the lowest degree in your birth chart, considered the primary indicator of your spouse's nature, personality, and characteristics in Vedic astrology.",
  },
];

export default function FutureWifePrediction() {
  const { setAuthOpen } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1); // 1 = message, 2 = signup

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
      { "@type": "ListItem", position: 2, name: "AI Future Spouse Prediction", item: PAGE_URL },
    ],
  }), []);

  return (
    <>
      <Helmet>
        <title>Future Spouse Prediction by Date of Birth | Free Vedic Astrology </title>
        <meta
          name="description"
          content="Discover your future spouse with Vedika AI. Get free spouse predictions, personality traits, relationship patterns, and marriage timing based on Vedic astrology."
        />
        <meta
          name="keywords"
          content="future spouse prediction, spouse predictions, future spouse astrology, marriage timing prediction, who will i marry astrology, vedika ai"
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta property="og:title" content="AI Future Spouse Prediction — Discover Your Future Partner | Veadicastro" />
        <meta property="og:description" content="Discover your future spouse with Vedika AI. Get free spouse predictions and marriage timing." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={PAGE_IMAGE} />
        <meta property="og:site_name" content="Veadicastro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Future Spouse Prediction — Discover Your Future Partner | Veadicastro" />
        <meta name="twitter:description" content="Discover your future spouse with Vedika AI. Get free spouse predictions and marriage timing." />
        <meta name="twitter:image" content={PAGE_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Announcement Banner */}
{/* Announcement Banner */}
<div className="mx-auto max-w-5xl px-4 py-4">
  <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4">
    <div className="absolute inset-0 opacity-20" style={{
      background: 'radial-gradient(circle at 15% 20%, rgba(251,146,60,0.3) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(239,68,68,0.3) 0%, transparent 45%)'
    }} />
    
    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      
      {/* Image + Text row — always together */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <img
            src="/amanuniyalastrologe.webp"
            alt="Acharya ji - Expert Vedic Astrologer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-500/50 shadow-lg"
          />
          <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">Live</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">SPECIAL OFFER</span>
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">Unlimited Call</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-orange-400 leading-snug">
            Talk to Best Astrologer of Uttarakhand — Acharya ji
          </h3>
          <p className="text-xs sm:text-sm text-white/70 mt-0.5">Get personalized guidance from expert Vedic astrologer.</p>
          <p className="text-xs text-green-400 mt-0.5 font-medium">Full refund if not satisfied with Acharya ji</p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => window.location.href = '/talk-to-astrologer'}
        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-bold text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200"
      >
        Book Now — Acharya Aman Uniyal Ji
      </button>
    </div>
  </div>
</div>

      <main className="min-h-screen bg-[#07070d] text-white">

        {/* Simple Centered Hero */}
        <section className="relative min-h-[80vh] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.15),transparent_50%)]" />
          <div className="relative max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
              <Heart className="h-3.5 w-3.5" />
              AI Future Spouse Prediction
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl mb-6">
              Who Will Be Your Future Spouse?
            </h1>
            <p className="text-lg leading-8 text-white/65 mb-8 max-w-2xl mx-auto">
              Discover your future spouse characteristics, relationship patterns, and marriage timing with Vedika AI. Get personalized insights based on Vedic astrology.
            </p>

            <button
              onClick={() => setShowPopup(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-pink-500 px-8 py-4 text-base font-black text-white hover:bg-pink-400 transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              Ask Vedika AI About Your Future Spouse
            </button>
          </div>
        </section>

        {/* Image Section */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img
              src="/optimized/ai-marriage-prediction-v2.webp"
              alt="AI Future Spouse Prediction with Vedic Astrology"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        </section>

        {/* Article Content */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-3xl font-black text-white mb-6">
              Spouse Prediction by Date of Birth
            </h2>
            <p className="text-base leading-7 text-white/70 mb-6">
              Wondering what your future spouse will be like? Millions of people search for spouse prediction by date of birth every year — not just out of curiosity, but because understanding relationship patterns can help you make better choices in love and life. Vedic astrology has offered guidance on this for thousands of years, and today <Link to="/ai-astrology-prediction" className="text-pink-400 hover:text-pink-300 underline">AI astrology</Link> makes it more accessible than ever.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Using your date of birth, birth time, and birthplace, an AI-powered Vedic astrology system can analyze your birth chart to reveal the characteristics, personality, and timing of your future spouse. This is not guesswork — it is a structured reading of planetary positions that have guided marriage decisions across generations. You can also try <Link to="/free-5-minutes-astrology-ai" className="text-pink-400 hover:text-pink-300 underline">free 5-minute astrology AI</Link> for quick insights or check your <Link to="/horoscope-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">horoscope by date of birth</Link> for personality insights.
            </p>

            {/* Direct Answer */}
            <div className="mt-6 rounded-2xl border border-pink-400/25 bg-pink-400/10 p-5">
              <h3 className="text-xl font-black text-white">Direct Answer</h3>
              <p className="mt-3 text-sm leading-8 text-white/75">
                Spouse prediction by date of birth works by analyzing your 7th house, Venus, Jupiter, and Navamsa chart using Vedic astrology. These placements reveal your future spouse's personality traits, physical appearance tendencies, relationship style, and the timing of marriage through Dasha periods.
              </p>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">How Does Spouse Prediction by Date of Birth Work?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              In Vedic astrology, your birth chart is a snapshot of the sky at the exact moment you were born. Every house and planet in this chart carries meaning. For spouse prediction, astrologers focus on three main areas — the 7th house, Venus or Jupiter, and the Navamsa chart (D9 chart). Together, these reveal detailed information about the person you are likely to marry. You can get a complete <Link to="/ai-kundli-analysis" className="text-pink-400 hover:text-pink-300 underline">AI Kundli analysis</Link> to understand your chart better.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Your date of birth determines your Lagna (ascendant), which sets the foundation of the entire chart. Without an accurate birth time, spouse predictions become approximate. With a precise birth time, the reading becomes significantly more detailed and reliable. You can generate your free <Link to="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline">Kundli</Link> to get started.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">The 7th House — The House of Marriage</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              The 7th house in your birth chart is the primary indicator of your spouse and marriage. The sign placed in your 7th house, the planet ruling that sign, and any planets sitting inside the 7th house all contribute to the picture of your future spouse.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              For example, if your 7th house has a strong Venus influence, your spouse may be charming, artistic, and warm-natured. If Saturn aspects the 7th house, your spouse may be older, mature, and serious about commitments. Mars in the 7th often indicates a dynamic, energetic, and occasionally stubborn partner. To understand compatibility better, you can also check <Link to="/free-kundali-matching" className="text-pink-400 hover:text-pink-300 underline">Kundli matching</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Role of Venus and Jupiter in Spouse Prediction</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Venus is the planet of love, beauty, and relationships. For those born with a male chart, Venus represents the ideal spouse. Its sign, house, and conjunctions in your birth chart describe the type of partner you are naturally attracted to and compatible with.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Jupiter plays a similar role in female charts, representing the husband or significant partner. A strong, well-placed Jupiter often indicates a wise, generous, and spiritually inclined spouse. An afflicted Jupiter may point to delays or complications in marriage.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Navamsa Chart — The Blueprint of Marriage</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              The Navamsa chart, also known as the D9 chart, is considered the most important divisional chart for marriage in Vedic astrology. While the birth chart shows the potential for marriage, the Navamsa reveals the actual quality and nature of the marital relationship.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Planets that appear strong in both the birth chart and the Navamsa chart produce powerful, lasting results. Astrologers always cross-reference both charts when making accurate spouse predictions by date of birth.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Marriage Timing — When Will You Meet Your Spouse?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              One of the most common questions people ask is not just about who their spouse will be, but when they will meet them. Vedic astrology uses Dasha periods — planetary time cycles — to identify favorable windows for marriage. The Dasha of Venus, Jupiter, or the 7th lord often triggers significant relationship events including meetings, proposals, and marriages. For detailed marriage timing, you can use <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">AI marriage prediction by date of birth</Link>.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Transits also play a role. When Jupiter transits over your 7th house or your ascendant, it often brings new relationship opportunities. Saturn transiting the 7th house can delay marriage but also solidify long-term commitments once the period ends. Check your <Link to="/today-horoscope" className="text-pink-400 hover:text-pink-300 underline">today horoscope</Link> for current planetary influences.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">What Can Spouse Predictions Reveal?</h3>
            <ul className="list-disc pl-6 space-y-2 text-base leading-7 text-white/70 mb-6">
              <li><strong>Personality Traits:</strong> Whether your spouse will be independent, creative, practical, spiritual, or family-oriented based on planetary influences in your 7th house.</li>
              <li><strong>Relationship Style:</strong> Whether your bond is likely to grow gradually or begin with immediate emotional intensity.</li>
              <li><strong>Communication Patterns:</strong> Certain placements indicate an expressive and social partner, while others suggest someone calm, thoughtful, and reserved.</li>
              <li><strong>Direction of Spouse:</strong> Vedic astrology can even suggest the general direction — north, south, east, or west — from which your spouse may come based on planetary signs.</li>
              <li><strong>Marriage Timing:</strong> Favorable Dasha periods and Jupiter transits that align with strong marriage possibilities in your chart.</li>
            </ul>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">How Vedika AI Does Spouse Prediction</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedika AI by Veadicastro combines classical Vedic astrology principles with modern artificial intelligence to generate personalized spouse predictions based on your birth details. Rather than producing generic horoscope-style statements, Vedika AI analyzes your specific 7th house, Venus or Jupiter placement, and Navamsa combinations to deliver insights tailored to your chart. You can also chat with a <Link to="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline">free AI astrologer</Link> for instant guidance.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              You can ask Vedika direct questions — about your spouse's personality, relationship timing, compatibility patterns, or marriage prospects — and receive answers grounded in your actual birth chart rather than sun-sign generalities. For love and relationship insights, try <Link to="/love-astrology-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">love astrology by date of birth</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Is Spouse Prediction by Date of Birth Accurate?</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedic astrology provides tendencies and patterns, not guarantees. The accuracy of a spouse prediction depends heavily on the precision of your birth details — especially birth time. An accurate birth time allows for a precise Lagna and 7th house calculation, which significantly improves the quality of the reading.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Most people find spouse predictions most useful not as absolute predictions, but as a framework for self-awareness — understanding what kind of partnership they naturally align with and what timing in life is most favorable for love. Astrology can also guide your <Link to="/ai-career-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">career path</Link> and life decisions.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Spouse Prediction for Men — Future Wife Prediction</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              For men seeking future wife prediction, Vedic astrology primarily analyzes Venus in the birth chart. Venus represents the ideal partner, love nature, and romantic preferences. The sign and house placement of Venus, along with any conjunctions or aspects, reveal the characteristics of a potential future wife.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              A strong Venus in Taurus or Libra often indicates a wife who is beautiful, loving, and devoted. Venus in Pisces may suggest a spiritual and compassionate partner. The 7th house lord's placement further refines this picture — showing where and how the marriage is likely to manifest in life. Explore more astrology predictions on our <Link to="/blog" className="text-pink-400 hover:text-pink-300 underline">blog</Link>.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">Spouse Prediction for Women — Future Husband Prediction</h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              For women seeking future husband prediction, Jupiter takes the primary role in Vedic astrology. Jupiter represents the husband, wisdom, and the nature of the marital bond. The position of Jupiter in your birth chart, along with the 7th house, provides insights into your future husband's personality and qualities.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              A well-placed Jupiter often indicates a husband who is wise, generous, and supportive. Jupiter in Sagittarius or Pisces may suggest a spiritually inclined partner. The condition of the 7th house and its ruler further describes the timing and circumstances of marriage. Visit our <Link to="/" className="text-pink-400 hover:text-pink-300 underline">homepage</Link> to explore all AI astrology tools.
            </p>

            <h3 className="text-2xl font-bold text-white mb-4 mt-10">
              Darakaraka and D9 Navamsa — The Real Spouse Indicators
            </h3>
            <p className="text-base leading-7 text-white/70 mb-6">
              In Vedic astrology, two specific techniques are used to study future 
              spouse characteristics with more precision. The <strong>Darakaraka</strong> 
              is the planet with the lowest degree in your birth chart — it is 
              considered the primary significator of your spouse and reveals 
              personality traits, nature, and even physical characteristics of 
              your future partner.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              The <strong>D9 Navamsa chart</strong> is a divisional chart specifically 
              used for marriage analysis. While the main birth chart (D1) shows 
              general life patterns, the Navamsa chart reveals deeper truths about 
              marriage, spouse nature, and relationship strength. Astrologers 
              cross-check the 7th house lord's placement in both D1 and D9 charts 
              for accurate spouse predictions.
            </p>
            <p className="text-base leading-7 text-white/70 mb-6">
              Vedika AI analyzes your Darakaraka planet, 7th house lord, Venus 
              placement, and D9 Navamsa positions together — not just the basic 
              7th house — for a more complete future spouse reading.
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

      </main>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" />
          
          {popupStep === 1 ? (
            // Step 1: Message Popup
            <div className="relative bg-[#0d0d16] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-400/30">
                  <img 
                    src="/optimized/vedika.webp" 
                    alt="Vedika AI" 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  Hey, I am Vedika AI — An AI Astrologer
                </h3>
                <h3 className="text-2xl font-black text-white mb-4">
                  I know you want to know about your future wife
                </h3>
                <p className="text-base leading-7 text-white/75 mb-6">
                  Just sign up, enter your date of birth, and ask me anything about your future spouse.
                </p>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-pink-500/20 border border-pink-400/30 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span className="text-sm font-semibold text-pink-200">1 chat is completely free</span>
                </div>
                <button
                  onClick={() => setPopupStep(2)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-6 py-3 text-base font-black text-white hover:bg-pink-400 transition-colors"
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
