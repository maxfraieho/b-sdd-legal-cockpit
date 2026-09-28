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
        window.location.replace('/dashboard');
      })
      .catch(() => {
        window.location.replace('/auth');
      });
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Перевірка доступу Appwrite...</p>
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

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.replace(/\/+$/, '') || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // First-party route: /auth (Signed-out screen)
  if (currentPath === '/auth') {
    return <AuthPage />;
  }

  // First-party route: /auth/success (Token callback, seamless redirect)
  if (currentPath === '/auth/success') {
    return <AuthSuccessPage />;
  }

  // First-party route: /auth/failure (Error screen with link back to /auth)
  if (currentPath === '/auth/failure') {
    return <AuthFailurePage />;
  }

  // Main Dashboard route: /dashboard or /cockpit -> Directly renders the full B-SDD Legal Cockpit!
  if (currentPath === '/dashboard' || currentPath === '/cockpit') {
    return <App />;
  }

  // Profile / Appwrite details view
  if (currentPath === '/profile') {
    return <DashboardPage onOpenCockpit={() => window.location.assign('/dashboard')} />;
  }

  // Root or unrecognized routes: Route Guard evaluates session
  return <RootGuardRedirect />;
};
