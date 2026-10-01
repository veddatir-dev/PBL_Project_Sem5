const router = require('express').Router()
const controller = require('./progress.controller')
const { asyncHandler } = require('../../middleware/error')
const { auth } = require('../../middleware/auth')

router.get('/me', auth, asyncHandler(controller.me))

module.exports = router
