'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import * as api from '@/lib/api'
import type { ApiSyllabusDoc, StudentProgress } from '@/lib/api'
import { AppShell, Masthead } from '@/components/shell'
import { BtnLink, ComputingLoader, CountUp, EmptyState, Meter, MonoLabel, PanelHeader, ProgressTopology } from '@/components/ui-kit'
import { ExecutionMarkers, MasteryMap, NodeChain, WaveCurve, type MapTopic } from '@/components/viz'
import { greeting } from '@/lib/product'

const date = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase()

export function Dashboard() {
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [syllabus, setSyllabus] = useState<ApiSyllabusDoc[] | null>(null)
  const user = api.getStoredUser()

  useEffect(() => {
    api.getMyProgress().then(setProgress).catch(() => setProgress(null))
    api.getSyllabus().then(setSyllabus).catch(() => setSyllabus(null))
  }, [])

  /* ----- resolve continue topic with its subject ----- */
  const continueTopic = useMemo(() => {
    if (!syllabus) return null
    const withSubject = (topicId: string) => {
      for (const doc of syllabus) {
        const t = doc.topics.find((t) => t.id === topicId)
        if (t) return { ...t, subject: doc.subject, year: doc.year, semester: doc.semester }
      }
      return null
    }
    if (progress?.continueTopicId) {
      const t = withSubject(progress.continueTopicId)
      if (t) return t
    }
    // fallback: first topic in the syllabus with an incomplete stage
    for (const doc of syllabus) {
      for (const t of doc.topics) {
        const open = !t.simulationCompleted || !t.quizAttempts || !t.codeSubmissions
        if (open) return { ...t, subject: doc.subject, year: doc.year, semester: doc.semester }
      }
    }
    return null
  }, [progress, syllabus])

  /* ----- flatten syllabus for the mastery map ----- */
  const mapTopics: MapTopic[] = useMemo(() => {
    if (!syllabus) return []
    return syllabus.flatMap((doc) =>
      doc.topics.map((t) => ({
        id: t.id,
        name: t.name,
        subject: doc.subject,
        sim: !!t.simulationCompleted,
        quiz: (t.quizAttempts ?? 0) > 0,
        code: (t.codeSubmissions ?? 0) > 0,
        mastery: ((t.simulationCompleted ? 1 : 0) + ((t.quizAttempts ?? 0) > 0 ? 1 : 0) + ((t.codeSubmissions ?? 0) > 0 ? 1 : 0)) * 33.4,
        algorithmId: t.algorithmId,
      }))
    )
  }, [syllabus])

  const graspTrend = progress?.graspTrend?.map((p) => p.grasp) ?? []

  if (!progress || !syllabus) {
    return (
      <AppShell section="/dashboard">
        <div className="grid min-h-[80vh] place-items-center px-8">
          <ComputingLoader message="COMPILING YOUR SYSTEM STATE" sub="progress · syllabus · mastery map" />
        </div>
      </AppShell>
    )
  }

  const stats = progress.stats
  const first = user?.name?.split(' ')[0] ?? 'Operator'

  /* resume target = first incomplete stage of the continue topic */
  const resumeHref = (() => {
    if (!continueTopic) return '/syllabus'
    if (!continueTopic.simulationCompleted && continueTopic.algorithmId) return `/visualize/${continueTopic.algorithmId}`
    if (!continueTopic.quizAttempts) return `/quiz/${continueTopic.id}`
    if (!continueTopic.codeSubmissions) return `/code/${continueTopic.id}-code`
    return `/topic/${continueTopic.id}`
  })()

  return (
    <AppShell section="/dashboard" defaultTopic={continueTopic?.algorithmId ?? continueTopic?.id ?? 'bfs'}>
      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12 lg:py-14">
        <Masthead
          eyebrow={`PERSONAL LEARNING SYSTEM — ${date()}`}
          title={
            <>
              {greeting()}, <span className="text-signal">{first}</span>.
            </>
          }
          sub={
            <>
              Your learning system is{' '}
              <span className="font-display text-[16px] text-ink">{Math.round(progress.overallMastery)}%</span>{' '}
              complete. {progress.overallMastery >= 70 ? 'Mastery is compounding — keep the loop running.' : 'The next stage of the loop is queued below.'}
            </>
          }
          right={
            <div className="flex items-center gap-4 border border-line bg-surface px-5 py-4">
              <ProgressTopology pct={progress.overallMastery} size={72} />
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-ink-3">SYLLABUS TOPOLOGY</div>
                <div className="mt-1 font-display text-[22px] text-ink">
                  <CountUp value={Math.round(progress.overallMastery)} />%
                </div>
                <div className="font-mono text-[9px] tracking-[0.16em] text-ink-3">CONNECTED MASTERY</div>
              </div>
            </div>
          }
        />

        {/* ---------- continue + mastery map ---------- */}
        <div className="mt-12 grid gap-5 xl:grid-cols-[1.15fr_1fr]">
          {/* continue panel */}
          <section className="relative flex flex-col border border-line bg-surface p-7">
            <div className="absolute inset-y-0 left-0 w-[2px] bg-signal/70" />
            <MonoLabel>RESUME PROTOCOL — CONTINUE WHERE YOU LEFT OFF</MonoLabel>
            {continueTopic ? (
              <>
                <div className="mt-5 font-mono text-[10px] tracking-[0.18em] text-ink-3">
                  {continueTopic.year} · SEM {continueTopic.semester} — {continueTopic.subject.toUpperCase()}
                </div>
                <h2 className="mt-2 font-display text-[30px] font-medium leading-tight text-ink">
                  {continueTopic.name}
                </h2>

                <div className="mt-8 flex flex-col">
                  <PipelineRow
                    n="01"
                    label="UNDERSTAND"
                    value={continueTopic.simulationCompleted ? 'Simulation complete' : 'Simulation pending'}
                    pct={continueTopic.simulationCompleted ? 100 : 0}
                    tone="signal"
                  />
                  <PipelineRow
                    n="02"
                    label="TEST"
                    value={`${continueTopic.quizAttempts ?? 0} assessment${(continueTopic.quizAttempts ?? 0) === 1 ? '' : 's'} · grasp ${stats.graspingPower}`}
                    pct={Math.min(100, (continueTopic.quizAttempts ?? 0) * 50)}
                    tone="comp"
                  />
                  <PipelineRow
                    n="03"
                    label="IMPLEMENT"
                    value={`${continueTopic.codeSubmissions ?? 0} submission${(continueTopic.codeSubmissions ?? 0) === 1 ? '' : 's'}`}
                    pct={continueTopic.codeSubmissions ? 100 : 0}
                    tone="amber"
                  />
                </div>

                <div className="mt-auto flex items-center gap-3 pt-9">
                  <BtnLink href={resumeHref} kind="primary" className="px-6 py-3">
                    Resume
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 6h10M7 2l4 4-4 4" /></svg>
                  </BtnLink>
                  <BtnLink href={`/topic/${continueTopic.id}`} kind="outline" className="px-6 py-3">
                    View Topic
                  </BtnLink>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Nothing has been computed here yet."
                  body="Your loop starts with a single simulation. Pick a topic from the syllabus navigator."
                  action={
                    <BtnLink href="/syllabus" kind="primary" className="mt-2">
                      Open Syllabus
                    </BtnLink>
                  }
                />
              </div>
            )}
          </section>

          {/* mastery map */}
          <section className="border border-line bg-surface p-7">
            <PanelHeader label="SYLLABUS TOPOLOGY — YEAR → SEMESTER → SUBJECT → TOPIC" title="Mastery Map" />
            <div className="mt-6">
              <MasteryMap topics={mapTopics} onOpen={(id) => (window.location.href = `/topic/${id}`)} />
            </div>
          </section>
        </div>

        {/* ---------- analytics modules ---------- */}
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-12">
          {/* grasping power */}
          <section className="border border-line bg-surface p-7 xl:col-span-5">
            <PanelHeader
              label="SIGNAL INTELLIGENCE"
              title="Grasping Power"
              right={<div className="font-mono text-[9px] leading-4 tracking-[0.14em] text-ink-3">f(CORRECTNESS · DIFFICULTY<br />· RESPONSE TIME)</div>}
            />
            <div className="mt-6 flex items-end gap-8">
              <div className="font-display text-[76px] font-medium leading-none tracking-[-0.03em] text-ink">
                <CountUp value={stats.graspingPower} />
              </div>
              <div className="pb-2 font-mono text-[9px] leading-4 tracking-[0.18em] text-ink-3">
                ADAPTIVE INDEX
                <br />
                / 100
              </div>
            </div>
            <div className="mt-4">
              {graspTrend.length >= 2 ? (
                <WaveCurve points={graspTrend} height={110} />
              ) : (
                <div className="grid h-[110px] place-items-center border border-dashed border-line-2 font-mono text-[9px] tracking-[0.2em] text-ink-3">
                  TREND FORMS AFTER TWO ASSESSMENTS
                </div>
              )}
            </div>
          </section>

          {/* subject mastery */}
          <section className="border border-line bg-surface p-7 xl:col-span-4">
            <PanelHeader label="COVERAGE BY SUBJECT" title="Syllabus Mastery" />
            <div className="mt-7 flex flex-col gap-6">
              {progress.subjectStats.map((s, i) => (
                <div key={s.subject}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-2">{s.subject}</span>
                    <span className="font-mono text-[11px] text-ink">
                      <CountUp value={s.percent} delay={i * 0.15} />%
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <Meter pct={s.percent} tone={i === 0 ? 'signal' : i === 1 ? 'comp' : 'amber'} delay={i * 0.12} />
                  </div>
                  <div className="mt-1.5 font-mono text-[8.5px] tracking-[0.16em] text-ink-3">
                    {s.done}/{s.total} TOPICS IN THE LOOP
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* executions */}
          <section className="flex flex-col justify-between gap-8 border border-line bg-surface p-7 xl:col-span-3">
            <div>
              <MonoLabel>EXECUTION COUNT</MonoLabel>
              <div className="mt-3 font-display text-[42px] font-medium leading-none text-ink">
                <CountUp value={stats.simulationsCompleted} />
              </div>
              <div className="mt-3">
                <NodeChain lit={Math.min(8, stats.simulationsCompleted)} total={8} label="SIMULATION MODELS RUN" />
              </div>
            </div>
            <div className="border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <MonoLabel>CODING SOLVED</MonoLabel>
                <span className="font-mono text-[11px] text-signal">{stats.problemsSolved}/5</span>
              </div>
              <div className="mt-3">
                <ExecutionMarkers solved={stats.problemsSolved} total={5} />
              </div>
              <div className="mt-2 font-mono text-[8.5px] tracking-[0.16em] text-ink-3">JUDGE0-VERIFIED RUNS</div>
            </div>
            <div className="border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <MonoLabel>AVG QUIZ SCORE</MonoLabel>
                <span className="font-mono text-[11px] text-ink">{stats.avgQuizScore}%</span>
              </div>
              <div className="mt-3">
                <Meter pct={stats.avgQuizScore} tone="comp" />
              </div>
            </div>
          </section>
        </div>

        {/* ---------- signal log ---------- */}
        <section className="mt-5 border border-line bg-surface">
          <div className="border-b border-line px-7 py-5">
            <PanelHeader label="CHRONOLOGICAL TELEMETRY" title="Signal Log" right={<BtnLink href="/syllabus" kind="ghost" className="px-0">FULL CURRICULUM →</BtnLink>} />
          </div>
          {progress.recentActivity.length ? (
            <div>
              {progress.recentActivity.slice(0, 6).map((a, i) => (
                <motion.a
                  key={i}
                  href={a.type === 'simulation' ? '/syllabus' : a.type === 'quiz' ? `/quiz/${a.topicId}` : `/code/${a.topicId}-code`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group flex items-center gap-5 border-b border-line/60 px-7 py-4 transition-colors last:border-0 hover:bg-surface-2"
                >
                  <span
                    className={
                      a.type === 'simulation'
                        ? 'size-2 rotate-45 bg-signal'
                        : a.type === 'quiz'
                          ? 'size-2 rotate-45 bg-comp'
                          : 'size-2 rotate-45 bg-amber'
                    }
                  />
                  <span className="w-24 shrink-0 font-mono text-[9px] tracking-[0.14em] text-ink-3">
                    {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
                  </span>
                  <span className="w-20 shrink-0 font-mono text-[9px] tracking-[0.18em] text-ink-3">
                    {a.type.toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-[13.5px] text-ink-2 transition-colors group-hover:text-ink">{a.title}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-[#33475A] transition-all group-hover:translate-x-0.5 group-hover:text-signal">
                    <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
                  </svg>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="px-7">
              <EmptyState body="Execute your first simulation and the log starts writing itself." />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}

function PipelineRow({ n, label, value, pct, tone }: { n: string; label: string; value: string; pct: number; tone: 'signal' | 'comp' | 'amber' }) {
  return (
    <div className="border-t border-line/70 py-4 last:border-b">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[10px] text-ink-3">{n}</span>
        <span className="w-28 font-mono text-[10px] tracking-[0.18em] text-ink-2">{label}</span>
        <span className="ml-auto font-mono text-[10.5px] text-ink">{value}</span>
      </div>
      <div className="mt-3 pl-8">
        <Meter pct={pct} tone={tone} height={2} />
      </div>
    </div>
  )
}
