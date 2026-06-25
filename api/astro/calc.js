import SwissEPH from "sweph-wasm";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

const sweWasmUrl = new URL("../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm", import.meta.url);
const sweWasmPath = fileURLToPath(sweWasmUrl);

let swePromise;

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

const SIGN_LORDS = {
  "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
  "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
  "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
};

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

const PLANET_SEQUENCE = [
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

const getSwe = async () => {
  if (!swePromise) {
    swePromise = (async () => {
      const wasmBinary = await readFile(sweWasmPath);
      const swe = await SwissEPH.init(wasmBinary);
      await swe.swe_set_ephe_path();
      swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
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

const getSign = (deg) => {
  const normalized = normalizeDegree(deg);
  const index = Math.floor(normalized / 30) % 12;
  return { name: SIGN_NAMES[index], index };
};

const getNakshatra = (deg) => {
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

const toNumber = (value, fallback = null) => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const convertToUtcParts = (year, month, day, hour, minute, second, tzone) => {
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

const buildPlanetEntry = (label, key, longitude, latitude, distance, speed) => {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const day = toNumber(rawBody.day ?? rawBody.date);
    const month = toNumber(rawBody.month);
    const year = toNumber(rawBody.year);
    const hour = toNumber(rawBody.hour ?? rawBody.hours);
    const minute = toNumber(rawBody.min ?? rawBody.minute ?? rawBody.minutes);
    const second = toNumber(rawBody.sec ?? rawBody.second ?? 0, 0);
    const lat = toNumber(rawBody.lat ?? rawBody.latitude);
    const lon = toNumber(rawBody.lon ?? rawBody.longitude);
    const tzone = toNumber(rawBody.tzone ?? rawBody.timezone ?? 0, 0);

    if (![day, month, year, hour, minute].every((v) => Number.isFinite(v))) {
      return res.status(400).json({ error: "Invalid or missing date/time values" });
    }
    if (![lat, lon].every((v) => Number.isFinite(v))) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const swe = await getSwe();

    const utcParts = convertToUtcParts(year, month, day, hour, minute, second, tzone);
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
    const houses = swe.swe_houses(julianUT, lat, lon, "W");
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
    const planetMap = {};
    const planetList = [];

    let rahuData = null;

    for (const config of PLANET_SEQUENCE) {
      if (config.derivedFrom === "rahu" && rahuData) {
        const ketuLongitude = normalizeDegree(rahuData.longitude + 180);
        const entry = buildPlanetEntry(
          config.label,
          config.key,
          ketuLongitude,
          -rahuData.latitude,
          rahuData.distance,
          rahuData.speed
        );
        planetMap[config.key] = entry;
        planetList.push(entry);
        continue;
      }

      const planetId = typeof config.resolver === "function" ? config.resolver(swe) : config.resolver;
      const values = swe.swe_calc_ut(julianUT, planetId, flags);
      const entry = buildPlanetEntry(config.label, config.key, values[0], values[1], values[2], values[3]);

      planetMap[config.key] = entry;
      planetList.push(entry);

      if (config.key === "rahu") {
        rahuData = entry;
      }
    }

    // Whole Sign planet house calculation: House based on sign relative to ascendant
    const planetHouseMap = {};
    for (const p of planetList) {
      // In Whole Sign, house is determined by sign only
      // House 1 = Ascendant Sign, House 2 = Next Sign, etc.
      const house = ((p.signIndex - ascendantSignIndex + 12) % 12) + 1;
      planetHouseMap[p.key] = house;
    }

    const moonData = planetMap.moon || null;
    const sunData = planetMap.sun || null;
    const moonNakshatra = moonData ? moonData.nakshatra : null;

    const payload = {
      planets: planetMap,
      planetsList: planetList,
      ascendant,
      ascendantSign,
      houses: houseCusps,
      julianDayUT: julianUT,
      julianDayET: julianET,
      nakshatra: moonNakshatra ? { name: moonNakshatra.name, pada: moonNakshatra.pada } : null,
      moonSign: moonData?.sign || null,
      sunSign: sunData?.sign || null,
      lagnaSign: ascendantSign,
      houseLords,
      planetHouseMap,
    };

    return res.status(200).json(payload);
  } catch (error) {
    console.error("[astro/calc] Failed", error);
    return res.status(500).json({ error: "Failed to compute planetary data" });
  }
}

