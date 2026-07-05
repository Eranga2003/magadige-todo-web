import React, { useState } from 'react';
import { Flag, Check, ListFilter, Pencil, Calendar, MessageSquare } from 'lucide-react';
import { getColor } from '../../utils/color';
import { playTickSound, playChimeSound } from '../../utils/audio';
import { MiniCalendarPicker } from '../../components/MiniCalendarPicker';

export const FiltersLabelsPage = ({ tasks = [], onCompleteTask, onUpdateTask }) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, P1, P2, P3, P4

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

  const filteredTasks = selectedFilter === 'ALL' 
    ? activeTasks 
    : activeTasks.filter((t) => t.priority === selectedFilter);

  const filterOptions = [
    { key: 'ALL', label: 'All Priorities', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { key: 'P1', label: '🚩 Priority 1 (High)', color: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' },
    { key: 'P2', label: '🚩 Priority 2 (Medium)', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' },
    { key: 'P3', label: '🚩 Priority 3 (Low)', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' },
    { key: 'P4', label: '🚩 Priority 4 (None)', color: 'bg-gray-50 text-gray-500 hover:bg-gray-150 border border-gray-200' },
  ];

  const priorityMeta = {
    P1: { border: 'border-red-500', color: 'text-red-500' },
    P2: { border: 'border-orange-500', color: 'text-orange-500' },
    P3: { border: 'border-blue-500', color: 'text-blue-500' },
    P4: { border: 'border-gray-300', color: 'text-gray-400' },
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-black flex items-center gap-2">
          Filters & Labels
        </h1>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
          {filteredTasks.length} matches
        </span>
      </div>

      {/* Filter Buttons Option Grid */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedFilter(opt.key)}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-xxs ${
              selectedFilter === opt.key 
                ? `${getColor('primary.gradient')} text-white border-2 border-transparent scale-102` 
                : `${opt.color} border-2 border-transparent`
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filtered Tasks rendering */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all group shadow-xxs"
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
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm leading-tight transition-all duration-200 ${
                          completingTasks[task.id] ? 'line-through text-gray-400 opacity-60' : 'text-gray-900'
                        }`}>{task.title}</h4>
                        {task.dueDate && task.dueDate !== 'NONE' && (
                          <span className="text-[10px] text-gray-400 font-extrabold bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0">
                            {dateLabels[task.dueDate] || task.dueDate}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className={`text-xs mt-1 leading-snug transition-all duration-200 ${
                          completingTasks[task.id] ? 'text-gray-300 line-through' : 'text-gray-400'
                        }`}>{task.description}</p>
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
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-50/50 flex items-center justify-center mb-4">
            <ListFilter size={30} className="text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">No matching tasks found</h3>
          <p className="text-xs text-gray-400 max-w-xs">
            Try choosing a different filter option above or add some new tasks to get started.
          </p>
        </div>
      )}
    </div>
  );
};
