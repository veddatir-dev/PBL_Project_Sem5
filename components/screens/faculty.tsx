'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import * as api from '@/lib/api'
import type { FacultyOverview } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AppShell, Masthead } from '@/components/shell'
import { BtnLink, ComputingLoader, CountUp, EmptyState, Meter, MonoLabel, PanelHeader, ProgressTopology, TickDial } from '@/components/ui-kit'
import { ClassHeatmap, ConceptGraph } from '@/components/viz'
import { ALGO_ORDER } from '@/lib/product'

export function Faculty() {
  const [data, setData] = useState<FacultyOverview | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.getClassOverview().then(setData).catch(() => setData(null))
  }, [])

  const students = useMemo(
    () => (data?.students ?? []).filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [data, query]
  )

  if (!data) {
    return (
      <AppShell section="/faculty" faculty>
        <div className="grid min-h-[80vh] place-items-center px-8">
          <ComputingLoader message="AGGREGATING CLASS TELEMETRY" sub="cohorts · topics · mastery states" />
        </div>
      </AppShell>
    )
  }

  const avgMastery = data.students.length
    ? Math.round(data.students.reduce((a, s) => a + s.mastery, 0) / data.students.length)
    : 0

  return (
    <AppShell section="/faculty" faculty>
      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12 lg:py-14">
        <Masthead
          eyebrow="FACULTY COMMAND — CLASS ANALYTICS"
          title={
            <>
              Class <span className="text-signal">Intelligence</span>
            </>
          }
          sub="Where the cohort stands, which concepts are failing, and which simulation to project next."
          right={
            <div className="border border-line bg-surface p-5">
              <MonoLabel>LAUNCH CLASS SIMULATION</MonoLabel>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ALGO_ORDER.map((a) => (
                  <a
                    key={a}
                    href={`/visualize/${a}?present=1`}
                    className="border border-line px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-2 transition-colors hover:border-signal/60 hover:text-signal"
                  >
                    {a}
                  </a>
                ))}
              </div>
              <div className="mt-3 font-mono text-[8.5px] tracking-[0.16em] text-ink-3">OPENS IN PRESENTATION MODE</div>
            </div>
          }
        />

        {/* ---------- top metrics — each its own instrument ---------- */}
        <div className="mt-11 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricPanel label="AVERAGE QUIZ SCORE" note="CLASS-WIDE">
            <div className="flex items-center gap-5">
              <TickDial value={data.totals.avgQuizScore} size={78} />
              <div className="font-mono text-[9px] leading-5 tracking-[0.14em] text-ink-3">
                24-TICK
                <br />
                DIAL
              </div>
            </div>
          </MetricPanel>
          <MetricPanel label="COMPLETION RATE" note="ALL TOPICS">
            <div className="font-display text-[44px] font-medium leading-none text-ink">
              <CountUp value={data.totals.completionRate} />%
            </div>
            <div className="mt-4">
              <Meter pct={data.totals.completionRate} tone="comp" />
            </div>
          </MetricPanel>
          <MetricPanel label="AVERAGE MASTERY" note="TOPOLOGY">
            <ProgressTopology pct={avgMastery} size={96} />
            <div className="mt-1 font-display text-[20px] text-ink">{avgMastery}%</div>
          </MetricPanel>
          <MetricPanel label="WEAK TOPICS" note="NEED ATTENTION" tone="amber">
            <div className="font-display text-[44px] font-medium leading-none text-amber">
              <CountUp value={data.weakTopics.length} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.weakTopics.slice(0, 3).map((t) => (
                <span key={t.topicId} className="border border-amber/40 px-2 py-1 font-mono text-[8.5px] tracking-[0.12em] text-amber">
                  {t.topicName.toUpperCase().slice(0, 16)}
                </span>
              ))}
              {!data.weakTopics.length && <span className="font-mono text-[9px] text-ink-3">NONE — COHORT IS CLEAN</span>}
            </div>
          </MetricPanel>
        </div>

        {/* ---------- class learning map ---------- */}
        <section className="mt-5 border border-line bg-surface">
          <div className="border-b border-line px-7 py-5">
            <PanelHeader
              label="STUDENTS × TOPICS — CELL = MASTERY"
              title="Class Learning Map"
              right={<span className="font-mono text-[9px] tracking-[0.16em] text-ink-3">HOVER A CELL FOR DETAIL</span>}
            />
          </div>
          <div className="px-7 py-7">
            {data.students.length && data.topicStats.length ? (
              <ClassHeatmap students={data.students} topics={data.topicStats} />
            ) : (
              <EmptyState body="No cohort data has been computed yet." />
            )}
          </div>
        </section>

        {/* ---------- topic performance + concept graph ---------- */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-7 py-5">
              <PanelHeader label="SORTED BY SCORE — LOWEST FIRST" title="Topic Performance" />
            </div>
            <div>
              {[...data.topicStats]
                .sort((a, b) => (a.avgQuizScore ?? 999) - (b.avgQuizScore ?? 999))
                .map((t, i) => {
                  const weak = data.weakTopics.some((w) => w.topicId === t.topicId)
                  return (
                    <motion.div
                      key={t.topicId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-5 border-b border-line/60 px-7 py-4 last:border-0"
                    >
                      <span className={cn('size-1.5 rotate-45', weak ? 'bg-amber' : 'bg-signal')} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] text-ink">{t.topicName}</div>
                        <div className="mt-0.5 font-mono text-[8.5px] tracking-[0.16em] text-ink-3">
                          {t.subject.toUpperCase()}
                          {t.algorithmId && ` · MODEL ${t.algorithmId.toUpperCase()}`}
                        </div>
                      </div>
                      <div className="w-36">
                        <Meter pct={t.completionRate} tone={weak ? 'amber' : 'signal'} height={2} />
                      </div>
                      <div className="w-14 text-right font-mono text-[11px] text-ink">{t.avgQuizScore ?? '—'}%</div>
                      {t.algorithmId && (
                        <a
                          href={`/visualize/${t.algorithmId}?present=1`}
                          className="border border-line px-2.5 py-1.5 font-mono text-[8.5px] tracking-[0.14em] text-ink-3 transition-colors hover:border-signal/60 hover:text-signal"
                        >
                          PROJECT
                        </a>
                      )}
                    </motion.div>
                  )
                })}
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-7 py-5">
              <PanelHeader label="SUBJECT CLUSTERS — AMBER = WEAK" title="Concept Graph" />
            </div>
            <div className="px-5 py-6">
              {data.topicStats.length ? (
                <ConceptGraph topics={data.topicStats} weakIds={data.weakTopics.map((w) => w.topicId)} />
              ) : (
                <EmptyState />
              )}
            </div>
          </section>
        </div>

        {/* ---------- students ---------- */}
        <section className="mt-5 border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-7 py-5">
            <PanelHeader label={`${data.students.length} ENROLLED`} title="Student Registry" />
            <div className="flex items-center gap-2 border border-line-2 bg-surface-2 px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-ink-3">
                <circle cx="5" cy="5" r="3.5" />
                <path d="M8 8l3 3" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter students…"
                className="w-44 bg-transparent font-mono text-[10.5px] text-ink outline-none placeholder:text-ink-3/60"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[8.5px] tracking-[0.2em] text-ink-3">
                  <th className="px-7 py-3 font-normal">STUDENT</th>
                  <th className="py-3 font-normal">ROLL</th>
                  <th className="py-3 font-normal">MASTERY</th>
                  <th className="py-3 font-normal">AVG SCORE</th>
                  <th className="px-7 py-3 text-right font-normal">LAST ACTIVE</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 12).map((s) => (
                  <tr key={s.id} className="border-b border-line/50 transition-colors last:border-0 hover:bg-surface-2">
                    <td className="px-7 py-3.5 text-[13px] text-ink">{s.name}</td>
                    <td className="py-3.5 font-mono text-[10.5px] text-ink-3">{s.rollNo ?? '—'}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 font-mono text-[11px] text-ink">{s.mastery}%</span>
                        <span className="w-28">
                          <Meter pct={s.mastery} tone={s.mastery >= 70 ? 'signal' : s.mastery >= 40 ? 'comp' : 'amber'} height={2} />
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-[10.5px] text-ink-2">{s.avgQuizScore}%</td>
                    <td className="px-7 py-3.5 text-right font-mono text-[9.5px] tracking-[0.12em] text-ink-3">
                      {relTime(s.lastActive)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function relTime(d: string | null) {
  if (!d) return 'NEVER'
  const diff = Date.now() - new Date(d).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'JUST NOW'
  if (h < 24) return `${h}H AGO`
  return `${Math.floor(h / 24)}D AGO`
}

function MetricPanel({
  label,
  note,
  tone = 'signal',
  children,
}: {
  label: string
  note: string
  tone?: 'signal' | 'amber'
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('border bg-surface p-6', tone === 'amber' ? 'border-amber/30' : 'border-line')}
    >
      <div className="flex items-center justify-between">
        <MonoLabel>{label}</MonoLabel>
        <span className="font-mono text-[8.5px] tracking-[0.16em] text-ink-3">{note}</span>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  )
}
