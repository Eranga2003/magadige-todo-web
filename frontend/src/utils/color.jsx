import React from 'react';

// Centralized Color Design System Tokens (Tailwind utility classes - Purple/Blue Theme)
export const themeColors = {
  primary: {
    // Brand base color (Solid Purple)
    base: 'bg-purple-600',
    // Premium theme mix gradient (Purple to Blue)
    gradient: 'bg-gradient-to-r from-purple-600 to-blue-600',
    // Actions & Hovers
    hover: 'hover:bg-purple-700',
    hoverGradient: 'hover:from-purple-700 hover:to-blue-700',
    border: 'border-purple-600',
    borderHover: 'hover:border-purple-700',
    borderLight: 'border-purple-200',
    // Text accents
    text: 'text-purple-600',
    textDark: 'text-purple-700',
    textHover: 'hover:text-purple-500',
    // Highlight backgrounds
    bgLight: 'bg-purple-50',
    bgLightHover: 'hover:bg-purple-50',
    bgLightSelected: 'bg-purple-50/20',
    // Inputs & focus states
    ring: 'focus:ring-purple-500',
    ringBorder: 'focus:border-purple-500',
    ringText: 'text-purple-600',
    shadow: 'shadow-purple-200',
    accentText: 'text-purple-600',
    hoverBorder: 'hover:border-purple-500',
    disabledBg: 'disabled:bg-purple-300',
    disabledBorder: 'disabled:border-purple-300',
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
    borderInputFocus: 'focus:border-purple-500',
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
};

/**
 * Retrieves color class strings from the centralized themeColors configuration by dot-separated path.
 * e.g., getColor('primary.base') => 'bg-purple-600'
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
