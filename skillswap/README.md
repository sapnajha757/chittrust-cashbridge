# SkillSwap — The AI Career OS

SkillSwap is an intelligent, real-time operating system for students and developers to map, share, and expand their skills. It uses natural language processing (Groq LLM) to map intent, resolve vector compatibility, and establish direct peer sync loops.

---

## 🚀 Key Features

* **Intent-Driven Nexus (Workspace):** An interactive spatial canvas where you declare your learning goals or expertise. The AI routes matching opportunities to your viewport in real time.
* **AI Agent Fleet:** 8 specialized agents sharing your career context (Career Coach, Resume Reviewer, Learning Planner, Mock Interviewer, and more).
* **Interactive Career Universe:** A visual constellation mapping your profile nodes and match synergies.
* **Command Palette (`⌘+K` / `Ctrl+K`):** Quickly navigate the application and trigger functions using keyboard shortcuts.
* **Security & Performance Built-in:** Includes strict parameter validation, HSTS security headers, and direct DOM manipulation via refs for smooth, 0-re-render animation loops.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion
* **Database & Realtime:** Convex (Convex Auth)
* **AI Inference:** Groq API (Llama 3.3 70B)
* **Design Language:** Obsidian Botanical ("Slow Tech" aesthetic)

---

## 🚦 Getting Started

### 1. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
GROQ_API_KEY=your_groq_api_key
```

### 3. Start Development Server

Run the application locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the workspace.
