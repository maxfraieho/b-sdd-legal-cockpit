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
  HelpCircle,
  Sparkles,
  Settings,
  Users,
  UserPlus,
  Brain,
  ChevronDown,
  FolderPlus,
  Printer,
  Menu,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { LegalCase } from "../lib/casesManager";

export type WorkspaceTab = "kindle_review" | "factbook" | "actors" | "pleadings" | "ai_copilot" | "worm_ledger";

interface TopbarProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  onRecompileEpub: () => void;
  onLockSession: () => void;
  onOpenDocs?: () => void;
  onOpenGlossary?: () => void;
  onOpenEvidenceWizard?: () => void;
  onOpenActorWizard?: () => void;
  onOpenSwissCodes?: () => void;
  onOpenJudicialBundle?: () => void;
  onOpenQuickMenu?: () => void;
  onOpenSettings?: () => void;
  activeCase?: LegalCase;
  onOpenCaseManager?: () => void;
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
  onOpenDocs,
  onOpenGlossary,
  onOpenEvidenceWizard,
  onOpenActorWizard,
  onOpenSwissCodes,
  onOpenJudicialBundle,
  onOpenQuickMenu,
  onOpenSettings,
  activeCase,
  onOpenCaseManager,
  isRecompiling = false,
  mobileTab = "workspace",
  onMobileTabChange,
}) => {
  return (
    <header className="h-[44px] min-h-[44px] bg-[#0A0F1D] border-b border-slate-800/80 px-2 sm:px-3 flex items-center justify-between select-none z-30 shrink-0 gap-1 sm:gap-2">
      {/* LEFT: Case Badge & Case Switcher Dropdown */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        <button
          onClick={onOpenCaseManager}
          className="flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 px-2 py-1 rounded-md text-[11px] sm:text-xs font-mono font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)] transition-colors cursor-pointer min-h-[32px]"
          title="Клікніть для зміни справи або створення нового досьє"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{activeCase ? activeCase.reference : "PE24.014624-SBA"}</span>
          <ChevronDown className="w-3 h-3 text-amber-400/80 shrink-0" />
        </button>
        <div className="hidden xl:flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-medium truncate max-w-[220px]">
            {activeCase ? (activeCase.court[currentLang] || activeCase.court.fr) : "Ministère public vaudois (Lausanne)"}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400/90 font-mono text-[10px]">
            {activeCase ? `${activeCase.canton} (${activeCase.type.toUpperCase()})` : "Droits des victimes (CPP)"}
          </span>
        </div>
      </div>

      {/* CENTER: Segmented View Switcher (Desktop only >= lg) */}
      <nav className="hidden lg:flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800/70 overflow-x-auto no-scrollbar shrink-0">
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
            onTabChange("actors");
            onMobileTabChange?.("workspace");
          }}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "actors"
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="Реєстр дійових осіб, процесуальні статуси (КПК Во), фото та скани"
        >
          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {currentLang === 'uk' ? 'Фігуранти & Права' : currentLang === 'fr' ? 'Parties & Droits' : 'Parties & Standing'}
          </span>
          <span className="sm:hidden text-[10px]">Parties</span>
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
            onTabChange("ai_copilot");
            onMobileTabChange?.("workspace");
          }}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
            currentTab === "ai_copilot"
              ? "bg-indigo-600 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
          title="ШІ-Юрисконсульт, пошук по кодексах та суперечностях у базах"
        >
          <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-amber-300" />
          <span className="hidden sm:inline">
            {currentLang === 'uk' ? 'ШІ-Копілот & Кодекси' : currentLang === 'fr' ? 'IA & Corpus' : 'AI & Corpus'}
          </span>
          <span className="sm:hidden text-[10px]">ШІ</span>
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

      {/* RIGHT: Judicial Bundle, Language Switcher, Settings, and Mobile Menu */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
        {/* Judicial Bundle PDF/A Button (Visible on both desktop & mobile) */}
        {onOpenJudicialBundle && (
          <button
            onClick={onOpenJudicialBundle}
            className="flex items-center space-x-1 px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-md text-[11px] font-mono font-bold transition-all shadow-[0_0_8px_rgba(99,102,241,0.2)] shrink-0 min-h-[30px]"
            title="Офіційний судово-процесуальний бандл (PDF/A) з таблицями EXIF та QR-кодами аудіо"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-mono">
              {currentLang === "uk" ? "Судовий Бандл" : "Bordereau PDF"}
            </span>
          </button>
        )}

        {/* Desktop-only Action Tools (hidden on mobile < lg) */}
        {/* Daemon Pulse Indicator (Desktop only) */}
        <div
          className="hidden xl:flex items-center space-x-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono shrink-0"
          title="Локальний хост системи: 192.168.3.234 (LAN) | MCP Gateway :8766 | Utopia DB :9922 | Офлайн-бази"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300">LAN :8766</span>
        </div>

        {/* AI Evidence Ingestion Wizard Button (Desktop) */}
        {onOpenEvidenceWizard && (
          <button
            onClick={onOpenEvidenceWizard}
            className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded text-[11px] font-bold transition-all shadow-sm shrink-0"
            title="Майстер додавання доказів з Google Docs, файлів або аудіо з ШІ-кваліфікацією"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="font-mono">
              {currentLang === "uk" ? "+ Доказ (ШІ)" : currentLang === "fr" ? "+ Preuve IA" : "+ Exhibit AI"}
            </span>
          </button>
        )}

        {/* AI Actor Ingestion Wizard Button (Desktop) */}
        {onOpenActorWizard && (
          <button
            onClick={onOpenActorWizard}
            className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded text-[11px] font-bold transition-all shadow-sm shrink-0"
            title="Майстер додавання та ШІ-кваліфікації фігуранта за КПК Швейцарії"
          >
            <UserPlus className="w-3 h-3 text-cyan-200" />
            <span className="font-mono">
              {currentLang === "uk" ? "+ Фігурант (ШІ)" : currentLang === "fr" ? "+ Partie IA" : "+ Party AI"}
            </span>
          </button>
        )}

        {/* Swiss Codes & Cantonal Law Button (Desktop) */}
        {onOpenSwissCodes && (
          <button
            onClick={onOpenSwissCodes}
            className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded text-[11px] font-medium transition-colors shrink-0"
            title="База законів та кодексів Швейцарії (CP, CPP, CC, CO) та кантону Во"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono">
              {currentLang === "uk" ? "Кодекси CH/VD" : currentLang === "fr" ? "Codes CH/VD" : "Codes CH/VD"}
            </span>
          </button>
        )}

        {/* Documentation Button (Desktop) */}
        <button
          onClick={onOpenDocs || onOpenGlossary}
          className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-colors shrink-0"
          title="Посібник користувача, Керівництво розробника та Словник юридичних абревіатур"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono">
            {currentLang === "uk" ? "📖 Довідка & B-SDD" : currentLang === "fr" ? "📖 Docs & B-SDD" : "📖 Docs & B-SDD"}
          </span>
        </button>

        {/* Multilingual Language Selector (Always visible: UA, FR, DE, IT, EN) */}
        <div className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800/80 text-[10px] sm:text-[11px] font-mono shrink-0">
          {(['uk', 'fr', 'de', 'it', 'en'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLangChange(lang)}
              className={`px-1.5 py-0.5 rounded uppercase font-semibold transition-all ${
                currentLang === lang
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={lang === 'uk' ? 'Українська' : lang === 'fr' ? 'Français' : lang === 'de' ? 'Deutsch' : lang === 'it' ? 'Italiano' : 'English'}
            >
              {lang === 'uk' ? 'UA' : lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Quick Action: Recompile EPUB (Desktop) */}
        <button
          onClick={onRecompileEpub}
          disabled={isRecompiling}
          className={`hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium border transition-all shrink-0 ${
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
          <span className="font-mono">
            {isRecompiling ? "Compilation..." : "Recompiler EPUB"}
          </span>
        </button>

        {/* Settings Modal Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 transition-colors shrink-0"
            title="Налаштування ШІ-агента, проксі, доставки на Kindle та Google Docs"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Lock Session */}
        <button
          onClick={onLockSession}
          className="hidden sm:block p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-colors shrink-0"
          title="Заблокувати робочу станцію (Конфіденційність адвоката)"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Quick Action Menu Drawer Button (Meta/Facebook Astryx pattern) */}
        {onOpenQuickMenu && (
          <button
            onClick={onOpenQuickMenu}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-colors shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center shadow-sm"
            title={
              currentLang === "uk"
                ? "Швидке меню та інструменти (Astryx)"
                : currentLang === "it"
                ? "Menu rapido & strumenti (Astryx)"
                : currentLang === "de"
                ? "Schnellmenü & Werkzeuge (Astryx)"
                : currentLang === "fr"
                ? "Menu rapide & outils"
                : "Quick menu & tools (Astryx)"
            }
            aria-label="Open navigation and tools menu"
          >
            <Menu className="w-4 h-4 text-amber-400" />
          </button>
        )}
      </div>
    </header>
  );
};
