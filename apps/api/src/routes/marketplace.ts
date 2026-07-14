import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '@waggora/db'
import { walletService } from '../services/wallet.service'
import { AppError, NotFoundError } from '../lib/errors'
import { ERROR_CODES } from '@waggora/shared'

const purchaseBody = z.object({
  playerId: z.string().min(1),
  itemId: z.string().min(1),
})

export const marketplaceRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /marketplace/items
  fastify.get<{ Querystring: { gameId?: string; category?: string } }>(
    '/items',
    async (req) => {
      const items = await prisma.marketplaceItem.findMany({
        where: {
          isActive: true,
          ...(req.query.gameId ? { OR: [{ gameId: req.query.gameId }, { gameId: null }] } : {}),
          ...(req.query.category ? { category: req.query.category as any } : {}),
        },
        orderBy: { priceTokens: 'asc' },
      })
      return { items: items.map(formatItem) }
    },
  )

  // GET /marketplace/items/:id
  fastify.get<{ Params: { id: string } }>('/items/:id', async (req) => {
    const item = await prisma.marketplaceItem.findUnique({ where: { id: req.params.id } })
    if (!item) throw new NotFoundError(ERROR_CODES.ITEM_NOT_FOUND, 'Item not found')
    return { item: formatItem(item) }
  })

  // POST /marketplace/purchase
  fastify.post('/purchase', async (req, reply) => {
    const { playerId, itemId } = purchaseBody.parse(req.body)

    const item = await prisma.marketplaceItem.findUnique({ where: { id: itemId, isActive: true } })
    if (!item) throw new NotFoundError(ERROR_CODES.ITEM_NOT_FOUND, 'Item not found')

    if (item.stock !== null && item.stock <= 0) {
      throw new AppError(ERROR_CODES.ITEM_OUT_OF_STOCK, 'Item is out of stock', 410)
    }

    // Deduct tokens (will throw InsufficientBalanceError if needed)
    await walletService.deductPurchase(playerId, item.priceTokens, itemId)

    // Decrement stock if applicable
    if (item.stock !== null) {
      await prisma.marketplaceItem.update({
        where: { id: itemId },
        data: { stock: { decrement: 1 } },
      })
    }

    const purchase = await prisma.marketplacePurchase.create({
      data: {
        playerId,
        itemId,
        status: 'FULFILLED',
        tokensSpent: item.priceTokens,
        redemptionCode: item.metadata ? generateCode() : undefined,
      },
      include: { item: true },
    })

    return reply.code(201).send({ purchase: formatPurchase(purchase) })
  })

  // GET /players/:playerId/purchases
  fastify.get<{ Params: { playerId: string } }>('/players/:playerId/purchases', async (req) => {
    const purchases = await prisma.marketplacePurchase.findMany({
      where: { playerId: req.params.playerId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    })
    return { purchases: purchases.map(formatPurchase) }
  })
}

function formatItem(item: any) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    category: item.category,
    priceTokens: item.priceTokens,
    stock: item.stock,
    isAvailable: item.isActive && (item.stock === null || item.stock > 0),
  }
}

function formatPurchase(p: any) {
  return {
    id: p.id,
    item: p.item ? formatItem(p.item) : null,
    status: p.status,
    tokensSpent: p.tokensSpent,
    redemptionCode: p.redemptionCode,
    createdAt: p.createdAt,
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 12 }, (_, i) =>
    i > 0 && i % 4 === 0 ? '-' + chars[Math.floor(Math.random() * chars.length)]
    : chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}
