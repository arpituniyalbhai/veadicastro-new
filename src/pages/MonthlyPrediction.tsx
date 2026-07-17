import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlan } from '@/context/PlanContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnergyGauge } from '@/components/EnergyGauge';
import { ArrowLeft, Lock, MessageCircle, Heart, Briefcase, Wallet, Activity, Users, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateGemini } from '@/lib/gemini';
import SEO from '@/components/SEO';
import { sanitizeModelJson } from '@/lib/dailyInsights';
import {
  getMonthKey, getLifeScores, getOverallScore, scoreLabel, overallLabel,
  starsFromScore, renderStars, getLuckyElements, getWeeklyTimeline,
  getPlanetaryInfluence, monthlyColorMap,
  type LifeScores,
} from '@/lib/monthlyInsights';

// ─── AI schema types ──────────────────────────────────────────────────────────
interface SectionAI { prediction: string; [key: string]: string; }
interface MonthlyAI {
  theme: string;
  sections: {
    love:          SectionAI & { bestWeek: string; focus: string; energy: string };
    career:        SectionAI & { opportunityLevel: string; promotion: string; business: string };
    wealth:        SectionAI & { income: string; expenses: string; savings: string };
    health:        SectionAI & { physical: string; mental: string; stress: string };
    relationships: SectionAI & { family: string; friends: string; communication: string };
    luck:          SectionAI & { luckyPeriod: string; unexpectedOpportunity: string };
    growth:        SectionAI & { confidence: string; learning: string; discipline: string };
  };
  bestDates: { date: number; tags: string[] }[];
  cautionDates: { date: number; tags: string[] }[];
  planetaryExplanation: string;
  actionPlan: string[];
  monthSummaryText: string;
}
interface MonthlyCacheEntry { ai: MonthlyAI; generatedAt: string; }

// ─── Section config ───────────────────────────────────────────────────────────
type SectionKey = 'love'|'career'|'wealth'|'health'|'relationships'|'luck'|'growth';
const sectionConfig: {
  key: SectionKey; label: string; emoji: string;
  gradFrom: string; gradTo: string; borderColor: string;
  badgeBg: string; badgeText: string;
  metaKeys: string[];
}[] = [
  { key:'love',          label:'Love',            emoji:'❤️',  gradFrom:'from-rose-500/20',   gradTo:'to-pink-500/10',    borderColor:'border-rose-500/20',   badgeBg:'bg-rose-500/20',   badgeText:'text-rose-300',    metaKeys:['bestWeek','focus','energy'] },
  { key:'career',        label:'Career',          emoji:'💼',  gradFrom:'from-blue-500/20',   gradTo:'to-indigo-500/10',  borderColor:'border-blue-500/20',   badgeBg:'bg-blue-500/20',   badgeText:'text-blue-300',    metaKeys:['opportunityLevel','promotion','business'] },
  { key:'wealth',        label:'Wealth',          emoji:'💰',  gradFrom:'from-yellow-500/20', gradTo:'to-amber-500/10',   borderColor:'border-yellow-500/20', badgeBg:'bg-yellow-500/20', badgeText:'text-yellow-300',  metaKeys:['income','expenses','savings'] },
  { key:'health',        label:'Health',          emoji:'💪',  gradFrom:'from-green-500/20',  gradTo:'to-emerald-500/10', borderColor:'border-green-500/20',  badgeBg:'bg-green-500/20',  badgeText:'text-green-300',   metaKeys:['physical','mental','stress'] },
  { key:'relationships', label:'Relationships',   emoji:'👨‍👩‍👧', gradFrom:'from-purple-500/20', gradTo:'to-violet-500/10',  borderColor:'border-purple-500/20', badgeBg:'bg-purple-500/20', badgeText:'text-purple-300',  metaKeys:['family','friends','communication'] },
  { key:'luck',          label:'Luck',            emoji:'🍀',  gradFrom:'from-teal-500/20',   gradTo:'to-cyan-500/10',    borderColor:'border-teal-500/20',   badgeBg:'bg-teal-500/20',   badgeText:'text-teal-300',    metaKeys:['luckyPeriod','unexpectedOpportunity'] },
  { key:'growth',        label:'Personal Growth', emoji:'🌱',  gradFrom:'from-lime-500/20',   gradTo:'to-green-500/10',   borderColor:'border-lime-500/20',   badgeBg:'bg-lime-500/20',   badgeText:'text-lime-300',    metaKeys:['confidence','learning','discipline'] },
];
const metaLabels: Record<string,string> = {
  bestWeek:'Best Week', focus:'Focus', energy:'Energy',
  opportunityLevel:'Opportunity', promotion:'Promotion', business:'Business',
  income:'Income', expenses:'Expenses', savings:'Savings',
  physical:'Physical', mental:'Mental', stress:'Stress',
  family:'Family', friends:'Friends', communication:'Communication',
  luckyPeriod:'Lucky Period', unexpectedOpportunity:'Opportunity',
  confidence:'Confidence', learning:'Learning', discipline:'Discipline',
};

