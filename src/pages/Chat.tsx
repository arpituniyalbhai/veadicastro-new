import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Home, MessageSquare, Receipt, Plus, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Menu, Trash2, ChevronUp, Brain, LockKeyhole } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { usePlan } from "@/context/PlanContext";
import { generateGeminiStream, generateGemini, type ChatTurn } from "@/lib/gemini";
import { persistAstroPayload } from "@/lib/astroStorage";
import { getPlanetaryData } from "@/lib/astroCalc";
import { getDbInstance } from "@/lib/firebase";
import type { AstroInput } from "@/lib/astroCalc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type HighlightType = "dasha" | "house" | "year" | "date" | "career";

const PLANETS = "Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu";
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";
const CAREER_FIELDS = [
  "software engineering", "software development", "web development", "app development",
  "data science", "artificial intelligence", "machine learning", "cybersecurity", "technology",
  "coding", "programming", "research", "digital content", "content creation", "astrology",
  "teaching", "education", "marketing", "sales", "finance", "banking", "business",
  "entrepreneurship", "consulting", "management", "design", "law", "medicine", "healthcare",
  "government job", "civil services", "media", "writing",
];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const careerPattern = CAREER_FIELDS.sort((a, b) => b.length - a.length).map(escapeRegex).join("|");

const HIGHLIGHT_RULES: Array<{ type: HighlightType; regex: RegExp }> = [
  {
    type: "dasha",
    regex: new RegExp(
      `\\b(?:${PLANETS})(?:\\s*[-–]\\s*(?:${PLANETS}))?\\s+(?:Mahadasha|Antardasha|Dasha)\\b`,
      "gi"
    ),
  },
  { type: "house", regex: /\b(?:1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th)(?:\s+house)?\b/gi },
  {
    type: "date",
    regex: new RegExp(`\\b(?:(?:${MONTHS})\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,)?\\s+\\d{4}|\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})(?:\\s+\\d{4})?|(?:${MONTHS})\\s+\\d{4})\\b`, "gi"),
  },
  { type: "date", regex: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g },
  { type: "date", regex: new RegExp(`\\b(?:${MONTHS})\\b`, "gi") },
  { type: "year", regex: /\b(?:19|20|21)\d{2}\b/g },
  { type: "career", regex: new RegExp(`\\b(?:${careerPattern})\\b`, "gi") },
];

interface HighlightMatch { start: number; end: number; value: string; type: HighlightType; }

function getHighlights(text: string): HighlightMatch[] {
  const matches: HighlightMatch[] = [];
  for (const rule of HIGHLIGHT_RULES) {
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    for (const match of text.matchAll(regex)) {
      if (match.index === undefined) continue;
      matches.push({ start: match.index, end: match.index + match[0].length, value: match[0], type: rule.type });
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const filtered: HighlightMatch[] = [];
  let lastEnd = -1;
  for (const match of matches) {
    if (match.start >= lastEnd) { filtered.push(match); lastEnd = match.end; }
  }
  return filtered.slice(0, 3);
}

function highlightAstroText(text: string): React.ReactNode[] {
  const matches = getHighlights(text);
  if (!matches.length) return [text];
  const output: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    if (match.start > cursor) output.push(text.slice(cursor, match.start));
    output.push(
      <span key={`${match.start}-${match.end}-${index}`} className="rounded-sm bg-secondary/15 px-0.5 font-semibold text-foreground" data-highlight-type={match.type}>
        {match.value}
      </span>
    );
    cursor = match.end;
  });
  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

// ─── Chat Session Types ───────────────────────────────────────────────────────
interface ChatSession {
  id: string;
  title: string;
  messages: ChatTurn[];
  createdAt: number;
  updatedAt: number;
}

type VedikaMemory = Record<string, string>;

const MEMORY_QUESTIONS = [
  {
    key: "maritalStatus",
    question: "What is your current marital status?",
    options: ["Single", "In a relationship", "Engaged", "Married", "Divorced", "Prefer not to say"],
  },
  {
    key: "professionalStatus",
    question: "What are you currently doing professionally?",
    options: ["Job", "Business", "Student", "Freelancer", "Looking for work", "Other"],
  },
  {
    key: "professionalField",
    question: "If you’re working, what field or profession are you in?",
    placeholder: "Example: IT, Government, Healthcare, Finance, Education",
  },
  {
    key: "lifeFocus",
    question: "What is your main focus in life right now?",
    options: ["Career", "Business", "Marriage", "Relationship", "Money", "Education", "Family", "Health", "Spiritual growth"],
  },
  {
    key: "guidanceStyle",
    question: "How do you prefer your astrology guidance?",
    options: ["Short & direct", "Detailed", "Detailed with remedies"],
  },
  {
    key: "additionalContext",
    question: "Please add anything else you want Vedika to remember.",
    placeholder: "Your goal, concern, or any detail that would help Vedika guide you better",
  },
];

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function truncateTitle(text: string, max = 30) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

const SidebarItem = ({ to, icon: Icon, label, expanded, selected, onClick, isMobileOpen }:
  { to: string; icon: any; label: string; expanded: boolean; selected?: boolean; onClick?: (e: React.MouseEvent) => void; isMobileOpen?: boolean }) => {
  // On mobile, show labels when sidebar is open; on desktop, use expanded state
  const showLabel = isMobileOpen || expanded;
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={() =>
        `group flex items-center ${showLabel ? "w-full h-11 justify-start gap-3 px-4" : "h-12 w-12 justify-center"} 
         rounded-full border bg-card/60 border-border/60 transition-all overflow-hidden 
         ${selected ? "border-secondary/70 shadow-[0_0_0_3px_rgba(236,72,153,0.35)]" : "hover:border-secondary/40 hover:shadow-[0_0_0_2px_rgba(236,72,153,0.2)]"}`
      }
      title={label}
    >
      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
      {showLabel && <span className="text-sm text-foreground/90">{label}</span>}
    </NavLink>
  );
};

