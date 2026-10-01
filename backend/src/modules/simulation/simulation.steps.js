// Precomputed step lists for each algorithm, as required by PRD 4.3:
// "State is a precomputed list of steps so forward/back are instant."
// Each step: { description, pseudocodeLine, activeNode, visited, frontier, treeEdges, vars }

const BFS = {
  algorithmId: 'bfs',
  name: 'Breadth-First Search',
  pseudocode: [
    'put start in queue, mark visited',
    'while queue not empty',
    '  v = dequeue()',
    '  for each neighbour w of v',
    '    if w not visited',
    '      mark w visited, enqueue w',
  ],
  steps: [
    { description: 'Start at vertex 0. Mark it visited and enqueue it.', pseudocodeLine: 0, activeNode: 0, visited: [0], frontier: [0], treeEdges: [], vars: { queue: [0], visited: [0] } },
    { description: 'Dequeue vertex 0. Inspect its neighbours 1 and 2.', pseudocodeLine: 2, activeNode: 0, visited: [0], frontier: [1, 2], treeEdges: [], vars: { queue: [1, 2], visited: [0] } },
    { description: 'Neighbour 1 is unvisited — mark it visited and enqueue.', pseudocodeLine: 5, activeNode: 1, visited: [0, 1], frontier: [1, 2], treeEdges: [[0, 1]], vars: { queue: [1, 2], visited: [0, 1] } },
    { description: 'Neighbour 2 is unvisited — mark it visited and enqueue.', pseudocodeLine: 5, activeNode: 2, visited: [0, 1, 2], frontier: [2], treeEdges: [[0, 1], [0, 2]], vars: { queue: [2], visited: [0, 1, 2] } },
    { description: 'Dequeue vertex 1. Its unvisited neighbour 3 is enqueued.', pseudocodeLine: 5, activeNode: 3, visited: [0, 1, 2, 3], frontier: [3], treeEdges: [[0, 1], [0, 2], [1, 3]], vars: { queue: [3], visited: [0, 1, 2, 3] } },
    { description: 'Dequeue vertex 2. Neighbours 3 and 4 are already visited or queued.', pseudocodeLine: 3, activeNode: 2, visited: [0, 1, 2, 3], frontier: [3], treeEdges: [[0, 1], [0, 2], [1, 3]], vars: { queue: [3], visited: [0, 1, 2, 3] } },
    { description: 'Dequeue vertex 3. Its unvisited neighbour 4 is enqueued.', pseudocodeLine: 5, activeNode: 4, visited: [0, 1, 2, 3, 4], frontier: [4], treeEdges: [[0, 1], [0, 2], [1, 3], [3, 4]], vars: { queue: [4], visited: [0, 1, 2, 3, 4] } },
    { description: 'Dequeue vertex 4. Queue is empty — BFS complete, all 5 vertices visited.', pseudocodeLine: 1, activeNode: 4, visited: [0, 1, 2, 3, 4], frontier: [], treeEdges: [[0, 1], [0, 2], [1, 3], [3, 4]], vars: { queue: [], visited: [0, 1, 2, 3, 4] } },
  ],
}

const DFS = {
  algorithmId: 'dfs',
  name: 'Depth-First Search',
  pseudocode: [
    'dfs(v): mark v visited',
    '  for each neighbour w of v',
    '    if w not visited: dfs(w)',
    '  return',
  ],
  steps: [
    { description: 'Start at vertex 0, mark visited and recurse.', pseudocodeLine: 0, activeNode: 0, visited: [0], frontier: [], treeEdges: [], vars: { stack: [0], visited: [0] } },
    { description: 'First neighbour 1 is unvisited — go deeper into 1.', pseudocodeLine: 2, activeNode: 1, visited: [0, 1], frontier: [], treeEdges: [[0, 1]], vars: { stack: [0, 1], visited: [0, 1] } },
    { description: 'Vertex 1’s neighbour 2 is unvisited — recurse into 2.', pseudocodeLine: 2, activeNode: 2, visited: [0, 1, 2], frontier: [], treeEdges: [[0, 1], [1, 2]], vars: { stack: [0, 1, 2], visited: [0, 1, 2] } },
    { description: 'Vertex 2 has no unvisited neighbours — backtrack to 1.', pseudocodeLine: 3, activeNode: 1, visited: [0, 1, 2], frontier: [], treeEdges: [[0, 1], [1, 2]], vars: { stack: [0, 1], visited: [0, 1, 2] } },
    { description: 'Vertex 1 fully explored — backtrack to 0.', pseudocodeLine: 3, activeNode: 0, visited: [0, 1, 2], frontier: [], treeEdges: [[0, 1], [1, 2]], vars: { stack: [0], visited: [0, 1, 2] } },
    { description: 'Next neighbour 3 of 0 is unvisited — recurse into 3.', pseudocodeLine: 2, activeNode: 3, visited: [0, 1, 2, 3], frontier: [], treeEdges: [[0, 1], [1, 2], [0, 3]], vars: { stack: [0, 3], visited: [0, 1, 2, 3] } },
    { description: 'Vertex 3’s neighbour 4 unvisited — recurse into 4.', pseudocodeLine: 2, activeNode: 4, visited: [0, 1, 2, 3, 4], frontier: [], treeEdges: [[0, 1], [1, 2], [0, 3], [3, 4]], vars: { stack: [0, 3, 4], visited: [0, 1, 2, 3, 4] } },
    { description: 'All vertices visited, stack unwinds — DFS complete.', pseudocodeLine: 3, activeNode: 4, visited: [0, 1, 2, 3, 4], frontier: [], treeEdges: [[0, 1], [1, 2], [0, 3], [3, 4]], vars: { stack: [], visited: [0, 1, 2, 3, 4] } },
  ],
}

