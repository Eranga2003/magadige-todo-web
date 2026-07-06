import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, Plus, ArrowLeft, FolderGit2, Check, X, ShieldAlert, Key, 
  UserMinus, Calendar, Clock, AlertCircle, GripVertical, CheckCircle2, 
  HelpCircle, User 
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
      await loadWorkspaceDetails(); // Refresh members list
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
      await loadWorkspaceDetails(); // Refresh projects list
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

      // Find selected assignee details
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
      
      await loadWorkspaceTasks(); // Refresh tasks list
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

  // HTML5 Drag and Drop Handlers
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
    setDragOverColumn(null);
    if (!draggingTaskId) return;

    const taskToUpdate = tasks.find(t => t.id === draggingTaskId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;

    // Optimistically update status on UI
    setTasks(prev => prev.map(t => t.id === draggingTaskId ? { ...t, status: newStatus } : t));

    try {
      await workspaceService.updateWorkspaceTask(workspaceId, draggingTaskId, { status: newStatus });
      await loadWorkspaceTasks(); // Reload to sync updated completion times/alerts
    } catch (err) {
      console.error('❌ Failed to update status via drag & drop:', err.message);
      setError(err.message || 'Could not update task status.');
      // Rollback status
      setTasks(prev => prev.map(t => t.id === draggingTaskId ? { ...t, status: taskToUpdate.status } : t));
    }
  };

  // Helper to color-code priorities
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'border-pink-500 bg-pink-500';
      case 'P2': return 'border-amber-500 bg-amber-500';
      case 'P3': return 'border-emerald-600 bg-emerald-600';
      case 'P4': return 'border-blue-600 bg-blue-600';
      default: return 'border-gray-300 bg-gray-300';
    }
  };

  const renderKanbanColumn = (title, status, headerColorClass, columnBgColor) => {
    const columnTasks = tasks.filter(t => t.status === status);
    const isActive = dragOverColumn === status;

    return (
      <div 
        onDragOver={(e) => handleDragOver(e, status)}
        onDrop={(e) => handleDrop(e, status)}
        className={`flex flex-col flex-1 rounded-2xl p-4 transition-all min-h-[350px] border border-gray-150 ${columnBgColor} ${
          isActive ? 'ring-2 ring-blue-500/50 border-blue-400 bg-blue-50/20' : ''
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200/60">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${headerColorClass}`} />
            <h3 className="text-sm font-extrabold text-gray-800">{title}</h3>
          </div>
          <span className="text-[10px] font-extrabold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
            {columnTasks.length}
          </span>
        </div>

        {/* Column Cards */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[450px] pr-1">
          {columnTasks.length > 0 ? (
            columnTasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                className="bg-white border border-gray-150 rounded-xl p-3.5 shadow-xxs hover:shadow-md hover:border-gray-300 hover:scale-[1.01] transition-all cursor-grab active:cursor-grabbing group relative flex flex-col justify-between"
              >
                {/* Priority Color Strip */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-xl ${getPriorityColor(task.priority).split(' ')[1]}`} />
                
                <div>
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <h4 className="font-extrabold text-xs text-gray-900 leading-normal group-hover:text-blue-650 transition-colors">
                      {task.name}
                    </h4>
                    <span className="text-gray-400 group-hover:text-gray-600 cursor-grab">
                      <GripVertical size={13} />
                    </span>
                  </div>

                  {/* Due Date & Time badges */}
                  {(task.dueDate || task.dueTime) && (
                    <div className="flex flex-wrap items-center gap-2 pl-2 mt-2">
                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          <Calendar size={9} /> {task.dueDate}
                        </span>
                      )}
                      {task.dueTime && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          <Clock size={9} /> {task.dueTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-gray-50 pl-2">
                  {/* Priority Tag */}
                  <span className="text-[8px] font-extrabold uppercase text-gray-450 tracking-wider">
                    {task.priority} Priority
                  </span>

                  {/* Assignee Badge */}
                  {task.assignedTo ? (
                    <div 
                      title={`Assigned to ${task.assignedTo.email}`} 
                      className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[9px] flex items-center justify-center border border-blue-200 select-none shadow-xxs cursor-help"
                    >
                      {task.assignedTo.email.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div 
                      title="Unassigned" 
                      className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 font-extrabold text-[9px] flex items-center justify-center border border-gray-200 select-none"
                    >
                      ?
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 bg-gray-50/40 rounded-xl border border-dashed border-gray-200/80">
              <span className="text-gray-300 text-xs">📭 Empty column</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Navigation & Header */}
      <button
        onClick={onBackToWorkspaces}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-650 mb-4 transition-colors focus:outline-none cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Workspaces
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-650 text-white flex items-center justify-center font-extrabold text-2xl shadow-md select-none">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {workspace.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 select-none">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase text-[9px] border border-blue-100">
                {isOwner ? '👑 Owner' : '👥 Member'}
              </span>
              • Created on {new Date(workspace.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Button
              onClick={() => setIsCreatingTask(true)}
              icon={<Plus size={16} />}
              className="!w-auto !py-2 !px-4 !text-xs !bg-blue-600 hover:!bg-blue-750"
            >
              Add Workspace Task
            </Button>
          )}
          {isOwner && (
            <Button
              variant="secondary"
              onClick={() => setIsCreatingProject(true)}
              icon={<Plus size={16} />}
              className="!w-auto !py-2 !px-4 !text-xs"
            >
              New Project
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

      {/* 1. KANBAN BOARD SECTION */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            📋 Task Kanban Board
          </h2>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {!isOwner ? 'Your Tasks Only' : 'All Tasks'}
          </span>
        </div>

        {tasksLoading ? (
          <div className="w-full py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderKanbanColumn('Assigned', 'ASSIGNED', 'bg-blue-500', 'bg-slate-50/50')}
            {renderKanbanColumn('In Progress', 'IN_PROGRESS', 'bg-amber-500', 'bg-amber-50/10')}
            {renderKanbanColumn('Completed', 'COMPLETED', 'bg-emerald-600', 'bg-emerald-50/10')}
          </div>
        )}
      </div>

      {/* 2. Bottom Grid: Projects, Members & Invites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
        
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <FolderGit2 size={16} className="text-gray-400" /> Workspace Projects
            </h2>
            <span className="text-[10px] font-bold text-gray-400">
              {workspace.projects?.length || 0} total
            </span>
          </div>

          {workspace.projects && workspace.projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspace.projects.map((proj) => (
                <div 
                  key={proj.id}
                  className="bg-white border border-gray-150 rounded-xl p-4 shadow-xxs hover:shadow-sm hover:border-gray-300 transition-all flex items-center gap-3 select-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    📂
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-800 leading-normal">{proj.name}</h4>
                    <span className="text-[9px] text-gray-400">Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
              <p className="text-xs text-gray-550 italic">No projects created yet inside this workspace.</p>
            </div>
          )}
        </div>

        {/* Members & Invite Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-gray-400" /> Members
            </h2>
            <span className="text-[10px] font-bold text-gray-400">
              {workspace.members?.length || 1} joined
            </span>
          </div>

          {/* Members list */}
          <div className="space-y-2.5">
            {workspace.members.map((memb, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6.5 h-6.5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs select-none">
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
          {isOwner ? (
            <form onSubmit={handleInviteSubmit} className="bg-white border border-gray-150 rounded-2xl p-4 space-y-3 shadow-xxs">
              <h3 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5 select-none">
                <Mail size={13} className="text-blue-500" /> Invite Teammates
              </h3>
              
              {inviteSuccess && (
                <div className="p-2 bg-green-50 border border-green-150 text-green-700 rounded-lg text-[10px] font-semibold leading-normal">
                  ✔️ {inviteSuccess}
                </div>
              )}

              {inviteError && (
                <div className="p-2 bg-red-50 border border-red-150 text-red-700 rounded-lg text-[10px] font-semibold leading-normal">
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
          ) : (
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-[10px] text-gray-500 flex items-start gap-1.5 leading-relaxed select-none">
              <ShieldAlert size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span>Only the workspace owner can invite new members.</span>
            </div>
          )}
        </div>
      </div>

      {/* Owner-Only Add Task Modal */}
      {isCreatingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
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
                    <option value="P1">Pink (P1)</option>
                    <option value="P2">Yellow (P2)</option>
                    <option value="P3">Green (P3)</option>
                    <option value="P4">Blue (P4)</option>
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
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
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
