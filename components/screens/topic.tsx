'use client'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import * as api from '@/lib/api'
import { AppShell, Masthead } from '@/components/shell'
import { BtnLink, ComputingLoader, Meter, MonoLabel } from '@/components/ui-kit'
import { FallbackGraph2D } from '@/components/signal-hero'
import { GRAPHS, GRAPH_META } from '@/lib/graph-spec'
import { ALGO_BLURB, topicStages } from '@/lib/product'

export function TopicDetail({ topicId }: { topicId: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getTopic>> | null>(null)
  const [flags, setFlags] = useState<api.ApiTopic | null>(null)

  useEffect(() => {
    api.getTopic(topicId).then(setData).catch(() => setData(null))
    // /topics/:id returns the bare topic — merge the per-user progress flags from the syllabus
    api.getSyllabus().then((docs) => {
      for (const d of docs) {
        const t = d.topics.find((t) => t.id === topicId)
        if (t) {
          setFlags(t)
          return
        }
      }
    }).catch(() => {})
  }, [topicId])

  if (!data) {
    return (
      <AppShell section="/topic">
        <div className="grid min-h-[80vh] place-items-center px-8">
          <ComputingLoader message="RESOLVING TOPIC NODE" sub="fetching syllabus edges" />
        </div>
      </AppShell>
    )
  }

  const topic: api.ApiTopic = { ...(data.topic as api.ApiTopic), ...(flags ?? {}) }
  const subject = data.subject
  const algo = topic.algorithmId ?? undefined
  const meta = algo ? GRAPH_META[algo] : undefined
  const st = topicStages(topic)
  const stages = [
    {
      n: '01',
      key: 'UNDERSTAND',
      title: 'Interactive simulation',
      body: 'Run the model step by step. Every state transition is inspectable, every variable visible.',
      href: algo ? `/visualize/${algo}` : undefined,
      done: st.sim,
      cta: 'Enter Simulation',
      tone: 'signal' as const,
    },
    {
      n: '02',
      key: 'TEST',
      title: 'Adaptive assessment',
      body: 'The engine probes your grasp question by question, adjusting difficulty to your responses.',
      href: `/quiz/${topic.id}`,
      done: st.quiz,
      cta: 'Start Assessment',
      tone: 'comp' as const,
    },
    {
      n: '03',
      key: 'IMPLEMENT',
      title: 'Coding challenge',
      body: 'Write the real solution in C, C++, Java or Python and run it through the judged pipeline.',
      href: `/code/${topic.id}-code`,
      done: st.code,
      cta: 'Open Workspace',
      tone: 'amber' as const,
    },
  ]

  return (
    <AppShell section="/topic">
      {/* ---------- editorial header with ghost model ---------- */}
      <div className="relative overflow-hidden border-b border-line bg-[#08121B]">
        {algo && GRAPHS[algo] && (
          <div className="pointer-events-none absolute -right-16 -top-24 hidden h-[420px] w-[640px] opacity-[0.14] lg:block">
            <FallbackGraph2D algorithmId={algo} step={null} />
          </div>
        )}
        <div className="micro-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-[1440px] px-6 py-14 lg:px-12 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-ink-3">
              <a href="/syllabus" className="transition-colors hover:text-signal">SYLLABUS</a>
              <span>/</span>
              <span>{subject ? `${subject.subject.toUpperCase()} — ${subject.year} · SEM ${subject.semester}` : 'TOPIC'}</span>
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-[46px] font-medium leading-[1.02] tracking-[-0.02em] text-ink md:text-[64px]">
              {topic.name}
            </h1>
            <p className="mt-6 max-w-xl text-[14.5px] leading-8 text-ink-2">
              {algo ? ALGO_BLURB[algo] : 'A syllabus concept in the learning loop. Run its stages to convert it into connected mastery.'}
              {meta && (
                <span className="ml-2 font-mono text-[11px] tracking-[0.1em] text-signal">{meta.complexity}</span>
              )}
            </p>

            {/* stats strip */}
            <div className="mt-12 grid max-w-3xl grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {[
                ['MASTERY', `${Math.round(st.mastery)}%`],
                ['SIMULATION', st.sim ? 'COMPLETE' : 'PENDING'],
                ['ASSESSMENTS', String(topic.quizAttempts ?? 0)],
                ['SUBMISSIONS', String(topic.codeSubmissions ?? 0)],
              ].map(([l, v]) => (
                <div key={l} className="bg-surface px-5 py-4">
                  <div className="font-mono text-[8.5px] tracking-[0.2em] text-ink-3">{l}</div>
                  <div className="mt-1.5 font-display text-[18px] text-ink">{v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ---------- learning pipeline ---------- */}
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-12 lg:py-20">
        <div className="flex items-center gap-4">
          <MonoLabel>THE LEARNING PIPELINE</MonoLabel>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="relative mt-10 grid gap-5 lg:grid-cols-3">
          {/* connector */}
          <div className="signal-line absolute -top-px left-0 hidden h-px w-full bg-line-2 lg:block" />

          {stages.map((s, i) => (
            <motion.section
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col border border-line bg-surface p-7 transition-colors hover:bg-surface-2"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-[44px] font-medium leading-none text-[#22364A] transition-colors group-hover:text-signal/40">
                  {s.n}
                </span>
                <span
                  className={
                    s.done
                      ? 'flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-signal'
                      : 'flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-ink-3'
                  }
                >
                  <span className={s.done ? 'size-1.5 rotate-45 bg-signal' : 'size-1.5 rotate-45 border border-[#2C4254]'} />
                  {s.done ? 'COMPLETE' : 'AVAILABLE'}
                </span>
              </div>
              <h3 className="mt-10 font-display text-[22px] font-medium tracking-[0.04em] text-ink">{s.key}</h3>
              <div className="mt-1 font-mono text-[9.5px] tracking-[0.18em] text-ink-3">{s.title.toUpperCase()}</div>
              <p className="mt-4 min-h-[66px] text-[13px] leading-6 text-ink-2">{s.body}</p>
              <div className="mt-4">
                <Meter pct={s.done ? 100 : 0} tone={s.tone} height={2} />
              </div>
              <div className="mt-auto pt-7">
                {s.href ? (
                  <BtnLink href={s.href} kind={s.done ? 'outline' : 'primary'} className="w-full">
                    {s.cta}
                  </BtnLink>
                ) : (
                  <div className="border border-line px-4 py-2.5 text-center font-mono text-[10px] tracking-[0.18em] text-ink-3">
                    NO MODEL ATTACHED
                  </div>
                )}
              </div>
            </motion.section>
          ))}
        </div>

        <div className="mt-10 border border-line bg-surface px-7 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3">
              STAGES COMPOUND — EACH SIGNAL FEEDS THE NEXT
            </span>
            <BtnLink href="/dashboard" kind="ghost" className="px-0">
              BACK TO SYSTEM OVERVIEW →
            </BtnLink>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