const PRIM = {
  algorithmId: 'prim',
  name: "Prim's Minimum Spanning Tree",
  pseudocode: [
    'pick arbitrary start vertex',
    'while MST incomplete',
    '  pick min-weight edge crossing the cut',
    '  add edge + vertex to MST',
  ],
  steps: [
    { description: 'Start from vertex 0; MST = {0}.', pseudocodeLine: 0, activeNode: 0, visited: [0], frontier: [1, 2, 3], treeEdges: [], vars: { mst: [0], key: { 1: 4, 2: 3, 3: 7 } } },
    { description: 'Cheapest crossing edge is 0–2 (w=3); add vertex 2.', pseudocodeLine: 3, activeNode: 2, visited: [0, 2], frontier: [1, 3, 4], treeEdges: [[0, 2]], vars: { mst: [0, 2], key: { 1: 4, 3: 7, 4: 9 } } },
    { description: 'Cheapest crossing edge is 2–1 (w=2); add vertex 1.', pseudocodeLine: 3, activeNode: 1, visited: [0, 1, 2], frontier: [3, 4], treeEdges: [[0, 2], [2, 1]], vars: { mst: [0, 1, 2], key: { 3: 7, 4: 9 } } },
    { description: 'Cheapest crossing edge is 1–3 (w=5); add vertex 3.', pseudocodeLine: 3, activeNode: 3, visited: [0, 1, 2, 3], frontier: [4], treeEdges: [[0, 2], [2, 1], [1, 3]], vars: { mst: [0, 1, 2, 3], key: { 4: 6 } } },
    { description: 'Cheapest crossing edge is 3–4 (w=6); add vertex 4. MST complete, total weight 16.', pseudocodeLine: 1, activeNode: 4, visited: [0, 1, 2, 3, 4], frontier: [], treeEdges: [[0, 2], [2, 1], [1, 3], [3, 4]], vars: { mst: [0, 1, 2, 3, 4], totalWeight: 16 } },
  ],
}

const KRUSKAL = {
  algorithmId: 'kruskal',
  name: "Kruskal's Minimum Spanning Tree",
  pseudocode: [
    'sort all edges by weight',
    'for each edge (u,v) in order',
    '  if u,v in different components',
    '    add edge to MST (union)',
  ],
  steps: [
    { description: 'Sort edges: 2–1(2), 0–2(3), 1–3(5), 3–4(6), 0–1(4), 2–4(9).', pseudocodeLine: 0, activeNode: null, visited: [], frontier: [], treeEdges: [], vars: { sorted: ['2-1:2', '0-2:3', '0-1:4', '1-3:5', '3-4:6', '2-4:9'] } },
    { description: 'Edge 2–1 (w=2): different components — accept.', pseudocodeLine: 3, activeNode: 2, visited: [1, 2], frontier: [], treeEdges: [[2, 1]], vars: { components: 4 } },
    { description: 'Edge 0–2 (w=3): different components — accept.', pseudocodeLine: 3, activeNode: 0, visited: [0, 1, 2], frontier: [], treeEdges: [[2, 1], [0, 2]], vars: { components: 3 } },
    { description: 'Edge 0–1 (w=4): same component — reject.', pseudocodeLine: 2, activeNode: 1, visited: [0, 1, 2], frontier: [], treeEdges: [[2, 1], [0, 2]], vars: { components: 3 } },
    { description: 'Edge 1–3 (w=5): different components — accept.', pseudocodeLine: 3, activeNode: 3, visited: [0, 1, 2, 3], frontier: [], treeEdges: [[2, 1], [0, 2], [1, 3]], vars: { components: 2 } },
    { description: 'Edge 3–4 (w=6): different components — accept. MST complete, total weight 16.', pseudocodeLine: 1, activeNode: 4, visited: [0, 1, 2, 3, 4], frontier: [], treeEdges: [[2, 1], [0, 2], [1, 3], [3, 4]], vars: { components: 1 } },
  ],
}

