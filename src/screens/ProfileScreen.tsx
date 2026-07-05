import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import {
  ArrowLeft, Trophy, Flame, Gamepad2, Crown,
  Star, TrendingUp,
} from 'lucide-react';

export default function ProfileScreen() {
  const {
    goHome,
    userProfile,
    highScore,
    currentTheme,
    leaderboard,
  } = useGameStore();

  const theme = getTheme(currentTheme);

  // Calculate stats
  const avgScore = userProfile.totalGames > 0
    ? Math.floor(userProfile.totalScore / userProfile.totalGames)
    : 0;

  const stats = [
    { icon: Trophy, label: 'Best Score', value: highScore.toLocaleString(), color: theme.colors.warning },
    { icon: Gamepad2, label: 'Games', value: userProfile.totalGames.toString(), color: theme.colors.primary },
    { icon: Star, label: 'Avg Score', value: avgScore.toLocaleString(), color: theme.colors.secondary },
    { icon: Flame, label: 'Max Combo', value: `${userProfile.highestCombo}x`, color: theme.colors.danger },
  ];

  return (
    <div
      className="h-screen w-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goHome}
          className="w-10 h-10 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.textSecondary + '20',
          }}
        >
          <ArrowLeft size={18} style={{ color: theme.colors.textPrimary }} />
        </motion.button>
        <h1 className="text-xl font-black" style={{ color: theme.colors.textPrimary }}>
          Profile
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Profile card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl border p-6 mb-4 flex flex-col items-center"
          style={{
            backgroundColor: theme.colors.surface + '80',
            borderColor: theme.colors.primary + '20',
          }}
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mb-3"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: '#fff',
            }}
          >
            {userProfile.username.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-xl font-black" style={{ color: theme.colors.textPrimary }}>
            {userProfile.username}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <Crown size={14} style={{ color: theme.colors.warning }} />
            <span className="text-sm font-bold" style={{ color: theme.colors.warning }}>
              {userProfile.coins} coins
            </span>
          </div>

          {/* Premium badge */}
          {userProfile.isPremium && (
            <div
              className="mt-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              style={{
                backgroundColor: theme.colors.warning + '15',
                color: theme.colors.warning,
              }}
            >
              <Star size={12} />
              PREMIUM
            </div>
          )}
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="rounded-2xl border p-4 flex flex-col items-center text-center"
              style={{
                backgroundColor: theme.colors.surface + '60',
                borderColor: stat.color + '15',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <p className="font-mono text-lg font-black" style={{ color: theme.colors.textPrimary }}>
                {stat.value}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent scores */}
        {leaderboard.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} style={{ color: theme.colors.secondary }} />
              <h3 className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                Recent Scores
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="py-2 px-3 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: theme.colors.surface + '40' }}
                >
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    {entry.date}
                  </span>
                  <span className="font-mono font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                    {entry.score.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
