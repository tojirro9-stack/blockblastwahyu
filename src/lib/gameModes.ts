// ==================== GAME MODE VARIATIONS ====================

export type GameModeType = 'classic' | 'timed' | 'limited_moves' | 'blitz';

export interface GameModeConfig {
  type: GameModeType;
  label: string;
  description: string;
  icon: string;
  boardSize: number;
  /** Time limit in seconds (0 = unlimited) */
  timeLimit: number;
  /** Move limit (0 = unlimited) */
  moveLimit: number;
  /** Score multiplier */
  scoreMultiplier: number;
  /** Difficulty scaling */
  difficultyLabel: string;
}

export const GAME_MODES: Record<GameModeType, GameModeConfig> = {
  classic: {
    type: 'classic',
    label: 'Classic',
    description: 'Play without limits. Just pure block-blasting fun!',
    icon: '🎮',
    boardSize: 8,
    timeLimit: 0,
    moveLimit: 0,
    scoreMultiplier: 1,
    difficultyLabel: 'Casual',
  },
  timed: {
    type: 'timed',
    label: 'Timed',
    description: 'Race against the clock! Score as many points as you can in 3 minutes.',
    icon: '⏱️',
    boardSize: 8,
    timeLimit: 180, // 3 minutes
    moveLimit: 0,
    scoreMultiplier: 1.5,
    difficultyLabel: 'Challenging',
  },
  limited_moves: {
    type: 'limited_moves',
    label: 'Limited Moves',
    description: 'Only 50 moves. Make each one count!',
    icon: '🎯',
    boardSize: 8,
    timeLimit: 0,
    moveLimit: 50,
    scoreMultiplier: 2,
    difficultyLabel: 'Hard',
  },
  blitz: {
    type: 'blitz',
    label: 'Blitz',
    description: 'Fast-paced! Score multiplier increases the faster you play.',
    icon: '⚡',
    boardSize: 6, // Smaller board = faster games
    timeLimit: 120, // 2 minutes
    moveLimit: 0,
    scoreMultiplier: 2.5,
    difficultyLabel: 'Expert',
  },
};

export function getGameMode(type: GameModeType): GameModeConfig {
  return GAME_MODES[type] || GAME_MODES.classic;
}
