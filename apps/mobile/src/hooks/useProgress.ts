import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardEntryDto, MistakeDto, ProgressStatsDto, StreakDto } from '@aarambh360/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

      const mcqStreak = nextStreaks.find((s) => s.streakType === 'MCQ');
      if (mcqStreak) {
        const lastSeen = await AsyncStorage.getItem('@last_seen_streak');
        const prevStreak = lastSeen ? parseInt(lastSeen, 10) : 0;
        
        if (prevStreak > 0 && mcqStreak.currentCount === 0) {
          const stored = await AsyncStorage.getItem("@app_notifications");
          const notifs = stored ? JSON.parse(stored) : [];
          // Avoid duplicate notifications
          const alreadyNotified = notifs.some((n: any) => n.id.startsWith("missed-streak"));
          if (!alreadyNotified) {
            notifs.unshift({
              id: `missed-streak-${Date.now()}`,
              type: "warning",
              title: "Oh no, you missed your streak! 😢",
              message: "Don't worry, every master was once a beginner. Keep using the app today to build a new one!",
              date: new Date().toISOString()
            });
            await AsyncStorage.setItem("@app_notifications", JSON.stringify(notifs));
          }
        }
        
        if (prevStreak !== mcqStreak.currentCount) {
          await AsyncStorage.setItem('@last_seen_streak', mcqStreak.currentCount.toString());
        }
      }

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
