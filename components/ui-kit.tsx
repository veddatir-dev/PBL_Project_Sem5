'use client'
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

/* ================= wordmark ================= */

export function NodeMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <rect x="0.5" y="0.5" width="33" height="33" stroke="#1C2C3A" />
      <line x1="9" y1="24" x2="24" y2="9" stroke="#24384A" strokeWidth="1.4" />
      <line x1="9" y1="9" x2="17" y2="17" stroke="#24384A" strokeWidth="1.4" />
      <line x1="17" y1="17" x2="24" y2="24" stroke="#24384A" strokeWidth="1.4" />
      <rect x="6" y="6" width="6" height="6" fill="#32E6C4" />
      <rect x="21" y="21" width="6" height="6" fill="#4D7CFE" />
      <rect x="14.5" y="14.5" width="5" height="5" fill="#F5F7FA" fillOpacity="0.9" />
    </svg>
  )
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <NodeMark />
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[15px] font-medium tracking-[0.08em] text-ink">
            ALGOLEARN
          </span>
          <span className="mt-1 block font-mono text-[8.5px] tracking-[0.3em] text-ink-3">
            LEARNING&nbsp;LAB·v2
          </span>
        </span>
      )}
    </span>
  )
}

/* ================= typographic atoms ================= */

export function MonoLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3', className)}>{children}</div>
}

export function PanelHeader({
  label,
  title,
  right,
  className,
}: {
  label?: string
  title?: string
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        {label && <MonoLabel>{label}</MonoLabel>}
        {title && <h3 className="mt-1.5 font-display text-[15px] font-medium text-ink">{title}</h3>}
      </div>
      {right}
    </div>
  )
}

export function Diag() {
  return (
    <svg aria-hidden width="7" height="7" viewBox="0 0 7 7" className="shrink-0 opacity-70">
      <line x1="0" y1="7" x2="7" y2="0" stroke="#24384A" strokeWidth="1" />
    </svg>
  )
}

/* ================= buttons ================= */

type BtnKind = 'primary' | 'outline' | 'ghost' | 'amber' | 'blue'

const BTN: Record<BtnKind, string> = {
  primary:
    'bg-signal text-[#04211B] hover:bg-[#4BEECF] border border-signal hover:border-[#4BEECF] font-medium tracking-[0.02em]',
  amber: 'bg-amber text-[#241A04] hover:bg-[#FFC95D] border border-amber hover:border-[#FFC95D] font-medium',
  blue: 'bg-comp text-[#EAFFFA] hover:bg-[#6692FF] border border-comp',
  outline: 'bg-transparent text-ink border border-line-2 hover:border-[#32E6C466] hover:text-ink',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:text-ink hover:bg-surface-3',
}

export function Btn({
  kind = 'primary',
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: BtnKind }) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40',
        BTN[kind],
        className
      )}
    >
      {children}
    </button>
  )
}

export function BtnLink({
  href,
  kind = 'primary',
  className,
  children,
}: {
  href: string
  kind?: BtnKind
  className?: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-150 active:translate-y-px',
        BTN[kind],
        className
      )}
    >
      {children}
    </a>
  )
}

/* ================= animated counter ================= */

export function CountUp({
  value,
  decimals = 0,
  duration = 1.1,
  delay = 0,
  className,
}: {
  value: number
  decimals?: number
  duration?: number
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => v.toFixed(decimals))
  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, { duration, delay, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, value, duration, delay, mv])
  return (
    <span ref={ref} className={className}>
      <motion.span>{text}</motion.span>
    </span>
  )
}

/* ================= signal meter (execution line bar) ================= */

export function Meter({
  pct,
  tone = 'signal',
  height = 2,
  className,
  delay = 0,
}: {
  pct: number
  tone?: 'signal' | 'comp' | 'amber' | 'ok' | 'danger'
  height?: number
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const color = { signal: '#32E6C4', comp: '#4D7CFE', amber: '#F5B942', ok: '#35D07F', danger: '#FF6678' }[tone]
  return (
    <div ref={ref} className={cn('relative w-full overflow-hidden bg-[#1A2833]', className)} style={{ height }}>
      <motion.div
        className="h-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${Math.max(0, Math.min(100, pct))}%` } : { width: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
      />
    </div>
  )
}

/* ================= node-topology progress ================= */

const TOPO_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [5, 3],
]

const TOPO_PTS: [number, number][] = [
  [10, 32],
  [27, 10],
  [48, 24],
  [68, 40],
  [30, 55],
  [50, 62],
]

export function ProgressTopology({ pct, size = 84 }: { pct: number; size?: number }) {
  const frac = Math.max(0, Math.min(100, pct)) / 100
  const litEdges = frac * TOPO_EDGES.length
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 76 74" fill="none">
      {TOPO_EDGES.map(([a, b], i) => {
        const lit = litEdges >= i + 1
        const partial = !lit && litEdges > i
        return (
          <line
            key={i}
            x1={TOPO_PTS[a][0]}
            y1={TOPO_PTS[a][1]}
            x2={TOPO_PTS[b][0]}
            y2={TOPO_PTS[b][1]}
            stroke={lit ? '#32E6C4' : '#1E2F3D'}
            strokeWidth={lit ? 1.4 : 1}
            opacity={lit ? 0.95 : partial ? 0.45 : 0.7}
          />
        )
      })}
      {TOPO_PTS.map(([x, y], i) => {
        const on = litEdges >= (i + 1) * 0.999 || (i === 0 && frac > 0)
        return (
          <g key={i}>
            <rect
              x={x - 3.2}
              y={y - 3.2}
              width="6.4"
              height="6.4"
              transform={`rotate(45 ${x} ${y})`}
              fill={on ? '#32E6C4' : '#101C27'}
              stroke={on ? '#32E6C4' : '#2C4254'}
              strokeWidth="1"
            />
            {on && <rect x={x - 3.2} y={y - 3.2} width="6.4" height="6.4" transform={`rotate(45 ${x} ${y})`} fill="#32E6C4" opacity="0.28" />}
          </g>
        )
      })}
    </svg>
  )
}

