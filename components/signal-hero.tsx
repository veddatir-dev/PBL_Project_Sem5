'use client'
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { GRAPHS, BST_VALUE_TO_SLOT, nodeLabel, type GraphSpec } from '@/lib/graph-spec'

const TEAL = '#32E6C4'
const BLUE = '#4D7CFE'
const AMBER = '#F5B942'
const EDGE_DIM = '#22374A'
const NODE_IDLE = '#101C27'

/* ================= shared scene dressing ================= */

function DustField({ count = 130 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 26
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
    }
    return arr
  }, [count])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 0.008
    ref.current.position.y = Math.sin(t * 0.16) * 0.25
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#3A5468" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function CoordinateRig() {
  return (
    <group position={[0, -4.6, -1]}>
      <gridHelper args={[24, 24, '#142330', '#0D1922']} />
    </group>
  )
}

/* ================= hero network ================= */

const HERO_NODES: [number, number, number][] = [
  [-5.6, 0.2, 0], [-3.6, 1.7, -0.6], [-3.9, -1.4, 0.5], [-1.8, 2.5, -0.2],
  [-1.6, 0.4, 0.9], [-1.9, -2.3, -0.4], [0.4, 1.5, -0.8], [0.6, -0.5, 0.2],
  [0.3, -2.9, 0.6], [2.4, 2.3, 0.4], [2.6, 0.2, -0.9], [2.8, -1.8, 0.8],
  [4.7, 0.9, 0.2], [4.9, -1.1, -0.5],
]
const HERO_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7],
  [5, 8], [6, 9], [6, 10], [7, 10], [7, 11], [8, 11], [9, 12], [10, 12], [10, 13], [11, 13], [12, 13], [3, 9],
]
// BFS order over HERO_EDGES from node 0
const HERO_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const HERO_PARENT: Record<number, number> = { 0: -1, 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6, 10: 6, 11: 7, 12: 9, 13: 10 }

function useHeroPhase(total: number, stepMs: number, holdMs: number) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const cycle = total * stepMs + holdMs
    const start = performance.now()
    const id = setInterval(() => {
      const t = (performance.now() - start) % cycle
      setPhase(Math.min(total, Math.floor(t / stepMs)))
    }, 120)
    return () => clearInterval(id)
  }, [total, stepMs, holdMs])
  return phase
}

function Packets({ treeEdges, color = TEAL, speed = 0.55 }: { treeEdges: [number, number][]; color?: string; speed?: number }) {
  const MAX = 26
  const ref = useRef<THREE.Points>(null)
  const dummy = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const now = clock.elapsedTime
    for (let i = 0; i < MAX; i++) {
      const e = treeEdges[i % Math.max(1, treeEdges.length)]
      if (!e) { pos.setXYZ(i, 999, 999, 999); continue }
      const t = (now * speed + i * 0.37) % 1.6
      if (t > 1) { pos.setXYZ(i, 999, 999, 999); continue }
      const a = new THREE.Vector3(...HERO_NODES[e[0]])
      const b = new THREE.Vector3(...HERO_NODES[e[1]])
      dummy.lerpVectors(a, b, t)
      pos.setXYZ(i, dummy.x, dummy.y, dummy.z)
    }
    pos.needsUpdate = true
  })
  const positions = useMemo(() => new Float32Array(MAX * 3).fill(999), [])
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.14} color={color} transparent opacity={0.95} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function HeroNode({ index, phase }: { index: number; phase: number }) {
  const order = HERO_ORDER.indexOf(index)
  const visited = order >= 0 && order < phase
  const processing = order === phase - 1
  const p = HERO_NODES[index]
  const core = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const [emissive, setEmissive] = useState('#0E1B26')

  useEffect(() => {
    setEmissive(processing ? AMBER : visited ? TEAL : NODE_IDLE)
  }, [processing, visited])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (core.current) {
      const s = processing ? 1.25 + Math.sin(t * 5) * 0.1 : visited ? 1.05 : 0.85
      core.current.scale.setScalar(s)
      core.current.rotation.y = t * (processing ? 1.4 : 0.3)
      core.current.rotation.x = t * 0.2
    }
    if (halo.current) {
      const target = processing || visited ? 1 : 0
      const m = halo.current.material as THREE.MeshBasicMaterial
      m.opacity += (target * 0.5 - m.opacity) * 0.08
      halo.current.rotation.z = t * 0.6
      halo.current.scale.setScalar(1 + Math.sin(t * 2 + index) * 0.08)
    }
  })

  return (
    <group position={p}>
      <mesh ref={halo}>
        <torusGeometry args={[0.42, 0.012, 8, 40]} />
        <meshBasicMaterial color={processing ? AMBER : TEAL} transparent opacity={0} />
      </mesh>
      <mesh ref={core}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={processing || visited ? 1.4 : 0.25} metalness={0.35} roughness={0.35} />
      </mesh>
      {index === 0 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.57, 40]} />
          <meshBasicMaterial color={TEAL} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

