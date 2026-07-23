import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Star, Award, Users, Shield, ChevronRight } from "lucide-react";
import SEO, { generateFAQSchema } from "@/components/SEO";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Acharya Aman Uniyal Ji",
  "jobTitle": "Vedic Astrologer",
  "description": "Best astrologer in Dehradun with 10-generation lineage from Pauri Garhwal. Gold medalist in Vedic Astrology with 10+ years of experience.",
  "url": "https://veadicastro.in/best-astrologer-in-dehradun",
  "image": "https://veadicastro.in/amanuniyalastrologe.webp",
  "birthPlace": {
    "@type": "Place",
    "name": "Pauri Garhwal, Uttarakhand"
  },
  "knowsAbout": ["Vedic Astrology", "Parashari Jyotish", "Jaimini Sutras", "Shadbala", "Vastu Shastra"],
  "sameAs": [
    "https://veadicastro.in/talk-to-astrologer"
  ]
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Best Astrologer in Dehradun: Why Acharya Aman Uniyal Ji Is the Most Trusted Name in Vedic Astrology",
  "description": "Discover why Acharya Aman Uniyal Ji is the best astrologer in Dehradun. 10-generation lineage from Pauri Garhwal, gold medalist in Vedic Astrology, 10+ years experience.",
  "author": {
    "@type": "Person",
    "name": "Veadicastro Team"
  },
  "datePublished": "2026-07-23",
  "dateModified": "2026-07-23",
  "image": "https://veadicastro.in/amanuniyalastrologe.webp"
};

const consultationServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Vedic Astrology Consultation",
  "description": "Best astrologer in Dehradun — personal consultation for career, marriage, business and life guidance.",
  "provider": {
    "@type": "Person",
    "name": "Acharya Aman Uniyal Ji"
  },
  "offers": {
    "@type": "Offer",
    "price": "499",
    "priceCurrency": "INR",
    "priceValidUntil": "2027-12-31",
    "availability": "https://schema.org/InStock"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veadicastro.in" },
    { "@type": "ListItem", "position": 2, "name": "Best Astrologer in Dehradun", "item": "https://veadicastro.in/best-astrologer-in-dehradun" }
  ]
};

const faqs = [
  { q: "Who is the best astrologer in Dehradun?", a: "Acharya Aman Uniyal Ji is widely regarded as one of the best astrologers in Dehradun due to his 10-generation family legacy from Pauri Garhwal, his status as a academic Gold Medalist, and his 10 years of practical consultation experience." },
  { q: "Who is the best astrologer in Uttarakhand?", a: "Because of his ancestral roots in Pauri Garhwal, rigorous academic achievements, and mastery over Vedic astrology at a young age, Acharya Aman Uniyal Ji is recognized as a leading astrological authority across the entire state of Uttarakhand." },
  { q: "How many years of experience does Acharya Aman Uniyal Ji have?", a: "Although he is 25 years old, Acharya Aman Uniyal Ji began studying and reading horoscopes at the age of 10. He has over 10 years of active experience in Vedic astrology and horoscope analysis." },
  { q: "What makes Acharya Aman Uniyal Ji different from other astrologers?", a: "Unlike practitioners who rely on fear-based predictions, Acharya Ji offers scientific, non-fear-based guidance. He combines 10 generations of inherited Himalayan wisdom with gold-medalist academic training, providing affordable, practical remedies without selling unnecessary fear." },
  { q: "Does Acharya Ji offer online consultations for clients outside Dehradun?", a: "Yes, Acharya Aman Uniyal Ji provides online consultation services via direct calls and video sessions for clients living outside Dehradun, across India, and globally." },
  { q: "What details are required for an accurate horoscope reading?", a: "For an accurate Janam Kundli reading, you need to provide your exact Date of Birth, Time of Birth, and Place of Birth." },
  { q: "What if I do not know my exact time of birth?", a: "If you do not have your exact birth time, Acharya Aman Uniyal Ji uses Prashna Kundli (Horary Astrology) or Palmistry techniques to analyze your current situation and answer specific life questions accurately." },
  { q: "What types of remedies does Acharya Aman Uniyal Ji suggest?", a: "He focuses on simple, effective, and authentic remedies such as mantra chanting, specific daily habits, self-discipline, Vedic charity (Dana), and authentic gemstones selected through scientific planetary strength calculations." },
  { q: "Can astrology help in choosing the right career path or business startup?", a: "Yes. By analyzing the 10th house, 5th house, and 11th house in your birth chart along with current Mahadasha cycles, Acharya Ji can guide you toward fields where you have the highest probability of financial growth and personal satisfaction." },
  { q: "How does Kundli Matching work for marriage consultations?", a: "Acharya Ji looks beyond basic Gun Milan points. He analyzes the 7th house, Venus, Jupiter, and potential doshas in both charts to assess long-term emotional compatibility, family stability, and overall relationship longevity." },
  { q: "How can I book an appointment with Acharya Aman Uniyal Ji in Dehradun?", a: "Appointments can be booked directly through his official consultation desk, website, or direct phone call/WhatsApp inquiry for both personal office visits in Dehradun and virtual consultations." },
  { q: "Are the consultation remedies expensive or difficult to perform?", a: "No. Acharya Ji believes true Vedic remedies should be accessible to everyone. He avoids advocating unnecessarily expensive rituals or overpriced items, prioritizing personal devotion, daily routine adjustments, and simple spiritual practices instead." }
];

