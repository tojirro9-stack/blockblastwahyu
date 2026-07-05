import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import { networkSync } from '@/lib/networkSync';
import {
  ArrowLeft, Trophy, Clock, Calendar, Infinity, Users,
  Crown, Medal, Award, Wifi, WifiOff,
} from 'lucide-react';
import type { LeaderboardEntry } from '@/types/game';

type Tab = 'daily' | 'weekly' | 'alltime' | 'friends';

export default function LeaderboardScreen() {
  const {
    goHome,
    leaderboard: localLeaderboard,
    userProfile,
    currentTheme,
  } = useGameStore();

  const theme = getTheme(currentTheme);
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [syncedLeaderboard, setSyncedLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [connected, setConnected] = useState(networkSync.connected);

  // Listen for sync updates
  useEffect(() => {
    const cleanup = networkSync.on({
      onLeaderboard: (data) => setSyncedLeaderboard(data),
      onPlayers: (players) => setPlayerCount(players.length),
      onStatus: (status) => setConnected(status),
    });
    return cleanup;
  }, []);

  // Merge local + synced leaderboard
  const mergedLeaderboard = useMemo(() => {
    const all = [...syncedLeaderboard];
    // Add local entries not already in synced list
    for (const local of localLeaderboard) {
      if (!all.some((e) => e.id === local.id)) {
        all.push(local);
      }
    }
    return all.sort((a, b) => b.score - a.score).slice(0, 200);
  }, [syncedLeaderboard, localLeaderboard]);

  // Filter by date
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const filtered = useMemo(() => {
    return mergedLeaderboard.filter((entry) => {
      if (activeTab === 'daily') return entry.date === today;
      if (activeTab === 'weekly') return entry.date >= weekStart;
      return true;
    });
  }, [mergedLeaderboard, activeTab, today, weekStart]);

  const ranked = useMemo(() => {
    return filtered.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [filtered]);

  const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: 'daily', label: 'Today', icon: Clock },
    { key: 'weekly', label: 'Week', icon: Calendar },
    { key: 'alltime', label: 'All Time', icon: Infinity },
    { key: 'friends', label: 'Friends', icon: Users },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={16} style={{ color: '#FFD700' }} />;
    if (rank === 2) return <Medal size={16} style={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <Award size={16} style={{ color: '#CD7F32' }} />;
    return <span className="text-xs font-mono w-4 text-center" style={{ color: theme.colors.textSecondary }}>{rank}</span>;
  };


  return (
    <div
      className="h-screen w-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
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
            <Trophy size={20} style={{ color: theme.colors.warning }} />
            <h1 className="text-xl font-black" style={{ color: theme.colors.textPrimary }}>
              Leaderboard
            </h1>
          </div>
        </div>
        {/* Sync status */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold"
          style={{
            backgroundColor: (connected ? theme.colors.success : theme.colors.textSecondary) + '15',
            color: connected ? theme.colors.success : theme.colors.textSecondary,
          }}
        >
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? `${playerCount} players` : 'offline'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            style={{
              backgroundColor: activeTab === tab.key ? theme.colors.primary + '30' : theme.colors.surface + '40',
              color: activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary,
              border: `1px solid ${activeTab === tab.key ? theme.colors.primary + '40' : 'transparent'}`,
            }}
          >
            <tab.icon size={12} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Player rank */}
      <div className="px-4 mb-3">
        <div
          className="py-3 px-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: theme.colors.primary + '10',
            borderColor: theme.colors.primary + '30',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: theme.colors.primary + '20', color: theme.colors.primary }}
              >
                {userProfile.username.charAt(0).toUpperCase()}
              </div>
              {connected && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ backgroundColor: theme.colors.success, borderColor: theme.colors.bg }}
                />
              )}
            </div>
            <span className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
              {userProfile.username}
            </span>
          </div>
          <span className="font-mono font-bold" style={{ color: theme.colors.primary }}>
            {userProfile.bestScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2">
          {ranked.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="py-3 px-4 rounded-xl border flex items-center gap-3"
              style={{
                backgroundColor: entry.rank <= 3 ? theme.colors.surface + '80' : theme.colors.surface + '40',
                borderColor: entry.rank <= 3 ? theme.colors.warning + '20' : 'transparent',
              }}
            >
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: entry.rank <= 3 ? theme.colors.warning + '15' : theme.colors.primary + '15',
                    color: entry.rank <= 3 ? theme.colors.warning : theme.colors.primary,
                  }}
                >
                  {entry.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                    {entry.username}
                  </p>
                  </div>
                <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                  {entry.date}
                </p>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                {entry.score.toLocaleString()}
              </span>
            </motion.div>
          ))}

          {ranked.length === 0 && (
            <div className="text-center py-12">
              <Trophy size={32} className="mx-auto mb-2" style={{ color: theme.colors.textSecondary + '40' }} />
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                No scores yet. Be the first!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
