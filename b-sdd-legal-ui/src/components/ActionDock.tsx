import React, { useState } from "react";
import {
  Save,
  BookOpen,
  Send,
  ShieldCheck,
  CheckCircle,
  DollarSign,
  Activity,
  Info,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";

interface ActionDockProps {
  currentLang: SupportedLanguage;
  onWormSeal: () => void;
  onSendToKindle: () => void;
  isSealing?: boolean;
  isSendingKindle?: boolean;
  sequestrationAmount?: string; // Default: "CHF 46'850.00"
}

export const ActionDock: React.FC<ActionDockProps> = ({
  currentLang,
  onWormSeal,
  onSendToKindle,
  isSealing = false,
  isSendingKindle = false,
  sequestrationAmount = "CHF 46'850.00",
}) => {
  const [showSequestrationBreakdown, setShowSequestrationBreakdown] = useState(false);

  return (
    <footer className="min-h-[42px] bg-[#0A0E1A] border-t border-slate-800/80 px-2 sm:px-4 py-1 flex flex-wrap items-center justify-between gap-2 z-30">
      {/* LEFT: Financial Sequestration Counter */}
      <div className="relative flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        <div
          onClick={() => setShowSequestrationBreakdown(!showSequestrationBreakdown)}
          className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
          title={currentLang === 'uk' ? "Натисніть для перегляду розрахунку суми арешту" : "Cliquez pour afficher le détail du calcul du séquestre"}
        >
          <div className="p-1 bg-amber-500/10 border border-amber-500/40 rounded text-amber-400">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-300">
            {currentLang === 'uk' ? 'Арешт активів (ст. 263 КПК) :' : 'Séquestre Art. 263 CPP :'}
          </span>
          <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
            {sequestrationAmount}
          </span>
          <Info className="w-3 h-3 text-slate-500 hidden sm:inline" />
        </div>

        {/* Sequestration breakdown popup */}
        {showSequestrationBreakdown && (
          <div className="absolute left-0 bottom-11 w-72 sm:w-80 bg-[#0B1120] border border-amber-500/40 rounded-xl p-3 shadow-2xl text-xs font-mono z-50 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-bold text-amber-300">
                {currentLang === 'uk' ? 'Розрахунок арешту (ст. 263 КПК Во)' : 'Calcul Séquestre Art. 263 CPP'}
              </span>
              <button
                onClick={() => setShowSequestrationBreakdown(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>{currentLang === 'uk' ? "1. Повернення капіталу ($15'000 USD):" : "1. Restitution capital ($15'000 USD):"}</span>
                <strong className="text-white">CHF 13'500.00</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{currentLang === 'uk' ? "2. Зламаний замок (доказ P-10):" : "2. Dégât serrure fracturée (P-10):"}</span>
                <strong className="text-white">CHF 850.00</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{currentLang === 'uk' ? "3. Моральна шкода (ст. 49 CO) & витрати:" : "3. Tort moral (Art. 49 CO) & dépens:"}</span>
                <strong className="text-white">CHF 32'500.00</strong>
              </div>
              <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-amber-400 text-xs">
                <span>{currentLang === 'uk' ? "Разом сума арешту :" : "Total créance garantie :"}</span>
                <span>CHF 46'850.00</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Instant Action Triggers */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* WORM Seal & Commit in Utopia DB */}
        <button
          onClick={onWormSeal}
          disabled={isSealing}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all min-h-[32px] ${
            isSealing
              ? "bg-emerald-950 border-emerald-700 text-emerald-200 animate-pulse cursor-wait"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-emerald-400 hover:text-emerald-300"
          }`}
          title={currentLang === 'uk' ? "Зафіксувати суперсесію в базі Utopia DB" : "Générer un enregistrement de supersession cryptographique dans Utopia DB"}
        >
          {isSealing ? (
            <Activity className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span className="font-mono text-[11px] sm:text-xs">
            {isSealing
              ? (currentLang === 'uk' ? 'Фіксація...' : 'Scellement...')
              : (currentLang === 'uk' ? '💾 WORM Seal' : '💾 WORM Seal')}
          </span>
        </button>

        {/* Send EPUB to Kindle */}
        <button
          onClick={onSendToKindle}
          disabled={isSendingKindle}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm min-h-[32px] ${
            isSendingKindle
              ? "bg-blue-900 text-blue-200 border border-blue-700 animate-pulse cursor-wait"
              : "bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40"
          }`}
          title={currentLang === 'uk' ? "Зібрати 18 розділів в EPUB та надіслати на Kindle" : "Compiler les 18 chapitres et envoyer sans fil à tukroschu@kindle.com"}
        >
          {isSendingKindle ? (
            <Activity className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span className="font-mono text-[11px] sm:text-xs">
            {isSendingKindle
              ? (currentLang === 'uk' ? 'Відправка...' : 'Envoi...')
              : (currentLang === 'uk' ? '📖 На Kindle' : '📖 Kindle')}
          </span>
        </button>
      </div>
    </footer>
  );
};
