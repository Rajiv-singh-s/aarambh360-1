import { useCallback, useState } from 'react';
import type {
  CompleteQuizSessionResponseDto,
  QuizSessionDto,
  SubmitQuizAnswerResponseDto,
} from '@aarambh360/types';
import { apiPost } from '../services/apiClient';

export function useQuizEngine() {
  const [session, setSession] = useState<QuizSessionDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, SubmitQuizAnswerResponseDto>>({});

  const startSession = useCallback(async (topicId: string, count = 10) => {
    setLoading(true);
    setError(null);
    setAnswers({});
    try {
      const nextSession = await apiPost<QuizSessionDto>('/quiz/sessions', { topicId, count });
      setSession(nextSession);
      return nextSession;
    } catch (err: any) {
      setError(err.message ?? 'Failed to start quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    async (questionId: string, selectedOptionId: string, timeTakenSeconds?: number) => {
      if (!session) throw new Error('No active quiz session');
      const result = await apiPost<SubmitQuizAnswerResponseDto>(
        `/quiz/sessions/${session.sessionId}/answers`,
        { questionId, selectedOptionId, timeTakenSeconds },
      );
      setAnswers((prev) => ({ ...prev, [questionId]: result }));
      return result;
    },
    [session],
  );

  const completeSession = useCallback(async (): Promise<CompleteQuizSessionResponseDto> => {
    if (!session) throw new Error('No active quiz session');
    setLoading(true);
    try {
      return await apiPost<CompleteQuizSessionResponseDto>(
        `/quiz/sessions/${session.sessionId}/complete`,
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  return {
    session,
    answers,
    loading,
    error,
    startSession,
    submitAnswer,
    completeSession,
    reset: () => {
      setSession(null);
      setAnswers({});
      setError(null);
    },
  };
}
