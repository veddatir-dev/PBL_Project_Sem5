'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import * as api from '@/lib/api'
import type { ApiSyllabusDoc, ApiTopic } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AppShell, Masthead } from '@/components/shell'
import { ComputingLoader, MonoLabel, StageStrip } from '@/components/ui-kit'
import { topicStages } from '@/lib/product'

type Filters = { year: string; sem: string; subject: string }

export function Syllabus() {
  const [docs, setDocs] = useState<ApiSyllabusDoc[] | null>(null)
  const [f, setF] = useState<Filters>({ year: 'all', sem: 'all', subject: 'all' })

  useEffect(() => {
    api.getSyllabus().then(setDocs).catch(() => setDocs(null))
  }, [])

  const years = useMemo(() => [...new Set((docs ?? []).map((d) => d.year))], [docs])
  const sems = useMemo(() => [...new Set((docs ?? []).map((d) => String(d.semester)))].sort(), [docs])
  const subjects = useMemo(() => [...new Set((docs ?? []).map((d) => d.subject))], [docs])

  if (!docs) {
    return (
      <AppShell section="/syllabus">
        <div className="grid min-h-[80vh] place-items-center px-8">
          <ComputingLoader message="LOADING CURRICULUM GRAPH" sub="year → semester → subject → topic" />
        </div>
      </AppShell>
    )
  }

  const filtered = docs.filter(
    (d) =>
      (f.year === 'all' || d.year === f.year) &&
      (f.sem === 'all' || String(d.semester) === f.sem) &&
      (f.subject === 'all' || d.subject === f.subject)
  )

  // group into year → semester → subjects
  const groups: { year: string; sems: { sem: number; subjects: { name: string; doc: ApiSyllabusDoc }[] }[] }[] = []
  for (const year of [...new Set(filtered.map((d) => d.year))]) {
    const yearDocs = filtered.filter((d) => d.year === year)
    groups.push({
      year,
      sems: [...new Set(yearDocs.map((d) => d.semester))].map((sem) => ({
        sem,
        subjects: yearDocs.filter((d) => d.semester === sem).map((doc) => ({ name: doc.subject, doc })),
      })),
    })
  }

  const totalTopics = filtered.reduce((a, d) => a + d.topics.length, 0)

  return (
    <AppShell section="/syllabus">
      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12 lg:py-14">
        <Masthead
          eyebrow="CURRICULUM EXPLORER"
          title={
            <>
              Syllabus <span className="text-signal">Navigator</span>
            </>
          }
          sub="The full degree graph. Each topic carries a three-stage loop — understand it, test it, implement it — with its own execution state."
          right={
            <div className="font-mono text-[10px] leading-6 tracking-[0.18em] text-ink-3">
              {totalTopics} TOPICS IN VIEW
              <br />
              {filtered.length} SUBJECT NODES
            </div>
          }
        />

        {/* segmented filters */}
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Segment label="YEAR" value={f.year} options={['all', ...years]} onSet={(v) => setF({ ...f, year: v })} />
          <Segment label="SEMESTER" value={f.sem} options={['all', ...sems]} onSet={(v) => setF({ ...f, sem: v })} />
          <Segment label="SUBJECT" value={f.subject} options={['all', ...subjects]} onSet={(v) => setF({ ...f, subject: v })} />
        </div>

        {/* hierarchy */}
        <div className="mt-12 flex flex-col gap-14">
          {groups.map((g) => (
            <div key={g.year}>
              <div className="flex items-center gap-4">
                <span className="font-display text-[22px] text-ink">
                  {g.year === 'SY' ? 'Second Year' : 'Third Year'}
                </span>
                <span className="font-mono text-[9px] tracking-[0.24em] text-ink-3">[{g.year}]</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              {g.sems.map((s) => (
                <div key={s.sem} className="mt-8">
                  <div className="flex items-center gap-3 pl-1">
                    <span className="size-1.5 rotate-45 bg-signal" />
                    <MonoLabel>SEMESTER {s.sem}</MonoLabel>
                    <span className="h-px w-16 bg-line" />
                  </div>

                  <div className={cn('mt-4 grid gap-5', s.subjects.length > 1 ? 'lg:grid-cols-2' : '')}>
                    {s.subjects.map(({ name, doc }) => (
                      <SubjectPanel key={doc._id} name={name} doc={doc} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

function SubjectPanel({ name, doc }: { name: string; doc: ApiSyllabusDoc }) {
  const pct = Math.round(
    doc.topics.reduce((a, t) => a + topicStages(t).mastery, 0) / Math.max(1, doc.topics.length)
  )
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border border-line bg-surface"
    >
      <div className="flex items-end justify-between border-b border-line px-6 py-5">
        <div>
          <h3 className="font-display text-[19px] font-medium text-ink">{name}</h3>
          <div className="mt-1 font-mono text-[9px] tracking-[0.2em] text-ink-3">
            {doc.year} · SEM {doc.semester} — {doc.topics.length} TOPICS
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[13px] text-signal">{pct}%</div>
          <div className="font-mono text-[8.5px] tracking-[0.18em] text-ink-3">SUBJECT LOOP</div>
        </div>
      </div>
      <div>
        {doc.topics.map((t, i) => (
          <TopicRow key={t.id} t={t} index={i} />
        ))}
      </div>
    </motion.section>
  )
}

function TopicRow({ t, index }: { t: ApiTopic; index: number }) {
  const st = topicStages(t)
  return (
    <a
      href={`/topic/${t.id}`}
      className="group relative flex items-center gap-5 border-b border-line/60 px-6 py-4 transition-colors last:border-0 hover:bg-surface-2"
    >
      <span className="absolute inset-y-0 left-0 w-[2px] scale-y-0 bg-signal transition-transform group-hover:scale-y-100" />
      <span className="w-7 font-mono text-[10px] text-ink-3">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] text-ink">{t.name}</div>
        {t.algorithmId && (
          <div className="mt-0.5 font-mono text-[8.5px] tracking-[0.2em] text-ink-3">MODEL · {t.algorithmId.toUpperCase()}</div>
        )}
      </div>
      <div className="hidden w-64 md:block">
        <StageStrip done={[st.sim, st.quiz, st.code]} />
      </div>
      <span
        className={cn(
          'w-12 text-right font-mono text-[11px]',
          st.mastery >= 100 ? 'text-signal' : st.mastery > 0 ? 'text-comp' : 'text-ink-3'
        )}
      >
        {Math.round(st.mastery)}%
      </span>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-[#33475A] transition-all group-hover:translate-x-0.5 group-hover:text-signal">
        <path d="M2 6.5h9M7.5 3 11 6.5 7.5 10" />
      </svg>
    </a>
  )
}

function Segment({ label, value, options, onSet }: { label: string; value: string; options: string[]; onSet: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[9px] tracking-[0.2em] text-ink-3">{label}</span>
      <div className="flex border border-line">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onSet(o)}
            className={cn(
              'px-3.5 py-2 font-mono text-[9.5px] tracking-[0.14em] transition-colors',
              value === o ? 'bg-surface-3 text-signal' : 'bg-surface text-ink-3 hover:text-ink-2'
            )}
          >
            {o === 'all' ? 'ALL' : o.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
