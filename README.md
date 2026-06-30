# 🤖 Magadige — AI-Powered TODO Assistant

> *Your intelligent companion for the journey ahead.*

Magadige is a next-generation AI productivity ecosystem that goes beyond traditional task management. It intelligently manages your tasks, optimizes schedules, adapts to real-world conditions, and supports your well-being using advanced AI automation.

Built as a full-stack monorepo, Magadige combines **AI-driven planning, automation, and wellness intelligence** into one seamless system.

---

## 🚀 Key Features

### 📅 Smart Scheduling & Task Management
- Drag-and-drop calendar (day/week/month views)
- Task prioritization with labels, deadlines, and recurrence
- File attachments and structured task organization
- Team collaboration workspaces

### 🧠 AI Productivity Engine (OpenAI + Gemini)
- Intelligent task prioritization based on urgency & workload
- Auto breakdown of large tasks into subtasks
- Natural language voice assistant (“What should I do next?”)
- Smart scheduling suggestions based on free time

### 🌤️ Context-Aware Intelligence
- Detects outdoor tasks automatically (run, walk, travel, etc.)
- Live weather integration for smart rescheduling
- AI suggestions when conditions are not suitable

### 💤 Wellness & Energy Awareness
- Sleep-aware scheduling system
- Energy-based task adjustments
- “I am tired” mode for lighter, adaptive routines
- Rest-time protection to avoid burnout

### 💬 Communication Automation
- AI-powered email reply generator (Gmail integration)
- WhatsApp task reminders via WhatsApp Business API
- Smart notifications for overdue tasks

### 📊 Productivity Analytics
- Daily streaks and completion tracking
- Focus time analysis
- Weekly productivity trends
- AI-generated insights & recommendations

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | Firebase (Realtime Database) |
| AI Engine | OpenAI API + Gemini API |
| Integrations | Gmail API, WhatsApp API, Weather API |

---

## 📁 Project Structure

```bash
magadige-todo-ai/
├── frontend/        # React + Tailwind application
│   ├── src/
│   └── package.json
├── backend/         # Node.js + Express API
│   ├── src/
│   ├── package.json
│   └── .env         # API keys (not committed)
