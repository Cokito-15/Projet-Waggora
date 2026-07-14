import { prisma } from '@waggora/db'
import { createHmac, randomBytes } from 'crypto'
import { UnauthorizedError } from '../lib/errors'

export class StudioService {
  async validateApiKey(apiKey: string) {
    const studio = await prisma.studio.findUnique({
      where: { apiKey, isActive: true },
      include: { games: { where: { isActive: true } } },
    })
    if (!studio) throw new UnauthorizedError('Invalid API key')
    return studio
  }

  async createStudio(name: string, slug: string) {
    const apiKey = `wag_live_${randomBytes(20).toString('hex')}`
    const apiSecret = randomBytes(32).toString('hex')
    return prisma.studio.create({
      data: { name, slug, apiKey, apiSecret },
    })
  }

  async createGame(studioId: string, data: { name: string; bundleId: string; genre?: string }) {
    return prisma.game.create({
      data: {
        studioId,
        name: data.name,
        bundleId: data.bundleId,
        genre: (data.genre as any) ?? 'CASUAL',
      },
    })
  }

  async getAnalyticsOverview(studioId: string, gameId?: string) {
    const gameFilter = gameId ? { gameId } : { game: { studioId } }

    const [totalPlayers, activePlayers, totalChallenges, completedChallenges] = await Promise.all([
      prisma.player.count({ where: { game: { studioId }, ...(gameId ? { gameId } : {}) } }),
      prisma.player.count({
        where: {
          game: { studioId },
          ...(gameId ? { gameId } : {}),
          lastSeenAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.challenge.count({ where: { ...gameFilter } }),
      prisma.challenge.count({ where: { ...gameFilter, status: 'COMPLETED' } }),
    ])

    const stakeAgg = await prisma.challenge.aggregate({
      where: { ...gameFilter, status: 'COMPLETED' },
      _sum: { stake: true },
      _avg: { stake: true },
    })

    const waggoraUsersCount = await prisma.challenge.groupBy({
      by: ['challengerId'],
      where: { ...gameFilter },
      _count: true,
    })

    return {
      players: {
        total: totalPlayers,
        active: activePlayers,
        waggoraUsers: waggoraUsersCount.length,
        waggoraAdoptionRate:
          totalPlayers > 0
            ? Math.round((waggoraUsersCount.length / totalPlayers) * 1000) / 1000
            : 0,
      },
      challenges: {
        created: totalChallenges,
        completed: completedChallenges,
        completionRate:
          totalChallenges > 0
            ? Math.round((completedChallenges / totalChallenges) * 1000) / 1000
            : 0,
        totalStaked: (stakeAgg._sum.stake ?? 0) * 2,
        avgStake: Math.round((stakeAgg._avg.stake ?? 0) * 10) / 10,
      },
    }
  }
}

export const studioService = new StudioService()
