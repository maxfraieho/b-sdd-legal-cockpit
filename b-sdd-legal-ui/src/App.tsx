import React, { useState } from "react";
import { Topbar, WorkspaceTab } from "./components/Topbar";
import { KindleVoiceReview } from "./components/KindleVoiceReview";
import { EvidenceFactbook } from "./components/EvidenceFactbook";
import { PleadingsView } from "./components/PleadingsView";
import { WormLedgerView } from "./components/WormLedgerView";
import { LegalInspector } from "./components/LegalInspector";
import { ActionDock } from "./components/ActionDock";
import { GlossaryModal } from "./components/GlossaryModal";
import { SwissCodesModal } from "./components/SwissCodesModal";
import { EvidenceIngestionWizard } from "./components/EvidenceIngestionWizard";
import { SettingsModal } from "./components/SettingsModal";
import { SupportedLanguage, AppSettings, TranslationOverrides } from "./types/i18n";
import { loadAppSettings, loadOverrides } from "./lib/translator";
import { commitAtomicSupersession } from "./lib/wormLedger";
import { BordereauPiece, BORDEREAU_PIECES, resolveLocalized } from "./data/legalData";
import { CheckCircle2, BookOpen, Send, X, ShieldCheck } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("factbook");
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("uk");

  // Settings & Overrides
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [overrides, setOverrides] = useState<TranslationOverrides>(() => loadOverrides());
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Loading & toast states
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [isSendingKindle, setIsSendingKindle] = useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [swissCodesModalOpen, setSwissCodesModalOpen] = useState(false);
  const [evidenceWizardOpen, setEvidenceWizardOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: "success" | "info";
  } | null>(null);

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
        onOpenGlossary={() => setGlossaryModalOpen(true)}
        onOpenEvidenceWizard={() => setEvidenceWizardOpen(true)}
        onOpenSwissCodes={() => setSwissCodesModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
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

          {currentTab === "pleadings" && (
            <PleadingsView currentLang={currentLang} />
          )}

          {currentTab === "worm_ledger" && (
            <WormLedgerView currentLang={currentLang} />
          )}
        </section>

        {/* ZONE C: CONTEXTUAL LEGAL INSPECTOR */}
        <section className={`h-full border-l border-slate-800/80 bg-[#0B1120] overflow-hidden w-full lg:w-[32%] ${
          mobileTab === "inspector" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        }`}>
          <LegalInspector currentLang={currentLang} />
        </section>
      </main>

      {/* ZONE D: BOTTOM ACTION DOCK (40px) */}
      <ActionDock
        currentLang={currentLang}
        onWormSeal={handleWormSeal}
        onSendToKindle={handleRecompileAndSendKindle}
        isSealing={isSealing}
        isSendingKindle={isSendingKindle}
        sequestrationAmount="CHF 46'850.00"
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
    </div>
  );
}
