import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import type { Achievement } from '@/lib/achievements';

interface AchievementPopupProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export default function AchievementPopup({ achievement, onDismiss }: AchievementPopupProps) {
  const { currentTheme } = useGameStore();
  const theme = getTheme(currentTheme);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 right-4 z-[300] max-w-[280px] rounded-2xl border-2 overflow-hidden"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.warning + '40',
            boxShadow: `0 0 40px ${theme.colors.warning}30`,
          }}
        >
          <div className="p-4 flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: theme.colors.warning + '20' }}
            >
              {achievement.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.warning }}>
                Achievement Unlocked!
              </p>
              <p className="text-sm font-bold mt-0.5" style={{ color: theme.colors.textPrimary }}>
                {achievement.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                {achievement.description}
              </p>
              <p className="text-xs font-bold mt-1" style={{ color: theme.colors.warning }}>
                +{achievement.reward.coins} coins
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
