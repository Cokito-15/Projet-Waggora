import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { studioService } from '../services/studio.service'
import { prisma } from '@waggora/db'

// Admin routes for Waggora internal use (secured by admin API key)
export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /admin/studios — create studio
  fastify.post('/studios', async (req, reply) => {
    const { name, slug } = z.object({ name: z.string(), slug: z.string() }).parse(req.body)
    const studio = await studioService.createStudio(name, slug)
    return reply.code(201).send({ studio })
  })

  // POST /admin/studios/:id/games — create game
  fastify.post<{ Params: { id: string } }>('/studios/:id/games', async (req, reply) => {
    const data = z.object({ name: z.string(), bundleId: z.string(), genre: z.string().optional() }).parse(req.body)
    const game = await studioService.createGame(req.params.id, data)
    return reply.code(201).send({ game })
  })

  // GET /admin/studios — list all studios
  fastify.get('/studios', async () => {
    const studios = await prisma.studio.findMany({
      include: { games: true, _count: { select: { transactions: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return { studios }
  })

  // POST /admin/marketplace/items — add item
  fastify.post('/marketplace/items', async (req, reply) => {
    const data = z.object({
      name: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().url().optional(),
      category: z.enum(['SKIN', 'BOOST', 'GIFT_CARD', 'SUBSCRIPTION', 'EVENT_TICKET', 'PARTNER_REWARD']),
      priceTokens: z.number().int().positive(),
      stock: z.number().int().optional(),
      gameId: z.string().optional(),
    }).parse(req.body)

    const item = await prisma.marketplaceItem.create({ data })
    return reply.code(201).send({ item })
  })
}
