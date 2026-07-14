import { createHmac, randomBytes } from 'crypto'
import { MULTIPLIERS, type Multiplier } from '@waggora/shared'
import { config } from '../config'

export interface MultiplierResult {
  multiplier: Multiplier
  seed: string
}

export function generateMultiplier(challengeId: string): MultiplierResult {
  const seed = randomBytes(32).toString('hex')
  const hmac = createHmac('sha256', config.MULTIPLIER_SECRET)
    .update(`${challengeId}:${seed}`)
    .digest('hex')

  // Derive index from first 8 hex chars of HMAC
  const index = parseInt(hmac.slice(0, 8), 16) % MULTIPLIERS.length
  const multiplier = MULTIPLIERS[index]

  return { multiplier, seed }
}

export function verifyMultiplier(challengeId: string, seed: string, multiplier: number): boolean {
  const hmac = createHmac('sha256', config.MULTIPLIER_SECRET)
    .update(`${challengeId}:${seed}`)
    .digest('hex')
  const index = parseInt(hmac.slice(0, 8), 16) % MULTIPLIERS.length
  return MULTIPLIERS[index] === multiplier
}
