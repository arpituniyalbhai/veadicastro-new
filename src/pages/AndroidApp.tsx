import { track } from "@vercel/analytics/react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Heart,
  MessageCircle,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=in.veadicastro.app&hl=en_IN";
const PLAY_STORE_LOGO_URL = "/google-play-mark.svg";

const getCampaignProperties = () => {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "direct",
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
  };
};

const AndroidApp = () => {
  const { setAuthOpen } = useAuth();

  const trackPlayStoreClick = (
    location: "hero" | "app-preview" | "final-cta",
  ) => {
    track("Android Play Store Click", {
      location,
      ...getCampaignProperties(),
    });
  };

  const trackWebClick = () => {
    track("Android Landing Continue Web", {
      location: "hero",
      ...getCampaignProperties(),
    });

    setAuthOpen(true);
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Veadicastro",
    operatingSystem: "Android",
    applicationCategory: "LifestyleApplication",
    description:
      "Personalized Vedic astrology insights and AI astrology guidance from Vedika.",
    installUrl: PLAY_STORE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#08070b] text-white">
      <SEO
        title="Veadicastro Android App"
        description="Download Veadicastro on Google Play for personalized Vedic astrology insights, predictions, and fast AI astrology guidance."
        url="https://veadicastro.in/android-app"
        image="/android-app-cosmic-hero.webp"
        schema={appSchema}
      />

      <main>
        <section className="relative isolate min-h-[760px] overflow-hidden lg:min-h-screen">
          <img
            src="/android-app-cosmic-hero.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-30 h-full w-full object-cover object-[64%_center] opacity-70 sm:object-center"
          />
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(8,7,11,0.99)_0%,rgba(8,7,11,0.94)_38%,rgba(8,7,11,0.40)_72%,rgba(8,7,11,0.58)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,7,11,0.15)_0%,rgba(8,7,11,0.05)_70%,#08070b_100%)]" />
          <div className="absolute left-[-8rem] top-40 -z-10 h-80 w-80 rounded-full bg-[#d9277a]/10 blur-[110px]" />

          <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
            <Link
              to="/"
              aria-label="Veadicastro home"
              className="inline-flex items-center gap-3"
            >
              <img
                src="/optimized/logo.webp"
                alt="Veadicastro"
                className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10"
              />
              <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
                Veadicastro
              </span>
            </Link>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/65 backdrop-blur-md sm:px-4 sm:text-sm">
              Now on Android
            </span>
          </header>

          <div className="mx-auto flex w-full max-w-7xl items-center px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:min-h-[calc(100vh-96px)] lg:px-10 lg:pb-28 lg:pt-8">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-[#d9277a]/30 bg-[#d9277a]/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#ff78b5] backdrop-blur-md sm:text-sm">
                Vedic guidance in your pocket
              </div>

              <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl lg:text-7xl">
                The World's Most Accurate
                <span className="block bg-gradient-to-r from-[#ff5ba5] via-[#d9277a] to-[#a44de4] bg-clip-text text-transparent">
                  AI Astrology Platform
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                Get personalized Vedic guidance for love, career, money,
                relationships, and your future—in English or Hindi.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3">
                <a
                  href={PLAY_STORE_URL}
                  onClick={() => trackPlayStoreClick("hero")}
                  className="group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#d9277a] to-[#a51f62] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_55px_rgba(217,39,122,0.38)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_65px_rgba(217,39,122,0.5)] focus:outline-none focus:ring-2 focus:ring-[#ff78b5] focus:ring-offset-2 focus:ring-offset-[#08070b] sm:gap-3 sm:px-6 sm:text-base"
                  aria-label="Download Veadicastro on Google Play"
                >
                  <img
                    src={PLAY_STORE_LOGO_URL}
                    alt="Google Play"
                    className="h-10 w-10 shrink-0 object-contain"
                  />
                  <span>Download on Google Play</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={trackWebClick}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/85 backdrop-blur-md transition duration-300 hover:border-[#d9277a]/45 hover:bg-[#d9277a]/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#d9277a] focus:ring-offset-2 focus:ring-offset-[#08070b] sm:px-6"
                >
                  Continue on Web
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-7 flex max-w-2xl flex-wrap gap-x-5 gap-y-3 text-sm text-white/65">
                {["1 free question", "Personalized predictions", "Fast AI astrology"].map(
                  (point) => (
                    <span key={point} className="inline-flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#d9277a]/15 text-[#ff78b5]">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      {point}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
          <div className="absolute inset-0 -z-20 bg-[#08070b]" />
          <div className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d9277a]/10 blur-[140px]" />

          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <div className="relative mx-auto w-full max-w-[330px]">
              <div className="absolute -inset-7 -z-10 rounded-[4rem] bg-gradient-to-b from-[#d9277a]/25 via-[#652044]/10 to-transparent blur-2xl" />
              <div className="relative rounded-[3.25rem] border border-white/15 bg-gradient-to-b from-[#29252d] to-[#0c0b0e] p-[9px] shadow-[0_45px_120px_rgba(0,0,0,0.72)]">
                <div className="absolute left-1/2 top-[17px] z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black shadow-sm" />
                <div className="overflow-hidden rounded-[2.72rem] bg-black">
                  <img
                    src="/android-app-chat-screen.png"
                    alt="Vedika AI chat inside the Veadicastro Android app"
                    className="block h-auto w-full"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-[13px] left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-white/70" />
              </div>
            </div>

            <div className="max-w-xl text-center lg:text-left">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff65aa]">
                Meet Vedika on Android
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-5xl">
                Your chart. Your questions. One intelligent conversation.
              </h2>
              <p className="mt-6 text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                Vedika uses your birth details and planetary chart to give
                guidance that feels personal—not like a generic horoscope.
              </p>

              <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <UserRound className="mb-3 h-5 w-5 text-[#ff65aa]" />
                  <p className="font-semibold text-white">Personal to you</p>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Answers grounded in your birth chart.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-[#ff65aa]" />
                  <p className="font-semibold text-white">Private and simple</p>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Ask naturally and get clear guidance fast.
                  </p>
                </div>
              </div>

              <a
                href={PLAY_STORE_URL}
                onClick={() => trackPlayStoreClick("app-preview")}
                className="group mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-[#110b0f] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffe8f3] focus:outline-none focus:ring-2 focus:ring-[#d9277a] focus:ring-offset-2 focus:ring-offset-[#08070b]"
              >
                <img
                  src={PLAY_STORE_LOGO_URL}
                  alt="Google Play"
                  className="h-9 w-9 shrink-0 object-contain"
                  loading="lazy"
                />
                Download on Google Play
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </section>

        <section className="relative border-y border-white/[0.07] bg-[#0b090e] px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff65aa]">
                Ask what is actually on your mind
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-5xl">
                Not another horoscope that could be for anyone.
              </h2>
              <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                Some days you want more than a lucky colour or a one-line
                prediction. You want to talk about the decision you are facing
                right now. That is where Vedika helps.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: BriefcaseBusiness,
                  label: "Career",
                  question: "Is this a good month for me to change my job?",
                  answer:
                    "Look at the timing around your career, responsibilities, and the opportunities opening up for you.",
                },
                {
                  icon: Heart,
                  label: "Relationships",
                  question: "Why do the same relationship patterns keep repeating?",
                  answer:
                    "Understand the emotions and patterns showing up in your chart without feeling judged or rushed.",
                },
                {
                  icon: WalletCards,
                  label: "Money",
                  question: "Where should I be more careful with money right now?",
                  answer:
                    "Get a clearer view of the period you are in before making an important financial decision.",
                },
              ].map(({ icon: Icon, label, question, answer }) => (
                <article
                  key={label}
                  className="group rounded-3xl border border-white/[0.09] bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d9277a]/35 hover:bg-[#d9277a]/[0.055] sm:p-7"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold text-[#ff70b0]">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9277a]/12">
                      <Icon className="h-5 w-5" />
                    </span>
                    {label}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold leading-8 text-white">
                    “{question}”
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/52">
                    {answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
          <div className="absolute right-[-12rem] top-10 -z-10 h-96 w-96 rounded-full bg-[#d9277a]/10 blur-[130px]" />
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-24">
              <div className="lg:sticky lg:top-20">
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff65aa]">
                  Simple from the first question
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-5xl">
                  Start with your details. Then just talk normally.
                </h2>
                <p className="mt-5 text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
                  You do not need to know astrology terms. If something is
                  worrying you, ask it in your own words—just as you would ask
                  someone you trust.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    number: "01",
                    title: "Add your birth details",
                    copy: "Enter your date, time, and place of birth so Vedika can read the right chart for you.",
                  },
                  {
                    number: "02",
                    title: "Ask the real question",
                    copy: "Career, love, money, family, timing, or a decision you cannot stop thinking about—say it naturally.",
                  },
                  {
                    number: "03",
                    title: "Read your personal guidance",
                    copy: "Get a clear answer based on your chart and current planetary period, with context you can understand.",
                  },
                ].map((step) => (
                  <article
                    key={step.number}
                    className="grid gap-4 rounded-3xl border border-white/[0.09] bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-6 sm:grid-cols-[72px_1fr] sm:p-7"
                  >
                    <span className="text-3xl font-black text-[#d9277a]/55">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/52 sm:text-base">
                        {step.copy}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-[#0b090e] px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff65aa]">
                Good to know
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-5xl">
                A few honest answers before you download.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {[
                {
                  question: "Can I try the app for free?",
                  answer:
                    "Yes. The app is free to download, and your first question is free so you can experience Vedika for yourself.",
                },
                {
                  question: "Do I need to understand astrology?",
                  answer:
                    "Not at all. Ask in English or Hindi using everyday words. Vedika handles the chart and astrology in the background.",
                },
                {
                  question: "Which birth details do I need?",
                  answer:
                    "Your date of birth, birth time, and birthplace help Vedika create guidance around your personal Vedic chart.",
                },
                {
                  question: "Can I still use Veadicastro on the web?",
                  answer:
                    "Yes. If you do not want to install the app right now, use the Continue on Web button at the top of this page.",
                },
              ].map((item) => (
                <article
                  key={item.question}
                  className="rounded-3xl border border-white/[0.09] bg-white/[0.035] p-6 sm:p-7"
                >
                  <MessageCircle className="h-5 w-5 text-[#ff65aa]" />
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/52">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-24 text-center sm:px-8 sm:py-32 lg:px-10">
          <div className="absolute left-1/2 top-1/2 -z-20 h-[32rem] w-[48rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d9277a]/10 blur-[150px]" />
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#d9277a]/25 bg-gradient-to-br from-[#d9277a]/14 via-white/[0.035] to-[#8f3dbe]/10 px-6 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.4)] sm:px-12 sm:py-16">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-5xl">
              Your next question may already be on your mind.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
              Take Vedika with you and ask whenever you need a little more
              clarity. Your first question is free.
            </p>
            <a
              href={PLAY_STORE_URL}
              onClick={() => trackPlayStoreClick("final-cta")}
              className="group mx-auto mt-8 flex min-h-16 w-full max-w-md items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#d9277a] to-[#a51f62] px-3 py-4 text-sm font-bold text-white shadow-[0_16px_55px_rgba(217,39,122,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_65px_rgba(217,39,122,0.5)] focus:outline-none focus:ring-2 focus:ring-[#ff78b5] focus:ring-offset-2 focus:ring-offset-[#08070b] sm:gap-3 sm:px-6 sm:text-base"
            >
              <img
                src={PLAY_STORE_LOGO_URL}
                alt="Google Play"
                className="h-10 w-10 shrink-0 object-contain"
                loading="lazy"
              />
              Download on Google Play
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <p className="mt-4 text-xs text-white/40">
              Available for Android on Google Play
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AndroidApp;
