import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { useI18n } from "@/context/I18nContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VedikaAssistantPanel } from "@/components/QuestionsFab";
import PersonalizedWelcomePopup from "@/components/ComparisonPopup";
import ReviewsSection from "@/components/ReviewsSection";
import {
  User,
  DollarSign,
  FileText,
  Calendar,
  Globe,
  Send,
  Menu,
  Sparkles,
  Heart,
  TrendingUp,
  Wallet,
  ChevronRight,
  ArrowRight,
  Bell,
  Users,
  Receipt,
  MessageCircle,
  Star,
  Lock,
  ChevronLeft,
  Home,
  Settings,
  CheckCircle,
  ShoppingBag,
} from "lucide-react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGemini, VAANI_SYSTEM_PROMPT } from "@/lib/gemini";
import { getNakshatraLord, getYoni } from "@/lib/astroCalc";
import { EnergyGauge } from "@/components/EnergyGauge";
import { getDailyLuckyData, sanitizeModelJson } from "@/lib/dailyInsights";
import { getLifeScores, getOverallScore, overallLabel, getMonthKey, scoreLabel } from "@/lib/monthlyInsights";
import { generateDashboardPrediction } from "@/lib/dailyPredictionsPipeline";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle potential race condition with lazy loading
  let i18nContext;
  try {
    i18nContext = useI18n();
  } catch (error) {
    // Fallback values if context is not available yet
    i18nContext = { t: (key: any) => String(key), lang: 'en' };
  }

  const { t, lang } = i18nContext;
  const { planName, canAccess, requireFeature, credits, purchasedReports, reportCredits, usedQuestions, canAskMoreQuestions, registerQuestionUsage } = usePlan();

  // Get referral from query params
  const searchParams = new URLSearchParams(location.search);
  const referral = searchParams.get("referral") || "dashboard";


  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [question, setQuestion] = useState("");
  const [activeTab, setActiveTab] = useState("today");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const promoIconUrl = "";
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState<"instruction" | "future" | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [astroBasics, setAstroBasics] = useState({
    vedicSign: "Not set",
    dob: "Not set",
    time: "Not set",
    place: "Not set",
  });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayVibe, setDayVibe] = useState<Record<string, string>>({}); // dateKey -> vibe string
  const [dayVibeLoading, setDayVibeLoading] = useState<Record<string, boolean>>({}); // dateKey -> bool
  // monthlySummaryLoading declared above; old monthly state removed
  const pendingDateRef = useRef<string | null>(null);
  const midnightTimerRef = useRef<number | null>(null);
  const OFFER_END_DATE = new Date('2026-06-02T23:59:59+05:30').getTime();
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const diff = Math.max(0, OFFER_END_DATE - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  });

  const displayName = (() => { try { return localStorage.getItem('profile_name') || user?.displayName || user?.email?.split("@")[0] || "User"; } catch { return user?.displayName || user?.email?.split("@")[0] || "User"; } })();
  const userInitial = displayName.charAt(0).toUpperCase();
  const profilePhoto = (() => { try { return localStorage.getItem('profile_photo') || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU"; } catch { return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU"; } })();
  
  // Load profile preferences for daily/monthly predictions
  const showDailyPredictions = (() => {
    try {
      return localStorage.getItem("pref_daily") !== 'false';
    } catch {
      return true;
    }
  })();
  const showMonthlyPredictions = (() => {
    try {
      return localStorage.getItem("pref_monthly") !== 'false';
    } catch {
      return true;
    }
  })();

  const activityItems = [
    { id: "chat", label: "Chat with Vedika", icon: MessageCircle, isVedika: true },
    { id: "astrologer", label: "Talk to Astrologer", icon: MessageCircle },
    { id: "compatibility", label: "Compatibility", icon: Heart },
    { id: "report", label: "Report", icon: FileText },
    { id: "deepReports", label: "Deep Reports", icon: FileText },
    { id: "Pricing", label: "Pricing", icon: Receipt },
  ];

  const extractJsonBlock = (text: string) => {
    console.log("Raw AI response:", text); // Debug log
    
    // First, normalize any Devanagari digits to English digits
    let normalizedText = text.replace(/[\u0966-\u096F]/g, (d) => "0123456789"["\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F".indexOf(d)]);
    
    // Remove any common Hindi punctuation that might interfere
    normalizedText = normalizedText.replace(/[|]/g, '');
    
    const start = normalizedText.indexOf("{");
    const end = normalizedText.lastIndexOf("}");
    console.log("JSON boundaries:", { start, end, length: normalizedText.length }); // Debug log
    
    if (start === -1 || end === -1 || end <= start) {
      console.error("No JSON found in response, using fallback"); // Debug log
      // If no JSON found, create a fallback JSON structure
      return `{"love":"Unable to generate prediction","self":"Unable to generate prediction","wealth":"Unable to generate prediction","luckyNumber":7,"luckyColor":"Purple"}`;
    }
    const jsonBlock = normalizedText.slice(start, end + 1);
    console.log("Extracted JSON:", jsonBlock); // Debug log
    return jsonBlock;
  };

  // Sanitize LLM JSON so accidental newlines/characters don't break parsing
  const sanitizeModelJson = (raw: string) => {
    let cleaned = raw
      // Remove unescaped control characters
      .replace(/[\u0000-\u001f]+/g, " ")
      // Normalize Devanagari digits to English digits first
      .replace(/[\u0966-\u096F]/g, (d) => "0123456789"["\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F".indexOf(d)])
      // Normalize fancy punctuation that can sneak between tokens
      .replace(/[\u3001]/g, ",")
      .replace(/[""'']/g, '"')
      .replace(/[`]/g, "'")
      // Remove any other problematic characters
      .replace(/[|]/g, '');

    // Escape any raw newlines that appear inside quoted strings
    cleaned = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
      const inner = match.slice(1, -1).replace(/\r?\n/g, "\\n");
      return `"${inner}"`;
    });

    return cleaned;
  };

  const safeParseModelJson = <T extends Record<string, any>>(raw: string, fallback: T): T => {
    const cleaned = sanitizeModelJson(raw);
    try {
      return JSON.parse(cleaned) as T;
    } catch (parseErr) {
      console.warn("LLM JSON parse failed, using fallback", parseErr);
      // Try to salvage primary text field if present
      const textMatch = cleaned.match(/"text"\s*:\s*"([\s\S]*?)"/);
      if (textMatch) {
        return { ...fallback, text: textMatch[1].replace(/\\n/g, "\n") } as T;
      }
      return fallback;
    }
  };

  const normalizeDigits = (text: string) => text;

  const cleanText = (text: string) => {
    // Remove all markdown formatting
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
      .replace(/_(.*?)_/g, '$1')       // Remove italic _text_
      .replace(/`(.*?)`/g, '$1')       // Remove inline code `text`
      .replace(/#{1,6}\s/g, '')        // Remove headers # ## ### etc
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links [text](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images ![alt](url)
      .replace(/^\s*[-*+]\s+/gm, '• ') // Replace list markers with simple bullets
      .replace(/^\s*\d+\.\s+/gm, '• ') // Replace numbered lists with bullets
      .replace(/\n{3,}/g, '\n\n')     // Reduce multiple newlines to max 2
      .replace(/\s{2,}/g, ' ')        // Reduce multiple spaces to single
      .trim();
    
    // Apply normalizeDigits for Hindi numerals
    return normalizeDigits(cleaned);
  };

  const moreItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "language", label: "Switch Language", icon: Globe },
    { id: "notifications", label: "Notification Settings", icon: Bell },
    { id: "contact", label: "Contact", icon: Send },
  ];

  const tomorrowUnlocked = true; // Always unlocked - free for everyone
  // Lucky Colour & Number is now free for everyone
  
  // Check if user has paid plans (Deep Dive, Power Pack, Quick Ask)
  const hasPaidPlan = useMemo(() => {
    const paidPlanKeywords = ["deep dive", "power pack", "quick ask"];
    return paidPlanKeywords.some((keyword) => planName?.toLowerCase().includes(keyword));
  }, [planName]);

  const renderLockedFeatureCard = (title: string, description: string, opts?: { full?: boolean }) => (
    <Card
      className={cn(
        "p-4 sm:p-5 bg-card/30 border border-dashed border-secondary/50 rounded-2xl text-center flex flex-col items-center gap-2",
        opts?.full && "col-span-2 w-full"
      )}
    >
      <Lock className="w-5 h-5 text-secondary" />
      <p className="font-semibold">{title}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      <Button variant="cosmic" size="sm" onClick={() => navigate("/pricing?referral=locked")}>
        View Plans
      </Button>
    </Card>
  );

  const labelFor = (id: string, fallback: string) => {
    switch (id) {
      case "profile":
        return t("profile");
      case "astrologer":
        return t("talkToAstrologer");
      case "report":
      case "reports":
        return t("reportMenu");
      case "Pricing":
        return t("pricing");
      default:
        return fallback;
    }
  };

  const handleNav = (id: string) => {
    switch (id) {
      case "chat":
        navigate(`/chat?referral=dashboard`);
        break;
      case "profile":
        navigate(`/profile?referral=dashboard`);
        break;
      case "astrologer":
        navigate(`/talk-to-astrologer?referral=dashboard`);
        break;
      case "compatibility":
        navigate(`/compatibility?referral=dashboard`);
        break;
      case "report":
        navigate(`/reports?referral=dashboard`);
        break;
      case "deepReports":
        navigate(`/deep-reports?referral=dashboard`);
        break;
      case "Pricing":
        window.open("/pricing?referral=dashboard", "_blank");
        break;
      case "language":
        navigate(`/settings/language?referral=dashboard`);
        break;
      case "notifications":
        setNotificationsOpen(true);
        break;
      case "contact":
        window.open("/contact?referral=dashboard", "_blank");
        break;
      case "store":
        navigate(`/astrology-store?referral=dashboard`);
        break;
      case "rate":
        setRateOpen(true);
        break;
      default:
        setActiveSection(id);
    }
  };

  const storedPreds = (() => {
    try { return JSON.parse(localStorage.getItem('personal_predictions') || 'null'); } catch { return null; }
  })();


  const getTodayCacheKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `ai_today_${user?.uid || 'guest'}_${today}`;
  };

  const getTomorrowCacheKey = () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return `ai_tomorrow_${user?.uid || 'guest'}_${tomorrow}`;
  };

  const getMonthlyCacheKey = () => {
    const monthKey = getMonthKey(new Date());
    return `ai_monthly_full_${user?.uid || 'guest'}_${monthKey}`;
  };

  const getLocalDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const formatDailyDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const formatDayDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

  const todayDisplayDate = formatDailyDate(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDisplayDate = formatDailyDate(tomorrowDate);

  // Generate week dates starting from today (auto-sliding 7-day window)
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startDate = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Cleanup: remove past date predictions from localStorage on mount and daily
  useEffect(() => {
    const todayKey = getLocalDateKey(new Date());
    const prefix = `ai_daily_${user?.uid || 'guest'}_`;
    
    const removePastPredictions = () => {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(prefix)) {
            const datePart = key.replace(prefix, '');
            if (datePart < todayKey) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        if (keysToRemove.length > 0) {
          console.log(`[Dashboard] Cleaned up ${keysToRemove.length} past prediction(s)`);
        }
      } catch (e) {
        console.warn('[Dashboard] Failed to cleanup past predictions', e);
      }
    };

    removePastPredictions();
    const interval = setInterval(removePastPredictions, 3600000);
    return () => clearInterval(interval);
  }, [user?.uid]);

// Monthly prediction is now a static UI - no cache or fetch needed

  // ─── Day Vibe: short AI headline per date ───────────────────────────────────
  const fetchDayVibe = useCallback(async (date: Date, key: string) => {
    const cacheKey = `day_vibe_${user?.uid || 'guest'}_${key}`;
    // Check cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setDayVibe(prev => ({ ...prev, [key]: cached })); return; }
    } catch {}

    setDayVibeLoading(prev => ({ ...prev, [key]: true }));
    const dateFormatted = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    try {
      const prompt = `Date: ${dateFormatted}\nRespond with exactly 4-5 words describing this date. Output ONLY those words, no quotes, no punctuation, no explanation.`;
      const resp = await Promise.race([
        generateGemini(prompt, [], 'STRICT: Return exactly 4-5 words. NO punctuation, NO quotes, NO explanation, NO JSON. Only the short phrase.', 'en', undefined, 'secondary'),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      const words = resp.trim().replace(/^["']+|["']+$/g, '').replace(/[.,!?]+$/g, '').trim().split(/\s+/).filter(Boolean);
      const truncated = words.slice(0, 5).join(' ');
      if (truncated.length > 0) {
        setDayVibe(prev => ({ ...prev, [key]: truncated }));
        try { localStorage.setItem(cacheKey, truncated); } catch {}
      }
    } catch (e) {
      console.warn('[DayVibe] failed:', e);
    } finally {
      setDayVibeLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [user?.uid]);

  // Trigger day vibe fetch when date changes
  useEffect(() => {
    const key = getLocalDateKey(selectedDate);
    if (!dayVibe[key]) fetchDayVibe(selectedDate, key);
  }, [selectedDate, dayVibe, fetchDayVibe]);


  const colorMap: Record<string, string> = {
    "purple": "bg-purple-500",
    "gold": "bg-yellow-500",
    "blue": "bg-blue-500",
    "silver": "bg-gray-400",
    "emerald": "bg-emerald-500",
    "coral": "bg-orange-400",
    "rose": "bg-rose-500",
    "amber": "bg-amber-500",
    "jade": "bg-green-600",
    "sapphire": "bg-indigo-600",
    "turquoise": "bg-cyan-500",
    "indigo": "bg-indigo-500",
    "green": "bg-green-500",
    "red": "bg-red-500",
    "orange": "bg-orange-500",
    "yellow": "bg-yellow-400",
    "pink": "bg-pink-500",
    "white": "bg-white border border-gray-300",
    "black": "bg-black",
    "brown": "bg-amber-800",
  };

  const colorLabel = (c?: string) => {
    const key = (c || "").toLowerCase();
    switch (key) {
      case "purple": return t("luckyPurple");
      case "gold": return t("luckyGold");
      case "blue": return t("luckyBlue");
      case "silver": return t("luckySilver");
      case "emerald": return t("luckyEmerald");
      case "coral": return t("luckyCoral");
      case "rose": return t("luckyRose");
      case "amber": return t("luckyAmber");
      case "jade": return t("luckyJade");
      case "sapphire": return t("luckySapphire");
      case "turquoise": return t("luckyTurquoise");
      case "indigo": return t("luckyIndigo");
      default: return c || "";
    }
  };

  const getColorClass = (c?: string) => {
    const key = (c || "").toLowerCase();
    return colorMap[key] || "bg-purple-500";
  };



  const showDailyTabs = showDailyPredictions;
  const normalizedTab = useMemo(() => {
    const visible: string[] = [];
    visible.push("today");
    if (tomorrowUnlocked) visible.push("tomorrow");
    if (!visible.length) return "today";
    return visible.includes(activeTab) ? activeTab : visible[0];
  }, [activeTab, tomorrowUnlocked]);

  useEffect(() => {
    if (activeTab === "tomorrow" && !tomorrowUnlocked) {
      setActiveTab("today");
    }
  }, [activeTab, tomorrowUnlocked]);

  // Personalized question suggestions based on age
  useEffect(() => {
    let dobStr: string | null = null;
    try { dobStr = JSON.parse(localStorage.getItem('onboarding_details') || 'null')?.dob ?? null; } catch {}
    const now = new Date();
    const age = (() => {
      if (!dobStr) return null;
      const [y, m, d] = dobStr.split('-').map((n: string) => parseInt(n, 10));
      if (!y || !m || !d) return null;
      const b = new Date(y, m - 1, d);
      let a = now.getFullYear() - b.getFullYear();
      const mm = now.getMonth() - b.getMonth();
      if (mm < 0 || (mm === 0 && now.getDate() < b.getDate())) a--;
      return a;
    })();

    let base: string[] = [];
    if (age == null) {
      base = lang === "hi" ? [
        "मेरा अगला बड़ा अवसर क्या है?",
        "मैं अपने करियर की वृद्धि को कैसे तेज कर सकता हूँ?",
        "मेरे प्रेम जीवन में क्या है?",
        "इस महीने मुझे किस पर ध्यान देना चाहिए?",
      ] : [
        "What's my next big opportunity?",
        "How can I accelerate my career growth?",
        "What does my love life hold?",
        "What should I focus on this month?",
      ];
    } else if (age <= 17) {
      base = lang === "hi" ? [
        "मेरा जीवन में सच्चा उद्देश्य क्या है?",
        "कौन सा क्षेत्र मुझे सफलता देगा?",
        "मैं अपने फोकस और अध्ययन को कैसे सुधार सकता हूँ?",
        "मैं अपनी छुपी प्रतिभा को कैसे खोजूं?",
      ] : [
        "What career will make me rich and happy?",
        "Which field will bring me success?",
        "How can I improve my focus and studies?",
        "How do I discover my hidden talents?",
      ];
    } else if (age <= 25) {
      base = lang === "hi" ? [
        "मुझे अपना जीवनसाथी कब मिलेगा?",
        "मेरा करियर पथ कैसा दिखता है?",
        "क्या मेरा प्रेम जीवन संतोषजनक होगा?",
        "क्या अब नौकरी बदलने का सही समय है?",
        "क्या मुझे इस साल नौकरी/कॉलेज मिलेगी जो मैं चाहता हूँ?",
      ] : [
        "When will I find my soulmate?",
        "What does my career path look like?",
        "Will my love life be fulfilling?",
        "Is now the right time to change jobs?",
        "Will I get the job/college I want this year?",
      ];
    } else if (age <= 35) {
      base = lang === "hi" ? [
        "मैं परिवार और करियर को कैसे संतुलित करूं?",
        "क्या व्यवसाय शुरू करना सही कदम है?",
        "मैं वित्तीय स्थिरता कब प्राप्त करूंगा?",
        "मैं अपने रिश्तों को कैसे मजबूत करूं?",
      ] : [
        "How can I balance family and career?",
        "Is starting a business the right move?",
        "When will I achieve financial stability?",
        "How can I strengthen my relationships?",
      ];
    } else if (age <= 50) {
      base = lang === "hi" ? [
        "मेरी स्वास्थ्य और धन की संभावनाएं क्या हैं?",
        "मेरे बच्चों का भविष्य क्या है?",
        "मेरा अगला करियर सफलता कब होगी?",
        "मैं तनाव कैसे कम करूं और शांति कैसे पाऊं?",
      ] : [
        "What's my health and wealth outlook?",
        "What future awaits my children?",
        "When is my next career breakthrough?",
        "How can I reduce stress and find peace?",
      ];
    } else {
      base = lang === "hi" ? [
        "मैं स्थायी आंतरिक शांति कैसे पा सकता हूँ?",
        "सेवानिवृत्ति मुझे क्या लाएगी?",
        "मैं अपने स्वास्थ्य को कैसे बनाए रखूं?",
        "मैं पारिवारिक बंधनों को कैसे मजबूत करूं?",
      ] : [
        "How can I find lasting inner peace?",
        "What will retirement bring me?",
        "How can I maintain my health?",
        "How can I strengthen family bonds?",
      ];
    }
    setSuggestions(base.slice(0, 4));
  }, [lang]);

  useEffect(() => {
    const formatDate = (dob?: string | null) => {
      if (!dob || typeof dob !== "string") return "Not set";
      const parts = dob.split("-");
      if (parts.length !== 3) return dob;
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    };

    const loadAstroBasics = () => {
      let details: any = null;
      try {
        details = JSON.parse(localStorage.getItem("onboarding_details") || "null");
      } catch {
        details = null;
      }

      let planets: any[] | null = null;
      try {
        planets = JSON.parse(localStorage.getItem("astrology_planets") || "null");
      } catch {
        planets = null;
      }

      const ascendant = localStorage.getItem("ascendant");
      const moonSign =
        Array.isArray(planets) &&
        planets.find((p) => (p?.name || p?.planet)?.toLowerCase() === "moon")?.sign;

      setAstroBasics({
        vedicSign: ascendant || moonSign || "Not set",
        dob: formatDate(details?.dob),
        time: details?.time || "Not set",
        place: details?.place || "Not set",
      });
    };

    loadAstroBasics();
    window.addEventListener("storage", loadAstroBasics);
    return () => window.removeEventListener("storage", loadAstroBasics);
  }, []);

  const handleAskQuestion = () => {
    if (question.trim()) {
      setSending(true);
      const q = question.trim();
      setTimeout(() => {
        navigate(`/chat?referral=dashboard`, { state: { query: q } });
        setSending(false);
      }, 250);
    }
  };

  const handleTabChange = (val: string) => {
    if (val === "tomorrow") {
      // Tomorrow predictions are now free for everyone
      setActiveTab(val);
      return;
    }
    setActiveTab(val);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card/50 backdrop-blur-xl border-r border-border/60 transition-all duration-300 overflow-y-auto scrollbar-dark",
          sidebarCollapsed ? "w-14" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-col h-full">
          {/* User Profile */}
          <div className="p-6 border-b border-border/60">
            <div className="flex items-center justify-between mb-4">
              <h2 className={cn("font-semibold", sidebarCollapsed && "hidden")}>{t("you")}</h2>
            </div>
            {!sidebarCollapsed && (() => {
                const paidPlanKeywords = ["deep dive", "quick ask", "quick start", "power", "basic", "premium", "elite"];
                const isPro = paidPlanKeywords.some((keyword) => planName?.toLowerCase().includes(keyword));
                return (
                  <div onClick={() => navigate('/profile?referral=dashboard')} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-accent/10 cursor-pointer transition-colors">
                    <img src={profilePhoto} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-xs truncate">{displayName}</h3>
                        {isPro ? (
                          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-secondary/25 text-secondary border border-secondary/40 uppercase tracking-wide">
                            Pro ✦
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/40 uppercase tracking-wide">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                );
              })()}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
            {/* Questions & Reports */}
            {!sidebarCollapsed && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {credits} Question Credits {t("available")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {planName} Plan
                      </p>
                    </div>
                  </div>
                  <Button variant="cosmic" size="sm" onClick={() => navigate("/pricing?referral=dashboard")}>{t("buy")}</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/60">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-white" />
                    <div>
                      <p className="text-xs font-medium">{t("availableReports")}</p>
                      <p className="text-xs text-muted-foreground">
                        {reportCredits} Report Credits {t("available")}
                      </p>
                    </div>
                  </div>
                  <Button variant="cosmic" size="sm" onClick={() => navigate("/reports?referral=dashboard")}>
                    {t("open")}
                  </Button>
                </div>
              </div>
            )}

            {/* Activity Section */}
            <div>
              {!sidebarCollapsed && <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">{t("activity")}</h3>}
              <div className="space-y-1">
                {activityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                        sidebarCollapsed && "justify-center px-0 py-3"
                      )}
                    >
                      {item.isVedika ? (
                        <img 
                          src="/optimized/vedika.webp" 
                          alt="Vedika AI" 
                          className={cn(sidebarCollapsed ? "w-6 h-6" : "w-5 h-5", "rounded-full")}
                        />
                      ) : (
                        <Icon className={cn(sidebarCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                      )}
                      {!sidebarCollapsed && <span className="flex-1 text-left text-sm">{labelFor(item.id, item.label)}</span>}
                      {!sidebarCollapsed && <ChevronRight className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tool Section */}
            <div>
              {!sidebarCollapsed && <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">Tool</h3>}
              <div className="space-y-1">
                <button
                  onClick={() => handleNav("store")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                    sidebarCollapsed && "justify-center px-0 py-3"
                  )}
                >
                  {sidebarCollapsed ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span className="flex-1 text-left text-sm font-medium">Veadicastro Store</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    // Generate random session ID and navigate to chart
                    const sessionId = Math.random().toString(36).substr(2, 9);
                    navigate(`/chart/${sessionId}?referral=dashboard`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                    sidebarCollapsed && "justify-center px-0 py-3"
                  )}
                >
                  {sidebarCollapsed ? (
                    <span className="text-sm font-medium">Chart</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium">My Chart</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* More Section */}
            <div>
              {!sidebarCollapsed && <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">{t("more")}</h3>}
              <div className="space-y-1">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                        sidebarCollapsed && "justify-center px-0 py-3"
                      )}
                    >
                      <Icon className={cn(sidebarCollapsed ? "w-5 h-5" : "w-5 h-5")} />
                      {!sidebarCollapsed && <span className="flex-1 text-left text-sm">{labelFor(item.id, item.label)}</span>}
                      {!sidebarCollapsed && <ChevronRight className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                {!sidebarCollapsed ? (
                  <button
                    onClick={() => setAssistantOpen(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-secondary/10 hover:border-secondary/40 transition-colors"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden ring-1 ring-border/40">
                      <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" loading="lazy" />
                    </span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-foreground">Vedika Assistant</p>
                      <p className="text-xs text-muted-foreground">Instant help & onboarding</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary" />
                  </button>
                ) : (
                  <button
                    onClick={() => setAssistantOpen(true)}
                    className="w-full flex justify-center items-center h-12 rounded-2xl border border-border/60 bg-secondary/10"
                    aria-label="Open Vedika Assistant"
                  >
                    <img src="/optimized/vedika.webp" alt="Vedika" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                  </button>
                )}
              </div>
            </div>
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground text-center">© Veadicastro</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-md hover:bg-accent"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 overflow-y-auto bg-background scrollbar-dark", sidebarCollapsed ? "lg:ml-14" : "lg:ml-64")} style={{ scrollbarWidth: 'thin' }}>
        {/* Header as announcement bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/60 px-2 sm:px-3 lg:px-6 py-1 sm:py-2 lg:py-2.5">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1 sm:p-1.5 rounded-md hover:bg-accent"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-6 sm:w-3.5 sm:h-3.5" />
            </button>
            <div className="flex-1">
              <div className="rounded-sm bg-secondary/15 border border-border/60 px-1 sm:px-1.5 lg:px-2 py-0.5 sm:py-1 lg:py-1.5 text-xs sm:text-xs lg:text-sm text-muted-foreground text-center">
                <div className="inline-flex max-w-full items-center justify-center gap-1.5 text-foreground hover:text-secondary transition-colors">
                  <span className="flex min-w-0 flex-col items-center justify-center leading-tight sm:flex-row sm:gap-1.5 sm:leading-normal">
                    <span className="text-[11px] font-semibold sm:text-xs lg:text-sm">
                      🎉 {lang === "hi" ? "30 सवाल केवल 699" : "30 questions only 699"}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground sm:text-xs lg:text-sm">
                      {lang === "hi" ? "सीमित समय ऑफर - केवल आपके लिए" : "Limited Time offer - only for you"} <span className="font-extrabold text-white sm:text-base lg:text-lg">{displayName}</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
          {/* Ask Question Section */}
          <Card className={cn("p-5 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl transition-transform duration-300", sending && "-translate-y-4") }>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-border/60">
                <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h2 className="font-semibold">{displayName}, {t("askTitle")}</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  placeholder={t("askPlaceholder")}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                  className="h-14 bg-background/50 border-border/60 rounded-xl pr-16"
                />
                <Button
                  variant="cosmic"
                  size="icon"
                  onClick={handleAskQuestion}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-md"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="text-left text-xs sm:text-sm px-3 py-2 rounded-lg bg-background/50 border border-border/60 hover:bg-accent/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>

          {/* Astro Details section removed */}

          {/* Dhan Yog Bracelet product card removed */}

          {/* Best Seller Report removed */}

           {/* Offer Popup - Limited Time Deal */}
          <Card className="relative overflow-hidden p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 rounded-2xl mt-3 animate-pulse">
            <div className="absolute inset-0 opacity-30" style={{background:
              'radial-gradient(circle at 15% 20%, rgba(251,146,60,0.3) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(239,68,68,0.3) 0%, transparent 45%)'}} />
            <div className="relative flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold animate-blink">LIMITED TIME</span>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">Offer ends soon!</span>
                </div>
                <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-1">Get 30 Questions for just Rs.699!</h3>
                <p className="text-sm text-muted-foreground">Deep Dive with Vedika: Get precise answers on love, career, and wealth.</p>
              </div>
              <Button variant="cosmic" className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate("/pricing/onboarding?plan=The%20Power%20Pack&amount=699&type=pack")}>
                Grab Now
              </Button>
            </div>
          </Card>


          {/* Premium Calendar Strip with Daily Predictions */}
          {showDailyTabs && (
          <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-lg">Daily Predictions</h2>
                <p className="text-sm text-muted-foreground mt-1">Select any date to see your cosmic insights</p>
              </div>
            </div>

            {/* Calendar Strip - 7 Days */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDates.map((date, idx) => {
                const isSelected = getLocalDateKey(date) === getLocalDateKey(selectedDate);
                const isToday = getLocalDateKey(date) === getLocalDateKey(new Date());
                const isLocked = !hasPaidPlan && !isToday;
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      setSelectedDate(date);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl transition-all duration-200 border relative",
                      isSelected || isToday
                        ? "col-span-2 p-4 bg-gradient-to-br from-secondary/20 to-primary/20 border-secondary/50 shadow-lg shadow-secondary/20"
                        : isLocked
                        ? "p-3 bg-muted/30 border-dashed border-border/40 opacity-60 cursor-pointer hover:border-secondary/40"
                        : "p-3 bg-background/50 border-border/60 hover:border-secondary/40 hover:bg-accent/10",
                      isToday && !isSelected && "ring-2 ring-secondary/30"
                    )}
                  >
                    {isLocked && (
                      <Lock className="absolute top-2 right-2 w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-xs font-medium mb-1",
                      isSelected || isToday ? "text-secondary" : isLocked ? "text-muted-foreground" : "text-muted-foreground"
                    )}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={cn(
                      "text-lg font-bold",
                      isSelected || isToday ? "text-foreground" : isLocked ? "text-muted-foreground/60" : "text-foreground/80"
                    )}>
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className="mt-1 text-[10px] font-semibold text-secondary">Today</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Prediction Display */}
            {(() => {
              const dateKey = getLocalDateKey(selectedDate);
              const ld = getDailyLuckyData(user?.uid || 'guest', dateKey);
              const vibe = dayVibe[dateKey];
              const vibeLoading = dayVibeLoading[dateKey];
              const isToday = dateKey === getLocalDateKey(new Date());
              return (
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0e]">
                  <div className="relative p-5 sm:p-6">
                    {/* Date header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        <span className="text-xs font-semibold text-secondary/80 uppercase tracking-widest">
                          {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <Sparkles className="w-4 h-4 text-secondary/60" />
                    </div>

                    {/* Energy + Vibe row */}
                    <div className="flex items-start gap-4 mb-5">
                      <EnergyGauge value={ld.energy} size={76} strokeWidth={6} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">{lang === 'hi' ? `नमस्ते` : 'Hey'} <span className="font-semibold text-foreground">{displayName}</span> 👋</p>
                        {vibeLoading ? (
                          <div className="h-7 bg-white/5 rounded-lg animate-pulse w-4/5 mb-1" />
                        ) : vibe ? (
                          <p className="text-xl font-bold text-foreground leading-tight tracking-tight">{vibe}</p>
                        ) : (
                          <p className="text-xl font-bold text-foreground leading-tight">
                            {lang === 'hi' ? 'आपका दिन तैयार है' : 'Your Day Awaits'}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {lang === 'hi'
                            ? `आपकी ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} की भविष्यवाणियां तैयार हैं।`
                            : `${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} predictions are ready.`}
                        </p>
                      </div>
                    </div>

                    {/* Lucky pills */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                        <span className={cn('w-3 h-3 rounded-full inline-block flex-shrink-0', getColorClass(ld.luckyColor))} />
                        {ld.luckyColor}
                      </span>
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                        🔢 {ld.luckyNumber}
                      </span>
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                        ⚡ Energy {ld.energy}%
                      </span>
                    </div>

                    {/* CTA */}
                    <Button
                      variant="cosmic"
                      className="w-full h-10 rounded-xl text-sm font-semibold"
                      onClick={() => navigate(`/daily-prediction?date=${dateKey}&referral=dashboard`)}
                    >
                      {lang === 'hi' ? 'पूरी भविष्यवाणी पढ़ें' : 'View Full Prediction'}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              );
            })()}
          </Card>
          )}

          {/* Weekly Predictions removed */}

          {/* Monthly Predictions - Only show if monthly predictions are enabled */}
          {showMonthlyPredictions && (
            <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white/90">Monthly Prediction</h2>
                <span className="text-xs text-white/40">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <img 
                  src="/deep-reports-image/karma-chakra-horoscope.png" 
                  alt="Karma Chakra Horoscope" 
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/90 mb-1">
                    {displayName} - your {new Date().toLocaleDateString("en-US", { month: "long" })} predictions are ready
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed mb-3">
                    Click button to see your full monthly report
                  </p>
                  <Button
                    variant="cosmic"
                    size="sm"
                    className="h-9 rounded-lg text-sm font-semibold"
                    onClick={() => navigate(`/monthly-prediction?referral=dashboard`)}
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* AI Prediction Section */}
          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-border/60">
            <div className="p-6">
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="space-y-6">
                  <div className="bg-card/30 p-6 rounded-lg border border-border/40">
                    <div className="flex items-center gap-3 mb-4">
                      <img src="/optimized/vedika.webp" alt="Vedika AI" className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/40" />
                      <h2 className="text-xl font-bold text-white">Vedika AI Predicts</h2>
                    </div>
                    <h3 className="text-2xl font-bold text-accent mb-4">Your Planets Are Shifting — Find Out What's Coming Next</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Discover the secrets of your birth chart and unlock your full potential with Pandit JI.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white">Jupiter's current transit is activating key houses in most charts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white">Your active Dasha period holds answers about money and career</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white">Pandit ji will tell you exactly what your chart says — live on call</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <img 
                      src="/amanuniyalastrologe.webp" 
                      alt="Pandit Aman Uniyal - Expert Vedic Astrologer" 
                      className="w-48 h-48 rounded-full mx-auto border-4 border-accent/30 shadow-xl"
                    />
                    <span className="absolute -top-2 -right-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-semibold">Available Today</span>
                  </div>
                  <div className="bg-card/30 p-6 rounded-lg border border-border/40">
                    <h3 className="text-2xl font-bold text-white mb-2">Talk to P. Aman Uniyal</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-3xl font-bold text-accent">₹799</span>
                      <span className="text-muted-foreground">Unlimited</span>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Share your birth details and Pandit Aman Uniyal will read your actual chart — career, money, relationships, whatever's on your mind. Unlimited call, no timer running.
                    </p>
                    <Button
                      onClick={() => navigate('/talk-to-astrologer')}
                      className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Book Now - ₹799 Unlimited
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      ⚡ Available Now | 📞 Direct Call | 🔒 100% Private
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Reviews Section */}
          <ReviewsSection />

          
          
        </div>
      </main>

      {/* Vedika Assistant Modal */}
      <Dialog open={assistantOpen} onOpenChange={setAssistantOpen}>
        <DialogContent className="sm:max-w-sm bg-transparent border-none shadow-none p-0">
          <VedikaAssistantPanel
            onClose={() => setAssistantOpen(false)}
            className="w-full sm:w-[24rem]"
            hideCloseButton
          />
        </DialogContent>
      </Dialog>

      {/* Notification Settings Modal */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>Configure how you receive updates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Email Notifications</Label>
              <Switch id="email-notif" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notif">Push Alerts</Label>
              <Switch id="push-notif" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dnd">DND Hours</Label>
              <Switch id="dnd" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setNotificationsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rate Veadicastro Modal */}
      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Veadicastro</DialogTitle>
            <DialogDescription>We value your feedback.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} aria-label={`rate-${n}`}>
                  <Star className={cn("w-6 h-6", n <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Share your thoughts (optional)" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRateOpen(false)}>Close</Button>
            <Button variant="cosmic" onClick={() => setRateOpen(false)}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Modal for Instruction/Future */}
      <Dialog open={sectionModalOpen} onOpenChange={setSectionModalOpen}>
        <DialogContent>
          <div className="w-full flex items-center justify-center">
            <img src="/optimized/vedika.webp" alt="Vedika" className="h-16 w-16 rounded-full object-cover ring-2 ring-secondary/40" loading="lazy" />
          </div>
          <DialogHeader>
            <DialogTitle>{sectionName === "instruction" ? "Life Instruction" : sectionName === "future" ? "Your Future" : ""}</DialogTitle>
            <DialogDescription>
              {sectionName === "instruction"
                ? "Personalized, step-by-step guidance crafted from your kundali and planetary periods."
                : sectionName === "future"
                ? "Crystal-clear forecasts about love, career and wealth based on your current dasha and transits."
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 rounded-lg border border-border/60 p-4 bg-background/50">
            <div className="text-xs text-muted-foreground mb-1">Why this is accurate</div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Vedika analyzes your exact birth chart with divisional charts, ongoing Mahadasha/Antardasha,
              and present planetary transits. This multi-layer method removes guesswork and delivers
              precise, contextual {sectionName === "instruction" ? "life instructions" : "future insights"} for you.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setSectionModalOpen(false)}>Close</Button>
            <Button
              variant="cosmic"
              onClick={() => {
                const path = sectionName === "instruction" ? `/instruction?referral=dashboard` : `/future?referral=dashboard`;
                setSectionModalOpen(false);
                if (sectionName) navigate(path);
              }}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      
      {/* Premium Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6 text-center border-border/60 bg-card/95 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 py-2">
            <img
              src="/optimized/vedika.webp"
              alt="Vedika AI"
              className="w-20 h-20 rounded-full object-cover border-2 border-secondary/30 shadow-lg"
            />
            <div>
              <DialogTitle className="text-lg font-semibold">
                Hey {displayName}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                This feature is only for premium users. If you want to see this prediction, please upgrade to any plan.
              </DialogDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              variant="cosmic"
              className="w-full rounded-xl"
              onClick={() => {
                setShowUpgradeModal(false);
                navigate("/pricing?referral=upgrade");
              }}
            >
              Upgrade Now
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-xl text-muted-foreground"
              onClick={() => setShowUpgradeModal(false)}
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
  );
}
