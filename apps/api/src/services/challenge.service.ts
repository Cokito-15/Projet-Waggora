import { prisma, ChallengeStatus, Outcome } from '@waggora/db'
import { STAKE_AMOUNTS, ERROR_CODES, type StakeAmount } from '@waggora/shared'
import { walletService } from './wallet.service'
import { generateMultiplier } from '../lib/multiplier'
import { matchmakingService } from './matchmaking.service'
import { AppError, ConflictError, NotFoundError } from '../lib/errors'
import Decimal from 'decimal.js'

const CHALLENGE_TIMEOUT_MS = 30 * 1000
const ASYNC_TIMEOUT_MS = 24 * 60 * 60 * 1000

export class ChallengeService {
  async createChallenge(opts: {
    playerId: string
    gameId: string
    type: 'DIRECT' | 'ASYNC'
    stake: number
    studioId: string
  }) {
    const { playerId, gameId, type, stake } = opts

    if (!STAKE_AMOUNTS.includes(stake as StakeAmount)) {
      throw new AppError(ERROR_CODES.INVALID_STAKE, `Invalid stake. Allowed: ${STAKE_AMOUNTS.join(', ')}`)
    }

    // Check no active challenge
    const active = await prisma.challenge.findFirst({
      where: {
        status: { in: ['PENDING', 'MATCHED', 'ACTIVE', 'AWAITING_OPPONENT'] },
        OR: [{ challengerId: playerId }, { opponentId: playerId }],
      },
    })
    if (active) {
      throw new ConflictError(ERROR_CODES.CHALLENGE_ALREADY_ACTIVE, 'Player already has an active challenge')
    }

    // Lock stake from wallet
    await walletService.lockStake(playerId, stake, 'pending')

    const expiresAt = new Date(Date.now() + (type === 'DIRECT' ? CHALLENGE_TIMEOUT_MS : ASYNC_TIMEOUT_MS))

    // Generate multiplier server-side before the game
    const { multiplier, seed } = generateMultiplier(`${playerId}-${Date.now()}`)

    const challenge = await prisma.challenge.create({
      data: {
        gameId,
        challengerId: playerId,
        type,
        status: 'PENDING',
        stake,
        multiplier: new Decimal(multiplier),
        multiplierSeed: seed,
        expiresAt,
      },
      include: {
        challenger: { include: { wallet: true } },
        opponent: { include: { wallet: true } },
        result: true,
      },
    })

    // Update wallet reference with actual challengeId
    // (stake was locked with 'pending' placeholder — update reference)
    await prisma.walletTransaction.updateMany({
      where: { reference: 'pending', walletId: (await prisma.wallet.findUnique({ where: { playerId } }))!.id },
      data: { reference: challenge.id },
    })

    // Enter matchmaking queue
    await matchmakingService.enqueue({
      playerId,
      gameId,
      stake,
      challengeId: challenge.id,
      rating: challenge.challenger.rating,
      expiresAt,
    })

    return challenge
  }

