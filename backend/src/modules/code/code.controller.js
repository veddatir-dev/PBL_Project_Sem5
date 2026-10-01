const Problem = require('../../models/Problem')
const service = require('./code.service')
const { runCodeSchema, validate } = require('../../middleware/validate')
const { asyncHandler } = require('../../middleware/error')

exports.listAll = async (req, res) => {
  const problems = await Problem.find().select('-hiddenTestCases').lean()
  res.json(problems)
}

exports.byTopic = async (req, res) => {
  const problems = await Problem.find({ topicId: req.params.topicId })
    .select('-hiddenTestCases')
    .lean()
  res.json(problems)
}

exports.getOne = async (req, res) => {
  const problem = await Problem.findById(req.params.problemId).select('-hiddenTestCases').lean()
  if (!problem) return res.status(404).json({ error: 'Problem not found' })
  res.json(problem)
}

exports.run = [
  validate(runCodeSchema),
  asyncHandler(async (req, res) => {
    const { problemId, language, source } = req.body
    const result = await service.runCode({ user: req.user, problemId, language, source })
    res.json(result)
  }),
]