const services = [
  {
    title: "Comprehensive Life Blueprint",
    focus: "Wealth, health, personal growth, and major life timing",
    tools: "D1 Rashi, D9 Navamsha, Vimshottari Dasha"
  },
  {
    title: "Career & Business Strategy",
    focus: "Startup launches, job switches, financial investments, and scaling",
    tools: "D10 Dashamsha, 10th House Lords, Shadbala"
  },
  {
    title: "Relationship & Marriage",
    focus: "Compatibility, marital harmony, and resolving conflict patterns",
    tools: "D9 Chart, Venus/Jupiter Alignment, Dosha Bhanga"
  },
  {
    title: "Remedial Energy Balancing",
    focus: "Overcoming persistent life hurdles and structural obstacles",
    tools: "Gemstone Mechanics, Vedic Mantras, Dana Practices"
  },
  {
    title: "Vastu Shastra Consultation",
    focus: "Domestic and commercial space energy balancing",
    tools: "Spatial Directions, Pancha Bhoota Balancing"
  }
];

const BestAstrologerInDehradun = () => {
  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      <SEO
        title="Best Astrologer in Dehradun | Acharya Aman Uniyal Ji"
        description="Best astrologer in Dehradun — Acharya Aman Uniyal Ji. 10-generation lineage from Pauri Garhwal, gold medalist in Vedic Astrology, 10+ years experience. Book consultation for career, marriage & life guidance."
        keywords={["best astrologer in dehradun", "acharya aman uniyal ji", "astrologer dehradun", "vedic astrology dehradun", "astrologer in dehradun", "top astrologer dehradun", "astrologer uttarakhand", "best astrologer in uttarakhand"]}
        image="/amanuniyalastrologe.webp"
        url="https://veadicastro.in/best-astrologer-in-dehradun"
        schema={[personSchema, articleSchema, consultationServiceSchema, breadcrumbSchema, generateFAQSchema(faqs)]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-pink-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            <Star className="h-3.5 w-3.5" />
            Best Astrologer in Dehradun
          </div>

          <div className="mb-8">
            <img
              src="/amanuniyalastrologe.webp"
              alt="Acharya Aman Uniyal Ji — Best Astrologer in Dehradun"
              className="mx-auto w-44 h-44 rounded-full object-cover border-4 border-amber-500/30 shadow-xl shadow-amber-500/10"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            Best Astrologer in Dehradun
          </h1>
          <p className="text-xl text-amber-300/80 font-semibold mb-3">
            Acharya Aman Uniyal Ji
          </p>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            10-Generation Lineage from Pauri Garhwal | Gold Medalist in Vedic Astrology | 10+ Years of Experience
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6 mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 border border-green-400/30 px-4 py-2 text-sm font-semibold text-green-200">
              499 Rupee
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-2 text-sm font-semibold text-blue-200">
              Full Refund if not satisfied
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-400/30 px-4 py-2 text-sm font-semibold text-purple-200">
              Unlimited calling
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link
              to="/talk-to-astrologer"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-400/30 px-10 py-5 text-lg font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
            >
              Book Consultation
            </Link>
          </div>
        </div>

        {/* Introduction */}
        <section aria-label="Introduction" className="mb-20">
          <p className="text-base leading-7 text-white/75 mb-4">
            Nestled in the lush foothills of the Himalayas, Dehradun has long been a sanctuary for spiritual seekers, scholars, and those looking for clarity in a complex world. When life presents crucial crossroads — whether in career, business, relationships, or health — turning to authentic Vedic guidance can make all the difference.
          </p>
          <div className="mb-6">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0u2lfuXe3j5FmalxIZsKklqxYSJEbIWywsvFrm6BDxA&s=10"
              alt="Dehradun City"
              className="w-full h-64 object-cover rounded-xl border border-white/10"
            />
          </div>
          <p className="text-base leading-7 text-white/75 mb-4">
            If you are searching for the <strong className="text-white">best astrologer in Dehradun</strong>, one name stands out for his remarkable combination of generational heritage, academic mastery, and uncanny analytical accuracy: <strong className="text-white">Acharya Aman Uniyal Ji</strong>.
          </p>
          <p className="text-base leading-7 text-white/75">
            At just 25 years old, Acharya Aman Uniyal Ji has already accumulated a decade of professional practice. Combining a 10-generation lineage from Pauri Garhwal with gold-medalist academic credentials, he represents a unique bridge between ancient Vedic traditions and modern, practical life guidance.
          </p>
        </section>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { icon: <Award className="h-5 w-5" />, label: "10-Generation", sub: "Lineage from Pauri Garhwal" },
            { icon: <Star className="h-5 w-5" />, label: "Gold Medalist", sub: "in Vedic Astrology" },
            { icon: <Users className="h-5 w-5" />, label: "10+ Years", sub: "Professional Practice" },
            { icon: <Shield className="h-5 w-5" />, label: "1000+ Sessions", sub: "Completed Worldwide" }
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="flex justify-center text-amber-400 mb-2">{stat.icon}</div>
              <div className="text-sm font-bold text-white">{stat.label}</div>
              <div className="text-xs text-white/50 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Uttarakhand Trust Section */}
        <section aria-label="Best astrologer in Uttarakhand" className="mb-20">
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Why Acharya Aman Uniyal Ji Is the Best Astrologer in Uttarakhand</h2>
            <p className="text-base leading-7 text-white/75">Because of his ancestral roots in Pauri Garhwal, rigorous academic achievements, and mastery over Vedic astrology at a young age, Acharya Aman Uniyal Ji is recognized as a leading astrological authority across the entire state of Uttarakhand. His 10-generation lineage from the Devbhoomi — the Land of the Gods — gives him an authentic connection to Vedic traditions that few practitioners can match.</p>
          </div>
        </section>

        {/* Legacy Section */}
        <section aria-label="Legacy from Pauri Garhwal" className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">The Legacy of Pauri Garhwal: A 10-Generation Lineage</h2>
          <div className="space-y-4 text-base leading-7 text-white/75">
            <p>Astrology in Uttarakhand — the Devbhoomi or "Land of the Gods" — is not merely a subject learned from books; it is a sacred tradition passed down through bloodlines. Acharya Aman Uniyal Ji belongs to a renowned family of scholars from <strong className="text-white">Pauri Garhwal</strong>, a district world-famous for preserving authentic Vedic traditions, classical astronomy, and ritualistic sciences.</p>
            <div className="mb-6">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxUhNt_j19yXJc6akfIeqXDwXS6-mCXXHPu0s7Ny6N0g&s=10"
                alt="Pauri Garhwal Map"
                className="w-full h-64 object-cover rounded-xl border border-white/10"
              />
            </div>
            <p><strong className="text-white">A 10-Generation Lineage:</strong> For ten generations, the Uniyal family has practiced Vedic astrology, helping communities navigate planetary transits, seasonal cycles, and karmic charts.</p>
            <p><strong className="text-white">Childhood Initiation:</strong> Raised in an atmosphere where ancient mantras and planetary calculations were daily practice, Acharya Aman Uniyal Ji began studying classical texts at the age of 10. By the time he reached 15, he was actively reading Kundlis and providing accurate readings.</p>
            <p><strong className="text-white">Mastery in Parashari and Jaimini Systems:</strong> Guided by his elders and traditional gurus, he mastered the complex mathematical calculations of Brihat Parashara Hora Shastra and Jaimini Sutras before most people even finish high school.</p>
            <p><strong className="text-white">Academic Excellence:</strong> While ancestral wisdom provided his foundation, Acharya Aman Uniyal Ji sought to back his intuitive and traditional learning with rigorous academic study. He pursued formal higher education in Jyotish (Vedic Astrology) and Sanskrit scriptures, where his analytical precision earned him the prestigious <strong className="text-white">Gold Medal</strong>.</p>
          </div>
        </section>

        {/* Methodology */}
        <section aria-label="Astrological methodology" className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">The Core Pillars of Acharya Ji's Astrological Methodology</h2>
          <p className="text-base leading-7 text-white/75 mb-8">Vedic astrology is a vast ocean, and navigating it requires precise mathematical calculations combined with refined intuitive insight. Acharya Aman Uniyal Ji approaches every birth chart through a multi-layered diagnostic system to ensure maximum accuracy:</p>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-2">1. Parashari & Jaimini Cross-Verification</h3>
              <p className="text-sm leading-6 text-white/70">While many practitioners rely solely on standard Parashari principles, Acharya Ji cross-checks planetary influences using the Jaimini Sutra system. By evaluating Karakas (significators) alongside traditional house lords, he eliminates ambiguities and confirms predictions with high precision.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-2">2. Shadbala (Six-Fold Planetary Strength) Evaluation</h3>
              <p className="text-sm leading-6 text-white/70">A planet might look strong because of its placement in a good house, but if it lacks functional strength (Shadbala), it will fail to deliver results during its main operating period (Dasha). Acharya Ji calculates directional, positional, temporal, and motion strength to determine whether a planet can yield positive outcomes.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-2">3. Divisional Chart Analysis (D9, D10, D60)</h3>
              <p className="text-sm leading-6 text-white/70">The main birth chart (Rashi Chart or D1) only offers a high-level overview. To see the true picture, Acharya Ji analyzes specific divisional charts: <strong className="text-white">Navamsha (D9)</strong> unlocks the internal strength of planets, marital happiness, and spiritual alignment; <strong className="text-white">Dashamsha (D10)</strong> pinpoints career trajectory, authority, reputation, and business ventures; <strong className="text-white">Shashtiamsha (D60)</strong> solves deep karmic patterns and answers complex life queries that standard charts miss.</p>
            </div>
          </div>
        </section>

        {/* Deep Dive Services */}
        <section aria-label="Specialized consultation services" className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Deep Dive into Specialized Consultation Services</h2>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">1. Career, Business & Financial Astrology</h3>
            <p className="text-sm leading-6 text-white/70 mb-4">In today's fast-moving economy, making key decisions at the right time is critical. Acharya Aman Uniyal Ji assists working professionals, corporate executives, and business founders by pinpointing key growth windows:</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Optimal Timing for Startup Launches:</strong> Analyzing the 1st, 5th, 10th, and 11th house alignment to calculate favorable launching periods.</span></li>
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Career Trajectory & Shifts:</strong> Forecasting favorable periods for job changes, promotions, or international relocations based on Vimshottari Dasha cycles.</span></li>
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Financial Risk Management:</strong> Identifying high-risk planetary transits to prevent severe capital losses or unfavorable partnership agreements.</span></li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-3">2. Modern Relationship Dynamics & Navamsha Compatibility</h3>
            <p className="text-sm leading-6 text-white/70 mb-3">Traditional horoscope matching often gets stuck on a basic numerical score (Gun Milan). Acharya Ji goes far beyond superficial numbers to evaluate true emotional and structural stability between two partners:</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Psychological & Emotional Resonance:</strong> Assessing the placement of Moon, Mercury, and Venus to measure communication ease and mutual understanding.</span></li>
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Deep Navamsha (D9) Matching:</strong> Analyzing planetary strength in both partners' secondary charts to ensure long-term harmony after marriage.</span></li>
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Understanding Mangal Dosha:</strong> De-escalating fear surrounding Mangal Dosha (Mars placement) by applying classical cancellation factors (Dosha Bhanga) that standard software checks often miss.</span></li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-3">3. Planetary Transit (Gochar) & Sade Sati Guidance</h3>
            <p className="text-sm leading-6 text-white/70 mb-3">Planetary transits act as triggers for the energies promised in your primary birth chart. When major planets like Saturn (Shani), Jupiter (Guru), or Rahu-Ketu shift signs, they bring noticeable changes:</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Navigating Saturn's Sade Sati:</strong> Instead of framing Sade Sati as a period of doom, Acharya Ji explains it as a transformative phase of structural discipline and personal maturity.</span></li>
              <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" /> <span><strong className="text-white">Capitalizing on Jupiter Transits:</strong> Identifying when Jupiter's protective aspect falls on key houses to maximize growth in education, family expansion, and wealth.</span></li>
            </ul>
          </div>
        </section>

        {/* Services Table */}
        <section aria-label="Detailed services overview" className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Detailed Overview of Core Services in Dehradun</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left font-semibold text-white">Consultation Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Primary Focus Areas</th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Key Analytical Tools Used</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-white">{s.title}</td>
                    <td className="px-4 py-3 text-white/70">{s.focus}</td>
                    <td className="px-4 py-3 text-white/70">{s.tools}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* What to Expect */}
        <section aria-label="What to expect during consultation" className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">What to Expect During a Session</h2>
          <div className="space-y-4 text-base leading-7 text-white/75">
            <p>Consulting an astrologer can feel daunting if you don't know what to expect. Acharya Ji maintains a structured, professional, and comforting environment for every consultation:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">1</span>
                <span><strong className="text-white">Precision Chart Generation:</strong> Before the session begins, your exact birth details (Date, Time, Place) are processed through high-precision ephemeris software to construct accurate divisional charts.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">2</span>
                <span><strong className="text-white">Karmic Assessment:</strong> Acharya Ji reviews your overall chart balance, current Mahadasha, and active transits to identify ongoing life patterns.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">3</span>
                <span><strong className="text-white">Interactive Problem Solving:</strong> You discuss your specific questions — whether regarding career growth, family life, investments, or spiritual development.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">4</span>
                <span><strong className="text-white">Actionable Roadmap & Remedies:</strong> You receive a structured blueprint covering upcoming favorable periods, along with realistic, non-intrusive remedies designed to align your actions with cosmic timing.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Philosophy Quote */}
        <section aria-label="Philosophy of karma and planetary influence" className="mb-20 rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">The Philosophy: Karma Meets Planetary Influence</h2>
          <blockquote className="text-lg italic text-amber-200/80 max-w-2xl mx-auto leading-relaxed">
            "Planets do not force your destiny; they indicate the cosmic weather. Just as you carry an umbrella when you know it will rain, understanding your Dasha and planetary transits helps you make smarter choices, work harder at the right time, and stay resilient during challenging periods."
          </blockquote>
          <p className="mt-4 text-sm text-amber-400/60">— Acharya Aman Uniyal Ji</p>
          <p className="mt-4 text-base leading-7 text-white/75 max-w-2xl mx-auto">
            By blending personal effort (Purushartha) with cosmic timing (Kala), his guidance empowers individuals to take charge of their lives rather than feeling helpless before planetary movements.
          </p>
        </section>

        {/* FAQ Section */}
        <section aria-label="Frequently asked questions" className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-white hover:text-amber-300 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 text-white/40 group-open:rotate-90 transition-transform shrink-0 ml-2" />
                </summary>
                <div className="px-6 pb-4 text-sm leading-6 text-white/70 border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section aria-label="Conclusion and call to action" className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Conclusion: Take Control of Your Life with True Cosmic Guidance</h2>
          <div className="space-y-4 text-base leading-7 text-white/75">
            <p>Navigating life's uncertainties becomes much easier when you have a trustworthy map and an experienced guide. Whether you are facing complex decisions in your career, looking for the right life partner, or seeking spiritual clarity, consulting an authentic expert can illuminate your path.</p>
            <p>With his unmatched 10-generation legacy from Pauri Garhwal, academic distinction, and dedicated decade-long practice, <strong className="text-white">Acharya Aman Uniyal Ji</strong> stands as a beacon of genuine Vedic wisdom. If you are looking for the <strong className="text-white">best astrologer in Dehradun</strong>, book a consultation today to experience clear, honest, and transformative life guidance.</p>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="text-center border-t border-white/10 pt-12">
          <h3 className="text-xl font-bold text-white mb-3">
            Book Your Consultation with Acharya Aman Uniyal Ji
          </h3>
          <p className="text-white/60 mb-6 max-w-lg mx-auto">
            Get clear, honest, and transformative life guidance from the most trusted astrologer in Dehradun.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/talk-to-astrologer"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-400/30 px-10 py-5 text-lg font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestAstrologerInDehradun;
