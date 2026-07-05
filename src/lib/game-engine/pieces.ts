import type { PieceShape } from '@/types/game';

// ==================== PIECE DEFINITIONS ====================

export const PIECE_SHAPES: PieceShape[] = [
  {
    name: 'single',
    shape: [[1]],
    weight: 15,
  },
  {
    name: 'line_h_2',
    shape: [[1, 1]],
    weight: 12,
  },
  {
    name: 'line_v_2',
    shape: [[1], [1]],
    weight: 12,
  },
  {
    name: 'line_h_3',
    shape: [[1, 1, 1]],
    weight: 10,
  },
  {
    name: 'line_v_3',
    shape: [[1], [1], [1]],
    weight: 10,
  },
  {
    name: 'square_2',
    shape: [
      [1, 1],
      [1, 1],
    ],
    weight: 10,
  },
  {
    name: 'l_shape',
    shape: [
      [1, 0],
      [1, 1],
    ],
    weight: 8,
  },
  {
    name: 'l_shape_mirror',
    shape: [
      [0, 1],
      [1, 1],
    ],
    weight: 8,
  },
  {
    name: 't_shape',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    weight: 7,
  },
  {
    name: 't_shape_rotated',
    shape: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    weight: 7,
  },
  {
    name: 'z_shape',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    weight: 7,
  },
  {
    name: 'z_shape_mirror',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    weight: 7,
  },
  {
    name: 'line_h_4',
    shape: [[1, 1, 1, 1]],
    weight: 6,
  },
  {
    name: 'line_v_4',
    shape: [[1], [1], [1], [1]],
    weight: 6,
  },
  {
    name: 'square_3',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    weight: 3,
  },
  {
    name: 'big_l',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    weight: 6,
  },
  {
    name: 'big_l_mirror',
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    weight: 6,
  },
  {
    name: 'cross',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    weight: 5,
  },
];

// Block colors for pieces
export const BLOCK_COLORS = [
  '#7C3AED', // purple
  '#06B6D4', // cyan
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#EC4899', // pink
  '#8B5CF6', // lavender
];

export function getRandomColor(): string {
  return BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
}

export function getRandomPiece(): PieceShape {
  // Weighted random selection
  const totalWeight = PIECE_SHAPES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const piece of PIECE_SHAPES) {
    random -= piece.weight;
    if (random <= 0) {
      return piece;
    }
  }

  return PIECE_SHAPES[0];
}

// Generate 3 pieces ensuring good variety and playability
export function generateThreePieces(): PieceShape[] {
  const pieces: PieceShape[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 3; i++) {
    let piece = getRandomPiece();

    // Avoid duplicates - if name already used, try up to 5 times
    if (usedNames.has(piece.name)) {
      let attempts = 0;
      while (usedNames.has(piece.name) && attempts < 8) {
        piece = getRandomPiece();
        attempts++;
      }
    }

    usedNames.add(piece.name);

    // Ensure at most 1 big piece (5+ cells) per set
    const bigCount = pieces.filter(
      (p) => p.shape.flat().filter((c) => c === 1).length >= 5
    ).length;
    const cellCount = piece.shape.flat().filter((c) => c === 1).length;

    if (cellCount >= 5 && bigCount >= 1) {
      // Replace with a smaller piece that isn't already used
      const smallPieces = PIECE_SHAPES.filter(
        (p) =>
          p.shape.flat().filter((c) => c === 1).length < 5 &&
          !usedNames.has(p.name)
      );
      if (smallPieces.length > 0) {
        piece = smallPieces[Math.floor(Math.random() * smallPieces.length)];
      } else {
        // Fallback: allow any small piece
        const anySmall = PIECE_SHAPES.filter(
          (p) => p.shape.flat().filter((c) => c === 1).length < 5
        );
        piece = anySmall[Math.floor(Math.random() * anySmall.length)];
      }
      usedNames.add(piece.name);
    }

    pieces.push(piece);
  }

  return pieces;
}

export function pieceSize(shape: number[][]): { rows: number; cols: number } {
  return { rows: shape.length, cols: shape[0]?.length || 0 };
}
