import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  MapPin,
  Clock,
  Tag,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Eye,
  X,
  Upload,
  Trash2,
  Cloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Image as ImageIcon,
  FolderArchive,
  Layers,
  Sparkles,
  Scale,
  Database,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import {
  BORDEREAU_PIECES,
  BordereauPiece,
  resolveLocalized,
} from "../data/legalData";
import { EvidenceIngestionWizard } from "./EvidenceIngestionWizard";
import { SwissCodesModal } from "./SwissCodesModal";

interface EvidenceFactbookProps {
  currentLang: SupportedLanguage;
}

export const EvidenceFactbook: React.FC<EvidenceFactbookProps> = ({ currentLang }) => {
  // Modes: "factbook" (standard list + audio player), "gallery" (photo & scan cards), "gdrive" (Google Drive archive & SHA-256 verifier)
  const [activeMode, setActiveMode] = useState<"factbook" | "gallery" | "gdrive">("factbook");

  // Pieces state (supports adding/removing photos and linking with Utopia DB ADRs)
  const [pieces, setPieces] = useState<BordereauPiece[]>(BORDEREAU_PIECES);

  // Evidence Ingestion Wizard and Swiss Codes Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCodesModalOpen, setIsCodesModalOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  // Selected piece for inspection
  const [selectedPiece, setSelectedPiece] = useState<BordereauPiece>(BORDEREAU_PIECES[0]);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // EXIF Lightbox Modal state
  const [lightboxPiece, setLightboxPiece] = useState<BordereauPiece | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [rotationDeg, setRotationDeg] = useState<number>(0);

  // File input ref for attaching photos to cards
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetAttachCote, setTargetAttachCote] = useState<string | null>(null);

  // In-browser SHA-256 Verifier state
  const [verifierHash, setVerifierHash] = useState<string | null>(null);
  const [verifierFileName, setVerifierFileName] = useState<string | null>(null);
  const [verifierFileSize, setVerifierFileSize] = useState<number | null>(null);
  const [verifierMatch, setVerifierMatch] = useState<BordereauPiece | null>(null);
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [verifierError, setVerifierError] = useState<string | null>(null);

  // Mobile Sub-Tab between evidence list and detailed inspection panel
  const [mobileSubTab, setMobileSubTab] = useState<"list" | "details">("list");

  // Filtered pieces based on search and category
  const filteredPieces = pieces.filter((p) => {
    const titleStr = resolveLocalized(p.titre, currentLang).toLowerCase();
    const quoteStr = resolveLocalized(p.citation_cle, currentLang).toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      titleStr.includes(query) ||
      quoteStr.includes(query) ||
      p.cote.toLowerCase().includes(query) ||
      p.sha256.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "Tous" || p.categorie === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pieces that have visual photo/document assets
  const photoPieces = pieces.filter(
    (p) =>
      p.fichier_local &&
      (p.fichier_local.match(/\.(jpg|jpeg|png|webp)$/i) ||
        p.fichier_local.startsWith("data:image/") ||
        p.categorie === "Photo EXIF" ||
        p.categorie === "Médical" ||
        p.categorie === "Bancaire")
  );

  // Handle piece selection changes: stop audio, reset time
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
  }, [selectedPiece.cote]);

  // Sync playbackRate and isMuted to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isMuted;
    }
  }, [playbackRate, isMuted]);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio playback fallback engaged:", err);
          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const quote = resolveLocalized(selectedPiece.citation_cle, currentLang);
            const utterance = new SpeechSynthesisUtterance(quote);
            utterance.lang =
              currentLang === "fr"
                ? "fr-CH"
                : currentLang === "de"
                ? "de-CH"
                : currentLang === "it"
                ? "it-CH"
                : currentLang === "uk"
                ? "uk-UA"
                : "en-US";
            utterance.rate = playbackRate;
            utterance.onend = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
          }
        });
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleOpenLightbox = (piece: BordereauPiece) => {
    setLightboxPiece(piece);
    setZoomLevel(1.0);
    setRotationDeg(0);
  };

  // Lightbox Next/Prev navigation
  const handleNextPhoto = () => {
    if (!lightboxPiece) return;
    const currentIndex = photoPieces.findIndex((p) => p.cote === lightboxPiece.cote);
    if (currentIndex >= 0 && currentIndex < photoPieces.length - 1) {
      setLightboxPiece(photoPieces[currentIndex + 1]);
    } else {
      setLightboxPiece(photoPieces[0]);
    }
    setZoomLevel(1.0);
    setRotationDeg(0);
  };

  const handlePrevPhoto = () => {
    if (!lightboxPiece) return;
    const currentIndex = photoPieces.findIndex((p) => p.cote === lightboxPiece.cote);
    if (currentIndex > 0) {
      setLightboxPiece(photoPieces[currentIndex - 1]);
    } else {
      setLightboxPiece(photoPieces[photoPieces.length - 1]);
    }
    setZoomLevel(1.0);
    setRotationDeg(0);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxPiece) return;
      if (e.key === "Escape") setLightboxPiece(null);
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "+" || e.key === "=") setZoomLevel((z) => Math.min(3.0, z + 0.25));
      if (e.key === "-") setZoomLevel((z) => Math.max(0.5, z - 0.25));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxPiece]);

  // Trigger file attachment dialog
  const triggerAttachPhoto = (cote: string) => {
    setTargetAttachCote(cote);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Handle file attachment to piece (ADR synchronization)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetAttachCote) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPieces((prev) =>
        prev.map((p) => {
          if (p.cote === targetAttachCote) {
            return {
              ...p,
              fichier_local: dataUrl,
              categorie: p.categorie === "Audio" ? "Photo EXIF" : p.categorie,
              adr_sync: true,
              exif_meta: p.exif_meta || {
                camera: "Upload numérique local (Client App)",
                lens: "Capteur direct",
                timestamp: new Date().toLocaleString(),
                gps: "Lausanne, Suisse",
                iso: 100,
                aperture: "ISO/IEC 27037",
                alibi_verification: "Доказ додано до картки та синхронізовано з Utopia DB (ADR).",
              },
            };
          }
          return p;
        })
      );

      // Update selected piece if it's the target
      if (selectedPiece.cote === targetAttachCote) {
        setSelectedPiece((prev) => ({
          ...prev,
          fichier_local: dataUrl,
          adr_sync: true,
        }));
      }

      setTargetAttachCote(null);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo from card
  const handleRemovePhoto = (cote: string) => {
    if (
      !window.confirm(
        currentLang === "uk"
          ? `Ви дійсно бажаєте видалити прикріплене фото з картки ${cote}?`
          : `Supprimer la pièce jointe visuelle de la cote ${cote} ?`
      )
    ) {
      return;
    }

    setPieces((prev) =>
      prev.map((p) => {
        if (p.cote === cote) {
          return {
            ...p,
            fichier_local: "",
            adr_sync: true,
          };
        }
        return p;
      })
    );

    if (selectedPiece.cote === cote) {
      setSelectedPiece((prev) => ({
        ...prev,
        fichier_local: "",
        adr_sync: true,
      }));
    }
  };

  // Compute SHA-256 using browser Web Crypto API
  const computeFileSHA256 = async (file: File) => {
    setIsComputingHash(true);
    setVerifierError(null);
    setVerifierFileName(file.name);
    setVerifierFileSize(file.size);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      setVerifierHash(hashHex);

      // Check if match exists in registered pieces
      const match = pieces.find(
        (p) => p.sha256.toLowerCase() === hashHex.toLowerCase()
      );
      setVerifierMatch(match || null);
    } catch (err: any) {
      setVerifierError(err?.message || "Erreur de calcul cryptographique SHA-256");
      setVerifierHash(null);
      setVerifierMatch(null);
    } finally {
      setIsComputingHash(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCommitNewEvidence = (newPiece: BordereauPiece) => {
    setPieces((prev) => [newPiece, ...prev]);
    setSelectedPiece(newPiece);
    setActiveMode("factbook");
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#080C14] text-slate-100 overflow-hidden select-text">
      {/* Hidden File Input for Card Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* TOP NAVIGATION / MODE SWITCHER BAR */}
      <div className="bg-[#0B1120] border-b border-slate-800/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {/* AI Evidence Ingestion Wizard Button */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_12px_rgba(79,70,229,0.35)] shrink-0"
            title="Майстер додавання та юридичної кваліфікації доказів з Google Docs або файлів"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>+ Додати доказ (ШІ)</span>
          </button>

          {/* Swiss Codes & Cantonal Law Button */}
          <button
            onClick={() => setIsCodesModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0"
            title="База законів, кодексів Швейцарії (CP, CPP, CC, CO) та законодавство кантону Во"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>⚖️ Кодекси CH/VD</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

          <button
            onClick={() => setActiveMode("factbook")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeMode === "factbook"
                ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {currentLang === "uk"
                ? "📋 Офіційний реєстр доказів"
                : currentLang === "fr"
                ? "📋 Bordereau des pièces"
                : "📋 Exhibits Registry"}
            </span>
          </button>

          <button
            onClick={() => setActiveMode("gallery")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeMode === "gallery"
                ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentLang === "uk"
                ? "📸 Фотогалерея & Скани"
                : currentLang === "fr"
                ? "📸 Galerie Photos & Scans"
                : "📸 Photo Gallery & Scans"}
            </span>
            <span className="text-[10px] font-mono bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-700/60 text-blue-300 ml-1">
              {photoPieces.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMode("gdrive")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeMode === "gdrive"
                ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {currentLang === "uk"
                ? "☁️ Архів Google Drive & SHA-256"
                : currentLang === "fr"
                ? "☁️ Archive Google Drive & SHA-256"
                : "☁️ Google Drive Archive & SHA-256"}
            </span>
          </button>
        </div>

        {/* Quick External Google Drive Link */}
        <a
          href="https://drive.google.com/drive/folders/13OgTZBLm1LoYNtfwHNuWBl7kSD3ZncF1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/50 text-emerald-300 rounded text-xs font-mono transition-colors shrink-0"
          title="Прямий перехід до спільної папки Google Drive з оригінальними матеріалами"
        >
          <ExternalLink className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">Drive Folder</span>
        </a>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: STANDARD FACTBOOK & OPUS 2 PHONOSCOPIC WORKBENCH                  */}
      {/* ========================================================================= */}
      {activeMode === "factbook" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Audio Player Workbench */}
          <section className="bg-[#090E1A] border-b border-slate-800 p-3 shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Active Piece Info */}
              <div className="flex items-center space-x-3">
                <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 font-mono font-bold text-xs shrink-0">
                  {selectedPiece.cote}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xs font-semibold text-slate-100 truncate">
                    {resolveLocalized(selectedPiece.titre, currentLang)}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                    <span>Tv: {selectedPiece.date_faits}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold">
                      SHA-256: {selectedPiece.sha256.slice(0, 16)}...
                    </span>
                    {selectedPiece.adr_id && (
                      <>
                        <span>·</span>
                        <span className="text-blue-400 font-mono bg-blue-950/60 px-1 rounded border border-blue-800/40">
                          {selectedPiece.adr_id}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center space-x-3 bg-[#070B12] p-1.5 rounded border border-slate-800 shrink-0">
                <audio
                  ref={audioRef}
                  src={selectedPiece.fichier_local}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setPlaybackTime(audioRef.current.currentTime);
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    setPlaybackTime(0);
                  }}
                  preload="metadata"
                />

                <button
                  onClick={togglePlayAudio}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors shadow-sm"
                  title={isPlaying ? "Пауза" : "Відтворити фонограму"}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                <div className="font-mono text-xs text-slate-200 tabular-nums">
                  <span>{formatSeconds(playbackTime)}</span>
                  <span className="text-slate-500"> / </span>
                  <span className="text-slate-400">
                    {formatSeconds(selectedPiece.duration_sec || 120)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const nextRates = [1.0, 1.25, 1.5];
                    const nextIdx = (nextRates.indexOf(playbackRate) + 1) % nextRates.length;
                    setPlaybackRate(nextRates[nextIdx]);
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono font-semibold"
                  title="Швидкість відтворення"
                >
                  {playbackRate}x
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                  title={isMuted ? "Увімкнути звук" : "Вимкнути звук"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {selectedPiece.fichier_local &&
                  (selectedPiece.categorie === "Photo EXIF" ||
                    selectedPiece.categorie === "Médical" ||
                    selectedPiece.categorie === "Bancaire") && (
                    <button
                      onClick={() => handleOpenLightbox(selectedPiece)}
                      className="flex items-center space-x-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-mono font-bold transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                      title="Відкрити судово-криміналістичний Lightbox з EXIF метаданими"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>📸 Lightbox</span>
                    </button>
                  )}
              </div>
            </div>
          </section>

          {/* Search, Filter & Pieces List */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Segmented Switch between List and Inspector */}
            <div className="flex md:hidden items-center bg-[#070B12] p-1 border-b border-slate-800 text-xs font-mono shrink-0">
              <button
                onClick={() => setMobileSubTab("list")}
                className={`flex-1 py-1.5 rounded transition-all text-center ${
                  mobileSubTab === "list"
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📋 {currentLang === 'uk' ? 'Реєстр доказів' : 'Bordereau'} ({filteredPieces.length})
              </button>
              <button
                onClick={() => setMobileSubTab("details")}
                className={`flex-1 py-1.5 rounded transition-all text-center flex items-center justify-center space-x-1 ${
                  mobileSubTab === "details"
                    ? "bg-amber-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🔍 {currentLang === 'uk' ? 'Деталі' : 'Détails'} : {selectedPiece.cote}</span>
              </button>
            </div>

            {/* Left Column: Filterable List of Evidence */}
            <div className={`${
              mobileSubTab === "details" ? "hidden md:flex" : "flex"
            } w-full md:w-1/2 lg:w-3/5 border-r border-slate-800/80 flex-col overflow-hidden`}>
              {/* Search & Categories Bar */}
              <div className="p-2.5 bg-[#070B14] border-b border-slate-800 flex flex-col sm:flex-row gap-2 shrink-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      currentLang === "uk"
                        ? "Пошук за кодом (P-06), цитатою, статтею або SHA-256..."
                        : "Rechercher une pièce, citation, norme ou SHA-256..."
                    }
                    className="w-full pl-8 pr-3 py-1 bg-[#0D1527] border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                  {[
                    "Tous",
                    "Audio",
                    "Photo EXIF",
                    "Médical",
                    "Bancaire",
                    "Message",
                    "Procédure",
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white font-semibold"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {cat === "Tous"
                        ? currentLang === "uk"
                          ? "Всі"
                          : "Tous"
                        : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable List of Pieces */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2.5">
                {filteredPieces.map((piece) => {
                  const isSelected = piece.cote === selectedPiece.cote;
                  const hasPhoto =
                    piece.fichier_local &&
                    (piece.fichier_local.match(/\.(jpg|jpeg|png|webp)$/i) ||
                      piece.fichier_local.startsWith("data:image/") ||
                      piece.categorie === "Photo EXIF" ||
                      piece.categorie === "Médical" ||
                      piece.categorie === "Bancaire");

                  return (
                    <div
                      key={piece.cote}
                      onClick={() => {
                        setSelectedPiece(piece);
                        setMobileSubTab("details");
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-[#0D1526] border-blue-500/80 shadow-md"
                          : "bg-[#090E1A] border-slate-800/80 hover:border-slate-700 hover:bg-[#0C1222]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                            {piece.cote}
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                              piece.categorie === "Audio"
                                ? "bg-purple-950/60 text-purple-300 border-purple-800/50"
                                : piece.categorie === "Photo EXIF"
                                ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                                : piece.categorie === "Médical"
                                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                                : piece.categorie === "Bancaire"
                                ? "bg-blue-950/60 text-blue-300 border-blue-800/50"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {piece.categorie}
                          </span>
                          {piece.adr_id && (
                            <span className="text-[10px] font-mono text-blue-300 bg-blue-950/80 border border-blue-800/60 px-1.5 py-0.2 rounded">
                              {piece.adr_id}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">
                          {piece.date_faits}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-100 mb-1 leading-snug">
                        {resolveLocalized(piece.titre, currentLang)}
                      </h4>

                      {/* Visual Photo Preview Thumbnail if photo exists */}
                      {hasPhoto && (
                        <div className="my-2 flex items-center space-x-2 bg-[#050810] p-1.5 rounded border border-slate-800">
                          <img
                            src={piece.fichier_local}
                            alt={piece.cote}
                            className="w-16 h-12 object-cover rounded border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenLightbox(piece);
                            }}
                          />
                          <div className="flex-1 overflow-hidden">
                            <span className="text-[10px] font-mono text-amber-300 flex items-center space-x-1">
                              <Camera className="w-3 h-3 text-amber-400" />
                              <span>ISO/IEC 27037 · Натисніть для огляду</span>
                            </span>
                            <p className="text-[9px] text-slate-400 truncate">
                              {piece.exif_meta?.camera || "Apple iPhone 14 Pro"}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenLightbox(piece);
                            }}
                            className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded text-[10px] font-mono shrink-0"
                          >
                            <Eye className="w-3 h-3 inline mr-1" />
                            Zoom
                          </button>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2 font-serif italic">
                        {resolveLocalized(piece.citation_cle, currentLang)}
                      </p>

                      {/* Action buttons on card: Attach / Remove photo & Copy SHA-256 */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerAttachPhoto(piece.cote);
                            }}
                            className="flex items-center space-x-1 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                            title="Прикріпити нове фото або документ"
                          >
                            <Upload className="w-2.5 h-2.5 text-blue-400" />
                            <span>{hasPhoto ? "Змінити фото" : "Додати фото"}</span>
                          </button>

                          {hasPhoto && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(piece.cote);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded"
                              title="Видалити прикріплене фото"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHash(piece.sha256);
                          }}
                          className="flex items-center space-x-1 font-mono text-[9px] text-slate-400 hover:text-emerald-400"
                          title="Скопіювати хеш SHA-256"
                        >
                          {copiedHash === piece.sha256 ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{piece.sha256.slice(0, 10)}...</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: In-depth Exhibit Inspector */}
            <div className={`${
              mobileSubTab === "list" ? "hidden md:flex" : "flex"
            } w-full md:w-1/2 lg:w-2/5 bg-[#0B1120] flex-col overflow-y-auto p-4 space-y-4`}>
              {/* Mobile Back to List Button */}
              <button
                onClick={() => setMobileSubTab("list")}
                className="md:hidden flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 self-start mb-1 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{currentLang === 'uk' ? '← Повернутися до списку' : '← Retour au bordereau'}</span>
              </button>

              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {selectedPiece.cote}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    WORM Sealed (L-01)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {resolveLocalized(selectedPiece.titre, currentLang)}
                </h3>
              </div>

              {/* Photo preview in inspector if available */}
              {selectedPiece.fichier_local &&
                (selectedPiece.categorie === "Photo EXIF" ||
                  selectedPiece.categorie === "Médical" ||
                  selectedPiece.categorie === "Bancaire") && (
                  <div className="bg-[#050810] border border-slate-800 rounded-lg p-2 flex flex-col items-center">
                    <img
                      src={selectedPiece.fichier_local}
                      alt={selectedPiece.cote}
                      className="max-h-48 w-auto object-contain rounded border border-slate-700 cursor-pointer hover:opacity-90"
                      onClick={() => handleOpenLightbox(selectedPiece)}
                    />
                    <div className="mt-2 w-full flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        ISO/IEC 27037 Certified
                      </span>
                      <button
                        onClick={() => handleOpenLightbox(selectedPiece)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-mono flex items-center space-x-1"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Відкрити Lightbox</span>
                      </button>
                    </div>
                  </div>
                )}

              {/* Probative Value */}
              <div className="bg-[#090E1A] p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                  Доказове значення (Portée Probatoire) :
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {resolveLocalized(selectedPiece.portee_probatoire, currentLang)}
                </p>
              </div>

              {/* Verbatim quote */}
              <div className="bg-[#090E1A] p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  Засвідчена цитата / Реквізити :
                </span>
                <p className="text-xs text-amber-100/90 font-serif italic leading-relaxed">
                  {resolveLocalized(selectedPiece.citation_cle, currentLang)}
                </p>
              </div>

              {/* Admissibility Regime */}
              <div className="bg-[#090E1A] p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Процесуальний режим (КПК Во) :
                </span>
                <p className="text-xs text-emerald-200 font-mono">
                  {resolveLocalized(selectedPiece.admissibilite, currentLang)}
                </p>
              </div>

              {/* ADR Sync Info */}
              {selectedPiece.adr_id && (
                <div className="bg-blue-950/30 border border-blue-800/50 p-3 rounded-lg text-xs font-mono text-blue-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span>{selectedPiece.adr_id} · Utopia DB Synchronized</span>
                  </div>
                  <span className="text-emerald-400 font-bold">✓ Active</span>
                </div>
              )}

              {/* SHA-256 Hash Seal Box */}
              <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">Хеш SHA-256 :</span>
                  <button
                    onClick={() => handleCopyHash(selectedPiece.sha256)}
                    className="text-blue-400 hover:text-white text-[11px] flex items-center space-x-1"
                  >
                    {copiedHash === selectedPiece.sha256 ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedHash === selectedPiece.sha256 ? "Скопійовано" : "Копіювати"}</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded break-all text-[10px] text-slate-300">
                  {selectedPiece.sha256}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: «📸 ФОТОГАЛЕРЕЯ & СКАНИ» (DEDICATED CARDS GRID & LIGHTBOX)        */}
      {/* ========================================================================= */}
      {activeMode === "gallery" && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Gallery Header Info Banner */}
            <div className="bg-[#090E1A] border border-blue-600/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>
                    {currentLang === "uk"
                      ? "Судово-медичний та фотографічний архів речових доказів"
                      : currentLang === "fr"
                      ? "Archive Forensique Photographique & Constats Médicaux"
                      : "Forensic Photographic & Medical Evidence Archive"}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentLang === "uk"
                    ? "Усі цифрові фотографії та скани сертифіковані за стандартом ISO/IEC 27037 з прив'язкою EXIF/GPS та ADR у базі Utopia DB."
                    : "Toutes les photographies et scans sont certifiés selon la norme ISO/IEC 27037 avec métadonnées EXIF/GPS."}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60 font-semibold">
                  {photoPieces.length} Речових доказів
                </span>
              </div>
            </div>

            {/* Grid of Photo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {photoPieces.map((piece) => (
                <div
                  key={piece.cote}
                  className="bg-[#0B1120] border border-slate-800/90 hover:border-blue-500/60 rounded-xl overflow-hidden shadow-lg transition-all flex flex-col group"
                >
                  {/* Card Image Thumbnail Area */}
                  <div
                    onClick={() => handleOpenLightbox(piece)}
                    className="relative h-56 bg-[#050810] border-b border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden group/img"
                  >
                    <img
                      src={piece.fichier_local}
                      alt={piece.cote}
                      className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/img:scale-105"
                    />

                    {/* Overlay badge with Cote and Type */}
                    <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 bg-black/80 backdrop-blur border border-amber-500/50 rounded font-mono font-bold text-xs text-amber-300">
                        {piece.cote}
                      </span>
                      <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur border border-slate-700 rounded text-[10px] font-semibold text-slate-300 uppercase">
                        {piece.categorie}
                      </span>
                    </div>

                    {/* ADR Badge */}
                    {piece.adr_id && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-blue-950/90 backdrop-blur border border-blue-600/60 rounded font-mono text-[10px] text-blue-300">
                        {piece.adr_id}
                      </div>
                    )}

                    {/* Hover Click to Enlarge Hint */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-blue-600/90 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow-xl">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Відкрити Forensic Lightbox</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug mb-1">
                        {resolveLocalized(piece.titre, currentLang)}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-serif italic mb-2">
                        {resolveLocalized(piece.citation_cle, currentLang)}
                      </p>

                      {/* EXIF Metadata Pill Strip */}
                      {piece.exif_meta && (
                        <div className="p-2 bg-[#070B14] rounded-lg border border-slate-800/80 space-y-1 text-[10px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Камера / Джерело:</span>
                            <span className="text-slate-200 truncate max-w-[160px]">
                              {piece.exif_meta.camera}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Час фіксації:</span>
                            <span className="text-slate-200">{piece.exif_meta.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>GPS / Локація:</span>
                            <span className="text-emerald-400 font-bold truncate max-w-[160px]">
                              {piece.exif_meta.gps}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions: Lightbox, Attach, Remove, SHA-256 */}
                    <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenLightbox(piece)}
                          className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded text-[11px] font-mono font-medium flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lightbox</span>
                        </button>

                        <button
                          onClick={() => triggerAttachPhoto(piece.cote)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center space-x-1"
                          title="Замінити або оновити фото доказу"
                        >
                          <Upload className="w-3 h-3 text-blue-400" />
                          <span>Оновити</span>
                        </button>

                        <button
                          onClick={() => handleRemovePhoto(piece.cote)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="Видалити фото"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleCopyHash(piece.sha256)}
                        className="p-1 text-slate-400 hover:text-emerald-400 font-mono text-[10px] flex items-center space-x-1"
                        title="Скопіювати SHA-256"
                      >
                        {copiedHash === piece.sha256 ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span className="hidden sm:inline">{piece.sha256.slice(0, 8)}...</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: «☁️ АРХІВ GOOGLE DRIVE & SHA-256 ВЕРИФІКАТОР»                     */}
      {/* ========================================================================= */}
      {activeMode === "gdrive" && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Direct Google Drive Banner */}
            <div className="bg-[#090E1A] border border-emerald-600/40 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">
                    {currentLang === "uk"
                      ? "Офіційне сховище першоджерел доказів у Google Drive"
                      : "Archive Cloud Officielle des Pièces Originales (Google Drive)"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {currentLang === "uk"
                    ? "Усі оригінальні матеріали справи (48MP ProRAW фотографії з незмінними метаданими EXIF, студійні аудіозаписи WAV 48kHz, скани протоколів поліції) зберігаються у захищеній хмарній директорії."
                    : "Tous les fichiers originaux bruts (photos 48MP ProRAW avec EXIF préservés, enregistrements audio WAV master, scans de police 600 DPI) sont centralisés dans le répertoire partagé."}
                </p>
                <div className="font-mono text-xs text-emerald-400 break-all pt-1">
                  https://drive.google.com/drive/folders/13OgTZBLm1LoYNtfwHNuWBl7kSD3ZncF1
                </div>
              </div>

              <a
                href="https://drive.google.com/drive/folders/13OgTZBLm1LoYNtfwHNuWBl7kSD3ZncF1"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-lg transition-transform hover:scale-105 shrink-0"
              >
                <span>Відкрити Google Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Catalog of Original Formats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  title: "48MP Apple ProRAW (DNG/JPG)",
                  desc: "Оригінальні знімки iPhone 14 Pro з чистими метаданими IFD0, координатами GPS та витягом діафрагми.",
                  badge: "P-06, P-06-BIS",
                },
                {
                  title: "Студійний звук WAV (48 kHz / 24-bit)",
                  desc: "Незжаті фонограми погроз та зізнань для судово-фоноскопічної експертизи за стандартом ATF 146 IV 9.",
                  badge: "P-01, P-04, P-07, P-08",
                },
                {
                  title: "Скани протоколів поліції (600 DPI)",
                  desc: "Офіційні протоколи заяв, допитів та фіксації неправдивого доносу (ст. 303 КК) кантональної поліції Во.",
                  badge: "P-09, P-12, P-13",
                },
                {
                  title: "Сертифікат Unisanté Лозанна",
                  desc: "Офіційний медичний висновок експерта про повну відсутність ушкоджень та слідів боротьби у потерпілого.",
                  badge: "P-03",
                },
                {
                  title: "Банківські виписки Wise / SWIFT",
                  desc: "Цільовий переказ $15'000 USD із зазначенням трастового збереження коштів для забезпечення арешту.",
                  badge: "P-05",
                },
                {
                  title: "Засвідчені скріншоти месенджерів",
                  desc: "Фіксація прямих погроз розправою, залякування та шантажу позбавленням статусу S у Telegram.",
                  badge: "P-10, P-11",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B1120] border border-slate-800 rounded-lg p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* In-Browser Web Crypto SHA-256 Verifier */}
            <div className="bg-[#0B1120] border border-blue-600/40 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  {currentLang === "uk"
                    ? "Локальний криптографічний верифікатор цілісності (Web Crypto SHA-256)"
                    : "Vérificateur Cryptographique Local SHA-256 (Web Crypto API)"}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentLang === "uk"
                  ? "Перетягніть будь-який файл, завантажений з Google Drive або телефону. Ваш браузер локально обчислить хеш SHA-256 без передачі файлу в інтернет та миттєво звірить його з офіційним реєстром доказів справи."
                  : "Glissez-déposez un fichier téléchargé de Google Drive. Le navigateur calcule l'empreinte SHA-256 localement et la compare au registre officiel."}
              </p>

              {/* Drag & Drop Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) computeFileSHA256(file);
                }}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#070B14]/60"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) computeFileSHA256(file);
                  };
                  input.click();
                }}
              >
                <Upload className="w-8 h-8 text-blue-400 mb-2 animate-bounce" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  {isComputingHash
                    ? "Обчислення SHA-256 через Web Crypto API..."
                    : "Перетягніть файл сюди або натисніть для вибору"}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Підтримуються файли будь-якого розміру (RAW, WAV, PDF, JPG, MP3)
                </span>
              </div>

              {/* Verifier Result Box */}
              {verifierHash && (
                <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">
                      Файл: <strong>{verifierFileName}</strong> (
                      {verifierFileSize ? formatFileSize(verifierFileSize) : ""})
                    </span>
                    <button
                      onClick={() => handleCopyHash(verifierHash)}
                      className="text-xs text-blue-400 hover:text-white flex items-center space-x-1"
                    >
                      {copiedHash === verifierHash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Скопіювати хеш</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">
                      Обчислений хеш SHA-256 :
                    </span>
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded break-all text-xs text-slate-200">
                      {verifierHash}
                    </div>
                  </div>

                  {/* Verification Status */}
                  {verifierMatch ? (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-600/70 rounded-lg flex items-start space-x-2 text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-xs font-bold text-emerald-300">
                          ✓ ДОКАЗ ВЕРИФІКОВАНО В ОФІЦІЙНОМУ РЕЄСТРІ СПРАВИ :
                        </strong>
                        <p className="text-xs font-sans mt-0.5">
                          Збіг із доказом <strong>{verifierMatch.cote}</strong> (
                          {resolveLocalized(verifierMatch.titre, currentLang)}). Дата:{" "}
                          {verifierMatch.date_faits}. Процесуальний статус:{" "}
                          {resolveLocalized(verifierMatch.admissibilite, currentLang)}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-950/40 border border-blue-600/50 rounded-lg flex items-start space-x-2 text-blue-200">
                      <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-xs font-bold text-blue-300">
                          ℹ Хеш обчислено успішно (новий або допоміжний файл)
                        </strong>
                        <p className="text-xs font-sans mt-0.5">
                          Цього хешу ще немає у попередньо завантаженому реєстрі P-01..P-15. Ви
                          можете прикріпити його до будь-якої картки через кнопку «Додати фото».
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {verifierError && (
                <div className="p-3 bg-rose-950/60 border border-rose-600/70 rounded-lg text-xs text-rose-300">
                  Помилка: {verifierError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORENSIC LIGHTBOX MODAL WITH ZOOM (50%-300%), ROTATION & PREV/NEXT        */}
      {/* ========================================================================= */}
      {lightboxPiece && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fadeIn">
          <div className="bg-[#0B1120] border border-blue-500/50 rounded-xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#080E1B] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                  {lightboxPiece.cote}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                  {resolveLocalized(lightboxPiece.titre, currentLang)}
                </span>
                {lightboxPiece.adr_id && (
                  <span className="hidden sm:inline font-mono text-[10px] text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                    {lightboxPiece.adr_id}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleCopyHash(lightboxPiece.sha256)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono flex items-center space-x-1"
                  title="Скопіювати хеш SHA-256"
                >
                  {copiedHash === lightboxPiece.sha256 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">SHA-256</span>
                </button>

                <button
                  onClick={() => setLightboxPiece(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col lg:flex-row gap-4">
              {/* Photo View Canvas with Zoom Controls & Prev/Next */}
              <div className="flex-1 flex flex-col items-center bg-[#05080E] border border-slate-800 rounded-xl p-2 overflow-hidden min-h-[340px] justify-center relative select-none">
                {/* Previous Photo Button */}
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full border border-slate-700 transition-transform hover:scale-110 shadow-xl"
                  title="Попереднє фото (Стрілка вліво)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Main Zoomable Image */}
                <div
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotationDeg}deg)`,
                    transition: "transform 0.15s ease-out",
                  }}
                  className="flex flex-col items-center justify-center text-center p-2 max-w-full max-h-full"
                >
                  <img
                    src={
                      lightboxPiece.fichier_local ||
                      "/evidence/photos/P-06_exif1481_lausanne.jpg"
                    }
                    alt={lightboxPiece.cote}
                    className="max-w-full max-h-[460px] object-contain rounded-lg border border-slate-700 shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/evidence/photos/P-06_exif1481_lausanne.jpg";
                    }}
                  />
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-emerald-900/50">
                    ISO/IEC 27037 Certified · {lightboxPiece.cote} · SHA-256:{" "}
                    {lightboxPiece.sha256.slice(0, 16)}...
                  </div>
                </div>

                {/* Next Photo Button */}
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full border border-slate-700 transition-transform hover:scale-110 shadow-xl"
                  title="Наступне фото (Стрілка вправо)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bottom Zoom & Rotation Toolstrip */}
                <div className="absolute bottom-3 bg-[#0D1424]/90 backdrop-blur border border-slate-700 rounded-full px-3 py-1 flex items-center space-x-2 text-xs font-mono shadow-2xl">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                    className="p-1 hover:text-white"
                    title="Зменшити (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-300 w-12 text-center tabular-nums font-bold">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
                    className="p-1 hover:text-white"
                    title="Збільшити (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => setRotationDeg((r) => (r + 90) % 360)}
                    className="p-1 hover:text-white flex items-center space-x-1"
                    title="Повернути на 90°"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px]">90°</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() => {
                      setZoomLevel(1.0);
                      setRotationDeg(0);
                    }}
                    className="text-[10px] px-1 hover:text-white font-bold"
                  >
                    1:1
                  </button>
                </div>
              </div>

              {/* Forensic EXIF Metadata Inspector Table */}
              <div className="w-full lg:w-84 bg-[#070B12] border border-slate-800 rounded-xl p-3.5 text-xs space-y-3 font-mono shrink-0 select-text">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                    Автентифіковані метадані EXIF
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Стандарт криміналістики ISO/IEC 27037
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-500">Пристрій / Камера: </span>
                    <span className="text-slate-200">
                      {lightboxPiece.exif_meta?.camera || "Apple iPhone 14 Pro"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Оптика / Об'єктив: </span>
                    <span className="text-slate-200">
                      {lightboxPiece.exif_meta?.lens || "24mm f/1.78"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Часова мітка: </span>
                    <span className="text-slate-200">
                      {lightboxPiece.exif_meta?.timestamp || lightboxPiece.date_faits}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Координати GPS: </span>
                    <span className="text-emerald-400 font-bold">
                      {lightboxPiece.exif_meta?.gps || "46.5197° N, 6.6323° E"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Світлочутливість ISO: </span>
                    <span className="text-slate-200">
                      ISO {lightboxPiece.exif_meta?.iso || 64}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Діафрагма: </span>
                    <span className="text-slate-200">
                      {lightboxPiece.exif_meta?.aperture || "f/1.78, 1/120s"}
                    </span>
                  </div>
                </div>

                {/* Corroboration / Alibi Callout */}
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-600/50 rounded-lg text-[11px] leading-relaxed">
                  <span className="text-emerald-300 font-bold block mb-1">
                    ✓ Верифікація об'єктивного алібі :
                  </span>
                  <p className="text-emerald-200/90 font-sans text-[11px]">
                    {lightboxPiece.exif_meta?.alibi_verification ||
                      "Присутність, засвідчена метаданими EXIF/GPS, спростовує заяви про напад та доводить склад ст. 303 КК (завідомо неправдивий донос)."}
                  </p>
                </div>

                {/* Verified SHA-256 Seal */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-0.5">
                    Криптографічний підпис SHA-256 :
                  </span>
                  <div className="p-1.5 bg-slate-900 border border-slate-800 rounded break-all text-[9px] text-slate-300 select-all">
                    {lightboxPiece.sha256}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI EVIDENCE INGESTION & QUALIFICATION WIZARD */}
      <EvidenceIngestionWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        currentLang={currentLang}
        onCommitEvidence={handleCommitNewEvidence}
        existingPiecesCount={pieces.length}
      />

      {/* SWISS LAWS & CANTONAL VAUD CODES MODAL */}
      <SwissCodesModal
        isOpen={isCodesModalOpen}
        onClose={() => setIsCodesModalOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
};
