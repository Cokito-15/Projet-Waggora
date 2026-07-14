// ─── Constants ──────────────────────────────────────────────────

export const STAKE_AMOUNTS = [10, 20, 50, 100] as const
export type StakeAmount = (typeof STAKE_AMOUNTS)[number]

export const MULTIPLIERS = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0] as const
export type Multiplier = (typeof MULTIPLIERS)[number]

export const WELCOME_BONUS_TOKENS = 100
export const CHALLENGE_TIMEOUT_SECONDS = 30
export const ASYNC_CHALLENGE_TIMEOUT_HOURS = 24
export const MATCHMAKING_RATING_RANGE_INITIAL = 100
export const MATCHMAKING_RATING_RANGE_EXPAND = 50 // expand by this every 5s

// ─── API Response types ─────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  success: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  hasMore: boolean
}

// ─── Domain types (API contract) ────────────────────────────────

export interface PlayerDto {
  id: string
  externalId: string
  displayName: string
  avatarUrl: string | null
  level: number
  rating: number
  wallet: WalletSummaryDto
  createdAt: string
  lastSeenAt: string
}

export interface WalletSummaryDto {
  balance: number
  locked: number
}

export interface WalletDto extends WalletSummaryDto {
  lifetime: number
  updatedAt: string
}

export interface WalletTransactionDto {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string | null
  createdAt: string
}

export interface ChallengeDto {
  id: string
  type: 'DIRECT' | 'ASYNC'
  status: string
  stake: number
  multiplier: number | null
  challenger: PlayerSummaryDto
  opponent: PlayerSummaryDto | null
  result: ChallengeResultDto | null
  expiresAt: string
  createdAt: string
  completedAt: string | null
}

export interface ChallengeResultDto {
  outcome: 'CHALLENGER_WIN' | 'OPPONENT_WIN' | 'DRAW'
  challengerScore: number
  opponentScore: number
  multiplierApplied: number
  winnerPayout: number
  waggoraCommission: number
  processedAt: string
}

export interface PlayerSummaryDto {
  id: string
  displayName: string
  avatarUrl: string | null
  level: number
  rating: number
}

export interface LeaderboardEntryDto {
  rank: number
  player: PlayerSummaryDto
  score: number
  tokensWon: number
  challengesWon: number
}

export interface MarketplaceItemDto {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string
  priceTokens: number
  stock: number | null
  isAvailable: boolean
}

// ─── Error codes ─────────────────────────────────────────────────

export const ERROR_CODES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  CHALLENGE_NOT_FOUND: 'CHALLENGE_NOT_FOUND',
  CHALLENGE_ALREADY_ACTIVE: 'CHALLENGE_ALREADY_ACTIVE',
  CHALLENGE_CANNOT_CANCEL: 'CHALLENGE_CANNOT_CANCEL',
  CHALLENGE_EXPIRED: 'CHALLENGE_EXPIRED',
  INVALID_STAKE: 'INVALID_STAKE',
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  ITEM_OUT_OF_STOCK: 'ITEM_OUT_OF_STOCK',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
