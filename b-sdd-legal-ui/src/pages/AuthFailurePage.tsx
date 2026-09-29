import React from 'react';
import { AlertTriangle, ArrowLeft, ShieldAlert, Settings, ShieldCheck } from 'lucide-react';

export const AuthFailurePage: React.FC = () => {
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rawError = queryParams?.get('message') || queryParams?.get('error') || queryParams?.get('type');

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4 selection:bg-rose-600 selection:text-white">
      {/* Background ambient accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative w-full max-w-md bg-[#0F172A]/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">OAuth Authentication Failed</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Google OAuth2 sign-in process was canceled or rejected by the authorization server.
          </p>
        </div>

        {rawError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs text-left font-mono break-all space-y-1">
            <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">
              Diagnostic Details
            </span>
            <span>{rawError}</span>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
            <Settings className="w-4 h-4 text-blue-400" />
            <span>Appwrite Configuration Checklist:</span>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
            <li>Project ID: <code className="text-blue-300 font-mono">6abab6b5003a4b7b1560</code></li>
            <li>Google OAuth2 Provider enabled in Appwrite Console</li>
            <li>Authorized Redirect URI registered in Google Cloud Console</li>
          </ul>
        </div>

        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={() => window.location.assign('/dashboard')}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer border border-emerald-400/30"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Увійти за захищеним PIN-кодом (0523)</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.assign('/auth')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 hover:text-white font-medium rounded-2xl border border-slate-700 shadow-md flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Повернутися до вибору авторизації</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800/80">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Appwrite Auth Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
