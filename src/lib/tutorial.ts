// ==================== TUTORIAL / ONBOARDING SYSTEM ====================

export interface TutorialStep {
  id: string;
  title: string;
  text: string;
  /** CSS selector to highlight, or 'center' to show centered overlay */
  target?: string;
  /** Position of the tooltip relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Action the user must take to proceed */
  action?: 'tap' | 'play_game' | 'place_piece' | 'clear_line' | 'any';
  /** Auto-advance delay in ms (overrides action) */
  autoAdvanceMs?: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Block Blast Pro!',
    text: 'Let\'s learn how to play. It\'s simple and fun! 🎮',
    position: 'center',
    action: 'tap',
  },
  {
    id: 'pieces',
    title: 'Choose a Piece',
    text: 'Tap or drag a piece from the tray below to select it.',
    target: '#piece-tray',
    position: 'top',
    action: 'place_piece',
  },
  {
    id: 'ghost',
    title: 'See Where It Goes',
    text: 'A ghost preview shows where the piece will land. Green means valid!',
    target: '#game-board-grid',
    position: 'top',
    action: 'place_piece',
  },
  {
    id: 'clearing',
    title: 'Clear Lines & Columns',
    text: 'Fill an entire row or column to clear it. Clear multiple at once for bonus points!',
    target: '#game-board-grid',
    position: 'bottom',
    action: 'clear_line',
  },
  {
    id: 'combo',
    title: 'Build Combos!',
    text: 'Clear lines consecutively to build combos. Double → Triple → Quad → Fever → GOD MODE!',
    position: 'center',
    action: 'any',
  },
  {
    id: 'powerups',
    title: 'Power-ups',
    text: 'Use power-ups like Bomb 💣 or Shuffle 🔀 to help when you\'re stuck. Tap the icons above the score!',
    target: '#powerup-bar',
    position: 'bottom',
    action: 'any',
  },
  {
    id: 'game_over',
    title: 'Don\'t Run Out of Space!',
    text: 'If you can\'t place any piece, the game ends. Plan ahead!',
    position: 'center',
    action: 'tap',
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    text: 'Now go play and aim for the high score! Good luck!',
    position: 'center',
    action: 'tap',
  },
];

export function getTutorialStep(index: number): TutorialStep | null {
  return TUTORIAL_STEPS[index] || null;
}

export const TUTORIAL_TOTAL_STEPS = TUTORIAL_STEPS.length;
