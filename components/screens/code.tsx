'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Editor from '@monaco-editor/react'
import * as api from '@/lib/api'
import type { ApiProblem, CodeLanguage, CodeRunResult } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AppShell, Masthead } from '@/components/shell'
import { Btn, ComputingLoader, EmptyState, MonoLabel } from '@/components/ui-kit'

const LANGS: { id: CodeLanguage; label: string; monaco: string }[] = [
  { id: 'c', label: 'C', monaco: 'c' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'python', label: 'Python', monaco: 'python' },
]

const PIPELINE = ['QUEUED', 'COMPILING', 'EXECUTING', 'VERIFYING', 'RESULT'] as const

function beforeMount(monaco: Parameters<NonNullable<Parameters<typeof Editor>[0]['beforeMount']>>[0]) {
  monaco.editor.defineTheme('algorearn', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '54677A', fontStyle: 'italic' },
      { token: 'keyword', foreground: '32E6C4' },
      { token: 'string', foreground: 'F5B942' },
      { token: 'number', foreground: '4D7CFE' },
      { token: 'type', foreground: '4D7CFE' },
      { token: 'type.identifier', foreground: '4D7CFE' },
      { token: 'delimiter', foreground: 'A8B4C2' },
    ],
    colors: {
      'editor.background': '#00000000',
      'editorLineNumber.foreground': '#33475A',
      'editorLineNumber.activeForeground': '#32E6C4',
      'editor.lineHighlightBackground': '#101C2788',
      'editorCursor.foreground': '#32E6C4',
      'editor.selectionBackground': '#32E6C433',
      'editorIndentGuide.background1': '#1C2C3A',
      'editorWidget.background': '#0B151F',
      'editorSuggestWidget.background': '#0B151F',
      'scrollbarSlider.background': '#24384A66',
    },
  })
}

