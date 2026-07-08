# 🤖 Magadige — AI-Powered TODO & Collaboration Ecosystem

> *Your intelligent, weather-aware productivity companion.*

Magadige is a next-generation AI productivity ecosystem that goes beyond traditional task management. It intelligently manages your tasks, optimizes schedules, adapts to real-world weather conditions, and enables seamless team collaboration.

Built as a full-stack monorepo, Magadige combines **AI-driven planning, interactive goal mapping, and weather intelligence** into one cohesive system.

---

## 🚀 Key Features

### 👥 Collaborative Workspaces & Kanban Boards
- **Workspace Rooms**: Create workspaces, configure projects, and manage team members.
- **Interactive Kanban Board**: Drag and drop tasks across columns (`TO DO`, `IN PROGRESS`, `COMPLETE`).
- **Team Profiles**: Shared workspace view with member initial avatars and inline invitations.
- **Member Management**: Inline email invites with success/error indicators and owner privileges to remove members.

### 🌤️ Weather-Aware Intelligence
- **Weather Assistant**: Live hour-by-hour and 7-day forecast sync (via OpenWeatherMap API).
- **AI Disruption Detection**: Automatically scans task titles (e.g., *"exercise at ground"*) using the **OpenAI API** to detect weather conflicts.
- **Dynamic UI Indicators**: Disruptive tasks highlight in red, displaying alert icons with AI mitigation advice in the **Today**, **Upcoming**, and **Weather Assistant** pages.
- **Serene Weather Scenes**: Modern, professional animations for rain, storms, and cloud drift.

### 🧠 AI Productivity Engine (OpenAI)
- **Task Breakdown**: Deconstruct large objectives into subtasks with a single click.
- **AI Meeting Assistant**: Automatically drafts and sends professional meeting reschedule emails based on selected members and time slots.
- **Smart Natural Language Input**: Fast task entry with AI-backed context extraction.

### 🏆 Win Me — Interactive Goal Mapper
- **Draggable Milestones**: Flowchart style drag-and-drop node mapper.
- **Multi-directional Expansion**: Node ports allow branching in four directions (`+` buttons).
- **Gold Goal Target Nodes**: Mark high-importance goals with gold gradient themes.
- **Auto-Save**: Saves node coords and connections to Cloud Firestore automatically.

### 💬 Communication & Automated Mailing
- **Workspace Notifications**: Instant SMTP emails sent when tasks are assigned or completed.
- **AI Email Sync**: Directly sends generated reschedule emails via SMTP.

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | React (Vite), Tailwind CSS v4, Lucide Icons, HSL Themes |
| **Backend** | Node.js, Express.js, TypeScript (ts-node-dev) |
| **Database** | Firebase (Cloud Firestore & Auth) |
| **AI Engine** | OpenAI API (`gpt-4o-mini`) |
| **Integrations** | OpenWeatherMap API, Nodemailer (SMTP) |

---

## 📁 Project Structure

```bash
magadige-todo-web/
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/      # API handlers (auth, workspaces, tasks, AI, weather)
│   │   ├── middlewares/      # JWT auth validation, Zod request filters
│   │   ├── routes/           # Express router endpoints
│   │   ├── utils/            # Firestore initialization, SMTP mailer
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React client application (Vite)
│   ├── src/
│   │   ├── components/       # Modals, Input fields, Calendar pickers
│   │   ├── context/          # React context providers (AuthContext)
│   │   ├── pages/            # Core views (Login, Register, Dashboard)
│   │   │   └── dashboard/    # Today, Upcoming, Workspace, Weather, WinMe, AI
│   │   ├── services/         # API wrappers (fetch API modules)
│   │   ├── utils/            # Color themes, audio playback, local weather checks
│   │   ├── App.jsx           # Views router wrapper
│   │   ├── index.css         # Tailwind v4 globals & custom animations
│   │   └── main.jsx          # React renderer entry
│   ├── package.json
│   └── vite.config.ts
└── README.md                 # Project documentation
```
