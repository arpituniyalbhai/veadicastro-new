export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function mulberry32(seed: number): () => number {
  let t = seed;
  return function () {
    t += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDailyLuckyData(uid: string, dateKey: string) {
  const seed = hashString(`${uid}_${dateKey}`);
  const rng = mulberry32(seed);
  return {
    energy: 40 + Math.floor(rng() * 56),
    luckyColor: (["Purple","Gold","Blue","Emerald","Rose","Amber","Jade","Sapphire","Turquoise","Coral"])[Math.floor(rng() * 10)],
    luckyNumber: 1 + Math.floor(rng() * 9),
  };
}

export function getAuspiciousWindow(uid: string, dateKey: string, place: string) {
  const seed = hashString(`${uid}_${dateKey}_${place}_time`);
  const rng = mulberry32(seed);
  const startHour = 4 + Math.floor(rng() * 18);
  const duration = 1 + Math.floor(rng() * 4);
  const fmt = (h: number) => {
    const p = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:00 ${p}`;
  };
  return { start: fmt(startHour), end: fmt(startHour + duration), startHour, endHour: startHour + duration };
}

export function getTimeInfo(uid: string, dateKey: string) {
  const seed = hashString(`${uid}_${dateKey}_time_info`);
  const rng = mulberry32(seed);
  const isBad = rng() > 0.5;
  if (isBad) {
    const labels = ["Bad timing", "Kaal", "Inauspicious", "Avoid this time", "Not favorable"];
    return { label: labels[Math.floor(rng() * labels.length)], isBad: true };
  }
  const labels = ["Subh timing", "Good time", "Best time", "Favorable hours", "Golden hour", "Right time"];
  return { label: labels[Math.floor(rng() * labels.length)], isBad: false };
}

export const colorMap: Record<string, string> = {
  Purple: "bg-purple-500", Gold: "bg-yellow-500", Blue: "bg-blue-500",
  Emerald: "bg-emerald-500", Rose: "bg-rose-500", Amber: "bg-amber-500",
  Jade: "bg-green-600", Sapphire: "bg-indigo-600", Turquoise: "bg-cyan-500",
  Coral: "bg-orange-400",
};

// ─── Shared AI JSON helpers ───────────────────────────────────────────────────

/**
 * Sanitize raw LLM output before JSON.parse — handles control chars,
 * Devanagari digits, smart-quotes, and raw newlines inside strings.
 */
export function sanitizeModelJson(raw: string): string {
  let cleaned = raw
    .replace(/[\u0000-\u001f]+/g, " ")
    .replace(/[\u0966-\u096F]/g, (d) => "0123456789"["\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F".indexOf(d)])
    .replace(/[\u3001]/g, ",")
    .replace(/[""'']/g, '"')
    .replace(/[`]/g, "'");
  cleaned = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
    const inner = match.slice(1, -1).replace(/\r?\n/g, "\\n");
    return `"${inner}"`;
  });
  return cleaned;
}

/**
 * Regex fallback to extract a single top-level string field from raw JSON text.
 * Only use for flat (non-nested) fields — not reliable on nested JSON.
 */
export function extractField(text: string, field: string): string {
  const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, "i");
  const match = text.match(regex);
  if (!match) return "";
  return match[1].replace(/\\n/g, " ").replace(/\\"/g, '"').trim();
}
