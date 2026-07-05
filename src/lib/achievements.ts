// ==================== ACHIEVEMENT SYSTEM ====================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or lucide icon name
  category: 'score' | 'combo' | 'games' | 'lines' | 'powerup' | 'special';
  requirement: { type: string; target: number };
  reward: { coins: number };
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Score achievements
  {
    id: 'score_1000',
    title: 'First Steps',
    description: 'Score 1,000 points in a single game',
    icon: '🎯',
    category: 'score',
    requirement: { type: 'highScore', target: 1000 },
    reward: { coins: 10 },
  },
  {
    id: 'score_5000',
    title: 'Getting Warm',
    description: 'Score 5,000 points in a single game',
    icon: '🔥',
    category: 'score',
    requirement: { type: 'highScore', target: 5000 },
    reward: { coins: 25 },
  },
  {
    id: 'score_10000',
    title: 'Block Master',
    description: 'Score 10,000 points in a single game',
    icon: '🏆',
    category: 'score',
    requirement: { type: 'highScore', target: 10000 },
    reward: { coins: 50 },
  },
  {
    id: 'score_25000',
    title: 'Puzzle Legend',
    description: 'Score 25,000 points in a single game',
    icon: '👑',
    category: 'score',
    requirement: { type: 'highScore', target: 25000 },
    reward: { coins: 100 },
  },
  {
    id: 'score_50000',
    title: 'Unstoppable',
    description: 'Score 50,000 points in a single game',
    icon: '💎',
    category: 'score',
    requirement: { type: 'highScore', target: 50000 },
    reward: { coins: 200 },
  },

  // Combo achievements
  {
    id: 'combo_3',
    title: 'Triple Threat',
    description: 'Achieve a 3x combo',
    icon: '🔱',
    category: 'combo',
    requirement: { type: 'highestCombo', target: 3 },
    reward: { coins: 15 },
  },
  {
    id: 'combo_5',
    title: 'On Fire',
    description: 'Achieve a 5x combo',
    icon: '🔥',
    category: 'combo',
    requirement: { type: 'highestCombo', target: 5 },
    reward: { coins: 30 },
  },
  {
    id: 'combo_8',
    title: 'Unstoppable Force',
    description: 'Achieve an 8x combo',
    icon: '⚡',
    category: 'combo',
    requirement: { type: 'highestCombo', target: 8 },
    reward: { coins: 50 },
  },
  {
    id: 'combo_10',
    title: 'God Mode Achieved',
    description: 'Achieve a 10x combo',
    icon: '🌟',
    category: 'combo',
    requirement: { type: 'highestCombo', target: 10 },
    reward: { coins: 100 },
  },
  {
    id: 'combo_15',
    title: 'Infinite',
    description: 'Achieve a 15x combo',
    icon: '♾️',
    category: 'combo',
    requirement: { type: 'highestCombo', target: 15 },
    reward: { coins: 200 },
  },

  // Games played
  {
    id: 'games_1',
    title: 'First Game',
    description: 'Play your first game',
    icon: '🎮',
    category: 'games',
    requirement: { type: 'totalGames', target: 1 },
    reward: { coins: 5 },
  },
  {
    id: 'games_10',
    title: 'Getting Hooked',
    description: 'Play 10 games',
    icon: '🎲',
    category: 'games',
    requirement: { type: 'totalGames', target: 10 },
    reward: { coins: 20 },
  },
  {
    id: 'games_50',
    title: 'Dedicated Player',
    description: 'Play 50 games',
    icon: '💪',
    category: 'games',
    requirement: { type: 'totalGames', target: 50 },
    reward: { coins: 50 },
  },
  {
    id: 'games_100',
    title: 'Block Blast Addict',
    description: 'Play 100 games',
    icon: '🎰',
    category: 'games',
    requirement: { type: 'totalGames', target: 100 },
    reward: { coins: 100 },
  },
  {
    id: 'games_500',
    title: 'Block Blast Veteran',
    description: 'Play 500 games',
    icon: '🏅',
    category: 'games',
    requirement: { type: 'totalGames', target: 500 },
    reward: { coins: 300 },
  },

  // Lines cleared
  {
    id: 'lines_10',
    title: 'Clean Sweep',
    description: 'Clear 10 lines total',
    icon: '🧹',
    category: 'lines',
    requirement: { type: 'totalLinesCleared', target: 10 },
    reward: { coins: 10 },
  },
  {
    id: 'lines_50',
    title: 'Tidy Player',
    description: 'Clear 50 lines total',
    icon: '✨',
    category: 'lines',
    requirement: { type: 'totalLinesCleared', target: 50 },
    reward: { coins: 25 },
  },
  {
    id: 'lines_200',
    title: 'Line Destroyer',
    description: 'Clear 200 lines total',
    icon: '💥',
    category: 'lines',
    requirement: { type: 'totalLinesCleared', target: 200 },
    reward: { coins: 50 },
  },
  {
    id: 'lines_1000',
    title: 'Massive Clears',
    description: 'Clear 1,000 lines total',
    icon: '🌊',
    category: 'lines',
    requirement: { type: 'totalLinesCleared', target: 1000 },
    reward: { coins: 100 },
  },

  // Power-up uses
  {
    id: 'powerup_1',
    title: 'Power Up!',
    description: 'Use your first power-up',
    icon: '💡',
    category: 'powerup',
    requirement: { type: 'totalPowerUpsUsed', target: 1 },
    reward: { coins: 10 },
  },
  {
    id: 'powerup_10',
    title: 'Power User',
    description: 'Use 10 power-ups',
    icon: '🔋',
    category: 'powerup',
    requirement: { type: 'totalPowerUpsUsed', target: 10 },
    reward: { coins: 30 },
  },
  {
    id: 'powerup_50',
    title: 'Addicted to Power',
    description: 'Use 50 power-ups',
    icon: '⚡',
    category: 'powerup',
    requirement: { type: 'totalPowerUpsUsed', target: 50 },
    reward: { coins: 75 },
  },

  // Special achievements
  {
    id: 'first_theme',
    title: 'Customizer',
    description: 'Buy your first theme',
    icon: '🎨',
    category: 'special',
    requirement: { type: 'themesPurchased', target: 1 },
    reward: { coins: 20 },
  },
  {
    id: 'all_themes',
    title: 'Completionist',
    description: 'Buy all available themes',
    icon: '🌈',
    category: 'special',
    requirement: { type: 'themesPurchased', target: 8 },
    reward: { coins: 200 },
  },
  {
    id: 'premium',
    title: 'Premium Player',
    description: 'Buy premium',
    icon: '💎',
    category: 'special',
    requirement: { type: 'isPremium', target: 1 },
    reward: { coins: 50 },
  },
  {
    id: 'million_score',
    title: 'Millionaire',
    description: 'Reach a total score of 1,000,000',
    icon: '💰',
    category: 'special',
    requirement: { type: 'totalScore', target: 1_000_000 },
    reward: { coins: 500 },
  },
];

export function checkAchievements(
  stats: {
    highScore: number;
    highestCombo: number;
    totalGames: number;
    totalLinesCleared: number;
    totalPowerUpsUsed: number;
    totalScore: number;
    themesPurchased: number;
    isPremium: boolean;
  },
  unlockedIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    if (unlockedIds.includes(a.id)) return false;
    const req = a.requirement;
    switch (req.type) {
      case 'highScore':
        return stats.highScore >= req.target;
      case 'highestCombo':
        return stats.highestCombo >= req.target;
      case 'totalGames':
        return stats.totalGames >= req.target;
      case 'totalLinesCleared':
        return stats.totalLinesCleared >= req.target;
      case 'totalPowerUpsUsed':
        return stats.totalPowerUpsUsed >= req.target;
      case 'totalScore':
        return stats.totalScore >= req.target;
      case 'themesPurchased':
        return stats.themesPurchased >= req.target;
      case 'isPremium':
        return stats.isPremium === true;
      default:
        return false;
    }
  });
}
