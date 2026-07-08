import React from 'react';

// Centralized Color Design System Tokens (Tailwind utility classes - Modern Premium SaaS Blue Theme)
export const themeColors = {
  primary: {
    // Brand base color (Solid Royal Blue)
    base: 'bg-blue-600',
    // Premium SaaS gradient (Royal Blue -> Indigo -> Sky Blue)
    gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500',
    // Actions & Hovers
    hover: 'hover:bg-blue-700',
    hoverGradient: 'hover:from-blue-700 hover:via-indigo-700 hover:to-sky-600',
    border: 'border-blue-600',
    borderHover: 'hover:border-blue-700',
    borderLight: 'border-blue-100',
    // Text accents
    text: 'text-blue-600',
    textDark: 'text-blue-700',
    textHover: 'hover:text-blue-500',
    // Highlight backgrounds (Soft Ice Blue)
    bgLight: 'bg-blue-50/50',
    bgLightHover: 'hover:bg-blue-50',
    bgLightSelected: 'bg-blue-50/30',
    // Inputs & focus states
    ring: 'focus:ring-blue-500',
    ringBorder: 'focus:border-blue-500',
    ringText: 'text-blue-600',
    shadow: 'shadow-blue-100',
    accentText: 'text-blue-600',
    hoverBorder: 'hover:border-blue-500',
    disabledBg: 'disabled:bg-blue-300',
    disabledBorder: 'disabled:border-blue-300',
  },
  secondary: {
    base: 'bg-white',
    hover: 'hover:bg-gray-50',
    border: 'border-black',
    borderLight: 'border-gray-200',
    text: 'text-black',
    disabledBg: 'disabled:bg-gray-100',
    disabledBorder: 'disabled:border-gray-300',
    disabledText: 'disabled:text-gray-400',
  },
  neutral: {
    bgApp: 'bg-gray-50',
    bgCard: 'bg-white',
    borderCard: 'border-gray-100',
    borderInput: 'border-gray-200',
    borderInputFocus: 'focus:border-blue-600',
    textTitle: 'text-black',
    textSubtitle: 'text-gray-500',
    textBody: 'text-gray-600',
    textLabel: 'text-gray-900',
    placeholder: 'placeholder:text-gray-400',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    borderBase: 'border-red-500',
    borderFocus: 'focus:border-red-600',
    text: 'text-red-700',
    textBase: 'text-red-500',
    dot: 'bg-red-600',
    ring: 'focus:ring-red-600',
  },
  taskColors: {
    pink: {
      bg: 'bg-pink-500 border-pink-600',
      text: 'text-white',
      checkboxBorder: 'border-white/80',
      dot: 'bg-white',
      card: 'bg-gradient-to-br from-pink-500 to-rose-600 border-rose-600 text-white shadow-md shadow-rose-200/40',
      muted: 'text-rose-100',
      badge: 'bg-white/20 text-white',
      status: 'bg-white/25 text-white',
    },
    green: {
      bg: 'bg-emerald-600 border-emerald-700',
      text: 'text-white',
      checkboxBorder: 'border-white/80',
      dot: 'bg-white',
      card: 'bg-gradient-to-br from-emerald-500 to-teal-600 border-teal-600 text-white shadow-md shadow-emerald-200/40',
      muted: 'text-emerald-100',
      badge: 'bg-white/20 text-white',
      status: 'bg-white/25 text-white',
    },
    yellow: {
      bg: 'bg-amber-500 border-amber-600',
      text: 'text-white',
      checkboxBorder: 'border-white/80',
      dot: 'bg-white',
      card: 'bg-gradient-to-br from-amber-400 to-orange-500 border-orange-500 text-white shadow-md shadow-amber-200/40',
      muted: 'text-amber-100',
      badge: 'bg-white/20 text-white',
      status: 'bg-white/25 text-white',
    },
    blue: {
      bg: 'bg-blue-600 border-blue-700',
      text: 'text-white',
      checkboxBorder: 'border-white/80',
      dot: 'bg-white',
      card: 'bg-gradient-to-br from-blue-500 to-indigo-600 border-indigo-600 text-white shadow-md shadow-blue-200/40',
      muted: 'text-blue-100',
      badge: 'bg-white/20 text-white',
      status: 'bg-white/25 text-white',
    }
  },

  // ── Win Me Goal Mapper node card tokens ───────────────
  winMe: {
    milestone: {
      // Normal card background gradient (blue)
      cardBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      // On hover → darker blue
      cardHover: 'hover:from-blue-700 hover:to-blue-800',
      border: 'border-blue-400/40',
      borderHover: 'hover:border-blue-300',
      shadow: 'shadow-[0_10px_25px_rgba(37,99,235,0.16)]',
      shadowHover: 'hover:shadow-[0_16px_35px_rgba(37,99,235,0.32)]',
      badge: 'bg-blue-800/60 text-blue-50 border border-blue-400/30',
      editBtn: 'hover:bg-blue-800/50 text-blue-100 hover:text-white',
      deleteBtn: 'hover:bg-blue-900/60 text-blue-100 hover:text-white',
      title: 'text-white',
      desc: 'text-blue-100/90',
      files: 'text-blue-200',
      port: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400',
      // SVG gradient stops
      lineFrom: '#1e3a8a',
      lineTo: '#1d4ed8',
      lineGlow: '#dbeafe',
      particleFill: '#1d4ed8',
    },
    goalNode: {
      // Goal card background (gold/amber)
      cardBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
      // On hover → dark blue (as requested)
      cardHover: 'hover:from-blue-700 hover:to-blue-900',
      border: 'border-yellow-300',
      borderHover: 'hover:border-blue-300',
      shadow: 'shadow-[0_12px_30px_rgba(234,179,8,0.25)]',
      shadowHover: 'hover:shadow-[0_18px_40px_rgba(37,99,235,0.35)]',
      badge: 'bg-amber-600 text-amber-50',
      editBtn: 'hover:bg-amber-600 text-white',
      deleteBtn: 'hover:bg-amber-600 text-white',
      title: 'text-white',
      desc: 'text-amber-100 font-medium',
      files: 'text-amber-100',
      port: 'bg-amber-500 border-amber-300 text-white hover:bg-amber-600',
      // SVG gradient stops
      lineFrom: '#eab308',
      lineTo: '#fbbf24',
      lineGlow: '#fef3c7',
      particleFill: '#d97706',
    },
  },

  // ── Productivity Dashboard Theme Colors ────────────────
  productivity: {
    todayTasks: {
      from: 'from-blue-500',
      to: 'to-indigo-600',
      iconBg: 'bg-white/20'
    },
    totalCompleted: {
      from: 'from-emerald-500',
      to: 'to-teal-600',
      iconBg: 'bg-white/20'
    },
    highPriority: {
      from: 'from-rose-500',
      to: 'to-pink-600',
      iconBg: 'bg-white/20'
    },
    completionRate: {
      from: 'from-violet-500',
      to: 'to-purple-600',
      iconBg: 'bg-white/20'
    },
    chart: {
      assignedBg: 'bg-blue-50',
      assignedBar: 'from-blue-500 to-indigo-600',
      completedBar: 'from-emerald-400 to-teal-500',
      todayText: 'text-blue-600',
      todayIndicator: 'ring-blue-500'
    },
    rings: {
      todayDone: '#4f46e5',
      todayBg: '#e0e7ff',
      allTimeDone: '#10b981',
      allTimeBg: '#d1fae5'
    },
    priorities: {
      P1: { bar: 'from-red-500 to-rose-600', hex: '#ef4444', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Critical' },
      P2: { bar: 'from-orange-500 to-amber-500', hex: '#f97316', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: 'High' },
      P3: { bar: 'from-blue-500 to-indigo-600', hex: '#3b82f6', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Normal' },
      P4: { bar: 'from-slate-400 to-slate-500', hex: '#94a3b8', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Low' }
    },
    workspace: {
      high: { badge: 'bg-emerald-50 text-emerald-600', bar: 'from-emerald-400 to-teal-500' },
      medium: { badge: 'bg-amber-50 text-amber-600', bar: 'from-amber-400 to-orange-500' },
      low: { badge: 'bg-slate-100 text-slate-500', bar: 'from-blue-500 to-indigo-600' }
    },
    achievement: {
      cardBg: 'from-blue-600 to-indigo-700',
      accentText: 'text-yellow-300'
    }
  },
}

/**
 * Retrieves color class strings from the centralized themeColors configuration by dot-separated path.
 * e.g., getColor('primary.base') => 'bg-blue-600'
 */
export function getColor(path) {
  const keys = path.split('.');
  let current = themeColors;
  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`⚠️ Color path "${path}" not found in color.jsx configuration.`);
      return '';
    }
    current = current[key];
  }
  return current;
}
