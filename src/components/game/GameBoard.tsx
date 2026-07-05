import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { BOARD_SIZE } from '@/lib/game-engine/board';
import ExplosionEffect from './ExplosionEffect';
import ComboDisplay from './ComboDisplay';

// Memoized single cell to avoid re-rendering all 64 cells on every hover/move
const BoardCell = motion.div as React.ComponentType<any>;

const Cell = React.memo(function Cell({
  cell,
  rowIndex,
  colIndex,
  sector,
  isGhost,
  ghostValid,
  isExploding,
  explosionDelay,
  justCleared,
  onCellClick,
  onCellHover,
  theme,
}: {
  cell: string | null;
  rowIndex: number;
  colIndex: number;
  sector: number;
  isGhost: boolean;
  ghostValid: boolean;
  isExploding: boolean;
  explosionDelay: number;
  justCleared: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <BoardCell
      whileTap={{ scale: 0.93 }}
      animate={
        isExploding && justCleared
          ? {
              scale: [1, 1.3, 0],
              opacity: [1, 1, 0],
              rotate: [0, 5, -10],
            }
          : { opacity: 1, scale: 1, rotate: 0 }
      }
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        delay: isExploding ? explosionDelay : 0,
      }}
      onClick={() => onCellClick(rowIndex, colIndex)}
      onMouseEnter={() => onCellHover(rowIndex, colIndex)}
      className="aspect-square rounded-md cursor-pointer relative overflow-hidden"
      style={{
        backgroundColor: cell
          ? cell
          : sector === 0
          ? theme.colors.bg + '90'
          : theme.colors.bg + '60',
        border: `1px solid ${
          cell ? cell + '60' : theme.colors.textSecondary + '10'
        }`,
        boxShadow: cell
          ? `inset 0 0 12px ${cell}40, 0 0 6px ${cell}20`
          : 'none',
        minWidth: '32px',
        minHeight: '32px',
      }}
    >
      {/* Ghost preview - CSS transition instead of framer for perf */}
      <div
        className="absolute inset-0 rounded-md pointer-events-none transition-opacity duration-150"
        style={{
          opacity: isGhost ? 1 : 0,
          backgroundColor: ghostValid
            ? theme.colors.success + '50'
            : theme.colors.danger + '35',
          border: `2px dashed ${
            ghostValid ? theme.colors.success : theme.colors.danger
          }`,
          boxShadow: ghostValid
            ? `0 0 14px ${theme.colors.success}70`
            : `0 0 10px ${theme.colors.danger}60`,
        }}
      />

      {/* Block shine */}
      {cell && (
        <>
          <div
            className="absolute inset-[2px] rounded-sm"
            style={{
              background: `linear-gradient(135deg, ${cell}B0 0%, ${cell}60 100%)`,
            }}
          />
          <div
            className="absolute top-[2px] left-[2px] right-[2px] h-[35%] rounded-sm opacity-30"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)',
            }}
          />
        </>
      )}
    </BoardCell>
  );
});

const FloatingTextItem = motion.div as React.ComponentType<any>;

