const fs = require('fs');
const path = require('path');

// Blog files metadata
const blogMetadata = {
  'ai-astrology/ai-astrology-real-or-fake': {
    title: 'AI Astrology Real or Fake? The Truth About AI Jyotish',
    excerpt: 'Is AI astrology real or fake? Discover the truth about AI Jyotish, how it works, and whether it can accurately predict your future using Vedic astrology principles.'
  },
  'ai-astrology/ai-astrologer-vs-human-astrologer': {
    title: 'AI Astrologer vs Human Astrologer: Who is Better?',
    excerpt: 'Compare AI astrologer vs human astrologer. Find out which is more accurate, faster, and better for your Vedic astrology consultations.'
  },
  'ai-astrology/ai-jyotish-vedic-astrology': {
    title: 'AI Jyotish: The Future of Vedic Astrology',
    excerpt: 'Explore AI Jyotish and how artificial intelligence is revolutionizing Vedic astrology predictions and consultations.'
  },
  'ai-astrology/is-ai-astrology-accurate': {
    title: 'Is AI Astrology Accurate? Scientific Analysis',
    excerpt: 'Scientific analysis of AI astrology accuracy. Can AI really predict your future using Vedic astrology principles? Find out here.'
  },
  'ai-astrology/why-chatgpt-fails-at-ai-astrology-veadicastro-vs-chatgpt': {
    title: 'Why ChatGPT Fails at Astrology vs Veadicastro',
    excerpt: 'Why ChatGPT fails at astrology compared to Veadicastro. Discover the limitations of general AI in Vedic astrology predictions.'
  },
  'Best-Careers-for-Each-Zodiac-Sign-in-2026': {
    title: 'Best Careers for Each Zodiac Sign in 2026',
    excerpt: 'Discover the best careers for each zodiac sign in 2026. Find your perfect job based on your Vedic astrology chart.'
  },
  'How-AI-is-transforming-vedic-astrology': {
    title: 'How AI is Transforming Vedic Astrology',
    excerpt: 'Learn how AI is transforming Vedic astrology with accurate predictions, instant consultations, and personalized insights.'
  },
  'Marriage-Muhurat-2026': {
    title: 'Marriage Muhurat 2026: Best Wedding Dates',
    excerpt: 'Find the best marriage muhurat dates in 2026. Auspicious wedding timings based on Vedic astrology calculations.'
  },
  'Online-Jyotishi-vs-AI-Astrologer': {
    title: 'Online Jyotishi vs AI Astrologer: Which to Choose?',
    excerpt: 'Compare online Jyotishi vs AI astrologer services. Find the best option for accurate Vedic astrology consultations.'
  },
  'Yearly-Horoscope-2026-Complete-Zodiac-Predictions-for-All-12-Rashis': {
    title: 'Yearly Horoscope 2026: Complete Zodiac Predictions',
    excerpt: 'Complete yearly horoscope 2026 for all 12 rashis. Get detailed Vedic astrology predictions for the year ahead.'
  },
  'how-to-sleep-as-per-vastu-in-2026': {
    title: 'How to Sleep as Per Vastu in 2026',
    excerpt: 'Learn how to sleep as per Vastu principles in 2026. Best sleeping directions and positions according to Vastu Shastra.'
  },
  'ipl-2026-winner-prediction-astrology': {
    title: 'IPL 2026 Winner Prediction: Astrology Analysis',
    excerpt: 'IPL 2026 winner prediction based on Vedic astrology. Analysis of team charts, planetary positions, and match timings.'
  },
  'job-vs-business-what-your-chart-say': {
    title: 'Job vs Business: What Your Chart Says',
    excerpt: 'Should you do job or business? Discover what your Vedic astrology chart says about your career path.'
  },
  'manglik-dosha-myths-vs-reality': {
    title: 'Manglik Dosha: Myths vs Reality in Vedic Astrology',
    excerpt: 'Separate Manglik Dosha myths from reality. Understand the true impact and remedies in Vedic astrology.'
  },
  'marriage-Compatibility-Based-on-Your-Zodiac-Sign': {
    title: 'Marriage Compatibility Based on Your Zodiac Sign',
    excerpt: 'Find marriage compatibility based on your zodiac sign. Vedic astrology insights for perfect relationship matching.'
  },
  'next-pm-india-2029-astrology-prediction': {
    title: 'Next PM India 2029: Astrology Prediction',
    excerpt: 'Astrology prediction for next PM India 2029 elections. Vedic astrology analysis of political candidates and timing.'
  },
  'rahu-ketu-transit-2026-predictions-for-all-12-rashis': {
    title: 'Rahu Ketu Transit 2026: Predictions for All 12 Rashis',
    excerpt: 'Rahu Ketu transit 2026 predictions for all 12 rashis. Complete Vedic astrology analysis of this major planetary event.'
  },
  'top-10-vedic-astrology-platform': {
    title: 'Top 10 Vedic Astrology Platform Reviews',
    excerpt: 'Top 10 Vedic astrology platform reviews. Compare features, accuracy, and pricing of the best Jyotish services.'
  },
  'vedic-astrology-ai-kese-kaam-karta-ha': {
    title: 'Vedic Astrology AI Kaise Kaam Karta Hai? Complete Guide',
    excerpt: 'Vedic astrology AI kaise kaam karta hai? Complete guide in Hindi explaining AI Jyotish technology and predictions.'
  },
  'vedic-vs-western-astrology': {
    title: 'Vedic vs Western Astrology: Key Differences',
    excerpt: 'Compare Vedic vs Western astrology systems. Understand the key differences in calculations, predictions, and accuracy.'
  }
};

// Function to add metadata to blog files
function addMetadataToFile(filePath, metadata) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if metadata already exists
    if (content.includes('export const title =')) {
      console.log(`Metadata already exists in ${filePath}`);
      return;
    }
    
    // Add metadata at the end
    const metadataString = `
// SSG Metadata
export const title = "${metadata.title}";
export const excerpt = "${metadata.excerpt}";
`;
    
    const updatedContent = content + metadataString;
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Added metadata to ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all blog files
Object.entries(blogMetadata).forEach(([blogPath, metadata]) => {
  const filePath = path.join(__dirname, '../blogs', `${blogPath}.tsx`);
  addMetadataToFile(filePath, metadata);
});

console.log('Blog metadata addition completed!');
