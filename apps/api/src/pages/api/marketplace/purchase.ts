import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const purchaseSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { itemId, quantity } = purchaseSchema.parse(req.body);

    // Get item
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!item.active) {
      return res.status(400).json({ error: 'Item not available' });
    }

    // Check stock
    if (item.stock && item.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check player balance
    const wallet = await prisma.wallet.findUnique({
      where: { playerId: decoded.id },
    });

    const totalPrice = item.price * quantity;

    if (!wallet || wallet.balance < totalPrice) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create order
    const order = await prisma.marketplaceOrder.create({
      data: {
        playerId: decoded.id,
        itemId,
        quantity,
        totalPrice,
      },
    });

    // Deduct from wallet
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - totalPrice,
        totalSpent: wallet.totalSpent + totalPrice,
        transactions: {
          create: {
            amount: -totalPrice,
            type: 'MARKETPLACE_PURCHASE',
            reason: `Purchased: ${item.name}`,
            relatedId: order.id,
          },
        },
      },
    });

    // Update stock
    if (item.stock) {
      await prisma.marketplaceItem.update({
        where: { id: itemId },
        data: { stock: item.stock - quantity },
      });
    }

    return res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Purchase error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
