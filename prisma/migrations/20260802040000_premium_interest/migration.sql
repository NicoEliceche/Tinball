CREATE TABLE "PremiumInterest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "AuthPlatform" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumInterest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PremiumInterest_userId_key" ON "PremiumInterest"("userId");
ALTER TABLE "PremiumInterest" ADD CONSTRAINT "PremiumInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
