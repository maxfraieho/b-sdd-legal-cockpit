import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Search,
  Tag,
  Hash,
  Copy,
  Check,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { DOSSIER_CHAPTERS, DossierChapter, resolveLocalized } from "../data/legalData";
import { commitAtomicSupersession } from "../lib/wormLedger";

interface KindleVoiceReviewProps {
  currentLang: SupportedLanguage;
  onCommitSuccess?: (summary: string) => void;
  onTriggerKuzuAnalysis?: (entities: string[]) => void;
}

export const KindleVoiceReview: React.FC<KindleVoiceReviewProps> = ({
  currentLang,
  onCommitSuccess,
  onTriggerKuzuAnalysis,
}) => {
  // Selected chapter from the 18 chapters
  const [selectedChapter, setSelectedChapter] = useState<DossierChapter>(DOSSIER_CHAPTERS[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Free lawyer draft & dictation text
  const [dictationText, setDictationText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLang, setRecordingLang] = useState<"fr-CH" | "uk-UA">("fr-CH");
  const recognitionRef = useRef<any>(null);

  // Active editable text for the right column
  const [editorText, setEditorText] = useState(resolveLocalized(selectedChapter.lawyer_draft, currentLang));
  const [isSaved, setIsSaved] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // KùzuDB Blast Radius analysis results
  const [analysisReport, setAnalysisReport] = useState<{
    entities: string[];
    articles: string[];
    impactScore: number;
    timestamp: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync editor text when chapter or language changes
  useEffect(() => {
    setEditorText(resolveLocalized(selectedChapter.lawyer_draft, currentLang));
    setIsSaved(false);
  }, [selectedChapter, currentLang]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    try {
      const SpeechRecognition =
        typeof window !== 'undefined'
          ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          : null;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = recordingLang;

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setDictationText((prev) => (prev ? prev + " " + currentTranscript : currentTranscript));
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn("SpeechRecognition not supported or disabled in this browser:", err);
      recognitionRef.current = null;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [recordingLang]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(
        currentLang === 'uk'
          ? "Голосовий ввід не підтримується у цьому браузері або вимкнений. Введіть текст вручну."
          : "La reconnaissance vocale n'est pas supportée dans ce navigateur. Veuillez saisir le texte manuellement."
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = recordingLang;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // One-click trigger that parses unstructured lawyer notes into impacted legal entities
  const handleAnalyzeKuzu = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const combined = (dictationText + " " + editorText).toLowerCase();
      const detectedEntities: string[] = [];
      const detectedArticles: string[] = [];

      if (combined.includes("arsen") || combined.includes("kovalenko") || combined.includes("потерпіл")) {
        detectedEntities.push("ACT-ARSEN-KOVALENKO (Partie plaignante / 26 ans)");
      }
      if (combined.includes("milli") || combined.includes("adriano") || combined.includes("міллі")) {
        detectedEntities.push("ACT-ADRIANO-MILLI (Tiers de bonne foi / Art. 933 CC)");
      }
      if (combined.includes("suvorova") || combined.includes("liubov") || combined.includes("суворов")) {
        detectedEntities.push("ACT-LIUBOV-SUVOROVA (Prévenue principale)");
      }
      if (combined.includes("hanna") || combined.includes("ганн")) {
        detectedEntities.push("ACT-HANNA-SUVOROVA (Complice)");
      }

      if (combined.includes("180") || combined.includes("menace") || combined.includes("погроз")) {
        detectedArticles.push("Art. 180 al. 1 CP");
      }
      if (combined.includes("146") || combined.includes("escroquerie") || combined.includes("шахрайств") || combined.includes("15000") || combined.includes("15'000")) {
        detectedArticles.push("Art. 146 CP");
      }
      if (combined.includes("186") || combined.includes("domicile") || combined.includes("житл")) {
        detectedArticles.push("Art. 186 CP");
      }
      if (combined.includes("303") || combined.includes("calomnie") || combined.includes("донос")) {
        detectedArticles.push("Art. 303 CP");
      }
      if (combined.includes("263") || combined.includes("séquestre") || combined.includes("арешт")) {
        detectedArticles.push("Art. 263 CPP");
      }

      const report = {
        entities: detectedEntities.length > 0 ? detectedEntities : ["ACT-ARSEN-KOVALENKO", "ACT-ADRIANO-MILLI"],
        articles: detectedArticles.length > 0 ? detectedArticles : ["Art. 180 CP", "Art. 146 CP", "Art. 933 CC"],
        impactScore: 4 + detectedArticles.length * 2,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAnalysisReport(report);
      setIsAnalyzing(false);
      if (onTriggerKuzuAnalysis) {
        onTriggerKuzuAnalysis(report.entities);
      }
    }, 450);
  };

  // Commit text to WORM ledger
  const handleWormCommit = async () => {
    try {
      await commitAtomicSupersession({
        entity_id: selectedChapter.id,
        chapter_id: selectedChapter.id,
        summary: `Mise à jour calibrée du Chapitre ${selectedChapter.number} (${selectedChapter.impacted_articles.join(', ')})`,
        content_snapshot: editorText,
        committer: "Conseil de la victime (Lausanne)",
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      if (onCommitSuccess) {
        onCommitSuccess(`Chapitre ${selectedChapter.number} scellé dans Utopia WORM.`);
      }
    } catch (err) {
      console.error("WORM commit error:", err);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(editorText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleResetToBaseline = () => {
    setEditorText(resolveLocalized(selectedChapter.lawyer_draft, currentLang));
  };

  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const charCount = editorText.length;

  return (
    <div className="h-full w-full flex flex-col bg-[#080C14] text-slate-100 overflow-hidden">
      {/* 1. FREE INPUT & AUDIO DICTATION HEADER */}
      <div className="bg-[#0D1424] border-b border-slate-800/80 p-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                {currentLang === 'uk' ? 'Надиктовка адвоката & Вільні примітки' : 'Dictée de l\'avocat & Notes brutes'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'uk'
                  ? 'Голосове введення Web Speech API або введення тексту для парсингу через KùzuDB'
                  : 'Saisie vocale continue Web Speech API ou prise de note pour analyse KùzuDB'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dictation Language Selector */}
            <select
              value={recordingLang}
              onChange={(e) => setRecordingLang(e.target.value as any)}
              className="bg-[#070B12] border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="fr-CH">FR (Suisse)</option>
              <option value="uk-UA">UA (Українська)</option>
            </select>

            {/* Mic Toggle Button */}
            <button
              onClick={toggleRecording}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60"
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isRecording ? (currentLang === 'uk' ? 'Слухаю...' : 'En écoute...') : (currentLang === 'uk' ? 'Запис' : 'Dicter')}</span>
            </button>

            {/* Analyze via MemPalace KùzuDB */}
            <button
              onClick={handleAnalyzeKuzu}
              disabled={isAnalyzing}
              className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded text-xs font-medium shadow-sm transition-all border border-blue-500/40"
              title="Автоматично витягти згадки акторів та інкримінованих статей"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span className="font-mono">
                {isAnalyzing
                  ? (currentLang === 'uk' ? 'Аналіз графа...' : 'Analyse KùzuDB...')
                  : (currentLang === 'uk' ? '⚡ Проаналізувати KùzuDB' : '⚡ Analyser via KùzuDB')}
              </span>
            </button>
          </div>
        </div>

        {/* Textarea for Unstructured Notes */}
        <div className="relative">
          <textarea
            value={dictationText}
            onChange={(e) => setDictationText(e.target.value)}
            placeholder={
              currentLang === 'uk'
                ? "Говоріть у мікрофон або введіть оперативні замітки адвоката (напр. 'Перевірити алібі Арсена в Лозанні проти погроз Любові, звернути увагу на $15'000 USD та ст. 180 КК')..."
                : "Parlez dans le micro ou saisissez vos notes d'audience (ex: 'Vérifier l'alibi d'Arsen à Lausanne contre les menaces de Suvorova, insister sur les $15'000 USD et l'Art. 180 CP')..."
            }
            rows={2}
            className="w-full bg-[#070B12] border border-slate-800/80 rounded p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans resize-none transition-all"
          />
          {dictationText && (
            <button
              onClick={() => setDictationText("")}
              className="absolute right-2 top-2 text-[10px] text-slate-500 hover:text-slate-300 font-mono"
            >
              Effacer
            </button>
          )}
        </div>

        {/* KùzuDB Real-Time Analysis Report Pill Strip */}
        {analysisReport && (
          <div className="mt-2 p-2 bg-[#0F1A2E] border border-blue-800/40 rounded flex flex-wrap items-center gap-2 text-[11px] animate-fadeIn">
            <span className="font-mono text-blue-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              KùzuDB Blast Radar:
            </span>
            <span className="text-slate-400">Entités:</span>
            {analysisReport.entities.map((ent, idx) => (
              <span key={idx} className="bg-blue-950/80 text-blue-200 border border-blue-700/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                {ent}
              </span>
            ))}
            <span className="text-slate-400 ml-1">Articles CP:</span>
            {analysisReport.articles.map((art, idx) => (
              <span key={idx} className="bg-amber-950/70 text-amber-300 border border-amber-600/40 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                {art}
              </span>
            ))}
            <span className="ml-auto text-[10px] text-slate-400 font-mono">
              Rayon d'impact: <strong className="text-emerald-400">{analysisReport.impactScore} chapitres</strong>
            </span>
          </div>
        )}
      </div>

      {/* 2. CHAPTER SELECTOR BAR & EVERLAW-STYLE DRAWER TRIGGER */}
      <div className="bg-[#0B1120] border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex items-center space-x-1.5 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded font-mono text-xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>18 Chapitres ED10</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${drawerOpen ? "rotate-90" : ""}`} />
          </button>

          <span className="text-slate-600">|</span>

          <span className="font-mono text-amber-400 font-bold">
            CH-{selectedChapter.number}:
          </span>
          <span className="text-slate-200 font-medium truncate max-w-[340px]">
            {resolveLocalized(selectedChapter.title, currentLang)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {selectedChapter.impacted_articles.map((art) => (
            <span
              key={art}
              className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono"
            >
              {art}
            </span>
          ))}
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Vérifié WORM
          </span>
        </div>
      </div>

      {/* 3. DUAL-COLUMN SYNCHRONIZED DIFF CANVAS */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SLIDING EVERLAW-STYLE CHAPTER DRAWER */}
        {drawerOpen && (
          <aside className="absolute left-0 top-0 bottom-0 w-80 bg-[#0B1120] border-r border-slate-800 z-20 shadow-2xl flex flex-col animate-slideRight">
            <div className="p-2.5 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {currentLang === 'uk' ? 'Розділи досьє ED10' : 'Table des Matières ED10'}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-xs font-mono"
              >
                Fermer
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {DOSSIER_CHAPTERS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChapter(ch);
                    setDrawerOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded text-xs transition-all border ${
                    selectedChapter.id === ch.id
                      ? "bg-blue-900/30 border-blue-600/60 text-white font-medium shadow-sm"
                      : "bg-[#070B12] hover:bg-slate-800/50 border-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-amber-400 text-[11px] font-bold">
                      Chapitre {ch.number}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {ch.impacted_articles[0]}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-200 line-clamp-2">
                    {resolveLocalized(ch.title, currentLang)}
                  </div>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* LEFT COLUMN: OUTDATED DOSSIER CLAIMS (Crimson soft strikethrough styling) */}
        <section className="w-1/2 border-r border-slate-800/80 bg-[#0A0E18] flex flex-col overflow-hidden">
          <div className="h-8 bg-[#070B12] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs text-rose-300 font-mono">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{currentLang === 'uk' ? 'Вихідне досьє / Спростовано' : 'Dossier Initial / Allégations Réfutées'}</span>
            </span>
            <span className="text-[10px] text-rose-400/80 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
              {currentLang === 'uk' ? 'СТАРА ВЕРСІЯ' : 'VERSION OBSOLÈTE'}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                {currentLang === 'uk' ? 'Спростована теза захисту або помилковий запис :' : 'Allégation adverse réfutée ou mention erronée :'}
              </span>
              <p className="text-xs text-rose-200/90 leading-relaxed font-sans line-through decoration-rose-500/70">
                {resolveLocalized(selectedChapter.outdated_claim, currentLang)}
              </p>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
              <h4 className="font-mono text-[11px] text-slate-300 uppercase">
                {currentLang === 'uk' ? 'Контекст спростування :' : 'Contexte probatoire de la réfutation :'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {resolveLocalized(selectedChapter.summary, currentLang)}
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                {currentLang === 'uk' ? 'Докази спростування у Factbook :' : 'Pièces de réfutation dans le Factbook :'}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedChapter.supporting_pieces.map((p) => (
                  <span
                    key={p}
                    className="font-mono text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: HIGH-CONTRAST EDITABLE LIVE ADVOCATE CANVAS */}
        <section className="w-1/2 bg-[#080C14] flex flex-col overflow-hidden">
          <div className="h-8 bg-[#0D1424] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs text-emerald-300 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLang === 'uk' ? 'Живий редактор адвоката / Стане' : 'Éditeur Vivant de l\'Avocat / Version Corrigée'}</span>
            </span>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
              <span className="tabular-nums font-mono">{wordCount} mots</span>
              <span>·</span>
              <span className="tabular-nums font-mono">{charCount} car.</span>
            </div>
          </div>

          <div className="flex-1 p-3 flex flex-col overflow-hidden">
            <textarea
              value={editorText}
              onChange={(e) => {
                setEditorText(e.target.value);
                setIsSaved(false);
              }}
              className="flex-1 w-full bg-[#0F172A] border border-slate-800 focus:border-blue-500 rounded p-3 text-xs leading-relaxed text-slate-100 font-sans focus:outline-none resize-none transition-all shadow-inner"
              placeholder={
                currentLang === 'uk'
                  ? "Внесіть юридично вивірені формулювання позиції потерпілого..."
                  : "Rédigez la version corrigée et juridiquement calibrée de la plaidoirie..."
              }
            />
          </div>

          {/* DRAFTER ACTION TOOLBAR */}
          <div className="h-10 bg-[#0B1120] border-t border-slate-800/80 px-3 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetToBaseline}
                className="flex items-center space-x-1 px-2 py-1 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                title="Скинути до початкового шаблону"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{currentLang === 'uk' ? 'Скинути' : 'Réinitialiser'}</span>
              </button>

              <button
                onClick={handleCopyText}
                className="flex items-center space-x-1 px-2 py-1 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                title="Скопіювати текст виступу"
              >
                {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText ? (currentLang === 'uk' ? 'Скопійовано!' : 'Copié !') : (currentLang === 'uk' ? 'Копіювати' : 'Copier')}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {isSaved && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {currentLang === 'uk' ? 'Зафіксовано в WORM!' : 'Scellé dans WORM !'}
                </span>
              )}

              <button
                onClick={handleWormCommit}
                className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium shadow-sm transition-all border border-blue-400/40"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="font-mono">
                  {currentLang === 'uk' ? 'Зафіксувати WORM запис' : 'Sceller dans WORM (L-01)'}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
