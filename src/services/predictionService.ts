import { 
  PredictionData, 
  LuckyData, 
  todayPredictions, 
  tomorrowPredictions,
  weeklyPredictions, 
  luckyColors, 
  luckyNumbers, 
  verdicts, 
  doActions, 
  avoidActions 
} from '../data/predictions';

export interface DailyPrediction {
  love: string;
  self: string;
  wealth: string;
  luckyNumber: number;
  luckyColor: string;
  verdict: string;
  actions: {
    do: string[];
    avoid: string[];
  };
  date: string;
}

export interface WeeklyPrediction {
  text: string;
  date: string;
  weekStart: string;
  weekEnd: string;
}

class PredictionService {
  private readonly CACHE_KEY = 'daily_predictions';
  private readonly LAST_UPDATE_KEY = 'last_prediction_update';
  private readonly WEEKLY_CACHE_KEY = 'weekly_predictions';
  private readonly WEEKLY_UPDATE_KEY = 'last_weekly_update';

  // Get user-specific cache keys
  private getUserCacheKey(): string {
    const userId = this.getUserId();
    return `${this.CACHE_KEY}_${userId}`;
  }

  private getUserWeeklyCacheKey(): string {
    const userId = this.getUserId();
    return `${this.WEEKLY_CACHE_KEY}_${userId}`;
  }

  private getUserLastUpdateKey(): string {
    const userId = this.getUserId();
    return `${this.LAST_UPDATE_KEY}_${userId}`;
  }

  private getUserWeeklyUpdateKey(): string {
    const userId = this.getUserId();
    return `${this.WEEKLY_UPDATE_KEY}_${userId}`;
  }

  // Get user ID for personalization
  private getUserId(): string {
    // Try to get user ID from localStorage or generate one
    let userId = localStorage.getItem('user_prediction_id');
    if (!userId) {
      // Generate a random user ID for prediction personalization
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('user_prediction_id', userId);
    }
    return userId;
  }

  // Get random item from array based on date seed and user ID
  private getRandomItem<T>(array: T[], dateSeed: number, userId: string): T {
    // Combine date seed with user ID for user-specific randomization
    const userSeed = dateSeed + this.hashCode(userId);
    const index = Math.abs(Math.floor((userSeed % 1000000) / (1000000 / array.length))) % array.length;
    return array[index];
  }

  // Simple hash function for user ID
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Check if it's a new day (after 12 AM)
  private isNewDay(): boolean {
    const lastUpdate = localStorage.getItem(this.getUserLastUpdateKey());
    const today = new Date().toISOString().split('T')[0];
    return lastUpdate !== today;
  }

  // Generate prediction for a specific date and user
  private generatePredictionForDate(date: Date, type: 'today' | 'tomorrow'): DailyPrediction {
    const dateStr = date.toISOString().split('T')[0];
    const dateSeed = new Date(dateStr).getTime();
    const userId = this.getUserId();
    
    const predictions = type === 'today' ? todayPredictions : tomorrowPredictions;
    
    // Filter predictions by category and get random ones based on user
    const lovePredictions = predictions.filter(p => p.category === 'love');
    const selfPredictions = predictions.filter(p => p.category === 'self');
    const wealthPredictions = predictions.filter(p => p.category === 'wealth');
    
    return {
      love: this.getRandomItem(lovePredictions, dateSeed, userId).text,
      self: this.getRandomItem(selfPredictions, dateSeed + 1, userId).text,
      wealth: this.getRandomItem(wealthPredictions, dateSeed + 2, userId).text,
      luckyNumber: this.getRandomItem(luckyNumbers, dateSeed + 3, userId).value as number,
      luckyColor: this.getRandomItem(luckyColors, dateSeed + 4, userId).value as string,
      verdict: this.getRandomItem(verdicts, dateSeed + 5, userId),
      actions: {
        do: [
          this.getRandomItem(doActions, dateSeed + 6, userId),
          this.getRandomItem(doActions, dateSeed + 7, userId)
        ],
        avoid: [
          this.getRandomItem(avoidActions, dateSeed + 8, userId),
          this.getRandomItem(avoidActions, dateSeed + 9, userId)
        ]
      },
      date: dateStr
    };
  }

