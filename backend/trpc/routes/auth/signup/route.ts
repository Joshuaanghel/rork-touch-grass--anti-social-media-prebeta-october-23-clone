import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { createUserAuth, getUserByEmail } from '../../../../db';
import * as crypto from 'crypto';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[API] Signup attempt for:', input.email);
    
    if (!input.email.toLowerCase().endsWith('@usf.edu')) {
      throw new Error('Only @usf.edu email addresses are allowed for University of South Florida students');
    }
    
    const existingUser = getUserByEmail(input.email);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }
    
    const auth = createUserAuth({
      userId: input.userId,
      email: input.email,
      passwordHash: hashPassword(input.password),
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      userId: auth.userId,
      email: auth.email,
    };
  });
