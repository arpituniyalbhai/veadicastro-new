import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnergyGauge } from "@/components/EnergyGauge";
import { Heart, Briefcase, Activity, Wallet, ArrowLeft, Lock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGemini } from "@/lib/gemini";
import SEO from "@/components/SEO";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return function () {
    t += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailyLuckyData(uid: string, dateKey: string) {
  const seed = hashString(`${uid}_${dateKey}`);
  const rng = mulberry32(seed);
  return {
    energy: 40 + Math.floor(rng() * 56),
    luckyColor: (["Purple","Gold","Blue","Emerald","Rose","Amber","Jade","Sapphire","Turquoise","Coral"])[Math.floor(rng() * 10)],
    luckyNumber: 1 + Math.floor(rng() * 9),
  };
}

function getAuspiciousWindow(uid: string, dateKey: string, place: string) {
  const seed = hashString(`${uid}_${dateKey}_${place}_time`);
  const rng = mulberry32(seed);
  const startHour = 6 + Math.floor(rng() * 10);
  const duration = 1 + Math.floor(rng() * 2);
  const fmt = (h: number) => {
    const p = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:00 ${p}`;
  };
  return { start: fmt(startHour), end: fmt(startHour + duration) };
}

function getTimeLabel(uid: string, dateKey: string) {
  const seed = hashString(`${uid}_${dateKey}_label`);
  const rng = mulberry32(seed);
  return (["Best time","Good window","Favorable hours","Golden hour","Right time","Ideal window"])[Math.floor(rng() * 6)];
}

const colorMap: Record<string, string> = {
  Purple: "bg-purple-500", Gold: "bg-yellow-500", Blue: "bg-blue-500",
  Emerald: "bg-emerald-500", Rose: "bg-rose-500", Amber: "bg-amber-500",
  Jade: "bg-green-600", Sapphire: "bg-indigo-600", Turquoise: "bg-cyan-500",
  Coral: "bg-orange-400",
};

const getLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const DailyPrediction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const referral = searchParams.get("referral") || "daily-prediction";
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();

  const parsedDate = useMemo(() => {
    if (dateParam) {
      const [y, m, d] = dateParam.split("-").map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  }, [dateParam]);

  const [selectedDate, setSelectedDate] = useState<Date>(parsedDate);
  const [sections, setSections] = useState<Record<string, string> | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);

  const dateKey = useMemo(() => getLocalDateKey(selectedDate), [selectedDate]);
  const uid = user?.uid || "guest";
  const luckyData = useMemo(() => getDailyLuckyData(uid, dateKey), [uid, dateKey]);

  let details: any = null;
  let planets: any = null;
  try {
    details = JSON.parse(localStorage.getItem("onboarding_details") || "null");
    planets = JSON.parse(localStorage.getItem("astrology_planets") || "null");
  } catch {}

  const place = details?.place || "your location";
  const timeWindow = useMemo(() => getAuspiciousWindow(uid, dateKey, place), [uid, dateKey, place]);
  const timeLabel = useMemo(() => getTimeLabel(uid, dateKey), [uid, dateKey]);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const hasPaidPlan = useMemo(() => {
    const planName = (() => { try { const p = JSON.parse(localStorage.getItem("plan") || "{}"); return p.name || ""; } catch { return ""; } })();
    return ["deep dive", "power pack", "quick ask"].some((k) => planName.toLowerCase().includes(k));
  }, []);

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const start = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const fetchSections = useCallback(async (dt: Date, key: string) => {
    setSectionsLoading(true);
    setSectionsError(false);

    const cacheKey = `ai_daily_sections_${uid}_${key}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached?.love && cached?.career && cached?.health && cached?.wealth) {
        setSections(cached);
        setSectionsLoading(false);
        hasFetchedRef.current = key;
        return;
      }
    } catch {}

    const dateFormatted = dt.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const systemPrompt = `You are a life prediction expert. Respond with valid JSON only:
{"love":"30-40 word prediction","career":"30-40 word prediction","health":"30-40 word prediction","wealth":"30-40 word prediction"}
STRICT: Do NOT mention astrology, planets, houses, dasha, transits, zodiac signs, or any Vedic terms.
Write as pure life predictions — natural, direct, practical statements about what is coming.
Each field exactly 30-40 words. Plain text, no markdown, no asterisks, no bold.
English only.`;

    const prompt = `Generate 4 short predictions for ${dateFormatted} based on:
${details ? `Birth: ${details.dob}, ${details.time}, ${details.place}` : "General chart"}
${planets ? `Key planetary influences: ${planets.slice(0, 7).map((p: any) => `${p.name || p.planet} in ${p.sign}`).join(", ")}` : ""}

Love — what is coming in love and relationships:
Career — what is coming in career and work:
Health — what is coming in health and wellness:
Wealth — what is coming in money and finances:`;

    try {
      const response = await Promise.race([
        generateGemini(prompt, [], systemPrompt, lang, undefined, "secondary"),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timed out")), 25000)),
      ]);

      const start = response.indexOf("{");
      const end = response.lastIndexOf("}");
      let parsed: Record<string, string> = { love: "", career: "", health: "", wealth: "" };

      if (start !== -1 && end > start) {
        try {
          parsed = JSON.parse(response.slice(start, end + 1));
        } catch {
          const cleaned = response.slice(start, end + 1)
            .replace(/[\u0000-\u001f]+/g, " ")
            .replace(/[""'']/g, '"');
          try { parsed = JSON.parse(cleaned); } catch {}
        }
      }

      parsed.love = parsed.love?.trim() || "";
      parsed.career = parsed.career?.trim() || "";
      parsed.health = parsed.health?.trim() || "";
      parsed.wealth = parsed.wealth?.trim() || "";

      if (!parsed.love && !parsed.career && !parsed.health && !parsed.wealth) {
        const text = response.replace(/```/g, "").trim();
        parsed = { love: text, career: text, health: text, wealth: text };
      }

      setSections(parsed);
      hasFetchedRef.current = key;
      try { localStorage.setItem(cacheKey, JSON.stringify(parsed)); } catch {}
    } catch (err) {
      console.error("Failed to fetch daily sections:", err);
      setSectionsError(true);
    } finally {
      setSectionsLoading(false);
    }
  }, [uid, details, planets, lang]);

  useEffect(() => {
    if (hasFetchedRef.current !== dateKey && !sectionsLoading) {
      hasFetchedRef.current = dateKey;
      fetchSections(selectedDate, dateKey);
    }
  }, [dateKey, selectedDate, fetchSections, sectionsLoading]);

  const handleDateClick = (date: Date) => {
    const key = getLocalDateKey(date);
    setSelectedDate(date);
    setSections(null);
    navigate(`/daily-prediction?date=${key}&referral=${referral}`, { replace: true });
  };

  const sectionConfig = [
    { key: "love", icon: Heart, label: "Love", gradient: "from-pink-500/10 to-rose-500/5", border: "border-pink-500/20" },
    { key: "career", icon: Briefcase, label: "Career", gradient: "from-blue-500/10 to-cyan-500/5", border: "border-blue-500/20" },
    { key: "health", icon: Activity, label: "Health", gradient: "from-emerald-500/10 to-green-500/5", border: "border-emerald-500/20" },
    { key: "wealth", icon: Wallet, label: "Wealth", gradient: "from-amber-500/10 to-yellow-500/5", border: "border-amber-500/20" },
  ];

  return (
    <div className="min-h-screen bg-background px-3 sm:px-4 py-6 sm:py-10">
      <SEO
        title={`${displayName}'s Daily Prediction - ${selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        description={`Personalized daily prediction for ${displayName} based on Vedic astrology. Check your love, career, health and wealth insights.`}
        url={`https://veadicastro.in/daily-prediction?date=${dateKey}`}
      />

      <div className="max-w-4xl mx-auto space-y-5">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/dashboard?referral=${referral}`)} className="p-2 rounded-lg hover:bg-accent/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{displayName}'s Insights</h1>
            <p className="text-sm text-muted-foreground">{selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>

        {/* Calendar Strip */}
        <Card className="p-4 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDates.map((date, idx) => {
              const isSelected = getLocalDateKey(date) === dateKey;
              const isToday = getLocalDateKey(date) === getLocalDateKey(new Date());
              const isLocked = !hasPaidPlan && !isToday;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isLocked) { navigate("/pricing?referral=daily-prediction"); return; }
                    handleDateClick(date);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl transition-all duration-200 border relative py-2.5 sm:py-3",
                    isSelected
                      ? "bg-gradient-to-br from-secondary/20 to-primary/20 border-secondary/50 shadow-lg shadow-secondary/20"
                      : isLocked
                      ? "bg-muted/30 border-dashed border-border/40 opacity-60"
                      : "bg-background/50 border-border/60 hover:border-secondary/40 hover:bg-accent/10",
                    isToday && !isSelected && "ring-2 ring-secondary/30"
                  )}
                >
                  {isLocked && <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-muted-foreground" />}
                  <span className={cn("text-[10px] sm:text-xs font-medium mb-0.5", isSelected ? "text-secondary" : "text-muted-foreground")}>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className={cn("text-sm sm:text-base font-bold", isSelected ? "text-foreground" : "text-foreground/80")}>
                    {date.getDate()}
                  </span>
                  {isToday && <span className="text-[9px] sm:text-[10px] font-semibold text-secondary mt-0.5">Today</span>}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Energy + Lucky Colour + Lucky Number */}
        <Card className="p-5 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          <div className="flex items-center gap-6 sm:gap-10">
            <EnergyGauge value={luckyData.energy} size={80} strokeWidth={5} />
            <div className="flex gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1.5">WEAR</p>
                <div className={cn("w-10 h-10 rounded-full mx-auto mb-1 ring-2 ring-border/40", colorMap[luckyData.luckyColor] || "bg-purple-500")} />
                <p className="text-sm font-semibold text-foreground">{luckyData.luckyColor}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1.5">MANIFEST</p>
                <div className="w-10 h-10 rounded-full mx-auto mb-1 bg-gradient-to-br from-secondary to-accent flex items-center justify-center ring-2 ring-border/40">
                  <span className="text-lg font-bold text-white">{luckyData.luckyNumber}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Number {luckyData.luckyNumber}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Time */}
        <Card className="p-5 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">{timeLabel}</h3>
            <span className="text-xs text-muted-foreground">{place}</span>
          </div>
          <div className="relative h-6 rounded-full bg-background/60 border border-border/60 overflow-hidden">
            <div
              className="absolute inset-y-0 rounded-full bg-gradient-to-r from-secondary to-accent opacity-80"
              style={{
                left: `${((parseInt(timeWindow.start) % 12) / 12) * 100}%`,
                width: "16%",
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{timeWindow.start}</span>
            <span className="font-medium text-foreground">{timeWindow.start} – {timeWindow.end}</span>
            <span>{timeWindow.end}</span>
          </div>
        </Card>

        {/* 4 AI Cards */}
        {sectionsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5 bg-card/40 border-border/60 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full animate-pulse" />
                  <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-4/5 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        ) : sectionsError ? (
          <Card className="p-6 bg-card/40 border-border/60 rounded-2xl text-center">
            <p className="text-sm text-muted-foreground mb-3">Could not load predictions. Please try again.</p>
            <Button variant="cosmic" size="sm" onClick={() => { setSectionsError(false); fetchSections(selectedDate, dateKey); }}>
              Retry
            </Button>
          </Card>
        ) : sections ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectionConfig.map(({ key, icon: Icon, label, gradient, border }) => (
              <Card key={key} className={cn("p-5 bg-gradient-to-br border rounded-2xl", gradient, border)}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">{label}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{sections[key]}</p>
              </Card>
            ))}
          </div>
        ) : null}

        {/* CTA */}
        <Button
          variant="cosmic"
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={() => navigate(`/chat?referral=daily-prediction`)}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Ask your question
        </Button>
      </div>
    </div>
  );
};

export default DailyPrediction;
