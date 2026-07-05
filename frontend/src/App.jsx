import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { getColor } from './utils/color';
import { workspaceService } from './services/api';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('login');
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [inviteWsName, setInviteWsName] = useState('');
  const [isVerifyingInvite, setIsVerifyingInvite] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  // 1. Detect invite token on load & validate it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('inviteToken');
    if (token) {
      setInviteToken(token);
      setIsVerifyingInvite(true);
      // Clean query params from URL bar immediately for aesthetics
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      workspaceService.validateToken(token)
        .then((res) => {
          if (res.status === 'success') {
            setPrefilledEmail(res.data.email);
            setInviteWsName(res.data.workspaceName);
            setView('register'); // Send to registration
            // Cache token locally to accept it post-auth
            localStorage.setItem('magadige_invite_token', token);
          }
        })
        .catch((err) => {
          console.error('❌ Invitation validation failed:', err.message);
          setInviteError(err.message);
        })
        .finally(() => {
          setIsVerifyingInvite(false);
        });
    }
  }, []);

  // 2. Auto-accept invitation if logged in/registration finishes
  useEffect(() => {
    if (isAuthenticated) {
      const cachedToken = localStorage.getItem('magadige_invite_token');
      if (cachedToken) {
        workspaceService.acceptInvitation(cachedToken)
          .then((res) => {
            console.log('✅ Invitation accepted post-auth:', res.message);
            if (res.data && res.data.workspaceId) {
              localStorage.setItem('magadige_active_workspace_id', res.data.workspaceId);
            }
          })
          .catch((err) => {
            console.error('❌ Failed to accept invitation post-auth:', err.message);
          })
          .finally(() => {
            localStorage.removeItem('magadige_invite_token');
          });
      }
    }
  }, [isAuthenticated]);

  if (loading || isVerifyingInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className={`w-16 h-16 border-4 ${getColor('primary.borderLight')} border-t-blue-600 rounded-full animate-spin`}></div>
          <div className={`absolute ${getColor('primary.text')} font-extrabold text-sm`}>M</div>
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-500 animate-pulse">
          {isVerifyingInvite ? 'Verifying invitation link...' : 'Securing workspace session...'}
        </p>
        {inviteError && (
          <p className="mt-2 text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
            ⚠️ {inviteError}
          </p>
        )}
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return view === 'login' ? (
    <LoginPage 
      onNavigateToRegister={() => setView('register')} 
      prefilledEmail={prefilledEmail}
    />
  ) : (
    <RegisterPage 
      onNavigateToLogin={() => setView('login')} 
      prefilledEmail={prefilledEmail}
      inviteWsName={inviteWsName}
    />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