export default function Chat() {
  const location = useLocation() as any;
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { planName, credits, canAccess, canAskMoreQuestions, registerQuestionUsage, useQuickPackQuestion, deductCredit } = usePlan();
  const remainingQuestions = Math.max(credits, 0);

  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 10, seconds: 0 });

  // Get referral from query params
  const searchParams = new URLSearchParams(location.search);
  const referral = searchParams.get("referral") || "chat";

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  const initial = location?.state?.query || "";
  const [message, setMessage] = useState(initial);
  const [sending, setSending] = useState(false);
  // Keep sidebar closed on mobile, open on desktop
  const [sidebarExpanded, setSidebarExpanded] = useState(window.innerWidth >= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Always start closed on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Ensure sidebar is closed on mobile on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // Close on initial mount if mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Do NOT auto-send initial query from dashboard; only prefill the input
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  // Session states
  const sessionsKey = useMemo(() => `chat_sessions_${user?.email || "guest"}`, [user?.email]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatTurn[]>([]);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);
  const userScrolledUp = useRef(false);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [showScrollFab, setShowScrollFab] = useState(false);
  // Show suggestions the first time until typing or first message is sent
  const [hasChatted, setHasChatted] = useState<boolean>(false);
  const [hasTyped, setHasTyped] = useState<boolean>(false);
  const [answerSuggestions, setAnswerSuggestions] = useState<Record<number, string[]>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<number, boolean>>({});
  const [showMemoryPrompt, setShowMemoryPrompt] = useState(false);
  const [showMemoryQuestions, setShowMemoryQuestions] = useState(false);
  const [showMemoryLocked, setShowMemoryLocked] = useState(false);
  const [showMemoryReset, setShowMemoryReset] = useState(false);
  const [memoryStep, setMemoryStep] = useState(0);
  const [memoryAnswers, setMemoryAnswers] = useState<VedikaMemory>({});
  const [memoryText, setMemoryText] = useState("");
  const [inputBarLeft, setInputBarLeft] = useState<string>('0');
  const assistantAvatarUrl = "/optimized/vedika.webp"; // Vedika avatar from public
  const userAvatarUrl = (() => { try { return localStorage.getItem('profile_photo') || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU"; } catch { return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU"; } })(); // user's avatar
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openedMemoryFromNavigation = useRef(false);

  const memoryStorageKey = useMemo(() => `vedika_memory_${user?.email || "guest"}`, [user?.email]);
  const isMemoryEligible = useMemo(() => {
    const plan = (planName || "").toLowerCase();
    return ["quick ask", "deep dive", "power pack"].some((name) => plan.includes(name));
  }, [planName]);

  useEffect(() => {
    if (!user || !isMemoryEligible) {
      setShowMemoryPrompt(false);
      return;
    }
    try {
      if (!localStorage.getItem(memoryStorageKey)) setShowMemoryPrompt(true);
    } catch {
      // Local memory is optional when browser storage is unavailable.
    }
  }, [user, isMemoryEligible, memoryStorageKey]);

  const saveMemoryAnswer = (value: string) => {
    const question = MEMORY_QUESTIONS[memoryStep];
    const nextAnswers = { ...memoryAnswers, [question.key]: value.trim() || "Not provided" };
    if (memoryStep === MEMORY_QUESTIONS.length - 1) {
      try { localStorage.setItem(memoryStorageKey, JSON.stringify(nextAnswers)); } catch {}
      setMemoryAnswers(nextAnswers);
      setShowMemoryQuestions(false);
      setShowMemoryPrompt(false);
      return;
    }
    setMemoryAnswers(nextAnswers);
    setMemoryStep((step) => step + 1);
    setMemoryText("");
  };

  const startMemoryQuestions = () => {
    setMemoryStep(0);
    setMemoryAnswers({});
    setMemoryText("");
    setShowMemoryPrompt(false);
    setShowMemoryQuestions(true);
  };

  const openMemory = () => {
    if (!isMemoryEligible) {
      setShowMemoryLocked(true);
      return;
    }
    try {
      if (localStorage.getItem(memoryStorageKey)) {
        setShowMemoryReset(true);
        return;
      }
    } catch {
      // Continue with a new memory profile if browser storage is unavailable.
    }
    startMemoryQuestions();
  };

  const resetMemory = () => {
    try { localStorage.removeItem(memoryStorageKey); } catch {}
    setShowMemoryReset(false);
    startMemoryQuestions();
  };

  useEffect(() => {
    if (location?.state?.openMemory && !openedMemoryFromNavigation.current) {
      openedMemoryFromNavigation.current = true;
      openMemory();
    }
  }, [location?.state?.openMemory]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const displayName = (() => {
    try {
      return localStorage.getItem('profile_name') ||
             user?.displayName ||
             "User";
    } catch {
      return user?.displayName || "User";
    }
  })();

  // Dynamic thinking messages
  const thinkingUserName = displayName.trim().split(/\s+/)[0] || "User";

  // Cycle through processing messages in a different order for each answer.
  useEffect(() => {
    if (!isTyping) {
      setThinkingMessage("");
      return;
    }

    let previousMessage = "";
    const showRandomMessage = () => {
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date());
      const messages = [
        `Loading ${thinkingUserName}'s birth profile...`,
        `Calculating ${thinkingUserName}'s planetary positions...`,
        `Mapping houses and ascendant for ${thinkingUserName}...`,
        "Running Dasha and Nakshatra calculations...",
        "Reading current planetary transits...",
        `Reviewing ${formattedDate} planetary positions for ${thinkingUserName}...`,
      ];
      const availableMessages = messages.filter((message) => message !== previousMessage);
      const nextMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];

      previousMessage = nextMessage;
      setThinkingMessage(nextMessage);
    };

    showRandomMessage();

    const interval = setInterval(() => {
      showRandomMessage();
    }, 1000); // Change message every second

    return () => clearInterval(interval);
  }, [isTyping, thinkingUserName]);

  // Update input bar position based on sidebar state and screen size
  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth >= 768) {
        setInputBarLeft(sidebarExpanded ? '16rem' : '5rem');
      } else {
        setInputBarLeft('0');
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [sidebarExpanded]);

  // Shared countdown timer effect (syncs with Dashboard and Pricing)
  useEffect(() => {
    const COUNTDOWN_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    const STORAGE_KEY = 'shared_countdown_start';
    
    const timer = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const elapsed = Date.now() - parsed.startTime;
          const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
          
          if (remaining === 0) {
            // Reset countdown
            const newStartTime = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: newStartTime }));
            setTimeRemaining({ hours: 0, minutes: 10, seconds: 0 });
          } else {
            const totalSeconds = Math.floor(remaining / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            setTimeRemaining({ hours, minutes, seconds });
          }
        }
      } catch (error) {
        // Fallback to simple decrement if localStorage fails
        setTimeRemaining(prev => {
          const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
          
          if (totalSeconds <= 0) {
            return { hours: 9, minutes: 0, seconds: 0 };
          }
          
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          return { hours, minutes, seconds };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Soften iOS bounce without blocking scroll
    const previousOverscroll = document.body.style.overscrollBehaviorY;
    document.body.style.overscrollBehaviorY = 'contain';
    
    return () => {
      document.body.style.overscrollBehaviorY = previousOverscroll;
    };
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, []);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const categoryPrompts = [
    { id: "love", icon: "", labelEn: "Love", labelHi: "प्रेम",
      promptsEn: ["When will I meet my true love?", "Is my current relationship destined to last?", "What qualities should I look for in a partner?", "Will I find love this year?", "How can I attract the right person into my life?"],
      promptsHi: ["मुझे सच्चा प्यार कब मिलेगा?", "क्या मेरा वर्तमान रिश्ता टिकाऊ है?", "मुझे अपने साथी में क्या गुण देखने चाहिए?", "क्या मुझे इस वर्ष प्यार मिलेगा?", "मैं सही व्यक्ति को अपने जीवन में कैसे आकर्षित करूं?"] },
    { id: "career", icon: "", labelEn: "Career", labelHi: "करियर",
      promptsEn: ["What career path is best suited for me?", "When will I get a promotion or job change?", "Should I start my own business?", "What are my biggest career strengths?", "Will I succeed in my chosen profession?"],
      promptsHi: ["मेरे लिए सबसे अच्छा करियर मार्ग कौन सा है?", "मुझे पदोन्नति या नौकरी में बदलाव कब मिलेगा?", "क्या मुझे अपना व्यवसाय शुरू करना चाहिए?", "मेरे करियर की सबसे बड़ी ताकतें क्या हैं?", "क्या मैं अपने चुने हुए पेशे में सफल होऊंगा?"] },
    { id: "money", icon: "", labelEn: "Money", labelHi: "धन",
      promptsEn: ["When will I achieve financial stability?", "How can I increase my wealth?", "Is this a good time to invest?", "Will I get out of debt soon?", "What does my financial future look like?"],
      promptsHi: ["मैं वित्तीय स्थिरता कब प्राप्त करूंगा?", "मैं अपनी संपत्ति कैसे बढ़ा सकता हूं?", "क्या यह निवेश करने का अच्छा समय है?", "क्या मैं जल्द ही कर्ज से बाहर निकलूंगा?", "मेरा वित्तीय भविष्य कैसा दिखता है?"] },
    { id: "marriage", icon: "", labelEn: "Marriage", labelHi: "विवाह",
      promptsEn: ["When will I get married?", "What will my spouse be like?", "Will my marriage be happy?", "Is arranged marriage better for me?", "How can I improve my married life?"],
      promptsHi: ["मेरी शादी कब होगी?", "मेरा जीवनसाथी कैसा होगा?", "क्या मेरा विवाह सुखी होगा?", "क्या मेरे लिए अरेंज मैरिज बेहतर है?", "मैं अपने वैवाहिक जीवन को कैसे बेहतर बना सकता हूं?"] },
    { id: "property", icon: "", labelEn: "Property", labelHi: "संपत्ति",
      promptsEn: ["Will I buy my own home soon?", "Is property investment good for me?", "When will I move to a new house?", "Will I inherit property?", "Which direction is best for my home?"],
      promptsHi: ["क्या मैं जल्द ही अपना घर खरीदूंगा?", "क्या मेरे लिए संपत्ति में निवेश अच्छा है?", "मैं नए घर में कब शिफ्ट होऊंगा?", "क्या मुझे संपत्ति विरासत में मिलेगी?", "मेरे घर के लिए कौन सी दिशा सबसे अच्छी है?"] },
    { id: "spiritual", icon: "", labelEn: "Spiritual", labelHi: "आध्यात्मिक",
      promptsEn: ["What is my spiritual purpose?", "How can I deepen my meditation practice?", "Am I on the right spiritual path?", "Which spiritual practice suits me best?", "How can I find inner peace?"],
      promptsHi: ["मेरा आध्यात्मिक उद्देश्य क्या है?", "मैं अपने ध्यान अभ्यास को कैसे गहरा करूं?", "क्या मैं सही आध्यात्मिक मार्ग पर हूं?", "कौन सी आध्यात्मिक प्रैक्टिस मेरे लिए सबसे अच्छी है?", "मैं आंतरिक शांति कैसे पा सकता हूं?"] },
    { id: "health", icon: "", labelEn: "Health", labelHi: "स्वास्थ्य",
      promptsEn: ["What health issues should I watch out for?", "How can I improve my overall well-being?", "Will I recover from my health problem?", "Which exercise or diet is best for me?", "How does my mental health look?"],
      promptsHi: ["मुझे किन स्वास्थ्य समस्याओं का ध्यान रखना चाहिए?", "मैं अपनी समग्र भलाई कैसे सुधारूं?", "क्या मैं अपनी स्वास्थ्य समस्या से उबर जाऊंगा?", "मेरे लिए कौन सा व्यायाम या आहार सबसे अच्छा है?", "मेरा मानसिक स्वास्थ्य कैसा है?"] },
    { id: "education", icon: "", labelEn: "Education", labelHi: "शिक्षा",
      promptsEn: ["Which field of study should I pursue?", "Will I succeed in my exams?", "What is the best career after my studies?", "How can I improve my concentration and focus?", "Should I study abroad?"],
      promptsHi: ["मुझे किस क्षेत्र में अध्ययन करना चाहिए?", "क्या मैं अपनी परीक्षाओं में सफल होऊंगा?", "मेरी पढ़ाई के बाद सबसे अच्छा करियर क्या है?", "मैं अपनी एकाग्रता और फोकस कैसे सुधारूं?", "क्या मुझे विदेश में पढ़ाई करनी चाहिए?"] },
  ];

  const getOutOfCreditsMessage = useCallback(() => {
    const firstName = displayName.trim().split(/\s+/)[0] || "there";
    return `Hey ${firstName}, you have used all your credits. Please choose a plan below to continue chatting with Vedika AI.`;
  }, [displayName]);
  const initials = useMemo(() => displayName.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase(), [displayName]);
  const isProPlan = useMemo(() => {
    const paidPlanKeywords = ["quick ask", "deep dive", "power pack", "premium", "standard"];
    return paidPlanKeywords.some((keyword) => planName?.toLowerCase().includes(keyword));
  }, [planName]);

  // Get discounted price for paid users
  const getDiscountedPrice = (originalPrice: number, planName: string): number => {
    if (!isProPlan) return originalPrice;
    
    const normalizedPlan = planName.toLowerCase();
    if (normalizedPlan.includes("quick ask")) return 149; // 199 -> 149
    if (normalizedPlan.includes("deep dive")) return 349; // 499 -> 349
    if (normalizedPlan.includes("power pack")) return 599; // 799 -> 599
    return originalPrice;
  };

  const historyKey = useMemo(() => `chat_history_${user?.email || "guest"}`, [user?.email]);
  const historyMetaKey = useMemo(() => `${historyKey}_meta`, [historyKey]);
  const RESET_HOUR_LOCAL = 12; // 12 PM local time

  const normalizeDigits = (text: string) =>
    text.replace(/[०-९]/g, (d) => "०१२३४५६७८९".indexOf(d).toString());

  // Load messages from localStorage
  useEffect(() => {
    try {
      const today = new Date();
      const dateStamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const rawMeta = localStorage.getItem(historyMetaKey);
      const metaDate = rawMeta ? (JSON.parse(rawMeta)?.date as string | undefined) : undefined;
      const shouldReset = metaDate !== dateStamp;

      if (shouldReset) {
        localStorage.removeItem(historyKey);
        localStorage.setItem(historyMetaKey, JSON.stringify({ date: dateStamp }));
        setMessages([]);
        setAnswerSuggestions({});
        setLoadingSuggestions({});
        setHasChatted(false);
        setHasTyped(false);
        return;
      }

      const raw = localStorage.getItem(historyKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatTurn[];
      setMessages(parsed);
      if (parsed.length) {
        setHasChatted(true);
        setHasTyped(true);
      }
    } catch (e) {
      console.warn("Failed to load chat history", e);
    }
  }, [historyKey, historyMetaKey, user?.email]);

  // Load all sessions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(sessionsKey);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        setSessions(parsed.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    } catch (e) {
      console.warn("Failed to load sessions", e);
    }
  }, [sessionsKey]);

  // Clear and refresh history every day at RESET_HOUR_LOCAL
  useEffect(() => {
    const checkReset = () => {
      try {
        const now = new Date();
        const resetToday = new Date();
        resetToday.setHours(RESET_HOUR_LOCAL, 0, 0, 0);
        const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const rawMeta = localStorage.getItem(historyMetaKey);
        const metaDate = rawMeta ? (JSON.parse(rawMeta)?.date as string | undefined) : undefined;

        if (now >= resetToday && metaDate !== dateStamp) {
          localStorage.removeItem(historyKey);
          localStorage.setItem(historyMetaKey, JSON.stringify({ date: dateStamp }));
          setMessages([]);
          setAnswerSuggestions({});
          setLoadingSuggestions({});
          setHasChatted(false);
          setHasTyped(false);
        }
      } catch (e) {
        console.warn("Failed to reset chat history", e);
      }
    };

    const interval = window.setInterval(checkReset, 60 * 1000); // check every minute
    checkReset(); // initial check
    return () => window.clearInterval(interval);
  }, [historyKey, historyMetaKey]);

  const saveSession = useCallback((id: string, msgs: ChatTurn[]) => {
    if (!msgs.length) return;
    setSessions(prev => {
      const title = truncateTitle(msgs[0]?.content || "New Chat");
      const existing = prev.find(s => s.id === id);
      const updated: ChatSession = {
        id,
        title,
        messages: msgs,
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };
      const rest = prev.filter(s => s.id !== id);
      const next = [updated, ...rest].slice(0, 20); // max 20 sessions
      try {
        localStorage.setItem(sessionsKey, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, [sessionsKey]);

  useEffect(() => {
    if (initial) {
      // optional: auto-focus input when coming from dashboard
      const el = document.getElementById("chat-input") as HTMLInputElement | null;
      el?.focus();
    }
  }, [initial]);

  // Auto-scroll: new message aate hi bottom pe le jao
  useEffect(() => {
    if (!userScrolledUp.current) {
      requestAnimationFrame(() => scrollToBottom(false));
    }
  }, [messages, scrollToBottom]);

  // Reset userScrolledUp when AI finishes
  useEffect(() => {
    if (!isTyping) {
      userScrolledUp.current = false;
      setShowScrollFab(false);
    }
  }, [isTyping]);

  // Track user scroll position on the main container
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (!isNearBottom && isTyping) {
        userScrolledUp.current = true;
        setShowScrollFab(true);
      } else if (isNearBottom) {
        userScrolledUp.current = false;
        setShowScrollFab(false);
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [isTyping]);


  // Personalized question suggestions based on age (same as Dashboard)
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
        "What's my true calling in life?",
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
      ] : [
        "When will I find my soulmate?",
        "What does my career path look like?",
        "Will my love life be fulfilling?",
        "Is now the right time to change jobs?",
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

  const send = async (overrideMessage?: string) => {
    const outgoingMessage = (overrideMessage ?? message).trim();
    if (!outgoingMessage || sending) return;

    // Create session ID if this is a new chat
    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = generateSessionId();
      setActiveSessionId(sessionId);
    }
    
    // Send message immediately for better UX
    const userTurn: ChatTurn = { role: "user", content: outgoingMessage };
    setMessages((m) => [...m, userTurn]);
    setMessage("");
    // User ne message bheja — force scroll to bottom (userScrolledUp reset karo)
    userScrolledUp.current = false;
    setShowScrollFab(false);
    requestAnimationFrame(() => scrollToBottom(false));
    // Firestore question logging (internal analytics, never blocks the chat)
    if (user?.email) {
      import("firebase/firestore").then(({ collection, addDoc }) => {
        getDbInstance().then((db) => {
          addDoc(collection(db, "users", user.email.toLowerCase().trim(), "questions"), { question: outgoingMessage }).catch(console.error);
        }).catch(console.error);
      }).catch(console.error);
    }
    setHasChatted(true);
    setSending(true);
    setIsTyping(true);
    // Insert assistant placeholder for streaming (real answer)
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    
    // Check limit in background - only check if plan is loaded
    if (loading) {
      // Remove the empty assistant placeholder
      setMessages((m) => m.slice(0, -1));
      setSending(false);
      setIsTyping(false);
      return;
    }
    
    const canAsk = await canAskMoreQuestions();
    if (!canAsk) {
      setMessages((m) => {
        const copy = [...m];
        const lastIndex = copy.length - 1;
        if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
          copy[lastIndex] = { role: "assistant", content: getOutOfCreditsMessage(), isOutOfCredits: true };
        }
        return copy;
      });
      setSending(false);
      setIsTyping(false);
      return;
    }
    
    try {
      let idx = -1;
      setMessages((m) => { idx = m.length; return m; });
      let deltaCount = 0;
      let aiAnswerCompleted = false;
      let streamedAnswer = "";
      let finalAnswerForSuggestions = "";
      // Ensure Hindi output when UI is set to Hindi
      const userText = userTurn.content;
      // Gather onboarding details for AstrologyAPI
      const details = (() => { try { return JSON.parse(localStorage.getItem('onboarding_details') || 'null'); } catch { return null; } })();
      
      // Calculate age if not already stored
      if (details?.dob && !details.age) {
        const today = new Date();
        const birthDate = new Date(details.dob);
        let ageYears = today.getFullYear() - birthDate.getFullYear();
        let ageMonths = today.getMonth() - birthDate.getMonth();
        let ageDays = today.getDate() - birthDate.getDate();
        
        if (ageDays < 0) {
          ageMonths--;
          const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
          ageDays += daysInPrevMonth;
        }
        if (ageMonths < 0) {
          ageYears--;
          ageMonths += 12;
        }
        
        details.age = { years: ageYears, months: ageMonths, days: ageDays };
        // Save back to localStorage
        localStorage.setItem('onboarding_details', JSON.stringify(details));
      }
      if (!details?.dob || !details?.time || details?.lat == null || details?.lng == null) {
        console.debug('[Chat] Missing birth details, aborting send.', { details });
        setMessages((m) => {
          const copy = [...m];
          const lastIndex = copy.length - 1;
          if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
            copy[lastIndex] = { role: "assistant", content: "Please complete onboarding (DOB, time, and place) to get precise chart-based guidance." };
          }
          return copy;
        });
        setSending(false);
        setIsTyping(false);
        return;
      }
      let planetsBlock = "";
      if (details?.dob && details?.time && (details?.lat != null) && (details?.lng != null)) {
        try {
          const [y, m, d] = details.dob.split('-').map((n: string) => parseInt(n, 10));
          const [hh, mm] = details.time.split(':').map((n: string) => parseInt(n, 10));
          const tzone = typeof details.tzone === 'number' ? details.tzone : (-new Date().getTimezoneOffset() / 60);
          const body: AstroInput = {
            day: d,
            month: m,
            year: y,
            hour: hh,
            min: mm,
            lat: details.lat,
            lon: details.lng,
            tzone: tzone,
          };
          const payload = await getPlanetaryData(body);
          planetsBlock = `Planetary Data:\n${JSON.stringify(payload)}`;
          persistAstroPayload(payload);
        } catch (e) {
          console.debug('[Chat] Astrology calculation failed, will try local cache.', e);
        }
      }
      if (!planetsBlock) {
        try {
          const cached = JSON.parse(localStorage.getItem('astrology_planets') || 'null');
          if (cached) planetsBlock = `Planetary Data:\n${JSON.stringify(cached)}`;
        } catch { /* ignore */ }
      }
      const age = details.age ? `Current Age: ${details.age.years} years, ${details.age.months} months, ${details.age.days} days` : 'Current Age: N/A';
      const detailsBlock = `User Details:\nDate of Birth: ${details.dob}\n${age}\nGender: ${details.gender || 'N/A'}`;
      
      // SAHI - sirf planetary data + user details bhejo
      let memoryBlock = "";
      if (isMemoryEligible) {
        try {
          const storedMemory = JSON.parse(localStorage.getItem(memoryStorageKey) || "null") as VedikaMemory | null;
          if (storedMemory) {
            memoryBlock = `User Memory (provided by the user; use it only when relevant):\n${Object.entries(storedMemory)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n")}`;
          }
        } catch { /* Ignore invalid local memory. */ }
      }
      const systemExtra = `${planetsBlock || 'Planetary Data: (not available)'}\n\n${detailsBlock}${memoryBlock ? `\n\n${memoryBlock}` : ""}`.trim();
      
      const numeralRule = "All numbers, dates, years, and ranges must use English numerals (0-9). Never use Devanagari digits (०१२३४५६७८९).";
      const languageRule = lang === "hi"
        ? `CRITICAL: You MUST respond ONLY in pure Hindi (Devanagari script). Do NOT use any English words, Hinglish, or mixed language. Write everything in complete Hindi sentences using Devanagari script. Never use English words like 'career', 'marriage', 'money', etc. - always use Hindi equivalents like 'करियर', 'विवाह', 'धन', etc. If you use any English words, the response is incorrect. Respond entirely in Hindi Devanagari script only. ${numeralRule}`
        : `Respond in English. Do not mention anything about language choice. ${numeralRule}`;
      const formattingBan = "Output must be plain text only. Do not use Markdown, bold, italics, bullets, asterisks, hyphens, numbered lists, quotes, or decorative symbols.";
      
      // Backend already handles VAANI_SYSTEM_PROMPT, so we only need language + formatting rules
      const systemBlock = `${languageRule}\n${formattingBan}`.trim();
      // The chart is already supplied once through systemExtra. Keep the user
      // message to the user's question so the same chart is not duplicated in
      // both the system and user messages.
      const promptText = `User Question:\n${userText}`.trim();
      console.debug('[Chat] Prepared prompt', { hasPlanets: !!planetsBlock, detailsPresent: !!detailsBlock, promptLen: promptText.length, systemLen: systemBlock.length });
      const sanitize = (txt: string) => {
        // Remove bold/italics markers and inline code/backticks
        let out = txt
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/__([^_]+)__/g, '$1')
          .replace(/`{1,3}([^`]+)`{1,3}/g, '$1');
        // Remove leading bullets like *, -, • and numbered list markers
        out = out.replace(/^(\s*)([\*\-•]|\d+\.)\s+/gm, '$1');
        // Remove common meta-language lines
        out = out.replace(/^.*(मैं .*हिंदी.* दूँग[ाि]).*$/gmi, '').trim();
        // Normalize numerals to English digits
        out = normalizeDigits(out);
        // Add spacing between digits and letters
        out = out.replace(/([a-zA-Z\u0900-\u097F])(\d)/g, '$1 $2').replace(/(\d)([a-zA-Z\u0900-\u097F])/g, '$1 $2');
        // Fix "7 th" -> "7th", "2 nd" -> "2nd"
        out = out.replace(/(\d)\s+(st|nd|rd|th)\b/gi, '$1$2');
        return out;
      };

      let firstChunkReceived = false;
      let streamBuffer = "";
      let rafId: number | null = null;
      const flushBuffer = () => {
        if (!streamBuffer) return;
        const chunk = streamBuffer;
        streamBuffer = "";
        setMessages((m) => {
          const copy = [...m];
          const lastIndex = copy.length - 1;
          if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
            const next = (copy[lastIndex].content || "") + chunk;
            copy[lastIndex] = { role: "assistant", content: sanitize(next) };
          }
          return copy;
        });
      };
      await generateGeminiStream(promptText, messages.slice(-20), (delta) => {
        streamedAnswer += delta;
        if (sanitize(streamedAnswer).trim()) {
          aiAnswerCompleted = true;
        }
        if (!firstChunkReceived) {
          firstChunkReceived = true;
          setIsTyping(false);
        }
        streamBuffer += delta;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(flushBuffer);
        deltaCount++;
      }, systemExtra, lang, displayName, "primary", "mistral-small-latest");
      if (rafId) { cancelAnimationFrame(rafId); flushBuffer(); }
      if (deltaCount === 0) {
        // Fallback: non-streaming final response
        const final = await generateGemini(promptText, messages.slice(-20), systemExtra, lang, displayName, "primary", "mistral-small-latest");
        const sanitizedFinal = sanitize(final || "");
        finalAnswerForSuggestions = sanitizedFinal;
        aiAnswerCompleted = !!sanitizedFinal.trim();
          setMessages((m) => {
          const copy = [...m];
          const lastIndex = copy.length - 1;
          if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
              copy[lastIndex] = { role: "assistant", content: sanitizedFinal };
          }
          return copy;
        });
      }
      if (!aiAnswerCompleted) {
        throw new Error("AI response was empty");
      }
      if (!finalAnswerForSuggestions) {
        finalAnswerForSuggestions = sanitize(streamedAnswer || "");
      }
      const assistantIndex = messagesRef.current.map((item) => item.role).lastIndexOf("assistant");

      const creditDeducted = await deductCredit();
      if (!creditDeducted) {
        setMessages((m) => {
          const copy = [...m];
          const lastIndex = copy.length - 1;
          if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
            copy[lastIndex] = { role: "assistant", content: getOutOfCreditsMessage(), isOutOfCredits: true };
          }
          return copy;
        });
        return;
      }

      console.log("AI answer completed, credit deducted successfully");

      // Generate suggestions in background without blocking - no loading state
      generateAnswerSuggestions(userText, finalAnswerForSuggestions, lang, memoryBlock)
        .then((nextQuestions) => {
          if (nextQuestions.length && assistantIndex >= 0) {
            setAnswerSuggestions((prev) => ({ ...prev, [assistantIndex]: nextQuestions }));
          }
        })
        .catch((error) => {
          console.debug("[Chat] Suggestion generation failed", error);
        });
    } catch (e: any) {
      const errMsg = e?.message || String(e || "");
      const isImageError = errMsg.includes("image.png") || errMsg.includes("does not support image");
      setMessages((m) => {
        const copy = [...m];
        const lastIndex = copy.length - 1;
        if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
          copy[lastIndex] = {
            role: "assistant",
            content: isImageError
              ? "I can only read text messages — I'm not able to process images. Please describe in words what you'd like to know."
              : "Sorry, I couldn't process that right now."
          };
        }
        return copy;
      });
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSending(false);
      setIsTyping(false);
      // save session after response
      setMessages(m => { saveSession(sessionId, m.filter(x => x.content?.trim())); return m; });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row scroll-smooth">
      <style>{`/* Hide scrollbar for mobile, show for desktop/laptop */
      @media (max-width: 767px) {
        main::-webkit-scrollbar, div::-webkit-scrollbar, body::-webkit-scrollbar, html::-webkit-scrollbar { display: none; width: 0; height: 0; }
        body { -ms-overflow-style: none; }
      }
      @media (min-width: 768px) {
        main::-webkit-scrollbar { width: 8px; }
        main::-webkit-scrollbar-track { background: transparent; }
        main::-webkit-scrollbar-thumb { 
          background: rgba(148, 163, 184, 0.3); 
          border-radius: 4px; 
          border: 2px solid transparent;
          background-clip: content-box;
        }
        main::-webkit-scrollbar-thumb:hover { 
          background: rgba(148, 163, 184, 0.5); 
          background-clip: content-box;
        }
      }
      `}</style>
      {/* Left Sidebar - Mobile drawer + Desktop sidebar */}
      <aside 
        className={`fixed top-0 h-screen flex flex-col gap-3 p-3 bg-card/50 border-r border-border/60 transition-all duration-300 backdrop-blur-sm z-50 overflow-y-auto w-64 ${
          sidebarOpen 
            ? "left-0" 
            : "-left-full"
        } md:left-0 md:translate-x-0 ${sidebarExpanded ? "md:w-64" : "md:w-20"}`}
      >        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
              // On mobile, close the sidebar
              setSidebarOpen(false);
            } else {
              // On desktop, toggle expanded state
              setSidebarExpanded(!sidebarExpanded);
            }
          }}
          className={`self-${sidebarOpen || sidebarExpanded ? "end" : "center"} mb-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-border/60 bg-card/40 hover:border-secondary/50 z-10`}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen || (window.innerWidth < 768 && sidebarOpen) ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <SidebarItem 
          to="/dashboard" 
          icon={Home} 
          label="Home" 
          expanded={sidebarExpanded} 
          selected={activeItem === "Home"} 
          isMobileOpen={sidebarOpen}
          onClick={(e) => {
            setActiveItem("Home");
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }} 
        />
        <SidebarItem
          to="/chat"
          icon={MessageSquare}
          label="New Chat"
          expanded={sidebarExpanded}
          selected={activeItem === "New Chat"}
          isMobileOpen={sidebarOpen}
          onClick={(e) => {
            e.preventDefault();
            setActiveItem("New Chat");
            setMessages([]);
            setAnswerSuggestions({});
            setLoadingSuggestions({});
            setMessage("");
            setActiveSessionId(""); // ← ADD THIS
            setHasChatted(false);   // ← ADD THIS
            setHasTyped(false);     // ← ADD THIS
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
        />
        <SidebarItem 
          to="/pricing" 
          icon={Receipt} 
          label="Pricing" 
          expanded={sidebarExpanded} 
          selected={activeItem === "Pricing"} 
          isMobileOpen={sidebarOpen}
          onClick={(e) => {
            setActiveItem("Pricing");
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }} 
        />
        <button
          type="button"
          onClick={() => {
            setActiveItem("Memory");
            openMemory();
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          className={`group flex items-center ${(sidebarOpen || sidebarExpanded) ? "w-full h-11 justify-start gap-3 px-4" : "h-12 w-12 justify-center"} rounded-full border bg-card/60 border-border/60 transition-all overflow-hidden hover:border-secondary/40 hover:shadow-[0_0_0_2px_rgba(236,72,153,0.2)] ${activeItem === "Memory" ? "border-secondary/70 shadow-[0_0_0_3px_rgba(236,72,153,0.35)]" : ""}`}
          title="Vedika Memory"
        >
          <Brain className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          {(sidebarOpen || sidebarExpanded) && <span className="text-sm text-foreground/90">Vedika Memory</span>}
          {(sidebarOpen || sidebarExpanded) && !isMemoryEligible && <LockKeyhole className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        
        {/* Chat History */}
        {(sidebarOpen || sidebarExpanded) && sessions.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            <div className="px-3 text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
              Recent
            </div>
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => {
                  setMessages(session.messages);
                  setAnswerSuggestions({});
                  setLoadingSuggestions({});
                  setActiveSessionId(session.id);
                  setHasChatted(true);
                  setHasTyped(true);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between w-full px-3 py-2 rounded-xl border cursor-pointer transition-all text-left
                  ${activeSessionId === session.id
                    ? "border-secondary/60 bg-secondary/10 text-foreground"
                    : "border-transparent hover:border-border/60 hover:bg-card/40 text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="text-xs truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = sessions.filter(s => s.id !== session.id);
                    setSessions(next);
                    localStorage.setItem(sessionsKey, JSON.stringify(next));
                    if (activeSessionId === session.id) {
                      setMessages([]);
                      setAnswerSuggestions({});
                      setLoadingSuggestions({});
                      setActiveSessionId("");
                      setHasChatted(false);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex-1" />
        {/* Profile footer */}
        <div className={`mt-auto ${sidebarOpen || sidebarExpanded ? "px-1" : ""}`}>
          <div className={`flex items-center ${(sidebarOpen || sidebarExpanded) ? "gap-3 px-2 py-2" : "justify-center p-2"} rounded-xl border border-border/60 bg-card/40`}>
            <img src="/optimized/reviews.webp" alt="Veadicastro Vedic astrology AI platform logo" className="w-9 h-9 rounded-full" loading="eager" />
            {(sidebarOpen || sidebarExpanded) && (
              <div className="min-w-0">
                <div className="text-xs font-medium truncate inline-flex items-center gap-2">
                  <span className="truncate">{displayName}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${isProPlan ? "border-amber-400/40 text-amber-300 bg-amber-500/10" : "border-border/70 text-muted-foreground bg-card/50"}`}>
                    {isProPlan ? "Pro" : "Free"}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">Online</div>
              </div>
            )}
          </div>
          {(sidebarOpen || sidebarExpanded) && (
            <button type="button" onClick={openMemory} className="mt-2 flex w-full items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-left text-xs transition hover:border-secondary/50">
              <Brain className="h-4 w-4 text-secondary" />
              <span className="flex-1">Vedika Memory</span>
              {isMemoryEligible ? <span className="text-[10px] text-secondary">Add / update</span> : <LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main ref={scrollContainerRef} className={`flex-1 min-w-0 flex flex-col ${sidebarExpanded ? 'md:ml-64' : 'md:ml-20'} overflow-y-auto`} style={{ height: '-webkit-fill-available', maxHeight: '100vh', WebkitOverflowScrolling: 'touch' }}>
        {/* Top Section: User Row + Mobile Menu - Fixed on mobile, sticky on desktop */}
        <div className="flex items-center gap-2 sm:gap-2 md:gap-3 mb-0 sm:mb-3 md:mb-6 fixed md:sticky top-0 left-0 right-0 md:relative z-[45] md:z-10 bg-background md:bg-background/80 backdrop-blur-md md:backdrop-blur supports-[backdrop-filter]:bg-background/98 md:supports-[backdrop-filter]:bg-background/60 border-b-2 md:border-b border-border/60 shadow-sm md:shadow-none pl-2 sm:pl-2 md:pl-6 pr-6 sm:pr-4 md:pr-6 py-5 sm:py-3.5 md:py-4 md:rounded-t-xl min-h-[84px] md:min-h-[72px]">
          {/* Mobile Menu Toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="md:hidden inline-flex items-center justify-center h-11 w-11 sm:h-8 sm:w-8 rounded-lg bg-card/40 border border-border/60 hover:border-secondary/50 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-2 md:gap-2.5 min-w-0 flex-1">
            <img src="/optimized/reviews.webp" alt="profile" className="w-12 h-12 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0 border-2 border-border/40 shadow-md" />
            <div className="min-w-0">
              <div className="text-base sm:text-sm font-semibold leading-tight truncate inline-flex items-center gap-2">
                <span className="truncate">{displayName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${isProPlan ? "border-amber-400/40 text-amber-300 bg-amber-500/10" : "border-border/70 text-muted-foreground bg-card/50"}`}>
                  {isProPlan ? "Pro" : "Free"}
                </span>
              </div>
              {isProPlan ? (
                <>
                  <div className="text-xs sm:text-xs text-amber-300 hidden sm:block">
                    Vedika AI 2.0 Unlocked for you
                  </div>
                  <div className="text-xs text-amber-300 sm:hidden block">
                    Vedika AI 2.0 Unlocked for you
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs sm:text-xs text-muted-foreground hidden sm:block">Ask your questions to Vedika AI</div>
                  <div className="text-xs text-muted-foreground sm:hidden">Ask your questions to Vedika AI</div>
                </>
              )}
            </div>
          </div>
          <button type="button" onClick={openMemory} className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-2 text-xs text-muted-foreground transition hover:border-secondary/50 hover:text-foreground sm:flex" title="Vedika Memory">
            <Brain className="h-4 w-4 text-secondary" />
            Memory
            {!isMemoryEligible && <LockKeyhole className="h-3 w-3" />}
          </button>
          {credits > 0 ? (
            <>
              <div className="hidden md:block flex-shrink-0 ml-2">
                <Select value={lang} onValueChange={(value) => setLang(value as "en" | "hi")}>
                  <SelectTrigger className="w-[140px] h-9 text-sm bg-card/40 border border-border/60 hover:border-secondary/50">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Devanagari)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:hidden">
                <Select value={lang} onValueChange={(value) => setLang(value as "en" | "hi")}>
                  <SelectTrigger className="w-[120px] h-8 text-xs bg-card/40 border border-border/60 hover:border-secondary/50">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <Button
              variant="cosmic"
              size="sm"
              className="gap-1.5 text-xs h-9 px-4"
              onClick={() => navigate(`/pricing/onboarding?plan=Deep%20Dive&amount=${getDiscountedPrice(499, 'Deep Dive')}&type=pack`)}
            >
              Upgrade
            </Button>
          )}
        </div>
        
        <div className="max-w-6xl mx-auto w-full px-1 sm:px-4 lg:px-6 pt-[96px] sm:pt-4 md:pt-4 pb-44 sm:pb-48 flex flex-col flex-1">

          {/* Conversation */}
          <div className="max-w-4xl w-full mx-auto px-1.5 sm:px-4 min-h-[40vh] space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[35vh] sm:h-[55vh] gap-4 -mt-12 sm:mt-0">
                <img
                  src="/optimized/vedika.webp"
                  alt="Vedika AI"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover opacity-20"
                />
                <p className="text-white/20 text-xl sm:text-2xl font-light italic tracking-wide text-center leading-relaxed">
                  The Answers are Already Written,<br />Let's find yours {displayName}
                </p>
              </div>
            )}
            {messages.map((m, idx) => (
              m.role === "assistant" && !m.content?.trim() ? null : (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} px-0.5 sm:px-4 scroll-mt-[110px] sm:scroll-mt-0`}>
                  {m.role === "assistant" && (
                    <div className="mr-2 sm:mr-3 mt-1 shrink-0">
                      <img src="/optimized/vedika.webp" alt="Vedika — AI Vedic astrologer by Veadicastro" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className={`${m.role === "user" ? "max-w-[82%] sm:max-w-[70%]" : "max-w-[calc(100%-2.25rem)] sm:max-w-[88%] md:max-w-[82%]"} min-w-0`}>
                    <Card className={`${m.role === "user" ? "bg-secondary/15" : m.isOutOfCredits ? "bg-yellow-500/10 border-yellow-400/40" : "bg-card/45"} w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-border/60 ${m.role === "user" ? "" : "ml-0 sm:ml-1"}`}>
                      <div className={`text-sm sm:text-[15px] leading-7 ${m.isOutOfCredits ? "font-medium text-yellow-300" : "text-foreground/90"}`}>
                        {m.role === "assistant" ? (
                          <div className="space-y-3">
                            {formatAssistantContent(m.content || "").map((paragraph, paragraphIndex) => (
                              <p key={paragraphIndex} className="whitespace-pre-wrap">
                                {highlightAstroText(paragraph)}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="whitespace-pre-wrap">{m.content}</span>
                        )}
                      </div>
                    </Card>
                    {m.role === "assistant" && loadingSuggestions[idx] && (
                      <div className="mt-2 ml-0 sm:ml-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap" aria-label="Loading suggested questions">
                        {[0, 1].map((item) => (
                          <div
                            key={item}
                            className="h-10 w-full animate-pulse rounded-2xl border border-border/60 bg-card/45 sm:w-64"
                          />
                        ))}
                      </div>
                    )}
                    {m.role === "assistant" && answerSuggestions[idx]?.length > 0 && (
                      <div className="mt-2 ml-0 sm:ml-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {answerSuggestions[idx].map((question, questionIndex) => (
                          <button
                            key={`${idx}-${questionIndex}`}
                            type="button"
                            disabled={sending}
                            onClick={() => send(question)}
                            className="rounded-2xl border border-border/60 bg-card/45 px-3.5 py-2.5 text-left text-xs sm:text-sm leading-5 text-foreground/85 shadow-sm transition hover:border-white/20 hover:bg-card/70 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                    {m.isOutOfCredits && (
                      <div className="mt-3 ml-0 sm:ml-1 max-w-full sm:max-w-md">
                        <div className="rounded-3xl border border-white/10 bg-card/95 p-3.5 sm:p-4 shadow-xl shadow-black/20">
                          <div className="text-center px-3 pb-3 border-b border-white/10">
                            <p className="text-sm font-semibold text-yellow-300 mb-1">Upgrade to continue</p>
                            <p className="text-xs leading-5 text-muted-foreground">Choose a question pack or monthly plan to keep chatting.</p>
                          </div>
                          <div className="space-y-2.5 pt-3">
                            <div
                              onClick={() => navigate(`/pricing/onboarding?plan=Quick%20Ask&amount=${getDiscountedPrice(199, 'Quick Ask')}&type=pack`)}
                              className="group w-full rounded-2xl bg-white/[0.04] border border-white/10 hover:border-pink-500/40 hover:bg-white/[0.07] px-4 py-3 cursor-pointer transition-all"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-semibold text-white">Quick Ask</div>
                                  <div className="text-xs text-muted-foreground">5 questions</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isProPlan && <span className="text-xs text-muted-foreground line-through">₹199</span>}
                                  <div className="text-base font-semibold text-white">₹{getDiscountedPrice(199, 'Quick Ask')}</div>
                                </div>
                              </div>
                            </div>
                            <div
                              onClick={() => navigate(`/pricing/onboarding?plan=Deep%20Dive&amount=${getDiscountedPrice(499, 'Deep Dive')}&type=pack`)}
                              className="group w-full rounded-2xl bg-pink-500/10 border border-pink-500/60 px-4 py-3 cursor-pointer relative shadow-[0_0_24px_rgba(236,72,153,0.14),0_0_0_1px_rgba(236,72,153,0.12)] transition-all hover:bg-pink-500/15 hover:shadow-[0_0_30px_rgba(236,72,153,0.2),0_0_0_1px_rgba(236,72,153,0.16)]"
                            >
                              <span className="absolute -top-2 right-3 bg-pink-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">Popular</span>
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-semibold text-white">Deep Dive</div>
                                  <div className="text-xs text-muted-foreground">15 questions</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isProPlan && <span className="text-xs text-muted-foreground line-through">₹499</span>}
                                  <div className="text-base font-semibold text-pink-400">₹{getDiscountedPrice(499, 'Deep Dive')}</div>
                                </div>
                              </div>
                            </div>
                            <div
                              onClick={() => navigate(`/pricing/onboarding?plan=The%20Power%20Pack&amount=${getDiscountedPrice(799, 'The Power Pack')}&type=pack`)}
                              className="group w-full rounded-2xl bg-white/[0.04] border border-white/10 hover:border-pink-500/40 hover:bg-white/[0.07] px-4 py-3 cursor-pointer transition-all"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-semibold text-white">Power Pack</div>
                                  <div className="text-xs text-muted-foreground">30 questions</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isProPlan && <span className="text-xs text-muted-foreground line-through">₹799</span>}
                                  <div className="text-base font-semibold text-white">₹{getDiscountedPrice(799, 'The Power Pack')}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 py-0.5">
                              <div className="h-px flex-1 bg-white/10" />
                              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">or</span>
                              <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <div
                              onClick={() => window.open('https://veadicastro.in/subscription/onboarding', '_blank')}
                              className="group w-full rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/10 border border-purple-400/40 hover:border-purple-300/70 hover:from-purple-500/20 hover:to-pink-500/15 px-4 py-3.5 cursor-pointer transition-all shadow-[0_0_26px_rgba(168,85,247,0.16)] hover:shadow-[0_0_34px_rgba(168,85,247,0.24)]"
                            >
                              <div className="flex justify-between items-center gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold text-white">Monthly Pro</div>
                                    <span className="rounded-full bg-purple-400/20 px-2 py-0.5 text-[10px] font-semibold text-purple-200">Best value</span>
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground">30 questions + advanced features</div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">or</div>
                                  <div className="text-base font-bold text-purple-300">₹499/month</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
            {isTyping && (
              <div className="flex items-start gap-3 pl-1 sm:pl-2" role="status" aria-live="polite">
                <div className="relative mt-1 shrink-0">
                  <img src={assistantAvatarUrl} alt="Vedika" className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-400/20" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <div className="min-w-0 rounded-2xl rounded-tl-md border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-pink-200/90">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-400/15">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-300 animate-pulse" />
                    </span>
                    Vedika is thinking
                    <div className="thinking-dots" aria-hidden="true">
                      <div className="thinking-dot" />
                      <div className="thinking-dot" />
                      <div className="thinking-dot" />
                    </div>
                  </div>
                  <p className="mt-1.5 max-w-[min(21rem,calc(100vw-8rem))] text-sm leading-relaxed text-muted-foreground">
                    {thinkingMessage || "Preparing your astrological guidance..."}
                  </p>
                </div>
              </div>
            )}
            <style>{`@keyframes loading {0%{transform:translateX(-100%)}50%{transform:translateX(50%)}100%{transform:translateX(200%)}}`}</style>
            <div ref={endRef} className="scroll-mt-[110px] sm:scroll-mt-0" />
          </div>
        </div>

        {/* Scroll-to-bottom FAB */}
        {showScrollFab && isTyping && (
          <button
            onClick={() => {
              userScrolledUp.current = false;
              setShowScrollFab(false);
              scrollToBottom(true);
            }}
            className="fixed z-30 bottom-24 right-8 w-10 h-10 rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center hover:bg-pink-600 transition-all animate-bounce"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* Suggestions + Bottom Input Bar */}
        <div 
          className={`z-20 ${isMobile ? "fixed left-0 right-0 bottom-0" : "fixed bottom-0 right-0"}`}
          style={{ 
            left: isMobile ? undefined : inputBarLeft, 
            bottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="max-w-4xl mx-auto w-full px-2 sm:px-3 md:px-4 lg:px-6 pt-2 sm:pt-3 pb-3 sm:pb-4 pointer-events-auto">
            {/* Category Cards with Drop-up Prompts */}
            {!hasChatted && !hasTyped && (
              <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categoryPrompts.map((cat) => (
                  <Popover key={cat.id} open={openCategory === cat.id} onOpenChange={(open) => setOpenCategory(open ? cat.id : null)}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-border/60 bg-card/30 hover:border-secondary/50 hover:bg-card/50 transition-all text-xs sm:text-sm text-foreground/80 backdrop-blur-sm w-full">
                        <span className="text-base sm:text-lg">{cat.icon}</span>
                        <span className="truncate">{lang === "hi" ? cat.labelHi : cat.labelEn}</span>
                        <ChevronUp className="w-3 h-3 ml-auto opacity-40 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="center" sideOffset={8} className="w-64 sm:w-72 p-2 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-xl z-50">
                      <div className="flex flex-col gap-1">
                        {(lang === "hi" ? cat.promptsHi : cat.promptsEn).map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            disabled={sending}
                            onClick={() => { setMessage(prompt); setHasChatted(true); setOpenCategory(null); focusInput(); }}
                            className="text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm leading-5 text-foreground/80 hover:bg-secondary/10 hover:text-foreground transition border border-transparent hover:border-border/40 disabled:opacity-60"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            )}
            {/* CHANGING IN THE INPUT BOX AND BUTTON HERE */}
            <div className="min-h-[40px] sm:min-h-[48px] flex justify-between items-center">
              <div className="text-[9px] sm:text-[10px] text-muted-foreground inline-flex items-center gap-1">
                {credits} Credits available
              </div>
            </div>
            <Card className={`relative overflow-hidden p-2 sm:p-2.5 rounded-3xl bg-card border border-border/60 transition-all duration-500 ${message.trim() ? "border-pink-400/40 shadow-[0_0_22px_rgba(236,72,153,0.10),0_0_52px_rgba(236,72,153,0.06)]" : ""} ${sending ? "ring-1 ring-secondary" : ""}`}>
              {message.trim() && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 animate-typing-glow bg-[radial-gradient(ellipse_at_50%_55%,rgba(236,72,153,0.16)_0%,rgba(236,72,153,0.07)_42%,transparent_76%)]"
                />
              )}
              <div className="relative flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Input
                    ref={inputRef}
                    id="chat-input"
                    placeholder={t("askPlaceholder")}
                    value={message}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMessage(v);
                      if (!hasChatted) setHasTyped(v.trim().length > 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        send();
                      }
                    }}
                    disabled={sending}
                    className={`h-10 sm:h-12 bg-background/60 border border-border/60 focus-visible:ring-1 focus-visible:ring-secondary/40 rounded-2xl px-3 sm:px-4 pr-14 text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${message.trim() ? "border-secondary/40 bg-background/75 shadow-[0_0_18px_rgba(236,72,153,0.12)]" : ""}`}
                  />
                  <Button
                    variant="cosmic"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full"
                    onClick={() => send()}
                    disabled={sending || !message.trim()}
                    aria-label="Send"
                  >
                    <Send className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[40] md:hidden"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSidebarOpen(false);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setSidebarOpen(false);
          }}
        />
      )}

      <Dialog open={showMemoryPrompt} onOpenChange={setShowMemoryPrompt}>
        <DialogContent className="max-w-md border-border/70 bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add Memory</DialogTitle>
            <DialogDescription className="text-base leading-6">
              Add memory and make Vedika more accurate. Your answers stay stored locally on this device and help personalize your chat guidance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setShowMemoryPrompt(false)}>Maybe later</Button>
            <Button variant="cosmic" onClick={startMemoryQuestions}>Add my memory</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMemoryQuestions} onOpenChange={setShowMemoryQuestions}>
        <DialogContent className="max-w-lg border-border/70 bg-card">
          <DialogHeader>
            <DialogTitle>Add your memory</DialogTitle>
            <DialogDescription>
              Question {memoryStep + 1} of {MEMORY_QUESTIONS.length}
            </DialogDescription>
          </DialogHeader>
          {MEMORY_QUESTIONS[memoryStep] && (
            <div className="space-y-4 pt-2">
              <p className="text-base font-medium text-foreground">{MEMORY_QUESTIONS[memoryStep].question}</p>
              {MEMORY_QUESTIONS[memoryStep].options ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {MEMORY_QUESTIONS[memoryStep].options!.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant="outline"
                      className="h-auto min-h-11 justify-start whitespace-normal text-left"
                      onClick={() => saveMemoryAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {MEMORY_QUESTIONS[memoryStep].key === "additionalContext" ? (
                    <>
                      <textarea
                        value={memoryText}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          if (nextValue.trim().split(/\s+/).filter(Boolean).length <= 50) setMemoryText(nextValue);
                        }}
                        placeholder={MEMORY_QUESTIONS[memoryStep].placeholder}
                        rows={6}
                        maxLength={1000}
                        autoFocus
                        className="flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <p className="text-right text-xs text-muted-foreground">
                        {memoryText.trim() ? memoryText.trim().split(/\s+/).length : 0}/50 words
                      </p>
                    </>
                  ) : (
                    <Input
                      value={memoryText}
                      onChange={(event) => setMemoryText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveMemoryAnswer(memoryText);
                      }}
                      placeholder={MEMORY_QUESTIONS[memoryStep].placeholder}
                      autoFocus
                    />
                  )}
                  <div className="flex justify-between gap-2">
                    <Button type="button" variant="ghost" onClick={() => saveMemoryAnswer("Not applicable")}>Skip</Button>
                    <Button type="button" variant="cosmic" onClick={() => saveMemoryAnswer(memoryText)} disabled={!memoryText.trim()}>
                      {memoryStep === MEMORY_QUESTIONS.length - 1 ? "Save memory" : "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showMemoryLocked} onOpenChange={setShowMemoryLocked}>
        <DialogContent className="max-w-md border-border/70 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-secondary" /> Vedika Memory is locked</DialogTitle>
            <DialogDescription className="text-base leading-6">
              Upgrade to Quick Ask, Deep Dive, or Power Pack to save personal memory and receive more accurate guidance from Vedika.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowMemoryLocked(false)}>Close</Button>
            <Button variant="cosmic" onClick={() => navigate("/pricing")}>View plans</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMemoryReset} onOpenChange={setShowMemoryReset}>
        <DialogContent className="max-w-md border-border/70 bg-card">
          <DialogHeader>
            <DialogTitle>Replace saved memory?</DialogTitle>
            <DialogDescription className="text-base leading-6">
              You already have saved Vedika Memory on this device. Do you want to delete your previous memory and start again?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowMemoryReset(false)}>No, keep it</Button>
            <Button variant="destructive" onClick={resetMemory}>Yes, delete and start again</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function parseQuestionSuggestions(raw: string): string[] {
  const clean = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(clean);
    const questions = Array.isArray(parsed) ? parsed : parsed?.questions;
    if (Array.isArray(questions)) {
      return questions
        .map((q) => String(q || "").trim())
        .filter((q) => q.endsWith("?"))
        .slice(0, 2);
    }
  } catch {
    /* fallback below */
  }

  return clean
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter((line) => line.endsWith("?"))
    .slice(0, 2);
}

async function generateAnswerSuggestions(question: string, answer: string, lang: string, memoryBlock = ""): Promise<string[]> {
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
  const prompt = `You generate exactly two highly relevant follow-up questions after an astrology response.

Your goal is to make the user feel understood, continue the conversation naturally, and encourage deeper personalized exploration.

Return ONLY valid JSON in this exact format:
{"questions":["Question 1","Question 2"]}

Rules:

- Write exactly 2 questions.
- Questions must sound like natural questions the user would genuinely want to ask next.
- Use simple, conversational language matching the user's language and tone.
- If the user writes in Hindi, Hinglish, or English, respond in the same style.
- Personalize the questions using the topic, concern, and emotional context of the latest conversation.
- Never repeat the user's exact question.

Question 1:
- Go deeper into the exact topic just discussed.
- Focus on timing, causes, obstacles, opportunities, or the best next step.
- It should feel like the most obvious and valuable continuation.

Question 2:
- Connect the current topic to another relevant practical life area.
- Prefer areas such as career, money, relationships, family, education, confidence, or decision-making.
- The connection must feel natural, not random.

Conversion and engagement principles:

- Prefer questions that require personalized birth-chart analysis rather than generic advice.
- Create genuine curiosity without implying that a dramatic secret, guaranteed event, or hidden danger exists.
- Make each question specific enough that the answer would feel valuable.
- Avoid yes/no questions where possible.
- Keep each question concise, ideally under 14 words.

- Do not introduce new planetary placements, dates, predictions, remedies, or chart facts.
- Do not answer the questions.
- Do not use markdown, numbering, labels, explanations, or any text outside the JSON object.

Language: ${lang === "hi" ? "Hindi/Hinglish matching the user" : "English"}.

User question:
${question}

Vedika answer:
${answer.slice(0, 1200)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE}/api/mistral`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          history: [],
          systemExtra: `Return valid JSON only. Do not include markdown fences.${memoryBlock ? `\n\n${memoryBlock}` : ""}`,
          lang,
          apiKeySlot: "secondary",
          model: "mistral-small-latest",
        }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return parseQuestionSuggestions(String(data?.text || ""));
  } catch (error) {
    console.error("[generateAnswerSuggestions] Failed:", error);
    return []; // Return empty array on failure to prevent infinite loading
  }
}

function formatAssistantContent(content: string): string[] {
  const text = content.trim();
  if (!text) return [];

  const explicitLines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (explicitLines.length > 1) return explicitLines;

  const sentences = text
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || [text];

  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join(" "));
  }
  return chunks;
}
