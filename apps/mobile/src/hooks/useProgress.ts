import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardEntryDto, MistakeDto, ProgressStatsDto, StreakDto } from '@aarambh360/types';
import { apiGet } from '../services/apiClient';

export function useProgress() {
  const [streaks, setStreaks] = useState<StreakDto[]>([]);
  const [stats, setStats] = useState<ProgressStatsDto | null>(null);
  const [mistakes, setMistakes] = useState<MistakeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextStreaks, nextStats, nextMistakes] = await Promise.all([
        apiGet<StreakDto[]>('/progress/streak'),
        apiGet<ProgressStatsDto>('/progress/stats'),
        apiGet<MistakeDto[]>('/mistakes'),
      ]);
      setStreaks(nextStreaks);
      setStats(nextStats);
      setMistakes(nextMistakes);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { streaks, stats, mistakes, loading, error, reload };
}

export function useLeaderboard(subjectKey: string) {
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<LeaderboardEntryDto[]>(`/leaderboard/${subjectKey}`)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [subjectKey]);

  return { entries, loading };
}
