const Syllabus = require('../../models/Syllabus')
const { getRedis } = require('../../config/db')
const Progress = require('../../models/Progress')

const CACHE_KEY = 'syllabus:all'

async function getSyllabus(userId) {
  const redis = getRedis()
  if (redis && redis.status === 'ready') {
    const cached = await redis.get(CACHE_KEY)
    if (cached) return JSON.parse(cached)
  }
  const docs = await Syllabus.find().sort({ year: 1, semester: 1, subject: 1 }).lean()
  if (redis && redis.status === 'ready') {
    // cache for 1 hour; syllabus is static
    await redis.set(CACHE_KEY, JSON.stringify(docs), 'EX', 3600)
  }
  return docs
}

async function invalidateSyllabusCache() {
  const redis = getRedis()
  if (redis && redis.status === 'ready') await redis.del(CACHE_KEY)
}

async function getTopic(id) {
  // Topic ids are unique across the syllabus collection; search all docs.
  const all = await Syllabus.find().lean()
  let topic = null
  let parent = null
  for (const doc of all) {
    const found = doc.topics.find((t) => t.id === id)
    if (found) {
      topic = found
      parent = doc
      break
    }
  }
  return { topic, parent }
}

async function enrichTopicsWithProgress(userId, syllabus) {
  const progress = await Progress.find({ userId }).lean()
  const byTopic = new Map(progress.map((p) => [p.topicId, p]))
  return syllabus.map((doc) => ({
    ...doc,
    topics: doc.topics.map((t) => {
      const p = byTopic.get(t.id)
      return {
        ...t,
        simulationCompleted: !!p?.simulationCompleted,
        quizAttempts: p?.quizAttempts?.length || 0,
        codeSubmissions: p?.codeSubmissions?.length || 0,
      }
    }),
  }))
}

module.exports = { getSyllabus, invalidateSyllabusCache, getTopic, enrichTopicsWithProgress }
