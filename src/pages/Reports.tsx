import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { Sparkles, ArrowLeft, Lock, User, Heart, TrendingUp, Calendar, FileText, Star, Crown, Gem, Target, Compass, DollarSign, BarChart3, Eye, Shield, Check, Zap, Coins } from "lucide-react";
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
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Determine if reports are locked based on plan and credits
  const isReportLocked = (reportId: string) => {
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
      locked: isReportLocked("life-guidance"),
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
      locked: isReportLocked("personality"),
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
      locked: isReportLocked("love-navigator"),
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
      locked: isReportLocked("life-partner"),
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
      locked: isReportLocked("wealth-lifetime"),
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
      locked: isReportLocked("wealth-year"),
      category: "Career & Wealth",
      description: "Annual wealth forecast and investment timing",
      price: "₹1",
      features: [
        "Yearly predictions",
        "Best investment periods",
        "Career opportunities",
        "Financial challenges"
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

  const handleReportClick = (reportId: string, locked: boolean) => {
    if (locked) {
      // Navigate to pricing page for locked reports
      navigate("/pricing");
    } else {
      navigate(`/report/${reportId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Header Section */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/20 border-border/60 p-4 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5" />
          <div className="relative z-10">
            <Button variant="outline" size="sm" className="gap-2 w-fit backdrop-blur-sm bg-background/50 mb-4 sm:mb-6" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            
            {/* Mobile-friendly header layout */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-3 sm:mb-4">
                  Astrological Reports
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl">
                  Get personalized insights based on your birth chart. Unlock your potential with detailed astrological analysis.
                </p>
              </div>
              
              {/* Credits Display - Mobile Optimized */}
              <div className="flex flex-row lg:flex-col items-center justify-center lg:items-end space-x-4 lg:space-x-0 lg:space-y-4">
                <div className="text-center lg:text-right">
                  <div className="text-sm text-muted-foreground mb-1">Available Reports</div>
                  <div className="text-3xl sm:text-4xl font-bold text-secondary">
                    {reportCredits}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {planName === "Free" ? "Free Plan" : `${planName} Plan`}
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-secondary/30">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports by Category - Modern Layout */}
        {Object.entries(groupedReports).map(([category, reports], categoryIndex) => (
          <div key={category} className="space-y-8">
            {/* Category Header */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center ${
                categoryIndex === 0 ? "from-blue-500/20 to-cyan-500/20" :
                categoryIndex === 1 ? "from-pink-500/20 to-rose-500/20" :
                "from-green-500/20 to-emerald-500/20"
              }`}>
                {
                  categoryIndex === 0 ? <User className="w-6 h-6 text-blue-500" /> :
                  categoryIndex === 1 ? <Heart className="w-6 h-6 text-pink-500" /> :
                  <TrendingUp className="w-6 h-6 text-green-500" />
                }
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-2">{category}</h2>
                <p className="text-muted-foreground">
                  {category === "Personal Growth" && "Discover your true nature and unlock your full potential"}
                  {category === "Love & Relationships" && "Find your path to meaningful relationships and love"}
                  {category === "Career & Wealth" && "Build your financial success and career growth"}
                </p>
              </div>
            </div>
            
            {/* Modern Report Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className={`relative overflow-hidden bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md border-border/40 rounded-3xl hover:border-secondary/60 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:shadow-secondary/10 hover:scale-105 ${
                    report.popular ? "ring-2 ring-secondary/50 bg-gradient-to-br from-secondary/10 to-accent/10" : ""
                  }`}
                  onClick={() => handleReportClick(report.id, report.locked)}
                >
                  {/* Popular Badge */}
                  {report.popular && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-secondary to-accent text-white text-xs font-bold rounded-full shadow-lg">
                        <Star className="w-3 h-3" />
                        POPULAR
                      </div>
                    </div>
                  )}
                  
                  {/* Report Content - Modern Layout */}
                  <div className="p-6 space-y-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center group-hover:scale-105 transition-transform ${
                        categoryIndex === 0 ? "from-blue-500/20 to-cyan-500/20" :
                        categoryIndex === 1 ? "from-pink-500/20 to-rose-500/20" :
                        "from-green-500/20 to-emerald-500/20"
                      }`}>
                        <div className={categoryIndex === 0 ? "text-blue-500" : categoryIndex === 1 ? "text-pink-500" : "text-green-500"}>
                          {report.icon}
                        </div>
                      </div>
                      
                      {/* Duration */}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {report.duration}
                        </div>
                      </div>
                    </div>
                    
                    {/* Title and Description */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-secondary transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {report.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                    
                    {/* Features List */}
                    {report.features && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Includes</div>
                        <div className="space-y-1.5">
                          {report.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          {report.features.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{report.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="pt-4 border-t border-border/40 flex justify-end">
                      <Button 
                        variant="cosmic" 
                        size="sm" 
                        className="w-auto h-10 px-4 rounded-lg font-bold text-sm transition-all bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                        onClick={() => {
                          if (report.locked && planName === "Free") {
                            navigate("/pricing");
                          } else {
                            handleReportClick(report.id, report.locked);
                          }
                        }}
                      >
                        {report.locked ? (
                          <span className="text-white font-bold">
                            {planName === "Free" ? "Upgrade to Premium" : "Buy Report"}
                          </span>
                        ) : (
                          <span className="text-white font-bold">Generate Report</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Reports;