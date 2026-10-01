const router = require('express').Router()
const controller = require('./analytics.controller')
const { asyncHandler } = require('../../middleware/error')
const { auth, requireRole } = require('../../middleware/auth')

router.get('/class-overview', auth, requireRole('faculty'), asyncHandler(controller.classOverview))

module.exports = router
