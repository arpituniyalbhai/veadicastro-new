import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image?: string;
  externalLink?: string;
};

// Blog posts with comprehensive content
const blogPosts: BlogPost[] = [
  {
    id: "30",
    title: "Best Astrologer in Dehradun — Acharya Aman Uniyal Ji",
    excerpt: "Discover the best astrologer in Dehradun — Acharya Aman Uniyal Ji. 10-generation lineage from Pauri Garhwal, gold medalist in Vedic Astrology with 10+ years of experience. Book your consultation today.",
    author: "Acharya Aman Uniyal Ji",
    date: "2026-07-23",
    readTime: "15 min read",
    category: "Vedic Astrology",
    image: "/amanuniyalastrologe.webp",
    externalLink: "/best-astrologer-in-dehradun"
  },

  {
    id: "29",
    title: "AstroSaga Alternative: Free AI Astrology | Veadicastro",
    excerpt: "Looking for a reliable AstroSaga alternative? Discover Veadicastro, featuring precise Swiss Ephemeris calculations and personal AI astrology chat.",
    author: "Veadicastro Team",
    date: "2026-07-13",
    readTime: "12 min read",
    category: "AI & Technology",
    image: "/blog-images/astrosage-alternative.webp",
    externalLink: "/astrosage-alternative"
  },
  {
    id: "28",
    title: "HiAstro Alternative — Free AI Astrology Chat | Veadicastro",
    excerpt: "Looking for the best HiAstro alternative? Try Veadicastro — free AI astrology chat with real Vedic birth chart analysis, career & marriage predictions. Swiss Ephemeris powered.",
    author: "Veadicastro Team",
    date: "2026-07-10",
    readTime: "7 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/hi-astro-compititor.webp",
    externalLink: "/hi-astro-alternative"
  },
  {
    id: "27",
    title: "AI Astrologer: How Vedika Reads Your Kundli",
    excerpt: "A simple guide to AI astrologers, AI vs human astrologers, Kundli based answers, free AI astrologer chat, 5 minutes astrology, and marriage prediction tools.",
    author: "Arpit Uniyal",
    date: "2026-06-19",
    readTime: "9 min read",
    category: "AI & Technology",
    image: "/optimized/ai-astrologer-hero.webp",
    externalLink: "/ai-astrologer"
  },
  {
    id: "26",
    title: "Who Will Win FIFA World Cup 2026? Astrology Prediction",
    excerpt: "Spain, France, England, Brazil and Argentina analyzed through Vedic astrology for FIFA World Cup 2026. See Veadicastro's winner pick, planetary table and probability matrix.",
    author: "Veadicastro Team",
    date: "2026-06-14",
    readTime: "14 min read",
    category: "Sports Astrology",
    image: "/blog-images/fifa-world-cup-2026-astrology-main.webp",
    externalLink: "/blog/fifa-world-cup-2026-winner-astrology-prediction"
  },
  {
    id: "23",
    title: "The Great Astrology Scam",
    excerpt: "Every second on the clock costs you money. Here's how the astrology industry is milking that — and who's actually doing it differently. Expose the per-minute pricing trap and discover VeadicAstro's ₹799 flat-rate solution.",
    author: "Arpit Uniyal",
    date: "2026-04-24",
    readTime: "28 min read",
    category: "Astrology Industry",
    image: "/blog-images/astrologer-scal-blog.webp",
    externalLink: "/blog/the-great-astrology-scam"
  },
  {
    id: "2",
    title: "Vedic Astrology AI Kaise Kaam Karta Hai? Complete Guide in Hindi",
    excerpt: "जानिए Vedic Astrology AI कैसे काम करता है। Artificial Intelligence और Jyotish Shastra का संगम। Kundli बनाने, Prediction और Pattern Recognition की पूरी प्रक्रिया।",
    author: "Veadicastro Team",
    date: "2025-03-08",
    readTime: "15 min read",
    category: "Jyotish AI Technology",
    image: "/optimized/image.webp",
    externalLink: "/blog/vedic-astrology-ai-kese-kaam-karta-ha"
  },
  {
    id: "3",
    title: "Top 10 AI-Powered Astrology Platforms (2026)",
    excerpt: "Discover best AI-powered Vedic astrology platforms in 2026. Detailed ranking of Melooha, KundliGPT, Veadicastro, and more. Compare features, accuracy, and pricing. <Link to='/free-kundali-matching' className='text-pink-400 hover:text-pink-300 underline'>Try our Free Kundli Matching Calculator</Link> for accurate compatibility analysis.",
    author: "Veadicastro Team",
    date: "2026-03-09",
    readTime: "10 min read",
    category: "Platform Reviews",
    image: "/optimized/image1.webp",
    externalLink: "/blog/top-10-vedic-astrology-platform"
  },
  {
    id: "4",
    title: "Online Jyotishi vs AI Astrologer — Which Should You Trust in 2025?",
    excerpt: "Confused between consulting an online jyotishi or an AI astrologer? We compare accuracy, cost, privacy & convenience — and show you why Vedika AI on Veadicastro is different. Try it free.",
    author: "Veadicastro Team",
    date: "2025-03-11",
    readTime: "12 min read",
    category: "Astrology Comparison",
    image: "/optimized/online-jyotish-vs-ai-astrologer.webp",
    externalLink: "/blog/online-jyotishi-vs-ai-astrologer"
  },
  {
    id: "5",
    title: "IPL 2026 Final Prediction: Who Will Win RCB vs GT?",
    excerpt: "RCB vs GT IPL 2026 Final prediction through Vedic astrology. See tomorrow's winner pick, countdown, final-day planetary analysis, and win probabilities.",
    author: "Veadicastro Team",
    date: "2026-03-13",
    readTime: "12 min read",
    category: "Sports Astrology",
    image: "/optimized/ipl-2026.webp",
    externalLink: "/blog/ipl-2026-winner-prediction-astrology"
  },
  {
    id: "6",
    title: "Best Careers for Each Zodiac Sign in 2026 — Complete Astrology Guide",
    excerpt: "Discover best careers for each zodiac sign in 2026. Find out which profession aligns with your stars — from Aries (Mesh Rashi) to Pisces (Meen Rashi). Your complete astrology career guide is here.",
    author: "Veadicastro Team",
    date: "2026-03-15",
    readTime: "15 min read",
    category: "Career Astrology",
    image: "/optimized/best carrer path.webp",
    externalLink: "/blog/best-careers-for-each-zodiac-sign-in-2026"
  },
  {
    id: "7",
    title: "Who Will Become the Next PM of India in 2029? Modi vs. Yogi vs. Rahul Gandhi vs. Amit Shah — Astrology Predictions",
    excerpt: "Who will be the next PM of India in 2029? Detailed Vedic astrology analysis of Narendra Modi, Yogi Adityanath, Rahul Gandhi, and Amit Shah. Get expert predictions and probability table for India's next Prime Minister.",
    author: "Veadicastro Team",
    date: "2026-03-15",
    readTime: "12 min read",
    category: "Political Astrology",
    image: "/optimized/who-will-become-the-next-pm-of-india.webp",
    externalLink: "/blog/next-pm-india-2029-astrology-prediction"
  },
  {
    id: "8",
    title: "How to Do Kundali Matching for Marriage: A Complete 2026 Guide",
    excerpt: "Discover your perfect life partner through Vedic astrology kundali matching. Analyze compatibility, guna matching, and mangal dosh for successful marriage. Free detailed kundali matching report.",
    author: "Veadicastro Team",
    date: "2026-03-20",
    readTime: "10 min read",
    category: "Relationship Astrology",
    image: "/optimized/kundali-matching-.webp",
    externalLink: "/kundali-matching"
  },
  {
    id: "9",
    title: "Vedic vs Western Astrology — Which One Is Right for You?",
    excerpt: "Discover key differences between Vedic and Western astrology. Learn about Nakshatras, Dasha system, rising signs, and why Vedic astrology might be more accurate for you.",
    author: "Veadicastro Team",
    date: "2026-03-16",
    readTime: "12 min read",
    category: "Astrology Comparison",
    image: "/optimized/vedic-vs-western-astrology.webp",
    externalLink: "/blog/vedic-vs-western-astrology"
  },
  {
    id: "10",
    title: "Rahu-Ketu Transit 2026: Predictions, Effects & Remedies for All 12 Rashis",
    excerpt: "Complete guide to Rahu-Ketu transit 2026 with detailed predictions for all 12 rashis. Understand shadow planets effects, remedies, and navigate cosmic transformations.",
    author: "Veadicastro Team",
    date: "2026-03-17",
    readTime: "15 min read",
    category: "Vedic Astrology",
    image: "/optimized/rahu-ketu-blog.webp",
    externalLink: "/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis"
  },
  {
    id: "11",
    title: "Marriage Compatibility Based on Your Zodiac Sign (2026 Guide)",
    excerpt: "Discover your best marriage matches based on zodiac signs. Complete 2026 guide to astrological compatibility for all 12 signs — from Aquarius to Capricorn. Find your perfect partner.",
    author: "Veadicastro Team",
    date: "2026-03-21",
    readTime: "18 min read",
    category: "Relationship Astrology",
    image: "/optimized/marriage-compatibility.webp",
    externalLink: "/blog/marriage-compatibility-based-on-your-zodiac-sign"
  },
  {
    id: "12",
    title: "2026 Horoscope: What the Stars Are Really Saying This Year",
    excerpt: "Complete Vedic Jyotish predictions for all 12 rashis in 2026. Jupiter exalted in Cancer, Saturn in Aquarius, Rahu in Pisces, Ketu in Virgo - discover what the stars have in store for you this year.",
    author: "Arpit Uniyal",
    date: "2026-03-29",
    readTime: "25 min read",
    category: "Yearly Horoscope",
    image: "/optimized/yearly-horoscope-2026-complete-zodiac-predictions.webp",
    externalLink: "/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis"
  },
  {
    id: "13",
    title: "How AI is Transforming Vedic Astrology (2026)",
    excerpt: "Discover how Artificial Intelligence is revolutionizing Vedic astrology. Learn about AI-powered Kundali analysis, accessibility improvements, and the future of Jyotish in India's ₹3,500 crore astrology market.",
    author: "Arpit Uniyal",
    date: "2026-03-22",
    readTime: "15 min read",
    category: "AI & Technology",
    image: "/optimized/how-ai-transforming-vedic-astrology.webp",
    externalLink: "/blog/how-ai-is-transforming-vedic-astrology"
  },
  {
    id: "14",
    title: "Job vs Business — What Your Vedic Birth Chart Really Says",
    excerpt: "Confused between job and business? Your Vedic birth chart holds the answer. Learn how 10th house, 7th house, and planetary placements reveal your true career path.",
    author: "Arpit Uniyal",
    date: "2026-04-09",
    readTime: "20 min read",
    category: "Career Astrology",
    image: "/blog-images/job-vs-business-chart.webp",
    externalLink: "/blog/job-vs-business-what-your-chart-say"
  },
  {
    id: "15",
    title: "Manglik Dosha — Myths vs Reality: A Grounded Vedic Astrology Perspective",
    excerpt: "Separate fact from fiction about Manglik Dosha. Understand what Mangal Dosha really means in Vedic astrology, its impact on marriage, and why many beliefs are myths.",
    author: "Arpit Uniyal",
    date: "2026-04-01",
    readTime: "8 min read",
    category: "Vedic Astrology",
    image: "/optimized/manglik-dosha-.webp",
    externalLink: "/blog/manglik-dosha-myths-vs-reality"
  },
  {
    id: "15",
    title: "Marriage Muhurat 2026: Complete Wedding Dates & Timings",
    excerpt: "Plan your perfect wedding with cosmic blessings. Month-by-month guide to auspicious marriage dates, including special Adhik Maas opportunities with exact timings and Nakshatras.",
    author: "Arpit Uniyal",
    date: "2026-04-03",
    readTime: "15 min read",
    category: "Marriage & Muhurat",
    image: "/optimized/Marriage-Muhurat-2026.webp",
    externalLink: "/blog/marriage-muhurat-2026"
  },
  {
    id: "16",
    title: "How to Sleep as Per Vastu in 2026 — Complete Guide for Better Sleep",
    excerpt: "Discover the best sleeping directions as per Vastu Shastra for 2026. Learn how head direction, bedroom placement, and Vastu remedies can improve your sleep quality and health.",
    author: "Arpit Uniyal",
    date: "2026-04-05",
    readTime: "15 min read",
    category: "Vastu Shastra",
    image: "/blog-images/how-to-sleep-as-per-vastu.webp",
    externalLink: "/blog/how-to-sleep-as-per-vastu-in-2026"
  },
  {
    id: "17",
    title: "Is AI Astrology Accurate? We Tested It (2026)",
    excerpt: "A honest review of AI astrology accuracy. We tested AI predictions against real life experiences. Learn how AI astrology works, what makes it accurate, and whether it can replace traditional astrologers.",
    author: "Arpit Uniyal",
    date: "2026-04-11",
    readTime: "25 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/ai-astrology-accurate.webp",
    externalLink: "/blog/is-ai-astrology-accurate"
  },
  {
    id: "18",
    title: "AI Jyotish — Where Vedic Astrology Meets Artificial Intelligence",
    excerpt: "Discover how AI jyotish is revolutionizing Vedic astrology. Learn about authentic vedic astrology ai that combines traditional Jyotish principles with artificial intelligence for accurate personalized readings.",
    author: "Arpit Uniyal",
    date: "2026-04-11",
    readTime: "30 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/ai-jyotish-vedic-astrology.webp",
    externalLink: "/blog/ai-jyotish-vedic-astrology"
  },
  {
    id: "19",
    title: "AI Astrologer vs Human Astrologer - Which is Better? (2026)",
    excerpt: "Comprehensive comparison between AI astrologer and human astrologer. Discover accuracy, cost, privacy, and convenience differences. Find out which option is better for your needs.",
    author: "Arpit Uniyal",
    date: "2026-04-11",
    readTime: "35 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/ai-astrologer-vs-human-astrologer.webp",
    externalLink: "/blog/ai-astrologer-vs-human-astrologer"
  },
  {
    id: "20",
    title: "Is AI Astrology Fake or Real? Here Is What Nobody Is Telling You",
    excerpt: "The honest truth about AI astrology that nobody tells you. Learn how it works, what it gets right, and where it falls short compared to traditional astrologers. No filters, no agenda.",
    author: "Arpit Uniyal",
    date: "2026-04-17",
    readTime: "18 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/ai-astrology-real-or-fake.webp",
    externalLink: "/blog/ai-astrology-real-or-fake"
  },
  {
    id: "21",
    title: "Why ChatGPT Fails at AI Astrology: Veadicastro vs. ChatGPT",
    excerpt: "Why ChatGPT fails at AI astrology? Discover why Veadicastro is superior to ChatGPT for Vedic astrology. Learn about mathematical precision, Ayanamsa accuracy, and specialized AI Jyotish.",
    author: "Arpit Uniyal",
    date: "2026-04-17",
    readTime: "22 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/why-chatgpt-fails-at-ai-astrology.webp",
    externalLink: "/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt"
  },
  {
    id: "22",
    title: "AI Astrology Predictions for 2026 - What to Expect",
    excerpt: "Discover what AI astrology predicts for 2026. Learn about major planetary movements, career insights, marriage prospects, and how VeadicAstro.in's Vedika AI provides accurate predictions based on your Vedic birth chart.",
    author: "Arpit Uniyal",
    date: "2026-04-20",
    readTime: "18 min read",
    category: "AI & Technology",
    externalLink: "/blog/ai-astrology-prediction-for-2026"
  },
  {
    id: "24",
    title: "Vedika AI — India's First Vedic AI Astrologer",
    excerpt: "Meet Vedika AI — India's first Vedic AI astrologer. Get free AI astrology chat, daily predictions, kundli analysis in Hindi & English. Built on authentic Vedic knowledge with Lahiri sidereal system.",
    author: "Arpit Uniyal",
    date: "2026-04-27",
    readTime: "20 min read",
    category: "AI & Technology",
    image: "/optimized/vedika-ai-16.5-image.webp",
    externalLink: "/blog/vedika-ai-astrologer-india"
  },
  {
    id: "25",
    title: "Free AI Astrology Chat India — Ask Vedika AI Your Question",
    excerpt: "Chat with Vedika AI — India's free AI astrology chat built on Vedic Jyotish. Ask about marriage, career, finance. Get answers based on your real Kundali, not generic horoscopes.",
    author: "Arpit Uniyal",
    date: "2026-05-02",
    readTime: "12 min read",
    category: "AI & Technology",
    image: "/Ai-Astrology-image/free-ai-astrology-chat-india.webp",
    externalLink: "/blog/free-ai-astrology-chat-india"
  },
  {
    id: "27",
    title: "KundliGPT Alternative — Free AI Astrology Chat ",
    excerpt: "Best KundliGPT alternative. Get free AI astrology chat, Vedic kundli analysis, career & marriage predictions — powered by Swiss Ephemeris.",
    author: "Arpit Uniyal",
    date: "2026-07-13",
    readTime: "18 min read",
    category: "AI & Technology",
    image: "/blog-images/veadicastro-vs-kundliGPT.webp",
    externalLink: "/kundligpt-alternative"
  }
];

