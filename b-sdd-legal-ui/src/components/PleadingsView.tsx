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
      <div className="bg-[#0D1424] border-b border-slate-800/80 px-3 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#070B12] p-0.5 rounded border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveSection("requisitions")}
              className={`px-3 py-1 rounded transition-colors ${
                activeSection === "requisitions"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {currentLang === 'uk' ? '🏛️ Клопотання & Секвестр (Art. 263 / 318 CPP)' : '🏛️ Réquisitions & Séquestre (Art. 263 / 318 CPP)'}
            </button>
            <button
              onClick={() => setActiveSection("confrontation")}
              className={`px-3 py-1 rounded transition-colors ${
                activeSection === "confrontation"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {currentLang === 'uk' ? '⚔️ Матриця очних ставок (Auditions)' : '⚔️ Matrice de Confrontation (Auditions)'}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="text-amber-400 font-bold">Séquestre: CHF 46'850.00</span>
          <span>·</span>
          <span className="text-emerald-400">Ordre judiciaire vaudois</span>
        </div>
      </div>

      {activeSection === "requisitions" ? (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: REQUISITION SELECTION LIST */}
          <div className="w-80 border-r border-slate-800/80 bg-[#0A0F1D] flex flex-col overflow-y-auto p-2 space-y-1.5">
            {LEGAL_REQUISITIONS.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedReq(req)}
                className={`w-full text-left p-3 rounded border transition-all ${
                  selectedReq.id === req.id
                    ? "bg-[#0F1A2E] border-blue-600 text-white shadow-sm"
                    : "bg-[#070B12] hover:bg-slate-800/40 border-slate-800/60 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    req.urgence === "URGENT"
                      ? "bg-rose-950 text-rose-300 border border-rose-800/60"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {req.urgence}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {req.norme}
                  </span>
                </div>
                <h4 className="text-xs font-semibold leading-snug line-clamp-2">
                  {resolveLocalized(req.title, currentLang)}
                </h4>
              </button>
            ))}
          </div>

          {/* RIGHT: FORMAL PETITION PREVIEW & COPY CANVAS */}
          <div className="flex-1 bg-[#080C14] flex flex-col overflow-hidden">
            <div className="h-10 bg-[#0B1120] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Gavel className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {selectedReq.norme}
                </span>
                <span className="text-xs text-slate-400">· {selectedReq.autorite}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyConclusions}
                  className="flex items-center space-x-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs transition-colors"
                >
                  {copiedConclusions ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedConclusions ? "Conclusions copiées !" : "Conclusions"}</span>
                </button>

                <button
                  onClick={handleCopyReq}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium shadow-sm transition-all"
                >
                  {copiedReq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReq ? "Texte copié !" : "Copier la requête"}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-[#0D1424] border border-slate-800 rounded p-4">
                <h3 className="text-sm font-bold text-slate-100 mb-2">
                  {resolveLocalized(selectedReq.title, currentLang)}
                </h3>
                <div className="text-xs font-mono text-slate-400 mb-4 flex items-center gap-2">
                  <span>Autorité saisie : {selectedReq.autorite}</span>
                  <span>·</span>
                  <span className="text-amber-400">Dossier PE24.014624-SBA</span>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2">
                    {currentLang === 'uk' ? 'Офіційні висновки та прохальні пункти :' : 'Conclusions formelles au Procureur :'}
                  </h4>
                  <ul className="space-y-1.5">
                    {resolveLocalizedArray(selectedReq.conclusions_formelles, currentLang).map((c, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                        <span className="text-blue-400 font-mono font-bold shrink-0">{i + 1}.</span>
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#0B1120] border border-slate-800 rounded p-4">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {currentLang === 'uk' ? 'Мотивація та фактичне обґрунтування :' : 'Motivation & Moyens de fait :'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {resolveLocalized(selectedReq.corps_texte, currentLang)}
                </p>
              </div>

              {selectedReq.id === "REQ-SEQUESTRE-263" && (
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded">
                  <h4 className="text-xs font-mono font-bold text-amber-300 mb-1">
                    Détail du Séquestre Conservatoire (CHF 46'850.00) :
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs font-mono">
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Restitution capital :</span>
                      <strong className="text-slate-200">$15'000 (CHF 13'500)</strong>
                    </div>
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Dégâts matériels :</span>
                      <strong className="text-slate-200">CHF 850.00</strong>
                    </div>
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Tort moral & dépens :</span>
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
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-slate-800/80 bg-[#0A0F1D] flex flex-col overflow-y-auto p-2 space-y-1.5">
            {CONFRONTATIONS.map((conf) => (
              <button
                key={conf.id}
                onClick={() => setSelectedConf(conf)}
                className={`w-full text-left p-3 rounded border transition-all ${
                  selectedConf.id === conf.id
                    ? "bg-[#0F1A2E] border-blue-600 text-white shadow-sm"
                    : "bg-[#070B12] hover:bg-slate-800/40 border-slate-800/60 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {conf.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {conf.certified_timestamp}
                  </span>
                </div>
                <h4 className="text-xs font-semibold leading-snug line-clamp-2">
                  {resolveLocalized(conf.theme, currentLang)}
                </h4>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-[#080C14] overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adverse False Allegation */}
              <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                  Allégation adverse (Prévenue Liubov Suvorova) :
                </span>
                <p className="text-xs text-rose-200 italic leading-relaxed">
                  {resolveLocalized(selectedConf.prevenue_allegation, currentLang)}
                </p>
              </div>

              {/* Corroborated Reality */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                  Réalité objective établie & corroborée :
                </span>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  {resolveLocalized(selectedConf.corroborated_reality, currentLang)}
                </p>
              </div>
            </div>

            {/* Inconsistency Point */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                Contradiction médico-légale irréductible :
              </span>
              <p className="text-xs text-slate-200">
                {resolveLocalized(selectedConf.inconsistency_point, currentLang)}
              </p>
            </div>

            {/* Courtroom Questions for Victim's Counsel */}
            <div className="p-4 bg-[#0D1424] border border-slate-800 rounded">
              <h4 className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider mb-2">
                Questions d'audition préparées pour le conseil de la victime :
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
            <div className="p-3 bg-indigo-950/30 border border-indigo-700/40 rounded text-xs text-indigo-200">
              <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider block mb-1">
                Conseil tactique d'audience :
              </span>
              <p className="leading-relaxed">
                {resolveLocalized(selectedConf.tactical_defense, currentLang)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
