import React from "react";
import {
  X,
  FileText,
  FolderOpen,
  Users,
  Scale,
  Brain,
  Database,
  BookOpen,
  Sparkles,
  UserPlus,
  Settings,
  Lock,
  Printer,
  FileCheck,
  Eye,
  Sliders,
  Share2,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { LegalCase } from "../lib/casesManager";
import { WorkspaceTab } from "./Topbar";

interface MobileQuickMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  mobileTab: "workspace" | "inspector";
  onMobileTabChange: (tab: "workspace" | "inspector") => void;
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  activeCase?: LegalCase;
  onOpenCaseManager: () => void;
  onOpenDocs: () => void;
  onOpenSwissCodes: () => void;
  onOpenEvidenceWizard: () => void;
  onOpenActorWizard: () => void;
  onOpenJudicialBundle: () => void;
  onOpenSettings: () => void;
  onLockSession: () => void;
  isEInkMode: boolean;
  onToggleEInkMode: () => void;
}

export const MobileQuickMenuSheet: React.FC<MobileQuickMenuSheetProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  mobileTab,
  onMobileTabChange,
  currentLang,
  onLangChange,
  activeCase,
  onOpenCaseManager,
  onOpenDocs,
  onOpenSwissCodes,
  onOpenEvidenceWizard,
  onOpenActorWizard,
  onOpenJudicialBundle,
  onOpenSettings,
  onLockSession,
  isEInkMode,
  onToggleEInkMode,
}) => {
  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Safe localized title and court name (prevents React object-as-child crash)
  const caseDisplayTitle = activeCase
    ? (activeCase.title?.[currentLang] || activeCase.title?.fr || activeCase.title?.en || activeCase.reference)
    : "Affaire Vaud";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/80 backdrop-blur-sm select-none animate-fadeIn p-0 sm:p-4"
    >
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Sheet / Drawer Container (Meta Astryx Pattern) */}
      <div className="relative z-10 w-full sm:max-w-xl max-h-[90vh] bg-[#0B1120] border-t sm:border border-slate-700/80 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Grab Handle (mobile touch affordance) */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#080E1B]">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wide">
              {currentLang === "uk" ? "Швидке Меню та Інструменти (Astryx)" : "Menu Rapide & Actions (Astryx)"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {/* Active Case Card (Tap to switch) */}
          <div
            onClick={() => {
              onClose();
              onOpenCaseManager?.();
            }}
            className="p-3 bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-950/20 border border-amber-500/30 rounded-xl cursor-pointer hover:border-amber-500/60 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-amber-300 font-bold block">
                  {activeCase ? activeCase.reference : "PE24.014624-SBA"}
                </span>
                <strong className="text-white text-xs block truncate max-w-[220px] sm:max-w-xs">
                  {caseDisplayTitle}
                </strong>
                <span className="text-[10px] text-slate-400 block truncate">
                  {activeCase ? `${activeCase.canton} · ${activeCase.type.toUpperCase()}` : "Vaud (CPP)"}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded text-[10px] font-mono font-bold shrink-0 ml-2">
              {currentLang === "uk" ? "Змінити" : "Changer"}
            </span>
          </div>

          {/* Quick Dual Mode: Workspace vs Legal Inspector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
              {currentLang === "uk" ? "Режим перегляду екрану" : "Mode d'affichage"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onMobileTabChange("workspace");
                  onClose();
                }}
                className={`p-3 rounded-xl flex items-center justify-center space-x-2 border transition-all ${
                  mobileTab === "workspace"
                    ? "bg-blue-600 text-white border-blue-500 font-bold shadow-md"
                    : "bg-[#090E1A] text-slate-300 border-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs">
                  {currentLang === "uk" ? "Робоча зона (Редактор)" : "Espace Dossier"}
                </span>
              </button>

              <button
                onClick={() => {
                  onMobileTabChange("inspector");
                  onClose();
                }}
                className={`p-3 rounded-xl flex items-center justify-center space-x-2 border transition-all ${
                  mobileTab === "inspector"
                    ? "bg-amber-600 text-white border-amber-500 font-bold shadow-md"
                    : "bg-[#090E1A] text-slate-300 border-slate-800"
                }`}
              >
                <Scale className="w-4 h-4 text-amber-300" />
                <span className="text-xs">
                  {currentLang === "uk" ? "⚖️ Інспектор КПК" : "⚖️ Inspecteur CPP"}
                </span>
              </button>
            </div>
          </div>

          {/* Core Court Tools Grid (Touch target >= 48px) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
              {currentLang === "uk" ? "Судові інструменти та ШІ" : "Outils Juridiques & IA"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Judicial Bundle Export */}
              <button
                onClick={() => {
                  onClose();
                  onOpenJudicialBundle();
                }}
                className="p-3 bg-gradient-to-br from-indigo-950/60 to-[#070B14] hover:bg-indigo-900/40 border border-indigo-500/40 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-indigo-600/20 text-indigo-300 rounded-lg shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">Судовий Бандл PDF/A</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Офіційна пагінація & QR
                  </span>
                </div>
              </button>

              {/* Swiss Codes Modal */}
              <button
                onClick={() => {
                  onClose();
                  onOpenSwissCodes();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">Кодекси CH/VD</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    CP, CPP, CC, CO, LOJV
                  </span>
                </div>
              </button>

              {/* Evidence Ingestion Wizard */}
              <button
                onClick={() => {
                  onClose();
                  onOpenEvidenceWizard();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-blue-600/20 text-blue-300 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">+ Додати доказ</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    ШІ-кваліфікація P-01..15
                  </span>
                </div>
              </button>

              {/* Actor Ingestion Wizard */}
              <button
                onClick={() => {
                  onClose();
                  onOpenActorWizard();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-cyan-600/20 text-cyan-300 rounded-lg shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">+ Додати фігуранта</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Статуси КПК Во
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Reading & Device Modes */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
              {currentLang === "uk" ? "Читання та Документація" : "Lecture & Documentation"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Documentation */}
              <button
                onClick={() => {
                  onClose();
                  onOpenDocs();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-emerald-600/20 text-emerald-300 rounded-lg shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">Документація & B-SDD</strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Посібники & Експорт
                  </span>
                </div>
              </button>

              {/* E-Ink High Contrast Mode Toggle */}
              <button
                onClick={onToggleEInkMode}
                className={`p-3 rounded-xl text-left flex items-start space-x-2.5 border transition-all ${
                  isEInkMode
                    ? "bg-white text-black border-slate-300 shadow-md font-bold"
                    : "bg-[#090E1A] hover:bg-slate-800 border-slate-800 text-white"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isEInkMode ? "bg-black text-white" : "bg-slate-800 text-slate-300"}`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <strong className={`text-xs block ${isEInkMode ? "text-black" : "text-white"}`}>
                    {isEInkMode ? "E-Ink Mode УВІМК" : "E-Ink Монохром"}
                  </strong>
                  <span className={`text-[10px] block leading-tight ${isEInkMode ? "text-slate-800" : "text-slate-400"}`}>
                    Високий контраст без світла
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Language Switcher & System Options */}
          <div className="p-3 bg-[#070B14] border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                {currentLang === "uk" ? "Мова інтерфейсу :" : "Langue d'interface :"}
              </span>
              <div className="flex items-center bg-[#050810] p-0.5 rounded-lg border border-slate-700 font-mono text-xs">
                {(["uk", "fr", "en"] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onLangChange(lang)}
                    className={`px-3 py-1 rounded font-bold transition-all ${
                      currentLang === lang
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang === "uk" ? "UA" : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-blue-400" />
                <span>{currentLang === "uk" ? "Налаштування" : "Paramètres"}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onLockSession();
                }}
                className="flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{currentLang === "uk" ? "Заблокувати" : "Verrouiller"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
