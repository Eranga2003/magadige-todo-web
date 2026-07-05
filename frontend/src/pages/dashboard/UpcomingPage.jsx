import React, { useState } from 'react';
import { Calendar, Plus, ChevronRight, Check, Pencil, MessageSquare } from 'lucide-react';
import { getColor } from '../../utils/color';
import { Button } from '../../components/Button';
import { playTickSound, playChimeSound } from '../../utils/audio';

export const UpcomingPage = ({ tasks = [], onAddTask, onCompleteTask, onUpdateTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSection, setSelectedSection] = useState('TODAY');
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

  const dateLabels = {
    TODAY: '📅 Today',
    TOMORROW: '🌅 Tomorrow',
    UPCOMING: '🗓️ Next Week',
    NONE: '⏳ Later',
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
                      className="p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all group"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <button 
                          onClick={() => handleComplete(task.id)}
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 ${
                            completingTasks[task.id]
                              ? 'bg-green-500 border-green-500 text-white scale-90'
                              : `${priorityMeta[task.priority].border} hover:border-green-500 hover:text-green-500 hover:bg-green-50/20`
                          }`}
                        >
                          {completingTasks[task.id] ? (
                            <Check size={11} strokeWidth={3} className="text-white" />
                          ) : (
                            <Check size={11} strokeWidth={3} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                        
                        {editingTaskId === task.id ? (
                          /* Inline Editor */
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-xs font-bold text-gray-900 border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              required
                            />
                            <textarea 
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full text-xxs text-gray-600 border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 h-14 resize-none bg-white"
                              placeholder="Add description..."
                            />
                            <div className="flex justify-end gap-1.5">
                              <button 
                                type="button" 
                                onClick={() => setEditingTaskId(null)}
                                className="px-2.5 py-1 text-xxs font-bold text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleSaveEdit(task.id)}
                                className="px-2.5 py-1 text-xxs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm leading-tight transition-all duration-200 ${
                                completingTasks[task.id] ? 'line-through text-gray-400 opacity-60' : 'text-gray-900'
                              }`}>{task.title}</h4>
                              {task.description && (
                                <p className={`text-xs mt-0.5 transition-all duration-200 ${
                                  completingTasks[task.id] ? 'text-gray-300 line-through' : 'text-gray-400'
                                }`}>{task.description}</p>
                              )}
                              {/* Display priority tag / mini date only if not in current scheduled tab */}
                              {(task.priority !== 'P4' || task.comments?.length > 0) && (
                                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-extrabold text-gray-400">
                                  {task.priority !== 'P4' && (
                                    <span className="text-gray-450 uppercase">Priority {task.priority.slice(1)}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Quick Hover Action Icons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 self-center">
                              <button
                                onClick={() => startEditing(task)}
                                title="Edit task"
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors focus:outline-none"
                              >
                                <Pencil size={13} />
                              </button>
                              
                              <div className="relative">
                                <button
                                  onClick={() => setActiveDatePickerTaskId(activeDatePickerTaskId === task.id ? null : task.id)}
                                  title="Change date"
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors focus:outline-none"
                                >
                                  <Calendar size={13} />
                                </button>
                                {activeDatePickerTaskId === task.id && (
                                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-scale-up">
                                    {Object.entries(dateLabels).map(([key, label]) => (
                                      <button
                                        key={key}
                                        onClick={() => {
                                          handleChangeTaskDate(task.id, key);
                                          setActiveDatePickerTaskId(null);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-1.5 text-xxs text-gray-700 hover:bg-gray-50 font-bold transition-colors text-left cursor-pointer"
                                      >
                                        <span>{label}</span>
                                        {task.dueDate === key && <Check size={10} className="text-blue-600" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => setActiveCommentTaskId(activeCommentTaskId === task.id ? null : task.id)}
                                title="Comments"
                                className={`p-1.5 rounded-lg cursor-pointer transition-colors focus:outline-none ${
                                  activeCommentTaskId === task.id || (task.comments && task.comments.length > 0)
                                    ? 'text-purple-600 bg-purple-50/50 hover:bg-purple-50'
                                    : 'text-gray-400 hover:text-purple-600 hover:bg-gray-50'
                                }`}
                              >
                                <MessageSquare size={13} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Expanded Comments Panel */}
                      {activeCommentTaskId === task.id && (
                        <div className="w-full mt-3 pt-3 border-t border-gray-100 space-y-2.5 animate-slide-down">
                          <div className="flex items-center gap-1.5">
                            <MessageSquare size={12} className="text-purple-500 animate-pulse" />
                            <h4 className="text-xxs font-extrabold text-gray-400 uppercase tracking-wider">Comments</h4>
                          </div>
                          
                          {/* Comments lists */}
                          {task.comments && task.comments.length > 0 && (
                            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                              {task.comments.map((comm) => (
                                <div key={comm.id} className="bg-gray-50/70 border border-gray-100 rounded-lg p-2 text-xxs text-gray-700 flex justify-between items-start">
                                  <span className="font-semibold leading-relaxed">{comm.text}</span>
                                  <span className="text-[9px] text-gray-455 font-medium ml-2 flex-shrink-0">{comm.createdAt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Write input comment */}
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Add a comment..."
                              value={newCommentTexts[task.id] || ''}
                              onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [task.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveComment(task.id);
                                }
                              }}
                              className="flex-1 text-xxs font-semibold text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-gray-400"
                            />
                            <button 
                              onClick={() => handleSaveComment(task.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xxs px-3 py-1.5 rounded-lg cursor-pointer transition-colors focus:outline-none"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
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
