import React, { useState, useEffect } from 'react';
import { Users, Plus, LayoutGrid, FolderGit2, X, Briefcase, FileText, ChevronRight } from 'lucide-react';
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
        // Reload list and auto-open new workspace
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
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400">Loading workspaces...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-black">Workspaces</h1>
          {workspaces.length > 0 && (
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {workspaces.length} total
            </span>
          )}
        </div>
        {workspaces.length > 0 && (
          <Button
            onClick={() => setIsCreating(true)}
            icon={<Plus size={16} />}
            className="!w-auto !py-2 !px-4 !text-xs"
          >
            Create Workspace
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Main Content Area */}
      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkspace(ws.id)}
              className="bg-white border border-gray-150 rounded-2xl p-5 hover:shadow-md hover:border-blue-400/50 hover:scale-[1.01] transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top decoration */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-sky-400`} />
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-extrabold text-lg shadow-sm">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-blue-650 transition-colors leading-tight">
                      {ws.name}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {ws.members?.length || 1} member{(ws.members?.length || 1) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {ws.description ? (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pt-1">
                    {ws.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic pt-1">No description provided.</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 size={13} className="text-gray-400" />
                  {ws.projects?.length || 0} project{ws.projects?.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Enter Workspace <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        !isCreating && (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-blue-50/50 flex items-center justify-center animate-pulse-slow">
                <div className="w-20 h-20 bg-white border border-gray-150 rounded-2xl flex items-center justify-center shadow-md">
                  <Users size={36} className="text-blue-500" />
                </div>
              </div>
              <span className="absolute top-2 right-2 text-yellow-400 animate-bounce">✦</span>
              <span className="absolute bottom-4 left-2 text-sky-400 animate-pulse">✨</span>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">No workspaces found</h2>
            <p className="text-sm text-gray-550 max-w-sm mb-6 leading-relaxed">
              Create your first workspace to start collaborating, organizing projects, and inviting teammates.
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              icon={<Plus size={18} />}
              className="!w-auto !px-6"
            >
              Create Workspace
            </Button>
          </div>
        )
      )}

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-500" /> Create Workspace
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <Input
                label="Workspace Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marketing Team, Dev Squad..."
                required
                autoFocus
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Workspace Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this workspace..."
                  className="w-full text-xs text-gray-600 border border-gray-250 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none bg-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-6">
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
                  className="!w-auto !py-2 !px-4 !text-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
