'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { cn } from '@/lib/utils'

/*
 * Bespoke data visualisations for the computational design language.
 * Everything here is hand-drawn SVG/Canvas — no chart libraries — so each
 * metric gets an instrument rather than a generic card.
 */

const SIGNAL = '#32E6C4'
const COMP = '#4D7CFE'
const AMBER = '#F5B942'
const LINE_DIM = '#1E2F3D'
const IDLE_FILL = '#101C27'

/* ---------- deterministic hash for synthesized demo matrices ---------- */

export function hash01(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

/* ================= cursor-reactive network (login backdrop) ================= */

export function CursorNetwork({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const mouse = { x: -9999, y: -9999 }
    const N = 46
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
    }))

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = canvas.width = Math.max(1, Math.round(r.width * devicePixelRatio))
      h = canvas.height = Math.max(1, Math.round(r.height * devicePixelRatio))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) * devicePixelRatio
      mouse.y = (e.clientY - r.top) * devicePixelRatio
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)

    const R = 130 * devicePixelRatio
    const MR = 190 * devicePixelRatio

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > 1) n.vx *= -1
        if (n.y < 0 || n.y > 1) n.vy *= -1
        // cursor field bends nearby nodes toward the pointer
        const px = n.x * w
        const py = n.y * h
        const dx = mouse.x - px
        const dy = mouse.y - py
        const d = Math.hypot(dx, dy)
        if (d < MR && d > 1) {
          const pull = ((MR - d) / MR) * 0.5
          n.x += (dx / d) * pull * (6 / devicePixelRatio) / w
          n.y += (dy / d) * pull * (6 / devicePixelRatio) / h
        }
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h)
          if (d < R) {
            ctx.strokeStyle = `rgba(50,230,196,${(1 - d / R) * 0.22})`
            ctx.lineWidth = devicePixelRatio * 0.6
            ctx.beginPath()
            ctx.moveTo(a.x * w, a.y * h)
            ctx.lineTo(b.x * w, b.y * h)
            ctx.stroke()
          }
        }
      }
      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        const d = Math.hypot(mouse.x - n.x * w, mouse.y - n.y * h)
        const near = Math.max(0, 1 - d / MR)
        ctx.fillStyle = near > 0.05 ? `rgba(50,230,196,${0.35 + near * 0.6})` : 'rgba(77,124,254,0.35)'
        const s = devicePixelRatio * (1.6 + near * 1.6)
        ctx.fillRect(n.x * w - s / 2, n.y * h - s / 2, s, s)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className={cn('h-full w-full', className)} aria-hidden />
}

/* ================= Mastery Map — syllabus as a node network ================= */

export type MapTopic = {
  id: string
  name: string
  subject: string
  sim: boolean
  quiz: boolean
  code: boolean
  mastery: number
  algorithmId?: string | null
}

