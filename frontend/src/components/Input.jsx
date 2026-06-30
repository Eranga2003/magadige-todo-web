import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
      <label htmlFor={inputId} className="block text-sm font-semibold text-black mb-1.5 transition-all">
        {label}
      </label>
      <div className="relative flex items-center rounded-lg shadow-sm">
        {icon && (
          <div className="absolute left-3.5 text-orange-600 flex items-center justify-center">
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
              ? 'border-red-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600'
              : 'border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
          } transition-all duration-200 text-base placeholder:text-gray-400`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-gray-500 hover:text-orange-600 focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
};
