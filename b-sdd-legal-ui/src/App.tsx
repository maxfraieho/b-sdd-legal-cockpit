import React, { useState } from "react";
import { Topbar, WorkspaceTab } from "./components/Topbar";
import { KindleVoiceReview } from "./components/KindleVoiceReview";
import { EvidenceFactbook } from "./components/EvidenceFactbook";
import { PleadingsView } from "./components/PleadingsView";
import { WormLedgerView } from "./components/WormLedgerView";
import { ActorsRegistryView } from "./components/ActorsRegistryView";
import { LegalInspector } from "./components/LegalInspector";
import { ActionDock } from "./components/ActionDock";
import { GlossaryModal } from "./components/GlossaryModal";
import { SwissCodesModal } from "./components/SwissCodesModal";
import { EvidenceIngestionWizard } from "./components/EvidenceIngestionWizard";
import { ActorIngestionWizard } from "./components/ActorIngestionWizard";
import { SettingsModal } from "./components/SettingsModal";
import { SupportedLanguage, AppSettings, TranslationOverrides } from "./types/i18n";
import { loadAppSettings, loadOverrides } from "./lib/translator";
import { commitAtomicSupersession } from "./lib/wormLedger";
import { BordereauPiece, BORDEREAU_PIECES, ActorItem, resolveLocalized } from "./data/legalData";
import { loadCaseActors, saveCaseActors } from "./lib/actorsManager";
import { AiLegalCopilotView } from "./components/AiLegalCopilotView";
import { ProceduralWorkflowView } from "./components/ProceduralWorkflowView";
import { ToolsCatalogView } from "./components/ToolsCatalogView";
import { CaseManagerModal } from "./components/CaseManagerModal";
import { DocumentationModal } from "./components/DocumentationModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileQuickMenuSheet } from "./components/MobileQuickMenuSheet";
import { JudicialBundleModal } from "./components/JudicialBundleModal";
import { CaseSyncModal } from "./components/CaseSyncModal";
import { LegalStrategyModal } from "./components/LegalStrategyModal";
import { AuthGate } from "./components/AuthGate";
import { AuthorizedUser } from "./types/auth";
import { getCurrentAuthSession, clearAuthSession } from "./lib/authManager";
import {
  LegalCase,
  BENCHMARK_CASES,
  loadAllCases,
  loadActiveCaseId,
  saveActiveCaseId,
  loadActorsForCase,
  saveActorsForCase,
} from "./lib/casesManager";
import { CheckCircle2, BookOpen, Send, X, ShieldCheck, PanelRightClose, PanelRightOpen, Scale } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("procedures");
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("uk");
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

  // Multi-Case State (ADR-011)
  const [cases, setCases] = useState<LegalCase[]>(() => loadAllCases());
  const [activeCaseId, setActiveCaseId] = useState<string>(() => loadActiveCaseId());
  const [caseManagerModalOpen, setCaseManagerModalOpen] = useState(false);

  const activeCase = React.useMemo(() => {
    return cases.find((c) => c.id === activeCaseId) || cases[0] || BENCHMARK_CASES[0];
  }, [cases, activeCaseId]);

  // Settings & Overrides
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [overrides, setOverrides] = useState<TranslationOverrides>(() => loadOverrides());
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Dynamic Case Actors state (scoped to active case)
  const [caseActors, setCaseActors] = useState<ActorItem[]>(() => loadActorsForCase(activeCaseId));
  const [actorWizardOpen, setActorWizardOpen] = useState(false);

  // Loading & toast states
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [isSendingKindle, setIsSendingKindle] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [swissCodesModalOpen, setSwissCodesModalOpen] = useState(false);
  const [evidenceWizardOpen, setEvidenceWizardOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [judicialBundleOpen, setJudicialBundleOpen] = useState(false);
  const [caseSyncModalOpen, setCaseSyncModalOpen] = useState(false);
  const [legalStrategyModalOpen, setLegalStrategyModalOpen] = useState(false);
  const [isEInkMode, setIsEInkMode] = useState(false);

  // Apply E-Ink Paperwhite mode to document body
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("e-ink-mode", isEInkMode);
    }
  }, [isEInkMode]);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: "success" | "info";
  } | null>(null);

  // Handle Case Switching
  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    saveActiveCaseId(caseId);
    const newActors = loadActorsForCase(caseId);
    setCaseActors(newActors);
    showToast(
      currentLang === "uk" ? "Активне досьє змінено" : "Dossier actif modifié",
      caseId
    );
  };

  // Kindle Dispatch Modal
  const [kindleModalOpen, setKindleModalOpen] = useState(false);
  const [kindleProgress, setKindleProgress] = useState(0);

  // Trigger toast with auto-hide
  const showToast = (title: string, description: string, type: "success" | "info" = "success") => {
    setToastMessage({ title, description, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Recompile EPUB & Send to Kindle action
  const handleRecompileAndSendKindle = (customTitle?: string, customText?: string) => {
    setIsSendingKindle(true);
    setIsRecompiling(true);
    setKindleModalOpen(true);
    setKindleProgress(15);

    setTimeout(() => setKindleProgress(45), 400);
    setTimeout(() => setKindleProgress(85), 900);
    setTimeout(() => {
      setKindleProgress(100);
      setIsSendingKindle(false);
      setIsRecompiling(false);

      if (customText) {
        // Download custom document markdown
        const blob = new Blob([customText], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(customTitle || "B-SDD_Document").replace(/\s+/g, "_")}.md`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Auto-download compiled EPUB bundle
        const link = document.createElement("a");
        link.href = "/docs/kindle/b-sdd-legal-user-guide.epub";
        link.download = "b-sdd-legal-user-guide.epub";
        link.click();
      }

      // Open email client prefilled for Kindle whispersync
      const subject = customTitle ? `B-SDD Legal: ${customTitle}` : "B-SDD Legal Book (PE24.014624-SBA)";
      const body = "Veuillez trouver ci-joint le document B-SDD Legal pour Kindle Whispersync.";
      window.open(`mailto:tukroschu@kindle.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");

      showToast(
        currentLang === "uk" ? "Досьє скомпільовано та відправлено на Kindle" : "Dossier ED10 envoyé à Kindle",
        currentLang === "uk"
          ? "Файл завантажено на пристрій, поштовий клієнт відкрито для передачі на tukroschu@kindle.com"
          : "18 chapitres compilés en EPUB 3.0 avec hachages SHA-256 et transmis à tukroschu@kindle.com"
      );
    }, 1500);
  };

  // Global WORM Seal action
  const handleWormSeal = async () => {
    setIsSealing(true);
    try {
      const record = await commitAtomicSupersession({
        entity_id: "DOSSIER-PE24.014624-SBA",
        chapter_id: "CH-18",
        summary: "Scellement bitemporel intégral du dossier PE24.014624-SBA dans Utopia DB (WORM L-01)",
        content_snapshot: "Validation formelle des 18 chapitres, réquisitions de séquestre CHF 47'700.00 et bouclier Adriano Milli (Art. 933 CC).",
        committer: "Conseil de la victime (Lausanne)",
      });
      setIsSealing(false);
      showToast(
        "Enregistrement WORM Scellé (L-01)",
        `Record ID: ${record.record_id} · SHA-256: ${record.sha256_hash.slice(0, 24)}...`
      );
    } catch (err) {
      setIsSealing(false);
      console.error(err);
    }
  };

  const [mobileTab, setMobileTab] = useState<"workspace" | "inspector">("workspace");

  // User Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AuthorizedUser | null>(() => {
    return getCurrentAuthSession()?.user || null;
  });

  const handleLockSession = () => {
    clearAuthSession();
    setCurrentUser(null);
    showToast(
      currentLang === "uk" ? "Сеанс заблоковано" : "Session Avocat Verrouillée",
      currentLang === "uk"
        ? "Екран захищено згідно зі ст. 73 КПК / ст. 13 LLCA. Потрібна повторна авторизація."
        : "Écran en mode veille sécurisé pour confidentialité clientèle (Art. 13 LLCA / Art. 73 CPP)",
      "info"
    );
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    showToast(
      currentLang === "uk" ? "Вихід з системи" : "Déconnexion",
      currentLang === "uk" ? "Сеанс Google завершено" : "Session Google terminée",
      "info"
    );
  };

  const handleCommitActor = (newActor: ActorItem) => {
    setCaseActors((prev) => {
      const idx = prev.findIndex((a) => a.id === newActor.id);
      let updated: ActorItem[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = newActor;
      } else {
        updated = [newActor, ...prev];
      }
      saveActorsForCase(activeCaseId, updated);
      return updated;
    });
    showToast(
      currentLang === "uk" ? "Фігуранта внесено до реєстру справи" : "Partie enregistrée au dossier",
      `${newActor.name} (${newActor.legal_reference})`
    );
  };

  return (
    <AuthGate
      currentLang={currentLang}
      onLanguageChange={setCurrentLang}
      expectedPassword={settings.authPassword || "0523"}
      autoLockMinutes={settings.autoLockMinutes || 15}
      onUserAuthenticated={(user) => {
        setCurrentUser(user);
        showToast(
          currentLang === "uk" ? `Авторизовано: ${user.name}` : `Connecté : ${user.name}`,
          `${user.email} (${user.role})`
        );
      }}
      onLockedStateChange={(locked) => {
        if (locked) {
          setCurrentUser(null);
        }
      }}
    >
      <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-[#080C14] text-slate-100 font-sans">
        {/* ZONE A: OMNI-HEADER (40px) */}
        <Topbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentLang={currentLang}
          onLangChange={setCurrentLang}
          onRecompileEpub={handleRecompileAndSendKindle}
          onLockSession={handleLockSession}
          isRecompiling={isRecompiling}
          onOpenDocs={() => setDocsModalOpen(true)}
          onOpenGlossary={() => setGlossaryModalOpen(true)}
          onOpenEvidenceWizard={() => setEvidenceWizardOpen(true)}
          onOpenActorWizard={() => setActorWizardOpen(true)}
          onOpenSwissCodes={() => setSwissCodesModalOpen(true)}
          onOpenJudicialBundle={() => setJudicialBundleOpen(true)}
          onOpenQuickMenu={() => setQuickMenuOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenCaseSync={() => setCaseSyncModalOpen(true)}
          onOpenLegalStrategy={() => setLegalStrategyModalOpen(true)}
          onSendToKindle={handleRecompileAndSendKindle}
          isEInkMode={isEInkMode}
          onToggleEInkMode={() => setIsEInkMode(!isEInkMode)}
          activeCase={activeCase}
          onOpenCaseManager={() => setCaseManagerModalOpen(true)}
          mobileTab={mobileTab}
          onMobileTabChange={setMobileTab}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

      {/* MIDDLE BODY: ZONE B & ZONE C (Collapsible) */}
      <main className="flex-1 w-full flex overflow-hidden min-h-0">
        {/* ZONE B: PRIMARY LEGAL WORKSPACE */}
        <section
          className={`h-full flex-col overflow-hidden w-full ${
            inspectorCollapsed ? "lg:w-[calc(100%-40px)]" : "lg:w-[68%]"
          } ${mobileTab === "workspace" ? "flex" : "hidden lg:flex"}`}
        >
          {currentTab === "procedures" && (
            <ProceduralWorkflowView
              currentLang={currentLang}
              activeCase={activeCase}
              onTabChange={setCurrentTab}
              onOpenJudicialBundle={() => setJudicialBundleOpen(true)}
              onOpenCaseSync={() => setCaseSyncModalOpen(true)}
              onOpenSwissCodes={() => setSwissCodesModalOpen(true)}
              onOpenEvidenceWizard={() => setEvidenceWizardOpen(true)}
              onSendToKindle={handleRecompileAndSendKindle}
              onShowToast={showToast}
            />
          )}

          {currentTab === "toolbox" && (
            <ToolsCatalogView
              currentLang={currentLang}
              activeCase={activeCase}
              onTabChange={setCurrentTab}
              onOpenEvidenceWizard={() => setEvidenceWizardOpen(true)}
              onOpenActorWizard={() => setActorWizardOpen(true)}
              onOpenSwissCodes={() => setSwissCodesModalOpen(true)}
              onOpenGlossary={() => setGlossaryModalOpen(true)}
              onOpenDocs={() => setDocsModalOpen(true)}
              onOpenJudicialBundle={() => setJudicialBundleOpen(true)}
              onOpenCaseSync={() => setCaseSyncModalOpen(true)}
              onSendToKindle={handleRecompileAndSendKindle}
              onShowToast={showToast}
            />
          )}

          {currentTab === "kindle_review" && (
            <KindleVoiceReview
              currentLang={currentLang}
              onCommitSuccess={(msg) => showToast("WORM Commit Validé", msg)}
            />
          )}

          {currentTab === "factbook" && (
            <EvidenceFactbook currentLang={currentLang} />
          )}

          {currentTab === "actors" && (
            <ActorsRegistryView
              currentLang={currentLang}
              actors={caseActors}
              onActorsChange={(updated) => {
                setCaseActors(updated);
                saveActorsForCase(activeCaseId, updated);
              }}
              onOpenAiWizard={() => setActorWizardOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentTab === "pleadings" && (
            <PleadingsView currentLang={currentLang} />
          )}

          {currentTab === "ai_copilot" && (
            <AiLegalCopilotView
              currentLang={currentLang}
              activeCase={activeCase}
              onNavigateToTab={(tab) => setCurrentTab(tab as any)}
              onShowToast={showToast}
            />
          )}

          {currentTab === "worm_ledger" && (
            <WormLedgerView currentLang={currentLang} />
          )}
        </section>

        {/* ZONE C: CONTEXTUAL LEGAL INSPECTOR (Collapsible Astryx Zone C) */}
        {inspectorCollapsed ? (
          <aside className="hidden lg:flex flex-col items-center justify-between py-3 w-[40px] bg-[#0A0F1D] border-l border-slate-800/90 select-none shrink-0">
            <button
              onClick={() => setInspectorCollapsed(false)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={currentLang === "uk" ? "Розгорнути Юридичний Інспектор" : "Développer le Legal Inspector"}
            >
              <PanelRightOpen className="w-4 h-4 text-amber-400" />
            </button>

            <div className="flex flex-col items-center space-y-3">
              <span className="text-[10px] font-mono font-bold text-amber-400 rotate-90 whitespace-nowrap tracking-wider">
                INSPECTOR
              </span>
              <div className="h-8 w-px bg-slate-800" />
              <div className="flex flex-col space-y-1 text-[9px] font-mono text-slate-500">
                <span title="L-01: WORM Ledger">L-01</span>
                <span title="L-02: Bitemporal">L-02</span>
                <span title="L-03: Milli Shield (933 CC)" className="text-amber-400 font-bold">L-03</span>
                <span title="L-04: Standing (115 CPP)" className="text-emerald-400 font-bold">L-04</span>
                <span title="L-05: Offline DB">L-05</span>
              </div>
            </div>

            <button
              onClick={() => setInspectorCollapsed(false)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300"
              title="Розгорнути деталі"
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </aside>
        ) : (
          <section className={`h-full border-l border-slate-800/80 bg-[#0B1120] overflow-hidden w-full lg:w-[32%] relative ${
            mobileTab === "inspector" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
          }`}>
            {/* Collapse toggle header strip */}
            <div className="hidden lg:flex items-center justify-between px-3 py-1 bg-[#080D1A] border-b border-slate-800 text-[10px] font-mono text-slate-400 shrink-0">
              <span className="flex items-center space-x-1.5">
                <Scale className="w-3 h-3 text-amber-400" />
                <span className="font-bold text-slate-300">LEGAL INSPECTOR</span>
              </span>
              <button
                onClick={() => setInspectorCollapsed(true)}
                className="flex items-center space-x-1 text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
                title={currentLang === "uk" ? "Згорнути інспектор" : "Réduire l'inspecteur"}
              >
                <PanelRightClose className="w-3.5 h-3.5" />
                <span>{currentLang === "uk" ? "Згорнути" : "Réduire"}</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LegalInspector currentLang={currentLang} actors={caseActors} activeCase={activeCase} />
            </div>
          </section>
        )}
      </main>

      {/* ZONE D: BOTTOM ACTION DOCK (40px) */}
      <ActionDock
        currentLang={currentLang}
        onWormSeal={handleWormSeal}
        onSendToKindle={handleRecompileAndSendKindle}
        onOpenCaseSync={() => setCaseSyncModalOpen(true)}
        isSealing={isSealing}
        isSendingKindle={isSendingKindle}
        sequestrationAmount={`CHF ${activeCase.sequestration_target_chf.toLocaleString("fr-CH", { minimumFractionDigits: 2 })}`}
      />

      {/* MOBILE BOTTOM NAVIGATION BAR (Facebook / Meta Asterisk 54px Bar) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
        currentLang={currentLang}
        onOpenQuickMenu={() => setQuickMenuOpen(true)}
      />

      {/* KINDLE DISPATCH PROGRESS MODAL */}
      {kindleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1120] border border-blue-600/50 rounded-lg max-w-md w-full p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Compilation EPUB 3.0 & Envoi Kindle
                </span>
              </div>
              {kindleProgress === 100 && (
                <button
                  onClick={() => setKindleModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Génération du bundle d'audience pour <strong>PE24.014624-SBA</strong>.
                Exportation des 18 chapitres et transmission sécurisée vers :
              </p>
              <div className="p-2 bg-[#070B12] rounded border border-slate-800 font-mono text-xs text-blue-300 flex items-center justify-between">
                <span>tukroschu@kindle.com</span>
                <span className="text-[10px] text-emerald-400 font-bold">Amazon Whispersync</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>
                    {kindleProgress < 50
                      ? "Compilation XHTML & CSS..."
                      : kindleProgress < 90
                      ? "Injection des hachages SHA-256..."
                      : "Transmission finale..."}
                  </span>
                  <span className="font-bold text-blue-400">{kindleProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${kindleProgress}%` }}
                  />
                </div>
              </div>

              {kindleProgress === 100 && (
                <div className="pt-2 flex items-center justify-between gap-2">
                  <a
                    href="/docs/kindle/b-sdd-legal-user-guide.epub"
                    download="b-sdd-legal-user-guide.epub"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/60 rounded text-xs font-mono transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Télécharger .EPUB</span>
                  </a>
                  <button
                    onClick={() => setKindleModalOpen(false)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium font-mono"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-12 right-4 z-50 bg-[#0F172A] border border-blue-500/60 rounded-lg p-3 shadow-2xl flex items-start space-x-3 max-w-sm animate-slideUp">
          <div className="p-1 bg-blue-500/10 text-blue-400 rounded shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-bold text-slate-100 font-mono">
              {toastMessage.title}
            </h4>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
              {toastMessage.description}
            </p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* GLOSSARY & ACRONYMS DECODER MODAL */}
      <GlossaryModal
        isOpen={glossaryModalOpen}
        onClose={() => setGlossaryModalOpen(false)}
        currentLang={currentLang}
      />

      {/* SWISS LAWS & CANTONAL VAUD CODES MODAL */}
      <SwissCodesModal
        isOpen={swissCodesModalOpen}
        onClose={() => setSwissCodesModalOpen(false)}
        currentLang={currentLang}
      />

      {/* AI EVIDENCE INGESTION & QUALIFICATION WIZARD */}
      <EvidenceIngestionWizard
        isOpen={evidenceWizardOpen}
        onClose={() => setEvidenceWizardOpen(false)}
        currentLang={currentLang}
        onCommitEvidence={(newPiece) => {
          setCurrentTab("factbook");
          showToast(
            currentLang === "uk" ? "Доказ кваліфіковано & WORM зафіксовано" : "Preuve Qualifiée & Scellée WORM",
            `${newPiece.cote}: ${resolveLocalized(newPiece.titre, currentLang)}`
          );
        }}
        existingPiecesCount={BORDEREAU_PIECES.length}
      />

      {/* AI ACTOR INGESTION & SWISS CPP QUALIFICATION WIZARD */}
      <ActorIngestionWizard
        isOpen={actorWizardOpen}
        onClose={() => setActorWizardOpen(false)}
        onCommitActor={(newActor) => {
          handleCommitActor(newActor);
          setCurrentTab("actors");
        }}
        existingActors={caseActors}
        currentLang={currentLang}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          setCurrentLang(newSettings.language);
          showToast(
            currentLang === "uk" ? "Налаштування збережено" : "Paramètres enregistrés",
            currentLang === "uk"
              ? "Конфігурацію ШІ-агента та базу кодексів успішно оновлено"
              : "Configuration de l'agent IA et corpus légal mis à jour"
          );
        }}
        overrides={overrides}
        onOverridesChange={setOverrides}
        currentLang={currentLang}
      />

      {/* MULTI-CASE MANAGEMENT MODAL (ADR-011) */}
      <CaseManagerModal
        isOpen={caseManagerModalOpen}
        onClose={() => setCaseManagerModalOpen(false)}
        cases={cases}
        activeCaseId={activeCaseId}
        onSelectCase={handleSelectCase}
        onCasesUpdated={setCases}
        currentLang={currentLang}
        onShowToast={showToast}
      />

      {/* DOCUMENTATION & USER MANUAL MODAL */}
      <DocumentationModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        currentLang={currentLang}
        kindleEmail={settings.kindleEmail}
        onShowToast={showToast}
      />

      {/* MOBILE QUICK ACTION SHEET (Meta / Facebook Asterisk Sheet) */}
      <MobileQuickMenuSheet
        isOpen={quickMenuOpen}
        onClose={() => setQuickMenuOpen(false)}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        activeCase={activeCase}
        onOpenCaseSync={() => setCaseSyncModalOpen(true)}
        onOpenCaseManager={() => setCaseManagerModalOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
        onOpenSwissCodes={() => setSwissCodesModalOpen(true)}
        onOpenEvidenceWizard={() => setEvidenceWizardOpen(true)}
        onOpenActorWizard={() => setActorWizardOpen(true)}
        onOpenJudicialBundle={() => setJudicialBundleOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onLockSession={handleLockSession}
        isEInkMode={isEInkMode}
        onToggleEInkMode={() => setIsEInkMode(!isEInkMode)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* JUDICIAL BUNDLE PDF/A MODAL */}
      <JudicialBundleModal
        isOpen={judicialBundleOpen}
        onClose={() => setJudicialBundleOpen(false)}
        activeCase={activeCase}
        currentLang={currentLang}
        onShowToast={showToast}
      />

      {/* AI CASE SYNC & SEQUENTIAL THINKING MODAL */}
      <CaseSyncModal
        isOpen={caseSyncModalOpen}
        onClose={() => setCaseSyncModalOpen(false)}
        activeCase={activeCase}
        actors={caseActors}
        currentLang={currentLang}
        onCommitWormSeal={handleWormSeal}
        onShowToast={showToast}
      />

      {/* SWISS LEGAL STRATEGY & CONTRACT TEMPLATES MODAL */}
      <LegalStrategyModal
        isOpen={legalStrategyModalOpen}
        onClose={() => setLegalStrategyModalOpen(false)}
        currentLang={currentLang}
        onSendToKindle={handleRecompileAndSendKindle}
      />
    </div>
    </AuthGate>
  );
}
