import React, { useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  UserPlus,
  Scale,
  BookOpen,
  HelpCircle,
  Printer,
  Radio,
  FileText,
  Sliders,
  Lock,
  Sun,
  Moon,
  FolderOpen,
  Users,
  Database,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  FileCheck,
} from "lucide-react";
import { SupportedLanguage } from "../../types/i18n";
import { LegalCase } from "../../lib/casesManager";
import { WorkspaceTab } from "../Topbar";

interface AstryxActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onTabChange: (tab: WorkspaceTab) => void;
  onOpenEvidenceWizard?: () => void;
  onOpenActorWizard?: () => void;
  onOpenSwissCodes?: () => void;
  onOpenGlossary?: () => void;
  onOpenDocs?: () => void;
  onOpenJudicialBundle?: () => void;
  onOpenCaseSync?: () => void;
  onSendToKindle?: () => void;
  onOpenSettings?: () => void;
  onOpenLegalStrategy?: () => void;
  onLockSession?: () => void;
  isEInkMode?: boolean;
  onToggleEInkMode?: () => void;
  activeCase?: LegalCase;
}

export const AstryxActionDrawer: React.FC<AstryxActionDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  onTabChange,
  onOpenEvidenceWizard,
  onOpenActorWizard,
  onOpenSwissCodes,
  onOpenGlossary,
  onOpenDocs,
  onOpenJudicialBundle,
  onOpenCaseSync,
  onSendToKindle,
  onOpenSettings,
  onOpenLegalStrategy,
  onLockSession,
  isEInkMode = false,
  onToggleEInkMode,
  activeCase,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = {
    title: {
      uk: "⚡ Швидкі дії & Інструменти (Astryx)",
      fr: "⚡ Actions Rapides & Outils (Astryx)",
      de: "⚡ Schnellaktionen & Werkzeuge (Astryx)",
      it: "⚡ Azioni Rapide & Strumenti (Astryx)",
      en: "⚡ Quick Actions & Tools (Astryx)",
    }[currentLang],
    subtitle: {
      uk: "Централізований пульт процедурних майстрів та швейцарського корпусу",
      fr: "Console centralisée des assistants procéduraux et du corpus suisse",
      de: "Zentrale Konsole für Verfahrensassistenten und Schweizer Recht",
      it: "Console centralizzata degli assistenti procedurali e corpus svizzero",
      en: "Centralized console of procedural wizards and Swiss legal corpus",
    }[currentLang],
    secEntities: {
      uk: "Додавання матеріалів та осіб",
      fr: "Ajout d'éléments & Parties",
      de: "Beweise & Parteien hinzufügen",
      it: "Aggiungi prove & parti",
      en: "Add Entities & Parties",
    }[currentLang],
    secDocs: {
      uk: "Процесуальні акти та експорт",
      fr: "Actes de procédure & Export",
      de: "Verfahrensakten & Export",
      it: "Atti processuali & Esportazione",
      en: "Procedural Filings & Export",
    }[currentLang],
    secCorpus: {
      uk: "Правовий корпус Швейцарії",
      fr: "Corpus juridique suisse",
      de: "Schweizer Rechtsquellen",
      it: "Fonti giuridiche svizzere",
      en: "Swiss Legal Corpus",
    }[currentLang],
    secModes: {
      uk: "Режими відображення та сесія",
      fr: "Modes d'affichage & Session",
      de: "Anzeigemodi & Sitzung",
      it: "Modalità di visualizzazione & Sessione",
      en: "Display Modes & Session",
    }[currentLang],
  };

  const handleAction = (actionFn?: () => void) => {
    if (actionFn) {
      actionFn();
      onClose();
    }
  };

  const handleTabAction = (tab: WorkspaceTab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className="relative w-full max-w-md h-full bg-[#0A0F1D] border-l border-slate-800/90 shadow-2xl flex flex-col z-10 overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-[#070B14] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {activeCase?.reference || "PE24.014624-SBA"}
              </span>
              <h2 className="text-xs sm:text-sm font-mono font-bold text-slate-100">
                {t.title}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close action drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 text-xs font-mono">
          {/* Section 1: Entities */}
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>{t.secEntities}</span>
              <span className="text-slate-500 text-[9px]">Ingestion</span>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => handleAction(onOpenEvidenceWizard)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-blue-500/30 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-300 group-hover:text-blue-200">
                      {currentLang === "uk"
                        ? "➕ Додати доказ (ШІ / Google Drive)"
                        : currentLang === "fr"
                        ? "➕ Ajouter une preuve (IA / GDrive)"
                        : "➕ Add Exhibit (AI / Google Drive)"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {currentLang === "uk"
                        ? "Автоматичний SHA-256 хеш, EXIF, аудіо-транскрипція та прив'язка до стадії"
                        : currentLang === "fr"
                        ? "Hachage SHA-256, EXIF, transcription audio et rattachement"
                        : "SHA-256 hash, EXIF, audio transcription & stage binding"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleAction(onOpenActorWizard)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-cyan-500/30 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-cyan-300 group-hover:text-cyan-200">
                      {currentLang === "uk"
                        ? "➕ Додати фігуранта (Кваліфікація КПК)"
                        : currentLang === "fr"
                        ? "➕ Ajouter une partie (Qualification CPP)"
                        : "➕ Add Party (CPP Standing)"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {currentLang === "uk"
                        ? "Статуси: потерпілий (ст. 115), обвинувачений (ст. 111), PADR (ст. 178), третя особа (ст. 933 CC)"
                        : currentLang === "fr"
                        ? "Statuts : partie plaignante, prévenu, PADR, tiers de bonne foi"
                        : "Roles: complainant, accused, PADR, bona fide third party"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Section 2: Procedural Acts & Export */}
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>{t.secDocs}</span>
              <span className="text-slate-500 text-[9px]">Filing & Delivery</span>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => handleAction(onOpenJudicialBundle)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-indigo-500/30 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-indigo-300 group-hover:text-indigo-200">
                      {currentLang === "uk"
                        ? "🖨️ Судовий Бандл PDF/A (Art. 100 CPP)"
                        : currentLang === "fr"
                        ? "🖨️ Bordereau officiel PDF/A (Art. 100 CPP)"
                        : "🖨️ Judicial Bundle PDF/A (Art. 100 CPC)"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {currentLang === "uk"
                        ? "Зведений реєстр 16 доказів з QR-кодами аудіо та EXIF"
                        : currentLang === "fr"
                        ? "Inventaire des 16 pièces avec QR codes audio et EXIF"
                        : "16-exhibit certified inventory with audio QR and EXIF"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleAction(onOpenCaseSync)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-emerald-500/30 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-300 group-hover:text-emerald-200">
                      {currentLang === "uk"
                        ? "📡 ШІ-Синхронізація справи (Sequential Sync)"
                        : currentLang === "fr"
                        ? "📡 Synchronisation IA séquentielle"
                        : "📡 Sequential Case Sync & Thinking"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {currentLang === "uk"
                        ? "Аудит фактів на вузлі Utopia DB .251, розрахунок секвестру CHF 47'700"
                        : currentLang === "fr"
                        ? "Audit des faits Utopia DB .251, calcul du séquestre CHF 47'700"
                        : "Utopia DB .251 audit, CHF 47,700 sequestration update"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleAction(onSendToKindle)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-blue-500/20 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-white">
                      {currentLang === "uk"
                        ? "📖 Відправити на Kindle (Whispersync)"
                        : currentLang === "fr"
                        ? "📖 Envoyer sur Kindle (Whispersync)"
                        : "📖 Send to Kindle (Whispersync)"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      tukroschu@kindle.com · 18 chapitres EPUB 3.0
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleTabAction("worm_ledger")}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700/60 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-slate-800 text-amber-400 group-hover:scale-110 transition-transform">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-white">
                      {currentLang === "uk"
                        ? "💾 Незмінний WORM Леджер (L-01)"
                        : currentLang === "fr"
                        ? "💾 Registre WORM immuable (L-01)"
                        : "💾 Immutable WORM Ledger (L-01)"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {currentLang === "uk"
                        ? "Журнал бітемпоральних суперсесій та криптографічні печатки"
                        : currentLang === "fr"
                        ? "Journal des supersessions bitemporelles et sceaux"
                        : "Bitemporal supersession audit trail & hashes"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Section 3: Legal Corpus */}
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>{t.secCorpus}</span>
              <span className="text-slate-500 text-[9px]">Lex Vaud & CH</span>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => handleAction(onOpenSwissCodes)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-amber-500/20 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-300 group-hover:text-amber-200">
                      {currentLang === "uk"
                        ? "📜 Кодекси Швейцарії (35 статей CH/VD)"
                        : currentLang === "fr"
                        ? "📜 Codes suisses & vaudois (35 articles)"
                        : "📜 Swiss & Cantonal Codes (35 articles)"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      CP, CPP, CC, CO, LEI · Повний двомовний текст статей
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleAction(onOpenLegalStrategy)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-blue-500/30 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-300 group-hover:text-blue-200">
                      {currentLang === "uk"
                        ? "⚖️ Меморандум & Шаблони (LLCA / CO / LAVI)"
                        : currentLang === "fr"
                        ? "⚖️ Note Juridique & Modèles (LLCA / CO / LAVI)"
                        : currentLang === "de"
                        ? "⚖️ Rechtsmemorandum & Vorlagen (BGFA / OR / OHG)"
                        : currentLang === "it"
                        ? "⚖️ Nota Giuridica & Modelli (LLCA / CO / LAVI)"
                        : "⚖️ Legal Strategy & Contracts (LLCA / CO / LAVI)"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {currentLang === "uk"
                        ? "Аналіз заборони quota litis, договір заліку (ст. 120 CO) та заява LAVI"
                        : currentLang === "fr"
                        ? "Analyse quota litis, contrat de compensation (art. 120 CO) et LAVI"
                        : "Quota litis compliance, Art. 120 CO set-off contract & LAVI"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleAction(onOpenGlossary)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700/60 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-slate-800 text-blue-300 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-white">
                      {currentLang === "uk"
                        ? "📖 Словник юридичних скорочень & B-SDD"
                        : currentLang === "fr"
                        ? "📖 Glossaire juridique & sigles B-SDD"
                        : "📖 Legal Glossary & B-SDD Acronyms"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      ATF, MP, PP, PADR, WORM, Invariants L-01..L-05
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => handleAction(onOpenDocs)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700/60 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-slate-800 text-slate-300 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-white">
                      {currentLang === "uk"
                        ? "📑 Документація B-SDD Legal Cockpit"
                        : currentLang === "fr"
                        ? "📑 Documentation & Architecture B-SDD"
                        : "📑 System Documentation & Architecture"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      ADR-001..011, Посібник адвоката, Специфікація Astryx
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Section 4: Display & Session */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>{t.secModes}</span>
              <span className="text-slate-500 text-[9px]">Cockpit Controls</span>
            </div>
            <div className="space-y-1.5">
              {onToggleEInkMode && (
                <button
                  onClick={onToggleEInkMode}
                  className="w-full text-left p-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700/60 text-slate-200 hover:text-white transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded bg-amber-500/10 text-amber-300">
                      {isEInkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">
                        {currentLang === "uk"
                          ? `Режим E-Ink Paperwhite: ${isEInkMode ? "УВІМКНЕНО" : "ВИМКНЕНО"}`
                          : currentLang === "fr"
                          ? `Mode E-Ink Paperwhite: ${isEInkMode ? "ACTIF" : "INACTIF"}`
                          : `E-Ink Paperwhite Mode: ${isEInkMode ? "ON" : "OFF"}`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {currentLang === "uk"
                          ? "Оптимізована висококонтрастна тема для читалок Kindle/Boox"
                          : currentLang === "fr"
                          ? "Contraste élevé pour liseuses Kindle/Boox"
                          : "High contrast monochrome rendering for E-Ink"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      isEInkMode ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        isEInkMode ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAction(onOpenSettings)}
                  className="p-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">
                    {currentLang === "uk" ? "Налаштування" : "Paramètres"}
                  </span>
                </button>

                <button
                  onClick={() => handleAction(onLockSession)}
                  className="p-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700/60 text-amber-300 hover:text-amber-200 transition-all flex items-center justify-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">
                    {currentLang === "uk" ? "Блокування" : "Verrouiller"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-800 bg-[#070B14] flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>B-SDD Invariants L-01..L-05 active</span>
          </div>
          <span>Astryx 1.2 · Swiss CPP</span>
        </div>
      </aside>
    </div>
  );
};
