import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { config } from './config'
import { playersRoutes } from './routes/players'
import { challengesRoutes } from './routes/challenges'
import { leaderboardRoutes } from './routes/leaderboard'
import { marketplaceRoutes } from './routes/marketplace'
import { analyticsRoutes } from './routes/analytics'
import { adminRoutes } from './routes/admin'
import { studioService } from './services/studio.service'
import { AppError } from './lib/errors'
import { ZodError } from 'zod'

async function build() {
  const fastify = Fastify({
    logger: {
      transport: config.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  // ─── Plugins ──────────────────────────────────────────────────

  await fastify.register(cors, {
    origin: config.CORS_ORIGINS === '*' ? true : config.CORS_ORIGINS.split(','),
    credentials: true,
  })

  await fastify.register(jwt, { secret: config.JWT_SECRET })

  await fastify.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.headers['x-api-key'] as string ?? req.ip,
  })

  await fastify.register(swagger, {
    openapi: {
      info: { title: 'Waggora API', version: '1.0.0', description: 'B2B competitive gaming layer' },
      servers: [{ url: `http://localhost:${config.PORT}/v1`, description: 'Local' }],
      components: {
        securitySchemes: {
          ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
        },
      },
      security: [{ ApiKeyAuth: [] }],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list' },
  })

  // ─── Auth middleware ───────────────────────────────────────────

  // Studio API key authentication for all /v1 routes (except /admin and /health)
  fastify.addHook('preHandler', async (req, reply) => {
    const url = req.url
    if (url === '/health' || url.startsWith('/docs') || url.startsWith('/v1/admin')) return

    const apiKey = req.headers['x-api-key'] as string
    if (!apiKey) {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Missing X-API-Key header' })
    }

    try {
      const studio = await studioService.validateApiKey(apiKey)
      ;(req as any).studio = studio
    } catch {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Invalid API key' })
    }
  })

  // Admin key for /v1/admin routes
  fastify.addHook('preHandler', async (req, reply) => {
    if (!req.url.startsWith('/v1/admin')) return
    const adminKey = req.headers['x-admin-key']
    if (adminKey !== process.env.ADMIN_SECRET) {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Admin access required' })
    }
  })

  // ─── Error handler ────────────────────────────────────────────

  fastify.setErrorHandler((error, req, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        code: error.code,
        message: error.message,
        details: error.details,
      })
    }
    if (error instanceof ZodError) {
      return reply.code(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: error.flatten().fieldErrors,
      })
    }
    fastify.log.error(error)
    return reply.code(500).send({ code: 'INTERNAL_ERROR', message: 'Internal server error' })
  })

  // ─── Routes ───────────────────────────────────────────────────

  fastify.get('/health', () => ({ status: 'ok', version: '1.0.0' }))

  await fastify.register(playersRoutes, { prefix: '/v1/players' })
  await fastify.register(challengesRoutes, { prefix: '/v1/challenges' })
  await fastify.register(leaderboardRoutes, { prefix: '/v1' })
  await fastify.register(marketplaceRoutes, { prefix: '/v1/marketplace' })
  await fastify.register(analyticsRoutes, { prefix: '/v1/analytics' })
  await fastify.register(adminRoutes, { prefix: '/v1/admin' })

  return fastify
}

async function start() {
  const app = await build()
  await app.listen({ port: config.PORT, host: config.HOST })
  console.log(`🚀 Waggora API running at http://localhost:${config.PORT}`)
  console.log(`📖 Swagger docs at http://localhost:${config.PORT}/docs`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
