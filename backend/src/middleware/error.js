// Wrap async route handlers so rejections flow into the error middleware.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}

function errorHandler(err, req, res, next) {
  console.error('[error]', err.message)
  if (res.headersSent) return next(err)
  const status = err.status || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    ...(err.details ? { details: err.details } : {}),
  })
}

module.exports = { asyncHandler, notFound, errorHandler }
