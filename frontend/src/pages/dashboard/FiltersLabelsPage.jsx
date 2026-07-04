import React, { useState } from 'react';
import { Flag, Check, ListFilter } from 'lucide-react';
import { getColor } from '../../utils/color';
import { playTickSound, playChimeSound } from '../../utils/audio';

export const FiltersLabelsPage = ({ tasks = [], onCompleteTask }) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, P1, P2, P3, P4

  const [completingTasks, setCompletingTasks] = useState({});

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
              className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all group shadow-xxs"
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
                  <Check size={12} strokeWidth={3} className="text-white" />
                ) : (
                  <Check size={12} strokeWidth={3} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold text-sm leading-tight transition-all duration-200 ${
                    completingTasks[task.id] ? 'line-through text-gray-400 opacity-60' : 'text-gray-900'
                  }`}>{task.title}</h4>
                  <span className="text-xxs text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-full">
                    {task.dueDate}
                  </span>
                </div>
                {task.description && (
                  <p className={`text-xs mt-1 leading-snug transition-all duration-200 ${
                    completingTasks[task.id] ? 'text-gray-300 line-through' : 'text-gray-400'
                  }`}>{task.description}</p>
                )}
              </div>
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