function HeroScene() {
  const phase = useHeroPhase(HERO_ORDER.length + 2, 470, 2100)
  const group = useRef<THREE.Group>(null)

  const treeEdges = useMemo<[number, number][]>(() => {
    const out: [number, number][] = []
    for (let i = 0; i < Math.min(phase, HERO_ORDER.length); i++) {
      const n = HERO_ORDER[i]
      const par = HERO_PARENT[n]
      if (par >= 0) out.push([par, n])
    }
    return out
  }, [phase])

  useFrame(({ pointer, clock }) => {
    if (!group.current) return
    group.current.rotation.y += (pointer.x * 0.16 - group.current.rotation.y) * 0.03
    group.current.rotation.x += (-pointer.y * 0.1 - group.current.rotation.x) * 0.03
    group.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.12
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 8]} intensity={40} color="#9FD8CC" />
      <pointLight position={[-7, -4, 4]} intensity={26} color="#4D7CFE" />
      <group ref={group}>
        {HERO_EDGES.map(([a, b], i) => {
          const isTree = treeEdges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
          return (
            <Line
              key={i}
              points={[...HERO_NODES[a], ...HERO_NODES[b]]}
              color={isTree ? TEAL : EDGE_DIM}
              lineWidth={isTree ? 1.6 : 1}
              transparent
              opacity={isTree ? 0.95 : 0.5}
            />
          )
        })}
        <Packets treeEdges={treeEdges} />
        {HERO_NODES.map((_, i) => (
          <HeroNode key={i} index={i} phase={phase} />
        ))}
      </group>
      <CoordinateRig />
      <DustField />
    </>
  )
}

/* ================= simulation playback graph ================= */

type StepShape = {
  description: string
  pseudocodeLine: number
  activeNode: number | null
  visited: number[]
  frontier: number[]
  treeEdges: [number, number][]
  vars: Record<string, unknown>
} | null

