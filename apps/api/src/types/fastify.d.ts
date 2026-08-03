import type { AuthPlatform, User } from '@prisma/client';
declare module 'fastify' {
  interface FastifyRequest {
    auth: { userId: string; sessionId: string; platform: AuthPlatform; user: Pick<User, 'id' | 'email' | 'displayName' | 'avatarUrl' | 'role' | 'status' | 'onboardingComplete'> } | null;
  }
}
