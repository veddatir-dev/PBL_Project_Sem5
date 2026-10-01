const router = require('express').Router()
const controller = require('./assessment.controller')
const { asyncHandler } = require('../../middleware/error')
const { auth } = require('../../middleware/auth')

router.get('/:topicId/next', auth, asyncHandler(controller.next))
router.post('/answer', auth, asyncHandler(controller.answer))
router.post('/:topicId/finish', auth, asyncHandler(controller.finish))

module.exports = router
