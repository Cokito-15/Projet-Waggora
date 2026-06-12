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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            level: true,
            avatar: true,
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            displayName: true,
            level: true,
            avatar: true,
          },
        },
        results: true,
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    return res.status(200).json(challenge);
  } catch (error) {
    console.error('Get challenge error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
