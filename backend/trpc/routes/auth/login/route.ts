import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { getUserByEmail, getUser, createUserAuth } from '../../../../db';
import * as crypto from 'crypto';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().optional(),
    provider: z.enum(['email', 'microsoft', 'google']).optional().default('email'),
    accessToken: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[API] Login attempt for:', input.email, 'provider:', input.provider);
    
    if (input.provider === 'microsoft' || input.provider === 'google') {
      let auth = getUserByEmail(input.email);
      
      if (!auth) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        auth = createUserAuth({
          userId,
          email: input.email,
          passwordHash: '',
          createdAt: new Date().toISOString(),
        });
      }
      
      const user = getUser(auth.userId);
      
      return {
        success: true,
        userId: auth.userId,
        email: auth.email,
        user,
      };
    }
    
    if (!input.password) {
      throw new Error('Password is required for email login');
    }
    
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
