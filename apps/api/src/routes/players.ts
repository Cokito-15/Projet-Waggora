import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { playerService } from '../services/player.service'

const syncPlayerBody = z.object({
  externalId: z.string().min(1).max(255),
  displayName: z.string().min(2).max(50),
  gameId: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  level: z.number().int().min(1).optional(),
})

export const playersRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /players — upsert
  fastify.post('/', async (req, reply) => {
    const body = syncPlayerBody.parse(req.body)
    const studio = (req as any).studio
    const { player, created } = await playerService.syncPlayer(body, studio.id)

    return reply.code(created ? 201 : 200).send({
      player: formatPlayer(player),
      created,
    })
  })

  // GET /players/:playerId
  fastify.get<{ Params: { playerId: string } }>('/:playerId', async (req) => {
    const player = await playerService.getById(req.params.playerId)
    return { player: formatPlayer(player) }
  })

  // GET /players/:playerId/stats
  fastify.get<{ Params: { playerId: string } }>('/:playerId/stats', async (req) => {
    const stats = await playerService.getStats(req.params.playerId)
    return { stats }
  })

  // GET /players/:playerId/wallet
  fastify.get<{ Params: { playerId: string } }>('/:playerId/wallet', async (req) => {
    const player = await playerService.getById(req.params.playerId)
    return {
      wallet: {
        balance: player.wallet?.balance ?? 0,
        locked: player.wallet?.locked ?? 0,
        lifetime: player.wallet?.lifetime ?? 0,
        updatedAt: player.wallet?.updatedAt,
      },
    }
  })

  // GET /players/:playerId/wallet/history
  fastify.get<{ Params: { playerId: string }; Querystring: { page?: string; perPage?: string } }>(
    '/:playerId/wallet/history',
    async (req) => {
      const { prisma } = await import('@waggora/db')
      const player = await playerService.getById(req.params.playerId)
      if (!player.wallet) return { transactions: [], pagination: { total: 0, page: 1, perPage: 20, hasMore: false } }

      const page = parseInt(req.query.page ?? '1')
      const perPage = Math.min(parseInt(req.query.perPage ?? '20'), 100)

      const [transactions, total] = await Promise.all([
        prisma.walletTransaction.findMany({
          where: { walletId: player.wallet.id },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.walletTransaction.count({ where: { walletId: player.wallet.id } }),
      ])

      return {
        transactions,
        pagination: { total, page, perPage, hasMore: page * perPage < total },
      }
    },
  )

  // GET /players/:playerId/challenges
  fastify.get<{ Params: { playerId: string }; Querystring: { status?: string } }>(
    '/:playerId/challenges',
    async (req) => {
      const { challengeService } = await import('../services/challenge.service')
      const challenges = await challengeService.getPlayerChallenges(
        req.params.playerId,
        req.query.status as any,
      )
      return { challenges: challenges.map(formatChallenge) }
    },
  )
}

// ─── Formatters ──────────────────────────────────────────────────

export function formatPlayer(player: any) {
  return {
    id: player.id,
    externalId: player.externalId,
    displayName: player.displayName,
    avatarUrl: player.avatarUrl,
    level: player.level,
    rating: player.rating,
    wallet: player.wallet
      ? { balance: player.wallet.balance, locked: player.wallet.locked }
      : { balance: 0, locked: 0 },
    createdAt: player.createdAt,
    lastSeenAt: player.lastSeenAt,
  }
}

export function formatChallenge(challenge: any) {
  return {
    id: challenge.id,
    type: challenge.type,
    status: challenge.status,
    stake: challenge.stake,
    multiplier: challenge.multiplier ? Number(challenge.multiplier) : null,
    challenger: challenge.challenger
      ? {
          id: challenge.challenger.id,
          displayName: challenge.challenger.displayName,
          avatarUrl: challenge.challenger.avatarUrl,
          level: challenge.challenger.level,
          rating: challenge.challenger.rating,
        }
      : null,
    opponent: challenge.opponent
      ? {
          id: challenge.opponent.id,
          displayName: challenge.opponent.displayName,
          avatarUrl: challenge.opponent.avatarUrl,
          level: challenge.opponent.level,
          rating: challenge.opponent.rating,
        }
      : null,
    result: challenge.result
      ? {
          outcome: challenge.result.outcome,
          challengerScore: challenge.result.challengerScore,
          opponentScore: challenge.result.opponentScore,
          multiplierApplied: Number(challenge.result.multiplierApplied),
          winnerPayout: challenge.result.challengerPayout > challenge.result.opponentPayout
            ? challenge.result.challengerPayout
            : challenge.result.opponentPayout,
          waggoraCommission: challenge.result.waggoraCommission,
          processedAt: challenge.result.processedAt,
        }
      : null,
    expiresAt: challenge.expiresAt,
    createdAt: challenge.createdAt,
    completedAt: challenge.completedAt,
  }
}
