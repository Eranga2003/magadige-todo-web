import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Inbox, 
  Calendar, 
  Flag, 
  BarChart3, 
  LogOut, 
  User, 
  Plus, 
  Search, 
  Menu, 
  ChevronDown, 
  Bell, 
  HelpCircle, 
  Users, 
  FolderGit2 
} from 'lucide-react';
import { getColor } from '../utils/color';
import { Button } from '../components/Button';
import { playBubbleSound, playChimeSound, playTickSound } from '../utils/audio';
import { AddTaskModal } from '../components/AddTaskModal';

// Import subpages
import { InboxPage } from './dashboard/InboxPage';
import { TodayPage } from './dashboard/TodayPage';
import { UpcomingPage } from './dashboard/UpcomingPage';
import { FiltersLabelsPage } from './dashboard/FiltersLabelsPage';
import { ReportingPage } from './dashboard/ReportingPage';

import { taskService } from '../services/api';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  // Navigation & Layout states
  const [activeTab, setActiveTab] = useState('INBOX'); // INBOX, TODAY, UPCOMING, FILTERS, REPORTING
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  // Tasks list loaded from database
  const [tasks, setTasks] = useState([]);

  // Sync tasks on dashboard mount / login session
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await taskService.getTasks();
        if (response && response.data) {
          setTasks(response.data);
        }
      } catch (err) {
        console.error('❌ Failed to fetch tasks from Firestore:', err.message);
      }
    };
    if (user) {
      loadTasks();
    }
  }, [user]);

  if (!user) return null;

  // Add a new task
  const handleAddTask = async (newTask) => {
    try {
      const response = await taskService.createTask(newTask);
      if (response && response.data) {
        setTasks((prev) => [response.data, ...prev]);
      } else {
        setTasks((prev) => [newTask, ...prev]);
      }
    } catch (err) {
      console.error('❌ Failed to save new task to Firestore:', err.message);
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  // Complete a task
  const handleCompleteTask = async (taskId) => {
    try {
      const existingTask = tasks.find((t) => t.id === taskId);
      if (existingTask) {
        const updated = { ...existingTask, completed: true };
        await taskService.updateTask(taskId, updated);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updated : t))
        );
      }
    } catch (err) {
      console.error('❌ Failed to complete task in Firestore:', err.message);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );
    }
  };

  // Update a task (edit details, change date, add comments)
  const handleUpdateTask = async (updatedTask) => {
    try {
      await taskService.updateTask(updatedTask.id, updatedTask);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    } catch (err) {
      console.error('❌ Failed to update task details in Firestore:', err.message);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    }
  };

  // Switch view tabs helper
  const renderActiveSection = () => {
    switch (activeTab) {
      case 'INBOX':
        return <InboxPage tasks={tasks} onAddTask={handleAddTask} onCompleteTask={handleCompleteTask} onUpdateTask={handleUpdateTask} />;
      case 'TODAY':
        return <TodayPage tasks={tasks} onAddTask={handleAddTask} onCompleteTask={handleCompleteTask} onUpdateTask={handleUpdateTask} />;
      case 'UPCOMING':
        return <UpcomingPage tasks={tasks} onAddTask={handleAddTask} onCompleteTask={handleCompleteTask} onUpdateTask={handleUpdateTask} />;
      case 'FILTERS':
        return <FiltersLabelsPage tasks={tasks} onCompleteTask={handleCompleteTask} onUpdateTask={handleUpdateTask} />;
      case 'REPORTING':
        return <ReportingPage tasks={tasks} />;
      default:
        return <InboxPage tasks={tasks} onAddTask={handleAddTask} onCompleteTask={handleCompleteTask} onUpdateTask={handleUpdateTask} />;
    }
  };

  // Counts for sidebar indicators
  const inboxCount = tasks.filter((t) => !t.completed).length;
  const todayCount = tasks.filter((t) => t.dueDate === 'TODAY' && !t.completed).length;

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      
      {/* 1. SIDEBAR PANEL */}
      <aside 
        className={`bg-gray-50 border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ${
          isSidebarCollapsed ? 'w-0 overflow-hidden border-none' : 'w-64'
        }`}
      >
        <div className="flex flex-col flex-1 py-4 px-3 space-y-6">
          {/* User profile section */}
          <div className="relative">
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                onMouseEnter={playBubbleSound}
                className="flex items-center gap-2 hover:bg-gray-200/50 p-1.5 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className={`w-7.5 h-7.5 rounded-full ${getColor('primary.gradient')} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                  {user.name}
                </span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              <div className="flex items-center gap-1.5">
                <button 
                  onMouseEnter={playBubbleSound}
                  className="text-gray-500 hover:bg-gray-200/50 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none"
                >
                  <Bell size={16} />
                </button>
                <button 
                  onClick={() => setIsSidebarCollapsed(true)}
                  onMouseEnter={playBubbleSound}
                  className="text-gray-500 hover:bg-gray-200/50 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none"
                >
                  <Menu size={16} />
                </button>
              </div>
            </div>

            {/* Profile drop-down menu overlay */}
            {showProfileMenu && (
              <div className="absolute left-2 top-11 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-scale-up">
                <div className="px-4 py-2 border-b border-gray-50 text-xs text-gray-500 truncate font-semibold">
                  {user.email || 'Google Social Account'}
                </div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Quick Add action */}
          <div className="px-2">
            <button 
              onClick={() => setIsAddTaskModalOpen(true)}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center gap-2 text-sm font-extrabold ${getColor('primary.gradient')} text-white px-3.5 py-2.5 rounded-xl hover:shadow-md hover:scale-101 active:scale-99 transition-all duration-200 cursor-pointer`}
            >
              <Plus size={16} /> Add task
            </button>
          </div>

          {/* Navigation links list */}
          <nav className="space-y-1">
            {/* Search link emulation */}
            <button 
              onMouseEnter={playBubbleSound}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200/40 rounded-lg transition-colors cursor-pointer focus:outline-none"
            >
              <span className="flex items-center gap-3">
                <Search size={16} className="text-gray-400" /> Search
              </span>
              <kbd className="text-xs text-gray-400 bg-white border border-gray-200 px-1 py-0.5 rounded shadow-xxs">
                Ctrl K
              </kbd>
            </button>

            {/* Inbox */}
            <button 
              onClick={() => { setActiveTab('INBOX'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'INBOX' 
                  ? `${getColor('primary.text')} ${getColor('primary.bgLight')}` 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <span className="flex items-center gap-3">
                <Inbox size={16} className={activeTab === 'INBOX' ? getColor('primary.text') : 'text-gray-400'} /> Inbox
              </span>
              {inboxCount > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'INBOX' ? 'bg-white text-current' : 'bg-gray-200 text-gray-500'
                }`}>
                  {inboxCount}
                </span>
              )}
            </button>

            {/* Today */}
            <button 
              onClick={() => { setActiveTab('TODAY'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'TODAY' 
                  ? `${getColor('primary.text')} ${getColor('primary.bgLight')}` 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <span className="flex items-center gap-3">
                <Calendar size={16} className={activeTab === 'TODAY' ? getColor('primary.text') : 'text-gray-400'} /> Today
              </span>
              {todayCount > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'TODAY' ? 'bg-white text-current' : 'bg-gray-200 text-gray-500'
                }`}>
                  {todayCount}
                </span>
              )}
            </button>

            {/* Upcoming */}
            <button 
              onClick={() => { setActiveTab('UPCOMING'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'UPCOMING' 
                  ? `${getColor('primary.text')} ${getColor('primary.bgLight')}` 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <Calendar size={16} className={activeTab === 'UPCOMING' ? getColor('primary.text') : 'text-gray-400'} /> Upcoming
            </button>

            {/* Filters */}
            <button 
              onClick={() => { setActiveTab('FILTERS'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'FILTERS' 
                  ? `${getColor('primary.text')} ${getColor('primary.bgLight')}` 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <Flag size={16} className={activeTab === 'FILTERS' ? getColor('primary.text') : 'text-gray-400'} /> Filters & Labels
            </button>

            {/* Reporting */}
            <button 
              onClick={() => { setActiveTab('REPORTING'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'REPORTING' 
                  ? `${getColor('primary.text')} ${getColor('primary.bgLight')}` 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <BarChart3 size={16} className={activeTab === 'REPORTING' ? getColor('primary.text') : 'text-gray-400'} /> Reporting
            </button>
          </nav>

          {/* Section: Projects list */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-3">My Projects</h4>
            <div className="space-y-0.5">
              <button 
                onMouseEnter={playBubbleSound}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-sm font-bold text-gray-500 hover:bg-gray-200/40 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> # Work
              </button>
              <button 
                onMouseEnter={playBubbleSound}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-sm font-bold text-gray-500 hover:bg-gray-200/40 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> # Personal
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 space-y-2 text-gray-500">
          <button 
            onMouseEnter={playBubbleSound}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-bold hover:bg-gray-200/40 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
          >
            <Users size={16} /> Add a team
          </button>
          <button 
            onMouseEnter={playBubbleSound}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-bold hover:bg-gray-200/40 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
          >
            <HelpCircle size={16} /> Help & resources
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER AREA */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* Floating Menu button if sidebar collapsed */}
        {isSidebarCollapsed && (
          <header className="py-4 px-6 border-b border-gray-100 flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-lg transition-all cursor-pointer focus:outline-none"
            >
              <Menu size={20} />
            </button>
            <span className="text-base font-extrabold text-gray-800 tracking-tight">Magadige Dashboard</span>
          </header>
        )}

        {/* Dynamic subpage view container */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveSection()}
        </main>
      </div>

      {/* Global Add Task Pop-up Modal */}
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

    </div>
  );
};
