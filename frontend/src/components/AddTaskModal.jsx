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
  Check,
  Plus,
  Upload,
  Mic,
  MicOff,
  Wand2,
  X,
  FileText
} from 'lucide-react';
import { getColor } from '../utils/color';
import { Button } from './Button';
import { MiniCalendarPicker } from './MiniCalendarPicker';

export const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  // Modal Navigation view
  const [modalView, setModalView] = useState('STANDARD'); // STANDARD, AI_BREAKER, VOICE_ADD

  // Standard Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('TODAY'); // TODAY, TOMORROW, UPCOMING, NONE
  const [priority, setPriority] = useState('P4'); // P1, P2, P3, P4
  const [project, setProject] = useState('INBOX'); // INBOX, WORK, PERSONAL
  
  // AI Breaker states
  const [breakerText, setBreakerText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState({});

  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [reminderTime, setReminderTime] = useState('');
  
  // Dropdown states
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showReminderDropdown, setShowReminderDropdown] = useState(false);

  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const modalRef = useRef(null);

  // Close modal when Esc key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      resetState();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const resetState = () => {
    console.log("✏️ AddTaskModal: resetState starting...");
    try {
      setTitle('');
      setDescription('');
      setDueDate('TODAY');
      setPriority('P4');
      setProject('INBOX');
      setBreakerText('');
      setGeneratedSubtasks([]);
      setSelectedSubtasks({});
      setTranscription('');
      setAttachedFile(null);
      setReminderTime('');
      setShowReminderDropdown(false);
      setShowDateDropdown(false);
      setShowPriorityDropdown(false);
      setShowProjectDropdown(false);
      setIsGenerating(false);
      setIsRecording(false);
      setModalView('STANDARD');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.warn("⚠️ SpeechRecognition abort bypassed:", err);
        }
      }
      console.log("✏️ AddTaskModal: resetState completed successfully.");
    } catch (err) {
      console.error("❌ AddTaskModal: resetState failed with error:", err);
    }
  };

  const handleClose = () => {
    console.log("✏️ AddTaskModal: handleClose invoked!");
    resetState();
    console.log("✏️ AddTaskModal: triggering onClose prop callback...");
    if (typeof onClose === 'function') {
      onClose();
      console.log("✏️ AddTaskModal: onClose prop invoked successfully.");
    } else {
      console.error("❌ AddTaskModal: onClose prop is not a valid function:", onClose);
    }
  };

  // 1. Text File Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBreakerText((prev) => prev + (prev ? '\n' : '') + event.target.result);
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = null;
  };

  // 2. Mock AI Task Breaker logic
  const handleAIGenerate = (textSource) => {
    if (!textSource.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const text = textSource.toLowerCase();
      let subtasks = [];

      // Keyword matching for premium contextual results
      if (text.includes('landing') || text.includes('homepage') || text.includes('view') || text.includes('web')) {
        subtasks = [
          'Research premium SaaS landing page structures',
          'Code responsive navigation header and footer',
          'Design interactive visual mockup dashboard in CSS',
          'Integrate theme styling tokens (SaaS Blue mix)',
        ];
      } else if (text.includes('auth') || text.includes('login') || text.includes('database') || text.includes('firestore')) {
        subtasks = [
          'Configure Google OAuth pop-up settings in Firebase client',
          'Define client-side environment secrets in frontend/.env',
          'Update backend authentication controllers to index users in Cloud Firestore',
          'Verify tokens securely using firebase-admin SDK',
        ];
      } else {
        // Fallback split logic by punctuation or key conjunctions
        const parts = textSource.split(/[.,;!?]|\band\b|\bthen\b/).map(p => p.trim()).filter(p => p.length > 5);
        if (parts.length > 1) {
          subtasks = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
        } else {
          subtasks = [
            `Analyze core goal: "${textSource}"`,
            'Outline step-by-step developer tasks',
            'Run tests and execute build checks',
            'Push updates to git development branch',
          ];
        }
      }

      setGeneratedSubtasks(subtasks);
      
      // Select all by default
      const defaultSelected = {};
      subtasks.forEach((_, idx) => {
        defaultSelected[idx] = true;
      });
      setSelectedSubtasks(defaultSelected);
      setIsGenerating(false);
    }, 1200); // 1.2s loading state simulation
  };

  // 3. Web Speech API Speech Recognition configuration
  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Browser fallback simulation if microphone API unavailable
      setIsRecording(true);
      setTranscription('Listening... (Simulated Speech): Add Google authentication popup and test it.');
      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setTranscription('');
      };

      rec.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscription(speechToText);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAddSubtasks = () => {
    // Add all selected subtasks as tasks
    generatedSubtasks.forEach((sub, idx) => {
      if (selectedSubtasks[idx]) {
        onAddTask({
          id: `task_${Date.now()}_${idx}`,
          title: sub,
          description: `AI generated subtask from: "${breakerText || transcription}"`,
          priority: 'P4',
          dueDate: 'TODAY',
          completed: false,
          section: project,
          createdAt: new Date().toISOString(),
        });
      }
    });
    handleClose();
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
      section: project,
      createdAt: new Date().toISOString(),
    });

    handleClose();
  };

  const priorityMeta = {
    P1: { label: 'Priority 1 (Pink)', color: 'text-pink-600', bg: 'bg-pink-50/50', border: 'border-pink-200' },
    P2: { label: 'Priority 2 (Yellow)', color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-200' },
    P3: { label: 'Priority 3 (Green)', color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
    P4: { label: 'Priority 4 (Blue)', color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-200' },
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-150 overflow-visible animate-scale-up"
      >
        
        {/* VIEW 1: STANDARD ADD TASK VIEW */}
        {modalView === 'STANDARD' && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Inputs */}
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
                  <button 
                    type="button" 
                    onClick={() => setModalView('AI_BREAKER')}
                    title="AI Task Breaker"
                    className="hover:text-blue-500 transition-colors focus:outline-none cursor-pointer"
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setModalView('VOICE_ADD')}
                    title="Voice-to-Text Add"
                    className="hover:text-purple-500 transition-colors focus:outline-none cursor-pointer"
                  >
                    <Sparkles size={16} className="text-purple-400 hover:text-purple-600" />
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

            {/* Middle Pills Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDateDropdown(!showDateDropdown);
                    setShowPriorityDropdown(false);
                    setShowProjectDropdown(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none transition-colors"
                >
                  <Calendar size={13} className="text-gray-500" />
                  <span>{dueDate === 'NONE' ? 'Date' : (dateLabels[dueDate] || dueDate)}</span>
                </button>
                {showDateDropdown && (
                  <MiniCalendarPicker
                    value={dueDate}
                    onChange={(newDate) => setDueDate(newDate)}
                    onClose={() => setShowDateDropdown(false)}
                  />
                )}
              </div>

              {attachedFile ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                  <Paperclip size={13} />
                  <span className="truncate max-w-[100px]">{attachedFile.name}</span>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachedFile(null);
                    }}
                    className="hover:text-red-500 cursor-pointer focus:outline-none ml-1 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current.click()}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none transition-colors"
                >
                  <Paperclip size={13} className="text-gray-500" />
                  <span>Attachment</span>
                </button>
              )}

              <input 
                type="file" 
                ref={attachmentInputRef} 
                onChange={(e) => setAttachedFile(e.target.files[0] || null)} 
                className="hidden" 
              />

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

              <div className="relative">
                {reminderTime ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 animate-scale-up">
                    <Clock size={13} />
                    <span>{reminderTime}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setReminderTime('');
                      }}
                      className="hover:text-red-500 cursor-pointer focus:outline-none ml-1 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowReminderDropdown(!showReminderDropdown);
                      setShowDateDropdown(false);
                      setShowPriorityDropdown(false);
                      setShowProjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none transition-colors"
                  >
                    <Clock size={13} className="text-gray-500" />
                    <span>Reminders</span>
                  </button>
                )}

                {showReminderDropdown && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-150 rounded-xl shadow-lg p-3 z-50 animate-scale-up space-y-2">
                    <p className="text-xxs font-extrabold text-gray-400 uppercase tracking-wider">Select Time</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'].map((timeOption) => (
                        <button
                          key={timeOption}
                          type="button"
                          onClick={() => {
                            setReminderTime(timeOption);
                            setShowReminderDropdown(false);
                          }}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-xxs font-bold text-gray-700 transition-colors text-center cursor-pointer"
                        >
                          {timeOption}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <label className="block text-xxs font-extrabold text-gray-400 uppercase tracking-wider mb-1">Custom Time</label>
                      <input 
                        type="time" 
                        onChange={(e) => {
                          if (e.target.value) {
                            const [h, m] = e.target.value.split(':');
                            const hh = parseInt(h);
                            const ampm = hh >= 12 ? 'PM' : 'AM';
                            const hours12 = hh % 12 || 12;
                            const formatted = `${hours12.toString().padStart(2, '0')}:${m} ${ampm}`;
                            setReminderTime(formatted);
                            setShowReminderDropdown(false);
                          }
                        }}
                        className="w-full text-xxs font-semibold text-gray-700 border border-gray-200 rounded-md p-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200 rounded-lg p-1.5 focus:outline-none"
              >
                <MoreHorizontal size={13} />
              </button>
            </div>

            {/* Footer row */}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-auto flex items-center justify-center gap-1.5 py-1.5 px-4 font-bold rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-xs cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
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
        )}

        {/* VIEW 2: AI TASK BREAKER */}
        {modalView === 'AI_BREAKER' && (
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-blue-500" />
                AI Task Breaker
              </h3>
              <button 
                type="button" 
                onClick={() => setModalView('STANDARD')}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {generatedSubtasks.length === 0 ? (
              /* Input goal stage */
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    placeholder="Enter your goals/tasks (e.g. Design a registration page and save user data to Firestore)"
                    value={breakerText}
                    onChange={(e) => setBreakerText(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-gray-400 resize-none h-28"
                    disabled={isGenerating}
                  />

                  {/* Floating + button to upload text files */}
                  <div className="absolute right-3 bottom-3">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".txt" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      title="Add text file"
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isGenerating}
                    className="w-auto flex items-center justify-center gap-1.5 py-1.5 px-4 font-bold rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-xs cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={() => handleAIGenerate(breakerText)}
                    disabled={!breakerText.trim() || isGenerating}
                    icon={isGenerating ? null : <Wand2 size={13} />}
                    className="!w-auto !py-1.5 !px-4 !text-xs"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : 'AI Generate'}
                  </Button>
                </div>
              </div>
            ) : (
              /* Display generated subtasks stage */
              <div className="space-y-4">
                <p className="text-xxs font-extrabold text-gray-400 uppercase tracking-wider">Generated Subtasks</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {generatedSubtasks.map((sub, idx) => (
                    <label 
                      key={idx}
                      className="flex items-start gap-2.5 p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox"
                        checked={!!selectedSubtasks[idx]}
                        onChange={() => {
                          setSelectedSubtasks(prev => ({
                            ...prev,
                            [idx]: !prev[idx]
                          }));
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                      />
                      <span className="text-xs text-gray-700 font-semibold leading-tight">{sub}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setGeneratedSubtasks([])}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Back to text
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-auto flex items-center justify-center gap-1.5 py-1.5 px-4 font-bold rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-xs cursor-pointer focus:outline-none"
                    >
                      Cancel
                    </button>
                    <Button
                      onClick={handleAddSubtasks}
                      className="!w-auto !py-1.5 !px-4 !text-xs"
                    >
                      Confirm & Add Tasks
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: VOICE ADD VIEW */}
        {modalView === 'VOICE_ADD' && (
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" />
                Voice-to-Text Add
              </h3>
              <button 
                type="button" 
                onClick={() => setModalView('STANDARD')}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {generatedSubtasks.length === 0 ? (
              /* Voice Transcription stage */
              <div className="space-y-4">
                {/* Voice waves & Microphone central button */}
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                  >
                    {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                  
                  <span className={`text-xxs font-bold uppercase tracking-wider ${
                    isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'
                  }`}>
                    {isRecording ? 'Recording Live... Click again to stop' : 'Tap Microphone to Speak'}
                  </span>
                </div>

                {/* Live transcription text panel */}
                <textarea
                  placeholder="Your voice transcription will display here..."
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none placeholder:text-gray-400 resize-none h-24"
                  disabled={isGenerating}
                />

                {/* Low color guide text with mic icon */}
                <div className="flex items-start gap-1.5 text-xxs font-bold text-gray-400 leading-normal pl-1">
                  <Mic size={12} className="flex-shrink-0 mt-0.5 text-purple-400" />
                  <p>
                    Tap the microphone icon, say your goals (e.g. "Deploy databases and code login pages"), and our AI will transcribe it. Press "AI Generate" to parse into actionable tasks.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isGenerating}
                    className="w-auto flex items-center justify-center gap-1.5 py-1.5 px-4 font-bold rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-xs cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={() => handleAIGenerate(transcription)}
                    disabled={!transcription.trim() || isGenerating || isRecording}
                    icon={isGenerating ? null : <Wand2 size={13} />}
                    className="!w-auto !py-1.5 !px-4 !text-xs"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : 'AI Generate'}
                  </Button>
                </div>
              </div>
            ) : (
              /* Display subtasks stage */
              <div className="space-y-4">
                <p className="text-xxs font-extrabold text-gray-400 uppercase tracking-wider">AI Extracted Subtasks</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {generatedSubtasks.map((sub, idx) => (
                    <label 
                      key={idx}
                      className="flex items-start gap-2.5 p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox"
                        checked={!!selectedSubtasks[idx]}
                        onChange={() => {
                          setSelectedSubtasks(prev => ({
                            ...prev,
                            [idx]: !prev[idx]
                          }));
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                      />
                      <span className="text-xs text-gray-700 font-semibold leading-tight">{sub}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setGeneratedSubtasks([])}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Back to text
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-auto flex items-center justify-center gap-1.5 py-1.5 px-4 font-bold rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-xs cursor-pointer focus:outline-none"
                    >
                      Cancel
                    </button>
                    <Button
                      onClick={handleAddSubtasks}
                      className="!w-auto !py-1.5 !px-4 !text-xs"
                    >
                      Confirm & Add Tasks
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