export default function GameBoard() {
  const {
    board,
    currentPieces,
    selectedPiece,
    ghostPosition,
    explodingCells,
    shaking,
    floatingTexts,
    currentTheme,
    tryPlacePiece,
    setGhostPosition,
    setSelectedPiece,
    clearFloatingTexts,
    setBoardRect,
    clearExplodingCells,
  } = useGameStore();

  const theme = getTheme(currentTheme);
  const boardRef = useRef<HTMLDivElement>(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [justCleared, setJustCleared] = useState(false);

  // Use ResizeObserver instead of polling interval
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const updateRect = () => {
      const rect = el.getBoundingClientRect();
      const gap = 4;
      const padding = 8;
      const cellSize = (rect.width - padding * 2 - gap * (BOARD_SIZE - 1)) / BOARD_SIZE;
      setBoardRect({
        left: rect.left + padding,
        top: rect.top + padding,
        cellSize,
        gap,
      });
    };

    updateRect();

    const ro = new ResizeObserver(updateRect);
    ro.observe(el);

    window.addEventListener('scroll', updateRect, true);

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [setBoardRect]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (selectedPiece === null) return;
      const piece = currentPieces[selectedPiece];
      if (!piece) return;

      const success = tryPlacePiece(selectedPiece, row, col);
      if (success) {
        setSelectedPiece(null);
        setGhostPosition(null);
      }
    },
    [selectedPiece, currentPieces, tryPlacePiece, setSelectedPiece, setGhostPosition]
  );

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (selectedPiece === null) return;
      setGhostPosition({ row, col });
    },
    [selectedPiece, setGhostPosition]
  );

  // Precompute ghost info once, not per cell
  const ghostInfo = useMemo(() => {
    if (selectedPiece === null || ghostPosition === null) {
      return { cells: new Set<string>(), valid: false };
    }
    const piece = currentPieces[selectedPiece];
    if (!piece) return { cells: new Set<string>(), valid: false };

    // Use string keys for fast lookup: "row,col"
    const cells = new Set<string>();
    let valid = true;

    const pieceRows = piece.shape.length;
    const pieceCols = piece.shape[0]?.length || 0;
    const { row, col } = ghostPosition;

    if (row < 0 || col < 0 || row + pieceRows > BOARD_SIZE || col + pieceCols > BOARD_SIZE) {
      valid = false;
    }

    for (let r = 0; r < pieceRows; r++) {
      for (let c = 0; c < pieceCols; c++) {
        if (piece.shape[r][c] === 1) {
          const rr = ghostPosition.row + r;
          const cc = ghostPosition.col + c;
          if (rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE) {
            cells.add(`${rr},${cc}`);
            if (valid && board[rr][cc] !== null) {
              valid = false;
            }
          } else {
            valid = false;
          }
        }
      }
    }

    return { cells, valid };
  }, [selectedPiece, ghostPosition, currentPieces, board]);

  // Precompute exploding cells set for fast lookup
  const explodingSet = useMemo(() => {
    return new Set(explodingCells.map((e) => `${e.row},${e.col}`));
  }, [explodingCells]);

  // Handle explosion effect trigger
  useEffect(() => {
    if (explodingCells.length > 0) {
      setShowExplosion(true);
      setJustCleared(true);

      const timer = setTimeout(() => {
        setShowExplosion(false);
        setJustCleared(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [explodingCells]);

  // Auto-clear floating texts
  useEffect(() => {
    if (floatingTexts.length > 0) {
      const timer = setTimeout(() => {
        clearFloatingTexts();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [floatingTexts, clearFloatingTexts]);

  return (
    <motion.div
      animate={shaking ? { x: [0, -6, 6, -3, 3, 0], y: [0, 3, -3, 2, -2, 0] } : {}}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="relative w-full max-w-[min(90vw,360px)] mx-auto"
    >
      {/* Glow border */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-50 blur-md pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}80, ${theme.colors.secondary}60)`,
        }}
      />

      {/* Board grid */}
      <div
        ref={boardRef}
        id="game-board-grid"
        className="grid gap-1 p-2 rounded-xl border-2 backdrop-blur-sm relative z-10"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary + '40',
          boxShadow: `0 0 40px ${theme.colors.primary}20, inset 0 0 30px ${theme.colors.bg}60`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isGhost = ghostInfo.cells.has(key);
            const isExploding = explodingSet.has(key);
            const sector = (rowIndex + colIndex) % 2;

            const explosionDelay = isExploding
              ? explodingCells.findIndex(
                  (e) => e.row === rowIndex && e.col === colIndex
                ) * 0.015
              : 0;

            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                rowIndex={rowIndex}
                colIndex={colIndex}
                sector={sector}
                isGhost={isGhost}
                ghostValid={ghostInfo.valid}
                isExploding={isExploding}
                explosionDelay={explosionDelay}
                justCleared={justCleared}
                onCellClick={handleCellClick}
                onCellHover={handleCellHover}
                theme={theme}
              />
            );
          })
        )}
      </div>

      {/* Explosion canvas */}
      <AnimatePresence>
        {showExplosion && explodingCells.length > 0 && (
          <ExplosionEffect
            positions={explodingCells}
            onComplete={() => {
              setShowExplosion(false);
              setJustCleared(false);
              clearExplodingCells();
            }}
          />
        )}
      </AnimatePresence>

      <ComboDisplay />

      {/* Floating texts - use CSS animation for perf */}
      <AnimatePresence>
        {floatingTexts.map((ft) => {
          const isCombo = ft.id.startsWith('combo_');
          const isMultiplier = ft.id.startsWith('multi_');
          const fontSize = isCombo ? '24px' : isMultiplier ? '20px' : '16px';
          const dur = isCombo ? 1.8 : isMultiplier ? 1.6 : 1.4;

          return (
            <FloatingTextItem
              key={ft.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, -40, -90],
                scale: [0.5, 1.2, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: dur, ease: 'easeOut', times: [0, 0.15, 0.6, 1] }}
              className="absolute pointer-events-none z-50 font-black"
              style={{
                left: `${ft.x}%`,
                top: `${ft.y}%`,
                transform: `translateX(-50%)`,
                fontSize,
                fontWeight: '800',
                color: ft.color,
                textShadow: `0 0 16px ${ft.color}B0, 0 2px 8px rgba(0,0,0,0.5)`,
                whiteSpace: 'nowrap',
              }}
            >
              {ft.text}
            </FloatingTextItem>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
