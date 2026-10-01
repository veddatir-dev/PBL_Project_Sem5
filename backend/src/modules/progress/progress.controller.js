const service = require('./progress.service')

exports.me = async (req, res) => {
  const data = await service.getStudentProgress(req.user.id)
  res.json(data)
}
