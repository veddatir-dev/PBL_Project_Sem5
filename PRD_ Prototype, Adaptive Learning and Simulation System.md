# PRD: Prototype, Curriculum-Integrated Adaptive Learning and Simulation System

## 1. Product Summary

A responsive web app for SY/TY Computer Engineering students that unifies three things in one portal: **Understand** (interactive algorithm visualizer), **Test** (adaptive quiz), **Implement** (embedded multi-language code workspace). A dashboard tracks progress across all three. Content is organized by the university syllabus (Year → Semester → Subject → Topic).

## 2. Users

- **Student:** learns topics, takes quizzes, writes code, views own progress.
- **Faculty:** uses simulations for teaching and views class-level progress.

## 3. Prototype Goal

A working, clickable end-to-end flow: **Login → pick a topic → watch the simulation → take the quiz → solve a coding problem → see progress on the dashboard.** Mock data is acceptable for the question bank, test cases and class analytics. The compiler should call a real sandbox API (Judge0).

## 4. Screens and Features

### 4.1 Login / Register

- Email or roll number + password. Role selection: Student or Faculty.
- JWT session. Student goes to the Student Dashboard, Faculty goes to the Faculty Dashboard.

### 4.2 Syllabus Navigator

- Cascading selection: Year (SY/TY) → Semester → Subject (Data Structures, Artificial Intelligence, Computer Graphics) → Topic.
- Each topic card shows three action buttons: **Visualize**, **Quiz**, **Code**, plus a completion badge for each.

### 4.3 Interactive Visualizer (Module A)

- Canvas that draws nodes, edges, arrays and trees for the selected algorithm.
- Controls: **Play, Pause, Step Forward, Step Back, Reset**, plus a speed slider.
- Side panel showing current step description, pseudocode with the active line highlighted, and live variable state (queue/stack contents, visited set, distances).
- Launch algorithms: **BFS, DFS, Prim's MST, Kruskal's MST, BST insert/traverse, A\* / uninformed search (AI)**.
- Animation must be smooth (≥30 fps). State is a precomputed list of steps so forward/back are instant.
- On finishing a simulation, mark it complete and show a "Take the quiz" button.

### 4.4 Adaptive Assessment (Module B)

- Topic-specific MCQ quiz, one question at a time, with a per-question timer.
- Each question has: topic tag, concept tag, difficulty (easy/medium/hard), options, correct answer, explanation.
- **Grasping power** (0–100) is recalculated after every answer from correctness, difficulty weight, and time taken (a correct, fast answer on a hard question scores highest).
- Next question difficulty adapts: correct raises it, wrong lowers it.
- Results screen: score, grasping power, weak-concept flags, and a recommendation (e.g., "Revisit DFS visualizer" or "Move on to coding").

### 4.5 Code Workspace (Module C)

- Split layout: problem statement and visible example test cases on the left, code editor on the right.
- Language selector: **C, C++, Java, Python**, with syntax highlighting and local auto-save.
- **Run** sends the code to the backend, which packages it into a JSON payload and executes it through **Judge0**.
- Backend compares output against hidden test cases.
- Output panel shows stdout, per-test-case pass/fail, execution time, memory used, and syntax/runtime errors.
- Target response time: 2–3 seconds.
- Problems are linked to topics (e.g., "Implement BFS on an adjacency list").

### 4.6 Student Dashboard

- Overall syllabus mastery %, progress bars per subject, and completion checkmarks per topic.
- Cards for simulations completed, quiz scores and grasping power trend, and coding problems solved.
- Recent activity log and a "Continue where you left off" button.

### 4.7 Faculty Dashboard

- Class overview: average quiz score and completion rate per topic, with a list of students and their mastery %.
- Weak-topic highlights for the class.
- Shortcut to open any simulation for classroom use.

## 5. Data Model (MongoDB)

- **users:** name, email/rollNo, passwordHash, role, year.
- **syllabus:** year, semester, subject, topics\[\] (id, name, algorithmId).
- **questions:** topicId, conceptTag, difficulty, text, options\[\], correctIndex, explanation.
- **problems:** topicId, title, statement, examples\[\], hiddenTestCases\[\] (input, expectedOutput).
- **progress:** userId, topicId, simulationCompleted, quizAttempts\[\] (score, graspingPower, date), codeSubmissions\[\] (language, passed/total, date).
- **Redis:** sessions, tokens, and cached syllabus data.

## 6. API (REST, JWT-protected, role-checked)

- `POST /auth/register`, `POST /auth/login`
- `GET /syllabus`, `GET /topics/:id`
- `GET /simulations/:algorithmId` returns the step list
- `GET /quiz/:topicId/next?difficulty=`, `POST /quiz/answer`
- `GET /problems/:topicId`, `POST /code/run` (language, source) returns per-test results
- `GET /progress/me`, `GET /faculty/class-overview` (faculty only)

## 7. Architecture

Client (React student app and faculty portal) → HTTPS + JWT → API gateway → Auth/RBAC → microservices (Simulation, Assessment, Code Workspace, Progress & Analytics) → MongoDB + Redis. Code Workspace calls Judge0 for sandboxed execution.

## 8. Tech Stack

- **Frontend:** React.js, Tailwind CSS, D3.js / Anime.js for animation, Monaco or CodeMirror for the editor.
- **Backend:** Node.js, Express.js, JWT, bcrypt, RBAC middleware.
- **Data:** MongoDB, Redis.
- **Compiler:** Judge0 API.
- **Deploy:** GitHub, Vercel (frontend), Render (backend).

## 9. Non-Functional Requirements

- Responsive on desktop and tablet.
- Supports 60–100 concurrent users.
- User code runs only in the Judge0 sandbox. Passwords are hashed.
- Works in Chrome, Firefox, Edge and Safari.

## 10. Prototype Acceptance Criteria

1. A student can register, log in, and see only student pages. A faculty user sees only faculty pages.
2. Any launch algorithm can be played, paused, stepped forward and back, and reset.
3. A quiz adapts difficulty and shows grasping power and weak concepts at the end.
4. Code in all four languages runs through Judge0 and returns pass/fail per test case.
5. Completing a simulation, quiz and coding problem updates the student dashboard and the faculty class overview.