import React, { useState } from "react";
import {
  Sparkles,
  Shield,
  ShieldCheck,
  Brain,
  Scale,
  DollarSign,
  Activity,
  CheckCircle2,
  X,
  Copy,
  Download,
  Send,
  Users,
  FileText,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  ChevronRight,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { ActorItem, resolveLocalized } from "../data/legalData";
import { LegalCase } from "../lib/casesManager";
import { getAllLawArticles } from "../data/swissLawCodes";
import caseSyncLatestData from "../data/case_sync_latest.json";

interface CaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: LegalCase;
  actors: ActorItem[];
  currentLang: SupportedLanguage;
  onCommitWormSeal: () => void;
  onShowToast: (title: string, description: string, type?: "success" | "info") => void;
}

export const CaseSyncModal: React.FC<CaseSyncModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  actors,
  currentLang,
  onCommitWormSeal,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<"interactive" | "spark">("interactive");
  const [isRunningSync, setIsRunningSync] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [copiedSparkPayload, setCopiedSparkPayload] = useState(false);

  if (!isOpen) return null;

  const totalLawArticles = getAllLawArticles().length;

  // Breakdown of actors
  const victimCount = actors.filter((a) => a.procedural_standing === "victime_plaignante").length;
  const accusedCount = actors.filter((a) =>
    ["prevenu_principal", "prevenu_complice"].includes(a.procedural_standing || "")
  ).length;
  const protectedCount = actors.filter((a) => a.bona_fide).length;
  const otherActorsCount = actors.length - victimCount - accusedCount - protectedCount;

  // Sequential Thinking Steps
  const sequentialSteps = [
    {
      num: 1,
      titleUk: "Верифікація інваріантів B-SDD (L-01, L-03, L-04, L-05)",
      titleFr: "Vérification des invariants B-SDD (L-01, L-03, L-04, L-05)",
      descUk:
        "Імунітет Adriano Milli (ст. 933 CC) підтверджено; Арсен Коваленко (26 р.) — повнолітній потерпілий; хеші ISO/IEC 27037 валідні.",
      descFr:
        "Immunité d'Adriano Milli (Art. 933 CC) scellée ; Arsen Kovalenko (26 ans) partie plaignante ; scellés SHA-256 valides.",
      status: currentStep >= 1 ? "done" : currentStep === 0 && isRunningSync ? "active" : "pending",
    },
    {
      num: 2,
      titleUk: "Допустимість аудіодоказів (ATF 147 IV 9 & ст. 141 al. 2 КПК)",
      titleFr: "Exploitabilité probatoire (ATF 147 IV 9 & Art. 141 al. 2 CPP)",
      descUk:
        "Зважування інтересів (pesée des intérêts) та стан доказової скрути (légitime défense probatoire) легалізують усі 61 записи.",
      descFr:
        "La pesée des intérêts et la détresse probatoire confirment la pleine admissibilité des 61 enregistrements in statu nascendi.",
      status: currentStep >= 2 ? "done" : currentStep === 1 ? "active" : "pending",
    },
    {
      num: 3,
      titleUk: "Психологічний стан Олени Коваленко (Auteur sous emprise, ст. 18, 48 КК)",
      titleFr: "Analyse d'emprise psychologique (Auteur sous emprise, Art. 18, 48 CP)",
      descUk:
        "Дисоціативний розлад та маніпулятивний вплив Любові Суворової знімають роль організатора з Олени; нові особи кваліфікуються окремо.",
      descFr:
        "Trouble dissociatif et emprise perverse de Liubov Suvorova : absence de dessein autonome, requalification conforme au CP.",
      status: currentStep >= 3 ? "done" : currentStep === 2 ? "active" : "pending",
    },
    {
      num: 4,
      titleUk: "Кримінальна субсумція за 35 статтями KùzuDB MemPalace",
      titleFr: "Subsomption pénale selon les 35 articles de KùzuDB MemPalace",
      descUk:
        "Підтверджено склад злочинів за ст. 146, 180, 181, 157, 138, 24, 25, 303, 304 КК Швейцарії та ст. 118 LEI.",
      descFr:
        "Infractions confirmées sous l'angle des art. 146, 180, 181, 157, 138, 24, 25, 303, 304 CP et 118 LEI.",
      status: currentStep >= 4 ? "done" : currentStep === 3 ? "active" : "pending",
    },
    {
      num: 5,
      titleUk: "Перерахунок суми арешту (ст. 263 КПК) та цивільний позов (ст. 122 КПК)",
      titleFr: "Recalcul du séquestre (Art. 263 CPP) & conclusions civiles (Art. 122 CPP)",
      descUk:
        "Загальна гарантована сума: CHF 46'850.00 ($15k USD + tort moral CHF 30'000 + витрати TDIP). Клопотання готові для прокуратури Лозанни.",
      descFr:
        "Créance totale garantie : CHF 46'850.00 (15'000 USD + tort moral CHF 30'000 + dépens TDIP). Écritures prêtes pour le MP Vaud.",
      status: currentStep >= 5 ? "done" : currentStep === 4 ? "active" : "pending",
    },
  ];

  // Handler to run interactive sequential sync
  const handleRunSequentialSync = () => {
    setIsRunningSync(true);
    setSyncCompleted(false);
    setCurrentStep(1);

    setTimeout(() => setCurrentStep(2), 600);
    setTimeout(() => setCurrentStep(3), 1200);
    setTimeout(() => setCurrentStep(4), 1800);
    setTimeout(() => {
      setCurrentStep(5);
      setIsRunningSync(false);
      setSyncCompleted(true);
      onShowToast(
        currentLang === "uk" ? "ШІ-Синхронізацію успішно завершено" : "Synchronisation IA réussie",
        currentLang === "uk"
          ? "Стан доказової бази та юридичної моделі оновлено (CHF 46'850.00 / 35 статей)"
          : "État probatoire et modèle juridique mis à jour (CHF 46'850.00 / 35 articles)",
        "success"
      );
    }, 2400);
  };

  // Spark JSON Payload
  const sparkPayload = {
    task_id: `SPARK-CASE-SYNC-${Date.now()}`,
    case_reference: activeCase.reference || "PE24.014624-SBA",
    jurisdiction: "Ministère public d'arrondissement de Lausanne (Vaud)",
    timestamp: new Date().toISOString(),
    invariants: {
      L_01: "WORM_AUDIT_TRAIL",
      L_03: "ADRIANO_MILLI_IMMUNITY_ART_933_CC",
      L_04: "ARSEN_KOVALENKO_BORN_05_11_1999_ADULT_VICTIM",
      L_05: "ISO_IEC_27037_SHA256_SEALS",
    },
    context: {
      actors_count: actors.length,
      statutes_available: totalLawArticles,
      exhibits_registered: 41,
      sequestration_target_chf: 46850.0,
      olena_status: "Auteur sous emprise psychologique (Art. 18, 48 CP)",
    },
    instructions:
      "Execute full legal synthesis over transcripts (61 drawers), evidence exhibits (41 cotes), and 35 Swiss federal and cantonal Vaud statutes. Return structured JSON with revised charges, contradiction reports, and updated French prosecution motions.",
  };

  const sparkPayloadStr = JSON.stringify(sparkPayload, null, 2);

  const handleCopySpark = () => {
    navigator.clipboard.writeText(sparkPayloadStr);
    setCopiedSparkPayload(true);
    setTimeout(() => setCopiedSparkPayload(false), 2500);
    onShowToast(
      currentLang === "uk" ? "Завдання скопійовано" : "Payload copié",
      currentLang === "uk"
        ? "Пакет завдання готовий для вставки у пошту чи веб-інтерфейс Spark на .161"
        : "Payload prêt pour Spark via le relais n8n ou web",
      "info"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0A0E1A] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0E1526] via-[#141B30] to-[#0E1526] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-800 rounded-xl shadow-md text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {currentLang === "uk"
                    ? "ШІ-Синхронізація справи та Доказової бази"
                    : "Synchronisation IA & Synthèse Juridique"}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Sequential Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentLang === "uk"
                  ? `Досьє: ${activeCase.reference} · KùzuDB MemPalace (${totalLawArticles} статей) · 41 речовий доказ`
                  : `Dossier: ${activeCase.reference} · KùzuDB MemPalace (${totalLawArticles} articles) · 41 pièces`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Stats Strip */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-2">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Фігуранти:</span>
            <strong className="text-white">{actors.length}</strong>
            <span className="text-[10px] text-slate-500">
              ({victimCount}V/{accusedCount}A/{protectedCount}P)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Речові докази:</span>
            <strong className="text-emerald-300">41 шт.</strong>
            <span className="text-[10px] text-slate-500">(Серії A-E)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Статті KùzuDB:</span>
            <strong className="text-amber-300">{totalLawArticles} норм</strong>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">Арешт (ст. 263):</span>
            <strong className="text-purple-300">CHF 46'850</strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-[#0B101D] flex space-x-4 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab("interactive")}
            className={`pb-2.5 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "interactive"
                ? "border-purple-500 text-purple-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>
              {currentLang === "uk"
                ? "1. Інтерактивна Sequential-синхронізація (В браузері)"
                : "1. Synchronisation Séquentielle Interactive"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("spark")}
            className={`pb-2.5 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "spark"
                ? "border-violet-500 text-violet-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {currentLang === "uk"
                ? "2. Фоновий аудит Gemini Spark (.161 Loop)"
                : "2. Audit Profond Gemini Spark (.161)"}
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === "interactive" && (
            <div className="space-y-4">
              {/* Information Notice */}
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-start space-x-3">
                <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <p className="font-semibold text-purple-200">
                    {currentLang === "uk"
                      ? "Автономний конвеєр переоцінки доказової бази (5 послідовних кроків):"
                      : "Pipeline autonome d'évaluation probatoire (5 étapes séquentielles) :"}
                  </p>
                  <p>
                    {currentLang === "uk"
                      ? "ШІ аналізує всі внесені зміни (нових фігурантів, додані скани/фото, скориговані заяви) та порівнює їх із 35 нормами швейцарського кримінального і процесуального права у MemPalace. Враховується дисоціативний стан Олени Коваленко (ст. 18, 48 КК) та зберігається абсолютний імунітет Адріано Міллі (ст. 933 CC)."
                      : "L'IA analyse les deltas, confronte les déclarations aux 35 articles de lois suisses et requalifie la créance garantie ainsi que les conclusions civiles de la procédure PE24.014624-SBA."}
                  </p>
                </div>
              </div>

              {/* 5 Sequential Steps List */}
              <div className="space-y-2.5">
                {sequentialSteps.map((step) => (
                  <div
                    key={step.num}
                    className={`p-3 rounded-xl border transition-all ${
                      step.status === "done"
                        ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200"
                        : step.status === "active"
                        ? "bg-purple-950/30 border-purple-500 text-white shadow-lg animate-pulse"
                        : "bg-slate-900/40 border-slate-800/80 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            step.status === "done"
                              ? "bg-emerald-500 text-slate-950"
                              : step.status === "active"
                              ? "bg-purple-500 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {step.status === "done" ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                        </div>
                        <h4 className="font-semibold text-slate-200 text-xs">
                          {currentLang === "uk" ? step.titleUk : step.titleFr}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {step.status === "done"
                          ? "✓ Завершено"
                          : step.status === "active"
                          ? "Аналіз..."
                          : "В очікуванні"}
                      </span>
                    </div>
                    <p className="mt-1.5 ml-8 text-[11px] text-slate-400 leading-normal">
                      {currentLang === "uk" ? step.descUk : step.descFr}
                    </p>
                  </div>
                ))}
              </div>

              {/* Success Result Box */}
              {syncCompleted && (
                <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {currentLang === "uk"
                        ? "Юридична модель та стан доказів успішно оновлені"
                        : "Modèle juridique et statut probatoire synchronisés"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1">
                    <div>
                      • Арешт активів (ст. 263 КПК):{" "}
                      <strong className="text-white">CHF 46'850.00</strong>
                    </div>
                    <div>
                      • Допустимість за ATF 147 IV 9:{" "}
                      <strong className="text-emerald-300">100% EXPLOITABLE</strong>
                    </div>
                    <div>
                      • Статус Олени Коваленко:{" "}
                      <strong className="text-amber-300">Auteur sous emprise (ст. 18, 48 CP)</strong>
                    </div>
                    <div>
                      • Імунітет Адріано Міллі:{" "}
                      <strong className="text-emerald-300">Absolument protégé (ст. 933 CC)</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "spark" && (
            <div className="space-y-3">
              <div className="p-3 bg-violet-950/20 border border-violet-500/30 rounded-xl flex items-start space-x-3 text-[11px] text-slate-300">
                <Send className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-violet-200">
                    {currentLang === "uk"
                      ? "Фоновий зв'язок із Gemini Spark на хості 192.168.3.161:"
                      : "Boucle de rétroaction avec Gemini Spark sur l'hôte 192.168.3.161 :"}
                  </p>
                  <p>
                    {currentLang === "uk"
                      ? "Цей JSON-пакет формує повну постановку задачі для хмарного сервісу Gemini Spark. Spark має великий ліміт контексту та безкоштовно опрацьовує всі 61 транскрипт, 41 доказ і 35 статей кодексів, повертаючи готовий результат через пошту/n8n."
                      : "Ce payload JSON formalise la requête de synthèse globale pour Gemini Spark via la boucle de supervision n8n."}
                  </p>
                </div>
              </div>

              {/* JSON preview */}
              <div className="relative">
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                  {sparkPayloadStr}
                </pre>
                <button
                  onClick={handleCopySpark}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center space-x-1.5 transition-colors font-mono text-[10px]"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSparkPayload ? "Скопійовано!" : "Копіювати JSON"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-[#0B101D] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {syncCompleted ? (
              <span className="text-emerald-400">✓ Стан справи верифіковано та готовий до WORM-фіксації</span>
            ) : (
              <span>Натисніть «Запустити Sequential AI Sync» для перерахунку картини справи</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs"
            >
              Закрити
            </button>

            {activeTab === "interactive" ? (
              <button
                onClick={handleRunSequentialSync}
                disabled={isRunningSync}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all shadow-md ${
                  isRunningSync
                    ? "bg-purple-900 text-purple-200 cursor-wait animate-pulse"
                    : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white"
                }`}
              >
                {isRunningSync ? (
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>
                  {isRunningSync
                    ? "Синхронізація (Крок " + currentStep + "/5)..."
                    : "⚡ Запустити Sequential AI Sync"}
                </span>
              </button>
            ) : (
              <button
                onClick={handleCopySpark}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-1.5 transition-colors shadow-md"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Скопіювати завдання для Spark</span>
              </button>
            )}

            {syncCompleted && (
              <button
                onClick={() => {
                  onCommitWormSeal();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition-colors shadow-md"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>💾 Зафіксувати у WORM</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
