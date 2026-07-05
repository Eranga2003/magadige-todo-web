import React, { useState } from 'react';
import { 
  Calendar, 
  Sun, 
  Armchair, 
  Ban, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Repeat, 
  Check 
} from 'lucide-react';
import { getColor } from '../utils/color';

export const MiniCalendarPicker = ({ value, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeVal, setTimeVal] = useState('09:00');

  // Days of the week headers
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Months labels
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Days of week short names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper: Get label for Today's day name
  const getTodayDayName = () => {
    return dayNames[new Date().getDay()];
  };

  // Helper: Get label for Tomorrow's day name
  const getTomorrowDayName = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dayNames[tomorrow.getDay()];
  };

  // Helper: Get next Saturday date and formatted label
  const getNextWeekendDetails = () => {
    const d = new Date();
    // Find next Saturday (6)
    const resultDate = new Date(d);
    resultDate.setDate(d.getDate() + ((6 + 7 - d.getDay()) % 7 || 7));
    
    const formatted = `${resultDate.getDate()} ${monthLabels[resultDate.getMonth()]}`;
    return {
      dayName: `Sat ${formatted}`,
      value: `Sat ${formatted}`
    };
  };

  // Format Date object to "D MMM" (e.g. "4 Jul")
  const formatDateToLabel = (date) => {
    return `${date.getDate()} ${monthLabels[date.getMonth()]}`;
  };

  // Handle Quick Date Selection
  const handleQuickSelect = (type) => {
    if (type === 'TODAY') {
      onChange('TODAY');
    } else if (type === 'TOMORROW') {
      onChange('TOMORROW');
    } else if (type === 'UPCOMING') {
      onChange('UPCOMING');
    } else if (type === 'NONE') {
      onChange('NONE');
    }
    if (onClose) onClose();
  };

  // Month navigation
  const prevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar builder helper
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const numDays = new Date(year, month + 1, 0).getDate();
  // Get starting weekday (0 = Sun, 1 = Mon...)
  let startDay = new Date(year, month, 1).getDay();
  // Adjust starting day so Monday is index 0 and Sunday is index 6
  startDay = startDay === 0 ? 6 : startDay - 1;

  const daysGrid = [];
  // Fill offset days
  for (let i = 0; i < startDay; i++) {
    daysGrid.push(null);
  }
  // Fill calendar days
  for (let i = 1; i <= numDays; i++) {
    daysGrid.push(new Date(year, month, i));
  }

  // Check if a grid date matches the current selected value
  const isSelectedGridDay = (date) => {
    if (!date || !value) return false;
    if (value === 'TODAY') {
      const today = new Date();
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }
    if (value === 'TOMORROW') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
    }
    
    // Check direct formatted label matches (e.g. "4 Jul" or "Sat 11 Jul")
    const label = formatDateToLabel(date);
    return value.includes(label);
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const formatted = formatDateToLabel(date);
    onChange(formatted);
    if (onClose) onClose();
  };

  // Display label helper
  const getDisplayValue = () => {
    if (!value || value === 'NONE') return 'No Date';
    if (value === 'TODAY') return 'Today';
    if (value === 'TOMORROW') return 'Tomorrow';
    if (value === 'UPCOMING') return 'Next weekend';
    return value;
  };

  // Check if a day is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 mt-1 w-64 bg-white border border-gray-150 rounded-2xl shadow-xl py-3 px-3.5 z-50 animate-scale-up text-left select-none space-y-2.5 font-sans"
    >
      {/* 1. Header input display */}
      <div className="pb-2 border-b border-gray-50 flex items-center justify-between">
        <span className="text-[10px] font-extrabold bg-blue-600 text-white rounded px-2 py-0.5 shadow-sm">
          {getDisplayValue()}
        </span>
        {showTimePicker && (
          <input 
            type="time"
            value={timeVal}
            onChange={(e) => {
              setTimeVal(e.target.value);
              // Append time info
              const cleanVal = getDisplayValue();
              onChange(`${cleanVal} @ ${e.target.value}`);
            }}
            className="text-[10px] font-bold border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
        )}
      </div>

      {/* 2. Quick selectors */}
      <div className="space-y-1 text-xs">
        <button
          type="button"
          onClick={() => handleQuickSelect('TODAY')}
          className="w-full flex items-center justify-between p-1.5 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Calendar size={13} className="text-green-600" />
            <span>Today</span>
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{getTodayDayName()}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect('TOMORROW')}
          className="w-full flex items-center justify-between p-1.5 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Sun size={13} className="text-amber-500" />
            <span>Tomorrow</span>
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{getTomorrowDayName()}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect('UPCOMING')}
          className="w-full flex items-center justify-between p-1.5 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Armchair size={13} className="text-blue-500" />
            <span>Next weekend</span>
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{getNextWeekendDetails().dayName}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect('NONE')}
          className="w-full flex items-center justify-between p-1.5 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Ban size={13} className="text-gray-400" />
            <span>No Date</span>
          </span>
        </button>
      </div>

      <div className="border-t border-gray-50 my-1"></div>

      {/* 3. Monthly Calendar grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold text-gray-700">
            {monthLabels[month]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer focus:outline-none"
            >
              <ChevronLeft size={13} />
            </button>
            <button 
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer focus:outline-none"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Days of week titles */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {weekDays.map((wd, i) => (
            <span key={i} className="text-[9px] font-extrabold text-gray-400 uppercase">
              {wd}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
          {daysGrid.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} />;
            
            const isSelected = isSelectedGridDay(date);
            const isTdy = isToday(date);
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(date)}
                className={`w-6 h-6 mx-auto text-[10px] font-bold rounded-lg flex items-center justify-center cursor-pointer transition-all focus:outline-none ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-sm font-extrabold' 
                    : isTdy
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-50 my-1"></div>

      {/* 4. Bottom Controls */}
      <div className="space-y-1 text-xs pt-0.5">
        <button
          type="button"
          onClick={() => setShowTimePicker(!showTimePicker)}
          className="w-full flex items-center gap-2 p-1.5 rounded-lg border border-gray-150 text-gray-700 hover:bg-gray-50 font-bold transition-all cursor-pointer justify-center focus:outline-none"
        >
          <Clock size={12} className="text-gray-450" />
          <span>Time</span>
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-2 p-1.5 rounded-lg border border-gray-150 text-gray-700 hover:bg-gray-50 font-bold transition-all cursor-pointer justify-center focus:outline-none"
        >
          <Repeat size={12} className="text-gray-450" />
          <span>Repeat</span>
        </button>
      </div>
    </div>
  );
};
