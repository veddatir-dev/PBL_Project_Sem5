'use client'
import { useEffect, useState } from 'react'
import { X, Check, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastItem {
  id: number
  message: string
  kind: 'success' | 'error' | 'info'
}

let nextId = 1

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  useEffect(() => {
    const handler = (e: Event) => {
      const { message, kind } = (e as CustomEvent).detail
      const id = nextId++
      setToasts((t) => [...t, { id, message, kind }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
    }
    window.addEventListener('algolearn:toast', handler)
    return () => window.removeEventListener('algolearn:toast', handler)
  }, [])
  return toasts
}

const KIND = {
  success: { icon: Check, bar: 'bg-signal', text: 'SIGNAL' },
  error: { icon: AlertTriangle, bar: 'bg-danger', text: 'FAULT' },
  info: { icon: Info, bar: 'bg-comp', text: 'SYSTEM' },
} as const

export function ToastHost() {
  const toasts = useToasts()
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[340px] flex-col gap-2">
      {toasts.map((t) => {
        const k = KIND[t.kind]
        return (
          <div
            key={t.id}
            className="pointer-events-auto relative flex items-stretch overflow-hidden border border-line-2 bg-surface-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
            style={{ animation: 'toast-in 220ms cubic-bezier(0.2,0.9,0.3,1)' }}
          >
            <div className={cn('w-[3px] shrink-0', k.bar)} />
            <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
              <k.icon
                className={cn(
                  'mt-0.5 size-3.5 shrink-0',
                  t.kind === 'success' && 'text-signal',
                  t.kind === 'error' && 'text-danger',
                  t.kind === 'info' && 'text-comp'
                )}
              />
              <div className="flex-1">
                <div className="font-mono text-[9px] tracking-[0.22em] text-ink-3">{k.text}</div>
                <div className="mt-1 text-[13px] leading-5 text-ink">{t.message}</div>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('algolearn:toast-dismiss', { detail: t.id }))}
                className="text-ink-3 hover:text-ink"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )
      })}
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  )
}
