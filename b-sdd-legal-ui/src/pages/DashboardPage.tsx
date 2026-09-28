import React, { useEffect, useState } from 'react';
import { account, signOut, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT, Models } from '../lib/appwrite';
import {
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Server,
  KeyRound,
  ExternalLink,
  Layers,
  ArrowRight,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  onOpenCockpit?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenCockpit }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  // Auth Guard: On /dashboard, await account.get(). If it fails, redirect to /auth.
  useEffect(() => {
    let isMounted = true;

    async function checkAuthGuard() {
      try {
        const currentUser = await account.get();
        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (err) {
        // If authentication check fails, immediately redirect to /auth
        window.location.assign('/auth');
      }
    }

    checkAuthGuard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  // Run checks before rendering protected UI
  if (loading || !user) {
    return (
      <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Verifying session via Appwrite Guard...</p>
        </div>
      </div>
    );
  }

  const displayName = user.name && user.name.trim().length > 0 ? user.name : user.email;

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">B-SDD Legal UI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-300">
                Dashboard
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Appwrite Sovereign Authenticated Session</p>
          </div>
        </div>

        {/* Sign Out CTA in Topbar */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* User Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#0F172A] border border-blue-600/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 text-xl font-bold font-mono">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[11px] font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Google OAuth2 Verified</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                <p className="text-xs font-mono text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onOpenCockpit && (
                <button
                  type="button"
                  onClick={onOpenCockpit}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-900/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Launch Legal Cockpit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informational Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: User Identity Card */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-blue-400" />
              <span>Identity Profile</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">User ID</span>
                <span className="font-mono text-slate-200 text-[11px] break-all">{user.$id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Registered Email</span>
                <span className="text-slate-200 text-[11px] font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Account Created</span>
                <span className="text-slate-300 text-[11px] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {new Date(user.$createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Appwrite Project Specs */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs border-b border-slate-800 pb-3">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Appwrite Cloud Backend</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Project ID</span>
                <span className="font-mono text-blue-300 text-[11px]">{APPWRITE_PROJECT_ID}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Cloud Endpoint</span>
                <span className="font-mono text-slate-300 text-[11px] truncate block">
                  {APPWRITE_ENDPOINT}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">OAuth Provider</span>
                <span className="text-slate-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Google Identity Services (Web)
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Security & Compliance Guard */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sovereign Guard Status</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Session Protocol</span>
                <span className="text-emerald-400 font-semibold text-[11px]">
                  Token Flow OAuth2 Session
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Judicial Jurisdiction</span>
                <span className="text-slate-300 text-[11px]">Art. 73 CPP · PE24.014624-SBA</span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full py-2 px-3 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/80 text-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isSigningOut ? 'Ending session...' : 'Sign out of Dashboard'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-[11px] font-mono text-slate-500">
        B-SDD Legal UI · Sovereign Forensic Engine · Appwrite Project {APPWRITE_PROJECT_ID}
      </footer>
    </div>
  );
};
