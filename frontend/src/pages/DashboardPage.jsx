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
  FolderGit2,
  Camera,
  Smile,
  X,
  CloudSun,
  Bot,
  Trophy,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { getColor } from '../utils/color';
import { Button } from '../components/Button';
import { playBubbleSound, playChimeSound, playTickSound } from '../utils/audio';
import { AddTaskModal } from '../components/AddTaskModal';
import { supabase } from '../utils/supabase';

// Import subpages
import { InboxPage } from './dashboard/InboxPage';
import { TodayPage } from './dashboard/TodayPage';
import { UpcomingPage } from './dashboard/UpcomingPage';
import { FiltersLabelsPage } from './dashboard/FiltersLabelsPage';
import { ReportingPage } from './dashboard/ReportingPage';
import { WorkspacePage } from './dashboard/WorkspacePage';
import { WorkspaceDashboard } from './dashboard/WorkspaceDashboard';
import { WeatherAssistantPage } from './dashboard/WeatherAssistantPage';
import { AiAssistantPanel } from './dashboard/AiAssistantPanel';
import { WinMePage } from './dashboard/WinMePage';


import { taskService, workspaceService, authService, weatherService, aiService } from '../services/api';

export const DashboardPage = () => {
  const { user, logout, updateUser } = useAuth();
  
  // Navigation & Layout states
  const [activeTab, setActiveTab] = useState('TODAY'); // INBOX, TODAY, UPCOMING, FILTERS, REPORTING, WORKSPACE, WORKSPACE_DASHBOARD
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Tasks list loaded from database
  const [tasks, setTasks] = useState([]);

  // Weather forecast for AI analysis
  const [weatherForecast, setWeatherForecast] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await weatherService.getWeatherForecast('Colombo');
        if (res && res.data && res.data.weekly) {
          setWeatherForecast(res.data.weekly);
        }
      } catch (err) {
        console.error('❌ Failed to load weather for DashboardPage:', err);
      }
    };
    fetchWeather();
  }, []);

  // Workspaces list
  const [myWorkspaces, setMyWorkspaces] = useState([]);

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(null);
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState(null);

  const loadMyWorkspaces = async () => {
    try {
      const res = await workspaceService.getWorkspaces();
      if (res && res.data) {
        setMyWorkspaces(res.data);
      }
    } catch (err) {
      console.error('❌ Failed to fetch user workspaces:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyWorkspaces();
      setProfileName(user.name || '');
      setProfileUsername(user.username || '');
      setProfileBio(user.bio || '');
      setProfilePhotoUrl(user.photoUrl || '');
    }
  }, [user]);

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    setIsProfileUpdating(true);

    let finalPhotoUrl = profilePhotoUrl;

    if (profileAvatarFile) {
      setIsProfileUploading(true);
      try {
        const fileExt = profileAvatarFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('Profile Images')
          .upload(filePath, profileAvatarFile, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from('Profile Images')
          .getPublicUrl(filePath);

        finalPhotoUrl = data.publicUrl;
        setProfilePhotoUrl(finalPhotoUrl);
      } catch (err) {
        console.error(err);
        setProfileErrorMsg(err.message || 'Failed to upload photo to storage.');
        setIsProfileUpdating(false);
        setIsProfileUploading(false);
        return;
      } finally {
        setIsProfileUploading(false);
      }
    }

    try {
      const res = await authService.updateProfile({
        name: profileName.trim(),
        username: profileUsername.trim(),
        bio: profileBio.trim(),
        photoUrl: finalPhotoUrl
      });

      if (res && res.data && res.data.user) {
        const updated = res.data.user;
        // Instantly update the in-memory user so avatar shows without a reload
        updateUser({
          name: updated.name,
          username: updated.username,
          bio: updated.bio,
          photoUrl: updated.photoUrl,
        });
        setProfilePhotoUrl(updated.photoUrl || '');
        setProfileSuccessMsg('Profile saved successfully! ✓');
        // Auto-close modal after 1.5s
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setProfileAvatarFile(null);
          setProfileAvatarPreview(null);
          setProfileSuccessMsg(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsProfileUpdating(false);
    }
  };

  // Auto-accept invitation OR auto-open active workspace on mount
  useEffect(() => {
    const cachedToken = localStorage.getItem('magadige_invite_token');
    if (cachedToken) {
      localStorage.removeItem('magadige_invite_token'); // clear immediately to prevent loops
      workspaceService.acceptInvitation(cachedToken)
        .then((res) => {
          console.log('✅ Invitation accepted inside dashboard:', res.message);
          if (res.data && res.data.workspaceId) {
            setSelectedWorkspaceId(res.data.workspaceId);
            setActiveTab('WORKSPACE_DASHBOARD');
          }
        })
        .catch((err) => {
          console.error('❌ Failed to accept invitation inside dashboard:', err.message);
          const redirectWsId = localStorage.getItem('magadige_active_workspace_id');
          if (redirectWsId) {
            localStorage.removeItem('magadige_active_workspace_id');
            setSelectedWorkspaceId(redirectWsId);
            setActiveTab('WORKSPACE_DASHBOARD');
          }
        });
    } else {
      const redirectWsId = localStorage.getItem('magadige_active_workspace_id');
      if (redirectWsId) {
        localStorage.removeItem('magadige_active_workspace_id');
        setSelectedWorkspaceId(redirectWsId);
        setActiveTab('WORKSPACE_DASHBOARD');
      }
    }
  }, []);

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

  const getForecastForTaskDate = (dueDate) => {
    if (!dueDate || dueDate === 'NONE' || !weatherForecast || weatherForecast.length === 0) return null;
    
    const today = new Date();
    let targetDateStr = '';
    
    if (dueDate === 'TODAY') {
      targetDateStr = today.toISOString().split('T')[0];
    } else if (dueDate === 'TOMORROW') {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      targetDateStr = tomorrow.toISOString().split('T')[0];
    } else if (dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      targetDateStr = dueDate;
    } else {
      // Custom date string like "5 Jul" or similar - let's parse it
      const currentYear = today.getFullYear();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const parts = dueDate.split(' ');
      if (parts.length >= 2) {
        const dayNum = parseInt(parts[0], 10);
        const monthShort = parts[1].substring(0, 3);
        const monthIdx = months.indexOf(monthShort);
        if (monthIdx !== -1 && !isNaN(dayNum)) {
          const parsedDate = new Date(currentYear, monthIdx, dayNum);
          targetDateStr = parsedDate.toISOString().split('T')[0];
        }
      }
    }
    
    if (!targetDateStr) return weatherForecast[0]; // fallback to today

    const match = weatherForecast.find(d => d.dateStr === targetDateStr);
    return match || weatherForecast[0]; // fallback to today if not found
  };

  const enrichTaskWithWeatherAI = async (task) => {
    const forecast = getForecastForTaskDate(task.dueDate);
    if (!forecast) return task;

    try {
      const aiRes = await aiService.analyzeTaskWeather(task.title, forecast.status, forecast.temp);
      if (aiRes && aiRes.data) {
        return {
          ...task,
          isAffected: aiRes.data.isAffected,
          weatherReason: aiRes.data.reason,
          weatherSuggestion: aiRes.data.suggestion
        };
      }
    } catch (err) {
      console.error('❌ OpenAI weather disruption analysis failed:', err);
    }
    return task;
  };

  // Add a new task
  const handleAddTask = async (newTask) => {
    try {
      const enriched = await enrichTaskWithWeatherAI(newTask);
      const response = await taskService.createTask(enriched);
      if (response && response.data) {
        setTasks((prev) => [response.data, ...prev]);
        return response.data;
      } else {
        setTasks((prev) => [enriched, ...prev]);
        return enriched;
      }
    } catch (err) {
      console.error('❌ Failed to save new task to Firestore:', err.message);
      setTasks((prev) => [newTask, ...prev]);
      throw err;
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
      const enriched = await enrichTaskWithWeatherAI(updatedTask);
      const response = await taskService.updateTask(enriched.id, enriched);
      setTasks((prev) =>
        prev.map((t) => (t.id === enriched.id ? enriched : t))
      );
      return response;
    } catch (err) {
      console.error('❌ Failed to update task details in Firestore:', err.message);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      throw err;
    }
  };

  const handleWorkspaceClick = async () => {
    setShowProfileMenu(false);
    try {
      const res = await workspaceService.getWorkspaces();
      if (res && res.data && res.data.length > 0) {
        setSelectedWorkspaceId(res.data[0].id);
        setActiveTab('WORKSPACE_DASHBOARD');
      } else {
        setSelectedWorkspaceId(null);
        setActiveTab('WORKSPACE');
      }
    } catch (err) {
      console.error('❌ Failed to load workspaces for routing:', err.message);
      setActiveTab('WORKSPACE');
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
        return <ReportingPage tasks={tasks} workspaces={myWorkspaces} />;
      case 'WEATHER_ASSISTANT':
        return <WeatherAssistantPage tasks={tasks} />;
      case 'AI_ASSISTANT':
        return (
          <div 
            className="w-full flex-1 overflow-y-auto px-6 py-10"
            style={{
              background: 'radial-gradient(1200px 500px at 10% -10%, #e7f0fe, transparent), radial-gradient(900px 500px at 100% 0%, #e2edff, transparent), #f3f8ff',
              minHeight: '100%',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end justify-between mb-8 pb-4 border-b border-blue-100/50">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#0f2a5c] flex items-center gap-2 tracking-tight">
                    <Bot size={28} className="text-blue-600 drop-shadow-[0_4px_8px_rgba(37,99,235,0.2)]" /> AI Assistant
                  </h1>
                  <p className="text-xs font-semibold text-[#5b6b8c] mt-1.5">Manage your daily tasks through smart, context-aware conversations</p>
                </div>
              </div>
              <AiAssistantPanel
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                isFullPage={true}
              />
            </div>
          </div>
        );
      case 'WIN_ME':
        return <WinMePage />;
      case 'WORKSPACE':
        return (
          <WorkspacePage 
            onSelectWorkspace={(wsId) => {
              setSelectedWorkspaceId(wsId);
              setActiveTab('WORKSPACE_DASHBOARD');
            }} 
          />
        );
      case 'WORKSPACE_DASHBOARD':
        return (
          <WorkspaceDashboard 
            workspaceId={selectedWorkspaceId} 
            onBackToWorkspaces={() => {
              setSelectedWorkspaceId(null);
              setActiveTab('WORKSPACE');
            }}
          />
        );
      default:
        return <InboxPage tasks={tasks} onAddTask={handleAddTask} onCompleteTask={handleCompleteTask} onUpdateTask={handleUpdateTask} />;
    }
  };

  // Counts for sidebar indicators
  const inboxCount = tasks.filter((t) => !t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = tasks.filter((t) => (t.dueDate === 'TODAY' || t.dueDate === todayStr) && !t.completed).length;

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
                {/* DEBUG: Remove after confirming image is visible */}
                {console.log('🔍 user.photoUrl =', user.photoUrl)}
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt="User Profile" 
                    className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200 flex-shrink-0"
                    onError={(e) => { console.error('❌ Image failed to load:', e.target.src); e.target.style.display='none'; }}
                    onLoad={() => console.log('✅ Image loaded successfully:', user.photoUrl)}
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full ${getColor('primary.gradient')} text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
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
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left cursor-pointer focus:outline-none"
                >
                  <User size={14} className="text-gray-400" />
                  Profile Settings
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer focus:outline-none"
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
              <BarChart3 size={16} className={activeTab === 'REPORTING' ? getColor('primary.text') : 'text-gray-400'} /> Productivity
            </button>

            {/* Workspace */}
            <button 
              onClick={handleWorkspaceClick}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'WORKSPACE' || activeTab === 'WORKSPACE_DASHBOARD'
                  ? `${getColor('primary.text')} ${getColor('primary.bgLight')}` 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <Users size={16} className={activeTab === 'WORKSPACE' || activeTab === 'WORKSPACE_DASHBOARD' ? getColor('primary.text') : 'text-gray-400'} /> Workspace
            </button>

            {/* Weather Assistant */}
            <button 
              onClick={() => { setActiveTab('WEATHER_ASSISTANT'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'WEATHER_ASSISTANT'
                  ? `${getColor('primary.text')} ${getColor('primary.bgLight')}` 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <CloudSun size={16} className={activeTab === 'WEATHER_ASSISTANT' ? getColor('primary.text') : 'text-gray-400'} /> Weather Assistant
            </button>

            {/* AI Assistant */}
            <button 
              onClick={() => { setActiveTab('AI_ASSISTANT'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'AI_ASSISTANT'
                  ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <Bot size={16} className={activeTab === 'AI_ASSISTANT' ? 'text-blue-600' : 'text-gray-400'} />
              <span className="flex-1 text-left">AI Assistant</span>
              {activeTab !== 'AI_ASSISTANT' && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase tracking-wider">New</span>
              )}
            </button>

            {/* Win me */}
            <button 
              onClick={() => { setActiveTab('WIN_ME'); setShowProfileMenu(false); }}
              onMouseEnter={playBubbleSound}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer focus:outline-none ${
                activeTab === 'WIN_ME' 
                  ? 'text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50/60 border border-amber-250' 
                  : 'text-gray-600 hover:bg-gray-200/40'
              }`}
            >
              <span className="flex items-center gap-3">
                <Trophy size={16} className={activeTab === 'WIN_ME' ? 'text-amber-500' : 'text-gray-400'} /> Win Me
              </span>
              {activeTab !== 'WIN_ME' && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-750 uppercase tracking-wider">Play</span>
              )}
            </button>
          </nav>
          {/* Removed projects section */}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 space-y-1 text-gray-500">
          <button 
            onClick={() => setIsHelpOpen(true)}
            onMouseEnter={playBubbleSound}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-bold hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
          >
            <BookOpen size={16} /> Help & Guide
          </button>
        </div>
      </aside>

      {/* ── HELP & GUIDE FULL-SCREEN OVERLAY ── */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Help & Guide</h2>
                  <p className="text-[10px] text-slate-400 font-bold">Learn what you can do on every page</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer focus:outline-none"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Guide Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* 1 ─ Today */}
              <div className="rounded-2xl border border-slate-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Calendar size={16} className="text-blue-600" /></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">1. Today</h3>
                </div>
                <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 pl-10">
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> View all tasks due today in a clean, focused list</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Mark tasks as complete with a single click</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Add new tasks directly with the "+" button</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Set priority levels (P1–P4) and due times</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Add comments and notes to any task</li>
                </ul>
              </div>

              {/* 2 ─ Upcoming */}
              <div className="rounded-2xl border border-slate-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Calendar size={16} className="text-indigo-600" /></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">2. Upcoming</h3>
                </div>
                <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 pl-10">
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-indigo-400 flex-shrink-0" /> See all scheduled tasks for the next 7 days</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-indigo-400 flex-shrink-0" /> Tasks are grouped by day for easy planning</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-indigo-400 flex-shrink-0" /> Drag tasks between days to reschedule</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-indigo-400 flex-shrink-0" /> Plan ahead and balance your workload</li>
                </ul>
              </div>

              {/* 3 ─ Productivity */}
              <div className="rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><BarChart3 size={16} className="text-emerald-600" /></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">3. Productivity Dashboard</h3>
                </div>
                <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 pl-10">
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-emerald-400 flex-shrink-0" /> Track today's completed tasks vs total</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-emerald-400 flex-shrink-0" /> View weekly progress with bar charts</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-emerald-400 flex-shrink-0" /> See achievement rings for completion rates</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-emerald-400 flex-shrink-0" /> Priority breakdown shows P1–P4 task status</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-emerald-400 flex-shrink-0" /> Monitor workspace progress and team member avatars</li>
                </ul>
              </div>

              {/* 4 ─ Workspace */}
              <div className="rounded-2xl border border-slate-100 p-4 hover:border-violet-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><Users size={16} className="text-violet-600" /></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">4. Workspace</h3>
                </div>
                <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 pl-10">
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-violet-400 flex-shrink-0" /> Create new workspaces for team projects</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-violet-400 flex-shrink-0" /> Invite members via email to collaborate</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-violet-400 flex-shrink-0" /> Assign tasks to team members</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-violet-400 flex-shrink-0" /> Track task progress per workspace</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-violet-400 flex-shrink-0" /> Create projects inside workspaces to organize work</li>
                </ul>
              </div>

              {/* 5 ─ Weather Assistant */}
              <div className="rounded-2xl border border-slate-100 p-4 hover:border-sky-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center"><CloudSun size={16} className="text-sky-600" /></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">5. Weather Assistant</h3>
                </div>
                <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 pl-10">
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-sky-400 flex-shrink-0" /> See live weather forecast for any city</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-sky-400 flex-shrink-0" /> View hourly temperature and wind projections</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-sky-400 flex-shrink-0" /> AI scans your tasks for weather conflicts</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-sky-400 flex-shrink-0" /> Get smart suggestions to reschedule outdoor tasks</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-sky-400 flex-shrink-0" /> 7-day forecast cards with animated weather icons</li>
                </ul>
              </div>

              {/* 6 ─ AI Assistant */}
              <div className="rounded-2xl border border-slate-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Bot size={16} className="text-blue-600" /></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">6. AI Assistant</h3>
                </div>
                <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 pl-10">
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Automatically draft professional meeting reschedule emails</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Fill in attendee details, reason, and new time</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> AI generates a polished email body for you</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Send emails directly from the app</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-blue-400 flex-shrink-0" /> Use AI to break down complex tasks into subtasks</li>
                </ul>
              </div>

              {/* 7 ─ Win Me */}
              <div className="rounded-2xl border border-slate-100 p-4 hover:border-amber-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Trophy size={16} className="text-amber-600" /></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">7. Win Me — Goal Mapper</h3>
                </div>
                <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 pl-10">
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-amber-400 flex-shrink-0" /> Create a visual roadmap of your goals and milestones</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-amber-400 flex-shrink-0" /> Click "+" ports on any node to branch out in 4 directions</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-amber-400 flex-shrink-0" /> Set nodes as normal milestones or golden goal targets</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-amber-400 flex-shrink-0" /> Double-click any node to edit its title, description, and files</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-amber-400 flex-shrink-0" /> Zoom, pan, and recenter the canvas with toolbar controls</li>
                  <li className="flex items-start gap-1.5"><ChevronRight size={10} className="mt-0.5 text-amber-400 flex-shrink-0" /> Your flowchart auto-saves to the database</li>
                </ul>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold">Magadige ToDo — Your Productivity Companion 🚀</p>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer focus:outline-none shadow-sm active:scale-95"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* 4. PROFILE SETTINGS MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left Sidebar: Profile Details & Workspace Listing */}
            <div className="md:w-1/2 bg-gray-50 border-r border-gray-150 p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">
                    👥 Workspaces ({myWorkspaces.length})
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-normal">
                    List of all Spaces you are currently working in.
                  </p>
                  
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {myWorkspaces.length > 0 ? (
                      myWorkspaces.map((ws) => (
                        <div 
                          key={ws.id} 
                          className="flex items-center justify-between p-3 bg-white border border-gray-100 shadow-xs rounded-xl"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg">📁</span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-800 truncate">{ws.name}</h4>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                {ws.ownerId === user.id ? 'Owner' : 'Member'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No spaces joined yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 mt-6 text-[10px] text-gray-455 font-bold tracking-wide uppercase">
                Magadige ToDo • Profile Control Panel
              </div>
            </div>

            {/* Right Form: Editing Details */}
            <form onSubmit={handleUpdateProfileSubmit} className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-2">
                  <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    ⚙️ Profile Settings
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setProfileAvatarFile(null);
                      setProfileAvatarPreview(null);
                      setProfileSuccessMsg(null);
                      setProfileErrorMsg(null);
                    }}
                    className="text-gray-400 hover:text-gray-650 cursor-pointer focus:outline-none"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Avatar upload */}
                <div className="flex flex-col items-center justify-center space-y-2 select-none">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-255 overflow-hidden flex items-center justify-center shadow-inner relative">
                      {profileAvatarPreview ? (
                        <img src={profileAvatarPreview} alt="New Preview" className="w-full h-full object-cover" />
                      ) : profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="Current Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                          {profileName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-750 text-white flex items-center justify-center shadow-md cursor-pointer border border-white">
                      <Camera size={12} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfileAvatarFile(file);
                            setProfileAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Change Profile Photo</span>
                </div>

                {/* Inputs */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-xs text-gray-600 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                    placeholder="eranga_2026"
                    className="w-full text-xs text-gray-600 border border-gray-205 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Bio</label>
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full text-xs text-gray-600 border border-gray-205 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold"
                  />
                </div>

                {/* Feedback notifications */}
                {profileSuccessMsg && (
                  <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl text-center">
                    {profileSuccessMsg}
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
                    {profileErrorMsg}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setProfileAvatarFile(null);
                    setProfileAvatarPreview(null);
                    setProfileSuccessMsg(null);
                    setProfileErrorMsg(null);
                  }}
                  disabled={isProfileUpdating}
                  className="!w-auto !py-2 !px-4 !text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProfileUpdating}
                  loading={isProfileUpdating || isProfileUploading}
                  className="!w-auto !py-2 !px-4 !text-xs !bg-blue-650 hover:!bg-blue-750"
                >
                  {isProfileUploading ? 'Uploading...' : isProfileUpdating ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
