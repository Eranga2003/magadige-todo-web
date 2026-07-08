/**
 * AI Task Assistant — Rule-Based NLP Engine
 * Parses user messages and returns structured action responses.
 */

// Intent detection keywords
const INTENTS = {
  TIRED: ['tired', 'exhausted', 'fatigued', 'drained', 'burnout', 'burn out', 'need rest', 'stressed'],
  FREE_TIME: ['free time', 'football', 'watch match', 'cricket match', 'free today', 'take a break', 'relax today', 'chill today'],
  TRAVEL: ['travel', 'trip', 'visit', 'go to', 'sigiriya', 'kandy', 'galle', 'colombo', 'nuwara eliya', 'ella', 'hikkaduwa', 'mirissa', 'arugam'],
  WORKOUT: ['workout', 'work out', 'exercise', 'gym', 'run', 'jog', 'cycling', 'swim'],
  MEETING: ['meeting', 'reschedule meeting', 'meeting today', 'meetings today'],
  URGENT: ['urgent tasks', 'urgent', 'important tasks', 'priority tasks', 'p1', 'p2', 'must do'],
  TODAY_TASKS: ['what are my tasks', 'tasks today', 'what do i have today', 'my schedule', 'list tasks', 'list my tasks', 'show tasks'],
  GREETING: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'wassup'],
  HELP: ['help', 'what can you do', 'commands', 'options', 'assist'],
};

/**
 * Detects the intent from a message string
 */
export function detectIntent(message) {
  const lower = message.toLowerCase().trim();

  if (INTENTS.GREETING.some(k => lower.includes(k))) return 'GREETING';
  if (INTENTS.HELP.some(k => lower.includes(k))) return 'HELP';
  if (INTENTS.TIRED.some(k => lower.includes(k))) return 'TIRED';
  if (INTENTS.FREE_TIME.some(k => lower.includes(k))) return 'FREE_TIME';
  if (INTENTS.WORKOUT.some(k => lower.includes(k))) return 'WORKOUT';
  if (INTENTS.TRAVEL.some(k => lower.includes(k))) return 'TRAVEL';
  if (INTENTS.MEETING.some(k => lower.includes(k))) return 'MEETING';
  if (INTENTS.URGENT.some(k => lower.includes(k))) return 'URGENT';
  if (INTENTS.TODAY_TASKS.some(k => lower.includes(k))) return 'TODAY_TASKS';

  return 'UNKNOWN';
}

/**
 * Extracts a location/place name from message (for weather lookups)
 */
export function extractLocation(message) {
  const lower = message.toLowerCase();
  const locations = [
    'sigiriya', 'kandy', 'galle', 'colombo', 'nuwara eliya', 'ella', 'hikkaduwa',
    'mirissa', 'arugam bay', 'trincomalee', 'jaffna', 'anuradhapura', 'polonnaruwa',
    'dambulla', 'london', 'dubai', 'singapore', 'bangkok', 'paris', 'new york',
  ];
  for (const loc of locations) {
    if (lower.includes(loc)) return loc.charAt(0).toUpperCase() + loc.slice(1);
  }

  // Generic pattern: "go to X" or "travel to X" or "visit X"
  const match = lower.match(/(?:go to|travel to|visit|trip to)\s+([a-z\s]+?)(?:\s|$|[?!.])/i);
  if (match && match[1]) {
    const loc = match[1].trim();
    return loc.charAt(0).toUpperCase() + loc.slice(1);
  }

  return null;
}

/**
 * Gets today's tasks for a given priority filter
 */
export function getTodayTasksByPriority(tasks, priorities = ['P1', 'P2', 'P3', 'P4']) {
  return tasks.filter(t =>
    !t.completed &&
    (t.dueDate === 'TODAY' || t.dueDate === new Date().toISOString().split('T')[0]) &&
    priorities.includes(t.priority)
  );
}

/**
 * Gets tomorrow's date string in ISO format
 */
export function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Generates today's greeting message
 */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning! ☀️';
  if (h < 17) return 'Good afternoon! 🌤️';
  return 'Good evening! 🌙';
}

/**
 * Calculates free time slots based on scheduled task start and end times.
 * Standard active day is 08:00 AM to 08:00 PM.
 */
