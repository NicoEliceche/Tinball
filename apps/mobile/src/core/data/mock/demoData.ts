import type { Lobby } from '../../types/lobby.types';
import type { Match, Team } from '../../types/match.types';
import type { Player, PlayerReview } from '../../types/player.types';
import type { RankingEntry, Reward, Venue } from '../../types/ranking.types';
import type { ChatMessage, Conversation, FeedPost } from '../../types/social.types';

const avatars = {
  nico: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=320&auto=format&fit=crop',
  mateo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=320&auto=format&fit=crop',
  sofia: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop',
  lucas: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&auto=format&fit=crop',
  julieta: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop',
  tomas: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop',
} as const;

export const demoPlayers: Player[] = [
  {
    id: 'player-mateo', displayName: 'Mateo Ríos', age: 27, avatarUrl: avatars.mateo,
    locality: 'Palermo', distanceKm: 2.4, primaryPosition: 'GOALKEEPER', secondaryPositions: [],
    skillLevel: 'ADVANCED', preferredFoot: 'RIGHT', rating: 4.8, reviewCount: 39, reliability: 98,
    rankPoints: 1840, matchesPlayed: 63, winRate: 62, bio: 'Arquero de futsal. Salgo jugando y llego siempre con tiempo.',
    tags: ['Puntual', 'Comunicativo', 'Buenos reflejos'], isPremium: true, isVerified: true,
  },
  {
    id: 'player-sofia', displayName: 'Sofía Benítez', age: 24, avatarUrl: avatars.sofia,
    locality: 'Caballito', distanceKm: 4.1, primaryPosition: 'MIDFIELDER', secondaryPositions: ['WINGER'],
    skillLevel: 'INTERMEDIATE', preferredFoot: 'LEFT', rating: 4.9, reviewCount: 28, reliability: 100,
    rankPoints: 1715, matchesPlayed: 47, winRate: 57, bio: 'Volante zurda, juego simple y corro todo el partido.',
    tags: ['Juego limpio', 'Compañera', 'Buen pase'], isPremium: false, isVerified: true,
  },
  {
    id: 'player-lucas', displayName: 'Lucas Ferreyra', age: 31, avatarUrl: avatars.lucas,
    locality: 'Villa Crespo', distanceKm: 3.7, primaryPosition: 'DEFENDER', secondaryPositions: ['FULLBACK'],
    skillLevel: 'ADVANCED', preferredFoot: 'RIGHT', rating: 4.6, reviewCount: 52, reliability: 96,
    rankPoints: 1922, matchesPlayed: 81, winRate: 65, bio: 'Central fuerte, ordeno la defensa y no protesto.',
    tags: ['Capitán', 'Fair play', 'Ordenado'], isPremium: true, isVerified: true,
  },
  {
    id: 'player-julieta', displayName: 'Julieta Paz', age: 29, avatarUrl: avatars.julieta,
    locality: 'Almagro', distanceKm: 5.2, primaryPosition: 'FORWARD', secondaryPositions: ['WINGER'],
    skillLevel: 'COMPETITIVE', preferredFoot: 'BOTH', rating: 4.7, reviewCount: 61, reliability: 99,
    rankPoints: 2146, matchesPlayed: 96, winRate: 68, bio: 'Delantera rápida. Disponible martes y jueves después de las 20.',
    tags: ['Goleadora', 'Puntual', 'Intensa'], isPremium: false, isVerified: true,
  },
];