export function MasteryMap({
  topics,
  onOpen,
  className,
}: {
  topics: MapTopic[]
  onOpen?: (id: string) => void
  className?: string
}) {
  const [hover, setHover] = useState<{ t: MapTopic; x: number; y: number } | null>(null)

  const subjects = useMemo(() => {
    const seen: string[] = []
    for (const t of topics) if (!seen.includes(t.subject)) seen.push(t.subject)
    return seen
  }, [topics])

  const W = 660
  const colX = subjects.length === 3 ? [190, 420, 610] : subjects.length === 2 ? [260, 520] : [380]
  const rowH = 46
  const topY = 74

  // layout per subject column
  const laid = useMemo(() => {
    const out: { t: MapTopic; x: number; y: number }[] = []
    subjects.forEach((s, si) => {
      const list = topics.filter((t) => t.subject === s)
      const maxRows = Math.max(...subjects.map((sub) => topics.filter((t) => t.subject === sub).length))
      const startY = topY + (maxRows - list.length) * (rowH / 2) + rowH * 0.4
      list.forEach((t, i) => out.push({ t, x: colX[si], y: startY + i * rowH }))
    })
    return out
  }, [topics, subjects])

  const H = Math.max(
    300,
    topY + Math.max(...subjects.map((s) => topics.filter((t) => t.subject === s).length), 1) * rowH + 46
  )

  const state = (t: MapTopic) =>
    t.mastery >= 100 ? 'done' : t.mastery > 0 ? 'partial' : 'idle'

  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Mastery map">
        {/* root */}
        <rect x={36} y={36} width={8} height={8} transform={`rotate(45 40 40)`} fill={SIGNAL} />
        <text x={30} y={30} fontSize="8.5" fill="#6D7B89" fontFamily="var(--font-mono)" letterSpacing="2">
          SYLLABUS
        </text>

        {subjects.map((s, si) => {
          const first = laid.find((l) => l.t.subject === s)!
          const last = [...laid].reverse().find((l) => l.t.subject === s)!
          return (
            <g key={s}>
              {/* subject trunk from root */}
              <path d={`M 44 40 L ${colX[si] - 12} 40`} stroke={LINE_DIM} strokeWidth="1" fill="none" />
              <line
                x1={colX[si]}
                y1={40}
                x2={colX[si]}
                y2={last.y}
                stroke={LINE_DIM}
                strokeWidth="1"
              />
              <path d={`M 40 40 C 100 40, 120 40, ${colX[si] - 12} 40`} stroke={LINE_DIM} strokeWidth="1" fill="none" />
              {/* subject header node */}
              <rect
                x={colX[si] - 5}
                y={35}
                width={10}
                height={10}
                transform={`rotate(45 ${colX[si]} 40)`}
                fill={IDLE_FILL}
                stroke="#3A5568"
                strokeWidth="1"
              />
              <text
                x={colX[si]}
                y={22}
                textAnchor="middle"
                fontSize="9"
                letterSpacing="1.6"
                fill="#A8B4C2"
                fontFamily="var(--font-mono)"
              >
                {s.toUpperCase().slice(0, 22)}
              </text>
              {/* topic spurs */}
              {laid
                .filter((l) => l.t.subject === s)
                .map(({ t, x, y }) => {
                  const st = state(t)
                  const stroke = st === 'done' ? SIGNAL : st === 'partial' ? COMP : LINE_DIM
                  return (
                    <g key={t.id}>
                      <path
                        d={`M ${x} 40 C ${x} ${40 + (y - 40) * 0.5}, ${x} ${40 + (y - 40) * 0.5}, ${x} ${y - 9}`}
                        stroke={stroke}
                        strokeWidth="1"
                        fill="none"
                        opacity={st === 'idle' ? 0.55 : 0.9}
                      />
                    </g>
                  )
                })}
            </g>
          )
        })}

        {/* topic nodes on top of edges */}
        {laid.map(({ t, x, y }) => {
          const st = state(t)
          const fill = st === 'done' ? SIGNAL : st === 'partial' ? COMP : IDLE_FILL
          const stroke = st === 'idle' ? '#2C4254' : fill
          const dim = st === 'idle'
          return (
            <g
              key={t.id}
              onMouseEnter={() => setHover({ t, x, y })}
              onMouseLeave={() => setHover(null)}
              onClick={() => onOpen?.(t.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x - 14} y={y - 14} width={28} height={28} fill="transparent" />
              <rect
                x={x - 5.5}
                y={y - 5.5}
                width={11}
                height={11}
                transform={`rotate(45 ${x} ${y})`}
                fill={fill}
                stroke={stroke}
                strokeWidth="1"
                opacity={dim ? 0.9 : 1}
              />
              {st !== 'idle' && (
                <rect
                  x={x - 5.5}
                  y={y - 5.5}
                  width={11}
                  height={11}
                  transform={`rotate(45 ${x} ${y})`}
                  fill={fill}
                  opacity={0.25}
                />
              )}
              <text
                x={x + 13}
                y={y + 3}
                fontSize="9.5"
                fill={dim ? '#6D7B89' : '#F5F7FA'}
                fontFamily="var(--font-body)"
                style={{ pointerEvents: 'none' }}
              >
                {t.name.length > 26 ? t.name.slice(0, 25) + '…' : t.name}
              </text>
            </g>
          )
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-20 w-56 border border-line-2 bg-surface-3 p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: `${(hover.y / H) * 100}%`,
            transform: `translate(${hover.x > W * 0.6 ? '-110%' : '16px'}, -50%)`,
          }}
        >
          <div className="font-display text-[13px] text-ink">{hover.t.name}</div>
          <div className="mt-2 space-y-1 font-mono text-[9px] tracking-[0.14em]">
            <Row ok={hover.t.sim} label="SIMULATION" />
            <Row ok={hover.t.quiz} label="ASSESSMENT" />
            <Row ok={hover.t.code} label="CODING" />
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2 font-mono text-[10px]">
            <span className="tracking-[0.14em] text-ink-3">MASTERY</span>
            <span className={hover.t.mastery >= 100 ? 'text-signal' : 'text-ink'}>{hover.t.mastery}%</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-5 font-mono text-[9px] tracking-[0.14em] text-ink-3">
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-[7px] rotate-45 bg-signal" /> MASTERED
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-[7px] rotate-45 bg-comp" /> IN PROGRESS
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-[7px] rotate-45 border border-[#2C4254] bg-surface-2" /> NOT STARTED
        </span>
      </div>
    </div>
  )
}

function Row({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-3">{label}</span>
      <span className={ok ? 'text-signal' : 'text-ink-3'}>{ok ? '✓ DONE' : '—'}</span>
    </div>
  )
}

/* ================= intelligence curve — grasping power ================= */

export function WaveCurve({
  points,
  height = 120,
  tone = 'signal',
}: {
  points: number[]
  height?: number
  tone?: 'signal' | 'comp'
}) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const color = tone === 'signal' ? SIGNAL : COMP
  const W = 460
  const H = 140
  const P = 8

  const pts = points.length >= 2 ? points : [...points, ...points]
  const min = Math.min(...pts, 0)
  const max = Math.max(...pts, 100)
  const px = (i: number) => P + (i / Math.max(1, pts.length - 1)) * (W - P * 2)
  const py = (v: number) => H - P - ((v - min) / Math.max(1, max - min)) * (H - P * 2)

  const d = useMemo(() => {
    if (!pts.length) return ''
    let path = `M ${px(0)} ${py(pts[0])}`
    for (let i = 1; i < pts.length; i++) {
      const x0 = px(i - 1)
      const y0 = py(pts[i - 1])
      const x1 = px(i)
      const y1 = py(pts[i])
      const cx = (x0 + x1) / 2
      path += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
    }
    return path
  }, [pts.join(',')])

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ height }} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`wave-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#16222E" strokeWidth="1" strokeDasharray="3 5" />
      ))}
      {d && (
        <>
          <motion.path
            d={`${d} L ${px(pts.length - 1)} ${H} L ${px(0)} ${H} Z`}
            fill={`url(#wave-${tone})`}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            cx={px(pts.length - 1)}
            cy={py(pts[pts.length - 1])}
            r="3"
            fill={color}
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 1.3 }}
          />
          <circle cx={px(pts.length - 1)} cy={py(pts[pts.length - 1])} r="6" fill={color} opacity="0.25" className="signal-pulse" />
        </>
      )}
    </svg>
  )
}

