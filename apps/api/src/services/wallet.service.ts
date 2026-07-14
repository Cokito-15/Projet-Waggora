import { prisma, TransactionType } from '@waggora/db'
import { InsufficientBalanceError } from '../lib/errors'

export class WalletService {
  async getOrCreate(playerId: string) {
    return prisma.wallet.upsert({
      where: { playerId },
      update: {},
      create: { playerId, balance: 0, locked: 0, lifetime: 0 },
    })
  }

  async credit(
    playerId: string,
    amount: number,
    type: TransactionType,
    reference?: string,
    description?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { playerId } })
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
          lifetime: type === 'CREDIT_WIN' ? { increment: amount } : undefined,
        },
      })
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance + amount,
          reference,
          description,
        },
      })
      return updated
    })
  }

  async lockStake(playerId: string, amount: number, challengeId: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { playerId } })
      if (wallet.balance < amount) {
        throw new InsufficientBalanceError(wallet.balance, amount)
      }
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
          locked: { increment: amount },
        },
      })
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT_STAKE',
          amount: -amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance - amount,
          reference: challengeId,
          description: `Stake for challenge ${challengeId}`,
        },
      })
      return updated
    })
  }

  async settleChallenge(opts: {
    winnerId: string
    loserId: string
    stake: number
    winnerPayout: number
    commission: number
    challengeId: string
  }) {
    const { winnerId, loserId, stake, winnerPayout, commission, challengeId } = opts
    return prisma.$transaction(async (tx) => {
      // Release loser's lock (they lose their stake)
      const loserWallet = await tx.wallet.findUniqueOrThrow({ where: { playerId: loserId } })
      await tx.wallet.update({
        where: { id: loserWallet.id },
        data: { locked: { decrement: stake } },
      })
      await tx.walletTransaction.create({
        data: {
          walletId: loserWallet.id,
          type: 'DEBIT_STAKE',
          amount: -stake,
          balanceBefore: loserWallet.balance + stake,
          balanceAfter: loserWallet.balance,
          reference: challengeId,
          description: `Lost challenge ${challengeId}`,
        },
      })

      // Pay winner
      const winnerWallet = await tx.wallet.findUniqueOrThrow({ where: { playerId: winnerId } })
      const netGain = winnerPayout - stake // payout includes their own stake back
      await tx.wallet.update({
        where: { id: winnerWallet.id },
        data: {
          balance: { increment: winnerPayout },
          locked: { decrement: stake },
          lifetime: { increment: netGain > 0 ? netGain : 0 },
        },
      })
      await tx.walletTransaction.create({
        data: {
          walletId: winnerWallet.id,
          type: 'CREDIT_WIN',
          amount: winnerPayout,
          balanceBefore: winnerWallet.balance,
          balanceAfter: winnerWallet.balance + winnerPayout,
          reference: challengeId,
          description: `Won challenge ${challengeId} — commission: ${commission}`,
        },
      })
    })
  }

  async refundStake(playerId: string, amount: number, challengeId: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { playerId } })
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
          locked: { decrement: amount },
        },
      })
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT_REFUND',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance + amount,
          reference: challengeId,
          description: `Refund for cancelled/expired challenge ${challengeId}`,
        },
      })
    })
  }

  async deductPurchase(playerId: string, amount: number, itemId: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { playerId } })
      if (wallet.balance < amount) {
        throw new InsufficientBalanceError(wallet.balance, amount)
      }
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      })
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT_PURCHASE',
          amount: -amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance - amount,
          reference: itemId,
          description: `Marketplace purchase ${itemId}`,
        },
      })
      return updated
    })
  }
}

export const walletService = new WalletService()
