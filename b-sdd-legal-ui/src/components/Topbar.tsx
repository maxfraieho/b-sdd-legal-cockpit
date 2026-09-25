import React from "react";
import {
  FileText,
  FolderOpen,
  Scale,
  Database,
  Lock,
  BookOpen,
  Activity,
  CheckCircle,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";

export type WorkspaceTab = "kindle_review" | "factbook" | "pleadings" | "worm_ledger";

interface TopbarProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  onRecompileEpub: () => void;
  onLockSession: () => void;
  isRecompiling?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onTabChange,
  currentLang,
  onLangChange,
  onRecompileEpub,
  onLockSession,
  isRecompiling = false,
}) => {
  return (
    <header className="h-[40px] min-h-[40px] bg-[#0A0F1D] border-b border-slate-800/80 px-3 flex items-center justify-between select-none z-30">
      {/* LEFT: Case Badge & Judicial Context */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>PE24.014624-SBA</span>
        </div>
        <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-medium">Ministère public vaudois (Lausanne)</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400/90 font-mono text-[10px]">Droits des victimes (CPP)</span>
        </div>
      </div>

      {/* CENTER: Segmented View Switcher */}
      <nav className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800/70">
        <button
          onClick={() => onTabChange("kindle_review")}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "kindle_review"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Студія правок, диктант та бітемпоральний Diff"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{currentLang === 'uk' ? 'Студія правок & Diff' : currentLang === 'fr' ? 'Studio Diff & Rédaction' : 'Diff Studio & Drafter'}</span>
        </button>

        <button
          onClick={() => onTabChange("factbook")}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "factbook"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Мультимедійний Factbook, фоноскопічний плеєр та EXIF інспектор"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>{currentLang === 'uk' ? 'Astryx Factbook (EPE)' : currentLang === 'fr' ? 'Astryx Factbook (EPE)' : 'Astryx Factbook (EPE)'}</span>
        </button>

        <button
          onClick={() => onTabChange("pleadings")}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "pleadings"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Клопотання про арешт ст. 263 КПК, слідчі дії ст. 318 КПК та очні ставки"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{currentLang === 'uk' ? 'Клопотання & Секвестр' : currentLang === 'fr' ? 'Réquisitions & Séquestre' : 'Motions & Sequestration'}</span>
        </button>

        <button
          onClick={() => onTabChange("worm_ledger")}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "worm_ledger"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Незмінний WORM леджер суперсесій (Інваріант L-01)"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{currentLang === 'uk' ? 'WORM Леджер' : currentLang === 'fr' ? 'Registre WORM' : 'WORM Ledger'}</span>
        </button>
      </nav>

      {/* RIGHT: Status, Language Switcher, Kindle EPUB Recompile & Session Lock */}
      <div className="flex items-center space-x-2">
        {/* Daemon Pulse Indicator */}
        <div
          className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono"
          title="MemPalace KùzuDB Graph: Port 8766 connected | Evidence Gateway: Port 8162 online"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300">MemPalace :8766</span>
        </div>

        {/* Trilingual Language Selector */}
        <div className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800/80 text-[11px] font-mono">
          {(['fr', 'uk', 'en'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLangChange(lang)}
              className={`px-1.5 py-0.5 rounded uppercase font-semibold transition-all ${
                currentLang === lang
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === 'uk' ? 'UA' : lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Quick Action: Recompile EPUB */}
        <button
          onClick={onRecompileEpub}
          disabled={isRecompiling}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium border transition-all ${
            isRecompiling
              ? "bg-blue-900/40 border-blue-700/50 text-blue-200 animate-pulse cursor-wait"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700/70 text-slate-200 hover:text-white"
          }`}
          title="Перекомпілювати 18 розділів досьє в EPUB 3.0 та надіслати на Kindle"
        >
          {isRecompiling ? (
            <Activity className="w-3.5 h-3.5 animate-spin text-blue-400" />
          ) : (
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span className="hidden md:inline font-mono">
            {isRecompiling ? "Compilation..." : "Recompiler EPUB"}
          </span>
        </button>

        {/* Lock Session */}
        <button
          onClick={onLockSession}
          className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-colors"
          title="Заблокувати робочу станцію (Конфіденційність адвоката)"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