function calculateFreeTimeSlots(todayTasks) {
  const timedTasks = todayTasks
    .filter(t => t.startTime && t.endTime)
    .map(t => {
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = t.endTime.split(':').map(Number);
      return {
        title: t.title,
        startMin: sh * 60 + sm,
        endMin: eh * 60 + em,
        startStr: t.startTime,
        endStr: t.endTime
      };
    })
    .sort((a, b) => a.startMin - b.startMin);

  const dayStart = 8 * 60; // 08:00
  const dayEnd = 20 * 60;  // 20:00

  const freeSlots = [];
  let currentMin = dayStart;

  for (const task of timedTasks) {
    if (task.startMin > currentMin) {
      freeSlots.push({
        start: minutesToTimeStr(currentMin),
        end: minutesToTimeStr(task.startMin)
      });
    }
    currentMin = Math.max(currentMin, task.endMin);
  }

  if (dayEnd > currentMin) {
    freeSlots.push({
      start: minutesToTimeStr(currentMin),
      end: minutesToTimeStr(dayEnd)
    });
  }

  return { freeSlots, timedTasks };
}

function minutesToTimeStr(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Builds an AI response object based on detected intent
 * @returns {{ text: string, action: string|null, taskList: Array|null, requiresConfirmation: boolean, confirmAction: string|null, location: string|null }}
 */
export function buildAiResponse(intent, message, tasks, weatherCache = {}) {
  const urgentTasks = getTodayTasksByPriority(tasks, ['P1', 'P2']);
  const normalTasks = getTodayTasksByPriority(tasks, ['P3', 'P4']);
  const allTodayTasks = getTodayTasksByPriority(tasks, ['P1', 'P2', 'P3', 'P4']);
  const meetingTasks = tasks.filter(t => !t.completed && t.meeting && (t.dueDate === 'TODAY' || t.dueDate === new Date().toISOString().split('T')[0]));

  switch (intent) {
    case 'GREETING':
      return {
        text: `${getGreeting()} I'm your AI Task Assistant 🤖\n\nI can help you:\n• Manage tasks when you're tired\n• Check if you have free time today\n• Check weather for your travel or workout plans\n• Reschedule meetings and notify members\n\nWhat would you like to do today?`,
        action: null,
        taskList: null,
        requiresConfirmation: false,
      };

    case 'HELP':
      return {
        text: `Here's what I can do for you 🛠️\n\n💤 "I'm tired today" — Add a meditation task + reschedule normal tasks\n⚽ "Can I watch football?" — Check your schedule + free up time\n✈️ "Travel to Sigiriya?" — Check weather + give travel advice\n💪 "Can I workout tomorrow?" — Check tomorrow's weather\n📅 "Reschedule my meetings" — Move meetings + email members\n🚨 "Show urgent tasks" — List high priority tasks`,
        action: null,
        taskList: null,
        requiresConfirmation: false,
      };

    case 'TIRED': {
      const lines = [];
      lines.push(`Oh no! 😔 Taking care of yourself is a priority. Here's what I'll do:\n`);
      lines.push(`✅ **Adding a Meditation task** to your today list`);

      if (urgentTasks.length > 0) {
        lines.push(`\n🚨 You have **${urgentTasks.length} urgent task(s)** that must stay today:`);
        urgentTasks.slice(0, 3).forEach(t => lines.push(`  • ${t.title}`));
      }

      if (normalTasks.length > 0) {
        lines.push(`\n📋 I can reschedule these **${normalTasks.length} normal task(s)** to tomorrow:`);
        normalTasks.slice(0, 4).forEach(t => lines.push(`  • ${t.title}`));
        lines.push(`\nShall I move these to tomorrow? ✊`);
        return {
          text: lines.join('\n'),
          action: 'ADD_MEDITATION',
          taskList: normalTasks,
          requiresConfirmation: true,
          confirmAction: 'RESCHEDULE_NORMAL_TASKS',
          meetingTasks,
        };
      }

      lines.push(`\n🎉 No normal tasks to reschedule. Go rest well — you deserve it!`);
      return {
        text: lines.join('\n'),
        action: 'ADD_MEDITATION',
        taskList: null,
        requiresConfirmation: false,
        meetingTasks,
      };
    }

    case 'FREE_TIME': {
      const lines = [];
      if (allTodayTasks.length === 0) {
        lines.push(`🎉 Great news! You have **no tasks** due today. You're totally free!\n\nEnjoy your football match / time off! ⚽🏆`);
        return { text: lines.join('\n'), action: null, taskList: null, requiresConfirmation: false };
      }

      const { freeSlots, timedTasks } = calculateFreeTimeSlots(allTodayTasks);
      const untimedTasks = allTodayTasks.filter(t => !t.startTime || !t.endTime);

      lines.push(`Let me check your today's schedule 🕒\n`);

      if (timedTasks.length > 0) {
        lines.push(`📅 **Scheduled tasks today:**`);
        timedTasks.forEach(t => lines.push(`  • **${t.startStr} - ${t.endStr}**: ${t.title}`));
        lines.push('');
      }

      if (freeSlots.length > 0) {
        lines.push(`🟢 **Your free time slots today (between 08:00 AM - 08:00 PM):**`);
        freeSlots.forEach(s => lines.push(`  • **${s.start} - ${s.end}**`));
      } else {
        lines.push(`⚠️ Your schedule is fully packed today! No major free slots found between 08:00 AM and 08:00 PM.`);
      }

      if (untimedTasks.length > 0) {
        lines.push(`\n📋 **Other tasks today (not scheduled at a specific time):**`);
        untimedTasks.forEach(t => lines.push(`  • ${t.title} [${t.priority}]`));
      }

      if (normalTasks.length > 0) {
        lines.push(`\nShall I reschedule these **${normalTasks.length} normal task(s)** to tomorrow to free up more time? 🙌`);
        return {
          text: lines.join('\n'),
          action: null,
          taskList: normalTasks,
          requiresConfirmation: true,
          confirmAction: 'RESCHEDULE_NORMAL_TASKS',
        };
      }

      return { text: lines.join('\n'), action: null, taskList: null, requiresConfirmation: false };
    }

    case 'TODAY_TASKS': {
      if (allTodayTasks.length === 0) {
        return {
          text: `🎉 You have **no tasks** scheduled for today. Your day is completely clear!`,
          action: null,
          taskList: null,
          requiresConfirmation: false
        };
      }

      const lines = [`📋 Here is your schedule for today:\n`];
      const { timedTasks } = calculateFreeTimeSlots(allTodayTasks);
      const untimedTasks = allTodayTasks.filter(t => !t.startTime || !t.endTime);

      if (timedTasks.length > 0) {
        lines.push(`🕒 **Scheduled Tasks:**`);
        timedTasks.forEach(t => lines.push(`  • **${t.startStr} - ${t.endStr}**: ${t.title}`));
        lines.push('');
      }

      if (untimedTasks.length > 0) {
        lines.push(`⏳ **Other Tasks:**`);
        untimedTasks.forEach(t => lines.push(`  • ${t.title} [${t.priority}]`));
      }

      return {
        text: lines.join('\n'),
        action: null,
        taskList: null,
        requiresConfirmation: false
      };
    }

    case 'TRAVEL':
    case 'WORKOUT': {
      const location = extractLocation(message);
      const targetLocation = location || (intent === 'WORKOUT' ? 'your area' : 'the destination');
      return {
        text: `🌍 Let me check the weather for **${targetLocation}**...\n\nFetching forecast data now ⏳`,
        action: 'FETCH_WEATHER',
        location: location,
        taskList: null,
        requiresConfirmation: false,
      };
    }

    case 'MEETING': {
      if (meetingTasks.length === 0) {
        return {
          text: `📅 I couldn't find any meetings scheduled for today.\n\nYou can add a meeting by creating a task and clicking the **Meeting** button in the task creator. I'll handle rescheduling + email notifications for you! 📧`,
          action: null,
          taskList: null,
          requiresConfirmation: false,
        };
      }
      const lines = [`📅 I found **${meetingTasks.length} meeting(s)** today that I can reschedule:\n`];
      meetingTasks.forEach(t => {
        const members = t.meeting?.members?.join(', ') || 'No members listed';
        lines.push(`  • **${t.title}** → Members: ${members}`);
      });
      lines.push(`\nShall I move all meetings to tomorrow and send email notifications to the members? 📧`);
      return {
        text: lines.join('\n'),
        action: null,
        taskList: meetingTasks,
        requiresConfirmation: true,
        confirmAction: 'RESCHEDULE_MEETINGS',
      };
    }

    case 'URGENT': {
      if (urgentTasks.length === 0) {
        return {
          text: `✅ Great news! You have **no urgent tasks** right now.\n\nAll your high-priority items are cleared! You're doing amazing 🌟`,
          action: null,
          taskList: null,
          requiresConfirmation: false,
        };
      }
      const lines = [`🚨 Here are your **${urgentTasks.length} urgent task(s)** for today:\n`];
      urgentTasks.forEach((t, i) => {
        lines.push(`${i + 1}. **${t.title}** [${t.priority}]${t.description ? `\n   ↳ ${t.description}` : ''}`);
      });
      lines.push(`\n⚡ Focus on these first before anything else!`);
      return {
        text: lines.join('\n'),
        action: null,
        taskList: urgentTasks,
        requiresConfirmation: false,
      };
    }

    default:
      return {
        text: `I'm not quite sure what you mean 🤔\n\nTry one of these:\n• "I'm tired today"\n• "Can I watch football today?"\n• "Can I travel to Sigiriya tomorrow?"\n• "Reschedule my meetings"\n• "Show urgent tasks"\n• Type "help" to see all options`,
        action: null,
        taskList: null,
        requiresConfirmation: false,
      };
  }
}
