import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { getDailyRewardForDay, DAILY_REWARDS } from '@/lib/dailyRewards';
import { Crown, Gift } from 'lucide-react';

export default function DailyRewardPopup() {
  const {
    showDailyReward,
    claimDailyReward,
    closeDailyReward,
    currentTheme,
    userProfile,
  } = useGameStore();
  const theme = getTheme(currentTheme);

  if (!showDailyReward) return null;

  const day = userProfile.dailyStreak % 7 === 0 ? 7 : (userProfile.dailyStreak % 7) || 1;
  const reward = getDailyRewardForDay(day);

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
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          className="w-[85%] max-w-sm rounded-3xl border-2 overflow-hidden"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.warning + '40',
            boxShadow: `0 0 60px ${theme.colors.warning}30`,
          }}
        >
          {/* Header */}
          <div className="py-5 px-6 text-center relative" style={{ backgroundColor: theme.colors.warning + '10' }}>
            <Gift size={32} className="mx-auto mb-2" style={{ color: theme.colors.warning }} />
            <h2 className="text-lg font-black" style={{ color: theme.colors.textPrimary }}>
              Daily Reward
            </h2>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Day {day} of 7
            </p>
          </div>

          {/* Reward display */}
          <div className="p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              className="text-center mb-4"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: theme.colors.warning + '20' }}
              >
                <Crown size={36} style={{ color: theme.colors.warning }} />
              </div>
              <p className="text-3xl font-black" style={{ color: theme.colors.warning }}>
                +{reward.coins}
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: theme.colors.textSecondary }}>
                coins
              </p>
            </motion.div>

            {reward.powerUp && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-5 py-2 px-4 rounded-xl"
                style={{ backgroundColor: theme.colors.primary + '15' }}
              >
                <p className="text-sm font-bold" style={{ color: theme.colors.primary }}>
                  Bonus: {reward.powerUp.quantity}x {reward.powerUp.type.replace('_', ' ').toUpperCase()}
                </p>
              </motion.div>
            )}

            {/* Day indicators */}
            <div className="flex gap-2 justify-center mb-5">
              {DAILY_REWARDS.map((r, i) => {
                const isClaimed = i < day - 1;
                const isCurrent = i === day - 1;
                return (
                  <div
                    key={r.day}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: isCurrent
                        ? theme.colors.warning
                        : isClaimed
                        ? theme.colors.success + '40'
                        : theme.colors.textSecondary + '20',
                      color: isCurrent ? '#fff' : isClaimed ? theme.colors.success : theme.colors.textSecondary,
                      transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    {isClaimed ? '✓' : r.day}
                  </div>
                );
              })}
            </div>

            {/* Claim button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={claimDailyReward}
              className="w-full py-3.5 rounded-xl font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.warning}, ${theme.colors.danger})`,
                color: '#fff',
                boxShadow: `0 4px 20px ${theme.colors.warning}40`,
              }}
            >
              CLAIM REWARD
            </motion.button>

            <button
              onClick={closeDailyReward}
              className="w-full py-2 mt-2 text-xs font-medium text-center"
              style={{ color: theme.colors.textSecondary }}
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
