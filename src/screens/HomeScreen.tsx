import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import {
  Play,
  Trophy,
  ShoppingBag,
  Users,
  Settings,
  Crown,
  Flame,
  Gamepad2,
  HelpCircle,
} from 'lucide-react';

export default function HomeScreen() {
  const {
    startGame,
    startTutorial,
    setShowGameModeSelect,
    goToScreen,
    highScore,
    userProfile,
    currentTheme,
  } = useGameStore();

  const theme = getTheme(currentTheme);

  const menuItems = [
    {
      icon: Trophy,
      label: 'Leaderboard',
      screen: 'leaderboard' as const,
      color: theme.colors.warning,
    },
    {
      icon: ShoppingBag,
      label: 'Shop',
      screen: 'shop' as const,
      color: theme.colors.secondary,
    },
    {
      icon: Users,
      label: 'Friends',
      screen: 'friends' as const,
      color: theme.colors.success,
    },
    {
      icon: Settings,
      label: 'Settings',
      screen: 'settings' as const,
      color: theme.colors.textSecondary,
    },
  ];

  return (
    <div
      className="h-screen w-full flex flex-col items-center relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 8 + 3,
              height: Math.random() * 8 + 3,
              backgroundColor: theme.colors.primary,
              opacity: 0.15,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <Gamepad2 size={20} style={{ color: theme.colors.primary }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
              Welcome back
            </p>
            <p className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
              {userProfile.username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Crown size={14} style={{ color: theme.colors.warning }} />
          <span className="text-sm font-bold" style={{ color: theme.colors.warning }}>
            {userProfile.coins}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 z-10">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex gap-1 justify-center mb-3">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-6 h-6 rounded"
                style={{
                  backgroundColor: theme.colors.blocks[i % theme.colors.blocks.length],
                }}
              />
            ))}
          </div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: theme.colors.textPrimary }}
          >
            BLOCK BLAST
          </h1>
          <h2
            className="text-lg font-bold -mt-1"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PRO
          </h2>
        </motion.div>

        {/* High Score */}
        {highScore > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 px-6 py-3 rounded-2xl border backdrop-blur-sm"
            style={{
              backgroundColor: theme.colors.surface + '80',
              borderColor: theme.colors.warning + '30',
            }}
          >
            <div className="flex items-center gap-2">
              <Flame size={18} style={{ color: theme.colors.warning }} />
              <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                PERSONAL BEST
              </span>
            </div>
            <p
              className="font-mono text-2xl font-black text-center tabular-nums"
              style={{ color: theme.colors.warning }}
            >
              {highScore.toLocaleString()}
            </p>
          </motion.div>
        )}

        {/* PLAY Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${theme.colors.primary}60` }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            delay: 0.3,
          }}
          onClick={startGame}
          className="relative w-48 h-16 rounded-2xl font-black text-xl tracking-wider flex items-center justify-center gap-3 mb-8 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            color: '#fff',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Play size={24} fill="white" />
          </motion.div>
          PLAY
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-3 w-full">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => goToScreen(item.screen)}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl border backdrop-blur-sm"
              style={{
                backgroundColor: theme.colors.surface + '60',
                borderColor: item.color + '20',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: item.color + '15' }}
              >
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: theme.colors.textSecondary }}
              >
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Extra Buttons Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-3 mt-4 mb-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGameModeSelect(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border"
            style={{
              backgroundColor: theme.colors.surface + '60',
              borderColor: theme.colors.primary + '30',
              color: theme.colors.primary,
            }}
          >
            <Play size={12} />
            MODES
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startTutorial}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border"
            style={{
              backgroundColor: theme.colors.surface + '60',
              borderColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary,
            }}
          >
            <HelpCircle size={12} />
            {userProfile.tutorialCompleted ? 'TUTORIAL' : 'HOW TO PLAY'}
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-6 mt-3"
        >
          <div className="text-center">
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
              Games
            </p>
            <p className="font-bold font-mono" style={{ color: theme.colors.textPrimary }}>
              {userProfile.totalGames}
            </p>
          </div>
          <div
            className="w-px h-8"
            style={{ backgroundColor: theme.colors.textSecondary + '30' }}
          />
          <div className="text-center">
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
              Highest Combo
            </p>
            <p className="font-bold font-mono" style={{ color: theme.colors.textPrimary }}>
              {userProfile.highestCombo}x
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
