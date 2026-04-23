// Gemini API Service for generating astrology content
// SECURITY: All API calls go through backend proxy (/api/gemini)
// Frontend NEVER exposes Gemini API key

export interface AstrologyData {
  zodiacSign?: string;
  moonSign?: string;
  ascendant?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  nakshatras?: string[];
}

const SYSTEM_PROMPTS = {
  yourFuture: `You are an expert Vedic astrologer with 20+ years of experience. Based on the user's astrological data, provide a detailed "Your Future" guidance that includes:
1. Career and professional growth opportunities in the next 6-12 months
2. Relationship and personal life predictions
3. Financial outlook and wealth creation opportunities
4. Health and wellness recommendations
5. Spiritual growth and personal development path
6. Key dates and planetary transits to watch out for
7. Remedial measures and gemstone recommendations

CRITICAL PERSONALIZATION REQUIREMENTS:
- EVERY prediction must name the specific planet, house, and nakshatra causing it
- Never use generic advice that applies to everyone
- Always reference exact planetary positions from the user's birth chart
- Each prediction must be unique to the user's specific astrological configuration
- Avoid vague statements like "you may face challenges" - specify which planet/house causes what

Keep the response between 300-400 words, practical, and actionable. Use a warm, encouraging tone.`,

  lifeInstruction: `You are a wise Vedic astrology guide. Based on the user's birth chart and astrological positions, provide "Life Instruction" that includes:
1. Life purpose and soul mission based on their chart
2. Natural talents and strengths to leverage
3. Challenges to overcome and how to handle them
4. Best career paths aligned with their astrological profile
5. Relationship dynamics and compatibility insights
6. Daily practices and rituals for spiritual alignment
7. Decision-making guidance for major life choices

CRITICAL PERSONALIZATION REQUIREMENTS:
- EVERY prediction must name the specific planet, house, and nakshatra causing it
- Never use generic advice that applies to everyone
- Always reference exact planetary positions from the user's birth chart
- Each prediction must be unique to the user's specific astrological configuration
- Avoid vague statements like "you may face challenges" - specify which planet/house causes what

Keep the response between 300-400 words, inspiring, and deeply insightful. Use Sanskrit terms where appropriate.`,

  astroDetails: `You are a Vedic astrology expert. Provide a comprehensive astrological analysis including:
1. Detailed birth chart interpretation
2. Planetary positions and their significance
3. Dasha (planetary periods) and their effects
4. Yogas (auspicious combinations) in the chart
5. Doshas (afflictions) and remedies
6. Strengths and weaknesses based on planetary placements
7. Recommendations for personal growth and success

CRITICAL PERSONALIZATION REQUIREMENTS:
- EVERY prediction must name the specific planet, house, and nakshatra causing it
- Never use generic advice that applies to everyone
- Always reference exact planetary positions from the user's birth chart
- Each prediction must be unique to the user's specific astrological configuration
- Avoid vague statements like "you may face challenges" - specify which planet/house causes what

Keep the response detailed, technical yet understandable, between 400-500 words.`,
};

export async function generateAstrologyContent(
  contentType: "yourFuture" | "lifeInstruction" | "astroDetails",
  astrologyData: AstrologyData
): Promise<string> {
  try {
    const userPrompt = `
User's Astrological Data:
- Zodiac Sign: ${astrologyData.zodiacSign || "Not provided"}
- Moon Sign: ${astrologyData.moonSign || "Not provided"}
- Ascendant: ${astrologyData.ascendant || "Not provided"}
- Birth Date: ${astrologyData.birthDate || "Not provided"}
- Birth Time: ${astrologyData.birthTime || "Not provided"}
- Birth Location: ${astrologyData.birthLocation || "Not provided"}
- Nakshatras: ${astrologyData.nakshatras?.join(", ") || "Not provided"}

Please provide the ${contentType === "yourFuture" ? "Your Future guidance" : contentType === "lifeInstruction" ? "Life Instruction" : "Astrological Details"} based on this data.
    `;

    // SECURITY: Call backend proxy instead of direct API
    const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || '';
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
        systemExtra: SYSTEM_PROMPTS[contentType],
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.statusText);
      return getDefaultContent(contentType);
    }

    const data = await response.json();
    const content = data.text;

    if (!content) {
      console.error("No content generated from Gemini");
      return getDefaultContent(contentType);
    }

    return content;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return getDefaultContent(contentType);
  }
}

function getDefaultContent(contentType: string): string {
  const defaults: Record<string, string> = {
    yourFuture: `Your future is bright with opportunities ahead. The planetary alignments suggest positive developments in your career and personal relationships. Focus on your strengths and trust the cosmic guidance. Remember that your actions today shape your tomorrow.`,
    lifeInstruction: `Your life path is guided by cosmic forces. Embrace your natural talents and work on your challenges with patience and perseverance. Listen to your inner wisdom and follow your intuition. The universe supports those who align with their true purpose.`,
    astroDetails: `Your birth chart reveals a unique cosmic blueprint. Each planet in your chart influences different aspects of your life. Study your chart deeply to understand your strengths and work on your areas of growth. Consult with an experienced astrologer for personalized guidance.`,
  };

  return defaults[contentType] || defaults.yourFuture;
}

// Cache for generated content to avoid repeated API calls
const contentCache: Record<string, { content: string; timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedAstrologyContent(
  contentType: "yourFuture" | "lifeInstruction" | "astroDetails",
  astrologyData: AstrologyData
): Promise<string> {
  const cacheKey = `${contentType}_${JSON.stringify(astrologyData)}`;
  const cached = contentCache[cacheKey];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.content;
  }

  const content = await generateAstrologyContent(contentType, astrologyData);
  contentCache[cacheKey] = { content, timestamp: Date.now() };

  return content;
}
