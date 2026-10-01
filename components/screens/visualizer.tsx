'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Maximize2, Minimize2 } from 'lucide-react'
import { motion } from 'motion/react'
import * as api from '@/lib/api'
import { cn } from '@/lib/utils'
import { SimCanvas } from '@/components/signal-hero'
import { Btn, ComputingLoader, MonoLabel } from '@/components/ui-kit'
import { AppShell } from '@/components/shell'
import { GRAPHS, GRAPH_META } from '@/lib/graph-spec'
import { ALGO_ORDER, SIM_NAMES, VAR_LABELS, fmtVar, topicIdForAlgorithm } from '@/lib/product'

const LEGEND = [
  ['UNVISITED', '#101C27', '#2C4254'],
  ['FRONTIER', '#4D7CFE', null],
  ['PROCESSING', '#F5B942', null],
  ['VISITED', '#32E6C4', null],
  ['TARGET', '#F5B942', 'ring'],
] as const

export function Visualizer({ algorithmId }: { algorithmId: string }) {
  const [sim, setSim] = useState<api.Simulation | null>(null)
  const [failed, setFailed] = useState(false)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [present, setPresent] = useState(() => typeof window !== 'undefined' && window.location.search.includes('present'))
  const [completed, setCompleted] = useState(false)
  const [quizTopic, setQuizTopic] = useState(algorithmId)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setSim(null)
    setFailed(false)
    setStep(0)
    setPlaying(false)
    setCompleted(false)
    api.getSimulation(algorithmId).then(setSim).catch(() => setFailed(true))
    api.getSyllabus().then((docs) => setQuizTopic(topicIdForAlgorithm(docs, algorithmId))).catch(() => {})
  }, [algorithmId])

  const last = useMemo(() => (sim?.steps.length ?? 1) - 1, [sim])

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    if (playing) {
      timer.current = setInterval(() => {
        setStep((s) => {
          if (s >= last) {
            setPlaying(false)
            return s
          }
          return s + 1
        })
      }, 1250 / speed)
    }
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, speed, last])

  const finish = useCallback(async () => {
    setPlaying(false)
    setStep(last)
    if (completed) return
    try {
      await api.completeSimulation(algorithmId)
      setCompleted(true)
      api.toast('Simulation marked complete — UNDERSTAND stage closed', 'success')
    } catch {}
  }, [algorithmId, last, completed])

  if (failed) {
    return (
      <AppShellWrap algorithmId={algorithmId} present={present} onPresent={setPresent} topic={quizTopic}>
        <div className="grid min-h-[60vh] place-items-center">
          <div className="text-center">
            <div className="font-display text-[20px] text-ink">Model unavailable</div>
            <div className="mt-2 font-mono text-[10px] tracking-[0.18em] text-ink-3">
              THE ENGINE DID NOT RETURN STATES FOR “{algorithmId.toUpperCase()}”
            </div>
          </div>
        </div>
      </AppShellWrap>
    )
  }

  if (!sim) {
    return (
      <AppShellWrap algorithmId={algorithmId} present={present} onPresent={setPresent} topic={quizTopic}>
        <div className="grid min-h-[70vh] place-items-center">
          <ComputingLoader message="BUILDING SIMULATION" sub="precomputing execution states" />
        </div>
      </AppShellWrap>
    )
  }

  const cur = sim.steps[Math.min(step, last)]
  const meta = GRAPH_META[algorithmId]
  const spec = GRAPHS[algorithmId] ?? GRAPHS.bfs
  const atEnd = step >= last
  const stepPct = last > 0 ? (step / last) * 100 : 0

  return (
    <AppShellWrap algorithmId={algorithmId} present={present} onPresent={setPresent} topic={quizTopic}>
      <div className={cn('mx-auto w-full px-6 py-8 lg:px-10', present ? 'max-w-none' : 'max-w-[1500px] lg:py-10')}>
        {/* ---------- header ---------- */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-signal/70" />
              <MonoLabel>
                {meta ? `${meta.family.toUpperCase()} — ${meta.subject.toUpperCase()}` : 'SIMULATION ENGINE'}
                {meta && <span className="ml-3 text-signal">{meta.complexity}</span>}
              </MonoLabel>
            </div>
            <h1 className="mt-3 font-display text-[34px] font-medium leading-tight tracking-[-0.01em] text-ink lg:text-[42px]">
              {sim.name}
            </h1>
          </div>
          {!present && (
            <div className="flex items-center gap-2">
              <div className="flex border border-line">
                {ALGO_ORDER.map((a) => (
                  <a
                    key={a}
                    href={`/visualize/${a}`}
                    className={cn(
                      'px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-colors',
                      a === algorithmId ? 'bg-surface-3 text-signal' : 'bg-surface text-ink-3 hover:text-ink'
                    )}
                  >
                    {a}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------- workspace ---------- */}
        <div className={cn('mt-7 grid gap-5', present ? '' : 'xl:grid-cols-[1fr_370px]')}>
          {/* canvas + timeline */}
          <section className="flex min-w-0 flex-col border border-line bg-[#08121B]">
            <div className="relative flex-1">
              <div className={cn('relative', present ? 'h-[calc(100vh-320px)] min-h-[420px]' : 'h-[440px] xl:h-[500px]')}>
                <SimCanvas
                  spec={spec}
                  algorithmId={algorithmId}
                  step={{
                    description: cur.description,
                    pseudocodeLine: cur.pseudocodeLine,
                    activeNode: cur.activeNode,
                    visited: cur.visited,
                    frontier: cur.frontier,
                    treeEdges: cur.treeEdges,
                    vars: cur.vars,
                  }}
                />
              </div>
              {/* HUD — state legend */}
              <div className="pointer-events-none absolute left-5 top-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[8.5px] tracking-[0.16em] text-ink-3">
                {LEGEND.map(([label, color, ring]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span
                      className="inline-block size-[7px] rotate-45"
                      style={
                        ring === 'ring'
                          ? { border: `1px solid ${color}`, background: 'transparent' }
                          : { background: color as string, border: color === '#101C27' ? '1px solid #2C4254' : 'none' }
                      }
                    />
                    {label}
                  </span>
                ))}
              </div>
              <div className="pointer-events-none absolute right-5 top-4 font-mono text-[8.5px] tracking-[0.16em] text-ink-3">
                {spec.nodes.length} NODES · {spec.edges.length} EDGES
              </div>
              {atEnd && !present && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4 border border-signal/40 bg-[#071018]/90 px-5 py-3 backdrop-blur-sm"
                >
                  <span className="font-mono text-[10px] tracking-[0.18em] text-signal">TRAVERSAL COMPLETE</span>
                  <Btn kind="primary" onClick={finish} className="py-2">
                    {completed ? 'CLOSED → TAKE ASSESSMENT' : 'MARK COMPLETE'}
                  </Btn>
                </motion.div>
              )}
            </div>

            {/* ---------- execution timeline ---------- */}
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center gap-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[26px] leading-none text-ink">{String(step + 1).padStart(2, '0')}</span>
                  <span className="font-mono text-[10px] tracking-[0.14em] text-ink-3">/ {String(last + 1).padStart(2, '0')}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Ctl onClick={() => { setPlaying(false); setStep(0) }} label="Reset"><RotateCcw className="size-3.5" /></Ctl>
                  <Ctl onClick={() => { setPlaying(false); setStep(Math.max(0, step - 1)) }} label="Step back"><SkipBack className="size-3.5" /></Ctl>
                  <button
                    onClick={() => (atEnd ? finish() : setPlaying(!playing))}
                    className={cn(
                      'grid size-10 place-items-center border transition-colors',
                      playing ? 'border-signal bg-signal/10 text-signal' : 'border-signal bg-signal text-[#04211B] hover:bg-[#4BEECF]'
                    )}
                    aria-label={playing ? 'Pause' : 'Play'}
                  >
                    {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
                  </button>
                  <Ctl onClick={() => { setPlaying(false); setStep(Math.min(last, step + 1)) }} label="Step forward"><SkipForward className="size-3.5" /></Ctl>
                  <Ctl onClick={() => { setPlaying(false); setStep(last) }} label="Jump to end">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="9" y="1" width="2" height="10" /><path d="M1 1v10l7-5z" /></svg>
                  </Ctl>
                </div>

                {/* speed */}
                <div className="ml-auto hidden items-center gap-3 sm:flex">
                  <span className="font-mono text-[8.5px] tracking-[0.18em] text-ink-3">RATE</span>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="algo-range w-28"
                    aria-label="Playback speed"
                  />
                  <span className="w-9 font-mono text-[10px] text-signal">{speed.toFixed(1)}×</span>
                </div>
              </div>

              {/* step ruler — direct navigation */}
              <div className="relative mt-4 h-6">
                <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#18242F]">
                  <div className="h-full bg-signal transition-[width] duration-150" style={{ width: `${stepPct}%` }} />
                </div>
                <div className="absolute inset-0 flex items-center gap-[2px]">
                  {sim.steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPlaying(false); setStep(i) }}
                      aria-label={`Go to step ${i + 1}`}
                      className={cn(
                        'h-full flex-1 border-0 bg-transparent p-0 transition-colors',
                        i <= step ? 'before:bg-signal' : 'before:bg-[#2C4254]'
                      )}
                    >
                      <span
                        className={cn(
                          'mx-auto block size-[5px] rotate-45 transition-colors',
                          i < step ? 'bg-signal' : i === step ? 'bg-amber' : 'bg-[#2C4254] hover:bg-ink-2'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ---------- side panel (hidden in presentation mode) ---------- */}
          {!present && (
            <aside className="flex min-w-0 flex-col border border-line bg-surface">
              <Section title="CURRENT STATE" tag="LIVE">
                <div className="flex flex-col gap-4">
                  {Object.entries(cur.vars).map(([k, v]) => (
                    <div key={k}>
                      <div className="font-mono text-[9px] tracking-[0.2em] text-ink-3">{VAR_LABELS[k] ?? k.toUpperCase()}</div>
                      <div className="mt-1.5 whitespace-pre-line border border-line-2 bg-[#0A141E] px-3.5 py-2.5 font-mono text-[12px] leading-6 text-signal">
                        {fmtVar(v) || '∅'}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="EXECUTION" tag={`STEP ${String(step + 1).padStart(2, '0')}`}>
                <p className="text-[14px] leading-7 text-ink-2">{cur.description}</p>
              </Section>

              <Section title="PSEUDOCODE" tag={sim.name.split(' ')[0].toUpperCase()} grow>
                <div className="flex flex-col">
                  {sim.pseudocode.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex gap-3 border-l-2 px-3 py-1.5 font-mono text-[11.5px] leading-5 transition-colors',
                        cur.pseudocodeLine === i
                          ? 'border-signal bg-[#0E2420] text-signal'
                          : 'border-transparent text-ink-3'
                      )}
                    >
                      <span className="w-4 shrink-0 text-right text-[9px] text-ink-3/70">{i + 1}</span>
                      <span className={cur.pseudocodeLine === i ? '' : 'opacity-80'}>{line}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </aside>
          )}
        </div>

        {/* presentation footer strip — current line, large */}
        {present && (
          <div className="mt-5 border border-line bg-surface px-8 py-6">
            <div className="flex items-center justify-between gap-8">
              <div>
                <MonoLabel>EXECUTING LINE {cur.pseudocodeLine + 1}</MonoLabel>
                <div className="mt-2 font-mono text-[19px] text-signal">{sim.pseudocode[cur.pseudocodeLine]}</div>
              </div>
              <div className="text-right">
                <MonoLabel>CURRENT STATE</MonoLabel>
                <div className="mt-2 font-mono text-[13px] leading-6 text-ink-2">
                  {Object.entries(cur.vars)
                    .map(([k, v]) => `${VAR_LABELS[k] ?? k}: ${fmtVar(v)}`)
                    .join('   ·   ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShellWrap>
  )
}

/* shell wrapper so loading/failed states still show the rail + header controls */
function AppShellWrap({
  algorithmId,
  present,
  onPresent,
  topic,
  children,
}: {
  algorithmId: string
  present: boolean
  onPresent: (v: boolean) => void
  topic: string
  children: React.ReactNode
}) {
  return (
    <AppShell section="/visualize" defaultTopic={topic}>
      <div className={cn('relative', present && 'bg-bg')}>
        <button
          onClick={() => onPresent(!present)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 border border-line-2 bg-surface-2 px-4 py-2.5 font-mono text-[9.5px] tracking-[0.18em] text-ink-2 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-colors hover:border-signal/50 hover:text-signal"
        >
          {present ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          {present ? 'EXIT PRESENTATION' : 'PRESENTATION MODE'}
        </button>
        {children}
      </div>
    </AppShell>
  )
}

function Ctl({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center border border-line text-ink-2 transition-colors hover:border-signal/50 hover:text-signal"
    >
      {children}
    </button>
  )
}

function Section({
  title,
  tag,
  children,
  grow = false,
}: {
  title: string
  tag?: string
  children: React.ReactNode
  grow?: boolean
}) {
  return (
    <div className={cn('border-b border-line px-6 py-5 last:border-0', grow && 'flex-1 overflow-y-auto')}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.22em] text-ink-3">{title}</span>
        {tag && (
          <span className="flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.18em] text-signal">
            <span className="size-1 bg-signal signal-pulse" />
            {tag}
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}
