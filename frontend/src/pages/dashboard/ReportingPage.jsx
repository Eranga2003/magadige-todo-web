import React from 'react';
import { BarChart3, TrendingUp, Heart, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react';
import { getColor } from '../../utils/color';

export const ReportingPage = ({ tasks = [] }) => {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Mock analytics data
  const charts = [
    { day: 'Mon', count: 4, height: 'h-16' },
    { day: 'Tue', count: 6, height: 'h-24' },
    { day: 'Wed', count: 3, height: 'h-12' },
    { day: 'Thu', count: 8, height: 'h-32' },
    { day: 'Fri', count: 5, height: 'h-20' },
    { day: 'Sat', count: 2, height: 'h-8' },
    { day: 'Sun', count: 1, height: 'h-4' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-black flex items-center gap-2">
          AI Analytics & Reporting
        </h1>
        <span className={`text-xs font-bold ${getColor('primary.bgLight')} ${getColor('primary.accentText')} px-2.5 py-0.5 rounded-full border ${getColor('primary.borderLight')}`}>
          Active
        </span>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Card 1: Completion Ratio */}
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xxs space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Task Completion</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{completionRate}%</span>
            <span className="text-xs text-gray-500 font-semibold">{completedCount}/{totalCount} tasks</span>
          </div>
        </div>

        {/* Card 2: Productivity Index */}
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xxs space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Focus Index</span>
            <TrendingUp size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">8.4</span>
            <span className="text-xs text-green-600 font-extrabold bg-green-50 px-1.5 py-0.5 rounded">
              +12% vs last week
            </span>
          </div>
        </div>

        {/* Card 3: Wellbeing Score */}
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xxs space-y-2">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Wellbeing Health</span>
            <Heart size={20} className="fill-current" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">95%</span>
            <span className="text-xs text-gray-500 font-semibold">Break targets met</span>
          </div>
        </div>
      </div>

      {/* Main Performance and AI Feedback Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Performance Chart Column */}
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-xxs md:col-span-3 space-y-6">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <BarChart3 size={18} className="text-blue-500" />
            Weekly Completion Trends
          </h3>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-between gap-2 h-48 pt-4 border-b border-gray-100 px-2">
            {charts.map((c) => (
              <div key={c.day} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                <div className="text-xxs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {c.count}
                </div>
                <div className={`w-full ${c.height} ${getColor('primary.gradient')} rounded-t-md hover:opacity-90 transition-all duration-300 shadow-sm`} />
                <span className="text-xxs font-bold text-gray-500 mt-2">{c.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI wellbeing check column */}
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-xxs md:col-span-2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <ShieldAlert size={18} className="text-indigo-500" />
              AI Copilot Insights
            </h3>

            <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                <AlertCircle size={14} />
                <span>Stress Warning Check</span>
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
                "You have completed 4 high-priority tasks in the morning. Your focus rating is excellent. Remember to take a 5-minute break at 2:30 PM to avoid screen fatigue."
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
              AI
            </div>
            <div>
              <span className="text-xs font-bold text-black block">Magadige Coach</span>
              <span className="text-xxs text-gray-400 block">Active 2 mins ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
