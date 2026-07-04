import React, { useState } from 'react';
import { Calendar, Plus, ChevronRight, Check } from 'lucide-react';
import { getColor } from '../../utils/color';
import { Button } from '../../components/Button';

export const UpcomingPage = ({ tasks = [], onAddTask, onCompleteTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSection, setSelectedSection] = useState('TODAY');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('P4');

  const [completingTasks, setCompletingTasks] = useState({});

  const handleComplete = (taskId) => {
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

  const activeTasks = tasks.filter((t) => !t.completed);

  const sections = [
    { key: 'TODAY', label: '📅 Today' },
    { key: 'TOMORROW', label: '🌅 Tomorrow' },
    { key: 'UPCOMING', label: '🗓️ Next Week' },
    { key: 'NONE', label: '⏳ Later / No Date' },
  ];

  const grouped = {
    TODAY: activeTasks.filter((t) => t.dueDate === 'TODAY'),
    TOMORROW: activeTasks.filter((t) => t.dueDate === 'TOMORROW'),
    UPCOMING: activeTasks.filter((t) => t.dueDate === 'UPCOMING'),
    NONE: activeTasks.filter((t) => t.dueDate === 'NONE'),
  };

  const handleOpenComposer = (sectionKey) => {
    setSelectedSection(sectionKey);
    setIsAdding(true);
    setTitle('');
    setDescription('');
    setPriority('P4');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: `task_${Date.now()}`,
      title,
      description,
      priority,
      dueDate: selectedSection,
      completed: false,
      section: 'INBOX',
      createdAt: new Date().toISOString(),
    });

    setIsAdding(false);
  };

  const priorityMeta = {
    P1: { border: 'border-red-500', color: 'text-red-500' },
    P2: { border: 'border-orange-500', color: 'text-orange-500' },
    P3: { border: 'border-blue-500', color: 'text-blue-500' },
    P4: { border: 'border-gray-300', color: 'text-gray-400' },
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-black flex items-center gap-2">
          Upcoming Schedule
        </h1>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
          {activeTasks.length} pending
        </span>
      </div>

      {/* Sections List */}
      <div className="space-y-8">
        {sections.map((sec) => {
          const list = grouped[sec.key];
          return (
            <div key={sec.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  {sec.label}
                  <span className="text-xxs text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {list.length}
                  </span>
                </h3>
                <button
                  onClick={() => handleOpenComposer(sec.key)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add task
                </button>
              </div>

              {/* Tasks under this date section */}
              {list.length > 0 ? (
                <div className="space-y-2 border-l-2 border-blue-50 pl-4 ml-2">
                  {list.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all group"
                    >
                      <button 
                        onClick={() => handleComplete(task.id)}
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 ${
                          completingTasks[task.id]
                            ? 'bg-green-500 border-green-500 text-white scale-90'
                            : `${priorityMeta[task.priority].border} hover:border-green-500 hover:text-green-500 hover:bg-green-50/20`
                        }`}
                      >
                        {completingTasks[task.id] ? (
                          <Check size={8} className="text-white stroke-[3.5] animate-scale-up" />
                        ) : (
                          <Check size={8} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm leading-tight transition-all duration-200 ${
                          completingTasks[task.id] ? 'line-through text-gray-400 opacity-60' : 'text-gray-900'
                        }`}>{task.title}</h4>
                        {task.description && (
                          <p className={`text-xs mt-0.5 transition-all duration-200 ${
                            completingTasks[task.id] ? 'text-gray-300 line-through' : 'text-gray-400'
                          }`}>{task.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic pl-4 ml-2 pb-2">No tasks scheduled for this period.</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Composer Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleSubmit} 
            className="w-full max-w-md bg-white border border-gray-100 rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                Add task to {sections.find((s) => s.key === selectedSection)?.label.slice(2)}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Task name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-bold text-gray-900 border-b border-gray-200 py-2 focus:ring-0 focus:outline-none placeholder:text-gray-400 focus:border-blue-600"
              required
              autoFocus
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs text-gray-600 border border-gray-100 rounded-lg p-2.5 focus:ring-0 focus:outline-none placeholder:text-gray-400 resize-none h-20 focus:border-blue-600"
            />

            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`appearance-none text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer font-bold focus:outline-none ${priorityMeta[priority].color}`}
                >
                  <option value="P1" className="text-red-500">🚩 Priority 1</option>
                  <option value="P2" className="text-orange-500">🚩 Priority 2</option>
                  <option value="P3" className="text-blue-500">🚩 Priority 3</option>
                  <option value="P4" className="text-gray-400">🚩 Priority 4</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAdding(false)}
                  className="!w-auto !py-1.5 !px-4 !text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim()}
                  className="!w-auto !py-1.5 !px-4 !text-xs"
                >
                  Add Task
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// SVG Cancel Icon
const X = ({ size = 18 }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
