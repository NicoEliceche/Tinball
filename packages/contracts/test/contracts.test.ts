import { describe, expect, it } from 'vitest';
import { BlockUserSchema, CompleteProfileSchema, CreateLobbySchema, MatchResultSchema, SubmitReviewSchema, UpdateLineupSchema } from '../src/index.js';

describe('Tinball contracts', () => {
  it('accepts a valid football lobby and rejects impossible capacity', () => {
    const lobby = { title: 'Falta un nueve', mode: 'NEED_ONE', format: 'SEVEN_A_SIDE', locality: 'Palermo', startsAt: '2026-08-03T20:00:00.000Z', durationMinutes: 60, requiredPlayers: 14, skillMin: 'INTERMEDIATE', skillMax: 'ADVANCED', positionsNeeded: ['FORWARD'], pricePerPlayerMinor: 5000, currency: 'ARS', notes: '' };
    expect(CreateLobbySchema.safeParse(lobby).success).toBe(true);
    expect(CreateLobbySchema.safeParse({ ...lobby, requiredPlayers: 23 }).success).toBe(false);
    expect(CreateLobbySchema.safeParse({ ...lobby, skillMin: 'COMPETITIVE', skillMax: 'BEGINNER' }).success).toBe(false);
  });

  it('keeps football ratings between one and five balls', () => {
    const base = { reviewedUserId: 'player-2', matchId: 'match-1', tags: ['FAIR_PLAY'], comment: '' };
    expect(SubmitReviewSchema.safeParse({ ...base, rating: 5 }).success).toBe(true);
    expect(SubmitReviewSchema.safeParse({ ...base, rating: 0 }).success).toBe(false);
    expect(SubmitReviewSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
  });

  it('rejects duplicate players in a lineup', () => {
    const entry = { userId: 'player-1', position: 'FORWARD', isStarter: true, order: 1 };
    expect(UpdateLineupSchema.safeParse({ side: 'HOME', entries: [entry, entry] }).success).toBe(false);
  });

  it('validates profile and score boundaries', () => {
    expect(CompleteProfileSchema.safeParse({ displayName: 'Nico', birthDate: '1998-05-12', locality: 'Palermo', province: 'Buenos Aires', primaryPosition: 'MIDFIELDER', secondaryPositions: ['WINGER'], skillLevel: 'ADVANCED', preferredFoot: 'RIGHT', bio: '' }).success).toBe(true);
    expect(MatchResultSchema.safeParse({ homeScore: -1, awayScore: 2, idempotencyKey: '4a113f1a-5673-43aa-af8f-43cbcf727d45' }).success).toBe(false); // gitleaks:allow -- deterministic test UUID
  });

  it('limits private block notes', () => {
    expect(BlockUserSchema.safeParse({ reason: 'No quiero volver a interactuar' }).success).toBe(true);
    expect(BlockUserSchema.safeParse({ reason: 'x'.repeat(201) }).success).toBe(false);
  });
});
