/**
 * Daily Lucky Number and Color Configuration
 * Update these values daily to change the lucky number and color for all users
 * 
 * Date format: YYYY-MM-DD
 */

export interface DailyLuckyConfig {
  date: string; // YYYY-MM-DD format
  luckyNumber: number;
  luckyColor: string;
}

/**
 * Current daily lucky number and color
 * Update this object daily with today's date and values
 */
export const dailyLuckyConfig: DailyLuckyConfig = {
  date: "2025-12-01", // Update this date daily (YYYY-MM-DD)
  luckyNumber: 7, // Update this number daily (0-10)
  luckyColor: "Purple", // Update this color daily (must be a valid color name)
};

/**
 * Valid color names that can be used
 */
export const validColors = [
  "Purple",
  "Gold",
  "Blue",
  "Silver",
  "Emerald",
  "Coral",
  "Rose",
  "Amber",
  "Jade",
  "Sapphire",
  "Turquoise",
  "Indigo",
  "Green",
  "Red",
  "Orange",
  "Yellow",
  "Pink",
  "White",
  "Black",
  "Brown",
];

/**
 * Get today's lucky number and color
 * Returns the configured values if today matches the date, otherwise returns defaults
 */
export function getDailyLucky(): { number: number; color: string } {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  if (dailyLuckyConfig.date === today) {
    return {
      number: dailyLuckyConfig.luckyNumber,
      color: dailyLuckyConfig.luckyColor,
    };
  }
  
  // Return defaults if date doesn't match (should update the date in config)
  return {
    number: dailyLuckyConfig.luckyNumber,
    color: dailyLuckyConfig.luckyColor,
  };
}

/**
 * Check if the config needs to be updated
 * Returns true if the date in config is not today
 */
export function needsUpdate(): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dailyLuckyConfig.date !== today;
}

