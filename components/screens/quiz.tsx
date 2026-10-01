'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import * as api from '@/lib/api'
import type { ApiQuestion, QuizAnswerResult, QuizResult } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AppShell, Masthead } from '@/components/shell'
import { Btn, BtnLink, ComputingLoader, CountUp, MonoLabel, PanelHeader, TickDial } from '@/components/ui-kit'
import { WaveCurve } from '@/components/viz'
import { topicIdForAlgorithm } from '@/lib/product'

const SESSION_LEN = 5
const SOFT_LIMIT = 90

export function Quiz({ topicId }: { topicId: string }) {
  const [question, setQuestion] = useState<ApiQuestion | null>(null)
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<QuizAnswerResult | null>(null)
  const [grasp, setGrasp] = useState(50)
  const [graspPath, setGraspPath] = useState<number[]>([])
  const [marks, setMarks] = useState<('hit' | 'miss' | null)[]>(Array(SESSION_LEN).fill(null))
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState<QuizResult | null>(null)
  const [algoTopic, setAlgoTopic] = useState<string | null>(null)
  const startRef = useRef(Date.now())

  const load = useCallback(
    async (d?: string) => {
      setSelected(null)
      setResult(null)
      startRef.current = Date.now()
      setElapsed(0)
      try {
        const r = await api.getNextQuestion(topicId, d)
        setQuestion(r.question)
        setDifficulty(r.difficulty)
      } catch {
        setQuestion(null)
      }
    },
    [topicId]
  )

  useEffect(() => {
    load()
    api.getSyllabus().then((docs) => {
      const id = topicIdForAlgorithm(docs, topicId)
      const docsTopic = docs.flatMap((d) => d.topics).find((t) => t.algorithmId === topicId)
      setAlgoTopic(docsTopic?.algorithmId ?? null)
      void id
    }).catch(() => {})
  }, [load, topicId])

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [question])

  const answer = async (i: number) => {
    if (selected !== null || !question) return
    setSelected(i)
    try {
      const r = await api.submitAnswer({
        topicId,
        questionId: question._id,
        selectedIndex: i,
        timeTakenMs: Date.now() - startRef.current,
      })
      setResult(r)
      setGrasp(r.graspingPower)
      setGraspPath((p) => [...p, r.graspingPower])
      setMarks((m) => m.map((v, idx) => (idx === index ? (r.correct ? 'hit' : 'miss') : v)))
    } catch {}
  }

  const next = async () => {
    if (index + 1 >= SESSION_LEN) {
      try {
        const r = await api.finishQuiz(topicId)
        setFinished(r)
      } catch {}
      return
    }
    setIndex(index + 1)
    load(result?.nextDifficulty ?? difficulty)
  }

  /* ================= results ================= */
  if (finished) return <Results r={finished} graspPath={graspPath} topicId={topicId} algoTopic={algoTopic} onRetry={() => { setFinished(null); setIndex(0); setGrasp(50); setGraspPath([]); setMarks(Array(SESSION_LEN).fill(null)); load() }} />

  const timeFrac = Math.max(0, 1 - elapsed / SOFT_LIMIT)
  const low = timeFrac < 0.25

  return (
    <AppShell section="/quiz" defaultTopic={algoTopic ?? topicId}>
      <div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-12 lg:py-14">
        {/* header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <MonoLabel>ADAPTIVE ASSESSMENT — {topicId.toUpperCase()}</MonoLabel>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-[40px] leading-none text-ink">{String(index + 1).padStart(2, '0')}</span>
              <span className="font-mono text-[11px] tracking-[0.16em] text-ink-3">/ {String(SESSION_LEN).padStart(2, '0')}</span>
              <span
                className={cn(
                  'ml-3 border px-2.5 py-1 font-mono text-[9px] tracking-[0.18em]',
                  difficulty === 'hard'
                    ? 'border-danger/50 text-danger'
                    : difficulty === 'medium'
                      ? 'border-amber/50 text-amber'
                      : 'border-comp/50 text-comp'
                )}
              >
                {(difficulty ?? question?.difficulty ?? '—').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <MonoLabel>LIVE GRASPING POWER</MonoLabel>
            <div className="mt-1 font-display text-[30px] leading-none text-signal">
              <CountUp value={grasp} duration={0.7} />
            </div>
          </div>
        </div>

        {/* session ticks + clock */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex gap-1.5">
            {marks.map((m, i) => (
              <span
                key={i}
                className={cn(
                  'size-[7px] rotate-45 border transition-colors',
                  m === 'hit' ? 'border-signal bg-signal' : m === 'miss' ? 'border-danger bg-danger' : i === index ? 'border-amber' : 'border-[#2C4254]'
                )}
              />
            ))}
          </div>
          <div className="relative h-[2px] flex-1 bg-[#18242F]">
            <div
              className={cn('absolute inset-y-0 left-0 transition-[width] duration-1000 ease-linear', low ? 'bg-danger' : 'bg-signal')}
              style={{ width: `${timeFrac * 100}%` }}
            />
          </div>
          <span className={cn('w-12 text-right font-mono text-[11px]', low ? 'text-danger' : 'text-ink-2')}>
            {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
          </span>
        </div>

        {/* question */}
        {!question ? (
          <div className="mt-10">
            <ComputingLoader message="GENERATING ASSESSMENT" sub="selecting the next probe" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.section
              key={question._id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 border border-line bg-surface"
            >
              <div className="border-b border-line px-8 py-4">
                <MonoLabel>PROBE · {question.conceptTag.toUpperCase()}</MonoLabel>
              </div>
              <div className="px-8 py-9">
                <h2 className="min-h-[84px] font-display text-[24px] font-normal leading-[1.4] text-ink md:text-[27px]">
                  {question.text}
                </h2>

                <div className="mt-9 grid gap-3">
                  {question.options.map((opt, i) => {
                    const isCorrect = result && i === result.correctIndex
                    const isWrongPick = result && selected === i && !result.correct
                    return (
                      <motion.button
                        key={i}
                        onClick={() => answer(i)}
                        disabled={selected !== null}
                        whileHover={selected === null ? { x: 4 } : undefined}
                        className={cn(
                          'group flex items-center gap-5 border px-5 py-4 text-left transition-colors',
                          isCorrect
                            ? 'border-signal bg-[#0E2420]'
                            : isWrongPick
                              ? 'border-danger bg-[#2A1116]'
                              : selected !== null
                                ? 'border-line opacity-50'
                                : 'border-line-2 bg-surface-2 hover:border-signal/50'
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-8 shrink-0 place-items-center border font-mono text-[11px]',
                            isCorrect ? 'border-signal text-signal' : isWrongPick ? 'border-danger text-danger' : 'border-line-2 text-ink-3 group-hover:text-ink'
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className={cn('text-[14.5px] leading-6', isCorrect ? 'text-ink' : isWrongPick ? 'text-ink' : 'text-ink-2')}>{opt}</span>
                        {isCorrect && <span className="ml-auto font-mono text-[9px] tracking-[0.2em] text-signal">SIGNAL ✓</span>}
                        {isWrongPick && <span className="ml-auto font-mono text-[9px] tracking-[0.2em] text-danger">GAP ✕</span>}
                      </motion.button>
                    )
                  })}
                </div>

                {/* verdict */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className={cn('mt-8 border-l-2 bg-[#0A141E] px-6 py-5', result.correct ? 'border-signal' : 'border-danger')}>
                        <div className={cn('font-mono text-[10px] tracking-[0.2em]', result.correct ? 'text-signal' : 'text-danger')}>
                          {result.correct
                            ? `SIGNAL CONFIRMED — GRASP ${result.graspDelta >= 0 ? '+' : ''}${result.graspDelta}`
                            : `CONCEPT GAP — ${question.conceptTag.toUpperCase()}`}
                        </div>
                        <p className="mt-2.5 text-[13.5px] leading-6 text-ink-2">{result.explanation}</p>
                        <div className="mt-3 font-mono text-[9.5px] tracking-[0.16em] text-ink-3">
                          NEXT PROBE DIFFICULTY → {result.nextDifficulty.toUpperCase()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-9 flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-[0.18em] text-ink-3">DIFFICULTY ADAPTS TO YOUR RESPONSES</span>
                  <Btn kind="primary" disabled={selected === null || !result} onClick={next}>
                    {index + 1 >= SESSION_LEN ? 'Compute Results →' : 'Next Probe →'}
                  </Btn>
                </div>
              </div>
            </motion.section>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  )
}

/* ================= results ================= */

function Results({
  r,
  graspPath,
  topicId,
  algoTopic,
  onRetry,
}: {
  r: QuizResult
  graspPath: number[]
  topicId: string
  algoTopic: string | null
  onRetry: () => void
}) {
  const strong = r.score >= 80
  const mid = r.score >= 50
  const hasAlgo = !!algoTopic
  const goToCoding = !r.weakConcepts.length

  return (
    <AppShell section="/quiz" defaultTopic={topicId}>
      <div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-12 lg:py-14">
        <MonoLabel>ASSESSMENT COMPLETE — {topicId.toUpperCase()}</MonoLabel>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="mt-5 max-w-2xl font-display text-[38px] font-medium leading-[1.15] tracking-[-0.015em] text-ink md:text-[48px]">
            {strong ? (
              <>
                You understand the structure. <span className="text-signal">Ready to build the solution.</span>
              </>
            ) : mid ? (
              <>
                You understand the structure. <span className="text-amber">One concept still needs reinforcement.</span>
              </>
            ) : (
              <>
                The foundation needs work. <span className="text-danger">Revisit the model, then retake.</span>
              </>
            )}
          </h1>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-[1fr_1.3fr]">
          {/* score dial */}
          <section className="border border-line bg-surface p-7">
            <PanelHeader label="SESSION OUTPUT" title="Score" />
            <div className="mt-6 flex items-center justify-around">
              <div className="text-center">
                <TickDial value={r.score} size={92} />
                <div className="mt-2 font-mono text-[8.5px] tracking-[0.18em] text-ink-3">CORRECT {r.correctCount}/{r.answered}</div>
              </div>
              <div>
                <div className="font-display text-[64px] font-medium leading-none text-signal">
                  <CountUp value={r.graspingPower} />
                </div>
                <div className="mt-2 font-mono text-[8.5px] tracking-[0.2em] text-ink-3">GRASPING POWER / 100</div>
              </div>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              {graspPath.length >= 2 ? (
                <WaveCurve points={graspPath} height={90} />
              ) : (
                <div className="font-mono text-[9px] tracking-[0.16em] text-ink-3">GRASP TRAJECTORY — {graspPath.join(' → ') || '—'}</div>
              )}
            </div>
          </section>

          {/* weak concepts + recommendation */}
          <section className="flex flex-col border border-line bg-surface">
            <div className="border-b border-line px-7 py-5">
              <PanelHeader label="CONCEPT STRENGTH" title="Where the signal dropped" />
            </div>
            <div className="flex flex-col">
              {r.weakConcepts.length ? (
                r.weakConcepts.map((c, i) => (
                  <div key={c} className="flex items-center gap-4 border-b border-line/60 px-7 py-4 last:border-0">
                    <span className="size-1.5 rotate-45 bg-amber" />
                    <span className="flex-1 text-[13.5px] text-ink-2">{c}</span>
                    <span className="font-mono text-[9px] tracking-[0.18em] text-amber">NEEDS REINFORCEMENT</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 px-7 py-4">
                  <span className="size-1.5 rotate-45 bg-signal" />
                  <span className="flex-1 text-[13.5px] text-ink-2">All probed concepts held — no gaps detected.</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] text-signal">CLEAN</span>
                </div>
              )}
            </div>
            <div className="mt-auto border-t border-line bg-[#0A141E] px-7 py-6">
              <MonoLabel>RECOMMENDED NEXT ACTION</MonoLabel>
              <p className="mt-3 font-display text-[19px] text-ink">{r.recommendation}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {goToCoding || !hasAlgo ? (
                  <BtnLink href={`/code/${topicId}-code`} kind="primary">Move on to Coding</BtnLink>
                ) : (
                  <BtnLink href={`/visualize/${algoTopic}`} kind="primary">Revisit the Visualizer</BtnLink>
                )}
                <Btn kind="outline" onClick={onRetry}>Retake Assessment</Btn>
                <BtnLink href="/dashboard" kind="ghost">Dashboard →</BtnLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
