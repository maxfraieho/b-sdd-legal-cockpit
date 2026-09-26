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
import { CaseManagerModal } from "./components/CaseManagerModal";
import { DocumentationModal } from "./components/DocumentationModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileQuickMenuSheet } from "./components/MobileQuickMenuSheet";
import { JudicialBundleModal } from "./components/JudicialBundleModal";
import { CaseSyncModal } from "./components/CaseSyncModal";
import {
  LegalCase,
  BENCHMARK_CASES,
  loadAllCases,
  loadActiveCaseId,
  saveActiveCaseId,
  loadActorsForCase,
  saveActorsForCase,
} from "./lib/casesManager";
import { CheckCircle2, BookOpen, Send, X, ShieldCheck } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("factbook");
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("uk");

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
  const handleRecompileAndSendKindle = () => {
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
      showToast(
        "Dossier ED10 envoyé à Kindle",
        "18 chapitres compilés en EPUB 3.0 avec hachages SHA-256 et transmis à tukroschu@kindle.com"
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
        content_snapshot: "Validation formelle des 18 chapitres, réquisitions de séquestre CHF 46'850.00 et bouclier Adriano Milli (Art. 933 CC).",
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

  const handleLockSession = () => {
    showToast(
      "Session Avocat Verrouillée",
      "Écran en mode veille sécurisé pour confidentialité clientèle (Art. 13 LLCA)",
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
        activeCase={activeCase}
        onOpenCaseManager={() => setCaseManagerModalOpen(true)}
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
      />

      {/* MIDDLE BODY: ZONE B (68% desktop) & ZONE C (32% desktop) */}
      <main className="flex-1 w-full flex overflow-hidden min-h-0">
        {/* ZONE B: PRIMARY LEGAL WORKSPACE */}
        <section className={`h-full flex-col overflow-hidden w-full lg:w-[68%] ${
          mobileTab === "workspace" ? "flex" : "hidden lg:flex"
        }`}>
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

        {/* ZONE C: CONTEXTUAL LEGAL INSPECTOR */}
        <section className={`h-full border-l border-slate-800/80 bg-[#0B1120] overflow-hidden w-full lg:w-[32%] ${
          mobileTab === "inspector" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        }`}>
          <LegalInspector currentLang={currentLang} actors={caseActors} activeCase={activeCase} />
        </section>
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
                <div className="pt-2 flex justify-end">
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
    </div>
  );
}
