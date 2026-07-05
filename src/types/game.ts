// ==================== TYPES & INTERFACES ====================

export type CellValue = string | null;

export type Board = CellValue[][];

export interface Position {
  row: number;
  col: number;
}

export interface PieceShape {
  name: string;
  shape: number[][];
  weight: number;
}

export interface Piece {
  id: string;
  shape: number[][];
  color: string;
  name: string;
}

export type ComboTier = 'none' | 'double' | 'triple' | 'quad' | 'fever' | 'godmode';

export interface ComboState {
  count: number;
  tier: ComboTier;
  multiplier: number;
  bonusPoints: number;
}

export type GamePhase = 'splash' | 'home' | 'playing' | 'paused' | 'gameover' | 'leaderboard' | 'shop' | 'profile' | 'settings' | 'friends';

export type PowerUpType = 'bomb' | 'undo' | 'shuffle' | 'lightning' | 'star_boost' | 'color_bomb' | 'row_clear' | 'col_clear';

export interface PowerUp {
  type: PowerUpType;
  quantity: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  score: number;
  date: string;
  rank?: number;
}

export interface UserProfile {
  username: string;
  avatar: string;
  bestScore: number;
  totalGames: number;
  totalScore: number;
  highestCombo: number;
  rank: number;
  coins: number;
  isPremium: boolean;
  purchasedThemes: string[];
  powerUps: PowerUp[];
  // New fields
  totalLinesCleared: number;
  totalPowerUpsUsed: number;
  unlockedAchievements: string[];
  tutorialCompleted: boolean;
  dailyStreak: number;
  lastDailyClaim: string | null;
  highestComboEver: number;
  timedHighScore: number;
  limitedMovesHighScore: number;
  blitzHighScore: number;
}

export interface Theme {
  id: string;
  name: string;
  price: number;
  description: string;
  colors: {
    bg: string;
    surface: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    textPrimary: string;
    textSecondary: string;
    blocks: string[];
  };
  particleEffect?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'theme' | 'powerup' | 'premium';
  priceCoin: number;
  priceIdr?: number;
  description: string;
  quantity?: number;
  icon: string;
}

export interface GameState {
  // Board
  board: Board;
  // Pieces
  currentPieces: (Piece | null)[];
  // Score
  score: number;
  highScore: number;
  // Combo
  combo: ComboState;
  // Phase
  phase: GamePhase;
  // Power-ups
  activePowerUps: PowerUp[];
  // Session
  movesMade: number;
  linesCleared: number;
  // Theme
  currentTheme: string;
  // Animation states
  explodingCells: Position[];
  shaking: boolean;
  comboDisplay: { tier: ComboTier; text: string } | null;
  floatingTexts: FloatingText[];
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

export interface ClearResult {
  lines: number[];
  columns: number[];
  totalCells: number;
  multiplier: number;
  score: number;
}

export interface PlacementResult {
  success: boolean;
  clears?: ClearResult;
  newCombo?: ComboState;
  gameOver?: boolean;
  scoreAdded?: number;
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  bestScore: number;
  status: 'online' | 'offline' | 'playing';
}
