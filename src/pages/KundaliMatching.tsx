import React, { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Calendar, Clock, Star, Heart, Shield, Users } from "lucide-react";
import { ButtonLite } from "@/components/ui/button-lite";

// Lazy load heavy components
const LazyImage = lazy(() => import("@/components/ui/lazy-image"));

const KundaliMatching = () => {
  return (
    <>
      <Helmet>
        <title>Free Kundali Matching for marrige— Check Compatibility Instantly</title>
        <meta name="description" content="Free Kundali matching based on Vedic astrology. Check love compatibility, marriage timing and guna milan instantly. Powered by AI." />
        <meta name="keywords" content="kundali matching for marriage, guna milan, kundli milan, ashtakoot system, 36 gunas in kundali matching, nadi dosha, mangal dosha, bhakoot dosha, marriage compatibility, vedic astrology matching, kundali matching online, kundali matching calculator, guna milan points, kundali matching process, nakshatra matching, marriage horoscope matching, kundali matching guide, how to match kundali, kundali matching steps, marriage astrology, vedic marriage compatibility, kundali matching 2026, kundali matching remedies" />
        <link rel="canonical" href="https://veadicastro.in/kundali-matching" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="language" content="en" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="ICBM" content="20.5937,78.9629" />

        {/* Open Graph */}
        <meta property="og:title" content="How to Do Kundali Matching for Marriage: A Complete 2026 Guide" />
        <meta property="og:description" content="Learn how to do Kundali matching for marriage step by step. Understand all 8 Gunas, Doshas, and remedies in this complete 2026 guide." />
        <meta property="og:url" content="https://veadicastro.in/kundali-matching" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://veadicastro.in/optimized/kundali-matching-.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Veadicastro" />
        <meta property="og:locale" content="en_IN" />
        <meta property="article:author" content="Veadicastro" />
        <meta property="article:section" content="Astrology" />
        <meta property="article:tag" content="kundali matching" />
        <meta property="article:tag" content="marriage compatibility" />
        <meta property="article:tag" content="vedic astrology" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Do Kundali Matching for Marriage: A Complete 2026 Guide" />
        <meta name="twitter:description" content="Learn how to do Kundali matching for marriage step by step. Understand all 8 Gunas, Doshas, and remedies in this complete 2026 guide." />
        <meta name="twitter:image" content="https://veadicastro.in/optimized/kundali-matching-.webp" />
        <meta name="twitter:site" content="@veadicastro" />
        <meta name="twitter:creator" content="@veadicastro" />

        {/* Additional SEO Meta Tags */}
        <meta name="author" content="Veadicastro" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#0a0a0f" />
        <meta name="application-name" content="Veadicastro" />

        {/* BlogPosting Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "How to Do Kundali Matching for Marriage: A Complete 2026 Guide",
            "description": "Learn how to do Kundali matching for marriage step by step. Understand all 8 Gunas, Doshas, and remedies in this complete 2026 guide.",
            "image": "https://veadicastro.in/optimized/kundali-matching-.webp",
            "author": {
              "@type": "Organization",
              "name": "Veadicastro",
              "url": "https://veadicastro.in"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Veadicastro",
              "logo": {
                "@type": "ImageObject",
                "url": "https://veadicastro.in/logo.jpg"
              }
            },
            "datePublished": "2026-03-14",
            "dateModified": "2026-03-14",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://veadicastro.in/kundali-matching"
            },
            "keywords": [
              "kundali matching for marriage",
              "guna milan",
              "kundli milan",
              "ashtakoot system",
              "36 gunas in kundali matching",
              "nadi dosha",
              "mangal dosha",
              "bhakoot dosha",
              "marriage compatibility",
              "vedic astrology matching"
            ],
            "wordCount": "3000",
            "inLanguage": "en-IN",
            "articleSection": "Vedic Astrology Guide",
            "about": {
              "@type": "Thing",
              "name": "Kundali Matching"
            },
            "mentions": [
              {
                "@type": "SoftwareApplication",
                "name": "Vedika AI",
                "url": "https://veadicastro.in/free-ai-astrologer-chat",
                "applicationCategory": "LifestyleApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                }
              }
            ]
          })}
        </script>

        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veadicastro.in" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://veadicastro.in/blog" },
              { "@type": "ListItem", "position": 3, "name": "Kundali Matching for Marriage", "item": "https://veadicastro.in/kundali-matching" }
            ]
          }`}
        </script>
      {/* SoftwareApplication Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Vedika AI — Free AI Astrologer",
            "url": "https://veadicastro.in/free-ai-astrologer-chat",
            "description": "Vedika AI is a free Vedic astrology AI trained on Jyotish principles. Get instant kundli analysis, kundali matching, dosha checking, and predictions based on your exact birth chart.",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "284",
              "bestRating": "5"
            }
          })}
        </script>

        {/* HowTo Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Do Kundali Matching for Marriage",
            "description": "Step-by-step guide to performing Kundali matching using the Ashtakoot Guna Milan system.",
            "image": "https://veadicastro.in/optimized/kundali-matching-.webp",
            "totalTime": "PT30M",
            "supply": [
              { "@type": "HowToSupply", "name": "Date of Birth for both individuals" },
              { "@type": "HowToSupply", "name": "Time of Birth for both individuals" },
              { "@type": "HowToSupply", "name": "Place of Birth for both individuals" }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "Gather Birth Details",
                "text": "Collect the exact date, time and place of birth for both the bride and groom. Time accuracy within 5 minutes is ideal."
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "Generate Both Kundalis",
                "text": "Use a Vedic astrology tool to generate birth charts. Note the Moon Sign and Janma Nakshatra for each person."
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "Calculate All 8 Gunas",
                "text": "Compare the Nakshatras across all eight Ashtakoot categories: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi."
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "Calculate Total Score",
                "text": "Sum all eight Guna scores out of 36. A score of 18 or above is the minimum acceptable for marriage."
              },
              {
                "@type": "HowToStep",
                "position": 5,
                "name": "Check for Doshas",
                "text": "Separately check for Nadi Dosha, Bhakoot Dosha, Gana Dosha, and Mangal Dosha. Check cancellation conditions before treating any Dosha as final."
              },
              {
                "@type": "HowToStep",
                "position": 6,
                "name": "Apply Remedies if Needed",
                "text": "If Doshas are present or score is low, apply appropriate Upayas such as mantras, gemstone therapy, or pujas."
              }
            ]
          })}
        </script>

      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1020] to-[#0a0a0f] text-white">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-blue-600/10" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="mb-8">
                <img
                  src="/optimized/kundali-matching-.webp"
                  alt="How to do Kundali matching for marriage step by step — Complete 2026 guide"
                  className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
                  loading="lazy"
                />
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                How to Do Kundali Matching for Marriage: A Complete 2026 Guide
              </h1>

              <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-3xl mx-auto">
                Marriage is one of life's biggest decisions. In the Vedic tradition, Kundali matching has guided families for thousands of years — not to restrict choice, but to give couples a honest picture of where their energies align and where challenges may arise.
              </p>

              <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-3xl mx-auto font-semibold">
                This guide teaches you everything from scratch.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Table of Contents */}
          <div className="mb-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-center">Table of Contents</h2>
            <div className="space-y-2">
              <a href="#introduction" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Introduction</a>
              <a href="#what-is-kundali-matching" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• What Is Kundali Matching?</a>
              <a href="#what-you-need" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• What You Need Before You Start</a>
              <a href="#step-1" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Step 1: Generate the Birth Charts</a>
              <a href="#step-2" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Step 2: Understand the 27 Nakshatras</a>
              <a href="#step-3" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Step 3: The 8 Gunas Explained</a>
              <a href="#step-4" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Step 4: Read Your Total Score</a>
              <a href="#step-5" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Step 5: Check for Doshas</a>
              <a href="#step-6" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Step 6: Remedies (Upayas)</a>
              <a href="#score-reference" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Score Interpretation Quick Reference</a>
              <a href="#love-marriages" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Kundali Matching for Love Marriages</a>
              <a href="#mistakes" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Common Mistakes to Avoid</a>
              <a href="#faq" className="block text-white/80 hover:text-pink-400 transition-colors py-2">• Frequently Asked Questions</a>
            </div>
          </div>

          {/* Introduction */}
          <div id="introduction" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Introduction</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Marriage is one of life's biggest decisions. In the Vedic tradition, Kundali matching has guided families for thousands of years — not to restrict choice, but to give couples a honest picture of where their energies align and where challenges may arise.
            </p>
            
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              This guide teaches you everything from scratch. What Kundali matching is, how to read a birth chart, what each of the 36 Gunas means, how to spot Doshas, and what remedies exist when the match is not ideal.
            </p>
            
            <p className="text-lg leading-relaxed text-white/80">
              Whether you're planning your own marriage, helping family members, or simply curious about this ancient wisdom, this comprehensive guide will give you the knowledge to make informed decisions based on authentic Vedic principles.
            </p>
          </div>

          {/* What Is Kundali Matching */}
          <div id="what-is-kundali-matching" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">What Is Kundali Matching?</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Kundali matching, also called Guna Milan or Kundli Milan, is the Vedic practice of comparing two birth charts before marriage. The comparison uses the Ashtakoot system — eight compatibility categories totaling 36 points (Gunas). The higher the score, the more aligned the couple is across health, temperament, finances, intimacy, and family life.
            </p>
            
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              It is not fortune-telling. It is a compatibility blueprint — one built on 2,000 years of observed patterns in human nature and planetary influence.
            </p>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 text-pink-400">The Ashtakoot System at a Glance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Varna", points: "1 Point", area: "Spiritual & Work Alignment" },
                  { name: "Vashya", points: "2 Points", area: "Natural Attraction" },
                  { name: "Tara", points: "3 Points", area: "Health & Fortune" },
                  { name: "Yoni", points: "4 Points", area: "Physical Compatibility" },
                  { name: "Graha Maitri", points: "5 Points", area: "Mental Harmony" },
                  { name: "Gana", points: "6 Points", area: "Temperament" },
                  { name: "Bhakoot", points: "7 Points", area: "Emotional Love" },
                  { name: "Nadi", points: "8 Points", area: "Genetic Compatibility" }
                ].map(({ name, points, area }) => (
                  <div key={name} className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="font-semibold text-white">{name}</div>
                    <div className="text-sm text-pink-400">{points}</div>
                    <div className="text-xs text-white/60 mt-1">{area}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What You Need Before You Start */}
          <div id="what-you-need" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">What You Need Before You Start</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              You need three pieces of information for both the bride and groom:
            </p>
            
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <Calendar className="w-6 h-6 text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Date of Birth</h3>
                    <p className="text-white/80">Exact day, month, and year. This determines the planetary positions and zodiac signs.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Time of Birth</h3>
                    <p className="text-white/80">As precise as possible. Even a 15-minute error can change the Nakshatra pada, affecting multiple Guna calculations. Check hospital birth certificates or family records.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <Star className="w-6 h-6 text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Place of Birth</h3>
                    <p className="text-white/80">The city or town. This adjusts planetary positions for the local horizon.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 font-semibold">💡 Important Note:</p>
              <p className="text-white/80 text-sm mt-1">
                If birth time is unknown, you can still calculate six of the eight Gunas using just the date and place. The result will be approximate but useful.
              </p>
            </div>
          </div>

          {/* Step 1: Generate the Birth Charts */}
          <div id="step-1" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Step 1: Generate the Birth Charts</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              A Kundali (birth chart) maps the position of the Sun, Moon, and planets at the exact moment of birth. You do not need to calculate this manually — any reputable Vedic astrology website does it instantly.
            </p>
            
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              What you need from each chart for matching purposes:
            </p>
            
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-pink-400">Required Information from Each Chart</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="font-medium text-white">Moon Sign (Rashi)</span>
                    <span className="text-white/60">Which of the 12 zodiac signs the Moon occupied at birth</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="font-medium text-white">Janma Nakshatra</span>
                    <span className="text-white/60">Which of the 27 lunar constellations the Moon occupies</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="font-medium text-white">Nakshatra Pada</span>
                    <span className="text-white/60">Each Nakshatra has four quarters (padas)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="font-medium text-white">Mars Position</span>
                    <span className="text-white/60">Needed separately to check for Mangal Dosha</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Understand the 27 Nakshatras */}
          <div id="step-2" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Step 2: Understand the 27 Nakshatras</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Every Kundali matching calculation is rooted in the Nakshatra. There are 27 Nakshatras, each spanning 13°20' of the zodiac. Each one carries fixed attributes used in matching: a Gana (temperament class), a Nadi (constitution type), a Yoni animal, and a Varna.
            </p>
            
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Here is the complete reference table:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-pink-400">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-pink-400">Nakshatra</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-pink-400">Gana</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-pink-400">Nadi</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-pink-400">Yoni</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-pink-400">Varna</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1", "Ashwini", "Deva", "Aadi", "Horse", "Vaishya"],
                    ["2", "Bharani", "Manushya", "Antya", "Elephant", "Shudra"],
                    ["3", "Krittika", "Rakshasa", "Aadi", "Goat", "Brahmin"],
                    ["4", "Rohini", "Manushya", "Antya", "Snake", "Shudra"],
                    ["5", "Mrigashira", "Deva", "Madhya", "Snake", "Shudra"],
                    ["6", "Ardra", "Manushya", "Aadi", "Dog", "Shudra"],
                    ["7", "Punarvasu", "Deva", "Antya", "Cat", "Vaishya"],
                    ["8", "Pushya", "Deva", "Madhya", "Goat", "Kshatriya"],
                    ["9", "Ashlesha", "Rakshasa", "Aadi", "Cat", "Shudra"],
                    ["10", "Magha", "Rakshasa", "Antya", "Rat", "Shudra"],
                    ["11", "Purva Phalguni", "Manushya", "Aadi", "Rat", "Brahmin"],
                    ["12", "Uttara Phalguni", "Manushya", "Madhya", "Cow", "Kshatriya"],
                    ["13", "Hasta", "Deva", "Antya", "Buffalo", "Vaishya"],
                    ["14", "Chitra", "Rakshasa", "Madhya", "Tiger", "Shudra"],
                    ["15", "Swati", "Deva", "Aadi", "Buffalo", "Shudra"],
                    ["16", "Vishakha", "Rakshasa", "Antya", "Tiger", "Shudra"],
                    ["17", "Anuradha", "Deva", "Madhya", "Deer", "Shudra"],
                    ["18", "Jyeshtha", "Rakshasa", "Aadi", "Deer", "Shudra"],
                    ["19", "Mula", "Rakshasa", "Antya", "Dog", "Rakshasa"],
                    ["20", "Purva Ashadha", "Manushya", "Aadi", "Monkey", "Brahmin"],
                    ["21", "Uttara Ashadha", "Manushya", "Madhya", "Mongoose", "Kshatriya"],
                    ["22", "Shravana", "Deva", "Antya", "Monkey", "Shudra"],
                    ["23", "Dhanishtha", "Rakshasa", "Aadi", "Lion", "Shudra"],
                    ["24", "Shatabhisha", "Rakshasa", "Madhya", "Horse", "Shudra"],
                    ["25", "Purva Bhadrapada", "Manushya", "Aadi", "Lion", "Brahmin"],
                    ["26", "Uttara Bhadrapada", "Manushya", "Antya", "Cow", "Kshatriya"],
                    ["27", "Revati", "Deva", "Antya", "Elephant", "Shudra"]
                  ].map(([num, nakshatra, gana, nadi, yoni, varna]) => (
                    <tr key={num} className="border-b border-white/10 last:border-b-0">
                      <td className="px-4 py-3 text-white/80 font-medium">{num}</td>
                      <td className="px-4 py-3 text-white/80 font-medium">{nakshatra}</td>
                      <td className="px-4 py-3 text-white/80">{gana}</td>
                      <td className="px-4 py-3 text-white/80">{nadi}</td>
                      <td className="px-4 py-3 text-white/80">{yoni}</td>
                      <td className="px-4 py-3 text-white/80">{varna}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 3: The 8 Gunas Explained */}
          <div id="step-3" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Step 3: The 8 Gunas Explained</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              This is the heart of Kundali matching. Each Guna tests one dimension of the relationship.
            </p>
            
            <div className="space-y-8">
              {[
                {
                  name: "Varna — 1 Point",
                  measures: "Spiritual and work-life alignment",
                  description: "Each Nakshatra belongs to one of four Varnas: Brahmin (spiritual), Kshatriya (leadership), Vaishya (commerce), Shudra (service). The boy's Varna should equal or exceed the girl's for full points. If the boy's Varna is lower, 0 points.",
                  significance: "Low weight. Rarely the deciding factor in a match."
                },
                {
                  name: "Vashya — 2 Points",
                  measures: "Natural attraction and power dynamics",
                  description: "Each Moon sign is classified as Manava (human), Chatushpada (four-legged), Jalchar (water), Vanchar (wild), or Keeta (insect). Full points go to signs that naturally attract each other; 0 points for signs with no natural pull.",
                  significance: "Moderate. Affects the natural 'draw' between partners."
                },
                {
                  name: "Tara — 3 Points",
                  measures: "Health, destiny, and fortune after marriage",
                  description: "Count from the girl's Nakshatra to the boy's and divide by 9. The remainder determines the Tara type. Favorable types (Sampat, Kshema, Mitra, Ati Mitra, Sadhaka) score positively. Unfavorable types (Vipat, Vadha, Pratyari) score 0.",
                  significance: "Moderate. Points to overall wellbeing compatibility."
                },
                {
                  name: "Yoni — 4 Points",
                  measures: "Physical compatibility and sexual harmony",
                  description: "Each Nakshatra is assigned one of 14 symbolic animals. Same animal = 4 points. Friendly animals = 3. Neutral = 2. Unfriendly = 1. Enemy animals = 0.",
                  significance: "High. A score of 0 here often creates intimate distance over time."
                },
                {
                  name: "Graha Maitri — 5 Points",
                  measures: "Mental harmony, communication, and emotional friendship",
                  description: "Compare the ruling planets of both Moon signs. Mutual friends = 5 points. One friend, one neutral = 4. Both neutral = 3. One friend, one enemy = 1. Both enemies = 0.",
                  significance: "High. This Guna most directly predicts long-term communication and understanding."
                },
                {
                  name: "Gana — 6 Points",
                  measures: "Fundamental temperament and behavioral nature",
                  description: "All Nakshatras belong to one of three Ganas. Deva (gentle, harmonious, idealistic). Manushya (balanced, practical, worldly). Rakshasa (intense, fierce, strong-willed). Same Gana = 6 points. Deva–Manushya = 5 points. Manushya–Rakshasa = 0 points. Deva–Rakshasa = 0 points.",
                  significance: "Very high. The Deva–Rakshasa pairing is one of the most challenging in the system."
                },
                {
                  name: "Bhakoot — 7 Points",
                  measures: "Emotional love, family welfare, and financial stability",
                  description: "Count from one Moon sign to the other. Favorable number-pairs (1/7, 1/3, 1/5, 1/11) = 7 points. The 6/8 and 2/12 number-pairs = 0 points and create Bhakoot Dosha.",
                  significance: "Critical. One of the three major Doshas lives here."
                },
                {
                  name: "Nadi — 8 Points",
                  measures: "Genetic compatibility and health of future children",
                  description: "Every Nakshatra belongs to one of three Nadis — Aadi (Vata), Madhya (Pitta), or Antya (Kapha). Different Nadis = 8 points. Same Nadi = 0 points and creates Nadi Dosha — the most serious concern in the entire matching system.",
                  significance: "Critical. This single Guna carries 22% of the total score."
                }
              ].map(({ name, measures, description, significance }) => (
                <div key={name} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold mb-3 text-pink-400">{name}</h3>
                  <div className="mb-4">
                    <span className="text-white/80 font-medium">Measures: </span>
                    <span className="text-white/70">{measures}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed mb-4">{description}</p>
                  <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-3">
                    <span className="text-pink-400 font-semibold">Significance: </span>
                    <span className="text-white/80 text-sm">{significance}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Yoni Enemy Pairs */}
            <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 text-pink-400">Natural Enemy Pairs (0 points in Yoni)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Horse–Buffalo", "Elephant–Lion", "Goat–Monkey", "Snake–Mongoose", 
                  "Dog–Deer", "Cat–Rat", "Cow–Tiger"
                ].map(pair => (
                  <div key={pair} className="text-center p-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 text-sm">{pair}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Read Your Total Score */}
          <div id="step-4" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Step 4: Read Your Total Score</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              The minimum acceptable score is 18 — exactly half of 36. Below this threshold, classical texts advise against marriage without professional guidance and remedial action.
            </p>
            
            <div className="space-y-4">
              {[
                { score: "0–17", interpretation: "Not recommended. Serious incompatibility across multiple areas.", color: "red" },
                { score: "18–24", interpretation: "Acceptable. Workable with awareness and some remedies.", color: "yellow" },
                { score: "25–31", interpretation: "Good match. Comfortable compatibility with minor friction.", color: "green" },
                { score: "32–36", interpretation: "Excellent. Rare and deeply auspicious union.", color: "emerald" }
              ].map(({ score, interpretation, color }) => (
                <div key={score} className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 ${color === 'red' ? 'border-red-500/30' : color === 'yellow' ? 'border-yellow-500/30' : color === 'green' ? 'border-green-500/30' : 'border-emerald-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Score: {score}</h3>
                      <p className="text-white/80">{interpretation}</p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color === 'red' ? 'bg-red-900/20' : color === 'yellow' ? 'bg-yellow-900/20' : color === 'green' ? 'bg-green-900/20' : 'bg-emerald-900/20'}`}>
                      <span className={`text-2xl font-bold ${color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : color === 'green' ? 'text-green-400' : 'text-emerald-400'}`}>
                        {score.split('–')[1] || score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 font-semibold">💡 Important:</p>
              <p className="text-white/80 text-sm mt-1">
                Always look at individual Guna scores, not just the total. A score of 22 with no Doshas and full marks on Nadi and Bhakoot is far healthier than a score of 26 with a Nadi Dosha.
              </p>
            </div>
          </div>

          {/* Step 5: Check for Doshas */}
          <div id="step-5" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Step 5: Check for Doshas</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              Doshas are specific chart conditions that create recurring challenges in marriage. They must be checked separately from the Guna total.
            </p>
            
            <div className="space-y-8">
              {[
                {
                  name: "Nadi Dosha",
                  trigger: "Both partners share the same Nadi (both Aadi, both Madhya, or both Antya).",
                  effect: "Associated with health issues and difficulties bearing healthy children. Scores 0 on the Nadi Guna.",
                  cancelled: "Both partners share the same Moon sign but different Nakshatras. Or both Nakshatras have the same ruling planet.",
                  remedy: "Daily recitation of the Mahamrityunjaya Mantra (108 times), offering milk to a Shivalinga on Mondays, and a formal Nadi Dosha Nivarana Puja."
                },
                {
                  name: "Bhakoot Dosha",
                  trigger: "Moon signs in a 6/8 or 2/12 numerical relationship.",
                  effect: "The 6/8 pairing is associated with financial strain and emotional distance. The 2/12 pairing with lack of fulfillment and possible separation. Scores 0 on the Bhakoot Guna.",
                  cancelled: "Both Rashi lords are friends or the same planet. Or if Nadi compatibility is full (8 points).",
                  remedy: "Offering water to the Moon on full moon nights, fasting on Mondays, wearing a Pearl in silver."
                },
                {
                  name: "Gana Dosha",
                  trigger: "Deva–Rakshasa pairing or Manushya–Rakshasa pairing.",
                  effect: "Fundamental temperament mismatch. One partner is naturally gentle; the other is intensely driven. Scores 0 on the Gana Guna.",
                  cancelled: "Both partners have the same Moon sign or the same Nakshatra lord.",
                  remedy: "Both partners performing Shiva Panchakshara mantra practice together before and after marriage."
                },
                {
                  name: "Mangal Dosha",
                  trigger: "Mars placed in houses 1, 2, 4, 7, 8, or 12 of the birth chart.",
                  effect: "Creates intense personal energy and potential for conflict in close relationships. The 7th and 8th house placements are most significant for marriage.",
                  cancelled: "Mars is in its own sign (Aries or Scorpio), aspected by Jupiter, or placed in the sign of a friendly planet.",
                  remedy: "Wearing Red Coral on Tuesdays, reciting Hanuman Chalisa on Tuesdays, and in severe cases, performing Kumbha Vivah before the wedding.",
                  extra: "The easiest solution: A Mangalik person marrying another Mangalik person. The energies balance each other."
                }
              ].map(({ name, trigger, effect, cancelled, remedy, extra }) => (
                <div key={name} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">{name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start p-3 bg-white/5 rounded-lg">
                      <span className="font-medium text-white flex-shrink-0">Trigger:</span>
                      <span className="text-white/70 text-right ml-4">{trigger}</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-white/5 rounded-lg">
                      <span className="font-medium text-white flex-shrink-0">Effect:</span>
                      <span className="text-white/70 text-right ml-4">{effect}</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-white/5 rounded-lg">
                      <span className="font-medium text-white flex-shrink-0">Cancelled when:</span>
                      <span className="text-white/70 text-right ml-4">{cancelled}</span>
                    </div>
                    <div className="flex justify-between items-start p-3 bg-white/5 rounded-lg">
                      <span className="font-medium text-white flex-shrink-0">Remedy:</span>
                      <span className="text-white/70 text-right ml-4">{remedy}</span>
                    </div>
                    {extra && (
                      <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <span className="text-blue-400 text-sm">{extra}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 6: Remedies (Upayas) for Difficult Matches */}
          <div id="step-6" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Step 6: Remedies (Upayas) for Difficult Matches</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              A low Guna score or an uncancelled Dosha does not mean the marriage cannot work. Upayas are the practical, spiritual, and psychological remedies that Vedic astrology has always provided alongside its diagnoses.
            </p>
            
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">For low overall score</h3>
                <p className="text-white/80 leading-relaxed">
                  Both partners perform the Vishnu Sahasranama together on Thursdays. Offer yellow flowers and bananas to Jupiter's energy. This is believed to enhance the protective planetary influence over the union.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">For weak Graha Maitri</h3>
                <p className="text-white/80 leading-relaxed">
                  Regular shared meditation, conscious communication practices, and if appropriate, gemstone therapy guided by an astrologer. Emerald for Mercury, Yellow Sapphire for Jupiter, depending on the weak planetary lord.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">For Yoni incompatibility</h3>
                <p className="text-white/80 leading-relaxed">
                  Light a ghee lamp together at home each evening as a shared spiritual ritual. This simple practice builds intimacy and routine — two things that Yoni incompatibility tends to erode.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">General marriage strengthening</h3>
                <p className="text-white/80 leading-relaxed">
                  Keeping the northeast corner of the home clean and uncluttered (Vastu), placing a Ganesha idol at the entrance, and performing simple shared puja as a couple builds the common spiritual foundation that the chart identifies as potentially weak.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 font-semibold">💡 One principle to remember:</p>
              <p className="text-white/80 text-sm mt-1">
                Upayas are not magic spells. Their real power lies in the habits, awareness, and shared spiritual effort they create. A couple that prays together, reflects together, and takes their relationship seriously will navigate even difficult charts far better than a couple with a perfect score who takes their compatibility for granted.
              </p>
            </div>
          </div>

          {/* Score Interpretation Quick Reference */}
          <div id="score-reference" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Score Interpretation Quick Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-pink-400">Gunas Obtained</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-pink-400">Verdict</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-pink-400">Action Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["32–36", "Excellent", "Celebrate. Very rare."],
                    ["28–31", "Very Good", "Proceed with confidence."],
                    ["24–27", "Good", "Minor remedies if needed."],
                    ["18–23", "Acceptable", "Check Doshas carefully. Apply Upayas."],
                    ["Below 18", "Needs Attention", "Consult an experienced astrologer."]
                  ].map(([score, verdict, action]) => (
                    <tr key={score} className="border-b border-white/10 last:border-b-0">
                      <td className="px-6 py-4 text-white/80 font-medium">{score}</td>
                      <td className="px-6 py-4 text-white/80">{verdict}</td>
                      <td className="px-6 py-4 text-white/80">{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kundali Matching for Love Marriages */}
          <div id="love-marriages" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Kundali Matching for Love Marriages</h2>
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              A common misconception is that Kundali matching only applies to arranged marriages. This is not true. Love marriages benefit from it just as much — perhaps more, because the emotional investment is already high and the couple has more to lose from preventable incompatibilities.
            </p>
            
            <p className="text-lg leading-relaxed text-white/80 mb-6">
              For love marriages, the focus shifts slightly. Astrologers tend to emphasize Graha Maitri (mental and emotional friendship), Gana (temperament compatibility), and the Navamsa (D-9) chart — which shows the soul-level quality of the marriage — over the raw Guna total. A couple deeply in love with a score of 20 but no Doshas and strong Graha Maitri is in a far better position than many assume.
            </p>
            
            <p className="text-lg leading-relaxed text-white/80">
              The goal is never to break up a loving couple. It is to give them honest, detailed information about where their relationship will require extra attention and what practices will support its long-term health.
            </p>
          </div>

          {/* Common Mistakes to Avoid */}
          <div id="mistakes" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Common Mistakes to Avoid</h2>
            <div className="space-y-4">
              {[
                "Using inaccurate birth data. An error of 30 minutes in birth time can change the Nakshatra pada entirely, affecting Varna, Yoni, and Nadi results. Always verify before running the analysis.",
                "Focusing only on the total score. Two couples can both score 22 and have completely different situations depending on which Gunas contributed to that score and whether any Doshas are present.",
                "Ignoring Dosha cancellations. Many people panic at a Dosha without checking whether cancellation conditions apply. Always investigate cancellations before treating a Dosha as definitive.",
                "Not checking Mangal Dosha separately. Many tools show only the Guna total and miss this entirely. It must be checked from the full birth chart, not the Guna Milan table.",
                "Treating the result as destiny. No astrological score determines the outcome of a marriage. Character, communication, respect, and commitment are the actual foundations. Kundali matching is a tool of awareness, not a verdict."
              ].map((mistake, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <span className="text-pink-400 font-bold text-lg mt-1">{index + 1}.</span>
                    <p className="text-white/80 leading-relaxed">{mistake}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div id="faq" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "What is the minimum score required for marriage?",
                  a: "Classical texts set the minimum at 18 out of 36. Below 18, professional consultation and remedies are strongly advised before proceeding."
                },
                {
                  q: "Can we marry with a Nadi Dosha?",
                  a: "Yes. Check first whether cancellation conditions apply. If the Dosha stands, specific remedies exist. Many couples with Nadi Dosha have healthy families. Awareness and remedies are the tools."
                },
                {
                  q: "Is Kundali matching needed for love marriages?",
                  a: "Yes, it is beneficial. It does not override love — it adds information. Knowing where challenges lie helps a couple prepare."
                },
                {
                  q: "Can Kundali matching be done without birth time?",
                  a: "Partially. Six of the eight Gunas can be calculated from date and place of birth alone. For the full picture, birth time is needed."
                },
                {
                  q: "Does a score of 36/36 guarantee a happy marriage?",
                  a: "No. A perfect score indicates extraordinary planetary harmony. The marriage itself still depends entirely on the people in it."
                },
                {
                  q: "What if both of us are Mangalik?",
                  a: "This is actually the ideal scenario in traditional astrology. Two Mangalik individuals are considered well-matched — the intense Mars energy of each partner is balanced by the other."
                },
                {
                  q: "How accurate are online Kundali matching tools?",
                  a: "The calculations are mathematically precise if the input data is accurate. The limitation is that most tools do not apply Dosha cancellation rules, weight individual Gunas contextually, or consider the full birth chart. For important decisions, supplement any online result with a consultation with a knowledgeable astrologer."
                }
              ].map(({ q, a }) => (
                <div key={q} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold mb-3 text-pink-400">Q: {q}</h3>
                  <p className="text-white/80 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          <div id="conclusion" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Conclusion</h2>
            
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              Kundali matching is one of humanity's most detailed and thoughtful compatibility frameworks. At its best it does not restrict love — it deepens it, by giving couples an honest picture of their combined planetary energies before they commit.
            </p>
            
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              The steps are clear. Gather accurate birth data. Generate both Kundalis. Identify each person's Moon Sign, Nakshatra, and Nakshatra Pada. Apply the eight Guna calculations. Sum the total. Check for Doshas separately. Investigate cancellations. Apply appropriate remedies if needed. Use all of this information as one wise input among several — alongside shared values, emotional maturity, communication, and genuine care for one another.
            </p>
            
            <p className="text-lg text-white/80 leading-relaxed italic">
              The stars do not make marriages. People do. What Kundali matching offers is a map. What you do with the journey is entirely your own.
            </p>
          </div>

          {/* Meet Vedika AI */}
          <div className="mb-12">
            <div className="text-center">
              <div className="mb-8">
                <img 
                  src="/optimized/vedika.webp" 
                  alt="Vedika AI - Advanced Vedic Astrology AI" 
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                  loading="lazy"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">Want to know when you will get married?</h3>
              <p className="text-lg text-white/70 mb-6 max-w-3xl mx-auto">
                Ask Vedika AI on Veadicastro. Get personalized marriage timing predictions based on your exact birth chart, 
                with detailed analysis of favorable periods and potential challenges.
              </p>
              <p className="text-white/80 mb-4">
                Available exclusively on <strong className="text-pink-400">Veadicastro.in</strong> — your trusted platform for authentic Vedic astrology guidance.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center py-12 bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Ask Vedika AI About Your Marriage Timing</h3>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Get personalized predictions about when you'll get married, based on your exact birth chart and authentic Vedic astrology principles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/free-ai-astrologer-chat"
                className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors"
              >
                Chat with Vedika AI — Free
              </Link>
              <Link
                to="/free-kundli-generator"
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Generate Your <strong>Free Kundli</strong>
              </Link>
            </div>
            
            <p className="text-pink-400 font-bold text-lg mt-6">
              Get your <Link to="/ai-marriage-prediction-by-date-of-birth" className="text-white hover:text-pink-200 underline">AI marriage prediction by date of birth</Link> + Expert guidance at Veadicastro.in
            </p>
          </div>

          {/* Article Meta */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between text-white/60 text-sm">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <span>Published: March 2026</span>
                <span>•</span>
                <span>Category: Vedic Astrology</span>
                <span>•</span>
                <span>Reading Time: 12 minutes</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "Kundali Matching", "Guna Milan", "Ashtakoot", "Nadi Dosha", "Mangal Dosha", 
                "Bhakoot Dosha", "Vedic Astrology", "Marriage Compatibility", "Nakshatra", "36 Gunas"
              ].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>{/* end max-w-4xl */}
      </div>{/* end min-h-screen */}
    </>
  );
};

export default KundaliMatching;