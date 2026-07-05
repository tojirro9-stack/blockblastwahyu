// ==================== POWER-UP IMPLEMENTATIONS ====================
import type { Board, Position } from '@/types/game';
import { BOARD_SIZE } from '@/lib/game-engine/board';

/**
 * BOMB: Clears a 3x3 area around the target position.
 * Returns the cleared positions and the resulting board.
 */
export function applyBomb(board: Board, targetRow: number, targetCol: number): {
  newBoard: Board;
  clearedPositions: Position[];
} {
  const newBoard = board.map((r) => [...r]);
  const clearedPositions: Position[] = [];
  const radius = 1; // 3x3 area

  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const r = targetRow + dr;
      const c = targetCol + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (newBoard[r][c] !== null) {
          clearedPositions.push({ row: r, col: c });
          newBoard[r][c] = null;
        }
      }
    }
  }

  return { newBoard, clearedPositions };
}

/**
 * LIGHTNING: Clears an entire row OR column at the given position.
 * Returns the cleared positions and the resulting board.
 */
export function applyLightning(board: Board, row: number, col: number): {
  newBoard: Board;
  clearedPositions: Position[];
  clearedType: 'row' | 'col';
} {
  const newBoard = board.map((r) => [...r]);
  const clearedPositions: Position[] = [];

  // Choose row or column based on whichever has more filled cells
  let rowCount = 0;
  let colCount = 0;
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (newBoard[row][i] !== null) rowCount++;
    if (newBoard[i][col] !== null) colCount++;
  }

  if (rowCount >= colCount) {
    // Clear the row
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[row][c] !== null) {
        clearedPositions.push({ row, col: c });
        newBoard[row][c] = null;
      }
    }
    return { newBoard, clearedPositions, clearedType: 'row' };
  } else {
    // Clear the column
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newBoard[r][col] !== null) {
        clearedPositions.push({ row: r, col });
        newBoard[r][col] = null;
      }
    }
    return { newBoard, clearedPositions, clearedType: 'col' };
  }
}

/**
 * STAR_BOOST: Doubles the score multiplier for the next 3 placements.
 * Handled via a temporary state in gameStore.
 */

/**
 * COLOR_BOMB: Removes all blocks of a specific color from the board.
 */
export function applyColorBomb(board: Board, targetColor: string): {
  newBoard: Board;
  clearedPositions: Position[];
} {
  const newBoard = board.map((r) => [...r]);
  const clearedPositions: Position[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] === targetColor) {
        clearedPositions.push({ row: r, col: c });
        newBoard[r][c] = null;
      }
    }
  }

  return { newBoard, clearedPositions };
}

/**
 * ROW_CLEAR: Clears a single specified row.
 */
export function applyRowClear(board: Board, row: number): {
  newBoard: Board;
  clearedPositions: Position[];
} {
  const newBoard = board.map((r) => [...r]);
  const clearedPositions: Position[] = [];

  for (let c = 0; c < BOARD_SIZE; c++) {
    if (newBoard[row][c] !== null) {
      clearedPositions.push({ row, col: c });
      newBoard[row][c] = null;
    }
  }

  return { newBoard, clearedPositions };
}

/**
 * COL_CLEAR: Clears a single specified column.
 */
export function applyColClear(board: Board, col: number): {
  newBoard: Board;
  clearedPositions: Position[];
} {
  const newBoard = board.map((r) => [...r]);
  const clearedPositions: Position[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newBoard[r][col] !== null) {
      clearedPositions.push({ row: r, col });
      newBoard[r][col] = null;
    }
  }

  return { newBoard, clearedPositions };
}

/**
 * Find the color with the most cells on the board (for color_bomb auto-targeting).
 */
export function findDominantColor(board: Board): string | null {
  const colorCount: Record<string, number> = {};
  let maxCount = 0;
  let dominant: string | null = null;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c];
      if (cell) {
        colorCount[cell] = (colorCount[cell] || 0) + 1;
        if (colorCount[cell] > maxCount) {
          maxCount = colorCount[cell];
          dominant = cell;
        }
      }
    }
  }

  return dominant;
}

/**
 * Find the row/column with the most filled cells (for lightning auto-targeting).
 */
export function findBestLineTarget(board: Board): { row: number; col: number } | null {
  let maxCount = 0;
  let bestRow = 0;
  let bestCol = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    let count = 0;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) count++;
    }
    if (count > maxCount) {
      maxCount = count;
      bestRow = r;
      bestCol = 0;
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] !== null) count++;
    }
    if (count > maxCount) {
      maxCount = count;
      bestRow = 0;
      bestCol = c;
    }
  }

  if (maxCount === 0) return null;
  return { row: bestRow, col: bestCol };
}
