import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Mic, MicOff, X, Sparkles, CheckCircle2,
  RotateCcw, Zap, Clock, AlertTriangle, Calendar, MapPin,
  ChevronRight, Loader2, Volume2
} from 'lucide-react';
import { detectIntent, buildAiResponse, getTomorrowDateString } from '../../utils/aiAssistantService';
import { getColor } from '../../utils/color';

// Quick chip predefined messages
const QUICK_CHIPS = [
  { label: "I'm tired today 😴", icon: '😴' },
  { label: "Tasks today 📋", icon: '📋' },
  { label: "Free time today? ⚽", icon: '⚽' },
  { label: "Travel to Sigiriya 🏔️", icon: '🏔️' },
  { label: "Workout tomorrow 💪", icon: '💪' },
  { label: "Reschedule meetings 📅", icon: '📅' },
  { label: "Show urgent tasks 🚨", icon: '🚨' },
];

// Renders markdown-like **bold** and newlines in chat
function ChatText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-black">{part.slice(2, -2)}</strong>;
        }
        if (part === '\n') return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export const AiAssistantPanel = ({ tasks = [], onAddTask, onUpdateTask, isFullPage = false }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      text: "Hi! 👋 I'm your AI Task Assistant. I can help you manage tasks, reschedule meetings, and check weather for your plans.\n\nTry asking me something or tap a quick action below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { confirmAction, taskList, meetingTasks }
  const [isListening, setIsListening] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Add a message to the chat
  const addMessage = (type, text, extra = {}) => {
    const msg = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...extra,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  // Process AI response after a short typing delay
  const processMessage = async (userText) => {
    if (!userText.trim()) return;

    // Add user message
    addMessage('user', userText);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

    const intent = detectIntent(userText);
    const response = buildAiResponse(intent, userText, tasks);

    setIsTyping(false);

    // Handle weather fetch intent
    if (response.action === 'FETCH_WEATHER') {
      addMessage('ai', response.text);
      const loc = response.location || 'Colombo';
      await fetchWeatherForLocation(loc, userText);
      return;
    }

    // Handle meditation task auto-add
    if (response.action === 'ADD_MEDITATION') {
      addMessage('ai', response.text);
      const meditationTask = {
        id: `task_${Date.now()}`,
        title: '🧘 Meditation & Rest',
        description: 'Take 15-20 minutes to rest, meditate, or simply breathe. You deserve it.',
        priority: 'P3',
        dueDate: 'TODAY',
        completed: false,
        section: 'INBOX',
        createdAt: new Date().toISOString(),
      };
      if (onAddTask) onAddTask(meditationTask);

      setTimeout(() => {
        addMessage('ai', '✅ **Meditation & Rest** task has been added to your today list! 🧘\n\nTake care of yourself first.', { isSuccess: true });
      }, 600);
    }

    // Store pending confirmation
    if (response.requiresConfirmation) {
      setPendingAction({
        confirmAction: response.confirmAction,
        taskList: response.taskList || [],
        meetingTasks: response.meetingTasks || [],
      });
      addMessage('ai', response.text, { showConfirm: true });
    } else {
      if (response.action !== 'ADD_MEDITATION') {
        addMessage('ai', response.text);
      }
    }
  };

  // Fetch weather from the OpenWeatherMap API via backend
  const fetchWeatherForLocation = async (location, originalMessage) => {
    setWeatherLoading(true);
    try {
      const apiKey = '7ec72d297f92f0238d07407c02b47262';
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Location not found');

      const data = await res.json();
      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const wind = data.wind?.speed || 0;
      const humidity = data.main.humidity;

      const isWorkout = originalMessage.toLowerCase().includes('workout') || originalMessage.toLowerCase().includes('exercise');
      const isBad = desc.includes('rain') || desc.includes('storm') || desc.includes('thunder');

      let recommendation = '';
      if (isWorkout) {
        recommendation = isBad
          ? `⚠️ **Weather warning**: ${desc} with ${temp}°C — outdoor workout not recommended. Consider an indoor session instead! 🏋️`
          : `✅ Weather looks ${temp < 28 ? 'great' : 'warm but manageable'} for a workout! Stay hydrated 💪`;
      } else {
        recommendation = isBad
          ? `⚠️ **Travel warning**: ${desc} with ${temp}°C — travel might be challenging. Consider postponing or checking road conditions.`
          : `✅ Great news! Weather in **${location}** looks **${desc}** at ${temp}°C. Safe to travel! 🌟`;
      }

      addMessage('ai',
        `🌤️ **${location} Weather Report**\n\n• Temperature: **${temp}°C**\n• Condition: **${desc}**\n• Wind: **${wind} m/s**\n• Humidity: **${humidity}%**\n\n${recommendation}`,
        { isWeather: true, location }
      );
    } catch (err) {
      addMessage('ai', `❌ Couldn't fetch weather for **${location}**. Please check the spelling or try another city.`);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Handle confirmation YES
  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { confirmAction, taskList, meetingTasks } = pendingAction;
    setPendingAction(null);

    setIsTyping(true);
    await new Promise(r => setTimeout(r, 700));
    setIsTyping(false);

    if (confirmAction === 'RESCHEDULE_NORMAL_TASKS') {
      const tomorrow = getTomorrowDateString();
      let rescheduled = 0;
      for (const task of taskList) {
        if (onUpdateTask) {
          onUpdateTask({ ...task, dueDate: tomorrow, rescheduled: true });
          rescheduled++;
        }
      }

      addMessage('ai',
        `✅ **${rescheduled} task(s)** successfully rescheduled to tomorrow!\n\nYou can focus on what's urgent today. Take it easy 💙`,
        { isSuccess: true }
      );

      // Handle meetings if any
      if (meetingTasks && meetingTasks.length > 0) {
        setTimeout(() => {
          addMessage('ai',
            `📅 I also found **${meetingTasks.length} meeting(s)** today.\n\nShall I reschedule those to tomorrow and notify the members by email? 📧`,
            { showConfirm: true }
          );
          setPendingAction({ confirmAction: 'RESCHEDULE_MEETINGS', taskList: meetingTasks, meetingTasks });
        }, 1000);
      }
    }

    if (confirmAction === 'RESCHEDULE_MEETINGS') {
      const tomorrow = getTomorrowDateString();
      let rescheduled = 0;
      const emailsSent = [];

      for (const task of taskList) {
        if (onUpdateTask) {
          onUpdateTask({ ...task, dueDate: tomorrow, rescheduled: true });
          rescheduled++;
        }
        if (task.meeting?.members?.length > 0) {
          emailsSent.push(...task.meeting.members);
          // Send email via backend
          try {
            await sendMeetingEmail(task, tomorrow);
          } catch (e) {
            console.warn('Email send failed:', e.message);
          }
        }
      }

      const emailMsg = emailsSent.length > 0
        ? `\n📧 Emails sent to: **${[...new Set(emailsSent)].join(', ')}**`
        : `\n📧 No member emails were listed on the meetings.`;

      addMessage('ai',
        `✅ **${rescheduled} meeting(s)** rescheduled to tomorrow!${emailMsg}`,
        { isSuccess: true }
      );
    }
  };

  // Handle confirmation NO
  const handleDecline = () => {
    setPendingAction(null);
    addMessage('ai', "No problem! 👍 Let me know if you need anything else.", { });
  };

  // Send meeting reschedule email via backend
  const sendMeetingEmail = async (task, newDate) => {
    const token = localStorage.getItem('magadige_auth_token');
    await fetch('http://localhost:5000/api/tasks/ai/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        meetingTitle: task.meeting?.title || task.title,
        meetingDescription: task.meeting?.description || task.description || '',
        members: task.meeting?.members || [],
        newDate,
      }),
    });
  };

  // Voice input
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage('ai', '🎤 Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.abort();
    setIsListening(false);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    processMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`w-full mx-auto ${isFullPage ? 'max-w-none mt-0 animate-scale-up' : 'max-w-3xl mt-10'}`}>
      {/* Header */}
      {!isFullPage && (
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
              AI Assistant
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 uppercase tracking-wider">Beta</span>
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold">Manage tasks through conversation</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online</span>
          </div>
        </div>
      )}

      {/* Chat container */}
      <div className={`bg-white border border-slate-100 rounded-[28px] overflow-hidden transition-all duration-300 ${
        isFullPage
          ? 'shadow-[0_25px_60px_rgba(37,99,235,0.14),0_12px_36px_rgba(37,99,235,0.08)]'
          : 'shadow-[0_20px_50px_rgba(37,99,235,0.08),0_8px_24px_rgba(37,99,235,0.04)]'
      }`}>

        {/* Messages area */}
        <div className={`overflow-y-auto p-6 space-y-4 scrollbar-none transition-all duration-300 ${
          isFullPage ? 'h-[500px]' : 'h-80'
        }`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {msg.type === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm self-end">
                  <Bot size={15} className="text-white" />
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div className={`rounded-[20px] px-4 py-3 text-sm leading-relaxed font-semibold transition-all ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md shadow-[0_4px_14px_rgba(37,99,235,0.25)]'
                    : msg.isSuccess
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-bl-md'
                    : msg.isWeather
                    ? 'bg-sky-50 border border-sky-100 text-sky-900 rounded-bl-md'
                    : 'bg-gray-50 border border-gray-150 text-gray-800 rounded-bl-md'
                }`}>
                  <ChatText text={msg.text} />
                </div>

                {/* Confirm buttons */}
                {msg.showConfirm && pendingAction && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={handleConfirm}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 size={12} /> Yes, do it!
                    </button>
                    <button
                      onClick={handleDecline}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      <X size={12} /> No thanks
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-gray-350 font-bold px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 self-end shadow-sm">
                <Bot size={15} className="text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-[20px] rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full ai-typing-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full ai-typing-dot" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full ai-typing-dot" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick chip row */}
        <div className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => processMessage(chip.label)}
              className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-150 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.04)]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your tasks..."
              className="flex-1 text-sm font-semibold text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
            />

            {/* Voice button */}
            <button
              onClick={isListening ? stopVoice : startVoice}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)] animate-pulse'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.45)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isTyping
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} />
              }
            </button>
          </div>

          {isListening && (
            <p className="text-[11px] text-red-500 font-bold mt-2 px-1 animate-pulse">
              🎤 Listening... speak now
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
