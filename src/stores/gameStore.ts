import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Board, Piece, GamePhase, ComboState, FloatingText,
  LeaderboardEntry, UserProfile, ShopItem, Position, PowerUpType
} from '@/types/game';
import {
  createEmptyBoard, canPlacePiece, placePiece,
  hasAnyValidPlacement, findCompletedLines, findCompletedColumns,
  clearLinesAndColumns, calculateClearResult, BOARD_SIZE
} from '@/lib/game-engine/board';
import { generateThreePieces, getRandomColor } from '@/lib/game-engine/pieces';
import {
  createInitialComboState, updateComboOnClear, resetCombo, getComboDisplayInfo
} from '@/lib/game-engine/combo';
import { calculateScore, calculatePlacementScore } from '@/lib/game-engine/scoring';
import { sound } from '@/lib/sound';
import { haptic } from '@/lib/haptic';
import { applyBomb, applyLightning, applyColorBomb, applyRowClear, applyColClear, findDominantColor, findBestLineTarget } from '@/lib/powerups';
import { type GameModeType, getGameMode } from '@/lib/gameModes';
import { UndoHistory } from '@/lib/undoHistory';
import { checkAchievements } from '@/lib/achievements';
import { getStreakStatus } from '@/lib/dailyRewards';
import { networkSync } from '@/lib/networkSync';

interface GameStore {
  board: Board;
  currentPieces: (Piece | null)[];
  score: number;
  highScore: number;
  combo: ComboState;
  phase: GamePhase;
  movesMade: number;
  linesCleared: number;
  currentTheme: string;
  explodingCells: Position[];
  shaking: boolean;
  comboDisplay: { tier: string; text: string } | null;
  floatingTexts: FloatingText[];
  leaderboard: LeaderboardEntry[];
  userProfile: UserProfile;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  selectedPiece: number | null;
  ghostPosition: Position | null;
  boardRect: { left: number; top: number; cellSize: number; gap: number } | null;
  showGameOver: boolean;

  // New feature state
  showTutorial: boolean;
  tutorialStep: number;
  showDailyReward: boolean;
  showGameModeSelect: boolean;
  gameMode: GameModeType;
  timeRemaining: number;
  moveCounter: number;
  starBoostActive: boolean;
  starBoostCount: number;
  showAchievementPopup: Achievement | null;
  pendingAchievements: Achievement[];

  // Core actions
  initGame: () => void;
  startGame: () => void;
  startGameWithMode: (mode: GameModeType) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  goHome: () => void;
  goToScreen: (screen: GamePhase) => void;

  // Board actions
  setSelectedPiece: (index: number | null) => void;
  setGhostPosition: (pos: Position | null) => void;
  setBoardRect: (rect: { left: number; top: number; cellSize: number; gap: number }) => void;
  tryPlacePiece: (pieceIndex: number, row: number, col: number) => boolean;
  clearExplodingCells: () => void;

  // Theme & settings
  setTheme: (themeId: string) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  updateUsername: (username: string) => void;
  buyItem: (item: ShopItem) => boolean;
  resetProgress: () => void;

  // Power-ups
  usePowerUp: (type: PowerUpType) => void;
  performUndo: () => boolean;
  useBombPowerUp: () => void;
  useLightningPowerUp: () => void;
  useColorBombPowerUp: () => void;
  useRowClearPowerUp: () => void;
  useColClearPowerUp: () => void;

  // Timed mode
  tickTimer: () => void;

  // Tutorial
  startTutorial: () => void;
  setTutorialStep: (step: number) => void;
  closeTutorial: () => void;

  // Daily rewards
  claimDailyReward: () => void;
  closeDailyReward: () => void;

  // Game mode select
  setShowGameModeSelect: (v: boolean) => void;

  // Leaderboard helpers
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;

  // Misc
  clearFloatingTexts: () => void;
  setShowGameOver: (v: boolean) => void;
  dismissAchievement: () => void;
}

// Import Achievement type for the store interface
import type { Achievement } from '@/lib/achievements';

const DEFAULT_PROFILE: UserProfile = {
  username: 'Player',
  avatar: '',
  bestScore: 0,
  totalGames: 0,
  totalScore: 0,
  highestCombo: 0,
  rank: 0,
  coins: 200,
  isPremium: false,
  purchasedThemes: ['default'],
  powerUps: [
    { type: 'bomb', quantity: 1 },
    { type: 'undo', quantity: 2 },
    { type: 'shuffle', quantity: 1 },
    { type: 'lightning', quantity: 0 },
    { type: 'star_boost', quantity: 0 },
    { type: 'color_bomb', quantity: 0 },
    { type: 'row_clear', quantity: 0 },
    { type: 'col_clear', quantity: 0 },
  ],
  // New fields
  totalLinesCleared: 0,
  totalPowerUpsUsed: 0,
  unlockedAchievements: [],
  tutorialCompleted: false,
  dailyStreak: 0,
  lastDailyClaim: null,
  highestComboEver: 0,
  timedHighScore: 0,
  limitedMovesHighScore: 0,
  blitzHighScore: 0,
};

