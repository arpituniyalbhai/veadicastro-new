const isBrowser = typeof window !== "undefined";

type PlanetEntry = Record<string, unknown>;
type PlanetPayload = {
  planetsList?: PlanetEntry[];
  planets?: Record<string, PlanetEntry>;
  ascendantSign?: string;
  moonSign?: string;
  sunSign?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asPlanetPayload = (value: unknown): PlanetPayload | null => {
  if (!isRecord(value)) return null;
  return value as PlanetPayload;
};

export const extractPlanetList = (payload: unknown): PlanetEntry[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as PlanetEntry[];
  const asPayload = asPlanetPayload(payload);
  if (!asPayload) return [];
  if (Array.isArray(asPayload.planetsList)) return asPayload.planetsList;
  if (asPayload.planets && isRecord(asPayload.planets)) {
    return Object.values(asPayload.planets);
  }
  return [];
};

export const persistAstroPayload = (payload: unknown) => {
  if (!isBrowser) return;
  const astroPayload = asPlanetPayload(payload);
  if (!astroPayload) return;
  try {
    const list = extractPlanetList(astroPayload);
    localStorage.setItem("astrology_planets", JSON.stringify(list));
    localStorage.setItem("planet_positions", JSON.stringify(astroPayload.planets || {}));
    localStorage.setItem("zodiac_data", JSON.stringify(astroPayload));
    if (astroPayload.ascendantSign) {
      localStorage.setItem("ascendant", astroPayload.ascendantSign);
    }
    if (astroPayload.moonSign) {
      localStorage.setItem("moon_sign", astroPayload.moonSign);
    }
    if (astroPayload.sunSign) {
      localStorage.setItem("sun_sign", astroPayload.sunSign);
    }
  } catch {
    // ignore storage failures
  }
};

