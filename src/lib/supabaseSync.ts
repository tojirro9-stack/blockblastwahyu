import type { RealtimePostgresChangesFilter } from '@supabase/supabase-js';
import type { LeaderboardEntry } from '@/types/game';
import { supabase, SUPABASE_LEADERBOARD_TABLE } from '@/lib/supabase';

export async function fetchGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(SUPABASE_LEADERBOARD_TABLE)
    .select('id, username, avatar, score, date')
    .order('score', { ascending: false })
    .limit(200);

  if (error) {
    console.warn('[Supabase] Failed to load leaderboard:', error.message);
    return [];
  }

  return data ?? [];
}

export function subscribeGlobalLeaderboard(
  callback: (leaderboard: LeaderboardEntry[]) => void
): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:leaderboard')
    .on<RealtimePostgresChangesFilter<'INSERT' | 'UPDATE' | 'DELETE'>>(
      'postgres_changes',
      { event: '*', schema: 'public', table: SUPABASE_LEADERBOARD_TABLE },
      async () => {
        const data = await fetchGlobalLeaderboard();
        callback(data);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function submitGlobalScore(entry: Omit<LeaderboardEntry, 'rank'>) {
  if (!supabase) return;

  const { error } = await supabase
    .from(SUPABASE_LEADERBOARD_TABLE)
    .insert({
      id: entry.id,
      username: entry.username,
      avatar: entry.avatar,
      score: entry.score,
      date: entry.date,
    });

  if (error) {
    console.warn('[Supabase] Failed to submit score:', error.message);
  }
}
