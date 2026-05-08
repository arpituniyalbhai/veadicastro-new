import SwissEPH from "sweph-wasm";

export type AstroInput = {
  day: number;
  month: number;
  year: number;
  hour: number;
  min: number;
  lat: number;
  lon: number;
  tzone?: number;
  sec?: number;
};

export type PlanetEntry = {
  key: string;
  name: string;
  planet: string;
  longitude: number;
  latitude: number;
  distance: number | null;
  speed: number | null;
  sign: string;
  signIndex: number;
  nakshatra: {
    name: string;
    index: number;
    pada: number;
  };
};

export type AstroPayload = {
  planets: Record<string, PlanetEntry>;
  planetsList: PlanetEntry[];
  ascendant: number;
  ascendantSign: string;
  houses: number[];
  julianDayUT: number;
  julianDayET: number;
  nakshatra: { name: string; index: number; pada: number } | null;
  moonSign: string | null;
  sunSign: string | null;
  lagnaSign: string;
};

const SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const NAKSHATRA_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashirsha",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

const NAKSHATRA_LORDS = [
  "Ketu",     // Ashwini
  "Venus",    // Bharani
  "Sun",      // Krittika
  "Moon",     // Rohini
  "Mars",     // Mrigashirsha
  "Rahu",     // Ardra
  "Jupiter",  // Punarvasu
  "Saturn",   // Pushya
  "Mercury",  // Ashlesha
  "Ketu",     // Magha
  "Venus",    // Purva Phalguni
  "Sun",      // Uttara Phalguni
  "Moon",     // Hasta
  "Mars",     // Chitra
  "Rahu",     // Swati
  "Jupiter",  // Vishakha
  "Saturn",   // Anuradha
  "Mercury",  // Jyeshtha
  "Ketu",     // Mula
  "Venus",    // Purva Ashadha
  "Sun",      // Uttara Ashadha
  "Moon",     // Shravana
  "Mars",     // Dhanishta
  "Rahu",     // Shatabhisha
  "Jupiter",  // Purva Bhadrapada
  "Saturn",   // Uttara Bhadrapada
  "Mercury",  // Revati
];

const YONI_TYPES = [
  "Horse",        // Ashwini
  "Elephant",     // Bharani
  "Sheep",        // Krittika
  "Serpent",      // Rohini
  "Serpent",      // Mrigashirsha
  "Dog",          // Ardra
  "Cat",          // Punarvasu
  "Goat",         // Pushya
  "Cat",          // Ashlesha
  "Rat",          // Magha
  "Rat",          // Purva Phalguni
  "Cow",          // Uttara Phalguni
  "Buffalo",      // Hasta
  "Tiger",        // Chitra
  "Buffalo",      // Swati
  "Tiger",        // Vishakha
  "Deer",         // Anuradha
  "Deer",         // Jyeshtha
  "Dog",          // Mula
  "Lion",         // Purva Ashadha
  "Cow",          // Uttara Ashadha
  "Monkey",       // Shravana
  "Lion",         // Dhanishta
  "Horse",        // Shatabhisha
  "Lion",         // Purva Bhadrapada
  "Elephant",     // Uttara Bhadrapada
  "Horse",        // Revati
];

type SwissEphInstance = Awaited<ReturnType<typeof SwissEPH.init>>;

type PlanetConfig = {
  key: string;
  label: string;
  resolver?: (swe: SwissEphInstance) => number;
  derivedFrom?: string;
  isNode?: boolean;
};

const PLANET_SEQUENCE: PlanetConfig[] = [
  { key: "sun", label: "Sun", resolver: (swe) => swe.SE_SUN },
  { key: "moon", label: "Moon", resolver: (swe) => swe.SE_MOON },
  { key: "mercury", label: "Mercury", resolver: (swe) => swe.SE_MERCURY },
  { key: "venus", label: "Venus", resolver: (swe) => swe.SE_VENUS },
  { key: "mars", label: "Mars", resolver: (swe) => swe.SE_MARS },
  { key: "jupiter", label: "Jupiter", resolver: (swe) => swe.SE_JUPITER },
  { key: "saturn", label: "Saturn", resolver: (swe) => swe.SE_SATURN },
  { key: "rahu", label: "Rahu", resolver: (swe) => swe.SE_MEAN_NODE, isNode: true },
  { key: "ketu", label: "Ketu", derivedFrom: "rahu" },
];

let swePromise: Promise<SwissEphInstance> | null = null;

const getSwe = async (): Promise<SwissEphInstance> => {
  // Check if WASM was preloaded from Welcome page
  if (typeof window !== "undefined" && (window as any).preloadedSwe) {
    return (window as any).preloadedSwe;
  }
  
  if (!swePromise) {
    swePromise = (async () => {
      const wasmUrl = typeof window !== "undefined" ? "/swisseph.wasm" : undefined;
      const swe = await SwissEPH.init(wasmUrl);
      await swe.swe_set_ephe_path();
      swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
      (window as any).preloadedSwe = swe; // Store for future use
      return swe;
    })();
  }
  return swePromise;
};

