const router = require('express').Router()
const { validate, registerSchema, loginSchema } = require('../../middleware/validate')
const { asyncHandler } = require('../../middleware/error')
const { auth } = require('../../middleware/auth')
const controller = require('./auth.controller')

router.post('/register', validate(registerSchema), asyncHandler(controller.register))
router.post('/login', validate(loginSchema), asyncHandler(controller.login))
router.get('/me', auth, asyncHandler(controller.me))

module.exports = router
