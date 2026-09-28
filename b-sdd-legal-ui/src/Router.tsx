import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { AuthSuccessPage } from './pages/AuthSuccessPage';
import { AuthFailurePage } from './pages/AuthFailurePage';
import { DashboardPage } from './pages/DashboardPage';
import App from './App';
import { account } from './lib/appwrite';
import { Loader2 } from 'lucide-react';

const RootGuardRedirect: React.FC = () => {
  useEffect(() => {
    account
      .get()
      .then(() => {
        window.location.assign('/dashboard');
      })
      .catch(() => {
        window.location.assign('/auth');
      });
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Initializing Appwrite route guard...</p>
      </div>
    </div>
  );
};

export const Router: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.replace(/\/+$/, '') || '/';
    }
    return '/';
  });

  const [showCockpit, setShowCockpit] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.replace(/\/+$/, '') || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // First-party route: /auth
  if (currentPath === '/auth') {
    return <AuthPage />;
  }

  // First-party route: /auth/success
  if (currentPath === '/auth/success') {
    return <AuthSuccessPage />;
  }

  // First-party route: /auth/failure
  if (currentPath === '/auth/failure') {
    return <AuthFailurePage />;
  }

  // First-party route: /dashboard
  if (currentPath === '/dashboard') {
    if (showCockpit) {
      return (
        <div className="relative min-h-screen">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs z-50 sticky top-0">
            <span className="font-mono text-slate-400">B-SDD Sovereign Legal Cockpit Mode</span>
            <button
              type="button"
              onClick={() => setShowCockpit(false)}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline flex items-center gap-1.5"
            >
              <span>← Back to Appwrite Dashboard</span>
            </button>
          </div>
          <App />
        </div>
      );
    }
    return <DashboardPage onOpenCockpit={() => setShowCockpit(true)} />;
  }

  // First-party route: /cockpit
  if (currentPath === '/cockpit') {
    return (
      <div className="relative min-h-screen">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs z-50 sticky top-0">
          <span className="font-mono text-slate-400">B-SDD Sovereign Legal Cockpit Mode</span>
          <button
            type="button"
            onClick={() => window.location.assign('/dashboard')}
            className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline flex items-center gap-1.5"
          >
            <span>← Back to Appwrite Dashboard</span>
          </button>
        </div>
        <App />
      </div>
    );
  }

  // Root or unrecognized routes: Route Guard evaluates session
  return <RootGuardRedirect />;
};