  async getById(challengeId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        challenger: { include: { wallet: true } },
        opponent: { include: { wallet: true } },
        result: true,
      },
    })
    if (!challenge) {
      throw new NotFoundError(ERROR_CODES.CHALLENGE_NOT_FOUND, `Challenge ${challengeId} not found`)
    }
    return challenge
  }

  async submitScore(challengeId: string, playerId: string, score: number) {
    const challenge = await this.getById(challengeId)

    if (!['MATCHED', 'ACTIVE', 'AWAITING_OPPONENT'].includes(challenge.status)) {
      throw new AppError(ERROR_CODES.CHALLENGE_EXPIRED, 'Challenge is not in a playable state')
    }

    const isChallenger = challenge.challengerId === playerId
    const isOpponent = challenge.opponentId === playerId

    if (!isChallenger && !isOpponent) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Player is not part of this challenge', 403)
    }

    // Check not already submitted
    if (isChallenger && challenge.challengerScore !== null) {
      throw new ConflictError(ERROR_CODES.VALIDATION_ERROR, 'Challenger already submitted score')
    }
    if (isOpponent && challenge.opponentScore !== null) {
      throw new ConflictError(ERROR_CODES.VALIDATION_ERROR, 'Opponent already submitted score')
    }

    const updateData: Partial<{
      challengerScore: number
      opponentScore: number
      status: ChallengeStatus
      startedAt: Date
    }> = isChallenger
      ? { challengerScore: score }
      : { opponentScore: score }

    // Set status based on submission state
    const otherScore = isChallenger ? challenge.opponentScore : challenge.challengerScore
    if (otherScore !== null) {
      // Both scores submitted — process result
      updateData.status = 'COMPLETED'
    } else {
      updateData.status = 'AWAITING_OPPONENT'
      if (!challenge.startedAt) updateData.startedAt = new Date()
    }

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
      include: {
        challenger: { include: { wallet: true } },
        opponent: { include: { wallet: true } },
        result: true,
        game: { include: { studio: true } },
      },
    })

    if (updated.status === 'COMPLETED' && updated.opponentId) {
      const result = await this.processResult(updated)
      return { challenge: result, isComplete: true }
    }

    return { challenge: updated, isComplete: false }
  }

  private async processResult(challenge: Awaited<ReturnType<typeof prisma.challenge.findUniqueOrThrow>>) {
    const { challengerScore, opponentScore, stake, multiplier, id, challengerId, opponentId } = challenge as typeof challenge & {
      challengerScore: number
      opponentScore: number
      opponentId: string
      game: { studio: { commissionRate: import('decimal.js').Decimal } }
    }

    const commissionRate = (challenge as typeof challenge & { game: { studio: { commissionRate: import('decimal.js').Decimal } } }).game.studio.commissionRate

    const pool = stake * 2
    const commissionAmount = Math.floor(pool * Number(commissionRate))
    const winnerPayout = pool - commissionAmount

    // Determine winner (higher score wins for DESC scoreOrder)
    let outcome: Outcome
    let winnerId: string
    let loserId: string

    if (challengerScore > opponentScore) {
      outcome = 'CHALLENGER_WIN'
      winnerId = challengerId
      loserId = opponentId!
    } else if (opponentScore > challengerScore) {
      outcome = 'OPPONENT_WIN'
      winnerId = opponentId!
      loserId = challengerId
    } else {
      outcome = 'DRAW'
      // Refund both on draw
      await walletService.refundStake(challengerId, stake, id)
      await walletService.refundStake(opponentId!, stake, id)

      const result = await prisma.$transaction([
        prisma.challenge.update({
          where: { id },
          data: { status: 'COMPLETED', completedAt: new Date(), winnerId: null, commission: 0, winnerPayout: 0 },
          include: { challenger: true, opponent: true, result: true },
        }),
        prisma.challengeResult.create({
          data: {
            challengeId: id,
            outcome: 'DRAW',
            challengerScore,
            opponentScore,
            multiplierApplied: multiplier ?? 0,
            challengerPayout: 0,
            opponentPayout: 0,
            waggoraCommission: 0,
          },
        }),
      ])
      return result[0]
    }

    // Settle wallet
    await walletService.settleChallenge({
      winnerId,
      loserId,
      stake,
      winnerPayout,
      commission: commissionAmount,
      challengeId: id,
    })

    // Persist result
    const [updated] = await prisma.$transaction([
      prisma.challenge.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          winnerId,
          commission: commissionAmount,
          winnerPayout,
        },
        include: { challenger: true, opponent: true, result: true },
      }),
      prisma.challengeResult.create({
        data: {
          challengeId: id,
          outcome,
          challengerScore,
          opponentScore,
          multiplierApplied: multiplier ?? 1,
          challengerPayout: winnerId === challengerId ? winnerPayout : -stake,
          opponentPayout: winnerId === opponentId ? winnerPayout : -stake,
          waggoraCommission: commissionAmount,
        },
      }),
    ])

    return updated
  }

  async cancel(challengeId: string, playerId: string) {
    const challenge = await this.getById(challengeId)

    if (challenge.challengerId !== playerId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Only the challenger can cancel', 403)
    }
    if (challenge.status !== 'PENDING') {
      throw new ConflictError(ERROR_CODES.CHALLENGE_CANNOT_CANCEL, 'Cannot cancel a matched challenge')
    }

    await walletService.refundStake(playerId, challenge.stake, challengeId)
    await matchmakingService.dequeue(playerId, challenge.gameId, challenge.stake)

    return prisma.challenge.update({
      where: { id: challengeId },
      data: { status: 'CANCELLED' },
    })
  }

  async getPlayerChallenges(playerId: string, status?: ChallengeStatus) {
    return prisma.challenge.findMany({
      where: {
        OR: [{ challengerId: playerId }, { opponentId: playerId }],
        ...(status ? { status } : {}),
      },
      include: { challenger: true, opponent: true, result: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }
}

export const challengeService = new ChallengeService()