const normalizeDegree = (value = 0) => {
  let deg = value % 360;
  if (deg < 0) deg += 360;
  return deg;
};

const getSign = (deg: number) => {
  const normalized = normalizeDegree(deg);
  const index = Math.floor(normalized / 30) % 12;
  return { name: SIGN_NAMES[index], index };
};

const getNakshatra = (deg: number) => {
  const normalized = normalizeDegree(deg);
  const segment = 13.3333333333;
  const padaSize = segment / 4;
  const index = Math.floor(normalized / segment) % 27;
  const pada = Math.floor(((normalized % segment) / padaSize)) + 1;
  return {
    name: NAKSHATRA_NAMES[index],
    index,
    pada: Math.min(Math.max(pada, 1), 4),
  };
};

const getNakshatraLord = (nakshatraIndex: number) => {
  return NAKSHATRA_LORDS[nakshatraIndex] || "Unknown";
};

const getYoni = (nakshatraIndex: number) => {
  return YONI_TYPES[nakshatraIndex] || "Unknown";
};

const buildPlanetEntry = (
  label: string,
  key: string,
  longitude: number,
  latitude: number,
  distance: number | null,
  speed: number | null
): PlanetEntry => {
  const sign = getSign(longitude);
  const nakshatra = getNakshatra(longitude);
  return {
    key,
    name: label,
    planet: label,
    longitude: normalizeDegree(longitude),
    latitude: latitude ?? 0,
    distance: distance ?? null,
    speed: speed ?? null,
    sign: sign.name,
    signIndex: sign.index,
    nakshatra: {
      name: nakshatra.name,
      index: nakshatra.index,
      pada: nakshatra.pada,
    },
  };
};

const convertToUtcParts = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  tzone: number
) => {
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second || 0) - tzone * 3600000;
  const utc = new Date(utcMs);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
    hour: utc.getUTCHours(),
    minute: utc.getUTCMinutes(),
    second: utc.getUTCSeconds() + utc.getUTCMilliseconds() / 1000,
  };
};

export const getPlanetaryData = async (input: AstroInput): Promise<AstroPayload> => {
  const tzone = typeof input.tzone === "number" ? input.tzone : -new Date().getTimezoneOffset() / 60;
  const details = { ...input, tzone };

  if (typeof window === "undefined") {
    throw new Error("getPlanetaryData must be run in the browser environment.");
  }

  const swe = await getSwe();
  const utcParts = convertToUtcParts(
    details.year,
    details.month,
    details.day,
    details.hour,
    details.min,
    details.sec ?? 0,
    details.tzone
  );
  const [julianET, julianUT] = swe.swe_utc_to_jd(
    utcParts.year,
    utcParts.month,
    utcParts.day,
    utcParts.hour,
    utcParts.minute,
    utcParts.second,
    swe.SE_GREG_CAL
  );

  const houses = swe.swe_houses(julianUT, details.lat, details.lon, "P");
  const ascendant = normalizeDegree(houses.ascmc?.[0] ?? 0);
  const ascendantSign = getSign(ascendant).name;
  const houseCusps = Array.from({ length: 12 }, (_, idx) => normalizeDegree(houses.cusps?.[idx] ?? 0));

  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
  const planetMap: Record<string, PlanetEntry> = {};
  const planetList: PlanetEntry[] = [];

  let rahuData: PlanetEntry | null = null;

  for (const config of PLANET_SEQUENCE) {
    if (config.derivedFrom === "rahu" && rahuData) {
      const ketuLongitude = normalizeDegree(rahuData.longitude + 180);
      const entry = buildPlanetEntry(
        config.label,
        config.key,
        ketuLongitude,
        -rahuData.latitude,
        rahuData.distance ?? null,
        rahuData.speed ?? null
      );
      planetMap[config.key] = entry;
      planetList.push(entry);
      continue;
    }

    if (!config.resolver) {
      continue;
    }
    const planetId = config.resolver(swe);
    const values = swe.swe_calc_ut(julianUT, planetId, flags) as unknown as Float64Array;
    const entry = buildPlanetEntry(config.label, config.key, values[0], values[1], values[2], values[3]);
    planetMap[config.key] = entry;
    planetList.push(entry);
    if (config.key === "rahu") {
      rahuData = entry;
    }
  }

  const moonData = planetMap.moon || null;
  const sunData = planetMap.sun || null;
  const moonNakshatra = moonData ? moonData.nakshatra : null;

  return {
    planets: planetMap,
    planetsList: planetList,
    ascendant,
    ascendantSign,
    houses: houseCusps,
    julianDayUT: julianUT,
    julianDayET: julianET,
    nakshatra: moonNakshatra ? { name: moonNakshatra.name, index: moonNakshatra.index, pada: moonNakshatra.pada } : null,
    moonSign: moonData?.sign || null,
    sunSign: sunData?.sign || null,
    lagnaSign: ascendantSign,
  };
};

// Export helper functions for external use
export { getNakshatraLord, getYoni };
