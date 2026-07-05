import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { Flame, Trophy } from 'lucide-react';

export default function ScoreDisplay() {
  const { score, highScore, combo, currentTheme, movesMade } = useGameStore();
  const theme = getTheme(currentTheme);
  const [displayScore, setDisplayScore] = useState(score);

  // Animate score counting
  useEffect(() => {
    if (score !== displayScore) {
      const diff = score - displayScore;
      const step = Math.max(1, Math.floor(Math.abs(diff) / 10));
      const timer = setInterval(() => {
        setDisplayScore((prev) => {
          if (prev < score) return Math.min(prev + step, score);
          if (prev > score) return Math.max(prev - step, score);
          return score;
        });
      }, 16);
      return () => clearInterval(timer);
    }
  }, [score, displayScore]);

  const comboInfo =
    combo.count >= 6
      ? { label: 'GOD', color: '#FFD700', bg: 'from-yellow-600/20 to-orange-600/20' }
      : combo.count >= 5
      ? { label: 'FEVER', color: '#FF6B35', bg: 'from-orange-600/20 to-red-600/20' }
      : combo.count >= 4
      ? { label: 'QUAD', color: '#EF4444', bg: 'from-red-600/20 to-pink-600/20' }
      : combo.count >= 3
      ? { label: 'TRIPLE', color: '#F59E0B', bg: 'from-amber-600/20 to-yellow-600/20' }
      : combo.count >= 2
      ? { label: 'DOUBLE', color: '#EAB308', bg: 'from-yellow-600/20 to-amber-600/20' }
      : null;

  return (
    <div className="flex items-center justify-between w-full px-2 py-2">
      {/* Score */}
      <div
        className="flex flex-col px-3 py-1.5 rounded-xl border"
        style={{
          backgroundColor: theme.colors.surface + '90',
          borderColor: theme.colors.primary + '25',
        }}
      >
        <div className="flex items-center gap-1.5">
          <Trophy size={14} style={{ color: theme.colors.warning }} />
          <span className="text-[10px] font-bold tracking-wider" style={{ color: theme.colors.textSecondary }}>
            SCORE
          </span>
        </div>
        <motion.div
          key={score}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.3 }}
          className="font-mono text-xl md:text-2xl font-black tabular-nums leading-tight"
          style={{ color: theme.colors.textPrimary, textShadow: `0 0 12px ${theme.colors.primary}50` }}
        >
          {displayScore.toLocaleString()}
        </motion.div>
        {highScore > 0 && (
          <span className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary + '90' }}>
            Best {highScore.toLocaleString()}
          </span>
        )}
      </div>

      {/* Combo */}
      <AnimatePresence>
        {comboInfo && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex flex-col items-center px-4 py-2 rounded-xl bg-gradient-to-br ${comboInfo.bg} border backdrop-blur-sm`}
            style={{ borderColor: comboInfo.color + '40' }}
          >
            <div className="flex items-center gap-1">
              <Flame size={16} style={{ color: comboInfo.color }} />
              <span
                className="font-black text-sm tracking-wider"
                style={{ color: comboInfo.color }}
              >
                {comboInfo.label}
              </span>
            </div>
            <span className="text-xs font-mono" style={{ color: comboInfo.color + 'CC' }}>
              x{combo.count}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moves */}
      <div
        className="flex flex-col items-end px-3 py-1.5 rounded-xl border"
        style={{
          backgroundColor: theme.colors.surface + '90',
          borderColor: theme.colors.textSecondary + '15',
        }}
      >
        <span className="text-[10px] font-bold tracking-wider" style={{ color: theme.colors.textSecondary }}>
          MOVES
        </span>
        <span className="font-mono text-xl font-black leading-tight" style={{ color: theme.colors.textPrimary }}>
          {movesMade}
        </span>
      </div>
    </div>
  );
}
