export interface NumerologyResult {
  name: string;
  lifePath: number;
  birthday: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  personalYear: number;
  luckyNumber: number;
  isMasterNumber: boolean;
  masterNumberType?: "11" | "22" | "33";
  karmicDebt?: number;
}

const letterMap: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const vowels = new Set(["A", "E", "I", "O", "U"]);

function reduceToRoot(n: number, allowMaster = true): number {
  if (allowMaster && (n === 11 || n === 22 || n === 33)) return n;
  while (n > 9) {
    n = String(n).split("").reduce((s, d) => s + parseInt(d, 10), 0);
    if (allowMaster && (n === 11 || n === 22 || n === 33)) return n;
  }
  return n;
}

function sumNameLetters(name: string, filter?: "vowels" | "consonants"): number {
  const cleaned = name.toUpperCase().replace(/[^A-Z]/g, "");
  let sum = 0;
  for (const ch of cleaned) {
    if (filter === "vowels" && !vowels.has(ch)) continue;
    if (filter === "consonants" && vowels.has(ch)) continue;
    sum += letterMap[ch] || 0;
  }
  return sum;
}

function detectKarmicDebt(n: number): number | undefined {
  const karmicNumbers = [13, 14, 16, 19];
  return karmicNumbers.includes(n) ? n : undefined;
}

export function calculateNumerology(name: string, day: number, month: number, year: number): NumerologyResult {
  const dateSum = day + month + year;
  const lifePathRaw = String(dateSum).split("").reduce((s, d) => s + parseInt(d, 10), 0);
  const lifePath = reduceToRoot(lifePathRaw);

  const birthday = reduceToRoot(day);

  const destinySum = sumNameLetters(name);
  const destiny = reduceToRoot(destinySum);

  const soulUrgeSum = sumNameLetters(name, "vowels");
  const soulUrge = reduceToRoot(soulUrgeSum);

  const personalitySum = sumNameLetters(name, "consonants");
  const personality = reduceToRoot(personalitySum);

  const today = new Date();
  const currentYear = today.getFullYear();
  const personalYearRaw = day + month + currentYear;
  const personalYear = reduceToRoot(
    String(personalYearRaw).split("").reduce((s, d) => s + parseInt(d, 10), 0)
  );

  const luckyNumberRaw = lifePath + destiny;
  const luckyNumber = reduceToRoot(
    String(luckyNumberRaw).split("").reduce((s, d) => s + parseInt(d, 10), 0)
  );

  const isMasterNumber = lifePath === 11 || lifePath === 22 || lifePath === 33;
  let masterNumberType: "11" | "22" | "33" | undefined;
  if (lifePath === 11) masterNumberType = "11";
  else if (lifePath === 22) masterNumberType = "22";
  else if (lifePath === 33) masterNumberType = "33";

  const karmicDebt = detectKarmicDebt(lifePathRaw) || detectKarmicDebt(destinySum);

  return {
    name,
    lifePath,
    birthday,
    destiny,
    soulUrge,
    personality,
    personalYear,
    luckyNumber,
    isMasterNumber,
    masterNumberType,
    karmicDebt,
  };
}

export function getLifePathMeaning(n: number): string {
  const meanings: Record<number, string> = {
    1: "You are a natural born leader with strong independence and originality. You thrive when you forge your own path and inspire others through action.",
    2: "You are a peacemaker with a gift for cooperation and diplomacy. Your sensitivity and intuition make you excellent at building bridges between people.",
    3: "You are a creative communicator who thrives on self expression. Your optimism and charisma draw people to you, and you find joy in art, writing, or performance.",
    4: "You are a hard working builder who values stability and order. Your practical nature and attention to detail make you someone others can always rely on.",
    5: "You are a freedom seeker who craves adventure and variety. Your adaptable nature and love for new experiences make you a natural explorer of life.",
    6: "You are a nurturing caregiver with a strong sense of responsibility. Your loving nature and desire to serve make you the heart of your family and community.",
    7: "You are a deep thinker and spiritual seeker. Your analytical mind and love for truth drive you to explore life's biggest questions with wisdom and patience.",
    8: "You are an ambitious achiever with a talent for business and leadership. Your drive for success and material mastery is balanced by a desire to make an impact.",
    9: "You are a compassionate humanitarian with a global perspective. Your wisdom and generosity inspire others, and you find purpose in serving the greater good.",
    11: "You are a spiritual visionary with heightened intuition and creative inspiration. Your path is to uplift others through insight, innovation, and deep inner knowing.",
    22: "You are a master builder with the ability to turn grand visions into reality. Your practical spirituality allows you to create lasting impact on a global scale.",
    33: "You are a master teacher driven by unconditional love and compassion. Your path is to guide and heal others through profound wisdom and selfless service.",
  };
  return meanings[n] || "Your life path reveals a unique journey of growth and discovery.";
}

export function getDestinyMeaning(n: number): string {
  const meanings: Record<number, string> = {
    1: "You are meant to lead, innovate, and pioneer. Your destiny involves taking initiative and showing others what is possible.",
    2: "You are destined to build harmony and cooperation. Your path involves bringing people together and creating peaceful solutions.",
    3: "You are destined to inspire through creativity and communication. Your path involves expressing beauty, joy, and truth through your unique gifts.",
    4: "You are destined to build solid foundations. Your path involves creating systems, structures, and lasting value through dedicated effort.",
    5: "You are destined for freedom, adventure, and positive change. Your path involves embracing transformation and helping others break free from limitations.",
    6: "You are destined to nurture and serve. Your path involves creating loving homes, healing relationships, and supporting your community.",
    7: "You are destined to seek wisdom and share knowledge. Your path involves deep study, spiritual exploration, and teaching others what you discover.",
    8: "You are destined for material mastery and leadership. Your path involves achieving success while maintaining integrity and using influence wisely.",
    9: "You are destined to serve humanity with compassion. Your path involves letting go of the personal to embrace the universal good.",
  };
  return meanings[n] || "Your destiny number reveals your life's purpose and direction.";
}
