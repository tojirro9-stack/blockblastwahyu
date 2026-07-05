import type { ComboState, ClearResult, ComboTier } from '@/types/game';

// ==================== SCORING SYSTEM ====================

export const BASE_POINTS_PER_CELL = 10;

// Simultaneous clear multipliers
export function getSimultaneousMultiplier(clearCount: number): number {
  if (clearCount === 0) return 0;
  if (clearCount === 1) return 1;
  if (clearCount === 2) return 1.5;
  if (clearCount === 3) return 2;
  return 3; // 4+
}

// Combo tier thresholds and bonuses
export function getComboTier(comboCount: number): { tier: ComboTier; bonus: number; multiplier: number; label: string } {
  if (comboCount >= 6) {
    return { tier: 'godmode', bonus: 1000, multiplier: 3, label: 'GOD MODE!' };
  }
  if (comboCount >= 5) {
    return { tier: 'fever', bonus: 500, multiplier: 2, label: 'FEVER!' };
  }
  if (comboCount >= 4) {
    return { tier: 'quad', bonus: 300, multiplier: 1, label: 'QUAD!' };
  }
  if (comboCount >= 3) {
    return { tier: 'triple', bonus: 150, multiplier: 1, label: 'TRIPLE!' };
  }
  if (comboCount >= 2) {
    return { tier: 'double', bonus: 50, multiplier: 1, label: 'DOUBLE!' };
  }
  return { tier: 'none', bonus: 0, multiplier: 1, label: '' };
}

// Calculate score from a clear result
export function calculateScore(
  clearResult: ClearResult,
  comboState: ComboState
): { totalScore: number; breakdown: string } {
  const baseScore = clearResult.totalCells * BASE_POINTS_PER_CELL * clearResult.multiplier;
  const comboMultiplier = comboState.multiplier;
  const comboBonus = comboState.bonusPoints;

  const totalScore = Math.floor(baseScore * comboMultiplier + comboBonus);

  let breakdown = '';
  if (clearResult.multiplier > 1) {
    breakdown = `${clearResult.totalCells} cells x ${BASE_POINTS_PER_CELL} x ${clearResult.multiplier}x clear`;
  } else {
    breakdown = `${clearResult.totalCells} cells x ${BASE_POINTS_PER_CELL}`;
  }
  if (comboMultiplier > 1) {
    breakdown += ` x ${comboMultiplier}x combo`;
  }
  if (comboBonus > 0) {
    breakdown += ` + ${comboBonus} bonus`;
  }

  return { totalScore, breakdown };
}

// Calculate placement score (points for placing piece)
export function calculatePlacementScore(cellCount: number): number {
  return cellCount * 5;
}

// Generate floating text for score
export function generateScoreText(score: number, comboTier: ComboTier): string {
  if (comboTier === 'godmode') return `+${score} GOD!`;
  if (comboTier === 'fever') return `+${score} FEVER!`;
  if (comboTier === 'quad') return `+${score} QUAD!`;
  if (comboTier === 'triple') return `+${score} TRIPLE!`;
  if (comboTier === 'double') return `+${score} DOUBLE!`;
  return `+${score}`;
}
