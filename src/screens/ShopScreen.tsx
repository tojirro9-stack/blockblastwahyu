import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme, THEMES } from '@/lib/themes';
import {
  ArrowLeft, Crown, ShoppingBag, Check,
  Palette, Zap,
} from 'lucide-react';
import { toast } from 'sonner';

type ShopTab = 'themes' | 'powerups';

export default function ShopScreen() {
  const {
    goHome,
    userProfile,
    buyItem,
    setTheme,
    currentTheme,
  } = useGameStore();

  const theme = getTheme(currentTheme);
  const [activeTab, setActiveTab] = useState<ShopTab>('themes');

  const handleBuyTheme = (themeId: string, price: number) => {
    if (userProfile.purchasedThemes.includes(themeId)) {
      setTheme(themeId);
      toast.success(`Theme applied!`);
      return;
    }

    if (userProfile.coins < price) {
      toast.error('Not enough coins!');
      return;
    }

    const item = {
      id: themeId,
      name: THEMES[themeId]?.name || themeId,
      type: 'theme' as const,
      priceCoin: price,
      description: '',
      icon: 'palette',
    };

    if (buyItem(item)) {
      toast.success(`Purchased ${item.name}!`);
    }
  };

  const handleBuyPowerUp = (type: string, price: number, qty: number) => {
    if (userProfile.coins < price) {
      toast.error('Not enough coins!');
      return;
    }

    const item = {
      id: `${type}_pack`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Pack`,
      type: 'powerup' as const,
      priceCoin: price,
      description: '',
      quantity: qty,
      icon: 'zap',
    };

    if (buyItem(item)) {
      toast.success(`Purchased ${qty}x ${type}!`);
    }
  };

  const powerUps = [
    { type: 'shuffle', name: 'Shuffle', price: 40, qty: 3, desc: 'Shuffle current pieces' },
    { type: 'bomb', name: 'Bomb Pack', price: 50, qty: 3, desc: 'Clear 3x3 area' },
    { type: 'undo', name: 'Undo Pack', price: 30, qty: 5, desc: 'Undo last move' },
    { type: 'mega', name: 'Mega Bundle', price: 120, qty: 3, desc: 'All power-ups x3' },
  ];
  
  // Additional purchasable power-ups
  const extraPowerUps = [
    { type: 'star_boost', name: 'Star Boost', price: 70, qty: 2, desc: 'Temporary score multiplier' },
    { type: 'color_bomb', name: 'Color Bomb', price: 90, qty: 1, desc: 'Remove all blocks of one color' },
    { type: 'row_clear', name: 'Row Clear', price: 80, qty: 1, desc: 'Clear a single full row' },
    { type: 'col_clear', name: 'Col Clear', price: 80, qty: 1, desc: 'Clear a single full column' },
  ];

  return (
    <div
      className="h-screen w-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-2">
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
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} style={{ color: theme.colors.secondary }} />
          <h1 className="text-xl font-black" style={{ color: theme.colors.textPrimary }}>
            Shop
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Crown size={14} style={{ color: theme.colors.warning }} />
          <span className="text-sm font-bold" style={{ color: theme.colors.warning }}>
            {userProfile.coins}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('themes')}
          className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
          style={{
            backgroundColor: activeTab === 'themes' ? theme.colors.primary + '30' : theme.colors.surface + '40',
            color: activeTab === 'themes' ? theme.colors.primary : theme.colors.textSecondary,
            border: `1px solid ${activeTab === 'themes' ? theme.colors.primary + '40' : 'transparent'}`,
          }}
        >
          <Palette size={12} />
          Themes
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('powerups')}
          className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
          style={{
            backgroundColor: activeTab === 'powerups' ? theme.colors.warning + '30' : theme.colors.surface + '40',
            color: activeTab === 'powerups' ? theme.colors.warning : theme.colors.textSecondary,
            border: `1px solid ${activeTab === 'powerups' ? theme.colors.warning + '40' : 'transparent'}`,
          }}
        >
          <Zap size={12} />
          Power-ups
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === 'themes' ? (
            <motion.div
              key="themes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {Object.values(THEMES).map((t, index) => {
                const owned = userProfile.purchasedThemes.includes(t.id);
                const equipped = currentTheme === t.id;

                return (
                  <motion.div
                    key={t.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleBuyTheme(t.id, t.price)}
                    className="rounded-2xl border overflow-hidden cursor-pointer relative"
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: equipped ? theme.colors.primary : theme.colors.textSecondary + '15',
                    }}
                  >
                    {/* Theme preview */}
                    <div
                      className="h-20 relative flex items-center justify-center"
                      style={{ backgroundColor: t.colors.bg }}
                    >
                      <div className="flex gap-1">
                        {t.colors.blocks.slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded"
                            style={{
                              backgroundColor: c,
                              boxShadow: `0 0 8px ${c}40`,
                            }}
                          />
                        ))}
                      </div>
                      {equipped && (
                        <div
                          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          <Check size={12} color="#fff" />
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-xs font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                        {t.name}
                      </p>
                      <p className="text-[10px] mb-2 line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                        {t.description}
                      </p>
                      <div className="flex items-center gap-1">
                        {owned && !equipped ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: theme.colors.success + '15', color: theme.colors.success }}>
                            Tap to apply
                          </span>
                        ) : equipped ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: theme.colors.primary + '15', color: theme.colors.primary }}>
                            Equipped
                          </span>
                        ) : (
                          <>
                            <Crown size={10} style={{ color: theme.colors.warning }} />
                            <span className="text-xs font-bold" style={{ color: theme.colors.warning }}>
                              {t.price}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="powerups"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-3"
            >
              {[...powerUps, ...extraPowerUps].map((pu, index) => (
                <motion.div
                  key={pu.type}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl border p-4 flex items-center gap-4"
                  style={{
                    backgroundColor: theme.colors.surface + '60',
                    borderColor: theme.colors.textSecondary + '10',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.warning + '15' }}
                  >
                    <Zap size={20} style={{ color: theme.colors.warning }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                      {pu.name}
                    </p>
                    <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                      {pu.desc}
                    </p>
                    <p className="text-xs font-bold mt-1" style={{ color: theme.colors.secondary }}>
                      x{pu.qty}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuyPowerUp(pu.type, pu.price, pu.qty)}
                    className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                    style={{
                      backgroundColor: theme.colors.warning + '15',
                      color: theme.colors.warning,
                    }}
                  >
                    <Crown size={10} />
                    {pu.price}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
