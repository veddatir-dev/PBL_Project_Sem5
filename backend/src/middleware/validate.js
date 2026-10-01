const { z } = require('zod')

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      })
    }
    req[source] = result.data
    next()
  }
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  rollNo: z.string().min(3).max(20).optional(),
  password: z.string().min(6).max(128),
  role: z.enum(['student', 'faculty']),
  year: z.enum(['SY', 'TY']).optional(),
})

const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or roll number is required'),
  password: z.string().min(1, 'Password is required'),
})

const answerSchema = z.object({
  topicId: z.string().min(1),
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).max(9).nullable(),
  timeTakenMs: z.number().int().min(0).max(10 * 60 * 1000),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
})

const runCodeSchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(['c', 'cpp', 'java', 'python']),
  source: z.string().min(1, 'Source code is required').max(100_000),
})

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  answerSchema,
  runCodeSchema,
}
