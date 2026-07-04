import React from 'react';

// Centralized Color Design System Tokens (Tailwind utility classes)
export const themeColors = {
  primary: {
    // Brand base color (Orange theme)
    base: 'bg-orange-500',
    hover: 'hover:bg-orange-600',
    border: 'border-orange-500',
    borderHover: 'hover:border-orange-600',
    borderLight: 'border-orange-200',
    text: 'text-orange-500',
    textDark: 'text-orange-600',
    textHover: 'hover:text-orange-500',
    bgLight: 'bg-orange-50',
    bgLightHover: 'hover:bg-orange-50',
    bgLightSelected: 'bg-orange-50/20',
    ring: 'focus:ring-orange-500',
    ringBorder: 'focus:border-orange-500',
    ringText: 'text-orange-600',
    shadow: 'shadow-orange-200',
    accentText: 'text-orange-600',
    hoverBorder: 'hover:border-orange-500',
    disabledBg: 'disabled:bg-orange-300',
    disabledBorder: 'disabled:border-orange-300',
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
    borderInputFocus: 'focus:border-orange-500',
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
 * e.g., getColor('primary.base') => 'bg-orange-500'
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
