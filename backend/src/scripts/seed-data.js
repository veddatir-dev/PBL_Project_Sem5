// Seed data: SY/TY syllabus (Data Structures, AI, Computer Graphics),
// 8+ questions per topic across easy/medium/hard, coding problems with
// hidden test cases, and 15 sample students with progress.

const syllabus = [
  {
    year: 'SY',
    semester: 3,
    subject: 'Data Structures',
    topics: [
      { id: 'bfs', name: 'Breadth-First Search', algorithmId: 'bfs' },
      { id: 'dfs', name: 'Depth-First Search', algorithmId: 'dfs' },
      { id: 'bst', name: 'Binary Search Trees', algorithmId: 'bst' },
      { id: 'prim', name: "Prim's Minimum Spanning Tree", algorithmId: 'prim' },
      { id: 'kruskal', name: "Kruskal's Algorithm", algorithmId: 'kruskal' },
    ],
  },
  {
    year: 'TY',
    semester: 5,
    subject: 'Artificial Intelligence',
    topics: [
      { id: 'astar', name: 'A* Search', algorithmId: 'astar' },
      { id: 'heuristics', name: 'Heuristics & Search', algorithmId: null },
      { id: 'minimax', name: 'Minimax & Game Playing', algorithmId: null },
      { id: 'unification', name: 'Unification & Resolution', algorithmId: null },
    ],
  },
  {
    year: 'TY',
    semester: 6,
    subject: 'Computer Graphics',
    topics: [
      { id: 'raster', name: 'Rasterization', algorithmId: null },
      { id: 'transform', name: '2D Transformations', algorithmId: null },
      { id: 'clipping', name: 'Line & Polygon Clipping', algorithmId: null },
      { id: 'curves', name: 'Bezier & B-Spline Curves', algorithmId: null },
    ],
  },
]

