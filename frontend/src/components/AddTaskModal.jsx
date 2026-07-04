import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Paperclip, 
  Flag, 
  Clock, 
  MoreHorizontal, 
  Inbox, 
  ChevronDown, 
  SlidersHorizontal, 
  Sparkles,
  Briefcase,
  User,
  Check
} from 'lucide-react';
import { getColor } from '../utils/color';
import { Button } from './Button';

export const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('TODAY'); // TODAY, TOMORROW, UPCOMING, NONE
  const [priority, setPriority] = useState('P4'); // P1, P2, P3, P4
  const [project, setProject] = useState('INBOX'); // INBOX, WORK, PERSONAL
  
  // Dropdown states
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const modalRef = useRef(null);

  // Close modal when Esc key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTitle('');
      setDescription('');
      setDueDate('TODAY');
      setPriority('P4');
      setProject('INBOX');
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      section: project,
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  const priorityMeta = {
    P1: { label: 'Priority 1', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    P2: { label: 'Priority 2', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    P3: { label: 'Priority 3', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    P4: { label: 'Priority 4', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
  };

  const dateLabels = {
    TODAY: '📅 Today',
    TOMORROW: '🌅 Tomorrow',
    UPCOMING: '🗓️ Next Week',
    NONE: '⏳ Later',
  };

  const projectLabels = {
    INBOX: { label: 'Inbox', icon: <Inbox size={14} className="text-blue-500" /> },
    WORK: { label: 'Work', icon: <Briefcase size={14} className="text-indigo-500" /> },
    PERSONAL: { label: 'Personal', icon: <User size={14} className="text-green-500" /> },
  };

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      
      {/* Pop-up Window Box */}
      <div 
        ref={modalRef}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-150 overflow-visible animate-scale-up"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Inputs section */}
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-4">
              <input
                type="text"
                placeholder="Finish sales report by Thu at 3pm p1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-base font-bold text-gray-900 border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400"
                required
                autoFocus
              />
              <div className="flex items-center gap-2 text-gray-400 pt-1 flex-shrink-0">
                <button type="button" className="hover:text-gray-600 transition-colors focus:outline-none cursor-pointer">
                  <SlidersHorizontal size={16} />
                </button>
                <button type="button" className="hover:text-gray-600 transition-colors focus:outline-none cursor-pointer">
                  <Sparkles size={16} className="text-purple-400" />
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm text-gray-500 border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Interactive attribute pills row */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            
            {/* 1. Date selector pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowPriorityDropdown(false);
                  setShowProjectDropdown(false);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none transition-colors"
              >
                <Calendar size={13} className="text-gray-500" />
                <span>{dueDate === 'NONE' ? 'Date' : dateLabels[dueDate]}</span>
              </button>

              {showDateDropdown && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-scale-up">
                  {Object.entries(dateLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setDueDate(key);
                        setShowDateDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 font-bold transition-colors text-left cursor-pointer"
                    >
                      <span>{label}</span>
                      {dueDate === key && <Check size={12} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Attachment mock pill */}
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 border border-gray-150 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-default"
            >
              <Paperclip size={13} />
              <span>Attachment</span>
            </button>

            {/* 3. Priority selector pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowPriorityDropdown(!showPriorityDropdown);
                  setShowDateDropdown(false);
                  setShowProjectDropdown(false);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold border rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none transition-colors ${
                  priority === 'P4' 
                    ? 'text-gray-600 border-gray-200 hover:bg-gray-100' 
                    : `${priorityMeta[priority].color} ${priorityMeta[priority].bg} ${priorityMeta[priority].border} hover:opacity-90`
                }`}
              >
                <Flag size={13} className={priority === 'P4' ? 'text-gray-500' : 'text-current'} />
                <span>{priority === 'P4' ? 'Priority' : priorityMeta[priority].label}</span>
              </button>

              {showPriorityDropdown && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-scale-up">
                  {Object.entries(priorityMeta).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setPriority(key);
                        setShowPriorityDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs hover:bg-gray-50 font-bold transition-colors text-left cursor-pointer ${meta.color}`}
                    >
                      <span className="flex items-center gap-2">
                        <Flag size={12} className="fill-current" />
                        {meta.label}
                      </span>
                      {priority === key && <Check size={12} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Reminders mock pill */}
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 border border-gray-150 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-default"
            >
              <Clock size={13} />
              <span>Reminders</span>
            </button>

            {/* 5. More mock pill */}
            <button
              type="button"
              className="flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200 rounded-lg p-1.5 focus:outline-none cursor-default"
            >
              <MoreHorizontal size={13} />
            </button>

          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            
            {/* Bottom-left: Project dropdown selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProjectDropdown(!showProjectDropdown);
                  setShowDateDropdown(false);
                  setShowPriorityDropdown(false);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg focus:outline-none cursor-pointer transition-colors"
              >
                {projectLabels[project].icon}
                <span>{projectLabels[project].label}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {showProjectDropdown && (
                <div className="absolute left-0 bottom-9 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-scale-up">
                  {Object.entries(projectLabels).map(([key, proj]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setProject(key);
                        setShowProjectDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-bold transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {proj.icon}
                        {proj.label}
                      </span>
                      {project === key && <Check size={12} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom-right: Cancel & Save Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="!w-auto !py-1.5 !px-4 !text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim()}
                className="!w-auto !py-1.5 !px-4 !text-xs"
              >
                Add task
              </Button>
            </div>

          </div>

        </form>
      </div>

    </div>
  );
};
