import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);
const addDays = (date: Date, days: number) => addHours(date, days * 24);

const ids = {
  nico: 'seed_user_nico',
  mati: 'seed_user_mati',
  sofia: 'seed_user_sofia',
  joaco: 'seed_user_joaco',
  lucas: 'seed_user_lucas',
  lobos: 'seed_team_lobos',
  deportivo: 'seed_team_deportivo',
  venue: 'seed_venue_potrero',
  field: 'seed_field_potrero_1',
  match: 'seed_match_clasico',
  conversation: 'seed_conversation_match',
} as const;

async function main() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  await prisma.user.createMany({
    data: [
      { id: ids.nico, email: 'nico.demo@tinball.app', displayName: 'Nico Eliceche', onboardingComplete: true },
      { id: ids.mati, email: 'mati.demo@tinball.app', displayName: 'Mati Suárez', onboardingComplete: true },
      { id: ids.sofia, email: 'sofia.demo@tinball.app', displayName: 'Sofi Benítez', onboardingComplete: true },
      { id: ids.joaco, email: 'joaco.demo@tinball.app', displayName: 'Joaco Ruiz', onboardingComplete: true },
      { id: ids.lucas, email: 'lucas.demo@tinball.app', displayName: 'Lucas Ferreyra', onboardingComplete: true },
    ],
    skipDuplicates: true,
  });

  const profiles = [
    { userId: ids.nico, birthDate: new Date('1998-05-12'), locality: 'Palermo', province: 'Buenos Aires', primaryPosition: 'MIDFIELDER' as const, secondaryPositions: ['WINGER' as const], skillLevel: 'ADVANCED' as const, preferredFoot: 'RIGHT' as const, bio: 'Volante mixto. Presión alta, pase corto y tercer tiempo.', ratingAverage: 4.8, ratingCount: 42, reliabilityScore: 98 },
    { userId: ids.mati, birthDate: new Date('1996-09-22'), locality: 'Belgrano', province: 'Buenos Aires', primaryPosition: 'FORWARD' as const, secondaryPositions: ['WINGER' as const], skillLevel: 'ADVANCED' as const, preferredFoot: 'LEFT' as const, bio: 'Delantero zurdo, juego de espaldas y definición.', ratingAverage: 4.7, ratingCount: 38, reliabilityScore: 96 },
    { userId: ids.sofia, birthDate: new Date('1999-03-18'), locality: 'Palermo', province: 'Buenos Aires', primaryPosition: 'GOALKEEPER' as const, secondaryPositions: [], skillLevel: 'COMPETITIVE' as const, preferredFoot: 'RIGHT' as const, bio: 'Arquera. Ordeno desde el fondo y salgo jugando.', ratingAverage: 4.9, ratingCount: 51, reliabilityScore: 100 },
    { userId: ids.joaco, birthDate: new Date('2000-11-04'), locality: 'Villa Crespo', province: 'Buenos Aires', primaryPosition: 'DEFENDER' as const, secondaryPositions: ['FULLBACK' as const], skillLevel: 'INTERMEDIATE' as const, preferredFoot: 'BOTH' as const, bio: 'Central fuerte y simple. Siempre llego temprano.', ratingAverage: 4.5, ratingCount: 27, reliabilityScore: 95 },
    { userId: ids.lucas, birthDate: new Date('1997-07-29'), locality: 'Caballito', province: 'Buenos Aires', primaryPosition: 'WINGER' as const, secondaryPositions: ['FORWARD' as const], skillLevel: 'ADVANCED' as const, preferredFoot: 'RIGHT' as const, bio: 'Extremo rápido, encaro y vuelvo a marcar.', ratingAverage: 4.6, ratingCount: 34, reliabilityScore: 97 },
  ];

  for (const profile of profiles) {
    await prisma.playerProfile.upsert({
      where: { userId: profile.userId },
      create: profile,
      update: profile,
    });
    await prisma.userSettings.upsert({
      where: { userId: profile.userId },
      create: { userId: profile.userId },
      update: {},
    });
  }

  await prisma.team.upsert({
    where: { slug: 'lobos-del-sur' },
    create: { id: ids.lobos, name: 'Lobos del Sur', slug: 'lobos-del-sur', locality: 'Palermo', format: 'SEVEN_A_SIDE', crestColor: '#15D36F', rankPoints: 1288, isVerified: true },
    update: { rankPoints: 1288 },
  });
  await prisma.team.upsert({
    where: { slug: 'deportivo-palermo' },
    create: { id: ids.deportivo, name: 'Deportivo Palermo', slug: 'deportivo-palermo', locality: 'Palermo', format: 'SEVEN_A_SIDE', crestColor: '#F4C542', rankPoints: 1214 },
    update: { rankPoints: 1214 },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: ids.lobos, userId: ids.nico, role: 'CAPTAIN', status: 'ACTIVE', joinedAt: addDays(now, -180) },
      { teamId: ids.lobos, userId: ids.sofia, role: 'ADMIN', status: 'ACTIVE', joinedAt: addDays(now, -170) },
      { teamId: ids.lobos, userId: ids.joaco, role: 'PLAYER', status: 'ACTIVE', joinedAt: addDays(now, -120) },
      { teamId: ids.deportivo, userId: ids.mati, role: 'CAPTAIN', status: 'ACTIVE', joinedAt: addDays(now, -160) },
      { teamId: ids.deportivo, userId: ids.lucas, role: 'PLAYER', status: 'ACTIVE', joinedAt: addDays(now, -90) },
    ],
    skipDuplicates: true,
  });

  await prisma.venue.upsert({
    where: { slug: 'el-potrero-arena' },
    create: { id: ids.venue, name: 'El Potrero Arena', slug: 'el-potrero-arena', locality: 'Palermo', province: 'Buenos Aires', address: 'Av. Dorrego 2350', latitude: -34.5779, longitude: -58.4189, surface: 'Sintético', isVerified: true, isSponsored: true, ratingAverage: 4.8, ratingCount: 126 },
    update: { isVerified: true, isSponsored: true },
  });
  await prisma.venueField.upsert({
    where: { id: ids.field },
    create: { id: ids.field, venueId: ids.venue, name: 'Cancha 1', format: 'SEVEN_A_SIDE', hourlyPriceMinor: 9000000, currency: 'ARS' },
    update: { active: true, hourlyPriceMinor: 9000000 },
  });

  const lobbyRows = [
    { id: 'seed_lobby_need_one', organizerId: ids.nico, title: 'Falta un 9 para hoy', mode: 'NEED_ONE' as const, status: 'OPEN' as const, format: 'SEVEN_A_SIDE' as const, locality: 'Palermo', venueId: ids.venue, startsAt: addHours(now, 6), durationMinutes: 60, requiredPlayers: 14, skillMin: 'INTERMEDIATE' as const, skillMax: 'COMPETITIVE' as const, positionsNeeded: ['FORWARD' as const], pricePerPlayerMinor: 6500, notes: 'Partido intenso pero limpio. Traer pechera clara.' },
    { id: 'seed_lobby_open', organizerId: ids.sofia, title: 'Fútbol mixto del domingo', mode: 'OPEN' as const, status: 'OPEN' as const, format: 'FIVE_A_SIDE' as const, locality: 'Villa Crespo', startsAt: addDays(now, 2), durationMinutes: 60, requiredPlayers: 10, skillMin: 'RECREATIONAL' as const, skillMax: 'ADVANCED' as const, positionsNeeded: ['DEFENDER' as const, 'MIDFIELDER' as const], pricePerPlayerMinor: 5000, notes: 'Buena onda, puntualidad y tercer tiempo.' },
    { id: 'seed_lobby_premade', organizerId: ids.mati, title: 'Lobos vs. premade', mode: 'PREMADE' as const, status: 'OPEN' as const, format: 'SEVEN_A_SIDE' as const, locality: 'Belgrano', startsAt: addDays(now, 4), durationMinutes: 70, requiredPlayers: 14, skillMin: 'ADVANCED' as const, skillMax: 'COMPETITIVE' as const, positionsNeeded: [], pricePerPlayerMinor: 8000, premiumOnly: true, notes: 'Buscamos equipo completo con nivel parejo.' },
  ];
  for (const lobby of lobbyRows) {
    await prisma.lobby.upsert({ where: { id: lobby.id }, create: lobby, update: { startsAt: lobby.startsAt, status: lobby.status } });
  }
  await prisma.lobbyParticipant.createMany({
    data: [
      { lobbyId: 'seed_lobby_need_one', userId: ids.nico, position: 'MIDFIELDER', status: 'CONFIRMED', joinedAt: now },
      { lobbyId: 'seed_lobby_need_one', userId: ids.sofia, position: 'GOALKEEPER', status: 'CONFIRMED', joinedAt: now },
      { lobbyId: 'seed_lobby_open', userId: ids.sofia, position: 'GOALKEEPER', status: 'CONFIRMED', joinedAt: now },
      { lobbyId: 'seed_lobby_premade', userId: ids.mati, teamId: ids.deportivo, status: 'CONFIRMED', joinedAt: now },
    ],
    skipDuplicates: true,
  });

  await prisma.match.upsert({
    where: { id: ids.match },
    create: { id: ids.match, creatorId: ids.nico, homeTeamId: ids.lobos, awayTeamId: ids.deportivo, venueId: ids.venue, title: 'Lobos del Sur vs. Deportivo Palermo', format: 'SEVEN_A_SIDE', locality: 'Palermo', startsAt: addDays(now, -2), endsAt: addHours(addDays(now, -2), 1), status: 'COMPLETED', resultStatus: 'CONFIRMED', homeScore: 5, awayScore: 3 },
    update: { status: 'COMPLETED', resultStatus: 'CONFIRMED', homeScore: 5, awayScore: 3 },
  });
  await prisma.matchParticipant.createMany({
    data: [ids.nico, ids.mati, ids.sofia, ids.joaco, ids.lucas].map((userId, index) => ({
      matchId: ids.match,
      userId,
      side: index === 0 || index === 2 || index === 3 ? 'HOME' : 'AWAY',
      status: 'ATTENDED' as const,
      checkedInAt: addHours(addDays(now, -2), -0.15),
      checkedOutAt: addHours(addDays(now, -2), 1.1),
    })),
    skipDuplicates: true,
  });

  const reviewRows = [
    { id: 'seed_review_mati_to_nico', reviewerId: ids.mati, reviewedId: ids.nico, rating: 5, tags: ['FAIR_PLAY' as const, 'TEAM_PLAYER' as const], comment: 'Gran lectura de juego y siempre con buena onda.' },
    { id: 'seed_review_sofia_to_nico', reviewerId: ids.sofia, reviewedId: ids.nico, rating: 5, tags: ['PUNCTUAL' as const, 'COMMUNICATIVE' as const], comment: 'Llegó antes, organizó el equipo y no paró de correr.' },
    { id: 'seed_review_nico_to_mati', reviewerId: ids.nico, reviewedId: ids.mati, rating: 4, tags: ['SKILLED' as const, 'FAIR_PLAY' as const], comment: 'Muy buen nueve, difícil de marcar.' },
  ];
  for (const review of reviewRows) {
    await prisma.playerReview.upsert({
      where: { id: review.id },
      create: { ...review, matchId: ids.match, verifiedAttendance: true, visibleAt: addDays(now, -1), moderationStatus: 'APPROVED' },
      update: { rating: review.rating, comment: review.comment, visibleAt: addDays(now, -1), moderationStatus: 'APPROVED' },
    });
  }

  const period = await prisma.rankingPeriod.upsert({
    where: { kind_startsAt_endsAt: { kind: 'MONTHLY', startsAt: monthStart, endsAt: monthEnd } },
    create: { id: 'seed_ranking_current', kind: 'MONTHLY', startsAt: monthStart, endsAt: monthEnd },
    update: {},
  });
  const rankingRows = [
    { userId: ids.sofia, locality: 'Palermo', points: 1384, position: 1, matches: 19, wins: 15, draws: 2, losses: 2 },
    { userId: ids.nico, locality: 'Palermo', points: 1328, position: 2, matches: 18, wins: 13, draws: 2, losses: 3 },
    { userId: ids.mati, locality: 'Belgrano', points: 1276, position: 3, matches: 17, wins: 11, draws: 3, losses: 3 },
    { userId: ids.lucas, locality: 'Caballito', points: 1210, position: 4, matches: 16, wins: 10, draws: 2, losses: 4 },
    { userId: ids.joaco, locality: 'Villa Crespo', points: 1178, position: 5, matches: 15, wins: 9, draws: 3, losses: 3 },
  ];
  for (const entry of rankingRows) {
    await prisma.rankingEntry.upsert({
      where: { periodId_userId: { periodId: period.id, userId: entry.userId } },
      create: { ...entry, periodId: period.id },
      update: entry,
    });
  }

  await prisma.pointsLedgerEntry.upsert({
    where: { idempotencyKey: 'e47ef2ac-7ea0-48a4-8f38-2d48e6f242a1' }, // gitleaks:allow -- deterministic seed UUID
    create: { userId: ids.nico, kind: 'MATCH_PLAYED', delta: 120, balanceAfter: 2480, referenceType: 'match', referenceId: ids.match, idempotencyKey: 'e47ef2ac-7ea0-48a4-8f38-2d48e6f242a1' }, // gitleaks:allow -- deterministic seed UUID
    update: {},
  });
  await prisma.reward.upsert({
    where: { id: 'seed_reward_ball' },
    create: { id: 'seed_reward_ball', title: 'Pelota de fútbol N°5', description: 'Pelota oficial para tu próximo partido.', sponsor: 'Sponsor demo', pointsCost: 2200, stock: 18, category: 'Equipamiento', active: true },
    update: { stock: 18, active: true },
  });

  await prisma.tournament.upsert({
    where: { slug: 'copa-tinball-agosto' },
    create: { id: 'seed_tournament_august', name: 'Copa Tinball Agosto', slug: 'copa-tinball-agosto', cadence: 'MONTHLY', status: 'REGISTRATION_OPEN', format: 'SEVEN_A_SIDE', locality: 'CABA', registrationOpensAt: addDays(now, -3), registrationClosesAt: addDays(now, 10), startsAt: addDays(now, 14), endsAt: addDays(now, 28), maxTeams: 32, rosterLimit: 12, entryFeeMinor: 5000000, prizePoolMinor: 100000000, rules: 'Formato de grupos y eliminación directa. Fair play y asistencia verificada obligatorios.' },
    update: { registrationClosesAt: addDays(now, 10), startsAt: addDays(now, 14), endsAt: addDays(now, 28) },
  });

  await prisma.conversation.upsert({
    where: { kind_scopeRefId: { kind: 'MATCH', scopeRefId: ids.match } },
    create: { id: ids.conversation, kind: 'MATCH', scopeRefId: ids.match, title: 'Lobos vs. Deportivo' },
    update: { title: 'Lobos vs. Deportivo' },
  });
  await prisma.conversationMember.createMany({
    data: [ids.nico, ids.mati, ids.sofia, ids.joaco, ids.lucas].map((userId) => ({ conversationId: ids.conversation, userId })),
    skipDuplicates: true,
  });
  await prisma.message.createMany({
    data: [
      { clientId: '1ce09b10-a5f8-42ea-992d-bf505f25651f', conversationId: ids.conversation, senderId: ids.nico, text: 'Nos vemos 20:30. Lleguemos quince minutos antes.', moderationStatus: 'APPROVED', createdAt: addDays(now, -3) },
      { clientId: '581604a8-7454-466c-91f2-c754967cc914', conversationId: ids.conversation, senderId: ids.sofia, text: 'Llevo pelota y pecheras verdes.', moderationStatus: 'APPROVED', createdAt: addDays(now, -3) },
    ],
    skipDuplicates: true,
  });

  await prisma.feedPost.upsert({
    where: { id: 'seed_post_result' },
    create: { id: 'seed_post_result', authorId: ids.nico, kind: 'RESULT', body: 'Victoria 5–3 y partidazo en El Potrero. Bien jugado por los dos equipos.', matchId: ids.match, moderationStatus: 'APPROVED', createdAt: addDays(now, -1) },
    update: { body: 'Victoria 5–3 y partidazo en El Potrero. Bien jugado por los dos equipos.' },
  });
  await prisma.feedReaction.upsert({
    where: { postId_userId: { postId: 'seed_post_result', userId: ids.mati } },
    create: { postId: 'seed_post_result', userId: ids.mati, kind: 'FAIR_PLAY' },
    update: {},
  });
  await prisma.referralCode.upsert({
    where: { code: 'NICO10' },
    create: { ownerId: ids.nico, code: 'NICO10' },
    update: { active: true },
  });
  await prisma.notification.upsert({
    where: { id: 'seed_notification_ranking' },
    create: { id: 'seed_notification_ranking', userId: ids.nico, category: 'RANKING', title: 'Subiste al puesto #2', body: 'La victoria te sumó 28 puntos en Palermo.' },
    update: {},
  });

  console.log('Tinball demo data is ready.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
