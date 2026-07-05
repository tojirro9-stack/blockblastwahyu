import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getTheme } from '@/lib/themes';
import {
  ArrowLeft, Volume2, VolumeX, Vibrate, User,
  AlertTriangle, Wifi, WifiOff,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { networkSync } from '@/lib/networkSync';

export default function SettingsScreen() {
  const {
    goHome,
    soundEnabled,
    hapticEnabled,
    toggleSound,
    toggleHaptic,
    userProfile,
    updateUsername,
    resetProgress,
    currentTheme,
  } = useGameStore();

  const theme = getTheme(currentTheme);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(userProfile.username);
  const [showReset, setShowReset] = useState(false);
  const [syncUrl, setSyncUrl] = useState(() => localStorage.getItem('bbp_sync_url') || '');
  const [syncConnected, setSyncConnected] = useState(networkSync.connected);

  useEffect(() => {
    const cleanup = networkSync.on({
      onStatus: (connected) => setSyncConnected(connected),
    });
    return cleanup;
  }, []);

  const handleSaveName = () => {
    if (newName.trim()) {
      updateUsername(newName.trim());
      networkSync.setUsername(newName.trim());
    }
    setEditName(false);
  };

  const handleReset = () => {
    resetProgress();
    setShowReset(false);
  };

  const handleSyncConnect = () => {
    const normalizedUrl = syncUrl.trim();
    if (!normalizedUrl) {
      localStorage.removeItem('bbp_sync_url');
      networkSync.connect('', userProfile.username);
      return;
    }
    localStorage.setItem('bbp_sync_url', normalizedUrl);
    networkSync.connect(normalizedUrl, userProfile.username);
  };

  const settings = [
    {
      icon: soundEnabled ? Volume2 : VolumeX,
      label: 'Sound',
      description: soundEnabled ? 'On' : 'Off',
      action: toggleSound,
      active: soundEnabled,
    },
    {
      icon: Vibrate,
      label: 'Haptic',
      description: hapticEnabled ? 'On' : 'Off',
      action: toggleHaptic,
      active: hapticEnabled,
    },
    {
      icon: User,
      label: 'Change Username',
      description: userProfile.username,
      action: () => setEditName(true),
      active: false,
    },
    {
      icon: syncConnected ? Wifi : WifiOff,
      label: 'Network Sync',
      description: syncConnected ? 'Connected' : 'Offline',
      action: () => {},
      active: syncConnected,
    },
  ];

  return (
    <div
      className="h-screen w-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
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
        <h1 className="text-xl font-black" style={{ color: theme.colors.textPrimary }}>
          Settings
        </h1>
      </div>

      {/* Settings list */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {settings.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={item.action}
              className="w-full py-4 px-4 rounded-2xl border flex items-center gap-4"
              style={{
                backgroundColor: theme.colors.surface + '60',
                borderColor: theme.colors.textSecondary + '10',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: item.active
                    ? theme.colors.primary + '20'
                    : theme.colors.textSecondary + '10',
                }}
              >
                <item.icon
                  size={18}
                  style={{ color: item.active ? theme.colors.primary : theme.colors.textSecondary }}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>
                  {item.label}
                </p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {item.description}
                </p>
              </div>
              {/* Toggle indicator */}
              {(item.label === 'Sound' || item.label === 'Haptic') && (
                <div
                  className="w-10 h-6 rounded-full relative transition-colors"
                  style={{
                    backgroundColor: item.active ? theme.colors.primary : theme.colors.textSecondary + '20',
                  }}
                >
                  <motion.div
                    animate={{ x: item.active ? 16 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </div>
              )}
            </motion.button>
          ))}

          {/* Network Sync URL */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full py-4 px-4 rounded-2xl border"
            style={{
              backgroundColor: theme.colors.surface + '60',
              borderColor: theme.colors.textSecondary + '10',
            }}
          >
            <p className="text-xs font-bold mb-2" style={{ color: theme.colors.textSecondary }}>
              Network Sync URL (leave blank to use public Supabase leaderboard)
            </p>
            <div className="flex gap-2">
              <input
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
                placeholder="ws://192.168.1.100:3001"
                className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none"
                style={{
                  backgroundColor: theme.colors.bg,
                  borderColor: theme.colors.textSecondary + '20',
                  color: theme.colors.textPrimary,
                }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSyncConnect}
                className="px-4 py-2 rounded-xl text-xs font-bold"
                style={{
                  backgroundColor: syncConnected ? theme.colors.danger : theme.colors.primary,
                  color: '#fff',
                }}
              >
                {syncConnected ? 'DISCONNECT' : 'CONNECT'}
              </motion.button>
            </div>
            {syncConnected && (
              <p className="text-xs mt-1" style={{ color: theme.colors.success }}>
                ✓ Connected — leaderboards are syncing across devices
              </p>
            )}
          </motion.div>

          {/* Reset progress */}
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowReset(true)}
            className="w-full py-4 px-4 rounded-2xl border flex items-center gap-4 mt-4"
            style={{
              backgroundColor: theme.colors.danger + '10',
              borderColor: theme.colors.danger + '20',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.colors.danger + '15' }}
            >
              <AlertTriangle size={18} style={{ color: theme.colors.danger }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold" style={{ color: theme.colors.danger }}>
                Reset Progress
              </p>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Clear all data and start fresh
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Edit name dialog */}
      <Dialog open={editName} onOpenChange={setEditName}>
        <DialogContent
          className="border-2"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary + '20',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: theme.colors.textPrimary }}>
              Change Username
            </DialogTitle>
            <DialogDescription style={{ color: theme.colors.textSecondary }}>
              Enter your new username
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Username"
            maxLength={20}
            className="mt-2"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.textSecondary + '20',
              color: theme.colors.textPrimary,
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditName(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveName}
              style={{
                backgroundColor: theme.colors.primary,
                color: '#fff',
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset confirm dialog */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent
          className="border-2"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.danger + '20',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: theme.colors.danger }}>
              Reset All Progress?
            </DialogTitle>
            <DialogDescription style={{ color: theme.colors.textSecondary }}>
              This will delete all your scores, coins, and purchases. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowReset(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              style={{
                backgroundColor: theme.colors.danger,
                color: '#fff',
              }}
            >
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
