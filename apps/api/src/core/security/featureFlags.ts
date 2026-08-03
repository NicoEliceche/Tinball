import { env } from '../config/env.js';
export const featureFlags = {
  prizeLobbies: env.ENABLE_PRIZE_LOBBIES,
  referralPayouts: env.ENABLE_REFERRAL_PAYOUTS,
  venueBookings: env.ENABLE_VENUE_BOOKINGS,
  premiumPurchases: env.ENABLE_PREMIUM_PURCHASES,
} as const;

