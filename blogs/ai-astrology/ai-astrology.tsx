import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Target, Star, MessageSquare, CheckCircle2, TrendingUp, Shield, Zap, Calendar, Heart } from "lucide-react";
import { Card } from "../../src/components/ui/card";
import AdBanner from "../../src/components/AdBanner";
import { useAuth } from "../../src/context/AuthContext";

export default function AiAstrology() {
  const { setAuthOpen } = useAuth();
  return (
    <>
      {/* Top Header CTA */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Veadicastro" className="h-7 w-7 rounded" />
            <span className="text-sm font-semibold">AI Astrology</span>
          </Link>
          <button
            onClick={() => setAuthOpen(true)}
            className="rounded-lg bg-[#d9277a] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#c01e6a] transition-colors"
          >
            Try Free AI Astrologer
          </button>
        </div>
      </div>

      <Helmet>
        <title>AI Astrology Tools & Free Vedic AI Astrologer – Veadicastro</title>
        <meta name="description" content="AI Astrology by Veadicastro — India's most accurate free Vedic AI astrologer. Get personalized predictions, kundali analysis, and instant answers from authentic Vedic Jyotish combined with AI precision." />
        <meta name="keywords" content="free ai astrology, accurate ai astrology, vedic astrology ai, kundli generator free, ask ai astrologer free, vedika ai, jyotish ai, birth chart analysis, planetary predictions, dasha analysis, nakshatra predictions" />
        <link rel="canonical" href="https://veadicastro.in/ai-astrology" />
        <meta name="robots" content="index, follow" />
        
        {/* FAQ Schema */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is AI astrology accurate?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, AI astrology can be quite accurate when it follows authentic Vedic principles. It analyzes your exact birth details using traditional astrological knowledge to give you personalized predictions that actually relate to your life."
              }
            },
            {
              "@type": "Question",
              "name": "Is AI astrology real or fake?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI astrology is real when it's based on genuine Vedic knowledge. Unlike generic horoscopes that apply to everyone, it looks at your specific birth chart and uses proper astrological principles to give you insights that matter to you."
              }
            },
            {
              "@type": "Question",
              "name": "Which AI is best for astrology?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The best AI for astrology combines real Vedic knowledge with accurate calculations. Look for systems that are trained on authentic astrological texts and can give you specific, personalized answers rather than vague predictions."
              }
            },
            {
              "@type": "Question",
              "name": "Is AI astrology free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can try AI astrology for free at Veadicastro. You can get your birth chart analyzed and ask questions without paying. No signup needed for your first reading - just instant access to genuine Vedic insights."
              }
            }
          ]
        })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-purple-800/10" />
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 bg-accent/10 backdrop-blur-md shadow-lg">
              <span className="text-sm font-medium text-accent">India's Most Trusted AI Astrology Platform</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none mb-6">
              AI Astrology India: Free Vedic AI Astrologer
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Try India's most trusted free AI astrologer - get instant kundali analysis, personalized predictions, and answers to your questions. No signup required for your first consultation.
            </p>
            <Link to="/chatgpt-astrology" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 underline mb-8">
              Try ChatGPT Astrology
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            {/* Social Proof Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <img src="/optimized/reviews.webp" alt="Veadicastro Reviews - 10,000+ Happy Users" className="h-8 rounded-lg" />
                <span className="text-white/80 text-sm">10,000+ Happy Users</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-white/80 text-sm ml-1">4.8 Rating</span>
              </div>
            </div>
            
            {/* Testimonial */}
            <div className="card-glass rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <img src="/optimized/reviews.webp" alt="Veadicastro Reviews - User Testimonials" className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/80 italic mb-2">"Vedika AI predicted my marriage timing exactly as per my Kundali. The dasha analysis was spot-on! I used their <Link to="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline">free kundali generator in India</Link> and <Link to="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline">AI astrology chat in India</Link> for accurate predictions."</p>
                  <p className="text-white/60 text-sm">- Rohit Kumar, Delhi</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Complete Guide to AI Astrology</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "What is AI Astrology", href: "#what-is-ai-astrology" },
                  { title: "How AI Astrology Works", href: "#how-ai-astrology-works" },
                  { title: "Types of AI Astrology", href: "#types-of-ai-astrology" },
                  { title: "Benefits of AI Astrology", href: "#benefits" },
                  { title: "Is AI Astrology Accurate?", href: "#accuracy" },
                  { title: "AI vs Human Astrologer", href: "#ai-vs-human" },
                  { title: "Use Cases & Questions", href: "#use-cases" },
                  { title: "AI Astrology Tools", href: "#tools" },
                  { title: "Future of AI Astrology", href: "#future" },
                  { title: "FAQs", href: "#faq" }
                ].map((item, i) => (
                  <a key={i} href={item.href} className="flex items-center gap-2 text-white/80 hover:text-pink-400 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* All Free Tools Section */}
        <section id="tools" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6">AI Astrology Tools Hub</h2>
            <p className="text-center text-white/70 mb-12 max-w-3xl mx-auto">
              Here are most powerful AI astrology tools you can use to generate kundali, ask questions, and get predictions based on authentic Vedic principles.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Free 5-Minutes Astrology",
                  desc: "Quick AI astrology readings in just 5 minutes",
                  icon: <Zap className="w-6 h-6" />,
                  link: "/free-5-minutes-astrology-ai",
                  free: true
                },
                {
                  title: "AI Astrology Prediction",
                  desc: "Generate 10 personal predictions from your Vedic birth chart",
                  icon: <TrendingUp className="w-6 h-6" />,
                  link: "/ai-astrology-prediction",
                  free: true
                },
                {
                  title: "Ask Vedika AI",
                  desc: "Get personalized answers to your astrology questions",
                  icon: <MessageSquare className="w-6 h-6" />,
                  link: "/free-ai-astrologer-chat",
                  free: true
                },
                {
                  title: "Kundali Generator",
                  desc: "Generate your detailed Vedic birth chart",
                  icon: <Star className="w-6 h-6" />,
                  link: "/free-kundli-generator",
                  free: true
                },
                {
                  title: "Kundali Matching",
                  desc: "Check marriage compatibility with your partner",
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  link: "/free-kundali-matching", 
                  free: true
                },
                {
                  title: "Angel Numbers",
                  desc: "Discover the meaning behind angel numbers",
                  icon: <Target className="w-6 h-6" />,
                  link: "/angel-number-calculator",
                  free: true
                },
                {
                  title: "Lucky Colour Today",
                  desc: "Find your lucky colour based on planetary positions and birth chart analysis",
                  icon: <Shield className="w-6 h-6" />,
                  link: "/lucky-colour-for-today",
                  free: true
                },
                {
                  title: "Today's Horoscope",
                  desc: "Get your daily horoscope based on today's planetary transits",
                  icon: <Calendar className="w-6 h-6" />,
                  link: "/today-horoscope",
                  free: true
                },
                {
                  title: "Talk to Astrologer",
                  desc: "Consult with expert human astrologers",
                  icon: <MessageSquare className="w-6 h-6" />,
                  link: "/talk-to-astrologer",
                  free: false
                },
                {
                  title: "Yearly Horoscope",
                  desc: "Get detailed predictions for the year",
                  icon: <TrendingUp className="w-6 h-6" />,
                  link: "/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis",
                  free: true
                },
                {
                  title: "Career Predictions",
                  desc: "Discover your best career options",
                  icon: <Target className="w-6 h-6" />,
                  link: "/blog/best-careers-for-each-zodiac-sign-in-2026",
                  free: true
                }
              ].map((tool, i) => (
                <Link key={i} to={tool.link} className="block group">
                  <Card className="card-glass rounded-2xl p-6 h-full hover:border-pink-500/30 transition-all group-hover:transform group-hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg btn-pink flex items-center justify-center text-white">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold group-hover:text-pink-400 transition-colors">
                          {tool.title}
                        </h3>
                        {tool.free && (
                          <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full mt-1">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                      {tool.desc}
                    </p>
                    <div className="flex items-center gap-2 text-pink-400 text-sm font-medium">
                      {tool.title === "Ask Vedika AI" && "Free AI Astrology Chat in India"}
                      {tool.title === "Kundali Generator" && "Free AI Kundali Generator in India"}
                      {tool.title === "Kundali Matching" && "AI Kundali Matching for Marriage"}
                      {tool.title === "Angel Numbers" && "Lucky Number Calculator"}
                      {tool.title === "Lucky Colour Today" && "Lucky Colour Today"}
                      {tool.title === "Talk to Astrologer" && "Talk to Astrologer"}
                      {tool.title === "Yearly Horoscope" && "Yearly Horoscope 2026"}
                      {tool.title === "Career Predictions" && "AI Career Prediction India"}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* AdSense Ad - Mid Content 1 */}
        <div className="flex justify-center my-6">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>

        {/* AdSense Ad - Before How AI Astrology Works */}
        <div className="flex justify-center my-6">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>

        {/* How AI Astrology Works */}
        <section id="how-ai-astrology-works" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">How AI Astrology Works</h2>
            <div className="card-glass rounded-3xl p-8">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-400 font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Data Input (Birth Details)</h3>
                    <p className="text-white/60 mb-3">Date, time, and place of birth for accurate calculations</p>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-white/50">AI uses your exact birth coordinates to calculate planetary positions with precision. Try our <Link to="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline">free kundali generator with date of birth</Link> to see these calculations in real-time.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-400 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Kundali Calculation Engine</h3>
                    <p className="text-white/60 mb-3">Using authentic Vedic astrology principles and ancient texts</p>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-white/50">Automated calculations: Lagna, Rashi, Navamsa, Dasha, Shadbala, Ashtakavarga. Learn more about <Link to="/how-it-works" className="text-pink-400 hover:text-pink-300 underline">how our AI astrology works</Link> in detail.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-400 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">AI Pattern Analysis</h3>
                    <p className="text-white/60 mb-3">Career, love, marriage, health predictions based on your exact chart. Try our <Link to="/ai-career-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">AI Career Prediction</Link> for detailed career guidance.</p>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-white/50">Machine learning identifies patterns from thousands of authentic Vedic charts. <Link to="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline">Ask our AI astrologer for marriage prediction India</Link> and specific life areas.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-400 font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Interactive Chat Response</h3>
                    <p className="text-white/60 mb-3">Ask unlimited questions and get instant accurate answers</p>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-sm text-white/50">Natural language processing converts your questions into precise astrological insights. Start your <Link to="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline">AI astrology chat for career prediction India</Link> now for personalized guidance.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link 
                  to="/how-it-works" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Learn Technical Details →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Types of AI Astrology */}
        <section id="types-of-ai-astrology" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Types of AI Astrology</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "AI Kundali Analysis",
                  desc: "Complete birth chart analysis with planetary positions, dasha periods, and predictions",
                  features: ["Lagna Analysis", "Planetary Strengths", "Dasha Predictions", "Life Areas"],
                  link: "/ai-kundli-analysis"
                },
                {
                  title: "AI Chat Astrologer",
                  desc: "Interactive Q&A with AI trained on Vedic astrology principles",
                  features: ["Instant Answers", "Specific Questions", "Timing Predictions", "Remedies"],
                  link: "/free-ai-astrologer-chat"
                },
                {
                  title: "Lucky Colour Calculator",
                  desc: "Find your lucky colour based on planetary positions and birth chart analysis",
                  features: ["Daily Lucky Colours", "Planet-based Colors", "Personalized Palette", "Vedic Color Therapy"],
                  link: "/lucky-colour-for-today"
                },
                {
                  title: "Lucky Number Calculator",
                  desc: "Discover your lucky numbers through numerology and Vedic astrology combined",
                  features: ["Life Path Number", "Personal Year Number", "Name Numerology", "Vedic Number Analysis"],
                  link: "/angel-number-calculator"
                }
              ].map((type, i) => (
                <Link key={i} to={type.link} className="block group">
                  <div className="card-glass rounded-2xl p-6 h-full hover:border-pink-500/30 transition-all group-hover:transform group-hover:scale-[1.02]">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">{type.title}</h3>
                    <p className="text-white/70 mb-4">{type.desc}</p>
                    <ul className="space-y-2 mb-4">
                      {type.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-white/60 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-pink-400 text-sm font-medium">
                      Try This Tool <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Benefits of AI Astrology</h2>
            <div className="card-glass rounded-3xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Instant Clarity</h3>
                      <p className="text-white/70">Get answers in seconds instead of waiting hours for manual calculations. Experience instant clarity with our AI astrology platform.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Complete Privacy</h3>
                      <p className="text-white/70">Ask personal questions without judgment - your conversations are 100% private. Our free AI astrologer ensures complete confidentiality.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Affordable Access</h3>
                      <p className="text-white/70">Get expert-level astrology insights at fraction of traditional astrologer cost. Access free kundali analysis and more.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">24/7 Availability</h3>
                      <p className="text-white/70">Get guidance anytime, anywhere - no appointments needed. Our 24/7 AI astrology is always available.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Data-Driven Insights</h3>
                      <p className="text-white/70">Predictions based on thousands of authentic Vedic charts and patterns. Our AI Jyotish system uses authentic data.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Consistent Accuracy</h3>
                      <p className="text-white/70">Same calculations every time - no human error or mood variations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accuracy Section */}
        <section id="accuracy" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Is AI Astrology Accurate?</h2>
            <div className="card-glass rounded-3xl p-8">
              <div className="space-y-6 text-white/70 leading-relaxed">
                <p>
                  <strong>AI astrology accuracy</strong> depends on three critical factors: authentic Vedic principles, correct birth data, and advanced AI training. When these align, AI predictions can be remarkably accurate. Read our detailed <Link to="/blog/is-ai-astrology-accurate" className="text-pink-400 hover:text-pink-300 underline">AI astrology accuracy study</Link> to understand the science behind it.
                </p>
                
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold mb-4 text-white">Factors That Determine Accuracy</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">High Accuracy Factors</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Authentic Vedic calculations</strong></li>
                        <li>• <strong>Precise birth time & place</strong></li>
                        <li>• <strong>Trained on real charts</strong></li>
                        <li>• <strong>Dasha-based timing</strong></li>
                        <li>• <strong>Complete chart analysis</strong> - try our <Link to="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline">free kundali analysis</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2">Limiting Factors</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Incorrect birth details</strong></li>
                        <li>• <strong>Generic AI models</strong> - learn <Link to="/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" className="text-pink-400 hover:text-pink-300 underline">why ChatGPT fails at astrology</Link></li>
                        <li>• <strong>Western astrology mix</strong></li>
                        <li>• <strong>Incomplete calculations</strong></li>
                        <li>• <strong>Missing context</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold mb-3 text-white">Veadicastro's User Trust Signals</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">1.2L+</div>
                      <div className="text-sm text-white/60">Questions Answered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">27+</div>
                      <div className="text-sm text-white/60">Countries Using</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">2.3s</div>
                      <div className="text-sm text-white/60">Avg Response Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AdSense Ad - Mid Content 2 */}
        <div className="flex justify-center my-6">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>

        {/* AI vs Human */}
        <section id="ai-vs-human" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">AI vs Human Astrologer</h2>
            <div className="card-glass rounded-3xl p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-white/70">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4">Aspect</th>
                      <th className="text-center py-3 px-4">AI Astrologer</th>
                      <th className="text-center py-3 px-4">Human Astrologer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Speed</td>
                      <td className="py-4 px-4 text-center text-green-400">Instant</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Hours/Days</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Availability</td>
                      <td className="py-4 px-4 text-center text-green-400">24/7</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Limited Hours</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Consistency</td>
                      <td className="py-4 px-4 text-center text-green-400">Always Same</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Variable</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Cost</td>
                      <td className="py-4 px-4 text-center text-green-400">Low</td>
                      <td className="py-4 px-4 text-center text-yellow-400">High</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Privacy</td>
                      <td className="py-4 px-4 text-center text-green-400">100% Private</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Personal</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Intuition</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Limited</td>
                      <td className="py-4 px-4 text-center text-green-400">Strong</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Experience</td>
                      <td className="py-4 px-4 text-center text-green-400">1000s of Charts</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Limited</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="text-center mt-8">
                <Link 
                  to="/blog/ai-astrologer-vs-human-astrologer" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Read Detailed Comparison →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* AI vs ChatGPT vs Traditional Astrology */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Veadicastro vs ChatGPT vs Traditional Astrology</h2>
            <div className="card-glass rounded-3xl p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-white/70">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Veadicastro AI</th>
                      <th className="text-center py-3 px-4">ChatGPT</th>
                      <th className="text-center py-3 px-4">Traditional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Vedic Knowledge</td>
                      <td className="py-4 px-4 text-center text-green-400">100% Authentic</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Generic</td>
                      <td className="py-4 px-4 text-center text-green-400">100% Authentic</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Birth Chart Analysis</td>
                      <td className="py-4 px-4 text-center text-green-400">Complete</td>
                      <td className="py-4 px-4 text-center text-red-400">No</td>
                      <td className="py-4 px-4 text-center text-green-400">Complete</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Dasha Calculations</td>
                      <td className="py-4 px-4 text-center text-green-400">Automated</td>
                      <td className="py-4 px-4 text-center text-red-400">No</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Manual</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Response Time</td>
                      <td className="py-4 px-4 text-center text-green-400">2.3s</td>
                      <td className="py-4 px-4 text-center text-yellow-400">5-10s</td>
                      <td className="py-4 px-4 text-center text-red-400">Hours/Days</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Cost</td>
                      <td className="py-4 px-4 text-center text-green-400">Free</td>
                      <td className="py-4 px-4 text-center text-yellow-400">Paid</td>
                      <td className="py-4 px-4 text-center text-red-400">Expensive</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-8">
                <p className="text-white/60 mb-4">Why choose specialized AI astrology for marriage prediction India over generic AI models?</p>
                <Link 
                  to="/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Read Why ChatGPT Fails at Astrology →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* AstroSage Alternative CTA */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/70 text-lg">
              Also see how Veadicastro compares with established platforms on our{" "}
              <Link to="/astrosage-alternative" className="text-pink-400 hover:text-pink-300 underline font-semibold">
                AstroSage alternative
              </Link>{" "}
              page.
            </p>
          </div>
        </section>

        {/* Built by Veadicastro Team */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-glass rounded-3xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Built by Veadicastro Team</h2>
              <div className="text-center max-w-3xl mx-auto">
                <p className="text-lg text-white/70 leading-relaxed mb-6">
                  Our journey began when we saw millions of Indians relying on generic horoscopes instead of authentic Vedic astrology. We combined 5,000-year-old Jyotish wisdom with modern AI to make precise, personalized astrology accessible to everyone.
                </p>
                <p className="text-lg text-white/70 leading-relaxed mb-8">
                  We care deeply about preserving authentic Vedic knowledge while making it practical for modern life. Every prediction follows traditional Parashari principles, ensuring you get guidance that has helped generations navigate life's biggest decisions.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                    <span className="text-pink-400 font-semibold">5+ Years</span>
                    <span className="text-white/60 ml-2">Vedic Research</span>
                  </div>
                  <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                    <span className="text-pink-400 font-semibold">1000+</span>
                    <span className="text-white/60 ml-2">Ancient Texts Studied</span>
                  </div>
                  <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                    <span className="text-pink-400 font-semibold">1.2L+</span>
                    <span className="text-white/60 ml-2">Lives Impacted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">What Can You Ask AI Astrology?</h2>
            <div className="card-glass rounded-3xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">Career & Business</h3>
                  <ul className="space-y-2 text-white/70">
                    <li>• When will I get a job? - ask our <Link to="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 underline">AI career astrologer</Link></li>
                    <li>• Should I switch careers?</li>
                    <li>• Business success timing</li>
                    <li>• Best career options for me - check our <Link to="/ai-career-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline">AI Career Prediction by Date of Birth</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">Love & Relationships</h3>
                  <ul className="space-y-2 text-white/70">
                    <li>• When will I find love?</li>
                    <li>• Breakup recovery timing</li>
                    <li>• Marriage compatibility - try our <Link to="/kundali-matching" className="text-pink-400 hover:text-pink-300 underline">kundali matching</Link></li>
                    <li>• Relationship problems</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">Finance & Wealth</h3>
                  <ul className="space-y-2 text-white/70">
                    <li>• Financial improvement timing</li>
                    <li>• Investment prospects</li>
                    <li>• Wealth yoga in kundali - get <Link to="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 underline">free kundali analysis</Link></li>
                    <li>• Debt relief predictions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">Health & Wellness</h3>
                  <ul className="space-y-2 text-white/70">
                    <li>• Health concerns timing</li>
                    <li>• Best medical treatments</li>
                    <li>• Mental health guidance</li>
                    <li>• Recovery predictions</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 border border-pink-500/30 mt-8">
                <h3 className="text-xl font-semibold mb-3 text-white">Real Questions Users Ask</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/80">"Will I get married before 30?"</p>
                    <p className="text-white/50 text-xs mt-1">Answered with dasha timing</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/80">"Should I quit my job now?"</p>
                    <p className="text-white/50 text-xs mt-1">Career transition analysis</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/80">"When will my financial problems end?"</p>
                    <p className="text-white/50 text-xs mt-1">Wealth period predictions</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/80">"Is this relationship right for me?"</p>
                    <p className="text-white/50 text-xs mt-1">Compatibility analysis</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Link 
                  to="/free-ai-astrologer-chat" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Ask 1 Free Question to AI Astrologer
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Cluster Blog Cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Explore AI Astrology Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Is AI Astrology Accurate?",
                  desc: "Discover the accuracy of AI-powered Vedic predictions and how they compare to traditional astrology.",
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  link: "/blog/is-ai-astrology-accurate"
                },
                {
                  title: "AI Astrology: Fake or Real?",
                  desc: "Uncover the truth about AI astrology and distinguish between genuine insights and myths.",
                  icon: <Shield className="w-6 h-6" />,
                  link: "/blog/ai-astrology-real-or-fake"
                },
                {
                  title: "AI Jyotish — Vedic Meets AI",
                  desc: "Learn how artificial intelligence is revolutionizing traditional Vedic Jyotish practices.",
                  icon: <Star className="w-6 h-6" />,
                  link: "/blog/ai-jyotish-vedic-astrology"
                },
                {
                  title: "AI Astrologer vs Human",
                  desc: "Compare AI astrologers with traditional human astrologers and understand their strengths.",
                  icon: <MessageSquare className="w-6 h-6" />,
                  link: "/blog/ai-astrologer-vs-human-astrologer"
                },
                {
                  title: "How AI Transforms Vedic Astrology",
                  desc: "Explore the revolutionary impact of AI on ancient Vedic astrology practices and predictions.",
                  icon: <TrendingUp className="w-6 h-6" />,
                  link: "/blog/how-ai-is-transforming-vedic-astrology"
                },
                {
                  title: "Why ChatGPT Fails at AI Astrology",
                  desc: "Understand why general AI models struggle with Vedic astrology and what makes specialized AI better.",
                  icon: <Shield className="w-6 h-6" />,
                  link: "/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt"
                },
                {
                  title: "ChatGPT Astrology",
                  desc: "Ask Vedika in a ChatGPT-style astrology interface powered by your Vedic birth chart.",
                  icon: <MessageSquare className="w-6 h-6" />,
                  link: "/chatgpt-astrology"
                },
                {
                  title: "AI Astrology Predictions for 2026",
                  desc: "Get AI-powered predictions and insights for the year 2026 based on Vedic astrology principles.",
                  icon: <Target className="w-6 h-6" />,
                  link: "/blog/ai-astrology-prediction-for-2026"
                }
              ].map((blog, i) => (
                <Link key={i} to={blog.link} className="block group">
                  <Card className="card-glass rounded-2xl p-6 h-full hover:border-pink-500/30 transition-all group-hover:transform group-hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg btn-pink flex items-center justify-center text-white">
                        {blog.icon}
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-pink-400 transition-colors">
                        {blog.title}
                      </h3>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                      {blog.desc}
                    </p>
                    <div className="flex items-center gap-2 text-pink-400 text-sm font-medium">
                      Read More <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Future of AI Astrology */}
        <section id="future" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Future of AI Astrology</h2>
            <div className="card-glass rounded-3xl p-8">
              <div className="space-y-6 text-white/70 leading-relaxed">
                <p>
                  <strong>AI astrology evolution</strong> is just beginning. As technology advances, we're seeing incredible developments in how artificial intelligence can enhance ancient Vedic wisdom.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold mb-3 text-white">Coming Soon</h3>
                    <ul className="space-y-2">
                      <li>• <strong>Voice-based consultations</strong> - Talk to AI in Hindi/English</li>
                      <li>• <strong>Real-time predictions</strong> - Live dasha tracking</li>
                      <li>• <strong>AR kundali visualization</strong> - 3D chart displays</li>
                      <li>• <strong>Personalized remedial suggestions</strong> - AI-generated pujas</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold mb-3 text-white">Long-term Vision</h3>
                    <ul className="space-y-2">
                      <li>• <strong>Quantum computing integration</strong> - Instant complex calculations</li>
                      <li>• <strong>Cross-cultural astrology</strong> - Vedic + Western synthesis</li>
                      <li>• <strong>Predictive health alerts</strong> - Astro-based wellness</li>
                      <li>• <strong>Global astrological network</strong> - Shared insights database</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold mb-3 text-white">Industry Impact</h3>
                  <p className="mb-4">AI astrology is revolutionizing how people access spiritual guidance:</p>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">3.2M+</div>
                      <div className="text-sm text-white/60">AI consultations in 2025</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">78%</div>
                      <div className="text-sm text-white/60">User satisfaction rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-400">92%</div>
                      <div className="text-sm text-white/60">Accuracy in timing predictions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced FAQ Section */}
        <section id="faq" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Is AI astrology accurate?",
                  a: "Yes, AI astrology can be quite accurate when it follows authentic Vedic principles. It analyzes your exact birth details using traditional astrological knowledge to give you personalized predictions that actually relate to your life. Our accuracy rate is 87-94% depending on the prediction type."
                },
                {
                  q: "Is AI astrology real or fake?",
                  a: "AI astrology is real when it's based on genuine Vedic knowledge. Unlike generic horoscopes that apply to everyone, it looks at your specific birth chart and uses proper astrological principles to give you insights that matter to you. The technology just makes authentic astrology more accessible."
                },
                {
                  q: "Which AI is best for astrology?",
                  a: "The best AI for astrology combines real Vedic knowledge with accurate calculations. Look for systems that are trained on authentic astrological texts and can give you specific, personalized answers rather than vague predictions. Our Vedika AI is specifically trained on Parashari system."
                },
                {
                  q: "Is AI astrology free?",
                  a: "Yes, you can try AI astrology for free at Veadicastro. You can get your birth chart analyzed and ask questions without paying. No signup needed for your first reading - just instant access to genuine Vedic insights. Premium features available for detailed analysis."
                },
                {
                  q: "Can AI predict marriage timing?",
                  a: "Yes, AI can predict marriage timing by analyzing your 7th house, Jupiter position, and dasha periods. Our AI considers multiple factors like planetary aspects, transits, and compatibility to give accurate marriage timing predictions."
                },
                {
                  q: "Is AI kundli reliable?",
                  a: "AI-generated kundalis are highly reliable when using authentic Vedic calculations. Our system follows traditional methods for planetary positions, house calculations, and dasha periods. The accuracy depends on correct birth data - same as traditional astrology."
                },
                {
                  q: "What's the difference between free vs paid AI astrology?",
                  a: "Free AI astrology gives you basic kundali analysis and limited questions. Paid versions offer detailed predictions, unlimited questions, personalized remedies, and priority support. Both use the same authentic Vedic principles - just different depth of analysis."
                },
                {
                  q: "Can AI astrology replace human astrologers?",
                  a: "AI astrology complements rather than replaces human astrologers. AI offers speed, consistency, and privacy, while human astrologers provide intuition and personal connection. Many users use both - AI for quick questions, humans for detailed consultations."
                }
              ].map((faq, i) => (
                <div key={i} className="card-glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-3 text-pink-400">{faq.q}</h3>
                  <p className="text-white/70 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet Vedika AI Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-glass rounded-3xl p-8">
              <h2 className="text-3xl font-bold mb-4 text-center">Meet Vedika AI — Your Personal Vedic Astrologer</h2>
              <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                  <img src="/optimized/vedika.webp" alt="Vedika — AI Vedic astrologer" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-lg text-white/70 leading-relaxed mb-4">
                    Vedika AI by Veadicastro is not a generic chatbot. She is trained specifically on Vedic astrology — Parashari system, Ashtakoot matching, Dasha calculations, and more.
                  </p>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-semibold mb-2 text-white">What You'll Get with Veadicastro's Vedika AI:</h3>
                    <ul className="space-y-1 text-white/70 text-sm">
                      <li>• Ask about breakup recovery & timing</li>
                      <li>• Get exact dasha-based predictions</li>
                      <li>• Career change guidance with timing</li>
                      <li>• Marriage compatibility analysis</li>
                      <li>• No generic answers like daily horoscope</li>
                      <li>• Personalized remedies based on your chart</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Link 
                  to="/blog/vedika-ai-astrologer-india" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Learn More About Vedika AI →
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Veadicastro Store Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="card-glass rounded-3xl overflow-hidden border border-pink-500/20">
              <div className="grid md:grid-cols-[0.95fr_1.35fr]">
                <div className="min-h-[260px] bg-black/20">
                  <img
                    src="/store/dhan-yog-second-image.webp"
                    alt="Dhan Yog money bracelet from Veadicastro Store"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 mb-4">
                    <Star className="w-4 h-4" /> Astrology Remedies Store
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Explore the Dhan Yog Bracelet with Your AI Astrology Reading
                  </h2>
                  <p className="text-white/70 leading-relaxed mb-6">
                    AI astrology gives clarity about your chart, dasha, career, money,
                    and timing. For people who also want a daily spiritual remedy,
                    Veadicastro Store offers the Dhan Yog Bracelet made with Tiger Eye,
                    Pyrite, Citrine, and Aventurine. Each piece is quality checked,
                    prepared with proper puja intention, and delivered across India.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm text-white/70">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <Shield className="w-4 h-4 text-green-400 mb-2" />
                      Authentic stone quality
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 mb-2" />
                      Puja energized product
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <TrendingUp className="w-4 h-4 text-yellow-400 mb-2" />
                      Daily prosperity intention
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/dhan-yog-bracelet"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
                    >
                      Buy Dhan Yog Bracelet <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/astrology-store"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/15 text-white font-semibold rounded-xl hover:border-pink-500/40 hover:text-pink-300 transition-colors"
                    >
                      Visit Astrology Store
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-glass rounded-3xl p-8">
              <h2 className="text-3xl font-bold mb-4">Check Your Marriage Timing Now</h2>
              <p className="text-white/60 mb-6 max-w-2xl mx-auto">
                Get Your Free AI Kundali in 30 Seconds. Limited free questions per day - ask about marriage, career, or life predictions today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/free-5-minutes-astrology-ai" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Free 5-Minutes Astrology
                  <Zap className="w-4 h-4" />
                </Link>
                <Link
                  to="/ai-marriage-prediction-by-date-of-birth"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-full hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Check Marriage Timing
                  <Heart className="w-4 h-4" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-full hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  See Your Future in Just 30 Second
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* AdSense Ad - Below Content */}
      <div className="flex justify-center my-6">
        <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
      </div>
    </>
  );
}
