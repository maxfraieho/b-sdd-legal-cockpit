import React, { useState, useEffect, useMemo } from "react";
import {
  Scale,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FolderOpen,
  Users,
  Printer,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  Play,
  Volume2,
  Lock,
  Layers,
  ArrowRight,
  Database,
  Send,
  Calendar,
  Eye,
  Info,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { LegalCase } from "../lib/casesManager";
import { PROCEDURAL_STAGES, getStageById } from "../data/proceduralStages";
import { ProceduralStage } from "../types/procedural";
import { WorkspaceTab } from "./Topbar";

interface ProceduralWorkflowViewProps {
  currentLang: SupportedLanguage;
  activeCase?: LegalCase;
  onTabChange: (tab: WorkspaceTab) => void;
  onOpenJudicialBundle?: () => void;
  onOpenCaseSync?: () => void;
  onOpenSwissCodes?: () => void;
  onOpenEvidenceWizard?: () => void;
  onSendToKindle?: () => void;
  onShowToast?: (title: string, desc: string, type?: "success" | "info") => void;
}

const CHECKPOINTS_STORAGE_KEY = "b_sdd_procedural_checkpoints_v1";

export const ProceduralWorkflowView: React.FC<ProceduralWorkflowViewProps> = ({
  currentLang,
  activeCase,
  onTabChange,
  onOpenJudicialBundle,
  onOpenCaseSync,
  onOpenSwissCodes,
  onOpenEvidenceWizard,
  onSendToKindle,
  onShowToast,
}) => {
  // Selected Stage (1 to 5)
  const [activeStageId, setActiveStageId] = useState<string>("STAGE-1-OUVERTURE");

  // Audio simulator state for Stage 3
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Checkpoints completion state
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(CHECKPOINTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    // Default initial checkpoints
    const initial: Record<string, boolean> = {};
    PROCEDURAL_STAGES.forEach((stage) => {
      stage.checkpoints.forEach((cp) => {
        initial[cp.id] = cp.isCompleted;
      });
    });
    return initial;
  });

  const handleToggleCheckpoint = (id: string) => {
    setCompletedCheckpoints((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(CHECKPOINTS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const activeStage = useMemo(() => {
    return getStageById(activeStageId) || PROCEDURAL_STAGES[0];
  }, [activeStageId]);

  // Stage progress calculation
  const stageStats = useMemo(() => {
    const total = activeStage.checkpoints.length;
    const completed = activeStage.checkpoints.filter((cp) => completedCheckpoints[cp.id]).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [activeStage, completedCheckpoints]);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#070B14] p-3 sm:p-5 flex flex-col font-sans select-none">
      {/* 1. TOP PIPELINE / STEPPER (Astryx 5-Stage Machine) */}
      <div className="mb-4 bg-[#0A0F1D] border border-slate-800/90 rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                <span>
                  {currentLang === "uk"
                    ? "Процедурний маршрут кримінального провадження"
                    : currentLang === "fr"
                    ? "Pipeline procédural du dossier pénal"
                    : "Swiss Criminal Procedure Pipeline"}
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-normal">
                  (CPP RS 312.0)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
              {activeCase?.reference || "PE24.014624-SBA"}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {currentLang === "uk" ? "Стадія " : "Phase "}
              {activeStage.order} / 5
            </span>
          </div>
        </div>

        {/* 5 Stages Grid / Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PROCEDURAL_STAGES.map((stage) => {
            const isActive = stage.id === activeStageId;
            const stageCompletedCount = stage.checkpoints.filter(
              (cp) => completedCheckpoints[cp.id]
            ).length;
            const isStageAllDone =
              stageCompletedCount === stage.checkpoints.length && stage.checkpoints.length > 0;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`text-left p-2.5 rounded-lg border transition-all relative flex flex-col justify-between ${
                  isActive
                    ? "bg-[#0F1E36] border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/60"
                    : isStageAllDone
                    ? "bg-[#09151A] border-emerald-500/40 hover:border-emerald-500/80 text-slate-300"
                    : "bg-[#080D1A] border-slate-800/80 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span
                      className={`font-bold ${
                        isActive
                          ? "text-blue-300"
                          : isStageAllDone
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      {stage.order}. {stage.stageCode.replace("STAGE-", "").split("-")[1]}
                    </span>
                    {isStageAllDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span
                        className={`text-[9px] px-1 rounded ${
                          isActive ? "bg-blue-500/20 text-blue-300" : "text-slate-500"
                        }`}
                      >
                        {stageCompletedCount}/{stage.checkpoints.length}
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-[11px] font-mono font-bold line-clamp-1 leading-tight ${
                      isActive ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {stage.title[currentLang] || stage.title.en}
                  </h3>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-800/40 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>
                    {stage.financialTargetChf
                      ? `CHF ${stage.financialTargetChf.toLocaleString("fr-CH")}`
                      : stage.articles[0]}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive
                        ? "bg-blue-400 animate-pulse"
                        : isStageAllDone
                        ? "bg-emerald-400"
                        : "bg-slate-700"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE STAGE WORKSPACE HEADER */}
      <div className="bg-[#0A0F1D] border border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {activeStage.stageCode}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {activeStage.courtAuthority[currentLang] || activeStage.courtAuthority.fr}
              </span>
              {activeStage.financialTargetChf && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Target: CHF {activeStage.financialTargetChf.toLocaleString("fr-CH", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight">
              {activeStage.title[currentLang] || activeStage.title.en}
            </h1>
            <p className="text-xs text-amber-300/90 font-mono mt-0.5">
              {activeStage.subtitle[currentLang] || activeStage.subtitle.en}
            </p>
          </div>

          {/* Legal Articles Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activeStage.articles.map((art) => (
              <button
                key={art}
                onClick={onOpenSwissCodes}
                className="px-2 py-1 rounded bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-slate-300 hover:text-white text-[10px] font-mono transition-colors flex items-center space-x-1"
                title={`Переглянути статтю ${art} у кодексах Швейцарії`}
              >
                <span>{art}</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Stage Narrative Description */}
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {activeStage.description[currentLang] || activeStage.description.en}
        </p>

        {/* Progress Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">
              {currentLang === "uk" ? "Прогрес стадії:" : "Progression de la phase :"}
            </span>
            <span className="font-bold text-blue-400">
              {stageStats.completed} / {stageStats.total} (
              {stageStats.percentage}%)
            </span>
          </div>
          <div className="w-36 sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${stageStats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. DEDICATED CONTEXTUAL TOOLS BY STAGE */}
      <div className="mb-4">
        {/* STAGE 1 CONTEXT: Alibi EXIF 1481 & Adriano Milli Shield */}
        {activeStage.id === "STAGE-1-OUVERTURE" && (
          <div className="bg-[#0A0F1D] border border-blue-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                  <Shield className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-mono font-bold text-blue-300">
                  {currentLang === "uk"
                    ? "Контекстний модуль: Верифікатор алібі EXIF 1481 & Щит L-03"
                    : currentLang === "fr"
                    ? "Module contextuel : Vérificateur d'alibi EXIF 1481 & Bouclier L-03"
                    : "Context Module : EXIF 1481 Alibi Verifier & L-03 Shield"}
                </h3>
              </div>
              <button
                onClick={() => onTabChange("factbook")}
                className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Factbook P-06</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Alibi comparator card */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Об'єктивний таймлайн алібі (Лозанна vs Рене)</span>
                  <span className="text-emerald-400 font-bold">Art. 303 CP</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded flex justify-between items-center text-emerald-200">
                    <span>📸 Фото EXIF 1481 (Place Chauderon, Lausanne)</span>
                    <strong className="font-mono">14:32:00</strong>
                  </div>
                  <div className="p-2 bg-rose-950/30 border border-rose-500/30 rounded flex justify-between items-center text-rose-200">
                    <span>🚨 Сфабрикований виклик 117 (Gare de Renens)</span>
                    <strong className="font-mono">14:37:00</strong>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-tight">
                  Відстань між точками — 4.8 км (мінімум 18 хв на авто/метро). Фізична присутність потерпілого в Рене о 14:37 математично та об'єктивно неможлива.
                </p>
              </div>

              {/* Adriano Milli immunity card */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Імунітет третьої особи (Адріано Міллі)</span>
                  <span className="text-amber-400 font-bold">Art. 933 CC (L-03)</span>
                </div>
                <div className="p-2 bg-blue-950/20 border border-blue-500/30 rounded text-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Статус:</span>
                    <span className="text-emerald-400 font-bold">Добросовісний третій набувач</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Підтверджена розписка:</span>
                    <span className="text-amber-300 font-bold">CHF 13'500.- (P-13)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Процесуальний імунітет:</span>
                    <span className="text-blue-300">Повний захист від ретенції</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => onTabChange("actors")}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono"
                  >
                    Переглянути статус у Реєстрі фігурантів
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2 CONTEXT: Asset Sequestration CHF 47'700.00 */}
        {activeStage.id === "STAGE-2-SEQUESTRE" && (
          <div className="bg-[#0A0F1D] border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-mono font-bold text-amber-300">
                  {currentLang === "uk"
                    ? "Контекстний модуль: Розрахунок секвестру CHF 47'700.00 (ст. 263 КПК)"
                    : currentLang === "fr"
                    ? "Module contextuel : Calcul du séquestre CHF 47'700.00 (Art. 263 CPP)"
                    : "Context Module : Sequestration Calculation CHF 47,700.00 (Art. 263 CPC)"}
                </h3>
              </div>
              <button
                onClick={() => onTabChange("pleadings")}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <span>Скласти клопотання</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Sequestration breakdown */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[11px] block font-bold">
                  Структура забезпечувальної вимоги (Art. 263 al. 1 let. b et c CPP):
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>1. Повернення капіталу ($15'000 USD):</span>
                    <span className="text-emerald-400 font-bold">CHF 13'500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>2. Ремонт зламаного замка (Pièce P-10):</span>
                    <span className="text-emerald-400 font-bold">CHF 850.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>3. Окуляри скрипаля (P-16, ст. 144 КК):</span>
                    <span className="text-emerald-400 font-bold">CHF 850.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>4. Моральна шкода & катування (ст. 49 CO):</span>
                    <span className="text-emerald-400 font-bold">CHF 32'500.00</span>
                  </div>
                  <div className="flex justify-between text-amber-300 pt-1 font-bold text-xs">
                    <span>РАЗОМ ДО СЕКВЕСТРУ:</span>
                    <span>CHF 47'700.00</span>
                  </div>
                </div>
              </div>

              {/* Target Bank Accounts & Injunctions */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-bold mb-1.5">
                    Цільові банківські установи підозрюваних:
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-300">UBS Switzerland AG (Genève/Vaud)</span>
                      <span className="text-amber-400 font-bold">Art. 192 CPP</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-300">Wise Europe SA (IBAN BE / P-05)</span>
                      <span className="text-amber-400 font-bold">Art. 263 CPP</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  {onOpenCaseSync && (
                    <button
                      onClick={onOpenCaseSync}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-mono transition-colors"
                    >
                      Синхронізувати суму в Utopia DB
                    </button>
                  )}
                  <button
                    onClick={() => onTabChange("pleadings")}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-[11px] font-mono transition-colors"
                  >
                    Згенерувати клопотання
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3 CONTEXT: Confrontations & Audio Forensics Player */}
        {activeStage.id === "STAGE-3-CONFRONTATION" && (
          <div className="bg-[#0A0F1D] border border-indigo-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
                  <Volume2 className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-mono font-bold text-indigo-300">
                  {currentLang === "uk"
                    ? "Контекстний модуль: Аудіодокази та тест допустимості ATF 146 IV 9"
                    : currentLang === "fr"
                    ? "Module contextuel : Preuves audio et test d'admissibilité ATF 146 IV 9"
                    : "Context Module : Audio Evidence & Admissibility Test ATF 146 IV 9"}
                </h3>
              </div>
              <button
                onClick={() => onTabChange("factbook")}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>Фоноскопічний плеєр</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Key Audio Exhibits */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[11px] block font-bold">
                  Ключові аудіозаписи погроз та вимагання:
                </span>
                <div className="space-y-1.5">
                  {[
                    {
                      id: "P-01",
                      title: "Аудіозапис погроз розправою та вимагання $15k",
                      duration: "04:12",
                      timestamp: "01:24",
                      quote: "«Te tuer... je te détruis si tu parles»",
                    },
                    {
                      id: "P-02",
                      title: "Телефонний дзвінок шантажу та психологічного тиску",
                      duration: "02:45",
                      timestamp: "00:58",
                      quote: "«Tu n'as aucun droit ici, donne l'argent»",
                    },
                  ].map((aud) => (
                    <div
                      key={aud.id}
                      className="p-2 bg-[#0A0F1D] border border-slate-800 rounded flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setPlayingAudioId(playingAudioId === aud.id ? null : aud.id);
                            onShowToast?.(
                              playingAudioId === aud.id ? "Аудіо зупинено" : "Відтворення",
                              aud.title,
                              "info"
                            );
                          }}
                          className={`p-1.5 rounded-full transition-colors ${
                            playingAudioId === aud.id
                              ? "bg-indigo-600 text-white animate-pulse"
                              : "bg-slate-800 text-indigo-300 hover:bg-slate-700"
                          }`}
                        >
                          <Play className="w-3 h-3" />
                        </button>
                        <div>
                          <span className="font-bold text-slate-200">
                            {aud.id}: {aud.title}
                          </span>
                          <span className="block text-[10px] text-amber-300/90 font-mono italic">
                            Цитата [{aud.timestamp}]: {aud.quote}
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-500 text-[10px]">{aud.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ATF 146 IV 9 Legal Analysis */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">Баланс інтересів за ATF 146 IV 9:</span>
                  <span className="text-emerald-400 font-bold">Доказ допустимий</span>
                </div>
                <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded text-emerald-200 text-[11px] space-y-1">
                  <div>
                    ✓ Тяжкість інкримінованих злочинів (CP 146 шахрайство, CP 180 погрози, CP 181 примус).
                  </div>
                  <div>
                    ✓ Стан крайньої необхідності потерпілого для захисту життя та фізичної недоторканності.
                  </div>
                  <div>
                    ✓ Відсутність інших засобів доказування усних погроз наодинці.
                  </div>
                </div>
                <button
                  onClick={() => onTabChange("ai_copilot")}
                  className="w-full py-1 text-center bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded text-[10px] font-mono transition-colors"
                >
                  Аналізувати в Astryx Legal Copilot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4 CONTEXT: Clôture & 10-Day Appeal Countdown */}
        {activeStage.id === "STAGE-4-CLOTURE" && (
          <div className="bg-[#0A0F1D] border border-rose-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded bg-rose-500/10 text-rose-400">
                  <Clock className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-mono font-bold text-rose-300">
                  {currentLang === "uk"
                    ? "Контекстний модуль: Присічний 10-денний строк оскарження (Art. 396 al. 1 CPP)"
                    : currentLang === "fr"
                    ? "Module contextuel : Délai impératif de recours de 10 jours (Art. 396 al. 1 CPP)"
                    : "Context Module : Mandatory 10-Day Appeal Deadline (Art. 396 para 1 CPC)"}
                </h3>
              </div>
              <button
                onClick={() => onTabChange("pleadings")}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center space-x-1"
              >
                <span>Підготувати скаргу</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Countdown Clock Panel */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">Таймер процесуального дедлайну:</span>
                  <span className="text-rose-400 font-bold animate-pulse">Art. 396 CPP</span>
                </div>
                <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded flex items-center justify-around text-center">
                  <div>
                    <span className="text-2xl font-bold font-mono text-rose-300">08</span>
                    <span className="block text-[10px] text-slate-400">ДНІВ</span>
                  </div>
                  <span className="text-xl font-mono text-rose-500">:</span>
                  <div>
                    <span className="text-2xl font-bold font-mono text-rose-300">14</span>
                    <span className="block text-[10px] text-slate-400">ГОДИН</span>
                  </div>
                  <span className="text-xl font-mono text-rose-500">:</span>
                  <div>
                    <span className="text-2xl font-bold font-mono text-rose-300">32</span>
                    <span className="block text-[10px] text-slate-400">ХВИЛИН</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Скарга на будь-яку постанову прокурора подається до Палати кримінальних апеляцій (Chambre des recours pénale du Tribunal cantonal) у строк не більше 10 календарних днів.
                </p>
              </div>

              {/* Complementary investigations Art. 318 */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-bold mb-1">
                    Вимоги про доповнення слідства (Art. 318 al. 1 CPP):
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-amber-400">●</span>
                      <span>Витребування логів транзакцій Wise (Art. 192 CPP)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-amber-400">●</span>
                      <span>Форензік-експертиза медичних окулярів P-16</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-amber-400">●</span>
                      <span>Повторна очна ставка щодо погроз убивством</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onTabChange("pleadings")}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-mono transition-colors"
                  >
                    Скласти клопотання за ст. 318 КПК
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5 CONTEXT: Bundle PDF/A & WORM Seal */}
        {activeStage.id === "STAGE-5-JUGEMENT" && (
          <div className="bg-[#0A0F1D] border border-emerald-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                  <Printer className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-mono font-bold text-emerald-300">
                  {currentLang === "uk"
                    ? "Контекстний модуль: Судовий Бандл PDF/A & Незмінний WORM Seal"
                    : currentLang === "fr"
                    ? "Module contextuel : Bordereau officiel PDF/A & Sceau WORM"
                    : "Context Module : Official Judicial Bundle PDF/A & WORM Seal"}
                </h3>
              </div>
              {onOpenJudicialBundle && (
                <button
                  onClick={onOpenJudicialBundle}
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <span>Відкрити бандл</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Bundle summary */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[11px] block font-bold">
                  Офіційний реєстр матеріалів (Art. 100 CPP):
                </span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span>Кількість розділів досьє:</span>
                    <span className="text-blue-400 font-bold">18 chapitres</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span>Офіційні докази з QR-кодами:</span>
                    <span className="text-emerald-400 font-bold">16 pièces cotées (P-01..P-16)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span>Учасники провадження:</span>
                    <span className="text-amber-400 font-bold">5 protagonistes qualifiés</span>
                  </div>
                </div>
              </div>

              {/* WORM seal & Kindle export */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-bold mb-1">
                    Статус незмінного запечатування:
                  </span>
                  <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-[10px] space-y-1">
                    <div>✓ Invariant L-01: Utopia DB node .251 синхронізовано</div>
                    <div>✓ ISO/IEC 27037: SHA-256 хеші зафіксовано</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {onSendToKindle && (
                    <button
                      onClick={onSendToKindle}
                      className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500 text-blue-200 rounded text-[11px] font-mono transition-colors"
                    >
                      На Kindle
                    </button>
                  )}
                  {onOpenJudicialBundle && (
                    <button
                      onClick={onOpenJudicialBundle}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-[11px] font-mono transition-colors"
                    >
                      Друк PDF/A
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. CHECKPOINTS CHECKLIST FOR ACTIVE STAGE */}
      <div className="bg-[#0A0F1D] border border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-sm flex-1">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-slate-800 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </span>
            <h3 className="text-xs sm:text-sm font-mono font-bold text-slate-200">
              {currentLang === "uk"
                ? "Процесуальні чекпоїнти стадії (Контрольний список адвоката)"
                : currentLang === "fr"
                ? "Points de contrôle procéduraux (Check-list de l'avocat)"
                : "Procedural Stage Checkpoints (Counsel's Checklist)"}
            </h3>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {stageStats.completed} / {stageStats.total} {currentLang === "uk" ? "виконано" : "validés"}
          </span>
        </div>

        {/* List of checkpoints */}
        <div className="space-y-2">
          {activeStage.checkpoints.map((cp) => {
            const isDone = Boolean(completedCheckpoints[cp.id]);
            const label = cp.label[currentLang] || cp.label.en;
            const desc = cp.description?.[currentLang] || cp.description?.en;

            return (
              <div
                key={cp.id}
                onClick={() => handleToggleCheckpoint(cp.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start space-x-3 ${
                  isDone
                    ? "bg-[#091419] border-emerald-500/30 text-slate-300"
                    : "bg-[#080D1A] border-slate-800 hover:border-slate-700 text-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => {}} // handled by parent div
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isDone ? "line-through text-slate-400" : "text-slate-100"
                      }`}
                    >
                      {label}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {cp.pieceCote && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
                          {cp.pieceCote}
                        </span>
                      )}
                      {cp.legalBasis && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                          {cp.legalBasis}
                        </span>
                      )}
                    </div>
                  </div>
                  {desc && (
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-snug">
                      {desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
