import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getColor } from '../utils/color';

export const Input = ({
  label,
  error,
  icon,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full mb-4">
      <label htmlFor={inputId} className={`block text-sm font-semibold ${getColor('neutral.textLabel')} mb-1.5 transition-all`}>
        {label}
      </label>
      <div className="relative flex items-center rounded-lg shadow-sm">
        {icon && (
          <div className={`absolute left-3.5 ${getColor('primary.accentText')} flex items-center justify-center`}>
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={currentType}
          className={`w-full bg-white text-black font-medium border-2 rounded-lg py-3 px-4 ${
            icon ? 'pl-11' : 'pl-4'
          } ${isPassword ? 'pr-11' : 'pr-4'} ${
            error
              ? `${getColor('danger.borderBase')} focus:outline-none ${getColor('danger.borderFocus')} focus:ring-1 ${getColor('danger.ring')}`
              : `${getColor('neutral.borderInput')} focus:outline-none ${getColor('neutral.borderInputFocus')} focus:ring-1 ${getColor('primary.ring')}`
          } transition-all duration-200 text-base ${getColor('neutral.placeholder')}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3.5 text-gray-500 ${getColor('primary.textHover')} focus:outline-none transition-colors`}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className={`mt-1 text-sm font-medium ${getColor('danger.textBase')}`}>{error}</p>}
    </div>
  );
};
