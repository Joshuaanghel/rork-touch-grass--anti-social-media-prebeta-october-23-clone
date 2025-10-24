import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { updateUser } from '../../../../db';

export default publicProcedure
  .input(z.object({
    userId: z.string(),
    updates: z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      hobbies: z.array(z.string()).optional(),
      color: z.string().optional(),
      trophies: z.array(z.any()).optional(),
      handshakes: z.number().optional(),
      grassPoints: z.number().optional(),
      totalNetworkingTime: z.number().optional(),
      networkingStats: z.object({
        averageFriendsPerDay: z.number(),
        totalTimeThisWeek: z.number(),
        totalTimeThisMonth: z.number(),
        topLocations: z.array(z.any()),
        sessionsCompleted: z.number(),
      }).optional(),
    }),
  }))
  .mutation(async ({ input }) => {
    console.log('[API] Updating user:', input.userId);
    const updatedUser = updateUser(input.userId, input.updates);
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      user: updatedUser,
    };
  });
