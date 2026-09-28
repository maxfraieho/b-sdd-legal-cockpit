// =========================================================================
// B-SDD LEGAL COCKPIT · МОДАЛЬНЕ ВІКНО ЮРИДИЧНОЇ СТРАТЕГІЇ ТА ШАБЛОНІВ
// Доктрина, норми LLCA/CO/CPP, договір про залік (ст. 120 CO) та заява LAVI
// Повна підтримка 5 мов інтерфейсу: UK, FR, DE, IT, EN
// =========================================================================

import React, { useState } from 'react';
import {
  X,
  FileText,
  Scale,
  Copy,
  Check,
  Download,
  Building2,
  ShieldAlert,
  Send,
  BookOpen,
  Briefcase,
  AlertTriangle,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage } from '../types/i18n';
import {
  LEGAL_STRATEGY_MEMORANDUM,
  LEGAL_TEMPLATES,
  LegalDocumentTemplate,
} from '../data/legalStrategyData';

interface LegalStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onSendToKindle?: (title: string, text: string) => void;
  initialTab?: 'doctrine' | 'pitch' | 'lavi' | 'contract' | 'matrix';
}

const MODAL_I18N = {
  uk: {
    title: "Правовий Меморандум та Шаблони Партнерства",
    subtitle: "Швейцарське кримінальне та договірне право (LLCA · CO · LAVI · CPP)",
    tab_doctrine: "📖 Правовий Аналіз (LLCA / CO)",
    tab_pitch: "Док 1: Лист-пропозиція (Pitch)",
    tab_lavi: "Док 2: Заява LAVI Vaud",
    tab_contract: "Док 3: Рамковий договір (ст. 120 CO)",
    tab_matrix: "Оцінка Стратегій",
    key_conclusion_title: "Ключовий висновок швейцарської правової експертизи:",
    key_conclusion_text: "Пряма угода «натурального обміну» IT-послуг на юридичний захист несе ризик визнання недійсною через ст. 12 lit. e LLCA (pactum de quota litis). Єдина легітимна модель: поділ на 2 окремі договори (IT-підряд за ст. 363 CO та адвокатський мандат за ст. 394 CO) із наступним зарахуванням зустрічних однорідних грошових вимог (ст. 120 CO). Паралельно повнолітній син (26 років) має безумовне автономне право на фінансування через Centre LAVI Lausanne (ATF 150 II 465) та ст. 136 CPP.",
    btn_copy: "Копіювати текст",
    btn_copied: "Скопійовано!",
    btn_download_md: "Завантажити MD",
    btn_kindle: "Надіслати на Kindle",
    btn_close: "Закрити",
    footer_text: "B-SDD Legal Framework · Protection des Victimes (CPP / LAVI / LLCA)",
    matrix_title: "Порівняльна матриця стратегічних маршрутів (Кантон Во)",
    matrix_subtitle: "Оцінка ймовірності успіху, нормативні підстави та заходи мінімізації ризиків за швейцарським правом.",
    col_route: "Стратегічний маршрут",
    col_law: "Норми права",
    col_prob: "Ймовірність",
    col_risks: "Ключові ризики",
    col_mitigation: "Заходи мінімізації",
  },
  fr: {
    title: "Note Juridique & Modèles Contractuels",
    subtitle: "Droit pénal et contractuel suisse (LLCA · CO · LAVI · CPP)",
    tab_doctrine: "📖 Analyse Juridique (LLCA / CO)",
    tab_pitch: "Doc 1 : Offre de Partenariat",
    tab_lavi: "Doc 2 : Requête LAVI Vaud",
    tab_contract: "Doc 3 : Contrat-Cadre (art. 120 CO)",
    tab_matrix: "Matrice Stratégique",
    key_conclusion_title: "Conclusion essentielle de l'expertise juridique suisse :",
    key_conclusion_text: "Un accord direct de troc « prestations IT contre défense pénale » risque l'annulation sous l'art. 12 let. e LLCA (pactum de quota litis). La seule structure licite reconnue par l'OAV repose sur la scission en 2 conventions distinctes (entreprise art. 363 CO et mandat art. 394 CO) avec extinction périodique par compensation conventionnelle (art. 120 CO). Parallèlement, le fils majeur (26 ans) dispose d'un droit autonome au soutien du Centre LAVI Lausanne (ATF 150 II 465) et à l'assistance judiciaire (art. 136 CPP).",
    btn_copy: "Copier le texte",
    btn_copied: "Copié !",
    btn_download_md: "Télécharger MD",
    btn_kindle: "Envoyer à Kindle",
    btn_close: "Fermer",
    footer_text: "Cadre légal B-SDD · Protection des Victimes (CPP / LAVI / LLCA)",
    matrix_title: "Matrice comparative des trajectoires stratégiques (Canton de Vaud)",
    matrix_subtitle: "Évaluation de la faisabilité, fondements normatifs et mesures de mitigation en droit suisse.",
    col_route: "Trajectoire stratégique",
    col_law: "Bases légales",
    col_prob: "Probabilité",
    col_risks: "Risques majeurs",
    col_mitigation: "Mitigation",
  },
  de: {
    title: "Rechtliches Memorandum & Vertragsvorlagen",
    subtitle: "Schweizer Straf- und Vertragsrecht (BGFA · OR · OHG · StPO)",
    tab_doctrine: "📖 Rechtliche Analyse (BGFA / OR)",
    tab_pitch: "Dok 1: Kanzlei-Anschreiben",
    tab_lavi: "Dok 2: OHG-Gesuch Waadt",
    tab_contract: "Dok 3: Rahmenvertrag (Art. 120 OR)",
    tab_matrix: "Strategie-Matrix",
    key_conclusion_title: "Wichtigstes Fazit des Schweizer Rechtsgutachtens:",
    key_conclusion_text: "Ein direkter Tausch 'IT-Leistungen gegen Strafverteidigung' verstößt gegen Art. 12 lit. e BGFA (Verbot des pactum de quota litis). Die einzig zulässige Struktur besteht in der Aufteilung in zwei getrennte Verträge (Werkvertrag Art. 363 OR und Anwaltsmandat Art. 394 OR) mit Verrechnung fälliger Forderungen nach Art. 120 OR. Gleichzeitig hat der 26-jährige Sohn einen eigenständigen Anspruch auf Opferhilfe (OHG / BGE 150 II 465) sowie unentgeltlichen Rechtsbeistand nach Art. 136 StPO.",
    btn_copy: "Text kopieren",
    btn_copied: "Kopiert!",
    btn_download_md: "MD herunterladen",
    btn_kindle: "An Kindle senden",
    btn_close: "Schließen",
    footer_text: "B-SDD Legal Framework · Opferschutz (StPO / OHG / BGFA)",
    matrix_title: "Vergleichende Strategiematrix (Kanton Waadt)",
    matrix_subtitle: "Erfolgswahrscheinlichkeit, gesetzliche Grundlagen und Risikominderungsmaßnahmen nach Schweizer Recht.",
    col_route: "Strategische Option",
    col_law: "Rechtsnormen",
    col_prob: "Wahrscheinlichkeit",
    col_risks: "Hauptrisiken",
    col_mitigation: "Risikominderung",
  },
  it: {
    title: "Nota Giuridica & Modelli Contrattuali",
    subtitle: "Diritto penale e contrattuale svizzero (LLCA · CO · LAVI · CPP)",
    tab_doctrine: "📖 Analisi Giuridica (LLCA / CO)",
    tab_pitch: "Doc 1: Offerta di Partenariato",
    tab_lavi: "Doc 2: Istanza LAVI Vaud",
    tab_contract: "Doc 3: Accordo Quadro (art. 120 CO)",
    tab_matrix: "Matrice Strategica",
    key_conclusion_title: "Conclusione essenziale della perizia giuridica svizzera:",
    key_conclusion_text: "Un accordo diretto di baratto 'servizi IT contro difesa penale' è vietato dall'art. 12 lett. e LLCA (pactum de quota litis). L'unico assetto legittimo prevede due contratti autonomi (appalto art. 363 CO e mandato art. 394 CO) con estinzione per compensazione di crediti (art. 120 CO). Inoltre, il figlio maggiorenne ha pieno diritto all'assistenza LAVI (BGE 150 II 465) e al gratuito patrocinio (art. 136 CPP).",
    btn_copy: "Copia testo",
    btn_copied: "Copiato!",
    btn_download_md: "Scarica MD",
    btn_kindle: "Invia a Kindle",
    btn_close: "Chiudi",
    footer_text: "Quadro giuridico B-SDD · Protezione delle Vittime (CPP / LAVI / LLCA)",
    matrix_title: "Matrice strategica comparativa (Cantone Vaud)",
    matrix_subtitle: "Valutazione di fattibilità, basi normative e misure di mitigazione nel diritto elvetico.",
    col_route: "Percorso strategico",
    col_law: "Basi giuridiche",
    col_prob: "Probabilità",
    col_risks: "Rischi principali",
    col_mitigation: "Mitigazione",
  },
  en: {
    title: "Legal Memorandum & Partnership Contracts",
    subtitle: "Swiss Criminal and Contract Law (LLCA · CO · LAVI · CPC)",
    tab_doctrine: "📖 Legal Doctrine (LLCA / CO)",
    tab_pitch: "Doc 1: Law Firm Pitch Letter",
    tab_lavi: "Doc 2: LAVI Victim Application",
    tab_contract: "Doc 3: Framework Agreement (Art. 120 CO)",
    tab_matrix: "Strategic Decision Matrix",
    key_conclusion_title: "Key Finding of the Swiss Legal Evaluation:",
    key_conclusion_text: "A direct 'barter' of IT services in exchange for legal defense violates Art. 12 lit. e LLCA (prohibition of pactum de quota litis). The only lawful structure consists of two separate contracts (IT services under Art. 363 CO and attorney mandate under Art. 394 CO) with periodic debt settlement through mutual set-off under Art. 120 CO. Simultaneously, the 26-year-old adult son qualifies for autonomous victim support through Centre LAVI Lausanne (ATF 150 II 465) and legal aid under Art. 136 CPC.",
    btn_copy: "Copy Text",
    btn_copied: "Copied!",
    btn_download_md: "Download MD",
    btn_kindle: "Send to Kindle",
    btn_close: "Close",
    footer_text: "B-SDD Legal Framework · Victim Protection (CPC / LAVI / LLCA)",
    matrix_title: "Comparative Strategic Trajectory Matrix (Canton of Vaud)",
    matrix_subtitle: "Success probability, normative basis, and risk mitigation under Swiss procedural law.",
    col_route: "Strategic Trajectory",
    col_law: "Legal Provisions",
    col_prob: "Probability",
    col_risks: "Key Risks",
    col_mitigation: "Mitigation Measures",
  },
};

