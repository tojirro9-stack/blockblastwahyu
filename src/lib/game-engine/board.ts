import type { Board, Position, ClearResult } from '@/types/game';

export const BOARD_SIZE = 8;

// ==================== BOARD OPERATIONS ====================

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );
}

// Check if a piece can be placed at the given position
export function canPlacePiece(
  board: Board,
  shape: number[][],
  startRow: number,
  startCol: number
): boolean {
  const rows = shape.length;
  const cols = shape[0]?.length || 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape[r][c] === 1) {
        const targetRow = startRow + r;
        const targetCol = startCol + c;

        // Check bounds
        if (
          targetRow < 0 ||
          targetRow >= BOARD_SIZE ||
          targetCol < 0 ||
          targetCol >= BOARD_SIZE
        ) {
          return false;
        }

        // Check collision
        if (board[targetRow][targetCol] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

// Place a piece on the board
export function placePiece(
  board: Board,
  shape: number[][],
  startRow: number,
  startCol: number,
  color: string
): Board {
  const newBoard = board.map((row) => [...row]);
  const rows = shape.length;
  const cols = shape[0]?.length || 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape[r][c] === 1) {
        newBoard[startRow + r][startCol + c] = color;
      }
    }
  }

  return newBoard;
}

// Check if any piece from the given list can be placed anywhere on the board
export function hasAnyValidPlacement(
  board: Board,
  shapes: number[][][]
): boolean {
  for (const shape of shapes) {
    const rows = shape.length;
    const cols = shape[0]?.length || 0;

    for (let r = 0; r <= BOARD_SIZE - rows; r++) {
      for (let c = 0; c <= BOARD_SIZE - cols; c++) {
        if (canPlacePiece(board, shape, r, c)) {
          return true;
        }
      }
    }
  }

  return false;
}

// Find completed lines (rows that are full)
export function findCompletedLines(board: Board): number[] {
  const lines: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((cell) => cell !== null)) {
      lines.push(r);
    }
  }

  return lines;
}

// Find completed columns
export function findCompletedColumns(board: Board): number[] {
  const columns: number[] = [];

  for (let c = 0; c < BOARD_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      columns.push(c);
    }
  }

  return columns;
}

// Clear lines and columns, return the result
export function clearLinesAndColumns(
  board: Board,
  lines: number[],
  columns: number[]
): { board: Board; clearedPositions: Position[] } {
  const newBoard = board.map((row) => [...row]);
  const clearedPositions: Position[] = [];

  // Clear lines
  for (const line of lines) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[line][c] !== null) {
        clearedPositions.push({ row: line, col: c });
      }
      newBoard[line][c] = null;
    }
  }

  // Clear columns
  for (const col of columns) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newBoard[r][col] !== null) {
        // Avoid duplicates
        const alreadyCleared = clearedPositions.some(
          (p) => p.row === r && p.col === col
        );
        if (!alreadyCleared) {
          clearedPositions.push({ row: r, col: col });
        }
      }
      newBoard[r][col] = null;
    }
  }

  return { board: newBoard, clearedPositions };
}

// Calculate clear result with multiplier
export function calculateClearResult(
  lines: number[],
  columns: number[],
  totalCells: number
): ClearResult {
  const totalClears = lines.length + columns.length;
  let multiplier = 1;

  if (totalClears === 2) multiplier = 1.5;
  else if (totalClears === 3) multiplier = 2;
  else if (totalClears >= 4) multiplier = 3;

  const score = totalCells * 10 * multiplier;

  return {
    lines,
    columns,
    totalCells,
    multiplier,
    score,
  };
}
