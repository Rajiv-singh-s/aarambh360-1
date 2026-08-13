import { AnalyticsService } from './analytics.service';
import { ProgressService } from '../progress/progress.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: Record<string, any>;
  let progressService: { getStats: jest.Mock };

  beforeEach(() => {
    prisma = {
      learningEvent: { create: jest.fn(), count: jest.fn(), findMany: jest.fn() },
      mainsSubmission: { count: jest.fn() },
      mainsEvaluation: { count: jest.fn() },
    };
    progressService = {
      getStats: jest.fn().mockResolvedValue({
        totalQuestionsAnswered: 10,
        totalCorrect: 7,
        accuracy: 70,
        subjectBreakdown: [
          { subjectId: 's1', subjectName: 'Polity', attempted: 5, correct: 4 },
          { subjectId: 's2', subjectName: 'History', attempted: 5, correct: 2 },
        ],
      }),
    };
    service = new AnalyticsService(
      prisma as unknown as PrismaService,
      progressService as unknown as ProgressService,
    );
  });

  it('derives weak and strong areas from progress stats', async () => {
    prisma.learningEvent.count.mockResolvedValue(2);
    prisma.mainsSubmission.count.mockResolvedValue(1);
    prisma.mainsEvaluation.count.mockResolvedValue(1);

    const profile = await service.getProfile('user-1');
    expect(profile.strongAreas.length + profile.weakAreas.length).toBeGreaterThan(0);
    expect(profile.accuracy).toBe(70);
  });
});
