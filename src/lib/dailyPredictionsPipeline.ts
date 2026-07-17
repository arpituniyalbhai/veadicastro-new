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
  natalAscendantSign: string
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
    const tp = transitPlanets.find((p) => p.key === key);
    if (!tp) return;

    const transitSignIdx = SIGN_NAMES.indexOf(tp.sign);
    if (transitSignIdx === -1 || natalAscIdx === -1) return;

    // Calculate Whole Sign house: House 1 is the sign of Ascendant
    const house = ((transitSignIdx - natalAscIdx + 12) % 12) + 1;
    const meaning = HOUSE_MEANINGS[house] || `house ${house}`;
    bullets.push(`${tp.name} transiting natal ${meaning}`);
  });

  // 2) Conjunctions in same sign
  transitPlanets.forEach((tp) => {
    natalPlanets.forEach((np) => {
      if (tp.sign === np.sign && tp.key !== np.key && ["sun", "moon", "venus", "mars", "jupiter", "saturn"].includes(tp.key)) {
        bullets.push(`${tp.name} conjunct natal ${np.name} in ${tp.sign}`);
      }
    });
  });

  // Return a sample of 3-4 bullets to keep prompt focused
  return bullets.slice(0, 4).map((b) => `- ${b}`).join("\n");
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

export function isValidPrediction(text: string, lang: string = "en"): boolean {
  if (!text) return false;
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 25 || wordCount > 45) return false;

  const lower = text.toLowerCase();
  const phrases = BANNED_PHRASES[lang] || BANNED_PHRASES.en;
  if (phrases.some((p) => lower.includes(p.toLowerCase()))) return false;

  return true;
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

  const systemPrompt = `You are a life prediction expert. Respond with valid JSON only:
{"love":"30-40 word prediction","career":"30-40 word prediction","health":"30-40 word prediction","wealth":"30-40 word prediction"}
STRICT: Do NOT mention astrology, planets, houses, dasha, transits, zodiac signs, or any Vedic terms in the output text.
STRICT: Never use these overused phrases: "new connection", "spark", "unexpected opportunity", "trust your instincts", "open your heart", "positive energy".
Base every prediction on the SPECIFIC influences given below — vary sentence structure and vocabulary each time, do not default to template phrasing.
Write as pure life predictions — natural, direct, practical statements about what is coming.
Each field exactly 30-40 words. Plain text, no markdown, no asterisks, no bold.
English only.`;

  const prompt = `Generate 4 short predictions for ${dateFormatted} based on:
${details ? `Birth: ${details.dob}, ${details.time}, ${details.place}` : "General chart"}
Today's key influences:
${transitSummary}

Love — what is coming in love and relationships:
Career — what is coming in career and work:
Health — what is coming in health and wellness:
Wealth — what is coming in money and finances:`;

  try {
    const response = await Promise.race([
      generateGemini(prompt, [], systemPrompt, lang, undefined, "secondary"),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timed out")), 25000)),
    ]);

    const start = response.indexOf("{");
    const end = response.lastIndexOf("}");
    let parsed: any = null;

    if (start !== -1 && end > start) {
      const block = response.slice(start, end + 1);
      try {
        parsed = JSON.parse(block);
      } catch {
        // Simple manual regex extraction
        const extractField = (f: string) => {
          const match = block.match(new RegExp(`"${f}"\\s*:\\s*"([^"]+)"`, "i"));
          return match ? match[1] : "";
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
      throw new Error("Invalid response format");
    }

    const result: PredictionPayload = {
      love: (parsed.love || "").trim(),
      career: (parsed.career || "").trim(),
      health: (parsed.health || "").trim(),
      wealth: (parsed.wealth || "").trim(),
      _dateKey: dateKey,
    };

    const keys: (keyof PredictionPayload)[] = ["love", "career", "health", "wealth"];
    const allValid = keys.every((k) => isValidPrediction(result[k] as string, lang));

    if (!allValid) {
      if (!isRetry) {
        console.warn("[Validation] Output invalid. Retrying once...");
        return generatePredictionSections(date, dateKey, details, natalPlanets, lang, true);
      } else {
        console.error("[Validation] Output still invalid after retry.");
        return null;
      }
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
