import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { playTickSound, playChimeSound } from '../../utils/audio';
import { getColor } from '../../utils/color';
import { weatherService } from '../../services/api';
import { analyzeTaskWeather } from '../../utils/weatherService';

export const UpcomingPage = ({ tasks = [], onAddTask, onCompleteTask, onUpdateTask }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeInputDayNum, setActiveInputDayNum] = useState(null);
  const [inlineInputText, setInlineInputText] = useState('');
  const [weatherForecast, setWeatherForecast] = useState([]);

  // Editing state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('P4');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editMeetingMembers, setEditMeetingMembers] = useState([]);
  const [editMeetingMemberInput, setEditMeetingMemberInput] = useState('');
  const [isMeeting, setIsMeeting] = useState(false);

  const startEditing = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'P4');
    setEditStartTime(task.startTime || '');
    setEditEndTime(task.endTime || '');
    setEditDueDate(task.dueDate || '');
    setEditMeetingMembers(task.meeting?.members || []);
    setEditMeetingMemberInput('');
    setIsMeeting(!!task.meeting);
  };

  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!editingTask) return;

    const updatedTask = {
      ...editingTask,
      title: editTitle.trim() || editingTask.title,
      description: editDescription.trim(),
      priority: editPriority,
      dueDate: editDueDate,
      startTime: editStartTime || null,
      endTime: editEndTime || null,
      meeting: isMeeting || editMeetingMembers.length > 0 ? {
        title: editTitle.trim() || editingTask.title,
        description: editDescription.trim(),
        members: editMeetingMembers
      } : null
    };

    if (onUpdateTask) onUpdateTask(updatedTask);
    setEditingTask(null);
  };


  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await weatherService.getWeatherForecast('Colombo');
        if (res && res.data && res.data.weekly) {
          setWeatherForecast(res.data.weekly);
        }
      } catch (err) {
        console.error('❌ Failed to fetch weather for upcoming page calendar:', err);
      }
    };
    fetchWeather();
  }, []);

  const getForecastForDate = (dayNum) => {
    if (!weatherForecast || weatherForecast.length === 0) return null;
    const cardDate = new Date(year, month, dayNum);
    const targetDateStr = cardDate.toISOString().split(' ')[0];
    
    // Find matching date
    const exactMatch = weatherForecast.find(d => d.dateStr === targetDateStr);
    if (exactMatch) return exactMatch;

    // Fallback to day diff
    const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const cardNoTime = new Date(cardDate.getFullYear(), cardDate.getMonth(), cardDate.getDate());
    const diffTime = cardNoTime.getTime() - todayNoTime.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < weatherForecast.length) {
      return weatherForecast[diffDays];
    }
    return null;
  };

  // Months and Weekdays lists matching the mockup
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper: Get weekday short name for a specific day number
  const weekdayFor = (dayNum) => {
    const dt = new Date(year, month, dayNum);
    return WEEKDAYS[dt.getDay()];
  };

  // Helper: Format Date object to "D MMM" label string (e.g. "5 Jul")
  const formatDateToLabel = (date) => {
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${shortMonths[date.getMonth()]}`;
  };

  // Dynamic Month Days Length
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Priority styling for colored bars (linked dynamically to color.jsx tokens)
  const priorityMeta = {
    P1: {
      bg: getColor('taskColors.pink.bg'),
      text: getColor('taskColors.pink.text'),
      checkboxBorder: getColor('taskColors.pink.checkboxBorder'),
    },
    P2: {
      bg: getColor('taskColors.yellow.bg'),
      text: getColor('taskColors.yellow.text'),
      checkboxBorder: getColor('taskColors.yellow.checkboxBorder'),
    },
    P3: {
      bg: getColor('taskColors.green.bg'),
      text: getColor('taskColors.green.text'),
      checkboxBorder: getColor('taskColors.green.checkboxBorder'),
    },
    P4: {
      bg: getColor('taskColors.blue.bg'),
      text: getColor('taskColors.blue.text'),
      checkboxBorder: getColor('taskColors.blue.checkboxBorder'),
    }
  };

  // Extract tasks belonging to a specific day number of the current month
  const getTasksForDayNumber = (dayNum) => {
    const cardDate = new Date(year, month, dayNum);
    const todayDateNum = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    return tasks.filter((task) => {
      // Real-time search query filter
      if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Check standard ISO date YYYY-MM-DD
      if (task.dueDate && task.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [tYear, tMonth, tDay] = task.dueDate.split('-').map(Number);
        return cardDate.getDate() === tDay &&
               cardDate.getMonth() === (tMonth - 1) &&
               cardDate.getFullYear() === tYear;
      }

      // Check TODAY
      if (task.dueDate === 'TODAY') {
        return cardDate.getDate() === todayDateNum && 
               cardDate.getMonth() === todayMonth && 
               cardDate.getFullYear() === todayYear;
      }

      // Check TOMORROW
      if (task.dueDate === 'TOMORROW') {
        return cardDate.getDate() === tomorrow.getDate() && 
               cardDate.getMonth() === tomorrow.getMonth() && 
               cardDate.getFullYear() === tomorrow.getFullYear();
      }

      // Match custom date string label (e.g., "5 Jul")
      const cardDateLabel = formatDateToLabel(cardDate);
      const cleanDueDate = task.dueDate.split(' @')[0];
      return cleanDueDate === cardDateLabel;
    });
  };

  // Toggle complete / uncomplete
  const handleToggleComplete = (task) => {
    if (!task.completed) {
      playTickSound();
      setTimeout(() => {
        playChimeSound();
      }, 100);
    }
    const updatedTask = {
      ...task,
      completed: !task.completed
    };
    if (onUpdateTask) onUpdateTask(updatedTask);
  };

  // Delete a task (sets status to completed and removes due date so it slides off)
  const handleDeleteTask = (task) => {
    const updatedTask = {
      ...task,
      completed: true,
      dueDate: 'NONE'
    };
    if (onUpdateTask) onUpdateTask(updatedTask);
  };

  // Inline inputs logic
  const handleAddClick = (dayNum) => {
    if (activeInputDayNum === dayNum) {
      setActiveInputDayNum(null);
      setInlineInputText('');
    } else {
      setActiveInputDayNum(dayNum);
      setInlineInputText('');
    }
  };

  const handleInlineInputKeyDown = (e, dayNum) => {
    if (e.key === 'Enter' && inlineInputText.trim()) {
      const cardDate = new Date(year, month, dayNum);
      onAddTask({
        id: `task_${Date.now()}`,
        title: inlineInputText.trim(),
        description: '',
        priority: 'P4',
        dueDate: formatDateToLabel(cardDate),
        completed: false,
        section: 'INBOX',
        createdAt: new Date().toISOString()
      });
      setActiveInputDayNum(null);
      setInlineInputText('');
    } else if (e.key === 'Escape') {
      setActiveInputDayNum(null);
      setInlineInputText('');
    }
  };

  const handleInlineInputBlur = () => {
    // Delay slightly to allow button click events if any
    setTimeout(() => {
      setActiveInputDayNum(null);
      setInlineInputText('');
    }, 150);
  };

  // Calculate stats
  let totalTasksCount = 0;
  let completedTasksCount = 0;
  for (let d = 1; d <= totalDays; d++) {
    const dayTasks = getTasksForDayNumber(d);
    totalTasksCount += dayTasks.length;
    completedTasksCount += dayTasks.filter(t => t.completed).length;
  }

  return (
    <div 
      style={{
        background: 'radial-gradient(1200px 500px at 10% -10%, #e7f0fe, transparent), radial-gradient(900px 500px at 100% 0%, #e2edff, transparent), #f3f8ff',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif"
      }}
      className="w-full text-[#132242] select-none px-4 sm:px-6 pt-10 sm:pt-12 pb-20"
    >
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="font-mono text-xs font-bold tracking-widest text-[#2563eb] uppercase mb-2">
            30-day sprint
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {MONTHS[month]} {year}
          </h1>
          <p className="text-sm text-[#5b6b8c] font-medium">
            Tap + on any day to add a task. Check items off as you go.
          </p>
        </div>

        {/* Right side stats & search */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Realtime Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search sprint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 px-4 py-2 text-xs border border-[#dbe6fb] rounded-full focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white placeholder:text-[#5b6b8c] outline-none shadow-sm transition-all"
            />
          </div>

          <div className="flex gap-3">
            <div className="bg-white border border-[#dbe6fb] rounded-full px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
              <span>{totalTasksCount} tasks</span>
            </div>
            <div className="bg-white border border-[#dbe6fb] rounded-full px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span>{completedTasksCount} done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing Day Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
          const dayTasks = getTasksForDayNumber(dayNum);
          const isTdy = dayNum === today.getDate();
          const dayForecast = getForecastForDate(dayNum);
          
          const total = dayTasks.length;
          const done = dayTasks.filter(t => t.completed).length;
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <div 
              key={dayNum} 
              className={`focus-calendar-card card ${isTdy ? 'today' : ''} relative bg-white border-2 border-[#dbe6fb] rounded-[20px] p-4.5 min-h-[180px] sm:min-h-[210px] flex flex-col overflow-hidden`}
            >
              {/* Large Watermark day number */}
              <div className="absolute top-[-18px] right-[-6px] font-bold text-[88px] text-[#2563eb] opacity-7 select-none pointer-events-none leading-none">
                {String(dayNum).padStart(2, '0')}
              </div>

              {/* Head Block */}
              <div className="flex justify-between items-start mb-2.5 z-10 select-none">
                <div className="flex flex-col">
                  <span className="font-mono text-[10.5px] font-bold tracking-widest text-[#5b6b8c] uppercase">
                    {weekdayFor(dayNum)}
                  </span>
                  <span className="text-2xl font-bold text-[#0f2a5c] leading-tight">
                    {dayNum}
                  </span>
                  {isTdy && (
                    <span className="text-[9.5px] font-bold tracking-wider uppercase bg-[#2563eb] text-white px-2 py-0.5 rounded-full mt-1 w-fit">
                      Today
                    </span>
                  )}
                  {dayForecast && (
                    <span 
                      title={`${dayForecast.desc} - Wind: ${dayForecast.wind} m/s`}
                      className="text-[9px] font-extrabold text-blue-700 bg-blue-50/70 border border-blue-100/60 rounded-lg px-1.5 py-0.5 mt-1.5 w-fit flex items-center gap-1 select-none"
                    >
                      {dayForecast.status === 'SUNNY' ? '☀️' :
                       dayForecast.status === 'RAINY' ? '🌧️' :
                       dayForecast.status === 'WINDY' ? '💨' :
                       dayForecast.status === 'CLOUDY' ? '☁️' : '⛈️'}
                      {dayForecast.temp}°C
                    </span>
                  )}
                </div>
                
                {/* Add button */}
                <button
                  type="button"
                  onClick={() => handleAddClick(dayNum)}
                  title="Add task"
                  className="w-7 h-7 rounded-[9px] border border-[#c9dbfb] bg-[#e7f0fe] text-[#1d4ed8] font-bold text-base flex items-center justify-center cursor-pointer hover:bg-[#c9dbfb] active:scale-95 transition-all focus:outline-none"
                >
                  +
                </button>
              </div>

              {/* Todo List Area */}
              <ul className="list-none m-0 p-0 flex flex-col gap-1.5 flex-1 z-10 overflow-y-auto max-h-[110px] pr-0.5 custom-scrollbar">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => {
                    const localAnalysis = dayForecast ? analyzeTaskWeather(task.title, dayForecast.status, dayForecast.temp) : { isAffected: false, reason: '', suggestion: '' };
                    const isTaskAffected = !task.completed && (task.isAffected || localAnalysis.isAffected);
                    const weatherAnalysis = isTaskAffected ? {
                      reason: task.weatherReason || localAnalysis.reason || 'Weather Warning',
                      suggestion: task.weatherSuggestion || localAnalysis.suggestion || 'Move indoor or reschedule.'
                    } : null;

                    return (
                      <li 
                        key={task.id} 
                        title={isTaskAffected ? `⚠️ ${task.title} is affected by ${weatherAnalysis.reason}. AI Suggestion: ${weatherAnalysis.suggestion}` : ''}
                        className={`todo-item flex items-start gap-2 text-[12.5px] py-1.5 px-2.5 rounded-lg border transition-all hover:scale-[1.01] hover:shadow-xs group cursor-pointer ${
                          task.completed ? 'opacity-55 line-through' : ''
                        } ${
                          isTaskAffected 
                            ? 'weather-affected-task-card' 
                            : task.rescheduled
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-orange-600 text-white shadow-md shadow-orange-100/20'
                              : (priorityMeta[task.priority]?.bg || priorityMeta.P4.bg)
                        }`}
                      >
                        {/* Checkbox */}
                        <div 
                          onClick={() => handleToggleComplete(task)}
                          className={`checkbox w-4 h-4 min-w-[16px] rounded-[5px] border-2 flex items-center justify-center cursor-pointer mt-0.5 transition-all ${
                            task.completed 
                              ? 'bg-white border-white' 
                              : task.rescheduled
                                ? 'bg-transparent border-white/80'
                                : `bg-transparent ${priorityMeta[task.priority]?.checkboxBorder || 'border-white/80'}`
                          }`}
                        >
                          {task.completed && (
                            <div className={`w-1 h-2 border-r-2 border-b-2 transform rotate-45 -translate-y-[1.5px] ${
                              isTaskAffected ? 'border-red-600' :
                              task.rescheduled ? 'border-orange-600' :
                              task.priority === 'P1' ? 'border-pink-500' :
                              task.priority === 'P2' ? 'border-amber-500' :
                              task.priority === 'P3' ? 'border-emerald-600' : 'border-blue-600'
                            }`} />
                          )}
                        </div>

                        {/* Title text */}
                        <span className={`todo-text flex-1 leading-snug word-break-all font-semibold ${
                          task.completed ? 'line-through text-white/70' :
                          isTaskAffected ? 'text-red-750 font-bold' :
                          task.rescheduled ? 'text-white font-bold' :
                          (priorityMeta[task.priority]?.text || priorityMeta.P4.text)
                        }`}>
                          {task.title}
                          {isTaskAffected && (
                            <span className="text-[10px] block font-black text-red-650 mt-0.5 uppercase tracking-wider select-none animate-pulse">
                              ⚠️ weather warning
                            </span>
                          )}
                          {!isTaskAffected && task.rescheduled && (
                            <span className="text-[9px] block font-black text-orange-100 mt-0.5 uppercase tracking-wider select-none">
                              🔄 Rescheduled
                            </span>
                          )}
                        </span>

                        {/* Action buttons (Edit & Delete) */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto flex-shrink-0">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                            className="text-[#b5c3de] hover:text-[#2563eb] transition-all cursor-pointer bg-none border-none text-[11px] leading-none focus:outline-none"
                            title="Edit task details"
                          >
                            ✏️
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                            className="text-[#b5c3de] hover:text-[#e0577a] transition-all cursor-pointer bg-none border-none text-[11px] leading-none focus:outline-none"
                            title="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  activeInputDayNum !== dayNum ? (
                    <li className="text-[12.5px] text-[#5b6b8c] opacity-60 italic p-1.5 select-none">
                      No tasks yet
                    </li>
                  ) : null
                )}
              </ul>

              {/* Inline Input when active */}
              {activeInputDayNum === dayNum && (
                <input
                  type="text"
                  placeholder="Type a task, press Enter…"
                  value={inlineInputText}
                  onChange={(e) => setInlineInputText(e.target.value)}
                  onKeyDown={(e) => handleInlineInputKeyDown(e, dayNum)}
                  onBlur={handleInlineInputBlur}
                  className="w-full border border-dashed border-[#7fa8f2] bg-[#f3f8ff] rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#132242] font-semibold outline-none mt-2 focus:ring-1 focus:ring-[#2563eb] z-10"
                  autoFocus
                />
              )}

              {/* Card Footer Progress Bar */}
              <div className="mt-auto pt-2.5 z-10 select-none">
                <div className="h-1.5 rounded-full bg-[#e7f0fe] overflow-hidden mb-1.5">
                  <div 
                    style={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-[#7fa8f2] to-[#2563eb] rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-[11px] text-[#5b6b8c] font-bold font-mono">
                  {done}/{total}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── EDIT TASK MODAL OVERLAY ── */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <form 
            onSubmit={handleSaveEdit}
            className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-up flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Pencil size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Edit Sprint Task</h2>
                  <p className="text-[10px] text-slate-400 font-bold">Modify schedule details and properties</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer focus:outline-none"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Fields Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs font-bold text-gray-900 border border-gray-250/65 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xxs text-gray-600 border border-gray-250/65 rounded-xl px-3 py-2 h-20 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                  placeholder="Task details..."
                />
              </div>

              {/* Time Slots */}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-150">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Start Time</span>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 border border-gray-200 bg-white rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase">End Time</span>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 border border-gray-200 bg-white rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Priority and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-250/65 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none"
                  >
                    <option value="P1" className="text-red-500 font-bold">🚩 Priority 1</option>
                    <option value="P2" className="text-orange-500 font-bold">🚩 Priority 2</option>
                    <option value="P3" className="text-blue-500 font-bold">🚩 Priority 3</option>
                    <option value="P4" className="text-gray-400 font-bold">🚩 Priority 4</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Due Date</label>
                  <input 
                    type="text" 
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    placeholder="e.g. TODAY, 5 Jul, 2026-07-09"
                    className="w-full text-xs font-bold text-gray-900 border border-gray-250/65 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Meeting Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-xs font-black text-slate-700">Set as Meeting</span>
                <button
                  type="button"
                  onClick={() => setIsMeeting(!isMeeting)}
                  className={`w-10 h-6 rounded-full transition-all flex items-center p-1 focus:outline-none ${
                    isMeeting ? 'bg-blue-600 justify-end' : 'bg-gray-200 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Meeting Details Input */}
              {isMeeting && (
                <div className="bg-blue-50/50 border border-blue-150 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">👥 Meeting Invitees</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter invitee email..."
                      value={editMeetingMemberInput}
                      onChange={(e) => setEditMeetingMemberInput(e.target.value)}
                      className="flex-1 text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const email = editMeetingMemberInput.trim();
                        if (email && !editMeetingMembers.includes(email)) {
                          setEditMeetingMembers(prev => [...prev, email]);
                        }
                        setEditMeetingMemberInput('');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  {editMeetingMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {editMeetingMembers.map((m, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-850 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xxs">
                          {m}
                          <button
                            type="button"
                            onClick={() => setEditMeetingMembers(prev => prev.filter(e => e !== m))}
                            className="text-blue-500 hover:text-blue-800 font-extrabold text-[12px] leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 hover:bg-gray-100 text-gray-505 text-xs font-black rounded-xl transition-all cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer focus:outline-none shadow-md active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