const BST = {
  algorithmId: 'bst',
  name: 'BST Insert & In-order Traverse',
  pseudocode: [
    'insert(v): compare with root',
    '  smaller → go left, larger → go right',
    '  attach at empty slot',
    'inorder: left, node, right',
  ],
  steps: [
    { description: 'Insert 8 as the root.', pseudocodeLine: 2, activeNode: 8, visited: [8], frontier: [], treeEdges: [], vars: { tree: [8] } },
    { description: 'Insert 3: 3 < 8 → go left of 8.', pseudocodeLine: 1, activeNode: 3, visited: [8, 3], frontier: [], treeEdges: [[8, 3]], vars: { tree: [8, 3] } },
    { description: 'Insert 10: 10 > 8 → go right of 8.', pseudocodeLine: 1, activeNode: 10, visited: [8, 3, 10], frontier: [], treeEdges: [[8, 3], [8, 10]], vars: { tree: [8, 3, 10] } },
    { description: 'Insert 1: 1 < 8 → left, 1 < 3 → left of 3.', pseudocodeLine: 1, activeNode: 1, visited: [8, 3, 10, 1], frontier: [], treeEdges: [[8, 3], [8, 10], [3, 1]], vars: { tree: [8, 3, 10, 1] } },
    { description: 'Insert 6: 6 < 8 → left, 6 > 3 → right of 3.', pseudocodeLine: 1, activeNode: 6, visited: [8, 3, 10, 1, 6], frontier: [], treeEdges: [[8, 3], [8, 10], [3, 1], [3, 6]], vars: { tree: [8, 3, 10, 1, 6] } },
    { description: 'In-order traversal visits: 1, 3, 6, 8, 10 — a sorted sequence.', pseudocodeLine: 3, activeNode: 6, visited: [1, 3, 6, 8, 10], frontier: [], treeEdges: [[8, 3], [8, 10], [3, 1], [3, 6]], vars: { output: [1, 3, 6, 8, 10] } },
  ],
}

const ASTAR = {
  algorithmId: 'astar',
  name: 'A* Search',
  pseudocode: [
    'open = {start}, g(start)=0',
    'pick node with min f = g + h',
    'if goal: reconstruct path',
    'expand neighbours, update g values',
  ],
  steps: [
    { description: 'Place start (0,0) in open with f = g + h = 0 + 6 = 6.', pseudocodeLine: 0, activeNode: 0, visited: [0], frontier: [0], treeEdges: [], vars: { open: ['(0,0) f=6'], g: { '(0,0)': 0 } } },
    { description: 'Expand (0,0): neighbours (0,1) g=1 f=6 and (1,0) g=1 f=6.', pseudocodeLine: 3, activeNode: 1, visited: [0, 1], frontier: [1, 2], treeEdges: [[0, 1]], vars: { open: ['(0,1) f=6', '(1,0) f=6'], g: { '(0,1)': 1, '(1,0)': 1 } } },
    { description: 'Pick (0,1) (tie-broken); expand — (0,2) g=2 f=6.', pseudocodeLine: 1, activeNode: 2, visited: [0, 1, 2], frontier: [2, 3], treeEdges: [[0, 1], [1, 2]], vars: { open: ['(1,0) f=6', '(0,2) f=6'], g: { '(0,2)': 2 } } },
    { description: 'Continue along the heuristic gradient toward the goal.', pseudocodeLine: 1, activeNode: 3, visited: [0, 1, 2, 3], frontier: [3], treeEdges: [[0, 1], [1, 2], [2, 3]], vars: { open: ['(1,0) f=6', '(3) f=6'], g: { '(3)': 3 } } },
    { description: 'Goal reached! Reconstruct path: (0,0) → (0,1) → (0,2) → goal. Cost = 6.', pseudocodeLine: 2, activeNode: 4, visited: [0, 1, 2, 3, 4], frontier: [], treeEdges: [[0, 1], [1, 2], [2, 3]], vars: { path: ['(0,0)', '(0,1)', '(0,2)', 'goal'], totalCost: 6 } },
  ],
}

const SIMULATIONS = { bfs: BFS, dfs: DFS, prim: PRIM, kruskal: KRUSKAL, bst: BST, astar: ASTAR }

function getSimulation(algorithmId) {
  return SIMULATIONS[algorithmId] || null
}

module.exports = { getSimulation, SIMULATIONS }
