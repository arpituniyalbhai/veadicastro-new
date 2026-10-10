import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, MapPin, Clock, Sparkles, Loader2, FileText, ShieldCheck, Download, UserRound, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import { useI18n } from "@/context/I18nContext";

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
  const [reportDraft, setReportDraft] = useState("");
  
  // Get user birth details from localStorage
  const birthDetails = JSON.parse(localStorage.getItem("onboarding_details") || "{}");

  // Astro calculations are persisted as zodiac_data by persistAstroPayload.
  // Keep astro_payload as a compatibility fallback for existing sessions.
  const storedChart = (() => {
    try {
      const stored = localStorage.getItem("zodiac_data") || localStorage.getItem("astro_payload");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  // Pull real astro data from localStorage (same as Dashboard)
  const astroData = (() => {
    try {
      const planets = JSON.parse(localStorage.getItem("astrology_planets") || "null");
      const ascendant = localStorage.getItem("ascendant") || "—";
      const astroPayload = storedChart;

      const moon = Array.isArray(planets)
        ? planets.find((p: any) => (p.name || p.planet)?.toLowerCase() === "moon")
        : null;

      const sun = Array.isArray(planets)
        ? planets.find((p: any) => (p.name || p.planet)?.toLowerCase() === "sun")
        : null;

      return {
        ascendant,
        moonSign: moon?.sign || "—",
        sunSignVedic: sun?.sign || "—",
        sunSignWestern: astroPayload?.western_sun_sign || sun?.sign || "—",
        nakshatra: moon?.nakshatra?.name || "—",
        nakshatraCharan: moon?.nakshatra?.pada ?? moon?.nakshatra?.charan ?? "—",
      };
    } catch {
      return {
        ascendant: "—", moonSign: "—", sunSignVedic: "—",
        sunSignWestern: "—", nakshatra: "—", nakshatraCharan: "—",
      };
    }
  })();
  
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const avatarUrl = (user as any)?.photoURL ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF0sUZDH9Yd12Ia12Xlw3x-39T5sqkNn_fTNbqFnDflgVgDNjidcva49jecsqpSMSvuqY&usqp=CAU";

  const { canGenerateReport, registerReportUsage } = usePlan();

  const getChartSummary = () => {
    try {
      const chart = storedChart;
      if (!chart) return "";

      const planetMap = chart.planets && !Array.isArray(chart.planets)
        ? chart.planets
        : Object.fromEntries((chart.planetsList || JSON.parse(localStorage.getItem("astrology_planets") || "[]"))
          .map((planet: any) => [planet.key || planet.name || planet.planet, planet]));
      const planets = Object.entries(planetMap).map(([key, value]: [string, any]) => {
        const name = value?.name || key;
        const longitude = Number(value?.longitude);
        const degree = Number.isFinite(longitude) ? `, ${((longitude % 30) + 30) % 30}° within sign` : "";
        const nakshatra = value?.nakshatra?.name
          ? `, Nakshatra ${value.nakshatra.name}${value.nakshatra.pada ? ` pada ${value.nakshatra.pada}` : ""}`
          : "";
        const house = chart.planetHouseMap?.[key.toLowerCase()];
        const retrograde = value?.retrograde ? ", retrograde" : "";
        return `${name}: ${value?.sign || "Unknown"}${degree}${house ? `, whole-sign House ${house}` : ""}${nakshatra}${retrograde}`;
      });
      const dasha = chart.dasha || {};
      const houseLords = Array.isArray(chart.houseLords)
        ? chart.houseLords.map((lord: string, index: number) => `House ${index + 1}: ${lord}`).join("; ")
        : "Not available";
      const futureDashas = Array.isArray(dasha.futureMahadashas)
        ? dasha.futureMahadashas.map((period: any) => `${period.lord} (${period.start} to ${period.end})`).join("; ")
        : "Not available";
      return [
        `Name: ${displayName}`,
        `Birth details: ${birthDetails.dob || "Unknown"}, ${birthDetails.time || birthDetails.tob || "Unknown"}, ${birthDetails.place || birthDetails.pob || "Unknown"}`,
        `Ascendant: ${chart.ascendantSign || chart.lagnaSign || "Unknown"}`,
        `Planets: ${planets.join("; ") || "Unknown"}`,
        `House lords (whole sign): ${houseLords}`,
        `Current dasha: ${dasha.mahadasha || "Unknown"} (${dasha.mahaStart || "date unavailable"} to ${dasha.mahaEnds || "date unavailable"}) / ${dasha.antardasha || "Unknown"} (${dasha.antarStart || "date unavailable"} to ${dasha.antarEnds || "date unavailable"})`,
        `Current sub-period: ${dasha.pratyantardasha || "Unknown"} (${dasha.pratyStart || "date unavailable"} to ${dasha.pratyEnds || "date unavailable"})`,
        `Upcoming major periods: ${futureDashas}`,
        `Chart data available: sidereal planetary longitudes, signs, whole-sign houses, nakshatras and Vimshottari dasha. Navamsa (D9), calculated Atmakaraka/Darakaraka, and verified yoga-strength scores are not included.`,
      ].join("\n");
    } catch {}
    return "";
  };

  const getReportPrompt = (reportType: string) => {
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

      "billionaire-potential": `Write a personalized Vedic astrology Billionaire Potential report using the supplied birth chart. Generate exactly 8 numbered sections with these headings:

1. Wealth Potential Verdict
2. Wealth Combinations in Your Chart
3. Your Wealth Activator Planets
4. Career and Enterprise Potential
5. Peak Wealth Periods
6. Your Greatest Financial Strength
7. The Main Obstacle to Greater Wealth
8. Honest Financial Destiny Verdict

Assess the 2nd, 5th, 9th and 11th houses and lords, relevant Raja and Lakshmi yoga combinations, Jupiter, Venus, the 10th lord, and supplied Dasha periods. Be direct about whether billionaire-level combinations are supported, or whether the chart points to a different wealth range. Explain concrete chart evidence and the strongest opportunity and obstacle. Do not promise wealth, overstate certainty, or give generic hard-work advice. End section 8 with a candid paragraph beginning: "Based on your chart, here is the truth about your financial destiny..." Do not use hyphens or excessive bullets.

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.`,

      "job-vs-business": `Write a personalized Vedic astrology Job vs Business report using the supplied birth chart. Generate exactly 8 numbered sections with these headings:

1. Your Clear Career Direction
2. Evidence from the 6th, 7th and 10th Houses
3. Planetary Career Indicators
4. Job Potential and Suitable Fields
5. Business Potential and Suitable Ventures
6. Career Timing Through Dasha
7. The Risk of Choosing Against Your Nature
8. Direct Career Verdict

Give a clear lean toward JOB or BUSINESS and a confidence level, supported by the chart. Assess the 6th, 7th and 10th houses and lords, Sun, Saturn, Rahu, and the running Dasha where the supplied data permits. Discuss suitable work, authority, or business types. Atmakaraka and Darakaraka values are not supplied; do not invent them. Avoid false balance, explain uncertainty honestly, and tell the user what direction the chart favors. No hyphens or generic filler.

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.`,

      "government-job": `Write a personalized Vedic astrology Government Job Potential report using the supplied birth chart. Generate exactly 8 numbered sections with these headings:

1. Government Service Potential Score
2. Sun and Authority Indicators
3. Career and Competition Houses
4. Supporting Planetary Combinations
5. Challenges or Denial Indicators
6. Favorable Exam and Career Periods
7. Suitable Public Sector Paths
8. Honest Career Verdict

Rate potential Strong, Moderate, or Weak and explain the evidence. Assess the Sun, 6th and 10th houses and lords, Saturn, Moon, relevant Raja yoga patterns, and supplied Dasha periods. Identify likely fitting sectors only where the chart supports a reason. Be candid about limitations and alternative career paths; do not promise an exam outcome or urge endless attempts. Do not claim a named yoga unless its required placements are evident in supplied chart data. No hyphens or filler.

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.`,

      "ideal-partner": `Write a personalized Vedic astrology Ideal Life Partner report using the supplied birth chart. Generate exactly 8 numbered sections with these headings:

1. Partnership Pattern in Your Chart
2. Likely Partner Personality
3. Appearance and Background Tendencies
4. Career and Shared Values
5. Love Marriage or Arranged Marriage
6. Marriage Timing and Dasha Windows
7. Delays, Doshas and Relationship Challenges
8. The Partner Path Ahead

Assess the 7th house and lord, Venus, Jupiter, 8th and 11th houses, and supplied Dasha periods. Be specific only where placements support it; describe appearance, profession and background as tendencies, never certainties. Navamsa (D9) and calculated Darakaraka are not supplied, so do not claim their positions or draw conclusions as if they were calculated. Discuss doshas only when verifiable from supplied chart data and explain their practical significance without fearmongering. End warmly and honestly, beginning the final paragraph: "Here is what your chart says about the partner coming into your life..." No hyphens or generic partner descriptions.

For ${displayName} born ${birthDetails.dob || "Unknown"} at ${birthDetails.time || birthDetails.tob || "Unknown"} in ${birthDetails.place || birthDetails.pob || "Unknown"}.`,
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
      "billionaire-potential": "Billionaire Potential Report",
      "job-vs-business": "Job vs Business Report",
      "government-job": "Government Job Potential Report",
      "ideal-partner": "Ideal Partner Report",
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
    setReportDraft("");

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
      const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "";
      const response = await fetch(`${API_BASE}/api/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: getReportPrompt(reportId),
          chartSummary: getChartSummary(),
          reportId,
          lang,
        }),
      });
      if (!response.ok || !response.body) throw new Error(await response.text());

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let generatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const event of events) {
          const line = event.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;
          const data = JSON.parse(line.slice(6));
          if (data.error) throw new Error(data.error);
          if (typeof data.text === "string") {
            generatedText += data.text;
            setReportDraft(generatedText);
          }
        }
      }
      reader.releaseLock();

      clearInterval(progressInterval);
      setProgress(100);

      // Only show report when fully generated
      if (generatedText.length > 100) {
        const sections = parseReportSections(generatedText);
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
      alert(error instanceof Error ? error.message : "Failed to generate report. Please try again.");
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

  const validReportIds = ["life-guidance", "personality", "love-navigator", "life-partner", "wealth-lifetime", "wealth-year", "billionaire-potential", "job-vs-business", "government-job", "ideal-partner"];
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
    <div className="report-print-root relative min-h-screen overflow-hidden bg-background px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <div className="report-actions flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="h-10 gap-2 rounded-xl px-3 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/reports")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
          {reportGenerated && (
            <Button variant="outline" className="h-10 gap-2 rounded-xl border-border/70 bg-card/40" onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Download report
            </Button>
          )}
        </div>

        {!reportGenerated ? (
          <>
            <header className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                <Sparkles className="h-3.5 w-3.5" />
                Personalized astrology report
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {getReportTitle(reportId || "life-guidance")}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A focused reading shaped around your birth chart, with practical guidance for the areas that matter to you.
              </p>
            </header>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
              <div className="space-y-5">
                <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/50 p-5 backdrop-blur-sm sm:p-7">
                  <div className="flex flex-wrap items-center gap-4 border-b border-border/50 pb-5">
                    <img src={avatarUrl} alt="" className="h-14 w-14 rounded-2xl border border-secondary/30 object-cover shadow-md shadow-secondary/10 sm:h-16 sm:w-16" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Prepared for</p>
                      <h2 className="mt-1 truncate text-xl font-semibold text-foreground">{displayName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{planName} plan</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      Personal chart
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-foreground">Birth details</h3>
                      <span className="text-xs text-muted-foreground">Used to personalize your report</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: "Date of birth", value: birthDetails.dob || "Not provided", Icon: Calendar },
                        { label: "Time of birth", value: birthDetails.time || birthDetails.tob || "Not provided", Icon: Clock },
                        { label: "Place of birth", value: birthDetails.place || birthDetails.pob || "Not provided", Icon: MapPin },
                      ].map(({ label, value, Icon }) => (
                        <div key={label} className="flex min-w-0 items-start gap-3 rounded-xl border border-border/50 bg-background/35 p-3.5 sm:p-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="rounded-2xl border-border/60 bg-card/35 p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-secondary"><Sparkles className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-semibold">Your chart at a glance</h3>
                      <p className="text-xs text-muted-foreground">Key placements already calculated for you</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: "Ascendant", value: astroData.ascendant },
                      { label: "Moon sign", value: astroData.moonSign },
                      { label: "Sun sign", value: astroData.sunSignVedic },
                      { label: "Nakshatra", value: astroData.nakshatra },
                    ].map(({ label, value }) => (
                      <div key={label} className="min-w-0 rounded-xl border border-border/50 bg-background/30 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/50 shadow-xl shadow-black/10 backdrop-blur-sm lg:sticky lg:top-6">
                <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                <div className="space-y-5 p-5 sm:p-6">
                  {generating ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><Loader2 className="h-5 w-5 animate-spin" /></div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">In progress</p>
                          <h2 className="mt-1 text-lg font-semibold">Writing your report</h2>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">Your personalized insights will appear here as they are ready.</p>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Preparing your report</span>
                          <span className="font-semibold tabular-nums text-foreground">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-border/60" role="progressbar" aria-label="Report generation progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-emerald-400" /> Your report is linked to your birth chart</div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Ready when you are</p>
                        <h2 className="mt-2 text-xl font-semibold">Start your personalized reading</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Generate a structured report based on your birth details and planetary placements.</p>
                      </div>
                      <div className="space-y-3 rounded-xl border border-border/50 bg-background/35 p-4">
                        <div className="flex items-center gap-2.5 text-sm text-foreground"><Check className="h-4 w-4 text-emerald-400" /> Tailored to your birth chart</div>
                        <div className="flex items-center gap-2.5 text-sm text-foreground"><Check className="h-4 w-4 text-emerald-400" /> Clear, organized sections</div>
                        <div className="flex items-center gap-2.5 text-sm text-foreground"><Check className="h-4 w-4 text-emerald-400" /> Practical guidance to revisit</div>
                      </div>
                      <Button variant="cosmic" size="lg" className="h-12 w-full rounded-full text-base font-semibold shadow-lg shadow-secondary/20" onClick={generateReport}>
                        Generate report
                      </Button>
                      <p className="text-center text-xs leading-5 text-muted-foreground">Your report credit is used when generation completes.</p>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {generating && reportDraft && (
              <Card className="rounded-2xl border-border/60 bg-card/40 p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-secondary" /><h3 className="text-sm font-semibold">Live report preview</h3></div>
                  <span className="text-xs text-muted-foreground">Updating as it is written</span>
                </div>
                <pre className="max-h-[32rem] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/50 bg-background/40 p-4 text-left font-sans text-sm leading-6 text-foreground/90">{reportDraft}</pre>
              </Card>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <header className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-secondary/5 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-400"><Check className="h-3.5 w-3.5" /> Report ready</div>
                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{getReportTitle(reportId || "life-guidance")}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Prepared for {displayName} · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/35 p-3 pr-4">
                  <img src={avatarUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="max-w-44 truncate text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{birthDetails.place || birthDetails.pob || "Birth chart profile"}</p>
                  </div>
                </div>
              </div>
            </header>

            <Card className="rounded-2xl border-border/60 bg-card/40 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-secondary" />
                <h2 className="text-sm font-semibold">Birth chart profile</h2>
                <span className="ml-auto text-xs text-muted-foreground">Prepared for {displayName}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Date of birth", value: birthDetails.dob || "Unknown", Icon: Calendar },
                  { label: "Time of birth", value: birthDetails.time || birthDetails.tob || "Unknown", Icon: Clock },
                  { label: "Place of birth", value: birthDetails.place || birthDetails.pob || "Unknown", Icon: MapPin },
                  { label: "Vedic sun sign", value: astroData.sunSignVedic, Icon: Sparkles },
                  { label: "Western sun sign", value: astroData.sunSignWestern, Icon: Sparkles },
                  { label: "Moon sign", value: astroData.moonSign, Icon: Sparkles },
                  { label: "Ascendant", value: astroData.ascendant, Icon: Sparkles },
                  { label: "Birth nakshatra", value: astroData.nakshatra, Icon: Sparkles },
                  { label: "Nakshatra charan", value: astroData.nakshatraCharan, Icon: Sparkles },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/50 bg-background/30 px-3 py-3">
                    <Icon className="h-4 w-4 shrink-0 text-secondary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="mt-0.5 break-words text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
                <span>{lang === "hi" ? "वेदिका द्वारा आपकी व्यक्तिगत ज्योतिषीय रिपोर्ट" : "Your personalized astrology report by Vedika"}</span>
                <span>{lang === "hi" ? "रिपोर्ट तिथि:" : "Report date:"} {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2 px-1">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Your reading</p>
                  <h2 className="mt-1 text-2xl font-bold">Personalized insights</h2>
                </div>
                <p className="text-sm text-muted-foreground">{reportSections.length} sections</p>
              </div>
              {reportSections.map((section, index) => (
                <Card key={index} className="rounded-2xl border-border/60 bg-card/40 p-5 sm:p-7">
                  <article>
                    <div className="mb-4 flex items-start gap-3 border-b border-border/50 pb-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-secondary/20 bg-secondary/10 text-sm font-bold text-secondary">{String(index + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1 pt-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Section {index + 1}</p>
                        <h3 className="mt-1 text-lg font-semibold leading-snug sm:text-xl">{section.title}</h3>
                      </div>
                    </div>
                    <div className="max-w-none whitespace-pre-line text-sm leading-7 text-foreground/90 sm:text-base sm:leading-8">
                      {section.content}
                    </div>
                  </article>
                </Card>
              ))}
            </div>

            <div className="report-actions flex flex-col-reverse gap-3 border-t border-border/50 pt-5 sm:flex-row sm:justify-between">
              <Button variant="outline" className="h-11 rounded-xl" onClick={() => navigate("/reports")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to reports
              </Button>
              <Button variant="cosmic" className="h-11 gap-2 rounded-xl" onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Download report
              </Button>
            </div>
          </div>
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
