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
  const startHour = 6 + Math.floor(rng() * 10);
  const duration = 1 + Math.floor(rng() * 2);
  const fmt = (h: number) => {
    const p = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:00 ${p}`;
  };
  return { start: fmt(startHour), end: fmt(startHour + duration) };
}

export function getTimeLabel(uid: string, dateKey: string) {
  const seed = hashString(`${uid}_${dateKey}_label`);
  const rng = mulberry32(seed);
  return (["Best time","Good window","Favorable hours","Golden hour","Right time","Ideal window"])[Math.floor(rng() * 6)];
}

export const colorMap: Record<string, string> = {
  Purple: "bg-purple-500", Gold: "bg-yellow-500", Blue: "bg-blue-500",
  Emerald: "bg-emerald-500", Rose: "bg-rose-500", Amber: "bg-amber-500",
  Jade: "bg-green-600", Sapphire: "bg-indigo-600", Turquoise: "bg-cyan-500",
  Coral: "bg-orange-400",
};
