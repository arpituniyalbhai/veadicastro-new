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
  retrograde: boolean;
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
  dasha: {
    mahadasha: string;
    antardasha: string;
    mahaEnds: string;
    antarEnds: string;
    nextMahadasha: string;
  };
  houseLords: string[];
  astro_locked: boolean;
  source: string;
  planetHouseMap: Record<string, number>;
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

const SIGN_LORDS: Record<string, string> = {
  "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
  "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
  "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
};

const DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

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
    retrograde: (speed ?? 0) < 0,
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

const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  const wholeYears = Math.floor(years);
  const fractionalYears = years - wholeYears;
  result.setFullYear(result.getFullYear() + wholeYears);
  result.setDate(result.getDate() + Math.round(fractionalYears * 365.25));
  return result;
};

const calculateDasha = (utcParts: any, moonNakshatraIndex: number, moonLongitude: number) => {
  const NAKSHATRA_SIZE = 13.3333333333;
  const moonPositionInNakshatra = moonLongitude % NAKSHATRA_SIZE;
  const fractionElapsed = moonPositionInNakshatra / NAKSHATRA_SIZE;
  const fractionRemaining = 1 - fractionElapsed;

  const birthDashaLord = NAKSHATRA_LORDS[moonNakshatraIndex] || 'Ketu';
  const birthDashaTotalYears = DASHA_YEARS[birthDashaLord];
  const birthDashaRemainingYears = birthDashaTotalYears * fractionRemaining;

  const exactBirthDate = new Date(Date.UTC(utcParts.year, utcParts.month - 1, utcParts.day, utcParts.hour, utcParts.minute, Math.floor(utcParts.second)));
  const currentDate = new Date();

  const dashaStartIndex = DASHA_SEQUENCE.indexOf(birthDashaLord);
  let dashaStart = new Date(exactBirthDate);
  let dashaEnd = addYears(exactBirthDate, birthDashaRemainingYears);
  let idx = Math.max(0, dashaStartIndex);

  while (dashaEnd < currentDate) {
    idx = (idx + 1) % 9;
    dashaStart = new Date(dashaEnd);
    dashaEnd = addYears(dashaStart, DASHA_YEARS[DASHA_SEQUENCE[idx]]);
  }

  const currentMaha = DASHA_SEQUENCE[idx];
  const mahaStart = dashaStart;
  const mahaEnd = dashaEnd;

  const mahaYears = (idx === dashaStartIndex) 
    ? birthDashaRemainingYears 
    : DASHA_YEARS[currentMaha];

  let antarStart = new Date(mahaStart);
  let antarEnd = new Date(mahaStart);
  let antarIdx = idx;
  let currentAntar = '';
  let finalAntarEnd = new Date();

  for (let i = 0; i < 9; i++) {
    const antarLord = DASHA_SEQUENCE[antarIdx % 9];
    const antarYears = (DASHA_YEARS[antarLord] / 120) * mahaYears;
    antarEnd = addYears(antarStart, antarYears);

    if (antarEnd >= currentDate) {
      currentAntar = antarLord;
      finalAntarEnd = antarEnd;
      break;
    }
    antarStart = new Date(antarEnd);
    antarIdx++;
  }

  return {
    mahadasha: currentMaha,
    antardasha: currentAntar,
    mahaEnds: mahaEnd.toISOString().split('T')[0],
    antarEnds: finalAntarEnd.toISOString().split('T')[0],
    nextMahadasha: DASHA_SEQUENCE[(idx + 1) % 9],
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

  // Whole Sign House System: Each house = one sign, starting from ascendant sign
  const houses = swe.swe_houses(julianUT, details.lat, details.lon, "W");
  const ascendant = normalizeDegree(houses.ascmc?.[0] ?? 0);
  const ascendantSign = getSign(ascendant).name;
  const ascendantSignIndex = getSign(ascendant).index;
  
  // Whole Sign house cusps: House 1 starts at 0° of ascendant sign, each house is 30°
  const houseCusps = Array.from({ length: 12 }, (_, idx) => {
    const signIndex = (ascendantSignIndex + idx) % 12;
    return signIndex * 30; // Each house starts at 0° of its sign
  });
  
  // Whole Sign house lords: Lord of the sign that rules each house
  const houseLords = Array.from({ length: 12 }, (_, idx) => {
    const signIndex = (ascendantSignIndex + idx) % 12;
    const signName = SIGN_NAMES[signIndex];
    return SIGN_LORDS[signName] || "Unknown";
  });

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

  // Whole Sign planet house calculation: House based on sign relative to ascendant
  const planetHouseMap: Record<string, number> = {};
  for (const p of planetList) {
    // In Whole Sign, house is determined by sign only
    // House 1 = Ascendant Sign, House 2 = Next Sign, etc.
    const house = ((p.signIndex - ascendantSignIndex + 12) % 12) + 1;
    planetHouseMap[p.key] = house;
  }

  const moonData = planetMap.moon || null;
  const sunData = planetMap.sun || null;
  const moonNakshatra = moonData ? moonData.nakshatra : null;

  let dasha = { mahadasha: '', antardasha: '', mahaEnds: '', antarEnds: '', nextMahadasha: '' };
  if (moonData && moonNakshatra) {
    dasha = calculateDasha(utcParts, moonNakshatra.index, moonData.longitude);
  }

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
    dasha,
    houseLords,
    astro_locked: true,
    source: "swiss_ephemeris_v1",
    planetHouseMap
  };
};

export async function getTransitPositions(date: Date): Promise<AstroPayload> {
  return getPlanetaryData({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: 12,
    min: 0,
    sec: 0,
    lat: 0,
    lon: 0,
    tzone: 0,
  });
}

// Export helper functions for external use
export { getNakshatraLord, getYoni };
