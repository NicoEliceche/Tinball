import { z } from 'zod';

export const PlatformSchema = z.enum(['android', 'ios', 'web']);
export type Platform = z.infer<typeof PlatformSchema>;

export const PositionSchema = z.enum([
  'GOALKEEPER',
  'DEFENDER',
  'FULLBACK',
  'MIDFIELDER',
  'WINGER',
  'FORWARD',
]);
export type Position = z.infer<typeof PositionSchema>;

export const MatchFormatSchema = z.enum(['FIVE_A_SIDE', 'SEVEN_A_SIDE', 'EIGHT_A_SIDE', 'ELEVEN_A_SIDE']);
export type MatchFormat = z.infer<typeof MatchFormatSchema>;

export const SkillLevelSchema = z.enum(['BEGINNER', 'RECREATIONAL', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE']);
export type SkillLevel = z.infer<typeof SkillLevelSchema>;

export const LobbyModeSchema = z.enum(['NEED_ONE', 'OPEN', 'PREMADE', 'PRIZE']);
export type LobbyMode = z.infer<typeof LobbyModeSchema>;

export const GoogleAuthRequestSchema = z.object({
  idToken: z.string().min(40).max(10_000),
  platform: PlatformSchema,
  deviceName: z.string().trim().min(1).max(120).optional(),
});
export type GoogleAuthRequest = z.infer<typeof GoogleAuthRequestSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string(),
  avatarUrl: z.url().nullable(),
  onboardingComplete: z.boolean(),
  isPremium: z.boolean(),
  role: z.enum(['PLAYER', 'VENUE_MANAGER', 'MODERATOR', 'ADMIN']),
  accountStatus: z.enum(['ACTIVE', 'SUSPENDED']),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  platform: PlatformSchema,
  sessionToken: z.string().min(32).optional(),
  expiresAt: z.iso.datetime(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const CompleteProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  nickname: z.string().trim().max(30).default(''),
  birthDate: z.iso.date(),
  locality: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
  primaryPosition: PositionSchema,
  secondaryPositions: z.array(PositionSchema).max(3),
  skillLevel: SkillLevelSchema,
  preferredFoot: z.enum(['RIGHT', 'LEFT', 'BOTH']),
  bio: z.string().trim().max(280).default(''),
});
export type CompleteProfile = z.infer<typeof CompleteProfileSchema>;

export const UpdateSettingsSchema = z.object({
  themeMode: z.enum(['system', 'dark', 'light']),
  maxDistanceKm: z.number().int().min(1).max(100),
  showExactDistance: z.boolean(),
  pushMessages: z.boolean(),
  pushMatches: z.boolean(),
  pushRanking: z.boolean(),
  notificationPreview: z.enum(['generic', 'full', 'hidden']),
  allowDiscovery: z.boolean(),
});

export const CreateLobbySchema = z.object({
  title: z.string().trim().min(4).max(80),
  mode: LobbyModeSchema,
  format: MatchFormatSchema,
  locality: z.string().trim().min(2).max(80),
  venueId: z.string().optional(),
  startsAt: z.iso.datetime(),
  durationMinutes: z.number().int().min(30).max(240),
  requiredPlayers: z.number().int().min(2).max(22),
  skillMin: SkillLevelSchema,
  skillMax: SkillLevelSchema,
  positionsNeeded: z.array(PositionSchema).max(11),
  pricePerPlayerMinor: z.number().int().min(0).max(10_000_000).default(0),
  currency: z.string().length(3).default('ARS'),
  premiumOnly: z.boolean().default(false),
  notes: z.string().trim().max(500).default(''),
}).superRefine((value, context) => {
  const levels = ['BEGINNER', 'RECREATIONAL', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE'];
  if (levels.indexOf(value.skillMin) > levels.indexOf(value.skillMax)) context.addIssue({ code: 'custom', path: ['skillMax'], message: 'El nivel máximo no puede ser menor al mínimo.' });
});
export type CreateLobby = z.infer<typeof CreateLobbySchema>;

export const CreateTeamSchema = z.object({
  name: z.string().trim().min(3).max(80),
  locality: z.string().trim().min(2).max(80),
  format: MatchFormatSchema,
  crestColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});
export type CreateTeam = z.infer<typeof CreateTeamSchema>;

export const JoinLobbySchema = z.object({
  position: PositionSchema,
  teamId: z.string().optional(),
  idempotencyKey: z.uuid(),
});
export type JoinLobby = z.infer<typeof JoinLobbySchema>;

export const InvitePlayerSchema = z.object({
  contextType: z.enum(['CONNECT', 'LOBBY', 'TEAM']),
  contextId: z.string().min(1).optional(),
  note: z.string().trim().max(300).default(''),
}).superRefine((value, context) => {
  if (value.contextType !== 'CONNECT' && !value.contextId) context.addIssue({ code: 'custom', path: ['contextId'], message: 'El contexto requiere un identificador.' });
  if (value.contextType === 'CONNECT' && value.contextId) context.addIssue({ code: 'custom', path: ['contextId'], message: 'Una conexión directa no lleva contexto.' });
});

export const RespondPlayerInviteSchema = z.object({ decision: z.enum(['ACCEPTED', 'DECLINED']) });

export const BlockUserSchema = z.object({ reason: z.string().trim().max(200).optional() });

export const MatchResultSchema = z.object({
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
  idempotencyKey: z.uuid(),
});
export type MatchResult = z.infer<typeof MatchResultSchema>;

export const MatchCheckInSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export const RecordNoShowSchema = z.object({ reason: z.string().trim().min(3).max(500) });

export const AppealSuspensionSchema = z.object({ reason: z.string().trim().min(10).max(1_000) });

export const UpdateLineupSchema = z.object({
  side: z.enum(['HOME', 'AWAY']),
  entries: z.array(z.object({
    userId: z.string().min(1),
    position: PositionSchema,
    isStarter: z.boolean(),
    order: z.number().int().min(0).max(30),
  })).min(1).max(22).refine((entries) => new Set(entries.map((entry) => entry.userId)).size === entries.length, 'No puede repetirse un jugador.'),
});
export type UpdateLineup = z.infer<typeof UpdateLineupSchema>;

export const SubmitReviewSchema = z.object({
  reviewedUserId: z.string(),
  matchId: z.string(),
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.enum(['PUNCTUAL', 'TEAM_PLAYER', 'FAIR_PLAY', 'COMMUNICATIVE', 'SKILLED'])).max(5),
  comment: z.string().trim().max(500).default(''),
});
export type SubmitReview = z.infer<typeof SubmitReviewSchema>;

export const SendMessageSchema = z.object({
  text: z.string().trim().min(1).max(2_000),
  clientId: z.uuid(),
});
export type SendMessage = z.infer<typeof SendMessageSchema>;

export const CreatePostSchema = z.object({
  body: z.string().trim().min(1).max(1_000),
  kind: z.enum(['GENERAL', 'RESULT', 'LOOKING_FOR_PLAYERS', 'ACHIEVEMENT']),
  matchId: z.string().optional(),
  teamId: z.string().optional(),
});
export type CreatePost = z.infer<typeof CreatePostSchema>;

export const ReactToPostSchema = z.object({ kind: z.enum(['LIKE', 'APPLAUSE', 'FAIR_PLAY']) });
export const CommentOnPostSchema = z.object({ text: z.string().trim().min(1).max(500) });

export const RegisterTournamentSchema = z.object({
  teamId: z.string().min(1),
  idempotencyKey: z.uuid(),
});
export type RegisterTournament = z.infer<typeof RegisterTournamentSchema>;

export const RedeemRewardSchema = z.object({ idempotencyKey: z.uuid() });
export type RedeemReward = z.infer<typeof RedeemRewardSchema>;

export const MarkNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1).max(100),
});