// Each entry: [text, options[], correctIndex, explanation]
const q = {
  bfs: {
    easy: [
      ['Which data structure does BFS use to explore vertices?', ['Stack', 'Queue', 'Priority queue', 'Set'], 1, 'BFS explores level by level, so it uses a FIFO queue.'],
      ['BFS starting from a vertex visits…', ['The deepest node first', 'All neighbours level by level', 'Only leaf nodes', 'Random vertices'], 1, 'BFS radiates outward from the source in layers.'],
      ['In a graph with no weights, BFS finds…', ['The longest path', 'A spanning tree only', 'Shortest paths from the source', 'A topological order'], 2, 'The first time BFS reaches a node is via a shortest path.'],
      ['Which of these is NOT needed by BFS?', ['A visited set', 'A queue', 'The start vertex', 'A sorted edge list'], 3, 'BFS never sorts edges; that is Kruskal.'],
    ],
    medium: [
      ['What is the time complexity of BFS on a graph with V vertices and E edges?', ['O(V + E)', 'O(V²)', 'O(E log V)', 'O(log V)'], 0, 'Every vertex and edge is visited at most once.'],
      ['BFS finds shortest paths in an unweighted graph because it…', ['Sorts all edges', 'Visits nearest layers first', 'Uses recursion', 'Backtracks'], 1, 'Layer-order traversal guarantees the first visit is shortest.'],
      ['BFS applied to a tree produces…', ['A preorder traversal', 'A level-order traversal', 'A postorder traversal', 'An inorder traversal'], 1, 'Tree BFS is exactly level-order.'],
      ['A directed graph is given as adjacency lists. BFS must still…', ['Ignore edge direction', 'Follow edges in their direction', 'Reverse all edges first', 'Convert to a matrix'], 1, 'Directed BFS follows outgoing edges only.'],
      ['When does BFS fail to visit every vertex?', ['When the graph is disconnected', 'When the graph is weighted', 'When it uses a queue', 'Never'], 0, 'Vertices in other components are unreachable from the source.'],
    ],
    hard: [
      ['BFS memory usage is dominated by…', ['The visited set only', 'The largest frontier level', 'The edge list', 'Recursion depth'], 1, 'The queue holds at most one level, which can be O(V).'],
      ['A bidirectional BFS search meeting in the middle is preferred when…', ['The graph is a tree', 'The branching factor b and depth d are large: O(b^(d/2)) vs O(b^d)', 'Edges are weighted', 'The graph is disconnected'], 1, 'Two half-depth frontiers expand exponentially fewer nodes.'],
      ['BFS on an implicit state space (like a puzzle) may exhaust memory; a standard fix is…', ['Depth-limited DFS or iterative deepening', 'Random restarts', 'Sorting edges', 'Doubling the queue'], 0, 'IDDFS keeps the completeness of BFS with DFS-like memory.'],
      ['In a 0-1 weighted graph, the BFS variant that still finds shortest paths is…', ['0-1 BFS with a deque', 'Prim', 'Kruskal', 'Binary search'], 0, 'Push weight-0 edges to the front, weight-1 to the back.'],
    ],
  },
  dfs: {
    easy: [
      ['Which data structure does DFS use (explicitly or via recursion)?', ['Queue', 'Stack', 'Heap', 'Hash map'], 1, 'DFS dives deep using a stack — the call stack in the recursive form.'],
      ['DFS starting from a vertex explores…', ['All neighbours first', 'As deep as possible along one path before backtracking', 'Only root nodes', 'Vertices alphabetically'], 1, 'Depth-first means go deep, then backtrack.'],
      ['Preorder traversal of a tree is a form of…', ['BFS', 'DFS', 'Dijkstra', 'Kruskal'], 1, 'Preorder visits node before subtrees — depth-first.'],
    ],
    medium: [
      ['Time complexity of DFS with adjacency lists is…', ['O(V log V)', 'O(V + E)', 'O(E²)', 'O(V·E)'], 1, 'Each vertex and edge is processed once.'],
      ['DFS with a visited set on a graph with cycles…', ['Loops forever', 'Visits each vertex once', 'Needs edge weights', 'Produces shortest paths'], 1, 'The visited set prevents revisits.'],
      ['Detecting a cycle in a directed graph with DFS uses…', ['A queue of levels', 'Recursion stack colours (white/grey/black)', 'A priority queue', 'Edge sorting'], 1, 'A back edge to a grey node means a cycle.'],
      ['Topological ordering of a DAG is obtained by…', ['BFS from any node', 'DFS finish-time order (reversed)', 'Sorting vertices by name', 'Kruskal'], 1, 'Push each finished vertex; the reversed finish order is topological.'],
    ],
    hard: [
      ['In an undirected graph, DFS classifies edges into…', ['Only tree edges', 'Tree and back edges', 'Tree, back, forward and cross edges', 'No classification exists'], 1, 'Undirected DFS has no forward/cross edges — every non-tree edge is a back edge.'],
      ['Articulation points can be found in one DFS pass using…', ['Low-link values', 'A heap keyed by degree', 'BFS levels', 'Edge weights'], 0, 'Tarjan low-link values identify cut vertices in O(V+E).'],
      ['Iterative deepening DFS repeats work; its total node expansions are…', ['O(b^d) — still optimal like BFS', 'O(d^2)', 'O(b·d!)', 'Infinite'], 0, 'IDDFS re-expands shallow nodes but the total stays O(b^d).'],
    ],
  },
  bst: {
    easy: [
      ['In a BST, values smaller than a node go…', ['To the right', 'To the left', 'To the parent', 'Anywhere'], 1, 'The BST property: left subtree < node < right subtree.'],
      ['In-order traversal of a BST returns values…', ['In insertion order', 'Sorted ascending', 'Sorted descending', 'Randomly'], 1, 'Left-root-right on a BST is sorted order.'],
      ['The best-case height of a BST with n nodes is…', ['n', 'log n', 'n log n', '1'], 1, 'A balanced BST has height Θ(log n).'],
    ],
    medium: [
      ['Searching a balanced BST costs…', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 1, 'Each comparison halves the search space.'],
      ['Inserting sorted input into a plain BST produces…', ['A perfectly balanced tree', 'A degenerate chain of height n', 'A heap', 'An error'], 1, 'Sorted insertion makes every node a right child — O(n) searches.'],
      ['Deleting a node with two children replaces it with…', ['Any leaf', 'Its in-order successor or predecessor', 'The root', 'A random child'], 1, 'The successor preserves the BST ordering.'],
      ['A self-balancing BST (AVL/Red-Black) guarantees…', ['O(1) search', 'O(log n) search', 'O(n) search', 'O(log n) insertion only'], 1, 'Rotations keep height ≈ log n after every update.'],
    ],
    hard: [
      ['After inserting 8,3,10,1,6 the in-order traversal is…', ['8,3,10,1,6', '1,3,6,8,10', '10,8,6,3,1', '6,1,3,10,8'], 1, 'In-order always yields sorted output.'],
      ['Worst-case complexity of BST search (unbalanced) is…', ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'], 1, 'A chain-shaped tree degrades to linear scan.'],
      ['An AVL rotation is required when…', ['A node is inserted', 'The balance factor of a node becomes ±2', 'Two nodes are equal', 'The tree is empty'], 1, 'BF ∈ {-2, 2} triggers LL/RR/LR/RL rebalancing.'],
    ],
  },
  prim: {
    easy: [
      ["Prim's algorithm builds a minimum spanning tree by…", ['Sorting all edges first', 'Growing one tree from a start vertex with the cheapest crossing edge', 'Random walks', 'Binary search on weights'], 1, 'Prim always adds the min-weight edge leaving the current tree.'],
      ['A minimum spanning tree of a connected graph with V vertices has…', ['V edges', 'V−1 edges', 'V+1 edges', '2V edges'], 1, 'A spanning tree connects all V vertices with exactly V−1 edges.'],
      ['Prim is a classic example of…', ['Divide and conquer', 'Greedy algorithm', 'Dynamic programming', 'Backtracking'], 1, 'It greedily picks the locally cheapest edge each step.'],
    ],
    medium: [
      ['With a binary heap and adjacency lists, Prim runs in…', ['O(V²)', 'O(E log V)', 'O(E + V log V)', 'O(V·E)'], 1, 'Each edge relaxation is a heap op: O(E log V).'],
      ['If all edge weights are distinct, the MST is…', ['Not unique', 'Unique', 'Always a path', 'Undefined'], 1, 'Distinct weights guarantee a unique MST (cut property).'],
      ['Prim and Dijkstra are similar; the key difference is Prim minimizes…', ['Path length from the source', 'Edge weight crossing the cut', 'Total flow', 'Vertex degree'], 1, "Dijkstra keys are distances; Prim's keys are single edge weights."],
      ['Negative edge weights in Prim…', ['Break the algorithm', 'Are fine — the cut property still holds', 'Require sorting vertices', 'Double the runtime'], 1, 'Prim works with any real weights on a connected graph.'],
    ],
    hard: [
      ['Using a Fibonacci heap, Prim achieves…', ['O(E log V)', 'O(E + V log V)', 'O(V²)', 'O(E·α(V))'], 1, 'Amortized decrease-key O(1) gives E + V log V.'],
      ['The dense-graph variant of Prim with an array of keys runs in…', ['O(V²)', 'O(E log V)', 'O(V log E)', 'O(E + V)'], 0, 'Scanning for the min key is O(V) per iteration → O(V²) total, best for dense graphs.'],
      ['If the graph is disconnected, Prim returns…', ['An MST', 'An error only', 'An MSF (forest) of the component containing the start vertex', 'A cycle'], 2, 'Prim grows a single tree; restart per component for a forest.'],
    ],
  },
  kruskal: {
    easy: [
      ["Kruskal's algorithm starts by…", ['Picking a root', 'Sorting all edges by weight', 'Running BFS', 'Reversing the graph'], 1, 'Edges are considered in ascending weight order.'],
      ['Kruskal uses which structure to avoid cycles?', ['Queue', 'Union-Find (disjoint set)', 'Stack', 'Trie'], 1, 'Union-Find tells whether two vertices are already connected.'],
      ['Kruskal is a…', ['Greedy algorithm', 'Divide-and-conquer algorithm', 'Randomized algorithm', 'Brute-force algorithm'], 0, 'It greedily accepts the cheapest safe edge.'],
    ],
    medium: [
      ['Union-Find with path compression and union by rank runs in…', ['O(log n) per op', 'O(α(n)) ≈ constant amortized per op', 'O(n) per op', 'O(n log n) per op'], 1, 'Inverse Ackermann — effectively constant.'],
      ['Kruskal on a connected graph stops after accepting…', ['All E edges', 'V−1 edges', 'V edges', 'V/2 edges'], 1, 'An MST needs exactly V−1 edges.'],
      ['If an edge connects two vertices in the same component, Kruskal…', ['Accepts it', 'Rejects it', 'Restarts', 'Doubles its weight'], 1, 'Accepting would create a cycle.'],
      ['Prim vs Kruskal: which suits a very dense graph better?', ['Kruskal', 'Prim', 'Both equal', 'Neither'], 1, 'Kruskal must sort E ≈ V² edges; Prim (array) is O(V²).'],
    ],
    hard: [
      ['Kruskal total complexity with an efficient sort is…', ['O(E log E)', 'O(V²)', 'O(E + V)', 'O(V·E)'], 0, 'Sorting dominates: O(E log E) = O(E log V).'],
      ['The cut property that makes greedy MST safe states…', ['Any lightest edge crossing any cut is in some MST', 'Heaviest edges are never in an MST', 'MSTs are always unique', 'Cycles are always safe'], 0, 'This is the theoretical foundation of both Prim and Kruskal.'],
      ['Kruskal applied to a disconnected graph produces…', ['An error', 'A minimum spanning forest', 'A single spanning tree', 'An Euler tour'], 1, 'Each component gets its own tree — the MSF.'],
    ],
  },
  astar: {
    easy: [
      ['A* selects the next node to expand by minimizing…', ['g(n) only', 'h(n) only', 'f(n) = g(n) + h(n)', 'The node degree'], 2, 'A* balances cost-so-far and the heuristic estimate.'],
      ['In A*, g(n) is…', ['The heuristic estimate', 'The exact cost from start to n', 'The goal test', 'The path length of the solution'], 1, 'g is the known cost so far.'],
      ['A classic admissible heuristic for grid pathfinding is…', ['Random guess', 'Manhattan distance', 'Squared distance', 'Number of edges'], 1, 'Manhattan distance never overestimates on 4-connected grids.'],
    ],
    medium: [
      ['A heuristic is admissible if it…', ['Is always exact', 'Never overestimates the true remaining cost', 'Is computable in O(1)', 'Uses a priority queue'], 1, 'Admissibility guarantees optimality of A*.'],
      ['A heuristic is consistent if…', ['h(goal) = 0 and h(n) ≤ c(n, n′) + h(n′) for every edge', 'It never changes', 'It is admissible only', 'It uses floating point'], 0, 'Consistency (monotonicity) makes f non-decreasing along paths.'],
      ['With an inadmissible (overestimating) heuristic, A* becomes…', ['Faster and still optimal', 'Faster but possibly suboptimal', 'Incomplete', 'Equivalent to BFS'], 1, 'It may expand the goal along a longer path — weighted A* trades optimality for speed.'],
      ['If h(n) = 0 for all n, A* behaves like…', ['DFS', 'Uniform-cost search (Dijkstra)', 'Greedy best-first', 'Hill climbing'], 1, 'f = g only — UCS.'],
    ],
    hard: [
      ['A* optimality requires h to be admissible when…', ['The graph is a tree', 'Reopening closed nodes is allowed (or h is consistent)', 'The queue is a stack', 'Edge weights are negative'], 1, 'Graph search needs consistency, or must allow re-expansion.'],
      ['Dominance between heuristics h₁ and h₂ means…', ['h₁(n) ≥ h₂(n) ∀n — h₁ expands fewer or equal nodes', 'h₁ is faster to compute', 'h₂ is admissible and h₁ is not', 'They are equal at the goal only'], 0, 'A dominating heuristic is strictly more informed.'],
      ['IDA* differs from A* by…', ['Using a stack with an f-cost threshold instead of an open list', 'Ignoring the heuristic', 'Guaranteeing O(1) memory but re-expanding nodes', 'Both a and c'], 3, 'IDA* is linear-memory iterative deepening on f.'],
    ],
  },
  heuristics: {
    easy: [
      ['An informed search strategy uses…', ['Only the frontier', 'Problem-specific knowledge beyond the problem definition', 'Random choices', 'Sorted arrays'], 1, 'Heuristics are extra domain knowledge.'],
      ['Greedy best-first search expands the node with the smallest…', ['g(n)', 'h(n)', 'f(n)=g+h', 'Depth'], 1, 'Greedy best-first orders purely by heuristic.'],
      ['Hill climbing keeps only…', ['The full frontier', 'The current state and moves to better neighbours', 'A priority queue', 'A solution tree'], 1, 'It is local search with no frontier.'],
    ],
    medium: [
      ['A common weakness of plain hill climbing is…', ['Too much memory', 'Getting stuck in local maxima', 'Always exponential time', 'It cannot use heuristics'], 1, 'It has no mechanism to escape local optima.'],
      ['Simulated annealing escapes local optima by…', ['Restarting only', 'Accepting worse moves with a decreasing probability', 'Using a queue', 'Doubling the heuristic'], 1, 'The temperature schedule controls acceptance of bad moves.'],
      ['The effective branching factor of a heuristic is…', ['b always', 'The b′ for which a search tree of depth d has N nodes', 'The tree height', 'The number of goals'], 1, 'b′ measures how much a heuristic prunes.'],
      ['Manhattan vs Euclidean distance on a 4-connected grid: which is admissible?', ['Euclidean only', 'Both', 'Manhattan only', 'Neither'], 1, 'Both never overestimate the 4-connected step cost.'],
    ],
    hard: [
      ['Generate-and-test with a good ordering heuristic becomes…', ['Complete and optimal if the generator is systematic', 'Always exponential', 'A local search', 'UCS'], 0, 'Systematic generation + pruning keeps completeness.'],
      ['The relaxed-problem method derives a heuristic by…', ['Solving an easier version of the problem exactly', 'Guessing from data', 'Counting nodes', 'Averaging edge weights'], 0, 'e.g. sliding-tile Manhattan distance relaxes "one tile per move".'],
      ['Pattern databases heuristics work by…', ['Precomputing exact costs for subproblems', 'Random sampling', 'Machine learning only', 'Sorting states'], 0, 'Disjoint pattern databases give strong admissible heuristics.'],
    ],
  },
  minimax: {
    easy: [
      ['Minimax is used for…', ['Single-player puzzles', 'Two-player adversarial games', 'Sorting', 'Graph colouring'], 1, 'It models alternating moves of two opponents.'],
      ['In minimax, MAX nodes choose…', ['The minimum child value', 'The maximum child value', 'A random child', 'The shallowest child'], 1, 'MAX maximizes the utility.'],
      ['A zero-sum game means…', ['Both players can win', "One player's gain equals the other's loss", 'No one moves', 'Scores are always 0'], 1, 'Utilities sum to a constant.'],
    ],
    medium: [
      ['Alpha-beta pruning improves minimax by…', ['Changing the result', 'Skipping branches that cannot affect the decision', 'Caching states', 'Random sampling'], 1, 'It returns the same move, only faster.'],
      ['Best-case alpha-beta complexity is…', ['O(b^d)', 'O(b^(d/2))', 'O(d)', 'O(b·d)'], 1, 'Perfect ordering halves the effective depth.'],
      ['A depth-limited minimax uses…', ['The exact utility always', 'An evaluation function at the cutoff', 'Random play', 'No evaluation'], 1, 'Beyond the horizon, heuristic evaluation substitutes for exact values.'],
      ['Move ordering affects alpha-beta…', ['Not at all', 'Strongly — good ordering prunes more', 'Only in chess', 'Only at leaves'], 1, 'Best-first ordering approaches the O(b^(d/2)) ideal.'],
    ],
    hard: [
      ['Alpha values are…', ['Best already-found values for MAX along the path', 'Bounds for MIN', 'Leaf utilities', 'Depths'], 0, 'Alpha is MAX’s lower bound; beta is MIN’s upper bound.'],
      ['Transposition tables help game search by…', ['Storing evaluated positions reached by different move orders', 'Sorting moves', 'Deepening the horizon', 'Removing randomness'], 0, 'Identical positions are solved once.'],
      ['Expectiminimax extends minimax with…', ['Chance nodes weighted by probabilities', 'More pruning', 'Alpha only', 'Iterative deepening'], 0, 'Dice or randomness introduces chance nodes.'],
    ],
  },
  unification: {
    easy: [
      ['Unification finds a substitution that makes…', ['Two logical expressions identical', 'A graph acyclic', 'A tree balanced', 'A set sorted'], 0, 'It solves an equation between terms.'],
      ['In first-order logic, variables are typically written as…', ['x, y, z (lowercase letters)', 'Capital letters like X, Y', 'Greek letters only', 'Numbers'], 1, 'Convention: capital letters denote variables.'],
      ['Resolution is a rule of inference for…', ['Arithmetic', 'Proof by refutation in FOL', 'Sorting', 'String matching'], 1, 'Resolution derives contradictions from clauses.'],
    ],
    medium: [
      ['A most general unifier (mgu) is…', ['Any substitution that unifies', 'The least constraining substitution that unifies', 'Always unique up to renaming', 'A contradiction'], 1, 'The mgu imposes no more bindings than necessary.'],
      ['Unifying loves(John, x) with loves(y, Mary) gives…', ['{x/Mary, y/John}', '{x/John, y/Mary}', 'Failure', '{y/x}'], 0, 'Bind positionally: y↦John, x↦Mary.'],
      ['Unifying x with f(x) fails because it would create…', ['A cycle (occurs check)', 'A tautology', 'A clause', 'A sort'], 0, 'The occurs check prevents infinite terms.'],
      ['Resolution of clause (P ∨ Q) with (¬P ∨ R) yields…', ['Q ∨ R', 'P', '¬Q', 'P ∧ Q'], 0, 'Resolve on P, take the union of the remainders.'],
    ],
    hard: [
      ['Conversion to conjunctive normal form requires…', ['Eliminating ↔, →, moving ¬ inward, distributing ∨ over ∧', 'Skolemization only', 'Sorting literals', 'Ground terms only'], 0, 'The standard CNF pipeline precedes resolution.'],
      ['Skolemization removes existential quantifiers by…', ['Introducing Skolem functions/constants', 'Universal closure', 'Renaming predicates', 'Dropping clauses'], 0, '∃x becomes a fresh function of the enclosing universals.'],
      ['Resolution refutation proves entailment KB ⊨ α by…', ['Showing KB ∧ ¬α derives the empty clause', 'Enumerating models', 'Truth tables', 'Induction'], 0, 'Unsatisfiability of KB ∧ ¬α is a refutation-complete proof.'],
    ],
  },
  raster: {
    easy: [
      ['Rasterization converts…', ['Vectors to pixels', 'Pixels to vectors', '3D to audio', 'JPEG to PNG'], 0, 'It is the geometry-to-fragment stage of the pipeline.'],
      ["DDA is an algorithm for drawing…", ['Circles', 'Lines', 'Polygons', 'Text'], 1, "Digital Differential Analyzer increments along the line."],
      ['A framebuffer stores…', ['Geometry', 'Per-pixel colour values', 'Transform matrices', 'Shaders'], 1, 'The final image lives as pixel data in the framebuffer.'],
    ],
    medium: [
      ['Bresenham’s line algorithm improves on DDA by…', ['Floating-point math', 'Using only integer arithmetic', 'Anti-aliasing', 'Clipping'], 1, 'Integer decisions make it fast in hardware.'],
      ['Midpoint circle drawing decides the next pixel using…', ['The circle equation at the midpoint between candidates', 'Random sampling', 'Trigonometry tables', 'A queue'], 0, 'Evaluating the implicit function at the midpoint drives the decision.'],
      ['Scan-line polygon fill works by…', ['Testing every pixel', 'Intersecting scan lines with edges and filling spans', 'Flood fill', 'Boundary tracing only'], 1, 'Span fill between edge intersections is efficient.'],
      ['Aliasing (jaggies) is caused by…', ['Too much memory', 'Sampling a continuous signal at discrete pixels', 'Wrong colours', 'Slow refresh'], 1, 'It is the classic undersampling artifact.'],
    ],
    hard: [
      ['Anti-aliasing by supersampling works by…', ['Rendering at higher resolution and averaging down', 'Dithering only', 'Boosting contrast', 'Reducing resolution'], 0, 'More samples approximate area coverage.'],
      ['Bresenham handles all octants by…', ['Swapping x/y and tracking an error term', 'Eight separate loops', 'Floating point', 'Precomputed tables'], 0, 'Generalized integer error-term formulation covers every slope.'],
      ['Gouraud vs Phong shading: Phong differs by…', ['Interpolating normals and evaluating lighting per pixel', 'Interpolating colours only', 'No interpolation', 'Flat shading'], 0, 'Per-pixel normal evaluation gives better specular highlights.'],
    ],
  },
  transform: {
    easy: [
      ['A 2D translation shifts points by…', ['Adding offsets (tx, ty)', 'Multiplying by a scalar', 'Swapping x and y', 'Negating y'], 0, 'Translation is addition in homogeneous coordinates via a matrix too.'],
      ['Rotation by 90° counterclockwise maps (x, y) to…', ['(y, −x)', '(−y, x)', '(−x, −y)', '(x, −y)'], 1, 'Standard rotation matrix at θ=90°.'],
      ['Scaling with sx = sy = 2…', ['Doubles all coordinates about the origin', 'Moves the object', 'Rotates it', 'Shears it'], 0, 'Uniform scaling enlarges distances from the origin.'],
    ],
    medium: [
      ['Why homogeneous coordinates?', ['They let translation (and all affine maps) be expressed as matrix multiplication', 'They save memory', 'They normalize colours', 'They speed up rasterization'], 0, 'A 3×3 matrix unifies translation, rotation, scaling, shear.'],
      ['To rotate about an arbitrary point P: translate P to origin, rotate, then…', ['Translate back by −P', 'Translate back by +P', 'Scale by 1/|P|', 'Shear'], 1, 'The composite is T(P) · R(θ) · T(−P).'],
      ['A shear transformation…', ['Preserves area but tilts axes', 'Preserves angles', 'Is a rigid motion', 'Is a projection'], 0, 'Shear displaces one coordinate proportionally to the other.'],
      ['Rotation matrices in 2D are orthogonal, so their inverse equals…', ['The transpose', 'Zero', 'A shear', 'The identity'], 0, 'R⁻¹ = Rᵀ for orthogonal matrices.'],
    ],
    hard: [
      ['The composite of two rotations by θ₁ then θ₂ equals…', ['Rotation by θ₁+θ₂', 'Rotation by θ₁·θ₂', 'A shear', 'An unpredictable map'], 0, '2D rotations commute and add.'],
      ['Reflection about the line y = x maps (x, y) to…', ['(y, x)', '(−y, −x)', '(x, −y)', '(−x, y)'], 0, 'Swapping coordinates reflects across y = x.'],
      ['Affine transformations always preserve…', ['Parallelism and straight lines', 'Lengths', 'Angles', 'Areas'], 0, 'Collinearity and parallelism survive; lengths/angles may not.'],
    ],
  },
  clipping: {
    easy: [
      ['Clipping removes…', ['Geometry outside the view/window', 'All colours', 'Hidden vertices only', 'Anti-aliasing'], 0, 'Only the interior region is kept.'],
      ['Cohen–Sutherland is a…', ['Line clipping algorithm', 'Polygon fill', 'Shading model', 'Curve fit'], 0, 'It uses outcodes to classify line endpoints.'],
      ['Sutherland–Hodgman clips…', ['Polygons against a rectangle', 'Lines against circles', 'Curves', 'Textures'], 0, 'It clips a polygon successively against each boundary.'],
    ],
    medium: [
      ['In Cohen–Sutherland, two endpoints with outcode AND = 0000 means the line is…', ['Completely outside', 'Trivially accepted... wait — AND=0000 with both codes nonzero? Not accepted; but both 0000 means accepted', 'Partially visible', 'Degenerate'], 1, 'If both outcodes are 0000 the line is fully inside.'],
      ['Cyrus–Beck clipping generalizes Cohen–Sutherland to…', ['Convex clip windows with parametric normals', 'Circles', 'Non-convex polygons directly', '3D only'], 0, 'It uses the parametric line form and inward normals.'],
      ['Sutherland–Hodgman can produce degenerate edges when clipping…', ['Convex polygons', 'Concave polygons (may leave bridging edges)', 'Single points', 'Nothing — it never does'], 1, 'Multiple output fragments may be connected spuriously.'],
      ['Liang–Barsky improves on Cohen–Sutherland by…', ['Computing intersections parametrically in one pass', 'Using outcodes', 'Random rejection', 'Sorting vertices'], 0, 'Inequalities on the parameter t give up to two intersections directly.'],
    ],
    hard: [
      ['Weiler–Atherton handles concave clip windows better because it…', ['Traces the actual intersection boundary, including re-entry points', 'Uses outcodes', 'Clips only horizontally', 'Is a shading technique'], 0, 'It walks the subject/clip boundary alternately.'],
      ['Clipping a polygon that crosses a corner twice yields…', ['Always one polygon', 'Possibly multiple output polygons', 'A point', 'Nothing'], 1, 'Concave cases split into disjoint fragments.'],
      ['Guard-band clipping is used to…', ['Tolerate hardware precision limits near clip edges', 'Speed up texture mapping', 'Blend colours', 'Compress depth'], 0, 'A slightly larger clip region avoids crack artifacts.'],
    ],
  },
  curves: {
    easy: [
      ['A Bézier curve passes through…', ['All control points', 'Its first and last control points', 'The centroid only', 'No control points'], 1, 'Endpoint interpolation is a defining property.'],
      ['The number of control points of a cubic Bézier is…', ['2', '3', '4', '8'], 2, 'Cubic = degree 3 = 4 points.'],
      ['B-splines offer locality, meaning…', ['Moving one control point affects the whole curve equally', 'A control point influences only nearby segments', 'Curves are static', 'Nothing changes'], 1, 'Local support is the key advantage over Bézier.'],
    ],
    medium: [
      ['Bernstein polynomials of degree n sum to…', ['0', '1 for every parameter value t', 't^n', 'Infinity'], 1, 'They form a partition of unity — hence convex-hull property.'],
      ['De Casteljau’s algorithm evaluates a Bézier curve via…', ['Repeated linear interpolation', 'Matrix inversion', 'Fourier transform', 'Newton iteration'], 0, 'Nested lerping is numerically stable.'],
      ['Increasing the degree of a Bézier curve…', ['Increases global influence of each point', 'Has no effect', 'Reduces smoothness', 'Makes it discontinuous'], 0, 'Bézier control points have global support.'],
      ['C¹ continuity between two curve segments means…', ['Positions match', 'Positions and first derivatives match', 'Curvature matches', 'Nothing matches'], 1, 'C² additionally matches second derivatives.'],
    ],
    hard: [
      ['A uniform cubic B-spline curve…', ['Does not interpolate its control points generally', 'Interpolates all control points', 'Is always a straight line', 'Has degree 7'], 0, 'It approximates the control polygon instead.'],
      ['Knot insertion (e.g., Boehm’s algorithm)…', ['Adds control points without changing the curve shape', 'Changes the curve', 'Raises the degree', 'Deletes segments'], 0, 'It is the B-spline analogue of de Casteljau refinement.'],
      ['A Bézier curve lies entirely in the convex hull of its control points because…', ['Bernstein basis is non-negative and sums to 1', 'Of de Casteljau', 'Of the knot vector', 'Of symmetry'], 0, 'The curve is a convex combination of the points.'],
    ],
  },
}

function questionDocs() {
  const docs = []
  for (const [topicId, byDifficulty] of Object.entries(q)) {
    for (const [difficulty, list] of Object.entries(byDifficulty)) {
      for (const [text, options, correctIndex, explanation] of list) {
        docs.push({
          topicId,
          conceptTag: conceptFor(topicId),
          difficulty,
          text,
          options,
          correctIndex,
          explanation,
        })
      }
    }
  }
  return docs
}

function conceptFor(topicId) {
  const map = {
    bfs: 'BFS queue mechanics',
    dfs: 'DFS stack & backtracking',
    bst: 'BST ordering & balancing',
    prim: 'Greedy MST growth',
    kruskal: 'Union-Find & edge sorting',
    astar: 'A* f = g + h',
    heuristics: 'Heuristic design',
    minimax: 'Adversarial search',
    unification: 'FOL unification',
    raster: 'Line & polygon rasterization',
    transform: 'Affine transformations',
    clipping: 'Clipping algorithms',
    curves: 'Spline theory',
  }
  return map[topicId] || topicId
}

const problems = [
  {
    topicId: 'bfs',
    title: 'Implement BFS on an adjacency list',
    statement:
      'Given an undirected graph as an adjacency list (a list where index i holds the neighbours of vertex i) and a starting vertex, print the BFS visit order starting at that vertex, visiting neighbours in ascending order, as a space-separated list on one line.',
    difficulty: 'medium',
    examples: [
      { input: '5 4\n0 1\n0 2\n1 3\n2 3\n0', output: '0 1 2 3' },
    ],
    hiddenTestCases: [
      { input: '5 4\n0 1\n0 2\n1 3\n2 3\n0', expectedOutput: '0 1 2 3' },
      { input: '4 2\n0 1\n2 3\n0', expectedOutput: '0 1' },
      { input: '3 3\n0 1\n1 2\n2 0\n1', expectedOutput: '1 0 2' },
      { input: '1 0\n0', expectedOutput: '0' },
    ],
    starterCode: {
      python:
        'from collections import deque\n\ndef bfs(n, adj, start):\n    # your code here\n    pass\n\nif __name__ == "__main__":\n    import sys\n    data = sys.stdin.read().split()\n    n, m = int(data[0]), int(data[1])\n    adj = [[] for _ in range(n)]\n    idx = 2\n    for _ in range(m):\n        u, v = int(data[idx]), int(data[idx + 1])\n        adj[u].append(v)\n        adj[v].append(u)\n        idx += 2\n    start = int(data[idx])\n    print(*bfs(n, adj, start))\n',
      cpp:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // read n, m, then m edges, then start; print BFS order\n    return 0;\n}\n',
      java:
        'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // read input and print BFS order\n    }\n}\n',
      c:
        '#include <stdio.h>\n\nint main(void) {\n    // read input and print BFS order\n    return 0;\n}\n',
    },
  },
  {
    topicId: 'dfs',
    title: 'Traverse a graph with DFS',
    statement:
      'Given an undirected graph as an adjacency list and a starting vertex, print the depth-first visit order (visiting neighbours in ascending order), space-separated on one line.',
    difficulty: 'medium',
    examples: [
      { input: '3 2\n0 1\n0 2\n0', output: '0 1 2' },
    ],
    hiddenTestCases: [
      { input: '3 2\n0 1\n0 2\n0', expectedOutput: '0 1 2' },
      { input: '5 5\n0 1\n1 2\n2 3\n3 4\n4 0\n0', expectedOutput: '0 1 2 3 4' },
      { input: '4 1\n2 3\n2', expectedOutput: '2 3' },
    ],
    starterCode: {
      python:
        'import sys\nsys.setrecursionlimit(100000)\n\ndef dfs(n, adj, start):\n    # your code here\n    pass\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    n, m = int(data[0]), int(data[1])\n    adj = [[] for _ in range(n)]\n    idx = 2\n    for _ in range(m):\n        u, v = int(data[idx]), int(data[idx + 1])\n        adj[u].append(v)\n        adj[v].append(u)\n        idx += 2\n    start = int(data[idx])\n    print(*dfs(n, adj, start))\n',
    },
  },
  {
    topicId: 'bst',
    title: 'Insert into a Binary Search Tree',
    statement:
      'Read a list of distinct integers, insert them into a binary search tree in the given order, and print the in-order traversal as space-separated values on one line.',
    difficulty: 'easy',
    examples: [
      { input: '8 3 10 1 6', output: '1 3 6 8 10' },
    ],
    hiddenTestCases: [
      { input: '8 3 10 1 6', expectedOutput: '1 3 6 8 10' },
      { input: '5 4 3 2 1', expectedOutput: '1 2 3 4 5' },
      { input: '42', expectedOutput: '42' },
      { input: '10 20 15 25', expectedOutput: '10 15 20 25' },
    ],
    starterCode: {
      python:
        'import sys\nsys.setrecursionlimit(100000)\n\nclass Node:\n    def __init__(self, v):\n        self.v = v\n        self.l = None\n        self.r = None\n\ndef insert(root, v):\n    # your code here\n    pass\n\ndef inorder(root, out):\n    # your code here\n    pass\n\nif __name__ == "__main__":\n    values = list(map(int, sys.stdin.read().split()))\n    root = None\n    for v in values:\n        root = insert(root, v)\n    out = []\n    inorder(root, out)\n    print(*out)\n',
    },
  },
  {
    topicId: 'astar',
    title: 'Count visited cells in a weighted grid search',
    statement:
      'You are given an n×n grid of numbers. Starting from the top-left cell, repeatedly move to the right or down neighbour with the smaller value (ties: prefer right). Starting from cell (0,0), print the sum of values of all visited cells until you reach the bottom-right cell (inclusive).',
    difficulty: 'medium',
    examples: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', output: '45' },
    ],
    hiddenTestCases: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '45' },
      { input: '2\n1 100\n1 1', expectedOutput: '4' },
      { input: '1\n7', expectedOutput: '7' },
      { input: '3\n5 5 5\n5 1 1\n5 5 1', expectedOutput: '18' },
    ],
    starterCode: {
      python:
        'import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    n = int(data[0])\n    grid = [list(map(int, data[1 + i * n : 1 + (i + 1) * n])) for i in range(n)]\n    # greedy walk right/down by smaller neighbour value; print visited sum\n    pass\n\nmain()\n',
    },
  },
  {
    topicId: 'transform',
    title: 'Apply 2D transformations',
    statement:
      'Read a point (x, y), then apply in order: translate by (tx, ty), rotate 90 degrees counterclockwise about the origin, and scale by (sx, sy). Print the final coordinates rounded to two decimal places, space separated.',
    difficulty: 'easy',
    examples: [
      { input: '1 2\n3 4\n1 1', output: '-2.00 5.00' },
    ],
    hiddenTestCases: [
      { input: '1 2\n3 4\n1 1', expectedOutput: '-2.00 5.00' },
      { input: '0 0\n0 0\n2 3', expectedOutput: '0.00 0.00' },
      { input: '5 -5\n1 1\n1 2', expectedOutput: '4.00 12.00' },
    ],
    starterCode: {
      python:
        'import sys\n\ndef main():\n    data = list(map(float, sys.stdin.read().split()))\n    x, y, tx, ty, sx, sy = data\n    # translate, rotate 90° CCW, scale; print formatted\n    pass\n\nmain()\n',
    },
  },
]

module.exports = { syllabus, questionDocs, problems }
