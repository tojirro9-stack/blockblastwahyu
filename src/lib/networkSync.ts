// ==================== NETWORK SYNC MANAGER ====================
// Public leaderboard sync using Supabase.

import type { LeaderboardEntry } from '@/types/game';
import { fetchGlobalLeaderboard, submitGlobalScore, subscribeGlobalLeaderboard } from '@/lib/supabaseSync';

type SyncCallback = {
  onLeaderboard: (data: LeaderboardEntry[]) => void;
  onNewScore: (entry: LeaderboardEntry) => void;
  onPlayers: (players: { username: string; connected: boolean }[]) => void;
  onStatus: (connected: boolean) => void;
};

class NetworkSync {
  private url: string = '';
  private listeners: Partial<SyncCallback>[] = [];
  private _connected = false;
  private cleanupSubscription: (() => void) | null = null;

  get connected() {
    return this._connected;
  }

  async connect(serverUrl: string, _username: string) {
    this.url = serverUrl || 'supabase';

    try {
      const leaderboard = await fetchGlobalLeaderboard();
      this._connected = true;
      this.listeners.forEach((listener) => listener.onStatus?.(true));
      this.listeners.forEach((listener) => listener.onLeaderboard?.(leaderboard));
      this.listeners.forEach((listener) => listener.onPlayers?.(this.buildPlayers(leaderboard)));

      if (this.cleanupSubscription) {
        this.cleanupSubscription();
      }
      this.cleanupSubscription = subscribeGlobalLeaderboard((data) => {
        this.listeners.forEach((listener) => listener.onLeaderboard?.(data));
        this.listeners.forEach((listener) => listener.onPlayers?.(this.buildPlayers(data)));
      });
    } catch (error) {
      console.warn('[Sync] Supabase connect failed', error);
      this._connected = false;
      this.listeners.forEach((listener) => listener.onStatus?.(false));
    }
  }

  disconnect() {
    if (this.cleanupSubscription) {
      this.cleanupSubscription();
      this.cleanupSubscription = null;
    }
    this._connected = false;
    this.listeners.forEach((listener) => listener.onStatus?.(false));
  }

  submitScore(score: number, username: string, _linesCleared: number, _combo: number, _gameMode: string) {
    const entry: LeaderboardEntry = {
      id: `lb_${Date.now()}`,
      username,
      avatar: '',
      score,
      date: new Date().toISOString().split('T')[0],
    };

    void submitGlobalScore(entry);
    this.listeners.forEach((listener) => listener.onNewScore?.(entry));
  }

  setUsername(_name: string) {
    // Supabase sync does not use the username field directly.
  }

  on(cb: Partial<SyncCallback>) {
    const listener = { ...cb };
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  buildPlayers(leaderboard: LeaderboardEntry[]) {
    const uniqueUsers = Array.from(new Set(leaderboard.map((entry) => entry.username)));
    return uniqueUsers.map((username) => ({ username, connected: true }));
  }

  getState() {
    return {
      connected: this._connected,
      url: this.url,
    };
  }
}

export const networkSync = new NetworkSync();
