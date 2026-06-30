import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Arpit Uniyal",
  "jobTitle": "Founder",
  "worksFor": {
    "@type": "Organization",
    "name": "Veadicastro",
    "url": "https://veadicastro.in"
  },
  "description": "Founder of Veadicastro. Building AI-powered Vedic astrology platform with authentic astrological knowledge passed down through 300 years of family tradition.",
  "url": "https://veadicastro.in/arpit-uniyal",
  "image": "https://veadicastro.in/founder.jpeg"
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Arpit Uniyal — Founder of Veadicastro",
  "description": "The story of why I built Veadicastro — an AI-powered Vedic astrology platform rooted in authentic astrological knowledge.",
  "url": "https://veadicastro.in/arpit-uniyal",
  "image": "https://veadicastro.in/founder.jpeg"
};

const sections = [
  {
    title: "Why I Built Veadicastro",
    content: (
      <>
        <p> Hey , I am Arpit Uniyal, founder of Veadicastro.</p>
        <p>Around seven months ago, I was watching Shark Tank India when I saw a startup pitching an AI astrology product. The idea stayed in my mind long after the episode ended.</p>
        <p>One question kept coming back to me: <strong>Why is nobody building a truly serious Vedic astrology platform powered by AI?</strong></p>
        <p>Most astrology apps I came across felt almost identical. Many offered generic predictions, copied content, or responses that did not feel personal or meaningful. Some platforms had started using AI, but they were missing something important — the depth, structure, and authenticity of real Vedic astrology.</p>
        <p>For me, astrology was never just another business opportunity.</p>
      </>
    )
  },
  {
    title: "300 Years of Astrology in My Blood",
    content: (
      <>
        <p>My family has been connected with astrology and spiritual practices for nearly 300 years. Since childhood, I grew up listening to conversations about kundlis, planetary positions, dashas, remedies, and Vedic principles. I saw people visit astrologers in our family for guidance during some of the most important moments of their lives.</p>
        <p>Astrology was always around me.</p>
        <p>One day, a simple thought came to my mind: <strong>What if traditional Vedic knowledge could work together with modern AI?</strong></p>
        <p>That idea eventually became Veadicastro.</p>
      </>
    )
  },
  {
    title: "The Beginning Was Not Easy",
    content: (
      <>
        <p>The beginning was not exciting. In fact, the first few months were incredibly difficult.</p>
        <p>There was almost no traffic. No team. No investors. No large marketing budget. Most of the time, I was building everything alone while trying to learn new skills every single day.</p>
        <p>There were many nights when I seriously questioned whether the idea would ever work.</p>
        <p>I spent countless hours learning about AI models, prompt engineering, Vedic astrology systems, SEO, website performance optimization, and user experience design. Sometimes I would spend hours fixing one problem only to discover three more waiting for me.</p>
        <p>But I kept going because I believed in one thing: <strong>If AI is transforming every industry, astrology should evolve too — but in the right way.</strong></p>
      </>
    )
  },
  {
    title: "The First Paid Order Changed Everything",
    content: (
      <>
        <p>Then one day, something happened. I received my first paid order.</p>
        <p>To many people, it might have looked like a small milestone. For me, it changed everything. For the first time, someone trusted the platform enough to pay for it. That moment proved that Veadicastro was not just an idea sitting in my head anymore. It was solving a real problem for real people.</p>
        <p>From that day onward, I started treating Veadicastro with complete seriousness.</p>
      </>
    )
  },
  {
    title: "SEO Was My Only Marketing Budget",
    content: (
      <>
        <p>Since I had almost no money for large marketing campaigns, I focused heavily on SEO.</p>
        <p>I spent months writing content, improving website speed, fixing technical SEO issues, building topic clusters, and understanding what users were actually searching for on Google.</p>
        <p>Slowly, things started changing. Traffic started growing. Users started returning. People started recommending the platform to others.</p>
        <p>Within just a few months of focused SEO efforts, Veadicastro crossed more than <strong>3 million Google impressions</strong>. For a completely bootstrapped platform built by a young founder from Uttarakhand, it felt unreal.</p>
        <p>Today, thousands of users have interacted with Veadicastro. But honestly, I still feel like we are only getting started.</p>
      </>
    )
  },
  {
    title: "What Nobody Tells You About Building a Startup",
    content: (
      <>
        <p>One lesson I learned during this journey is that startups are very different from how they appear on social media. Building a company is not always exciting.</p>
        <p>There are stressful days. Technical failures. Ranking drops. Payment issues. Server problems. Unexpected bugs. And moments when you feel completely lost.</p>
        <p>There were days when website traffic dropped because of a single performance issue. There were days when search rankings disappeared after algorithm updates. There were days with almost no sales at all.</p>
        <p>Every challenge taught me something valuable. Instead of quitting, I focused on improving the product. That mindset helped Veadicastro move forward.</p>
      </>
    )
  },
  {
    title: "AI Should Not Replace Tradition — It Should Strengthen It",
    content: (
      <>
        <p>I strongly believe that AI should not replace traditional knowledge. It should strengthen it.</p>
        <p>That idea sits at the heart of everything we build at Veadicastro. Technology helps us make astrology faster, easier to access, and easier to understand, but the foundation must always remain rooted in authentic Vedic principles.</p>
        <p>That balance matters deeply to me.</p>
      </>
    )
  },
  {
    title: "My Vision for the Future",
    content: (
      <>
        <p>As a founder, I am still learning every single day. I do not claim to know everything. But I genuinely care about building something useful, honest, and long term.</p>
        <p>My vision is simple. I want to create a platform where ancient Vedic wisdom and modern artificial intelligence work together in a meaningful way. Not fake predictions. Not random generated text. Not astrology designed only for clicks and entertainment.</p>
        <p>But a smarter, more reliable, and more trustworthy astrology experience for people around the world.</p>
        <p>That is why I built <Link to="/" className="text-pink-400 hover:text-pink-300 underline">Veadicastro</Link>.</p>
        <p>And honestly, I believe this journey is only just beginning.</p>
      </>
    )
  }
];

