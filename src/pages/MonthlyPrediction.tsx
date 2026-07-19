import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlan } from '@/context/PlanContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnergyGauge } from '@/components/EnergyGauge';
import { ArrowLeft, Lock, MessageCircle, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateGemini } from '@/lib/gemini';
import SEO from '@/components/SEO';
import { sanitizeModelJson } from '@/lib/dailyInsights';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  getMonthKey, getLifeScores, getOverallScore, scoreLabel, overallLabel,
  starsFromScore, renderStars, getLuckyElements, getWeeklyTimeline,
  getPlanetaryInfluence, monthlyColorMap,
  type LifeScores,
} from '@/lib/monthlyInsights';

// ─── AI schema types ──────────────────────────────────────────────────────────
interface SectionAI { prediction: string; [key: string]: string; }
interface SectionResult {
  prediction: string;
  meta: Record<string, string>;
}
type SectionKey = 'love' | 'career' | 'wealth' | 'health' | 'relationships' | 'luck' | 'growth';
type SectionsState = Partial<Record<SectionKey, SectionResult>>;
type SectionsLoading = Partial<Record<SectionKey, boolean>>;
type SectionsError = Partial<Record<SectionKey, boolean>>;

// ─── Section config ───────────────────────────────────────────────────────────
const sectionConfig: {
  key: SectionKey; label: string; emoji: string;
  gradFrom: string; gradTo: string; borderColor: string;
  badgeBg: string; badgeText: string;
  metaKeys: string[];
  metaLabels: Record<string, string>;
}[] = [
  { key: 'love', label: 'Love', emoji: '❤️', gradFrom: 'from-rose-500/20', gradTo: 'to-pink-500/10', borderColor: 'border-rose-500/20', badgeBg: 'bg-rose-500/20', badgeText: 'text-rose-300', metaKeys: ['bestWeek', 'focus', 'energy'], metaLabels: { bestWeek: 'Best Week', focus: 'Focus', energy: 'Energy' } },
  { key: 'career', label: 'Career', emoji: '💼', gradFrom: 'from-blue-500/20', gradTo: 'to-indigo-500/10', borderColor: 'border-blue-500/20', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-300', metaKeys: ['opportunityLevel', 'promotion', 'business'], metaLabels: { opportunityLevel: 'Opportunity', promotion: 'Promotion', business: 'Business' } },
  { key: 'wealth', label: 'Wealth', emoji: '💰', gradFrom: 'from-yellow-500/20', gradTo: 'to-amber-500/10', borderColor: 'border-yellow-500/20', badgeBg: 'bg-yellow-500/20', badgeText: 'text-yellow-300', metaKeys: ['income', 'expenses', 'savings'], metaLabels: { income: 'Income', expenses: 'Expenses', savings: 'Savings' } },
  { key: 'health', label: 'Health', emoji: '💪', gradFrom: 'from-green-500/20', gradTo: 'to-emerald-500/10', borderColor: 'border-green-500/20', badgeBg: 'bg-green-500/20', badgeText: 'text-green-300', metaKeys: ['physical', 'mental', 'stress'], metaLabels: { physical: 'Physical', mental: 'Mental', stress: 'Stress' } },
  { key: 'relationships', label: 'Relationships', emoji: '👨‍👩‍👧', gradFrom: 'from-purple-500/20', gradTo: 'to-violet-500/10', borderColor: 'border-purple-500/20', badgeBg: 'bg-purple-500/20', badgeText: 'text-purple-300', metaKeys: ['family', 'friends', 'communication'], metaLabels: { family: 'Family', friends: 'Friends', communication: 'Communication' } },
  { key: 'luck', label: 'Luck', emoji: '🍀', gradFrom: 'from-teal-500/20', gradTo: 'to-cyan-500/10', borderColor: 'border-teal-500/20', badgeBg: 'bg-teal-500/20', badgeText: 'text-teal-300', metaKeys: ['luckyPeriod', 'opportunity'], metaLabels: { luckyPeriod: 'Lucky Period', opportunity: 'Key Opportunity' } },
  { key: 'growth', label: 'Personal Growth', emoji: '🌱', gradFrom: 'from-lime-500/20', gradTo: 'to-green-500/10', borderColor: 'border-lime-500/20', badgeBg: 'bg-lime-500/20', badgeText: 'text-lime-300', metaKeys: ['confidence', 'learning', 'discipline'], metaLabels: { confidence: 'Confidence', learning: 'Learning', discipline: 'Discipline' } },
];

function SkeletonCard() {
  return (
    <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-white/10 rounded animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={cn('h-3 bg-white/10 rounded animate-pulse', i === 4 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    </Card>
  );
}

// ─── Vedika Popup ─────────────────────────────────────────────────────────────
function VedikaPopup({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-4 z-50 max-w-[280px] animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-[#1a1a2e] border border-secondary/30 rounded-2xl p-4 shadow-2xl shadow-secondary/10">
        <button onClick={onClose} className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-secondary mb-1">Vedika AI</p>
            <p className="text-sm text-white/80 leading-relaxed">
              Hey {name}! 🌙 Your monthly report is being prepared section by section — this may take a moment, but it's worth it!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const MonthlyPrediction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { planName } = usePlan();

  const isFree = !planName || planName === 'Free';
  const uid = user?.uid || 'guest';
  const today = useMemo(() => new Date(), []);
  const monthKey = useMemo(() => getMonthKey(today), [today]);
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const displayName = (() => {
    try { return localStorage.getItem('profile_name') || user?.displayName || user?.email?.split('@')[0] || 'User'; }
    catch { return user?.displayName || 'User'; }
  })();

  // Local deterministic data
  const scores = useMemo(() => getLifeScores(uid, monthKey), [uid, monthKey]);
  const overall = useMemo(() => getOverallScore(scores), [scores]);
  const oLabel = useMemo(() => overallLabel(overall), [overall]);
  const lucky = useMemo(() => getLuckyElements(uid, monthKey), [uid, monthKey]);
  const timeline = useMemo(() => getWeeklyTimeline(uid, monthKey), [uid, monthKey]);
  const planets = useMemo(() => getPlanetaryInfluence(uid, monthKey), [uid, monthKey]);

  // Per-section AI state
  const [sections, setSections] = useState<SectionsState>({});
  const [loadingMap, setLoadingMap] = useState<SectionsLoading>({});
  const [errorMap, setErrorMap] = useState<SectionsError>({});
  const [showPopup, setShowPopup] = useState(false);
  const [upgradePopupKey, setUpgradePopupKey] = useState<SectionKey | null>(null);
  const hasFetchedRef = useRef(false);
  const cacheKey = `ai_monthly_sections_v2_${uid}_${monthKey}`;

  // Birth data
  let details: any = null;
  let planetsData: any = null;
  try {
    details = JSON.parse(localStorage.getItem('onboarding_details') || 'null');
    planetsData = JSON.parse(localStorage.getItem('astrology_planets') || 'null');
  } catch {}

  const birthCtx = `Birth: ${details?.dob || 'unknown'}, ${details?.time || 'unknown'}, ${details?.place || 'unknown'}`;
  const planetsCtx = planetsData ? `Planets: ${planetsData.slice(0, 7).map((p: any) => `${p.name || p.planet} in ${p.sign}`).join(', ')}` : '';

  const fetchSection = useCallback(async (key: SectionKey, cfg: typeof sectionConfig[0]) => {
    setLoadingMap(prev => ({ ...prev, [key]: true }));
    setErrorMap(prev => ({ ...prev, [key]: false }));

    const score = scores[key];
    const metaKeysList = cfg.metaKeys.join('", "');
    const systemPrompt = `You are a life prediction expert. Respond with valid JSON only.
Schema: {"prediction":"60-80 word prediction for ${key}","${cfg.metaKeys[0]}":"3-5 word value","${cfg.metaKeys[1] || cfg.metaKeys[0]}":"3-5 word value","${cfg.metaKeys[2] || cfg.metaKeys[0]}":"3-5 word value"}
Rules:
- prediction must be 60-80 words, specific and practical, no astrology terms in prediction text
- meta fields must be short (3-5 words max each)
- plain text only, no markdown`;

    const userPrompt = `Generate monthly ${monthName} prediction for ${key} area only.
${birthCtx}
${planetsCtx}
Score context: ${key} score is ${score}/100 (${scoreLabel(score)}) — match this tone.
Return ONLY the JSON object with EXACTLY these keys: "prediction", "${cfg.metaKeys.join('", "')}"`;

    try {
      const response = await Promise.race([
        generateGemini(userPrompt, [], systemPrompt, 'en', undefined, 'secondary'),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000)),
      ]);

      const start = response.indexOf('{');
      const end = response.lastIndexOf('}');
      if (start === -1 || end <= start) throw new Error('No JSON');

      const block = response.slice(start, end + 1);
      let parsed: any;
      try { parsed = JSON.parse(sanitizeModelJson(block)); }
      catch { throw new Error('Parse failed'); }

      if (!parsed?.prediction) throw new Error('Missing prediction');

      const meta: Record<string, string> = {};
      cfg.metaKeys.forEach(mk => { if (parsed[mk]) meta[mk] = parsed[mk]; });

      const result: SectionResult = { prediction: parsed.prediction, meta };

      setSections(prev => ({ ...prev, [key]: result }));

      // Update cache
      const cached = (() => { try { return JSON.parse(localStorage.getItem(cacheKey) || '{}'); } catch { return {}; } })();
      cached[key] = result;
      cached._generatedAt = new Date().toISOString();
      try { localStorage.setItem(cacheKey, JSON.stringify(cached)); } catch {}

    } catch (err) {
      console.error(`[Monthly] ${key} failed:`, err);
      setErrorMap(prev => ({ ...prev, [key]: true }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [key]: false }));
    }
  }, [scores, monthName, birthCtx, planetsCtx, cacheKey]);

  useEffect(() => {
    if (hasFetchedRef.current || isFree) return;
    hasFetchedRef.current = true;

    // Try loading from cache first
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      const cachedSections: SectionsState = {};
      let allCached = true;
      sectionConfig.forEach(cfg => {
        if (cached[cfg.key]?.prediction) {
          cachedSections[cfg.key] = cached[cfg.key];
        } else {
          allCached = false;
        }
      });
      if (Object.keys(cachedSections).length > 0) {
        setSections(cachedSections);
        if (allCached) return; // All cached, no need to fetch
      }
    } catch {}

    // Show Vedika popup
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 6000);

    // Fire all 7 section calls in parallel
    sectionConfig.forEach(cfg => {
      // Skip if already cached
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        if (cached[cfg.key]?.prediction) return;
      } catch {}
      fetchSection(cfg.key, cfg);
    });
  }, [isFree, fetchSection, cacheKey]);

  const anyLoading = sectionConfig.some(cfg => loadingMap[cfg.key]);
  const generatedAt = (() => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      return cached._generatedAt ? new Date(cached._generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;
    } catch { return null; }
  })();

  return (
    <div className="min-h-screen bg-background px-3 sm:px-4 py-6 sm:py-10">
      <SEO
        title={`${displayName}'s Monthly Prediction — ${monthName}`}
        description={`Personalized monthly life prediction for ${displayName}. Love, career, wealth, health and more for ${monthName}.`}
        url="https://veadicastro.in/monthly-prediction"
      />

      {showPopup && <VedikaPopup name={displayName} onClose={() => setShowPopup(false)} />}

      {/* Upgrade popup for free users */}
      <Dialog open={!!upgradePopupKey} onOpenChange={(open) => { if (!open) setUpgradePopupKey(null); }}>
        <DialogContent className="max-w-sm bg-[#0c0c0e] border border-pink-500/20 rounded-[36px] p-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500/30">
              <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white/90 text-center">
              🌙 Upgrade to Continue
            </DialogTitle>
            <DialogDescription className="text-sm text-white/60 text-center leading-relaxed pt-2">
              Hey {displayName}, I know you want to see your{' '}
              <span className="text-secondary font-semibold">
                {upgradePopupKey ? sectionConfig.find(c => c.key === upgradePopupKey)?.label.toLowerCase() : ''}
              </span>{' '}
              prediction, but you are on the <span className="text-pink-400 font-semibold">Free Plan</span>.
              <br /><br />
              Please upgrade to unlock all 7 detailed sections.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button variant="cosmic" className="w-full rounded-xl"
              onClick={() => { setUpgradePopupKey(null); navigate('/pricing?referral=monthly-prediction'); }}>
              Upgrade Now
            </Button>
            <Button variant="ghost" className="w-full rounded-xl text-white/40 hover:text-white/70"
              onClick={() => setUpgradePopupKey(null)}>
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto space-y-5">

        {/* 1. Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard?referral=monthly-prediction')} className="p-2 rounded-lg hover:bg-accent/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">🌙 Monthly Prediction</h1>
            <p className="text-sm text-muted-foreground">
              {monthName} · Personalized using your birth chart
              {generatedAt && <span className="ml-2 opacity-60">· Generated {generatedAt}</span>}
            </p>
          </div>
        </div>

        {/* 2. Overall Energy */}
        <Card className="p-6 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-5">Overall Monthly Energy</h2>
          <div className="flex flex-col items-center gap-4">
            <EnergyGauge value={overall} size={140} strokeWidth={10} />
            <div className="text-center">
              <p className="text-xl font-bold text-white/90">{oLabel}</p>
              <p className="text-sm text-white/50 mt-2">{monthName}</p>
            </div>
          </div>
        </Card>

        {/* 3. Lucky Elements - always visible */}
        <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">🍀 Lucky Elements</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center gap-2">
              <div className={cn('w-8 h-8 rounded-full ring-2 ring-white/10', monthlyColorMap[lucky.luckyColor] || 'bg-purple-500')} />
              <p className="text-sm font-semibold text-white/90">{lucky.luckyColor}</p>
              <p className="text-[10px] text-white/40 tracking-wide">LUCKY COLOUR</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center">
                <span className="text-base font-bold text-white">{lucky.luckyNumber}</span>
              </div>
              <p className="text-sm font-semibold text-white/90">{lucky.luckyNumber}</p>
              <p className="text-[10px] text-white/40 tracking-wide">LUCKY NUMBER</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/30 to-accent/20 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{lucky.luckyDay.slice(0, 3).toUpperCase()}</span>
              </div>
              <p className="text-sm font-semibold text-white/90">{lucky.luckyDay}</p>
              <p className="text-[10px] text-white/40 tracking-wide">LUCKY DAY</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-sm font-bold text-teal-300">↑</span>
              </div>
              <p className="text-sm font-semibold text-white/90">{lucky.luckyDirection}</p>
              <p className="text-[10px] text-white/40 tracking-wide">LUCKY DIRECTION</p>
            </div>
          </div>
        </Card>

        {/* 4. Life Score Dashboard */}
        <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Life Score Dashboard</h2>
          <div className="space-y-3">
            {sectionConfig.map(({ key, label, emoji }) => {
              const score = scores[key];
              return (
                <div key={key} className="flex items-center gap-3 group">
                  <span className="text-base w-6 shrink-0">{emoji}</span>
                  <span className="text-sm text-white/70 w-20 text-left shrink-0 group-hover:text-white/90 transition-colors">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all duration-700" style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-white/90 w-8 text-right shrink-0">{score}%</span>
                  <button
                    onClick={() => {
                      if (isFree) {
                        setUpgradePopupKey(key);
                      } else {
                        document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-xs font-medium text-secondary hover:text-secondary/80 transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-secondary/10"
                  >
                    Read more
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 5. Monthly Timeline - paid users only */}
        {!isFree && (
        <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">📅 Monthly Timeline</h3>
          <div className="space-y-1">
            {timeline.map(({ week, stars, label: wLabel }) => (
              <div key={week} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                <span className="text-sm text-white/70">{week}</span>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 tracking-widest text-sm">{renderStars(stars)}</span>
                  <span className="text-xs text-white/40 w-16 text-right">{wLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        )}

        {/* 6. Paid content: AI Sections + Planetary + Summary / Free: Personalized Paywall */}
        {isFree ? (
          <Card className="p-6 bg-[#0c0c0e] border border-pink-500/20 rounded-2xl text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500/30">
                <img src="/optimized/vedika.webp" alt="Vedika" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-1">
                  Hey {displayName}, your full {monthName} report is ready
                </h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
                  Upgrade to unlock all 7 detailed sections — love, career, wealth, health, relationships, luck, and personal growth.
                </p>
              </div>
              <Button variant="cosmic" className="w-full max-w-xs mx-auto rounded-xl"
                onClick={() => navigate('/pricing?referral=monthly-prediction')}>
                Unlock Full Report
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* 7 Section Cards */}
            {sectionConfig.map(({ key, label, emoji, gradFrom, gradTo, badgeBg, badgeText, metaKeys, metaLabels }) => {
              const score = scores[key];
              const lbl = scoreLabel(score);
              const secData = sections[key];
              const isLoading = loadingMap[key];
              const hasError = errorMap[key];

              return (
                <div key={key} id={`section-${key}`} className="scroll-mt-6">
                  {isLoading && !secData ? (
                    <SkeletonCard />
                  ) : hasError && !secData ? (
                    <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <h3 className="font-semibold text-white/90">{label}</h3>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badgeBg, badgeText)}>{lbl}</span>
                      </div>
                      <p className="text-xs text-white/40 mb-3">Could not load this section.</p>
                      <Button variant="outline" size="sm" className="text-xs"
                        onClick={() => fetchSection(key, sectionConfig.find(c => c.key === key)!)}>
                        Retry
                      </Button>
                    </Card>
                  ) : (
                    <Card className={cn(
                      'p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl',
                      secData ? 'animate-in fade-in duration-500' : 'opacity-40'
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <h3 className="font-semibold text-white/90">{label}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badgeBg, badgeText)}>{lbl}</span>
                          <span className="text-sm font-bold text-white/90">{score}%</span>
                        </div>
                      </div>
                      <div className="h-1 rounded-full mb-4 bg-white/[0.04] overflow-hidden">
                        <div className={cn('h-full rounded-full bg-gradient-to-r', gradFrom, gradTo)} style={{ width: `${score}%` }} />
                      </div>
                      {secData ? (
                        <>
                          <p className="text-sm text-white/60 leading-relaxed mb-4">{secData.prediction}</p>
                          <div className="flex flex-wrap gap-2">
                            {metaKeys.map(mk => secData.meta[mk] ? (
                              <span key={mk} className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60">
                                {metaLabels[mk]}: <span className="text-white/80">{secData.meta[mk]}</span>
                              </span>
                            ) : null)}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
                          <div className="h-3 bg-white/10 rounded animate-pulse w-5/6" />
                          <div className="h-3 bg-white/10 rounded animate-pulse w-4/6" />
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              );
            })}

            {/* Planetary Influence */}
            <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">🪐 Planetary Influence</h3>
              <div className="space-y-1">
                {planets.map(({ planet, stars, effect }) => (
                  <div key={planet} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-white/70">{planet}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 tracking-widest text-sm">{renderStars(stars)}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full',
                        effect === 'Favourable' ? 'bg-green-500/10 text-green-400' :
                          effect === 'Challenging' ? 'bg-red-500/10 text-red-400' :
                            'bg-white/[0.06] text-white/40')}>{effect}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Month Summary */}
            <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">📊 Month Summary</h3>
              <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center shrink-0"
                  style={{ borderColor: `rgba(255,255,255,${0.1 + (overall / 100) * 0.3})` }}>
                  <span className="text-xl font-bold text-white">{overall}%</span>
                </div>
                <div>
                  <p className="font-semibold text-white/90">{oLabel}</p>
                  <p className="text-xs text-white/40 mt-0.5">{monthName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['love', 'career', 'wealth', 'health', 'relationships', 'growth'] as SectionKey[]).map(k => {
                  const cfg = sectionConfig.find(s => s.key === k)!;
                  return (
                    <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                      <span className="text-xs text-white/60">{cfg.emoji} {cfg.label}</span>
                      <span className="text-amber-400 text-xs">{renderStars(starsFromScore(scores[k]))}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

      </div>
    </div>
  );
};

export default MonthlyPrediction;
