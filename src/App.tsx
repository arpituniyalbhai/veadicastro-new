import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";
import { PlanProvider } from "@/context/PlanContext";
import AuthModal from "@/components/AuthModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import RedirectComponent from "@/components/RedirectComponent";
import { PageLoading } from "@/components/PageLoading";

// Lazy load heavy components to reduce initial bundle size
const Welcome = lazy(() => import("@/pages/Welcome"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Instruction = lazy(() => import("@/pages/Instruction"));
const Reports = lazy(() => import("@/pages/Reports"));
const ReportPage = lazy(() => import("@/pages/ReportDetail"));
const LanguageSettings = lazy(() => import("@/pages/LanguageSettings"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const PricingOnboarding = lazy(() => import("@/pages/PricingOnboarding"));
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
const AstrologerBooking = lazy(() => import("@/pages/AstrologerBooking"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));

// Lazy load blog components
const RahuKetuTransit2026 = lazy(() => import("../blogs/Rahu-Ketu-Transit-2026-Predictions-for-All-12-Rashis"));
const VedAstrologyAIKaiseKaamKartaHai = lazy(() => import("../blogs/vedic-astrology-ai-kese-kaam-karta-ha"));
const Top10VedicAstrologyPlatform = lazy(() => import("../blogs/top-10-vedic-astrology-platform"));
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

// Lazy load tool pages
const FreeAiAstrologerChat = lazy(() => import("@/pages/free-ai-astrologer-chat"));
const FreeKundliGenerator = lazy(() => import("@/pages/FreeKundliGenerator"));
const KundaliMatching = lazy(() => import("@/pages/KundaliMatching"));
const Chart = lazy(() => import("@/pages/Chart"));
const AngelNumberCalculator = lazy(() => import("@/pages/AngelNumberCalculator"));
const LuckyColourForToday = lazy(() => import("@/pages/lucky-colour-for-today"));

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
    "/pricing",
    "/settings/language",
    "/profile",
    "/chat",
    "/compatibility",
    "/compatibility/result",
  ];
  
  const hideFooter =
    dashboardPaths.some((base) => p === base || p.startsWith(base + "/")) ||
    p.startsWith("/report/") ||
    p === "/welcome" ||
    p === "/onboarding" ||
    p === "/about" ||
    p === "/how-it-works" ||
    p === "/blog" ||
    p.startsWith("/blog/");
  return (
    <>
      <AuthModal />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/free-ai-astrologer-chat" element={<Suspense fallback={<PageLoading />}><FreeAiAstrologerChat /></Suspense>} />
        <Route path="/free-kundli-generator" element={<Suspense fallback={<PageLoading />}><FreeKundliGenerator /></Suspense>} />
        <Route path="/angel-number-calculator" element={<Suspense fallback={<PageLoading />}><AngelNumberCalculator /></Suspense>} />
        <Route path="/lucky-colour-for-today" element={<Suspense fallback={<PageLoading />}><LuckyColourForToday /></Suspense>} />
        <Route path="/kundali-matching" element={<Suspense fallback={<PageLoading />}><KundaliMatching /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoading />}><About /></Suspense>} />
        <Route path="/about-founder" element={<Suspense fallback={<PageLoading />}><AboutFounder /></Suspense>} />
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
        <Route path="/terms" element={<Suspense fallback={<PageLoading />}><Terms /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoading />}><Privacy /></Suspense>} />
        <Route path="/disclaimer" element={<Suspense fallback={<PageLoading />}><Disclaimer /></Suspense>} />
        <Route path="/refund" element={<Suspense fallback={<PageLoading />}><Refund /></Suspense>} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/welcome" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Welcome /></Suspense></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Onboarding /></Suspense></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Dashboard /></Suspense></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Reports /></Suspense></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Pricing /></Suspense></ProtectedRoute>} />
        <Route path="/pricing/onboarding" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><PricingOnboarding /></Suspense></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Chat /></Suspense></ProtectedRoute>} />
        <Route path="/chart/:sessionId" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Chart /></Suspense></ProtectedRoute>} />
        <Route path="/dynamic/:id" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><DynamicPage /></Suspense></ProtectedRoute>} />
        <Route path="/settings/language" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><LanguageSettings /></Suspense></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Profile /></Suspense></ProtectedRoute>} />
        <Route path="/compatibility" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><Compatibility /></Suspense></ProtectedRoute>} />
        <Route path="/compatibility/result" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><CompatibilityResult /></Suspense></ProtectedRoute>} />
        <Route path="/talk-to-astrologer" element={<Suspense fallback={<PageLoading />}><TalkToAstrologer /></Suspense>} />
        <Route path="/report/:reportId" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><ReportPage /></Suspense></ProtectedRoute>} />
        <Route path="/astrologer-booking/:astrologerId" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><AstrologerBooking /></Suspense></ProtectedRoute>} />
        
        {/* 301 Redirects */}
        <Route path="/ipl-2026-winner-prediction-astrology" element={<RedirectComponent to="/blog/ipl-2026-winner-prediction-astrology" />} />
        <Route path="/blogs/top-10-vedic-astrology-platform" element={<RedirectComponent to="/blog/top-10-vedic-astrology-platform" />} />
        <Route path="/blogs/vedic-astrology-ai-kese-kaam-karta-ha" element={<RedirectComponent to="/blog/vedic-astrology-ai-kese-kaam-karta-ha" />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
      {console.log('App.tsx - hideFooter:', hideFooter, 'pathname:', location.pathname)}
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <I18nProvider>
            <BrowserRouter>
              <PlanProvider>
                <RouterShell />
              </PlanProvider>
            </BrowserRouter>
          </I18nProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;