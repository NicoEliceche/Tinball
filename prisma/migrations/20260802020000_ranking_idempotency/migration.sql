-- A confirmed match may affect each player's sport rank and loyalty balance only once.
CREATE UNIQUE INDEX "RankingEvent_periodId_userId_matchId_kind_key" ON "RankingEvent"("periodId", "userId", "matchId", "kind");
CREATE UNIQUE INDEX "PointsLedgerEntry_userId_kind_referenceType_referenceId_key" ON "PointsLedgerEntry"("userId", "kind", "referenceType", "referenceId");
