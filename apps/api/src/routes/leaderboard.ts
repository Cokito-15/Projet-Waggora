import { FastifyPluginAsync } from 'fastify'
import { prisma } from '@waggora/db'

export const leaderboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Params: { gameId: string }
    Querystring: { type?: string; playerId?: string; limit?: string }
  }>('/games/:gameId/leaderboard', async (req) => {
    const { gameId } = req.params
    const type = (req.query.type ?? 'WEEKLY') as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'
    const limit = Math.min(parseInt(req.query.limit ?? '50'), 100)
    const period = getCurrentPeriod(type)

    // Upsert leaderboard record
    const leaderboard = await prisma.leaderboard.upsert({
      where: { gameId_type_period: { gameId, type, period } },
      update: {},
      create: { gameId, type, period },
    })

    const entries = await prisma.leaderboardEntry.findMany({
      where: { leaderboardId: leaderboard.id },
      include: { player: true },
      orderBy: { score: 'desc' },
      take: limit,
    })

    const formatted = entries.map((e, i) => ({
      rank: i + 1,
      player: {
        id: e.player.id,
        displayName: e.player.displayName,
        avatarUrl: e.player.avatarUrl,
        level: e.player.level,
        rating: e.player.rating,
      },
      score: e.score,
      tokensWon: e.tokensWon,
      challengesWon: e.challengesWon,
    }))

    let playerRank = null
    if (req.query.playerId) {
      const playerEntry = await prisma.leaderboardEntry.findUnique({
        where: { leaderboardId_playerId: { leaderboardId: leaderboard.id, playerId: req.query.playerId } },
        include: { player: true },
      })
      if (playerEntry) {
        playerRank = {
          rank: playerEntry.rank ?? 0,
          player: { id: playerEntry.player.id, displayName: playerEntry.player.displayName, avatarUrl: playerEntry.player.avatarUrl, level: playerEntry.player.level, rating: playerEntry.player.rating },
          score: playerEntry.score,
          tokensWon: playerEntry.tokensWon,
          challengesWon: playerEntry.challengesWon,
        }
      }
    }

    return { leaderboard: { gameId, type, period, entries: formatted, playerRank } }
  })
}

function getCurrentPeriod(type: string): string {
  const now = new Date()
  if (type === 'DAILY') return now.toISOString().slice(0, 10)
  if (type === 'WEEKLY') {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    return `${d.getUTCFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`
  }
  if (type === 'MONTHLY') return now.toISOString().slice(0, 7)
  return 'all-time'
}

function getWeekNumber(d: Date): number {
  const onejan = new Date(d.getUTCFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getUTCDay() + 1) / 7)
}
