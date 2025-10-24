import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { createUser, saveQuizResponse, createUserAuth, getUserByEmail } from '../../../../db';
import * as crypto from 'crypto';

const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string(),
  personalityType: z.enum(['The Explorer', 'The Connector', 'The Creator', 'The Thinker', 'The Adventurer', 'The Nurturer', 'The Visionary', 'The Catalyst', 'The Harmonizer', 'The Maverick']),
  hobbies: z.array(z.string()),
  color: z.string(),
  trophies: z.array(z.any()),
  onboardingCompleted: z.boolean(),
  handshakes: z.number(),
  grassPoints: z.number(),
  totalNetworkingTime: z.number(),
  networkingStats: z.object({
    averageFriendsPerDay: z.number(),
    totalTimeThisWeek: z.number(),
    totalTimeThisMonth: z.number(),
    topLocations: z.array(z.any()),
    sessionsCompleted: z.number(),
  }),
});

const quizResponseSchema = z.object({
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  aiFindings: z.object({
    dominantTraits: z.array(z.string()),
    decisionMaking: z.string(),
    socialStyle: z.string(),
    stressResponse: z.string(),
    communicationPreference: z.string(),
    percentages: z.record(z.string(), z.number()),
  }).optional(),
});

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default publicProcedure
  .input(z.object({
    profile: userProfileSchema,
    quizResponse: quizResponseSchema.optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[API] Creating user profile:', input.profile.name);
    
    if (input.email && input.password) {
      if (!input.email.toLowerCase().endsWith('@usf.edu')) {
        throw new Error('Only @usf.edu email addresses are allowed');
      }
      
      const existingUser = getUserByEmail(input.email);
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }
      
      createUserAuth({
        userId: input.profile.id,
        email: input.email,
        passwordHash: hashPassword(input.password),
        createdAt: new Date().toISOString(),
      });
    }
    
    const createdUser = createUser(input.profile);
    
    if (input.quizResponse) {
      saveQuizResponse({
        userId: input.profile.id,
        userName: input.profile.name,
        personalityType: input.profile.personalityType,
        answers: input.quizResponse.answers,
        completedAt: new Date().toISOString(),
        aiFindings: input.quizResponse.aiFindings,
      });
    }
    
    return {
      success: true,
      user: createdUser,
    };
  });
