import { getTransitPositions, type PlanetEntry } from "./astroCalc";
import { generateGemini } from "./gemini";

export function cleanupOldCache() {
  const getLocalDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffKey = getLocalDateKey(cutoff);
  const cutoffTime = cutoff.getTime();

  Object.keys(localStorage).forEach((k) => {
    // 1) Match date-keyed items: e.g. suffix _YYYY-MM-DD
    const dateMatch = k.match(/_(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch && dateMatch[1] < cutoffKey) {
      localStorage.removeItem(k);
      return;
    }

    // 2) Match timestamp-keyed items: e.g. suffix _1776146690645
    const tsMatch = k.match(/_(\d{13})$/);
    if (tsMatch) {
      const timestamp = parseInt(tsMatch[1], 10);
      if (timestamp < cutoffTime) {
        localStorage.removeItem(k);
      }
    }
  });
}

const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const HOUSE_MEANINGS: Record<number, string> = {
  1: "1st house (self, identity, vitality)",
  2: "2nd house (wealth, speech, family resources)",
  3: "3rd house (efforts, short travels, communication)",
  4: "4th house (home, peace of mind, stability)",
  5: "5th house (creativity, romance, intellect)",
  6: "6th house (daily routines, wellness, overcoming obstacles)",
  7: "7th house (partnerships, relationships, business connection)",
  8: "8th house (transformation, sudden events, deep research)",
  9: "9th house (fortunes, wisdom, beliefs)",
  10: "10th house (career, social status, actions)",
  11: "11th house (gains, income, social circle)",
  12: "12th house (expenses, solitude, subconscious)",
};

export async function getOrComputeTodayTransits(dateKey: string, date: Date): Promise<PlanetEntry[]> {
  const cacheKey = `transit_positions_${dateKey}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("[Transit Cache] Read failed:", e);
  }

  console.log(`[Transit Cache] Computing transits for ${dateKey}`);
  const payload = await getTransitPositions(date);
  const planetsList = payload.planetsList || [];

  try {
    localStorage.setItem(cacheKey, JSON.stringify(planetsList));
  } catch (e) {
    console.error("[Transit Cache] Save failed:", e);
  }

  return planetsList;
}

export function getTransitToNatalSummary(
  transitPlanets: PlanetEntry[],
  natalPlanets: PlanetEntry[],
  natalAscendantSign: string,
  maxItems = 4,
): string {
  const natalAscIdx = SIGN_NAMES.indexOf(natalAscendantSign);
  const bullets: string[] = [];

  // Helper to find planet by key in lists
  const findPlanetSign = (list: PlanetEntry[], key: string): string => {
    const p = list.find((item) => item.key === key);
    return p ? p.sign : "";
  };

  // 1) Select key transits to highlight
  // Focus on fast transit (Moon) and major ones (Sun, Venus, Mars, Jupiter, Saturn)
  const keyTransitKeys = ["moon", "sun", "venus", "mars", "jupiter", "saturn"];

  keyTransitKeys.forEach((key) => {
    const tp = (transitPlanets || []).find((p) => p.key === key);
    if (!tp) return;

    const transitSignIdx = SIGN_NAMES.indexOf(tp.sign);
    if (transitSignIdx === -1 || natalAscIdx === -1) return;

    // Calculate Whole Sign house: House 1 is the sign of Ascendant
    const house = ((transitSignIdx - natalAscIdx + 12) % 12) + 1;
    const meaning = HOUSE_MEANINGS[house] || `house ${house}`;
    bullets.push(`${tp.name} transiting natal ${meaning}`);
  });

  // 2) Conjunctions in same sign
  (transitPlanets || []).forEach((tp) => {
    (natalPlanets || []).forEach((np) => {
      if (tp.sign === np.sign && tp.key !== np.key && ["sun", "moon", "venus", "mars", "jupiter", "saturn"].includes(tp.key)) {
        bullets.push(`${tp.name} conjunct natal ${np.name} in ${tp.sign}`);
      }
    });
  });

  // Daily predictions use the default compact summary; chat can request more
  // evidence for question-specific transit interpretation.
  return bullets.slice(0, maxItems).map((b) => `- ${b}`).join("\n");
}

export const BANNED_PHRASES: Record<string, string[]> = {
  en: [
    "new connection", "spark", "unexpected opportunity",
    "trust your instincts", "open your heart", "positive energy",
  ],
  hi: [
    "नया संबंध", "चिंगारी", "अवांछित अवसर", "अप्रत्याशित अवसर",
    "अपनी प्रवृत्ति पर भरोसा", "अपना दिल खोलें", "सकारात्मक ऊर्जा",
  ],
};

export function isValidPrediction(text: string, _lang: string = "en"): boolean {
  // Only require a non-empty string — let the AI be creative without hard rejections
  return typeof text === "string" && text.trim().length > 10;
}

export interface PredictionPayload {
  love: string;
  career: string;
  health: string;
  wealth: string;
  _dateKey: string;
}

export async function generatePredictionSections(
  date: Date,
  dateKey: string,
  details: any,
  natalPlanets: PlanetEntry[],
  lang: string = "en",
  isRetry = false
): Promise<PredictionPayload | null> {
  const dateFormatted = date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const transitPlanets = await getOrComputeTodayTransits(dateKey, date);
  const ascendantSign = details?.ascendant || details?.ascendantSign || "Aries";
  const transitSummary = getTransitToNatalSummary(transitPlanets, natalPlanets, ascendantSign);

  const systemPrompt = `You are a life prediction expert analyzing the user's specific astrology chart for the exact date provided. Respond with valid JSON only:
{"love":"30-40 word prediction","career":"30-40 word prediction","health":"30-40 word prediction","wealth":"30-40 word prediction"}
STRICT RULES:
1. Do NOT mention astrology, planets, houses, dasha, transits, zodiac signs, or any Vedic terms in the output text.
2. NO GENERIC ADVICE. Uniquely and properly analyze the user's specific astrological transit data for this exact date (${dateFormatted}). Ensure the predictions reflect the real astrological shifts happening at 12 AM today.
3. Never use generic or overused phrases: "new connection", "spark", "unexpected opportunity", "trust your instincts", "open your heart", "positive energy", "focus on".
4. Give specific, real-world, practical statements about what is coming based on the transits, rather than vague template phrasing. Vary vocabulary and sentence structure.
5. Each field exactly 30-40 words. Plain text, no markdown, no asterisks, no bold.
English only.`;

  const prompt = `Return ONLY the JSON object with EXACTLY these four keys: "love", "career", "health", "wealth".
Generate 4 short predictions for ${dateFormatted} based on:
${details ? `Birth: ${details.dob}, ${details.time}, ${details.place}` : "General chart"}
Today's key influences:
${transitSummary}

Use EXACTLY these keys:
- "love"
- "career"
- "health"
- "wealth"`;

  try {
    const response = await Promise.race([
      generateGemini(prompt, [], systemPrompt, lang, undefined, "secondary"),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timed out")), 25000)),
    ]);

    console.log("[Pipeline] Raw response:", response);
    const start = response.indexOf("{");
    const end = response.lastIndexOf("}");
    let parsed: any = null;

    if (start !== -1 && end > start) {
      const block = response.slice(start, end + 1);
      try {
        // Strip markdown backticks if inside the block
        const cleanBlock = block.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanBlock);
      } catch (e) {
        console.warn("[Pipeline] JSON Parse failed, trying regex...", e, "\\nBlock:", block);
        // Simple manual regex extraction
        const extractField = (f: string) => {
          // match capturing group across multiple lines
          const match = block.match(new RegExp(`"${f}"\\s*:\\s*"([\\s\\S]*?)"(?:\\s*,\\s*"|\\s*})`, "i"));
          if (match) return match[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
          
          // fallback if keys are unquoted or single quoted
          const match2 = block.match(new RegExp(`${f}\\s*:\\s*["']([\\s\\S]*?)["'](?:\\s*,|\\s*})`, "i"));
          return match2 ? match2[1].trim() : "";
        };
        parsed = {
          love: extractField("love"),
          career: extractField("career"),
          health: extractField("health"),
          wealth: extractField("wealth"),
        };
      }
    }

    if (!parsed || (!parsed.love && !parsed.career && !parsed.health && !parsed.wealth)) {
      console.error("[Pipeline] Parsed object empty or missing keys:", parsed);
      throw new Error("Invalid response format");
    }

    const result: PredictionPayload = {
      love: (parsed.love || "").trim(),
      career: (parsed.career || "").trim(),
      health: (parsed.health || "").trim(),
      wealth: (parsed.wealth || "").trim(),
      _dateKey: dateKey,
    };

    // Validate that all 4 keys have non-empty content
    const keys: (keyof PredictionPayload)[] = ["love", "career", "health", "wealth"];
    const missingKeys = keys.filter((k) => !isValidPrediction(result[k] as string, lang));
    if (missingKeys.length > 0) {
      console.warn("[Pipeline] Missing/empty keys:", missingKeys, "— still returning partial result.");
    }

    return result;
  } catch (err) {
    console.error("[Pipeline] Generation failed:", err);
    if (!isRetry) {
      return generatePredictionSections(date, dateKey, details, natalPlanets, lang, true);
    }
    return null;
  }
}

