const service = require('./auth.service')

exports.register = async (req, res) => {
  const { user, token } = await service.register(req.body)
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, year: user.year, rollNo: user.rollNo },
  })
}

exports.login = async (req, res) => {
  const { user, token } = await service.login(req.body)
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, year: user.year, rollNo: user.rollNo },
  })
}

exports.me = async (req, res) => {
  const u = req.user
  res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role, year: u.year, rollNo: u.rollNo, graspingPower: u.graspingPower } })
}
