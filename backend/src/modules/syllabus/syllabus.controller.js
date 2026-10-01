const service = require('./syllabus.service')

exports.getSyllabus = async (req, res) => {
  let syllabus = await service.getSyllabus()
  syllabus = await service.enrichTopicsWithProgress(req.user.id, syllabus)
  res.json(syllabus)
}

exports.getTopic = async (req, res) => {
  const { topic, parent } = await service.getTopic(req.params.id)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  res.json({ topic, subject: parent ? { year: parent.year, semester: parent.semester, subject: parent.subject } : null })
}
