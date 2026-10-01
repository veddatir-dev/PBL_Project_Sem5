const service = require('./simulation.service')

exports.getSimulation = async (req, res) => {
  const sim = await service.getSteps(req.params.algorithmId)
  if (!sim) return res.status(404).json({ error: `No simulation found for algorithm '${req.params.algorithmId}'` })
  res.json(sim)
}

exports.complete = async (req, res) => {
  const result = await service.markComplete(req.user.id, req.params.algorithmId)
  res.json({ ok: true, ...result })
}
