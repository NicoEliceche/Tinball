-- Preserve one independently attributable score declaration per side.
CREATE TABLE "MatchResultSubmission" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "submittedById" TEXT,
    "side" VARCHAR(8) NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchResultSubmission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MatchResultSubmission_side" CHECK ("side" IN ('HOME', 'AWAY')),
    CONSTRAINT "MatchResultSubmission_scores" CHECK ("homeScore" BETWEEN 0 AND 99 AND "awayScore" BETWEEN 0 AND 99)
);

CREATE UNIQUE INDEX "MatchResultSubmission_matchId_side_key" ON "MatchResultSubmission"("matchId", "side");
CREATE INDEX "MatchResultSubmission_submittedById_createdAt_idx" ON "MatchResultSubmission"("submittedById", "createdAt");
ALTER TABLE "MatchResultSubmission" ADD CONSTRAINT "MatchResultSubmission_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchResultSubmission" ADD CONSTRAINT "MatchResultSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
