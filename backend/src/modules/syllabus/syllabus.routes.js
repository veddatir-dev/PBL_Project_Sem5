const syllabusRoutes = require('express').Router()
const controller = require('./syllabus.controller')
const { asyncHandler } = require('../../middleware/error')
const { auth } = require('../../middleware/auth')

syllabusRoutes.get('/', auth, asyncHandler(controller.getSyllabus))
syllabusRoutes.get('/topics/:id', auth, asyncHandler(controller.getTopic))

module.exports = syllabusRoutes
