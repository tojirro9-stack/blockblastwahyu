import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { getTutorialStep, TUTORIAL_TOTAL_STEPS } from '@/lib/tutorial';
import { X } from 'lucide-react';

export default function TutorialOverlay() {
  const { showTutorial, tutorialStep, setTutorialStep, closeTutorial, currentTheme } = useGameStore();
  const theme = getTheme(currentTheme);

  const step = getTutorialStep(tutorialStep);
  if (!showTutorial || !step) return null;

  const isLast = tutorialStep >= TUTORIAL_TOTAL_STEPS - 1;
  const progress = ((tutorialStep + 1) / TUTORIAL_TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (isLast) {
      closeTutorial();
    } else {
      setTutorialStep(tutorialStep + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[200] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-[85%] max-w-sm rounded-3xl border-2 p-6 relative"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary + '40',
            boxShadow: `0 0 60px ${theme.colors.primary}30`,
          }}
        >
          {/* Close button */}
          <button
            onClick={closeTutorial}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.textSecondary + '20' }}
          >
            <X size={14} style={{ color: theme.colors.textSecondary }} />
          </button>

          {/* Step indicator */}
          <div className="flex gap-1.5 mb-4 justify-center">
            {Array.from({ length: TUTORIAL_TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === tutorialStep ? '24px' : '8px',
                  backgroundColor: i <= tutorialStep ? theme.colors.primary : theme.colors.textSecondary + '30',
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{step.title}</div>
            <p className="text-sm leading-relaxed" style={{ color: theme.colors.textPrimary }}>
              {step.text}
            </p>
          </div>

          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full mb-4 overflow-hidden"
            style={{ backgroundColor: theme.colors.textSecondary + '20' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                color: '#fff',
              }}
            >
              {isLast ? 'Got it! 🎉' : 'Next →'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
