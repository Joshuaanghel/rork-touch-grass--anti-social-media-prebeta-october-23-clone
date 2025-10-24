import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getUser } from '../../../../db';

export default publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('[API] Fetching user:', input.userId);
    const user = getUser(input.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  });
