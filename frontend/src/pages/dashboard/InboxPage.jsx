import React, { useState } from 'react';
import { Inbox, Plus, Calendar, Flag, Tag, X, ListTodo, AlertCircle, Check, Pencil, MessageSquare } from 'lucide-react';
import { getColor } from '../../utils/color';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { playTickSound, playChimeSound } from '../../utils/audio';
import { MiniCalendarPicker } from '../../components/MiniCalendarPicker';

export const InboxPage = ({ tasks = [], onAddTask, onCompleteTask, onUpdateTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('P4'); // P1 = High, P2 = Medium, P3 = Low, P4 = None
  const [dueDate, setDueDate] = useState('TODAY'); // TODAY, TOMORROW, UPCOMING, NONE
  
  // Animation state for completion checkmarks
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
      if (onCompleteTask) onCompleteTask(taskId);
      setCompletingTasks((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }, 450); // 450ms animation delay
  };

  const handleOpenComposer = () => {
    setIsAdding(true);
    setTitle('');
    setDescription('');
    setPriority('P4');
    setDueDate('TODAY');
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: `task_${Date.now()}`,
      title,
      description,
      priority,
      dueDate,
      completed: false,
      section: 'INBOX',
      createdAt: new Date().toISOString(),
    });

    setIsAdding(false);
  };

  const priorityMeta = {
    P1: { label: 'Priority 1', color: 'text-red-500', border: 'border-red-500', fill: 'bg-red-50' },
    P2: { label: 'Priority 2', color: 'text-orange-500', border: 'border-orange-500', fill: 'bg-orange-50' },
    P3: { label: 'Priority 3', color: 'text-blue-500', border: 'border-blue-500', fill: 'bg-blue-50' },
    P4: { label: 'Priority 4', color: 'text-gray-400', border: 'border-gray-300', fill: 'bg-gray-50' },
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Inbox Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-black flex items-center gap-2">
          Inbox
        </h1>
        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {tasks.length} tasks
        </span>
      </div>

      {/* Task List */}
      {tasks.length > 0 ? (
        <div className="space-y-3 mb-6">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-start gap-3 w-full">
                <button 
                  onClick={() => handleComplete(task.id)}
                  className={`w-5.5 h-5.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 ${
                    completingTasks[task.id]
                      ? 'bg-green-500 border-green-500 text-white scale-90'
                      : `${priorityMeta[task.priority].border} hover:border-green-500 hover:text-green-500 hover:bg-green-50/20`
                  }`}
                >
                  {completingTasks[task.id] ? (
                    <Check size={12} strokeWidth={3} className="text-white" />
                  ) : (
                    <Check size={12} strokeWidth={3} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      <h3 className={`font-semibold text-sm leading-tight transition-all duration-200 ${
                        completingTasks[task.id] ? 'line-through text-gray-400 opacity-60' : 'text-gray-900'
                      }`}>{task.title}</h3>
                      {task.description && (
                        <p className={`text-xs mt-1 leading-snug transition-all duration-200 ${
                          completingTasks[task.id] ? 'text-gray-300 line-through' : 'text-gray-500'
                        }`}>{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-extrabold">
                        {task.dueDate !== 'NONE' && (
                          <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Calendar size={10} />
                            {dateLabels[task.dueDate] || task.dueDate}
                          </span>
                        )}
                        {task.priority !== 'P4' && (
                          <span className={`flex items-center gap-1 ${priorityMeta[task.priority].color} ${priorityMeta[task.priority].fill} px-1.5 py-0.5 rounded`}>
                            <Flag size={10} />
                            {priorityMeta[task.priority].label}
                          </span>
                        )}
                      </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDatePickerTaskId(activeDatePickerTaskId === task.id ? null : task.id);
                          }}
                          title="Change date"
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors focus:outline-none"
                        >
                          <Calendar size={13} />
                        </button>
                        {activeDatePickerTaskId === task.id && (
                          <MiniCalendarPicker
                            value={task.dueDate}
                            onChange={(newDate) => handleChangeTaskDate(task.id, newDate)}
                            onClose={() => setActiveDatePickerTaskId(null)}
                          />
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
                          <span className="text-[9px] text-gray-450 font-medium ml-2 flex-shrink-0">{comm.createdAt}</span>
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
        /* Empty State Illustration */
        !isAdding && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="relative mb-6 flex items-center justify-center">
              {/* Premium Vector Inbox Drawer Box Representation */}
              <div className="w-32 h-32 rounded-full bg-blue-50/50 flex items-center justify-center animate-pulse-slow">
                <div className="relative w-20 h-16 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 rounded-lg shadow-sm flex flex-col justify-between overflow-hidden">
                  {/* Tray opening */}
                  <div className="w-full h-4 bg-amber-400/40 border-b border-amber-300"></div>
                  {/* Inside folder handles */}
                  <div className="w-8 h-3 bg-amber-300 border border-amber-400 rounded-md mx-auto mb-1"></div>
                  {/* Paper sheets sticking out */}
                  <div className="absolute top-[-10px] left-4 w-12 h-10 bg-white border border-gray-200 rounded shadow-xs rotate-[-6deg] transform origin-bottom"></div>
                  <div className="absolute top-[-12px] left-6 w-10 h-10 bg-white border border-gray-200 rounded shadow-xs rotate-[8deg] transform origin-bottom"></div>
                </div>
              </div>
              {/* Sparkle details */}
              <span className="absolute top-2 right-2 text-yellow-400 animate-bounce">✦</span>
              <span className="absolute bottom-4 left-2 text-sky-400 animate-pulse">✨</span>
            </div>
            
            <h2 className="text-lg font-bold text-gray-900 mb-1">Capture now, plan later</h2>
            <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
              Inbox is your go-to spot for quick task entry. Clear your mind now, organize when you're ready.
            </p>
            <Button
              onClick={handleOpenComposer}
              icon={<Plus size={18} />}
              className="!w-auto !px-5"
            >
              Add task
            </Button>
          </div>
        )
      )}

      {/* Interactive Task Composer Inline */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-4 animate-slide-up">
          <input
            type="text"
            placeholder="Task name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-bold text-gray-900 border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400"
            required
            autoFocus
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs text-gray-600 border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400 resize-none h-16"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            {/* Meta attributes selectors */}
            <div className="flex items-center gap-2">
              {/* Due Date dropdown emulation */}
              <div className="relative">
                <select
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="appearance-none flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer font-semibold focus:outline-none"
                >
                  <option value="TODAY">📅 Today</option>
                  <option value="TOMORROW">📅 Tomorrow</option>
                  <option value="UPCOMING">📅 Next Week</option>
                  <option value="NONE">📅 No Date</option>
                </select>
              </div>

              {/* Priority flag dropdown emulation */}
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`appearance-none flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer font-semibold focus:outline-none ${priorityMeta[priority].color}`}
                >
                  <option value="P1" className="text-red-500">🚩 Priority 1</option>
                  <option value="P2" className="text-orange-500">🚩 Priority 2</option>
                  <option value="P3" className="text-blue-500">🚩 Priority 3</option>
                  <option value="P4" className="text-gray-400">🚩 Priority 4</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="!w-auto !py-1.5 !px-3.5 !text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim()}
                className="!w-auto !py-1.5 !px-3.5 !text-xs"
              >
                Add task
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Quick Add floating action button if not already editing list */}
      {tasks.length > 0 && !isAdding && (
        <button
          onClick={handleOpenComposer}
          className={`fixed bottom-6 right-6 w-12 h-12 rounded-full ${getColor('primary.gradient')} text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer`}
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};
