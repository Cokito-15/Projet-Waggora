import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '10', offset = '0' } = req.query;

    const leaderboard = await prisma.leaderboardEntry.findMany({
      orderBy: { rank: 'asc' },
      take: Math.min(parseInt(limit as string), 100),
      skip: parseInt(offset as string),
      include: {
        player: {
          select: {
            id: true,
            username: true,
            displayName: true,
            level: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
