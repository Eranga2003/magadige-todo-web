import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Search, 
  Wind, 
  Droplets, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Compass, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { weatherService } from '../../services/api';
import { getColor } from '../../utils/color';
import { analyzeTaskWeather } from '../../utils/weatherService';

export const WeatherAssistantPage = ({ tasks }) => {
  const [city, setCity] = useState('Colombo');
  const [searchVal, setSearchVal] = useState('Colombo');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchWeather = async (targetCity) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await weatherService.getWeatherForecast(targetCity);
      if (res && res.data) {
        setWeatherData(res.data);
        setCity(res.data.city);
      }
    } catch (err) {
      console.error('❌ Failed to fetch weather forecast:', err.message);
      setErrorMsg(err.message || 'Failed to retrieve weather data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      fetchWeather(searchVal.trim());
    }
  };

  // Helper to map weather status to dynamic icons
  const getWeatherIcon = (status, size = 24) => {
    switch (status) {
      case 'SUNNY':
        return <Sun size={size} className="text-amber-500 animate-spin-slow" />;
      case 'RAINY':
        return <CloudRain size={size} className="text-blue-500" />;
      case 'WINDY':
        return <Wind size={size} className="text-slate-400" />;
      case 'CLOUDY':
        return <Cloud size={size} className="text-slate-500" />;
      case 'STORMY':
        return <CloudLightning size={size} className="text-indigo-600" />;
      default:
        return <CloudSun size={size} className="text-gray-400" />;
    }
  };

  // Helper to resolve CSS animation class based on weather status
  const getWeatherAnimationClass = (status) => {
    switch (status) {
      case 'SUNNY':
        return 'weather-sun-anim';
      case 'RAINY':
        return 'weather-rain-anim';
      case 'WINDY':
        return 'weather-wind-anim';
      case 'CLOUDY':
        return 'weather-cloud-anim';
      case 'STORMY':
        return 'weather-storm-anim';
      default:
        return '';
    }
  };

  // Helper to format date string to "Today" / "Tomorrow" or weekday
  const formatDayHeader = (index, dayName) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return dayName;
  };

  // Filter today's tasks
  const getTodayTasks = () => {
    const todayStr = new Date().toISOString().split(' ')[0]; // E.g. "2026-07-07"
    return tasks.filter(t => {
      // Handle standard task date representation matching today
      if (!t.dueDate) return false;
      if (t.dueDate === 'TODAY') return true;
      if (t.dueDate.includes(todayStr)) return true;
      
      // Attempt date matching
      const taskDate = new Date(t.dueDate).toISOString().split(' ')[0];
      return taskDate === todayStr;
    });
  };

  const todayTasks = getTodayTasks();
  const todayWeatherStatus = weatherData?.weekly?.[0]?.status || 'SUNNY';
  const todayTemp = weatherData?.weekly?.[0]?.temp || 25;

  // Analyze today's tasks for weather warnings
  const affectedTasks = todayTasks
    .map(task => {
      const analysis = analyzeTaskWeather(task.title, todayWeatherStatus, todayTemp);
      return {
        ...task,
        isAffected: analysis.isAffected,
        reason: analysis.reason,
        suggestion: analysis.suggestion,
      };
    })
    .filter(t => t.isAffected);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6 select-none font-sans">
      
      {/* HEADER WITH SEARCH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <CloudSun size={24} className="text-blue-600" />
            Weather Assistant
          </h1>
          <p className="text-xs text-gray-500 font-bold mt-1">
            Check live forecasts and view how weather conditions affect your daily workflow.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Search city (e.g. Colombo)..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-56 pl-3.5 pr-10 py-2 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white placeholder:text-gray-400 font-bold outline-none shadow-sm transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
          >
            <Search size={14} />
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Syncing live forecasts...</span>
        </div>
      ) : errorMsg ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-md mx-auto space-y-3">
          <AlertTriangle className="text-red-500 mx-auto" size={32} />
          <h3 className="text-sm font-extrabold text-red-800">Connection Error</h3>
          <p className="text-xs text-red-600 font-bold leading-normal">{errorMsg}</p>
          <button
            onClick={() => fetchWeather(city)}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer focus:outline-none"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TOP LAYOUT: TODAY OVERVIEW + HOUR BY HOUR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Today Main Weather Card */}
            <div className={`lg:col-span-1 bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden ${getWeatherAnimationClass(todayWeatherStatus)}`}>
              <div className="z-10">
                <span className="text-xxs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Update
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-2 truncate">
                  {weatherData.city}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                  {weatherData.country || 'Forecast'}
                </p>
              </div>

              <div className="flex items-center gap-4 py-6 z-10">
                {getWeatherIcon(todayWeatherStatus, 54)}
                <div>
                  <span className="text-4xl font-black text-slate-800 select-none">
                    {weatherData.weekly[0]?.temp}°C
                  </span>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5 capitalize">
                    {weatherData.weekly[0]?.desc}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-xs text-gray-500 z-10">
                <span className="flex items-center gap-1 font-bold">
                  <Wind size={14} className="text-slate-400" />
                  {weatherData.weekly[0]?.wind} m/s
                </span>
                <span className="font-extrabold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-full capitalize">
                  {todayWeatherStatus.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Hour-by-Hour Forecast */}
            <div className="lg:col-span-2 bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                  ⏰ Today's Timeline
                </h3>
                <p className="text-xxs text-gray-400 font-bold">
                  Temperature and wind metrics mapped hour-by-hour.
                </p>
              </div>

              <div className="flex gap-4 overflow-x-auto py-3.5 pr-1 scrollbar-thin">
                {weatherData.todayHours.length > 0 ? (
                  weatherData.todayHours.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex-shrink-0 w-24 bg-gray-50/60 border border-gray-100 rounded-2xl p-3 flex flex-col items-center justify-between text-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-[10px] font-black text-slate-500">{item.time}</span>
                      <div className="my-2">{getWeatherIcon(item.status, 24)}</div>
                      <span className="text-sm font-black text-slate-800">{item.temp}°C</span>
                      <span className="text-[9px] font-bold text-gray-400 truncate w-full mt-1">
                        {item.wind} m/s
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-4">No hourly data available.</p>
                )}
              </div>

              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                OpenWeatherMap Live Terminal Sync
              </div>
            </div>
          </div>

          {/* MIDDLE LAYOUT: WEATHER AFFECTED TASKS */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-amber-500 animate-pulse" />
              Weather-Affected Tasks Analysis
            </h3>
            <p className="text-xxs text-gray-400 font-bold mb-4">
              AI automatically highlights outdoor tasks affected by today's weather condition.
            </p>

            {affectedTasks.length > 0 ? (
              <div className="space-y-3">
                {affectedTasks.map(task => (
                  <div 
                    key={task.id}
                    className="animate-blink-red border-2 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-350 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                          ⚠️ Warning
                        </span>
                        <h4 className="text-sm font-extrabold text-red-900 leading-tight">
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-xs font-bold text-red-700/80">
                        Affected by: <span className="font-extrabold capitalize">{task.reason}</span> (Today: {todayWeatherStatus.toLowerCase()})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/60 border border-red-200/40 rounded-xl p-2.5 max-w-md">
                      <Sparkles size={14} className="text-amber-600 flex-shrink-0 animate-pulse" />
                      <p className="text-xxs font-black text-red-800 leading-normal">
                        <span className="uppercase text-[9px] tracking-wide block text-amber-700">AI Suggestion</span>
                        {task.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-6 text-center space-y-1">
                <span className="text-3xl">🎉</span>
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">All Clear!</h4>
                <p className="text-xs text-emerald-600 font-bold">
                  None of your outdoor tasks today are affected by the forecast. Go ahead with your day!
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM LAYOUT: 7-DAY FORECAST WEEKDAY CARDS */}
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              📅 7-Day Weekly Forecast
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weatherData.weekly.map((day, idx) => (
                <div 
                  key={idx}
                  className={`bg-white border border-gray-150 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[170px] relative overflow-hidden transition-all duration-300 hover:scale-[1.03] ${getWeatherAnimationClass(day.status)}`}
                >
                  <div className="z-10">
                    <span className="text-[10px] font-black text-slate-800 block">
                      {formatDayHeader(idx, day.dayName)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                      {day.displayDate}
                    </span>
                  </div>

                  <div className="my-3 flex items-center justify-between z-10">
                    {getWeatherIcon(day.status, 32)}
                    <span className="text-lg font-black text-slate-800">
                      {day.temp}°C
                    </span>
                  </div>

                  <div className="z-10 border-t border-gray-100 pt-2 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase">
                    <span className="flex items-center gap-0.5">
                      <Wind size={10} className="text-slate-350" />
                      {day.wind} m/s
                    </span>
                    <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50/50 px-1 py-0.2 rounded-full">
                      {day.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
