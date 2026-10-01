require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const { connectMongo, connectRedis, getRedis } = require('./config/db')
const { notFound, errorHandler } = require('./middleware/error')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(helmet())
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true) // curl / same-origin
      if (allowedOrigins.includes(origin)) return cb(null, true)
      // Dev convenience: allow any localhost port (Next may bind a random one)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true)
      return cb(null, false)
    },
    credentials: true,
  })
)
app.use(express.json({ limit: '256kb' }))

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
})
app.use('/api', apiLimiter)

app.get('/api/health', (req, res) => {
  const redis = getRedis()
  res.json({
    ok: true,
    mongo: mongooseHealthy(),
    redis: redis && redis.status === 'ready' ? 'up' : redis ? redis.status : 'down',
  })
})
function mongooseHealthy() {
  return require('mongoose').connection.readyState === 1
}

app.use('/api/auth', require('./modules/auth/auth.routes'))
app.use('/api/syllabus', require('./modules/syllabus/syllabus.routes'))
app.use('/api/simulations', require('./modules/simulation/simulation.routes'))
app.use('/api/quiz', require('./modules/assessment/assessment.routes'))
app.use('/api/problems', require('./modules/code/code.routes'))
app.use('/api/code', require('./modules/code/code.routes'))
app.use('/api/topics', require('./modules/syllabus/syllabus.routes'))
app.use('/api/progress', require('./modules/progress/progress.routes'))
app.use('/api/faculty', require('./modules/analytics/analytics.routes'))

app.use(notFound)
app.use(errorHandler)

const PORT = parseInt(process.env.PORT || '', 10) || 4000

async function start() {
  await connectMongo()
  try {
    await connectRedis()
  } catch (err) {
    console.error('[redis] initial connection failed:', err.message)
  }
  app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`))
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Fatal startup error:', err)
    process.exit(1)
  })
}

module.exports = app
