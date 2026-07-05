import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { GAME_MODES } from '@/lib/gameModes';
import { X } from 'lucide-react';

export default function GameModeSelect() {
  const {
    showGameModeSelect,
    setShowGameModeSelect,
    startGameWithMode,
    currentTheme,
  } = useGameStore();
  const theme = getTheme(currentTheme);

  if (!showGameModeSelect) return null;

  const modes = Object.values(GAME_MODES);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[150] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-[88%] max-w-sm rounded-3xl border-2 p-5 relative"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary + '40',
            boxShadow: `0 0 60px ${theme.colors.primary}30`,
          }}
        >
          {/* Close */}
          <button
            onClick={() => setShowGameModeSelect(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.textSecondary + '20' }}
          >
            <X size={14} style={{ color: theme.colors.textSecondary }} />
          </button>

          <h2 className="text-lg font-black text-center mb-4" style={{ color: theme.colors.textPrimary }}>
            Select Mode
          </h2>

          <div className="flex flex-col gap-3">
            {modes.map((mode) => (
              <motion.button
                key={mode.type}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGameWithMode(mode.type)}
                className="w-full p-4 rounded-2xl border text-left flex items-start gap-3"
                style={{
                  backgroundColor: theme.colors.bg + '60',
                  borderColor: theme.colors.textSecondary + '15',
                }}
              >
                <div className="text-2xl flex-shrink-0 mt-0.5">{mode.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                      {mode.label}
                    </span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: theme.colors.primary + '20',
                        color: theme.colors.primary,
                      }}
                    >
                      {mode.difficultyLabel}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                    {mode.description}
                  </p>
                  <div className="flex gap-3 mt-2">
                    {mode.timeLimit > 0 && (
                      <span className="text-[10px] font-medium" style={{ color: theme.colors.secondary }}>
                        ⏱ {Math.floor(mode.timeLimit / 60)}m {mode.timeLimit % 60}s
                      </span>
                    )}
                    {mode.moveLimit > 0 && (
                      <span className="text-[10px] font-medium" style={{ color: theme.colors.warning }}>
                        🎯 {mode.moveLimit} moves
                      </span>
                    )}
                    {mode.scoreMultiplier > 1 && (
                      <span className="text-[10px] font-medium" style={{ color: theme.colors.danger }}>
                        x{mode.scoreMultiplier} score
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
