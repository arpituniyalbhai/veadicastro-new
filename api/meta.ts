import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const META: Record<string, { title: string; description: string; canonical: string; breadcrumb: string; isBlog?: boolean }> = {
  '/': {
  title: 'AI Astrology — Free AI Chat, Daily Horoscope & Detailed Report | Veadicastro',
  description: "India's most accurate AI Astrology platform. Get personalized Kundli, daily health, wealth & self predictions, AI chat with Vedika — in Hindi & English. Plans from ₹149/month.",
  canonical: 'https://veadicastro.in/',
  breadcrumb: 'Home',
},
  '/free-ai-astrologer-chat': {
    title: 'Free AI Astrologer Chat — No Signup | Veadicastro',
    description: 'Get free AI astrology chat powered by Vedic birth chart. Instant kundli analysis, dasha predictions — no signup needed. Ask in Hindi or English.',
    canonical: 'https://veadicastro.in/free-ai-astrologer-chat',
    breadcrumb: 'Free AI Astrologer Chat',
  },
  '/ai-marriage-prediction-by-date-of-birth': {
    title: 'AI Marriage Prediction by Date of Birth | Free Marriage Astrology',
    description: 'Get an AI marriage prediction by date of birth with Vedika. Enter your birth details to check marriage timing, love or arranged marriage chances, relationship patterns, and simple remedies.',
    canonical: 'https://veadicastro.in/ai-marriage-prediction-by-date-of-birth',
    breadcrumb: 'AI Marriage Prediction by Date of Birth',
  },
  '/ai-career-prediction-by-date-of-birth': {
    title: 'AI Career Prediction by Date of Birth | Free Career Astrology',
    description: 'Get an AI career prediction by date of birth with Vedika. Enter your birth details to check career direction, growth timing, job vs business suitability, and simple remedies.',
    canonical: 'https://veadicastro.in/ai-career-prediction-by-date-of-birth',
    breadcrumb: 'AI Career Prediction by Date of Birth',
  },
  '/love-astrology-by-date-of-birth': {
    title: 'Free Love Astrology by Date of Birth – AI Relationship Predictions',
    description: 'Get an instant AI love astrology reading by date of birth. Vedika analyzes your 5th house, Venus, and dasha for relationship patterns and romantic outlook.',
    canonical: 'https://veadicastro.in/love-astrology-by-date-of-birth',
    breadcrumb: 'Free Love Astrology by Date of Birth',
  },
  '/ai-future-spouse-prediction': {
    title: 'AI Future Spouse Prediction — Discover Your Future Partner | Veadicastro',
    description: 'Discover your future spouse with Vedika AI. Get free spouse predictions, personality traits, relationship patterns, and marriage timing based on Vedic astrology.',
    canonical: 'https://veadicastro.in/ai-future-spouse-prediction',
    breadcrumb: 'AI Future Spouse Prediction',
  },
  '/free-5-minutes-astrology-ai': {
    title: 'Free 5 Minute Astrology AI Reading — Instant Vedic Predictions | Veadicastro',
    description: 'Get a free 5-minute Vedic astrology AI reading instantly. Enter birth details and get predictions from Vedika AI — no signup needed.',
    canonical: 'https://veadicastro.in/free-5-minutes-astrology-ai',
    breadcrumb: 'Free 5 Minutes Astrology AI',
  },
  '/free-kundli-generator': {
    title: 'Free Kundli Generator Online — Vedic Birth Chart | Veadicastro',
    description: 'Generate free Vedic kundli online. Accurate birth chart with planetary positions, houses, nakshatra and dasha periods.',
    canonical: 'https://veadicastro.in/free-kundli-generator',
    breadcrumb: 'Free Kundli Generator',
  },
  '/free-kundali-matching': {
    title: 'Free Kundali Matching — Vedic Marriage Compatibility | Veadicastro',
    description: 'Free kundali matching online. Check marriage compatibility based on Vedic astrology gun milan and birth chart analysis.',
    canonical: 'https://veadicastro.in/free-kundali-matching',
    breadcrumb: 'Free Kundali Matching',
  },
  '/kundali-matching': {
    title: 'Kundali Matching — Marriage Compatibility | Veadicastro',
    description: 'Check kundali matching for marriage. Vedic compatibility analysis based on gun milan, nakshatra and lagna.',
    canonical: 'https://veadicastro.in/kundali-matching',
    breadcrumb: 'Kundali Matching',
  },
  '/today-horoscope': {
    title: 'Today Horoscope — Free Daily Vedic Prediction | Veadicastro',
    description: 'Free daily horoscope for all 12 rashis based on Vedic astrology. AI-powered today horoscope in Hindi and English.',
    canonical: 'https://veadicastro.in/today-horoscope',
    breadcrumb: 'Today Horoscope',
  },
  '/angel-number-calculator': {
    title: 'Angel Number Calculator — Find Your Angel Number | Veadicastro',
    description: 'Free angel number calculator. Discover the spiritual meaning of your personal angel number instantly.',
    canonical: 'https://veadicastro.in/angel-number-calculator',
    breadcrumb: 'Angel Number Calculator',
  },
  '/lucky-colour-for-today': {
    title: 'Lucky Colour for Today — Vedic Astrology | Veadicastro',
    description: 'Find your lucky colour for today based on Vedic astrology and your birth chart. Daily lucky color predictions.',
    canonical: 'https://veadicastro.in/lucky-colour-for-today',
    breadcrumb: 'Lucky Colour for Today',
  },
  '/rashi-calculator-by-date-of-birth': {
    title: 'Rashi Calculator by Date of Birth — Find Your Vedic Moon Sign | Veadicastro',
    description: 'Free Rashi calculator by date of birth. Instantly find your Vedic moon sign (Chandra Rashi), sun sign, lagna, nakshatra, and dasha based on exact birth details using Swiss Ephemeris.',
    canonical: 'https://veadicastro.in/rashi-calculator-by-date-of-birth',
    breadcrumb: 'Rashi Calculator',
  },
  '/astrology-store': {
    title: 'Astrology Store — Spiritual Products from Haridwar | Veadicastro',
    description: 'Buy authentic spiritual and astrology products. Rudraksha, crystal bracelets, puja items sourced from Haridwar. Free delivery across India.',
    canonical: 'https://veadicastro.in/astrology-store',
    breadcrumb: 'Astrology Store',
  },
  '/dhan-yog-bracelet': {
    title: 'Dhan Yog Bracelet — Wealth & Prosperity Crystal | Veadicastro',
    description: 'Buy the Dhan Yog Bracelet for wealth intention and prosperity. Real crystals, puja energized, free delivery across India.',
    canonical: 'https://veadicastro.in/dhan-yog-bracelet',
    breadcrumb: 'Dhan Yog Bracelet',
  },
  '/dhan-yoga-bracelet': {
    title: 'Dhan Yoga Bracelet — Wealth & Prosperity Crystal | Veadicastro',
    description: 'Buy the Dhan Yoga Bracelet for wealth intention and prosperity. Real crystals, puja energized, free delivery across India.',
    canonical: 'https://veadicastro.in/dhan-yog-bracelet',
    breadcrumb: 'Dhan Yoga Bracelet',
  },
  '/chatgpt-astrology': {
    title: 'ChatGPT Astrology vs Vedic AI — Which is Better? | Veadicastro',
    description: 'ChatGPT astrology compared to real Vedic AI. See why Veadicastro gives more accurate astrology predictions than ChatGPT.',
    canonical: 'https://veadicastro.in/chatgpt-astrology',
    breadcrumb: 'ChatGPT Astrology',
  },
  '/ai-astrology-prediction': {
    title: 'AI Astrology Prediction — Free Vedic Forecast | Veadicastro',
    description: 'Get free AI astrology prediction based on your Vedic birth chart. Accurate 2026 forecasts powered by Vedika AI.',
    canonical: 'https://veadicastro.in/ai-astrology-prediction',
    breadcrumb: 'AI Astrology Prediction',
  },
  '/horoscope-by-date-of-birth': {
    title: 'Horoscope by Date of Birth - Free Vedic Astrology Predictions | Veadicastro',
    description: 'Discover your personality, career, love life, and future with free horoscope predictions by date of birth. Get personalized Vedic astrology insights from Vedika AI.',
    canonical: 'https://veadicastro.in/horoscope-by-date-of-birth',
    breadcrumb: 'Horoscope by Date of Birth',
  },
  '/ai-pandit': {
    title: 'AI Pandit - Free Online Vedic Astrology Guidance | Veadicastro',
    description: 'Get free AI Pandit consultation online. Discover personalized Vedic astrology insights for career, love, marriage, and life guidance with Vedika AI. Available 24/7.',
    canonical: 'https://veadicastro.in/ai-pandit',
    breadcrumb: 'AI Pandit',
  },
  '/hi-astro-alternative': {
    title: 'HiAstro Alternative — Free AI Astrology Chat | Veadicastro',
    description: 'Looking for HiAstro? Try Veadicastro — free AI astrology chat with real Vedic birth chart analysis, career & marriage predictions. No signup for first 2 questions.',
    canonical: 'https://veadicastro.in/hi-astro-alternative',
    breadcrumb: 'HiAstro Alternative',
  },
  '/kundligpt-alternative': {
    title: 'KundliGPT Alternative — Free AI Astrology Chat | Veadicastro',
    description: 'Best KundliGPT alternative. Get free AI astrology chat, Vedic kundli analysis, career & marriage predictions — powered by Swiss Ephemeris.',
    canonical: 'https://veadicastro.in/kundligpt-alternative',
    breadcrumb: 'KundliGPT Alternative',
  },
  '/astrology-by-date-of-birth': {
    title: 'Astrology by Date of Birth – Free AI Vedic Astrology Reading',
    description: 'Get a free AI-powered Vedic astrology reading by date of birth. Enter your birth date, time, place, ask your astrology question, and receive personalized insights from Vedika AI.',
    canonical: 'https://veadicastro.in/astrology-by-date-of-birth',
    breadcrumb: 'Astrology by Date of Birth',
  },
  '/ai-kundli-analysis': {
    title: 'AI Kundli Analysis Free — Vedic Birth Chart Reading | Veadicastro',
    description: 'Free AI Kundli analysis online. Vedika reads your complete birth chart — planets, doshas, yogas & dasha explained in simple language. No signup needed.',
    canonical: 'https://veadicastro.in/ai-kundli-analysis',
    breadcrumb: 'AI Kundli Analysis',
  },

  '/ai-astrology': {
    title: 'AI Astrology — Vedic Astrology Powered by AI | Veadicastro',
    description: 'Explore AI astrology with Veadicastro. Get accurate Vedic astrology predictions powered by artificial intelligence.',
    canonical: 'https://veadicastro.in/ai-astrology',
    breadcrumb: 'AI Astrology',
  },
  '/talk-to-astrologer': {
    title: 'Talk to Astrologer — Live Vedic Consultation | Veadicastro',
    description: 'Talk to an expert Vedic astrologer online. Get live consultation for career, marriage, health and life predictions.',
    canonical: 'https://veadicastro.in/talk-to-astrologer',
    breadcrumb: 'Talk to Astrologer',
  },
  '/about': {
    title: 'About Veadicastro — India\'s AI Astrology Platform',
    description: 'Learn about Veadicastro — India\'s most accurate AI-powered Vedic astrology platform combining ancient Jyotish with modern AI.',
    canonical: 'https://veadicastro.in/about',
    breadcrumb: 'About',
  },
  '/about-founder': {
    title: 'About the Founder — Veadicastro',
    description: 'Meet the founder of Veadicastro — the AI astrology platform combining Vedic knowledge with modern technology.',
    canonical: 'https://veadicastro.in/about-founder',
    breadcrumb: 'About Founder',
  },
  '/arpit-uniyal': {
    title: 'Arpit Uniyal — Founder of Veadicastro | AI Vedic Astrology',
    description: 'The story of why I built Veadicastro — an AI-powered Vedic astrology platform rooted in 300 years of authentic astrological knowledge. Written by founder Arpit Uniyal.',
    canonical: 'https://veadicastro.in/arpit-uniyal',
    breadcrumb: 'About Founder',
  },
  '/mission': {
    title: 'Our Mission — Veadicastro',
    description: 'Veadicastro\'s mission is to make authentic Vedic astrology accessible to everyone through AI technology.',
    canonical: 'https://veadicastro.in/mission',
    breadcrumb: 'Mission',
  },
  '/how-it-works': {
    title: 'How It Works — Veadicastro AI Astrology',
    description: 'Learn how Veadicastro\'s AI astrology works. Swiss Ephemeris calculations, Lahiri ayanamsa and Vedic prediction logic explained.',
    canonical: 'https://veadicastro.in/how-it-works',
    breadcrumb: 'How It Works',
  },
  '/contact': {
    title: 'Contact Us — Veadicastro',
    description: 'Contact the Veadicastro team for support, partnerships or feedback.',
    canonical: 'https://veadicastro.in/contact',
    breadcrumb: 'Contact',
  },
  '/blog': {
    title: 'Vedic Astrology Blog — AI Astrology Articles | Veadicastro',
    description: 'Read Veadicastro\'s Vedic astrology blog. Articles on AI astrology, kundli, predictions, zodiac signs and Jyotish.',
    canonical: 'https://veadicastro.in/blog',
    breadcrumb: 'Blog',
  },
  '/terms': {
    title: 'Terms of Service — Veadicastro',
    description: 'Read Veadicastro\'s terms of service and usage policy.',
    canonical: 'https://veadicastro.in/terms',
    breadcrumb: 'Terms',
  },
  '/privacy': {
    title: 'Privacy Policy — Veadicastro',
    description: 'Read Veadicastro\'s privacy policy. Learn how we collect, use and protect your data.',
    canonical: 'https://veadicastro.in/privacy',
    breadcrumb: 'Privacy Policy',
  },
  '/disclaimer': {
    title: 'Disclaimer — Veadicastro',
    description: 'Read Veadicastro\'s disclaimer about astrology predictions and AI-generated content.',
    canonical: 'https://veadicastro.in/disclaimer',
    breadcrumb: 'Disclaimer',
  },
  '/refund': {
    title: 'Refund Policy — Veadicastro',
    description: 'Read Veadicastro\'s refund and cancellation policy for paid plans.',
    canonical: 'https://veadicastro.in/refund',
    breadcrumb: 'Refund Policy',
  },

  // ── Blog Pages ──
  '/blog/vedic-astrology-ai-kese-kaam-karta-ha': {
    title: 'Vedic Astrology AI Kaise Kaam Karta Hai | Veadicastro',
    description: 'Jaaniye Vedic astrology AI kaise kaam karta hai. Kundli calculation se lekar prediction tak poori process Hindi mein.',
    canonical: 'https://veadicastro.in/blog/vedic-astrology-ai-kese-kaam-karta-ha',
    breadcrumb: 'Vedic Astrology AI Kaise Kaam Karta Hai',
    isBlog: true,
  },
  '/blog/top-10-vedic-astrology-platform': {
    title: 'Top 10 Vedic Astrology Platforms in India 2026 | Veadicastro',
    description: 'List of top 10 Vedic astrology platforms in India. Compare features, accuracy and pricing of the best AI astrology apps.',
    canonical: 'https://veadicastro.in/blog/top-10-vedic-astrology-platform',
    breadcrumb: 'Top 10 Vedic Astrology Platforms',
    isBlog: true,
  },
  '/blog/online-jyotishi-vs-ai-astrologer': {
    title: 'Online Jyotishi vs AI Astrologer — Which is Better? | Veadicastro',
    description: 'Compare online jyotishi with AI astrologer. Which gives more accurate Vedic astrology predictions in 2026?',
    canonical: 'https://veadicastro.in/blog/online-jyotishi-vs-ai-astrologer',
    breadcrumb: 'Online Jyotishi vs AI Astrologer',
    isBlog: true,
  },
  '/blog/ipl-2026-winner-prediction-astrology': {
    title: 'IPL 2026 Winner Prediction — Vedic Astrology | Veadicastro',
    description: 'IPL 2026 winner prediction through Vedic astrology. Team-by-team analysis and final pick by Veadicastro.',
    canonical: 'https://veadicastro.in/blog/ipl-2026-winner-prediction-astrology',
    breadcrumb: 'IPL 2026 Winner Prediction',
    isBlog: true,
  },
  '/blog/best-careers-for-each-zodiac-sign-in-2026': {
    title: 'Best Careers for Each Zodiac Sign in 2026 | Veadicastro',
    description: 'Discover the best career options for each zodiac sign in 2026 based on Vedic astrology planetary positions.',
    canonical: 'https://veadicastro.in/blog/best-careers-for-each-zodiac-sign-in-2026',
    breadcrumb: 'Best Careers for Each Zodiac Sign',
    isBlog: true,
  },
  '/blog/next-pm-india-2029-astrology-prediction': {
    title: 'Next PM of India 2029 — Astrology Prediction | Veadicastro',
    description: 'Vedic astrology prediction for the next Prime Minister of India in 2029. Planetary analysis and political forecast.',
    canonical: 'https://veadicastro.in/blog/next-pm-india-2029-astrology-prediction',
    breadcrumb: 'Next PM India 2029 Prediction',
    isBlog: true,
  },
  '/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis': {
    title: 'Rahu Ketu Transit 2026 — Predictions for All 12 Rashis | Veadicastro',
    description: 'Rahu Ketu transit 2026 predictions for all 12 rashis. How this major transit affects your life, career and relationships.',
    canonical: 'https://veadicastro.in/blog/rahu-ketu-transit-2026-predictions-for-all-12-rashis',
    breadcrumb: 'Rahu Ketu Transit 2026',
    isBlog: true,
  },
  '/blog/vedic-vs-western-astrology': {
    title: 'Vedic vs Western Astrology — Key Differences | Veadicastro',
    description: 'Compare Vedic and Western astrology. Key differences in calculation methods, zodiac systems and prediction accuracy.',
    canonical: 'https://veadicastro.in/blog/vedic-vs-western-astrology',
    breadcrumb: 'Vedic vs Western Astrology',
    isBlog: true,
  },
  '/blog/marriage-compatibility-based-on-your-zodiac-sign': {
    title: 'Marriage Compatibility Based on Zodiac Sign | Veadicastro',
    description: 'Find your marriage compatibility based on Vedic zodiac sign. Best and worst matches for each rashi.',
    canonical: 'https://veadicastro.in/blog/marriage-compatibility-based-on-your-zodiac-sign',
    breadcrumb: 'Marriage Compatibility Zodiac',
    isBlog: true,
  },
  '/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis': {
    title: 'Yearly Horoscope 2026 — All 12 Rashis Predictions | Veadicastro',
    description: 'Complete yearly horoscope 2026 for all 12 rashis. Career, love, health and finance predictions for each zodiac sign.',
    canonical: 'https://veadicastro.in/blog/yearly-horoscope-2026-complete-zodiac-predictions-for-all-12-rashis',
    breadcrumb: 'Yearly Horoscope 2026',
    isBlog: true,
  },
  '/blog/how-ai-is-transforming-vedic-astrology': {
    title: 'How AI is Transforming Vedic Astrology | Veadicastro',
    description: 'Discover how artificial intelligence is transforming Vedic astrology. AI kundli, predictions and personalized Jyotish.',
    canonical: 'https://veadicastro.in/blog/how-ai-is-transforming-vedic-astrology',
    breadcrumb: 'How AI is Transforming Vedic Astrology',
    isBlog: true,
  },
  '/blog/manglik-dosha-myths-vs-reality': {
    title: 'Manglik Dosha — Myths vs Reality | Veadicastro',
    description: 'Is Manglik Dosha real? Separate myths from reality with Vedic astrology facts about Mangal dosha and marriage.',
    canonical: 'https://veadicastro.in/blog/manglik-dosha-myths-vs-reality',
    breadcrumb: 'Manglik Dosha Myths vs Reality',
    isBlog: true,
  },
  '/blog/marriage-muhurat-2026': {
    title: 'Marriage Muhurat 2026 — Shubh Vivah Dates | Veadicastro',
    description: 'Best marriage muhurat dates in 2026. Shubh vivah dates based on Vedic astrology and panchang.',
    canonical: 'https://veadicastro.in/blog/marriage-muhurat-2026',
    breadcrumb: 'Marriage Muhurat 2026',
    isBlog: true,
  },
  '/blog/how-to-sleep-as-per-vastu-in-2026': {
    title: 'How to Sleep as Per Vastu in 2026 | Veadicastro',
    description: 'Learn the correct sleeping direction as per Vastu Shastra. Improve health and energy with Vastu-compliant sleep.',
    canonical: 'https://veadicastro.in/blog/how-to-sleep-as-per-vastu-in-2026',
    breadcrumb: 'How to Sleep as Per Vastu',
    isBlog: true,
  },
  '/blog/job-vs-business-what-your-chart-say': {
    title: 'Job vs Business — What Your Birth Chart Says | Veadicastro',
    description: 'Should you do a job or business? Find out what your Vedic birth chart says about career path and success.',
    canonical: 'https://veadicastro.in/blog/job-vs-business-what-your-chart-say',
    breadcrumb: 'Job vs Business Your Chart',
    isBlog: true,
  },
  '/blog/is-ai-astrology-accurate': {
    title: 'Is AI Astrology Accurate? — Honest Analysis | Veadicastro',
    description: 'Is AI astrology accurate? An honest analysis of AI-powered Vedic astrology predictions vs traditional astrologers.',
    canonical: 'https://veadicastro.in/blog/is-ai-astrology-accurate',
    breadcrumb: 'Is AI Astrology Accurate',
    isBlog: true,
  },
  '/blog/ai-jyotish-vedic-astrology': {
    title: 'AI Jyotish — Vedic Astrology Meets Artificial Intelligence | Veadicastro',
    description: 'Explore AI Jyotish — where traditional Vedic astrology meets modern artificial intelligence for accurate predictions.',
    canonical: 'https://veadicastro.in/blog/ai-jyotish-vedic-astrology',
    breadcrumb: 'AI Jyotish Vedic Astrology',
    isBlog: true,
  },
  '/blog/ai-astrologer-vs-human-astrologer': {
    title: 'AI Astrologer vs Human Astrologer — Who Wins? | Veadicastro',
    description: 'AI astrologer vs human astrologer comparison. Accuracy, cost, availability and which is better for Vedic predictions.',
    canonical: 'https://veadicastro.in/blog/ai-astrologer-vs-human-astrologer',
    breadcrumb: 'AI Astrologer vs Human Astrologer',
    isBlog: true,
  },
  '/blog/ai-astrology-real-or-fake': {
    title: 'Is AI Astrology Real or Fake? | Veadicastro',
    description: 'Is AI astrology real or fake? We analyze the science, accuracy and limitations of AI-powered astrology predictions.',
    canonical: 'https://veadicastro.in/blog/ai-astrology-real-or-fake',
    breadcrumb: 'AI Astrology Real or Fake',
    isBlog: true,
  },
  '/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt': {
    title: 'Why ChatGPT Fails at Astrology — Veadicastro vs ChatGPT | Veadicastro',
    description: 'Why ChatGPT fails at Vedic astrology predictions. Compare Veadicastro vs ChatGPT for accurate kundli analysis.',
    canonical: 'https://veadicastro.in/blog/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt',
    breadcrumb: 'Why ChatGPT Fails at Astrology',
    isBlog: true,
  },
  '/blog/ai-astrology-prediction-for-2026': {
    title: 'AI Astrology Prediction for 2026 | Veadicastro',
    description: 'AI astrology predictions for 2026. Major planetary transits, yearly forecast and life predictions powered by Vedika AI.',
    canonical: 'https://veadicastro.in/blog/ai-astrology-prediction-for-2026',
    breadcrumb: 'AI Astrology Prediction for 2026',
    isBlog: true,
  },
  '/blog/the-great-astrology-scam': {
    title: 'The Great Astrology Scam — Online Jyotishi Fraud Exposed | Veadicastro',
    description: 'Exposing the great astrology scam. How online jyotishis charge per minute and why AI astrology is the safer alternative.',
    canonical: 'https://veadicastro.in/blog/the-great-astrology-scam',
    breadcrumb: 'The Great Astrology Scam',
    isBlog: true,
  },
  '/blog/vedika-ai-astrologer-india': {
    title: 'Vedika AI Astrologer India — Meet Your Digital Jyotishi | Veadicastro',
    description: 'Meet Vedika — India\'s first AI Vedic astrologer. How Vedika AI gives accurate personalized predictions 24/7.',
    canonical: 'https://veadicastro.in/blog/vedika-ai-astrologer-india',
    breadcrumb: 'Vedika AI Astrologer India',
    isBlog: true,
  },
  '/blog/free-ai-astrology-chat-india': {
    title: 'Free AI Astrology Chat India — No Signup | Veadicastro',
    description: 'Free AI astrology chat in India. Get instant Vedic predictions in Hindi and English — no signup, no payment needed.',
    canonical: 'https://veadicastro.in/blog/free-ai-astrology-chat-india',
    breadcrumb: 'Free AI Astrology Chat India',
    isBlog: true,
  },
  '/blog/fifa-world-cup-2026-winner-astrology-prediction': {
    title: 'FIFA World Cup 2026 Winner Prediction: Vedic Astrology Analysis | Veadicastro',
    description: 'Vedic astrology says Spain wins FIFA World Cup 2026. Planet positions, team analysis and winner probability by Veadicastro.',
    canonical: 'https://veadicastro.in/blog/fifa-world-cup-2026-winner-astrology-prediction',
    breadcrumb: 'FIFA World Cup 2026 Prediction',
    isBlog: true,
  },
};