export const demoLobbies: Lobby[] = [
  {
    id: 'lobby-1', title: 'Falta arquero para hoy', organizerName: 'Nico E.', organizerAvatar: avatars.nico,
    mode: 'NEED_ONE', format: 'SEVEN_A_SIDE', locality: 'Palermo', venueName: 'El Andén Fútbol',
    startsAt: '2026-08-02T21:00:00-03:00', durationMinutes: 60, joinedPlayers: 13, requiredPlayers: 14,
    positionsNeeded: ['GOALKEEPER'], skillMin: 'INTERMEDIATE', skillMax: 'ADVANCED',
    pricePerPlayerMinor: 750000, currency: 'ARS', commitmentScore: 97, premiumOnly: false, status: 'OPEN',
    notes: 'Cancha techada. Llegar 20 minutos antes para dividir equipos.',
  },
  {
    id: 'lobby-2', title: 'Fútbol 5 mixto — cupos abiertos', organizerName: 'Sofía B.', organizerAvatar: avatars.sofia,
    mode: 'OPEN', format: 'FIVE_A_SIDE', locality: 'Caballito', venueName: 'Parque Rivadavia F5',
    startsAt: '2026-08-04T20:30:00-03:00', durationMinutes: 60, joinedPlayers: 7, requiredPlayers: 10,
    positionsNeeded: ['DEFENDER', 'MIDFIELDER', 'FORWARD'], skillMin: 'RECREATIONAL', skillMax: 'INTERMEDIATE',
    pricePerPlayerMinor: 620000, currency: 'ARS', commitmentScore: 100, premiumOnly: false, status: 'OPEN',
    notes: 'Partido recreativo y respetuoso. Equipos mixtos y parejos.',
  },
  {
    id: 'lobby-3', title: 'Los del Parque buscan rival', organizerName: 'Lucas F.', organizerAvatar: avatars.lucas,
    mode: 'PREMADE', format: 'SEVEN_A_SIDE', locality: 'Villa Crespo', venueName: 'Atlanta Center',
    startsAt: '2026-08-08T19:00:00-03:00', durationMinutes: 70, joinedPlayers: 14, requiredPlayers: 14,
    positionsNeeded: [], skillMin: 'ADVANCED', skillMax: 'COMPETITIVE', pricePerPlayerMinor: 900000,
    currency: 'ARS', commitmentScore: 96, premiumOnly: true, status: 'FULL',
    notes: 'Buscamos equipo serio, con camisetas y puntualidad.',
  },
];

const matchPlayers = [
  { id: 'demo-user', displayName: 'Nico E.', avatarUrl: avatars.nico, position: 'MIDFIELDER' as const, status: 'CONFIRMED' as const, isStarter: true },
  { id: 'player-mateo', displayName: 'Mateo R.', avatarUrl: avatars.mateo, position: 'GOALKEEPER' as const, status: 'CONFIRMED' as const, isStarter: true },
  { id: 'player-lucas', displayName: 'Lucas F.', avatarUrl: avatars.lucas, position: 'DEFENDER' as const, status: 'CONFIRMED' as const, isStarter: true },
  { id: 'player-sofia', displayName: 'Sofía B.', avatarUrl: avatars.sofia, position: 'MIDFIELDER' as const, status: 'PENDING' as const, isStarter: false },
];

export const demoMatches: Match[] = [
  {
    id: 'match-1', title: 'Fecha 8 — Liga Tinball', homeTeam: 'Los del Parque', awayTeam: 'Barrio Norte',
    format: 'SEVEN_A_SIDE', startsAt: '2026-08-04T21:00:00-03:00', venueName: 'El Andén Fútbol',
    locality: 'Palermo', status: 'CONFIRMED', conversationId: 'chat-match-1', canManage: true, players: matchPlayers,
  },
  {
    id: 'match-2', title: 'Amistoso del jueves', homeTeam: 'Sin Apuro FC', awayTeam: 'Los del Parque',
    homeScore: 3, awayScore: 5, format: 'FIVE_A_SIDE', startsAt: '2026-07-30T20:00:00-03:00',
    venueName: 'Open Gallo', locality: 'Almagro', status: 'COMPLETED', resultStatus: 'CONFIRMED', conversationId: 'chat-match-2', canManage: true, players: matchPlayers.map((player) => ({ ...player, checkedIn: player.status === 'CONFIRMED' && player.id !== 'player-lucas' })),
  },
  {
    id: 'match-3', title: 'Semifinal Apertura', homeTeam: 'Los del Parque', awayTeam: 'La 12 Bis',
    homeScore: 2, awayScore: 2, format: 'SEVEN_A_SIDE', startsAt: '2026-07-19T18:00:00-03:00',
    venueName: 'Atlanta Center', locality: 'Villa Crespo', status: 'COMPLETED', resultStatus: 'CONFIRMED', conversationId: 'chat-match-3', canManage: true, players: matchPlayers.map((player) => ({ ...player, checkedIn: player.status === 'CONFIRMED' })),
  },
];

export const demoTeams: Team[] = [
  {
    id: 'team-1', name: 'Los del Parque', crestColor: '#2FD05A', locality: 'Palermo', memberCount: 11,
    format: 'SEVEN_A_SIDE', wins: 14, losses: 4, draws: 3, rankPoints: 2350, isVerified: true, canManage: true, conversationId: 'chat-team-1', members: matchPlayers,
  },
];

export const demoFeed: FeedPost[] = [
  {
    id: 'post-1', authorName: 'Los del Parque', authorAvatar: avatars.lucas, authorBadge: 'Equipo verificado',
    body: 'Partidazo y remontada en el segundo tiempo. Seguimos invictos este mes.', kind: 'RESULT',
    createdAt: '2026-08-02T09:15:00-03:00', likes: 48, comments: 9, liked: false,
    matchScore: '5 — 3', matchLabel: 'vs. Sin Apuro FC · Resultado verificado',
  },
  {
    id: 'post-2', authorName: 'Julieta Paz', authorAvatar: avatars.julieta,
    body: 'Busco equipo de fútbol 7 competitivo por Almagro o Caballito. Juego de 9 o por afuera.',
    kind: 'LOOKING_FOR_PLAYERS', createdAt: '2026-08-01T19:40:00-03:00', likes: 21, comments: 6, liked: true,
  },
  {
    id: 'post-3', authorName: 'Sofía Benítez', authorAvatar: avatars.sofia,
    body: 'Llegué a 50 partidos verificados en Tinball. Gracias a todos los equipos que me abrieron la puerta.',
    kind: 'ACHIEVEMENT', createdAt: '2026-08-01T12:10:00-03:00', likes: 76, comments: 14, liked: false,
  },
];

export const demoRankings: RankingEntry[] = [
  { position: 1, userId: 'player-julieta', displayName: 'Julieta Paz', avatarUrl: avatars.julieta, locality: 'Almagro', rankPoints: 2146, movement: 2, matches: 12 },
  { position: 2, userId: 'player-lucas', displayName: 'Lucas Ferreyra', avatarUrl: avatars.lucas, locality: 'Villa Crespo', rankPoints: 1922, movement: 0, matches: 10 },
  { position: 3, userId: 'player-mateo', displayName: 'Mateo Ríos', avatarUrl: avatars.mateo, locality: 'Palermo', rankPoints: 1840, movement: 1, matches: 11 },
  { position: 4, userId: 'demo-user', displayName: 'Nico E.', avatarUrl: avatars.nico, locality: 'Palermo', rankPoints: 1784, movement: 3, matches: 9 },
  { position: 5, userId: 'player-sofia', displayName: 'Sofía Benítez', avatarUrl: avatars.sofia, locality: 'Caballito', rankPoints: 1715, movement: -2, matches: 8 },
  { position: 6, userId: 'player-tomas', displayName: 'Tomás Acosta', avatarUrl: avatars.tomas, locality: 'Belgrano', rankPoints: 1688, movement: 1, matches: 10 },
];

