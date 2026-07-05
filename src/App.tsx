import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Toaster } from '@/components/ui/sonner';
import { networkSync } from '@/lib/networkSync';

import SplashScreen from '@/screens/SplashScreen';
import HomeScreen from '@/screens/HomeScreen';
import GameScreen from '@/screens/GameScreen';
import GameOverScreen from '@/screens/GameOverScreen';
import LeaderboardScreen from '@/screens/LeaderboardScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ShopScreen from '@/screens/ShopScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import FriendsScreen from '@/screens/FriendsScreen';

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);

  // Auto-connect to sync server if URL saved
  useEffect(() => {
    const savedUrl = localStorage.getItem('bbp_sync_url');
    const username = useGameStore.getState().userProfile.username;
    if (savedUrl) {
      networkSync.connect(savedUrl, username);
    }

    // Listen for BroadcastChannel updates from other tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('bbp_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'new_score' && event.data?.leaderboard) {
          const state = useGameStore.getState();
          const merged = [...event.data.leaderboard];
          for (const local of state.leaderboard) {
            if (!merged.some((e: any) => e.id === local.id)) {
              merged.push(local);
            }
          }
          merged.sort((a: any, b: any) => b.score - a.score);
          merged.slice(0, 100);
          try {
            localStorage.setItem('bbp_leaderboard', JSON.stringify(merged));
          } catch {}
          if (setLeaderboard) {
            setLeaderboard(merged);
          }
        }
      };
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, [setLeaderboard]);

  const renderScreen = () => {
    switch (phase) {
      case 'splash':
        return <SplashScreen key="splash" />;
      case 'home':
        return <HomeScreen key="home" />;
      case 'playing':
      case 'paused':
        return <GameScreen key="game" />;
      case 'gameover':
        return <GameOverScreen key="gameover" />;
      case 'leaderboard':
        return <LeaderboardScreen key="leaderboard" />;
      case 'settings':
        return <SettingsScreen key="settings" />;
      case 'shop':
        return <ShopScreen key="shop" />;
      case 'profile':
        return <ProfileScreen key="profile" />;
      case 'friends':
        return <FriendsScreen key="friends" />;
      default:
        return <HomeScreen key="home-default" />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0A1A]">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#12122A',
            color: '#F8FAFC',
            border: '1px solid #7C3AED30',
          },
        }}
      />
    </div>
  );
}
