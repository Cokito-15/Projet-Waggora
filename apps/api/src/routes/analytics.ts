import { FastifyPluginAsync } from 'fastify'
import { studioService } from '../services/studio.service'

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /analytics/overview
  fastify.get<{ Querystring: { gameId?: string } }>('/overview', async (req) => {
    const studio = (req as any).studio
    const overview = await studioService.getAnalyticsOverview(studio.id, req.query.gameId)
    return { data: overview }
  })

  // GET /analytics/retention (simplified for MVP — returns mock curve structure)
  fastify.get<{ Querystring: { gameId?: string } }>('/retention', async (req) => {
    const { prisma } = await import('@waggora/db')
    const studio = (req as any).studio
    const gameFilter = req.query.gameId
      ? { gameId: req.query.gameId }
      : { game: { studioId: studio.id } }

    // Simplified retention: % of players who played again after N days
    // Full cohort analysis would use ClickHouse in production
    const days = [1, 3, 7, 14, 30]
    const retentionBase = [0.38, 0.22, 0.14, 0.10, 0.07]       // typical casual benchmarks
    const retentionWaggora = [0.54, 0.36, 0.28, 0.21, 0.15]    // typical with engagement layer

    return {
      withWaggora: days.map((day, i) => ({ day, rate: retentionWaggora[i] })),
      withoutWaggora: days.map((day, i) => ({ day, rate: retentionBase[i] })),
      note: 'MVP: projections based on sector benchmarks. Real cohort data available in V1.',
    }
  })
}
