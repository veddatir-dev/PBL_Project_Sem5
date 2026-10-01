const service = require('./analytics.service')

exports.classOverview = async (req, res) => {
  const data = await service.getClassOverview()
  res.json(data)
}
