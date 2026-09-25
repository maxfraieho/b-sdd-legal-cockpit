import React from "react";
import {
  FileText,
  FolderOpen,
  Scale,
  Database,
  Lock,
  BookOpen,
  Activity,
  Layers,
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
  mobileTab?: "workspace" | "inspector";
  onMobileTabChange?: (tab: "workspace" | "inspector") => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onTabChange,
  currentLang,
  onLangChange,
  onRecompileEpub,
  onLockSession,
  isRecompiling = false,
  mobileTab = "workspace",
  onMobileTabChange,
}) => {
  return (
    <header className="h-[40px] min-h-[40px] bg-[#0A0F1D] border-b border-slate-800/80 px-2 sm:px-3 flex items-center justify-between select-none z-30 shrink-0 gap-1 sm:gap-2">
      {/* LEFT: Case Badge & Judicial Context */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded text-[11px] sm:text-xs font-mono font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
          <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span>PE24.014624-SBA</span>
        </div>
        <div className="hidden xl:flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-medium">Ministère public vaudois (Lausanne)</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400/90 font-mono text-[10px]">Droits des victimes (CPP)</span>
        </div>
      </div>

      {/* CENTER: Segmented View Switcher */}
      <nav className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800/70 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => {
            onTabChange("kindle_review");
            onMobileTabChange?.("workspace");
          }}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "kindle_review"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Студія правок, диктант та бітемпоральний Diff"
        >
          <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {currentLang === 'uk' ? 'Студія правок & Diff' : currentLang === 'fr' ? 'Studio Diff & Rédaction' : 'Diff Studio & Drafter'}
          </span>
          <span className="sm:hidden text-[10px]">Diff</span>
        </button>

        <button
          onClick={() => {
            onTabChange("factbook");
            onMobileTabChange?.("workspace");
          }}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "factbook"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Мультимедійний Factbook, фоноскопічний плеєр та EXIF інспектор"
        >
          <FolderOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="hidden sm:inline">Factbook</span>
          <span className="sm:hidden text-[10px]">Preuves</span>
        </button>

        <button
          onClick={() => {
            onTabChange("pleadings");
            onMobileTabChange?.("workspace");
          }}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "pleadings"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Клопотання про арешт ст. 263 КПК, слідчі дії ст. 318 КПК та очні ставки"
        >
          <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {currentLang === 'uk' ? 'Клопотання & Секвестр' : currentLang === 'fr' ? 'Réquisitions & Séquestre' : 'Motions'}
          </span>
          <span className="sm:hidden text-[10px]">Séquestre</span>
        </button>

        <button
          onClick={() => {
            onTabChange("worm_ledger");
            onMobileTabChange?.("workspace");
          }}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "worm_ledger"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Незмінний WORM леджер суперсесій (Інваріант L-01)"
        >
          <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="hidden sm:inline">WORM</span>
          <span className="sm:hidden text-[10px]">WORM</span>
        </button>
      </nav>

      {/* RIGHT: Mobile Pane Toggle, Daemon Indicator, Language Switcher, Kindle EPUB & Lock */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* MOBILE WORKSPACE / INSPECTOR TOGGLE (Visible only on screens < lg) */}
        {onMobileTabChange && (
          <div className="flex lg:hidden items-center bg-[#070B12] p-0.5 rounded border border-slate-800 shrink-0">
            <button
              onClick={() => onMobileTabChange("workspace")}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                mobileTab === "workspace"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Afficher l'espace de rédaction"
            >
              Éditeur
            </button>
            <button
              onClick={() => onMobileTabChange("inspector")}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                mobileTab === "inspector"
                  ? "bg-amber-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Afficher l'inspecteur légal CPP"
            >
              ⚖️ CPP
            </button>
          </div>
        )}

        {/* Daemon Pulse Indicator (Desktop only) */}
        <div
          className="hidden md:flex items-center space-x-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono shrink-0"
          title="MemPalace KùzuDB Graph: Port 8766 connected | Evidence Gateway: Port 8162 online"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 hidden lg:inline">MemPalace :8766</span>
        </div>

        {/* Trilingual Language Selector */}
        <div className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800/80 text-[10px] sm:text-[11px] font-mono shrink-0">
          {(['fr', 'uk', 'en'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLangChange(lang)}
              className={`px-1 sm:px-1.5 py-0.5 rounded uppercase font-semibold transition-all ${
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
          className={`flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 rounded text-xs font-medium border transition-all shrink-0 ${
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
          <span className="hidden xl:inline font-mono">
            {isRecompiling ? "Compilation..." : "Recompiler EPUB"}
          </span>
        </button>

        {/* Lock Session */}
        <button
          onClick={onLockSession}
          className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-colors shrink-0"
          title="Заблокувати робочу станцію (Конфіденційність адвоката)"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
