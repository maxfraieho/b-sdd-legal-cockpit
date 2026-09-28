import React, { useEffect, useState } from 'react';
import { account, signInWithProvider } from '../lib/appwrite';
import { Shield, Loader2, AlertCircle, Scale } from 'lucide-react';

export const GoogleProviderIcon = ({ className = 'w-6 h-6 shrink-0' }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.7034 7.91133C14.7554 7.02509 13.4903 6.54228 12.1813 6.56212C9.78605 6.56212 7.75176 8.14611 7.02642 10.279V10.2791C6.64183 11.3968 6.64183 12.6071 7.02642 13.7249H7.02979C7.75849 15.8545 9.78941 17.4385 12.1847 17.4385C13.4211 17.4385 14.4826 17.1285 15.3053 16.5809V16.5787C16.2735 15.9504 16.9348 14.9616 17.1406 13.8439H12.1813V10.3783H20.8414C20.9494 10.9802 21 11.5952 21 12.207C21 14.9443 20.002 17.2586 18.2655 18.826L18.2673 18.8274C16.7458 20.203 14.6576 21 12.1813 21C8.70985 21 5.53527 19.082 3.97666 16.043V16.043C2.67445 13.5 2.67445 10.5039 3.97666 7.96096H3.97668L3.97666 7.96094C5.53527 4.9186 8.70985 3.00061 12.1813 3.00061C14.4619 2.97415 16.6649 3.8141 18.3247 5.34188L15.7034 7.91133Z"
      fill="#C4C6D7"
    />
  </svg>
);

export const AuthPage: React.FC = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth Guard: On /auth, await account.get(). If it succeeds, redirect to /dashboard.
  useEffect(() => {
    let isMounted = true;

    async function checkAuthGuard() {
      try {
        const user = await account.get();
        if (user && isMounted) {
          window.location.assign('/dashboard');
          return;
        }
      } catch {
        // Not authenticated, user remains on /auth screen
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    }

    checkAuthGuard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      // createOAuth2Session navigates the browser to the provider; do not redirect manually.
      await signInWithProvider();
    } catch (err: any) {
      setIsSigningIn(false);
      setErrorMessage(
        err?.message || 'Failed to initiate Google OAuth2 session with Appwrite.'
      );
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Verifying Appwrite session guard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background ambient accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md bg-[#0F172A]/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Header badge */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">B-SDD Legal UI</h1>
              <p className="text-[10px] font-mono text-slate-400">Appwrite OAuth2 Sovereign Portal</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            v1.0.0
          </span>
        </div>

        {/* Content introduction */}
        <div className="space-y-1.5 text-center pt-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome to Portal</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authenticate securely using your Google Identity via Appwrite OAuth2 Token Flow.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-tight">
              <span className="font-semibold block text-rose-100">Authentication Error</span>
              <span className="text-[11px] block">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Primary CTA Button: Sign in with Google */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-3 transition-all text-sm font-sans cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group border border-blue-400/30"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <GoogleProviderIcon className="w-5 h-5 text-slate-200 group-hover:scale-105 transition-transform" />
            )}
            <span>{isSigningIn ? 'Redirecting to Google...' : 'Sign in with Google'}</span>
          </button>

          <p className="text-[11px] text-center text-slate-500">
            Direct token exchange with Appwrite Project <code className="text-slate-400 font-mono">6abab6b5003a4b7b1560</code>
          </p>
        </div>

        {/* Security and protocol footer */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>ISO/IEC 27037 · Art. 73 CPP Compliant Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
