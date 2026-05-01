import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Footer from "../src/components/Footer";

const JobVsBusinessWhatYourChartSay = () => {
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
      q: "Which house in the birth chart decides between job and business?",
      a: "The 10th house is the main career house, but the job vs business answer comes from analyzing multiple houses together. The 7th house for business, 6th house for job, and their connections with the 10th house give the complete picture.",
    },
    {
      q: "Can I have both job and business indications in my chart?",
      a: "Yes, many charts show both tendencies. If your chart has strong 6th house and 7th house placements, you might thrive in a hybrid approach - starting with a job while building a business on the side, then transitioning fully when the timing is right.",
    },
    {
      q: "What if my chart shows business but I'm currently in a job?",
      a: "Timing matters greatly in Vedic astrology. You might have a business chart but be running a job-supporting dasha period. Check your current dasha - if it's ruled by your 6th lord, focusing on your job now might actually give better results until your business dasha begins.",
    },
    {
      q: "How important is Saturn in career decisions?",
      a: "Saturn is extremely important. Saturn in the 6th house is excellent for jobs, Saturn in the 7th gives business ability but with delays, and Saturn in the 10th gives career authority through slow, steady effort. Saturn's placement often determines whether you'll succeed faster in job or business.",
    },
    {
      q: "Does my zodiac sign determine if I should do job or business?",
      a: "Fire signs (Aries, Leo, Sagittarius) naturally lean toward entrepreneurship with their boldness. Earth signs (Taurus, Virgo, Capricorn) often prefer stability but can succeed in business with other supporting factors. Air signs excel in communication-based businesses, while water signs build businesses around creative or healing fields. But always check your full chart, not just the sun sign.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Job vs Business — What Your Vedic Birth Chart Really Says (2026)</title>
        <meta
          name="description"
          content="Confused between job and business? Your Vedic birth chart holds the answer. Learn how 10th house, 7th house, 6th house, and planetary placements reveal your true career path according to Vedic astrology."
        />
        <link rel="canonical" href="https://veadicastro.in/blog/job-vs-business-what-your-chart-say" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="theme-color" content="#0a0a0f" />

        <meta property="og:title" content="Job vs Business — What Your Vedic Birth Chart Really Says (2026)" />
        <meta property="og:description" content="Confused between job and business? Your Vedic birth chart holds the answer. Learn how 10th house, 7th house, 6th house, and planetary placements reveal your true career path." />
        <meta property="og:url" content="https://veadicastro.in/blog/job-vs-business-what-your-chart-say" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://veadicastro.in/blog-images/job-vs-business-chart.webp" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Job vs Business — What Your Vedic Birth Chart Really Says (2026)" />
        <meta name="twitter:description" content="Confused between job and business? Your Vedic birth chart holds the answer. Learn how houses and planets reveal your career path." />
        <meta name="twitter:image" content="https://veadicastro.in/blog-images/job-vs-business-chart.webp" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://veadicastro.in" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://veadicastro.in/blog" },
              { "@type": "ListItem", position: 3, name: "Job vs Business — What Your Vedic Birth Chart Really Says" },
            ],
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: "Job vs Business — What Your Vedic Birth Chart Really Says",
            description: "A complete guide to understanding job vs business indications in your Vedic birth chart. Learn about the 10th house, 7th house, 6th house, planetary placements, and timing through dasha system.",
            image: "https://veadicastro.in/blog-images/job-vs-business-chart.webp",
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
            datePublished: "2026-04-09",
            dateModified: "2026-04-09",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://veadicastro.in/blog/job-vs-business-what-your-chart-say",
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
                src="/blog-images/job-vs-business-chart.webp"
                alt="Job vs Business — What Your Vedic Birth Chart Really Says"
                width={800}
                height={450}
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl mb-10"
                fetchPriority="high"
              />
              <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/40 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-6">
                Career Astrology · Vedic Wisdom · Birth Chart Analysis
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Job vs Business — What Your Vedic Birth Chart Really Says
              </h1>
              <p className="text-lg text-purple-200 mb-8 leading-relaxed max-w-2xl mx-auto">
                So you're sitting there confused. Job karo ya business? Everyone has an opinion. Your parents say job is safe. Your friend says business is the future. But honestly, your birth chart was always trying to tell you the answer. Our advanced <Link to="/ai-astrology" className="text-purple-400 hover:text-purple-300 underline">AI astrology platform</Link> can help you decode these cosmic signals for your career path.
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-400">
                <span>By Arpit Uniyal</span>
                <span>·</span>
                <span>April 9, 2026</span>
                <span>·</span>
                <span>20 min read</span>
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
                <a href="#start-with-10th-house" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Start With the 10th House</a>
                <a href="#7th-house-business" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• The 7th House is More Important Than You Think</a>
                <a href="#6th-house-job" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Now Add the 6th House to the Picture</a>
                <a href="#2nd-11th-houses-money" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• What About the 2nd and 11th Houses</a>
                <a href="#lagna-personality" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• The Lagna and Lagna Lord — Your Personality Decides a Lot</a>
                <a href="#saturn-role" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Saturn's Role Is Underrated</a>
                <a href="#rahu-unconventional" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Rahu in the Chart — The Unconventional Signal</a>
                <a href="#jupiter-business" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Jupiter Gives the Clearest Business Blessing</a>
                <a href="#dasha-timing" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• The Dasha System — Timing Is Everything</a>
                <a href="#real-combinations" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• Real Combinations to Look For</a>
                <a href="#both-indications" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• But What If Your Chart Shows Both</a>
                <a href="#honest-truth" className="block text-gray-400 hover:text-gray-300 transition-colors py-1">• The Honest Truth About Using This</a>
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
                I've been looking at charts for a while now and one thing I can tell you for sure — some people are just not built for jobs. Doesn't matter how good their degree is. They will always feel trapped, underpaid, or undervalued in someone else's system. And some people, no matter how exciting their business idea sounds, they need structure around them to actually perform. The chart shows this clearly.
              </p>
              <p className="leading-relaxed">
                Let me break it down in simple terms.
              </p>
            </section>

            {/* 10TH HOUSE */}
            <section id="start-with-10th-house">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Start With the 10th House</h2>
              <p className="mb-4 leading-relaxed">
                The 10th house is your career house. Simple. Whatever sign is there, whatever planet sits there or rules it — that gives you the flavour of your professional life. But here's the thing most people miss. The 10th house doesn't directly say job or business. It tells you what kind of work suits you. The job vs business answer comes from other houses working together with the 10th.
              </p>
              <p className="leading-relaxed">
                So don't just look at the 10th and stop there. That's like reading only the first page of a book.
              </p>
            </section>

            {/* 7TH HOUSE */}
            <section id="7th-house-business">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">The 7th House is More Important Than You Think</h2>
              <p className="mb-4 leading-relaxed">
                Most people think the 7th house is only about marriage. And yes, it is the marriage house. But in Vedic astrology the 7th house also rules business partnerships, trade, and dealing with the public. So if your 7th house is strong — good planet sitting there, or the 7th lord is well placed — there's a strong signal that business is in your cards.
              </p>
              <p className="leading-relaxed">
                Especially if the 7th lord is connected to the 10th lord. That combination is one of the clearest business yogas in a chart. Two career-related houses talking to each other through their lords — that's not a coincidence.
              </p>
            </section>

            {/* 6TH HOUSE */}
            <section id="6th-house-job">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Now Add the 6th House to the Picture</h2>
              <p className="mb-4 leading-relaxed">
                The 6th house is where job energy lives. Service, routine, working under someone, daily discipline — all 6th house stuff. If your 6th house is strong and active, and especially if the 6th lord is connected to your 10th house or lagna, then honestly a job suits you more than you'd like to admit.
              </p>
              <p className="mb-4 leading-relaxed">
                People with strong 6th house placements — like Saturn or Mercury sitting there comfortably — they actually do really well in structured environments. They're good at systems, processes, following rules, meeting deadlines. These are job skills. And there's nothing wrong with that. A strong 6th house person who forces themselves into business often struggles because they're fighting their own chart.
              </p>
            </section>

            {/* 2ND AND 11TH HOUSES */}
            <section id="2nd-11th-houses-money">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">What About the 2nd and 11th Houses</h2>
              <p className="mb-4 leading-relaxed">
                These two are your money houses. The 2nd house is accumulated wealth — your savings, family money, what you hold onto. The 11th house is income, gains, and fulfillment of desires. Both need to be checked whether you're in job or business.
              </p>
              <p className="mb-4 leading-relaxed">
                But here's the specific thing to look for. In business charts, the 2nd and 11th lords are often connected to the 7th lord or the 10th lord. The money is flowing through independent channels. In job charts, the 2nd and 11th lords tend to connect more with the 6th lord — income coming through service.
              </p>
              <p className="leading-relaxed">
                It sounds technical but once you see it a few times in real charts it becomes obvious.
              </p>
            </section>

            {/* LAGNA */}
            <section id="lagna-personality">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">The Lagna and Lagna Lord — Your Personality Decides a Lot</h2>
              <p className="mb-4 leading-relaxed">
                Your ascendant or lagna is basically you. Your personality, your approach to life, how you handle pressure and uncertainty. This matters a lot in the job vs business question because business requires a specific kind of personality. You need to handle rejection, uncertainty, slow months, difficult clients, zero income phases. Not everyone is wired for that.
              </p>
              <p className="mb-4 leading-relaxed">
                Fire sign lagnas — Aries, Leo, Sagittarius — tend to have that entrepreneurial boldness. They take risks more naturally. Earth sign lagnas — Taurus, Virgo, Capricorn — are more stable and disciplined which can go either way, but they often prefer security unless other factors push them toward business. Air signs can be very good at business that involves communication, networking, ideas. Water signs are intuitive and sometimes build incredibly successful businesses around creative or healing fields.
              </p>
              <p className="leading-relaxed">
                But please don't just look at your lagna sign and decide. The lagna lord's placement matters equally. If your lagna lord is sitting in the 7th house, that's your personality literally merging with the business house. Strong signal.
              </p>
            </section>

            {/* SATURN */}
            <section id="saturn-role">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Saturn's Role Is Underrated</h2>
              <p className="mb-4 leading-relaxed">
                Saturn is the planet of hard work, discipline, service, and karma. In career readings Saturn is extremely important. Where Saturn sits and what it aspects tells you a lot about the nature of your work life.
              </p>
              <p className="mb-4 leading-relaxed">
                Saturn in the 7th house or aspecting the 7th can give business ability but it also gives delays and heavy responsibility in partnerships. Business will happen but it won't be easy or fast. Saturn in the 6th is actually quite good for job environments — this person is a hard worker, reliable, and climbs steadily in organizations. Saturn in the 10th gives career authority but through long, slow, consistent effort — works for both job and business but success comes late.
              </p>
              <p className="leading-relaxed">
                One important thing about Saturn — if Saturn is your 10th lord and it's well placed, business in traditional or service-based industries can work very well. Think consulting, law, construction, government-adjacent work, structured services.
              </p>
            </section>

            {/* RAHU */}
            <section id="rahu-unconventional">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Rahu in the Chart — The Unconventional Signal</h2>
              <p className="mb-4 leading-relaxed">
                Rahu is the planet of obsession, ambition, foreign things, and breaking rules. Rahu doesn't do well in traditional job setups for most people. If Rahu is sitting in your 10th house or is the 10th lord's dispositor, there's almost always a pull toward unconventional careers. Startups, digital businesses, foreign collaborations, something outside the normal 9-to-5 box.
              </p>
              <p className="mb-4 leading-relaxed">
                Rahu in the 7th house often creates business partnerships with people from different backgrounds. Rahu in the 11th gives massive income potential through networks — but through irregular, non-salary channels. These are business placements more than job placements.
              </p>
              <p className="leading-relaxed">
                If Rahu is heavily involved in your career houses and you're sitting in a regular job feeling restless and underutilized — that's your chart speaking.
              </p>
            </section>

            {/* JUPITER */}
            <section id="jupiter-business">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Jupiter Gives the Clearest Business Blessing</h2>
              <p className="mb-4 leading-relaxed">
                In Vedic astrology Jupiter is the planet of expansion, wisdom, abundance, and dharma. When Jupiter aspects the 7th house, 10th house, or 2nd house — and especially when Jupiter is the 10th lord or 7th lord — business can flourish in a meaningful way. Jupiter-ruled businesses often involve education, consulting, finance, law, spiritual services, or anything where knowledge is the product.
              </p>
              <p className="leading-relaxed">
                Jupiter in the 11th house is considered one of the best placements for financial gains through independent work. This person earns well when they operate on their own terms. Putting them in a rigid job environment often underutilizes them.
              </p>
            </section>

            {/* DASHA SYSTEM */}
            <section id="dasha-timing">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">The Dasha System — Timing Is Everything</h2>
              <p className="mb-4 leading-relaxed">
                Here's something people miss completely. You might have a business chart but if you're running a job-supporting dasha period, business will struggle. And vice versa. The dasha system tells you when each planet gets activated and influences your life.
              </p>
              <p className="mb-4 leading-relaxed">
                If you're running the dasha of your 7th lord or 10th lord and both are connected — that's a period where starting a business makes sense. If you're running the dasha of your 6th lord — joining or focusing on a job during that period often gives better results even if you're a business person by nature.
              </p>
              <p className="leading-relaxed">
                This is why two people with similar charts can have different outcomes at different ages. Timing in Vedic astrology is everything. A good idea at the wrong dasha period will still struggle.
              </p>
            </section>

            {/* REAL COMBINATIONS */}
            <section id="real-combinations">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Real Combinations to Look For</h2>
              <p className="mb-4 leading-relaxed">
                Business is strongly indicated when the 7th and 10th lords are connected, when Rahu is in the 10th or 7th house, when Jupiter aspects the 7th house, when the lagna lord is in the 7th house, and when the 2nd and 11th lords connect with the 7th lord. These aren't rules — they're patterns that show up repeatedly in successful entrepreneur charts.
              </p>
              <p className="leading-relaxed">
                Job is more naturally suited when the 6th house is strong with benefic planets, when Saturn rules and aspects the 10th house, when the 6th and 10th lords are connected, when the lagna lord is in the 6th house, and when Moon is strong in stable signs like Taurus or Capricorn giving a preference for security and routine.
              </p>
            </section>

            {/* BOTH INDICATIONS */}
            <section id="both-indications">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">But What If Your Chart Shows Both</h2>
              <p className="mb-4 leading-relaxed">
                Many charts do. And many people successfully do both — they hold a job while building something on the side, then transition fully when the timing is right. If your chart shows a mix of 6th house strength and 7th house strength, that hybrid path might actually be what works best for you. Don't force an either-or decision when your chart is saying both.
              </p>
            </section>

            {/* HONEST TRUTH */}
            <section id="honest-truth">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">The Honest Truth About Using This</h2>
              <p className="mb-4 leading-relaxed">
                Vedic astrology won't make your business succeed or guarantee your job stability. What it does is show you your natural tendencies, your strengths, your timing, and your patterns. A person with a great business chart still needs to do the work. But knowing you're in a business-supportive dasha while also having the right planetary combinations — that kind of clarity can save you years of confusion.
              </p>
              <p className="leading-relaxed">
                If you want to check your own chart for these combinations, the most important things to look at are your 6th house, 7th house, and 10th house — plus their lords and where they're sitting. Check if Rahu or Jupiter are involved in these houses. And check what dasha period you're currently running.
              </p>
              <p className="leading-relaxed">
                That combination will tell you more about the job vs business question than any career counselor or well-meaning relative ever could.
              </p>
            </section>

            {/* RELATED BLOGS */}
            <section id="related-blogs">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-600/50 transition-all">
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    <Link to="/blog/best-careers-for-each-zodiac-sign-in-2026" className="hover:text-purple-400 transition-colors">
                      Best Careers for Each Zodiac Sign in 2026
                    </Link>
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Discover the best career paths for your zodiac sign. Find out which profession aligns with your stars — from Aries to Pisces.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-600/50 transition-all">
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    <Link to="/blog/manglik-dosha-myths-vs-reality" className="hover:text-purple-400 transition-colors">
                      Manglik Dosha — Myths vs Reality
                    </Link>
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Separate fact from fiction about Manglik Dosha. Understand what it really means in Vedic astrology and its impact on your career.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-600/50 transition-all">
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    <Link to="/blog/how-ai-is-transforming-vedic-astrology" className="hover:text-purple-400 transition-colors">
                      How AI is Transforming Vedic Astrology
                    </Link>
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Discover how Artificial Intelligence is revolutionizing Vedic astrology and career guidance in the modern era.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-600/50 transition-all">
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    <Link to="/blog/vedic-vs-western-astrology" className="hover:text-purple-400 transition-colors">
                      Vedic vs Western Astrology
                    </Link>
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Understand the key differences between Vedic and Western astrology approaches to career and life predictions.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-600/50 transition-all">
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    <Link to="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" className="hover:text-purple-400 transition-colors">
                      Yearly Horoscope 2026
                    </Link>
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Complete Vedic Jyotish predictions for all 12 rashis in 2026 to plan your career moves.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-600/50 transition-all">
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    <Link to="/blog/online-jyotishi-vs-ai-astrologer" className="hover:text-purple-400 transition-colors">
                      Online Jyotishi vs AI Astrologer
                    </Link>
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Compare traditional astrologers with AI-powered career guidance to make informed decisions.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq">
              <h2 className="text-3xl font-bold text-gray-300 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqsData.map((faq, index) => (
                  <div key={index} className="bg-gray-900/30 border border-gray-700/30 rounded-lg overflow-hidden">
                    <button
                      className="w-full text-left text-gray-300 font-medium p-4 hover:bg-gray-800/50 transition-colors flex justify-between items-center"
                      aria-expanded={openFaq === index}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="flex-1 pr-4">{faq.q}</span>
                      <span className="text-purple-400 text-xl font-light">
                        {openFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    {openFaq === index && (
                      <div id={`faq-answer-${index}`} className="px-4 pb-4 text-gray-400 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobVsBusinessWhatYourChartSay;