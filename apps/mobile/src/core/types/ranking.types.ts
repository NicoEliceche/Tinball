export interface RankingEntry {
  position: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  locality: string;
  rankPoints: number;
  movement: number;
  matches: number;
}

export interface Reward {
  id: string;
  title: string;
  sponsor: string;
  points: number;
  stock: number;
  category: string;
}

export interface Venue {
  id: string;
  name: string;
  locality: string;
  address: string;
  rating: number;
  reviewCount: number;
  formats: string[];
  surface: string;
  priceLabel: string;
  sponsored: boolean;
}

