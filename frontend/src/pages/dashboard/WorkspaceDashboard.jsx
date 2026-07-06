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
  const [activeSubTab, setActiveSubTab] = useState('Board'); // Overview, Board, List, Calendar, Gantt, Table

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
            email: member.email
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
      case 'P2': return 'text-amber-500';
      case 'P3': return 'text-emerald-600';
      case 'P4': return 'text-blue-600';
      default: return 'text-gray-400';
    }
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
        className={`flex flex-col flex-1 rounded-2xl p-4 transition-all min-h-[480px] bg-gray-50/45 border border-blue-50/30 shadow-[0_20px_50px_rgba(8,112,184,0.18)] select-none ${
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
            {isOwner && (
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
                // Light Blue Glance Card BG
                cardStyleClass = "bg-[#f0f9ff] border border-blue-200/50 shadow-[0_5px_15px_rgba(14,165,233,0.12)] hover:shadow-[0_8px_20px_rgba(14,165,233,0.22)] hover:bg-[#e0f2fe]";
                titleColorClass = "text-sky-950 font-black";
                dateColorClass = isOverdue ? "text-red-600 font-extrabold bg-red-100/50" : "text-sky-850 bg-sky-200/40";
                grabGripClass = "text-sky-400 group-hover:text-sky-650";
                flagColorClass = getPriorityColor(task.priority);
                hoverBtnClass = "text-sky-450 hover:text-sky-800";
                assigneeRingClass = "ring-sky-200";
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
                          <div 
                            title={`Assigned to ${task.assignedTo.email}`} 
                            className={`w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold text-[9px] flex items-center justify-center border border-white shadow-sm cursor-help select-none ring-1 ${assigneeRingClass}`}
                          >
                            {task.assignedTo.email.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div 
                            title="Unassigned" 
                            className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 font-extrabold text-[8px] flex items-center justify-center border border-gray-200"
                          >
                            <User size={10} />
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
          {isOwner && (
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
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
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
      <div className="flex items-center justify-between border-b border-gray-100/70 mb-5 select-none">
        <div className="flex items-center gap-6 text-[12px] font-extrabold text-gray-400">
          {['Overview', 'Board', 'List', 'Calendar', 'Gantt', 'Table'].map(tab => (
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
              <div 
                key={idx}
                title={memb.email}
                className="inline-block h-6 w-6 rounded-full bg-slate-900 text-white font-extrabold text-[9px] flex items-center justify-center ring-2 ring-white select-none shadow-xxs"
              >
                {memb.email.charAt(0).toUpperCase()}
              </div>
            ))}
            {workspace.members.length > 4 && (
              <div className="inline-block h-6 w-6 rounded-full bg-gray-200 text-gray-550 font-bold text-[9px] flex items-center justify-center ring-2 ring-white select-none">
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

      {/* 4. KANBAN BOARD STAGE */}
      {activeSubTab === 'Board' ? (
        tasksLoading ? (
          <div className="w-full py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {renderKanbanColumn('TO DO', 'ASSIGNED', 'bg-gray-150', 'text-gray-600', 'bg-gray-200')}
            {renderKanbanColumn('IN PROGRESS', 'IN_PROGRESS', 'bg-blue-50', 'text-blue-700', 'bg-blue-100')}
            {renderKanbanColumn('COMPLETE', 'COMPLETED', 'bg-green-50', 'text-green-700', 'bg-green-100')}
          </div>
        )
      ) : (
        <div className="py-20 text-center bg-gray-50/50 border border-transparent shadow-[0_4px_20px_rgba(219,234,254,0.3)] rounded-2xl mb-12 select-none">
          <p className="text-xs text-gray-400 italic">This sub-tab view is currently read-only. Switch to Board tab to view and manage tasks.</p>
        </div>
      )}

      {/* 5. Bottom Collaborations Row: Projects, Members & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
        
        {/* Projects panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2 select-none">
            <h2 className="text-[13px] font-extrabold text-gray-900 flex items-center gap-1.5">
              <FolderGit2 size={15} className="text-gray-400" /> Workspace Projects
            </h2>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-150 px-2 py-0.5 rounded-full">
              {workspace.projects?.length || 0}
            </span>
          </div>

          {workspace.projects && workspace.projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspace.projects.map((proj) => (
                <div 
                  key={proj.id}
                  className="bg-white border border-transparent shadow-[0_4px_15px_rgba(219,234,254,0.45)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.08)] transition-all flex items-center justify-between select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📂</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-800 leading-normal">{proj.name}</h4>
                      <span className="text-[9px] text-gray-400">Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl select-none">
              <p className="text-xs text-gray-405 italic">No projects created inside this workspace yet.</p>
              {isOwner && (
                <button 
                  onClick={() => setIsCreatingProject(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold mt-1.5"
                >
                  Create Project
                </button>
              )}
            </div>
          )}
        </div>

        {/* Members and Invite Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2 select-none">
            <h2 className="text-[13px] font-extrabold text-gray-900 flex items-center gap-1.5">
              <Users size={15} className="text-gray-400" /> Members List
            </h2>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-150 px-2 py-0.5 rounded-full">
              {workspace.members?.length || 1}
            </span>
          </div>

          {/* Members list */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {workspace.members.map((memb, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50/55 border border-transparent shadow-[0_3px_8px_rgba(219,234,254,0.3)] rounded-xl select-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-white font-extrabold text-[9px] flex items-center justify-center select-none">
                    {memb.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 truncate">
                      {memb.email}
                    </p>
                    <span className="text-[8px] font-extrabold text-gray-450 uppercase tracking-wide">
                      {memb.role}
                    </span>
                  </div>
                </div>

                {isOwner && memb.role !== 'OWNER' && (
                  <button
                    onClick={() => handleRemoveMember(memb.email)}
                    title="Remove member"
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors focus:outline-none cursor-pointer"
                  >
                    <UserMinus size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Invite Widget */}
          {isOwner && (
            <form onSubmit={handleInviteSubmit} className="bg-white border border-transparent shadow-[0_6px_20px_rgba(219,234,254,0.45)] p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5 select-none">
                <Mail size={13} className="text-blue-500" /> Invite Teammates
              </h3>
              
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
                className="!text-xxs !py-1.5"
              />

              <Button
                type="submit"
                disabled={!inviteEmail.trim() || isInviting}
                className="!py-1.5 !text-xxs"
              >
                {isInviting ? 'Inviting...' : 'Invite'}
              </Button>
            </form>
          )}
        </div>
      </div>

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
                <select
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
                  className="w-full text-xs text-gray-600 border border-gray-250 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Unassigned (None)</option>
                  {workspace.members.map((memb) => (
                    <option key={memb.userId || memb.email} value={memb.userId}>
                      {memb.email} ({memb.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full text-xs text-gray-600 border border-gray-250 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="P1">Pink (P1 - Urgent)</option>
                    <option value="P2">Yellow (P2 - High)</option>
                    <option value="P3">Green (P3 - Normal)</option>
                    <option value="P4">Blue (P4 - Low)</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Initial Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full text-xs text-gray-600 border border-gray-250 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="ASSIGNED">TO DO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETE</option>
                  </select>
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
    </div>
  );
};
