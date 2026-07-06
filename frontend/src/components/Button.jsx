import React from 'react';
import { getColor } from '../utils/color';

export const Button = ({
  children,
  variant = 'primary',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'w-full flex items-center justify-center gap-2 py-3.5 px-6 font-bold rounded-xl transition-all duration-300 transform select-none cursor-pointer text-base shadow-sm border-2';
  
  const variants = {
    primary: `${getColor('primary.gradient')} ${getColor('primary.border')} text-white ${getColor('primary.hoverGradient')} ${getColor('primary.borderHover')} hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 ${getColor('primary.disabledBg')} ${getColor('primary.disabledBorder')} disabled:cursor-not-allowed`,
    secondary: `${getColor('secondary.base')} ${getColor('secondary.border')} ${getColor('secondary.text')} ${getColor('secondary.hover')} hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 ${getColor('secondary.disabledBg')} ${getColor('secondary.disabledBorder')} ${getColor('secondary.disabledText')}`,
    outline: `bg-transparent ${getColor('primary.border')} ${getColor('primary.text')} ${getColor('primary.bgLight')} hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50`,
    social: `${getColor('secondary.base')} ${getColor('secondary.borderLight')} ${getColor('secondary.text')} ${getColor('primary.hoverBorder')} hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50`,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {icon && <span className="flex items-center justify-center">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
