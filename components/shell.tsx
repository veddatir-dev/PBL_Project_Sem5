'use client'
import { useState, type ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { motion } from 'motion/react'
import * as api from '@/lib/api'
import { cn } from '@/lib/utils'
import { Wordmark, NodeMark, MonoLabel, initials } from '@/components/ui-kit'

/*
 * The navigation rail is built around the four product verbs —
 * UNDERSTAND / TEST / IMPLEMENT / TRACK — not generic menu items.
 * Collapsed it is a 64px instrument strip; hovering expands it.
 */

const GLYPH: Record<string, ReactNode> = {
  understand: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="5.2" y="5.2" width="5.6" height="5.6" transform="rotate(45 8 8)" />
      <line x1="8" y1="0.5" x2="8" y2="3" />
      <line x1="8" y1="13" x2="8" y2="15.5" />
      <line x1="0.5" y1="8" x2="3" y2="8" />
      <line x1="13" y1="8" x2="15.5" y2="8" />
    </svg>
  ),
  test: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <polyline points="1,9 4,9 6,4 9,13 11,6 12.5,9 15,9" />
    </svg>
  ),
  implement: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <polyline points="5,4 1.5,8 5,12" />
      <polyline points="11,4 14.5,8 11,12" />
      <line x1="9" y1="3.5" x2="7" y2="12.5" />
    </svg>
  ),
  track: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="1.6" y="6.6" width="2.8" height="2.8" transform="rotate(45 3 8)" />
      <rect x="6.6" y="1.6" width="2.8" height="2.8" transform="rotate(45 8 3)" />
      <rect x="6.6" y="11.6" width="2.8" height="2.8" transform="rotate(45 8 13)" />
      <rect x="11.6" y="6.6" width="2.8" height="2.8" transform="rotate(45 13 8)" />
      <line x1="4.2" y1="7" x2="6.8" y2="4" />
      <line x1="4.2" y1="9" x2="6.8" y2="12" />
      <line x1="9.4" y1="4" x2="12" y2="7" />
    </svg>
  ),
}

const VERBS = [
  { key: 'understand', code: '01', label: 'UNDERSTAND', match: ['/syllabus', '/topic', '/visualize'] },
  { key: 'test', code: '02', label: 'TEST', match: ['/quiz'] },
  { key: 'implement', code: '03', label: 'IMPLEMENT', match: ['/code'] },
  { key: 'track', code: '04', label: 'TRACK', match: ['/dashboard', '/faculty'] },
]

export function RailLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group/railitem flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-ink-3 transition-colors hover:text-signal"
    >
      <span className="h-px w-4 bg-[#24384A] transition-all group-hover/railitem:w-6 group-hover/railitem:bg-signal" />
      {label}
    </a>
  )
}

export function AppShell({
  children,
  section,
  defaultTopic = 'bfs',
  faculty = false,
}: {
  children: ReactNode
  section: string
  defaultTopic?: string
  faculty?: boolean
}) {
  const user = api.getStoredUser()
  const [open, setOpen] = useState(false)

  const hrefFor = (key: string) => {
    switch (key) {
      case 'understand':
        return '/syllabus'
      case 'test':
        return `/quiz/${defaultTopic}`
      case 'implement':
        return `/code/${defaultTopic}-code`
      default:
        return user?.role === 'faculty' ? '/faculty' : '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-line bg-[#0A1420] transition-[width] duration-300',
          open ? 'w-60' : 'w-16'
        )}
      >
        <a href={user?.role === 'faculty' ? '/faculty' : '/dashboard'} className="flex h-16 shrink-0 items-center border-b border-line px-4" aria-label="Home">
          <NodeMark size={26} />
          <span
            className={cn(
              'ml-3 whitespace-nowrap font-display text-[12px] tracking-[0.22em] text-ink transition-opacity duration-200',
              open ? 'opacity-100' : 'opacity-0'
            )}
          >
            ALGOLEARN
          </span>
        </a>

        <nav className="flex flex-1 flex-col justify-center gap-1 px-0 py-6">
          {VERBS.map((v) => {
            const active = v.match.some((m) => section.startsWith(m)) || (faculty && v.key === 'track' && section.startsWith('/faculty'))
            return (
              <a
                key={v.key}
                href={hrefFor(v.key)}
                className={cn(
                  'group relative flex h-12 items-center gap-3 px-[22px]',
                  active ? 'text-signal' : 'text-ink-3 hover:text-ink'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    className="absolute left-0 top-1/2 h-7 w-[2px] -translate-y-1/2 bg-signal"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {active && <span className="absolute left-0 top-1/2 h-7 w-[2px] -translate-y-1/2 bg-signal blur-[3px]" />}
                {GLYPH[v.key]}
                <span
                  className={cn(
                    'whitespace-nowrap font-mono text-[10px] tracking-[0.2em] transition-opacity duration-200',
                    open ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {v.label}
                </span>
                <span
                  className={cn(
                    'ml-auto whitespace-nowrap font-mono text-[8.5px] tracking-[0.2em] transition-opacity duration-200',
                    active ? 'text-signal/70' : 'text-[#33475A]',
                    open ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {v.code}
                </span>
              </a>
            )
          })}
        </nav>

        {user && (
          <div className="shrink-0 border-t border-line p-3">
            <div className="flex items-center gap-3 px-1 py-2">
              <span className="grid size-8 shrink-0 place-items-center border border-line-2 bg-surface-2 font-mono text-[10px] text-ink-2">
                {initials(user.name)}
              </span>
              <div className={cn('min-w-0 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')}>
                <div className="truncate text-[12px] leading-tight text-ink">{user.name}</div>
                <div className="mt-0.5 font-mono text-[8.5px] tracking-[0.18em] text-ink-3">
                  {user.role === 'faculty' ? 'FACULTY' : `${user.year ?? ''} · ${user.rollNo ?? 'STUDENT'}`.trim()}
                </div>
              </div>
            </div>
            <button
              onClick={() => api.logout()}
              className={cn(
                'mt-1 flex w-full items-center gap-3 px-1 py-2 text-ink-3 transition-colors hover:text-danger',
                open ? 'opacity-100' : 'opacity-0'
              )}
              aria-label="Sign out"
            >
              <LogOut className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap font-mono text-[9px] tracking-[0.18em]">TERMINATE SESSION</span>
            </button>
          </div>
        )}
      </motion.aside>

      <div className="pl-16">{children}</div>
    </div>
  )
}

/** Section masthead used at the top of every authenticated screen. */
export function Masthead({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow: string
  title: ReactNode
  sub?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-signal/70" />
          <MonoLabel>{eyebrow}</MonoLabel>
        </div>
        <h1 className="mt-4 font-display text-[40px] font-medium leading-[1.04] tracking-[-0.015em] text-ink md:text-[52px]">
          {title}
        </h1>
        {sub && <div className="mt-3 max-w-xl text-[14px] leading-7 text-ink-2">{sub}</div>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
