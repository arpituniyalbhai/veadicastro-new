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
import { getDailyLuckyData, getAuspiciousWindow, getTimeInfo, colorMap } from "@/lib/dailyInsights";
import { usePlan } from "@/context/PlanContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function sanitizeModelJson(raw: string): string {
  let cleaned = raw
    .replace(/[\u0000-\u001f]+/g, " ")
    .replace(/[\u0966-\u096F]/g, (d) => "0123456789"["\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F".indexOf(d)])
    .replace(/[\u3001]/g, ",")
    .replace(/[""'']/g, '"')
    .replace(/[`]/g, "'");
  cleaned = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
    const inner = match.slice(1, -1).replace(/\r?\n/g, "\\n");
    return `"${inner}"`;
  });
  return cleaned;
}

function extractField(text: string, field: string): string {
  const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, "i");
  const match = text.match(regex);
  if (!match) return "";
  return match[1].replace(/\\n/g, " ").replace(/\\"/g, '"').trim();
}

const getLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const DailyPrediction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const referral = searchParams.get("referral") || "daily-prediction";
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useI18n();
  const { planName } = usePlan();

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
  const [lockedDateModal, setLockedDateModal] = useState<Date | null>(null);
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

  const [currentTime, setCurrentTime] = useState(() => {
    const n = new Date();
    return { h: n.getHours(), m: n.getMinutes() };
  });

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setCurrentTime({ h: n.getHours(), m: n.getMinutes() });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const place = details?.place?.split(",")[0] || "your location";
  const timeWindow = useMemo(() => getAuspiciousWindow(uid, dateKey, place), [uid, dateKey, place]);
  const timeInfo = useMemo(() => getTimeInfo(uid, dateKey), [uid, dateKey]);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const isFree = !planName || planName === "Free";

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
        generateGemini(prompt, [], systemPrompt, "en", undefined, "secondary"),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timed out")), 25000)),
      ]);

      const start = response.indexOf("{");
      const end = response.lastIndexOf("}");
      let parsed: Record<string, string> = { love: "", career: "", health: "", wealth: "" };

      if (start !== -1 && end > start) {
        const block = response.slice(start, end + 1);
        const cleaned = sanitizeModelJson(block);
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = {
            love: extractField(block, "love"),
            career: extractField(block, "career"),
            health: extractField(block, "health"),
            wealth: extractField(block, "wealth"),
          };
        }
      }

      parsed.love = parsed.love?.trim() || "";
      parsed.career = parsed.career?.trim() || "";
      parsed.health = parsed.health?.trim() || "";
      parsed.wealth = parsed.wealth?.trim() || "";

      if (!parsed.love && !parsed.career && !parsed.health && !parsed.wealth) {
        setSectionsError(true);
        setSectionsLoading(false);
        return;
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
    { key: "love", icon: Heart, label: "Love" },
    { key: "career", icon: Briefcase, label: "Career" },
    { key: "health", icon: Activity, label: "Health" },
    { key: "wealth", icon: Wallet, label: "Wealth" },
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
        <Card className="p-4 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDates.map((date, idx) => {
              const isSelected = getLocalDateKey(date) === dateKey;
              const isToday = getLocalDateKey(date) === getLocalDateKey(new Date());
              const isLocked = isFree && !isToday;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isLocked) { setLockedDateModal(date); return; }
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
        <Card className="p-6 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <div className="flex justify-center mb-5">
            <EnergyGauge value={luckyData.energy} size={140} strokeWidth={8} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className={cn("w-8 h-8 rounded-full ring-2 ring-white/10", colorMap[luckyData.luckyColor] || "bg-purple-500")} />
              <p className="text-sm font-semibold text-white/90 mt-1">{luckyData.luckyColor}</p>
              <p className="text-[10px] text-white/40 tracking-wide">LUCKY COLOUR</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center">
                <span className="text-base font-bold text-white">{luckyData.luckyNumber}</span>
              </div>
              <p className="text-sm font-semibold text-white/90 mt-1">{luckyData.luckyNumber}</p>
              <p className="text-[10px] text-white/40 tracking-wide">LUCKY NUMBER</p>
            </div>
          </div>
        </Card>

        {/* Right Time */}
        <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <h3 className="text-sm font-semibold text-white/90 mb-3">
            {timeInfo.isBad ? "Bad timing" : "Subh time"} in <span className="text-white/70">{place}</span>
          </h3>
          <div className="relative h-6 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-hidden">
            <div
              className={cn("absolute inset-y-0 rounded-full transition-all", timeInfo.isBad ? "bg-red-500/40" : "bg-white/20")}
              style={{ left: `${(timeWindow.startHour / 24) * 100}%`, width: `${((timeWindow.endHour - timeWindow.startHour) / 24) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80"
              style={{ left: `${(currentTime.h + currentTime.m / 60) / 24 * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>{timeWindow.start}</span>
            <span className="font-medium text-white/80">{String(currentTime.h).padStart(2,"0")}:{String(currentTime.m).padStart(2,"0")}</span>
            <span>{timeWindow.end}</span>
          </div>
          <p className={cn("text-xs mt-3 text-center", timeInfo.isBad ? "text-red-400/70" : "text-white/50")}>
            {timeInfo.isBad
              ? `${timeInfo.label} — ${displayName}, consider waiting for a clearer window`
              : `${timeInfo.label} — best window for ${displayName}`}
          </p>
        </Card>

        {/* 4 AI Cards */}
        {sectionsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-16 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-4/5 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        ) : sectionsError ? (
          <Card className="p-6 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl text-center">
            <p className="text-sm text-white/50 mb-3">Could not load predictions. Please try again.</p>
            <Button variant="cosmic" size="sm" onClick={() => { setSectionsError(false); fetchSections(selectedDate, dateKey); }}>
              Retry
            </Button>
          </Card>
        ) : sections ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectionConfig.map(({ key, icon: Icon, label }) => (
              <Card key={key} className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl hover:border-white/[0.12] transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white/70" />
                  </div>
                  <h3 className="font-semibold text-white/90">{label}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{sections[key]}</p>
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

      <Dialog open={!!lockedDateModal} onOpenChange={(open) => !open && setLockedDateModal(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6 text-center bg-[#0c0c0e] border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white/90">
              Your {lockedDateModal?.toLocaleDateString("en-US", { month: "long", day: "numeric" })} predictions are ready
            </DialogTitle>
            <DialogDescription className="text-sm text-white/50 mt-2 leading-relaxed">
              But you're on the free plan. Please upgrade to any plan to see your{" "}
              {lockedDateModal?.toLocaleDateString("en-US", { month: "long", day: "numeric" })} predictions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button variant="cosmic" className="w-full rounded-xl" onClick={() => navigate("/pricing?referral=daily-prediction")}>
              Upgrade Now
            </Button>
            <Button variant="ghost" className="w-full rounded-xl text-white/50" onClick={() => setLockedDateModal(null)}>
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyPrediction;
