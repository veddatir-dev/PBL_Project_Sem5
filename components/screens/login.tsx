'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import * as api from '@/lib/api'
import { cn } from '@/lib/utils'
import { Btn, MonoLabel, Wordmark } from '@/components/ui-kit'
import { CursorNetwork } from '@/components/viz'

const STEPS = ['01 UNDERSTAND', '02 TEST', '03 IMPLEMENT', '04 TRACK']

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'student' | 'faculty'>('student')
  const [year, setYear] = useState<'SY' | 'TY'>('SY')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') {
        const { user } = await api.login(identifier, password)
        api.toast(`Session established — welcome, ${user.name.split(' ')[0]}`, 'success')
        window.location.href = user.role === 'faculty' ? '/faculty' : '/dashboard'
      } else {
        const { user } = await api.register({ name, email, password, role, year })
        api.toast('Access created — initializing your system', 'success')
        window.location.href = user.role === 'faculty' ? '/faculty' : '/dashboard'
      }
    } catch (err: unknown) {
      api.toast((err as Error)?.message || 'Authentication failed', 'error')
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- identity panel ---------- */}
      <div className="relative hidden overflow-hidden border-r border-line bg-[#08121B] lg:flex lg:flex-col">
        <div className="micro-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-0">
          <CursorNetwork />
        </div>

        <div className="relative z-10 flex items-center justify-between p-10">
          <Wordmark />
          <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] text-ink-3">
            <span className="size-1.5 bg-signal signal-pulse" /> NODE FIELD · REACTIVE
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-14">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg font-display text-[44px] font-medium leading-[1.12] tracking-[-0.015em] text-ink"
          >
            From concept <span className="text-signal">→</span> computation{' '}
            <span className="text-signal">→</span> capability.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-6 max-w-md text-[14px] leading-7 text-ink-2"
          >
            Sign in to your learning system. It remembers where you stopped, what you grasped, and what
            still needs reinforcement.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-8 border-t border-line/70 px-14 py-7">
          {STEPS.map((s) => (
            <span key={s} className="font-mono text-[9px] tracking-[0.2em] text-ink-3">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- auth terminal ---------- */}
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden">
            <Wordmark />
          </div>

          <div className="mt-10 flex items-center gap-3 lg:mt-0">
            <span className="h-px w-8 bg-signal/70" />
            <MonoLabel>AUTHENTICATION TERMINAL</MonoLabel>
          </div>
          <h2 className="mt-4 font-display text-[30px] font-medium text-ink">
            {mode === 'login' ? 'Sign in to the laboratory' : 'Create your access'}
          </h2>

          {/* mode tabs */}
          <div className="mt-8 flex border-b border-line">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'relative px-5 pb-3.5 font-mono text-[10px] tracking-[0.2em] transition-colors',
                  mode === m ? 'text-signal' : 'text-ink-3 hover:text-ink-2'
                )}
              >
                {m === 'login' ? 'LOG IN' : 'REGISTER'}
                {mode === m && (
                  <motion.span layoutId="auth-tab" className="absolute inset-x-0 -bottom-px h-[2px] bg-signal" />
                )}
              </button>
            ))}
          </div>

          <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
            {mode === 'register' && (
              <>
                <Field label="FULL NAME">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Rehan Shaikh"
                    className="w-full border border-line-2 bg-surface px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-3/60 focus:border-signal/60"
                  />
                </Field>
                <Field label="EMAIL">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="rehan@college.edu"
                    className="w-full border border-line-2 bg-surface px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-3/60 focus:border-signal/60"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="ROLE">
                    <Segmented
                      options={[
                        ['STUDENT', role === 'student'],
                        ['FACULTY', role === 'faculty'],
                      ]}
                      onSelect={(v) => setRole(v === 'STUDENT' ? 'student' : 'faculty')}
                    />
                  </Field>
                  {role === 'student' && (
                    <Field label="YEAR">
                      <Segmented
                        options={[
                          ['SY', year === 'SY'],
                          ['TY', year === 'TY'],
                        ]}
                        onSelect={(v) => setYear(v as 'SY' | 'TY')}
                      />
                    </Field>
                  )}
                </div>
              </>
            )}

            {mode === 'login' && (
              <Field label="EMAIL / ROLL NUMBER">
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="rehan@college.edu · SY23CSE014"
                  className="w-full border border-line-2 bg-surface px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-3/60 focus:border-signal/60"
                />
              </Field>
            )}

            <Field label="PASSWORD">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••••"
                className="w-full border border-line-2 bg-surface px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-3/60 focus:border-signal/60"
              />
            </Field>

            <Btn kind="primary" disabled={busy} className="mt-2 w-full py-3.5">
              {busy ? 'ESTABLISHING…' : mode === 'login' ? 'Authenticate →' : 'Create Access →'}
            </Btn>
          </form>

          <div className="mt-8 border border-line bg-surface p-4">
            <div className="font-mono text-[8.5px] tracking-[0.22em] text-ink-3">DEMO ACCESS</div>
            <div className="mt-2 space-y-1 font-mono text-[10.5px] leading-5 text-ink-2">
              <div>
                STUDENT <span className="text-signal">aarav@college.edu</span>
              </div>
              <div>
                FACULTY <span className="text-comp">faculty@college.edu</span>
              </div>
              <div>
                PASSWORD <span className="text-amber">password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[9px] tracking-[0.22em] text-ink-3">{label}</span>
      {children}
    </label>
  )
}

function Segmented({ options, onSelect }: { options: [string, boolean][]; onSelect: (v: string) => void }) {
  return (
    <div className="flex border border-line-2">
      {options.map(([label, active]) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className={cn(
            'flex-1 py-3 font-mono text-[10px] tracking-[0.16em] transition-colors',
            active ? 'bg-surface-3 text-signal' : 'bg-surface text-ink-3 hover:text-ink-2'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
