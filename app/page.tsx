'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import * as api from '@/lib/api'
import { NodeMark } from '@/components/ui-kit'
import { Landing } from '@/components/screens/landing'
import { Login } from '@/components/screens/login'
import { Dashboard } from '@/components/screens/dashboard'
import { Syllabus } from '@/components/screens/syllabus'
import { TopicDetail } from '@/components/screens/topic'
import { Visualizer } from '@/components/screens/visualizer'
import { Quiz } from '@/components/screens/quiz'
import { CodeWorkspace } from '@/components/screens/code'
import { Faculty } from '@/components/screens/faculty'

/*
 * Client-side router. The [...slug] catch-all re-exports this page, so every
 * URL resolves here; screens mount per pathname with a shared transition.
 */

function Boot() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <div className="flex flex-col items-center gap-5">
        <NodeMark size={40} />
        <div className="font-mono text-[10px] tracking-[0.26em] text-ink-3">ESTABLISHING SESSION</div>
        <div className="signal-line h-px w-44 bg-line-2" />
      </div>
    </div>
  )
}

export default function Page() {
  const [path, setPath] = useState('')
  useEffect(() => {
    const fn = () => setPath(window.location.pathname)
    fn()
    window.addEventListener('popstate', fn)
    return () => window.removeEventListener('popstate', fn)
  }, [])

  /* route guards: session + role */
  useEffect(() => {
    if (!path) return
    const user = api.getStoredUser()
    if (!user) {
      if (path !== '/login' && path !== '/') window.location.href = '/login'
      return
    }
    if (path === '/login' || path === '/') {
      window.location.href = user.role === 'faculty' ? '/faculty' : '/dashboard'
      return
    }
    if (path.startsWith('/faculty') && user.role !== 'faculty') {
      api.toast('Faculty access only', 'error')
      window.location.href = '/dashboard'
    }
  }, [path])

  const render = () => {
    if (!path) return <Boot key="boot" />
    if (path === '/') return <Landing key="landing" />
    if (path === '/login') return <Login key="login" />
    if (path === '/dashboard') return <Dashboard key="dash" />
    if (path === '/syllabus') return <Syllabus key="syl" />
    if (path.startsWith('/topic/')) return <TopicDetail key={path} topicId={path.split('/')[2]} />
    if (path.startsWith('/visualize/')) return <Visualizer key={path} algorithmId={path.split('/')[2] || 'bfs'} />
    if (path.startsWith('/quiz/')) return <Quiz key={path} topicId={path.split('/')[2]} />
    if (path.startsWith('/code/')) return <CodeWorkspace key={path} topicId={(path.split('/')[2] || '').replace(/-code$/, '')} />
    if (path.startsWith('/faculty')) return <Faculty key="fac" />
    return <Dashboard key="dash" />
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={path || 'boot'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {render()}
      </motion.div>
    </AnimatePresence>
  )
}
