import React, { useState } from 'react';
import { Sun, Plus, Calendar, Flag, CheckCircle, Check } from 'lucide-react';
import { getColor } from '../../utils/color';
import { Button } from '../../components/Button';

export const TodayPage = ({ tasks = [], onAddTask, onCompleteTask }) => {
  const [isAdding, setIsAdding] = useState(false);
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

  const todayTasks = tasks.filter((t) => t.dueDate === 'TODAY' && !t.completed);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: `task_${Date.now()}`,
      title,
      description,
      priority,
      dueDate: 'TODAY',
      completed: false,
      section: 'INBOX',
      createdAt: new Date().toISOString(),
    });

    setIsAdding(false);
    setTitle('');
    setDescription('');
    setPriority('P4');
  };

  const priorityMeta = {
    P1: { label: 'Priority 1', color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-50/50' },
    P2: { label: 'Priority 2', color: 'text-orange-500', border: 'border-orange-500', bg: 'bg-orange-50/50' },
    P3: { label: 'Priority 3', color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-50/50' },
    P4: { label: 'Priority 4', color: 'text-gray-400', border: 'border-gray-300', bg: 'bg-gray-50' },
  };

  // Group tasks by priority
  const groupedTasks = {
    P1: todayTasks.filter((t) => t.priority === 'P1'),
    P2: todayTasks.filter((t) => t.priority === 'P2'),
    P3: todayTasks.filter((t) => t.priority === 'P3'),
    P4: todayTasks.filter((t) => t.priority === 'P4'),
  };

  const todayDateString = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-extrabold text-black flex items-center gap-2">
            Today
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">{todayDateString}</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
          {todayTasks.length} left
        </span>
      </div>

      {/* Task List grouped by Priority */}
      {todayTasks.length > 0 ? (
        <div className="space-y-6 mb-6">
          {['P1', 'P2', 'P3', 'P4'].map((pKey) => {
            const list = groupedTasks[pKey];
            if (list.length === 0) return null;
            return (
              <div key={pKey} className="space-y-2">
                <h4 className={`text-xxs font-extrabold tracking-wider uppercase ${priorityMeta[pKey].color}`}>
                  {priorityMeta[pKey].label}
                </h4>
                <div className="space-y-2">
                  {list.map((task) => (
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
                            completingTasks[task.id] ? 'text-gray-305 line-through' : 'text-gray-500'
                          }`}>{task.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        !isAdding && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-blue-50/50 flex items-center justify-center mb-6">
              <Sun size={40} className="text-blue-500 animate-spin-slow" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Clear schedule for today</h2>
            <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
              Looks like you are all caught up! Go grab a coffee, check your wellbeing breaks, or start adding tasks.
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              icon={<Plus size={18} />}
              className="!w-auto !px-5"
            >
              Add a task for Today
            </Button>
          </div>
        )
      )}

      {/* Task Composer */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-4 animate-slide-up">
          <input
            type="text"
            placeholder="Task name (e.g. Code auth controller)"
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

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 font-bold">
                📅 Today
              </span>
              
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`appearance-none text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer font-bold focus:outline-none ${priorityMeta[priority].color}`}
              >
                <option value="P1" className="text-red-500">🚩 Priority 1</option>
                <option value="P2" className="text-orange-500">🚩 Priority 2</option>
                <option value="P3" className="text-blue-500">🚩 Priority 3</option>
                <option value="P4" className="text-gray-400">🚩 Priority 4</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAdding(false)}
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

      {/* Floating Plus button */}
      {todayTasks.length > 0 && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className={`fixed bottom-6 right-6 w-12 h-12 rounded-full ${getColor('primary.gradient')} text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer`}
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};