function SkeletonCard({ lines = 4 }: { lines?: number }) {
  return (
    <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
      <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse mb-4" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn('h-3 bg-white/10 rounded animate-pulse', i === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    </Card>
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
  const scores   = useMemo(() => getLifeScores(uid, monthKey), [uid, monthKey]);
  const overall  = useMemo(() => getOverallScore(scores), [scores]);
  const oLabel   = useMemo(() => overallLabel(overall), [overall]);
  const lucky    = useMemo(() => getLuckyElements(uid, monthKey), [uid, monthKey]);
  const timeline = useMemo(() => getWeeklyTimeline(uid, monthKey), [uid, monthKey]);
  const planets  = useMemo(() => getPlanetaryInfluence(uid, monthKey), [uid, monthKey]);

  // AI state
  const [aiData,  setAiData]  = useState<MonthlyCacheEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);
  const hasFetchedRef = useRef(false);
  const cacheKey = `ai_monthly_full_${uid}_${monthKey}`;

  // Birth data for prompt
  let details: any = null;
  let planetsData: any = null;
  try {
    details     = JSON.parse(localStorage.getItem('onboarding_details') || 'null');
    planetsData = JSON.parse(localStorage.getItem('astrology_planets')  || 'null');
  } catch {}

  const fetchMonthlyAI = useCallback(async () => {
    setLoading(true);
    setError(false);
    const scoreCtx = [
      `Overall: ${overall}/100 (${oLabel})`,
      `Love: ${scores.love}/100 (${scoreLabel(scores.love)})`,
      `Career: ${scores.career}/100 (${scoreLabel(scores.career)})`,
      `Wealth: ${scores.wealth}/100 (${scoreLabel(scores.wealth)})`,
      `Health: ${scores.health}/100 (${scoreLabel(scores.health)})`,
      `Relationships: ${scores.relationships}/100 (${scoreLabel(scores.relationships)})`,
      `Luck: ${scores.luck}/100 (${scoreLabel(scores.luck)})`,
      `Personal Growth: ${scores.growth}/100 (${scoreLabel(scores.growth)})`,
    ].join('\n');

    const systemPrompt = `You are a life prediction expert. Respond with valid JSON only matching this schema exactly:
{"theme":"string","sections":{"love":{"prediction":"150-200 words","bestWeek":"string","focus":"string","energy":"string"},"career":{"prediction":"150-200 words","opportunityLevel":"string","promotion":"string","business":"string"},"wealth":{"prediction":"150-200 words","income":"string","expenses":"string","savings":"string"},"health":{"prediction":"150-200 words","physical":"string","mental":"string","stress":"string"},"relationships":{"prediction":"150-200 words","family":"string","friends":"string","communication":"string"},"luck":{"prediction":"150-200 words","luckyPeriod":"string","unexpectedOpportunity":"string"},"growth":{"prediction":"150-200 words","confidence":"string","learning":"string","discipline":"string"}},"bestDates":[{"date":5,"tags":["Career"]}],"cautionDates":[{"date":9,"tags":["Avoid Arguments"]}],"planetaryExplanation":"string","actionPlan":["string","string","string","string"],"monthSummaryText":"string"}
STRICT: Scores below are FINAL—never output numeric scores yourself. Write predictions matching the given tone. No astrology terms except in planetaryExplanation. Plain text only, no markdown.`;

    const userPrompt = `Generate monthly prediction for ${monthName}.
Birth: ${details?.dob || 'unknown'}, ${details?.time || 'unknown'}, ${details?.place || 'unknown'}
${planetsData ? `Planets: ${planetsData.slice(0,7).map((p: any) => `${p.name||p.planet} in ${p.sign}`).join(', ')}` : ''}
Fixed scores (match these, do not invent):
${scoreCtx}`;

    try {
      const response = await Promise.race([
        generateGemini(userPrompt, [], systemPrompt, 'en', undefined, 'secondary'),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 25000)),
      ]);
      const start = response.indexOf('{');
      const end   = response.lastIndexOf('}');
      if (start === -1 || end <= start) throw new Error('No JSON');
      const block = response.slice(start, end + 1);
      let parsed: MonthlyAI;
      try { parsed = JSON.parse(sanitizeModelJson(block)) as MonthlyAI; }
      catch { throw new Error('JSON parse failed'); }
      if (!parsed?.theme || !parsed?.sections?.love?.prediction) throw new Error('Incomplete');
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const clamp = (arr: { date: number; tags: string[] }[]) =>
        (arr || []).map(d => ({ ...d, date: Math.max(1, Math.min(d.date ?? 1, daysInMonth)) }));
      parsed.bestDates    = clamp(parsed.bestDates);
      parsed.cautionDates = clamp(parsed.cautionDates);
      const entry: MonthlyCacheEntry = { ai: parsed, generatedAt: new Date().toISOString() };
      setAiData(entry);
      try { localStorage.setItem(cacheKey, JSON.stringify(entry)); } catch {}
    } catch (err) {
      console.error('[MonthlyPrediction] fetch failed:', err);
      setError(true);
    } finally { setLoading(false); }
  }, [cacheKey, overall, oLabel, scores, monthName, today, details, planetsData]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    if (isFree) return;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null') as MonthlyCacheEntry | null;
      if (cached?.ai?.theme) { setAiData(cached); return; }
    } catch {}
    fetchMonthlyAI();
  }, [cacheKey, isFree, fetchMonthlyAI]);

  const scrollToSection = (key: string) => {
    const el = document.getElementById(`section-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const generatedOn = aiData?.generatedAt
    ? new Date(aiData.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background px-3 sm:px-4 py-6 sm:py-10">
      <SEO
        title={`${displayName}'s Monthly Prediction — ${monthName}`}
        description={`Personalized monthly life prediction for ${displayName}. Love, career, wealth, health and more for ${monthName}.`}
        url="https://veadicastro.in/monthly-prediction"
      />
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
              {generatedOn && <span className="ml-2 opacity-60">· Generated {generatedOn}</span>}
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
              {loading && !aiData && <div className="h-4 bg-white/10 rounded w-48 animate-pulse mt-2 mx-auto" />}
              {aiData?.ai.theme && <p className="text-sm text-white/50 mt-2 leading-relaxed max-w-sm mx-auto">{aiData.ai.theme}</p>}
            </div>
          </div>
        </Card>

        {/* 3. Life Score Dashboard */}
        <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Life Score Dashboard</h2>
          <div className="space-y-3">
            {sectionConfig.map(({ key, label, emoji }) => {
              const score = scores[key];
              return (
                <button key={key} onClick={() => !isFree && scrollToSection(key)} className="w-full flex items-center gap-3 group">
                  <span className="text-base w-6 shrink-0">{emoji}</span>
                  <span className="text-sm text-white/70 w-28 text-left shrink-0 group-hover:text-white/90 transition-colors">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all duration-700" style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-white/90 w-10 text-right shrink-0">{score}%</span>
                  <span className="text-xs text-white/40 w-20 text-right shrink-0 hidden sm:block">{scoreLabel(score)}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Free gate / Loading / Error / Full content */}
        {isFree ? (
          <Card className="p-8 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl text-center">
            <Lock className="w-10 h-10 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/90 mb-2">Your full {monthName} report is ready</h3>
            <p className="text-sm text-white/50 mb-6 leading-relaxed max-w-xs mx-auto">
              Upgrade to unlock all 16 sections — love, career, wealth, health, lucky elements, action plan and more.
            </p>
            <Button variant="cosmic" className="w-full max-w-xs mx-auto rounded-xl"
              onClick={() => navigate('/pricing?referral=monthly-prediction')}>
              Unlock Full Report
            </Button>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            {[6,5,5,5,5,4,4,3,3,3,3,3].map((lines, i) => <SkeletonCard key={i} lines={lines} />)}
          </div>
        ) : error ? (
          <Card className="p-6 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl text-center">
            <p className="text-sm text-white/50 mb-4">Could not load your monthly predictions. Please try again.</p>
            <Button variant="cosmic" size="sm" onClick={() => { setError(false); fetchMonthlyAI(); }}>Retry</Button>
          </Card>
        ) : aiData ? (
          <>
            {/* 4-10. Section detail cards */}
            {sectionConfig.map(({ key, label, emoji, gradFrom, gradTo, badgeBg, badgeText, metaKeys }) => {
              const score = scores[key];
              const secAI = (aiData.ai.sections as any)[key] as SectionAI;
              const lbl   = scoreLabel(score);
              return (
                <Card key={key} id={`section-${key}`}
                  className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl scroll-mt-6">
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
                    <div className={cn('h-full rounded-full bg-gradient-to-r', gradFrom, gradTo)}
                      style={{ width: `${score}%` }} />
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{secAI?.prediction}</p>
                  <div className="flex flex-wrap gap-2">
                    {metaKeys.map((mk) => secAI?.[mk] ? (
                      <span key={mk} className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60">
                        {metaLabels[mk]}: <span className="text-white/80">{secAI[mk]}</span>
                      </span>
                    ) : null)}
                  </div>
                </Card>
              );
            })}

            {/* 11. Best Dates */}
            <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">✨ Best Dates</h3>
              <div className="flex flex-wrap gap-3">
                {(aiData.ai.bestDates || []).map(({ date, tags }, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-secondary/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{date}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {tags.map((t, j) => (
                        <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary/80 border border-secondary/20">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 12. Caution Dates */}
            <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">⚠️ Caution Dates</h3>
              <div className="flex flex-wrap gap-3">
                {(aiData.ai.cautionDates || []).map(({ date, tags }, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-300">{date}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {tags.map((t, j) => (
                        <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300/80 border border-amber-500/20">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 13. Monthly Timeline */}
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

            {/* 14. Planetary Influence */}
            <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">🪐 Planetary Influence</h3>
              <div className="space-y-1 mb-4">
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
              {aiData.ai.planetaryExplanation && (
                <p className="text-xs text-white/40 leading-relaxed italic border-t border-white/[0.04] pt-3">{aiData.ai.planetaryExplanation}</p>
              )}
            </Card>

            {/* 15. Monthly Action Plan */}
            <Card className="p-5 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">✅ Monthly Action Plan</h3>
              <div className="space-y-3">
                {(aiData.ai.actionPlan || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0">
                      <span className="text-secondary text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-white/70">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 16. Lucky Elements */}
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
                    <span className="text-xs font-bold text-white">{lucky.luckyDay.slice(0,3).toUpperCase()}</span>
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

            {/* 17. Month Summary */}
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
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['love','career','wealth','health','relationships','growth'] as SectionKey[]).map((k) => {
                  const cfg = sectionConfig.find(s => s.key === k)!;
                  return (
                    <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                      <span className="text-xs text-white/60">{cfg.emoji} {cfg.label}</span>
                      <span className="text-amber-400 text-xs">{renderStars(starsFromScore(scores[k]))}</span>
                    </div>
                  );
                })}
              </div>
              {aiData.ai.monthSummaryText && (
                <p className="text-sm text-white/60 leading-relaxed">{aiData.ai.monthSummaryText}</p>
              )}
            </Card>
          </>
        ) : null}

        {/* CTA */}
        <Button variant="cosmic" className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={() => navigate('/chat?referral=monthly-prediction')}>
          <MessageCircle className="w-5 h-5 mr-2" />
          Ask your question
        </Button>

      </div>
    </div>
  );
};

export default MonthlyPrediction;
