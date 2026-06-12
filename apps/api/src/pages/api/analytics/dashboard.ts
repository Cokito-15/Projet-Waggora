import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    // Get analytics dashboard data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = await prisma.dailyStats.findUnique({
      where: { date: today },
    });

    const playerStats = await prisma.playerStats.findUnique({
      where: { playerId: decoded.id },
    });

    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { initiatorId: decoded.id },
          { opponentId: decoded.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.status(200).json({
      dailyStats,
      playerStats,
      recentChallenges: challenges,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
