const Progress = require('../../models/Progress')
const Syllabus = require('../../models/Syllabus')

function computeSubjectStats(allProgress, syllabus) {
  const subjects = new Map()
  for (const doc of syllabus) {
    if (!subjects.has(doc.subject)) {
      subjects.set(doc.subject, { subject: doc.subject, year: doc.year, semester: doc.semester, total: 0, done: 0 })
    }
    const s = subjects.get(doc.subject)
    s.total += doc.topics.length
    for (const t of doc.topics) {
      const p = allProgress.find((pr) => pr.topicId === t.id)
      if (p && (p.simulationCompleted || p.quizAttempts?.length || p.codeSubmissions?.length)) s.done++
    }
  }
  return [...subjects.values()].map((s) => ({
    ...s,
    percent: s.total ? Math.round((s.done / s.total) * 100) : 0,
  }))
}

function computeRecentActivity(allProgress) {
  const items = []
  for (const p of allProgress) {
    for (const sim of p.simulationCompletions || []) {
      items.push({ type: 'simulation', title: `Completed ${(sim.algorithmId || p.topicId || 'topic').toUpperCase()} simulation`, topicId: p.topicId, date: sim.date })
    }
    for (const quiz of p.quizAttempts || []) {
      items.push({ type: 'quiz', title: `Scored ${quiz.score}% on quiz`, topicId: p.topicId, date: quiz.date })
    }
    for (const code of p.codeSubmissions || []) {
      items.push({ type: 'code', title: `${code.solved ? 'Solved' : 'Attempted'} problem (${code.passed}/${code.total} tests)`, topicId: p.topicId, date: code.date })
    }
  }
  return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
}

async function getStudentProgress(userId) {
  const [allProgress, syllabus] = await Promise.all([
    Progress.find({ userId }).lean(),
    Syllabus.find().lean(),
  ])

  const totalTopics = syllabus.reduce((n, doc) => n + doc.topics.length, 0)
  const completedTopics = allProgress.filter(
    (p) => p.simulationCompleted || p.quizAttempts?.length || p.codeSubmissions?.length
  ).length
  const overallMastery = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0

  const attempts = allProgress.flatMap((p) => p.quizAttempts || [])
  const avgQuizScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0
  const graspTrend = attempts.slice(-8).map((a) => ({ date: a.date, grasp: a.graspingPower }))

  const solved = new Set()
  for (const p of allProgress) for (const c of p.codeSubmissions || []) if (c.solved) solved.add(c.problemId)
  const simulationsCompleted = allProgress.reduce((n, p) => n + (p.simulationCompletions?.length || 0), 0)

  // continue where you left off: most recently touched topic not yet fully done
  const last = [...allProgress].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).find((p) => !p.simulationCompleted)

  return {
    overallMastery,
    subjectStats: computeSubjectStats(allProgress, syllabus),
    stats: {
      simulationsCompleted,
      avgQuizScore,
      graspingPower: attempts.length ? attempts[attempts.length - 1].graspingPower : 0,
      problemsSolved: solved.size,
    },
    graspTrend,
    recentActivity: computeRecentActivity(allProgress),
    continueTopicId: last?.topicId || null,
  }
}

module.exports = { getStudentProgress }
