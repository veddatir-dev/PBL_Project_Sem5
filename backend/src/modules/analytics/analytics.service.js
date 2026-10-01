const Progress = require('../../models/Progress')
const Syllabus = require('../../models/Syllabus')
const User = require('../../models/User')

async function getClassOverview() {
  const [progress, syllabus, students] = await Promise.all([
    Progress.find().lean(),
    Syllabus.find().lean(),
    User.find({ role: 'student' }).select('name rollNo email year graspingPower').lean(),
  ])

  const progressByUser = new Map()
  for (const p of progress) {
    const key = p.userId.toString()
    if (!progressByUser.has(key)) progressByUser.set(key, [])
    progressByUser.get(key).push(p)
  }

  const studentRows = students.map((s) => {
    const progs = progressByUser.get(s._id.toString()) || []
    const attempts = progs.flatMap((p) => p.quizAttempts || [])
    const avgScore = attempts.length
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0
    const completedTopics = progs.filter((p) => p.simulationCompleted || p.quizAttempts?.length || p.codeSubmissions?.length).length
    const totalTopics = syllabus.reduce((n, doc) => n + doc.topics.length, 0)
    const mastery = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0
    const lastActivity = [
      ...(progs.flatMap((p) => p.simulationCompletions || []).map((x) => x.date)),
      ...(attempts.map((a) => a.date)),
      ...(progs.flatMap((p) => p.codeSubmissions || []).map((c) => c.date)),
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0]
    return {
      id: s._id,
      name: s.name,
      rollNo: s.rollNo,
      email: s.email,
      year: s.year,
      avgQuizScore: avgScore,
      mastery,
      lastActive: lastActivity || null,
    }
  }).sort((a, b) => b.mastery - a.mastery)

  // Per-topic analytics
  const topicStats = []
  for (const doc of syllabus) {
    for (const t of doc.topics) {
      const progs = progress.filter((p) => p.topicId === t.id)
      const attempts = progs.flatMap((p) => p.quizAttempts || [])
      const avgScore = attempts.length
        ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
        : null
      const simDone = progs.filter((p) => p.simulationCompleted).length
      const completionRate = students.length ? Math.round((simDone / students.length) * 100) : 0
      topicStats.push({
        topicId: t.id,
        topicName: t.name,
        subject: doc.subject,
        avgQuizScore: avgScore,
        completionRate,
        algorithmId: t.algorithmId,
      })
    }
  }

  const weakTopics = topicStats
    .filter((t) => t.avgQuizScore !== null)
    .sort((a, b) => a.avgQuizScore - b.avgQuizScore)
    .slice(0, 3)

  const withScores = studentRows.filter((s) => s.avgQuizScore > 0)
  const classAvgQuiz = withScores.length
    ? Math.round(withScores.reduce((s, x) => s + x.avgQuizScore, 0) / withScores.length)
    : 0
  const classCompletion = studentRows.length
    ? Math.round(studentRows.reduce((s, x) => s + x.mastery, 0) / studentRows.length)
    : 0

  return {
    totals: {
      students: studentRows.length,
      avgQuizScore: classAvgQuiz,
      completionRate: classCompletion,
    },
    topicStats,
    weakTopics,
    students: studentRows,
  }
}

module.exports = { getClassOverview }
