// Topology definitions mapping each backend simulation (vertex indexes are
// meaningful — steps reference activeNode/visited/frontier by index) onto
// fixed coordinates. Coordinates are in a 100x72 unit space.
export interface GraphSpec {
  nodes: { x: number; y: number }[]
  edges: { a: number; b: number; w?: number }[]
  selfLoop?: number
  goal?: number
}

export const GRAPHS: Record<string, GraphSpec> = {
  bfs: {
    nodes: [
      { x: 10, y: 36 }, { x: 32, y: 12 }, { x: 32, y: 60 }, { x: 60, y: 26 }, { x: 60, y: 52 }, { x: 86, y: 12 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 0, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 3 }, { a: 2, b: 4 }, { a: 3, b: 5 }, { a: 4, b: 5 },
    ],
  },
  dfs: {
    nodes: [
      { x: 12, y: 30 }, { x: 34, y: 12 }, { x: 34, y: 50 }, { x: 62, y: 22 }, { x: 62, y: 48 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 0, b: 3 }, { a: 3, b: 4 }, { a: 2, b: 4 },
    ],
  },
  prim: {
    nodes: [
      { x: 16, y: 40 }, { x: 44, y: 18 }, { x: 44, y: 58 }, { x: 76, y: 20 }, { x: 80, y: 52 },
    ],
    edges: [
      { a: 0, b: 1, w: 4 }, { a: 0, b: 2, w: 3 }, { a: 0, b: 3, w: 7 }, { a: 1, b: 2, w: 2 }, { a: 1, b: 3, w: 5 }, { a: 2, b: 4, w: 6 }, { a: 3, b: 4, w: 9 },
    ],
  },
  kruskal: {
    nodes: [
      { x: 14, y: 20 }, { x: 14, y: 52 }, { x: 48, y: 36 }, { x: 82, y: 20 }, { x: 82, y: 54 },
    ],
    edges: [
      { a: 1, b: 2, w: 2 }, { a: 0, b: 2, w: 3 }, { a: 0, b: 1, w: 4 }, { a: 2, b: 3, w: 5 }, { a: 3, b: 4, w: 6 }, { a: 2, b: 4, w: 9 },
    ],
  },
  bst: {
    nodes: [
      { x: 50, y: 8 }, { x: 30, y: 28 }, { x: 70, y: 28 }, { x: 16, y: 54 }, { x: 42, y: 54 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 0, b: 2 }, { a: 1, b: 3 }, { a: 1, b: 4 },
    ],
  },
  astar: {
    nodes: [
      { x: 8, y: 36 }, { x: 28, y: 14 }, { x: 46, y: 34 }, { x: 62, y: 14 }, { x: 84, y: 34 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }, { a: 0, b: 2 },
    ],
    goal: 4,
  },
}

// BST steps reference node *values* (8,3,10,1,6…) — the canvas maps them to
// these five positions. Map value → slot index.
export const BST_VALUE_TO_SLOT: Record<string, number> = {
  '8': 0, '3': 1, '10': 2, '1': 3, '6': 4,
}

export const GRAPH_META: Record<string, { subject: string; family: string; complexity: string }> = {
  bfs: { subject: 'Graph Traversal', family: 'Data Structures', complexity: 'O(V + E)' },
  dfs: { subject: 'Graph Traversal', family: 'Data Structures', complexity: 'O(V + E)' },
  prim: { subject: 'Minimum Spanning Tree', family: 'Data Structures', complexity: 'O(E log V)' },
  kruskal: { subject: 'Minimum Spanning Tree', family: 'Data Structures', complexity: 'O(E log E)' },
  bst: { subject: 'Search Trees', family: 'Data Structures', complexity: 'O(log n) avg' },
  astar: { subject: 'Informed Search', family: 'Artificial Intelligence', complexity: 'O(b^d) bound' },
}

export function nodeLabel(algorithmId: string, i: number): string {
  if (algorithmId === 'bst') return ['8', '3', '10', '1', '6'][i] ?? String(i)
  if (algorithmId === 'astar') return ['S', 'A', 'B', 'C', 'G'][i] ?? String(i)
  return String.fromCharCode(65 + i)
}
