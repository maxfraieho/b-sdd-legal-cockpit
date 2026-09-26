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
  onOpenCaseSync?: () => void;
  onOpenCaseManager?: () => void;
  onOpenDocs?: () => void;
  onOpenSwissCodes?: () => void;
  onOpenEvidenceWizard?: () => void;
  onOpenActorWizard?: () => void;
  onOpenJudicialBundle?: () => void;
  onOpenSettings?: () => void;
  onLockSession?: () => void;
  isEInkMode?: boolean;
  onToggleEInkMode?: () => void;
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
  onOpenCaseSync,
  onOpenCaseManager,
  onOpenDocs,
  onOpenSwissCodes,
  onOpenEvidenceWizard,
  onOpenActorWizard,
  onOpenJudicialBundle,
  onOpenSettings,
  onLockSession,
  isEInkMode = false,
  onToggleEInkMode,
}) => {
  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Safe localized title and court name (prevents any undefined/object-as-child crash)
  const caseDisplayTitle = (() => {
    try {
      if (!activeCase) return "Affaire Vaud";
      if (typeof activeCase.title === "string") return activeCase.title;
      if (activeCase.title && typeof activeCase.title === "object") {
        const titleObj = activeCase.title as Record<string, string>;
        return (
          titleObj[currentLang] ||
          titleObj.fr ||
          titleObj.uk ||
          titleObj.it ||
          titleObj.de ||
          titleObj.en ||
          activeCase.reference ||
          "Affaire Vaud"
        );
      }
      return activeCase.reference || "Affaire Vaud";
    } catch {
      return "Affaire Vaud";
    }
  })();

  const caseType = String(activeCase?.type || "penal").toUpperCase();
  const caseCanton = String(activeCase?.canton || "Vaud");
  const caseRef = String(activeCase?.reference || "PE24.014624-SBA");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/80 backdrop-blur-sm select-none animate-fadeIn p-0 sm:p-4"
    >
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0 z-0" onClick={() => onClose?.()} />

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
              {currentLang === "uk"
                ? "Швидке Меню та Інструменти (Astryx)"
                : currentLang === "it"
                ? "Menu Rapido & Strumenti (Astryx)"
                : currentLang === "de"
                ? "Schnellmenü & Werkzeuge (Astryx)"
                : currentLang === "fr"
                ? "Menu Rapide & Actions (Astryx)"
                : "Quick Menu & Tools (Astryx)"}
            </span>
          </div>

          <button
            onClick={() => onClose?.()}
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
              onClose?.();
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
                  {caseRef}
                </span>
                <strong className="text-white text-xs block truncate max-w-[220px] sm:max-w-xs">
                  {caseDisplayTitle}
                </strong>
                <span className="text-[10px] text-slate-400 block truncate">
                  {caseCanton} · {caseType}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded text-[10px] font-mono font-bold shrink-0 ml-2">
              {currentLang === "uk"
                ? "Змінити"
                : currentLang === "it"
                ? "Cambia"
                : currentLang === "de"
                ? "Wechseln"
                : currentLang === "fr"
                ? "Changer"
                : "Switch"}
            </span>
          </div>

          {/* Quick Dual Mode: Workspace vs Legal Inspector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
              {currentLang === "uk"
                ? "Режим перегляду екрану"
                : currentLang === "it"
                ? "Modalità di visualizzazione"
                : currentLang === "de"
                ? "Anzeigemodus"
                : currentLang === "fr"
                ? "Mode d'affichage"
                : "Display Mode"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onMobileTabChange?.("workspace");
                  onClose?.();
                }}
                className={`p-3 rounded-xl flex items-center justify-center space-x-2 border transition-all ${
                  mobileTab === "workspace"
                    ? "bg-blue-600 text-white border-blue-500 font-bold shadow-md"
                    : "bg-[#090E1A] text-slate-300 border-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs">
                  {currentLang === "uk"
                    ? "Робоча зона (Редактор)"
                    : currentLang === "it"
                    ? "Area Lavoro (Dossier)"
                    : currentLang === "de"
                    ? "Arbeitsbereich (Dossier)"
                    : currentLang === "fr"
                    ? "Espace Dossier"
                    : "Workspace (Editor)"}
                </span>
              </button>

              <button
                onClick={() => {
                  onMobileTabChange?.("inspector");
                  onClose?.();
                }}
                className={`p-3 rounded-xl flex items-center justify-center space-x-2 border transition-all ${
                  mobileTab === "inspector"
                    ? "bg-amber-600 text-white border-amber-500 font-bold shadow-md"
                    : "bg-[#090E1A] text-slate-300 border-slate-800"
                }`}
              >
                <Scale className="w-4 h-4 text-amber-300" />
                <span className="text-xs">
                  {currentLang === "uk"
                    ? "⚖️ Інспектор КПК"
                    : currentLang === "it"
                    ? "⚖️ Ispettore CPP"
                    : currentLang === "de"
                    ? "⚖️ StPO-Inspektor"
                    : currentLang === "fr"
                    ? "⚖️ Inspecteur CPP"
                    : "⚖️ CPC Inspector"}
                </span>
              </button>
            </div>
          </div>

          {/* Core Court Tools Grid (Touch target >= 48px) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
              {currentLang === "uk"
                ? "Судові інструменти та ШІ"
                : currentLang === "it"
                ? "Strumenti Giudiziari & IA"
                : currentLang === "de"
                ? "Gerichtliche Werkzeuge & KI"
                : currentLang === "fr"
                ? "Outils Juridiques & IA"
                : "Legal Tools & AI"}
            </span>

            {/* Master Sequential AI Sync Button */}
            <button
              onClick={() => {
                onClose?.();
                onOpenCaseSync?.();
              }}
              className="w-full p-3 bg-gradient-to-r from-purple-950/80 via-blue-950/60 to-purple-950/80 hover:from-purple-900/80 hover:to-blue-900/80 border border-purple-500/50 rounded-xl text-left flex items-center justify-between transition-all shadow-lg shadow-purple-950/40 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/30 text-purple-300 rounded-lg group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5 text-purple-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <strong className="text-white text-xs font-mono font-bold">
                      {currentLang === "uk"
                        ? "⚡ ШІ-Синхронізація справи"
                        : currentLang === "it"
                        ? "⚡ Sincronizzazione IA Fascicolo"
                        : currentLang === "de"
                        ? "⚡ KI-Dossiersynchronisation"
                        : currentLang === "fr"
                        ? "⚡ Synchronisation IA Dossier"
                        : "⚡ AI Dossier Sync"}
                    </strong>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1 rounded border border-purple-500/40">
                      Sequential
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 block leading-tight mt-0.5">
                    {currentLang === "uk"
                      ? "Аналіз нових фактів, статей КПК та Gemini Spark"
                      : currentLang === "it"
                      ? "Rivalutazione 35 codici, prove e Gemini Spark"
                      : currentLang === "de"
                      ? "Neubewertung 35 Gesetze, Beweise & Spark"
                      : currentLang === "fr"
                      ? "Recalcul 35 codes, preuves & Gemini Spark"
                      : "Re-evaluate 35 statutes, evidence & Spark"}
                  </span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform shrink-0" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Judicial Bundle Export */}
              <button
                onClick={() => {
                  onClose?.();
                  onOpenJudicialBundle?.();
                }}
                className="p-3 bg-gradient-to-br from-indigo-950/60 to-[#070B14] hover:bg-indigo-900/40 border border-indigo-500/40 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-indigo-600/20 text-indigo-300 rounded-lg shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">
                    {currentLang === "uk"
                      ? "Судовий Бандл PDF/A"
                      : currentLang === "it"
                      ? "Fascicolo Atti PDF/A"
                      : currentLang === "de"
                      ? "Gerichtsdossier PDF/A"
                      : currentLang === "fr"
                      ? "Bordereau PDF/A"
                      : "Judicial Bundle PDF/A"}
                  </strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    {currentLang === "uk"
                      ? "Офіційна пагінація & QR"
                      : currentLang === "it"
                      ? "Paginazione ufficiale & QR"
                      : currentLang === "de"
                      ? "Offizielle Paginierung & QR"
                      : currentLang === "fr"
                      ? "Pagination officielle & QR"
                      : "Official pagination & QR"}
                  </span>
                </div>
              </button>

              {/* Swiss Codes Modal */}
              <button
                onClick={() => {
                  onClose?.();
                  onOpenSwissCodes?.();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">
                    {currentLang === "uk"
                      ? "Кодекси CH/VD"
                      : currentLang === "it"
                      ? "Codici CH/VD"
                      : currentLang === "de"
                      ? "Gesetze CH/VD"
                      : currentLang === "fr"
                      ? "Codes CH/VD"
                      : "Swiss Codes CH/VD"}
                  </strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    CP, CPP, CC, CO, LOJV
                  </span>
                </div>
              </button>

              {/* Evidence Ingestion Wizard */}
              <button
                onClick={() => {
                  onClose?.();
                  onOpenEvidenceWizard?.();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-blue-600/20 text-blue-300 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">
                    {currentLang === "uk"
                      ? "+ Додати доказ"
                      : currentLang === "it"
                      ? "+ Aggiungi prova"
                      : currentLang === "de"
                      ? "+ Beweis einfügen"
                      : currentLang === "fr"
                      ? "+ Ajouter pièce"
                      : "+ Add Evidence"}
                  </strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    {currentLang === "uk"
                      ? "ШІ-кваліфікація P-01..15"
                      : currentLang === "it"
                      ? "Qualificazione IA P-01..15"
                      : currentLang === "de"
                      ? "KI-Qualifikation P-01..15"
                      : currentLang === "fr"
                      ? "Qualification IA P-01..15"
                      : "AI Qualification P-01..15"}
                  </span>
                </div>
              </button>

              {/* Actor Ingestion Wizard */}
              <button
                onClick={() => {
                  onClose?.();
                  onOpenActorWizard?.();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-cyan-600/20 text-cyan-300 rounded-lg shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">
                    {currentLang === "uk"
                      ? "+ Додати фігуранта"
                      : currentLang === "it"
                      ? "+ Aggiungi figura"
                      : currentLang === "de"
                      ? "+ Person hinzufügen"
                      : currentLang === "fr"
                      ? "+ Ajouter partie"
                      : "+ Add Party"}
                  </strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    {currentLang === "uk"
                      ? "Статуси КПК Во"
                      : currentLang === "it"
                      ? "Ruoli processuali CPP"
                      : currentLang === "de"
                      ? "StPO-Verfahrensrollen"
                      : currentLang === "fr"
                      ? "Statuts CPP Vaud"
                      : "CPC Procedural Roles"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Reading & Device Modes */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
              {currentLang === "uk"
                ? "Читання та Документація"
                : currentLang === "it"
                ? "Lettura & Documentazione"
                : currentLang === "de"
                ? "Lesen & Dokumentation"
                : currentLang === "fr"
                ? "Lecture & Documentation"
                : "Reading & Documentation"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Documentation */}
              <button
                onClick={() => {
                  onClose?.();
                  onOpenDocs?.();
                }}
                className="p-3 bg-[#090E1A] hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-start space-x-2.5 transition-all"
              >
                <div className="p-1.5 bg-emerald-600/20 text-emerald-300 rounded-lg shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white text-xs block">
                    {currentLang === "uk"
                      ? "Документація & B-SDD"
                      : currentLang === "it"
                      ? "Documentazione & B-SDD"
                      : currentLang === "de"
                      ? "Dokumentation & B-SDD"
                      : currentLang === "fr"
                      ? "Documentation & B-SDD"
                      : "Docs & B-SDD"}
                  </strong>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    {currentLang === "uk"
                      ? "Посібники & Експорт"
                      : currentLang === "it"
                      ? "Manuali & Esportazione"
                      : currentLang === "de"
                      ? "Handbücher & Export"
                      : currentLang === "fr"
                      ? "Guides & Export"
                      : "Guides & Export"}
                  </span>
                </div>
              </button>

              {/* E-Ink High Contrast Mode Toggle */}
              <button
                onClick={() => onToggleEInkMode?.()}
                className={`p-3 rounded-xl text-left flex items-start space-x-2.5 border transition-all ${
                  isEInkMode
                    ? "bg-white text-black border-slate-300 shadow-md font-bold"
                    : "bg-[#090E1A] hover:bg-slate-800 border-slate-800 text-white"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isEInkMode ? "bg-black text-white" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <strong className={`text-xs block ${isEInkMode ? "text-black" : "text-white"}`}>
                    {isEInkMode
                      ? currentLang === "uk"
                        ? "E-Ink Mode УВІМК"
                        : currentLang === "it"
                        ? "E-Ink ATTIVO"
                        : currentLang === "de"
                        ? "E-Ink AKTIV"
                        : "E-Ink ACTIF"
                      : currentLang === "uk"
                      ? "E-Ink Монохром"
                      : currentLang === "it"
                      ? "Modalità E-Ink"
                      : currentLang === "de"
                      ? "E-Ink-Modus"
                      : "Mode E-Ink"}
                  </strong>
                  <span
                    className={`text-[10px] block leading-tight ${
                      isEInkMode ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {currentLang === "uk"
                      ? "Високий контраст без відблисків"
                      : currentLang === "it"
                      ? "Alto contrasto antiriflesso"
                      : currentLang === "de"
                      ? "Hoher Kontrast ohne Blendung"
                      : currentLang === "fr"
                      ? "Haut contraste antireflet"
                      : "High contrast sunlight view"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Language Switcher & System Options */}
          <div className="p-3 bg-[#070B14] border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                {currentLang === "uk"
                  ? "Мова інтерфейсу :"
                  : currentLang === "it"
                  ? "Lingua interfaccia :"
                  : currentLang === "de"
                  ? "Sprache :"
                  : currentLang === "fr"
                  ? "Langue d'interface :"
                  : "Interface Language:"}
              </span>
              <div className="flex items-center bg-[#050810] p-0.5 rounded-lg border border-slate-700 font-mono text-xs">
                {(["uk", "fr", "de", "it", "en"] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onLangChange?.(lang)}
                    className={`px-2 py-1 rounded font-bold transition-all ${
                      currentLang === lang
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
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
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  onClose?.();
                  onOpenSettings?.();
                }}
                className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-blue-400" />
                <span>
                  {currentLang === "uk"
                    ? "Налаштування"
                    : currentLang === "it"
                    ? "Impostazioni"
                    : currentLang === "de"
                    ? "Einstellungen"
                    : currentLang === "fr"
                    ? "Paramètres"
                    : "Settings"}
                </span>
              </button>

              <button
                onClick={() => {
                  onClose?.();
                  onLockSession?.();
                }}
                className="flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {currentLang === "uk"
                    ? "Заблокувати"
                    : currentLang === "it"
                    ? "Blocca sessione"
                    : currentLang === "de"
                    ? "Sitzung sperren"
                    : currentLang === "fr"
                    ? "Verrouiller"
                    : "Lock Session"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