function SimNodeMesh({
  pos, state, label, target,
}: { pos: [number, number]; state: 'idle' | 'frontier' | 'active' | 'visited'; label: string; target?: boolean }) {
  const x = (pos[0] / 100) * 10 - 5
  const y = (pos[1] / 72) * 6.4 - 3.2
  const core = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const color = state === 'active' ? AMBER : state === 'visited' ? TEAL : state === 'frontier' ? BLUE : NODE_IDLE

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (core.current) {
      const s = state === 'active' ? 1.15 + Math.sin(t * 5) * 0.09 : state === 'frontier' ? 1 + Math.sin(t * 3 + x) * 0.06 : 1
      core.current.scale.setScalar(s)
      core.current.rotation.z = state === 'active' ? t * 1.2 : 0
    }
    if (halo.current) {
      const m = halo.current.material as THREE.MeshBasicMaterial
      const targetO = state === 'active' ? 0.85 : state === 'visited' ? 0.35 : state === 'frontier' ? 0.5 : 0.12
      m.opacity += (targetO - m.opacity) * 0.1
    }
  })

  return (
    <group position={[x, y, 0]}>
      <mesh ref={halo}>
        <torusGeometry args={[0.44, 0.014, 8, 40]} />
        <meshBasicMaterial color={target ? AMBER : color} transparent opacity={0.15} />
      </mesh>
      <mesh ref={core}>
        <octahedronGeometry args={[0.27, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={state === 'idle' ? 0.12 : 1.1} metalness={0.3} roughness={0.4} />
      </mesh>
      <Html center distanceFactor={9} position={[0, -0.75, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            color: state === 'idle' ? '#6D7B89' : '#F5F7FA',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  )
}

export function SimGraphScene({ spec, algorithmId, step }: { spec: GraphSpec; algorithmId: string; step: StepShape }) {
  const group = useRef<THREE.Group>(null)
  const visited = step?.visited ?? []
  const frontier = step?.frontier ?? []
  const active = step?.activeNode
  const treeEdges = step?.treeEdges ?? []

  const resolve = (id: number | null): number | null => {
    if (id == null) return null
    if (algorithmId === 'bst') return BST_VALUE_TO_SLOT[String(id)] ?? null
    return id < spec.nodes.length ? id : null
  }
  const activeIdx = resolve(active ?? null)
  const visitedSet = useMemo(() => new Set(visited.map((v) => resolve(v)).filter((v): v is number => v != null)), [visited, algorithmId])
  const frontierSet = useMemo(() => new Set(frontier.map((v) => resolve(v)).filter((v): v is number => v != null)), [frontier, algorithmId])
  const treeSet = useMemo(() => {
    const s = new Set<string>()
    for (const [a, b] of treeEdges) {
      const ra = resolve(a)
      const rb = resolve(b)
      if (ra != null && rb != null) s.add(`${Math.min(ra, rb)}-${Math.max(ra, rb)}`)
    }
    return s
  }, [treeEdges, algorithmId])

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.22) * 0.055
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.17) * 0.03
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[5, 6, 9]} intensity={36} color="#BFE8DF" />
      <pointLight position={[-6, -3, 5]} intensity={20} color="#4D7CFE" />
      <group ref={group}>
        {spec.edges.map((e, i) => {
          const key = `${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`
          const isTree = treeSet.has(key)
          const touchesActive = activeIdx != null && (e.a === activeIdx || e.b === activeIdx)
          const ax = (spec.nodes[e.a].x / 100) * 10 - 5
          const ay = (spec.nodes[e.a].y / 72) * 6.4 - 3.2
          const bx = (spec.nodes[e.b].x / 100) * 10 - 5
          const by = (spec.nodes[e.b].y / 72) * 6.4 - 3.2
          return (
            <Line
              key={i}
              points={[ax, ay, 0, bx, by, 0]}
              color={isTree ? TEAL : touchesActive ? BLUE : EDGE_DIM}
              lineWidth={isTree ? 2 : touchesActive ? 1.4 : 1}
              transparent
              opacity={isTree ? 1 : touchesActive ? 0.7 : 0.45}
              dashed={!isTree && touchesActive}
              dashSize={0.12}
              gapSize={0.08}
            />
          )
        })}
        {treeEdges.length > 0 && (
          <SimPackets treeSet={treeSet} spec={spec} />
        )}
        {spec.nodes.map((n, i) => {
          const state: 'idle' | 'frontier' | 'active' | 'visited' =
            i === activeIdx ? 'active' : visitedSet.has(i) ? 'visited' : frontierSet.has(i) ? 'frontier' : 'idle'
          return <SimNodeMesh key={i} pos={[n.x, n.y]} state={state} label={nodeLabel(algorithmId, i)} target={spec.goal === i} />
        })}
      </group>
    </>
  )
}

function SimPackets({ treeSet, spec }: { treeSet: Set<string>; spec: GraphSpec }) {
  const edges = useMemo(() => {
    const out: [number, number][] = []
    treeSet.forEach((k) => {
      const [a, b] = k.split('-').map(Number)
      out.push([a, b])
    })
    return out
  }, [treeSet])
  const MAX = 20
  const ref = useRef<THREE.Points>(null)
  const v = useMemo(() => new THREE.Vector3(), [])
  const toWorld = (i: number) => new THREE.Vector3((spec.nodes[i].x / 100) * 10 - 5, (spec.nodes[i].y / 72) * 6.4 - 3.2, 0.05)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const now = clock.elapsedTime
    for (let i = 0; i < MAX; i++) {
      const e = edges[i % Math.max(1, edges.length)]
      if (!e) { pos.setXYZ(i, 999, 999, 999); continue }
      const t = (now * 0.5 + i * 0.29) % 1.5
      if (t > 1) { pos.setXYZ(i, 999, 999, 999); continue }
      v.lerpVectors(toWorld(e[0]), toWorld(e[1]), t)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    pos.needsUpdate = true
  })
  const positions = useMemo(() => new Float32Array(MAX * 3).fill(999), [])
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.11} color={TEAL} transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* ================= SVG fallback (SSR + no-WebGL) ================= */

