const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      // Token invalid or expired
      return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
    }
    // Optionally allow server-side revocation via Redis token blocklist
    const { getRedis } = require('../config/db')
    const redis = getRedis()
    if (redis) {
      const revoked = await redis.get(`bl:${payload.id}:${payload.iat || ''}`)
      if (revoked) return res.status(401).json({ error: 'Session revoked, please log in again.' })
    }
    const user = await User.findById(payload.id).select('-passwordHash')
    if (!user) return res.status(401).json({ error: 'User no longer exists' })
    req.user = user
    req.tokenPayload = payload
    next()
  } catch (err) {
    next(err)
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden — this endpoint requires the ${role} role` })
    }
    next()
  }
}

module.exports = { signToken, auth, requireRole }