export const demoReviews: PlayerReview[] = [
  { id: 'review-1', authorName: 'Mateo R.', rating: 5, tags: ['Puntual', 'Compañero'], comment: 'Ordenó el medio y avisó con tiempo que llegaba justo.', matchLabel: 'Los del Parque vs. Sin Apuro', createdAt: '2026-07-31T10:00:00-03:00', verifiedAttendance: true },
  { id: 'review-2', authorName: 'Sofía B.', rating: 4, tags: ['Juego limpio', 'Buen pase'], comment: 'Muy buen compañero. Siempre buscó el pase simple.', matchLabel: 'Amistoso en Caballito', createdAt: '2026-07-22T18:00:00-03:00', verifiedAttendance: true },
];

export const demoRewards: Reward[] = [
  { id: 'reward-1', title: 'Pelota oficial N°5', sponsor: 'YPF', points: 4500, stock: 8, category: 'Equipamiento' },
  { id: 'reward-2', title: '50% en una hora de cancha', sponsor: 'El Andén', points: 1800, stock: 24, category: 'Canchas' },
  { id: 'reward-3', title: 'Camiseta de entrenamiento', sponsor: 'SportClub', points: 3200, stock: 12, category: 'Indumentaria' },
];

export const demoVenues: Venue[] = [
  { id: 'venue-1', name: 'El Andén Fútbol', locality: 'Palermo', address: 'Av. Córdoba 5210', rating: 4.8, reviewCount: 126, formats: ['F5', 'F7'], surface: 'Sintético', priceLabel: '$$ · desde $7.500/jugador', sponsored: true },
  { id: 'venue-2', name: 'Atlanta Center', locality: 'Villa Crespo', address: 'Humboldt 540', rating: 4.6, reviewCount: 89, formats: ['F7', 'F8'], surface: 'Sintético', priceLabel: '$$ · desde $8.200/jugador', sponsored: false },
  { id: 'venue-3', name: 'Open Gallo', locality: 'Almagro', address: 'Gallo 680', rating: 4.5, reviewCount: 64, formats: ['F5'], surface: 'Sintético techado', priceLabel: '$ · desde $6.000/jugador', sponsored: false },
];

export const demoConversations: Conversation[] = [
  { id: 'chat-team-1', title: 'Los del Parque', subtitle: 'Lucas: llevo las pecheras', unreadCount: 3, updatedAt: '2026-08-02T10:42:00-03:00', kind: 'TEAM' },
  { id: 'chat-match-1', title: 'Fecha 8 — Liga Tinball', subtitle: 'Mateo: confirmado para el martes', unreadCount: 1, updatedAt: '2026-08-02T09:20:00-03:00', kind: 'MATCH' },
  { id: 'chat-lobby-1', title: 'Falta arquero para hoy', subtitle: 'Nico: nos falta uno y cerramos', unreadCount: 0, updatedAt: '2026-08-01T22:14:00-03:00', kind: 'LOBBY' },
];

export const demoMessages: Record<string, ChatMessage[]> = {
  'chat-team-1': [
    { id: 'm1', clientId: 'm1', senderId: 'player-lucas', senderName: 'Lucas', text: '¿Quién lleva las pecheras?', createdAt: '2026-08-02T10:35:00-03:00', status: 'SENT' },
    { id: 'm2', clientId: 'm2', senderId: 'demo-user', senderName: 'Nico', text: 'Tengo las verdes. Llevo también dos pelotas.', createdAt: '2026-08-02T10:39:00-03:00', status: 'SENT' },
    { id: 'm3', clientId: 'm3', senderId: 'player-lucas', senderName: 'Lucas', text: 'Perfecto, yo llevo las suplentes.', createdAt: '2026-08-02T10:42:00-03:00', status: 'SENT' },
  ],
  'chat-match-1': [
    { id: 'm4', clientId: 'm4', senderId: 'player-mateo', senderName: 'Mateo', text: 'Confirmado para el martes. Llego 20:40.', createdAt: '2026-08-02T09:20:00-03:00', status: 'SENT' },
  ],
};
