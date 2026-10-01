const { getSimulation } = require('./simulation.steps')
const Progress = require('../../models/Progress')
const Syllabus = require('../../models/Syllabus')

async function getSteps(algorithmId) {
  const sim = getSimulation(algorithmId)
  if (!sim) return null
  return sim
}

function findTopicByAlgorithm(algorithmId) {
  // Topic id equals the algorithm id for every topic that has one.
  return Syllabus.findOne({ 'topics.algorithmId': algorithmId }).lean()
}

async function markComplete(userId, algorithmId) {
  const syllabusDoc = await findTopicByAlgorithm(algorithmId)
  let topicId = algorithmId
  if (syllabusDoc) {
    const topic = syllabusDoc.topics.find((t) => t.algorithmId === algorithmId)
    if (topic) topicId = topic.id
  }
  await Progress.findOneAndUpdate(
    { userId, topicId },
    {
      $set: { simulationCompleted: true, simulationCompletedAt: new Date() },
      $push: { simulationCompletions: { algorithmId, topicId, date: new Date() } },
    },
    { upsert: true }
  )
  return { topicId, algorithmId }
}

module.exports = { getSteps, markComplete, findTopicByAlgorithm }
