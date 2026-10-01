'use client'
import { motion } from 'motion/react'
import { HeroCanvas } from '@/components/signal-hero'
import { BtnLink, MonoLabel, Wordmark } from '@/components/ui-kit'
import { ALGO_ORDER, SIM_NAMES } from '@/lib/product'

const VERBS = [
  {
    n: '01',
    title: 'UNDERSTAND',
    body: 'Watch the algorithm execute as a living model — nodes, edges and data packets, every state visible.',
  },
  {
    n: '02',
    title: 'TEST',
    body: 'An adaptive engine probes your grasp. Difficulty rises when you are right, drops when you are not.',
  },
  {
    n: '03',
    title: 'IMPLEMENT',
    body: 'Write the real solution in C, C++, Java or Python and run it through a judged execution pipeline.',
  },
  {
    n: '04',
    title: 'TRACK',
    body: 'Mastery compounds on a living map of the syllabus — every concept a node, every node a signal.',
  },
]

const META = [
  ['06', 'CORE ALGORITHMS'],
  ['13', 'SYLLABUS TOPICS'],
  ['04', 'LANGUAGES'],
  ['EMA', 'GRASP ENGINE'],
]

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      {/* ---------- top bar ---------- */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-[#071018]/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Wordmark />
          <div className="hidden items-center gap-8 lg:flex">
            <span className="flex items-center gap-2 font-mono text-[9.5px] tracking-[0.22em] text-ink-3">
              <span className="size-1.5 bg-signal signal-pulse" />
              SYSTEM ONLINE — 6 MODELS LIVE
            </span>
            <a href="#index" className="font-mono text-[10px] tracking-[0.2em] text-ink-2 transition-colors hover:text-signal">
              ALGORITHM INDEX
            </a>
            <a href="#loop" className="font-mono text-[10px] tracking-[0.2em] text-ink-2 transition-colors hover:text-signal">
              THE LOOP
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-ink-2 transition-colors hover:text-ink">
              SIGN IN
            </a>
            <BtnLink href="/login" kind="primary" className="hidden sm:inline-flex">
              Get Access
            </BtnLink>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[46fr_54fr]">
          {/* left — editorial */}
          <div className="flex flex-col justify-center px-6 pb-16 pt-32 lg:px-10 lg:pt-44">
            <motion.div variants={reveal} initial="hidden" animate="show" custom={0} className="flex items-center gap-3">
              <span className="h-px w-10 bg-signal/80" />
              <MonoLabel>ADAPTIVE LEARNING + SIMULATION — SY/TY COMPUTER ENGINEERING</MonoLabel>
            </motion.div>

            <h1 className="mt-8 font-display text-[44px] font-medium leading-[1.02] tracking-[-0.02em] text-ink sm:text-[58px] lg:text-[64px]">
              {['Understand the Algorithm.', 'Test Your Thinking.', 'Build the Solution.'].map((line, i) => (
                <motion.span key={line} variants={reveal} initial="hidden" animate="show" custom={i + 1} className="block">
                  {i === 2 ? (
                    <>
                      Build the <span className="text-signal">Solution</span>.
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.div variants={reveal} initial="hidden" animate="show" custom={4} className="mt-9">
              <div className="signal-line h-px w-40 bg-line-2" />
              <p className="mt-6 max-w-md text-[15px] leading-8 text-ink-2">
                A computational laboratory where abstract algorithms become visible systems. Select a syllabus
                topic, watch it execute, prove your understanding, then implement it — while the platform
                measures how deeply it landed.
              </p>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show" custom={5} className="mt-10 flex flex-wrap items-center gap-4">
              <BtnLink href="/login" kind="primary" className="px-6 py-3.5">
                Explore the Curriculum
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 6h10M7 2l4 4-4 4" /></svg>
              </BtnLink>
              <BtnLink href="/login" kind="outline" className="px-6 py-3.5">
                Enter Workspace
              </BtnLink>
            </motion.div>

            <motion.div variants={reveal} initial="hidden" animate="show" custom={6} className="mt-16 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
              {META.map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-[26px] text-ink">{v}</div>
                  <div className="mt-1 font-mono text-[8.5px] tracking-[0.2em] text-ink-3">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* right — computational environment */}
          <div className="relative min-h-[420px] lg:min-h-[92vh]">
            <HeroCanvas />
            {/* instrument HUD */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <div className="absolute left-6 top-24 flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] text-ink-3">
                <span className="size-1.5 bg-amber signal-pulse" />
                LIVE MODEL — BREADTH-FIRST TRAVERSAL
              </div>
              <div className="absolute right-6 top-24 text-right font-mono text-[9px] leading-5 tracking-[0.18em] text-ink-3">
                NODES 14 · EDGES 22<br />
                STATE-DRIVEN EXECUTION
              </div>
              <div className="absolute bottom-10 left-6 max-w-[240px] border-l border-signal/40 pl-3 font-mono text-[9px] leading-5 tracking-[0.16em] text-ink-2">
                A NODE ACTIVATES. A PATH IS TRACED.<br />
                THE GRAPH SOLVES ITSELF.
              </div>
              <div className="absolute bottom-10 right-6 font-mono text-[9px] tracking-[0.18em] text-ink-3">
                POINTER → PARALLAX
              </div>
              {/* corner ticks */}
              {['left-5 top-5 border-l border-t', 'right-5 top-5 border-r border-t', 'left-5 bottom-5 border-l border-b', 'right-5 bottom-5 border-r border-b'].map((pos) => (
                <span key={pos} className={`absolute size-4 border-[#2A3E50] ${pos}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- the loop ---------- */}
      <section id="loop" className="border-t border-line">
        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <MonoLabel>OPERATING PRINCIPLE</MonoLabel>
              <h2 className="mt-4 max-w-lg font-display text-[34px] font-medium leading-tight text-ink md:text-[42px]">
                One system. Four verbs. A complete learning loop.
              </h2>
            </div>
            <p className="max-w-sm text-[13.5px] leading-7 text-ink-2">
              The platform is not a content library. It is a loop that runs until mastery is a measurable
              signal, not a feeling.
            </p>
          </div>

          <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
            {VERBS.map((v, i) => (
              <motion.div
                key={v.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-surface p-7 transition-colors hover:bg-surface-2"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-signal">{v.n}</span>
                  <span className="size-1.5 rotate-45 border border-[#2C4254] transition-colors group-hover:border-signal group-hover:bg-signal" />
                </div>
                <h3 className="mt-10 font-display text-[19px] tracking-[0.06em] text-ink">{v.title}</h3>
                <p className="mt-4 min-h-[88px] text-[12.5px] leading-6 text-ink-2">{v.body}</p>
                <div className="mt-6 h-px w-full bg-[#1A2833]">
                  <div className="h-px w-0 bg-signal transition-all duration-500 group-hover:w-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- algorithm index ---------- */}
      <section id="index" className="border-t border-line bg-[#060D14]">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-6 py-24 lg:grid-cols-[1fr_1.6fr] lg:px-10">
          <div>
            <MonoLabel>LAUNCH LIBRARY</MonoLabel>
            <h2 className="mt-4 font-display text-[34px] font-medium leading-tight text-ink md:text-[42px]">
              The algorithm index.
            </h2>
            <p className="mt-5 max-w-sm text-[13.5px] leading-7 text-ink-2">
              Six simulation engines ship with the laboratory, each precomputed into discrete execution states —
              every step inspectable, every transition instant.
            </p>
            <div className="mt-10 micro-grid border border-line bg-surface p-5">
              <div className="font-mono text-[9px] leading-5 tracking-[0.16em] text-ink-3">
                <span className="text-signal">›</span> STATE N — {`{ active, visited, frontier, tree }`}<br />
                <span className="text-signal">›</span> TRANSITION — instant, both directions<br />
                <span className="text-signal">›</span> COMPLEXITY — annotated per model
              </div>
            </div>
          </div>

          <div className="border-t border-line">
            {ALGO_ORDER.map((a, i) => (
              <motion.a
                key={a}
                href={`/visualize/${a}`}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="group flex items-center gap-6 border-b border-line px-2 py-5 transition-colors hover:bg-surface"
              >
                <span className="w-8 font-mono text-[10px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                <span className="w-20 font-mono text-[11px] uppercase tracking-[0.14em] text-signal">{a}</span>
                <span className="flex-1 font-display text-[17px] text-ink">{SIM_NAMES[a]}</span>
                <span className="hidden font-mono text-[9px] tracking-[0.16em] text-ink-3 md:block">
                  {a === 'bfs' || a === 'dfs' ? 'O(V+E)' : a === 'prim' ? 'O(E log V)' : a === 'kruskal' ? 'O(E log E)' : a === 'bst' ? 'O(log n)' : 'O(b^d)'}
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-ink-3 transition-all group-hover:translate-x-1 group-hover:text-signal">
                  <path d="M2 7h10M8 3l4 4-4 4" />
                </svg>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- closing band ---------- */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-10 px-6 py-20 lg:flex-row lg:items-center lg:px-10">
          <h2 className="max-w-2xl font-display text-[30px] font-medium leading-tight text-ink md:text-[38px]">
            <span className="text-ink-3">DISCOVER</span> → <span className="text-ink-3">UNDERSTAND</span> →{' '}
            <span className="text-ink-3">TEST</span> → <span className="text-ink-3">IMPLEMENT</span> →{' '}
            <span className="text-signal">MASTER</span>
          </h2>
          <div className="flex gap-4">
            <BtnLink href="/login" kind="primary" className="px-7 py-4">
              Begin the Loop
            </BtnLink>
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-line bg-[#050A10]">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-6 py-10 md:flex-row md:items-center lg:px-10">
          <Wordmark />
          <div className="font-mono text-[9px] tracking-[0.2em] text-ink-3">
            BUILT FOR COMPUTER ENGINEERING DEPARTMENTS — SY · TY
          </div>
          <div className="flex gap-6 font-mono text-[9px] tracking-[0.2em] text-ink-3">
            <a href="/login" className="transition-colors hover:text-signal">SIGN IN</a>
            <a href="#index" className="transition-colors hover:text-signal">INDEX</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