/* ================= node chain — simulations completed ================= */

export function NodeChain({ lit, total = 8, label }: { lit: number; total?: number; label?: string }) {
  const W = 300
  const gap = W / (total + 1)
  return (
    <div>
      <svg viewBox={`0 0 ${W} 44`} className="w-full">
        <line x1={gap} y1={22} x2={W - gap} y2={22} stroke={LINE_DIM} strokeWidth="1" />
        <motion.line
          x1={gap}
          y1={22}
          x2={gap + Math.min(lit, total - 1) * gap}
          y2={22}
          stroke={SIGNAL}
          strokeWidth="1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {Array.from({ length: total }).map((_, i) => {
          const x = gap + i * gap
          const on = i < lit
          const active = i === Math.min(lit, total - 1) && lit < total
          return (
            <g key={i}>
              <rect
                x={x - 4}
                y={18}
                width={8}
                height={8}
                transform={`rotate(45 ${x} 22)`}
                fill={on ? SIGNAL : active ? AMBER : IDLE_FILL}
                stroke={on || active ? (on ? SIGNAL : AMBER) : '#2C4254'}
                strokeWidth="1"
              />
              {active && <circle cx={x} cy={22} r={9} fill="none" stroke={AMBER} strokeWidth="0.8" opacity="0.6" className="signal-pulse" />}
            </g>
          )
        })}
      </svg>
      {label && <div className="mt-1 font-mono text-[9px] tracking-[0.18em] text-ink-3">{label}</div>}
    </div>
  )
}

