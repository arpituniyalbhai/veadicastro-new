import type { AstroPayload } from "./astroCalc";

export type BirthDetails = {
  name: string;
  date: string; // yyyy-mm-dd
  time?: string; // HH:mm
  place?: string;
  lat?: number;
  lon?: number;
  tzone?: number | null;
  gender?: string;
  photo?: string; // data URL or URL
};

export type AstroDetail = { label: string; value: string };

export type MemberRecord = BirthDetails & {
  id: string;
  createdAt: number;
  details: AstroDetail[];
  astroPayload?: AstroPayload | null;
};

const COLOURS = ["Purple", "Gold", "Blue", "Emerald", "Crimson", "Indigo", "Teal", "Amber", "Rose"];

const randomDetailFromSeed = (seedText: string | null): AstroDetail[] => {
  const base: AstroDetail[] = [
    { label: "Sun Sign", value: "Scorpio • Transformative focus" },
    { label: "Moon Sign", value: "Taurus • Emotional steadiness" },
    { label: "Ascendant", value: "Leo • Leadership aura" },
    { label: "Lucky Number", value: "7" },
    { label: "Lucky Colour", value: "Purple" },
    { label: "Current Dasha", value: "Shani (Saturn) • Practice patience" },
    { label: "Transit Highlight", value: "Jupiter trine Sun • Growth window" },
    { label: "Career", value: "Strategic projects favor you" },
    { label: "Relationships", value: "Speak gently, listen more" },
    { label: "Wealth", value: "Steady gains through discipline" },
    { label: "Health", value: "Mindful routines restore energy" },
  ];
  if (seedText) {
    const hash = Array.from(seedText).reduce((a, c) => a + c.charCodeAt(0), 0);
    const mod = (n: number) => (hash % n);
    base[3].value = String(1 + mod(9));
    base[4].value = COLOURS[mod(COLOURS.length)];
  }
  return base;
};

const buildDetailsFromPayload = (payload?: AstroPayload | null): AstroDetail[] => {
  if (!payload) {
    return randomDetailFromSeed(null);
  }
  const planets = payload.planets || {};
  const sun = planets.sun;
  const moon = planets.moon;
  const lagna = payload.ascendantSign;
  const rahu = planets.rahu;
  const jupiter = planets.jupiter;
  return [
    { label: "Sun Sign", value: sun?.sign ? `${sun.sign} • ${sun.nakshatra?.name ?? "Solar focus"}` : "—" },
    { label: "Moon Sign", value: moon?.sign ? `${moon.sign} • ${moon.nakshatra?.name ?? "Mind focus"}` : "—" },
    { label: "Ascendant", value: lagna ?? "—" },
    {
      label: "Lucky Number",
      value: COLOURS.indexOf(moon?.nakshatra?.name ?? "") >= 0 ? String(COLOURS.indexOf(moon?.nakshatra?.name ?? "") + 1) : "7",
    },
    {
      label: "Lucky Colour",
      value: COLOURS[Math.abs(Math.floor((moon?.nakshatra?.index ?? 0) + (sun?.nakshatra?.index ?? 0))) % COLOURS.length],
    },
    {
      label: "Transit Highlight",
      value: jupiter?.sign ? `Jupiter in ${jupiter.sign} • Growth zone` : "Fresh cosmic winds ahead",
    },
    {
      label: "Focus Area",
      value: rahu?.sign ? `Rahu highlights ${rahu.sign.toLowerCase()} matters` : "Work with your north node lessons",
    },
  ];
};

export function buildMemberRecord(b: BirthDetails, astro?: AstroPayload | null): MemberRecord {
  const details = astro ? buildDetailsFromPayload(astro) : randomDetailFromSeed(`${b.name}|${b.date}|${b.time}|${b.place}`);
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...b,
    createdAt: Date.now(),
    details,
    astroPayload: astro ?? null,
  };
}

export function loadMembers(): MemberRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("members") || "[]") as MemberRecord[];
  } catch {
    return [];
  }
}

export function saveMembers(members: MemberRecord[]) {
  try {
    localStorage.setItem("members", JSON.stringify(members));
  } catch {
    /* ignore */
  }
}
