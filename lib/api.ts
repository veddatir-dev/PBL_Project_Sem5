// Real API client — replaces the mock implementations from /lib/mock-data.ts.
// Every call goes to the backend defined by NEXT_PUBLIC_API_URL with the JWT
// attached as an Authorization: Bearer header.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const TOKEN_KEY = 'algolearn_token'
const USER_KEY = 'algolearn_user'

// ---------- token / session helpers ----------

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token: string, user: ApiUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ApiUser
  } catch {
    return null
  }
}

// ---------- toast event bridge (rendered by a <ToastHost/> in the layout/page) ----------

export type ToastKind = 'success' | 'error' | 'info'
export function toast(message: string, kind: ToastKind = 'info') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('algolearn:toast', { detail: { message, kind } }))
}

// ---------- low-level request helper ----------

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  const token = getToken()
  if (token && !options.skipAuth) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    toast('Cannot reach the server — is the backend running?', 'error')
    throw new ApiError(0, 'Network error')
  }

  if (res.status === 401 && !options.skipAuth) {
    clearSession()
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    throw new ApiError(401, 'Session expired')
  }
  if (res.status === 403) {
    const body = await res.json().catch(() => ({ error: 'Forbidden' }))
    toast(body.error || 'You do not have permission for this action', 'error')
    throw new ApiError(403, body.error || 'Forbidden')
  }

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (body as { error?: string }).error || `Request failed (${res.status})`)
  }
  return body as T
}

// ---------- types ----------

export interface ApiUser {
  id: string
  name: string
  email: string
  role: 'student' | 'faculty'
  year?: 'SY' | 'TY' | null
  rollNo?: string | null
}

export interface ApiTopic {
  id: string
  name: string
  algorithmId?: string | null
  simulationCompleted?: boolean
  quizAttempts?: number
  codeSubmissions?: number
}

export interface ApiSyllabusDoc {
  _id: string
  year: 'SY' | 'TY'
  semester: number
  subject: string
  topics: ApiTopic[]
}

export interface ApiQuestion {
  _id: string
  topicId: string
  conceptTag: string
  difficulty: 'easy' | 'medium' | 'hard'
  text: string
  options: string[]
}

export interface QuizAnswerResult {
  correct: boolean
  correctIndex: number
  explanation: string
  gain: number
  graspingPower: number
  graspDelta: number
  nextDifficulty: 'easy' | 'medium' | 'hard'
  sessionLength: number
}

export interface QuizResult {
  topicId: string
  answered: number
  correctCount: number
  score: number
  graspingPower: number
  weakConcepts: string[]
  recommendation: string
}

export interface ApiProblem {
  _id: string
  topicId: string
  title: string
  statement: string
  difficulty: string
  examples: { input: string; output: string; explanation?: string }[]
  starterCode?: Record<string, string>
}

export type CodeLanguage = 'c' | 'cpp' | 'java' | 'python'

export interface CodeRunResult {
  summary: { passed: number; total: number; allPassed: boolean }
  totalMs: number
  results: {
    statusId: number
    statusDescription: string
    passed: boolean
    stdout: string
    stderr: string
    compileOutput: string
    time: string | null
    memory: string | null
  }[]
}

export interface Simulation {
  algorithmId: string
  name: string
  pseudocode: string[]
  steps: {
    description: string
    pseudocodeLine: number
    activeNode: number | null
    visited: number[]
    frontier: number[]
    treeEdges: [number, number][]
    vars: Record<string, unknown>
  }[]
}

export interface StudentProgress {
  overallMastery: number
  subjectStats: { subject: string; percent: number; total: number; done: number }[]
  stats: {
    simulationsCompleted: number
    avgQuizScore: number
    graspingPower: number
    problemsSolved: number
  }
  graspTrend: { date: string; grasp: number }[]
  recentActivity: { type: string; title: string; topicId: string; date: string }[]
  continueTopicId: string | null
}

export interface FacultyOverview {
  totals: { students: number; avgQuizScore: number; completionRate: number }
  topicStats: { topicId: string; topicName: string; subject: string; avgQuizScore: number | null; completionRate: number; algorithmId?: string | null }[]
  weakTopics: { topicId: string; topicName: string; avgQuizScore: number }[]
  students: { id: string; name: string; rollNo?: string; mastery: number; avgQuizScore: number; lastActive: string | null }[]
}

// ---------- auth ----------

export async function login(identifier: string, password: string): Promise<{ token: string; user: ApiUser }> {
  const data = await request<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ identifier, password }),
  })
  setSession(data.token, data.user)
  return data
}

export async function register(input: {
  name: string
  email: string
  password: string
  role: 'student' | 'faculty'
  year?: 'SY' | 'TY'
  rollNo?: string
}): Promise<{ token: string; user: ApiUser }> {
  const data = await request<{ token: string; user: ApiUser }>('/auth/register', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify(input),
  })
  setSession(data.token, data.user)
  return data
}

export function logout() {
  clearSession()
  window.location.href = '/login'
}

// ---------- syllabus ----------

export async function getSyllabus(): Promise<ApiSyllabusDoc[]> {
  return request<ApiSyllabusDoc[]>('/syllabus')
}

export async function getTopic(id: string): Promise<{ topic: ApiTopic; subject: { year: string; semester: number; subject: string } | null }> {
  return request(`/topics/${id}`)
}

// ---------- simulations ----------

export async function getSimulation(algorithmId: string): Promise<Simulation> {
  return request(`/simulations/${algorithmId}`)
}

export async function completeSimulation(algorithmId: string): Promise<{ ok: boolean }> {
  return request(`/simulations/${algorithmId}/complete`, { method: 'POST' })
}

// ---------- quiz ----------

export async function getNextQuestion(topicId: string, difficulty?: string): Promise<{ question: ApiQuestion; difficulty: string }> {
  const qs = difficulty ? `?difficulty=${encodeURIComponent(difficulty)}` : ''
  return request(`/quiz/${topicId}/next${qs}`)
}

export async function submitAnswer(input: {
  topicId: string
  questionId: string
  selectedIndex: number | null
  timeTakenMs: number
}): Promise<QuizAnswerResult> {
  return request('/quiz/answer', { method: 'POST', body: JSON.stringify(input) })
}

export async function finishQuiz(topicId: string): Promise<QuizResult> {
  return request(`/quiz/${topicId}/finish`, { method: 'POST' })
}

// ---------- problems & code ----------

export async function getProblems(topicId: string): Promise<ApiProblem[]> {
  return request(`/problems/${topicId}`)
}

export async function runCode(problemId: string, language: CodeLanguage, source: string): Promise<CodeRunResult> {
  return request('/code/run', { method: 'POST', body: JSON.stringify({ problemId, language, source }) })
}

// ---------- progress & faculty ----------

export async function getMyProgress(): Promise<StudentProgress> {
  return request('/progress/me')
}

export async function getClassOverview(): Promise<FacultyOverview> {
  return request('/faculty/class-overview')
}
