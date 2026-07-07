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
  ArrowRight,
  MapPin,
  Calendar,
  AlertOctagon,
  CheckCircle2,
  Clock
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
        return <Sun size={size} className="text-amber-400 animate-spin-slow filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]" />;
      case 'RAINY':
        return <CloudRain size={size} className="text-blue-450 filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.35)]" />;
      case 'WINDY':
        return <Wind size={size} className="text-teal-400 animate-pulse" />;
      case 'CLOUDY':
        return <Cloud size={size} className="text-slate-400" />;
      case 'STORMY':
        return <CloudLightning size={size} className="text-indigo-500 filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]" />;
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

  // Helper to resolve a weather-adaptive background gradient class
  const getWeatherGradientClass = (status) => {
    switch (status) {
      case 'SUNNY':
        return 'bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 text-white';
      case 'RAINY':
        return 'bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 text-white';
      case 'WINDY':
        return 'bg-gradient-to-br from-teal-500 via-cyan-600 to-slate-600 text-white';
      case 'CLOUDY':
        return 'bg-gradient-to-br from-slate-450 via-zinc-500 to-gray-600 text-white';
      case 'STORMY':
        return 'bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-900 text-white';
      default:
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white';
    }
  };  // Helper to resolve a weather-adaptive shadow class
  const getTodayCardShadowClass = (status) => {
    switch (status) {
      case 'SUNNY':
        return 'shadow-[0_20px_50px_rgba(245,158,11,0.22)]';
      case 'RAINY':
        return 'shadow-[0_20px_50px_rgba(37,99,235,0.28)]';
      case 'WINDY':
        return 'shadow-[0_20px_50px_rgba(20,184,166,0.22)]';
      case 'CLOUDY':
        return 'shadow-[0_20px_50px_rgba(100,116,139,0.22)]';
      case 'STORMY':
        return 'shadow-[0_20px_50px_rgba(99,102,241,0.3)]';
      default:
        return 'shadow-[0_20px_50px_rgba(37,99,235,0.22)]';
    }
  };

  // Helper to style small day-cards based on forecast condition
  const getDayCardStyles = (status) => {
    switch (status) {
      case 'SUNNY':
        return 'border-amber-200/50 bg-amber-50/15 shadow-[0_12px_36px_rgba(245,158,11,0.06)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.12)]';
      case 'RAINY':
        return 'border-blue-200 bg-blue-50/15 shadow-[0_12px_36px_rgba(37,99,235,0.15)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.22)]';
      case 'WINDY':
        return 'border-teal-200 bg-teal-50/15 shadow-[0_12px_36px_rgba(20,184,166,0.06)] hover:shadow-[0_16px_40px_rgba(20,184,166,0.12)]';
      case 'CLOUDY':
        return 'border-slate-200 bg-slate-50/15 shadow-[0_12px_36px_rgba(100,116,139,0.06)] hover:shadow-[0_16px_40px_rgba(100,116,139,0.12)]';
      case 'STORMY':
        return 'border-indigo-200 bg-indigo-50/15 shadow-[0_12px_36px_rgba(99,102,241,0.16)] hover:shadow-[0_16px_40px_rgba(99,102,241,0.24)]';
      default:
        return 'border-slate-200 bg-white/50 shadow-sm';
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
      if (!t.dueDate) return false;
      if (t.dueDate === 'TODAY') return true;
      if (t.dueDate.includes(todayStr)) return true;
      
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
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-7 select-none font-sans relative">
      
      {/* Decorative top ambient blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-48 left-10 w-80 h-80 bg-purple-400/5 rounded-full blur-[90px] pointer-events-none"></div>

      {/* HEADER WITH GLASS SEARCH BAR */}
      <div className="relative flex flex-wrap items-center justify-between gap-5 border-b border-slate-100 pb-5 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5 tracking-tight">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <CloudSun size={24} />
            </span>
            Weather Assistant
          </h1>
          <p className="text-xs text-gray-500 font-bold mt-1.5">
            Optimize your sprint tasks by checking weather disruptions dynamically.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Search city (e.g. Colombo, London)..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-64 pl-4 pr-10 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white/80 backdrop-blur-md placeholder:text-gray-400 font-bold outline-none shadow-sm transition-all"
          />
          <button
            type="submit"
            className="absolute right-3.5 p-1 text-gray-450 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
          >
            <Search size={14} />
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest animate-pulse">Syncing live forecasts...</span>
        </div>
      ) : errorMsg ? (
        <div className="bg-white/80 backdrop-blur-md border border-red-100 rounded-3xl p-8 text-center max-w-md mx-auto shadow-xl shadow-red-100/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="animate-bounce" />
          </div>
          <h3 className="text-sm font-extrabold text-red-800">API Connection Error</h3>
          <p className="text-xs text-red-600 font-bold leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => fetchWeather(city)}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer focus:outline-none shadow-md shadow-red-200/50 active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="space-y-7 z-10 relative">
          
          {/* TOP LAYOUT: TODAY OVERVIEW + HOUR BY HOUR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Today Main Weather Card */}
            <div className={`lg:col-span-1 border border-slate-200/40 rounded-[32px] p-6 flex flex-col justify-between min-h-[250px] relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 ${getTodayCardShadowClass(todayWeatherStatus)} ${getWeatherGradientClass(todayWeatherStatus)} ${getWeatherAnimationClass(todayWeatherStatus)}`}>
              <div className="z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 text-white/90">
                    <MapPin size={13} className="animate-pulse" />
                    <h2 className="text-xl font-black tracking-tight truncate max-w-[150px]">
                      {weatherData.city}
                    </h2>
                  </div>
                  <p className="text-[10px] text-white/70 font-extrabold uppercase tracking-widest mt-0.5">
                    {weatherData.country || 'Live Update'}
                  </p>
                </div>

                <span className="text-[9px] font-black text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Today
                </span>
              </div>

              <div className="flex items-center gap-5 py-5 z-10">
                <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl">
                  {getWeatherIcon(todayWeatherStatus, 48)}
                </div>
                <div>
                  <span className="text-4xl font-black tracking-tight select-none">
                    {weatherData.weekly[0]?.temp}°C
                  </span>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-0.5 capitalize">
                    {weatherData.weekly[0]?.desc}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/15 pt-3.5 flex justify-between text-xs text-white/90 z-10">
                <span className="flex items-center gap-1 font-bold">
                  <Wind size={13} className="text-white/85" />
                  Wind: {weatherData.weekly[0]?.wind} m/s
                </span>
                <span className="font-black text-white bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full capitalize text-[10px]">
                  {todayWeatherStatus.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Hour-by-Hour Forecast */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(37,99,235,0.06),0_8px_20px_rgba(37,99,235,0.03)] min-h-[250px]">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-500" />
                  Hourly Projection
                </h3>
                <p className="text-xxs text-gray-400 font-bold">
                  Temperature progression and air speed indicators for the next 24 hours.
                </p>
              </div>

              <div className="flex gap-4 overflow-x-auto py-4 pr-1 scrollbar-none snap-x">
                {weatherData.todayHours.length > 0 ? (
                  weatherData.todayHours.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex-shrink-0 w-24 bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-between text-center hover:bg-slate-50 transition-all duration-300 snap-start hover:shadow-sm"
                    >
                      <span className="text-[10px] font-black text-slate-450">{item.time}</span>
                      <div className="my-3 bg-white p-2 rounded-xl border border-slate-100 shadow-xxs">
                        {getWeatherIcon(item.status, 20)}
                      </div>
                      <span className="text-sm font-black text-slate-800">{item.temp}°C</span>
                      <span className="text-[9px] font-bold text-gray-400 truncate w-full mt-1.5 flex items-center justify-center gap-0.5">
                        <Wind size={8} /> {item.wind} m/s
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-4">No hourly data available.</p>
                )}
              </div>

              <div className="text-[9px] text-gray-400 font-black uppercase tracking-wider">
                OpenWeatherMap Live Terminal Sync
              </div>
            </div>
          </div>

          {/* MIDDLE LAYOUT: WEATHER AFFECTED TASKS */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(239,68,68,0.05),0_8px_20px_rgba(239,68,68,0.03)]">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertOctagon size={15} className="text-red-500 animate-pulse" />
                  Weather-Disrupted Tasks
                </h3>
                <p className="text-xxs text-gray-400 font-bold">
                  AI scans today's outdoor tasks and cross-references them against active weather elements.
                </p>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50">
                {affectedTasks.length} Disrupted
              </span>
            </div>

            {affectedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {affectedTasks.map(task => (
                  <div 
                    key={task.id}
                    className="weather-affected-task-card rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all duration-350 relative overflow-hidden group hover:scale-[1.01]"
                  >
                    <div className="space-y-1 z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-150 text-red-700 border border-red-200">
                          Disruption
                        </span>
                        <h4 className="text-xs font-black text-red-950 leading-tight truncate max-w-[200px]">
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-[10px] font-bold text-red-700/80">
                        Today's forecast: <span className="font-extrabold capitalize">{todayWeatherStatus.toLowerCase()}</span> • {task.reason} Warning.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-white/70 border border-red-250/30 rounded-xl p-3 z-10 shadow-xxs">
                      <div className="p-1 bg-amber-50 text-amber-600 rounded-lg">
                        <Sparkles size={13} className="animate-pulse" />
                      </div>
                      <div>
                        <span className="uppercase text-[8px] font-black tracking-widest block text-amber-700">AI Mitigation Advice</span>
                        <p className="text-[10.5px] font-bold text-red-900 leading-normal mt-0.5">
                          {task.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-6 text-center space-y-2 max-w-lg mx-auto">
                <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Weather Compatibility: 100%</h4>
                <p className="text-xxs text-emerald-600 font-bold max-w-sm mx-auto leading-relaxed">
                  None of your outdoor tasks today conflict with today's weather condition. All scheduled tasks are clear to proceed!
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM LAYOUT: 7-DAY FORECAST WEEKDAY CARDS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" />
                7-Day Weekly Sprint Forecast
              </h3>
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                Colombo Standard Grid
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {weatherData.weekly.map((day, idx) => {
                const dayStyleClass = getDayCardStyles(day.status);
                return (
                  <div 
                    key={idx}
                    className={`border rounded-[24px] p-4 flex flex-col justify-between min-h-[185px] relative overflow-hidden transition-all duration-350 hover:scale-[1.03] backdrop-blur-md ${dayStyleClass} ${getWeatherAnimationClass(day.status)}`}
                  >
                    <div className="z-10">
                      <span className="text-xs font-black text-slate-800 block">
                        {formatDayHeader(idx, day.dayName)}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                        {day.displayDate}
                      </span>
                    </div>

                    <div className="my-4 flex items-center justify-between z-10">
                      <div className="p-1.5 bg-white rounded-xl shadow-xxs border border-slate-100">
                        {getWeatherIcon(day.status, 24)}
                      </div>
                      <span className="text-lg font-black text-slate-800">
                        {day.temp}°C
                      </span>
                    </div>

                    <div className="z-10 border-t border-slate-100/50 pt-2.5 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase">
                      <span className="flex items-center gap-0.5">
                        <Wind size={9} />
                        {day.wind} m/s
                      </span>
                      <span className="text-[8px] font-black text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-full">
                        {day.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