const Blog = () => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { setAuthOpen } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const handlePostClick = (post: BlogPost) => {
    if (post.externalLink) {
      if (post.externalLink.startsWith('/')) {
        // Internal link - navigate within app and scroll to top
        navigate(post.externalLink);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // External link - open in new tab
        window.open(post.externalLink, '_blank');
      }
    } else {
      setSelectedPost(post);
    }
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
        <SEO
          title={`${selectedPost.title} - Veadicastro Blog`}
          description={selectedPost.excerpt}
          keywords={["vedic astrology", "blog", selectedPost.category.toLowerCase()]}
          url={`https://veadicastro.in/blog/${selectedPost.id}`}
        />
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedPost(null)}>
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>

          <article className="space-y-6">
            <div className="space-y-4">
              <span className="text-sm text-secondary font-medium">{selectedPost.category}</span>
              <h1 className="text-3xl md:text-4xl font-bold mt-3">{selectedPost.title}</h1>
              <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedPost.date)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedPost.readTime}
                </div>
                <span>By {selectedPost.author}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">{selectedPost.excerpt}</p>
              <div className="mt-8 text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedPost.content || "Full article content coming soon..."}
              </div>
            </div>

            {/* See Our More Blog Section */}
            <div className="mt-12 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center">See Our More Blog</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Blog 1 */}
                <div className="bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all cursor-pointer hover:shadow-lg overflow-hidden">
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src="/optimized/online-jyotish-vs-ai-astrologer.webp" 
                      alt="Online Jyotishi vs AI Astrologer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="px-6 pb-6 space-y-6">
                    <div className="space-y-4">
                      <span className="text-xs text-secondary font-medium">Astrology Comparison</span>
                      <h2 className="text-xl font-semibold mt-3 line-clamp-2">Online Jyotishi vs AI Astrologer</h2>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">Confused between consulting an online jyotishi or an AI astrologer? We compare accuracy, cost, privacy & convenience — and show you why Vedika AI on Veadicastro is different. Try it free.</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          2025-03-11
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          12 min read
                        </div>
                      </div>
                      <span className="text-xs">By Veadicastro Team</span>
                    </div>
                  </div>
                </div>

                {/* Blog 2 */}
                <div className="bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all cursor-pointer hover:shadow-lg overflow-hidden">
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src="/optimized/image.webp" 
                      alt="Vedic Astrology AI Kaise Kaam Karta Hai"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="px-6 pb-6 space-y-6">
                    <div className="space-y-4">
                      <span className="text-xs text-secondary font-medium">Jyotish AI Technology</span>
                      <h2 className="text-xl font-semibold mt-3 line-clamp-2">Vedic Astrology AI Kaise Kaam Karta Hai?</h2>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">जानिए Vedic Astrology AI कैसे काम करता है। Artificial Intelligence और Jyotish Shastra का संगम। Kundli बनाने, Prediction और Pattern Recognition की पूरी प्रक्रिया।</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          2025-03-08
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          15 min read
                        </div>
                      </div>
                      <span className="text-xs">By Veadicastro Team</span>
                    </div>
                  </div>
                </div>

                {/* Blog 3 */}
                <div className="bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all cursor-pointer hover:shadow-lg overflow-hidden">
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src="/optimized/who-will-become-the-next-pm-of-india.webp" 
                      alt="Next PM of India 2029 — Astrology Predictions"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="px-6 pb-6 space-y-6">
                    <div className="space-y-4">
                      <span className="text-xs text-secondary font-medium">Political Astrology</span>
                      <h2 className="text-xl font-semibold mt-3 line-clamp-2">Who Will Become the Next PM of India in 2029?</h2>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">Who will be the next PM of India in 2029? Detailed Vedic astrology analysis of Narendra Modi, Yogi Adityanath, Rahul Gandhi, and Amit Shah. Get expert predictions and probability table for India's next Prime Minister.</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          2026-03-15
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          12 min read
                        </div>
                      </div>
                      <span className="text-xs">By Veadicastro Team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="text-center mt-8">
              <button 
                onClick={() => setAuthOpen(true)}
                className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up Free
              </button>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-12">
      <SEO
        title="Blog - Veadicastro"
        description="Read articles about Vedic astrology, AI technology, and cosmic insights from Veadicastro team."
        keywords={["vedic astrology blog", "astrology articles", "cosmic insights"]}
        url="https://veadicastro.in/blog"
      />
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Veadicastro Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights on Vedic astrology, AI technology, and cosmic wisdom
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-card/40 border border-border/60 rounded-2xl hover:border-secondary/40 transition-all cursor-pointer hover:shadow-lg overflow-hidden"
              onClick={() => handlePostClick(post)}
            >
              <div className="space-y-4">
                {post.image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="px-6 pb-6 space-y-6">
                  <div className="space-y-4">
                    <span className="text-xs text-secondary font-medium">{post.category}</span>
                    <h2 className="text-xl font-semibold mt-3 line-clamp-2">{post.title}</h2>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <span className="text-xs">By {post.author}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;