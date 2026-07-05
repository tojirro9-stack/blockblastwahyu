import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import {
  ArrowLeft, Users, UserPlus, Search,
  Trophy, Circle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DemoFriend {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'playing';
  bestScore: number;
}

const DEMO_FRIENDS: DemoFriend[] = [
  { id: '1', username: 'AlexPro', status: 'online', bestScore: 15200 },
  { id: '2', username: 'BlockMaster99', status: 'playing', bestScore: 12800 },
  { id: '3', username: 'PuzzleQueen', status: 'offline', bestScore: 18400 },
  { id: '4', username: 'CubeNinja', status: 'online', bestScore: 9600 },
  { id: '5', username: 'NovaBlast', status: 'playing', bestScore: 11200 },
];

export default function FriendsScreen() {
  const { goHome, currentTheme } = useGameStore();
  const theme = getTheme(currentTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends] = useState<DemoFriend[]>(DEMO_FRIENDS);

  const handleAddFriend = () => {
    if (!searchQuery.trim()) return;
    toast.info(`Friend request sent to ${searchQuery}!`);
    setSearchQuery('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'playing': return '#7C3AED';
      default: return '#94A3B8';
    }
  };

  const sorted = [...friends].sort((a, b) => b.bestScore - a.bestScore);

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
          <Users size={20} style={{ color: theme.colors.success }} />
          <h1 className="text-xl font-black" style={{ color: theme.colors.textPrimary }}>
            Friends
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.colors.textSecondary }}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search username..."
              className="pl-9"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.textSecondary + '20',
                color: theme.colors.textPrimary,
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddFriend}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <UserPlus size={18} color="#fff" />
          </motion.button>
        </div>
      </div>

      {/* Friends list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2">
          {sorted.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="py-3 px-4 rounded-2xl border flex items-center gap-3"
              style={{
                backgroundColor: theme.colors.surface + '60',
                borderColor: theme.colors.textSecondary + '10',
              }}
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: theme.colors.primary + '15',
                    color: theme.colors.primary,
                  }}
                >
                  {friend.username.charAt(0).toUpperCase()}
                </div>
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: getStatusColor(friend.status),
                    borderColor: theme.colors.bg,
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                  {friend.username}
                </p>
                <div className="flex items-center gap-1">
                  <Circle size={6} style={{ color: getStatusColor(friend.status) }} />
                  <span className="text-[10px] capitalize" style={{ color: getStatusColor(friend.status) }}>
                    {friend.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Trophy size={12} style={{ color: theme.colors.warning }} />
                  <span className="font-mono text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                    {friend.bestScore.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {friends.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto mb-2" style={{ color: theme.colors.textSecondary + '40' }} />
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                No friends yet. Add some!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
