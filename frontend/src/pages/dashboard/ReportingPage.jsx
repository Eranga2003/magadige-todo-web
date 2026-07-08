import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart3, CheckCircle2, TrendingUp, Target, Users,
  Calendar, Zap, Award, Clock, ArrowUp, ArrowDown, Minus,
  Layers, Star, Activity
} from 'lucide-react';
import { workspaceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ─── helpers ─────────────────────────────────────────── */
const todayStr = () => new Date().toISOString().split('T')[0];
const dayName = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
};
const dateStr = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
};
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '??';
const avatarBg = (name = '') => {
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-600',
    'from-cyan-500 to-blue-600',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
};

/* ─── mini chart bar ──────────────────────────────────── */
const Bar = ({ value, max, label, sublabel, color = 'from-blue-500 to-indigo-600', today = false }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 group cursor-default">
      <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
        {value}
      </span>
      <div className="w-full flex flex-col justify-end" style={{ height: 96 }}>
        <div
          className={`w-full rounded-t-lg bg-gradient-to-t ${color} transition-all duration-700 ease-out relative`}
          style={{ height: `${Math.max(pct, 4)}%` }}
        >
          {today && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white ring-2 ring-blue-500" />
          )}
        </div>
      </div>
      <span className={`text-[10px] font-bold ${today ? 'text-blue-600' : 'text-slate-500'}`}>{label}</span>
      {sublabel && <span className="text-[8px] text-slate-400 font-semibold">{sublabel}</span>}
    </div>
  );
};

