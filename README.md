# 🤖 Magadige — AI-Powered TODO & Collaboration Ecosystem

> *Your intelligent, weather-aware productivity companion.*

Magadige is a next-generation AI productivity ecosystem that goes beyond traditional task management. It intelligently manages your tasks, optimizes schedules, adapts to real-world weather conditions, and enables seamless team collaboration.

Built as a full-stack monorepo, Magadige combines **AI-driven planning, interactive goal mapping, and weather intelligence** into one cohesive system.

---

## 🚀 Key Features

### 🧠 AI Assistant: Interactive Productivity & Automation
The conversational AI Assistant operates as a personal productivity agent. It parses natural language to perform complex scheduling adjustments, wellness interventions, and workflow automations.

#### 💡 Examples & Capabilities:
*   **"I am tired today" (Fatigue Mitigation Mode)**:
    *   **What it does**: Automatically restructures your day to prevent burnout.
    *   **Action**: 
        1. Reschedules all standard meetings to the next day.
        2. Automatically shifts lower-priority tasks (P3/P4) to tomorrow to clear your mental load.
        3. Inserts a new high-priority self-care task: *"🧘 Self-Care: 15-minute guided mindfulness meditation & breathing"* into your Today schedule.
*   **Task Breakdown ("Break down 'Launch Marketing Campaign'")**:
    *   **What it does**: Deconstructs large, complex tasks.
    *   **Action**: Generates a structured checklist of 3-5 logical subtasks (e.g., *Define campaign assets, draft email copy, set up analytics trackers*) and adds them directly under the parent task.
*   **Meeting Rescheduler**:
    *   **What it does**: Automates professional email communication.
    *   **Action**: When a conflict arises, the AI drafts a polished, context-aware email to all meeting members proposing a new time slot and sends it instantly via SMTP.

---

### 🌤️ Weather Assistant: Context-Aware Disruption Engine
The Weather Assistant syncs with the OpenWeatherMap API to proactively protect your outdoor plans. It evaluates tasks against real-time forecasts to identify scheduling conflicts.

#### 💡 Examples & Capabilities:
*   **Rainy / Stormy Days**:
    *   **Task**: *"Run on road"* or *"Exercise at ground"* scheduled for a **RAINY** day.
    *   **Detection**: The AI detects that this is an outdoor physical activity conflicting with precipitation.
    *   **UI Feedback**: The task card turns red (`.weather-affected-task-card`), displays a pulsing `AlertTriangle` warning icon, and displays:
        > ⚠️ **Weather Disruption: Rain**
        > *AI Mitigation Advice: Move your exercise session indoors to a gym or reschedule for a dry day.*
*   **Windy Conditions**:
    *   **Task**: *"Play badminton"* or *"Drone video shooting"*.
    *   **Detection**: Identifies that high winds will disrupt precision outdoor tasks.
    *   **AI Advice**: *“Move the session indoors to a closed court / Postpone filming to avoid wind interference.”*
*   **Extreme Heat Warning**:
    *   **Task**: Heavy outdoor manual work or long runs when the temperature exceeds **35°C**.
    *   **AI Advice**: *“Extreme heat detected. Postpone intensive outdoor activities to early morning/evening hours and stay hydrated.”*

---

### 👥 Collaborative Workspaces & Kanban Boards
- **Workspace Rooms**: Create workspaces, configure projects, and manage team members.
- **Interactive Kanban Board**: Drag and drop tasks across columns (`TO DO`, `IN PROGRESS`, `COMPLETE`).
- **Team Profiles**: Shared workspace view with member initial avatars and inline invitations.
- **Member Management**: Inline email invites with success/error indicators and owner privileges to remove members.

---

### 🏆 Win Me — Interactive Goal Mapper
- **Draggable Milestones**: Flowchart style drag-and-drop node mapper.
- **Multi-directional Expansion**: Node ports allow branching in four directions (`+` buttons).
- **Gold Goal Target Nodes**: Mark high-importance goals with gold gradient themes.
- **Auto-Save**: Saves node coords and connections to Cloud Firestore automatically.

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
