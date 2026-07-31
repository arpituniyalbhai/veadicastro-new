import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy, useEffect, type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";
import { cleanupOldCache } from "@/lib/dailyPredictionsPipeline";
import { PlanProvider } from "@/context/PlanContext";
import Footer from "@/components/Footer";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import RedirectComponent from "@/components/RedirectComponent";
import { PageLoading } from "@/components/PageLoading";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";

// Lazy load heavy components to reduce initial bundle size
const Welcome = lazy(() => import("@/pages/Welcome"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Instruction = lazy(() => import("@/pages/Instruction"));
const Reports = lazy(() => import("@/pages/Reports"));
const DeepReports = lazy(() => import("@/pages/DeepReports"));
const ReportPage = lazy(() => import("@/pages/ReportDetail"));
const LanguageSettings = lazy(() => import("@/pages/LanguageSettings"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const PricingOnboarding = lazy(() => import("@/pages/PricingOnboarding"));
const SubscriptionOnboarding = lazy(() => import("@/pages/SubscriptionOnboarding"));
const Chat = lazy(() => import("@/pages/Chat"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const Refund = lazy(() => import("@/pages/Refund"));
const Profile = lazy(() => import("@/pages/Profile"));
const About = lazy(() => import("@/pages/About"));
const AboutFounder = lazy(() => import("@/pages/AboutFounder"));
const DynamicPage = lazy(() => import("@/pages/DynamicPage"));
const Mission = lazy(() => import("@/pages/Mission"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Contact = lazy(() => import("@/pages/Contact"));
const Blog = lazy(() => import("@/pages/Blog"));
const Compatibility = lazy(() => import("@/pages/Compatibility"));
const CompatibilityResult = lazy(() => import("@/pages/CompatibilityResult"));
const TalkToAstrologer = lazy(() => import("@/pages/TalkToAstrologer"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));

// Lazy load blog components
const RahuKetuTransit2026 = lazy(() => import("../blogs/Rahu-Ketu-Transit-2026-Predictions-for-All-12-Rashis"));
const VedAstrologyAIKaiseKaamKartaHai = lazy(() => import("../blogs/vedic-astrology-ai-kese-kaam-karta-ha"));
const Top10VedicAstrologyPlatform = lazy(() => import("../blogs/top-10-vedic-astrology-platform"));
const Free5MinutesAstrologyAI = lazy(() => import("@/pages/free-5-minutes-astrology-ai"));
const OnlineJyotishiVsAIAstrologer = lazy(() => import("../blogs/Online-Jyotishi-vs-AI-Astrologer"));
const WhichTeamWinIPL2026 = lazy(() => import("../blogs/ipl-2026-winner-prediction-astrology"));
const BestCareersForZodiacSign2026 = lazy(() => import("../blogs/Best-Careers-for-Each-Zodiac-Sign-in-2026"));
const NextPMIndia2029AstrologyPrediction = lazy(() => import("../blogs/next-pm-india-2029-astrology-prediction"));
const VedicVsWesternAstrology = lazy(() => import("../blogs/vedic-vs-western-astrology"));
const MarriageCompatibilityZodiac = lazy(() => import("../blogs/marriage-Compatibility-Based-on-Your-Zodiac-Sign"));
const YearlyHoroscope2026 = lazy(() => import("../blogs/Yearly-Horoscope-2026-Complete-Zodiac-Predictions-for-All-12-Rashis"));
const HowAITransformingVedicAstrology = lazy(() => import("../blogs/How-AI-is-transforming-vedic-astrology"));
const ManglikDoshaMythsVsReality = lazy(() => import("../blogs/manglik-dosha-myths-vs-reality"));
const MarriageMuhurat2026 = lazy(() => import("../blogs/Marriage-Muhurat-2026"));
const HowToSleepAsPerVastuIn2026 = lazy(() => import("../blogs/how-to-sleep-as-per-vastu-in-2026"));
const JobVsBusinessWhatYourChartSay = lazy(() => import("../blogs/job-vs-business-what-your-chart-say"));
const IsAiAstrologyAccurate = lazy(() => import("../blogs/ai-astrology/is-ai-astrology-accurate"));
const AiJyotishVedicAstrology = lazy(() => import("../blogs/ai-astrology/ai-jyotish-vedic-astrology"));
const AiAstrologerVsHumanAstrologer = lazy(() => import("../blogs/ai-astrology/ai-astrologer-vs-human-astrologer"));
const AiAstrologyRealOrFake = lazy(() => import("../blogs/ai-astrology/ai-astrology-real-or-fake"));
const WhyChatGptFailsAtAiAstrology = lazy(() => import("../blogs/ai-astrology/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt"));
const AiAstrologyPredictionFor2026 = lazy(() => import("../blogs/ai-astrology/ai-astrology-prediction-for-2026"));
const TheGreatAstrologyScam = lazy(() => import("../blogs/The-Great-Astrology-Scam"));
const VedikaAiAstrologerIndia = lazy(() => import("../blogs/vedika-ai-astrologer-india"));
const AiAstrology = lazy(() => import("../blogs/ai-astrology/ai-astrology"));
const FreeAiAstrologyChat = lazy(() => import("../blogs/ai-astrology/free-ai-astrology-chat-india"));
const FifaWorldCup2026WinnerAstrologyPrediction = lazy(() => import("../blogs/fifa-world-cup-2026-winner-astrology-prediction"));
const AiNumerologyGuide = lazy(() => import("../blogs/numerology-guide"));

// Lazy load tool pages
const FreeAiAstrologerChat = lazy(() => import("@/pages/free-ai-astrologer-chat"));
const AiMarriagePredictionByDateOfBirth = lazy(() => import("@/pages/AiMarriagePredictionByDateOfBirth"));
const AiCareerPredictionByDateOfBirth = lazy(() => import("@/pages/AiCareerPredictionByDateOfBirth"));
const AiLoveAstrologyByDateOfBirth = lazy(() => import("@/pages/AiLoveAstrologyByDateOfBirth"));
const FutureWifePrediction = lazy(() => import("@/pages/FutureWifePrediction"));
const AiKundliAnalysis = lazy(() => import("@/pages/AiKundliAnalysis"));
const FreeKundliGenerator = lazy(() => import("@/pages/FreeKundliGenerator"));
const FreeKundliMatching = lazy(() => import("@/pages/free-kundali-matching"));
const TodayHoroscope = lazy(() => import("@/pages/today-horoscope"));
const KundaliMatching = lazy(() => import("@/pages/KundaliMatching"));
const Chart = lazy(() => import("@/pages/Chart"));
const AngelNumberCalculator = lazy(() => import("@/pages/AngelNumberCalculator"));
const LuckyColourForToday = lazy(() => import("@/pages/lucky-colour-for-today"));
const AstrologyStore = lazy(() => import("@/pages/AstrologyStore"));
const DhanYogBracelet = lazy(() => import("@/pages/DhanYogBracelet"));
const ChatGPTAstrology = lazy(() => import("@/pages/ChatGPTAstrology"));
const AiAstrologyPrediction = lazy(() => import("@/pages/AiAstrologyPrediction"));
const AiNumerologyFreeChat = lazy(() => import("@/pages/AiNumerologyFreeChat"));
const HoroscopeByDateOfBirth = lazy(() => import("@/pages/HoroscopeByDateOfBirth"));
const AiPandit = lazy(() => import("@/pages/AiPandit"));
const HiAstroAlternative = lazy(() => import("@/pages/HiAstroAlternative"));
const KundliGPTAlternative = lazy(() => import("@/pages/KundliGPTAlternative"));
const AstroSageAlternative = lazy(() => import("@/pages/AstroSageAlternative"));
const ArpitUniyal = lazy(() => import("@/pages/ArpitUniyal"));
const BestAstrologerInDehradun = lazy(() => import("../astrologer/best-astrologer-in-dehradun"));
const DailyPrediction = lazy(() => import("@/pages/DailyPrediction"));
const MonthlyPrediction = lazy(() => import("@/pages/MonthlyPrediction"));
const AstrologyByDateOfBirth = lazy(() => import("@/pages/AstrologyByDateOfBirth"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const RashiCalculatorByDateOfBirth = lazy(() => import("@/pages/RashiCalculatorByDateOfBirth"));

const AuthModal = lazy(() => import("@/components/AuthModal"));
const ProtectedPlanRoute = lazy(() => import("@/components/ProtectedPlanRoute"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries to prevent double billing
      retryDelay: 0,
      retryOnMount: false,
    },
    mutations: {
      retry: false, // Disable retries for mutations
    },
  },
});

const RouterShell = () => {
  const location = useLocation();
  const p = location.pathname;
  const dashboardPaths = [
    "/dashboard",
    "/dynamic",
    "/reports",
    "/deep-reports",
    "/pricing",
    "/settings/language",
    "/profile",
    "/chat",
    "/compatibility",
    "/compatibility/result",
    "/monthly-prediction",
  ];
  
  const hideFooter =
    dashboardPaths.some((base) => p === base || p.startsWith(base + "/")) ||
    p.startsWith("/report/") ||
    p === "/welcome" ||
    p === "/onboarding" ||
    p === "/subscription/onboarding" ||
    p === "/chatgpt-astrology" ||
    p === "/ai-astrology-prediction" ||
    p === "/about" ||
    p === "/how-it-works" ||
    p === "/blog" ||
    p.startsWith("/blog/");

  const protectedPage = (page: ReactNode) => (
    <Suspense fallback={<PageLoading />}>
      <ProtectedPlanRoute>{page}</ProtectedPlanRoute>
    </Suspense>
  );

  if (p === "/") {
    return (
      <>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
        <Footer />
      </>
    );
  }

  return (
    <AuthProvider>
      <AuthenticatedRoutes hideFooter={hideFooter} protectedPage={protectedPage} />
    </AuthProvider>
  );
};

const AuthenticatedRoutes = ({
  hideFooter,
  protectedPage,
}: {
  hideFooter: boolean;
  protectedPage: (page: ReactNode) => ReactNode;
}) => {
  const { authOpen } = useAuth();

  return (
    <>
      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/free-ai-astrologer-chat" element={<Suspense fallback={<PageLoading />}><FreeAiAstrologerChat /></Suspense>} />
        <Route path="/ai-marriage-prediction-by-date-of-birth" element={<Suspense fallback={<PageLoading />}><AiMarriagePredictionByDateOfBirth /></Suspense>} />
        <Route path="/ai-career-prediction-by-date-of-birth" element={<Suspense fallback={<PageLoading />}><AiCareerPredictionByDateOfBirth /></Suspense>} />
        <Route path="/love-astrology-by-date-of-birth" element={<Suspense fallback={<PageLoading />}><AiLoveAstrologyByDateOfBirth /></Suspense>} />
        <Route path="/ai-future-spouse-prediction" element={<Suspense fallback={<PageLoading />}><FutureWifePrediction /></Suspense>} />
        <Route path="/ai-kundli-analysis" element={<Suspense fallback={<PageLoading />}><AiKundliAnalysis /></Suspense>} />
        <Route path="/free-5-minutes-astrology-ai" element={<Suspense fallback={<PageLoading />}><Free5MinutesAstrologyAI /></Suspense>} />
        <Route path="/free-kundli-generator" element={<Suspense fallback={<PageLoading />}><FreeKundliGenerator /></Suspense>} />
        <Route path="/free-kundali-matching" element={<Suspense fallback={<PageLoading />}><FreeKundliMatching /></Suspense>} />
        <Route path="/today-horoscope" element={<Suspense fallback={<PageLoading />}><TodayHoroscope /></Suspense>} />
        <Route path="/angel-number-calculator" element={<Suspense fallback={<PageLoading />}><AngelNumberCalculator /></Suspense>} />
        <Route path="/lucky-colour-for-today" element={<Suspense fallback={<PageLoading />}><LuckyColourForToday /></Suspense>} />
        <Route path="/astrology-store" element={<Suspense fallback={<PageLoading />}><AstrologyStore /></Suspense>} />
        <Route path="/dhan-yog-bracelet" element={<Suspense fallback={<PageLoading />}><DhanYogBracelet /></Suspense>} />
        <Route path="/dhan-yoga-bracelet" element={<Suspense fallback={<PageLoading />}><DhanYogBracelet /></Suspense>} />
        <Route path="/astrology-store/dhan-yog-bracelet" element={<Suspense fallback={<PageLoading />}><DhanYogBracelet /></Suspense>} />
        <Route path="/chatgpt-astrology" element={<Suspense fallback={<PageLoading />}><ChatGPTAstrology /></Suspense>} />
        <Route path="/ai-astrology-prediction" element={<Suspense fallback={<PageLoading />}><AiAstrologyPrediction /></Suspense>} />
        <Route path="/horoscope-by-date-of-birth" element={<Suspense fallback={<PageLoading />}><HoroscopeByDateOfBirth /></Suspense>} />
        <Route path="/ai-pandit" element={<Suspense fallback={<PageLoading />}><AiPandit /></Suspense>} />
        <Route path="/hi-astro-alternative" element={<Suspense fallback={<PageLoading />}><HiAstroAlternative /></Suspense>} />
        <Route path="/kundligpt-alternative" element={<Suspense fallback={<PageLoading />}><KundliGPTAlternative /></Suspense>} />
        <Route path="/astrosage-alternative" element={<Suspense fallback={<PageLoading />}><AstroSageAlternative /></Suspense>} />
        <Route path="/astrology-by-date-of-birth" element={<Suspense fallback={<PageLoading />}><AstrologyByDateOfBirth /></Suspense>} />
        <Route path="/rashi-calculator-by-date-of-birth" element={<Suspense fallback={<PageLoading />}><RashiCalculatorByDateOfBirth /></Suspense>} />
        <Route path="/ai-numerology-free-chat" element={<Suspense fallback={<PageLoading />}><AiNumerologyFreeChat /></Suspense>} />

        <Route path="/kundali-matching" element={<Suspense fallback={<PageLoading />}><KundaliMatching /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoading />}><About /></Suspense>} />
        <Route path="/about-founder" element={<Suspense fallback={<PageLoading />}><AboutFounder /></Suspense>} />
        <Route path="/arpit-uniyal" element={<Suspense fallback={<PageLoading />}><ArpitUniyal /></Suspense>} />
        <Route path="/best-astrologer-in-dehradun" element={<Suspense fallback={<PageLoading />}><BestAstrologerInDehradun /></Suspense>} />
        <Route path="/mission" element={<Suspense fallback={<PageLoading />}><Mission /></Suspense>} />
        <Route path="/how-it-works" element={<Suspense fallback={<PageLoading />}><HowItWorks /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoading />}><Contact /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<PageLoading />}><Blog /></Suspense>} />
        <Route path="/blog/vedic-astrology-ai-kese-kaam-karta-ha" element={<Suspense fallback={<PageLoading />}><VedAstrologyAIKaiseKaamKartaHai /></Suspense>} />
        <Route path="/blog/top-10-vedic-astrology-platform" element={<Suspense fallback={<PageLoading />}><Top10VedicAstrologyPlatform /></Suspense>} />
        <Route path="/blog/online-jyotishi-vs-ai-astrologer" element={<Suspense fallback={<PageLoading />}><OnlineJyotishiVsAIAstrologer /></Suspense>} />
        <Route path="/blog/ipl-2026-winner-prediction-astrology" element={<Suspense fallback={<PageLoading />}><WhichTeamWinIPL2026 /></Suspense>} />
        <Route path="/blog/best-careers-for-each-zodiac-sign-in-2026" element={<Suspense fallback={<PageLoading />}><BestCareersForZodiacSign2026 /></Suspense>} />
        <Route path="/blog/next-pm-india-2029-astrology-prediction" element={<Suspense fallback={<PageLoading />}><NextPMIndia2029AstrologyPrediction /></Suspense>} />
        <Route path="/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis" element={<Suspense fallback={<PageLoading />}><RahuKetuTransit2026 /></Suspense>} />
        <Route path="/blog/vedic-vs-western-astrology" element={<Suspense fallback={<PageLoading />}><VedicVsWesternAstrology /></Suspense>} />
        <Route path="/blog/marriage-compatibility-based-on-your-zodiac-sign" element={<Suspense fallback={<PageLoading />}><MarriageCompatibilityZodiac /></Suspense>} />
        <Route path="/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis" element={<Suspense fallback={<PageLoading />}><YearlyHoroscope2026 /></Suspense>} />
        <Route path="/blog/how-ai-is-transforming-vedic-astrology" element={<Suspense fallback={<PageLoading />}><HowAITransformingVedicAstrology /></Suspense>} />
        <Route path="/blog/manglik-dosha-myths-vs-reality" element={<Suspense fallback={<PageLoading />}><ManglikDoshaMythsVsReality /></Suspense>} />
        <Route path="/blog/marriage-muhurat-2026" element={<Suspense fallback={<PageLoading />}><MarriageMuhurat2026 /></Suspense>} />
        <Route path="/blog/how-to-sleep-as-per-vastu-in-2026" element={<Suspense fallback={<PageLoading />}><HowToSleepAsPerVastuIn2026 /></Suspense>} />
        <Route path="/blog/job-vs-business-what-your-chart-say" element={<Suspense fallback={<PageLoading />}><JobVsBusinessWhatYourChartSay /></Suspense>} />
        <Route path="/blog/is-ai-astrology-accurate" element={<Suspense fallback={<PageLoading />}><IsAiAstrologyAccurate /></Suspense>} />
        <Route path="/blog/ai-jyotish-vedic-astrology" element={<Suspense fallback={<PageLoading />}><AiJyotishVedicAstrology /></Suspense>} />
        <Route path="/blog/ai-astrologer-vs-human-astrologer" element={<Suspense fallback={<PageLoading />}><AiAstrologerVsHumanAstrologer /></Suspense>} />
        <Route path="/blog/ai-astrology-real-or-fake" element={<Suspense fallback={<PageLoading />}><AiAstrologyRealOrFake /></Suspense>} />
        <Route path="/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt" element={<Suspense fallback={<PageLoading />}><WhyChatGptFailsAtAiAstrology /></Suspense>} />
        <Route path="/blog/ai-astrology-prediction-for-2026" element={<Suspense fallback={<PageLoading />}><AiAstrologyPredictionFor2026 /></Suspense>} />
        <Route path="/blog/the-great-astrology-scam" element={<Suspense fallback={<PageLoading />}><TheGreatAstrologyScam /></Suspense>} />
        <Route path="/blog/vedika-ai-astrologer-india" element={<Suspense fallback={<PageLoading />}><VedikaAiAstrologerIndia /></Suspense>} />
        <Route path="/blog/free-ai-astrology-chat-india" element={<Suspense fallback={<PageLoading />}><FreeAiAstrologyChat /></Suspense>} />
        <Route path="/blog/fifa-world-cup-2026-winner-astrology-prediction" element={<Suspense fallback={<PageLoading />}><FifaWorldCup2026WinnerAstrologyPrediction /></Suspense>} />
        <Route path="/blog/numerology-guide" element={<Suspense fallback={<PageLoading />}><AiNumerologyGuide /></Suspense>} />
        <Route path="/ai-astrology" element={<Suspense fallback={<PageLoading />}><AiAstrology /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoading />}><Terms /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoading />}><Privacy /></Suspense>} />
        <Route path="/disclaimer" element={<Suspense fallback={<PageLoading />}><Disclaimer /></Suspense>} />
        <Route path="/refund" element={<Suspense fallback={<PageLoading />}><Refund /></Suspense>} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/welcome" element={protectedPage(<Welcome />)} />
        <Route path="/onboarding" element={protectedPage(<Onboarding />)} />
        <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
        <Route path="/daily-prediction" element={protectedPage(<DailyPrediction />)} />
        <Route path="/monthly-prediction" element={protectedPage(<MonthlyPrediction />)} />
        <Route path="/reports" element={protectedPage(<Reports />)} />
        <Route path="/deep-reports" element={protectedPage(<DeepReports />)} />
        <Route path="/pricing" element={protectedPage(<Pricing />)} />
        <Route path="/pricing/onboarding" element={<Suspense fallback={<PageLoading />}><PlanProvider><PricingOnboarding /></PlanProvider></Suspense>} />
        <Route path="/subscription/onboarding" element={<Suspense fallback={<PageLoading />}><PlanProvider><SubscriptionOnboarding /></PlanProvider></Suspense>} />
        <Route path="/chat" element={protectedPage(<Chat />)} />
        <Route path="/chart/:sessionId" element={protectedPage(<Chart />)} />
        <Route path="/dynamic/:id" element={protectedPage(<DynamicPage />)} />
        <Route path="/settings/language" element={protectedPage(<LanguageSettings />)} />
        <Route path="/profile" element={protectedPage(<Profile />)} />
        <Route path="/feedback" element={protectedPage(<Feedback />)} />
        <Route path="/compatibility" element={protectedPage(<Compatibility />)} />
        <Route path="/compatibility/result" element={protectedPage(<CompatibilityResult />)} />
        <Route path="/talk-to-astrologer" element={<Suspense fallback={<PageLoading />}><TalkToAstrologer /></Suspense>} />
        <Route path="/report/:reportId" element={protectedPage(<ReportPage />)} />
        
        {/* 301 Redirects */}
        <Route path="/ipl-2026-winner-prediction-astrology" element={<RedirectComponent to="/blog/ipl-2026-winner-prediction-astrology" />} />
        <Route path="/blogs/top-10-vedic-astrology-platform" element={<RedirectComponent to="/blog/top-10-vedic-astrology-platform" />} />
        <Route path="/blogs/vedic-astrology-ai-kese-kaam-karta-ha" element={<RedirectComponent to="/blog/vedic-astrology-ai-kese-kaam-karta-ha" />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
};

const App = () => {
  useEffect(() => {
    try {
      cleanupOldCache();
    } catch (e) {
      console.warn("Cleanup old cache failed on load:", e);
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CookieConsent />
          <Analytics />
          <I18nProvider>
            <BrowserRouter>
              <RouterShell />
            </BrowserRouter>
          </I18nProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
