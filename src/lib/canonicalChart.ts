import { getPlanetaryData, type AstroInput, type AstroPayload, type PlanetEntry } from "@/lib/astroCalc";
import { persistAstroPayload } from "@/lib/astroStorage";

const SNAPSHOT_KEY = "canonical_chart_snapshot_v1";
export const CHART_SCHEMA_VERSION = "1.0";
export const CALCULATOR_VERSION = "swiss-ephemeris-lahiri-whole-sign-1.0";

export type CanonicalChartFacts = {
  d1: {
    ascendant: string;
    planets: Record<string, {
      sign: string;
      house: number;
      nakshatra: { name: string; pada: number };
      retrograde: boolean;
      lord_of: number[];
    }>;
    house_lords: string[];
    dasha: AstroPayload["dasha"];
  };
};

export type CanonicalChartSnapshot = {
  chart_id: string;
  schema_version: string;
  calculator_version: string;
  birth_input: Required<Pick<AstroInput, "day" | "month" | "year" | "hour" | "min" | "lat" | "lon" | "tzone">>;
  input_hash: string;
  chart_hash: string;
  created_at: string;
  facts: CanonicalChartFacts;
  calculation: AstroPayload;
};

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")} ]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

const sha256 = async (value: unknown): Promise<string> => {
  const bytes = new TextEncoder().encode(stableJson(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
};

const normalizeInput = (input: AstroInput): CanonicalChartSnapshot["birth_input"] => ({
  day: Number(input.day), month: Number(input.month), year: Number(input.year),
  hour: Number(input.hour), min: Number(input.min), lat: Number(input.lat), lon: Number(input.lon),
  tzone: Number(input.tzone ?? 0),
});

const asPlanetFacts = (planet: PlanetEntry, house: number, houseLords: string[]) => ({
  sign: planet.sign,
  house,
  nakshatra: { name: planet.nakshatra.name, pada: planet.nakshatra.pada },
  retrograde: planet.retrograde,
  lord_of: houseLords.reduce<number[]>((houses, lord, index) => lord === planet.name ? [...houses, index + 1] : houses, []),
});

const buildFacts = (calculation: AstroPayload): CanonicalChartFacts => ({
  d1: {
    ascendant: calculation.ascendantSign,
    planets: Object.fromEntries(Object.entries(calculation.planets).map(([key, planet]) => [
      key,
      asPlanetFacts(planet, calculation.planetHouseMap[key], calculation.houseLords),
    ])),
    house_lords: [...calculation.houseLords],
    dasha: { ...calculation.dasha },
  },
});

const readSnapshot = (): CanonicalChartSnapshot | null => {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as CanonicalChartSnapshot;
    return snapshot.schema_version === CHART_SCHEMA_VERSION && snapshot.calculator_version === CALCULATOR_VERSION ? snapshot : null;
  } catch {
    return null;
  }
};

export const getCanonicalChartSnapshot = async (input: AstroInput): Promise<CanonicalChartSnapshot> => {
  const birth_input = normalizeInput(input);
  const input_hash = await sha256(birth_input);
  const existing = readSnapshot();
  if (existing?.input_hash === input_hash) return deepFreeze(existing);

  const calculation = await getPlanetaryData(birth_input);
  const facts = buildFacts(calculation);
  const snapshot: CanonicalChartSnapshot = {
    chart_id: crypto.randomUUID(),
    schema_version: CHART_SCHEMA_VERSION,
    calculator_version: CALCULATOR_VERSION,
    birth_input,
    input_hash,
    chart_hash: await sha256(facts),
    created_at: new Date().toISOString(),
    facts,
    calculation,
  };
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  persistAstroPayload(calculation);
  return deepFreeze(snapshot);
};