export const ClaimReferralSchema = z.object({ code: z.string().trim().toUpperCase().min(4).max(32) });

export const DeleteAccountSchema = z.object({ idToken: z.string().min(40).max(10_000) });

export const CreateReportSchema = z.object({
  reportedUserId: z.string().min(1).optional(),
  category: z.enum(['HARASSMENT', 'DISCRIMINATION', 'THREAT', 'FRAUD', 'NO_SHOW', 'FAKE_RESULT', 'UNSAFE_CONDUCT', 'SPAM', 'OTHER']),
  targetType: z.enum(['USER', 'MATCH', 'LOBBY', 'MESSAGE', 'POST', 'REVIEW']),
  targetId: z.string().min(1).optional(),
  detail: z.string().trim().min(10).max(2_000),
});

export const CreateBookingSchema = z.object({
  fieldId: z.string().min(1),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  matchId: z.string().min(1).optional(),
});

export const ModerationDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().trim().min(3).max(500),
});

export const ResolveReportSchema = z.object({
  status: z.enum(['ACTIONED', 'DISMISSED']),
  resolution: z.string().trim().min(3).max(1_000),
});

export const ResolveSuspensionSchema = z.object({
  decision: z.enum(['LIFTED', 'UPHELD']),
  reason: z.string().trim().min(3).max(500),
});

export const ResolveMatchDisputeSchema = z.object({
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
  reason: z.string().trim().min(10).max(1_000),
});

export const CursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type CursorPagination = z.infer<typeof CursorPaginationSchema>;

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
