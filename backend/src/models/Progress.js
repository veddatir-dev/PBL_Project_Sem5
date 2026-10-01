const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId },
    conceptTag: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    correct: { type: Boolean },
    timeTakenMs: { type: Number },
    gain: { type: Number },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const quizAttemptSchema = new mongoose.Schema(
  {
    topicId: { type: String, required: true },
    score: { type: Number }, // percent 0-100 for the session
    graspingPower: { type: Number }, // grasp after session
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const codeSubmissionSchema = new mongoose.Schema(
  {
    problemId: { type: String },
    language: { type: String },
    passed: { type: Number },
    total: { type: Number },
    solved: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const simulationCompletionSchema = new mongoose.Schema(
  {
    algorithmId: { type: String },
    topicId: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: String, required: true },
    simulationCompleted: { type: Boolean, default: false },
    simulationCompletedAt: { type: Date },
    bestGrasp: { type: Number, default: 0 },
    seenQuestionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    answers: [answerSchema],
    quizAttempts: [quizAttemptSchema],
    codeSubmissions: [codeSubmissionSchema],
    simulationCompletions: [simulationCompletionSchema],
  },
  { timestamps: true }
)

progressSchema.index({ userId: 1, topicId: 1 }, { unique: true })

module.exports = mongoose.model('Progress', progressSchema)
