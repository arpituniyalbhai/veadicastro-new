import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Home, MessageSquare, Receipt, Plus, RefreshCw, ChevronLeft, ChevronRight, Menu, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { usePlan } from "@/context/PlanContext";
import { generateGeminiStream, generateGemini, type ChatTurn } from "@/lib/gemini";
import { persistAstroPayload } from "@/lib/astroStorage";
import { getPlanetaryData } from "@/lib/astroCalc";
import type { AstroInput } from "@/lib/astroCalc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// ─── Chat Session Types ───────────────────────────────────────────────────────
interface ChatSession {
  id: string;
  title: string;
  messages: ChatTurn[];
  createdAt: number;
  updatedAt: number;
}

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
  const { t, lang } = useI18n();
  const { planName, credits, canAccess, canAskMoreQuestions, registerQuestionUsage, useQuickPackQuestion, deductCredit } = usePlan();
  const remainingQuestions = Math.max(credits, 0);

  // Timer state for ₹49 plan
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
  const messagesRef = useRef<ChatTurn[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  // Show suggestions the first time until typing or first message is sent
  const [hasChatted, setHasChatted] = useState<boolean>(false);
  const [hasTyped, setHasTyped] = useState<boolean>(false);
  const [answerSuggestions, setAnswerSuggestions] = useState<Record<number, string[]>>({});
  const [inputBarLeft, setInputBarLeft] = useState<string>('0');
  const assistantAvatarUrl = "/optimized/vedika.webp"; // Vedika avatar from public
  const userAvatarUrl = (() => { try { return localStorage.getItem('profile_photo') || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU"; } catch { return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU"; } })(); // user's avatar
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Dynamic thinking messages
  const thinkingMessages = [
    "Investigating your planetary positions...",
    "Studying your birth Kundali...",
    "Mapping your life timeline...",
    "Calculating dasha and Nakshatra..",
    "Studying current planet movements...",
    "Preparing your astrological outcome..."
  ];

  // Cycle through thinking messages
  useEffect(() => {
    if (!isTyping) {
      setThinkingMessage("");
      return;
    }

    let messageIndex = 0;
    setThinkingMessage(thinkingMessages[0]);

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % thinkingMessages.length;
      setThinkingMessage(thinkingMessages[messageIndex]);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [isTyping]);

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

  // Lifetime quota: 1 free question ever
  const LIFETIME_KEY = "chat_free_used"; // legacy key, kept for backward compatibility
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('399');
  const selectedPlanMap: any = {'149':{plan:'Quick Ask',amount:149,type:'pack',qs:5},'399':{plan:'Deep Dive',amount:399,type:'pack',qs:15},'699':{plan:'The Power Pack',amount:699,type:'pack',qs:30}};

  const displayName = (() => { 
    try { 
      return localStorage.getItem('profile_name') || 
             user?.displayName ||    // Google ka actual name
             "User";                 // email split hatao, sirf "User" fallback
    } catch { 
      return user?.displayName || "User"; 
    } 
  })();
  const initials = useMemo(() => displayName.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase(), [displayName]);
  const isProPlan = useMemo(() => {
    const paidPlanKeywords = ["quick ask", "deep dive", "power pack"];
    return paidPlanKeywords.some((keyword) => planName?.toLowerCase().includes(keyword));
  }, [planName]);

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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup old lifetime quota key, but we no longer rely on it
  useEffect(() => {
    try {
      localStorage.removeItem(LIFETIME_KEY);
    } catch {
      /* ignore */
    }
  }, []);

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
      // Remove the empty assistant placeholder
      setMessages((m) => m.slice(0, -1));
      
      // Show limit warning instead of a message
      setShowLimitWarning(true);
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
      const detailsBlock = details?.dob ? `User Details:\nDOB: ${details.dob}\nTime: ${details.time}\nPlace: ${details.place}\nLat: ${details.lat}\nLng: ${details.lng}\nTZ: ${typeof details.tzone === 'number' ? details.tzone : ''}\nGender: ${details.gender}` : "";
      
      // SAHI - sirf planetary data + user details bhejo
      const systemExtra = `${planetsBlock || 'Planetary Data: (not available)'}\n\n${detailsBlock}`.trim();
      
      const numeralRule = "All numbers, dates, years, and ranges must use English numerals (0-9). Never use Devanagari digits (०१२३४५६७८९).";
      const languageRule = lang === "hi"
        ? `CRITICAL: You MUST respond ONLY in pure Hindi (Devanagari script). Do NOT use any English words, Hinglish, or mixed language. Write everything in complete Hindi sentences using Devanagari script. Never use English words like 'career', 'marriage', 'money', etc. - always use Hindi equivalents like 'करियर', 'विवाह', 'धन', etc. If you use any English words, the response is incorrect. Respond entirely in Hindi Devanagari script only. ${numeralRule}`
        : `Respond in English. Do not mention anything about language choice. ${numeralRule}`;
      const formattingBan = "Output must be plain text only. Do not use Markdown, bold, italics, bullets, asterisks, hyphens, numbered lists, quotes, or decorative symbols.";
      
      // Backend already handles VAANI_SYSTEM_PROMPT, so we only need language + formatting rules
      const systemBlock = `${languageRule}\n${formattingBan}`.trim();
      const inlineContext = `${planetsBlock || 'Planetary Data: (not available)'}\n\n${detailsBlock}`.trim();
      const promptText = `Context (use this for accuracy):\n${inlineContext}\n\nUser Question:\n${userText}`.trim();
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
      await generateGeminiStream(promptText, messages, (delta) => {
        streamedAnswer += delta;
        if (sanitize(streamedAnswer).trim()) {
          aiAnswerCompleted = true;
        }
        // Hide thinking indicator on first chunk
        if (!firstChunkReceived) {
          firstChunkReceived = true;
          setIsTyping(false);
        }
        
        // Append chunks directly so UI updates immediately
        setMessages((m) => {
          const copy = [...m];
          const lastIndex = copy.length - 1;
          if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
            const next = (copy[lastIndex].content || "") + delta;
            copy[lastIndex] = { role: "assistant", content: sanitize(next) };
          }
          return copy;
        });
        deltaCount++;
      }, systemExtra, lang, displayName);
      if (deltaCount === 0) {
        // Fallback: non-streaming final response
        const final = await generateGemini(promptText, messages, systemExtra, lang, displayName);
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

      const creditDeducted = await deductCredit();
      if (!creditDeducted) {
        setMessages((m) => {
          const copy = [...m];
          const lastIndex = copy.length - 1;
          if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
            copy[lastIndex] = { role: "assistant", content: "Your credits are over. Please upgrade to keep asking Vedika AI." };
          }
          return copy;
        });
        setShowLimitWarning(true);
        return;
      }

      console.log("AI answer completed, credit deducted successfully");
      generateAnswerSuggestions(userText, finalAnswerForSuggestions, lang)
        .then((nextQuestions) => {
          if (!nextQuestions.length) return;
          const assistantIndex = messagesRef.current.map((item) => item.role).lastIndexOf("assistant");
          if (assistantIndex >= 0) {
            setAnswerSuggestions((prev) => ({ ...prev, [assistantIndex]: nextQuestions }));
          }
        })
        .catch((error) => console.debug("[Chat] Suggestion generation failed", error));
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        const lastIndex = copy.length - 1;
        if (lastIndex >= 0 && copy[lastIndex].role === "assistant") {
          copy[lastIndex] = { role: "assistant", content: "Sorry, I couldn't process that right now." };
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
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 min-w-0 flex flex-col ${sidebarExpanded ? 'md:ml-64' : 'md:ml-20'} overflow-y-auto`} style={{ height: '-webkit-fill-available', maxHeight: '100vh', WebkitOverflowScrolling: 'touch' }}>
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
          <div className="hidden md:block flex-shrink-0 ml-2">
            <button
              className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg bg-card/40 border border-border/60 hover:bg-accent/10 hover:border-secondary/50 flex-shrink-0 whitespace-nowrap transition-all"
              onClick={() => navigate("/pricing")}
            >
              <Plus className="w-4 h-4" /> <span>Ask More</span>
            </button>
          </div>
          <div className="md:hidden">
            <button
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-lg bg-card/40 border border-border/60 hover:bg-accent/10 flex-shrink-0 whitespace-nowrap"
              onClick={() => navigate("/pricing")}
            >
              <Plus className="w-3 h-3" /> <span>Ask More</span>
            </button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto w-full px-1 sm:px-4 lg:px-6 pt-[96px] sm:pt-4 md:pt-4 pb-44 sm:pb-48 flex flex-col flex-1">

          {/* Conversation */}
          <div className="max-w-4xl w-full mx-auto px-1.5 sm:px-4 min-h-[40vh] space-y-4">
            {messages.map((m, idx) => (
              m.role === "assistant" && !m.content?.trim() ? null : (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} px-0.5 sm:px-4`}>
                  {m.role === "assistant" && (
                    <div className="mr-2 sm:mr-3 mt-1 shrink-0">
                      <img src="/optimized/vedika.webp" alt="Vedika — AI Vedic astrologer by Veadicastro" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className={`${m.role === "user" ? "max-w-[82%] sm:max-w-[70%]" : "max-w-[calc(100%-2.25rem)] sm:max-w-[88%] md:max-w-[82%]"} min-w-0`}>
                    <Card className={`${m.role === "user" ? "bg-secondary/15" : "bg-card/45"} w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-border/60 ${m.role === "user" ? "" : "ml-0 sm:ml-1"}`}>
                      <div className="text-sm sm:text-[15px] leading-7 text-foreground/90">
                        {m.role === "assistant" ? (
                          <div className="space-y-3">
                            {formatAssistantContent(m.content || "").map((paragraph, paragraphIndex) => (
                              <p key={paragraphIndex} className="whitespace-pre-wrap">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="whitespace-pre-wrap">{m.content}</span>
                        )}
                      </div>
                    </Card>
                    {m.role === "assistant" && answerSuggestions[idx]?.length > 0 && (
                      <div className="mt-2 ml-0 sm:ml-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {answerSuggestions[idx].map((question, questionIndex) => (
                          <button
                            key={`${idx}-${questionIndex}`}
                            type="button"
                            disabled={sending}
                            onClick={() => send(question)}
                            className="rounded-2xl border border-secondary/30 bg-secondary/10 px-3.5 py-2.5 text-left text-xs sm:text-sm leading-5 text-foreground/85 transition hover:border-secondary/60 hover:bg-secondary/15 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
            {isTyping && (
              <div className="flex items-start gap-3 pl-1 sm:pl-2">
                <div className="mt-1 shrink-0">
                  <img src={assistantAvatarUrl} alt="assistant" className="w-8 h-8 rounded-full object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>thinking...</span>
                    <div className="thinking-dots">
                      <div className="thinking-dot"></div>
                      <div className="thinking-dot"></div>
                      <div className="thinking-dot"></div>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/90 italic text-muted-foreground">
                    {thinkingMessage || "Preparing your astrological guidance..."}
                  </div>
                </div>
              </div>
            )}
            <style>{`@keyframes loading {0%{transform:translateX(-100%)}50%{transform:translateX(50%)}100%{transform:translateX(200%)}}`}</style>
            <div ref={endRef} />
          </div>
        </div>

        {/* Suggestions + Bottom Input Bar */}
        <div 
          className={`z-20 ${isMobile ? "fixed left-0 right-0 bottom-0" : "fixed bottom-0 right-0"}`}
          style={{ 
            left: isMobile ? undefined : inputBarLeft, 
            bottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="max-w-4xl mx-auto w-full px-2 sm:px-3 md:px-4 lg:px-6 pt-2 sm:pt-3 pb-3 sm:pb-4 pointer-events-auto">
            {/* Suggestions near input */}
            {!hasChatted && !hasTyped && suggestions.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {suggestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setMessage(q); setHasChatted(true); focusInput(); }}
                    className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-border/60 bg-card/30 hover:border-secondary/60 hover:text-foreground transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {/* CHANGING IN THE INPUT BOX AND BUTTON HERE */}
            <div className="min-h-[40px] sm:min-h-[48px] flex justify-between items-center">
              <div className="text-[9px] sm:text-[10px] text-muted-foreground inline-flex items-center gap-1">
                {credits} Credits available
              </div>
            </div>
            <Card className={`p-2 sm:p-2.5 rounded-3xl bg-card border border-border/60 ${sending ? "ring-1 ring-secondary" : ""}`}>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
                    className="h-10 sm:h-12 bg-background/60 border border-border/60 focus-visible:ring-1 focus-visible:ring-secondary/40 rounded-2xl px-3 sm:px-4 pr-14 text-sm"
                  />
                  <Button
                    variant="cosmic"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full"
                    onClick={() => send()}
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
      {/* Limit Warning Alert */}
      {showLimitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.92)'}}>
          <div id="vp-paywall" className="[&::-webkit-scrollbar]:hidden" style={{background:'#000',border:'1px solid #1c1c1c',borderRadius:20,width:'100%',maxWidth:380,padding:'24px 20px 20px',maxHeight:'95vh',overflowY:'auto',scrollbarWidth:'none'}}>
            
            <div style={{textAlign:'center',marginBottom:18}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(217,39,122,0.1)',border:'1px solid rgba(217,39,122,0.2)',borderRadius:100,padding:'4px 14px',fontSize:11,color:'#d9277a',fontWeight:500}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#d9277a',display:'inline-block'}}/>
                687 people upgraded today
              </span>
            </div>

            <div style={{textAlign:'center',marginBottom:16}}>
              <img src="/optimized/vedika.webp" alt="Vedika" style={{width:62,height:62,borderRadius:'50%',border:'2px solid #d9277a',margin:'0 auto 14px',display:'block',objectFit:'cover'}}/>
              <div style={{fontSize:17,fontWeight:600,color:'#fff',marginBottom:6,lineHeight:1.4,fontFamily:'Georgia,serif'}}>
                Vedika has more to reveal...
              </div>
              <div style={{fontSize:12,color:'#666',lineHeight:1.6}}>
                Your free reading is over. But your kundali holds a secret Vedika hasn't told you yet.
              </div>
            </div>

            {[
              {id:'149',price:149,name:'Starter',qs:5,features:[]},
              {id:'399',price:399,name:'Popular',qs:15,popular:true,features:['Dasha & transit predictions','Full birth chart analysis','Compatibility & relationship insights']},
              {id:'699',price:699,name:'Full Reading',qs:30,features:[]},
            ].map((plan) => {
              const sel = selectedPlan === plan.id;
              return (
                <div key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{border: sel ? '2px solid #d9277a' : '1px solid #1e1e1e',borderRadius:12,padding:'11px 14px',cursor:'pointer',background: sel ? 'rgba(217,39,122,0.06)' : '#0a0a0a',position:'relative',marginBottom:8,transition:'border 0.1s,background 0.1s',willChange:'border,background'}}
                >
                  {plan.popular && <span style={{position:'absolute',top:-9,left:12,background:'#d9277a',color:'#fff',fontSize:10,fontWeight:500,padding:'2px 10px',borderRadius:100}}>Most popular</span>}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:15,height:15,borderRadius:'50%',border:`2px solid ${sel?'#d9277a':'#333'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {sel && <div style={{width:7,height:7,borderRadius:'50%',background:'#d9277a'}}/>}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:'#fff'}}>{plan.name}</div>
                        <div style={{fontSize:11,color:'#555'}}>{plan.qs} questions</div>
                      </div>
                    </div>
                    <div style={{fontSize:15,fontWeight:600,color:'#fff'}}>₹{plan.price}</div>
                  </div>
                  {sel && plan.features.length > 0 && (
                    <div style={{borderTop:'1px solid #2a0018',marginTop:10,paddingTop:10,display:'flex',flexDirection:'column',gap:5}}>
                      {plan.features.map(f => (
                        <div key={f} style={{display:'flex',alignItems:'center',gap:7,fontSize:11,color:'#999'}}>
                          <span style={{color:'#d9277a'}}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              id="vp-cta"
              onClick={() => {
                const p = selectedPlanMap[selectedPlan];
                navigate(`/pricing/onboarding?plan=${p.plan}&amount=${p.amount}&type=${p.type}`);
                setShowLimitWarning(false);
              }}
              style={{width:'100%',background:'#d9277a',border:'none',borderRadius:12,padding:14,fontSize:14,fontWeight:600,color:'#fff',cursor:'pointer',marginBottom:10,fontFamily:'Georgia,serif'}}
            >
              Unlock {selectedPlanMap[selectedPlan]?.qs} Questions — ₹{selectedPlanMap[selectedPlan]?.amount}
            </button>

            <button
              onClick={() => {
                setShowLimitWarning(false);
                const streamAssistantMessage = (text: string) => {
                  const words = text.split(' ');
                  const messageIndexRef = { current: -1 };
                  setMessages(m => {
                    messageIndexRef.current = m.length;
                    return [...m, { role: 'assistant', content: '' }];
                  });

                  let wordIndex = 0;
                  const interval = window.setInterval(() => {
                    setMessages(m => {
                      const copy = [...m];
                      const messageIndex = messageIndexRef.current;
                      if (messageIndex >= 0 && copy[messageIndex]?.role === 'assistant') {
                        const nextWord = words[wordIndex];
                        copy[messageIndex] = {
                          role: 'assistant',
                          content: `${copy[messageIndex].content}${copy[messageIndex].content ? ' ' : ''}${nextWord}`
                        };
                      }
                      return copy;
                    });
                    wordIndex += 1;
                    if (wordIndex >= words.length) {
                      window.clearInterval(interval);
                    }
                  }, 75);
                };

                setTimeout(() => {
                  const name = (() => { try { return localStorage.getItem('profile_name') || user?.displayName || ''; } catch { return ''; } })();
                  const greeting = name ? `${name}, before` : 'Before';
                  streamAssistantMessage(`${greeting} you go — I noticed something unusual in your chart. Something that doesn't show up often. It's connected to a decision you've been avoiding. I won't bring it up again unless you ask.`);
                  setTimeout(() => {
                    streamAssistantMessage("The window I saw... it's tied to the next 90 days. After that, the planetary shift changes everything. Just so you know.");
                  }, 2200);
                }, 400);
              }}
              style={{display:'block',width:'100%',textAlign:'center',fontSize:12,color:'#444',background:'transparent',border:'none',cursor:'pointer',padding:'4px'}}
            >
              Maybe later
            </button>

          </div>
        </div>
      )}
      {false && showLimitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl p-6 md:p-8 max-w-sm w-full text-center" style={{ background: '#0d0d0d', border: '0.5px solid #222' }}>
            {/* Social proof badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
              style={{ background: '#0a1f0a', border: '0.5px solid #1a4d1a' }}
            >
              <span className="flex-shrink-0 rounded-full" style={{ width: 7, height: 7, background: '#22c55e', display: 'inline-block' }} />
              <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                687 people upgraded in last 24 hours
              </span>
            </div>

            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2"
              style={{ borderColor: '#e91e8c' }}
            >
              <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" />
            </div>

            {/* Heading */}
            <h2 className="text-lg font-medium text-white mb-2">
              Your credits are over
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#888' }}>
              Upgrade to keep asking Vedika AI — unlimited questions, Dasha predictions & full birth chart insights.
            </p>

            {/* Benefits */}
            <div className="rounded-xl p-4 mb-6 text-left" style={{ background: '#111' }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#555' }}>
                What you unlock
              </p>
              {[
                '15 questions to Vedika AI',
                'Dasha & transit predictions',
                'Full birth chart analysis',
                'Compatibility & relationship insights',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm mb-2" style={{ color: '#ccc' }}>
                  <span style={{ color: '#e91e8c' }}>✓</span> {item}
                </div>
              ))}
            </div>

            {/* Upgrade button */}
            <button
              onClick={() => {
                navigate('/pricing/onboarding?plan=Deep%20Dive&amount=399&type=pack');
                setShowLimitWarning(false);
              }}
              className="w-full py-3 rounded-xl text-white text-sm font-medium mb-3 transition-opacity hover:opacity-90"
              style={{ background: '#e91e8c', border: 'none' }}
            >
              Upgrade — Only ₹399
            </button>

            <button
              onClick={() => setShowLimitWarning(false)}
              className="w-full py-2 text-sm transition-colors"
              style={{ color: '#555', background: 'transparent', border: 'none' }}
            >
              Maybe later
            </button>

          </div>
        </div>
      )}

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

async function generateAnswerSuggestions(question: string, answer: string, lang: string): Promise<string[]> {
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
  const prompt = `Return ONLY the JSON object {"questions":["...","..."]}.
Create exactly 2 short, natural next-question suggestions for an astrology chat.
They must help the user explore the same topic deeper, but do not call them follow-up questions.
No predictions, no answers, no markdown.
Language: ${lang === "hi" ? "Hindi/Hinglish matching the user" : "English"}.

User question:
${question}

Vedika answer:
${answer.slice(0, 1200)}`;

  const response = await fetch(`${API_BASE}/api/mistral`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      history: [],
      systemExtra: "Return valid JSON only. Do not include markdown fences.",
      lang,
      apiKeySlot: "secondary",
    }),
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return parseQuestionSuggestions(String(data?.text || ""));
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
