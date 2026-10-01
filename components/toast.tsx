'use client'
import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
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
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
    }
    window.addEventListener('algolearn:toast', handler)
    return () => window.removeEventListener('algolearn:toast', handler)
  }, [])
  return toasts
}

export function ToastHost() {
  const toasts = useToasts()
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border p-4 text-sm shadow-lg',
            t.kind === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
            t.kind === 'error' && 'border-rose-200 bg-rose-50 text-rose-800',
            t.kind === 'info' && 'border-slate-200 bg-white text-slate-700'
          )}
        >
          {t.kind === 'success' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : t.kind === 'error' ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <Info className="mt-0.5 size-4 shrink-0" />}
          <div className="flex-1">{t.message}</div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('algolearn:toast-dismiss', { detail: t.id }))}
            className="opacity-50 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
