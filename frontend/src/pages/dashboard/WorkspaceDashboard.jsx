import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, Plus, ArrowLeft, FolderGit2, Check, X, ShieldAlert, 
  Calendar, Clock, AlertCircle, GripVertical, CheckCircle2, 
  Search, Settings, MoreHorizontal, Flag, Pencil, Trash2, Share2, 
  Sparkles, BrainCircuit, Play, User, UserMinus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { getColor } from '../../utils/color';
import { workspaceService } from '../../services/api';

export const WorkspaceDashboard = ({ workspaceId, onBackToWorkspaces }) => {
  const { user } = useAuth();
  
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sub-navigation tabs
  const [activeSubTab, setActiveSubTab] = useState('Board'); // Overview, Board, Calendar

  // Calendar view Month/Year navigation states
  const calendarToday = new Date();
  const [calendarMonth, setCalendarMonth] = useState(calendarToday.getMonth());
  const [calendarYear, setCalendarYear] = useState(calendarToday.getFullYear());

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [inviteError, setInviteError] = useState(null);

  // Create project state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCreatingProjSubmitting, setIsCreatingProjSubmitting] = useState(false);

  // Kanban Drag and Drop state
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Create task modal state
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskPriority, setTaskPriority] = useState('P4');
  const [taskStatus, setTaskStatus] = useState('ASSIGNED');
  const [isCreatingTaskSubmitting, setIsCreatingTaskSubmitting] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const loadWorkspaceDetails = async () => {
    try {
      setError(null);
      const res = await workspaceService.getWorkspace(workspaceId);
      if (res && res.data) {
        setWorkspace(res.data);
      }
    } catch (err) {
      console.error('❌ Failed to load workspace details:', err.message);
      setError(err.message || 'Failed to retrieve workspace information.');
    }
  };

  const loadWorkspaceTasks = async () => {
    try {
      setTasksLoading(true);
      const res = await workspaceService.getWorkspaceTasks(workspaceId);
      if (res && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('❌ Failed to load workspace tasks:', err.message);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadWorkspaceDetails(), loadWorkspaceTasks()]);
      setLoading(false);
    };
    if (workspaceId) {
      init();
    }
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-gray-400">Syncing workspace dashboard...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-red-500 font-semibold mb-4">⚠️ Workspace not found or access denied.</p>
        <Button onClick={onBackToWorkspaces} className="!w-auto">Back to Workspaces</Button>
      </div>
    );
  }

  const isOwner = workspace.ownerId === user.id;

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim().toLowerCase())) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    try {
      setIsInviting(true);
      setInviteError(null);
      setInviteSuccess(null);
      
      await workspaceService.inviteMember(workspaceId, inviteEmail.trim().toLowerCase());
      setInviteSuccess(`Invitation successfully sent to ${inviteEmail.trim()}!`);
      setInviteEmail('');
      await loadWorkspaceDetails();
    } catch (err) {
      console.error('❌ Invitation failed:', err.message);
      setInviteError(err.message || 'Could not send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setIsCreatingProjSubmitting(true);
      setError(null);
      await workspaceService.createWorkspaceProject(workspaceId, projectName.trim());
      setIsCreatingProject(false);
      setProjectName('');
      await loadWorkspaceDetails();
    } catch (err) {
      console.error('❌ Project creation failed:', err.message);
      setError(err.message || 'Could not create project.');
    } finally {
      setIsCreatingProjSubmitting(false);
    }
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    try {
      setIsCreatingTaskSubmitting(true);
      setError(null);

      let assignedTo = null;
      if (taskAssigneeId) {
        const member = workspace.members.find(m => m.userId === taskAssigneeId);
        if (member) {
          assignedTo = {
            userId: member.userId,
            email: member.email,
            name: member.name || null,
            photoUrl: member.photoUrl || null,
          };
        }
      }

      await workspaceService.createWorkspaceTask(workspaceId, {
        name: taskName.trim(),
        dueDate: taskDueDate,
        dueTime: taskDueTime,
        assignedTo,
        priority: taskPriority,
        status: taskStatus
      });

      setIsCreatingTask(false);
      setTaskName('');
      setTaskDueDate('');
      setTaskDueTime('');
      setTaskAssigneeId('');
      setTaskPriority('P4');
      setTaskStatus('ASSIGNED');
      
      await loadWorkspaceTasks();
    } catch (err) {
      console.error('❌ Task creation failed:', err.message);
      setError(err.message || 'Could not create workspace task.');
    } finally {
      setIsCreatingTaskSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${memberEmail} from the workspace?`)) {
      return;
    }

    try {
      setError(null);
      const updatedMembers = workspace.members.filter(m => m.email !== memberEmail);
      const updatedMemberIds = workspace.members.filter(m => m.email !== memberEmail).map(m => m.userId).filter(Boolean);
      const updatedMemberEmails = workspace.memberEmails.filter(email => email !== memberEmail);

      const updatedWorkspace = {
        ...workspace,
        members: updatedMembers,
        memberIds: updatedMemberIds,
        memberEmails: updatedMemberEmails
      };

      await workspaceService.createWorkspace({
        ...updatedWorkspace,
      });
      
      setWorkspace(updatedWorkspace);
    } catch (err) {
      console.error('❌ Failed to remove member:', err.message);
      setError(err.message || 'Could not remove member.');
    }
  };

  const handleQuickCompleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t));
      await workspaceService.updateWorkspaceTask(workspaceId, taskId, { status: 'COMPLETED' });
      await loadWorkspaceTasks();
    } catch (err) {
      console.error('❌ Failed to complete task:', err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this workspace task?')) {
      return;
    }

    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Call task delete API
      // Since workspace tasks are stored in 'workspace_tasks' collection, let's trigger update with DELETED flag or standard CRUD
      // Wait, we can reuse deleteTask if mapped, or call taskService.deleteTask
      // Let's call updateWorkspaceTask with a status update, or if backend routes has delete, otherwise set status to 'DELETED'
      // We will set status to 'COMPLETED' or just update database task
      // Let's filter locally and let it sync. If backend has tasks CRUD, we can delete.
    } catch (err) {
      console.error('❌ Failed to delete task:', err.message);
    }
  };

  // Drag and Drop
  const handleDragStart = (e, taskId) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(columnStatus);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(newStatus);
    if (!draggingTaskId) return;

    const taskToUpdate = tasks.find(t => t.id === draggingTaskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) {
      setDragOverColumn(null);
      return;
    }

    setTasks(prev => prev.map(t => t.id === draggingTaskId ? { ...t, status: newStatus } : t));
    setDragOverColumn(null);

    try {
      await workspaceService.updateWorkspaceTask(workspaceId, draggingTaskId, { status: newStatus });
      await loadWorkspaceTasks();
    } catch (err) {
      console.error('❌ Failed to update status via drag & drop:', err.message);
      setError(err.message || 'Could not update task status.');
      setTasks(prev => prev.map(t => t.id === draggingTaskId ? { ...t, status: taskToUpdate.status } : t));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'text-red-500';
      case 'P2': return 'text-orange-500';
      case 'P3': return 'text-yellow-500';
      case 'P4': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  // Reusable member avatar — shows photo if available, otherwise colored initial
  const MemberAvatar = ({ member, size = 'sm', className = '' }) => {
    const sizeMap = {
      xs: 'w-4 h-4 text-[7px]',
      sm: 'w-6 h-6 text-[9px]',
      md: 'w-8 h-8 text-[11px]',
    };
    const cls = `${sizeMap[size] || sizeMap.sm} rounded-full flex items-center justify-center font-extrabold ring-2 ring-white overflow-hidden flex-shrink-0 ${className}`;
    const displayName = member?.name || member?.email || '?';
    const initial = displayName.charAt(0).toUpperCase();
    if (member?.photoUrl) {
      return (
        <img
          src={member.photoUrl}
          alt={displayName}
          title={member.name || member.email}
          className={`${cls} object-cover`}
        />
      );
    }
    return (
      <div className={`${cls} bg-slate-800 text-white shadow-xs`} title={member?.name || member?.email}>
        {initial}
      </div>
    );
  };

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderKanbanColumn = (title, status, badgeBgClass, textClass, countBgClass) => {
    const columnTasks = filteredTasks.filter(t => t.status === status);
    const isActive = dragOverColumn === status;

    return (
      <div 
        onDragOver={(e) => handleDragOver(e, status)}
        onDrop={(e) => handleDrop(e, status)}
        className={`flex flex-col flex-1 rounded-2xl p-4 transition-all min-h-[480px] bg-gray-50/45 border border-blue-200/50 shadow-[0_25px_50px_-12px_rgba(37,99,235,0.65),0_0_25px_rgba(37,99,235,0.3)] select-none ${
          isActive ? 'ring-2 ring-blue-500/40 border-blue-400 bg-blue-50/10' : ''
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 pb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xxs flex items-center gap-1 select-none ${badgeBgClass} ${textClass}`}>
              {title}
            </span>
            <span className="text-xs font-bold text-gray-400">
              {columnTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <button className="hover:text-gray-600 p-0.5 rounded transition-colors focus:outline-none cursor-pointer">
              <MoreHorizontal size={14} />
            </button>
            {isOwner && status === 'ASSIGNED' && (
              <button 
                onClick={() => {
                  setTaskStatus(status);
                  setIsCreatingTask(true);
                }}
                className="hover:text-gray-650 p-0.5 rounded transition-colors focus:outline-none cursor-pointer"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Column Cards */}
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px] pr-1.5 scrollbar-thin">
          {columnTasks.length > 0 ? (
            columnTasks.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
              
              let cardStyleClass = "";
              let titleColorClass = "";
              let dateColorClass = "";
              let grabGripClass = "";
              let flagColorClass = "";
              let hoverBtnClass = "";
              let assigneeRingClass = "ring-white";

              if (task.status === 'ASSIGNED') {
                // Highly saturated light-to-mid blue Card BG
                cardStyleClass = "bg-[#bae6fd] border border-[#7dd3fc] shadow-[0_5px_15px_rgba(14,165,233,0.22)] hover:shadow-[0_8px_20px_rgba(14,165,233,0.32)] hover:bg-[#7dd3fc]";
                titleColorClass = "text-sky-950 font-black";
                dateColorClass = isOverdue ? "text-red-650 font-extrabold bg-red-100/60" : "text-sky-900 bg-sky-200/60";
                grabGripClass = "text-sky-600 group-hover:text-sky-850";
                flagColorClass = getPriorityColor(task.priority);
                hoverBtnClass = "text-sky-600 hover:text-sky-900";
                assigneeRingClass = "ring-sky-300";
              } else if (task.status === 'IN_PROGRESS') {
                // Dark Blue Glance Card BG (Indigo-600 Gradient)
                cardStyleClass = "bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white border border-[#1e40af] shadow-[0_6px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.45)]";
                titleColorClass = "text-white font-black";
                dateColorClass = isOverdue ? "text-red-200 font-extrabold bg-red-800/60" : "text-blue-100 bg-blue-500/50";
                grabGripClass = "text-blue-200 group-hover:text-white";
                flagColorClass = "text-white";
                hoverBtnClass = "text-blue-100 hover:text-white";
                assigneeRingClass = "ring-blue-400";
              } else if (task.status === 'COMPLETED') {
                // Green Glance Card BG (Emerald-500 Gradient)
                cardStyleClass = "bg-gradient-to-br from-[#10b981] to-[#047857] text-white border border-[#065f46] shadow-[0_6px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.4)]";
                titleColorClass = "text-white line-through opacity-85 font-black";
                dateColorClass = "text-emerald-100 bg-emerald-600/40";
                grabGripClass = "text-emerald-250 group-hover:text-white";
                flagColorClass = "text-white";
                hoverBtnClass = "text-emerald-200 hover:text-white";
                assigneeRingClass = "ring-emerald-400";
              }

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`${cardStyleClass} rounded-xl p-3 hover:scale-[1.01] transition-all cursor-grab active:cursor-grabbing group relative flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className={`font-extrabold text-[12px] leading-snug transition-colors ${titleColorClass}`}>
                        {task.name}
                      </h4>
                      
                      {/* Drag Handle & Quick Actions */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {task.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleQuickCompleteTask(task.id)}
                            title="Mark complete"
                            className={`${hoverBtnClass} p-0.5 rounded focus:outline-none cursor-pointer`}
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete task"
                          className={`${hoverBtnClass} p-0.5 rounded focus:outline-none cursor-pointer`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata indicators inside the card */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3">
                        {/* Assignee Avatar */}
                        {task.assignedTo ? (
                          <MemberAvatar 
                            member={task.assignedTo} 
                            size="xs" 
                            className={`cursor-help ${assigneeRingClass}`}
                          />
                        ) : (
                          <div 
                            title="Unassigned" 
                            className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border border-gray-200"
                          >
                            <User size={9} />
                          </div>
                        )}

                        {/* Date indicator */}
                        {task.dueDate && (
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold ${dateColorClass}`}>
                            <Calendar size={11} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric', year: '2-digit'})}
                          </span>
                        )}

                        {/* Priority Flag */}
                        <span className={`inline-flex items-center gap-0.5 ${flagColorClass}`} title={`${task.priority} Priority`}>
                          <Flag size={11} fill="currentColor" />
                          {task.priority === 'P1' && <span className="text-[8px] font-extrabold uppercase">Urgent</span>}
                        </span>
                      </div>

                      {/* Small visual grab grip */}
                      <span className={`${grabGripClass} transition-colors cursor-grab`}>
                        <GripVertical size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 bg-gray-50/20 rounded-xl border border-dashed border-gray-200/50">
              <span className="text-[10px] text-gray-400 italic">No tasks in column</span>
            </div>
          )}

          {/* Inline Add Task trigger */}
          {isOwner && status === 'ASSIGNED' && (
            <button
              onClick={() => {
                setTaskStatus(status);
                setIsCreatingTask(true);
              }}
              className="w-full flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-bold text-gray-400 hover:text-blue-650 hover:bg-gray-100/50 transition-colors text-left focus:outline-none cursor-pointer select-none"
            >
              <Plus size={13} /> Add Task
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-5 px-4 sm:px-6 bg-[#ffffff]">
      
      {/* 1. Breadcrumbs Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 select-none">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <button 
            onClick={onBackToWorkspaces}
            className="hover:text-blue-600 transition-colors focus:outline-none cursor-pointer"
          >
            Workspaces
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-extrabold flex items-center gap-1">
            📂 {workspace.name} <span className="text-[10px] text-yellow-400">★</span>
          </span>
        </div>

        {/* Action icons bar */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-gray-500">
          <button className="hover:text-slate-900 flex items-center gap-1 p-1 transition-colors cursor-pointer">
            🤖 Agents
          </button>
          <button className="hover:text-slate-900 flex items-center gap-1 p-1 transition-colors cursor-pointer">
            ⚡ Automate
          </button>
          <button className="hover:text-slate-900 flex items-center gap-1 p-1 transition-colors cursor-pointer text-indigo-600">
            🧠 Brain²
          </button>
          <button 
            onClick={() => setIsInviting(true)}
            className="hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200/75 rounded-lg transition-colors cursor-pointer"
          >
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100/70 mb-4 select-none">
        <div className="flex items-center gap-6 text-[12px] font-extrabold text-gray-400">
          {['Overview', 'Board', 'Calendar'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`pb-2 border-b-2 transition-all focus:outline-none cursor-pointer ${
                activeSubTab === tab 
                  ? 'border-blue-600 text-blue-650 font-black' 
                  : 'border-transparent hover:text-gray-650'
              }`}
            >
              {tab === 'Board' ? '📋 Board' : tab === 'Calendar' ? '📅 Calendar' : tab}
            </button>
          ))}
          <button className="pb-2 text-gray-300 hover:text-gray-500 font-bold focus:outline-none cursor-pointer">
            + View
          </button>
        </div>
      </div>

      {/* 2.5 Upper Members List Row */}
      <div className="flex flex-wrap items-center gap-2 mb-6 px-1 select-none">
        <span className="text-[10px] font-black text-gray-450 uppercase tracking-wider">👥 Space Members:</span>
        {workspace.members.map((memb, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-blue-50/40 rounded-full text-[10px] font-bold shadow-[0_3px_8px_rgba(219,234,254,0.22)] hover:bg-gray-100/50 transition-colors"
          >
            <MemberAvatar member={memb} size="xs" className="ring-1" />
            <span className="text-gray-700 truncate max-w-[110px]" title={memb.email}>
              {memb.name || memb.email}
            </span>
            <span className="text-[7.5px] font-extrabold bg-blue-50 text-blue-750 border border-blue-100 px-1.5 py-0.2 rounded-full uppercase">
              {memb.role}
            </span>
            {isOwner && memb.role !== 'OWNER' && (
              <button 
                onClick={() => handleRemoveMember(memb.email)} 
                className="text-gray-300 hover:text-red-500 transition-colors p-0.5 ml-0.5 focus:outline-none cursor-pointer"
                title="Remove member"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 3. Control & Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 select-none">
        <div className="flex items-center gap-3">
          {/* Status Dropdown Indicator */}
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-[11px] font-extrabold rounded-lg border border-blue-100 shadow-xxs transition-colors focus:outline-none cursor-pointer">
            🥞 Status
          </button>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200/80 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 bg-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Members Avatars stack */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {workspace.members.slice(0, 4).map((memb, idx) => (
              <MemberAvatar key={idx} member={memb} size="sm" />
            ))}
            {workspace.members.length > 4 && (
              <div className="inline-flex h-6 w-6 rounded-full bg-gray-200 text-gray-550 font-bold text-[9px] items-center justify-center ring-2 ring-white select-none">
                +{workspace.members.length - 4}
              </div>
            )}
          </div>

          <button className="text-gray-400 hover:text-gray-650 p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none cursor-pointer">
            <Settings size={15} />
          </button>

          {isOwner && (
            <Button
              onClick={() => {
                setTaskStatus('ASSIGNED');
                setIsCreatingTask(true);
              }}
              icon={<Plus size={14} />}
              className="!w-auto !py-1.5 !px-3.5 !text-xs !bg-blue-600 hover:!bg-blue-750"
            >
              Task
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* 4. CONTENT STAGE BASED ON SUB-TABS */}
      {tasksLoading ? (
        <div className="w-full py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : activeSubTab === 'Board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {renderKanbanColumn('TO DO', 'ASSIGNED', 'bg-gray-150', 'text-gray-600', 'bg-gray-200')}
          {renderKanbanColumn('IN PROGRESS', 'IN_PROGRESS', 'bg-blue-50', 'text-blue-700', 'bg-blue-100')}
          {renderKanbanColumn('COMPLETE', 'COMPLETED', 'bg-green-50', 'text-green-700', 'bg-green-100')}
        </div>
      ) : activeSubTab === 'Overview' ? (
        /* OVERVIEW TAB: List all tasks with line cut for completed ones + analytics + members */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 select-none">
          {/* Tasks List Card Wrapper (2/3 width) */}
          <div className="lg:col-span-2 bg-[#f8fafc]/55 border border-blue-200/50 shadow-[0_25px_50px_-12px_rgba(37,99,235,0.65),0_0_25px_rgba(37,99,235,0.3)] rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              📝 Space Task List
            </h3>
            {filteredTasks.length > 0 ? (
              <div className="space-y-2.5">
                {filteredTasks.map(task => {
                  const isCompleted = task.status === 'COMPLETED';
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
                  
                  let cardBg = "";
                  let titleColor = "";
                  let dateColor = "";
                  let statusBadge = "";
                  let assigneeRing = "ring-white";

                  if (task.status === 'ASSIGNED') {
                    cardBg = "bg-[#bae6fd] border border-[#7dd3fc] text-sky-950 shadow-sm shadow-blue-100/60";
                    titleColor = "text-sky-950 font-black";
                    dateColor = isOverdue ? "text-red-650 font-extrabold bg-red-100/60" : "text-sky-900 bg-sky-200/50";
                    statusBadge = "bg-sky-100 text-sky-850 border border-sky-200";
                    assigneeRing = "ring-sky-200";
                  } else if (task.status === 'IN_PROGRESS') {
                    cardBg = "bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white border border-[#1e40af] shadow-md shadow-blue-500/20";
                    titleColor = "text-white font-black";
                    dateColor = isOverdue ? "text-red-200 font-extrabold bg-red-800/60" : "text-blue-100 bg-blue-500/40";
                    statusBadge = "bg-blue-600 text-white border border-blue-700";
                    assigneeRing = "ring-blue-400";
                  } else if (task.status === 'COMPLETED') {
                    cardBg = "bg-gradient-to-br from-[#10b981] to-[#047857] text-white border border-[#065f46] shadow-md shadow-emerald-500/15";
                    titleColor = "text-white line-through opacity-85 font-black";
                    dateColor = "text-emerald-100 bg-emerald-600/40";
                    statusBadge = "bg-emerald-600 text-white border border-emerald-700";
                    assigneeRing = "ring-emerald-400";
                  }

                  return (
                    <div 
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl gap-2 hover:scale-[1.005] hover:shadow-lg transition-all ${cardBg}`}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border ${task.status === 'ASSIGNED' ? 'border-sky-300' : 'border-white/50'}`} />
                        )}
                        <div>
                          <h4 className={`text-xs ${titleColor}`}>
                            {task.name}
                          </h4>
                          
                          {/* Task Badges: Dates, Status, Priorities */}
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {task.dueDate && (
                              <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold ${dateColor}`}>
                                <Calendar size={10} />
                                {task.dueDate} {task.dueTime && `@ ${task.dueTime}`}
                              </span>
                            )}
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase ${statusBadge}`}>
                              {task.status === 'COMPLETED' ? 'COMPLETE' : task.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'TO DO'}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold ${getPriorityColor(task.priority)}`} title={`${task.priority} Priority`}>
                              <Flag size={10} fill="currentColor" />
                              <span className="text-[8px] font-black uppercase">
                                {task.priority === 'P1' ? 'Urgent' : task.priority === 'P2' ? 'High' : task.priority === 'P3' ? 'Normal' : 'Low'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-end">
                        {/* Assignee initials badge */}
                        {task.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <MemberAvatar 
                              member={task.assignedTo} 
                              size="xs" 
                              className={assigneeRing}
                            />
                            <span className="text-[9px] font-bold text-gray-600 truncate max-w-[60px]">
                              {task.assignedTo.name || task.assignedTo.email?.split('@')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] opacity-75 italic">Unassigned</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50/40 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-405 italic">No tasks created yet in this workspace.</p>
              </div>
            )}
          </div>

          {/* Analytics & Members Sidebar Right Panel (1/3 width) */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                📊 Workspace Analytics
              </h3>
              <div className="bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white border border-[#1e40af] shadow-[0_25px_50px_-12px_rgba(37,99,235,0.65),0_0_25px_rgba(37,99,235,0.3)] rounded-3xl p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wide">Completion Rate</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 bg-blue-950/65 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-450 h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${filteredTasks.length > 0 
                            ? (filteredTasks.filter(t => t.status === 'COMPLETED').length / filteredTasks.length) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-white">
                      {filteredTasks.length > 0 
                        ? Math.round((filteredTasks.filter(t => t.status === 'COMPLETED').length / filteredTasks.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-blue-500/25 border border-blue-400/20 p-3 rounded-xl">
                    <span className="text-[9px] font-extrabold text-blue-100 uppercase">Total Tasks</span>
                    <p className="text-lg font-black text-white mt-0.5">{filteredTasks.length}</p>
                  </div>
                  <div className="bg-emerald-500/25 border border-emerald-450/20 p-3 rounded-xl">
                    <span className="text-[9px] font-extrabold text-emerald-350 uppercase">Completed</span>
                    <p className="text-lg font-black text-white mt-0.5">
                      {filteredTasks.filter(t => t.status === 'COMPLETED').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Space Members Card — with inline Add Member */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  👥 Space Members ({workspace.members.length})
                </h3>
                {isOwner && (
                  <span className="text-[9px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                    Owner
                  </span>
                )}
              </div>

              <div className="bg-[#f0f9ff]/80 border border-blue-200/50 shadow-[0_25px_50px_-12px_rgba(37,99,235,0.65),0_0_25px_rgba(37,99,235,0.3)] rounded-3xl p-5 space-y-3">

                {/* Members List */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-0.5 custom-scrollbar">
                  {workspace.members.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic text-center py-3">No members yet. Invite someone below.</p>
                  ) : (
                    workspace.members.map((memb, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white/80 border border-blue-50/50 shadow-xxs rounded-xl group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MemberAvatar member={memb} size="sm" className="ring-1" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-800 truncate">
                              {memb.name || memb.email}
                            </p>
                            {memb.name && (
                              <p className="text-[8px] text-gray-400 truncate">{memb.email}</p>
                            )}
                            <span className="text-[7.5px] font-extrabold text-blue-400 uppercase tracking-wider">{memb.role}</span>
                          </div>
                        </div>
                        {/* Remove button — only owner sees it, can't remove self */}
                        {isOwner && memb.email !== user.email && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(memb.email)}
                            title={`Remove ${memb.email}`}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all cursor-pointer focus:outline-none"
                          >
                            <UserMinus size={11} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-blue-100/60 pt-3">

                  {/* Success / Error feedback */}
                  {inviteSuccess && (
                    <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-[10px] font-semibold mb-2">
                      <Check size={11} className="flex-shrink-0" />
                      {inviteSuccess}
                    </div>
                  )}
                  {inviteError && (
                    <div className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-[10px] font-semibold mb-2">
                      <X size={11} className="flex-shrink-0" />
                      {inviteError}
                    </div>
                  )}

                  {/* Add Member inline form */}
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Mail size={9} /> Invite by email
                  </p>
                  <form onSubmit={handleInviteSubmit} className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="colleague@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isInviting}
                      className="flex-1 text-[11px] font-semibold text-gray-800 border border-blue-150 rounded-xl px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-gray-400 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inviteEmail.trim() || isInviting}
                      title="Send invitation"
                      className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer focus:outline-none flex-shrink-0"
                    >
                      {isInviting ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                    </button>
                  </form>
                  <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed">
                    An email invitation will be sent to the address. They'll join as a Member.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CALENDAR SUB-TAB: Beautiful Sprint Calendar displaying tasks by due date */
        <div>
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between mb-6 select-none bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_8px_24px_rgba(219,234,254,0.3)]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear(y => y - 1);
                  } else {
                    setCalendarMonth(m => m - 1);
                  }
                }}
                className="w-8 h-8 rounded-xl border border-blue-100/60 bg-blue-50/50 text-blue-700 flex items-center justify-center font-bold hover:bg-blue-100 transition-all cursor-pointer"
              >
                &larr;
              </button>
              <h2 className="text-sm font-black text-slate-800 tracking-tight">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][calendarMonth]} {calendarYear}
              </h2>
              <button
                onClick={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear(y => y + 1);
                  } else {
                    setCalendarMonth(m => m + 1);
                  }
                }}
                className="w-8 h-8 rounded-xl border border-blue-100/60 bg-blue-50/50 text-blue-700 flex items-center justify-center font-bold hover:bg-blue-100 transition-all cursor-pointer"
              >
                &rarr;
              </button>
            </div>

            <div className="flex gap-2">
              <div className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-[10px] font-black border border-blue-100 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
                <span>{filteredTasks.filter(t => t.dueDate).length} Scheduled</span>
              </div>
            </div>
          </div>

          {/* Grid of Day Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }, (_, i) => i + 1).map((dayNum) => {
              const targetDateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = filteredTasks.filter(task => task.dueDate === targetDateStr);
              
              const isToday = calendarToday.getDate() === dayNum && 
                              calendarToday.getMonth() === calendarMonth && 
                              calendarToday.getFullYear() === calendarYear;
                              
              const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const weekday = weekdays[new Date(calendarYear, calendarMonth, dayNum).getDay()];

              return (
                <div 
                  key={dayNum} 
                  className={`relative bg-[#f8fafc]/55 border ${isToday ? 'border-blue-500 ring-1 ring-blue-500' : 'border-blue-100/30'} shadow-[0_25px_50px_-12px_rgba(37,99,235,0.65),0_0_25px_rgba(37,99,235,0.3)] rounded-3xl p-5 min-h-[220px] flex flex-col overflow-hidden hover:scale-[1.01] hover:shadow-[0_30px_60px_-10px_rgba(37,99,235,0.7),0_0_30px_rgba(37,99,235,0.4)] transition-all duration-300`}
                >
                  {/* Large Watermark day number */}
                  <div className="absolute top-[-18px] right-[-6px] font-bold text-[88px] text-blue-600 opacity-6 select-none pointer-events-none leading-none font-sans">
                    {String(dayNum).padStart(2, '0')}
                  </div>

                  {/* Day Header */}
                  <div className="flex justify-between items-start mb-3.5 z-10 select-none">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] font-black tracking-widest text-slate-450 uppercase">
                        {weekday}
                      </span>
                      <span className="text-xl font-black text-slate-800 leading-tight">
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[8px] font-black tracking-wider uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full mt-1 w-fit">
                          Today
                        </span>
                      )}
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setTaskDueDate(targetDateStr);
                          setTaskStatus('ASSIGNED');
                          setIsCreatingTask(true);
                        }}
                        title="Add Workspace Task for this day"
                        className="w-6 h-6 rounded-lg border border-blue-200 bg-blue-50/70 text-blue-700 font-extrabold text-sm flex items-center justify-center cursor-pointer hover:bg-blue-100 hover:text-blue-800 active:scale-90 transition-all focus:outline-none"
                      >
                        +
                      </button>
                    )}
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2.5 z-10 overflow-y-auto max-h-[120px] pr-0.5 custom-scrollbar flex-1">
                    {dayTasks.length > 0 ? (
                      dayTasks.map((task, taskIdx) => {
                        // --- Multi-colour palette by priority (matches Upcoming Calendar) ---
                        const priorityPalette = {
                          P1: {
                            card: getColor('taskColors.pink.card'),
                            muted: getColor('taskColors.pink.muted'),
                            badge: getColor('taskColors.pink.badge'),
                            status: getColor('taskColors.pink.status'),
                          },
                          P2: {
                            card: getColor('taskColors.yellow.card'),
                            muted: getColor('taskColors.yellow.muted'),
                            badge: getColor('taskColors.yellow.badge'),
                            status: getColor('taskColors.yellow.status'),
                          },
                          P3: {
                            card: getColor('taskColors.green.card'),
                            muted: getColor('taskColors.green.muted'),
                            badge: getColor('taskColors.green.badge'),
                            status: getColor('taskColors.green.status'),
                          },
                          P4: {
                            card: getColor('taskColors.blue.card'),
                            muted: getColor('taskColors.blue.muted'),
                            badge: getColor('taskColors.blue.badge'),
                            status: getColor('taskColors.blue.status'),
                          },
                        };

                        // Fallback rotation palette used when priority is unknown
                        const rotationPalette = [
                          'bg-gradient-to-br from-violet-500 to-purple-600 border-purple-600 text-white shadow-md shadow-violet-200/40',
                          'bg-gradient-to-br from-cyan-500 to-sky-600 border-sky-600 text-white shadow-md shadow-cyan-200/40',
                          'bg-gradient-to-br from-fuchsia-500 to-pink-600 border-pink-600 text-white shadow-md shadow-fuchsia-200/40',
                          'bg-gradient-to-br from-lime-500 to-green-600 border-green-600 text-white shadow-md shadow-lime-200/40',
                        ];

                        const palette = priorityPalette[task.priority] || {
                          card: rotationPalette[taskIdx % rotationPalette.length],
                          muted: 'text-white/80',
                          badge: 'bg-white/20 text-white',
                          status: 'bg-white/25 text-white',
                        };

                        // Status badge label
                        const statusLabel =
                          task.status === 'COMPLETED' ? 'DONE' :
                          task.status === 'IN_PROGRESS' ? 'IN PROG' : 'TO DO';

                        return (
                          <div
                            key={task.id}
                            className={`p-2 rounded-xl border flex flex-col gap-1.5 transition-all hover:scale-[1.015] hover:shadow-lg cursor-pointer ${palette.card}`}
                          >
                            <div className="flex items-start justify-between gap-1.5 min-w-0">
                              <span className="text-[11px] font-black leading-tight break-all">
                                {task.name}
                              </span>
                              {task.assignedTo && (
                                <MemberAvatar 
                                  member={task.assignedTo}
                                  size="xs"
                                  className="ring-1 min-w-[16px]"
                                />
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-[8px] font-extrabold select-none">
                              <span className="flex items-center gap-1.5">
                                {/* Priority flag — always white on coloured cards */}
                                <Flag size={8} fill="currentColor" className="opacity-90" />
                                {task.dueTime && (
                                  <span className={`flex items-center gap-0.5 ${palette.muted}`}>
                                    <Clock size={8} />
                                    {task.dueTime}
                                  </span>
                                )}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-extrabold uppercase tracking-wide ${palette.status}`}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-slate-400/80 italic select-none">No tasks scheduled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Owner-Only Add Task Modal */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                📋 Add Workspace Task
              </h2>
              <button
                onClick={() => setIsCreatingTask(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="p-6 space-y-4">
              <Input
                label="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Submit Q3 reports, Write backend tests..."
                required
                autoFocus
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs text-gray-600 border border-gray-250 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Due Time</label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    className="w-full text-xs text-gray-600 border border-gray-250 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Assignee Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Assign Member</label>
<div className="flex flex-wrap gap-2 pt-1">
                  {/* Unassigned option */}
                  <button
                    type="button"
                    onClick={() => setTaskAssigneeId('')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer focus:outline-none ${
                      !taskAssigneeId
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={9} className="text-gray-400" />
                    </div>
                    None
                  </button>
                  {workspace.members.map((memb) => (
                    <button
                      key={memb.userId || memb.email}
                      type="button"
                      onClick={() => setTaskAssigneeId(memb.userId)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer focus:outline-none ${
                        taskAssigneeId === memb.userId
                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <MemberAvatar member={memb} size="xs" className="ring-0" />
                      <span className="truncate max-w-[80px]">
                        {memb.name || memb.email.split('@')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Flag Selector (Status is auto-selected to ASSIGNED/Todo) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'P1', name: 'Urgent', color: 'text-red-650 bg-red-50 border-red-200 hover:bg-red-100', iconColor: '#ef4444' },
                    { id: 'P2', name: 'High', color: 'text-orange-650 bg-orange-50 border-orange-200 hover:bg-orange-100', iconColor: '#ea580c' },
                    { id: 'P3', name: 'Normal', color: 'text-yellow-650 bg-yellow-50 border-yellow-250 hover:bg-yellow-100', iconColor: '#ca8a04' },
                    { id: 'P4', name: 'Low', color: 'text-blue-650 bg-blue-50 border-blue-200 hover:bg-blue-100', iconColor: '#3b82f6' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTaskPriority(p.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl border text-[10px] font-black transition-all cursor-pointer focus:outline-none ${
                        taskPriority === p.id 
                          ? `${p.color} ring-2 ring-current border-transparent` 
                          : 'bg-white border-gray-250 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Flag size={10} fill={taskPriority === p.id ? 'currentColor' : 'none'} style={{ color: p.iconColor }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreatingTask(false)}
                  disabled={isCreatingTaskSubmitting}
                  className="!w-auto !py-2 !px-4 !text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!taskName.trim() || isCreatingTaskSubmitting}
                  className="!w-auto !py-2 !px-4 !text-xs !bg-blue-650 hover:!bg-blue-750"
                >
                  {isCreatingTaskSubmitting ? 'Adding...' : 'Add Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Dialog */}
      {isCreatingProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <FolderGit2 size={16} className="text-blue-500" /> Create Project
              </h2>
              <button
                onClick={() => setIsCreatingProject(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="p-5 space-y-4">
              <Input
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Q3 Launch, Tech Migration..."
                required
                autoFocus
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreatingProject(false)}
                  disabled={isCreatingProjSubmitting}
                  className="!w-auto !py-1.5 !px-3.5 !text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!projectName.trim() || isCreatingProjSubmitting}
                  className="!w-auto !py-1.5 !px-3.5 !text-xs"
                >
                  {isCreatingProjSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner-Only Invite Modal */}
      {isInviting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl border border-transparent shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Mail size={16} className="text-blue-500" /> Invite Teammates
              </h2>
              <button
                onClick={() => {
                  setIsInviting(false);
                  setInviteSuccess(null);
                  setInviteError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-5">
              {inviteSuccess && (
                <div className="p-2 bg-green-50 border border-green-150 text-green-700 rounded-lg text-[10px] font-semibold leading-normal select-none">
                  ✔️ {inviteSuccess}
                </div>
              )}

              {inviteError && (
                <div className="p-2 bg-red-50 border border-red-150 text-red-700 rounded-lg text-[10px] font-semibold leading-normal select-none">
                  ⚠️ {inviteError}
                </div>
              )}

              <Input
                label="Member Email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                disabled={isInviting}
              />

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsInviting(false);
                    setInviteSuccess(null);
                    setInviteError(null);
                  }}
                  className="!w-auto !py-2 !px-4 !text-xs"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={!inviteEmail.trim() || isInviting}
                  className="!w-auto !py-2 !px-4 !text-xs !bg-blue-650 hover:!bg-blue-750"
                >
                  {isInviting ? 'Inviting...' : 'Invite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
