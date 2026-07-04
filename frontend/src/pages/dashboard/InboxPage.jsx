import React, { useState } from 'react';
import { Inbox, Plus, Calendar, Flag, Tag, X, ListTodo, AlertCircle, Check } from 'lucide-react';
import { getColor } from '../../utils/color';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { playTickSound, playChimeSound } from '../../utils/audio';

export const InboxPage = ({ tasks = [], onAddTask, onCompleteTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('P4'); // P1 = High, P2 = Medium, P3 = Low, P4 = None
  const [dueDate, setDueDate] = useState('TODAY'); // TODAY, TOMORROW, UPCOMING, NONE
  
  // Animation state for completion checkmarks
  const [completingTasks, setCompletingTasks] = useState({});

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
              className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200 group"
            >
              <button 
                onClick={() => handleComplete(task.id)}
                className={`w-5.5 h-5.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 ${
                  completingTasks[task.id]
                    ? 'bg-green-500 border-green-500 text-white scale-90'
                    : `${priorityMeta[task.priority].border} hover:border-green-500 hover:text-green-500 hover:bg-green-50/20`
                }`}
              >
                {completingTasks[task.id] ? (
                  <Check size={10} className="text-white stroke-[3.5] animate-scale-up" />
                ) : (
                  <Check size={10} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm leading-tight transition-all duration-200 ${
                  completingTasks[task.id] ? 'line-through text-gray-400 opacity-60' : 'text-gray-900'
                }`}>{task.title}</h3>
                {task.description && (
                  <p className={`text-xs mt-1 leading-snug transition-all duration-200 ${
                    completingTasks[task.id] ? 'text-gray-300 line-through' : 'text-gray-500'
                  }`}>{task.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xxs font-bold">
                  {task.dueDate !== 'NONE' && (
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      <Calendar size={10} />
                      {task.dueDate}
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
