require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const { connectMongo } = require('../config/db')
const User = require('../models/User')
const Syllabus = require('../models/Syllabus')
const Question = require('../models/Question')
const Problem = require('../models/Problem')
const Progress = require('../models/Progress')
const { syllabus, questionDocs, problems } = require('./seed-data')

function pad(n) {
  return String(n).padStart(2, '0')
}

async function seed() {
  await connectMongo()

  console.log('Clearing existing collections…')
  await Promise.all([
    User.deleteMany({}),
    Syllabus.deleteMany({}),
    Question.deleteMany({}),
    Problem.deleteMany({}),
    Progress.deleteMany({}),
  ])

  console.log('Seeding syllabus…')
  await Syllabus.insertMany(syllabus)

  console.log('Seeding question bank…')
  const questions = questionDocs()
  await Question.insertMany(questions)

  console.log('Seeding coding problems…')
  await Problem.insertMany(problems)

  console.log('Seeding users…')
  const passwordHash = await bcrypt.hash('password123', 10)
  const names = [
    'Aarav Kulkarni', 'Diya Shah', 'Kabir Mehta', 'Ananya Patil', 'Vihaan Joshi',
    'Ishita Rao', 'Reyansh Desai', 'Myra Nair', 'Arjun Iyer', 'Sara Khan',
    'Aditi More', 'Rohan Gupta', 'Kiara Singh', 'Dev Malhotra', 'Nisha Bhosale',
  ]
  const students = await User.insertMany(
    names.map((name, i) => ({
      name,
      email: `${name.split(' ')[0].toLowerCase()}@college.edu`,
      rollNo: `CE${pad(i + 1)}`,
      passwordHash,
      role: 'student',
      year: 'SY',
    }))
  )
  await User.create({
    name: 'Prof. Meera Iyer',
    email: 'faculty@college.edu',
    rollNo: 'FAC01',
    passwordHash,
    role: 'faculty',
    year: 'SY',
  })

  console.log('Seeding progress for 15 students…')
  const topicIds = syllabus.flatMap((s) => s.topics.map((t) => t.id))
  const algorithmIds = ['bfs', 'dfs', 'prim', 'kruskal', 'bst', 'astar']
  const progressDocs = []
  students.forEach((student, si) => {
    // Stronger students complete more topics; weakest complete few.
    const strength = 1 - si / (students.length + 2) // 15 → ~0.94 … ~0.12
    topicIds.forEach((topicId, ti) => {
      const r = (si * 7 + ti * 13) % 100 / 100 // deterministic pseudo-random
      const doSim = r < strength
      const doQuiz = r < strength * 0.9
      const doCode = r < strength * 0.6
      if (!doSim && !doQuiz && !doCode) return

      const grasp = Math.round(30 + strength * 60 + r * 10)
      const p = {
        userId: student._id,
        topicId,
        simulationCompleted: doSim,
        bestGrasp: doQuiz ? grasp : 0,
        quizAttempts: [],
        codeSubmissions: [],
        simulationCompletions: [],
        answers: [],
        createdAt: new Date(Date.now() - (si + 1) * 86400000),
      }
      if (doSim) {
        p.simulationCompletedAt = new Date(Date.now() - (si + 1) * 3600000)
        p.simulationCompletions.push({
          algorithmId: algorithmIds.includes(topicId) ? topicId : null,
          topicId,
          date: new Date(Date.now() - (si + 1) * 3600000),
        })
      }
      if (doQuiz) {
        const score = Math.min(100, Math.round(40 + strength * 55 + r * 10))
        p.quizAttempts.push({ topicId, score, graspingPower: grasp, date: new Date(Date.now() - (si + 1) * 7200000) })
        p.answers.push({
          questionId: new mongoose.Types.ObjectId(),
          conceptTag: 'seeded',
          difficulty: 'medium',
          correct: true,
          timeTakenMs: 12000,
          gain: grasp,
          date: new Date(Date.now() - (si + 1) * 7200000),
        })
      }
      if (doCode) {
        const prob = problems[(si + ti) % problems.length]
        p.codeSubmissions.push({
          problemId: null,
          language: 'python',
          passed: 3,
          total: 4,
          solved: true,
          date: new Date(Date.now() - (si + 1) * 5400000),
        })
      }
      progressDocs.push(p)
    })
  })
  await Progress.insertMany(progressDocs)
  console.log(`Inserted ${progressDocs.length} progress documents.`)

  console.log('\n✅ Seed complete.')
  console.log('   Student login: aarav@college.edu / password123 (all students use this password)')
  console.log('   Faculty login: faculty@college.edu / password123')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
