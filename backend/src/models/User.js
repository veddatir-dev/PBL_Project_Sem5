const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    rollNo: { type: String, trim: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty'], required: true, index: true },
    year: { type: String, enum: ['SY', 'TY'] },
    graspingPower: { type: Number, default: 50 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
