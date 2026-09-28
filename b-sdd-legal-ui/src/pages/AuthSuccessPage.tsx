import React, { useEffect, useState } from 'react';
import { handleOAuthSuccess } from '../lib/appwrite';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const AuthSuccessPage: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeSessionCreation() {
      try {
        await handleOAuthSuccess();
        if (isMounted) {
          setStatus('success');
          // Smooth assign redirect to /dashboard as specified
          window.location.assign('/dashboard');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(
            err?.message || 'Failed to exchange OAuth credentials for an active Appwrite session.'
          );
        }
      }
    }

    completeSessionCreation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0F172A]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
        {status === 'processing' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400">
              <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Completing Google Sign In</h2>
              <p className="text-xs text-slate-400">
                Establishing Appwrite session from OAuth credentials...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Session Established</h2>
              <p className="text-xs text-slate-400">Redirecting to your Dashboard...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-7 h-7 text-rose-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Authentication Failed</h2>
              <p className="text-xs text-rose-300 max-w-xs mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.location.assign('/auth')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
