import type { AstroPayload, PlanetEntry } from "./astroCalc";

export interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  years: number;
  days: number;
}

export interface PanchangaDetails {
  tithi: string;
  vara: string;
  nakshatra: string;
  yoga: string;
  karana: string;
}

export interface KundaliAnalysis {
  basicPanchanga: PanchangaDetails;
  currentDasha: DashaPeriod;
  dashaTimeline: DashaPeriod[];
  personalizedRemedies: string[];
  predictions: string[];
  doshaAnalysis?: string[];
  careerPredictions?: string[];
  relationshipInsights?: string[];
  healthAnalysis?: string[];
  financialOutlook?: string[];
  enhancedRemedies?: string[];
  currentDashaImpact?: string[];
}

// Vimshottari Dasha periods in years
const DASHA_PERIODS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

// Tithi names
const TITHI_NAMES = [
  "Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami",
  "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami",
  "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
  "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami",
  "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
  "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
];

// Varas (Weekdays)
const VARA_NAMES = ["Ravivar", "Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar"];

// Yoga names
const YOGA_NAMES = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarman", "Dhriti",
  "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi",
  "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

// Karana names
const KARANA_NAMES = [
  "Kinstughna", "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga"
];

export function calculateTithi(sunLong: number, moonLong: number): string {
  const diff = (moonLong - sunLong + 360) % 360;
  const tithiIndex = Math.floor(diff / 12);
  return TITHI_NAMES[tithiIndex] || TITHI_NAMES[0];
}

export function calculateVara(date: Date): string {
  return VARA_NAMES[date.getDay()];
}

export function calculateYoga(sunLong: number, moonLong: number): string {
  const yogaLong = (sunLong + moonLong) % 360;
  const yogaIndex = Math.floor(yogaLong / 13.3333333333);
  return YOGA_NAMES[yogaIndex] || YOGA_NAMES[0];
}

export function calculateKarana(sunLong: number, moonLong: number): string {
  const diff = (moonLong - sunLong + 360) % 360;
  const karanaIndex = Math.floor(diff / 6) % 60;
  return KARANA_NAMES[karanaIndex] || KARANA_NAMES[0];
}

export function calculatePanchanga(sunLong: number, moonLong: number, birthDate: Date): PanchangaDetails {
  return {
    tithi: calculateTithi(sunLong, moonLong),
    vara: calculateVara(birthDate),
    nakshatra: "", // This will come from the main calculation
    yoga: calculateYoga(sunLong, moonLong),
    karana: calculateKarana(sunLong, moonLong),
  };
}

export function calculateVimshottariDasha(moonLongitude: number, birthDate: Date): {
  currentDasha: DashaPeriod;
  timeline: DashaPeriod[];
} {
  const nakshatraIndex = Math.floor(moonLongitude / 13.3333333333) % 27;
  
  // Determine dasha sequence based on nakshatra pada
  const dashaSequence = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
  ];
  
  const startingIndex = nakshatraIndex % 9;
  const adjustedSequence = [...dashaSequence.slice(startingIndex), ...dashaSequence.slice(0, startingIndex)];
  
  let currentDate = new Date(birthDate);
  const timeline: DashaPeriod[] = [];
  
  for (let i = 0; i < 9; i++) {
    const planet = adjustedSequence[i];
    const years = DASHA_PERIODS[planet];
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + years);
    
    const period: DashaPeriod = {
      planet,
      startDate: new Date(currentDate),
      endDate,
      years,
      days: years * 365.25, // Approximate
    };
    
    timeline.push(period);
    currentDate = new Date(endDate);
  }
  
  // Find current dasha
  const now = new Date();
  const currentDasha = timeline.find(period => 
    now >= period.startDate && now <= period.endDate
  ) || timeline[0];
  
  return {
    currentDasha,
    timeline,
  };
}

export function generatePersonalizedRemedies(kundaliData: AstroPayload): string[] {
  const remedies: string[] = [];
  
  // Basic remedies based on lagna (ascendant)
  const lagnaLord = getLagnaLord(kundaliData.lagnaSign);
  remedies.push(`Worship ${lagnaLord} for overall prosperity and success`);
  
  // Remedies based on planet positions
  if (kundaliData.planets.sun) {
    const sunHouse = getHouseNumber(kundaliData.planets.sun.longitude, kundaliData.ascendant);
    if (sunHouse === 6 || sunHouse === 8 || sunHouse === 12) {
      remedies.push("Offer water to Sun every morning and recite Aditya Hridayam");
    }
  }
  
  if (kundaliData.planets.mars) {
    const marsHouse = getHouseNumber(kundaliData.planets.mars.longitude, kundaliData.ascendant);
    if (marsHouse === 1 || marsHouse === 4 || marsHouse === 7 || marsHouse === 8 || marsHouse === 12) {
      remedies.push("Recite Hanuman Chalisa daily and donate red items on Tuesdays");
    }
  }
  
  if (kundaliData.planets.saturn) {
    const saturnHouse = getHouseNumber(kundaliData.planets.saturn.longitude, kundaliData.ascendant);
    if (saturnHouse === 1 || saturnHouse === 4 || saturnHouse === 7 || saturnHouse === 8 || saturnHouse === 10 || saturnHouse === 12) {
      remedies.push("Light mustard oil lamp on Saturdays and serve elderly people");
    }
  }
  
  // General remedies
  remedies.push("Practice meditation and yoga for mental peace");
  remedies.push("Donate food to the needy on your birthday");
  remedies.push("Keep your living space clean and organized");
  
  return remedies;
}

function getLagnaLord(lagnaSign: string): string {
  const lords: Record<string, string> = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
  };
  return lords[lagnaSign] || "Jupiter";
}

function getHouseNumber(planetLongitude: number, ascendant: number): number {
  let house = Math.floor(((planetLongitude % 360) - (ascendant % 360) + 360) / 30) + 1;
  return house > 12 ? house - 12 : house;
}

export function analyzeKundali(kundaliData: AstroPayload, birthDate: Date): KundaliAnalysis {
  const sunLong = kundaliData.planets.sun?.longitude || 0;
  const moonLong = kundaliData.planets.moon?.longitude || 0;
  
  const basicPanchanga = calculatePanchanga(sunLong, moonLong, birthDate);
  basicPanchanga.nakshatra = kundaliData.nakshatra?.name || "";
  
  const { currentDasha, timeline } = calculateVimshottariDasha(moonLong, birthDate);
  
  const personalizedRemedies = generatePersonalizedRemedies(kundaliData);
  
  return {
    basicPanchanga,
    currentDasha,
    dashaTimeline: timeline,
    personalizedRemedies,
    predictions: [], // Will be filled by AI
  };
}
