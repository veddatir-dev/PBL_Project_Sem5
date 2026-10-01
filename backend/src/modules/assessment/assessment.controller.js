const service = require('./assessment.service')

exports.next = async (req, res) => {
  const { topicId } = req.params
  const { difficulty } = req.query
  const question = await service.nextQuestion(req.user.id, topicId, difficulty)
  if (!question) return res.status(404).json({ error: 'No questions available for this topic' })
  // Strip the answer key before sending to the client.
  const { correctIndex, explanation, ...safe } = question
  res.json({ question: safe, difficulty: question.difficulty })
}

exports.answer = async (req, res) => {
  const { topicId, questionId, selectedIndex, timeTakenMs } = req.body
  const result = await service.recordAnswer({
    userId: req.user.id,
    topicId,
    questionId,
    selectedIndex,
    timeTakenMs,
  })
  res.json(result)
}

exports.finish = async (req, res) => {
  const result = await service.finishQuiz(req.user.id, req.params.topicId)
  res.json(result)
}
