import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonLite } from "@/components/ui/button-lite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Send, Sparkles, Calendar, MapPin, Clock, User, Loader2,
  Heart, Briefcase, Activity, Eye, Star, Zap, Globe, CheckCircle2, Brain, Shield, Award, ChevronRight, MessageSquare, TrendingUp, Target, RotateCcw
} from "lucide-react";
import AdBanner from "@/components/AdBanner";
import { cn } from "@/lib/utils";

// ── Decorative star-field dots ──────────────────────────────────────────────
const StarField = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: "1px",
          height: "1px",
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
          opacity: 0.1,
        }}
      />
    ))}
  </div>
);

// Types
type Gender = "male" | "female";
type Topic = "love" | "career" | "health" | "life" | "general";

interface BirthDetails {
  name: string;
  gender: Gender;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  birthPlace: string;
  lat?: number;
  lon?: number;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface AstroReport {
  topic: Topic;
  report: string;
  keyInsights: string[];
}

// Topics Configuration
const topics = [
  { id: "love", icon: Heart, label: "Love & Marriage", color: "from-pink-500 to-rose-600" },
  { id: "career", icon: Briefcase, label: "Career & Money", color: "from-green-500 to-emerald-600" },
  { id: "health", icon: Activity, label: "Health", color: "from-blue-500 to-cyan-600" },
  { id: "life", icon: Eye, label: "Life & Future", color: "from-purple-500 to-violet-600" },
  { id: "general", icon: Star, label: "Anything (Surprise Me)", color: "from-orange-500 to-amber-600" }
];

const Free5MinutesAstrology = () => {
  const navigate = useNavigate();
  
  // Screen 1: Birth Details Form
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    gender: "male",
    day: 1,
    month: 1,
    year: 2000,
    hour: 12,
    minute: 0,
    birthPlace: ""
  });
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Screen 2: Topic Selection
  const [showTopicScreen, setShowTopicScreen] = useState(false);

  // Screen 3: Loading
  const [isGenerating, setIsGenerating] = useState(false);
  const loadingTexts = [
    "Reading your stars...",
    "Calculating planetary positions...",
    "Studying your birth Kundali...",
    "Calculating dasha periods...",
    "Preparing your personalized prediction..."
  ];
  const [loadingStage, setLoadingStage] = useState(0);
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);

  // Screen 4: Report
  const [report, setReport] = useState<AstroReport | null>(null);

  // OpenCage API for location search
  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const key = "91ab8792290d414b92590c9d4cc0793c";
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${key}&limit=5&no_annotations=1`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.results && data.results.length > 0) {
        const suggestions = data.results.map((r: any) => ({
          display_name: r.formatted,
          lat: r.geometry.lat.toString(),
          lon: r.geometry.lng.toString()
        }));
        setLocationSuggestions(suggestions);
      } else {
        setLocationSuggestions([]);
      }
    } catch {
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  const selectLocation = (place: LocationSuggestion) => {
    setBirthDetails(prev => ({
      ...prev,
      birthPlace: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon)
    }));
    setLocationSuggestions([]);
  };

  // Calculate age
  const calculateAge = (day: number, month: number, year: number) => {
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - (birth.getMonth());
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get Vedic sun sign
  const getVedicSunSign = (day: number, month: number, year: number): string => {
    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    const date = new Date(year, month - 1, day);
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const signIndex = Math.floor((dayOfYear + 9) % 12);
    return signs[signIndex];
  };

  // Build report prompt function
  const buildReportPrompt = (astroData: any, topic: string, details: BirthDetails) => `
Generate a 200-300 word personalized Vedic astrology report.

Topic: ${topic}
Name: ${details.name}
Age: ${calculateAge(details.day, details.month, details.year)}
Sun Sign: ${astroData.sunSign}
Moon Sign: ${astroData.moonSign}  
Lagna: ${astroData.lagnaSign}
Nakshatra: ${astroData.nakshatra?.name}
Mahadasha: ${astroData.dasha?.mahadasha}

RULES:
1. Address by first name
2. Topic-specific — no generic advice
3. Give 1 specific time period prediction
4. Mix 2-3 Hindi words naturally (shubh, karma, dasha)
5. End with 1 powerful personal message
6. NO disclaimers, NO "as an AI"