export function CodeWorkspace({ topicId }: { topicId: string }) {
  const [problem, setProblem] = useState<ApiProblem | null>(null)
  const [none, setNone] = useState(false)
  const [language, setLanguage] = useState<CodeLanguage>('python')
  const [source, setSource] = useState('')
  const [stage, setStage] = useState(-1) // -1 idle, 0..4 pipeline
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [visibleTests, setVisibleTests] = useState(0)
  const [saved, setSaved] = useState('LOCAL DRAFT LOADED')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    api.getProblems(topicId).then((ps) => {
      if (ps.length) setProblem(ps[0])
      else setNone(true)
    }).catch(() => setNone(true))
  }, [topicId])

  useEffect(() => {
    if (!problem) return
    const key = `algolearn:code:${problem._id}:${language}`
    setSource(localStorage.getItem(key) || problem.starterCode?.[language] || '')
    setSaved('LOCAL DRAFT LOADED')
  }, [problem, language])

  useEffect(() => {
    if (!problem || !source) return
    const t = setTimeout(() => {
      localStorage.setItem(`algolearn:code:${problem._id}:${language}`, source)
      setSaved('AUTOSAVED')
    }, 900)
    return () => clearTimeout(t)
  }, [source, problem, language])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const run = useCallback(async () => {
    if (!problem || stage >= 0) return
    setRunResult(null)
    setRunError(null)
    setVisibleTests(0)
    setStage(0)
    // drive the visual pipeline while the request is in flight
    const advance = (ms: number, s: number) => timers.current.push(setTimeout(() => setStage(s), ms))
    advance(420, 1)
    advance(1100, 2)
    try {
      const r = await api.runCode(problem._id, language, source)
      advance(1900, 3)
      timers.current.push(
        setTimeout(() => {
          setStage(4)
          setRunResult(r)
          r.results.forEach((_, i) =>
            timers.current.push(setTimeout(() => setVisibleTests(i + 1), 220 * (i + 1)))
          )
          if (r.summary.allPassed) api.toast('All tests passed — IMPLEMENT stage closed', 'success')
        }, 2350)
      )
    } catch (e: unknown) {
      timers.current.push(setTimeout(() => setStage(-1), 1500))
      setRunError((e as Error)?.message || 'Run failed')
    }
  }, [problem, stage, language, source])

  const running = stage >= 0 && stage < 4

  return (
    <AppShell section="/code" defaultTopic={topicId}>
      <div className="mx-auto max-w-[1560px] px-6 py-10 lg:px-10 lg:py-12">
        <Masthead
          eyebrow="IMPLEMENTATION TERMINAL — JUDGE0 PIPELINE"
          title={problem ? problem.title : 'Code Workspace'}
          right={
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.18em] text-ink-3">{saved}</span>
              <Btn kind="primary" onClick={run} disabled={running || !problem} className="px-6 py-3">
                {running ? 'RUNNING…' : 'Run Code'}
              </Btn>
            </div>
          }
        />

        {none ? (
          <div className="mt-10">
            <EmptyState body="No coding challenge is attached to this topic yet." />
          </div>
        ) : !problem ? (
          <div className="mt-10">
            <ComputingLoader message="LOADING PROBLEM SPEC" sub="statement · examples · hidden tests" />
          </div>
        ) : (
          <div className="mt-9 grid gap-5 xl:grid-cols-[0.85fr_1.35fr]">
            {/* ---------- problem spec ---------- */}
            <section className="h-fit border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-7 py-4">
                <MonoLabel>PROBLEM SPECIFICATION</MonoLabel>
                <span
                  className={cn(
                    'border px-2.5 py-1 font-mono text-[9px] tracking-[0.16em]',
                    problem.difficulty === 'hard'
                      ? 'border-danger/50 text-danger'
                      : problem.difficulty === 'easy'
                        ? 'border-comp/50 text-comp'
                        : 'border-amber/50 text-amber'
                  )}
                >
                  {problem.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="px-7 py-7">
                <p className="whitespace-pre-line text-[13.5px] leading-7 text-ink-2">{problem.statement}</p>

                {problem.examples.map((ex, i) => (
                  <div key={i} className="mt-7">
                    <div className="font-mono text-[9px] tracking-[0.2em] text-ink-3">EXAMPLE {String(i + 1).padStart(2, '0')}</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div>
                        <div className="mb-1.5 font-mono text-[8.5px] tracking-[0.18em] text-ink-3">INPUT</div>
                        <pre className="border border-line bg-[#0A141E] px-4 py-3 font-mono text-[11.5px] leading-6 text-ink-2">{ex.input}</pre>
                      </div>
                      <div>
                        <div className="mb-1.5 font-mono text-[8.5px] tracking-[0.18em] text-ink-3">EXPECTED</div>
                        <pre className="border border-line bg-[#0A141E] px-4 py-3 font-mono text-[11.5px] leading-6 text-signal">{ex.output}</pre>
                      </div>
                    </div>
                    {ex.explanation && <p className="mt-2 text-[12px] leading-5 text-ink-3">{ex.explanation}</p>}
                  </div>
                ))}

                <div className="mt-8 border-t border-line pt-5 font-mono text-[9px] leading-5 tracking-[0.14em] text-ink-3">
                  <div className="flex justify-between"><span>TIME LIMIT</span><span className="text-ink-2">12.00 s</span></div>
                  <div className="mt-1 flex justify-between"><span>MEMORY LIMIT</span><span className="text-ink-2">128000 KB</span></div>
                  <div className="mt-1 flex justify-between"><span>JUDGE</span><span className="text-ink-2">JUDGE0 CE · HIDDEN TESTS</span></div>
                </div>
              </div>
            </section>

            {/* ---------- editor + pipeline ---------- */}
            <section className="flex min-w-0 flex-col border border-line bg-[#08121B]">
              {/* editor chrome */}
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <div className="flex">
                  {LANGS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id)}
                      className={cn(
                        'relative px-4 py-2.5 font-mono text-[10px] tracking-[0.14em] transition-colors',
                        language === l.id ? 'text-signal' : 'text-ink-3 hover:text-ink-2'
                      )}
                    >
                      {l.label.toUpperCase()}
                      {language === l.id && <span className="absolute inset-x-3 bottom-0 h-[2px] bg-signal" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => problem && setSource(problem.starterCode?.[language] ?? '')}
                  className="px-3 py-1.5 font-mono text-[9px] tracking-[0.18em] text-ink-3 transition-colors hover:text-amber"
                >
                  RESET TO TEMPLATE
                </button>
              </div>

              <div className={cn('relative', runResult?.summary.allPassed && stage === 4 && 'success-flash')}>
                <Editor
                  height="430px"
                  language={LANGS.find((l) => l.id === language)?.monaco}
                  value={source}
                  onChange={(v) => setSource(v ?? '')}
                  beforeMount={beforeMount}
                  theme="algorearn"
                  options={{
                    fontSize: 13.5,
                    fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'all',
                    padding: { top: 16, bottom: 16 },
                    smoothScrolling: true,
                    cursorBlinking: 'phase',
                    tabSize: 4,
                    automaticLayout: true,
                  }}
                  loading={<div className="grid h-full place-items-center font-mono text-[10px] tracking-[0.2em] text-ink-3">LOADING EDITOR CORE…</div>}
                />
              </div>

              {/* execution pipeline */}
              <div className="border-t border-line px-5 py-4">
                <div className="flex items-center gap-1.5">
                  {PIPELINE.map((p, i) => {
                    const active = stage === i
                    const done = stage > i
                    return (
                      <div key={p} className="flex flex-1 items-center gap-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'size-[7px] rotate-45 transition-colors',
                              done ? 'bg-signal' : active ? 'bg-amber signal-pulse' : 'border border-[#2C4254] bg-transparent'
                            )}
                          />
                          <span
                            className={cn(
                              'font-mono text-[9px] tracking-[0.16em] transition-colors',
                              done ? 'text-signal' : active ? 'text-amber' : 'text-ink-3'
                            )}
                          >
                            {p}
                          </span>
                        </div>
                        {i < PIPELINE.length - 1 && <span className={cn('h-px flex-1', done ? 'bg-signal/60' : 'bg-[#1E2F3D]')} />}
                      </div>
                    )
                  })}
                </div>

                {/* result zone */}
                <div className="mt-4 min-h-[132px]">
                  {runError && (
                    <div className="border border-danger/40 bg-[#2A1116] px-4 py-3 font-mono text-[11px] leading-5 text-danger">
                      {runError}
                    </div>
                  )}

                  {runResult && stage === 4 && (
                    <>
                      <div
                        className={cn(
                          'flex items-center justify-between border px-5 py-3.5',
                          runResult.summary.allPassed ? 'border-signal/50 bg-[#0E2420]' : 'border-amber/50 bg-[#241C08]'
                        )}
                      >
                        <span className={cn('font-display text-[19px]', runResult.summary.allPassed ? 'text-signal' : 'text-amber')}>
                          {runResult.summary.allPassed ? 'ALL TESTS PASSED' : `${runResult.summary.passed} / ${runResult.summary.total} TESTS PASSED`}
                        </span>
                        <span className="font-mono text-[9.5px] tracking-[0.14em] text-ink-2">
                          WALL {(runResult.totalMs / 1000).toFixed(2)}s
                        </span>
                      </div>
                      {runResult.summary.allPassed && <div className="signal-line mt-px h-[2px] w-full bg-signal/40" />}

                      <div className="mt-3 flex flex-col gap-1.5">
                        {runResult.results.slice(0, visibleTests).map((t, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              'flex items-center gap-4 border px-4 py-2.5 font-mono text-[10.5px]',
                              t.passed ? 'border-line/70 text-ink-2' : 'border-danger/40 bg-[#1C0D10]'
                            )}
                          >
                            <span className={t.passed ? 'text-signal' : 'text-danger'}>
                              TEST {String(i + 1).padStart(2, '0')} {t.passed ? '✓' : '✕'}
                            </span>
                            <span className="text-ink-3">{t.statusDescription}</span>
                            <span className="ml-auto text-ink-3">
                              {t.time ? `${t.time}s` : '—'} · {t.memory ?? '—'}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* failing output */}
                      <AnimatePresence>
                        {visibleTests >= runResult.results.length &&
                          runResult.results.some((t) => !t.passed && (t.stdout || t.stderr || t.compileOutput)) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="overflow-hidden"
                            >
                              <pre className="mt-3 max-h-32 overflow-auto border border-line bg-[#0A141E] px-4 py-3 font-mono text-[10.5px] leading-5 text-ink-3">
                                {runResult.results
                                  .filter((t) => !t.passed)
                                  .map((t) => [t.compileOutput, t.stderr, t.stdout].filter(Boolean).join('\n'))
                                  .join('\n---\n')}
                              </pre>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </>
                  )}

                  {!runResult && !runError && stage < 0 && (
                    <div className="grid h-[110px] place-items-center border border-dashed border-line-2">
                      <span className="font-mono text-[9.5px] tracking-[0.2em] text-ink-3">
                        RUN CODE TO EXECUTE AGAINST HIDDEN TESTS
                      </span>
                    </div>
                  )}
                  {stage >= 0 && stage < 4 && !runError && (
                    <div className="grid h-[110px] place-items-center">
                      <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-amber">
                        <span className="size-1.5 bg-amber signal-pulse" />
                        {PIPELINE[stage]}…
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  )
}