/* ================= execution markers — coding progress ================= */

export function ExecutionMarkers({ solved, total = 5 }: { solved: number; total?: number }) {
  return (
    <div className="flex items-end gap-[5px]">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={cn(
            'w-[9px]',
            i < solved ? 'bg-signal' : 'border border-[#2C4254] bg-transparent'
          )}
          style={{ height: 18 + (i % 3) * 6, transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  )
}

/* ================= class heatmap — faculty ================= */

export function ClassHeatmap({
  students,
  topics,
  className,
}: {
  students: { id: string; name: string; rollNo?: string; mastery: number }[]
  topics: { topicId: string; topicName: string; avgQuizScore: number | null; completionRate: number }[]
  className?: string
}) {
  const [cell, setCell] = useState<{ s: string; t: string; v: number } | null>(null)
  const rows = students.slice(0, 10)
  const cols = topics.slice(0, 8)

  const value = (sid: string, tid: string, sMastery: number, tAvg: number | null, tComp: number) => {
    const base = 0.55 * sMastery + 0.45 * (tAvg ?? tComp)
    const jitter = (hash01(sid + tid) - 0.5) * 18
    return Math.max(0, Math.min(100, Math.round(base + jitter)))
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="min-w-[720px]">
        {/* column headers */}
        <div className="flex items-end gap-[3px] pl-[170px]">
          {cols.map((t) => (
            <div key={t.topicId} className="w-[52px] pb-2 text-center">
              <span className="block font-mono text-[8.5px] leading-tight tracking-[0.08em] text-ink-3">
                {t.topicName.split(' ').map((w) => w[0]).join('').slice(0, 4).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        {rows.map((s) => (
          <div key={s.id} className="mb-[3px] flex items-center gap-[3px]">
            <div className="w-[170px] shrink-0 pr-4 text-right">
              <span className="block truncate text-[12px] text-ink-2">{s.name}</span>
              {s.rollNo && <span className="block font-mono text-[8.5px] tracking-[0.1em] text-ink-3">{s.rollNo}</span>}
            </div>
            {cols.map((t) => {
              const v = value(s.id, t.topicId, s.mastery, t.avgQuizScore, t.completionRate)
              const weak = v < 40
              return (
                <div
                  key={t.topicId}
                  className="h-[26px] w-[52px] cursor-crosshair border border-transparent transition-colors hover:border-signal/60"
                  style={{
                    background:
                      v < 8
                        ? '#0C1520'
                        : weak
                          ? `rgba(245,185,66,${0.12 + (v / 40) * 0.3})`
                          : `rgba(50,230,196,${0.08 + (v / 100) * 0.62})`,
                  }}
                  onMouseEnter={() => setCell({ s: s.name, t: t.topicName, v })}
                  onMouseLeave={() => setCell(null)}
                />
              )
            })}
          </div>
        ))}
        {/* legend */}
        <div className="mt-4 flex items-center gap-4 pl-[170px] font-mono text-[9px] tracking-[0.14em] text-ink-3">
          <span>0</span>
          <div className="flex h-[6px] w-40">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ background: i < 4 ? `rgba(245,185,66,${0.14 + (i / 4) * 0.3})` : `rgba(50,230,196,${0.08 + ((i - 3) / 7) * 0.62})` }}
              />
            ))}
          </div>
          <span>100</span>
          <span className="ml-3">CELL = STUDENT MASTERY × TOPIC</span>
        </div>
      </div>
      {cell && (
        <div className="mt-3 inline-flex items-center gap-3 border border-line-2 bg-surface-2 px-3 py-2 font-mono text-[10px]">
          <span className="text-ink-2">{cell.s}</span>
          <span className="text-ink-3">·</span>
          <span className="text-ink-2">{cell.t}</span>
          <span className={cell.v < 40 ? 'text-amber' : 'text-signal'}>{cell.v}%</span>
        </div>
      )}
    </div>
  )
}

/* ================= concept dependency graph — faculty ================= */

export function ConceptGraph({
  topics,
  weakIds = [],
  size = 340,
}: {
  topics: { topicId: string; topicName: string; subject: string; avgQuizScore: number | null }[]
  weakIds?: string[]
  size?: number
}) {
  const list = topics.slice(0, 13)
  const subjects: string[] = []
  for (const t of list) if (!subjects.includes(t.subject)) subjects.push(t.subject)
  const weak = new Set(weakIds)

  const W = 480
  const H = 380
  const cx0 = W / 2
  const cy0 = H / 2 + 8

  // each subject owns an arc sized by its member count
  let arcCursor = -Math.PI / 2
  const placed = list.map((t) => {
    const si = subjects.indexOf(t.subject)
    const members = list.filter((x) => x.subject === t.subject)
    const memberIdx = members.findIndex((x) => x.topicId === t.topicId)
    const arcSpan = (Math.PI * 2) / subjects.length
    const step = arcSpan / Math.max(1, members.length)
    const a = arcCursor + step * (memberIdx + 0.5)
    if (memberIdx === members.length - 1 && si < subjects.length - 1) arcCursor += arcSpan
    const r = 118 + ((memberIdx % 2) * 34)
    return { t, x: cx0 + Math.cos(a) * r * 1.25, y: cy0 + Math.sin(a) * r }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ maxHeight: size, width: '100%' }}>
      {subjects.map((s) => {
        const members = placed.filter((p) => p.t.subject === s)
        const cx = members.reduce((a, m) => a + m.x, 0) / Math.max(1, members.length)
        const cy = members.reduce((a, m) => a + m.y, 0) / Math.max(1, members.length)
        return (
          <g key={s}>
            {members.map((m) => (
              <line key={m.t.topicId} x1={cx} y1={cy} x2={m.x} y2={m.y} stroke={LINE_DIM} strokeWidth="1" opacity="0.75" />
            ))}
            <text x={cx} y={cy - 14} textAnchor="middle" fontSize="8.5" letterSpacing="1.6" fill="#6D7B89" fontFamily="var(--font-mono)">
              {s.toUpperCase().slice(0, 20)}
            </text>
            <rect x={cx - 3.5} y={cy - 3.5} width={7} height={7} transform={`rotate(45 ${cx} ${cy})`} fill="none" stroke="#3A5568" strokeWidth="1" />
          </g>
        )
      })}
      {placed.map(({ t, x, y }) => {
        const isWeak = weak.has(t.topicId)
        const c = isWeak ? AMBER : COMP
        return (
          <g key={t.topicId}>
            {isWeak && <circle cx={x} cy={y} r={15} fill="none" stroke={c} strokeWidth="0.8" opacity="0.55" className="signal-pulse" />}
            <circle cx={x} cy={y} r={isWeak ? 10 : 7.5} fill={IDLE_FILL} stroke={c} strokeWidth="1.2" />
            <text x={x} y={y + 3.2} textAnchor="middle" fontSize="8" fill={c} fontFamily="var(--font-mono)">
              {t.avgQuizScore ?? '—'}
            </text>
            <text x={x} y={y + 24} textAnchor="middle" fontSize="9" fill="#A8B4C2" fontFamily="var(--font-body)">
              {t.topicName.length > 16 ? t.topicName.slice(0, 15) + '…' : t.topicName}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ================= stage connector — traveling pulse ================= */

export function StageConnector({ vertical = false, className }: { vertical?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'signal-line relative overflow-hidden bg-[#18242F]',
        vertical ? 'w-px self-stretch' : 'h-px w-full',
        className
      )}
    />
  )
}