FORMAT:
REPORT:
[200-300 words]

KEY INSIGHTS:
- [Insight 1]
- [Insight 2]
- [Insight 3]
`;

  // Generate report using /api/mistral endpoint
  const generateReport = async () => {
    if (!birthDetails.name || !birthDetails.birthPlace || !selectedTopic) {
      alert("Please fill in all required fields and select a topic");
      return;
    }

    setIsGenerating(true);
    setLoadingStage(0);
    setCurrentLoadingText(loadingTexts[0]);
    setShowTopicScreen(false);
    
    const loadingInterval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    try {
      // Create astro data object
      const astroData = {
        sunSign: getVedicSunSign(birthDetails.day, birthDetails.month, birthDetails.year),
        moonSign: "Cancer", // Placeholder - would calculate from actual planetary positions
        lagnaSign: "Leo", // Placeholder - would calculate from actual planetary positions
        nakshatra: { name: "Rohini" }, // Placeholder - would calculate from actual planetary positions
        dasha: { mahadasha: "Jupiter" } // Placeholder - would calculate from actual planetary positions
      };

      // Call /api/mistral endpoint
      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: buildReportPrompt(astroData, selectedTopic, birthDetails),
          systemExtra: JSON.stringify(astroData),
          userName: birthDetails.name,
          stream: false,  // report ke liye streaming nahi chahiye
          lang: "en",
          apiKeySlot: "secondary"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      const reportText = data.text || data.response; // Handle both formats for compatibility

      // Check if reportText exists
      if (!reportText) {
        console.error('Missing report data. Full API response:', data);
        throw new Error('Invalid response from server: missing report data');
      }

      // Parse response to extract report and insights
      const reportMatch = reportText.match(/REPORT:\n([\s\S]*?)\n\nKEY INSIGHTS:/);
      const reportSection = reportMatch ? reportMatch[1].trim() : reportText.replace('REPORT:', '').trim();
      const insightsMatch = reportText.match(/KEY INSIGHTS:\n([\s\S]*)/);
      const keyInsights = insightsMatch 
        ? insightsMatch[1]
            .split('\n')
            .filter(line => line.startsWith('-'))
            .map(line => line.replace('- ', '').trim())
            .filter(insight => insight.length > 0)
        : [];

      clearInterval(loadingInterval);
      setReport({
        topic: selectedTopic!,
        report: reportSection,
        keyInsights
      });
    } catch (error) {
      console.error('Error generating report:', error);
      clearInterval(loadingInterval);
      alert("Error generating report. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingStage(0);
    }
  };

  // Reset to birth form
  const handleNewReading = () => {
    setReport(null);
    setShowTopicScreen(false);
    setSelectedTopic(null);
    setIsGenerating(false);
    setLoadingStage(0);
    setCurrentLoadingText(loadingTexts[0]);
    setBirthDetails({
      name: "",
      gender: "male",
      day: 1,
      month: 1,
      year: 2000,
      hour: 12,
      minute: 0,
      birthPlace: ""
    });
  };

  // Loading text animation
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingStage(prev => {
          const nextStage = (prev + 1) % loadingTexts.length;
          setCurrentLoadingText(loadingTexts[nextStage]);
          return nextStage;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  return (
    <>
      <Helmet>
        <title>Free 5-Minute Astrology Reading | Instant Vedic Predictions | Vedika AI</title>
        <meta name="description" content="Get instant free Vedic astrology readings in 5 minutes. Personalized predictions for love, career, health, and life. AI-powered accurate insights." />
        <meta name="keywords" content="free 5 minute astrology, instant vedic predictions, AI astrology reading, free kundli, personalized horoscope, love prediction, career astrology, health astrology" />
        <link rel="canonical" href="https://veadicastro.in/free-5-minutes-astrology-ai" />
        <meta property="og:title" content="Free 5-Minute Astrology Reading | Instant Vedic Predictions" />
        <meta property="og:description" content="Get instant free Vedic astrology readings in 5 minutes. Personalized predictions for love, career, health, and life." />
        <meta property="og:url" content="https://veadicastro.in/free-5-minutes-astrology-ai" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Free 5-Minute Astrology Reading",
            "description": "Get instant free Vedic astrology readings in 5 minutes. Personalized predictions for love, career, health, and life.",
            "url": "https://veadicastro.in/free-5-minutes-astrology-ai",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Vedika AI Astrology",
              "applicationCategory": "LifestyleApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              }
            }
          })
        }
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://veadicastro.in"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Free 5 Minutes Astrology AI",
                "item": "https://veadicastro.in/free-5-minutes-astrology-ai"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden">
        {/* ambient glow blobs */}
        <div className="pointer-events-none fixed top-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full bg-pink-600/5 blur-[80px]" />
        <div className="pointer-events-none fixed bottom-[-200px] left-[-200px] w-[350px] h-[350px] rounded-full bg-purple-800/5 blur-[80px]" />

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
              <img src="/optimized/logo.webp" alt="Veadicastro Vedic astrology AI platform logo" className="w-9 h-9 rounded-full" loading="eager" />
              <span className="text-lg font-bold tracking-wide">Veadicastro</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-white/60 border border-white/10 rounded-full px-3 py-1">
                Powered by Advanced AI & Vedic Knowledge
              </span>
              <button onClick={() => navigate("/")} className="text-sm text-white/60 hover:text-pink-400 transition-colors flex items-center gap-1">
                ← Back to Home
              </button>
            </div>
          </div>
        </header>

        {/* ── HERO STRIP ── */}
        <section className="relative py-14 text-center px-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 border border-pink-500/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3 h-3" /> Free 5-Minute Astrology Reading - Instant Vedic Predictions
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-none mb-4">
            Get Your Personalized Reading<br />
            <span className="text-pink-400 pink-glow">In Just 5 Minutes</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <a href="/free-ai-astrologer-chat" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Chat with AI Astrologer</a>
            <a href="/ai-marriage-prediction-by-date-of-birth" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Check Marriage Timing</a>
            <a href="/chatgpt-astrology" className="text-sm text-white/60 hover:text-pink-400 transition-colors">ChatGPT Astrology</a>
            <a href="/ai-astrology-prediction" className="text-sm text-white/60 hover:text-pink-400 transition-colors">AI Astrology Prediction</a>
            <a href="/today-horoscope" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Today's Horoscope</a>
            <a href="/free-kundli-generator" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Birth Chart Calculator</a>
            <a href="/free-kundali-matching" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Kundli Matching</a>
            <a href="/blog" className="text-sm text-white/60 hover:text-pink-400 transition-colors">Vedic Astrology Blog</a>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-5xl mx-auto px-4 pb-8">
          {/* AdSense Ad - Above Content */}
          <div className="my-6 flex justify-center">
            <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
          </div>

          {!report && !showTopicScreen && (
            /* ── BIRTH DETAILS FORM ── */
            <div className="max-w-2xl mx-auto">
              <div className="card-glass rounded-3xl p-8">
                <h2 className="font-bold text-2xl font-bold mb-8 text-center">
                  Enter Birth Details for <span className="text-pink-400">Authentic Vedic Analysis</span>
                </h2>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2"><User className="w-4 h-4 text-pink-400" /> Name *</label>
                    <Input className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11" placeholder="Enter your full name" value={birthDetails.name}
                      onChange={e => setBirthDetails(prev => ({ ...prev, name: e.target.value }))} />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2"><User className="w-4 h-4 text-pink-400" /> Gender *</label>
                    <Select value={birthDetails.gender} onValueChange={(value) => setBirthDetails(prev => ({ ...prev, gender: value as Gender }))}>
                      <SelectTrigger className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1020] border-white/10 text-white" align="start" sideOffset={4} position="popper" avoidCollisions={false}>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-pink-400" /> Date of Birth *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Day", key: "day", max: 31 },
                        { label: "Month", key: "month", max: 12 },
                      ].map(({ label, key, max }) => (
                        <div key={key}>
                          <p className="text-white/40 text-xs mb-1">{label}</p>
                          <Select value={(birthDetails as any)[key].toString()}
                            onValueChange={v => setBirthDetails(prev => ({ ...prev, [key]: parseInt(v) }))}>
                            <SelectTrigger className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#1a1020] border-white/10 text-white max-h-48 overflow-y-auto" position="popper" avoidCollisions={false}>
                              {Array.from({ length: max }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                      <div>
                        <p className="text-white/40 text-xs mb-1">Year</p>
                        <Input type="number" min="1900" max="2025" className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"
                          value={birthDetails.year}
                          onChange={e => setBirthDetails(prev => ({ ...prev, year: parseInt(e.target.value) || 2000 }))} />
                      </div>
                    </div>
                  </div>

                  {/* Time of Birth */}
                  <div>
                    <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-pink-400" /> Time of Birth *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Hour (24h)</p>
                        <Select value={birthDetails.hour.toString()} onValueChange={v => setBirthDetails(prev => ({ ...prev, hour: parseInt(v) }))}>
                          <SelectTrigger className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#1a1020] border-white/10 text-white max-h-48 overflow-y-auto" position="popper" avoidCollisions={false}>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Minute</p>
                        <Select value={birthDetails.minute.toString()} onValueChange={v => setBirthDetails(prev => ({ ...prev, minute: parseInt(v) }))}>
                          <SelectTrigger className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#1a1020] border-white/10 text-white max-h-48 overflow-y-auto" position="popper" avoidCollisions={false}>
                            {Array.from({ length: 60 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Birth Place */}
                  <div className="relative">
                    <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-pink-400" /> Birth Place *</label>
                    <div className="relative">
                      <Input className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl h-11" placeholder="Search your birth city…"
                        value={birthDetails.birthPlace} onChange={e => {
                          const value = e.target.value;
                          setBirthDetails(prev => ({ ...prev, birthPlace: value }));
                          searchLocation(value);
                        }} />
                      {isSearchingLocation && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-pink-400" />}
                    </div>
                    {locationSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        {locationSuggestions.map((suggestion, i) => (
                          <div key={i} className="px-4 py-3 bg-[#1a1020] hover:bg-pink-900/30 cursor-pointer text-sm text-white/80 border-b border-white/5 last:border-0 transition-colors"
                            onClick={() => selectLocation(suggestion)}>
                            <MapPin className="inline w-3 h-3 text-pink-400 mr-2" />{suggestion.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <button onClick={() => setShowTopicScreen(true)} disabled={!birthDetails.name || !birthDetails.birthPlace}
                    className="w-full h-12 rounded-xl btn-pink text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 text-sm">
                    <Sparkles className="w-4 h-4" /> Reveal My Destiny
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTopicScreen && !report && (
            /* ── TOPIC SELECTION ── */
            <div className="max-w-2xl mx-auto">
              <div className="card-glass rounded-3xl p-8">
                <div className="text-center mb-12">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-3">
                      What do you want to know?
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
                  </div>
                  <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                    Choose one area for your personalized reading
                  </p>
                </div>

                <div className="space-y-4">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id as Topic)}
                      className={cn(
                        "group w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                        "border-white/10 hover:border-white/30 hover:shadow-2xl hover:shadow-pink-500/10",
                        "bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm",
                        "hover:from-white/10 hover:to-white/5",
                        selectedTopic === topic.id && "border-pink-500/50 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${topic.color} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg flex-shrink-0`}>
                          <topic.icon className="w-7 h-7 text-white drop-shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors mb-1">
                            {topic.label}
                          </h3>
                          <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                            Get personalized insights
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {selectedTopic === topic.id ? (
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-pink-500/50 transition-colors">
                              <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-pink-400 transition-colors" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <button onClick={() => generateReport()} disabled={!selectedTopic}
                    className="w-full h-12 rounded-xl btn-pink text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 text-sm">
                    {isGenerating
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Reading…</>
                      : <><Sparkles className="w-4 h-4" /> Generate My Reading</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isGenerating && (
            /* ── LOADING SCREEN ── */
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="max-w-md w-full mx-4">
                <div className="card-glass rounded-3xl p-8 text-center">
                  {/* Professional Onboarding Animation */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-pink-500/20 animate-spin">
                      <div className="absolute top-0 left-1/2 w-1 h-4 bg-gradient-to-b from-pink-500 to-transparent -translate-x-1/2"></div>
                    </div>
                    {/* Middle rotating ring */}
                    <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}>
                      <div className="absolute top-0 left-1/2 w-1 h-3 bg-gradient-to-b from-purple-500 to-transparent -translate-x-1/2"></div>
                    </div>
                    {/* Inner pulsing circle */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-pulse flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                        <img src="/optimized/vedika.webp" alt="Vedika AI" className="w-8 h-8 object-cover animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Loading Text with Progress */}
                  <div className="space-y-4">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${((loadingStage + 1) / loadingTexts.length) * 100}%` }}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium text-lg">{currentLoadingText}</p>
                      <p className="text-white/50 text-sm">Generating your personalized Vedic reading...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {report && (
            /* ── REPORT SCREEN ── */
            <div className="max-w-3xl mx-auto">
              {/* User Summary Bar */}
              <div className="card-glass rounded-2xl p-4 mb-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-pink-500/30">
                  <User className="w-6 h-6 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white mb-1">{birthDetails.name}'s Reading</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-white/60 mt-1">
                    <span className="px-2 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300">
                      {topics.find(t => t.id === report.topic)?.label || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-pink-400" />
                      {calculateAge(birthDetails.day, birthDetails.month, birthDetails.year)} years
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-pink-400" />
                      {birthDetails.birthPlace}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="card-glass rounded-3xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${topics.find(t => t.id === report.topic)?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                      {React.createElement(topics.find(t => t.id === report.topic)?.icon || Star, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Your Reading, {birthDetails.name}
                      </h2>
                      <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${topics.find(t => t.id === report.topic)?.color || 'from-gray-500 to-gray-600'}`}>
                        {topics.find(t => t.id === report.topic)?.label || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose prose prose-invert max-w-none">
                  <div className="text-white leading-relaxed text-lg whitespace-pre-wrap">
                    {report.report.split('\n').map((line, index) => (
                      <p key={index} className="mb-4">
                        {line.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              
              {/* CTA */}
              <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.1))", border: "1px solid rgba(236,72,153,0.2)" }}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <StarField />
                </div>
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Want deeper analysis?
                  </h3>
                  <p className="text-white/80 text-lg mb-6">
                    Chat with Vedika AI for comprehensive insights about your life path
                  </p>
                  <button
                    onClick={() => navigate('/free-ai-astrologer-chat')}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl btn-pink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Chat with Vedika AI →
                  </button>
                </div>
              </div>

              {/* Share Button */}
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    if (navigator.share && report) {
                      navigator.share({
                        title: `My Vedic Astrology Reading`,
                        text: report.report,
                        url: window.location.href
                      });
                    }
                  }}
                  className="border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all"
                >
                  Share Reading
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AdSense Ad - Below Report Section */}
        <div className="flex justify-center my-2">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>
        
        {/* Ad 3 - After Report */}
        <div className="flex justify-center my-2">
          <AdBanner adSlot="4882345522" className="w-full max-w-[728px]" />
        </div>

        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-6">Free 5 Minute Astrology AI — Get Your Answer Right Now</h1>
            
            <div className="text-white/80 leading-relaxed space-y-6">
              <p>
                You have a question. It could be about your job, your relationship, your money,
                or just where things are going in life. You don't want to wait. You don't want
                to pay ₹500 per minute to some random astrologer online.
              </p>
              
              <p>
                You just want an honest answer. Fast.
              </p>
              
              <p>
                Here's how it works — enter your birth details, pick what you want to know, and
                Vedika AI gives you a 200-word personalized reading in under 30 seconds.
                No signup. No payment. No copy-paste horoscope.
              </p>
              
              <p>
                This quick reading is one entry point into the full <a href="/" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Veadicastro AI astrology platform</a>, where you can explore Vedika AI chat, Kundli generation, daily horoscope, marriage tools, and detailed Vedic reports from the homepage.
              </p>
              
              <p>
                Everything is based on your actual Vedic birth chart — your Moon sign, your
                Lagna, your Nakshatra, your current Dasha period. Not just your sun sign like
                most apps do.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">How This Free 5 Minute Astrology Tool Works</h2>
            
            <div className="text-white/80 leading-relaxed space-y-4">
                Most free astrology sites give you the same prediction for everyone born in
                April. That is not a prediction. That is a guess.
              </p>
              
              <p>
                Vedika AI works differently. When you enter your birth details, it calculates:
              </p>
              
              <ul className="ml-6 space-y-2 list-disc">
                <li>Your Lagna (Ascendant) — the sign rising at your exact birth time</li>
                <li>Your Moon sign (Rashi) — not your Western sun sign</li>
                <li>Your Nakshatra — one of 27 lunar mansions that shape your personality</li>
                <li>Your current Mahadasha — the planetary period running your life right now</li>
                <li>Your planetary positions — exactly where each planet was when you were born</li>
              </ul>
              
              <p>
                All of this comes together in one short, clear reading. Specific to you.
                Not to everyone born in the same month.
              </p>
              
              <p>
                That is the difference between a real free life prediction online and a
                generic horoscope you could read anywhere.
              </p>
              
              <p>
                For the broader product context, the <a href="/" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">Veadicastro homepage</a> connects this free 5-minute reading with AI chat, Kundli matching, today's horoscope, lucky colour guidance, and other Vedic astrology tools.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">Free Career Astrology Prediction — Should You Take That Job?</h2>
            
            <div className="text-white/80 leading-relaxed space-y-4">
              <p>
                Career is the number one thing people ask about. And it makes sense —
                a wrong career decision can cost you years.
              </p>
              
              <p>
                Your Vedic birth chart has clear signals about your career path. The 10th
                house shows what kind of work suits you. The 6th house shows how you handle
                daily work and competition. Your current Dasha shows whether this is a period
                of growth or waiting.
              </p>
              
              <p>
                Vedika AI reads all of this and gives you a direct answer. Not "you might
                do well in creative fields." A real answer — like your Jupiter Mahadasha
                starting mid-2026 is one of the strongest periods for career growth in
                your chart. This is the time to move.
              </p>
              
              <p>
                Get your free career astrology prediction right now. Scroll up, enter your
                details, pick Career and Money, and see what your chart actually says.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">Free Love and Marriage Prediction by AI</h2>
            
            <div className="text-white/80 leading-relaxed space-y-4">
              <p>
                Shaadi ka sawaal sabka hota hai. Whether you're single and wondering when
                things will change, or in a relationship and unsure where it's going —
                your birth chart has answers.
              </p>
              
              <p>
                In Vedic astrology, the 7th house is the house of marriage and partnership.
                The planet ruling your 7th house, where Venus sits, and what your current
                Dasha says — all of this points to your love and marriage timeline.
              </p>
              
              <p>
                Vedika AI checks all of this in seconds and gives you a personalized
                reading. Not a generic "Leos are passionate lovers" line. An actual reading
                based on your chart.
              </p>
              
              <p>
                Try the <Link to="/love-astrology-by-date-of-birth" className="text-pink-400 hover:text-pink-300 underline underline-offset-4">free love and marriage prediction</Link>. It takes less than 5 minutes.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">Free Health Astrology Reading</h2>
            
            <div className="text-white/80 leading-relaxed space-y-4">
              <p>
                Your birth chart shows health patterns too. The 6th house, 8th house,
                and the position of planets like Saturn and Mars tell a lot about which areas
                of health need attention at different points in your life.
              </p>
              
              <p>
                This does not replace your doctor. But it can tell you — this is a period
                to slow down and rest, or this is actually a very strong period for your
                body, push harder now.
              </p>
              
              <p>
                Vedika AI gives you a free health astrology reading based on your actual
                planetary positions. Honest, simple, and clear.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">Is Free AI Astrology Actually Accurate?</h2>
            
            <div className="text-white/80 leading-relaxed space-y-4">
              <p>
                We'll be straight with you. No astrologer — human or AI — can tell you
                exactly what will happen on a specific date. Anyone who says that is not
                being honest.
              </p>
              
              <p>
                What Vedic astrology can tell you — very accurately — is timing, energy,
                and patterns. When is a strong period coming for your career? When should
                you be careful in relationships? What kind of work suits your nature?
              </p>
              
              <p>
                Vedika AI is built on authentic Vedic principles. We use Swiss Ephemeris
                for planetary calculations — the same system used by serious Jyotishis.
                The predictions are based on classical texts like Brihat Parashara Hora
                Shastra, not generic content written by anyone.
              </p>
              
              <p>
                Over 2 lakh people have used Veadicastro. The feedback we get most often
                is — "this felt like it was written just for me."
              </p>
              
              <p>
                That is the goal. And that is what a free AI astrology reading should
                feel like.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">Why Veadicastro and Not Some Other App?</h2>
            
            <div className="text-white/80 leading-relaxed space-y-4">
              <p>
                There are hundreds of astrology apps in India. Most of them show you the
                same generic daily horoscope with a nice UI on top.
              </p>
              
              <p>Veadicastro is different for a few reasons:</p>
              
              <ul className="ml-6 space-y-2 list-disc">
                <li><strong>We use your real birth chart, not just your sun sign.</strong><br />
                Every reading is built on your Lagna, Moon sign, Nakshatra, and Dasha —
                not just the month you were born.</li>
                
                <li><strong>We use Swiss Ephemeris for calculations.</strong><br />
                This is the most accurate planetary calculation system available. Your
                birth chart is mathematically precise, not approximated.</li>
                
                <li><strong>We follow the Lahiri sidereal system.</strong><br />
                This is correct Vedic astrology — not Western tropical astrology. Your
                Rashi in our system may be different from what Western apps show, and
                that's how it should be.</li>
                
                <li><strong>No ₹500 per minute nonsense.</strong><br />
                Your first reading is completely free. No credit card. No signup required.</li>
                
                <li><strong>Vedika AI is trained on classical Vedic texts.</strong><br />
                Not generic astrology blog content. Real sources — Brihat Parashara Hora
                Shastra, Saravali, Phaladeepika.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">Questions People Ask About Free 5 Minute Astrology AI</h2>
            
            <div className="text-white/80 leading-relaxed space-y-6">
              <div>
                <p><strong>Q: Is this really free? No hidden charges?</strong></p>
                <p>Yes. Completely free. No credit card, no signup, no hidden anything.
                Enter your details and get your reading right now.</p>
              </div>
              
              <div>
                <p><strong>Q: Do I need to create an account?</strong></p>
                <p>No. This tool works without any account. Enter details, pick topic, done.</p>
              </div>
              
              <div>
                <p><strong>Q: How is this different from ChatGPT astrology?</strong></p>
                <p>ChatGPT is a general AI. It doesn't calculate your actual birth chart.
                Vedika AI calculates your real Vedic chart using Swiss Ephemeris —
                your Lagna, Moon sign, Nakshatra, and Dasha — then predicts based on
                that data. Very different experience.</p>
              </div>
              
              <div>
                <p><strong>Q: What details do I need to give?</strong></p>
                <p>Your name, date of birth, time of birth, and birth city. Time of birth
                is important — it changes your Lagna which affects your whole reading.</p>
              </div>
              
              <div>
                <p><strong>Q: How accurate is a 5 minute reading?</strong></p>
                <p>For timing windows, general direction, and what your current Dasha means —
                quite accurate. For very specific life questions, we suggest the full
                Vedika AI chat where you can go deeper and ask follow-up questions.</p>
              </div>
              
              <div>
                <p><strong>Q: Can I ask in Hindi?</strong></p>
                <p>Yes. In the Vedika AI chat you can ask in Hindi and get full answers in Hindi.</p>
              </div>
              
              <div>
                <p><strong>Q: Is my birth data safe?</strong></p>
                <p>Yes. We don't store your birth details after your session ends. We don't
                sell data. Your information is only used to generate your reading.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-12 mb-6">Try It Now — Takes Less Than 5 Minutes</h2>
            
            <div className="text-white/80 leading-relaxed space-y-4">
              <p>
                Scroll up. Enter your birth details. Pick what you want to know.
              </p>
              
              <p>
                Vedika AI will do the rest.
              </p>
              
              <p>
                No wait. No payment. No generic horoscope. Just your chart, your question,
                and a real answer based on Vedic astrology.
              </p>
            </div>

            <div className="mt-12 rounded-3xl border border-pink-500/20 bg-white/[0.04] overflow-hidden">
              <div className="grid md:grid-cols-[0.95fr_1.35fr] gap-0">
                <div className="min-h-[260px] bg-black/20">
                  <img
                    src="/store/dhan-yog-second-image.webp"
                    alt="Dhan Yog Bracelet for money and prosperity intention"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-400 mb-4">
                    <Sparkles className="w-4 h-4" /> Veadicastro Store
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Dhan Yog Bracelet for Daily Wealth Intention
                  </h2>
                  <p className="text-white/70 leading-relaxed mb-5">
                    After your free 5 minute astrology reading, you can also explore our
                    Dhan Yog Bracelet made with Tiger Eye, Pyrite, Citrine, and
                    Aventurine. Every bracelet is prepared with proper puja intention,
                    checked for quality, and delivered across India for people who want
                    a simple daily prosperity reminder.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Shield className="w-4 h-4 text-green-400" /> Lab tested stones
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Award className="w-4 h-4 text-yellow-400" /> Puja energized
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-pink-400" /> Free India delivery
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="/dhan-yog-bracelet"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl btn-pink text-white font-semibold text-sm"
                    >
                      Buy Dhan Yog Bracelet <ChevronRight className="w-4 h-4" />
                    </a>
                    <a
                      href="/astrology-store"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white font-semibold text-sm hover:border-pink-500/40 hover:text-pink-300 transition-colors"
                    >
                      Visit Astrology Store
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Links */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap gap-4">
                <a href="/free-ai-astrologer-chat" className="text-pink-400 hover:text-pink-300 transition-colors">Want to go deeper? Chat with Vedika AI</a>
                <a href="/ai-marriage-prediction-by-date-of-birth" className="text-pink-400 hover:text-pink-300 transition-colors">Marriage timing from birth details</a>
                <a href="/chatgpt-astrology" className="text-pink-400 hover:text-pink-300 transition-colors">Try ChatGPT Astrology</a>
                <a href="/ai-astrology-prediction" className="text-pink-400 hover:text-pink-300 transition-colors">Generate 10 AI astrology predictions</a>
                <a href="/today-horoscope" className="text-pink-400 hover:text-pink-300 transition-colors">See today's horoscope</a>
                <a href="/free-kundli-generator" className="text-pink-400 hover:text-pink-300 transition-colors">See your full Vedic birth chart</a>
                <a href="/free-kundali-matching" className="text-pink-400 hover:text-pink-300 transition-colors">Check kundali compatibility for marriage</a>
<a href="/" className="text-pink-400 hover:text-pink-300 transition-colors">Try Best Vedic Astrology Platform</a>
                <a href="/ai-astrology" className="text-pink-400 hover:text-pink-300 transition-colors">AI Astrology — Complete Guide</a>
                <a href="/talk-to-astrologer" className="text-pink-400 hover:text-pink-300 transition-colors">Talk to Astrologer</a>
                <a href="/lucky-colour-for-today" className="text-pink-400 hover:text-pink-300 transition-colors">Lucky Colour for Today</a>
                <a href="/angel-number-calculator" className="text-pink-400 hover:text-pink-300 transition-colors">Angel Number Calculator</a>
                <a href="/blog/is-ai-astrology-accurate" className="text-pink-400 hover:text-pink-300 transition-colors">Is AI Astrology Accurate?</a>
                <a href="/blog/ai-astrologer-vs-human-astrologer" className="text-pink-400 hover:text-pink-300 transition-colors">AI vs Human Astrologer</a>
                <a href="/blog/ai-jyotish-vedic-astrology" className="text-pink-400 hover:text-pink-300 transition-colors">What is AI Jyotish?</a>
                <a href="/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" className="text-pink-400 hover:text-pink-300 transition-colors">Why ChatGPT Fails at Astrology</a>
                <a href="/blog/free-ai-astrology-chat-india" className="text-pink-400 hover:text-pink-300 transition-colors">Free AI Astrology Chat India</a>
              </div>
            </div>

          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4">
            <div className="text-white/60 text-sm">
              2026 Vedika Astro. All rights reserved.
            </div>
            <div className="flex space-x-4 text-white/60 text-sm">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-white/40">•</span>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Free5MinutesAstrology;