export interface DashboardPrediction {
  text: string;
  date: string;
  love: string;
  self: string;
  wealth: string;
  luckyNumber: number;
  luckyColor: string;
  mood: string;
  energy: number;
  _dateKey: string;
}

export async function generateDashboardPrediction(
  date: Date,
  dateKey: string,
  details: any,
  natalPlanets: PlanetEntry[],
  lang: string = "en",
  isRetry = false
): Promise<DashboardPrediction | null> {
  const sections = await generatePredictionSections(date, dateKey, details, natalPlanets, lang, isRetry);
  if (!sections) return null;

  // Stable but daily varying energy
  const energy = 60 + Math.floor((date.getDate() * 3 + date.getMonth() * 7) % 31);

  // Select a mood label
  const moods = ["Growth Day", "Productive Day", "Reflective Day", "Creative Day", "Action-oriented Day", "Balanced Day"];
  const mood = moods[(date.getDate() + date.getMonth()) % moods.length];

  return {
    text: `${sections.love} ${sections.career} ${sections.health} ${sections.wealth}`,
    date: dateKey,
    love: sections.love,
    self: sections.health,
    wealth: sections.wealth,
    luckyNumber: 0,
    luckyColor: "",
    mood,
    energy,
    _dateKey: dateKey
  };
}
