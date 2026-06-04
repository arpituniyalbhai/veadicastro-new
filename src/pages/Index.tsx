import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import QuestionsFab from "@/components/QuestionsFab";
import SEO, { generateFAQSchema } from "@/components/SEO";
import { useEffect, Suspense, lazy } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ButtonLite } from "@/components/ui/button-lite";
import { Plus, MessageCircle, Sparkles, Brain, Send, ArrowRight, Heart, Calendar } from "lucide-react";

// Get current date for SEO
const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Lazy load heavy components below the fold
const DashboardSection = lazy(() => import("@/components/DashboardSection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const PricingComponent = lazy(() => import("@/components/PricingComponent"));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const AstrologyEngineSection = lazy(() => import("@/components/AstrologyEngineSection"));
const FounderTrustSection = lazy(() => import("@/components/FounderTrustSection"));
const WhoIsThisForSection = lazy(() => import("@/components/WhoIsThisForSection"));
const InternalLinksSection = lazy(() => import("@/components/InternalLinksSection"));
const VedikaDifferenceSection = lazy(() => import("@/components/VedikaDifferenceSection"));

const featuredBadges = [
  {
    href: "https://www.rankmyai.com/tools/5c09cbcc-7912-4398-856b-078909a86328/veadicastro",
    src: "https://www.rankmyai.com/images/logos/logo_horizontal_dark.svg",
    alt: "Rank My AI Logo",
    className: "h-[60px] w-auto",
  },
  {
    href: "https://www.producthunt.com/products/vedicastro/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-vedicastro",
    src: "https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1130177&theme=light",
    alt: "Vedicastro Product Hunt Review",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://toolfame.com/item/veadicastro",
    src: "https://toolfame.com/badge-dark.svg",
    alt: "Featured on toolfame.com",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://fazier.com/launches/veadicatro.in",
    src: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark",
    alt: "Fazier badge",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://showmebest.ai",
    src: "https://showmebest.ai/badge/feature-badge-dark.webp",
    alt: "Featured on ShowMeBestAI",
    className: "h-[60px] w-auto",
  },
  {
    href: "https://neeed.directory/products/veadicastro?utm_source=veadicastro",
    src: "https://neeed.directory/badges/neeed-badge-dark.svg",
    alt: "Featured on neeed.directory",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://saasfame.com/item/veadicastro",
    src: "https://saasfame.com/badge-dark.svg",
    alt: "Featured on saasfame.com",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge3-dark.svg",
    alt: "Featured on Twelve Tools",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://wired.business",
    src: "https://wired.business/badge3-dark.svg",
    alt: "Featured on Wired Business",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://turbo0.com/item/veadicastro",
    src: "https://img.turbo0.com/badge-listed-dark.svg",
    alt: "Listed on Turbo0",
    className: "h-[54px] w-auto",
  },
  {
    href: "https://launchigniter.com/product/veadicastro?ref=badge-veadicastro",
    src: "https://launchigniter.com/api/badge/veadicastro?theme=dark",
    alt: "Featured on LaunchIgniter",
    className: "h-[55px] w-auto",
  },
];

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll-triggered counter animation
  useEffect(() => {
    let hasAnimated = false;
    
    const handleScroll = () => {
      if (!hasAnimated && window.scrollY > 200) {
        hasAnimated = true;
        
        const animateCounter = (elementId: string, target: number, duration: number) => {
          const element = document.getElementById(elementId);
          if (!element) return;
          
          let start = 0;
          const increment = target / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              start = target;
              clearInterval(timer);
            }
            element.textContent = Math.floor(start).toLocaleString();
          }, 16);
        };

        animateCounter('accurate-answers', 20000, 4000);
        animateCounter('user-base', 10000, 4000);
        animateCounter('daily-predictions', 30000, 4000);
        animateCounter('report-created', 22000, 4000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // ✅ Agar user instantly mila (sessionStorage se) — seedha null return
  if (user) return null;

  // ✅ loading ho ya na ho — landing page hamesha render karo (SEO ke liye)
  // Baad mein useEffect handle karega redirect

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Veadicastro",
    "url": "https://veadicastro.in",
    "description": "AI-powered Vedic astrology platform providing personalized astrological guidance, daily predictions, and detailed reports.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://veadicastro.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // FAQ data for structured data
  const faqs = [
    {
      q: "Which is the best Vedic Astrology AI tool in India?",
      a: "Veadicastro is India's most accurate Vedic Astrology AI platform. It uses the Lahiri sidereal system to calculate your exact Sun sign, Moon sign, Lagna, and Nakshatra from your date of birth - then lets you chat with an AI astrologer with plans starting from ₹149/month.",
    },
    {
      q: "What are the pricing plans for AI astrology on Veadicastro?",
      a: "Veadicastro offers AI astrology plans starting from ₹149/month. Enter your date of birth, time, and place to generate your Kundli and ask questions - signup required to access premium features.",
    },
    {
      q: "How accurate is AI powered astrology?",
      a: "Veadicastro's AI powered astrology uses real-time ephemeris data with arc-second precision for planetary calculations - making it more accurate than many traditional methods. It strictly follows the Vedic sidereal system, not Western tropical astrology.",
    },
    {
      q: "What is the most accurate AI astrology website in India?",
      a: "Veadicastro is rated the most accurate AI astrology website in India. It calculates your complete Vedic birth chart and provides personalized predictions through conversational AI - available in Hindi and English with plans from ₹149/month.",
    },
    {
      q: "Can I use AI astrology chat in Hindi?",
      a: "Yes. Veadicastro's AI astrology chat works in both Hindi and English. Select your language preference before generating your Kundli and the AI astrologer Vedika will respond in your chosen language.",
    },
    {
      q: "How accurate are the readings?",
      a: "Veadicastro combines classical Vedic astrology with high-precision ephemeris data and AI-powered analysis. Our accuracy comes from cross-checking multiple signals: birth chart (D1), divisional charts (D9, D10), Mahadasha periods, and current transits. We validate insights across all these layers before presenting them. Accuracy improves significantly with precise birth details (exact time, date, and place). Even without exact birth time, we can provide meaningful guidance using alternative methods.",
    },
    {
      q: "Do I need my exact birth time?",
      a: "Exact birth time is highly recommended for the most accurate Lagna (Ascendant) and house placements, which are crucial for personalized readings. If you don't have your exact time, we offer several alternatives: sunrise charts, rectification hints based on life events, or generalized guidance using your date and place. Many users find value even with approximate times, though precision always yields better results.",
    },
    {
      q: "Is this suitable for business or personal guidance?",
      a: "Absolutely. Veadicastro serves both personal and professional needs. For personal life, you can explore relationships, health, spiritual growth, and life direction. For business, you can analyze timing for launches, partnerships, investments, and career moves. Our system tailors insights to your specific questions and life context, making it versatile for any area of your life.",
    },
    {
      q: "Can I get compatibility insights?",
      a: "Yes. Our compatibility feature lets you compare two birth charts to understand relationship dynamics. We analyze synastry (how planets interact between charts), composite charts, and dasha compatibility. You'll see strengths, challenges, and timing windows for key relationship milestones. This works for romantic partners, business partners, family members, or any meaningful relationship.",
    },
    {
      q: "What is a Mahadasha and why does it matter?",
      a: "Mahadasha is a major planetary period in Vedic astrology that lasts 6-20 years depending on the planet. Each Mahadasha brings distinct themes and opportunities. Understanding your current and upcoming Mahadashas helps you anticipate life phases, make informed decisions, and align with cosmic timing. Veadicastro maps your entire Mahadasha timeline so you can plan ahead.",
    }
  ];

  // Generate FAQ schema
  const faqSchema = generateFAQSchema(faqs);
  
  // Pass both schemas as array
  const schemas = [websiteSchema, faqSchema];

  const currentDate = getCurrentDate();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SEO
        title="AI Astrology — Free AI Chat | Daily Horoscope & Detailed Report — Veadicastro"
        description="India's most accurate AI Astrologer — Get daily health, wealth & self predictions, Kundli, family member charts, lucky numbers, and personalized Vedic AI chat. Sign up now. Hindi & English."
        ogTitle="AI Astrology | Daily Horoscope AI | Vedic Astrology AI — Veadicastro"
        ogDescription="India's most advanced AI Astrology platform — AI astrologer chat, daily predictions, instant Kundli, lucky numbers and detailed Vedic reports. Sign up now. Hindi & English."
        twitterTitle="AI Astrology | Daily Horoscope AI | Vedic Astrology AI — Veadicastro"
        twitterDescription="AI Astrology Chat — daily predictions, Kundli, lucky numbers and detailed Vedic reports. Sign up now and start now!"
        keywords={[
          "Veadicastro",
          "AI Vedic astrology",
          "Vedika AI astrologer",
          "AI Kundli",
          "Kundli matching",
          "daily horoscope",
          "Mahadasha",
          "Nakshatra",
          "Lahiri Ayanamsa",
          "Swiss Ephemeris astrology"
        ]}
        url="https://veadicastro.in"
        schema={schemas}
      />
      {location.pathname === "/" && <QuestionsFab key="index-page-fab" />}
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        
        {/* Static Statistics Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-secondary" id="accurate-answers">20,000 +</h3>
                    <Plus className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">Questions Answered</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-primary" id="user-base">10,000 +</h3>
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">Lives Guided</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-accent" id="daily-predictions">30,000 +</h3>
                    <Plus className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">Daily Predictions</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-secondary" id="report-created">22,000 +</h3>
                    <Plus className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">Kundlis Generated</p>
                </div>
              </div>
            </div>
        </section>

        <section className="pb-12">
          <div className="relative w-full overflow-hidden py-2">
            <div className="marquee-track flex w-max items-center gap-10 px-2">
                {[...featuredBadges, ...featuredBadges].map((badge, idx) => (
                  <a key={`${badge.href}-${idx}`} href={badge.href} target="_blank" rel="noopener noreferrer" className="shrink-0 opacity-95 hover:opacity-100 transition-opacity">
                    <img src={badge.src} alt={badge.alt} className={badge.className} loading="lazy" />
                  </a>
                ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-background via-background/80 to-transparent" />
          </div>
        </section>
        <style>{`
          @keyframes featured-badges-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            animation: featured-badges-marquee 56s linear infinite;
          }
        `}</style>
        
        {/* Meet Vedika AI Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 bg-accent/10 backdrop-blur-md shadow-lg">
                <Brain className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-sm font-medium text-accent">AI Astrologer</span>
              </div>
              
              <h2 className="font-sans text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight tracking-normal relative">
                <span className="relative z-10 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Meet Vedika — AI Astrologer
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-accent/50 to-primary/40 blur-2xl -z-10 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-secondary/40 to-accent/30 blur-xl -z-10 scale-105"></div>
              </h2>
            </div>

            {/* Demo Chatbot */}
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                No waiting. No fear. Just clarity — in seconds.
              </p>
              <div className="bg-card/80 backdrop-blur-lg border border-border/60 rounded-2xl shadow-xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-accent/20 to-primary/20 border-b border-border/40 px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center overflow-hidden">
                        <img 
                          src="/optimized/vedika.webp" 
                          alt="Vedika AI" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Vedika AI</h3>
                        <p className="text-xs text-muted-foreground">Online • Ready to help</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {/* Sample AI Messages */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img 
                        src="/optimized/vedika.webp" 
                        alt="Vedika AI" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-accent/10 border border-accent/30 rounded-2xl rounded-tl-none p-3 sm:p-4 max-w-[85%] sm:max-w-md">
                      <p className="text-sm text-foreground">
                        Hello! I'm Vedika AI, your personal astrologer. I can help you understand your birth chart, provide daily predictions, and answer any questions about your astrological journey. What would you like to know today?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary/10 border border-primary/30 rounded-2xl rounded-tr-none p-3 sm:p-4 max-w-[85%] sm:max-w-md">
                      <p className="text-sm text-foreground">
                        Can you tell me about my career prospects for this month?
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-secondary" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img 
                        src="/optimized/vedika.webp" 
                        alt="Vedika AI" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-accent/10 border border-accent/30 rounded-2xl rounded-tl-none p-3 sm:p-4 max-w-[85%] sm:max-w-md">
                      <p className="text-sm text-foreground">
                        Based on your birth chart and current planetary transits, this month shows excellent opportunities for career growth. The Sun in your 10th house combined with Jupiter's aspect suggests recognition and advancement. Focus on professional development between the 15th-25th for best results. 🌟
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="border-t border-border/40 px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Ask Vedika AI anything about your astrology..."
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-background border border-border/40 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-colors"
                      disabled
                    />
                    <ButtonLite
                      variant="cosmic"
                      size="sm"
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-full"
                      disabled
                    >
                      <Send className="w-4 h-4" />
                    </ButtonLite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        }>
          <AstrologyEngineSection />
        </Suspense>

        <Suspense fallback={
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        }>
          <VedikaDifferenceSection />
        </Suspense>

        <Suspense fallback={
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        }>
          <FounderTrustSection />
        </Suspense>

        <Suspense fallback={
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        }>
          <WhoIsThisForSection />
        </Suspense>
      
        <Suspense fallback={
        <div className="py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      }>
          <FeaturesSection />
        </Suspense>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        }>
          <PricingComponent />
        </Suspense>
        
        <div id="dashboard">
          <Suspense fallback={
            <div className="py-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
          }>
            <DashboardSection />
          </Suspense>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        }>
          <ReviewsSection />
        </Suspense>

        {/* Free Tools Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-accent/5 via-background to-primary/5">
          <div className="container mx-auto max-w-6xl">
            {/* Section Header */}
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-md shadow-lg">
                <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                <span className="text-sm font-medium text-secondary">Astrology Tools</span>
              </div>
              
              <h2 className="font-sans text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-normal relative">
                <span className="relative z-10 bg-gradient-to-r from-white via-secondary to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Vedic Astrology Tools
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-secondary/50 to-accent/40 blur-2xl -z-10 scale-110"></div>
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Powerful Vedic astrology tools with detailed insights. Premium features available.
              </p>
            </div>

            {/* Tools Cards - First Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* AI Chat Tool */}
              <article className="group relative bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden"
                   itemScope itemType="https://schema.org/SoftwareApplication"
                   itemProp="mainEntity"
                   onClick={() => {
                     navigate('/free-ai-astrologer-chat');
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}>
                <link itemProp="url" href="https://veadicastro.in/free-ai-astrologer-chat" />
                <meta itemProp="name" content="Free AI Astrologer Chat - Veadicastro" />
                <meta itemProp="applicationCategory" content="LifestyleApplication" />
                <meta itemProp="operatingSystem" content="Web Browser" />
                <meta itemProp="price" content="0" />
                <meta itemProp="priceCurrency" content="USD" />
                <span itemProp="description" className="hidden">Chat with Vedika AI astrologer for personalized guidance. Ask questions about career, love, health, and spiritual growth. Get instant answers based on Vedic astrology.</span>
                
                <div className="relative p-6">
                  {/* Tool Icon */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-6 h-6" />
                  </div>

                  {/* Tool Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    Free AI Chat
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Chat with Vedika AI astrologer for personalized guidance. Ask questions about career, love, health, and spiritual growth. Get instant answers based on Vedic astrology.
                  </p>

                  {/* Features */}
                  <ul className="space-y-1 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      signup required
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      Instant AI responses
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      Hindi & English support
                    </li>
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Start Chatting</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/20 via-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </article>

              {/* Kundli Generator Tool */}
              <article className="group relative bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden"
                   itemScope itemType="https://schema.org/SoftwareApplication"
                   itemProp="mainEntity"
                   onClick={() => {
                     navigate('/free-kundli-generator');
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}>
                <link itemProp="url" href="https://veadicastro.in/free-kundli-generator" />
                <meta itemProp="name" content="Free Kundli Generator - Veadicastro" />
                <meta itemProp="applicationCategory" content="LifestyleApplication" />
                <meta itemProp="operatingSystem" content="Web Browser" />
                <meta itemProp="price" content="0" />
                <meta itemProp="priceCurrency" content="USD" />
                <span itemProp="description" className="hidden">Generate your detailed Vedic birth chart instantly. Get comprehensive analysis including planetary positions, dashas, and life predictions based on authentic Vedic astrology.</span>
                
                <div className="relative p-6">
                  {/* Tool Icon */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-6 h-6" />
                  </div>

                  {/* Tool Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    Free AI Kundli
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Generate your detailed Vedic birth chart instantly. Get comprehensive analysis including planetary positions, dashas, and life predictions based on authentic Vedic astrology.
                  </p>

                  {/* Features */}
                  <ul className="space-y-1 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      Complete birth chart
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      Detailed predictions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      PDF download available
                    </li>
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Generate Kundli</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </article>

              {/* Kundli Matching Tool */}
              <article className="group relative bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden"
                   itemScope itemType="https://schema.org/SoftwareApplication"
                   itemProp="mainEntity"
                   onClick={() => {
                     navigate('/free-kundali-matching');
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}>
                <link itemProp="url" href="https://veadicastro.in/free-kundali-matching" />
                <meta itemProp="name" content="Kundli Matching - Veadicastro" />
                <meta itemProp="applicationCategory" content="LifestyleApplication" />
                <meta itemProp="operatingSystem" content="Web Browser" />
                <meta itemProp="price" content="0" />
                <meta itemProp="priceCurrency" content="USD" />
                <span itemProp="description" className="hidden">Check marriage compatibility with accurate Kundli matching. Get detailed Guna Milan analysis, Manglik dosha check, and compatibility predictions based on Vedic astrology.</span>
                
                <div className="relative p-6">
                  {/* Tool Icon */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-6 h-6" />
                  </div>

                  {/* Tool Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    Kundli Matching
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Check marriage compatibility with accurate Kundli matching. Get detailed Guna Milan analysis, Manglik dosha check, and compatibility predictions based on Vedic astrology.
                  </p>

                  {/* Features */}
                  <ul className="space-y-1 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      36 Guna Milan system
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      Manglik dosha analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary"></div>
                      Swiss Ephemeris accuracy
                    </li>
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Check Compatibility</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </article>
            </div>

            {/* Tools Cards - Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Free 5-Minutes Astrology Tool */}
              <article className="group relative bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden w-full"
                   itemScope itemType="https://schema.org/SoftwareApplication"
                   itemProp="mainEntity"
                   onClick={() => {
                     navigate('/free-5-minutes-astrology-ai');
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}>
                <link itemProp="url" href="https://veadicastro.in/free-5-minutes-astrology-ai" />
                <meta itemProp="name" content="Free 5-Minutes Astrology AI - Veadicastro" />
                <meta itemProp="applicationCategory" content="LifestyleApplication" />
                <meta itemProp="operatingSystem" content="Web Browser" />
                <meta itemProp="price" content="0" />
                <meta itemProp="priceCurrency" content="USD" />
                <span itemProp="description" className="hidden">Get instant free Vedic astrology readings in 5 minutes. Personalized predictions for love, career, health, and life based on your birth chart.</span>
                
                <div className="relative p-6">
                  {/* Tool Icon */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  {/* Tool Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    Free 5-Minutes Astrology
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Get instant free Vedic astrology readings in 5 minutes. Personalized predictions for love, career, health, and life based on your authentic birth chart.
                  </p>

                  {/* Features */}
                  <ul className="space-y-1 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      No signup required
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      Instant AI predictions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      Based on Vedic astrology
                    </li>
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Get Reading</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/20 via-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </article>

              {/* Today Horoscope Tool */}
              <article className="group relative bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden w-full"
                   itemScope itemType="https://schema.org/SoftwareApplication"
                   itemProp="mainEntity"
                   onClick={() => {
                     navigate('/today-horoscope');
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}>
                <link itemProp="url" href="https://veadicastro.in/today-horoscope" />
                <meta itemProp="name" content="Today's Horoscope - Veadicastro" />
                <meta itemProp="applicationCategory" content="LifestyleApplication" />
                <meta itemProp="operatingSystem" content="Web Browser" />
                <meta itemProp="price" content="0" />
                <meta itemProp="priceCurrency" content="USD" />
                <span itemProp="description" className="hidden">Read your daily horoscope based on today's planetary transits. Get sign-wise Vedic guidance, practical timing, and fresh predictions every day.</span>

                <div className="relative p-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent to-secondary flex items-center justify-center text-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    Today's Horoscope
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Get a fresh daily horoscope based on today's transits. Pick your sign, ask your question, and see practical Vedic guidance for the day.
                  </p>

                  <ul className="space-y-1 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      Daily transit updates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      Sign-wise guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-secondary"></div>
                      No signup required
                    </li>
                  </ul>

                  <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Read Horoscope</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </article>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                All tools are completely free but with limited feature  — no credit card, signup required 
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Limited Feature Free
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  Signup Required for To Unlock More feature
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  Instant Access
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Suspense fallback={
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        }>
          <FAQSection />
        </Suspense>

        <Suspense fallback={
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        }>
          <BlogSection />
        </Suspense>

        <Suspense fallback={
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        }>
          <InternalLinksSection />
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
