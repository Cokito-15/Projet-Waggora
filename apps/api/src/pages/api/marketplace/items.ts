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

    // Get marketplace items
    const items = await prisma.marketplaceItem.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(items);
  } catch (error) {
    console.error('Get marketplace error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
