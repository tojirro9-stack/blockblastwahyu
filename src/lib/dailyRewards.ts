// ==================== DAILY REWARDS SYSTEM ====================

export interface DailyReward {
  day: number; // 1-7 (weekly cycle)
  coins: number;
  bonus: string; // e.g. "x3 Shuffle", "x2 Bomb"
  powerUp?: { type: string; quantity: number };
  isPremium?: boolean; // premium-only reward on day 7
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 15, bonus: 'Daily Login', powerUp: { type: 'shuffle', quantity: 1 } },
  { day: 2, coins: 25, bonus: 'Keep Going!', powerUp: { type: 'undo', quantity: 2 } },
  { day: 3, coins: 35, bonus: 'Streak +3', powerUp: { type: 'bomb', quantity: 1 } },
  { day: 4, coins: 50, bonus: 'Halfway!', powerUp: { type: 'shuffle', quantity: 2 } },
  { day: 5, coins: 65, bonus: 'Almost There!', powerUp: { type: 'lightning', quantity: 1 } },
  { day: 6, coins: 80, bonus: 'So Close!', powerUp: { type: 'undo', quantity: 3 } },
  { day: 7, coins: 150, bonus: 'WEEKLY BONUS! 🎉', powerUp: { type: 'star_boost', quantity: 2 }, isPremium: false },
];

export function getDailyRewardForDay(day: number): DailyReward {
  const index = ((day - 1) % 7);
  return DAILY_REWARDS[index];
}

export function getStreakStatus(
  lastClaimDate: string | null,
  streak: number
): {
  canClaim: boolean;
  currentDay: number;
  streakLost: boolean;
  hoursUntilReset: number;
} {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (!lastClaimDate) {
    // First time ever
    return { canClaim: true, currentDay: 1, streakLost: false, hoursUntilReset: 0 };
  }

  if (lastClaimDate === today) {
    // Already claimed today
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursUntilReset = Math.max(0, (tomorrow.getTime() - now.getTime()) / 3600000);
    return { canClaim: false, currentDay: streak, streakLost: false, hoursUntilReset };
  }

  // Check if yesterday (or earlier)
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastClaimDate < yesterdayStr) {
    // Streak broken
    return { canClaim: true, currentDay: 1, streakLost: true, hoursUntilReset: 0 };
  }

  // Last claim was yesterday — continue streak
  const nextDay = (streak % 7) + 1;
  return { canClaim: true, currentDay: nextDay, streakLost: false, hoursUntilReset: 0 };
}
