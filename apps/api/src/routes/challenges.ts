import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { challengeService } from '../services/challenge.service'
import { matchmakingService } from '../services/matchmaking.service'
import { formatChallenge } from './players'

const createChallengeBody = z.object({
  playerId: z.string().min(1),
  gameId: z.string().min(1),
  type: z.enum(['DIRECT', 'ASYNC']),
  stake: z.number().int().positive(),
})

const submitScoreBody = z.object({
  playerId: z.string().min(1),
  score: z.number().int().min(0),
  metadata: z.object({
    duration: z.number().int().optional(),
    level: z.number().int().optional(),
  }).optional(),
})

export const challengesRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /challenges
  fastify.post('/', async (req, reply) => {
    const body = createChallengeBody.parse(req.body)
    const studio = (req as any).studio

    const challenge = await challengeService.createChallenge({
      ...body,
      studioId: studio.id,
    })

    return reply.code(201).send({ challenge: formatChallenge(challenge) })
  })

  // GET /challenges/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (req) => {
    const challenge = await challengeService.getById(req.params.id)
    return { challenge: formatChallenge(challenge) }
  })

  // POST /challenges/:id/score
  fastify.post<{ Params: { id: string } }>('/:id/score', async (req) => {
    const { playerId, score } = submitScoreBody.parse(req.body)
    const { challenge, isComplete } = await challengeService.submitScore(req.params.id, playerId, score)

    // Re-fetch with result relation populated after settlement
    const fresh = isComplete
      ? await challengeService.getById(challenge.id)
      : challenge

    return {
      challenge: formatChallenge(fresh),
      isComplete,
      result: isComplete ? fresh.result : null,
    }
  })

  // POST /challenges/:id/cancel
  fastify.post<{ Params: { id: string } }>('/:id/cancel', async (req) => {
    const { playerId } = z.object({ playerId: z.string() }).parse(req.body)
    const challenge = await challengeService.cancel(req.params.id, playerId)
    return { challenge }
  })

  // GET /matchmaking/status/:playerId
  fastify.get<{ Params: { playerId: string } }>('/matchmaking/status/:playerId', async (req) => {
    const status = await matchmakingService.getStatus(req.params.playerId)
    return status
  })
}
