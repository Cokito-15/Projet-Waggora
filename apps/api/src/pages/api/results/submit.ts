import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const submitResultSchema = z.object({
  challengeId: z.string(),
  score: z.number().nonnegative(),
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

    const { challengeId, score } = submitResultSchema.parse(req.body);

    // Fetch challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        results: true,
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Verify player is part of challenge
    if (challenge.initiatorId !== decoded.id && challenge.opponentId !== decoded.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Create game result
    const result = await prisma.gameResult.create({
      data: {
        challengeId,
        playerId: decoded.id,
        score,
        timestamp: new Date(),
      },
    });

    // If both players submitted, process challenge
    if (challenge.results.length >= 1) {
      // Get both results
      const results = await prisma.gameResult.findMany({
        where: { challengeId },
      });

      if (results.length === 2) {
        const [result1, result2] = results;
        const initiatorResult = result1.playerId === challenge.initiatorId ? result1 : result2;
        const opponentResult = result1.playerId === challenge.opponentId ? result1 : result2;

        // Determine winner
        const winnerId =
          initiatorResult.score > opponentResult.score
            ? challenge.initiatorId
            : opponentResult.score > initiatorResult.score
            ? challenge.opponentId
            : null;

        // Calculate payouts
        const totalStake = challenge.stakeAmount * 2;
        const commission = Math.floor(totalStake * 0.15); // 15% commission
        const winnings = challenge.stakeAmount + (totalStake - commission) / 2;

        // Update challenge
        await prisma.challenge.update({
          where: { id: challengeId },
          data: {
            status: 'COMPLETED',
            winnerBonus: winnerId ? Math.floor(winnings * challenge.multiplier) : 0,
            loserPenalty: challenge.stakeAmount,
            commission,
          },
        });

        // Update wallets
        if (winnerId) {
          // Winner
          const winnerWallet = await prisma.wallet.findUnique({
            where: { playerId: winnerId },
          });

          const loserId = winnerId === challenge.initiatorId ? challenge.opponentId : challenge.initiatorId;
          const loserWallet = await prisma.wallet.findUnique({
            where: { playerId: loserId! },
          });

          const bonus = Math.floor(winnings * challenge.multiplier);

          // Update winner
          if (winnerWallet) {
            await prisma.wallet.update({
              where: { id: winnerWallet.id },
              data: {
                balance: winnerWallet.balance + bonus,
                totalEarned: winnerWallet.totalEarned + bonus,
                transactions: {
                  create: {
                    amount: bonus,
                    type: 'CHALLENGE_WIN',
                    reason: `Challenge win: ${challengeId}`,
                    relatedId: challengeId,
                  },
                },
              },
            });
          }

          // Update loser (already deducted stake)
          if (loserWallet) {
            await prisma.wallet.update({
              where: { id: loserWallet.id },
              data: {
                totalSpent: loserWallet.totalSpent + challenge.stakeAmount,
              },
            });
          }
        } else {
          // Tie - return stakes
          const initiatorWallet = await prisma.wallet.findUnique({
            where: { playerId: challenge.initiatorId },
          });
          const opponentWallet = await prisma.wallet.findUnique({
            where: { playerId: challenge.opponentId! },
          });

          if (initiatorWallet) {
            await prisma.wallet.update({
              where: { id: initiatorWallet.id },
              data: {
                balance: initiatorWallet.balance + challenge.stakeAmount,
              },
            });
          }

          if (opponentWallet) {
            await prisma.wallet.update({
              where: { id: opponentWallet.id },
              data: {
                balance: opponentWallet.balance + challenge.stakeAmount,
              },
            });
          }
        }

        // Update leaderboard
        const initatorLeaderboard = await prisma.leaderboardEntry.findUnique({
          where: { playerId: challenge.initiatorId },
        });

        const opponentLeaderboard = await prisma.leaderboardEntry.findUnique({
          where: { playerId: challenge.opponentId! },
        });

        if (winnerId === challenge.initiatorId) {
          if (initatorLeaderboard) {
            await prisma.leaderboardEntry.update({
              where: { playerId: challenge.initiatorId },
              data: { wins: initatorLeaderboard.wins + 1 },
            });
          }
          if (opponentLeaderboard) {
            await prisma.leaderboardEntry.update({
              where: { playerId: challenge.opponentId! },
              data: { losses: opponentLeaderboard.losses + 1 },
            });
          }
        } else if (winnerId === challenge.opponentId) {
          if (opponentLeaderboard) {
            await prisma.leaderboardEntry.update({
              where: { playerId: challenge.opponentId! },
              data: { wins: opponentLeaderboard.wins + 1 },
            });
          }
          if (initatorLeaderboard) {
            await prisma.leaderboardEntry.update({
              where: { playerId: challenge.initiatorId },
              data: { losses: initatorLeaderboard.losses + 1 },
            });
          }
        }
      }
    }

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Submit result error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
