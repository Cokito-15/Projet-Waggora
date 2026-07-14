import { prisma } from '@waggora/db'
import { getRedis } from '../lib/redis'

interface EnqueueOpts {
  playerId: string
  gameId: string
  stake: number
  challengeId: string
  rating: number
  expiresAt: Date
}

const QUEUE_KEY = (gameId: string, stake: number) => `mm:queue:${gameId}:${stake}`
const PLAYER_CHALLENGE_KEY = (playerId: string) => `mm:player:${playerId}`

export class MatchmakingService {
  async enqueue(opts: EnqueueOpts) {
    const redis = getRedis()
    const queueKey = QUEUE_KEY(opts.gameId, opts.stake)
    const entry = JSON.stringify({
      playerId: opts.playerId,
      challengeId: opts.challengeId,
      rating: opts.rating,
      gameId: opts.gameId,
    })

    await Promise.all([
      redis.rpush(queueKey, entry),
      // Track player→challengeId mapping for status polling
      redis.set(PLAYER_CHALLENGE_KEY(opts.playerId), opts.challengeId, 'EX', 60),
      // Store in DB queue for durability
      prisma.matchmakingQueue.create({
        data: {
          gameId: opts.gameId,
          playerId: opts.playerId,
          stake: opts.stake,
          ratingMin: Math.max(0, opts.rating - 150),
          ratingMax: opts.rating + 150,
          expiresAt: opts.expiresAt,
        },
      }),
    ])

    // Try to match immediately
    return this.tryMatch(opts.gameId, opts.stake)
  }

  async dequeue(playerId: string, gameId: string, stake: number) {
    const redis = getRedis()
    const queueKey = QUEUE_KEY(gameId, stake)

    // Remove from Redis list (scan and filter)
    const all = await redis.lrange(queueKey, 0, -1)
    for (const entry of all) {
      const parsed = JSON.parse(entry)
      if (parsed.playerId === playerId) {
        await redis.lrem(queueKey, 1, entry)
        break
      }
    }

    await Promise.all([
      redis.del(PLAYER_CHALLENGE_KEY(playerId)),
      prisma.matchmakingQueue.updateMany({
        where: { playerId, gameId, stake, matched: false },
        data: { matched: true },
      }),
    ])
  }

  async tryMatch(gameId: string, stake: number): Promise<boolean> {
    const redis = getRedis()
    const queueKey = QUEUE_KEY(gameId, stake)

    // Need at least 2 in queue
    const len = await redis.llen(queueKey)
    if (len < 2) return false

    // Pop two candidates
    const [e1, e2] = await Promise.all([redis.lpop(queueKey), redis.lpop(queueKey)])
    if (!e1 || !e2) return false

    const p1 = JSON.parse(e1)
    const p2 = JSON.parse(e2)

    // Prevent self-match (race condition guard)
    if (p1.playerId === p2.playerId) {
      await redis.rpush(queueKey, e2)
      return false
    }

    // Match them: update both challenges
    await Promise.all([
      // Update challenger's challenge with opponent
      prisma.challenge.update({
        where: { id: p1.challengeId },
        data: { status: 'MATCHED', opponentId: p2.playerId, startedAt: new Date() },
      }),
      // Cancel challenger 2's challenge (merge into p1's)
      prisma.challenge.update({
        where: { id: p2.challengeId },
        data: { status: 'CANCELLED' },
      }),
      // Refund p2's stake lock (they'll play p1's challenge)
      // (handled separately since p2 becomes opponent of p1)
      prisma.matchmakingQueue.updateMany({
        where: { playerId: { in: [p1.playerId, p2.playerId] }, matched: false },
        data: { matched: true },
      }),
      redis.del(PLAYER_CHALLENGE_KEY(p1.playerId)),
      redis.del(PLAYER_CHALLENGE_KEY(p2.playerId)),
    ])

    return true
  }

  async getStatus(playerId: string) {
    const redis = getRedis()
    const challengeId = await redis.get(PLAYER_CHALLENGE_KEY(playerId))

    // Check if player has any matched/active challenge
    const activeChallenge = await prisma.challenge.findFirst({
      where: {
        status: { in: ['MATCHED', 'ACTIVE', 'PENDING', 'AWAITING_OPPONENT'] },
        OR: [{ challengerId: playerId }, { opponentId: playerId }],
      },
      include: { challenger: true, opponent: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!activeChallenge) {
      return { status: 'IDLE', challenge: null }
    }

    if (activeChallenge.status === 'PENDING') {
      return { status: 'SEARCHING', challenge: activeChallenge, estimatedWaitSeconds: 10 }
    }

    return { status: 'MATCHED', challenge: activeChallenge }
  }
}

export const matchmakingService = new MatchmakingService()