let comboDispKey = 0;
let floatingKeySeq = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      board: createEmptyBoard(),
      currentPieces: [null, null, null],
      score: 0,
      highScore: 0,
      combo: createInitialComboState(),
      phase: 'splash',
      movesMade: 0,
      linesCleared: 0,
      currentTheme: 'default',
      explodingCells: [],
      shaking: false,
      comboDisplay: null,
      floatingTexts: [],
      leaderboard: [],
      userProfile: { ...DEFAULT_PROFILE },
      soundEnabled: true,
      hapticEnabled: true,
      selectedPiece: null,
      ghostPosition: null,
      boardRect: null,
      showGameOver: false,

      // New feature state
      showTutorial: false,
      tutorialStep: 0,
      showDailyReward: false,
      showGameModeSelect: false,
      gameMode: 'classic' as GameModeType,
      timeRemaining: 0,
      moveCounter: 0,
      starBoostActive: false,
      starBoostCount: 0,
      showAchievementPopup: null,
      pendingAchievements: [],

      initGame: () => {
        const shapes = generateThreePieces();
        const pieces: Piece[] = shapes.map((shape, i) => ({
          id: `piece_${Date.now()}_${i}`,
          shape: shape.shape,
          color: getRandomColor(),
          name: shape.name,
        }));

        set({
          board: createEmptyBoard(),
          currentPieces: pieces,
          score: 0,
          combo: createInitialComboState(),
          phase: 'home',
          movesMade: 0,
          linesCleared: 0,
          explodingCells: [],
          shaking: false,
          comboDisplay: null,
          floatingTexts: [],
          selectedPiece: null,
          ghostPosition: null,
          showGameOver: false,
        });

        try {
          const lb = localStorage.getItem('bbp_leaderboard');
          if (lb) {
            set({ leaderboard: JSON.parse(lb) });
          }
        } catch { /* ignore */ }

        // Check daily reward
        const state = get();
        const streakStatus = getStreakStatus(state.userProfile.lastDailyClaim, state.userProfile.dailyStreak);
        if (streakStatus.canClaim) {
          set({ showDailyReward: true });
        }
      },

      startGame: () => {
        // Enforce online-only play: require network sync connection before starting.
        if (!networkSync.connected) {
          // Redirect user to Settings to connect to the global leaderboard.
          set({ phase: 'settings' });
          return;
        }
        const shapes = generateThreePieces();
        const pieces: Piece[] = shapes.map((shape, i) => ({
          id: `piece_${Date.now()}_${i}`,
          shape: shape.shape,
          color: getRandomColor(),
          name: shape.name,
        }));

        // Stop any existing timer
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        set({
          board: createEmptyBoard(),
          currentPieces: pieces,
          score: 0,
          combo: createInitialComboState(),
          phase: 'playing',
          movesMade: 0,
          linesCleared: 0,
          explodingCells: [],
          shaking: false,
          comboDisplay: null,
          floatingTexts: [],
          selectedPiece: null,
          ghostPosition: null,
          showGameOver: false,
          gameMode: 'classic',
          timeRemaining: 0,
          moveCounter: 0,
          starBoostActive: false,
          starBoostCount: 0,
        });

        // Start BGM
        sound.startBGM();
      },

      startGameWithMode: (mode: GameModeType) => {
        // Enforce online-only play: require network sync connection before starting.
        if (!networkSync.connected) {
          set({ phase: 'settings' });
          return;
        }
        const config = getGameMode(mode);
        const shapes = generateThreePieces();
        const pieces: Piece[] = shapes.map((shape, i) => ({
          id: `piece_${Date.now()}_${i}`,
          shape: shape.shape,
          color: getRandomColor(),
          name: shape.name,
        }));

        // Stop any existing timer
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        set({
          board: createEmptyBoard(),
          currentPieces: pieces,
          score: 0,
          combo: createInitialComboState(),
          phase: 'playing',
          movesMade: 0,
          linesCleared: 0,
          explodingCells: [],
          shaking: false,
          comboDisplay: null,
          floatingTexts: [],
          selectedPiece: null,
          ghostPosition: null,
          showGameOver: false,
          showGameModeSelect: false,
          gameMode: mode,
          timeRemaining: config.timeLimit,
          moveCounter: config.moveLimit > 0 ? config.moveLimit : 0,
          starBoostActive: false,
          starBoostCount: 0,
        });

        // Start timer for timed/blitz modes
        if (config.timeLimit > 0) {
          timerInterval = setInterval(() => {
            const state = get();
            if (state.phase !== 'playing') return;
            if (state.timeRemaining <= 1) {
              // Time's up!
              if (timerInterval) clearInterval(timerInterval);
              timerInterval = null;
              sound.play('times_up');
              get().endGame();
            } else {
              set({ timeRemaining: state.timeRemaining - 1 });
              if (state.timeRemaining <= 10) {
                sound.play('countdown');
              }
            }
          }, 1000);
        }

        sound.startBGM();
      },

      pauseGame: () => set({ phase: 'paused' }),

      resumeGame: () => {
        set({ phase: 'playing' });
        // Restart timer if needed
        const state = get();
        if (state.gameMode !== 'classic' && state.gameMode !== 'limited_moves') {
          const config = getGameMode(state.gameMode);
          if (config.timeLimit > 0 && state.timeRemaining > 0 && !timerInterval) {
            timerInterval = setInterval(() => {
              const s = get();
              if (s.phase !== 'playing') return;
              if (s.timeRemaining <= 1) {
                if (timerInterval) clearInterval(timerInterval);
                timerInterval = null;
                sound.play('times_up');
                s.endGame();
              } else {
                set({ timeRemaining: s.timeRemaining - 1 });
                if (s.timeRemaining <= 10) sound.play('countdown');
              }
            }, 1000);
          }
        }
      },

      endGame: () => {
        const state = get();
        if (state.phase === 'gameover') return;

        // Stop timer
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        sound.stopBGM();

        const finalScore = state.score;
        const mode = state.gameMode;
        const comboCount = state.combo.count;

        // Determine high score for current mode
        let isNewBest = false;
        let highScoreField = state.highScore;
        if (mode === 'timed') {
          isNewBest = finalScore > state.userProfile.timedHighScore;
          highScoreField = Math.max(state.highScore, finalScore);
        } else if (mode === 'limited_moves') {
          isNewBest = finalScore > state.userProfile.limitedMovesHighScore;
          highScoreField = Math.max(state.highScore, finalScore);
        } else if (mode === 'blitz') {
          isNewBest = finalScore > state.userProfile.blitzHighScore;
          highScoreField = Math.max(state.highScore, finalScore);
        } else {
          isNewBest = finalScore > state.highScore;
          highScoreField = Math.max(state.highScore, finalScore);
        }

        const newProfile = { ...state.userProfile };
        newProfile.totalGames += 1;
        newProfile.totalScore += finalScore;
        newProfile.totalLinesCleared += state.linesCleared;

        if (isNewBest) {
          newProfile.bestScore = Math.max(newProfile.bestScore, finalScore);
          newProfile.coins += 25;

          // Update mode-specific high score
          if (mode === 'timed') newProfile.timedHighScore = Math.max(newProfile.timedHighScore, finalScore);
          if (mode === 'limited_moves') newProfile.limitedMovesHighScore = Math.max(newProfile.limitedMovesHighScore, finalScore);
          if (mode === 'blitz') newProfile.blitzHighScore = Math.max(newProfile.blitzHighScore, finalScore);
        }

        if (comboCount > newProfile.highestComboEver) {
          newProfile.highestComboEver = comboCount;
        }
        if (comboCount > newProfile.highestCombo) {
          newProfile.highestCombo = comboCount;
        }
        if (comboCount >= 6) {
          newProfile.coins += 30;
        }

        // Add coins for score
        const scoreCoins = Math.floor(finalScore / 100);
        newProfile.coins += scoreCoins;

        // Check achievements
        const stats = {
          highScore: Math.max(state.highScore, finalScore),
          highestCombo: Math.max(state.userProfile.highestComboEver, comboCount),
          totalGames: newProfile.totalGames,
          totalLinesCleared: newProfile.totalLinesCleared,
          totalPowerUpsUsed: newProfile.totalPowerUpsUsed,
          totalScore: newProfile.totalScore,
          themesPurchased: newProfile.purchasedThemes.length,
          isPremium: newProfile.isPremium,
        };
        const newAchievements = checkAchievements(stats, newProfile.unlockedAchievements);
        const pendingAchievements: Achievement[] = [];
        for (const a of newAchievements) {
          if (!newProfile.unlockedAchievements.includes(a.id)) {
            newProfile.unlockedAchievements.push(a.id);
            newProfile.coins += a.reward.coins;
            pendingAchievements.push(a);
          }
        }

        const entry: LeaderboardEntry = {
          id: `lb_${Date.now()}`,
          username: newProfile.username,
          avatar: newProfile.avatar,
          score: finalScore,
          date: new Date().toISOString().split('T')[0],
        };

        const newLeaderboard = [...state.leaderboard, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 100);

        try {
          localStorage.setItem('bbp_leaderboard', JSON.stringify(newLeaderboard));
        } catch { /* ignore */ }

        // Submit to network sync if connected
        try {
          networkSync.submitScore(finalScore, newProfile.username, state.linesCleared, comboCount, mode);
        } catch {}
        
        // Broadcast to other tabs via BroadcastChannel
        try {
          const bc = new BroadcastChannel('bbp_sync');
          bc.postMessage({ type: 'new_score', leaderboard: newLeaderboard });
          bc.close();
        } catch {}

        sound.play(isNewBest ? 'newbest' : 'gameover');
        haptic.trigger('heavy');

        set({
          phase: 'gameover',
          highScore: isNewBest ? finalScore : highScoreField,
          userProfile: newProfile,
          leaderboard: newLeaderboard,
          selectedPiece: null,
          ghostPosition: null,
          showGameOver: true,
          pendingAchievements,
        });

        // Show first achievement popup after a delay
        if (pendingAchievements.length > 0) {
          setTimeout(() => {
            const s = get();
            if (s.pendingAchievements.length > 0) {
              set({ showAchievementPopup: s.pendingAchievements[0], pendingAchievements: s.pendingAchievements.slice(1) });
              sound.play('achievement');
            }
          }, 1500);
        }
      },

      goHome: () => {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        sound.stopBGM();
        set({
          phase: 'home',
          selectedPiece: null,
          ghostPosition: null,
          showGameOver: false,
          comboDisplay: null,
          floatingTexts: [],
          explodingCells: [],
          shaking: false,
          pendingAchievements: [],
          showAchievementPopup: null,
        });
      },

      goToScreen: (screen: GamePhase) =>
        set({
          phase: screen,
          selectedPiece: null,
          ghostPosition: null,
          showGameOver: false,
        }),

      setSelectedPiece: (index) => set({ selectedPiece: index }),
      setGhostPosition: (pos) => set({ ghostPosition: pos }),

      setBoardRect: (rect) => {
        const cur = get().boardRect;
        if (
          !cur ||
          cur.left !== rect.left ||
          cur.top !== rect.top ||
          Math.abs(cur.cellSize - rect.cellSize) > 1 ||
          cur.gap !== rect.gap
        ) {
          set({ boardRect: rect });
        }
      },

      tryPlacePiece: (pieceIndex, row, col) => {
        const state = get();
        const piece = state.currentPieces[pieceIndex];
        if (!piece) return false;

        const rows = piece.shape.length;
        const cols = piece.shape[0]?.length || 0;
        const maxRow = BOARD_SIZE - rows;
        const maxCol = BOARD_SIZE - cols;

        // Clamp initial coordinates
        let targetRow = Math.max(0, Math.min(maxRow, row));
        let targetCol = Math.max(0, Math.min(maxCol, col));

        const tryAnchor = (r: number, c: number) =>
          canPlacePiece(state.board, piece.shape, r, c);

        // Try direct placement first
        if (!tryAnchor(targetRow, targetCol)) {
          // Auto-snap: search increasing radii
          let found = false;
          searchLoop:
          for (let radius = 1; radius <= 3; radius++) {
            for (let dr = -radius; dr <= radius && !found; dr++) {
              for (let dc = -radius; dc <= radius && !found; dc++) {
                if (dr === 0 && dc === 0) continue;
                const rr = row + dr;
                const cc = col + dc;
                const cr = Math.max(0, Math.min(maxRow, rr));
                const cc2 = Math.max(0, Math.min(maxCol, cc));
                if (tryAnchor(cr, cc2)) {
                  targetRow = cr;
                  targetCol = cc2;
                  found = true;
                  break searchLoop;
                }
              }
            }
          }

          if (!found) {
            set({ selectedPiece: null, ghostPosition: null });
            sound.play('error');

            // After failed placement attempt, check if any remaining piece can be placed
            // This ensures Game Over is triggered when the board is truly full
            const remainingPieces = state.currentPieces
              .filter((p): p is Piece => p !== null)
              .map((p) => p.shape);
            if (remainingPieces.length > 0 && !hasAnyValidPlacement(state.board, remainingPieces)) {
              setTimeout(() => {
                try { get().endGame(); } catch {}
              }, 500);
            }

            return false;
          }
        }

        // Save undo snapshot before placing
        const undoHistory = new UndoHistory();
        undoHistory.push({
          board: state.board,
          pieces: state.currentPieces,
          score: state.score,
          combo: state.combo,
          movesMade: state.movesMade,
          linesCleared: state.linesCleared,
          explodingCells: state.explodingCells,
        });

        // Place piece
        const newBoard = placePiece(state.board, piece.shape, targetRow, targetCol, piece.color);

        const cellCount = piece.shape.flat().filter((c) => c === 1).length;
        let placementScore = calculatePlacementScore(cellCount);

        // Star boost multiplier
        if (state.starBoostActive && state.starBoostCount > 0) {
          placementScore *= 2;
        }

        let totalScore = state.score + placementScore;

        const lines = findCompletedLines(newBoard);
        const columns = findCompletedColumns(newBoard);

        let updatedBoard = newBoard;
        let updatedCombo = state.combo;
        const newExplodingCells: Position[] = [];
        let shakeBoard = false;
        let comboDisp: { tier: string; text: string } | null = null;
        const newFloatingTexts: FloatingText[] = [];

        if (lines.length > 0 || columns.length > 0) {
          const { board: clearedBoard, clearedPositions } = clearLinesAndColumns(
            newBoard, lines, columns
          );
          updatedBoard = clearedBoard;
          newExplodingCells.push(...clearedPositions);

          const clearResult = calculateClearResult(lines, columns, clearedPositions.length);

          updatedCombo = updateComboOnClear(updatedCombo);

          let { totalScore: clearScore } = calculateScore(clearResult, updatedCombo);

          // Star boost also applies to clear score
          if (state.starBoostActive && state.starBoostCount > 0) {
            clearScore = Math.floor(clearScore * 2);
          }

          totalScore += clearScore;

          if (updatedCombo.tier !== 'none') {
            const comboInfo = getComboDisplayInfo(updatedCombo);
            comboDispKey++;
            comboDisp = { tier: updatedCombo.tier, text: comboInfo.text };

            newFloatingTexts.push({
              id: `combo_${comboDispKey}`,
              text: comboInfo.text,
              x: 50, y: 35,
              color: comboInfo.color,
              createdAt: Date.now(),
            });

            if (updatedCombo.tier === 'fever' || updatedCombo.tier === 'godmode') {
              shakeBoard = true;
            }
          }

          floatingKeySeq++;
          newFloatingTexts.push({
            id: `score_${floatingKeySeq}`,
            text: `+${clearScore}`,
            x: 30 + Math.random() * 40, y: 20,
            color: '#F59E0B',
            createdAt: Date.now(),
          });

          if (clearResult.multiplier > 1) {
            floatingKeySeq++;
            const clearNames: Record<number, string> = {
              1.5: 'NICE!', 2: 'GREAT!', 3: 'ULTRA BLAST!',
            };
            newFloatingTexts.push({
              id: `multi_${floatingKeySeq}`,
              text: `${clearNames[clearResult.multiplier] || 'AMAZING!'} ${clearResult.multiplier}x`,
              x: 50, y: 12,
              color: '#EF4444',
              createdAt: Date.now(),
            });
            shakeBoard = true;
          }

          sound.play('clear');

          // Play combo sounds
          if (updatedCombo.tier === 'godmode') sound.play('godmode');
          else if (updatedCombo.tier === 'fever') sound.play('fever');
          else if (updatedCombo.tier === 'quad') sound.play('quad');
          else if (updatedCombo.tier === 'triple') sound.play('triple');
          else if (updatedCombo.tier === 'double') sound.play('double');
          else if (updatedCombo.count > 1) sound.play('combo');

          haptic.trigger('success');
        } else {
          updatedCombo = resetCombo();
          sound.play('place');
          haptic.trigger('light');
        }

        // Update star boost
        let newStarBoostActive = state.starBoostActive;
        let newStarBoostCount = state.starBoostCount;
        if (state.starBoostActive && state.starBoostCount > 0) {
          newStarBoostCount -= 1;
          if (newStarBoostCount <= 0) {
            newStarBoostActive = false;
          }
        }

        // Replace used piece
        const newPieces: (Piece | null)[] = [...state.currentPieces];
        newPieces[pieceIndex] = null;

        const allUsed = newPieces.every((p) => p === null);
        let finalPieces = newPieces;
        if (allUsed) {
          const shapes = generateThreePieces();
          finalPieces = shapes.map((shape, i) => ({
            id: `piece_${Date.now()}_${i}`,
            shape: shape.shape,
            color: getRandomColor(),
            name: shape.name,
          })) as (Piece | null)[];
        }

        // Check game over
        const activeShapes = finalPieces
          .filter((p): p is Piece => p !== null)
          .map((p) => p.shape);
        const isGameOver = activeShapes.length > 0 && !hasAnyValidPlacement(updatedBoard, activeShapes);

        // Check limited moves
        const config = getGameMode(state.gameMode);
        let newMoveCounter = state.moveCounter;
        if (config.moveLimit > 0) {
          newMoveCounter = state.moveCounter - 1;
        }

        // Store undo snapshot reference
        (get() as any)._lastUndoHistory = undoHistory;

        set({
          board: updatedBoard,
          currentPieces: finalPieces,
          score: totalScore,
          combo: updatedCombo,
          explodingCells: newExplodingCells,
          shaking: shakeBoard,
          comboDisplay: comboDisp,
          floatingTexts: [...state.floatingTexts, ...newFloatingTexts],
          movesMade: state.movesMade + 1,
          linesCleared: state.linesCleared + lines.length + columns.length,
          selectedPiece: null,
          ghostPosition: null,
          starBoostActive: newStarBoostActive,
          starBoostCount: newStarBoostCount,
          moveCounter: newMoveCounter,
        });

        // Check game over conditions
        if (isGameOver || (config.moveLimit > 0 && newMoveCounter <= 0)) {
          if (config.moveLimit > 0 && newMoveCounter <= 0 && !isGameOver) {
            sound.play('times_up');
          }
          // Use a short delay to let the last placement render, then end game
          setTimeout(() => {
            try { get().endGame(); } catch {}
          }, 800);
        }

        return true;
      },

      clearExplodingCells: () => set({ explodingCells: [] }),

      setTheme: (themeId) => {
        const state = get();
        if (state.userProfile.purchasedThemes.includes(themeId)) {
          set({ currentTheme: themeId });
          sound.play('click');
          haptic.trigger('selection');
        }
      },

      toggleSound: () => {
        const newVal = !get().soundEnabled;
        set({ soundEnabled: newVal });
        sound.enabled = newVal;
        if (newVal) sound.play('click');
      },

      toggleHaptic: () => {
        const newVal = !get().hapticEnabled;
        set({ hapticEnabled: newVal });
        haptic.enabled = newVal;
      },

      updateUsername: (username) =>
        set((s) => ({
          userProfile: { ...s.userProfile, username },
        })),

      buyItem: (item) => {
        const state = get();
        if (state.userProfile.coins < item.priceCoin) {
          sound.play('error');
          return false;
        }

        const newProfile = { ...state.userProfile };
        newProfile.coins -= item.priceCoin;

        if (item.type === 'theme') {
          if (!newProfile.purchasedThemes.includes(item.id)) {
            newProfile.purchasedThemes.push(item.id);
          }
        } else if (item.type === 'powerup' && item.quantity) {
          const pu = newProfile.powerUps.find((p) => p.type === item.id.split('_')[0]);
          if (pu) {
            pu.quantity += item.quantity;
          }
        } else if (item.type === 'premium') {
          newProfile.isPremium = true;
        }

        set({ userProfile: newProfile });
        sound.play('coin');
        haptic.trigger('success');
        return true;
      },

      usePowerUp: (type) => {
        const state = get();
        if (state.phase !== 'playing') return;

        const pu = state.userProfile.powerUps.find((p) => p.type === type);
        if (!pu || pu.quantity <= 0) {
          sound.play('error');
          return;
        }

        const newProfile = { ...state.userProfile };
        const newPu = newProfile.powerUps.find((p) => p.type === type);
        if (newPu) newPu.quantity -= 1;
        newProfile.totalPowerUpsUsed += 1;

        sound.play('powerup');
        haptic.trigger('medium');

        switch (type) {
          case 'shuffle': {
            const shapes = generateThreePieces();
            const pieces: Piece[] = shapes.map((shape, i) => ({
              id: `piece_${Date.now()}_${i}`,
              shape: shape.shape,
              color: getRandomColor(),
              name: shape.name,
            }));
            set({ currentPieces: pieces, userProfile: newProfile });

            const stateNow = get();
            const activeShapes = pieces.map((p) => p.shape);
            if (!hasAnyValidPlacement(stateNow.board, activeShapes)) {
              setTimeout(() => get().endGame(), 500);
            }
            break;
          }
          case 'bomb': {
            set({ userProfile: newProfile });
            get().useBombPowerUp();
            break;
          }
          case 'lightning': {
            set({ userProfile: newProfile });
            get().useLightningPowerUp();
            break;
          }
          case 'star_boost': {
            set({
              userProfile: newProfile,
              starBoostActive: true,
              starBoostCount: 3,
            });
            // Floating text
            const seq = ++floatingKeySeq;
            set((s) => ({
              floatingTexts: [...s.floatingTexts, {
                id: `starboost_${seq}`,
                text: '⭐ STAR BOOST! 2x Score!',
                x: 50, y: 40,
                color: '#FFD700',
                createdAt: Date.now(),
              }],
            }));
            break;
          }
          case 'color_bomb': {
            set({ userProfile: newProfile });
            get().useColorBombPowerUp();
            break;
          }
          case 'row_clear': {
            set({ userProfile: newProfile });
            get().useRowClearPowerUp();
            break;
          }
          case 'col_clear': {
            set({ userProfile: newProfile });
            get().useColClearPowerUp();
            break;
          }
          case 'undo': {
            set({ userProfile: newProfile });
            get().performUndo();
            break;
          }
          default:
            set({ userProfile: newProfile });
        }
      },

      performUndo: () => {
        const state = get();
        const undoHistory = (state as any)._lastUndoHistory as UndoHistory | undefined;
        if (!undoHistory || undoHistory.length === 0) {
          sound.play('error');
          return false;
        }

        const snapshot = undoHistory.pop();
        if (!snapshot) return false;

        set({
          board: snapshot.board,
          currentPieces: snapshot.pieces,
          score: snapshot.score,
          combo: snapshot.combo,
          movesMade: snapshot.movesMade,
          linesCleared: snapshot.linesCleared,
          explodingCells: snapshot.explodingCells,
          selectedPiece: null,
          ghostPosition: null,
        });

        sound.play('powerup');
        haptic.trigger('medium');
        return true;
      },

      useBombPowerUp: () => {
        const state = get();
        const target = findBestLineTarget(state.board);
        if (!target) {
          sound.play('error');
          return;
        }

        const { newBoard, clearedPositions } = applyBomb(state.board, target.row, target.col);

        if (clearedPositions.length === 0) {
          sound.play('error');
          return;
        }

        const bonusScore = clearedPositions.length * 10;
        set({
          board: newBoard,
          score: state.score + bonusScore,
          explodingCells: clearedPositions,
          floatingTexts: [...state.floatingTexts, {
            id: `bomb_${++floatingKeySeq}`,
            text: `💣 +${bonusScore}`,
            x: 50, y: 30,
            color: '#EF4444',
            createdAt: Date.now(),
          }],
        });

        sound.play('clear');
        haptic.trigger('heavy');
        setTimeout(() => get().clearExplodingCells(), 700);
      },

      useLightningPowerUp: () => {
        const state = get();
        const target = findBestLineTarget(state.board);
        if (!target) {
          sound.play('error');
          return;
        }

        const { newBoard, clearedPositions, clearedType } = applyLightning(state.board, target.row, target.col);

        if (clearedPositions.length === 0) {
          sound.play('error');
          return;
        }

        const bonusScore = clearedPositions.length * 15;
        const emoji = clearedType === 'row' ? '⚡ROW' : '⚡COL';
        set({
          board: newBoard,
          score: state.score + bonusScore,
          explodingCells: clearedPositions,
          floatingTexts: [...state.floatingTexts, {
            id: `lightning_${++floatingKeySeq}`,
            text: `${emoji} +${bonusScore}`,
            x: 50, y: 30,
            color: '#06B6D4',
            createdAt: Date.now(),
          }],
        });

        sound.play('clear');
        haptic.trigger('heavy');
        setTimeout(() => get().clearExplodingCells(), 700);
      },

      useColorBombPowerUp: () => {
        const state = get();
        const color = findDominantColor(state.board);
        if (!color) {
          sound.play('error');
          return;
        }

        const { newBoard, clearedPositions } = applyColorBomb(state.board, color);

        if (clearedPositions.length === 0) {
          sound.play('error');
          return;
        }

        const bonusScore = clearedPositions.length * 12;
        set({
          board: newBoard,
          score: state.score + bonusScore,
          explodingCells: clearedPositions,
          floatingTexts: [...state.floatingTexts, {
            id: `colorbomb_${++floatingKeySeq}`,
            text: `🌈 COLOR BOMB! +${bonusScore}`,
            x: 50, y: 30,
            color: '#EC4899',
            createdAt: Date.now(),
          }],
        });

        sound.play('clear');
        haptic.trigger('heavy');
        setTimeout(() => get().clearExplodingCells(), 700);
      },

      useRowClearPowerUp: () => {
        const state = get();
        // Find the row with the most filled cells
        let maxRow = 0;
        let maxCount = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
          let count = 0;
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (state.board[r][c] !== null) count++;
          }
          if (count > maxCount) { maxCount = count; maxRow = r; }
        }

        if (maxCount === 0) { sound.play('error'); return; }

        const { newBoard, clearedPositions } = applyRowClear(state.board, maxRow);
        const bonusScore = clearedPositions.length * 10;

        set({
          board: newBoard,
          score: state.score + bonusScore,
          explodingCells: clearedPositions,
          floatingTexts: [...state.floatingTexts, {
            id: `rowclear_${++floatingKeySeq}`,
            text: `📊 ROW CLEAR! +${bonusScore}`,
            x: 50, y: 30,
            color: '#10B981',
            createdAt: Date.now(),
          }],
        });

        sound.play('clear');
        haptic.trigger('heavy');
        setTimeout(() => get().clearExplodingCells(), 700);
      },

      useColClearPowerUp: () => {
        const state = get();
        // Find the column with the most filled cells
        let maxCol = 0;
        let maxCount = 0;
        for (let c = 0; c < BOARD_SIZE; c++) {
          let count = 0;
          for (let r = 0; r < BOARD_SIZE; r++) {
            if (state.board[r][c] !== null) count++;
          }
          if (count > maxCount) { maxCount = count; maxCol = c; }
        }

        if (maxCount === 0) { sound.play('error'); return; }

        const { newBoard, clearedPositions } = applyColClear(state.board, maxCol);
        const bonusScore = clearedPositions.length * 10;

        set({
          board: newBoard,
          score: state.score + bonusScore,
          explodingCells: clearedPositions,
          floatingTexts: [...state.floatingTexts, {
            id: `colclear_${++floatingKeySeq}`,
            text: `📊 COL CLEAR! +${bonusScore}`,
            x: 50, y: 30,
            color: '#10B981',
            createdAt: Date.now(),
          }],
        });

        sound.play('clear');
        haptic.trigger('heavy');
        setTimeout(() => get().clearExplodingCells(), 700);
      },

      tickTimer: () => {
        const state = get();
        if (state.phase === 'playing' && state.timeRemaining > 0) {
          set({ timeRemaining: state.timeRemaining - 1 });
        }
      },

      startTutorial: () => {
        set({ showTutorial: true, tutorialStep: 0, phase: 'playing' });
        // Create empty board for tutorial
        const shapes = generateThreePieces();
        const pieces: Piece[] = shapes.map((shape, i) => ({
          id: `tutorial_piece_${i}`,
          shape: shape.shape,
          color: getRandomColor(),
          name: shape.name,
        }));
        set({
          board: createEmptyBoard(),
          currentPieces: pieces,
          score: 0,
          combo: createInitialComboState(),
          movesMade: 0,
          linesCleared: 0,
          explodingCells: [],
        });
      },

      setTutorialStep: (step) => set({ tutorialStep: step }),

      closeTutorial: () => {
        set({
          showTutorial: false,
          tutorialStep: 0,
          userProfile: {
            ...get().userProfile,
            tutorialCompleted: true,
          },
          phase: 'home',
        });
      },

      claimDailyReward: () => {
        const state = get();
        const streakStatus = getStreakStatus(state.userProfile.lastDailyClaim, state.userProfile.dailyStreak);

        if (!streakStatus.canClaim) return;

        import('@/lib/dailyRewards').then(({ getDailyRewardForDay }) => {
          const reward = getDailyRewardForDay(streakStatus.currentDay);
          const newProfile = { ...state.userProfile };

          newProfile.coins += reward.coins;
          newProfile.dailyStreak = streakStatus.streakLost ? 1 : (state.userProfile.dailyStreak + 1);
          newProfile.lastDailyClaim = new Date().toISOString().split('T')[0];

          if (reward.powerUp) {
            const pu = newProfile.powerUps.find((p) => p.type === reward.powerUp!.type);
            if (pu) {
              pu.quantity += reward.powerUp.quantity;
            }
          }

          set({
            userProfile: newProfile,
            showDailyReward: false,
          });

          sound.play('daily_reward');
          haptic.trigger('success');

          // Show floating text for coins
          set((s) => ({
            floatingTexts: [...s.floatingTexts, {
              id: `daily_${Date.now()}`,
              text: `🎁 +${reward.coins} daily reward!`,
              x: 50, y: 50,
              color: '#F59E0B',
              createdAt: Date.now(),
            }],
          }));
        });
      },

      closeDailyReward: () => set({ showDailyReward: false }),

      setShowGameModeSelect: (v) => set({ showGameModeSelect: v }),
      setLeaderboard: (leaderboard) => set({ leaderboard }),

      resetProgress: () => {
        localStorage.removeItem('bbp_leaderboard');
        set({
          leaderboard: [],
          userProfile: { ...DEFAULT_PROFILE },
          highScore: 0,
        });
      },

      clearFloatingTexts: () => set({ floatingTexts: [] }),
      setShowGameOver: (v) => set({ showGameOver: v }),

      dismissAchievement: () => {
        const state = get();
        if (state.pendingAchievements.length > 0) {
          set({
            showAchievementPopup: state.pendingAchievements[0],
            pendingAchievements: state.pendingAchievements.slice(1),
          });
          sound.play('achievement');
        } else {
          set({ showAchievementPopup: null });
        }
      },
    }),
    {
      name: 'block-blast-pro-storage',
      partialize: (state) => ({
        highScore: state.highScore,
        currentTheme: state.currentTheme,
        userProfile: state.userProfile,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
        leaderboard: state.leaderboard,
      }),
    }
  )
);