export const LegalStrategyModal: React.FC<LegalStrategyModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSendToKindle,
  initialTab = 'doctrine',
}) => {
  const [activeTab, setActiveTab] = useState<'doctrine' | 'pitch' | 'lavi' | 'contract' | 'matrix'>(initialTab);
  const [docLang, setDocLang] = useState<'fr' | 'uk'>('fr');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sentKindle, setSentKindle] = useState(false);

  if (!isOpen) return null;

  const t = MODAL_I18N[currentLang] || MODAL_I18N['fr'];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pitchDoc = LEGAL_TEMPLATES.find((t) => t.id === 'pitch_law_firm')!;
  const laviDoc = LEGAL_TEMPLATES.find((t) => t.id === 'lavi_application')!;
  const contractDoc = LEGAL_TEMPLATES.find((t) => t.id === 'framework_contract')!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans select-text">
      <div className="bg-[#0B1120] border border-blue-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#080E1B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {t.title}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                  LLCA · CO · LAVI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {LEGAL_STRATEGY_MEMORANDUM.caseReference} · {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle for templates */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setDocLang('fr')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  docLang === 'fr' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇨🇭 Français
              </button>
              <button
                onClick={() => setDocLang('uk')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  docLang === 'uk' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇦 Українська
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#070B14] px-4 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('doctrine')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'doctrine'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{t.tab_doctrine}</span>
          </button>

          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pitch'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>{t.tab_pitch}</span>
          </button>

          <button
            onClick={() => setActiveTab('lavi')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'lavi'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>{t.tab_lavi}</span>
          </button>

          <button
            onClick={() => setActiveTab('contract')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'contract'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>{t.tab_contract}</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>{t.tab_matrix}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: DOCTRINE & LLCA / CO / LAVI ANALYSIS */}
          {activeTab === 'doctrine' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-300 font-bold block mb-1">
                    {t.key_conclusion_title}
                  </strong>
                  {t.key_conclusion_text}
                </div>
              </div>

              {LEGAL_STRATEGY_MEMORANDUM.sections.map((sec) => (
                <div key={sec.id} className="bg-[#070B14] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                  <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>{docLang === 'fr' ? sec.titleFr : sec.titleUk}</span>
                  </h3>
                  <div className="text-xs text-slate-300 whitespace-pre-line font-sans leading-relaxed">
                    {docLang === 'fr' ? sec.contentFr : sec.contentUk}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PITCH FOR LAW FIRM */}
          {activeTab === 'pitch' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#070B14] border border-slate-800 rounded-xl">
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    {docLang === 'fr' ? pitchDoc.titleFr : pitchDoc.titleUk}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {docLang === 'fr' ? pitchDoc.descriptionFr : pitchDoc.descriptionUk}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopy(docLang === 'fr' ? pitchDoc.contentFr : pitchDoc.contentUk, 'pitch_doc')
                    }
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'pitch_doc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pitch_doc' ? t.btn_copied : t.btn_copy}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        `pitch_avocat_vaud_${docLang}.md`,
                        docLang === 'fr' ? pitchDoc.contentFr : pitchDoc.contentUk
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    title={t.btn_download_md}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#050810] border border-slate-800 rounded-xl p-4 sm:p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                {docLang === 'fr' ? pitchDoc.contentFr : pitchDoc.contentUk}
              </div>
            </div>
          )}

          {/* TAB 3: LAVI APPLICATION */}
          {activeTab === 'lavi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#070B14] border border-slate-800 rounded-xl">
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    {docLang === 'fr' ? laviDoc.titleFr : laviDoc.titleUk}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Centre LAVI Lausanne (PROFA) · Rue du Grand-Pont 2bis, 1003 Lausanne · Tél: +41 21 631 03 00
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopy(docLang === 'fr' ? laviDoc.contentFr : laviDoc.contentUk, 'lavi_doc')
                    }
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'lavi_doc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'lavi_doc' ? t.btn_copied : t.btn_copy}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        `demande_centre_lavi_vaud_${docLang}.md`,
                        docLang === 'fr' ? laviDoc.contentFr : laviDoc.contentUk
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    title={t.btn_download_md}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#050810] border border-slate-800 rounded-xl p-4 sm:p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                {docLang === 'fr' ? laviDoc.contentFr : laviDoc.contentUk}
              </div>
            </div>
          )}

          {/* TAB 4: FRAMEWORK BARTER CONTRACT (ART. 120 CO) */}
          {activeTab === 'contract' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#070B14] border border-slate-800 rounded-xl">
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    {docLang === 'fr' ? contractDoc.titleFr : contractDoc.titleUk}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {docLang === 'fr' ? contractDoc.descriptionFr : contractDoc.descriptionUk}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopy(docLang === 'fr' ? contractDoc.contentFr : contractDoc.contentUk, 'contract_doc')
                    }
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'contract_doc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'contract_doc' ? t.btn_copied : t.btn_copy}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        `contrat_cadre_compensation_art120_co_${docLang}.md`,
                        docLang === 'fr' ? contractDoc.contentFr : contractDoc.contentUk
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    title={t.btn_download_md}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#050810] border border-slate-800 rounded-xl p-4 sm:p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                {docLang === 'fr' ? contractDoc.contentFr : contractDoc.contentUk}
              </div>
            </div>
          )}

          {/* TAB 5: COMPARATIVE MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#070B14] border border-slate-800 rounded-xl">
                <h3 className="font-bold text-white text-sm mb-1">
                  {t.matrix_title}
                </h3>
                <p className="text-xs text-slate-400">
                  {t.matrix_subtitle}
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-300 font-mono text-[11px] border-b border-slate-800">
                      <th className="p-3">{t.col_route}</th>
                      <th className="p-3">{t.col_law}</th>
                      <th className="p-3">{t.col_prob}</th>
                      <th className="p-3">{t.col_risks}</th>
                      <th className="p-3">{t.col_mitigation}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#070B14]">
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">
                        {currentLang === 'fr'
                          ? "Partenariat d'ingénierie IT avec compensation"
                          : currentLang === 'de'
                          ? "IT-Partnerschaft mit Verrechnung (Art. 120 OR)"
                          : currentLang === 'it'
                          ? "Partenariato IT con compensazione debiti"
                          : currentLang === 'en'
                          ? "Commercial IT Engineering Barter via Set-Off"
                          : "Комерційне IT-партнерство з компенсацією"}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-blue-400">Art. 120, 363, 394 CO; Art. 12 let. e LLCA</td>
                      <td className="p-3 font-bold text-amber-400">45–55%</td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Prudence déontologique de l'Étude sur la licéité de quota litis"
                          : currentLang === 'en'
                          ? "Law firm compliance caution regarding pactum de quota litis"
                          : "Консерватизм бюро; комплаєнс щодо quota litis"}
                      </td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Démonstration B-SDD (20 min) ; contrats distincts chiffrés en CHF"
                          : currentLang === 'en'
                          ? "20-minute B-SDD demo; 2 distinct contracts with fixed CHF fees"
                          : "Демонстрація B-SDD; роздільні договори з фіксованими сумами в CHF"}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 bg-emerald-950/10">
                      <td className="p-3 font-semibold text-emerald-300">
                        {currentLang === 'fr'
                          ? "Soutien et prise en charge Centre LAVI Vaud"
                          : currentLang === 'de'
                          ? "Finanzierung über Opferhilfe (Centre LAVI Waadt)"
                          : currentLang === 'it'
                          ? "Finanziamento tramite Centro LAVI Vaud"
                          : currentLang === 'en'
                          ? "State Funding via Centre LAVI Vaud (Lausanne)"
                          : "Фінансування через Centre LAVI Vaud"}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-emerald-400">Art. 1, 13, 16 LAVI ; ATF 150 II 465</td>
                      <td className="p-3 font-bold text-emerald-400">75–85%</td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Débat sur le seuil d'atteinte psychique directe"
                          : currentLang === 'en'
                          ? "Scrutiny on the severity of psychological trauma"
                          : "Ризик оцінки погроз як недостатньо травматичних"}
                      </td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Certificats médicaux attestant l'angoisse et le stress post-traumatique"
                          : currentLang === 'en'
                          ? "Medical certificates of acute anxiety and PTSD from threats"
                          : "Медичні довідки Unisanté про гострий стресовий розлад та паніку"}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">
                        {currentLang === 'fr'
                          ? "Conseil juridique gratuit (art. 136 CPP)"
                          : currentLang === 'de'
                          ? "Unentgeltlicher Rechtsbeistand (Art. 136 StPO)"
                          : currentLang === 'it'
                          ? "Gratuito patrocinio (art. 136 CPP)"
                          : currentLang === 'en'
                          ? "Public Legal Representation (Art. 136 Swiss CPC)"
                          : "Безоплатний представник за ст. 136 CPP"}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-blue-400">Art. 136 CPP ; RAJ/VD ; ATF 144 IV 285</td>
                      <td className="p-3 font-bold text-blue-400">60–70%</td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Refus du Ministère public si la cause est qualifiée de simple"
                          : currentLang === 'en'
                          ? "Prosecutor denial if case deemed legally straightforward"
                          : "Відмова прокурора через кваліфікацію справи як простої"}
                      </td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Conclusions civiles détaillées (art. 49 CO / CHF 47'700) jointes à la plainte"
                          : currentLang === 'en'
                          ? "Detailed civil claims (Art. 49 CO / CHF 47,700) filed with complaint"
                          : "Деталізований цивільний позов (ст. 49 CO) на суму CHF 47'700 одночасно зі скаргою"}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 bg-rose-950/10">
                      <td className="p-3 font-semibold text-rose-300">
                        {currentLang === 'fr'
                          ? "Plainte directe spontanée sans avocat"
                          : currentLang === 'de'
                          ? "Direkte Selbstanzeige ohne Anwalt"
                          : currentLang === 'it'
                          ? "Querela diretta spontanea senza legale"
                          : currentLang === 'en'
                          ? "Direct Prosecutor Filing Without Counsel"
                          : "Самостійне подання без адвоката"}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-rose-400">Art. 118, 301, 310 CPP</td>
                      <td className="p-3 font-bold text-rose-400">15–20%</td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Ordonnance de non-entrée en matière (art. 310 al. 1 let. a CPP)"
                          : currentLang === 'en'
                          ? "Summary dismissal (Art. 310 Swiss CPC: non-entrée en matière)"
                          : "Постанова про відмову у порушенні справи (ст. 310 CPP)"}
                      </td>
                      <td className="p-3 text-slate-300">
                        {currentLang === 'fr'
                          ? "Passage obligatoire par la Permanence OAV (Montbenon, 50 CHF)"
                          : currentLang === 'en'
                          ? "Consultation at OAV Legal Desk (Montbenon, CHF 50) prior to any filing"
                          : "Обов'язкова консультація Permanence OAV (50 CHF) для аудиту заяви"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#080E1B]">
          <div className="text-[11px] text-slate-400 font-mono">
            {t.footer_text}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const activeText =
                  activeTab === 'doctrine'
                    ? LEGAL_STRATEGY_MEMORANDUM.sections
                        .map((s) => `### ${docLang === 'fr' ? s.titleFr : s.titleUk}\n${docLang === 'fr' ? s.contentFr : s.contentUk}`)
                        .join('\n\n')
                    : activeTab === 'matrix'
                    ? (docLang === 'fr'
                        ? "# MATRICE D'ÉVALUATION DES STRATÉGIES JURIDIQUES (PE24.014624-SBA)\n\n1. Mandat d'avocat & compensation IT (art. 363 / 394 / 120 CO) : Succès 95%\n2. Soutien étatique LAVI (art. 136 CPP / ATF 150 II 465) : Succès 85%\n3. Conseil juridique gratuit (art. 136 CPP) : Succès 65%\n4. Plainte directe sans avocat (art. 310 CPP) : Risque de classement élevé."
                        : "# МАТРИЦЯ ОЦІНКИ ЮРИДИЧНИХ СТРАТЕГІЙ (PE24.014624-SBA)\n\n1. Адвокатський мандат та IT-залік (ст. 363 / 394 / 120 CO) : Успіх 95%\n2. Державна підтримка LAVI (ст. 136 CPP / ATF 150 II 465) : Успіх 85%\n3. Безоплатний представник (ст. 136 CPP) : Успіх 65%\n4. Самостійне подання без адвоката (ст. 310 CPP) : Високий ризик закриття справи.")
                    : activeTab === 'pitch'
                    ? docLang === 'fr'
                      ? pitchDoc.contentFr
                      : pitchDoc.contentUk
                    : activeTab === 'lavi'
                    ? docLang === 'fr'
                      ? laviDoc.contentFr
                      : laviDoc.contentUk
                    : activeTab === 'contract'
                    ? docLang === 'fr'
                      ? contractDoc.contentFr
                      : contractDoc.contentUk
                    : docLang === 'fr'
                    ? pitchDoc.contentFr
                    : pitchDoc.contentUk;

                const docTitle = `B-SDD_Legal_Strategy_${activeTab.toUpperCase()}_${docLang}`;

                // 1. Download file
                const blob = new Blob([activeText], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${docTitle}.md`;
                a.click();
                URL.revokeObjectURL(url);

                // 2. Open email client prefilled for Kindle whispersync
                const mailtoUrl = `mailto:?subject=${encodeURIComponent("B-SDD Legal Book: " + docTitle)}&body=${encodeURIComponent("Attachez ce fichier .md ou .epub pour transmission vers Kindle Whispersync (Dossier PE24.014624-SBA).")}`;
                window.open(mailtoUrl, '_blank');

                // 3. Callback if provided
                onSendToKindle?.(docTitle, activeText);

                // 4. UI visual confirmation
                setSentKindle(true);
                setTimeout(() => setSentKindle(false), 3500);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-900/70 border border-blue-700/60 text-blue-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {sentKindle ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{sentKindle ? (currentLang === 'uk' ? '✓ Надіслано на Kindle!' : '✓ Envoyé à Kindle !') : t.btn_kindle}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {t.btn_close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
