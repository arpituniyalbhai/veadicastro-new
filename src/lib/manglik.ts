import type { AstroPayload } from './astroCalc';

const signIndex = (longitude: number) => {
  if (!Number.isFinite(longitude) || longitude < 0 || longitude >= 360) throw new Error('Invalid planetary position. Please calculate again.');
  return Math.floor(longitude / 30);
};
export const houseFrom = (planet: number, reference: number) => (signIndex(planet) - signIndex(reference) + 12) % 12 + 1;

/** Explicit six-house convention; Moon/Venus are separate supplementary checks. */
export function analyseManglik(chart: AstroPayload) {
  const { mars, moon, venus, jupiter } = chart.planets;
  if (!mars || !moon || !venus || !jupiter) throw new Error('Required planetary data is missing. Please try again.');
  const checks = [['Lagna', chart.ascendant], ['Moon', moon.longitude], ['Venus', venus.longitude]].map(([reference, longitude]) => {
    const house = houseFrom(mars.longitude, Number(longitude));
    return { reference: String(reference), house, present: [1, 2, 4, 7, 8, 12].includes(house) };
  });
  const factors: string[] = [];
  const marsSign = signIndex(mars.longitude);
  if ([0, 7].includes(marsSign)) factors.push('Mars occupies its own sign. Some traditions consider this a mitigating factor; it does not automatically cancel every Manglik indication.');
  if (marsSign === 9) factors.push('Mars occupies its exaltation sign, Capricorn. This is a dignity factor to review in the complete chart, not an automatic cancellation.');
  const jupiterHouse = houseFrom(mars.longitude, jupiter.longitude);
  if ([5, 7, 9].includes(jupiterHouse)) factors.push('Jupiter casts a whole-sign Parashari aspect on Mars. Some practitioners consider this supportive; its significance depends on Jupiter’s condition and the complete chart.');
  if (jupiterHouse === 1) factors.push('Jupiter and Mars share a sign. This conjunction needs individual interpretation and is not treated as a guaranteed cancellation.');
  return { checks, factors, marsSign: mars.sign, marsLongitude: mars.longitude, lagna: chart.ascendantSign, moon: moon.sign };
}

/** Resolve local civil birth time against the selected place's IANA timezone.
 * Enumerate nearby offsets to detect both nonexistent and repeated DST times.
 */
export function resolveBirthTime(date: string, time: string, zone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Enter a complete birth date and time.');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, min] = time.split(':').map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, min);
  const check = new Date(wall);
  if (year < 1900 || check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23 || min > 59) throw new Error('Enter a valid birth date from 1900 onward and a valid time.');
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const localStamp = (utc: number) => {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(utc)).map(p => [p.type, p.value]));
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  };
  const offsets = new Set<number>();
  for (let hours = -48; hours <= 48; hours += 6) {
    const instant = wall + hours * 3600000;
    offsets.add(localStamp(instant) - instant);
  }
  const candidates = [...offsets].map(offset => wall - offset).filter(utc => localStamp(utc) === wall).sort((a, b) => a - b);
  if (!candidates.length) throw new Error('This local time did not occur because clocks changed. Please check the recorded birth time.');
  return candidates.map(utc => ({ year, month, day, hour, min, tzone: (wall - utc) / 3600000, utc }));
}