export function FallbackGraph2D({ algorithmId, step }: { algorithmId: string; step: StepShape }) {
  const spec = GRAPHS[algorithmId] ?? GRAPHS.bfs
  const resolve = (id: number | null) => (id == null ? null : algorithmId === 'bst' ? (BST_VALUE_TO_SLOT[String(id)] ?? null) : id)
  const activeIdx = resolve(step?.activeNode ?? null)
  const visitedSet = new Set((step?.visited ?? []).map((v) => resolve(v)).filter((v): v is number => v != null))
  const frontierSet = new Set((step?.frontier ?? []).map((v) => resolve(v)).filter((v): v is number => v != null))
  const treeSet = new Set((step?.treeEdges ?? []).map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`))
  return (
    <svg viewBox="0 0 100 72" className="h-full w-full">
      {spec.edges.map((e, i) => {
        const key = `${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`
        const isTree = treeSet.has(key)
        return (
          <line
            key={i}
            x1={spec.nodes[e.a].x} y1={spec.nodes[e.a].y} x2={spec.nodes[e.b].x} y2={spec.nodes[e.b].y}
            stroke={isTree ? TEAL : EDGE_DIM}
            strokeWidth={isTree ? 0.7 : 0.4}
            opacity={isTree ? 1 : 0.5}
          />
        )
      })}
      {spec.nodes.map((n, i) => {
        const state = i === activeIdx ? 'active' : visitedSet.has(i) ? 'visited' : frontierSet.has(i) ? 'frontier' : 'idle'
        const fill = state === 'active' ? AMBER : state === 'visited' ? TEAL : state === 'frontier' ? BLUE : NODE_IDLE
        return (
          <g key={i}>
            <rect x={n.x - 2.2} y={n.y - 2.2} width="4.4" height="4.4" transform={`rotate(45 ${n.x} ${n.y})`} fill={fill} stroke={fill === NODE_IDLE ? '#2C4254' : fill} strokeWidth="0.3" />
            <text x={n.x} y={n.y + 6.4} textAnchor="middle" fontSize="3.4" fill={state === 'idle' ? '#6D7B89' : '#F5F7FA'} fontFamily="var(--font-mono)">
              {nodeLabel(algorithmId, i)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function FallbackHero2D() {
  return (
    <svg viewBox="0 0 100 62" className="h-full w-full opacity-70">
      <rect x="0" y="0" width="100" height="62" fill="#071018" />
      {HERO_EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={(HERO_NODES[a][0] + 6.5) * 7.4} y1={(HERO_NODES[a][1] + 4) * 6.6}
          x2={(HERO_NODES[b][0] + 6.5) * 7.4} y2={(HERO_NODES[b][1] + 4) * 6.6}
          stroke="#1C2C3A" strokeWidth="0.28"
        />
      ))}
      {HERO_NODES.map(([x, y], i) => (
        <rect key={i} x={(x + 6.5) * 7.4 - 1.1} y={(y + 4) * 6.6 - 1.1} width="2.2" height="2.2" transform={`rotate(45 ${(x + 6.5) * 7.4} ${(y + 4) * 6.6})`} fill={i === 0 ? TEAL : '#101C27'} stroke={i === 0 ? TEAL : '#2C4254'} strokeWidth="0.25" />
      ))}
    </svg>
  )
}

/* ================= error boundary ================= */

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* ================= exported canvases ================= */

export function HeroCanvas() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <FallbackHero2D />
  return (
    <SceneBoundary fallback={<FallbackHero2D />}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.2, 12.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#071018', 13, 26]} />
        <HeroScene />
      </Canvas>
    </SceneBoundary>
  )
}

export function SimCanvas({ spec, algorithmId, step }: { spec: GraphSpec; algorithmId: string; step: StepShape }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const fallback = <FallbackGraph2D algorithmId={algorithmId} step={step} />
  if (!mounted) return fallback
  return (
    <SceneBoundary fallback={fallback}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.6, 9.2], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <SimGraphScene spec={spec} algorithmId={algorithmId} step={step} />
        <OrbitControls enablePan={false} minDistance={6.5} maxDistance={13} rotateSpeed={0.35} zoomSpeed={0.6} dampingFactor={0.08} enableDamping />
      </Canvas>
    </SceneBoundary>
  )
}
