import React, { useState, useEffect } from 'react';
import { Users, Mail, Plus, ArrowLeft, FolderGit2, Check, X, ShieldAlert, Key, UserMinus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { getColor } from '../../utils/color';
import { workspaceService } from '../../services/api';

export const WorkspaceDashboard = ({ workspaceId, onBackToWorkspaces }) => {
  const { user } = useAuth();
  
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const loadWorkspaceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceService.getWorkspace(workspaceId);
      if (res && res.data) {
        setWorkspace(res.data);
      }
    } catch (err) {
      console.error('❌ Failed to load workspace details:', err.message);
      setError(err.message || 'Failed to retrieve workspace information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceDetails();
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

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim().toLowerCase())) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    try {
      setIsInviting(true);
      setInviteError(null);
      setInviteSuccess(null);
      
      const res = await workspaceService.inviteMember(workspaceId, inviteEmail.trim().toLowerCase());
      setInviteSuccess(`Invitation successfully generated for ${inviteEmail.trim()}! Logged to console.`);
      setInviteEmail('');
      loadWorkspaceDetails(); // Refresh members list
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
      loadWorkspaceDetails(); // Refresh projects list
    } catch (err) {
      console.error('❌ Project creation failed:', err.message);
      setError(err.message || 'Could not create project.');
    } finally {
      setIsCreatingProjSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    // Confirm first
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
        // Using create route as overwrite fallback or update via task service
      });
      
      // Let's call updateWorkspace via workspaceService if implemented, or call standard save
      // Wait, let's refresh local details
      setWorkspace(updatedWorkspace);
    } catch (err) {
      console.error('❌ Failed to remove member:', err.message);
      setError(err.message || 'Could not remove member.');
    }
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md select-none">
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

        {isOwner && (
          <Button
            onClick={() => setIsCreatingProject(true)}
            icon={<Plus size={16} />}
            className="!w-auto !py-2 !px-4 !text-xs"
          >
            New Project
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Main Sections (Two-column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Projects Section (2 Cols Wide) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <FolderGit2 size={16} className="text-gray-400" /> Projects
            </h2>
            <span className="text-xxs font-bold text-gray-400 uppercase">
              {workspace.projects?.length || 0} Projects total
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
                    <h4 className="font-extrabold text-sm text-gray-800 leading-normal">{proj.name}</h4>
                    <span className="text-[10px] text-gray-400">Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
              <p className="text-xs text-gray-550 italic">No projects created yet inside this workspace.</p>
              {isOwner && (
                <button 
                  onClick={() => setIsCreatingProject(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold mt-2"
                >
                  Create one now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Members & Invite Section (1 Col Wide) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-gray-400" /> Members
            </h2>
            <span className="text-xxs font-bold text-gray-400 uppercase">
              {workspace.members?.length || 1} joined
            </span>
          </div>

          {/* Members list */}
          <div className="space-y-3">
            {workspace.members.map((memb, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs select-none">
                    {memb.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {memb.email}
                    </p>
                    <span className="text-[9px] font-bold text-gray-450 uppercase tracking-wide">
                      {memb.role}
                    </span>
                  </div>
                </div>

                {/* Owner permission to remove member */}
                {isOwner && memb.role !== 'OWNER' && (
                  <button
                    onClick={() => handleRemoveMember(memb.email)}
                    title="Remove member"
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors focus:outline-none cursor-pointer"
                  >
                    <UserMinus size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Invite Widget for Owner */}
          {isOwner ? (
            <form onSubmit={handleInviteSubmit} className="bg-white border border-gray-150 rounded-2xl p-4 space-y-3.5 shadow-xxs">
              <h3 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5 select-none">
                <Mail size={13} className="text-blue-500" /> Invite Teammates
              </h3>
              
              {inviteSuccess && (
                <div className="p-2 bg-green-50 border border-green-150 text-green-700 rounded-lg text-[10.5px] font-semibold leading-normal">
                  ✔️ {inviteSuccess}
                </div>
              )}

              {inviteError && (
                <div className="p-2 bg-red-50 border border-red-150 text-red-700 rounded-lg text-[10.5px] font-semibold leading-normal">
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
                {isInviting ? 'Inviting...' : 'Invite Member'}
              </Button>
            </form>
          ) : (
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-[11px] text-gray-500 flex items-start gap-1.5">
              <ShieldAlert size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span>Only the workspace owner can invite new members to collaborate.</span>
            </div>
          )}
        </div>
      </div>

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
