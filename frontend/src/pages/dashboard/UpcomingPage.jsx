import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Pencil, 
  MessageSquare, 
  Search, 
  X,
  Flag,
  Clock
} from 'lucide-react';
import { getColor } from '../../utils/color';
import { Button } from '../../components/Button';
import { playTickSound, playChimeSound } from '../../utils/audio';
import { MiniCalendarPicker } from '../../components/MiniCalendarPicker';

export const UpcomingPage = ({ tasks = [], onAddTask, onCompleteTask, onUpdateTask }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Composer state
  const [isAdding, setIsAdding] = useState(false);
  const [composerDate, setComposerDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('P4');

  const [completingTasks, setCompletingTasks] = useState({});

  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Date picker state
  const [activeDatePickerTaskId, setActiveDatePickerTaskId] = useState(null);

  // Comment state
  const [activeCommentTaskId, setActiveCommentTaskId] = useState(null);
  const [newCommentTexts, setNewCommentTexts] = useState({});

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleSaveEdit = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      title: editTitle.trim() || task.title,
      description: editDescription.trim(),
    };
    if (onUpdateTask) onUpdateTask(updatedTask);
    setEditingTaskId(null);
  };

  const handleChangeTaskDate = (taskId, newDate) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      dueDate: newDate,
    };
    if (onUpdateTask) onUpdateTask(updatedTask);
  };

  const handleSaveComment = (taskId) => {
    const text = newCommentTexts[taskId] || '';
    if (!text.trim()) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      comments: [
        ...(task.comments || []),
        {
          id: `c_${Date.now()}`,
          text: text.trim(),
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    if (onUpdateTask) onUpdateTask(updatedTask);
    setNewCommentTexts((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleComplete = (taskId) => {
    playTickSound();
    setTimeout(() => {
      playChimeSound();
    }, 100);
    setCompletingTasks((prev) => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      onCompleteTask(taskId);
      setCompletingTasks((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }, 450);
  };

  // Quick navigate commands
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentMonth(new Date());
  };

  // Month navigation arrays
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const priorityMeta = {
    P1: { border: 'border-red-200', color: 'text-red-600', bg: 'bg-red-50/50', dot: 'bg-red-500' },
    P2: { border: 'border-orange-200', color: 'text-orange-600', bg: 'bg-orange-50/50', dot: 'bg-orange-500' },
    P3: { border: 'border-blue-200', color: 'text-blue-600', bg: 'bg-blue-50/50', dot: 'bg-blue-500' },
    P4: { border: 'border-gray-200', color: 'text-gray-600', bg: 'bg-gray-50/50', dot: 'bg-gray-400' },
  };

  // Calendar Math: Sun to Sat grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay(); 

  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDate = new Date(year, month, 0);
  const totalDaysPrev = prevMonthDate.getDate();

  const cells = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, totalDaysPrev - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    cells.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month padding to complete 42 grids (6 weeks)
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  // Day label formatter
  const getDayLabel = (cell) => {
    const d = cell.date.getDate();
    if (d === 1) {
      return `${months[cell.date.getMonth()]} 1`;
    }
    return d.toString();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Format Date object to "D MMM" label string
  const formatDateToLabel = (date) => {
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Extract tasks for a specific calendar cell
  const getTasksForDate = (date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    return tasks.filter((task) => {
      if (task.completed) return false;

      // Realtime search filtering
      if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Check Today
      if (task.dueDate === 'TODAY') {
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
      }

      // Check Tomorrow
      if (task.dueDate === 'TOMORROW') {
        return date.getDate() === tomorrow.getDate() && 
               date.getMonth() === tomorrow.getMonth() && 
               date.getFullYear() === tomorrow.getFullYear();
      }

      // Match custom date string label
      const cardDateLabel = formatDateToLabel(date);
      const cleanDueDate = task.dueDate.split(' @')[0];
      return cleanDueDate === cardDateLabel;
    });
  };

  // Open task composer prepopulating the cell date
  const handleOpenComposerForCell = (date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      setComposerDate('TODAY');
    } else if (date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear()) {
      setComposerDate('TOMORROW');
    } else {
      setComposerDate(formatDateToLabel(date));
    }
    setIsAdding(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: composerDate,
      completed: false,
      section: 'INBOX',
      createdAt: new Date().toISOString()
    });

    // Reset Form
    setIsAdding(false);
    setTitle('');
    setDescription('');
    setPriority('P4');
    setComposerDate('');
  };

  return (
    <div className="w-full min-h-full bg-slate-50/70 py-8 px-6 space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        
        {/* Left Side: Navigation group & Date display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 border-r border-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer focus:outline-none transition-colors rounded-l-xl"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleGoToday}
              className="px-3.5 py-1.5 hover:bg-slate-50 text-xs font-extrabold text-slate-700 cursor-pointer focus:outline-none transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 border-l border-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer focus:outline-none transition-colors rounded-r-xl"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
            {months[month]} {year}
          </h2>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center bg-slate-100/80 rounded-xl p-1 shadow-inner self-start md:self-auto border border-slate-200/30">
          <button className="px-3.5 py-1 text-xxs font-extrabold text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer rounded-lg transition-all">Day</button>
          <button className="px-3.5 py-1 text-xxs font-extrabold text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer rounded-lg transition-all">Week</button>
          <button className="px-3.5 py-1 text-xxs font-extrabold bg-blue-600 text-white rounded-lg focus:outline-none cursor-pointer shadow-sm transition-all">Month</button>
          <button className="px-3.5 py-1 text-xxs font-extrabold text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer rounded-lg transition-all">Year</button>
        </div>

        {/* Right Side: Search & Stats */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-455" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 pl-9 pr-4 py-1.5 border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white placeholder:text-slate-400 outline-none shadow-sm transition-all focus:shadow-md"
            />
          </div>
        </div>

      </div>

      {/* 2. Calendar Month Grid Container */}
      <div className="bg-slate-100/40 p-3 rounded-[24px] border border-slate-200/50 shadow-inner">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 md:gap-2.5 px-1 mb-2.5 text-center">
          {weekDays.map((wd) => (
            <div key={wd} className="py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {wd}
            </div>
          ))}
        </div>

        {/* Day Cells Floating Tiles Grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-2.5 p-0.5">
          {cells.map((cell, idx) => {
            const cellTasks = getTasksForDate(cell.date);
            const isTdy = isToday(cell.date);
            const dayOfWeek = cell.date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sun, 6 = Sat

            // Determine modern card style classes
            let cardClasses = "min-h-[110px] p-2.5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer relative group rounded-[18px] border ";
            
            if (isTdy) {
              cardClasses += "bg-white border-blue-500 shadow-md shadow-blue-100/50 ring-4 ring-blue-500/10 z-10";
            } else if (!cell.isCurrentMonth) {
              cardClasses += "bg-slate-50/40 border-slate-105/10 opacity-35";
            } else if (isWeekend) {
              cardClasses += "bg-slate-50/65 border-slate-200/40 hover:border-slate-300 hover:shadow-sm";
            } else {
              cardClasses += "bg-white border-slate-100/70 hover:border-slate-350 hover:shadow-sm shadow-sm shadow-slate-100/30";
            }

            return (
              <div
                key={idx}
                className={cardClasses}
              >
                {/* Cell Header: Day Number and Add Task Button */}
                <div className="flex items-center justify-between w-full mb-1 select-none">
                  {/* Plus icon visible on cell hover */}
                  <button
                    onClick={() => handleOpenComposerForCell(cell.date)}
                    title="Add task for this day"
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded transition-all cursor-pointer focus:outline-none"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                  </button>

                  <span className={`text-[10px] font-bold ${
                    isTdy 
                      ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm'
                      : cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {getDayLabel(cell)}
                  </span>
                </div>

                {/* Tasks List inside cell */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[70px] pr-0.5 custom-scrollbar">
                  {cellTasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`flex items-start gap-1 p-1 rounded-lg border-l-2 text-[9px] font-bold leading-normal transition-all cursor-pointer hover:bg-white/80 ${
                        completingTasks[task.id] ? 'opacity-40' : ''
                      } ${priorityMeta[task.priority].bg} ${priorityMeta[task.priority].border}`}
                    >
                      {/* Check trigger dot */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(task.id);
                        }}
                        className={`w-2.5 h-2.5 rounded-full mt-0.5 border flex-shrink-0 cursor-pointer ${
                          completingTasks[task.id] ? 'bg-green-500 border-green-500' : `${priorityMeta[task.priority].dot} border-transparent`
                        }`}
                      />
                      <span 
                        onClick={() => startEditing(task)}
                        className={`truncate flex-1 ${completingTasks[task.id] ? 'line-through text-gray-400' : priorityMeta[task.priority].color}`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Inline Task Details Editor (Modal popup when clicking task in calendar cell) */}
      {editingTaskId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl p-5 shadow-2xl space-y-4 animate-scale-up text-left">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-500" />
                Quick Edit Task
              </h3>
              <button 
                onClick={() => setEditingTaskId(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs font-bold text-gray-800 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xxs text-gray-600 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 h-16 resize-none bg-white"
                  placeholder="Task details..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-2">
              <button 
                type="button" 
                onClick={() => setEditingTaskId(null)}
                className="px-3.5 py-1.5 text-xxs font-bold text-gray-500 hover:bg-gray-150 rounded-lg cursor-pointer transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => handleSaveEdit(editingTaskId)}
                className="px-3.5 py-1.5 text-xxs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors focus:outline-none"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Task Composer Modal (Prepopulated Date) */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleSubmit} 
            className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl p-5 shadow-2xl space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                <Calendar size={15} className="text-blue-600" />
                Add Task for {composerDate === 'TODAY' ? 'Today' : composerDate === 'TOMORROW' ? 'Tomorrow' : composerDate}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Task name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-bold text-gray-900 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white placeholder:text-gray-400"
              required
              autoFocus
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xxs text-gray-650 border border-gray-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white placeholder:text-gray-400 resize-none h-16"
            />

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div>
                <label className="block text-[9px] font-extrabold text-gray-400 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`appearance-none text-xxs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 cursor-pointer font-bold focus:outline-none ${priorityMeta[priority].color}`}
                >
                  <option value="P1" className="text-red-500">🚩 Priority 1</option>
                  <option value="P2" className="text-orange-500">🚩 Priority 2</option>
                  <option value="P3" className="text-blue-500">🚩 Priority 3</option>
                  <option value="P4" className="text-gray-400">🚩 Priority 4</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-1.5 text-xxs font-bold text-gray-500 hover:bg-gray-150 rounded-lg cursor-pointer transition-colors focus:outline-none border border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-3.5 py-1.5 text-xxs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors focus:outline-none"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
