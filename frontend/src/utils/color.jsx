import React from 'react';

// Centralized Color Design System Tokens (Tailwind utility classes - Dark Blue/Light Blue Theme)
export const themeColors = {
  primary: {
    // Brand base color (Solid Dark Blue)
    base: 'bg-blue-700',
    // Premium theme mix gradient (Dark Blue to Light Sky Blue)
    gradient: 'bg-gradient-to-r from-blue-800 to-sky-500',
    // Actions & Hovers
    hover: 'hover:bg-blue-800',
    hoverGradient: 'hover:from-blue-900 hover:to-sky-600',
    border: 'border-blue-700',
    borderHover: 'hover:border-blue-800',
    borderLight: 'border-blue-200',
    // Text accents
    text: 'text-blue-700',
    textDark: 'text-blue-800',
    textHover: 'hover:text-blue-600',
    // Highlight backgrounds
    bgLight: 'bg-blue-50',
    bgLightHover: 'hover:bg-blue-50',
    bgLightSelected: 'bg-blue-50/20',
    // Inputs & focus states
    ring: 'focus:ring-blue-600',
    ringBorder: 'focus:border-blue-600',
    ringText: 'text-blue-700',
    shadow: 'shadow-blue-200',
    accentText: 'text-blue-700',
    hoverBorder: 'hover:border-blue-600',
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
    borderInputFocus: 'focus:border-blue-700',
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
 * e.g., getColor('primary.base') => 'bg-blue-700'
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
