import React, { useState } from "react";
import {
  Scale,
  Brain,
  ChevronDown,
  Printer,
  Menu,
  Sparkles,
  Briefcase,
  Sliders,
  Lock,
  Zap,
  BookOpen,
  FolderOpen,
  FileText,
  Users,
  Database,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { LegalCase } from "../lib/casesManager";
import { AstryxActionDrawer } from "./astryx/AstryxActionDrawer";

export type WorkspaceTab =
  | "procedures"
  | "toolbox"
  | "ai_copilot"
  | "kindle_review"
  | "factbook"
  | "actors"
  | "pleadings"
  | "worm_ledger";

interface TopbarProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  onRecompileEpub?: () => void;
  onLockSession: () => void;
  onOpenDocs?: () => void;
  onOpenGlossary?: () => void;
  onOpenEvidenceWizard?: () => void;
  onOpenActorWizard?: () => void;
  onOpenSwissCodes?: () => void;
  onOpenJudicialBundle?: () => void;
  onOpenQuickMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenCaseSync?: () => void;
  onSendToKindle?: () => void;
  activeCase?: LegalCase;
  onOpenCaseManager?: () => void;
  isRecompiling?: boolean;
  mobileTab?: "workspace" | "inspector";
  onMobileTabChange?: (tab: "workspace" | "inspector") => void;
  isEInkMode?: boolean;
  onToggleEInkMode?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onTabChange,
  currentLang,
  onLangChange,
  onRecompileEpub,
  onLockSession,
  onOpenDocs,
  onOpenGlossary,
  onOpenEvidenceWizard,
  onOpenActorWizard,
  onOpenSwissCodes,
  onOpenJudicialBundle,
  onOpenQuickMenu,
  onOpenSettings,
  onOpenCaseSync,
  onSendToKindle,
  activeCase,
  onOpenCaseManager,
  isRecompiling = false,
  mobileTab = "workspace",
  onMobileTabChange,
  isEInkMode = false,
  onToggleEInkMode,
}) => {
  const [actionDrawerOpen, setActionDrawerOpen] = useState(false);

  // Check if current view is a sub-tool
  const isSubTool = [
    "kindle_review",
    "factbook",
    "actors",
    "pleadings",
    "worm_ledger",
  ].includes(currentTab);

  return (
    <>
      <header className="h-[44px] min-h-[44px] bg-[#0A0F1D] border-b border-slate-800/80 px-2 sm:px-3 flex items-center justify-between select-none z-30 shrink-0 gap-1 sm:gap-2">
        {/* LEFT: Case Badge & Case Switcher Dropdown */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={onOpenCaseManager}
            className="flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 px-2 py-1 rounded-md text-[11px] sm:text-xs font-mono font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)] transition-colors cursor-pointer min-h-[30px]"
            title={
              currentLang === "uk"
                ? "Змінити досьє або створити нову справу"
                : "Changer de dossier ou créer un nouveau cas"
            }
          >
            <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{activeCase ? activeCase.reference : "PE24.014624-SBA"}</span>
            <ChevronDown className="w-3 h-3 text-amber-400/80 shrink-0" />
          </button>

          <div className="hidden xl:flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-medium truncate max-w-[200px]">
              {activeCase
                ? activeCase.court[currentLang] || activeCase.court.fr
                : "Ministère public vaudois"}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono text-[10px]">
              {activeCase
                ? `${activeCase.canton} (${activeCase.type.toUpperCase()})`
                : "Droits des victimes (CPP)"}
            </span>
          </div>
        </div>

        {/* CENTER: Astryx 3-Core Nav Switches (Desktop >= md) */}
        <nav className="hidden md:flex items-center bg-[#070B12] p-0.5 rounded-lg border border-slate-800/80 shrink-0">
          {/* 1. Procedures (Default Pipeline) */}
          <button
            onClick={() => {
              onTabChange("procedures");
              onMobileTabChange?.("workspace");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
              currentTab === "procedures"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
            title="Процедурний маршрут справи за КПК Швейцарії (5 стадій)"
          >
            <Scale className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              {currentLang === "uk"
                ? "⚖️ Процедури (5)"
                : currentLang === "fr"
                ? "⚖️ Procédure (5)"
                : currentLang === "de"
                ? "⚖️ Verfahren (5)"
                : currentLang === "it"
                ? "⚖️ Procedura (5)"
                : "⚖️ Pipeline (5)"}
            </span>
          </button>

          {/* 2. Tools Catalog Hub */}
          <button
            onClick={() => {
              onTabChange("toolbox");
              onMobileTabChange?.("workspace");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
              currentTab === "toolbox" || isSubTool
                ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
            title="Каталог усіх інструментів досьє (Factbook, фігуранти, клопотання, WORM)"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            <span>
              {currentLang === "uk"
                ? "🧰 Інструменти"
                : currentLang === "fr"
                ? "🧰 Outils"
                : currentLang === "de"
                ? "🧰 Werkzeuge"
                : currentLang === "it"
                ? "🧰 Strumenti"
                : "🧰 Toolbox"}
            </span>
            {isSubTool && (
              <span className="text-[10px] px-1 bg-indigo-900/80 text-indigo-200 rounded">
                {currentTab === "factbook"
                  ? "Preuves"
                  : currentTab === "actors"
                  ? "Parties"
                  : currentTab === "pleadings"
                  ? "Séquestre"
                  : currentTab === "kindle_review"
                  ? "Diff"
                  : "WORM"}
              </span>
            )}
          </button>

          {/* 3. Astryx AI Copilot */}
          <button
            onClick={() => {
              onTabChange("ai_copilot");
              onMobileTabChange?.("workspace");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
              currentTab === "ai_copilot"
                ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-400/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
            title="ШІ-Юрисконсульт, аналіз допустимості ATF 146 IV 9 та синтез висновків"
          >
            <Brain className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span>
              {currentLang === "uk"
                ? "🤖 ШІ-Студія"
                : currentLang === "fr"
                ? "🤖 Studio IA"
                : currentLang === "de"
                ? "🤖 KI-Studio"
                : currentLang === "it"
                ? "🤖 Studio IA"
                : "🤖 AI Studio"}
            </span>
          </button>
        </nav>

        {/* RIGHT: Quick Action Drawer Trigger, Languages & Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Astryx Quick Actions Drawer Trigger Button */}
          <button
            onClick={() => setActionDrawerOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-white rounded-md text-[11px] sm:text-xs font-mono font-bold transition-all shadow-[0_0_8px_rgba(245,158,11,0.15)] cursor-pointer min-h-[30px]"
            title={
              currentLang === "uk"
                ? "Швидкі дії Astryx (Доказ, Фігурант, Кодекси, Синхронізація)"
                : "Actions rapides Astryx (Preuve, Partie, Codes, Sync)"
            }
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
            <span className="font-mono">
              {currentLang === "uk"
                ? "⚡ Дії"
                : currentLang === "fr"
                ? "⚡ Actions"
                : currentLang === "de"
                ? "⚡ Aktionen"
                : currentLang === "it"
                ? "⚡ Azioni"
                : "⚡ Actions"}
            </span>
            <ChevronDown className="w-3 h-3 text-amber-400/80" />
          </button>

          {/* Judicial Bundle Quick Button (desktop) */}
          {onOpenJudicialBundle && (
            <button
              onClick={onOpenJudicialBundle}
              className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-md text-[11px] font-mono font-bold transition-all min-h-[30px]"
              title="Офіційний судово-процесуальний бандл (PDF/A) з таблицями EXIF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">
                {currentLang === "uk" ? "Судовий Бандл" : "Bordereau PDF"}
              </span>
            </button>
          )}

          {/* Language Selector (UA, FR, DE, IT, EN) */}
          <div className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800/80 text-[10px] sm:text-[11px] font-mono shrink-0">
            {(["uk", "fr", "de", "it", "en"] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLangChange(lang)}
                className={`px-1.5 py-0.5 rounded uppercase font-semibold transition-all ${
                  currentLang === lang
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={
                  lang === "uk"
                    ? "Українська"
                    : lang === "fr"
                    ? "Français"
                    : lang === "de"
                    ? "Deutsch"
                    : lang === "it"
                    ? "Italiano"
                    : "English"
                }
              >
                {lang === "uk" ? "UA" : lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Settings Modal Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="hidden sm:block p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 transition-colors shrink-0"
              title="Налаштування ШІ-агента, проксі та доставки"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* Lock Session */}
          <button
            onClick={onLockSession}
            className="hidden sm:block p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-colors shrink-0"
            title="Заблокувати сесію (Конфіденційність адвоката)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Mobile Menu Trigger */}
          {onOpenQuickMenu && (
            <button
              onClick={onOpenQuickMenu}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-colors shrink-0 min-h-[30px] min-w-[30px] flex items-center justify-center"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      </header>

      {/* Astryx Action Drawer Modal */}
      <AstryxActionDrawer
        isOpen={actionDrawerOpen}
        onClose={() => setActionDrawerOpen(false)}
        currentLang={currentLang}
        onTabChange={onTabChange}
        onOpenEvidenceWizard={onOpenEvidenceWizard}
        onOpenActorWizard={onOpenActorWizard}
        onOpenSwissCodes={onOpenSwissCodes}
        onOpenGlossary={onOpenGlossary}
        onOpenDocs={onOpenDocs}
        onOpenJudicialBundle={onOpenJudicialBundle}
        onOpenCaseSync={onOpenCaseSync}
        onSendToKindle={onSendToKindle}
        onOpenSettings={onOpenSettings}
        onLockSession={onLockSession}
        isEInkMode={isEInkMode}
        onToggleEInkMode={onToggleEInkMode}
        activeCase={activeCase}
      />
    </>
  );
};
