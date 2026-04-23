import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, MapPin, Clock, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { useI18n } from "@/context/I18nContext";
import { generateGemini } from "@/lib/gemini";
import { VAANI_SYSTEM_PROMPT } from "@/lib/gemini";

type ReportSection = {
  title: string;
  content: string;
};

const ReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { planName } = usePlan();
  const { lang, t } = useI18n();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [reportSections, setReportSections] = useState<ReportSection[]>([]);
  
  // Get user birth details from localStorage
  const birthDetails = JSON.parse(localStorage.getItem("onboarding_details") || "{}");
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const avatarUrl = (user as any)?.photoURL ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU";

  const { canGenerateReport, registerReportUsage } = usePlan();

  // Get planetary data for reports
  const getPlanetaryDataForReport = () => {
    try {
      const stored = localStorage.getItem("astro_payload");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  };

  const getReportPrompt = (reportType: string) => {
    const planetaryData = getPlanetaryDataForReport();
    const planetaryInfo = planetaryData ? `\n\nPlanetary Data:\n${JSON.stringify(planetaryData, null, 2)}` : "";
    
    const languageInstruction = lang === "hi" ? 
      "\n\nIMPORTANT: Generate this entire report in Hindi language." : 
      "\n\nIMPORTANT: Generate this entire report in English language.";
    
    const baseInfo = `Name: ${displayName}\nDate of Birth: ${birthDetails.dob || "Unknown"}\nTime of Birth: ${birthDetails.tob || birthDetails.time || "Unknown"}\nPlace of Birth: ${birthDetails.pob || birthDetails.place || "Unknown"}${planetaryInfo}${languageInstruction}`;

    const reportPrompts: Record<string, string> = {
      "life-guidance": `Generate exactly 8 numbered sections. Use these exact headings:

1. Soul Overview
2. Career & Ambition
3. Love & Relationships
4. Wealth & Finances
5. Health & Vitality
6. Family & Home
7. Current Phase (Dasha/Transit)
8. Conclusion & Action Plan

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.

CRITICAL REQUIREMENTS:
- Each section must be exactly 100-200 words
- Use simple, practical language
- No Sanskrit, no tables, no complex terms
- Start directly with section 1
- No introduction or extra content

Format:
1. Soul Overview
[100-200 words of practical advice]

2. Career & Ambition
[100-200 words of practical advice]

Continue for all 8 sections.`,

      "personality": `Generate exactly 8 numbered sections. Use these exact headings:

1. Core Identity
2. Emotional Blueprint
3. Shadow Side
4. Career Compatibility
5. Social Dynamics
6. Creative Expression
7. Learning & Growth
8. Life Purpose Integration

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.

CRITICAL REQUIREMENTS:
- Each section must be exactly 100-200 words
- Use simple, practical language
- No Sanskrit, no tables, no complex terms
- Start directly with section 1
- No introduction or extra content

Format:
1. Core Identity
[100-200 words of practical insights]

2. Emotional Blueprint
[100-200 words of practical insights]

Continue for all 8 sections.`,

      "love-navigator": `Generate exactly 8 numbered sections. Use these exact headings:

1. Your Romantic Style
2. Love Compatibility
3. Current Love Phase
4. Romantic Timing
5. Relationship Strengths
6. Relationship Challenges
7. Communication in Love
8. Conclusion & Love Action Plan

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.

CRITICAL REQUIREMENTS:
- Each section must be exactly 100-200 words
- Use simple, practical language
- No Sanskrit, no tables, no complex terms
- Start directly with section 1
- No introduction or extra content

Format:
1. Your Romantic Style
[100-200 words of practical love advice]

2. Love Compatibility
[100-200 words of practical love advice]

Continue for all 8 sections.`,

      "life-partner": `Generate exactly 8 numbered sections. Use these exact headings:

1. Your Ideal Partner Profile
2. Physical & Personality Traits
3. Marriage Timing
4. Compatibility Factors
5. Challenges in Partnership
6. Past Life Connection
7. Family & Social Compatibility
8. Conclusion

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.

CRITICAL REQUIREMENTS:
- Each section must be exactly 100-200 words
- Use simple, practical language
- No Sanskrit, no tables, no complex terms
- Start directly with section 1
- No introduction or extra content

Format:
1. Your Ideal Partner Profile
[100-200 words of practical partner insights]

2. Physical & Personality Traits
[100-200 words of practical partner insights]

Continue for all 8 sections.`,

      "wealth-lifetime": `Generate exactly 8 numbered sections. Use these exact headings:

1. Wealth Potential
2. Money Mindset
3. Best Career Directions
4. Business vs Job
5. Investment Timing
6. Financial Risks
7. Property & Assets
8. Conclusion & Wealth Plan

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.

CRITICAL REQUIREMENTS:
- Each section must be exactly 100-200 words
- Use simple, practical language
- No Sanskrit, no tables, no complex terms
- Start directly with section 1
- No introduction or extra content

Format:
1. Wealth Potential
[100-200 words of practical financial advice]

2. Money Mindset
[100-200 words of practical financial advice]

Continue for all 8 sections.`,

      "wealth-year": `Generate exactly 8 numbered sections. Use these exact headings:

1. Year Overview
2. Quarter-wise Predictions
3. Best Income Periods
4. Best Investment Windows
5. Career Opportunities
6. Financial Risks This Year
7. Business Prospects
8. Conclusion & Monthly Tips

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.

CRITICAL REQUIREMENTS:
- Each section must be exactly 100-200 words
- Use simple, practical language
- No Sanskrit, no tables, no complex terms
- Start directly with section 1
- No introduction or extra content

Format:
1. Year Overview
[100-200 words of practical yearly financial advice]

2. Quarter-wise Predictions
[100-200 words of practical yearly financial advice]

Continue for all 8 sections.`,
    };

    return reportPrompts[reportType] || reportPrompts["life-guidance"];
  };

  const getReportTitle = (reportType: string) => {
    const titles: Record<string, string> = {
      "life-guidance": "Life Guidance Report",
      "personality": "Personality Traits Report",
      "love-navigator": "Love Navigator Report",
      "life-partner": "Life Partner Report",
      "wealth-lifetime": "Wealth Report (Lifetime)",
      "wealth-year": "Wealth Forecast (1 Year)",
    };
    return titles[reportType] || "Astrological Report";
  };

  const generateReport = async () => {
    if (!reportId) return;
    
    // Check report credits for ALL reports (including life-guidance)
    if (!canGenerateReport()) {
      setShowPremium(true);
      return;
    }

    setGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 2500);

    try {
      const prompt = getReportPrompt(reportId || "life-guidance");
      const systemPrompt = `CRITICAL REPORT GENERATION RULES:
1. Generate EXACTLY 8 numbered sections with the exact headings provided
2. Each section MUST be minimum 150 words
3. Use plain text only, no markdown
4. Start directly with "1. [Section Title]"
5. Use user's birth chart data for personalized insights`;
      
      const response = await generateGemini(prompt, [], systemPrompt);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Only show report when fully generated
      if (response && response.length > 100) {
        const sections = parseReportSections(response);
        setReportSections(sections);
        setReportGenerated(true);
        
        // Register report usage for ALL reports (including life-guidance)
        registerReportUsage();
      } else {
        throw new Error("Report generation incomplete");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      clearInterval(progressInterval);
      setProgress(0);
      alert("Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const sanitizeMarkdown = (text: string) => {
    // Remove bold/italic markers and heading hashes while keeping content
    let out = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_[^_]+_/g, (m) => m.slice(1, -1))
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/`{1,3}([^`]+)`{1,3}/g, "$1");
    // Normalize bullets
    out = out.replace(/^[-*]\s+/gm, "  ");
    return out;
  };

  const parseReportSections = (raw: string): ReportSection[] => {
    const text = sanitizeMarkdown(raw);
    const sections: ReportSection[] = [];
    const lines = text.split("\n");
    let currentSection: ReportSection | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check if it's a heading (starts with number, emoji, or specific patterns)
      const isHeading = 
        /^\d+\./.test(trimmed) || // Numbered headings
        /^[^A-Za-z0-9\s]/.test(trimmed) || // Any line starting with emoji/special chars
        /^[A-Z][^.]*:/.test(trimmed); // Uppercase headings ending with colon
      
      if (isHeading) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed.replace(/^\d+\.\s*/, ""),
          content: ""
        };
      } else if (currentSection && trimmed) {
        currentSection.content += trimmed + "\n";
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    // If no sections found, try to split by common patterns
    if (sections.length === 0) {
      const fallbackSections = text.split(/\n\n+/).filter(section => section.trim().length > 50);
      if (fallbackSections.length >= 3) {
        return fallbackSections.map((section, index) => ({
          title: `Section ${index + 1}`,
          content: section.trim()
        }));
      }
    }
    return sections.length > 0 ? sections : [{ title: "Astrological Report", content: text }];
  };

  const validReportIds = ["life-guidance", "personality", "love-navigator", "life-partner", "wealth-lifetime", "wealth-year"];
  if (!reportId || !validReportIds.includes(reportId)) {
    return (
      <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Report Not Available</h2>
          <p className="text-muted-foreground mb-6">This report is currently locked or unavailable.</p>
          <Button variant="cosmic" onClick={() => navigate("/reports")}>
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 lg:px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/reports")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Button>

        {!reportGenerated ? (
          <>
            {/* Report Info Card */}
            <Card className="p-8 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{getReportTitle(reportId || "life-guidance")}</h1>
                <p className="text-muted-foreground">This report is for {displayName}</p>
              </div>

              {/* User Avatar */}
              <div className="flex justify-center">
                <img src={avatarUrl} alt="profile" className="w-20 h-20 rounded-full object-cover" />
              </div>

              {/* Birth Details */}
              <div className="grid sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{birthDetails.dob || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time of Birth</p>
                    <p className="font-medium">{birthDetails.time || birthDetails.tob || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Place of Birth</p>
                    <p className="font-medium">{birthDetails.place || birthDetails.pob || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              {!generating && (
                <Button
                  variant="cosmic"
                  size="lg"
                  className="gap-2"
                  onClick={generateReport}
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Report
                </Button>
              )}

              {/* Progress */}
              {generating && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                    <p className="text-lg font-medium">Generating your report...</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This may take up to 2 minutes. dont go back - please wait...
                  </p>
                </div>
              )}
            </Card>
          </>
        ) : (
          <>
            {/* Generated Report */}
            <Card className="p-8 bg-card/40 backdrop-blur-sm border-border/60 rounded-2xl space-y-6">
              {/* Report Header - Mandatory Vedika Branding */}
              <div className="text-center space-y-4 pb-6 border-b border-border/40">
                <h1 className="text-3xl font-bold">{getReportTitle(reportId || "life-guidance")}</h1>
                <p className="text-muted-foreground">This report is for {displayName}</p>
                
                {/* User Info */}
                <div className="flex justify-center items-center gap-4 pt-4">
                  <img src={avatarUrl} alt="profile" className="w-16 h-16 rounded-full object-cover" />
                  <div className="text-left">
                    <p className="font-semibold text-lg">{displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {birthDetails.dob} • {birthDetails.place || birthDetails.pob}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ordered by:</p>
                    <p className="font-medium">{displayName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created on:</p>
                    <p className="font-medium">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start date:</p>
                    <p className="font-medium">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End date:</p>
                    <p className="font-medium">Valid for Life</p>
                  </div>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-4">
                <div className="text-2xl text-muted-foreground">✦ ✧ ✦ ✧ ✦</div>
              </div>

              {/* Mandatory Vedika Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <img src={avatarUrl} alt="profile" className="w-20 h-20 rounded-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-center">{displayName}</h2>
                
                <div className="grid gap-3 max-w-md mx-auto">
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Date of Birth</span>
                    </div>
                    <span className="font-medium">{birthDetails.dob || "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Place of Birth</span>
                    </div>
                    <span className="font-medium">{birthDetails.place || birthDetails.pob || "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Time of Birth</span>
                    </div>
                    <span className="font-medium">{birthDetails.time || birthDetails.tob || "Unknown"}</span>
                  </div>
                  
                  {/* Astrological Signs */}
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span>Sun Sign (Vedic)</span>
                    </div>
                    <span className="font-medium">Pisces</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span>Sun Sign (Western)</span>
                    </div>
                    <span className="font-medium">Pisces</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span>Moon Sign</span>
                    </div>
                    <span className="font-medium">Gemini</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span>Ascendant</span>
                    </div>
                    <span className="font-medium">Scorpio</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span>Birth Nakshatra</span>
                    </div>
                    <span className="font-medium">Mrigashira</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span>Nakshatra Charan</span>
                    </div>
                    <span className="font-medium">4</span>
                  </div>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-6">
                <div className="text-2xl text-muted-foreground">✦ ✧ ✦ ✧ ✦</div>
              </div>

              {/* Vedika Branding Header */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">
                  {lang === "hi" ? "वेदिका द्वारा आपका जीवन मार्गदर्शन ज्योतिषीय रिपोर्ट" : "Your Life Guidance Astrological Report by Vedika"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "hi" 
                    ? `(जन्म विवरण: ${birthDetails.dob || "Unknown"}, ${birthDetails.time || birthDetails.tob || "Unknown"}, ${birthDetails.place || birthDetails.pob || "Unknown"} | lahiri अयनांश: 23°51'14")`
                    : `(Birth Details: ${birthDetails.dob || "Unknown"}, ${birthDetails.time || birthDetails.tob || "Unknown"}, ${birthDetails.place || birthDetails.pob || "Unknown"} | lahiri Ayanamsa: 23°51'14")`
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "hi" ? "रिपोर्ट तिथि:" : "Report Date:"} {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} IST
                </p>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-6">
                <div className="text-2xl text-muted-foreground">✦ ✧ ✦ ✧ ✦</div>
              </div>

              {/* Report Sections */}
              {reportSections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h2 className="text-2xl font-bold text-center">{section.title}</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-foreground/90 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                  {index < reportSections.length - 1 && (
                    <div className="flex items-center justify-center py-6">
                      <div className="text-2xl text-muted-foreground">✦ ✧ ✦ ✧ ✦</div>
                    </div>
                  )}
                </div>
              ))}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/reports")}>
                Back to Reports
              </Button>
              {planName !== "Free" ? (
                <Button variant="cosmic" onClick={() => window.print()}>
                  Download Report
                </Button>
              ) : (
                <Button 
                  variant="cosmic" 
                  onClick={() => navigate("/pricing?referral=pdf-download")}
                >
                  Upgrade to Download PDF
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      {/* Premium modal */}
      <Dialog open={showPremium} onOpenChange={setShowPremium}>
        <DialogContent className="sm:max-w-md bg-background border border-border">
          <DialogHeader>
            <DialogTitle>No report credits available</DialogTitle>
            <DialogDescription>
              You need report credits to generate reports. Upgrade to Premium to unlock all reports and unlimited generations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowPremium(false)}>Close</Button>
            <Button variant="cosmic" onClick={() => { setShowPremium(false); navigate('/pricing'); }}>Buy Premium</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportDetail;