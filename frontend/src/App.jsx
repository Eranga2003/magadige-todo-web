import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute text-orange-500 font-extrabold text-sm">M</div>
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-500 animate-pulse">
          Securing workspace session...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return view === 'login' ? (
    <LoginPage onNavigateToRegister={() => setView('register')} />
  ) : (
    <RegisterPage onNavigateToLogin={() => setView('login')} />
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
