import React, { useState } from "react";
import {
  Scale,
  FileCheck,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Shield,
  Send,
  HelpCircle,
  Gavel,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  List,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import {
  LEGAL_REQUISITIONS,
  CONFRONTATIONS,
  LegalRequisition,
  ConfrontationItem,
  resolveLocalized,
  resolveLocalizedArray,
} from "../data/legalData";

interface PleadingsViewProps {
  currentLang: SupportedLanguage;
}

export const PleadingsView: React.FC<PleadingsViewProps> = ({ currentLang }) => {
  const [selectedReq, setSelectedReq] = useState<LegalRequisition>(LEGAL_REQUISITIONS[0]);
  const [selectedConf, setSelectedConf] = useState<ConfrontationItem>(CONFRONTATIONS[0]);
  const [activeSection, setActiveSection] = useState<"requisitions" | "confrontation">("requisitions");
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedConclusions, setCopiedConclusions] = useState(false);

  // Mobile list vs detail view state
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const handleCopyReq = () => {
    const conclusions = resolveLocalizedArray(selectedReq.conclusions_formelles, currentLang).join("\n- ");
    const text = `AU MINISTÈRE PUBLIC DU CANTON DE VAUD\nDossier PE24.014624-SBA\n\n${resolveLocalized(selectedReq.title, currentLang)}\nNorme légale : ${selectedReq.norme}\n\nCONCLUSIONS :\n- ${conclusions}\n\nMOTIVATION :\n${resolveLocalized(selectedReq.corps_texte, currentLang)}`;
    navigator.clipboard.writeText(text);
    setCopiedReq(true);
    setTimeout(() => setCopiedReq(false), 2000);
  };

  const handleCopyConclusions = () => {
    const conclusions = resolveLocalizedArray(selectedReq.conclusions_formelles, currentLang).join("\n- ");
    navigator.clipboard.writeText(`- ${conclusions}`);
    setCopiedConclusions(true);
    setTimeout(() => setCopiedConclusions(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#080C14] text-slate-100 overflow-hidden">
      {/* SECTION SELECTOR HEADER */}
      <div className="bg-[#0D1424] border-b border-slate-800/80 px-2 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                setActiveSection("requisitions");
                setMobileDetailOpen(false);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded text-xs transition-colors ${
                activeSection === "requisitions"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {currentLang === 'uk' ? '🏛️ Клопотання & Секвестр' : '🏛️ Réquisitions & Séquestre'}
            </button>
            <button
              onClick={() => {
                setActiveSection("confrontation");
                setMobileDetailOpen(false);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded text-xs transition-colors ${
                activeSection === "confrontation"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {currentLang === 'uk' ? '⚔️ Очні ставки (Auditions)' : '⚔️ Confrontation (Auditions)'}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="text-amber-400 font-bold">
            {currentLang === 'uk' ? 'Арешт: CHF 46\'850.00' : 'Séquestre: CHF 46\'850.00'}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="text-emerald-400 hidden sm:inline">
            {currentLang === 'uk' ? 'Судова юрисдикція Во' : 'Ordre judiciaire vaudois'}
          </span>
        </div>
      </div>

      {activeSection === "requisitions" ? (
        <div className="flex-1 flex overflow-hidden relative">
          {/* LEFT: REQUISITION SELECTION LIST */}
          <div className={`${
            mobileDetailOpen ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 border-r border-slate-800/80 bg-[#0A0F1D] flex-col overflow-y-auto p-2 space-y-1.5 shrink-0`}>
            <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{currentLang === 'uk' ? 'Реєстр клопотань потерпілого' : 'Registre des Réquisitions'}</span>
              <span className="text-slate-500">{LEGAL_REQUISITIONS.length}</span>
            </div>

            {LEGAL_REQUISITIONS.map((req) => (
              <button
                key={req.id}
                onClick={() => {
                  setSelectedReq(req);
                  setMobileDetailOpen(true);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedReq.id === req.id
                    ? "bg-[#0F1A2E] border-blue-600 text-white shadow-md"
                    : "bg-[#070B12] hover:bg-slate-800/50 border-slate-800/60 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    req.urgence === "URGENT"
                      ? "bg-rose-950 text-rose-300 border border-rose-800/60"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {req.urgence === "URGENT"
                      ? (currentLang === 'uk' ? 'НЕВІДКЛАДНО' : 'URGENT')
                      : (currentLang === 'uk' ? 'ЗВИЧАЙНО' : 'ORDINAIRE')}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {req.norme}
                  </span>
                </div>
                <h4 className="text-xs font-semibold leading-snug line-clamp-2">
                  {resolveLocalized(req.title, currentLang)}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate max-w-[200px]">{req.autorite}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 md:hidden" />
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT: FORMAL PETITION PREVIEW & COPY CANVAS */}
          <div className={`${
            mobileDetailOpen ? "flex" : "hidden md:flex"
          } flex-1 bg-[#080C14] flex-col overflow-hidden w-full`}>
            {/* Header with Mobile Back Button */}
            <div className="h-10 bg-[#0B1120] border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 overflow-hidden">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileDetailOpen(false)}
                  className="md:hidden flex items-center space-x-1 px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-xs font-mono mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentLang === 'uk' ? 'Список' : 'Liste'}</span>
                </button>

                <Gavel className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-200 truncate">
                  {selectedReq.norme}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline truncate">
                  · {selectedReq.autorite}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <button
                  onClick={handleCopyConclusions}
                  className="flex items-center space-x-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs transition-colors"
                >
                  {copiedConclusions ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden sm:inline">
                    {copiedConclusions
                      ? (currentLang === 'uk' ? "Скопійовано!" : "Copié !")
                      : (currentLang === 'uk' ? "Висновки" : "Conclusions")}
                  </span>
                </button>

                <button
                  onClick={handleCopyReq}
                  className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium shadow-sm transition-all"
                >
                  {copiedReq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedReq
                      ? (currentLang === 'uk' ? "Скопійовано!" : "Texte copié !")
                      : (currentLang === 'uk' ? "Скопіювати клопотання" : "Copier la requête")}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
              <div className="bg-[#0D1424] border border-slate-800 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-bold text-slate-100 mb-2 leading-snug">
                  {resolveLocalized(selectedReq.title, currentLang)}
                </h3>
                <div className="text-xs font-mono text-slate-400 mb-4 flex flex-wrap items-center gap-2">
                  <span>{currentLang === 'uk' ? 'Адресат :' : 'Autorité saisie :'} {selectedReq.autorite}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-bold">Dossier PE24.014624-SBA</span>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2">
                    {currentLang === 'uk' ? 'Офіційні вимоги та прохальні пункти до прокурора :' : 'Conclusions formelles au Procureur :'}
                  </h4>
                  <ul className="space-y-2">
                    {resolveLocalizedArray(selectedReq.conclusions_formelles, currentLang).map((c, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                        <span className="text-blue-400 font-mono font-bold shrink-0">{i + 1}.</span>
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#0B1120] border border-slate-800 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {currentLang === 'uk' ? 'Фактичне та нормативне обґрунтування :' : 'Motivation & Moyens de fait :'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                  {resolveLocalized(selectedReq.corps_texte, currentLang)}
                </p>
              </div>

              {selectedReq.id === "REQ-SEQUESTRE-263" && (
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg">
                  <h4 className="text-xs font-mono font-bold text-amber-300 mb-1">
                    {currentLang === 'uk'
                      ? 'Деталізація розрахунку суми арешту (CHF 46\'850.00) :'
                      : 'Détail du Séquestre Conservatoire (CHF 46\'850.00) :'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs font-mono">
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        {currentLang === 'uk' ? '1. Повернення коштів :' : 'Restitution capital :'}
                      </span>
                      <strong className="text-slate-200">$15'000 (CHF 13'500)</strong>
                    </div>
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        {currentLang === 'uk' ? '2. Майнові збитки (P-10) :' : 'Dégâts matériels :'}
                      </span>
                      <strong className="text-slate-200">CHF 850.00</strong>
                    </div>
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        {currentLang === 'uk' ? '3. Моральна шкода (ст. 49 ЗК) :' : 'Tort moral & dépens :'}
                      </span>
                      <strong className="text-amber-400">CHF 32'500.00</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* CONFRONTATION MATRIX VIEW */
        <div className="flex-1 flex overflow-hidden relative">
          <div className={`${
            mobileDetailOpen ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 border-r border-slate-800/80 bg-[#0A0F1D] flex-col overflow-y-auto p-2 space-y-1.5 shrink-0`}>
            <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{currentLang === 'uk' ? 'Теми очних ставок' : 'Thèmes d\'audition'}</span>
              <span className="text-slate-500">{CONFRONTATIONS.length}</span>
            </div>

            {CONFRONTATIONS.map((conf) => (
              <button
                key={conf.id}
                onClick={() => {
                  setSelectedConf(conf);
                  setMobileDetailOpen(true);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedConf.id === conf.id
                    ? "bg-[#0F1A2E] border-blue-600 text-white shadow-md"
                    : "bg-[#070B12] hover:bg-slate-800/50 border-slate-800/60 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {conf.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {conf.certified_timestamp}
                  </span>
                </div>
                <h4 className="text-xs font-semibold leading-snug line-clamp-2">
                  {resolveLocalized(conf.theme, currentLang)}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{conf.exhibits.join(", ")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 md:hidden" />
                </div>
              </button>
            ))}
          </div>

          <div className={`${
            mobileDetailOpen ? "flex" : "hidden md:flex"
          } flex-1 bg-[#080C14] overflow-y-auto p-3 sm:p-5 space-y-4 w-full flex-col`}>
            {/* Mobile Back Button */}
            <div className="md:hidden flex items-center mb-1">
              <button
                onClick={() => setMobileDetailOpen(false)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 text-slate-200 rounded text-xs font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentLang === 'uk' ? '← Назад до списку очних ставок' : '← Retour aux confrontations'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adverse False Allegation */}
              <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1 font-bold">
                  {currentLang === 'uk'
                    ? 'Спростоване неправдиве твердження (Любов СУВОРОВА) :'
                    : 'Allégation adverse (Prévenue Liubov Suvorova) :'}
                </span>
                <p className="text-xs text-rose-200 italic leading-relaxed">
                  {resolveLocalized(selectedConf.prevenue_allegation, currentLang)}
                </p>
              </div>

              {/* Corroborated Reality */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1 font-bold">
                  {currentLang === 'uk'
                    ? 'Об\'єктивно доведена та підтверджена реальність :'
                    : 'Réalité objective établie & corroborée :'}
                </span>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  {resolveLocalized(selectedConf.corroborated_reality, currentLang)}
                </p>
              </div>
            </div>

            {/* Inconsistency Point */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                {currentLang === 'uk'
                  ? 'Неусувна судово-медична суперечність :'
                  : 'Contradiction médico-légale irréductible :'}
              </span>
              <p className="text-xs text-slate-200">
                {resolveLocalized(selectedConf.inconsistency_point, currentLang)}
              </p>
            </div>

            {/* Courtroom Questions for Victim's Counsel */}
            <div className="p-4 bg-[#0D1424] border border-slate-800 rounded-lg">
              <h4 className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider mb-2">
                {currentLang === 'uk'
                  ? 'Підготовлені запитання для допиту від імені потерпілого :'
                  : 'Questions d\'audition préparées pour le conseil de la victime :'}
              </h4>
              <ul className="space-y-2">
                {resolveLocalizedArray(selectedConf.investigation_questions, currentLang).map((q, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                    <span className="text-blue-400 font-mono font-bold shrink-0">Q{i + 1}.</span>
                    <span className="leading-relaxed font-sans">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tactical Defense & Objections */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-700/40 rounded-lg text-xs text-indigo-200">
              <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider block mb-1">
                {currentLang === 'uk'
                  ? 'Тактичні рекомендації адвоката для судового засідання :'
                  : 'Conseil tactique d\'audience :'}
              </span>
              <p className="text-[11px] leading-relaxed">
                {resolveLocalized(selectedConf.tactical_defense, currentLang)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
