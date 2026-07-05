import type { ComboState } from '@/types/game';
import { getComboTier } from './scoring';

// ==================== COMBO SYSTEM ====================

export function createInitialComboState(): ComboState {
  return {
    count: 0,
    tier: 'none',
    multiplier: 1,
    bonusPoints: 0,
  };
}

// Update combo state after a successful clear
export function updateComboOnClear(currentCombo: ComboState): ComboState {
  const newCount = currentCombo.count + 1;
  const tierInfo = getComboTier(newCount);

  return {
    count: newCount,
    tier: tierInfo.tier,
    multiplier: tierInfo.multiplier,
    bonusPoints: tierInfo.bonus,
  };
}

// Reset combo when no clear in a turn
export function resetCombo(): ComboState {
  return createInitialComboState();
}

// Get combo display info
export interface ComboDisplayInfo {
  text: string;
  color: string;
  shake: boolean;
  flash: boolean;
  glow: boolean;
}

export function getComboDisplayInfo(combo: ComboState): ComboDisplayInfo {
  switch (combo.tier) {
    case 'godmode':
      return {
        text: 'GOD MODE!',
        color: '#FFD700',
        shake: true,
        flash: true,
        glow: true,
      };
    case 'fever':
      return {
        text: 'FEVER!',
        color: '#FF6B35',
        shake: true,
        flash: true,
        glow: true,
      };
    case 'quad':
      return {
        text: 'QUAD!',
        color: '#EF4444',
        shake: true,
        flash: true,
        glow: false,
      };
    case 'triple':
      return {
        text: 'TRIPLE!',
        color: '#F59E0B',
        shake: true,
        flash: false,
        glow: false,
      };
    case 'double':
      return {
        text: 'DOUBLE!',
        color: '#EAB308',
        shake: false,
        flash: false,
        glow: false,
      };
    default:
      return {
        text: '',
        color: '',
        shake: false,
        flash: false,
        glow: false,
      };
  }
}
