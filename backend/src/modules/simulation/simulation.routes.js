const router = require('express').Router()
const controller = require('./simulation.controller')
const { asyncHandler } = require('../../middleware/error')
const { auth } = require('../../middleware/auth')

router.get('/:algorithmId', auth, asyncHandler(controller.getSimulation))
router.post('/:algorithmId/complete', auth, asyncHandler(controller.complete))

module.exports = router
