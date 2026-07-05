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
      bg: 'bg-pink-50/75 border-pink-200/80',
      text: 'text-pink-700',
      checkboxBorder: 'border-pink-400',
      dot: 'bg-pink-500',
    },
    green: {
      bg: 'bg-emerald-50/75 border-emerald-200/80',
      text: 'text-emerald-700',
      checkboxBorder: 'border-emerald-400',
      dot: 'bg-emerald-500',
    },
    yellow: {
      bg: 'bg-amber-50/75 border-amber-200/80',
      text: 'text-amber-700',
      checkboxBorder: 'border-amber-400',
      dot: 'bg-amber-500',
    },
    blue: {
      bg: 'bg-blue-50/75 border-blue-200/80',
      text: 'text-blue-700',
      checkboxBorder: 'border-blue-400',
      dot: 'bg-blue-500',
    }
  }
};

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
