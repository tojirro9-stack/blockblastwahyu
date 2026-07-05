import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

let comboDisplayId = 0;

export default function ComboDisplay() {
  const comboDisplay = useGameStore((s) => s.comboDisplay);

  if (!comboDisplay) return null;

  comboDisplayId++;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`combo_${comboDisplayId}`}
        initial={{ scale: 3, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.3, opacity: 0, y: -40 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 12,
          mass: 1.2,
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
      >
        <motion.div
          animate={{
            textShadow: [
              '0 0 20px rgba(255,255,255,0.9), 0 0 50px rgba(255,165,0,0.6)',
              '0 0 40px rgba(255,255,255,1), 0 0 80px rgba(255,165,0,0.8)',
              '0 0 20px rgba(255,255,255,0.9), 0 0 50px rgba(255,165,0,0.6)',
            ],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          className={`font-black text-4xl md:text-5xl tracking-wider ${
            comboDisplay.tier === 'godmode'
              ? 'text-yellow-300'
              : comboDisplay.tier === 'fever'
              ? 'text-orange-400'
              : comboDisplay.tier === 'quad'
              ? 'text-red-400'
              : comboDisplay.tier === 'triple'
              ? 'text-amber-400'
              : 'text-yellow-400'
          }`}
          style={{
            WebkitTextStroke: '1px rgba(0,0,0,0.5)',
          }}
        >
          {comboDisplay.text}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