/* ================= tick dial (amber, achievement) ================= */

const TICKS = Array.from({ length: 24 }, (_, i) => i)

export function TickDial({ value, size = 64 }: { value: number; size?: number }) {
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * TICKS.length)
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {TICKS.map((i) => {
        const a = (i / TICKS.length) * Math.PI * 2 - Math.PI / 2
        const r1 = 26
        const r2 = i % 6 === 0 ? 19 : 22
        const cx = 32 + Math.cos(a) * r1
        const cy = 32 + Math.sin(a) * r1
        const x2 = 32 + Math.cos(a) * r2
        const y2 = 32 + Math.sin(a) * r2
        const on = i < lit
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke={on ? '#F5B942' : '#223645'}
            strokeWidth={on ? 1.6 : 1}
            opacity={on ? 1 : 0.8}
          />
        )
      })}
      <text
        x="32"
        y="36.5"
        textAnchor="middle"
        fill="#F5F7FA"
        fontSize="13"
        fontFamily="var(--font-mono)"
        fontWeight="500"
      >
        {Math.round(value)}
      </text>
    </svg>
  )
}

/* ================= three-stage strip ================= */

const STAGES = [
  { n: '01', label: 'UNDERSTAND', hint: 'Simulation' },
  { n: '02', label: 'TEST', hint: 'Assessment' },
  { n: '03', label: 'IMPLEMENT', hint: 'Coding' },
]

export function StageStrip({
  done,
  compact = false,
  active,
}: {
  done: boolean[]
  compact?: boolean
  active?: number | null
}) {
  return (
    <div className="flex items-stretch">
      {STAGES.map((s, i) => {
        const complete = done[i]
        const isActive = active === i
        const last = i === STAGES.length - 1
        return (
          <div key={s.n} className="flex flex-1 items-stretch">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'grid place-items-center font-mono text-[9px]',
                    complete ? 'text-signal' : 'text-ink-3'
                  )}
                >
                  {complete ? (
                    <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7" transform="rotate(45 5 5)" fill="#32E6C4" /></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7" transform="rotate(45 5 5)" fill="none" stroke="#2C4254" /></svg>
                  )}
                </span>
                <span
                  className={cn(
                    'font-mono text-[10px] tracking-[0.14em]',
                    complete ? 'text-signal' : isActive ? 'text-ink' : 'text-ink-3'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {!compact && (
                <div className={cn('mt-1 pl-[18px] text-[11px]', complete ? 'text-ink-2' : 'text-ink-3')}>
                  {s.hint}
                </div>
              )}
              <div className="relative mt-2 h-[2px] w-full bg-[#1A2833]">
                {complete ? (
                  <div className="absolute inset-y-0 left-0 w-full bg-signal" />
                ) : isActive ? (
                  <div className="signal-line absolute inset-y-0 left-0 w-1/2 bg-[#1E3A34]" />
                ) : null}
              </div>
            </div>
            {!last && <div className="w-3 shrink-0" />}
          </div>
        )
      })}
    </div>
  )
}

/* ================= computational loading state ================= */

export function ComputingLoader({ message, sub }: { message: string; sub?: string }) {
  const N = 9
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="flex items-end gap-[5px]">
        {Array.from({ length: N }).map((_, i) => (
          <motion.span
            key={i}
            className="w-[3px] bg-signal/80"
            animate={{ height: [4, 6 + ((i * 5) % 18), 4] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <div className="text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-2">{message}</div>
        {sub && <div className="mt-1.5 font-mono text-[10px] tracking-[0.12em] text-ink-3">{sub}</div>}
      </div>
      <div className="signal-line h-px w-40 bg-line-2" />
    </div>
  )
}

/* ================= empty state ================= */

export function EmptyState({
  title = 'Nothing has been computed here yet.',
  body,
  action,
}: {
  title?: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="micro-grid flex flex-col items-center justify-center gap-4 border border-line bg-surface px-8 py-16 text-center">
      <svg width="72" height="40" viewBox="0 0 72 40" fill="none">
        <line x1="8" y1="32" x2="34" y2="8" stroke="#1E2F3D" strokeWidth="1.2" />
        <line x1="34" y1="8" x2="62" y2="30" stroke="#1E2F3D" strokeWidth="1.2" strokeDasharray="3 3" />
        <rect x="5" y="29" width="6" height="6" transform="rotate(45 8 32)" fill="#101C27" stroke="#2C4254" />
        <rect x="31" y="5" width="6" height="6" transform="rotate(45 34 8)" fill="#101C27" stroke="#2C4254" />
        <rect x="59" y="27" width="6" height="6" transform="rotate(45 62 30)" fill="#101C27" stroke="#2C4254" />
      </svg>
      <div className="font-display text-[15px] text-ink">{title}</div>
      {body && <div className="max-w-sm text-[13px] leading-6 text-ink-3">{body}</div>}
      {action}
    </div>
  )
}

/* ================= misc ================= */

export function initials(name?: string | null) {
  return (name || 'AL')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function relTime(d: string | null) {
  if (!d) return 'never'
  const diff = Date.now() - new Date(d).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function useCountUpTo(value: number, duration = 900) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else prev.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return display
}
