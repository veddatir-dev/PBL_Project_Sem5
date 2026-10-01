const Problem = require('../../models/Problem')
const Progress = require('../../models/Progress')
const { getRedis } = require('../../config/db')

const LANG_IDS = { c: 50, cpp: 54, java: 62, python: 71 }
const JUDGE0_URL = (process.env.JUDGE0_URL || '').replace(/\/+$/, '')
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || ''
const SUBMISSION_TIMEOUT_MS = 12_000 // hard timeout per run
const BATCH_CONCURRENCY = 3
const RATE_LIMIT_WINDOW_S = 60
const RATE_LIMIT_MAX = 12 // runs per minute per user

function judge0Configured() {
  return Boolean(JUDGE0_URL)
}

function headers() {
  const h = { 'Content-Type': 'application/json' }
  if (JUDGE0_API_KEY) {
    h['X-RapidAPI-Key'] = JUDGE0_API_KEY
    h['X-Auth-Token'] = JUDGE0_API_KEY
  }
  return h
}

async function createSubmission({ language, source, stdin, expectedOutput }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS)
  try {
    const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        source_code: source,
        language_id: LANG_IDS[language] || 71,
        stdin,
        expected_output: expectedOutput,
        cpu_time_limit: 5,
        memory_limit: 256000,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const err = new Error(`Judge0 returned HTTP ${res.status} ${text.slice(0, 200)}`)
      err.status = 502
      throw err
    }
    return res.json() // { token }
  } finally {
    clearTimeout(timer)
  }
}

async function getSubmission(token) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS)
  try {
    const res = await fetch(
      `${JUDGE0_URL}/submissions/${encodeURIComponent(token)}?base64_encoded=false`,
      { headers: headers(), signal: controller.signal }
    )
    if (!res.ok) {
      const err = new Error(`Judge0 returned HTTP ${res.status}`)
      err.status = 502
      throw err
    }
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function runOne(tc, language, source) {
  const { token } = await createSubmission({ language, source, stdin: tc.input, expectedOutput: tc.expectedOutput })
  const deadline = Date.now() + SUBMISSION_TIMEOUT_MS
  while (Date.now() < deadline) {
    const r = await getSubmission(token)
    if (r.status && r.status.id >= 3) {
      const statusId = r.status.id
      const passed =
        statusId === 3 &&
        (r.stdout || '').trim() === (tc.expectedOutput || '').trim()
      return {
        statusId,
        statusDescription: r.status.description,
        passed,
        stdout: r.stdout || '',
        stderr: r.stderr || '',
        compileOutput: r.compile_output || '',
        time: r.time ? `${(parseFloat(r.time) * 1000).toFixed(1)}ms` : null,
        memory: r.memory ? `${(r.memory / 1024).toFixed(1)} MB` : null,
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  return { statusId: 13, statusDescription: 'Internal Error (timeout)', passed: false, stdout: '', stderr: 'Execution timed out', compileOutput: '', time: null, memory: null }
}

async function runWithConcurrency(testCases, language, source, n = BATCH_CONCURRENCY) {
  const results = new Array(testCases.length)
  let i = 0
  async function worker() {
    while (i < testCases.length) {
      const idx = i++
      results[idx] = await runOne(testCases[idx], language, source)
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, testCases.length) }, worker))
  return results
}

async function checkRateLimit(userId) {
  const redis = getRedis()
  if (!redis || redis.status !== 'ready') return { ok: true } // degrade gracefully
  const key = `rl:code:${userId}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW_S)
  if (count > RATE_LIMIT_MAX) {
    const ttl = await redis.ttl(key)
    return {
      ok: false,
      retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_S,
    }
  }
  return { ok: true }
}

function summarize(results) {
  const passed = results.filter((r) => r.passed).length
  return { passed, total: results.length, allPassed: passed === results.length }
}

async function runCode({ user, problemId, language, source }) {
  if (!judge0Configured()) {
    const err = new Error(
      'Judge0 is not configured. Set JUDGE0_URL (and JUDGE0_API_KEY if your plan requires it) in backend/.env.'
    )
    err.status = 503
    throw err
  }
  const problem = await Problem.findById(problemId)
  if (!problem) {
    const err = new Error('Problem not found')
    err.status = 404
    throw err
  }
  const rate = await checkRateLimit(user.id || user._id)
  if (!rate.ok) {
    const err = new Error(`Rate limit exceeded. Try again in ${rate.retryAfter}s.`)
    err.status = 429
    throw err
  }

  const testCases = problem.hiddenTestCases || []
  if (!testCases.length) {
    const err = new Error('This problem has no test cases configured')
    err.status = 400
    throw err
  }
  const started = Date.now()
  const results = await runWithConcurrency(testCases, language, source)
  const summary = summarize(results)
  const totalMs = Date.now() - started

  await Progress.findOneAndUpdate(
    { userId: user.id || user._id, topicId: problem.topicId },
    {
      $push: {
        codeSubmissions: {
          problemId,
          language,
          passed: summary.passed,
          total: summary.total,
          solved: summary.allPassed,
          date: new Date(),
        },
      },
    },
    { upsert: true }
  )

  return { summary, totalMs, results }
}

module.exports = { runCode, judge0Configured, LANG_IDS }
