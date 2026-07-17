import { hashString, mulberry32 } from "./dailyInsights";

// ─── Month key ────────────────────────────────────────────────────────────────

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Lucky elements ───────────────────────────────────────────────────────────

const LUCKY_COLORS = [
  "Yellow", "Purple", "Gold", "Blue", "Emerald",
  "Rose", "Amber", "Jade", "Sapphire", "Turquoise", "Coral",
];
const LUCKY_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LUCKY_DIRECTIONS = [
  "North", "North-East", "East", "South-East",
  "South", "South-West", "West", "North-West",
];

export function getLuckyElements(uid: string, monthKey: string) {
  const seed = hashString(`${uid}_${monthKey}_monthly_lucky`);
  const rng = mulberry32(seed);
  return {
    luckyColor:     LUCKY_COLORS[Math.floor(rng() * LUCKY_COLORS.length)],
    luckyNumber:    1 + Math.floor(rng() * 9),
    luckyDay:       LUCKY_DAYS[Math.floor(rng() * LUCKY_DAYS.length)],
    luckyDirection: LUCKY_DIRECTIONS[Math.floor(rng() * LUCKY_DIRECTIONS.length)],
  };
}

// Color swatch map (Tailwind bg classes) for rendering lucky color swatches
export const monthlyColorMap: Record<string, string> = {
  Yellow:    "bg-yellow-400",
  Purple:    "bg-purple-500",
  Gold:      "bg-yellow-500",
  Blue:      "bg-blue-500",
  Emerald:   "bg-emerald-500",
  Rose:      "bg-rose-500",
  Amber:     "bg-amber-500",
  Jade:      "bg-green-600",
  Sapphire:  "bg-indigo-600",
  Turquoise: "bg-cyan-500",
  Coral:     "bg-orange-400",
};

// ─── Life scores ──────────────────────────────────────────────────────────────

export interface LifeScores {
  love:          number;
  career:        number;
  wealth:        number;
  health:        number;
  relationships: number;
  luck:          number;
  growth:        number;
}

export function getLifeScores(uid: string, monthKey: string): LifeScores {
  const seed = hashString(`${uid}_${monthKey}_life_scores`);
  const rng = mulberry32(seed);
  const roll = () => 45 + Math.floor(rng() * 51);
  return {
    love:          roll(),
    career:        roll(),
    wealth:        roll(),
    health:        roll(),
    relationships: roll(),
    luck:          roll(),
    growth:        roll(),
  };
}

export function getOverallScore(scores: LifeScores): number {
  const vals = Object.values(scores) as number[];
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  return "Challenging";
}

export function overallLabel(score: number): string {
  if (score >= 85) return "Excellent Month";
  if (score >= 70) return "Good Month";
  if (score >= 55) return "Balanced Month";
  return "Slow Month";
}

// ─── Star helpers ─────────────────────────────────────────────────────────────

export function starsFromScore(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score / 20)));
}

export function renderStars(count: number, max = 5): string {
  const c = Math.max(0, Math.min(count, max));
  return "★".repeat(c) + "☆".repeat(Math.max(0, max - c));
}

// ─── Weekly timeline ──────────────────────────────────────────────────────────

export interface WeekEntry {
  week:  string;
  stars: number;
  label: string;
}

export function getWeeklyTimeline(uid: string, monthKey: string): WeekEntry[] {
  const seed = hashString(`${uid}_${monthKey}_weekly_timeline`);
  const rng = mulberry32(seed);
  const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  return weekLabels.map((week) => {
    const stars = 2 + Math.floor(rng() * 4);
    const label = stars >= 5 ? "Excellent" : stars >= 4 ? "Good" : stars >= 3 ? "Average" : "Slow";
    return { week, stars, label };
  });
}

// ─── Planetary influence ──────────────────────────────────────────────────────

export interface PlanetEntry {
  planet: string;
  stars:  number;
  effect: string;
}

const FIXED_PLANETS = ["Jupiter", "Mercury", "Venus", "Saturn"];

export function getPlanetaryInfluence(uid: string, monthKey: string): PlanetEntry[] {
  const seed = hashString(`${uid}_${monthKey}_planetary_influence`);
  const rng = mulberry32(seed);
  return FIXED_PLANETS.map((planet) => {
    const stars  = 1 + Math.floor(rng() * 5);
    const effect = stars >= 4 ? "Favourable" : stars >= 3 ? "Neutral" : "Challenging";
    return { planet, stars, effect };
  });
}
