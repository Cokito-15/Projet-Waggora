import { prisma } from '@waggora/db'
import { WELCOME_BONUS_TOKENS } from '@waggora/shared'
import { walletService } from './wallet.service'
import { NotFoundError } from '../lib/errors'
import { ERROR_CODES } from '@waggora/shared'

export interface SyncPlayerInput {
  externalId: string
  displayName: string
  gameId: string
  avatarUrl?: string
  level?: number
}

export class PlayerService {
  async syncPlayer(input: SyncPlayerInput, studioId: string) {
    // Verify game belongs to studio
    const game = await prisma.game.findFirst({
      where: { id: input.gameId, studioId, isActive: true },
    })
    if (!game) {
      throw new NotFoundError(ERROR_CODES.GAME_NOT_FOUND, `Game ${input.gameId} not found`)
    }

    const existing = await prisma.player.findUnique({
      where: { gameId_externalId: { gameId: input.gameId, externalId: input.externalId } },
      include: { wallet: true },
    })

    if (existing) {
      const updated = await prisma.player.update({
        where: { id: existing.id },
        data: {
          displayName: input.displayName,
          level: input.level ?? existing.level,
          avatarUrl: input.avatarUrl ?? existing.avatarUrl,
          lastSeenAt: new Date(),
        },
        include: { wallet: true },
      })
      return { player: updated, created: false }
    }

    // Create new player
    const player = await prisma.player.create({
      data: {
        gameId: input.gameId,
        externalId: input.externalId,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        level: input.level ?? 1,
        wallet: { create: { balance: 0, locked: 0, lifetime: 0 } },
      },
      include: { wallet: true },
    })

    // Credit welcome bonus
    await walletService.credit(
      player.id,
      WELCOME_BONUS_TOKENS,
      'CREDIT_BONUS',
      undefined,
      'Welcome bonus',
    )

    const withBonus = await prisma.player.findUniqueOrThrow({
      where: { id: player.id },
      include: { wallet: true },
    })

    return { player: withBonus, created: true }
  }

  async getById(playerId: string) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { wallet: true },
    })
    if (!player) {
      throw new NotFoundError(ERROR_CODES.PLAYER_NOT_FOUND, `Player ${playerId} not found`)
    }
    return player
  }

  async getStats(playerId: string) {
    const [won, lost, total] = await Promise.all([
      prisma.challenge.count({ where: { winnerId: playerId, status: 'COMPLETED' } }),
      prisma.challenge.count({
        where: {
          status: 'COMPLETED',
          winnerId: { not: playerId },
          OR: [{ challengerId: playerId }, { opponentId: playerId }],
        },
      }),
      prisma.challenge.count({
        where: {
          status: 'COMPLETED',
          OR: [{ challengerId: playerId }, { opponentId: playerId }],
        },
      }),
    ])

    const wallet = await prisma.wallet.findUnique({ where: { playerId } })

    return {
      challengesPlayed: total,
      challengesWon: won,
      challengesLost: lost,
      winRate: total > 0 ? Math.round((won / total) * 1000) / 1000 : 0,
      tokensWonLifetime: wallet?.lifetime ?? 0,
    }
  }
}

export const playerService = new PlayerService()
