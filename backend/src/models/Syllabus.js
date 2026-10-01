const mongoose = require('mongoose')

const topicSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // slug like 'bfs'
    name: { type: String, required: true },
    algorithmId: { type: String }, // used by /simulations/:algorithmId
  },
  { _id: false }
)

const syllabusSchema = new mongoose.Schema(
  {
    year: { type: String, enum: ['SY', 'TY'], required: true },
    semester: { type: Number, min: 1, max: 8, required: true },
    subject: { type: String, required: true },
    topics: [topicSchema],
  },
  { timestamps: true }
)

syllabusSchema.index({ year: 1, semester: 1, subject: 1 }, { unique: true })

module.exports = mongoose.model('Syllabus', syllabusSchema)
