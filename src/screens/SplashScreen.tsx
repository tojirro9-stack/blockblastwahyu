import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const { initGame, currentTheme } = useGameStore();
  const theme = getTheme(currentTheme);

  useEffect(() => {
    const timer = setTimeout(() => {
      initGame();
    }, 2500);
    return () => clearTimeout(timer);
  }, [initGame]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              backgroundColor: theme.colors.primary,
              opacity: 0.3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Animated blocks */}
        <div className="flex gap-1 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ y: -50, opacity: 0, rotate: -10 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: 0.2 + i * 0.1,
              }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg"
              style={{
                backgroundColor: theme.colors.blocks[i % theme.colors.blocks.length],
                boxShadow: `0 0 20px ${theme.colors.blocks[i % theme.colors.blocks.length]}60`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-4xl md:text-6xl font-black tracking-tight"
          style={{
            color: theme.colors.textPrimary,
            textShadow: `0 0 40px ${theme.colors.primary}40`,
          }}
        >
          BLOCK
        </motion.h1>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-4xl md:text-6xl font-black tracking-tight -mt-2"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          BLAST PRO
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-2 mt-4"
        >
          <Sparkles size={16} style={{ color: theme.colors.secondary }} />
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{ color: theme.colors.textSecondary }}
          >
            Premium Puzzle Experience
          </span>
          <Sparkles size={16} style={{ color: theme.colors.secondary }} />
        </motion.div>
      </motion.div>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-20 w-48 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.colors.surface }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          }}
        />
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-12 text-xs font-medium"
        style={{ color: theme.colors.textSecondary }}
      >
        Loading...
      </motion.span>
    </motion.div>
  );
}
