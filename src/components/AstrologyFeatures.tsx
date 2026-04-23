import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AstrologyFeatures = () => {
  const navigate = useNavigate();
  const { setAuthOpen } = useAuth();

  const handleNavigation = (link: string) => {
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const blogCategories = [
    {
      title: "AI Astrology Insights",
      links: [
        { name: "Is AI Astrology Fake or Real?", path: "/blog/ai-astrology-real-or-fake" },
        { name: "Is AI Astrology Accurate?", path: "/blog/is-ai-astrology-accurate" },
        { name: "AI Jyotish - Vedic Astrology Meets AI", path: "/blog/ai-jyotish-vedic-astrology" },
        { name: "AI Astrologer vs Human Astrologer", path: "/blog/ai-astrologer-vs-human-astrologer" },
        { name: "How AI is Transforming Vedic Astrology", path: "/blog/how-ai-is-transforming-vedic-astrology" },
        { name: "AI Astrology Predictions for 2026", path: "/blog/ai-astrology-prediction-for-2026" },
        { name: "Why ChatGPT Fails at AI Astrology", path: "/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" },
      ]
    },
    {
      title: "Relationship & Marriage",
      links: [
        { name: "Marriage Compatibility by Zodiac", path: "/blog/marriage-compatibility-based-on-your-zodiac-sign" },
        { name: "Marriage Muhurat 2026", path: "/blog/marriage-muurat-2026" },
        { name: "Manglik Dosha Myths vs Reality", path: "/blog/manglik-dosha-myths-vs-reality" },
        { name: "Find Your Perfect Compatibility", path: "/kundali-matching" },
      ]
    },
    {
      title: "Career & Predictions",
      links: [
        { name: "Best Careers for 2026", path: "/blog/best-careers-for-each-zodiac-sign-in-2026" },
        { name: "Job vs Business Analysis", path: "/blog/job-vs-business-what-your-chart-say" },
        { name: "IPL 2026 Winner Prediction", path: "/blog/ipl-2026-winner-prediction-astrology" },
        { name: "Next PM India 2029 Prediction", path: "/blog/next-pm-india-2029-astrology-prediction" },
      ]
    },
    {
      title: "Vedic Wisdom & Transits",
      links: [
        { name: "Rahu Ketu Transit 2026", path: "/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis" },
        { name: "Yearly Horoscope 2026", path: "/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" },
        { name: "Vedic Astrology AI Guide", path: "/blog/vedic-astrology-ai-kese-kaam-karta-ha" },
        { name: "Top 10 Vedic Platforms", path: "/blog/top-10-vedic-astrology-platform" },
      ]
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-secondary/5 to-background border-y border-white/5">
      <div className="container mx-auto max-w-6xl">
        
        {/* SEO Header - Pure Authority */}
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-accent to-gray-400 bg-clip-text text-transparent">
              The Future of Astrology: Talk to the Most Accurate AI Astrologer Online
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of <strong>Vedic Astrology</strong> with Vedika AI. 
            From <strong>AI Kundli analysis</strong> to personalized <strong>AI birth chart readings</strong>, 
            Our Vedika AI model delivers 85% accuracy, whether you're asking complex questions or seeking daily insights
          </p>
        </div>

        
        {/* Content & Blog Links - The SEO Powerhouse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
          <div className="space-y-6 text-muted-foreground">
            <h3 className="text-2xl font-semibold text-white">Why Veadicastro Dominates AI Astrology?</h3>
            <p>
              Unlike generic <strong>ChatGPT astrology</strong>, our engine is fine-tuned for the complexity of Indian Jyotish. 
              Whether you need <strong>AI astrology predictions</strong> for your career or an <strong>AI horoscope today</strong>, 
              we bridge the gap in <strong>AI Jyotish — Where Vedic Astrology Meets AI</strong>.
            </p>
            <p>
              We cover everything from <strong>Vedic vs Western Astrology</strong> to specialized tips like 
              <strong>how to sleep as per Vastu</strong>. Our 2026 guides on <strong>Marriage Muhurat</strong> and 
              <strong>Manglik Dosha</strong> ensure you stay aligned with the cosmos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {blogCategories.map((cat, i) => (
              <div key={i} className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-accent/80">{cat.title}</h4>
                <ul className="space-y-2">
                  {cat.links.map((link, j) => (
                    <li key={j}>
                      <button 
                        onClick={() => handleNavigation(link.path)}
                        className="text-sm text-muted-foreground hover:text-white transition-colors text-left"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center border-t border-white/5 pt-16">
          <button
            onClick={() => setAuthOpen(true)}
            className="px-10 py-4 bg-accent text-accent-foreground font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(var(--accent),0.3)]"
          >
            Chat with Vedika AI - Free  →
          </button>
        </div>
      </div>
    </section>
  );
};

export default AstrologyFeatures;