import { UserProfile } from '@/types';

interface UserAuth {
  userId: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface FeedbackResponse {
  userId: string;
  userEmail: string;
  answers: Record<number, string>;
  submittedAt: string;
}

interface Database {
  users: Map<string, UserProfile>;
  userAuth: Map<string, UserAuth>;
  feedbackResponses: Map<string, FeedbackResponse>;
  userCount: number;
  quizResponses: Map<string, QuizResponse>;
}

interface QuizResponse {
  userId: string;
  userName: string;
  personalityType: string;
  answers: { question: string; answer: string }[];
  completedAt: string;
  aiFindings?: {
    dominantTraits: string[];
    decisionMaking: string;
    socialStyle: string;
    stressResponse: string;
    communicationPreference: string;
    percentages: Record<string, number>;
  };
}

const db: Database = {
  users: new Map(),
  userAuth: new Map(),
  feedbackResponses: new Map(),
  userCount: 0,
  quizResponses: new Map(),
};

export const getUser = (userId: string): UserProfile | undefined => {
  return db.users.get(userId);
};

export const getAllUsers = (): UserProfile[] => {
  return Array.from(db.users.values());
};

export const createUser = (profile: UserProfile): UserProfile => {
  db.users.set(profile.id, profile);
  db.userCount = db.users.size;
  console.log('[DB] User created:', profile.name, 'Total users:', db.userCount);
  return profile;
};

export const updateUser = (userId: string, updates: Partial<UserProfile>): UserProfile | null => {
  const user = db.users.get(userId);
  if (!user) return null;
  
  const updatedUser = { ...user, ...updates };
  db.users.set(userId, updatedUser);
  console.log('[DB] User updated:', userId);
  return updatedUser;
};

export const getUserCount = (): number => {
  return db.userCount;
};

export const incrementUserCount = (): number => {
  db.userCount++;
  console.log('[DB] User count incremented to:', db.userCount);
  return db.userCount;
};

export const saveQuizResponse = (response: QuizResponse): void => {
  db.quizResponses.set(response.userId, response);
  console.log('[DB] Quiz response saved for user:', response.userName);
};

export const getAllQuizResponses = (): QuizResponse[] => {
  return Array.from(db.quizResponses.values());
};

export const getUserByEmail = (email: string): UserAuth | undefined => {
  return db.userAuth.get(email.toLowerCase());
};

export const createUserAuth = (auth: UserAuth): UserAuth => {
  db.userAuth.set(auth.email.toLowerCase(), auth);
  console.log('[DB] User auth created for:', auth.email);
  return auth;
};

export const saveFeedback = (feedback: FeedbackResponse): void => {
  db.feedbackResponses.set(feedback.userId, feedback);
  console.log('[DB] Feedback saved for user:', feedback.userEmail);
};

export const getAllFeedback = (): FeedbackResponse[] => {
  return Array.from(db.feedbackResponses.values());
};

export const exportAllData = () => {
  return {
    users: Array.from(db.users.values()),
    userAuth: Array.from(db.userAuth.values()).map(({ passwordHash, ...auth }) => auth),
    feedbackResponses: Array.from(db.feedbackResponses.values()),
    userCount: db.userCount,
    quizResponses: Array.from(db.quizResponses.values()),
    exportedAt: new Date().toISOString(),
  };
};

export type { QuizResponse, UserAuth, FeedbackResponse };