/* ─── donut ring ──────────────────────────────────────── */
const DonutRing = ({ pct, size = 80, stroke = 10, color = '#3b82f6', bg = '#e0e7ff', children }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

/* ─── stat card ───────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, iconColor, bgFrom, bgTo, trend }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${bgFrom} ${bgTo} shadow-lg`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 ${iconColor}`}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
          trend > 0 ? 'bg-green-400/30 text-green-100' : trend < 0 ? 'bg-red-400/30 text-red-100' : 'bg-white/20 text-white/70'
        }`}>
          {trend > 0 ? <ArrowUp size={8} /> : trend < 0 ? <ArrowDown size={8} /> : <Minus size={8} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{label}</p>
    <p className="text-white text-3xl font-black mt-0.5 leading-none">{value}</p>
    {sub && <p className="text-white/60 text-[10px] font-semibold mt-1">{sub}</p>}
    {/* decorative bubble */}
    <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
  </div>
);

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export const ReportingPage = ({ tasks = [], workspaces: propWorkspaces }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState(propWorkspaces || []);
  const [wsLoading, setWsLoading] = useState(!propWorkspaces);

  useEffect(() => {
    if (propWorkspaces) {
      setWorkspaces(propWorkspaces);
      setWsLoading(false);
      return;
    }
    workspaceService.getWorkspaces()
      .then(r => { if (r?.data) setWorkspaces(r.data); })
      .catch(() => {})
      .finally(() => setWsLoading(false));
  }, [propWorkspaces]);

  /* ── computed stats ── */
  const today = todayStr();
  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const todayTasks     = tasks.filter(t => t.dueDate === today || t.scheduledDate === today).length;
  const todayDone      = tasks.filter(t => (t.dueDate === today || t.scheduledDate === today) && t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayRate      = todayTasks > 0 ? Math.round((todayDone / todayTasks) * 100) : 0;

  const highPriDone = tasks.filter(t => t.completed && (t.priority === 'P1' || t.priority === 'P2')).length;

  /* ── weekly data (last 7 days) ── */
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const ds = dateStr(6 - i);
      const dayTasks = tasks.filter(t => t.dueDate === ds || t.scheduledDate === ds);
      const done     = dayTasks.filter(t => t.completed).length;
      return {
        label: dayName(6 - i),
        sublabel: ds.slice(5),
        total: dayTasks.length,
        done,
        isToday: ds === today,
      };
    });
  }, [tasks]);

  const weekMax = Math.max(...weeklyData.map(d => d.total), 1);

  /* ── per-priority breakdown ── */
  const priorities = ['P1', 'P2', 'P3', 'P4'];
  const priorityColors = {
    P1: { bar: 'from-red-500 to-rose-600', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Critical', dot: 'bg-red-500' },
    P2: { bar: 'from-orange-500 to-amber-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: 'High', dot: 'bg-orange-500' },
    P3: { bar: 'from-blue-500 to-indigo-600', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Normal', dot: 'bg-blue-500' },
    P4: { bar: 'from-slate-400 to-slate-500', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Low', dot: 'bg-slate-400' },
  };
  const priorityStats = priorities.map(p => {
    const all  = tasks.filter(t => t.priority === p);
    const done = all.filter(t => t.completed);
    return { p, total: all.length, done: done.length, rate: all.length > 0 ? Math.round((done.length / all.length) * 100) : 0 };
  });

  /* ── workspace stats ── */
  const wsStats = workspaces.map(ws => {
    const wsTasks = tasks.filter(t => t.workspaceId === ws.id);
    const wsDone  = wsTasks.filter(t => t.completed).length;
    return { ...ws, total: wsTasks.length, done: wsDone, rate: wsTasks.length > 0 ? Math.round((wsDone / wsTasks.length) * 100) : 0 };
  });

  /* ── streak ── */
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const ds = dateStr(i);
      const dayDone = tasks.filter(t => t.completed && (t.dueDate === ds || t.scheduledDate === ds)).length;
      if (dayDone > 0) count++;
      else break;
    }
    return count;
  }, [tasks]);

  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? '☀️ Good morning' : greetHour < 17 ? '⚡ Good afternoon' : '🌙 Good evening';

  return (
    <div
      className="w-full min-h-full overflow-y-auto"
      style={{
        background: 'radial-gradient(1200px 600px at 10% -10%, #eef2ff, transparent), radial-gradient(900px 600px at 100% 0%, #f0f9ff, transparent), #f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-7">

        {/* ── HEADER ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 mb-0.5">{greet}, {user?.name?.split(' ')[0] || 'there'}!</p>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <BarChart3 size={28} className="text-blue-600 drop-shadow-[0_4px_8px_rgba(37,99,235,0.3)]" />
              Productivity Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Track your performance, workspace progress, and weekly trends</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-slate-700">{streak}-day streak</span>
          </div>
        </div>

        {/* ── STAT CARDS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar} label="Today's Tasks" value={todayTasks}
            sub={`${todayDone} completed today`}
            bgFrom="from-blue-500" bgTo="to-indigo-600"
            iconColor="text-white" trend={undefined}
          />
          <StatCard
            icon={CheckCircle2} label="Total Completed" value={completedTasks}
            sub={`out of ${totalTasks} total`}
            bgFrom="from-emerald-500" bgTo="to-teal-600"
            iconColor="text-white" trend={completionRate}
          />
          <StatCard
            icon={Zap} label="High Priority Done" value={highPriDone}
            sub="P1 + P2 completed"
            bgFrom="from-rose-500" bgTo="to-pink-600"
            iconColor="text-white" trend={undefined}
          />
          <StatCard
            icon={Activity} label="Completion Rate" value={`${completionRate}%`}
            sub="all-time average"
            bgFrom="from-violet-500" bgTo="to-purple-600"
            iconColor="text-white" trend={undefined}
          />
        </div>

        {/* ── MAIN 2-COLUMN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── WEEKLY PROGRESS CHART ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" /> Weekly Progress
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Tasks assigned vs completed — last 7 days</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 inline-block" /> Assigned</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 inline-block" /> Completed</span>
              </div>
            </div>
            {/* bars */}
            <div className="flex items-end gap-3">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 group cursor-default">
                  <div className="flex flex-col justify-end" style={{ height: 96 }}>
                    {/* Total bar */}
                    <div className="relative w-full rounded-t-lg overflow-hidden bg-blue-50" style={{ height: `${weekMax > 0 ? Math.max((d.total / weekMax) * 100, 4) : 4}%` }}>
                      {/* Done fill inside */}
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t from-blue-500 to-indigo-600 transition-all duration-700"
                        style={{ height: `${d.total > 0 ? Math.round((d.done / d.total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-black ${d.isToday ? 'text-blue-600' : 'text-slate-500'}`}>{d.label}</p>
                    <p className="text-[8px] text-slate-400 font-semibold">{d.sublabel}</p>
                  </div>
                  {/* tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    <span className="text-[8px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">{d.done}/{d.total}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* summary row */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
              {weeklyData.reduce((s, d) => ({ total: s.total + d.total, done: s.done + d.done }), { total: 0, done: 0 }) && (() => {
                const wTotal = weeklyData.reduce((s, d) => s + d.total, 0);
                const wDone  = weeklyData.reduce((s, d) => s + d.done, 0);
                const wRate  = wTotal > 0 ? Math.round((wDone / wTotal) * 100) : 0;
                return (
                  <>
                    <div className="text-center">
                      <p className="text-xl font-black text-slate-900">{wDone}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">This week done</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-xl font-black text-slate-900">{wTotal}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">Total assigned</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-xl font-black text-emerald-600">{wRate}%</p>
                      <p className="text-[9px] text-slate-400 font-semibold">Weekly rate</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* ── TODAY'S ACHIEVEMENT RING ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
              <Target size={16} className="text-indigo-500" /> Today's Achievement
            </h2>
            <div className="flex flex-col items-center gap-4 flex-1 justify-center">
              <DonutRing pct={todayRate} size={120} stroke={14} color="#4f46e5" bg="#e0e7ff">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{todayRate}%</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Done</p>
                </div>
              </DonutRing>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="text-center bg-indigo-50 rounded-xl py-2.5">
                  <p className="text-lg font-black text-indigo-700">{todayDone}</p>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase">Completed</p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl py-2.5">
                  <p className="text-lg font-black text-slate-700">{todayTasks - todayDone}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Remaining</p>
                </div>
              </div>
            </div>
            {/* Overall all-time ring */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">All-Time Rate</p>
              <div className="flex items-center gap-3">
                <DonutRing pct={completionRate} size={56} stroke={8} color="#10b981" bg="#d1fae5">
                  <p className="text-xs font-black text-emerald-700">{completionRate}%</p>
                </DonutRing>
                <div>
                  <p className="text-sm font-black text-slate-900">{completedTasks} / {totalTasks}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">tasks completed total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PRIORITY BREAKDOWN ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
            <Layers size={16} className="text-violet-500" /> My Tasks — Priority Achievement
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {priorityStats.map(({ p, total, done, rate }) => {
              const c = priorityColors[p];
              return (
                <div key={p} className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${c.text}`}>{c.label}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full bg-white ${c.text}`}>{p}</span>
                  </div>
                  <DonutRing pct={rate} size={64} stroke={8} color={p === 'P1' ? '#ef4444' : p === 'P2' ? '#f97316' : p === 'P3' ? '#3b82f6' : '#94a3b8'} bg="#f1f5f9">
                    <p className="text-xs font-black text-slate-800">{rate}%</p>
                  </DonutRing>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span>{done} done</span>
                    <span className="text-slate-400">{total} total</span>
                  </div>
                  {/* mini progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${c.bar} transition-all duration-700`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── WORKSPACE CARDS ── */}
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
            <Users size={16} className="text-blue-500" /> Workspace Progress
          </h2>
          {wsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-36" />
              ))}
            </div>
          ) : wsStats.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
              <Users size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">No workspaces yet</p>
              <p className="text-[10px] text-slate-300 mt-1">Create or join a workspace to see team progress here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wsStats.map(ws => (
                <div key={ws.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200/80 transition-all duration-200 group">
                  {/* header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {ws.name?.[0]?.toUpperCase() || 'W'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-slate-900 truncate">{ws.name}</h3>
                        <p className="text-[9px] text-slate-400 font-semibold capitalize">{ws.ownerId === user?.id ? '👑 Owner' : '👤 Member'}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                      ws.rate >= 75 ? 'bg-emerald-50 text-emerald-600' :
                      ws.rate >= 40 ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {ws.rate}%
                    </span>
                  </div>

                  {/* stats row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-lg font-black text-slate-900">{ws.total}</p>
                      <p className="text-[8px] text-slate-400 font-semibold uppercase">Tasks</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-lg font-black text-emerald-600">{ws.done}</p>
                      <p className="text-[8px] text-slate-400 font-semibold uppercase">Done</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    {/* member avatars */}
                    <div className="flex items-center flex-1 justify-end">
                      {(ws.members || []).slice(0, 4).map((m, mi) => (
                        <div
                          key={m.userId || mi}
                          className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarBg(m.name || m.email || '')} flex items-center justify-center text-white text-[9px] font-black border-2 border-white shadow-sm`}
                          style={{ marginLeft: mi > 0 ? -8 : 0, zIndex: 4 - mi }}
                          title={m.name || m.email || 'Member'}
                        >
                          {initials(m.name || m.email || '?')}
                        </div>
                      ))}
                      {(ws.members || []).length > 4 && (
                        <div
                          className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[8px] font-black border-2 border-white shadow-sm"
                          style={{ marginLeft: -8 }}
                        >
                          +{(ws.members || []).length - 4}
                        </div>
                      )}
                      {(!ws.members || ws.members.length === 0) && (
                        <div className="text-[9px] text-slate-400 font-semibold">No members</div>
                      )}
                    </div>
                  </div>

                  {/* progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        ws.rate >= 75 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                        ws.rate >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                        'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                      style={{ width: `${ws.rate}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1">{ws.done} of {ws.total} tasks completed</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ACHIEVEMENT BADGES ── */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
          <h2 className="text-sm font-black flex items-center gap-2 mb-5">
            <Award size={16} className="text-yellow-300" /> Achievement Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🔥', label: 'Day Streak', value: streak, sub: 'days in a row' },
              { icon: '✅', label: 'Total Done', value: completedTasks, sub: 'tasks completed' },
              { icon: '⚡', label: 'High Priority', value: highPriDone, sub: 'P1+P2 cleared' },
              { icon: '📅', label: 'Today Done', value: todayDone, sub: `of ${todayTasks} today` },
            ].map(({ icon, label, value, sub }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm border border-white/10">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-[9px] font-black text-white/70 uppercase tracking-wider">{label}</p>
                <p className="text-[9px] text-white/50 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-semibold pb-4">
          🚀 Keep going! Every completed task gets you closer to your goals.
        </p>
      </div>
    </div>
  );
};
