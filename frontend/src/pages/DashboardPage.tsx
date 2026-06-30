import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { User, ShieldAlert, LogOut, CheckCircle2, FileText, Smartphone } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-100">
              M
            </div>
            <span className="text-xl font-extrabold text-black tracking-tight">Magadige</span>
            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-200">
              Auth Demo
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-800">{user.name}</span>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              icon={<LogOut size={16} />}
              className="!py-2 !px-4 !text-sm border-gray-200 hover:border-orange-500 !text-gray-700 hover:!text-orange-500"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
        <div className="bg-white p-8 sm:p-10 border border-gray-100 rounded-2xl shadow-xl w-full text-center space-y-8">
          
          {/* Welcome Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-600 mb-2">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>
            <h1 className="text-4xl font-extrabold text-black tracking-tight">
              Hello, {user.name}!
            </h1>
            <p className="text-lg text-gray-500">
              Your security-hardened session is active.
            </p>
          </div>

          {/* Account Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 text-orange-600 font-bold text-base">
                <User size={20} />
                <span>Account Profile</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 font-medium">
                <li>
                  <span className="text-gray-400 font-normal">Account ID:</span>{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-xs text-black">
                    {user.id}
                  </code>
                </li>
                <li>
                  <span className="text-gray-400 font-normal">Email:</span>{' '}
                  <span className="text-black font-semibold">{user.email || 'Linked via Social Sign-in'}</span>
                </li>
                <li>
                  <span className="text-gray-400 font-normal">Joined:</span>{' '}
                  <span className="text-black font-semibold">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 text-orange-600 font-bold text-base">
                <ShieldAlert size={20} />
                <span>Onboarding Insights</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-white rounded-lg border border-gray-200 text-orange-500 mt-0.5">
                    {user.usageType === 'TEAM' ? <CheckCircle2 size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <span className="text-gray-400 font-normal block text-xs">Workspace Intended For</span>
                    <span className="text-black font-semibold">
                      {user.usageType === 'TEAM' ? 'Team Collaboration' : 'Personal Usage'}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-white rounded-lg border border-gray-200 text-orange-500 mt-0.5">
                    {user.currentManagementMethod === 'PAPER' ? <FileText size={16} /> : <Smartphone size={16} />}
                  </div>
                  <div>
                    <span className="text-gray-400 font-normal block text-xs">Previous Task Method</span>
                    <span className="text-black font-semibold">
                      {user.currentManagementMethod === 'PAPER' ? 'Writing on Paper' : 'Using another App'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-sm font-semibold text-orange-800 text-center">
            🔒 All JSON Web Tokens are verified, passwords hashed, and CORS channels restricted.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        © 2026 Magadige AI Productivity Assistant. Developed securely with clean architecture.
      </footer>
    </div>
  );
};
