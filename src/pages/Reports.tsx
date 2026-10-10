import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { Sparkles, ArrowLeft, Lock, User, Heart, TrendingUp, FileText, Star, Crown, Compass, DollarSign, BarChart3, Check, ShieldCheck, Gem, Target, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ReportCategory = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: React.ReactNode;
  locked: boolean;
  category: string;
  description: string;
  price?: string;
  features?: string[];
  popular?: boolean;
  buyers?: number;
};

const Reports = () => {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { planName, canGenerateReport, reportCredits } = usePlan();
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);
  // Determine if reports are locked based on plan and credits
  const isReportLocked = () => {
    // All reports require credits (no more free reports)
    return !canGenerateReport();
  };

  // Define report categories with modern structure and pricing
  const reportCategories: ReportCategory[] = [
    // Life Guidance Reports
    {
      id: "life-guidance",
      title: "Life Guidance",
      subtitle: "Complete kundali analysis and birth chart reading",
      duration: "Lifetime",
      icon: <Compass className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Personal Growth",
      description: "Comprehensive analysis of your life path, purpose, and destiny",
      price: "₹199",
      features: [
        "Birth chart analysis",
        "Life purpose insights", 
        "Dasha periods",
        "Remedies & solutions"
      ],
      popular: true
    },
    {
      id: "personality",
      title: "Personality Deep Dive",
      subtitle: "Analysis of 20+ personality characteristics",
      duration: "1 Year",
      icon: <User className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Personal Growth",
      description: "Discover your strengths, weaknesses, and growth potential",
      price: "₹1",
      features: [
        "20+ traits analysis",
        "Strengths & weaknesses",
        "Career compatibility",
        "Growth recommendations"
      ]
    },
    // Love & Relationship Reports
    {
      id: "love-navigator",
      title: "Love Navigator",
      subtitle: "Your romantic style and relationship strengths",
      duration: "1 Year",
      icon: <Heart className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Love & Relationships",
      description: "Navigate your romantic journey with astrological insights",
      price: "₹1",
      features: [
        "Love compatibility",
        "Romantic timing",
        "Relationship challenges",
        "Partner preferences"
      ]
    },
    {
      id: "life-partner",
      title: "Life Partner Analysis",
      subtitle: "Your ideal life partner and marriage timing",
      duration: "Lifetime",
      icon: <Crown className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Love & Relationships",
      description: "Discover your ideal partner and marriage compatibility",
      price: "₹1",
      features: [
        "Ideal partner traits",
        "Marriage timing",
        "Compatibility factors",
        "Relationship remedies"
      ],
      popular: true
    },
    // Wealth & Career Reports
    {
      id: "wealth-lifetime",
      title: "Wealth Mastery",
      subtitle: "Complete financial guidance and wealth creation",
      duration: "Lifetime",
      icon: <DollarSign className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Career & Wealth",
      description: "Lifetime financial guidance and wealth creation strategies",
      price: "₹1",
      buyers: 79,
      features: [
        "Wealth potential",
        "Career directions",
        "Investment timing",
        "Financial remedies"
      ],
      popular: true
    },
    {
      id: "wealth-year",
      title: "Annual Wealth Forecast",
      subtitle: "Your yearly financial predictions and opportunities",
      duration: "1 Year",
      icon: <BarChart3 className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Career & Wealth",
      description: "Annual wealth forecast and investment timing",
      price: "₹1",
      features: [
        "Yearly predictions",
        "Best investment periods",
        "Career opportunities",
        "Financial challenges"
      ]
    },
    {
      id: "billionaire-potential",
      title: "Billionaire Potential",
      subtitle: "A direct reading of your chart’s wealth combinations",
      duration: "Lifetime",
      icon: <Gem className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Career & Wealth",
      description: "Explore wealth yogas, financial strengths, obstacles, and the periods associated with major growth.",
      price: "₹1",
      features: [
        "Wealth combinations and planetary support",
        "Peak wealth periods in your dasha sequence",
        "Your strongest financial advantage",
        "Key obstacles and a clear verdict"
      ]
    },
    {
      id: "job-vs-business",
      title: "Job vs Business",
      subtitle: "See which career path better fits your chart",
      duration: "Career",
      icon: <Target className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Career & Wealth",
      description: "Get a clear reading on service, entrepreneurship, suitable fields, and career timing.",
      price: "₹1",
      features: [
        "A clear job or business direction",
        "Planetary evidence and suitable fields",
        "Career timing through dashas",
        "Risks of choosing against your chart"
      ]
    },
    {
      id: "government-job",
      title: "Government Job Potential",
      subtitle: "Assess public service and exam potential",
      duration: "Career",
      icon: <Shield className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Career & Wealth",
      description: "Review authority, competition, supportive periods, and government sectors aligned with your chart.",
      price: "₹1",
      features: [
        "Strong, moderate, or weak potential",
        "Supportive and challenging combinations",
        "Exam prospects and favorable timing",
        "Suitable sectors and alternatives"
      ]
    },
    {
      id: "ideal-partner",
      title: "Ideal Partner Report",
      subtitle: "A specific reading of partner traits and marriage timing",
      duration: "Lifetime",
      icon: <Heart className="w-6 h-6" />,
      locked: isReportLocked(),
      category: "Love & Relationships",
      description: "Explore partner tendencies, relationship patterns, marriage timing, and chart-supported challenges.",
      price: "₹1",
      features: [
        "Partner personality and background",
        "Love or arranged marriage indicators",
        "Marriage timing and possible delays",
        "Dosha interpretation without fearmongering"
      ]
    }
  ];

  // Group reports by category
  const groupedReports = reportCategories.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportCategory[]>);
  const trendingReportIds = ["billionaire-potential", "job-vs-business", "government-job", "ideal-partner"];
  const trendingReports = trendingReportIds
    .map((id) => reportCategories.find((report) => report.id === id))
    .filter((report): report is ReportCategory => Boolean(report));

  const handleReportClick = (reportId: string) => {
    // The report detail page checks credits when the user starts generation.
    navigate(`/report/${reportId}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 112% 56% at 50% 102%, rgba(226, 35, 143, 0.38) 0%, rgba(174, 38, 132, 0.27) 36%, rgba(91, 30, 78, 0.2) 63%, transparent 82%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 78% 38% at 53% 43%, rgba(128, 34, 104, 0.2) 0%, transparent 76%), linear-gradient(180deg, transparent 0%, rgba(8, 7, 12, 0.05) 65%, rgba(8, 7, 12, 0.42) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl space-y-7 sm:space-y-9">
        <Button variant="outline" className="h-10 gap-2 rounded-xl border-border/60 bg-card/40 px-3 text-sm text-muted-foreground hover:text-foreground" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <header className="relative grid min-w-0 gap-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card/65 to-secondary/10 p-5 shadow-xl shadow-black/10 sm:p-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center lg:p-9">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-primary/10" aria-hidden="true" />
          <div className="relative min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Your report library
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">Astrological Reports</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Explore personalized readings for your relationships, personal growth, career, and wealth—all based on your birth chart.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/35 px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Chart-based insights</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/35 px-3 py-1.5"><FileText className="h-3.5 w-3.5 text-secondary" /> {reportCategories.length} reports to explore</span>
            </div>
          </div>

          <div className="relative grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border border-secondary/20 bg-background/45 p-4 sm:p-5 lg:grid-cols-1 lg:justify-items-center lg:gap-2 lg:text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-secondary/25 bg-secondary/10 text-secondary lg:mb-1 lg:h-14 lg:w-14">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 lg:col-auto">
              <p className="text-xs font-medium text-muted-foreground">Available report credits</p>
              <p className="mt-0.5 text-3xl font-bold tabular-nums text-foreground">{reportCredits}</p>
              <p className="mt-1 text-xs text-muted-foreground">{planName === "Free" ? "Free plan" : `${planName} plan`}</p>
            </div>
            {reportCredits <= 0 && (
              <div className="col-span-2 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300 lg:col-span-1 lg:mt-2">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>No credits available. You can still open a report to review it.</span>
              </div>
            )}
          </div>
        </header>

        <section aria-labelledby="trending-reports-title" className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-secondary/25 bg-secondary/10 text-secondary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="trending-reports-title" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Trending</h2>
                <span className="rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary">Featured reports</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Popular readings people are exploring right now.</p>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trendingReports.map((report) => (
              <Card key={report.id} className="group flex min-w-0 flex-col rounded-2xl border border-secondary/20 bg-card/55 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/45 hover:bg-card/75 hover:shadow-lg hover:shadow-secondary/5 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-secondary/20 bg-secondary/10 text-secondary">
                    {report.icon}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                    <TrendingUp className="h-3 w-3" /> Trending
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug text-foreground group-hover:text-secondary">{report.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-5 text-muted-foreground">{report.subtitle}</p>
                <Button
                  variant="cosmic"
                  className="mt-4 h-10 w-full rounded-full text-sm font-semibold"
                  onClick={() => handleReportClick(report.id)}
                >
                  Generate report
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <nav aria-label="Report categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {Object.keys(groupedReports).map((category, index) => {
            const categoryId = `report-category-${index}`;
            return (
              <a key={category} href={`#${categoryId}`} className="shrink-0 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-secondary/40 hover:bg-secondary/10 hover:text-foreground">
                {category}
              </a>
            );
          })}
        </nav>

        <div className="space-y-10 sm:space-y-12">
          {Object.entries(groupedReports).map(([category, reports], categoryIndex) => (
            <section key={category} id={`report-category-${categoryIndex}`} className="scroll-mt-6 space-y-5 sm:space-y-6">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border sm:h-12 sm:w-12 ${
                  categoryIndex === 0 ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                  categoryIndex === 1 ? "border-pink-500/20 bg-pink-500/10 text-pink-400" :
                  "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}>
                  {categoryIndex === 0 ? <User className="h-5 w-5" /> : categoryIndex === 1 ? <Heart className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{category}</h2>
                    <span className="rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{reports.length} reports</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {category === "Personal Growth" && "Discover your strengths, purpose, and direction."}
                    {category === "Love & Relationships" && "Explore relationships, connection, and partnership."}
                    {category === "Career & Wealth" && "Find clarity around work, opportunities, and finances."}
                  </p>
                </div>
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                {reports.map((report) => (
                  <Card key={report.id} className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card/45 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:bg-card/70 hover:shadow-xl hover:shadow-secondary/5 ${report.popular ? "border-secondary/45 ring-1 ring-secondary/15" : "border-border/60"}`}>
                    <div className="flex flex-1 flex-col p-5 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                          categoryIndex === 0 ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                          categoryIndex === 1 ? "border-pink-500/20 bg-pink-500/10 text-pink-400" :
                          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {report.icon}
                        </div>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {report.popular && <span className="inline-flex items-center gap-1 rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary"><Star className="h-3 w-3 fill-current" /> Popular</span>}
                          <span className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{report.duration}</span>
                        </div>
                      </div>

                      <div className="mt-5 min-w-0">
                        <h3 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-secondary sm:text-xl">{report.title}</h3>
                        <p className="mt-1.5 text-sm font-medium leading-5 text-foreground/80">{report.subtitle}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.description}</p>
                      </div>

                      {report.features && (
                        <div className="mt-5 flex-1 border-t border-border/50 pt-4">
                          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">What&apos;s inside</p>
                          <ul className="space-y-2">
                            {report.features.slice(0, 3).map((feature) => (
                              <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-muted-foreground">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{feature}</span>
                              </li>
                            ))}
                            {report.features.length > 3 && <li className="pl-6 text-xs text-muted-foreground">+{report.features.length - 3} more insights</li>}
                          </ul>
                        </div>
                      )}

                      <div className="mt-5 flex flex-col gap-3 border-t border-border/50 pt-4">
                        <div className="flex min-h-5 items-center gap-2 text-xs">
                          {report.locked ? (
                            <><Lock className="h-3.5 w-3.5 text-amber-300" /><span className="text-muted-foreground">Credits are checked before generation</span></>
                          ) : (
                            <><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /><span className="text-muted-foreground">Uses 1 report credit</span></>
                          )}
                        </div>
                        <Button
                          variant="cosmic"
                          className="h-11 w-full rounded-full text-sm font-semibold shadow-md shadow-secondary/10 transition-transform active:scale-[0.99]"
                          onClick={() => handleReportClick(report.id)}
                        >
                          Generate report
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
