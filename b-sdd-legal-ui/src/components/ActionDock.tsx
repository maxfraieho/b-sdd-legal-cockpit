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
  Sparkles,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";

interface ActionDockProps {
  currentLang: SupportedLanguage;
  onWormSeal: () => void;
  onSendToKindle: () => void;
  onOpenCaseSync?: () => void;
  isSealing?: boolean;
  isSendingKindle?: boolean;
  sequestrationAmount?: string; // Default: "CHF 46'850.00"
}

export const ActionDock: React.FC<ActionDockProps> = ({
  currentLang,
  onWormSeal,
  onSendToKindle,
  onOpenCaseSync,
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
          title={
            currentLang === 'uk' ? "Натисніть для перегляду розрахунку суми арешту" :
            currentLang === 'fr' ? "Cliquer pour afficher le détail du calcul du séquestre" :
            currentLang === 'de' ? "Klicken für Aufschlüsselung der Beschlagnahme" :
            currentLang === 'it' ? "Clicca per visualizzare il dettaglio del sequestro" :
            "Click to view sequestration breakdown"
          }
        >
          <div className="p-1 bg-amber-500/10 border border-amber-500/40 rounded text-amber-400">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-300">
            {
              currentLang === 'uk' ? 'Арешт активів (ст. 263 КПК) :' :
              currentLang === 'fr' ? 'Séquestre conservatoire (Art. 263 CPP) :' :
              currentLang === 'de' ? 'Beschlagnahme (Art. 263 StPO) :' :
              currentLang === 'it' ? 'Sequestro penale (Art. 263 CPP) :' :
              'Asset Freezing (Art. 263 CPC) :'
            }
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
                {
                  currentLang === 'uk' ? 'Розрахунок арешту (ст. 263 КПК Во)' :
                  currentLang === 'fr' ? 'Calcul du séquestre (Art. 263 CPP)' :
                  currentLang === 'de' ? 'Berechnung Beschlagnahme (Art. 263 StPO)' :
                  currentLang === 'it' ? 'Calcolo del sequestro penale (Art. 263 CPP)' :
                  'Sequestration Calculation (Art. 263 CPC)'
                }
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
                <span>
                  {
                    currentLang === 'uk' ? "1. Привласнений капітал ($15'000 USD / ст. 146, 138 КК):" :
                    currentLang === 'fr' ? "1. Capital détourné ($15'000 USD / Art. 146, 138 CP) :" :
                    currentLang === 'de' ? "1. Veruntreutes Kapital ($15'000 USD / Art. 146, 138 StGB) :" :
                    currentLang === 'it' ? "1. Capitale sottratto ($15'000 USD / Art. 146, 138 CP) :" :
                    "1. Misappropriated capital ($15,000 USD / Art. 146, 138 SCC):"
                  }
                </span>
                <strong className="text-white">CHF 13'500.00</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>
                  {
                    currentLang === 'uk' ? "2. Зламаний замок (доказ P-10 / ст. 144, 186 КК):" :
                    currentLang === 'fr' ? "2. Serrure fracturée (Cote P-10 / Art. 144, 186 CP) :" :
                    currentLang === 'de' ? "2. Beschädigtes Schloss (Beweis P-10 / Art. 144, 186 StGB) :" :
                    currentLang === 'it' ? "2. Serratura forzata (Reperto P-10 / Art. 144, 186 CP) :" :
                    "2. Damaged lock (Exhibit P-10 / Art. 144, 186 SCC):"
                  }
                </span>
                <strong className="text-white">CHF 850.00</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>
                  {
                    currentLang === 'uk' ? "3. Моральна шкода (ст. 49 CO) & витрати:" :
                    currentLang === 'fr' ? "3. Tort moral (Art. 49 CO) & dépens :" :
                    currentLang === 'de' ? "3. Genugtuung (Art. 49 OR) & Kosten :" :
                    currentLang === 'it' ? "3. Torto morale (Art. 49 CO) & spese :" :
                    "3. Moral tort (Art. 49 CO) & legal costs:"
                  }
                </span>
                <strong className="text-white">CHF 32'500.00</strong>
              </div>
              <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-amber-400 text-xs">
                <span>
                  {
                    currentLang === 'uk' ? "Разом сума арешту :" :
                    currentLang === 'fr' ? "Total créance garantie :" :
                    currentLang === 'de' ? "Gesamtbetrag Beschlagnahme :" :
                    currentLang === 'it' ? "Totale credito garantito :" :
                    "Total Sequestration Claim:"
                  }
                </span>
                <span>CHF 46'850.00</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Instant Action Triggers */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* Sequential AI Case State Synchronization */}
        {onOpenCaseSync && (
          <button
            onClick={onOpenCaseSync}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm min-h-[32px] bg-gradient-to-r from-violet-900/90 to-purple-800/90 hover:from-violet-800 hover:to-purple-700 text-purple-200 hover:text-white border border-purple-500/50"
            title={
              currentLang === 'uk' ? "ШІ-Синхронізація справи: послідовний аналіз змін та юридичного статусу" :
              currentLang === 'fr' ? "Synchronisation IA séquentielle : mise à jour du statut juridique" :
              "Sequential AI Case Sync: update legal standing and facts"
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs">
              {currentLang === 'uk' ? '⚡ ШІ-Синхронізація' : currentLang === 'fr' ? '⚡ Sync IA' : '⚡ AI Sync'}
            </span>
          </button>
        )}

        {/* WORM Seal & Commit in Utopia DB */}
        <button
          onClick={onWormSeal}
          disabled={isSealing}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all min-h-[32px] ${
            isSealing
              ? "bg-emerald-950 border-emerald-700 text-emerald-200 animate-pulse cursor-wait"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-emerald-400 hover:text-emerald-300"
          }`}
          title={
            currentLang === 'uk' ? "Зафіксувати суперсесію в базі Utopia DB" :
            currentLang === 'fr' ? "Générer un enregistrement de supersession cryptographique dans Utopia DB" :
            currentLang === 'de' ? "Kryptographische Supersession in Utopia DB erfassen" :
            currentLang === 'it' ? "Generare registrazione di supersessione in Utopia DB" :
            "Record cryptographic supersession in Utopia DB"
          }
        >
          {isSealing ? (
            <Activity className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span className="font-mono text-[11px] sm:text-xs">
            {isSealing
              ? (currentLang === 'uk' ? 'Фіксація...' : currentLang === 'fr' ? 'Scellement...' : currentLang === 'de' ? 'Versiegelung...' : currentLang === 'it' ? 'Sigillatura...' : 'Sealing...')
              : '💾 WORM Seal'}
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
          title={
            currentLang === 'uk' ? "Зібрати 18 розділів в EPUB та надіслати на Kindle" :
            currentLang === 'fr' ? "Compiler les 18 chapitres et envoyer sans fil à tukroschu@kindle.com" :
            currentLang === 'de' ? "18 Kapitel in EPUB kompilieren und an tukroschu@kindle.com senden" :
            currentLang === 'it' ? "Compilare 18 capitoli in EPUB e inviare a tukroschu@kindle.com" :
            "Compile 18 chapters to EPUB and dispatch to tukroschu@kindle.com"
          }
        >
          {isSendingKindle ? (
            <Activity className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span className="font-mono text-[11px] sm:text-xs">
            {isSendingKindle
              ? (currentLang === 'uk' ? 'Відправка...' : currentLang === 'fr' ? 'Envoi...' : currentLang === 'de' ? 'Senden...' : currentLang === 'it' ? 'Invio...' : 'Sending...')
              : (currentLang === 'uk' ? '📖 На Kindle' : currentLang === 'fr' ? '📖 Vers Kindle' : currentLang === 'de' ? '📖 An Kindle' : currentLang === 'it' ? '📖 A Kindle' : '📖 To Kindle')}
          </span>
        </button>
      </div>
    </footer>
  );
};
