// =========================================================================
// B-SDD LEGAL COCKPIT · КОНФІДЕНЦІЙНИЙ ШЛЮЗ АВТОРИЗАЦІЇ (AUTH GATE)
// Захист таємниці слідства (ст. 73 КПК), прав дитини (ст. 122 КПК) та щита L-03
// =========================================================================

import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types/i18n';
import { UI_TRANSLATIONS } from '../data/translations';
import { Shield, Lock, KeyRound, AlertTriangle, Scale, CheckCircle2, Globe2 } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
  expectedPassword: string;
  autoLockMinutes: number;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLockedStateChange?: (locked: boolean) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  children,
  expectedPassword,
  autoLockMinutes,
  currentLang,
  onLanguageChange,
  onLockedStateChange,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryPin = urlParams.get('unlock') || urlParams.get('pin');
      if (queryPin && (queryPin.trim() === expectedPassword.trim() || queryPin.trim() === '0523')) {
        sessionStorage.setItem('b_sdd_auth_unlocked', 'true');
        sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());
        return true;
      }
      const stored = sessionStorage.getItem('b_sdd_auth_unlocked');
      const storedTime = sessionStorage.getItem('b_sdd_auth_timestamp');
      if (stored === 'true' && storedTime) {
        const diffMinutes = (Date.now() - parseInt(storedTime, 10)) / (1000 * 60);
        if (diffMinutes < autoLockMinutes) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  const [inputPin, setInputPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const t = (key: string): string => {
    return UI_TRANSLATIONS[currentLang]?.[key] || UI_TRANSLATIONS['uk']?.[key] || key;
  };

  // Activity tracker for auto-lock
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    const interval = setInterval(() => {
      const storedTime = sessionStorage.getItem('b_sdd_auth_timestamp');
      if (storedTime) {
        const diffMinutes = (Date.now() - parseInt(storedTime, 10)) / (1000 * 60);
        if (diffMinutes >= autoLockMinutes) {
          handleLock();
        }
      }
    }, 30000); // Check every 30s

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearInterval(interval);
    };
  }, [isAuthenticated, autoLockMinutes]);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputPin.trim() === expectedPassword.trim() || inputPin.trim() === '0523') {
      setIsAuthenticated(true);
      setErrorMsg(null);
      sessionStorage.setItem('b_sdd_auth_unlocked', 'true');
      sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());
      if (onLockedStateChange) onLockedStateChange(false);
    } else {
      setErrorMsg(t('auth_error'));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setInputPin('');
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('b_sdd_auth_unlocked');
    sessionStorage.removeItem('b_sdd_auth_timestamp');
    setInputPin('');
    setErrorMsg(null);
    if (onLockedStateChange) onLockedStateChange(true);
  };

  const handleNumClick = (digit: string) => {
    if (inputPin.length < 12) {
      setInputPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setInputPin(prev => prev.slice(0, -1));
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(30,58,138,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

      {/* Language Switcher in top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 shadow-xl backdrop-blur-md">
        <Globe2 className="w-4 h-4 text-slate-400 ml-1" />
        {(['uk', 'fr', 'en'] as SupportedLanguage[]).map(l => (
          <button
            key={l}
            onClick={() => onLanguageChange(l)}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
              currentLang === l
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {l === 'uk' ? '🇺🇦 UA' : l === 'fr' ? '🇨🇭 FR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>

      <div className={`w-full max-w-md z-10 transition-transform ${isShaking ? 'animate-shake' : ''}`}>
        {/* Main Card */}
        <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Header Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Shield className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Title & Case Ref */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
              {t('auth_title')}
            </h1>
            <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>CASE-SAMPLE-2026-CH · Ministère public Vaud</span>
            </p>
          </div>

          {/* Legal Confidentiality Warning */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 mb-6 text-xs text-amber-200/90 flex gap-3 items-start leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300 mb-0.5">
                {currentLang === 'uk' ? 'СУДОВА ТАЄМНИЦЯ (СТ. 73 КПК ШВЕЙЦАРІЇ)' :
                 currentLang === 'fr' ? 'SECRET DE L’INSTRUCTION (ART. 73 CPP)' :
                 'PROCEDURAL SECRECY (ART. 73 SWISS CPC)'}
              </div>
              {t('auth_warning')}
            </div>
          </div>

          {/* PIN / Password Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={inputPin}
                  onChange={e => setInputPin(e.target.value)}
                  placeholder={t('auth_pin_placeholder')}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-center text-lg tracking-widest text-white placeholder:text-slate-600 placeholder:text-xs placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>
              {errorMsg && (
                <p className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errorMsg}
                </p>
              )}
            </div>

            {/* Quick Numeric Keypad for fast entry */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumClick(num)}
                  className="py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-white font-medium text-sm transition-colors border border-slate-700/40 active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white font-medium text-xs transition-colors border border-slate-700/30"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => handleNumClick('0')}
                className="py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-white font-medium text-sm transition-colors border border-slate-700/40 active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setInputPin('0523')}
                title="Default PIN (0523)"
                className="py-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-blue-400 hover:text-blue-200 font-mono text-[10px] transition-colors border border-blue-800/40 flex items-center justify-center"
              >
                0523
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>{t('auth_btn_unlock')}</span>
            </button>
          </form>

          {/* Footer Security Badges */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col gap-2 text-[11px] text-slate-400 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-400/90 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('auth_shield_note')}</span>
            </div>
            <div className="text-slate-500 text-[10px]">
              {currentLang === 'uk' ? 'Кримінальний кодекс Швейцарії (CP) · КПК (CPP) · Неповнолітній Александр Дюбуа (2012)' :
               currentLang === 'fr' ? 'Code pénal suisse (CP) · CPP · Protection mineur Alexandre Dubois (2012)' :
               'Swiss Criminal Code (CP) · Swiss CPC · Minor victim Alexandre Dubois (2012)'}
            </div>
          </div>
        </div>

        {/* Outer hint */}
        <div className="text-center mt-4 text-[11px] text-slate-500">
          {currentLang === 'uk' ? 'Підказка: Пароль за замовчуванням: ' :
           currentLang === 'fr' ? 'Indication : Mot de passe par défaut : ' :
           'Hint: Default password: '}
          <code className="text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">0523</code>
        </div>
      </div>
    </div>
  );
};
