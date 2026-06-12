import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const createChallengeSchema = z.object({
  opponentId: z.string().optional(),
  stakeAmount: z.number().positive(),
  type: z.enum(['DIRECT', 'ASYNC']),
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

    const { opponentId, stakeAmount, type } = createChallengeSchema.parse(req.body);

    // Verify wallet has sufficient balance
    const wallet = await prisma.wallet.findUnique({
      where: { playerId: decoded.id },
    });

    if (!wallet || wallet.balance < stakeAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Generate multiplier (1.2 - 2.0)
    const multiplier = parseFloat((Math.random() * 0.8 + 1.2).toFixed(1));

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        initiatorId: decoded.id,
        opponentId: opponentId || undefined,
        stakeAmount,
        multiplier,
        type,
        status: opponentId ? 'ACCEPTED' : 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      include: {
        initiator: true,
        opponent: true,
      },
    });

    // Deduct stake from initiator wallet
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - stakeAmount,
        transactions: {
          create: {
            amount: -stakeAmount,
            type: 'CHALLENGE_LOSS',
            reason: `Challenge stake: ${challenge.id}`,
            relatedId: challenge.id,
          },
        },
      },
    });

    return res.status(201).json(challenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