  // Generate weekly prediction for a specific week and user
  private generateWeeklyPrediction(date: Date): WeeklyPrediction {
    const weekStart = this.getWeekStart(date);
    const weekEnd = this.getWeekEnd(date);
    const weekStr = weekStart.toISOString().split('T')[0];
    const weekSeed = weekStart.getTime();
    const userId = this.getUserId();
    
    return {
      text: this.getRandomItem(weeklyPredictions, weekSeed, userId).text,
      date: weekStr,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0]
    };
  }

  // Get week start (Monday)
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  }

  // Get week end (Sunday)
  private getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  }

  // Check if it's a new week
  private isNewWeek(): boolean {
    const lastUpdate = localStorage.getItem(this.getUserWeeklyUpdateKey());
    const currentWeek = this.getWeekStart(new Date()).toISOString().split('T')[0];
    return lastUpdate !== currentWeek;
  }

  // Get today's prediction
  getTodayPrediction(): DailyPrediction {
    const today = new Date().toISOString().split('T')[0];
    
    // Always check if it's a new day and refresh if needed
    if (this.isNewDay()) {
      console.log('New day detected, refreshing predictions');
      // Clear cache to force fresh generation
      localStorage.removeItem(this.getUserCacheKey());
      localStorage.removeItem(this.getUserLastUpdateKey());
      // Generate fresh prediction
      const todayPrediction = this.generatePredictionForDate(new Date(), 'today');
      this.cachePredictions(todayPrediction, null);
      return todayPrediction;
    }
    
    // Check cache first
    const cached = localStorage.getItem(this.getUserCacheKey());
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.today && data.today.date === today) {
          return data.today;
        }
      } catch (error) {
        console.warn('Invalid cache data, generating fresh prediction');
      }
    }
    
    // Generate new prediction if cache is empty or outdated
    const todayPrediction = this.generatePredictionForDate(new Date(), 'today');
    this.cachePredictions(todayPrediction, null);
    return todayPrediction;
  }

  // Get tomorrow's prediction
  getTomorrowPrediction(): DailyPrediction {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Always check if it's a new day and refresh if needed
    if (this.isNewDay()) {
      console.log('New day detected, refreshing tomorrow prediction');
      // Clear cache to force fresh generation
      localStorage.removeItem(this.getUserCacheKey());
      localStorage.removeItem(this.getUserLastUpdateKey());
      // Generate fresh prediction
      const tomorrowPrediction = this.generatePredictionForDate(new Date(Date.now() + 24 * 60 * 60 * 1000), 'tomorrow');
      this.cachePredictions(null, tomorrowPrediction);
      return tomorrowPrediction;
    }
    
    // Check cache first
    const cached = localStorage.getItem(this.getUserCacheKey());
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.tomorrow && data.tomorrow.date === tomorrow) {
          return data.tomorrow;
        }
      } catch (error) {
        console.warn('Invalid cache data for tomorrow, generating fresh prediction');
      }
    }
    
    // Generate new prediction if cache is empty or outdated
    const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowPrediction = this.generatePredictionForDate(tomorrowDate, 'tomorrow');
    this.cachePredictions(null, tomorrowPrediction);
    return tomorrowPrediction;
  }

  // Get weekly prediction
  getWeeklyPrediction(): WeeklyPrediction {
    const currentWeek = this.getWeekStart(new Date()).toISOString().split('T')[0];
    
    // Always check if it's a new week and refresh if needed
    if (this.isNewWeek()) {
      console.log('New week detected, refreshing weekly prediction');
      // Clear cache to force fresh generation
      localStorage.removeItem(this.getUserWeeklyCacheKey());
      localStorage.removeItem(this.getUserWeeklyUpdateKey());
      // Generate fresh prediction
      const weeklyPrediction = this.generateWeeklyPrediction(new Date());
      this.cacheWeeklyPrediction(weeklyPrediction);
      return weeklyPrediction;
    }
    
    // Check cache first
    const cached = localStorage.getItem(this.getUserWeeklyCacheKey());
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.weekStart === currentWeek) {
          return data;
        }
      } catch (error) {
        console.warn('Invalid cache data for weekly, generating fresh prediction');
      }
    }
    
    // Generate new prediction if cache is empty or outdated
    const weeklyPrediction = this.generateWeeklyPrediction(new Date());
    this.cacheWeeklyPrediction(weeklyPrediction);
    return weeklyPrediction;
  }

  // Cache predictions
  private cachePredictions(today: DailyPrediction | null, tomorrow: DailyPrediction | null): void {
    const cached = localStorage.getItem(this.getUserCacheKey());
    const data = cached ? JSON.parse(cached) : {};
    
    if (today) data.today = today;
    if (tomorrow) data.tomorrow = tomorrow;
    
    localStorage.setItem(this.getUserCacheKey(), JSON.stringify(data));
    localStorage.setItem(this.getUserLastUpdateKey(), new Date().toISOString().split('T')[0]);
  }

  // Cache weekly prediction
  private cacheWeeklyPrediction(weekly: WeeklyPrediction): void {
    localStorage.setItem(this.getUserWeeklyCacheKey(), JSON.stringify(weekly));
    localStorage.setItem(this.getUserWeeklyUpdateKey(), weekly.weekStart);
  }

  // Update predictions (called at 12 AM or when needed)
  updatePredictions(): void {
    const today = this.generatePredictionForDate(new Date(), 'today');
    const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrow = this.generatePredictionForDate(tomorrowDate, 'tomorrow');
    
    this.cachePredictions(today, tomorrow);
  }

  // Update weekly prediction (called weekly or when needed)
  updateWeeklyPrediction(): void {
    const weekly = this.generateWeeklyPrediction(new Date());
    this.cacheWeeklyPrediction(weekly);
  }

  // Force refresh predictions
  refreshPredictions(): void {
    localStorage.removeItem(this.getUserCacheKey());
    localStorage.removeItem(this.getUserLastUpdateKey());
    localStorage.removeItem(this.getUserWeeklyCacheKey());
    localStorage.removeItem(this.getUserWeeklyUpdateKey());
    this.updatePredictions();
    this.updateWeeklyPrediction();
  }

  // Set up daily update at 12 AM - REMOVED TIMERS TO PREVENT BACKGROUND API CALLS
  setupDailyUpdate(): void {
    // Only check if we need to update right now (no background timers)
    if (this.isNewDay()) {
      console.log('New day detected on setup, refreshing predictions');
      this.updatePredictions();
    }
    if (this.isNewWeek()) {
      console.log('New week detected on setup, refreshing weekly prediction');
      this.updateWeeklyPrediction();
    }
    
    console.log('Prediction service setup complete - no background timers running');
  }

  // Force reset all predictions when user visits
  resetAllPredictions(): void {
    console.log('Resetting all predictions for user visit');
    localStorage.removeItem(this.getUserCacheKey());
    localStorage.removeItem(this.getUserLastUpdateKey());
    localStorage.removeItem(this.getUserWeeklyCacheKey());
    localStorage.removeItem(this.getUserWeeklyUpdateKey());
    
    // Generate fresh predictions
    this.updatePredictions();
    this.updateWeeklyPrediction();
  }

  // Get next Monday at 12 AM
  private getNextMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const nextMonday = new Date(d.setDate(diff));
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }
}

export const predictionService = new PredictionService();
