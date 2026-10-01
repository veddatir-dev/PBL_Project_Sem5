// Shared product-level helpers for the learning-lab screens.

export const ALGO_ORDER = ['bfs', 'dfs', 'prim', 'kruskal', 'bst', 'astar'] as const

export const SIM_NAMES: Record<string, string> = {
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
  prim: "Prim's Minimum Spanning Tree",
  kruskal: "Kruskal's Algorithm",
  bst: 'BST Insert & Traverse',
  astar: 'A* Search',
}

export const ALGO_BLURB: Record<string, string> = {
  bfs: 'Explores a graph level by level using a queue, producing shortest paths in unweighted graphs.',
  dfs: 'Dives as deep as possible along each branch before backtracking, using an explicit or implicit stack.',
  prim: 'Grows a minimum spanning tree from a start vertex, always taking the cheapest edge that crosses the cut.',
  kruskal: 'Sorts every edge by weight and accepts it when it connects two different components.',
  bst: 'Walks ordered insertions through a binary search tree, then reads it back with traversals.',
  astar: 'Guides search with a heuristic so the cheapest expected path is expanded first.',
}

export function fmtVar(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ')}]`
  if (v && typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k}: ${Array.isArray(val) ? `[${val.join(', ')}]` : String(val)}`)
      .join('\n')
  }
  return String(v)
}

export const VAR_LABELS: Record<string, string> = {
  queue: 'QUEUE',
  stack: 'STACK',
  visited: 'VISITED',
  mst: 'MST VERTICES',
  key: 'KEY VALUES',
  sorted: 'SORTED EDGES',
  components: 'COMPONENTS',
  tree: 'TREE NODES',
  totalWeight: 'TOTAL WEIGHT',
  open: 'OPEN SET',
  dist: 'DISTANCE',
  g: 'G SCORE',
  f: 'F SCORE',
  parent: 'PARENT',
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Per-topic three-stage state from syllabus flags. */
export function topicStages(t: { simulationCompleted?: boolean; quizAttempts?: number; codeSubmissions?: number }) {
  return {
    sim: !!t.simulationCompleted,
    quiz: (t.quizAttempts ?? 0) > 0,
    code: (t.codeSubmissions ?? 0) > 0,
    mastery: ((t.simulationCompleted ? 1 : 0) + ((t.quizAttempts ?? 0) > 0 ? 1 : 0) + ((t.codeSubmissions ?? 0) > 0 ? 1 : 0)) * 33.4,
  }
}

/** Find the syllabus topic matching an algorithm id. */
export function topicIdForAlgorithm(docs: { topics: { id: string; algorithmId?: string | null }[] }[] | null, algo: string): string {
  if (docs) {
    for (const d of docs) {
      const t = d.topics.find((t) => t.algorithmId === algo)
      if (t) return t.id
    }
  }
  return algo
}
