import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Piece } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { BOARD_SIZE } from '@/lib/game-engine/board';

const LIFT_OFFSET_Y = 80;

export default function PieceTray() {
  const {
    currentPieces,
    selectedPiece,
    setSelectedPiece,
    setGhostPosition,
    tryPlacePiece,
    currentTheme,
    boardRect,
  } = useGameStore();
  const theme = getTheme(currentTheme);

  const [dragState, setDragState] = useState<{
    pieceIndex: number;
    pointerX: number;
    pointerY: number;
    grabCellRow: number;
    grabCellCol: number;
  } | null>(null);

  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  const computeAnchor = useCallback(
    (pointerX: number, pointerY: number, grabRow: number, grabCol: number) => {
      if (!boardRect) return null;
      const { left, top, cellSize, gap } = boardRect;
      const step = cellSize + gap;

      const col = Math.floor((pointerX - left) / step);
      const row = Math.floor((pointerY - top) / step);

      return { row: row - grabRow, col: col - grabCol };
    },
    [boardRect]
  );

  const updateGhostFromPointer = useCallback(
    (pieceIndex: number, pointerX: number, pointerY: number, grabRow: number, grabCol: number) => {
      const anchor = computeAnchor(pointerX, pointerY, grabRow, grabCol);
      if (!anchor) return;
      const piece = currentPieces[pieceIndex];
      if (!piece) return;
      const rows = piece.shape.length;
      const cols = piece.shape[0]?.length || 0;
      const clampedRow = Math.max(0, Math.min(BOARD_SIZE - rows, anchor.row));
      const clampedCol = Math.max(0, Math.min(BOARD_SIZE - cols, anchor.col));
      setGhostPosition({ row: clampedRow, col: clampedCol });
    },
    [computeAnchor, currentPieces, setGhostPosition]
  );

  const endDrag = useCallback(
    (commit: boolean) => {
      const ds = dragStateRef.current;
      setDragState(null);
      if (!commit || !ds) {
        setGhostPosition(null);
        return;
      }
      const anchor = computeAnchor(ds.pointerX, ds.pointerY, ds.grabCellRow, ds.grabCellCol);
      if (anchor) {
        const piece = currentPieces[ds.pieceIndex];
        if (piece) {
          const rows = piece.shape.length;
          const cols = piece.shape[0]?.length || 0;
          const clampedRow = Math.max(0, Math.min(BOARD_SIZE - rows, anchor.row));
          const clampedCol = Math.max(0, Math.min(BOARD_SIZE - cols, anchor.col));
          const placed = tryPlacePiece(ds.pieceIndex, clampedRow, clampedCol);
          setGhostPosition(null);
          if (placed) setSelectedPiece(null);
          return;
        }
      }
      setGhostPosition(null);
    },
    [computeAnchor, tryPlacePiece, setGhostPosition, setSelectedPiece]
  );

  useEffect(() => {
    if (!dragState) return;

    const handleMove = (clientX: number, clientY: number) => {
      setDragState((prev) =>
        prev ? { ...prev, pointerX: clientX, pointerY: clientY } : prev
      );
      updateGhostFromPointer(
        dragStateRef.current!.pieceIndex,
        clientX,
        clientY,
        dragStateRef.current!.grabCellRow,
        dragStateRef.current!.grabCellCol
      );
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onMouseUp = () => endDrag(true);
    const onTouchEnd = () => endDrag(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragState !== null]);

  const startDrag = (
    pieceIndex: number,
    clientX: number,
    clientY: number,
    grabRow: number,
    grabCol: number
  ) => {
    const piece = currentPieces[pieceIndex];
    if (!piece) return;
    setSelectedPiece(pieceIndex);
    setDragState({
      pieceIndex,
      pointerX: clientX,
      pointerY: clientY,
      grabCellRow: grabRow,
      grabCellCol: grabCol,
    });
    updateGhostFromPointer(pieceIndex, clientX, clientY, grabRow, grabCol);
  };

  const draggedPiece = dragState ? currentPieces[dragState.pieceIndex] : null;

  return (
    <div id="piece-tray" className="flex justify-center items-end gap-3 md:gap-6 p-3 md:p-4 relative">
      {currentPieces.map((piece, index) => (
        <PieceSlot
          key={`${index}_${piece?.id || 'empty'}`}
          piece={piece}
          isSelected={selectedPiece === index}
          isDragging={dragState?.pieceIndex === index}
          theme={theme}
          onStartDrag={(clientX, clientY, grabRow, grabCol) =>
            startDrag(index, clientX, clientY, grabRow, grabCol)
          }
        />
      ))}

      <AnimatePresence>
        {dragState && draggedPiece && (
          <FloatingPiece
            piece={draggedPiece}
            x={dragState.pointerX}
            y={dragState.pointerY - LIFT_OFFSET_Y}
            grabRow={dragState.grabCellRow}
            grabCol={dragState.grabCellCol}
            cellSize={boardRect?.cellSize ?? 32}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PieceSlot({
  piece,
  isSelected,
  isDragging,
  theme,
  onStartDrag,
}: {
  piece: Piece | null;
  isSelected: boolean;
  isDragging: boolean;
  theme: { colors: { surface: string; primary: string; textSecondary: string; textPrimary: string; bg: string } };
  onStartDrag: (clientX: number, clientY: number, grabRow: number, grabCol: number) => void;
}) {
  if (!piece) {
    return (
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed flex items-center justify-center opacity-25"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.textSecondary,
        }}
      >
        <span className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
          kosong
        </span>
      </div>
    );
  }

  const rows = piece.shape.length;
  const cols = piece.shape[0]?.length || 0;
  const cellSize = Math.min(18, 66 / Math.max(rows, cols));

  const firstFilled = (() => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.shape[r][c] === 1) return { r, c };
      }
    }
    return { r: 0, c: 0 };
  })();

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? (e.touches[0] as Touch).clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? (e.touches[0] as Touch).clientY : (e as React.MouseEvent).clientY;
    onStartDrag(clientX, clientY, firstFilled.r, firstFilled.c);
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.06, y: -4 }}
      animate={
        isDragging
          ? { opacity: 0.2, scale: 0.88 }
          : isSelected
          ? { y: -8, boxShadow: `0 0 24px ${theme.colors.primary}70` }
          : { y: 0, opacity: 1, scale: 1 }
      }
      transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.8 }}
      className="relative rounded-xl border-2 p-2 md:p-3 cursor-grab active:cursor-grabbing select-none touch-none"
      style={{
        backgroundColor: isSelected ? theme.colors.surface + 'DD' : theme.colors.surface + '90',
        borderColor: isSelected ? theme.colors.primary : theme.colors.textSecondary + '25',
        backdropFilter: 'blur(8px)',
        width: '80px',
        height: '80px',
        minWidth: '80px',
        minHeight: '80px',
        boxShadow: isSelected ? `0 0 20px ${theme.colors.primary}50` : 'none',
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <div
        className="grid gap-px mx-auto absolute inset-0 m-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          width: 'fit-content',
          height: 'fit-content',
        }}
      >
        {piece.shape.flat().map((cell, i) => (
          <motion.div
            key={i}
            animate={cell === 1 ? { scale: [1, 0.95, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-sm"
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor: cell === 1 ? piece.color : 'transparent',
              boxShadow:
                cell === 1
                  ? `inset 0 0 6px ${piece.color}80, 0 0 8px ${piece.color}40`
                  : 'none',
              border: cell === 1 ? `1px solid ${piece.color}90` : '1px solid transparent',
              borderRadius: cell === 1 ? '3px' : '0',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function FloatingPiece({
  piece,
  x,
  y,
  grabRow,
  grabCol,
  cellSize,
}: {
  piece: Piece;
  x: number;
  y: number;
  grabRow: number;
  grabCol: number;
  cellSize: number;
}) {
  const rows = piece.shape.length;
  const cols = piece.shape[0]?.length || 0;
  const size = Math.max(30, Math.min(cellSize + 8, 50));

  const offsetX = grabCol * (size + 2) + size / 2;
  const offsetY = grabRow * (size + 2) + size / 2;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0.8, rotate: -2 }}
      animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.7, opacity: 0, rotate: 4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18, mass: 0.7 }}
      className="fixed pointer-events-none z-[100]"
      style={{
        left: x - offsetX,
        top: y - offsetY,
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
      }}
    >
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${size}px)`,
          gridTemplateRows: `repeat(${rows}, ${size}px)`,
        }}
      >
        {piece.shape.flat().map((cell, i) => (
          <motion.div
            key={i}
            animate={
              cell === 1
                ? {
                    boxShadow: [
                      `inset 0 0 8px ${piece.color}90, 0 0 14px ${piece.color}`,
                      `inset 0 0 12px ${piece.color}B0, 0 0 22px ${piece.color}`,
                      `inset 0 0 8px ${piece.color}90, 0 0 14px ${piece.color}`,
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-md"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: cell === 1 ? piece.color : 'transparent',
              boxShadow:
                cell === 1
                  ? `inset 0 0 8px ${piece.color}90, 0 0 14px ${piece.color}`
                  : 'none',
              border: cell === 1 ? `1px solid ${piece.color}` : '1px solid transparent',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
