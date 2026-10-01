const mongoose = require('mongoose')

const hiddenTestCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    hidden: { type: Boolean, default: true },
  },
  { _id: false }
)

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    output: { type: String, default: '' },
    explanation: { type: String, default: '' },
  },
  { _id: false }
)

const problemSchema = new mongoose.Schema(
  {
    topicId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    statement: { type: String, required: true },
    language: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    examples: [exampleSchema],
    hiddenTestCases: [hiddenTestCaseSchema],
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Problem', problemSchema)
