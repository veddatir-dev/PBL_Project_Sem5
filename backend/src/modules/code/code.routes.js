const router = require('express').Router()
const controller = require('./code.controller')
const { asyncHandler } = require('../../middleware/error')
const { auth, requireRole } = require('../../middleware/auth')

router.get('/', requireRole('faculty'), asyncHandler(controller.listAll))
router.get('/:topicId', auth, asyncHandler(controller.byTopic))
router.get('/detail/:problemId', auth, asyncHandler(controller.getOne))
router.post('/run', auth, ...controller.run)
// faculty-only analytics of submissions would live in analytics module

module.exports = router
