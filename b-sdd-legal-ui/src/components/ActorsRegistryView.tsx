import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Scale,
  FileText,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Award,
  Clock,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  DollarSign,
  Layers,
  ChevronRight,
  Eye,
  Info,
  RotateCcw,
  Download,
  X,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import {
  ActorItem,
  ActorPhoto,
  ActorDocument,
  resolveLocalized,
  resolveLocalizedArray,
  BORDEREAU_PIECES,
  CHARGES,
} from "../data/legalData";
import {
  ProceduralRoleKey,
  PROCEDURAL_ROLES_METADATA,
  calculateActorImpact,
  ActorImpactAnalysis,
  saveCaseActors,
  resetCaseActorsToDefault,
} from "../lib/actorsManager";
import { commitAtomicSupersession } from "../lib/wormLedger";

interface ActorsRegistryViewProps {
  currentLang: SupportedLanguage;
  actors: ActorItem[];
  onActorsChange: (updated: ActorItem[]) => void;
  onOpenAiWizard: () => void;
  onShowToast: (title: string, description: string, type?: "success" | "info") => void;
}

export const ActorsRegistryView: React.FC<ActorsRegistryViewProps> = ({
  currentLang,
  actors,
  onActorsChange,
  onOpenAiWizard,
  onShowToast,
}) => {
  // Selected Actor for the right pane dossier
  const [selectedActorId, setSelectedActorId] = useState<string>(() => actors[0]?.id || "");
  const selectedActor = useMemo(() => {
    return actors.find((a) => a.id === selectedActorId) || actors[0];
  }, [actors, selectedActorId]);

  // Active Tab inside the selected actor dossier
  const [activeDossierTab, setActiveDossierTab] = useState<
    "status" | "photos_docs" | "evidence" | "sequestration" | "impact"
  >("status");

  // Filter & Search state
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<ActorPhoto | null>(null);

  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("Scan de pièce d'identité");

  // Deletion impact warning modal
  const [deleteConfirmActor, setDeleteConfirmActor] = useState<ActorItem | null>(null);
  const [deleteImpact, setDeleteImpact] = useState<ActorImpactAnalysis | null>(null);

  // Filtered actors list
  const filteredActors = useMemo(() => {
    return actors.filter((actor) => {
      // Role filter
      if (filterRole !== "all") {
        if (filterRole === "accused" && !["prevenu_principal", "prevenu_complice"].includes(actor.procedural_standing || "")) {
          return false;
        }
        if (filterRole === "victim" && actor.procedural_standing !== "victime_plaignante") {
          return false;
        }
        if (filterRole === "immune" && !actor.protected_bona_fide) {
          return false;
        }
        if (filterRole === "witness" && !["temoin", "personne_renseignement"].includes(actor.procedural_standing || "")) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = actor.name.toLowerCase().includes(q);
        const refMatch = actor.legal_reference.toLowerCase().includes(q);
        const statusMatch = resolveLocalized(actor.status, currentLang).toLowerCase().includes(q);
        const roleMatch = resolveLocalized(actor.role, currentLang).toLowerCase().includes(q);
        if (!nameMatch && !refMatch && !statusMatch && !roleMatch) {
          return false;
        }
      }

      return true;
    });
  }, [actors, filterRole, searchQuery, currentLang]);

  // Statistics
  const stats = useMemo(() => {
    const total = actors.length;
    const accused = actors.filter((a) =>
      ["prevenu_principal", "prevenu_complice"].includes(a.procedural_standing || "")
    ).length;
    const victims = actors.filter((a) => a.procedural_standing === "victime_plaignante").length;
    const immune = actors.filter((a) => a.protected_bona_fide).length;
    const totalClaims = actors.reduce((acc, a) => acc + (a.financial_claim_chf || 0), 0);
    return { total, accused, victims, immune, totalClaims };
  }, [actors]);

  // Handle Remove Actor with Invariant & Impact Check
  const initiateDeleteActor = (actor: ActorItem) => {
    const impactAnalysis = calculateActorImpact("remove", actor, actors);
    setDeleteImpact(impactAnalysis);
    setDeleteConfirmActor(actor);
  };

  const confirmDeleteActor = () => {
    if (!deleteConfirmActor) return;

    if (deleteImpact?.blockedByInvariant) {
      onShowToast(
        currentLang === "uk" ? "Дія заблокована архітектурним інваріантом" : "Action Bloquée par Invariant",
        deleteImpact.blockingMessage || "Invariant enforcement",
        "info"
      );
      setDeleteConfirmActor(null);
      setDeleteImpact(null);
      return;
    }

    const updated = actors.filter((a) => a.id !== deleteConfirmActor.id);
    onActorsChange(updated);
    saveCaseActors(updated);

    if (selectedActorId === deleteConfirmActor.id && updated.length > 0) {
      setSelectedActorId(updated[0].id);
    }

    onShowToast(
      currentLang === "uk" ? "Фігуранта вилучено зі справи" : "Partie retirée du dossier",
      `${deleteConfirmActor.name} (${deleteConfirmActor.legal_reference})`
    );

    setDeleteConfirmActor(null);
    setDeleteImpact(null);
  };

  // Add Document to selected actor
  const handleAddDocumentToSelectedActor = () => {
    if (!selectedActor || !newDocTitle.trim()) return;

    const newDoc: ActorDocument = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      title: {
        uk: newDocTitle.trim(),
        fr: newDocTitle.trim(),
        en: newDocTitle.trim(),
      },
      type: newDocType,
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      date: new Date().toLocaleDateString("fr-CH"),
      verified: true,
    };

    const updatedActors = actors.map((a) => {
      if (a.id === selectedActor.id) {
        return {
          ...a,
          documents: [...(a.documents || []), newDoc],
        };
      }
      return a;
    });

    onActorsChange(updatedActors);
    saveCaseActors(updatedActors);
    setAddDocModalOpen(false);
    setNewDocTitle("");
    onShowToast(
      currentLang === "uk" ? "Документ додано до досьє" : "Document incorporé au dossier",
      `${newDocTitle} (${newDocType})`
    );
  };

  // Reset to canonical benchmark
  const handleResetToBenchmark = () => {
    if (confirm(currentLang === "uk" ? "Скинути реєстр учасників до початкового еталону справи PE24.014624-SBA?" : "Réinitialiser le registre aux 4 acteurs canoniques ?")) {
      const canonical = resetCaseActorsToDefault();
      onActorsChange(canonical);
      setSelectedActorId(canonical[0].id);
      onShowToast(
        currentLang === "uk" ? "Реєстр скинуто" : "Registre réinitialisé",
        "4 parties canoniques rétablies selon Invariants L-01..L-03"
      );
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#070B12] text-slate-100 overflow-hidden select-text">
      {/* 1. CANTON DE VAUD JUDICIAL HEADER */}
      <div className="bg-[#090E1A] border-b border-slate-800/80 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
              Ministère public du Canton de Vaud
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Arrondissement de Lausanne · Dossier PE24.014624-SBA
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mt-0.5">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span>
              {currentLang === "uk"
                ? "Реєстр дійових осіб & Процесуальних статусів (КПК Во)"
                : "Registre Officiel des Parties & Statuts Procéduraux (CPP)"}
            </span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenAiWizard}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold font-mono shadow-md shadow-blue-600/30 transition-all"
            title="Майстер автоматичної ШІ-кваліфікації особи за нормами КПК"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentLang === "uk" ? "+ Фігурант (ШІ)" : "+ Partie (IA)"}</span>
          </button>

          <button
            onClick={handleResetToBenchmark}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 text-xs transition-colors"
            title="Скинути реєстр до канонічного еталону справи"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. STATISTICAL SUMMARY CHIPS BAR */}
      <div className="bg-[#050810] border-b border-slate-800/80 px-4 py-2 flex items-center justify-between overflow-x-auto gap-3 text-xs font-mono shrink-0">
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Всього фігурантів:</span>
            <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
              {stats.total}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-rose-400">Обвинувачені (Prévenus):</span>
            <span className="font-bold text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded text-[11px] border border-rose-800/60">
              {stats.accused}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-emerald-400">Потерпілий (Plaignant):</span>
            <span className="font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded text-[11px] border border-emerald-800/60">
              {stats.victims}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-amber-400">Добросовісні (L-03):</span>
            <span className="font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded text-[11px] border border-amber-800/60">
              {stats.immune}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-slate-400">Вимоги цивільного позову (ст. 122 КПК):</span>
          <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/80">
            CHF {stats.totalClaims.toLocaleString("fr-CH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 3. TWO-COLUMN WORKBENCH: LEFT LIST (38%) & RIGHT DOSSIER (62%) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT COLUMN: FILTER & ACTOR CARDS LIST */}
        <div className="w-full lg:w-[38%] border-r border-slate-800/80 flex flex-col bg-[#070B12] overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-2.5 bg-[#090E1A] border-b border-slate-800 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={currentLang === "uk" ? "Пошук фігуранта, статті, ролі..." : "Rechercher une partie, article..."}
                className="w-full bg-[#050810] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* Quick Category Filters */}
            <div className="flex items-center space-x-1 overflow-x-auto text-[10px] font-mono scrollbar-none">
              {[
                { id: "all", label: currentLang === "uk" ? "Всі" : "Tous" },
                { id: "accused", label: currentLang === "uk" ? "Обвинувачені" : "Prévenus" },
                { id: "victim", label: currentLang === "uk" ? "Потерпілий" : "Plaignant" },
                { id: "immune", label: currentLang === "uk" ? "Щит L-03" : "Tiers L-03" },
                { id: "witness", label: currentLang === "uk" ? "Свідки" : "Témoins" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterRole(f.id)}
                  className={`px-2 py-1 rounded transition-colors shrink-0 ${
                    filterRole === f.id
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actor Cards Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredActors.map((actor) => {
              const isSelected = selectedActor?.id === actor.id;
              const roleMeta =
                PROCEDURAL_ROLES_METADATA[actor.procedural_standing as ProceduralRoleKey] ||
                PROCEDURAL_ROLES_METADATA.temoin;

              return (
                <div
                  key={actor.id}
                  onClick={() => setSelectedActorId(actor.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? "bg-[#0E172A] border-blue-500 shadow-md shadow-blue-900/20"
                      : "bg-[#090E1A] hover:bg-slate-900 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-xs font-bold text-white truncate font-sans">
                          {actor.name}
                        </span>
                        {actor.age && (
                          <span className="text-[10px] font-mono text-emerald-400">
                            ({actor.age} {currentLang === "uk" ? "р." : "ans"})
                          </span>
                        )}
                        {actor.protected_bona_fide && (
                          <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-300 border border-amber-500/60 rounded text-[9px] font-mono font-bold flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5 text-amber-400" />
                            <span>L-03</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-blue-400 mt-0.5 truncate">
                        {actor.legal_reference}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${actor.badgeColor}`}
                    >
                      {actor.status[currentLang] || actor.status.fr}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2 mb-2">
                    {resolveLocalized(actor.role, currentLang)}
                  </p>

                  {/* Badges footer */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      {actor.photos && actor.photos.length > 0 && (
                        <span className="flex items-center space-x-0.5 text-amber-400">
                          <Camera className="w-3 h-3" />
                          <span>{actor.photos.length}</span>
                        </span>
                      )}
                      {actor.documents && actor.documents.length > 0 && (
                        <span className="flex items-center space-x-0.5 text-blue-400">
                          <FileText className="w-3 h-3" />
                          <span>{actor.documents.length}</span>
                        </span>
                      )}
                      {actor.linked_pieces && actor.linked_pieces.length > 0 && (
                        <span className="flex items-center space-x-0.5 text-slate-400">
                          <Layers className="w-3 h-3" />
                          <span>{actor.linked_pieces.length} доказів</span>
                        </span>
                      )}
                    </div>

                    {actor.financial_claim_chf ? (
                      <span className="text-emerald-400 font-bold">
                        CHF {actor.financial_claim_chf.toLocaleString("fr-CH")}
                      </span>
                    ) : actor.financial_liability_chf ? (
                      <span className="text-rose-400 font-bold">
                        -CHF {actor.financial_liability_chf.toLocaleString("fr-CH")}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {filteredActors.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                {currentLang === "uk" ? "Фігурантів за фільтром не знайдено." : "Aucune partie trouvée pour ce filtre."}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: FULL JUDICIAL DOSSIER VIEW */}
        <div className="hidden lg:flex flex-1 flex-col bg-[#080C16] overflow-hidden">
          {selectedActor ? (
            <div className="h-full flex flex-col overflow-hidden">
              {/* DOSSIER HEADER PROFILE CARD */}
              <div className="bg-[#090E1A] border-b border-slate-800 p-4 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    {/* Biometric portrait or avatar */}
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center relative shrink-0 shadow-lg">
                      {selectedActor.photos && selectedActor.photos.length > 0 ? (
                        <img
                          src={selectedActor.photos[0].url}
                          alt={selectedActor.name}
                          className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => {
                            setActivePhoto(selectedActor.photos![0]);
                            setPhotoViewerOpen(true);
                          }}
                        />
                      ) : (
                        <Users className="w-7 h-7 text-slate-500" />
                      )}
                      {selectedActor.protected_bona_fide && (
                        <div className="absolute top-1 right-1 p-0.5 bg-amber-500 rounded-full text-slate-950">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-white font-sans">
                          {selectedActor.name}
                        </h2>
                        {selectedActor.discernment_capacity && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            Majeur capable
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 mt-1">
                        {selectedActor.birthdate && (
                          <span>Нар. {selectedActor.birthdate} ({selectedActor.age} р.)</span>
                        )}
                        {selectedActor.nationality && (
                          <span>· {resolveLocalized(selectedActor.nationality, currentLang)}</span>
                        )}
                        {selectedActor.domicile && (
                          <span>· {resolveLocalized(selectedActor.domicile, currentLang)}</span>
                        )}
                      </div>

                      {selectedActor.lawyer && (
                        <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center space-x-1">
                          <Scale className="w-3 h-3 text-emerald-400" />
                          <span>Conseil constitué : {selectedActor.lawyer.name} ({selectedActor.lawyer.bar})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Delete Button */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setAddDocModalOpen(true)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1 border border-slate-700"
                      title="Додати офіційний скан чи документ до досьє"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>{currentLang === "uk" ? "+ Скан/Документ" : "+ Scan"}</span>
                    </button>

                    <button
                      onClick={() => initiateDeleteActor(selectedActor)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800/60 text-xs transition-colors"
                      title="Вилучити фігуранта (з аналізом впливу та перевіркою інваріантів)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DOSSIER SUB-TABS */}
                <div className="flex items-center space-x-1 mt-4 border-t border-slate-800/80 pt-2 text-xs font-mono">
                  {[
                    { id: "status", label: currentLang === "uk" ? "⚖️ Статус & Права КПК" : "⚖️ Statut & Droits CPP" },
                    {
                      id: "photos_docs",
                      label: `${currentLang === "uk" ? "📷 Фото & Скани" : "📷 Photos & Scans"} (${
                        (selectedActor.photos?.length || 0) + (selectedActor.documents?.length || 0)
                      })`,
                    },
                    {
                      id: "evidence",
                      label: `${currentLang === "uk" ? "📁 Речові докази" : "📁 Pièces liées"} (${
                        selectedActor.linked_pieces?.length || 0
                      })`,
                    },
                    {
                      id: "sequestration",
                      label: currentLang === "uk" ? "💰 Секвестр ст. 263 КПК" : "💰 Séquestre Art. 263 CPP",
                    },
                    {
                      id: "impact",
                      label: currentLang === "uk" ? "⚡ Матриця впливу" : "⚡ Impact Dossier",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDossierTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeDossierTab === tab.id
                          ? "bg-blue-600 text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DOSSIER BODY PER TAB */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ========================================================================= */}
                {/* TAB 1: PROCEDURAL STATUS & SWISS RIGHTS                                   */}
                {/* ========================================================================= */}
                {activeDossierTab === "status" && (
                  <div className="space-y-4">
                    {/* Status & Shield Card */}
                    <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Scale className="w-4 h-4 text-amber-400" />
                          <h3 className="text-xs font-bold text-white font-mono uppercase">
                            Офіційна кваліфікація прокуратури (RS 312.0)
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          {selectedActor.legal_reference}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {resolveLocalized(selectedActor.role, currentLang)}
                      </p>

                      {selectedActor.protected_bona_fide && (
                        <div className="p-3 bg-amber-950/40 border border-amber-500/60 rounded-xl space-y-1.5 shadow-[0_0_12px_rgba(212,175,55,0.15)]">
                          <div className="flex items-center space-x-1.5 text-amber-300 font-mono text-xs font-bold">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>ІНВАРІАНТ L-03 · САНКТУАРИЗОВАНИЙ ЩИТ СТ. 933 ЦИВІЛЬНОГО КОДЕКСУ</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-sans">
                            {selectedActor.name} має абсолютний матеріальний та процесуальний захист добросовісного набувача та волонтера. Будь-які спроби пред явлення цивільних чи кримінальних вимог блокуються архітектурно згідно з принципом nemo plus iuris.
                          </p>
                          {selectedActor.forbidden_actions && (
                            <div className="pt-1 text-[10px] font-mono text-amber-200/90 space-y-0.5">
                              {selectedActor.forbidden_actions.map((act, idx) => (
                                <div key={idx}>🚫 {act}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Procedural Rights List under Swiss CPP */}
                    <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Процесуальні гарантії та права за КПК Швейцарії :</span>
                      </h4>

                      <div className="space-y-1.5">
                        {resolveLocalizedArray(selectedActor.droits_proceduraux, currentLang).map((right, idx) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-2 text-xs text-slate-300 font-sans p-2 rounded bg-[#050810] border border-slate-800/80"
                          >
                            <span className="text-emerald-400 font-bold mt-0.5">§</span>
                            <span>{right}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bitemporal Calibration Snapshot */}
                    <div className="p-3 bg-[#050810] rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Бітемпоральна фіксація ($T_v$ Valid Time vs $T_t$ Transaction Time) :</span>
                        </span>
                        <span className="text-emerald-400">Invariant L-01 WORM</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Valid From: {selectedActor.bitemporal_valid_from || "2024-07-23T10:00:00Z"} | Dossier: PE24.014624-SBA
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: PHOTOS & DOCUMENT SCANS                                            */}
                {/* ========================================================================= */}
                {activeDossierTab === "photos_docs" && (
                  <div className="space-y-4">
                    {/* Photos Section */}
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono flex items-center space-x-1.5 mb-2.5">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Фотогалерея та судово-медичні фіксації :</span>
                      </h4>

                      {selectedActor.photos && selectedActor.photos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedActor.photos.map((photo, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setActivePhoto(photo);
                                setPhotoViewerOpen(true);
                              }}
                              className="group relative rounded-xl border border-slate-800 overflow-hidden bg-slate-900 cursor-pointer aspect-video hover:border-blue-500 transition-all shadow-md"
                            >
                              <img
                                src={photo.url}
                                alt="Preuve"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                <span className="text-[10px] text-slate-200 font-sans line-clamp-1">
                                  {resolveLocalized(photo.caption, currentLang)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 text-center text-xs text-slate-500 font-mono">
                          Фотографій не додано.
                        </div>
                      )}
                    </div>

                    {/* Official Document Scans Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span>Офіційні скани документів та процесуальні акти :</span>
                        </h4>

                        <button
                          onClick={() => setAddDocModalOpen(true)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-mono flex items-center space-x-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>+ Додати скан</span>
                        </button>
                      </div>

                      {selectedActor.documents && selectedActor.documents.length > 0 ? (
                        <div className="space-y-2">
                          {selectedActor.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3 bg-[#090E1A] rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="p-2 bg-blue-950/60 border border-blue-800/60 rounded-lg text-blue-400 shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-white truncate">
                                    {resolveLocalized(doc.title, currentLang)}
                                  </h5>
                                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-0.5">
                                    <span>{doc.type}</span>
                                    <span>· {doc.date}</span>
                                    <span className="text-emerald-400">● Vérifié SHA-256</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1 border border-slate-700"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Переглянути</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 text-center text-xs text-slate-500 font-mono">
                          Документів не прикріплено.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: LINKED EVIDENCE PIECES (P-01 TO P-15)                              */}
                {/* ========================================================================= */}
                {activeDossierTab === "evidence" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>Речові докази, пов язані з даною особою :</span>
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedActor.linked_pieces?.length || 0} cotes au bordereau
                      </span>
                    </div>

                    <div className="space-y-2">
                      {BORDEREAU_PIECES.filter((p) =>
                        selectedActor.linked_pieces?.includes(p.cote)
                      ).map((piece) => (
                        <div
                          key={piece.cote}
                          className="p-3 bg-[#090E1A] rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                {piece.cote}
                              </span>
                              <span className="text-xs font-bold text-slate-100">
                                {resolveLocalized(piece.titre, currentLang)}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">
                              {piece.date_faits}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 font-serif italic mb-1.5">
                            {resolveLocalized(piece.citation_cle, currentLang)}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                            <span>Допустимість: {resolveLocalized(piece.admissibilite, currentLang)}</span>
                            <span className="text-emerald-400">{resolveLocalized(piece.portee_probatoire, currentLang)}</span>
                          </div>
                        </div>
                      ))}

                      {(!selectedActor.linked_pieces || selectedActor.linked_pieces.length === 0) && (
                        <div className="p-6 bg-[#090E1A] rounded-xl border border-slate-800 text-center text-xs text-slate-500 font-mono">
                          Прямих речових доказів за реєстром не закріплено.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: FINANCIAL CLAIMS & ASSET SEQUESTRATION                              */}
                {/* ========================================================================= */}
                {activeDossierTab === "sequestration" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase">
                            Претензії цивільного позову &amp; Арешт активів (ст. 122, 263 КПК)
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {selectedActor.financial_claim_chf
                            ? `CHF ${selectedActor.financial_claim_chf.toLocaleString("fr-CH")}`
                            : selectedActor.financial_liability_chf
                            ? `Відповідальність: CHF ${selectedActor.financial_liability_chf.toLocaleString("fr-CH")}`
                            : "CHF 0.00"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="p-3 bg-[#050810] rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Привласнені кошти (P-05):</span>
                          <span className="text-emerald-300 font-bold text-sm">$15'000 USD (CHF 15'000)</span>
                        </div>

                        <div className="p-3 bg-[#050810] rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Збитки замка Renens (P-10):</span>
                          <span className="text-emerald-300 font-bold text-sm">CHF 850.00</span>
                        </div>

                        <div className="p-3 bg-[#050810] rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Моральна шкода (ст. 49 CO):</span>
                          <span className="text-emerald-300 font-bold text-sm">CHF 31'000.00</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed font-sans">
                        У разі постановлення обвинувального вироку або на стадії досудового слідства за ст. 263 КПК накладається арешт на банківські рахунки обвинувачених у банках Wise Europe SA та UBS Switzerland AG до винесення остаточного судового рішення.
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 5: IMPACT ANALYSIS & INVARIANT VALIDATION                             */}
                {/* ========================================================================= */}
                {activeDossierTab === "impact" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#090E1A] rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <Scale className="w-5 h-5 text-blue-400" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase">
                            Оцінка системного впливу на провадження PE24.014624-SBA
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-emerald-400">
                          B-SDD Architectural Integrity
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-[#050810] rounded-lg border border-slate-800 space-y-1">
                          <strong className="text-slate-200 block font-mono text-[11px]">
                            Вплив на кримінальні статті (Art. 146, 180, 181, 186, 303 CP):
                          </strong>
                          <p className="text-slate-400 font-sans">
                            {selectedActor.procedural_standing === "prevenu_principal"
                              ? "Ключовий фігурант, на якого покладено 5 окремих складів кримінальних злочинів. Зміна статусу призведе до перегляду всього обвинувального акта."
                              : selectedActor.protected_bona_fide
                              ? "Повна автономія та імунітет. Не впливає на обвинувальний статус основних фігурантів."
                              : "Підтримує доказову силу показів потерпілої сторони."}
                          </p>
                        </div>

                        <div className="p-3 bg-[#050810] rounded-lg border border-slate-800 space-y-1">
                          <strong className="text-slate-200 block font-mono text-[11px]">
                            Статус архітектурних інваріантів:
                          </strong>
                          <div className="flex items-center space-x-2 text-emerald-400 font-mono">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>L-01 (WORM Ledger) · L-02 (Pure Standard Lib) · L-03 (Bouclier Milli)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              Оберіть дійову особу зі списку ліворуч для перегляду судового досьє.
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL: PHOTO & EXIF VIEWER */}
      {photoViewerOpen && activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1120] border border-blue-600/50 rounded-2xl max-w-3xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Судово-медична фіксація / Скан документа</span>
              </h3>
              <button onClick={() => setPhotoViewerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center bg-black/60 rounded-xl overflow-hidden">
              <img src={activePhoto.url} alt="Photo" className="max-h-[58vh] max-w-full object-contain" />
            </div>

            <div className="p-3 bg-[#070B12] rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <p className="text-slate-200 font-sans font-medium">
                {resolveLocalized(activePhoto.caption, currentLang)}
              </p>
              {activePhoto.timestamp && (
                <div className="text-[10px] text-slate-400">Час зйомки (EXIF): {activePhoto.timestamp}</div>
              )}
              {activePhoto.sha256 && (
                <div className="text-[10px] text-emerald-400 break-all select-all">
                  SHA-256: {activePhoto.sha256}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: ADD DOCUMENT SCAN */}
      {addDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1120] border border-blue-600/50 rounded-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Додати документ до досьє {selectedActor?.name}</span>
              </h3>
              <button onClick={() => setAddDocModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Назва документа * :</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Ex: Passeport biométrique / Procuration d'avocat"
                  className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Тип документа :</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                >
                  <option value="Scan de pièce d'identité">Scan de pièce d'identité / Passeport</option>
                  <option value="Procédure / PV d'audition">Procédure / PV d'audition de police</option>
                  <option value="Certificat médical">Certificat médical / Unisanté</option>
                  <option value="Document bancaire">Document bancaire / Virement</option>
                  <option value="Procuration">Procuration de conseil juridique</option>
                  <option value="Autre attestation">Autre attestation officielle</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400">
                Документ буде підписаний хешем SHA-256 та синхронізований з локальною базою Utopia DB.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAddDocModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleAddDocumentToSelectedActor}
                disabled={!newDocTitle.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold"
              >
                Зберегти в досьє
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: DELETE IMPACT WARNING */}
      {deleteConfirmActor && deleteImpact && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1120] border border-rose-600/50 rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold border-b border-slate-800 pb-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>АНАЛІЗ ВПЛИВУ НА СПРАВУ ПЕРЕД ВИЛУЧЕННЯМ ФІГУРАНТА</span>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-200">
                Ви збираєтеся вилучити фігуранта:{" "}
                <strong className="text-white font-bold">{deleteConfirmActor.name}</strong>{" "}
                ({deleteConfirmActor.legal_reference}).
              </p>

              {deleteImpact.blockedByInvariant ? (
                <div className="p-3.5 bg-rose-950/70 border border-rose-600 rounded-xl space-y-1 text-rose-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>ВИЛУЧЕННЯ ЗАБЛОКОВАНО АРХІТЕКТУРНИМ ІНВАРІАНТОМ</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {deleteImpact.blockingMessage}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-slate-300">
                  {deleteImpact.chargesImpact.length > 0 && (
                    <div className="p-2.5 bg-[#050810] border border-slate-800 rounded-lg space-y-1">
                      <span className="text-[11px] font-mono text-amber-400 font-bold block">
                        Пов язані кримінальні обвинувачення :
                      </span>
                      {deleteImpact.chargesImpact.map((ch, i) => (
                        <p key={i} className="text-[11px] text-slate-300">
                          • {ch.code} - {ch.title} ({ch.description})
                        </p>
                      ))}
                    </div>
                  )}

                  {deleteImpact.financialImpact.difference !== 0 && (
                    <div className="p-2.5 bg-[#050810] border border-slate-800 rounded-lg text-[11px]">
                      <span className="text-slate-400 block">Зміна суми цивільного позову :</span>
                      <span className="text-rose-400 font-bold">
                        CHF {deleteImpact.financialImpact.difference.toLocaleString("fr-CH")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmActor(null);
                  setDeleteImpact(null);
                }}
                className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white"
              >
                {deleteImpact.blockedByInvariant ? "Закрити" : "Скасувати"}
              </button>

              {!deleteImpact.blockedByInvariant && (
                <button
                  type="button"
                  onClick={confirmDeleteActor}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold"
                >
                  Підтвердити вилучення
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
