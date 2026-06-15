import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Footer from "../../src/components/Footer";

const AiJyotishVedicAstrology = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tocOpen, setTocOpen] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // FAQs data defined outside component to prevent SSR issues
  const faqsData = [
    {
      q: "What is AI jyotish and how does it work?",
      a: "AI jyotish combines traditional Vedic astrology calculation methods with artificial intelligence to interpret your birth chart. It calculates your actual kundali using proper Jyotish principles and then uses AI to provide personalized readings based on your specific planetary positions, dashas, and transits.",
    },
    {
      q: "Is AI jyotish as accurate as traditional astrologers?",
      a: "AI jyotish excels in consistency, thoroughness, and availability. While master Jyotishis bring unique intuition and experience, well-built AI systems provide accurate chart-based readings without human bias or fatigue. For most practical questions, AI jyotish delivers reliable guidance rooted in authentic Vedic principles.",
    },
    {
      q: "Can AI jyotish predict my future accurately?",
      a: "AI jyotish analyzes your birth chart and current planetary periods to provide insights about life patterns and tendencies. Like traditional astrology, it offers guidance rather than deterministic predictions. The accuracy comes from proper chart calculation and interpretation of dashas, transits, and planetary combinations affecting your life.",
    },
    {
      q: "How is VeadicAstro's AI jyotish different from other astrology apps?",
      a: "VeadicAstro generates your actual Vedic birth chart using traditional calculation methods, then applies AI interpretation. Unlike generic horoscope apps, it considers your specific Lagna, Nakshatras, dasha periods, and house placements to provide personalized readings based on authentic Jyotish principles.",
    },
    {
      q: "Is AI jyotish suitable for serious life decisions?",
      a: "AI jyotish is excellent for gaining insights into career timing, relationship compatibility, and understanding current life phases. For major life decisions, it provides valuable chart-based guidance that you can use alongside your own judgment. Many users find it particularly helpful for understanding dasha periods and transit effects.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence</title>
        <meta
          name="description"
          content="Discover how AI jyotish is revolutionizing Vedic astrology. Learn about authentic vedic astrology ai that combines traditional Jyotish principles with artificial intelligence for accurate personalized readings."
        />
        <link rel="canonical" href="https://veadicastro.in/blog/ai-jyotish-vedic-astrology" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="theme-color" content="#0a0a0f" />

        <meta property="og:title" content="AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence" />
        <meta property="og:description" content="Discover how AI jyotish is transforming Vedic astrology. Authentic vedic astrology ai combining traditional Jyotish principles with modern AI technology." />
        <meta property="og:url" content="https://veadicastro.in/blog/ai-jyotish-vedic-astrology" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://veadicastro.in/Ai-Astrology-image/ai-jyotish-vedic-astrology.webp" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence" />
        <meta name="twitter:description" content="Learn how AI jyotish combines authentic Vedic astrology with artificial intelligence for accurate, personalized readings." />
        <meta name="twitter:image" content="https://veadicastro.in/Ai-Astrology-image/ai-jyotish-vedic-astrology.webp" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://veadicastro.in" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://veadicastro.in/blog" },
              { "@type": "ListItem", position: 3, name: "AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence" },
            ],
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: "AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence",
            description: "Discover how AI jyotish is revolutionizing Vedic astrology. Learn about authentic vedic astrology ai that combines traditional Jyotish principles with artificial intelligence for accurate personalized readings.",
            image: "https://veadicastro.in/Ai-Astrology-image/ai-jyotish-vedic-astrology.webp",
            author: {
              "@type": "Person",
              name: "Arpit Uniyal",
              url: "https://veadicastro.in/about",
            },
            publisher: {
              "@type": "Organization",
              name: "VeadicAstro",
              logo: { "@type": "ImageObject", url: "https://veadicastro.in/logo.webp" },
            },
            datePublished: "2026-04-11",
            dateModified: "2026-04-11",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://veadicastro.in/blog/ai-jyotish-vedic-astrology",
            },
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqsData.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">

        {/* HERO */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
          <div className="relative container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <img
                src="/Ai-Astrology-image/ai-jyotish-vedic-astrology.webp"
                alt="AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence"
                width={800}
                height={450}
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl mb-10"
                fetchPriority="high"
              />
              <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/40 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-6">
                AI Jyotish · Vedic Astrology · Artificial Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence
              </h1>
              <p className="text-lg text-purple-200 mb-8 leading-relaxed max-w-2xl mx-auto">
                There's a moment most people have — usually during a tough phase in life — where they think, "let me just get my kundali read." Maybe it's a career decision that feels stuck. Maybe a relationship that's not making sense. Maybe just a general feeling that something is off and you can't explain why.
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-400">
                <span>By Arpit Uniyal</span>
                <span>·</span>
                <span>April 11, 2026</span>
                <span>·</span>
                <span>15 min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE OF CONTENTS */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-300">Table of Contents</h2>
                <button 
                  className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
                  onClick={() => setTocOpen(!tocOpen)}
                >
                  {tocOpen ? 'Hide' : 'Show'} Contents
                </button>
              </div>
              <nav id="table-of-contents" className={`space-y-2 ${tocOpen ? '' : 'hidden'}`}>
                <a href="#what-is-jyotish" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• What is Jyotish?</a>
                <a href="#how-ai-is-used-in-jyotish-today" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• How AI is Used in Jyotish Today</a>
                <a href="#benefits-of-ai-jyotish-over-traditional" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Benefits of AI Jyotish Over Traditional</a>
                <a href="#vedicastro-indias-ai-jyotish-platform" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• VeadicAstro — India's AI Jyotish Platform</a>
                <a href="#faq" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Frequently Asked Questions</a>
              </nav>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-8 text-gray-300">

            {/* INTRO */}
            <section>
              <p className="mb-4 text-lg leading-relaxed">
                For thousands of years, that meant sitting across from a Jyotishi — someone who had spent decades learning the science of light, an ancient system we now call Jyotish. But in 2026, something interesting is happening. AI jyotish is becoming real. Not in a gimmicky chatbot way, but in a way that's actually rooted in the same Vedic principles that have existed for centuries.
              </p>
              <p className="leading-relaxed">
                Our advanced <Link to="/ai-astrology" className="text-purple-400 hover:text-purple-300 underline">AI astrology platform</Link> represents this fusion, bringing authentic Jyotish principles to modern technology. Let's talk about what that actually means.
              </p>
            </section>

            {/* WHAT IS JYOTISH */}
            <section id="what-is-jyotish">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">What is Jyotish?</h2>
              <p className="mb-4 leading-relaxed">
                Jyotish — which literally translates to "science of light" in Sanskrit — is one of the oldest systems of astrology in the world. It's part of the Vedanga, meaning it's one of six limbs of the Vedas. So this isn't astrology as entertainment. Jyotish was developed as a serious tool for understanding the rhythm of life, time, and karma.
              </p>
              <p className="mb-4 leading-relaxed">
                What makes Jyotish different from Western astrology is the depth of the system. It uses the sidereal zodiac — meaning it tracks where planets actually are in the sky, not a fixed seasonal position. It works with 27 Nakshatras (lunar mansions), a highly specific Ascendant (Lagna) calculation, 12 houses, nine planets including shadow planets Rahu and Ketu, and a time-period system called Dashas that can map out major life phases with striking accuracy.
              </p>
              <p className="mb-4 leading-relaxed">
                An experienced Jyotishi doesn't just read where your Sun is. They read the entire chart as a living document — your Lagna lord, your Atmakaraka, how your 7th house interacts with Venus, what your current Mahadasha is activating. It's layered, complex, and genuinely takes years to learn well.
              </p>
              <p className="mb-4 leading-relaxed">
                What's changed recently is that large language models have gotten good enough to actually reason about astrological rules. Modern AI jyotish systems can now do things like:
              </p>
              <p className="mb-4 leading-relaxed">
                Read a full birth chart and identify dominant themes - which houses are strong, which planets are well-placed, what the overall chart "signature" suggests about a person's tendencies. As we explore <Link to="/blog/is-ai-astrology-accurate" className="text-purple-400 underline">is AI astrology accurate</Link>, we find that these systems can track patterns across millions of charts.
              </p>
              <p className="mb-4 leading-relaxed">
                Track current Dasha-Antardasha period and explain what planetary energy is active right now in your life, and how long it lasts. This is where <Link to="/blog/ai-astrologer-vs-human-astrologer" className="text-purple-400 underline">AI astrologer</Link> platforms excel at providing consistent analysis.
              </p>
              <p className="mb-4 leading-relaxed">
                Factor in planetary transits - where planets are moving through the sky today - and cross-reference that against your natal chart to explain why a certain time period feels the way it does. This is what <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="text-purple-400 underline">AI is transforming Vedic astrology</Link> by making complex calculations accessible.
              </p>
              <p className="mb-4 leading-relaxed">
                Answer follow-up questions. This is a big one. Static reports can't do this. If you read a PDF that says "Saturn in your 7th house delays marriage," you might have ten follow-up questions. An AI jyotish system can actually hold that conversation, much like an <Link to="/blog/online-jyotishi-vs-ai-astrologer" className="text-purple-400 underline">Online Jyotishi vs AI astrologer</Link> comparison.
              </p>
              <p className="leading-relaxed">
                The better platforms aren't using AI to replace chart calculation - they're using proper Vedic software for that, and then using AI to interpret and communicate what the chart says. That combination is what makes it genuinely useful.
              </p>
            </section>

            {/* BENEFITS OF AI JYOTISH OVER TRADITIONAL */}
            <section id="benefits-of-ai-jyotish-over-traditional">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Benefits of AI Jyotish Over Traditional</h2>
              <p className="mb-4 leading-relaxed">
                This isn't about saying AI is better than a master Jyotishi. It's not. A truly experienced astrologer with decades of practice can pick up things in a chart that no current AI system can replicate. That level of expertise is rare and valuable.
              </p>
              <p className="mb-4 leading-relaxed">
                But here's the honest reality most people don't say out loud:
              </p>
              <p className="mb-4 leading-relaxed">
                Most people don't have access to that level of expertise. The best Jyotishis are expensive, often booked weeks in advance, and experience varies wildly. If you go to someone who learned astrology casually, you might get a worse reading than a well-built AI jyotish system. So the comparison isn't really "AI vs. best astrologer in the world." It's "AI vs. what most people actually have access to."
              </p>
              <p className="mb-4 leading-relaxed font-semibold text-purple-300">
                And on that comparison, AI vedic astrology wins in several important ways:
              </p>
              <p className="mb-4 leading-relaxed">
                <strong>Availability.</strong> Your Saturn transit doesn't care that it's 2am. Life questions come up at inconvenient times. An AI jyotish platform is available whenever you need it, without appointments.
              </p>
              <p className="mb-4 leading-relaxed">
                <strong>Consistency.</strong> A human astrologer might be tired, distracted, or rushing through a session. AI reads your chart with the same attention every single time. There are no off days.
              </p>
              <p className="mb-4 leading-relaxed">
                <strong>No judgment.</strong> People hold back questions when they're face-to-face with someone, even an astrologer. Questions about divorce, debt, health fears, things you're embarrassed about. AI doesn't make you feel judged. You can ask anything.
              </p>
              <p className="mb-4 leading-relaxed">
                The integration of artificial intelligence with Vedic astrology represents a significant leap forward in making authentic Jyotish accessible to everyone. Whether you're seeking clarity about your career path, relationships, or spiritual growth, <Link to="/" className="text-purple-400 underline">AI astrology</Link> offers insights that were once available only to those who could afford expensive consultations. A good astrology consultation in India costs anywhere from 500 to 5,000 depending on who you're going to. A platform like <Link to="/" className="text-purple-400 underline">AI astrology platform like VeadicAstro</Link> gives you access to AI-powered Vedic readings starting at just 49. That's not a small thing for a country where millions of people are genuinely interested in astrology but can't afford regular consultations.
              </p>
              <p className="leading-relaxed">
                <strong>Depth of recall.</strong> A human astrologer consults your chart during your session and that's largely it. AI can hold your entire chart in context while answering every question you ask, and trace back to specific planetary factors every time.
              </p>
              <p className="mt-4 leading-relaxed">
                The real benefit of AI jyotish isn't that it's replacing something - it's that it's making something accessible that was previously limited to people with money or the right connections.
              </p>
            </section>

            {/* RELATED ARTICLES */}
            <section className="mt-12">
              <h3 className="text-2xl font-bold text-gray-300 mb-6">Related Articles</h3>
              <div className="space-y-4">
                <Link to="/blog/is-ai-astrology-accurate" className="block text-purple-400 hover:text-purple-300 transition-colors py-2">
                  Is AI Astrology Accurate? We Tested It
                </Link>
                <Link to="/blog/ai-astrologer-vs-human-astrologer" className="block text-purple-400 hover:text-purple-300 transition-colors py-2">
                  AI Astrologer vs Human Astrologer - Which is Better?
                </Link>
                <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="block text-purple-400 hover:text-purple-300 transition-colors py-2">
                  How AI is Transforming Vedic Astrology
                </Link>
                <Link to="/blog/online-jyotishi-vs-ai-astrologer" className="block text-purple-400 hover:text-purple-300 transition-colors py-2">
                  Online Jyotishi vs AI Astrologer - Complete Comparison
                </Link>
                <Link to="/blog/vedic-astrology-ai-kese-kaam-karta-ha" className="block text-purple-400 hover:text-purple-300 transition-colors py-2">
                  Vedic Astrology AI Kaise Kaam Karta Hai? Detailed Guide
                </Link>
                <Link to="/blog/ai-astrology-real-or-fake" className="block text-purple-400 hover:text-purple-300 transition-colors py-2">
                  Is AI Astrology Fake or Real? Here Is What Nobody Is Telling You
                </Link>
              </div>
            </section>

            {/* VEDICASTRO INDIA'S AI JYOTISH PLATFORM */}
            <section id="vedicastro-indias-ai-jyotish-platform">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">VeadicAstro - India's AI Jyotish Platform</h2>
              <p className="mb-4 leading-relaxed">
                VeadicAstro was built with one clear idea: what if anyone in India - regardless of city, budget, or background - could get a proper Vedic astrology reading based on their actual birth chart?
              </p>
              <p className="mb-4 leading-relaxed">
                The platform isn't a generic horoscope site. When you sign up and enter your birth details - date, time, and place - the system generates your full Vedic birth chart using traditional Jyotish calculation methods. This means your actual Lagna, real planetary positions at the time of your birth, your Nakshatra, and your current Dasha period. Nothing templated, nothing generic.
              </p>
              <p className="mb-4 leading-relaxed">
                Vedika, the AI astrologer on the platform, then interprets that chart. When you ask her a question, she's not pulling from a "what does Aries mean" database. She's reading your specific chart in the context of your question and giving you a response grounded in Vedic principles.
              </p>
              <p className="mb-4 leading-relaxed">
                So if you ask "how is this period for my career," she looks at your 10th house, its lord, what dashas are currently running, what transiting planets are touching your career-related houses, and answers from that. If your chart has a strong 6th house with Saturn sitting there, and you're in a Rahu dasha, she'll explain what that combination typically brings and how to navigate it - not just give you a vague "be careful."
              </p>
              <p className="mb-4 leading-relaxed">
                The platform also has an AI Kundali generator, which gives you a structured breakdown of your chart across all major life areas - relationships, finances, career, health, spirituality. This is generated fresh from your chart, not a templated report.
              </p>
              <p className="mb-4 leading-relaxed">
                What makes VeadicAstro's approach to vedic astrology AI different is that the Vedic logic is built into how the AI thinks, not just surface presentation. The difference shows up in the answers - they're grounded, specific, and connected to your actual chart rather than the kind of vague spiritual language that could apply to anyone.
              </p>
              <p className="mb-4 leading-relaxed">
                The platform has crossed 1,100 users across 7 countries, all through organic growth - no paid ads, no promotions. That kind of growth usually means something is working. People are coming back, asking real questions, and finding the answers useful.
              </p>
              <p className="leading-relaxed">
                If you've never had a Vedic reading before, starting on VeadicAstro is genuinely a good entry point. The first few readings are free. You can see how the platform reads your chart, what it picks up about your current phase, and whether it resonates with what you're actually going through.
              </p>
            </section>

            {/* THE BIGGER PICTURE */}
            <section id="the-bigger-picture">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">The Bigger Picture</h2>
              <p className="mb-4 leading-relaxed">
                Jyotish has survived for thousands of years because it works — not in a magical thinking way, but in the sense that a carefully calculated chart, read by someone who knows the system, often reflects real patterns in a person's life with uncomfortable accuracy.
              </p>
              <p className="mb-4 leading-relaxed">
                AI doesn't change what Jyotish is. It changes who can access it.
              </p>
              <p className="mb-4 leading-relaxed">
                That's the real story of AI jyotish in 2026. It's not a replacement for tradition. It's a bridge. One that takes a system that was locked away in Sanskrit texts and expensive consultations and makes it available on your phone, in plain language, based on your actual birth chart.
              </p>
              <p className="leading-relaxed">
                If your grandfather's generation had to travel to a village Jyotishi and hope he was available, and your parents' generation relied on newspaper horoscopes that told everyone the same thing — your generation has something genuinely different. A system that knows your chart, understands the current planetary climate, and can talk to you about it at any hour of the day.
              </p>
              <p className="mt-4 leading-relaxed font-semibold text-purple-300">
                That's not a small thing. That's what AI vedic astrology is becoming.
              </p>
            </section>

            {/* FAQ */}
            <section id="faq" className="mt-12">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqsData.map((faq, index) => (
                  <div key={index} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6">
                    <button
                      className="w-full text-left flex justify-between items-center text-gray-300 hover:text-purple-400 transition-colors"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="font-semibold">{faq.q}</span>
                      <span className="text-purple-400">
                        {openFaq === index ? '−' : '+'}
                      </span>
                    </button>
                    <div className={`mt-4 text-gray-400 leading-relaxed ${openFaq === index ? '' : 'hidden'}`}>
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* Back to AI Astrology Hub */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <Link
              to="/ai-marriage-prediction-by-date-of-birth"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              Marriage timing through AI Jyotish
            </Link>
            <br />
            <Link
              to="/ai-astrology"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
            >
              ← AI Astrology — Complete Guide
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Experience AI Jyotish on VeadicAstro</h2>
              <p className="text-lg text-purple-200 mb-8">
                Get authentic Vedic astrology readings powered by AI. Enter your birth details and discover what your chart reveals about your life path.
              </p>
              <Link
                to="/ai-marriage-prediction-by-date-of-birth"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 mr-3"
              >
                Read Your Marriage Yog
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Try AI Jyotish Free
              </Link>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
};

export default AiJyotishVedicAstrology;
