import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { AuthSuccessPage } from './pages/AuthSuccessPage';
import { AuthFailurePage } from './pages/AuthFailurePage';
import { DashboardPage } from './pages/DashboardPage';
import { AequitasLandingPage } from './pages/AequitasLandingPage';
import App from './App';

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

  // Presentation Landing Page: / (root) or /aequitas or /presentation
  if (currentPath === '/' || currentPath === '/aequitas' || currentPath === '/presentation' || currentPath === '/landing') {
    return <AequitasLandingPage />;
  }

  // Sovereign Workbench / Cockpit / Dashboard
  if (currentPath === '/dashboard' || currentPath === '/cockpit') {
    return <App />;
  }

  // Profile / Appwrite details view
  if (currentPath === '/profile') {
    return <DashboardPage onOpenCockpit={() => {
      window.history.pushState({}, '', '/cockpit');
      setCurrentPath('/cockpit');
    }} />;
  }

  // Default fallback: render App protected by AuthGate
  return <App />;
};
