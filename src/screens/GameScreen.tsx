import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import GameBoard from '@/components/game/GameBoard';
import PieceTray from '@/components/game/PieceTray';
import ScoreDisplay from '@/components/game/ScoreDisplay';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import DailyRewardPopup from '@/components/game/DailyRewardPopup';
import GameModeSelect from '@/components/game/GameModeSelect';
import AchievementPopup from '@/components/game/AchievementPopup';
import {
  Pause, RotateCcw, Zap, Shuffle, Bomb, Home,
} from 'lucide-react';

export default function GameScreen() {
  const {
    phase,
    pauseGame,
    resumeGame,
    goHome,
    startGame,
    currentTheme,
    userProfile,
    usePowerUp,
    showTutorial,
    showDailyReward,
    showGameModeSelect,
    showAchievementPopup,
    gameMode,
    timeRemaining,
    moveCounter,
    dismissAchievement,
  } = useGameStore();

  const theme = getTheme(currentTheme);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'playing') {
        pauseGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, pauseGame]);

  return (
    <div
      className="h-screen w-full flex flex-col items-center relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute -top-32 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.colors.primary }}
      />
      <div
        className="absolute -bottom-32 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.colors.secondary }}
      />

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${theme.colors.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.primary} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Timer/Mode indicator for non-classic modes */}
      {(gameMode !== 'classic' || timeRemaining > 0) && (
        <div className="w-full px-4 pt-2 z-10">
          <div className="flex items-center justify-center gap-4">
            {gameMode !== 'classic' && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: theme.colors.primary + '20',
                  color: theme.colors.primary,
                }}
              >
                {gameMode.replace('_', ' ')}
              </span>
            )}
            {timeRemaining > 0 && (
              <span
                className={`font-mono text-sm font-bold ${
                  timeRemaining <= 10 ? 'animate-pulse' : ''
                }`}
                style={{ color: timeRemaining <= 10 ? theme.colors.danger : theme.colors.textSecondary }}
              >
                ⏱ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            )}
            {moveCounter > 0 && (
              <span
                className={`font-mono text-sm font-bold ${
                  moveCounter <= 5 ? 'animate-pulse' : ''
                }`}
                style={{ color: moveCounter <= 5 ? theme.colors.danger : theme.colors.textSecondary }}
              >
                🎯 {moveCounter} moves left
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={pauseGame}
          className="w-10 h-10 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: theme.colors.surface + '80',
            borderColor: theme.colors.textSecondary + '20',
          }}
        >
          <Pause size={18} style={{ color: theme.colors.textPrimary }} />
        </motion.button>

        <div className="flex-1 mx-4">
          <ScoreDisplay />
        </div>

        <div className="flex items-center gap-2">
          {/* Power-ups */}
          {userProfile.powerUps
            .filter((pu) => pu.quantity > 0)
            .slice(0, 2)
            .map((pu) => (
              <motion.button
                key={pu.type}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => usePowerUp(pu.type)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: theme.colors.surface + '80',
                  borderColor: theme.colors.warning + '30',
                }}
                title={pu.type}
              >
                {pu.type === 'shuffle' && <Shuffle size={16} style={{ color: theme.colors.warning }} />}
                {pu.type === 'bomb' && <Bomb size={16} style={{ color: theme.colors.danger }} />}
                {pu.type === 'lightning' && <Zap size={16} style={{ color: theme.colors.secondary }} />}
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#fff',
                  }}
                >
                  {pu.quantity}
                </span>
              </motion.button>
            ))}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center px-4 z-10 w-full max-w-md">
        <GameBoard />
      </div>

      {/* Piece Tray */}
      <div className="w-full pb-6 z-10">
        <PieceTray />
      </div>

      {/* Overlays */}
      {(showTutorial || showDailyReward || showGameModeSelect) && (
        <div className="absolute inset-0 z-[300]">
          {showTutorial && <TutorialOverlay />}
          {showDailyReward && <DailyRewardPopup />}
          {showGameModeSelect && <GameModeSelect />}
        </div>
      )}

      {showAchievementPopup && (
        <AchievementPopup
          achievement={showAchievementPopup}
          onDismiss={dismissAchievement}
        />
      )}

      {/* Pause Overlay */}
      <AnimatePresence>
        {phase === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: theme.colors.bg + 'CC', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-72 rounded-3xl border p-6 flex flex-col items-center gap-4"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary + '30',
              }}
            >
              <h2
                className="text-2xl font-black"
                style={{ color: theme.colors.textPrimary }}
              >
                PAUSED
              </h2>

              <div className="w-full flex flex-col gap-2">
                <MenuButton
                  icon={<Zap size={18} />}
                  label="Resume"
                  primary
                  onClick={resumeGame}
                  theme={theme}
                />
                <MenuButton
                  icon={<RotateCcw size={18} />}
                  label="Restart"
                  onClick={() => {
                    resumeGame();
                    setTimeout(() => startGame(), 100);
                  }}
                  theme={theme}
                />
                <MenuButton
                  icon={<Home size={18} />}
                  label="Home"
                  onClick={goHome}
                  theme={theme}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  primary,
  onClick,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick: () => void;
  theme: { colors: { primary: string; surface: string; textPrimary: string; textSecondary: string } };
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors"
      style={{
        backgroundColor: primary ? theme.colors.primary : theme.colors.surface + '60',
        borderColor: primary ? 'transparent' : theme.colors.textSecondary + '20',
        color: primary ? '#fff' : theme.colors.textPrimary,
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}
