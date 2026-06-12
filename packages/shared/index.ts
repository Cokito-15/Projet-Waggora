// Player Types
export interface Player {
  id: string;
  email: string;
  username: string;
  displayName: string;
  level: number;
  experience: number;
  avatar?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  createdAt: Date;
  lastLoginAt?: Date;
}

// Wallet Types
export interface Wallet {
  id: string;
  playerId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  reason: string;
  relatedId?: string;
  createdAt: Date;
}

export type TransactionType =
  | 'CHALLENGE_WIN'
  | 'CHALLENGE_LOSS'
  | 'COMMISSION'
  | 'MARKETPLACE_PURCHASE'
  | 'MARKETPLACE_REFUND'
  | 'ADMIN_ADJUSTMENT'
  | 'BONUS';

// Challenge Types
export interface Challenge {
  id: string;
  initiatorId: string;
  opponentId?: string;
  stakeAmount: number;
  multiplier: number;
  status: ChallengeStatus;
  type: ChallengeType;
  winnerBonus?: number;
  loserPenalty?: number;
  commission?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ChallengeStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export type ChallengeType = 'DIRECT' | 'ASYNC';

export type ChallengeResult = 'WIN' | 'LOSS' | 'TIE';

// Game Result Types
export interface GameResult {
  id: string;
  challengeId: string;
  playerId: string;
  score: number;
  screenshot?: string;
  timestamp: Date;
  createdAt: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  playerId: string;
  player?: Player;
  wins: number;
  losses: number;
  draws: number;
  totalTokensWon: number;
  totalTokensLost: number;
  winRate: number;
  rank: number;
  updatedAt: Date;
}

// Marketplace Types
export interface MarketplaceItem {
  id: string;
  name: string;
  description?: string;
  category: ItemCategory;
  price: number;
  image?: string;
  stock?: number;
  active: boolean;
  partnerId?: string;
  partnerName?: string;
  partnerRedirectUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ItemCategory =
  | 'COSMETIC'
  | 'BOOSTER'
  | 'GIFT_CARD'
  | 'SUBSCRIPTION'
  | 'EVENT_TICKET'
  | 'PARTNER_REWARD';

export interface MarketplaceOrder {
  id: string;
  playerId: string;
  itemId: string;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface DailyStats {
  id: string;
  date: Date;
  newPlayers: number;
  activeUsers: number;
  challengesCreated: number;
  challengesCompleted: number;
  totalTokensPlayed: number;
  totalRevenue: number;
}

export interface PlayerStats {
  id: string;
  playerId: string;
  challengesCreated: number;
  challengesCompleted: number;
  totalTokensPlayed: number;
  totalTokensWon: number;
  averageMultiplier: number;
  lastChallengeAt?: Date;
  updatedAt: Date;
}

// Studio Integration Types
export interface StudioIntegration {
  id: string;
  studioName: string;
  apiKey: string;
  secretKey: string;
  webhookUrl?: string;
  active: boolean;
  commissionPercent: number;
  maxStakeAmount: number;
  totalPlayers: number;
  totalChallenges: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginResponse {
  token: string;
  player: Player & { wallet: Wallet };
}

export interface AuthToken {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