function buildHtml(meta: { title: string; description: string; canonical: string; breadcrumb: string; isBlog?: boolean }, pathname: string) {
  const breadcrumbItems = meta.isBlog
    ? [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://veadicastro.in' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://veadicastro.in/blog' },
        { '@type': 'ListItem', position: 3, name: meta.breadcrumb, item: meta.canonical },
      ]
    : pathname === '/'
    ? [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://veadicastro.in' }]
    : [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://veadicastro.in' },
        { '@type': 'ListItem', position: 2, name: meta.breadcrumb, item: meta.canonical },
      ];

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  });

  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf-8');

  html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);

  const inject = `
<meta name="description" content="${meta.description}"/>
<link rel="canonical" href="${meta.canonical}"/>
<meta property="og:title" content="${meta.title}"/>
<meta property="og:description" content="${meta.description}"/>
<meta property="og:url" content="${meta.canonical}"/>
<meta property="og:image" content="https://veadicastro.in/optimized/social-sharing.webp"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Veadicastro"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${meta.title}"/>
<meta name="twitter:description" content="${meta.description}"/>
<meta name="twitter:image" content="https://veadicastro.in/optimized/social-sharing.webp"/>
<meta name="robots" content="index, follow"/>
<script type="application/ld+json">${breadcrumbSchema}</script>`;

  html = html.replace('</head>', `${inject}\n</head>`);
  return html;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const rawPath = req.query.path as string || '';
  const pathname = rawPath ? `/${rawPath}` : '/';

  const ua = req.headers['user-agent'] || '';

  const isBot =
    /googlebot|google-inspectiontool|googleother|googleother-image|googleother-video|adsbot-google|mediapartners-google|apis-google|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|twitterbot|linkedinbot|whatsapp|telegrambot/i.test(
      ua
    );

  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  const rawHtml = fs.readFileSync(indexPath, 'utf-8');

  if (!isBot) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(rawHtml);
  }

  const meta = META[pathname];
  if (!meta) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(rawHtml);
  }

  const html = buildHtml(meta, pathname);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.setHeader('Vary', 'User-Agent');
  return res.send(html);
}
