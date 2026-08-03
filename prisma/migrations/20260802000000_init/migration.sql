-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'VENUE_MANAGER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETION_PENDING', 'DELETED');

-- CreateEnum
CREATE TYPE "AuthPlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "PreferredFoot" AS ENUM ('RIGHT', 'LEFT', 'BOTH');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GOALKEEPER', 'DEFENDER', 'FULLBACK', 'MIDFIELDER', 'WINGER', 'FORWARD');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'RECREATIONAL', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE');

-- CreateEnum
CREATE TYPE "MatchFormat" AS ENUM ('FIVE_A_SIDE', 'SEVEN_A_SIDE', 'EIGHT_A_SIDE', 'ELEVEN_A_SIDE');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('CAPTAIN', 'ADMIN', 'PLAYER', 'GUEST');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'LEFT', 'REMOVED');

-- CreateEnum
CREATE TYPE "LobbyMode" AS ENUM ('NEED_ONE', 'OPEN', 'PREMADE', 'PRIZE');

-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('DRAFT', 'OPEN', 'FULL', 'CONFIRMED', 'CANCELLED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'REQUESTED', 'CONFIRMED', 'DECLINED', 'WAITLISTED', 'CANCELLED', 'NO_SHOW', 'ATTENDED');

-- CreateEnum
CREATE TYPE "PlayerInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('DRAFT', 'CALLING', 'CONFIRMED', 'LIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'HOME_CONFIRMED', 'AWAY_CONFIRMED', 'CONFIRMED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "ConversationKind" AS ENUM ('TEAM', 'MATCH', 'LOBBY', 'SUPPORT');

-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('TEXT', 'SYSTEM', 'RESULT', 'LINEUP');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewTag" AS ENUM ('PUNCTUAL', 'TEAM_PLAYER', 'FAIR_PLAY', 'COMMUNICATIVE', 'SKILLED');

-- CreateEnum
CREATE TYPE "RankingPeriodKind" AS ENUM ('MONTHLY', 'SEASONAL', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "RankingEventKind" AS ENUM ('WIN', 'DRAW', 'LOSS', 'OPPONENT_STRENGTH', 'FAIR_PLAY', 'NO_SHOW', 'CORRECTION');

-- CreateEnum
CREATE TYPE "PointsEventKind" AS ENUM ('MATCH_PLAYED', 'STREAK', 'REVIEW', 'COMPLETED_PROFILE', 'REFERRAL', 'PREMIUM_BONUS', 'REDEMPTION', 'CORRECTION');

-- CreateEnum
CREATE TYPE "TournamentCadence" AS ENUM ('BIWEEKLY', 'MONTHLY', 'SEMIANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TournamentEntryStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'WITHDRAWN', 'ELIMINATED', 'CHAMPION');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('HOLD', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FeedPostKind" AS ENUM ('GENERAL', 'RESULT', 'LOOKING_FOR_PLAYERS', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "ReactionKind" AS ENUM ('LIKE', 'APPLAUSE', 'FAIR_PLAY');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('CLICKED', 'REGISTERED', 'VERIFIED_MATCH', 'REWARDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'TRIAGED', 'ACTIONED', 'DISMISSED', 'APPEALED');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('HARASSMENT', 'DISCRIMINATION', 'THREAT', 'FRAUD', 'NO_SHOW', 'FAKE_RESULT', 'UNSAFE_CONDUCT', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "SuspensionStatus" AS ENUM ('ACTIVE', 'LIFTED', 'APPEALED');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('MATCH', 'CHAT', 'INVITE', 'RANKING', 'REWARD', 'SECURITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PrizeChallengeStatus" AS ENUM ('DRAFT', 'COMPLIANCE_REVIEW', 'OPEN', 'FUNDED', 'LOCKED', 'SETTLED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LedgerDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "displayName" VARCHAR(80) NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthIdentity" (
    "id" TEXT NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "providerSub" VARCHAR(255) NOT NULL,
    "providerEmail" VARCHAR(320) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "platform" "AuthPlatform" NOT NULL,
    "deviceName" VARCHAR(120),
    "ipHash" CHAR(64),
    "userAgentHash" CHAR(64),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "stepUpAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "locality" VARCHAR(80) NOT NULL,
    "province" VARCHAR(80) NOT NULL,
    "countryCode" CHAR(2) NOT NULL DEFAULT 'AR',
    "primaryPosition" "PlayerPosition" NOT NULL,
    "secondaryPositions" "PlayerPosition"[],
    "skillLevel" "SkillLevel" NOT NULL,
    "preferredFoot" "PreferredFoot" NOT NULL,
    "bio" VARCHAR(280) NOT NULL DEFAULT '',
    "ratingAverage" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 100,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "themeMode" VARCHAR(16) NOT NULL DEFAULT 'dark',
    "maxDistanceKm" INTEGER NOT NULL DEFAULT 10,
    "showExactDistance" BOOLEAN NOT NULL DEFAULT false,
    "pushMessages" BOOLEAN NOT NULL DEFAULT true,
    "pushMatches" BOOLEAN NOT NULL DEFAULT true,
    "pushRanking" BOOLEAN NOT NULL DEFAULT true,
    "notificationPreview" VARCHAR(20) NOT NULL DEFAULT 'generic',
    "allowDiscovery" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "locality" VARCHAR(80) NOT NULL,
    "format" "MatchFormat" NOT NULL,
    "crestUrl" TEXT,
    "crestColor" VARCHAR(9),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "rankPoints" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'PLAYER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "locality" VARCHAR(80) NOT NULL,
    "province" VARCHAR(80) NOT NULL,
    "address" VARCHAR(180) NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "surface" VARCHAR(60),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "ratingAverage" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueField" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "format" "MatchFormat" NOT NULL,
    "indoor" BOOLEAN NOT NULL DEFAULT false,
    "hourlyPriceMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'ARS',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lobby" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "mode" "LobbyMode" NOT NULL,
    "status" "LobbyStatus" NOT NULL DEFAULT 'DRAFT',
    "format" "MatchFormat" NOT NULL,
    "locality" VARCHAR(80) NOT NULL,
    "venueId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "requiredPlayers" INTEGER NOT NULL,
    "skillMin" "SkillLevel" NOT NULL,
    "skillMax" "SkillLevel" NOT NULL,
    "positionsNeeded" "PlayerPosition"[],
    "pricePerPlayerMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'ARS',
    "premiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "notes" VARCHAR(500) NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LobbyParticipant" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "position" "PlayerPosition",
    "status" "ParticipantStatus" NOT NULL DEFAULT 'REQUESTED',
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LobbyParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerInvite" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "lobbyId" TEXT,
    "teamId" TEXT,
    "contextKey" VARCHAR(200) NOT NULL,
    "status" "PlayerInviteStatus" NOT NULL DEFAULT 'PENDING',
    "note" VARCHAR(300) NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "lobbyId" TEXT,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "venueId" TEXT,
    "title" VARCHAR(100) NOT NULL,
    "format" "MatchFormat" NOT NULL,
    "locality" VARCHAR(80) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'DRAFT',
    "resultStatus" "ResultStatus" NOT NULL DEFAULT 'PENDING',
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "checkInCodeHash" CHAR(64),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" VARCHAR(8),
    "position" "PlayerPosition",
    "status" "ParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "confirmedAt" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchLineupEntry" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" VARCHAR(8) NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "isStarter" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchLineupEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "kind" "ConversationKind" NOT NULL,
    "scopeRefId" TEXT,
    "title" VARCHAR(120) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMember" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "clientId" UUID NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "kind" "MessageKind" NOT NULL DEFAULT 'TEXT',
    "text" VARCHAR(2000) NOT NULL,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerReview" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "tags" "ReviewTag"[],
    "comment" VARCHAR(500) NOT NULL DEFAULT '',
    "verifiedAttendance" BOOLEAN NOT NULL DEFAULT false,
    "visibleAt" TIMESTAMP(3),
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingPeriod" (
    "id" TEXT NOT NULL,
    "kind" "RankingPeriodKind" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingEntry" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locality" VARCHAR(80) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1000,
    "position" INTEGER,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingEvent" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT,
    "kind" "RankingEventKind" NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "idempotencyKey" UUID NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsLedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "PointsEventKind" NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceType" VARCHAR(40),
    "referenceId" TEXT,
    "idempotencyKey" UUID NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "sponsor" VARCHAR(100) NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "category" VARCHAR(60) NOT NULL,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "pointsSpent" INTEGER NOT NULL,
    "idempotencyKey" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "cadence" "TournamentCadence" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "format" "MatchFormat" NOT NULL,
    "locality" VARCHAR(80) NOT NULL,
    "registrationOpensAt" TIMESTAMP(3) NOT NULL,
    "registrationClosesAt" TIMESTAMP(3) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "maxTeams" INTEGER NOT NULL,
    "rosterLimit" INTEGER NOT NULL DEFAULT 12,
    "entryFeeMinor" INTEGER NOT NULL DEFAULT 0,
    "prizePoolMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'ARS',
    "rules" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentEntry" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "status" "TournamentEntryStatus" NOT NULL DEFAULT 'PENDING',
    "seed" INTEGER,
    "rosterSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentGame" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchId" TEXT,
    "round" VARCHAR(40) NOT NULL,
    "bracketSlot" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueReview" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(500) NOT NULL DEFAULT '',
    "verifiedAttendance" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'HOLD',
    "holdExpiresAt" TIMESTAMP(3),
    "totalMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'ARS',
    "externalRef" VARCHAR(160),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "providerCustomerId" VARCHAR(160),
    "providerPurchaseId" VARCHAR(200) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "kind" "FeedPostKind" NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "matchId" TEXT,
    "teamId" TEXT,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FeedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "ReactionKind" NOT NULL DEFAULT 'LIKE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FeedComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "inviteeId" TEXT,
    "fingerprintHash" CHAR(64),
    "status" "ReferralStatus" NOT NULL DEFAULT 'CLICKED',
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qualifiedAt" TIMESTAMP(3),
    "rewardedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoShowEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" VARCHAR(500),
    "confirmedBy" TEXT,
    "appealedAt" TIMESTAMP(3),
    "appealReason" VARCHAR(1000),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoShowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suspension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SuspensionStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" VARCHAR(500) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "liftedAt" TIMESTAMP(3),
    "appealedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suspension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "category" "ReportCategory" NOT NULL,
    "targetType" VARCHAR(40) NOT NULL,
    "targetId" TEXT,
    "detail" VARCHAR(2000) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "AuthPlatform" NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "tokenCiphertext" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" VARCHAR(300) NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrizeChallenge" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT,
    "matchId" TEXT,
    "status" "PrizeChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "entryMinor" INTEGER NOT NULL,
    "platformFeeMinor" INTEGER NOT NULL,
    "prizePoolMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'ARS',
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "complianceSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrizeChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'ARS',
    "status" VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerTransaction" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT,
    "kind" VARCHAR(40) NOT NULL,
    "idempotencyKey" UUID NOT NULL,
    "externalReference" VARCHAR(180),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "direction" "LedgerDirection" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" UUID NOT NULL,
    "operation" VARCHAR(80) NOT NULL,
    "requestHash" CHAR(64) NOT NULL,
    "responseCode" INTEGER,
    "responseBody" JSONB,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAuditEvent" (
    "id" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT,
    "sessionId" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "outcome" VARCHAR(32) NOT NULL,
    "targetType" VARCHAR(60),
    "targetId" TEXT,
    "requestId" VARCHAR(80),
    "ipHash" CHAR(64),
    "userAgentHash" CHAR(64),
    "metadata" JSONB,
    "previousHash" CHAR(64),
    "eventHash" CHAR(64) NOT NULL,

    CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_createdAt_idx" ON "User"("status", "createdAt");

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");

-- CreateIndex
CREATE INDEX "OAuthIdentity_userId_idx" ON "OAuthIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthIdentity_provider_providerSub_key" ON "OAuthIdentity"("provider", "providerSub");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_revokedAt_expiresAt_idx" ON "Session"("userId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_revokedAt_idx" ON "Session"("expiresAt", "revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE INDEX "PlayerProfile_locality_skillLevel_primaryPosition_idx" ON "PlayerProfile"("locality", "skillLevel", "primaryPosition");

-- CreateIndex
CREATE INDEX "PlayerProfile_reliabilityScore_ratingAverage_idx" ON "PlayerProfile"("reliabilityScore", "ratingAverage");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE INDEX "Team_locality_format_rankPoints_idx" ON "Team"("locality", "format", "rankPoints");

-- CreateIndex
CREATE INDEX "TeamMember_userId_status_idx" ON "TeamMember"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE INDEX "Venue_locality_isVerified_ratingAverage_idx" ON "Venue"("locality", "isVerified", "ratingAverage");

-- CreateIndex
CREATE INDEX "VenueField_venueId_format_active_idx" ON "VenueField"("venueId", "format", "active");

-- CreateIndex
CREATE INDEX "Lobby_status_locality_startsAt_idx" ON "Lobby"("status", "locality", "startsAt");

-- CreateIndex
CREATE INDEX "Lobby_organizerId_status_startsAt_idx" ON "Lobby"("organizerId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "LobbyParticipant_userId_status_createdAt_idx" ON "LobbyParticipant"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LobbyParticipant_lobbyId_status_idx" ON "LobbyParticipant"("lobbyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LobbyParticipant_lobbyId_userId_key" ON "LobbyParticipant"("lobbyId", "userId");

-- CreateIndex
CREATE INDEX "PlayerInvite_recipientId_status_expiresAt_idx" ON "PlayerInvite"("recipientId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "PlayerInvite_senderId_status_createdAt_idx" ON "PlayerInvite"("senderId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerInvite_senderId_recipientId_contextKey_key" ON "PlayerInvite"("senderId", "recipientId", "contextKey");

-- CreateIndex
CREATE UNIQUE INDEX "Match_lobbyId_key" ON "Match"("lobbyId");

-- CreateIndex
CREATE INDEX "Match_status_startsAt_idx" ON "Match"("status", "startsAt");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_startsAt_idx" ON "Match"("homeTeamId", "startsAt");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_startsAt_idx" ON "Match"("awayTeamId", "startsAt");

-- CreateIndex
CREATE INDEX "MatchParticipant_userId_status_createdAt_idx" ON "MatchParticipant"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MatchParticipant_matchId_status_idx" ON "MatchParticipant"("matchId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_matchId_userId_key" ON "MatchParticipant"("matchId", "userId");

-- CreateIndex
CREATE INDEX "MatchLineupEntry_matchId_side_isStarter_order_idx" ON "MatchLineupEntry"("matchId", "side", "isStarter", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MatchLineupEntry_matchId_userId_key" ON "MatchLineupEntry"("matchId", "userId");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_kind_scopeRefId_key" ON "Conversation"("kind", "scopeRefId");

-- CreateIndex
CREATE INDEX "ConversationMember_userId_leftAt_lastReadAt_idx" ON "ConversationMember"("userId", "leftAt", "lastReadAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMember_conversationId_userId_key" ON "ConversationMember"("conversationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_clientId_key" ON "Message"("clientId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerReview_reviewedId_visibleAt_createdAt_idx" ON "PlayerReview"("reviewedId", "visibleAt", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerReview_reviewerId_createdAt_idx" ON "PlayerReview"("reviewerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerReview_matchId_reviewerId_reviewedId_key" ON "PlayerReview"("matchId", "reviewerId", "reviewedId");

-- CreateIndex
CREATE INDEX "RankingPeriod_kind_startsAt_endsAt_idx" ON "RankingPeriod"("kind", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "RankingPeriod_kind_startsAt_endsAt_key" ON "RankingPeriod"("kind", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "RankingEntry_periodId_locality_points_idx" ON "RankingEntry"("periodId", "locality", "points");

-- CreateIndex
CREATE INDEX "RankingEntry_userId_updatedAt_idx" ON "RankingEntry"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RankingEntry_periodId_userId_key" ON "RankingEntry"("periodId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingEvent_idempotencyKey_key" ON "RankingEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "RankingEvent_periodId_userId_createdAt_idx" ON "RankingEvent"("periodId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "RankingEvent_matchId_idx" ON "RankingEvent"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "PointsLedgerEntry_idempotencyKey_key" ON "PointsLedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PointsLedgerEntry_userId_createdAt_idx" ON "PointsLedgerEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PointsLedgerEntry_referenceType_referenceId_idx" ON "PointsLedgerEntry"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "Reward_active_pointsCost_idx" ON "Reward"("active", "pointsCost");

-- CreateIndex
CREATE UNIQUE INDEX "RewardRedemption_idempotencyKey_key" ON "RewardRedemption"("idempotencyKey");

-- CreateIndex
CREATE INDEX "RewardRedemption_userId_status_createdAt_idx" ON "RewardRedemption"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "RewardRedemption_rewardId_status_idx" ON "RewardRedemption"("rewardId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_status_registrationOpensAt_startsAt_idx" ON "Tournament"("status", "registrationOpensAt", "startsAt");

-- CreateIndex
CREATE INDEX "Tournament_locality_format_startsAt_idx" ON "Tournament"("locality", "format", "startsAt");

-- CreateIndex
CREATE INDEX "TournamentEntry_tournamentId_status_seed_idx" ON "TournamentEntry"("tournamentId", "status", "seed");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntry_tournamentId_teamId_key" ON "TournamentEntry"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentGame_matchId_key" ON "TournamentGame"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentGame_tournamentId_round_bracketSlot_key" ON "TournamentGame"("tournamentId", "round", "bracketSlot");

-- CreateIndex
CREATE INDEX "VenueReview_venueId_moderationStatus_createdAt_idx" ON "VenueReview"("venueId", "moderationStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VenueReview_venueId_matchId_userId_key" ON "VenueReview"("venueId", "matchId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_externalRef_key" ON "Booking"("externalRef");

-- CreateIndex
CREATE INDEX "Booking_fieldId_startsAt_endsAt_status_idx" ON "Booking"("fieldId", "startsAt", "endsAt", "status");

-- CreateIndex
CREATE INDEX "Booking_userId_status_startsAt_idx" ON "Booking"("userId", "status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerPurchaseId_key" ON "Subscription"("providerPurchaseId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_currentPeriodEnd_idx" ON "Subscription"("userId", "status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "FeedPost_moderationStatus_createdAt_idx" ON "FeedPost"("moderationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "FeedPost_authorId_createdAt_idx" ON "FeedPost"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedPost_matchId_idx" ON "FeedPost"("matchId");

-- CreateIndex
CREATE INDEX "FeedPost_teamId_idx" ON "FeedPost"("teamId");

-- CreateIndex
CREATE INDEX "FeedReaction_userId_createdAt_idx" ON "FeedReaction"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeedReaction_postId_userId_key" ON "FeedReaction"("postId", "userId");

-- CreateIndex
CREATE INDEX "FeedComment_postId_createdAt_idx" ON "FeedComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedComment_userId_createdAt_idx" ON "FeedComment"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");

-- CreateIndex
CREATE INDEX "ReferralCode_ownerId_active_idx" ON "ReferralCode"("ownerId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_inviteeId_key" ON "Referral"("inviteeId");

-- CreateIndex
CREATE INDEX "Referral_ownerId_status_createdAt_idx" ON "Referral"("ownerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Referral_codeId_status_idx" ON "Referral"("codeId", "status");

-- CreateIndex
CREATE INDEX "NoShowEvent_userId_createdAt_idx" ON "NoShowEvent"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NoShowEvent_matchId_userId_key" ON "NoShowEvent"("matchId", "userId");

-- CreateIndex
CREATE INDEX "Suspension_userId_status_endsAt_idx" ON "Suspension"("userId", "status", "endsAt");

-- CreateIndex
CREATE INDEX "Report_status_priority_createdAt_idx" ON "Report"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_createdAt_idx" ON "Report"("reportedUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_reporterId_createdAt_idx" ON "Report"("reporterId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushDevice_tokenHash_key" ON "PushDevice"("tokenHash");

-- CreateIndex
CREATE INDEX "PushDevice_userId_platform_revokedAt_idx" ON "PushDevice"("userId", "platform", "revokedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrizeChallenge_lobbyId_key" ON "PrizeChallenge"("lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "PrizeChallenge_matchId_key" ON "PrizeChallenge"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_userId_key" ON "WalletAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerTransaction_idempotencyKey_key" ON "LedgerTransaction"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerTransaction_externalReference_key" ON "LedgerTransaction"("externalReference");

-- CreateIndex
CREATE INDEX "LedgerTransaction_challengeId_createdAt_idx" ON "LedgerTransaction"("challengeId", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountId_createdAt_idx" ON "LedgerEntry"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_transactionId_idx" ON "LedgerEntry"("transactionId");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_expiresAt_idx" ON "IdempotencyRecord"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_userId_key_operation_key" ON "IdempotencyRecord"("userId", "key", "operation");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityAuditEvent_eventHash_key" ON "SecurityAuditEvent"("eventHash");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_occurredAt_idx" ON "SecurityAuditEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_actorUserId_occurredAt_idx" ON "SecurityAuditEvent"("actorUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_action_outcome_occurredAt_idx" ON "SecurityAuditEvent"("action", "outcome", "occurredAt");

-- AddForeignKey
ALTER TABLE "OAuthIdentity" ADD CONSTRAINT "OAuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueField" ADD CONSTRAINT "VenueField_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyParticipant" ADD CONSTRAINT "LobbyParticipant_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyParticipant" ADD CONSTRAINT "LobbyParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyParticipant" ADD CONSTRAINT "LobbyParticipant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInvite" ADD CONSTRAINT "PlayerInvite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInvite" ADD CONSTRAINT "PlayerInvite_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInvite" ADD CONSTRAINT "PlayerInvite_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInvite" ADD CONSTRAINT "PlayerInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineupEntry" ADD CONSTRAINT "MatchLineupEntry_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerReview" ADD CONSTRAINT "PlayerReview_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerReview" ADD CONSTRAINT "PlayerReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerReview" ADD CONSTRAINT "PlayerReview_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingEntry" ADD CONSTRAINT "RankingEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "RankingPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingEntry" ADD CONSTRAINT "RankingEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingEvent" ADD CONSTRAINT "RankingEvent_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "RankingPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingEvent" ADD CONSTRAINT "RankingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingEvent" ADD CONSTRAINT "RankingEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsLedgerEntry" ADD CONSTRAINT "PointsLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGame" ADD CONSTRAINT "TournamentGame_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGame" ADD CONSTRAINT "TournamentGame_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueReview" ADD CONSTRAINT "VenueReview_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueReview" ADD CONSTRAINT "VenueReview_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueReview" ADD CONSTRAINT "VenueReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "VenueField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedPost" ADD CONSTRAINT "FeedPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedReaction" ADD CONSTRAINT "FeedReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedReaction" ADD CONSTRAINT "FeedReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedComment" ADD CONSTRAINT "FeedComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedComment" ADD CONSTRAINT "FeedComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "ReferralCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoShowEvent" ADD CONSTRAINT "NoShowEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoShowEvent" ADD CONSTRAINT "NoShowEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushDevice" ADD CONSTRAINT "PushDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeChallenge" ADD CONSTRAINT "PrizeChallenge_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeChallenge" ADD CONSTRAINT "PrizeChallenge_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "PrizeChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "LedgerTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WalletAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Domain invariants that must remain true even if a future code path bypasses Prisma.
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_ratingAverage_check" CHECK ("ratingAverage" >= 0 AND "ratingAverage" <= 5);
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_ratingCount_check" CHECK ("ratingCount" >= 0);
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_reliabilityScore_check" CHECK ("reliabilityScore" BETWEEN 0 AND 100);
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_maxDistanceKm_check" CHECK ("maxDistanceKm" BETWEEN 1 AND 100);
ALTER TABLE "Team" ADD CONSTRAINT "Team_rankPoints_check" CHECK ("rankPoints" >= 0);
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_ratingAverage_check" CHECK ("ratingAverage" >= 0 AND "ratingAverage" <= 5);
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_ratingCount_check" CHECK ("ratingCount" >= 0);
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_durationMinutes_check" CHECK ("durationMinutes" BETWEEN 30 AND 240);
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_requiredPlayers_check" CHECK ("requiredPlayers" BETWEEN 2 AND 22);
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_pricePerPlayerMinor_check" CHECK ("pricePerPlayerMinor" >= 0);
ALTER TABLE "Match" ADD CONSTRAINT "Match_score_check" CHECK (("homeScore" IS NULL OR "homeScore" >= 0) AND ("awayScore" IS NULL OR "awayScore" >= 0));
ALTER TABLE "Match" ADD CONSTRAINT "Match_timeRange_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt");
ALTER TABLE "PlayerReview" ADD CONSTRAINT "PlayerReview_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "PlayerReview" ADD CONSTRAINT "PlayerReview_distinctUsers_check" CHECK ("reviewerId" <> "reviewedId");
ALTER TABLE "RankingPeriod" ADD CONSTRAINT "RankingPeriod_timeRange_check" CHECK ("endsAt" > "startsAt");
ALTER TABLE "RankingEntry" ADD CONSTRAINT "RankingEntry_totals_check" CHECK ("matches" >= 0 AND "wins" >= 0 AND "draws" >= 0 AND "losses" >= 0 AND "wins" + "draws" + "losses" <= "matches");
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_inventory_check" CHECK ("pointsCost" > 0 AND "stock" >= 0);
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_pointsSpent_check" CHECK ("pointsSpent" > 0);
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_timeRange_check" CHECK ("registrationClosesAt" > "registrationOpensAt" AND "startsAt" >= "registrationClosesAt" AND ("endsAt" IS NULL OR "endsAt" >= "startsAt"));
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_amounts_check" CHECK ("maxTeams" >= 2 AND "rosterLimit" >= 2 AND "entryFeeMinor" >= 0 AND "prizePoolMinor" >= 0);
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_timeRange_check" CHECK ("endsAt" > "startsAt");
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_totalMinor_check" CHECK ("totalMinor" >= 0);
ALTER TABLE "VenueField" ADD CONSTRAINT "VenueField_hourlyPriceMinor_check" CHECK ("hourlyPriceMinor" >= 0);
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_pointsAwarded_check" CHECK ("pointsAwarded" >= 0);
ALTER TABLE "PrizeChallenge" ADD CONSTRAINT "PrizeChallenge_amounts_check" CHECK ("entryMinor" >= 0 AND "platformFeeMinor" >= 0 AND "prizePoolMinor" >= 0 AND "minAge" >= 18);
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_amountMinor_check" CHECK ("amountMinor" > 0);
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_expiry_check" CHECK ("expiresAt" > "createdAt");
ALTER TABLE "PlayerInvite" ADD CONSTRAINT "PlayerInvite_distinctUsers_check" CHECK ("senderId" <> "recipientId");
ALTER TABLE "PlayerInvite" ADD CONSTRAINT "PlayerInvite_singleContext_check" CHECK (NOT ("lobbyId" IS NOT NULL AND "teamId" IS NOT NULL));
ALTER TABLE "PlayerInvite" ADD CONSTRAINT "PlayerInvite_expiry_check" CHECK ("expiresAt" > "createdAt");

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_no_active_overlap"
EXCLUDE USING gist (
  "fieldId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" IN ('HOLD', 'CONFIRMED'));

-- Security and financial logs are append-only. Corrections are represented by new rows.
CREATE FUNCTION prevent_append_only_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Rows in % are append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "SecurityAuditEvent_append_only"
BEFORE UPDATE OR DELETE ON "SecurityAuditEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_mutation();

CREATE TRIGGER "LedgerTransaction_append_only"
BEFORE UPDATE OR DELETE ON "LedgerTransaction"
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_mutation();

CREATE TRIGGER "LedgerEntry_append_only"
BEFORE UPDATE OR DELETE ON "LedgerEntry"
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_mutation();

-- Every financial transaction must balance debits and credits per currency at commit.
CREATE FUNCTION enforce_balanced_ledger_transaction() RETURNS trigger AS $$
DECLARE
  checked_transaction_id TEXT;
BEGIN
  checked_transaction_id := COALESCE(NEW."transactionId", OLD."transactionId");

  IF EXISTS (
    SELECT 1
    FROM "LedgerEntry"
    WHERE "transactionId" = checked_transaction_id
    GROUP BY "currency"
    HAVING SUM(CASE WHEN "direction" = 'CREDIT' THEN "amountMinor" ELSE -"amountMinor" END) <> 0
  ) THEN
    RAISE EXCEPTION 'Unbalanced ledger transaction %', checked_transaction_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "LedgerEntry_balanced_transaction"
AFTER INSERT OR UPDATE OR DELETE ON "LedgerEntry"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION enforce_balanced_ledger_transaction();
