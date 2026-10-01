const Question = require('../../models/Question')
const Progress = require('../../models/Progress')

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard']
const WEIGHTS = { easy: 1, medium: 2, hard: 3 }
const SESSION_LENGTH = 5

// Grasp score for a single answer, 0-100, from correctness,
// difficulty weight and time taken (PRD 4.4).
function graspForAnswer({ correct, difficulty, timeTakenMs }) {
  const w = WEIGHTS[difficulty] || 1
  const timeLimitMs = 30_000 + 30_000 * w // easy 60s, medium 90s, hard 120s
  const timeFactor = Math.max(0, 1 - Math.min(timeTakenMs / timeLimitMs, 1))
  // Base for a correct answer scaled by difficulty; wrong answers score 0 but
  // fast wrong answers still show engagement via timeFactor.
  const base = correct ? 50 + 20 * (w - 1) : 0 // 50 / 70 / 90
  return Math.round(base + 10 * timeFactor)
}

function adaptDifficulty(current, correct) {
  const idx = DIFFICULTY_ORDER.indexOf(current)
  if (correct) return DIFFICULTY_ORDER[Math.min(idx + 1, 2)]
  return DIFFICULTY_ORDER[Math.max(idx - 1, 0)]
}

async function nextQuestion(userId, topicId, difficulty) {
  const filter = { topicId }
  if (difficulty && DIFFICULTY_ORDER.includes(difficulty)) filter.difficulty = difficulty
  // Prefer questions the user has not seen recently.
  const seen = await getSeenQuestionIds(userId, topicId)
  if (seen.size) filter._id = { $nin: [...seen] }
  let question = await Question.findOne(filter).sort({ difficulty: 1 }).lean()
  if (!question) {
    // Fallback: recycle questions once the pool for the difficulty is exhausted.
    delete filter._id
    question = await Question.findOne({ topicId }).lean()
  }
  return question
}

async function getSeenQuestionIds(userId, topicId) {
  const p = await Progress.findOne({ userId, topicId }).lean()
  return new Set((p?.seenQuestionIds || []).map(String))
}

async function recordAnswer({ userId, topicId, questionId, selectedIndex, timeTakenMs }) {
  const question = await Question.findById(questionId).lean()
  if (!question) {
    const err = new Error('Question not found')
    err.status = 404
    throw err
  }
  const correct = selectedIndex !== null && selectedIndex === question.correctIndex
  const gain = graspForAnswer({ correct, difficulty: question.difficulty, timeTakenMs })

  const progress = await Progress.findOne({ userId, topicId })
  const before = progress?.bestGrasp || 0
  // Exponential moving average pulls the stored grasp toward the latest answer.
  const after = Math.round(before * 0.7 + gain * 0.3)

  await Progress.findOneAndUpdate(
    { userId, topicId },
    {
      $set: { bestGrasp: after },
      $push: {
        seenQuestionIds: questionId,
        answers: {
          questionId,
          conceptTag: question.conceptTag,
          difficulty: question.difficulty,
          correct,
          timeTakenMs,
          gain,
          date: new Date(),
        },
      },
    },
    { upsert: true }
  )

  const nextDifficulty = adaptDifficulty(question.difficulty, correct)
  const grasp = after

  return {
    correct,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    gain,
    graspingPower: grasp,
    graspDelta: after - before,
    nextDifficulty,
    sessionLength: SESSION_LENGTH,
  }
}

async function finishQuiz(userId, topicId) {
  const p = await Progress.findOne({ userId, topicId }).lean()
  const answers = p?.answers || []
  // Consider only the last SESSION_LENGTH answers as the current session.
  const session = answers.slice(-SESSION_LENGTH)
  const answered = session.length
  const correctCount = session.filter((a) => a.correct).length
  const score = answered ? Math.round((correctCount / answered) * 100) : 0
  const graspingPower = p?.bestGrasp || 0

  const conceptStats = new Map()
  for (const a of session) {
    const s = conceptStats.get(a.conceptTag) || { attempts: 0, correct: 0 }
    s.attempts++
    if (a.correct) s.correct++
    conceptStats.set(a.conceptTag, s)
  }
  const weakConcepts = [...conceptStats.entries()]
    .filter(([, s]) => s.correct / s.attempts < 0.6)
    .map(([concept]) => concept)

  let recommendation = 'Move on to coding — you have solid understanding.'
  if (score < 50) recommendation = 'Revisit the visualizer, then retry the quiz.'
  else if (weakConcepts.length) recommendation = `Revisit these concepts: ${weakConcepts.join(', ')}.`
  else if (score < 80) recommendation = 'Good — try a medium coding problem next.'

  if (answered > 0) {
    await Progress.findOneAndUpdate(
      { userId, topicId },
      { $push: { quizAttempts: { topicId, score, graspingPower, date: new Date() } } }
    )
  }

  return {
    topicId,
    answered,
    correctCount,
    score,
    graspingPower,
    weakConcepts,
    recommendation,
  }
}

module.exports = {
  graspForAnswer,
  adaptDifficulty,
  nextQuestion,
  recordAnswer,
  finishQuiz,
  SESSION_LENGTH,
}
