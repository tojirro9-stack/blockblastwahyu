import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { networkSync } from '@/lib/networkSync';
import confetti from 'canvas-confetti';
import {
  Play,
  Home,
  Share2,
  Trophy,
  Flame,
  Star,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function GameOverScreen() {
  const {
    score,
    highScore,
    combo,
    movesMade,
    linesCleared,
    startGame,
    goHome,
    currentTheme,
    userProfile,
  } = useGameStore();

  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>(
    networkSync.connected ? 'connected' : 'disconnected'
  );
  const [onlineCount, setOnlineCount] = useState(0);

  const theme = getTheme(currentTheme);
  const isNewBest = score >= highScore && score > 0;
  const comboInfo =
    combo.count >= 6
      ? 'GOD MODE!'
      : combo.count >= 5
      ? 'FEVER!'
      : combo.count >= 4
      ? 'QUAD!'
      : combo.count >= 3
      ? 'TRIPLE!'
      : combo.count >= 2
      ? 'DOUBLE!'
      : null;

  useEffect(() => {
    if (isNewBest) {
      confetti({
        particleCount: 120,
        spread: 70,
        startVelocity: 40,
        origin: { y: 0.4 },
        colors: [theme.colors.warning, theme.colors.primary, theme.colors.secondary, theme.colors.danger],
      });
    }
  }, [isNewBest, theme.colors]);

  useEffect(() => {
    const cleanup = networkSync.on({
      onStatus: (connected) => {
        setSyncStatus(connected ? 'connected' : 'disconnected');
      },
      onPlayers: (players) => {
        setOnlineCount(players.length);
      },
      onNewScore: () => {
        setSyncStatus('syncing');
        window.setTimeout(() => {
          setSyncStatus(networkSync.connected ? 'connected' : 'disconnected');
        }, 1500);
      },
    });
    return cleanup;
  }, []);

  // Stats to display
  const stats = [
    { label: 'Best', value: highScore.toLocaleString(), icon: Trophy, color: theme.colors.warning },
    { label: 'Moves', value: movesMade.toString(), icon: null, color: theme.colors.textPrimary },
    { label: 'Lines', value: linesCleared.toString(), icon: null, color: theme.colors.textPrimary },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Background celebration particles for new best */}
      <div className="absolute inset-0 pointer-events-none">
        {isNewBest &&
          Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 6 + 3,
                height: Math.random() * 6 + 3,
                backgroundColor: [theme.colors.warning, theme.colors.primary, theme.colors.secondary, theme.colors.danger][i % 4],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -120, -250],
                x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100],
                opacity: [0.7, 0.4, 0],
                scale: [1, 0.8, 0.2],
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2.5,
              }}
            />
          ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-md z-10">
        {/* Title */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          className="text-center mb-6"
        >
          {isNewBest ? (
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Star size={36} className="mx-auto mb-2" style={{ color: theme.colors.warning }} />
              </motion.div>
              <h1
                className="text-3xl md:text-4xl font-black"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.warning}, ${theme.colors.danger})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NEW BEST!
              </h1>
            </motion.div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: theme.colors.danger }}>
              GAME OVER
            </h1>
          )}
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="rounded-3xl border p-6 mb-4 backdrop-blur-sm"
          style={{
            backgroundColor: theme.colors.surface + '80',
            borderColor: isNewBest ? theme.colors.warning + '40' : theme.colors.primary + '20',
          }}
        >
          {/* Score */}
          <div className="text-center mb-4">
            <p className="text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
              FINAL SCORE
            </p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3, mass: 1 }}
              className="font-mono text-5xl font-black tabular-nums"
              style={{
                color: isNewBest ? theme.colors.warning : theme.colors.textPrimary,
                textShadow: isNewBest ? `0 0 40px ${theme.colors.warning}50` : 'none',
              }}
            >
              {score.toLocaleString()}
            </motion.p>
          </div>

          {/* Combo info */}
          {comboInfo && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              className="flex items-center justify-center gap-2 mb-4 py-2 rounded-xl"
              style={{ backgroundColor: theme.colors.warning + '15' }}
            >
              <Flame size={18} style={{ color: theme.colors.warning }} />
              <span className="text-sm font-bold" style={{ color: theme.colors.warning }}>
                Best Combo: {comboInfo} (x{combo.count})
              </span>
            </motion.div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {stat.icon && <stat.icon size={14} className="mx-auto mb-1" style={{ color: stat.color }} />}
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {stat.label}
                </p>
                <p className="font-mono font-bold text-lg" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sync status row */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mb-4"
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{
              backgroundColor:
                syncStatus === 'connected'
                  ? theme.colors.success + '15'
                  : syncStatus === 'syncing'
                  ? theme.colors.primary + '15'
                  : theme.colors.textSecondary + '12',
              color:
                syncStatus === 'connected'
                  ? theme.colors.success
                  : syncStatus === 'syncing'
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            }}
          >
            {syncStatus === 'connected' ? (
              <Wifi size={16} />
            ) : syncStatus === 'syncing' ? (
              <Wifi size={16} />
            ) : (
              <WifiOff size={16} />
            )}
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
                Sync Status
              </p>
              <p className="text-sm font-bold" style={{ lineHeight: 1 }}>
                {syncStatus === 'connected'
                  ? `Connected · ${onlineCount} online`
                  : syncStatus === 'syncing'
                  ? `Syncing... · ${onlineCount} online`
                  : 'Disconnected'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Extra stats row */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex gap-3 justify-center mb-6"
        >
          <div className="text-center px-5 py-2.5 rounded-xl backdrop-blur-sm" 
            style={{ backgroundColor: theme.colors.surface + '60' }}>
            <Trophy size={16} className="mx-auto mb-1" style={{ color: theme.colors.warning }} />
            <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>Rank</p>
            <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
              #{userProfile.rank || '-'}
            </p>
          </div>
          <div className="text-center px-5 py-2.5 rounded-xl backdrop-blur-sm" 
            style={{ backgroundColor: theme.colors.surface + '60' }}>
            <Flame size={16} className="mx-auto mb-1" style={{ color: theme.colors.danger }} />
            <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>Combo</p>
            <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
              {combo.count}x
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={startGame}
            className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: '#fff',
              boxShadow: `0 4px 24px ${theme.colors.primary}40`,
            }}
          >
            <Play size={20} fill="white" />
            PLAY AGAIN
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={goHome}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border backdrop-blur-sm"
              style={{
                backgroundColor: theme.colors.surface + '60',
                borderColor: theme.colors.textSecondary + '20',
                color: theme.colors.textPrimary,
              }}
            >
              <Home size={16} />
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const text = `I scored ${score.toLocaleString()} in Block Blast Pro! Can you beat me? 🎮`;
                if (navigator.share) {
                  navigator.share({ title: 'Block Blast Pro', text });
                } else {
                  navigator.clipboard.writeText(text);
                }
              }}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border backdrop-blur-sm"
              style={{
                backgroundColor: theme.colors.surface + '60',
                borderColor: theme.colors.textSecondary + '20',
                color: theme.colors.textPrimary,
              }}
            >
              <Share2 size={16} />
              Share
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
