const mongoose = require('mongoose')
const Redis = require('ioredis')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/algo-learn'
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

let redis = null

async function connectMongo() {
  await mongoose.connect(MONGO_URI)
  console.log('[mongo] connected')
}

function connectRedis() {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 500, 5000),
    lazyConnect: true,
  })
  redis.on('error', (err) => console.error('[redis] error:', err.message))
  redis.on('connect', () => console.log('[redis] connected'))
  return redis.connect()
}

function getRedis() {
  return redis
}

module.exports = { connectMongo, connectRedis, getRedis, mongoose }
