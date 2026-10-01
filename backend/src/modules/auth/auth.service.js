const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const Progress = require('../../models/Progress')
const { signToken } = require('../../middleware/auth')

async function register({ name, email, password, role, year, rollNo }) {
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    const err = new Error('An account with this email already exists')
    err.status = 409
    throw err
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, role, year, rollNo })
  return { user, token: signToken(user) }
}

async function login({ identifier, password }) {
  const id = identifier.trim().toLowerCase()
  const user = await User.findOne({
    $or: [{ email: id }, { rollNo: identifier.trim() }],
  })
  if (!user) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }
  return { user, token: signToken(user) }
}

module.exports = { register, login }
