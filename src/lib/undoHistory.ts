// ==================== UNDO HISTORY SYSTEM ====================
import type { Board, Piece, ComboState, Position } from '@/types/game';

export interface BoardSnapshot {
  board: Board;
  pieces: (Piece | null)[];
  score: number;
  combo: ComboState;
  movesMade: number;
  linesCleared: number;
  explodingCells: Position[];
}

const MAX_HISTORY = 20;

export class UndoHistory {
  private stack: BoardSnapshot[] = [];
  private maxSize: number;

  constructor(maxSize: number = MAX_HISTORY) {
    this.maxSize = maxSize;
  }

  push(snapshot: BoardSnapshot) {
    this.stack.push(JSON.parse(JSON.stringify(snapshot)));
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    }
  }

  pop(): BoardSnapshot | null {
    if (this.stack.length === 0) return null;
    return this.stack.pop()!;
  }

  peek(): BoardSnapshot | null {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1];
  }

  get length(): number {
    return this.stack.length;
  }

  clear() {
    this.stack = [];
  }
}
