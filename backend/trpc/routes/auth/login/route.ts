import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getUserByEmail, getUser } from '../../../../db';
import * as crypto from 'crypto';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[API] Login attempt for:', input.email);
    
    const auth = getUserByEmail(input.email);
    if (!auth) {
      throw new Error('Invalid email or password');
    }
    
    const hashedPassword = hashPassword(input.password);
    if (auth.passwordHash !== hashedPassword) {
      throw new Error('Invalid email or password');
    }
    
    const user = getUser(auth.userId);
    
    return {
      success: true,
      userId: auth.userId,
      email: auth.email,
      user,
    };
  });