const ArpitUniyal = () => {
  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      <SEO
        title="Arpit Uniyal — Founder of Veadicastro"
        description="The story of why I built Veadicastro — an AI-powered Vedic astrology platform rooted in 300 years of authentic astrological knowledge. Written by founder Arpit Uniyal."
        keywords={["Arpit Uniyal", "founder veadicastro", "veadicastro founder story", "AI astrology founder", "vedic astrology platform"]}
        image="/founder.jpeg"
        url="https://veadicastro.in/arpit-uniyal"
        schema={[personSchema, websiteSchema]}
      />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-pink-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
            <Sparkles className="h-3.5 w-3.5" />
            Founder Story
          </div>

          <div className="mb-8">
            <img
              src="/founder.jpeg"
              alt="Arpit Uniyal — Founder of Veadicastro"
              className="mx-auto w-40 h-40 rounded-full object-cover border-4 border-pink-500/30 shadow-xl shadow-pink-500/10"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            Arpit Uniyal
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Entrepreneur, Founder of Veadicastro — Building the future of AI-powered Vedic astrology
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a href="https://in.linkedin.com/in/veadicarpit" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              LinkedIn
            </a>
            <a href="https://x.com/arpituniyal14" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              X
            </a>
            <a href="https://www.producthunt.com/@arpituniyal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Product Hunt
            </a>
            <a href="https://medium.com/@ayushsharmabuis" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Medium
            </a>
            <a href="https://dev.to/vedicarpit" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Dev.to
            </a>
            <a href="https://www.indiehackers.com/arituniyal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Indie Hackers
            </a>
            <a href="https://www.crunchbase.com/person/arpit-uniyal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Crunchbase
            </a>
            <a href="https://www.wikidata.org/wiki/Q140183843" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Wikidata
            </a>
            <a href="https://www.connectively.us/p/arpit-uniyal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Connectively
            </a>
            <a href="https://peerlist.io/ayushsharmabuis" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-pink-300 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all">
              Peerlist
            </a>
          </div>
        </div>

        {/* Story Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                {section.title}
              </h2>
              <div className="space-y-4 text-base leading-7 text-white/75">
                {section.content}
              </div>
              {index < sections.length - 1 && (
                <div className="mt-8 border-t border-white/5" />
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <h3 className="text-xl font-bold text-white mb-3">
            Try Veadicastro — Built with Authentic Vedic Wisdom
          </h3>
          <p className="text-white/60 mb-6 max-w-lg mx-auto">
            Experience AI-powered astrology that respects tradition. Get your personalized horoscope now.
          </p>
          <Link
            to="/#hero"
            className="inline-flex items-center gap-2 rounded-2xl btn-pink px-8 py-4 text-base font-black text-white"
          >
            <Sparkles className="h-5 w-5" />
            Get Your Free Horoscope
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArpitUniyal;
