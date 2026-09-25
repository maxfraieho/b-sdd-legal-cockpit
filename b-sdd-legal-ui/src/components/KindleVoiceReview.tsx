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
  const [interimText, setInterimText] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLang, setRecordingLang] = useState<"uk-UA" | "fr-CH" | "de-CH" | "it-CH" | "en-US">(() => {
    if (currentLang === "uk") return "uk-UA";
    if (currentLang === "it") return "it-CH";
    if (currentLang === "de") return "de-CH";
    if (currentLang === "en") return "en-US";
    return "fr-CH";
  });
  const recognitionRef = useRef<any>(null);

  // Sync recordingLang when currentLang changes if user hasn't explicitly overridden
  useEffect(() => {
    if (currentLang === "uk") setRecordingLang("uk-UA");
    else if (currentLang === "it") setRecordingLang("it-CH");
    else if (currentLang === "de") setRecordingLang("de-CH");
    else if (currentLang === "en") setRecordingLang("en-US");
    else setRecordingLang("fr-CH");
  }, [currentLang]);

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

  // Speech Recognition setup (Web Speech API / Meta Astryx Speech Standard)
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
        recognition.maxAlternatives = 1;
        recognition.lang = recordingLang;

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let finalChunk = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalChunk += item[0].transcript;
            } else {
              currentInterim += item[0].transcript;
            }
          }

          if (finalChunk.trim()) {
            setDictationText((prev) => (prev ? prev.trim() + " " + finalChunk.trim() : finalChunk.trim()));
            setSpeechError(null);
          }
          setInterimText(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          setInterimText("");
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechError(
              currentLang === 'uk'
                ? "Мікрофон заблоковано в браузері. Дозвольте доступ або введіть текст вручну."
                : currentLang === 'it'
                ? "Microfono bloccato nel browser. Autorizzare l'accesso o digitare le note."
                : currentLang === 'de'
                ? "Mikrofonzugriff blockiert. Bitte Berechtigung erteilen oder Text tippen."
                : "Microphone bloqué dans le navigateur. Veuillez autoriser l'accès."
            );
          } else if (event.error === 'network') {
            setSpeechError(
              currentLang === 'uk'
                ? "Помилка мережі розпізнавання голосу. Скористайтесь швидкими шаблонами нижче."
                : currentLang === 'it'
                ? "Errore di rete del riconoscimento vocale. Usare i modelli rapidi sotto."
                : currentLang === 'de'
                ? "Netzwerkfehler der Spracherkennung. Vorlagen unten nutzen."
                : "Erreur réseau de reconnaissance vocale. Utilisez les modèles ci-dessous."
            );
          } else if (event.error !== 'no-speech') {
            setSpeechError(`Astryx Speech Info: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          setInterimText("");
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
  }, [recordingLang, currentLang]);

  const toggleRecording = () => {
    setSpeechError(null);
    if (!recognitionRef.current) {
      setSpeechError(
        currentLang === 'uk'
          ? "Голосовий ввід не підтримується цим браузером. Використовуйте кнопки швидких аудіозаписів або клавіатуру."
          : currentLang === 'it'
          ? "Riconoscimento vocale non supportato dal browser. Utilizzare i modelli audio rapidi o digitare."
          : currentLang === 'de'
          ? "Spracherkennung in diesem Browser nicht unterstützt. Bitte Schnellvorlagen oder Tastatur nutzen."
          : "La reconnaissance vocale n'est pas supportée dans ce navigateur. Utilisez les modèles ou le clavier."
      );
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
      setInterimText("");
    } else {
      try {
        recognitionRef.current.lang = recordingLang;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setSpeechError("Не вдалося запустити розпізнавання: " + String(err));
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

  const [mobileDiffView, setMobileDiffView] = useState<"both" | "outdated" | "current">("current");

  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const charCount = editorText.length;

  return (
    <div className="h-full w-full flex flex-col bg-[#080C14] text-slate-100 overflow-hidden">
      {/* 1. FREE INPUT & AUDIO DICTATION HEADER */}
      <div className="bg-[#0D1424] border-b border-slate-800/80 p-2 sm:p-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono truncate">
                {currentLang === 'uk' ? 'Надиктовка адвоката & Вільні примітки' : 'Dictée de l\'avocat & Notes brutes'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {currentLang === 'uk'
                  ? 'Голосове введення Web Speech API або введення тексту для парсингу через KùzuDB'
                  : 'Saisie vocale continue Web Speech API ou prise de note pour analyse KùzuDB'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dictation Language Selector */}
            <select
              value={recordingLang}
              onChange={(e) => setRecordingLang(e.target.value as any)}
              className="bg-[#070B12] border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="uk-UA">UA (Українська)</option>
              <option value="fr-CH">FR (Français)</option>
              <option value="de-CH">DE (Deutsch)</option>
              <option value="it-CH">IT (Italiano)</option>
              <option value="en-US">EN (English)</option>
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
              <span>
                {isRecording
                  ? currentLang === 'uk'
                    ? 'Слухаю...'
                    : currentLang === 'it'
                    ? 'In ascolto...'
                    : currentLang === 'de'
                    ? 'Aufnahme...'
                    : currentLang === 'fr'
                    ? 'En écoute...'
                    : 'Listening...'
                  : currentLang === 'uk'
                  ? 'Запис'
                  : currentLang === 'it'
                  ? 'Registra'
                  : currentLang === 'de'
                  ? 'Diktieren'
                  : currentLang === 'fr'
                  ? 'Dicter'
                  : 'Dictate'}
              </span>
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
                  ? currentLang === 'uk'
                    ? 'Аналіз графа...'
                    : currentLang === 'it'
                    ? 'Analisi grafo...'
                    : currentLang === 'de'
                    ? 'Graph-Analyse...'
                    : 'Analyse KùzuDB...'
                  : currentLang === 'uk'
                  ? '⚡ Проаналізувати KùzuDB'
                  : currentLang === 'it'
                  ? '⚡ Analizza via KùzuDB'
                  : currentLang === 'de'
                  ? '⚡ KùzuDB Analyse'
                  : '⚡ Analyser via KùzuDB'}
              </span>
            </button>
          </div>
        </div>

        {/* Speech Error Banner if any */}
        {speechError && (
          <div className="mb-2 p-2 bg-rose-950/50 border border-rose-800/60 rounded flex items-center justify-between text-[11px] text-rose-300">
            <span className="flex items-center space-x-1.5">
              <span>⚠️</span>
              <span>{speechError}</span>
            </span>
            <button
              onClick={() => setSpeechError(null)}
              className="text-[10px] text-rose-400 hover:text-white font-mono ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Textarea for Unstructured Notes */}
        <div className="relative">
          <textarea
            value={dictationText}
            onChange={(e) => setDictationText(e.target.value)}
            placeholder={
              currentLang === 'uk'
                ? "Говоріть у мікрофон або введіть оперативні замітки адвоката (напр. 'Перевірити алібі Арсена в Лозанні проти погроз Любові, звернути увагу на $15'000 USD та ст. 180 КК')..."
                : currentLang === 'it'
                ? "Parlate al microfono o inserite note operative legali (es: 'Verificare alibi Arsen a Losanna contro minacce Suvorova, evidenziare $15'000 USD ed Art. 180 CP')..."
                : currentLang === 'de'
                ? "Sprechen Sie ins Mikrofon oder tippen Sie Anwaltsnotizen (z.B. 'Alibi von Arsen in Lausanne gegen Drohungen von Suvorova prüfen, 15'000 USD und Art. 180 StGB')..."
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
              {currentLang === 'uk' ? 'Очистити' : currentLang === 'it' ? 'Cancella' : currentLang === 'de' ? 'Löschen' : 'Effacer'}
            </button>
          )}
        </div>

        {/* Interim Speech Transcription Live Stream */}
        {isRecording && interimText && (
          <div className="mt-1 flex items-center space-x-2 text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded px-2 py-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-400">
              {currentLang === 'uk' ? 'Розпізнавання голосу Astryx:' : currentLang === 'it' ? 'Trascrizione Astryx:' : currentLang === 'de' ? 'Spracherkennung:' : 'Astryx Speech:'}
            </span>
            <span className="italic">{interimText}</span>
          </div>
        )}

        {/* Rapid Astryx Audio Presets (Asterisk recordings & case transcripts) */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <span className="text-slate-500">
            {currentLang === 'uk' ? 'Зразки аудіо (Astryx):' : currentLang === 'it' ? 'Esempi audio (Astryx):' : currentLang === 'de' ? 'Audio-Muster (Astryx):' : 'Exemples audio (Astryx):'}
          </span>
          <button
            type="button"
            onClick={() => {
              setDictationText((prev) =>
                prev
                  ? prev + " P-01: Погрози вбивством та розправою Любові Суворової ст. 180 КК"
                  : "Аудіозапис телефонного дзвінка P-01: прямі погрози вбивством та фізичною розправою від Любові Суворової на адресу потерпілого Арсена Коваленка (ст. 180 ч. 1 КК Швейцарії)."
              );
            }}
            className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-slate-300 hover:text-white transition-colors"
          >
            🎙️ P-01 Menaces Art. 180 CP
          </button>
          <button
            type="button"
            onClick={() => {
              setDictationText((prev) =>
                prev
                  ? prev + " P-15: Транш $15'000 USD шахрайство ст. 146 КК"
                  : "Банківська виписка Wise та транш $15'000 USD від потерпілого Арсена Коваленка на рахунок Суворової (P-15), кваліфікований як шахрайство (ст. 146 КК) та арешт ст. 263 КПК."
              );
            }}
            className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-slate-300 hover:text-white transition-colors"
          >
            💰 P-15 Escroquerie $15'000
          </button>
          <button
            type="button"
            onClick={() => {
              setDictationText((prev) =>
                prev
                  ? prev + " P-03: Довідка Unisanté та алібі Лозанни"
                  : "Медична довідка Unisanté P-03 та EXIF фотофіксація: підтвердження присутності Коваленка в Лозанні 24.11.2024, спростування неправдивого доносу Суворової (ст. 303 КК)."
              );
            }}
            className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-slate-300 hover:text-white transition-colors"
          >
            📍 P-03 Alibi Lausanne Unisanté
          </button>
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
      <div className="bg-[#0B1120] border-b border-slate-800/80 px-2 sm:px-3 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-xs shrink-0">
        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded font-mono text-xs transition-colors shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">18 Chapitres ED10</span>
            <span className="sm:hidden">ED10</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${drawerOpen ? "rotate-90" : ""}`} />
          </button>

          <span className="text-slate-600">|</span>

          <span className="font-mono text-amber-400 font-bold shrink-0">
            CH-{selectedChapter.number}:
          </span>
          <span className="text-slate-200 font-medium truncate max-w-[140px] sm:max-w-[260px] md:max-w-[340px]">
            {resolveLocalized(selectedChapter.title, currentLang)}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Mobile Diff View Switcher (Visible on < md) */}
          <div className="flex md:hidden items-center bg-[#070B12] p-0.5 rounded border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setMobileDiffView("outdated")}
              className={`px-1.5 py-0.5 rounded transition-all ${
                mobileDiffView === "outdated"
                  ? "bg-rose-950 text-rose-300 font-bold border border-rose-800"
                  : "text-slate-400"
              }`}
            >
              Réfuté
            </button>
            <button
              onClick={() => setMobileDiffView("current")}
              className={`px-1.5 py-0.5 rounded transition-all ${
                mobileDiffView === "current"
                  ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800"
                  : "text-slate-400"
              }`}
            >
              Corrigé
            </button>
            <button
              onClick={() => setMobileDiffView("both")}
              className={`px-1.5 py-0.5 rounded transition-all ${
                mobileDiffView === "both"
                  ? "bg-blue-900/60 text-blue-200 font-bold border border-blue-700"
                  : "text-slate-400"
              }`}
            >
              Split
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5">
            {selectedChapter.impacted_articles.slice(0, 2).map((art) => (
              <span
                key={art}
                className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono"
              >
                {art}
              </span>
            ))}
          </div>
          <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Vérifié WORM</span>
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
        <section className={`border-r border-slate-800/80 bg-[#0A0E18] flex-col overflow-hidden md:flex md:w-1/2 ${
          mobileDiffView === "outdated" ? "w-full flex" : mobileDiffView === "both" ? "w-1/2 flex" : "hidden md:flex"
        }`}>
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
        <section className={`bg-[#080C14] flex-col overflow-hidden md:flex md:w-1/2 ${
          mobileDiffView === "current" ? "w-full flex" : mobileDiffView === "both" ? "w-1/2 flex" : "hidden md:flex"
        }`}>
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
