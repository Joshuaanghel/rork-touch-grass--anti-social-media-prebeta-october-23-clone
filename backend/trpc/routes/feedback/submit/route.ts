import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { saveFeedback, incrementUserCount } from '../../../../db';

export default publicProcedure
  .input(z.object({
    userId: z.string(),
    userEmail: z.string().email(),
    answers: z.record(z.string(), z.string()),
  }))
  .mutation(async ({ input }) => {
    console.log('[API] Feedback submitted by:', input.userEmail);
    
    saveFeedback({
      userId: input.userId,
      userEmail: input.userEmail,
      answers: input.answers,
      submittedAt: new Date().toISOString(),
    });
    
    const newCount = incrementUserCount();
    
    return {
      success: true,
      userCount: newCount,
    };
  });
