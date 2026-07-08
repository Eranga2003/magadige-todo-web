import React, { useState, useEffect } from 'react';
import { Users, Plus, LayoutGrid, FolderGit2, X, Briefcase, FileText, ChevronRight, Star, AlertCircle, Compass, ClipboardList, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { getColor } from '../../utils/color';
import { workspaceService } from '../../services/api';

export const WorkspacePage = ({ onSelectWorkspace }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Creation modal state
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceService.getWorkspaces();
      if (res && res.data) {
        setWorkspaces(res.data);
      }
    } catch (err) {
      console.error('❌ Failed to load workspaces:', err.message);
      setError(err.message || 'Failed to retrieve workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await workspaceService.createWorkspace({
        name: name.trim(),
        description: description.trim()
      });
      if (res && res.data) {
        setIsCreating(false);
        setName('');
        setDescription('');
        loadWorkspaces();
        if (onSelectWorkspace) {
          onSelectWorkspace(res.data.id);
        }
      }
    } catch (err) {
      console.error('❌ Failed to create workspace:', err.message);
      setError(err.message || 'Could not create workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[85vh] flex flex-col items-center justify-center bg-gray-50/50 select-none">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400 animate-pulse">Loading workspaces...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[85vh] bg-[#fcfdfe] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 select-none">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Workspaces</h1>
              {workspaces.length > 0 && (
                <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {workspaces.length} Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Manage, collaborate, and assign tasks inside team spaces.</p>
          </div>
          
          {workspaces.length > 0 && (
            <Button
              onClick={() => setIsCreating(true)}
              icon={<Plus size={14} />}
              className="!w-full sm:!w-auto !py-1.5 !px-3.5 !text-xs !bg-blue-600 hover:!bg-blue-750 shadow-sm"
            >
              Create Workspace
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-center justify-between shadow-xxs">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 focus:outline-none">✕</button>
          </div>
        )}

        {workspaces.length > 0 ? (
          /* Dual column layout to fill whitespace */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left column: Workspaces list (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => onSelectWorkspace(ws.id)}
                    className="bg-white border border-transparent shadow-md shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/70 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden h-[165px]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm select-none">
                            {ws.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[11.5px] text-slate-800 group-hover:text-blue-650 transition-colors leading-tight">
                              {ws.name}
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400">
                              Created Room
                            </span>
                          </div>
                        </div>
                        
                        <span className="text-gray-300 hover:text-yellow-400 transition-colors">
                          <Star size={12} />
                        </span>
                      </div>

                      {ws.description ? (
                        <p className="text-[10.5px] text-gray-500 leading-normal line-clamp-2 pt-0.5">
                          {ws.description}
                        </p>
                      ) : (
                        <p className="text-[10.5px] text-gray-405 italic pt-0.5">No description provided for this room.</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-gray-50 text-[10px] font-bold text-gray-400 select-none">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FolderGit2 size={11} className="text-gray-450" />
                          {ws.projects?.length || 0} proj
                        </span>
                        
                        {ws.members && ws.members.length > 0 && (
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {ws.members.slice(0, 3).map((memb, idx) => (
                              <div 
                                key={idx} 
                                className="w-4.5 h-4.5 rounded-full bg-slate-900 text-white font-extrabold text-[7px] flex items-center justify-center ring-2 ring-white"
                                title={memb.email}
                              >
                                {memb.email.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {ws.members.length > 3 && (
                              <div className="w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-600 font-bold text-[7px] flex items-center justify-center ring-2 ring-white">
                                +{ws.members.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <span className="flex items-center gap-0.5 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all">
                        Enter Room <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: Quick Guide & Activity onboarding (1/3 width) */}
            <div className="space-y-4 select-none">
              <div className="bg-white border border-transparent shadow-lg shadow-blue-100/50 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Compass size={14} className="text-blue-500" /> Getting Started Guide
                </h3>
                <p className="text-[11px] text-gray-450 leading-relaxed">
                  Collaborate in real time with your team inside collaborative workspaces. Here are a few workspace tips:
                </p>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                      <ClipboardList size={13} />
                    </span>
                    <div>
                      <h4 className="font-bold text-[11px] text-gray-800">Task Kanban Board</h4>
                      <p className="text-[10px] text-gray-450 leading-relaxed mt-0.5">Create workspace tasks, select assignees, and slide cards across TO DO, IN PROGRESS, and COMPLETE statuses.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <Send size={13} />
                    </span>
                    <div>
                      <h4 className="font-bold text-[11px] text-gray-800">Email Notifications</h4>
                      <p className="text-[10px] text-gray-450 leading-relaxed mt-0.5">SMTP mailing is active. Members get notified when assigned tasks; owners get alerts on completion.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="p-1.5 rounded-xl bg-purple-50 text-purple-650">
                      <FolderGit2 size={13} />
                    </span>
                    <div>
                      <h4 className="font-bold text-[11px] text-gray-800">Workspace Projects</h4>
                      <p className="text-[10px] text-gray-455 leading-relaxed mt-0.5">Owners can create custom projects directly inside the space to keep tasks cleanly organized.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Empty State */
          !isCreating && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-50/45 rounded-3xl border border-gray-150/70 relative overflow-hidden select-none">
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-blue-50/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-sky-50/30 blur-2xl pointer-events-none" />

              <div className="relative mb-6">
                <div className="w-20 h-20 bg-white border border-gray-150 rounded-2xl flex items-center justify-center shadow-md z-10 hover:rotate-1 transition-transform">
                  <Users size={32} className="text-blue-600" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 text-yellow-400 animate-bounce text-sm">✦</span>
                <span className="absolute -bottom-1 -left-1 text-sky-400 animate-pulse text-sm">✨</span>
              </div>

              <h2 className="text-base font-extrabold text-slate-800 mb-1">Create your first Workspace</h2>
              <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
                Organize projects, assign tasks on Kanban boards, and collaborate with your teammates in real time.
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                icon={<Plus size={15} />}
                className="!w-auto !px-6 !py-2.5 !bg-blue-650 hover:!bg-blue-750 shadow-sm"
              >
                Get Started
              </Button>
            </div>
          )
        )}
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-500" /> New Workspace
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              <Input
                label="Workspace Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Design, Marketing Campaign..."
                required
                autoFocus
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide">Workspace Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this team room..."
                  className="w-full text-xs text-gray-600 border border-gray-250 rounded-xl p-3 h-24 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-gray-450 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreating(false)}
                  disabled={isSubmitting}
                  className="!w-auto !py-2 !px-4 !text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || isSubmitting}
                  className="!w-auto !py-2 !px-4 !text-xs !bg-blue-650 hover:!bg-blue-750"
                >
                  {isSubmitting ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
