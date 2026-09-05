import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Heart,
  Languages,
  MessageCircle,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/context/AuthContext";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.veadicastro.app&hl=en_IN";
type CtaLocation =
  | "header"
  | "hero"
  | "questions"
  | "how-it-works"
  | "faq"
  | "final-cta"
  | "mobile-sticky";
const focusStyle = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff78b5] focus-visible:ring-offset-4 focus-visible:ring-offset-[#08070b]";

const questions = [
  { icon: BriefcaseBusiness, label: "Career & growth", question: "Is this a good time to change my job?", copy: "Explore career timing, new opportunities, and the strengths in your birth chart." },
  { icon: Heart, label: "Love & relationships", question: "What does my chart say about marriage?", copy: "Understand relationship patterns, compatibility, and the timing of meaningful connections." },
  { icon: Sparkles, label: "Your next chapter", question: "Which area of my life needs attention now?", copy: "Explore your current planetary period and what it may mean for your personal growth." },
];
const faqs = [
  { question: "Is Veadicastro free to try?", answer: "Yes. The Android app is free to download, and new users can ask their first question for free. Additional questions and premium features may require a purchase." },
  { question: "What do I need to get started?", answer: "Create your account and add your date, time, and place of birth. Vedika uses these details to provide guidance based on your personal Vedic birth chart. Then ask your question in everyday words." },
  { question: "Can I ask questions in Hindi?", answer: "Yes. You can chat with Vedika in English or Hindi. You do not need to know astrology terms to ask a question or understand your reading." },
  { question: "How is this different from a daily horoscope?", answer: "Vedika uses your birth details, personal chart, and planetary periods to respond to the question you ask. Your conversation can focus on your own situation, from career and relationships to personal growth." },
  { question: "Can I use it without an Android phone?", answer: "Yes. You can sign up and use Veadicastro in your browser, including on a computer or iPhone. No app installation is needed to start on the web." },
];

const getCampaignProperties = () => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "direct",
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
  };
};
const trackAction = (event: string, location: CtaLocation) => {
  // Analytics must never interrupt the signup or download action.
  try {
    track(event, { location, ...getCampaignProperties() });
  } catch {
    // Navigation remains available when analytics is blocked or unavailable.
  }
};
const PlayStoreButton = ({ location, compact = false }: { location: CtaLocation; compact?: boolean }) => (
  <a href={PLAY_STORE_URL} onClick={() => trackAction("Android Play Store Click", location)} aria-label="Download Veadicastro on Google Play"
    className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#d9277a] to-[#a51f62] font-bold text-white shadow-[0_12px_40px_rgba(217,39,122,0.25)] transition hover:brightness-110 motion-safe:hover:-translate-y-0.5 ${focusStyle} ${compact ? "px-4 py-3 text-sm" : "w-full px-6 py-3.5 text-sm sm:w-auto sm:text-base"}`}>
    <img src="/google-play-mark.svg" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
    <span>{compact ? "Get the app" : "Get it on Google Play"}</span>
    {!compact && <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform motion-safe:group-hover:translate-x-1" />}
  </a>
);

const AndroidApp = () => {
  const { user, authOpen, setAuthOpen } = useAuth();
  const navigate = useNavigate();
  const heroActionsRef = useRef<HTMLDivElement>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);

  useEffect(() => {
    const target = heroActionsRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowMobileActions(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const continueOnWeb = (location: CtaLocation) => {
    trackAction("Android Landing Continue Web", location);
    if (user) {
      navigate("/chat");
    } else {
      setAuthOpen(true);
    }
  };
  const webButton = (location: CtaLocation) => (
    <button type="button" onClick={() => continueOnWeb(location)} className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.045] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#ff78b5]/60 hover:bg-[#d9277a]/10 sm:w-auto ${focusStyle}`}>
      {user ? "Continue to chat" : "Sign up & try free"}<ArrowRight aria-hidden="true" className="h-4 w-4" />
    </button>
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-[#08070b] text-white selection:bg-[#d9277a]/40">
      <SEO title="Veadicastro Android App | Ask Your First Question Free"
        description="Get personalized Vedic astrology guidance from Vedika in English or Hindi. Download the Android app on Google Play or sign up on the web. Your first question is free."
        url="https://veadicastro.in/android-app" image="/android-app-cosmic-hero.webp"
        schema={{ "@context": "https://schema.org", "@type": "MobileApplication", name: "Veadicastro", operatingSystem: "Android", applicationCategory: "LifestyleApplication", description: "Personalized Vedic astrology insights and AI astrology guidance from Vedika.", installUrl: PLAY_STORE_URL, offers: { "@type": "Offer", price: "0", priceCurrency: "INR" } }} />
      <a href="#main-content" className={`sr-only z-50 rounded-lg bg-[#08070b] p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focusStyle}`}>Skip to content</a>
      <div className="relative isolate">
        <img src="/android-app-cosmic-hero.webp" alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-30 h-[900px] w-full object-cover object-[65%_center] opacity-60" />
        <div className="absolute inset-x-0 top-0 -z-20 h-[900px] bg-[linear-gradient(90deg,rgba(8,7,11,0.98)_0%,rgba(8,7,11,0.86)_40%,rgba(8,7,11,0.48)_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[900px] bg-gradient-to-b from-transparent via-transparent to-[#08070b]" />
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <Link to="/" aria-label="Veadicastro home" className={`inline-flex items-center gap-2.5 rounded-xl ${focusStyle}`}>
            <img src="/optimized/logo.webp" alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
            <span className="text-base font-semibold tracking-tight sm:text-lg">Veadicastro</span>
          </Link>
          <nav aria-label="Page navigation" className="flex items-center gap-7">
            <a href="#how-it-works" className={`hidden rounded text-sm text-white/70 hover:text-white md:inline ${focusStyle}`}>How it works</a>
            <a href="#faq" className={`hidden rounded text-sm text-white/70 hover:text-white md:inline ${focusStyle}`}>FAQs</a>
            <button type="button" onClick={() => continueOnWeb("header")} className={`min-h-11 rounded-full border border-white/15 px-4 text-sm font-semibold transition hover:bg-white/10 ${focusStyle}`}>{user ? "Open chat" : "Sign up / Log in"}</button>
          </nav>
        </header>
        <main id="main-content" tabIndex={-1} className="outline-none">
          <section aria-labelledby="hero-heading" className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:px-10 lg:pb-20 lg:pt-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d9277a]/30 bg-[#d9277a]/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-[#ff8cbe]"><Smartphone aria-hidden="true" className="h-4 w-4 shrink-0" />YOUR VEDIC AI GUIDE, NOW ON ANDROID</span>
              <h1 id="hero-heading" className="mt-6 max-w-2xl text-balance text-[2.65rem] font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem]">Big life questions.<span className="mt-1 block bg-gradient-to-r from-[#ff5ba5] via-[#e34591] to-[#b777ea] bg-clip-text text-transparent">Guidance personal to you.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">Meet Vedika, your AI astrology guide. Explore love, career, and your next chapter with answers based on your Vedic birth chart—in English or Hindi.</p>
              <div ref={heroActionsRef} className="mt-8">
                <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#ff8cbe]"><Sparkles aria-hidden="true" className="h-4 w-4" />Your first question is free</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"><PlayStoreButton location="hero" />{webButton("hero")}</div>
                <p className="mt-3 text-xs leading-5 text-white/60">Free to download. Prefer your browser? Sign up and start on the web.</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/75 sm:text-sm">
                {["Based on your birth chart", "English & Hindi", "Ask in your own words"].map((point) => <span key={point} className="inline-flex items-center gap-1.5"><Check aria-hidden="true" className="h-4 w-4 text-[#ff78b5]" />{point}</span>)}
              </div>
            </div>
            <figure className="relative mx-auto w-full max-w-[280px] lg:max-w-[300px]">
              <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-full bg-[#d9277a]/20 blur-[70px]" />
              <div className="overflow-hidden rounded-[2.6rem] border border-white/20 bg-[#18121b] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
                <img src="/android-app-chat-screen.png" alt="A conversation with Vedika in the Veadicastro Android app, with a personalized birth chart reading and follow-up questions" width={425} height={945} className="block h-auto w-full rounded-[2.1rem]" />
              </div>
              <figcaption className="mt-4 text-center text-xs leading-5 text-white/60">Inside the app · Example conversation<br />Question balance shown is for illustration.</figcaption>
            </figure>
          </section>
          <section aria-label="What you get with Vedika" className="border-y border-white/[0.08] bg-[#0b090e]/90 px-5 py-7 sm:px-8">
            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3 sm:gap-8">
              {[
                { icon: UserRound, title: "Your chart at the centre", copy: "Guidance shaped by your birth details." },
                { icon: MessageCircle, title: "A conversation, made simple", copy: "Ask what matters to you in everyday words." },
                { icon: Languages, title: "In the language you prefer", copy: "Chat comfortably in English or Hindi." },
              ].map(({ icon: Icon, title, copy }) => <div key={title} className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d9277a]/10"><Icon aria-hidden="true" className="h-5 w-5 text-[#ff78b5]" /></span><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-white/60">{copy}</p></div></div>)}
            </div>
          </section>
          <section aria-labelledby="questions-heading" className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff78b5]">Start with what matters to you</p><h2 id="questions-heading" className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">What’s on your mind today?</h2><p className="mt-4 text-base leading-7 text-white/65">Bring your question. Vedika helps you explore it through your personal Vedic chart.</p></div>
              <div className="mt-9 grid gap-4 md:grid-cols-3">
                {questions.map(({ icon: Icon, label, question, copy }) => <article key={label} className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-7">
                  <div className="flex items-center gap-3 text-sm font-semibold text-[#ff8cbe]"><Icon aria-hidden="true" className="h-5 w-5" />{label}</div>
                  <h3 className="mt-5 text-xl font-semibold leading-8">“{question}”</h3><p className="mb-5 mt-3 text-sm leading-7 text-white/65">{copy}</p>
                  <button type="button" onClick={() => continueOnWeb("questions")} className={`mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-sm font-semibold text-[#ff8cbe] hover:text-white ${focusStyle}`}>{user ? "Explore in chat" : "Start your free conversation"}<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
                </article>)}
              </div>
            </div>
          </section>
          <section id="how-it-works" aria-labelledby="steps-heading" className="scroll-mt-6 border-y border-white/[0.07] bg-[#0b090e] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff78b5]">From curious to your first conversation</p><h2 id="steps-heading" className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Your first reading starts here.</h2><p className="mt-5 text-base leading-7 text-white/65">No astrology knowledge needed. Just your birth details and a question you want to explore.</p>
                <div className="mt-7"><PlayStoreButton location="how-it-works" /></div>
                <button type="button" onClick={() => continueOnWeb("how-it-works")} className={`mt-3 min-h-11 rounded-lg text-sm font-semibold text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white ${focusStyle}`}>{user ? "Continue to chat on the web" : "Or sign up free on the web"}</button>
              </div>
              <ol className="space-y-4">
                {[
                  { title: "Get the app & create your account", copy: "Download Veadicastro from Google Play, or sign up in your browser." },
                  { title: "Add your birth details", copy: "Enter your date, time, and place of birth to build your personal Vedic chart." },
                  { title: "Ask your first question for free", copy: "Chat with Vedika in English or Hindi and explore the guidance in your chart." },
                ].map((step, index) => <li key={step.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"><span aria-hidden="true" className="text-2xl font-bold text-[#ff78b5]/70">0{index + 1}</span><div><h3 className="text-base font-semibold sm:text-lg">{step.title}</h3><p className="mt-2 text-sm leading-7 text-white/65">{step.copy}</p></div></li>)}
              </ol>
            </div>
          </section>
          <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-6 px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-3xl">
              <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff78b5]">Good to know</p><h2 id="faq-heading" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">A few answers before you start.</h2></div>
              <Accordion type="single" collapsible defaultValue="faq-0" className="mt-9">
                {faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`} className="border-white/10"><AccordionTrigger className={`gap-4 rounded-lg py-5 text-left text-base font-semibold hover:text-[#ff8cbe] hover:no-underline ${focusStyle}`}>{faq.question}</AccordionTrigger><AccordionContent className="pr-6 text-sm leading-7 text-white/65">{faq.answer}</AccordionContent></AccordionItem>)}
              </Accordion>
              <div className="mt-7 text-center"><button type="button" onClick={() => continueOnWeb("faq")} className={`min-h-11 rounded-lg text-sm font-semibold text-[#ff8cbe] underline underline-offset-4 hover:text-white ${focusStyle}`}>{user ? "Ready to continue? Open your chat" : "Want to try before installing? Start free on the web"}</button></div>
            </div>
          </section>
          <section aria-labelledby="final-heading" className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
            <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#d9277a]/30 bg-gradient-to-br from-[#d9277a]/[0.16] via-white/[0.035] to-[#8f3dbe]/10 px-6 py-12 text-center sm:px-12 sm:py-16">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#d9277a]/15"><Sparkles aria-hidden="true" className="h-6 w-6 text-[#ff78b5]" /></span>
              <h2 id="final-heading" className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">One question is all it takes to begin.</h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">Explore what your chart has to say. Get Veadicastro on Android or start in your browser—your first question is free.</p>
              <div className="mx-auto mt-8 flex max-w-xl flex-col justify-center gap-3 sm:flex-row sm:flex-wrap"><PlayStoreButton location="final-cta" />{webButton("final-cta")}</div>
              <p className="mt-5 text-xs leading-5 text-white/60">Free first question for new users. Additional usage may require a purchase.</p>
            </div>
          </section>
        </main>
      </div>
      <footer className="border-t border-white/10 px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-7 text-sm text-white/60 sm:px-8 lg:px-10 lg:pb-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row"><Link to="/" className={`rounded font-semibold text-white/80 ${focusStyle}`}>Veadicastro</Link><p className="text-center text-xs">Personalized Vedic astrology, wherever you are.</p><nav aria-label="Legal" className="flex gap-6"><Link to="/privacy" className={`rounded hover:text-white ${focusStyle}`}>Privacy</Link><Link to="/terms" className={`rounded hover:text-white ${focusStyle}`}>Terms</Link></nav></div>
      </footer>
      {showMobileActions && !authOpen && (
        <aside
          aria-label="Get started with Veadicastro"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-[#0b090e]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-lg items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => continueOnWeb("mobile-sticky")}
              className={`min-h-12 flex-1 rounded-full border border-white/20 px-3 text-sm font-semibold hover:bg-white/10 ${focusStyle}`}
            >
              {user ? "Open chat" : "Try free on web"}
            </button>
            <PlayStoreButton location="mobile-sticky" compact />
          </div>
        </aside>
      )}
    </div>
  );
};
export default AndroidApp;
