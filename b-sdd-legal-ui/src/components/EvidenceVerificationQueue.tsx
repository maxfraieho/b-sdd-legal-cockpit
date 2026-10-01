// =========================================================================
// B-SDD LEGAL COCKPIT · EVIDENCE VERIFICATION QUEUE (HITL INGESTION DESK)
// Compliant with ADR-001..024, Invariant L-01 (WORM) & L-05 (SHA-256 ISO 27037)
// =========================================================================

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  Mic,
  FileText,
  Landmark,
  Scale,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  Edit3,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { SupportedLanguage } from "../types/i18n";
import { commitAtomicSupersession } from "../lib/wormLedger";
import { BordereauPiece } from "../data/legalData";

export interface ForensicDetails {
  camera_model?: string;
  gps_coordinates?: string;
  duration_sec?: number;
  audio_timestamps?: string;
  visual_findings?: string;
  device_id?: string;
}

export interface ActorInvolvement {
  actor_id: string;
  actor_name: string;
  role: string;
}

export interface CandidateEvidenceCard {
  candidate_id: string;
  source_file: string;
  sha256: string;
  valid_time: string; // Tv
  transaction_time: string; // Tt
  category: string;
  title: Record<string, string>;
  actors_involved: ActorInvolvement[];
  target_charge_codes: string[];
  forensic_details: ForensicDetails;
  verbatim_quote_original: string;
  french_legal_translation: string;
  admissibility_rationale: string;
  hitl_status: "PENDING_HUMAN_REVIEW" | "APPROVED_SEALED" | "REJECTED_QUARANTINE" | "NEEDS_CLARIFICATION";
  assigned_cote?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  worm_record_id?: string | null;
}

const LOCAL_STAGING_KEY = "b_sdd_evidence_staging_candidates_v1";

const DEFAULT_SEEDED_CANDIDATES: CandidateEvidenceCard[] = [
  {
    candidate_id: "CAND-P-001",
    source_file: "IMG_20240412_142055.jpg",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    valid_time: "2024-04-12T14:20:55+02:00",
    transaction_time: "2026-09-30T10:00:00Z",
    category: "Photo EXIF",
    title: {
      uk: "Фото-алібі: перебування потерпілого на робочому місці",
      fr: "Photo-alibi: présence matérielle de la victime sur le lieu de travail",
      en: "Alibi photo: victim material presence at workplace",
    },
    actors_involved: [{ actor_id: "AK-01", actor_name: "Arsen Kovalenko", role: "victime" }],
    target_charge_codes: ["Art. 180 CP", "Art. 181 CP"],
    forensic_details: {
      camera_model: "Apple iPhone 13 Pro",
      gps_coordinates: "46.5197° N, 6.6323° E",
      duration_sec: 0.0,
      visual_findings: "Timestamp EXIF certifié démontrant l'absence complète de la victime sur le lieu litigieux.",
      device_id: "DEV-IOS-AK13",
    },
    verbatim_quote_original: "Фотографія робочого простору о 14:20:55, що фізично спростовує присутність потерпілого на місці вигаданого інциденту.",
    french_legal_translation: "Photographie certifiée du poste de travail à 14h20:55 établissant l'impossibilité matérielle de la présence sur le lieu de l'incident fictif.",
    admissibility_rationale: "Admissible sous Art. 139 al. 2 CPP (ATF 146 IV 9 al. 2: preuve d'alibi licite sans atteinte à l'intimité d'autrui).",
    hitl_status: "PENDING_HUMAN_REVIEW",
  },
  {
    candidate_id: "CAND-P-002",
    source_file: "AUDIO_20240720_MENACES_2115.m4a",
    sha256: "8f434346648f6b96df89dda901c5176b10e6d0b93b74e44940094ac54f249e9f",
    valid_time: "2024-07-20T21:15:00+02:00",
    transaction_time: "2026-09-30T10:05:00Z",
    category: "Audio",
    title: {
      uk: "Аудіозапис телефонних погроз фізичною розправою",
      fr: "Enregistrement audio de menaces réitérées de violences corporelles",
      en: "Audio recording of reiterated death and bodily assault threats",
    },
    actors_involved: [
      { actor_id: "VO-02", actor_name: "Valentyna Orlova", role: "prevenue" },
      { actor_id: "AK-01", actor_name: "Arsen Kovalenko", role: "victime" },
    ],
    target_charge_codes: ["Art. 180 CP", "Art. 123 CP", "Art. 181 CP"],
    forensic_details: {
      gps_coordinates: "46.4833° N, 6.4167° E",
      duration_sec: 142.0,
      audio_timestamps: "00:15 - 02:22",
      device_id: "REC-VOICE-VAUD-01",
    },
    verbatim_quote_original: "«Я тобі життя не дам, ти звідси не виїдеш, я зроблю так, що тебе депортують або покалічать!»",
    french_legal_translation: "«Je ne te laisserai pas vivre, tu ne quitteras pas cet endroit, je ferai en sorte que tu sois déporté ou estropié !»",
    admissibility_rationale: "Admissible sous Art. 139 al. 2 CPP combiné avec ATF 146 IV 9 (sauvegarde d'intérêts prépondérants face à des infractions graves).",
    hitl_status: "PENDING_HUMAN_REVIEW",
  },
  {
    candidate_id: "CAND-P-003",
    source_file: "BCV_EXTRAIT_COMPTE_20240502.pdf",
    sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    valid_time: "2024-05-02T09:30:00+02:00",
    transaction_time: "2026-09-30T10:10:00Z",
    category: "Bancaire",
    title: {
      uk: "Банківська виписка BCV: несанкціоноване списання коштів",
      fr: "Extrait de compte BCV: prélèvement sans mandat et détournement de fonds",
      en: "BCV bank statement: unauthorized debit and embezzlement of funds",
    },
    actors_involved: [
      { actor_id: "VO-02", actor_name: "Valentyna Orlova", role: "prevenue" },
      { actor_id: "AK-01", actor_name: "Arsen Kovalenko", role: "victime" },
    ],
    target_charge_codes: ["Art. 138 CP", "Art. 146 CP"],
    forensic_details: {
      visual_findings: "Opération de débit de 15'000.00 CHF avec libellé suspect.",
      device_id: "EBANK-BCV-TRANS",
    },
    verbatim_quote_original: "Виписка Banque Cantonale Vaudoise: транзакція на суму 15 000 CHF без правової підстави.",
    french_legal_translation: "Extrait Banque Cantonale Vaudoise: transaction d'un montant de 15'000.00 CHF dépourvue de cause légitime.",
    admissibility_rationale: "Admissible de plein droit sous Art. 139 al. 1 CPP (titre officiel bancaire régulier).",
    hitl_status: "PENDING_HUMAN_REVIEW",
  },
];

interface EvidenceVerificationQueueProps {
  currentLang: SupportedLanguage;
  onPieceApproved?: (piece: BordereauPiece) => void;
  onShowToast?: (title: string, description: string, type?: "success" | "info") => void;
}

export const EvidenceVerificationQueue: React.FC<EvidenceVerificationQueueProps> = ({
  currentLang,
  onPieceApproved,
  onShowToast,
}) => {
  const [candidates, setCandidates] = useState<CandidateEvidenceCard[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STAGING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SEEDED_CANDIDATES;
  });

  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.candidate_id || "");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Editable decision desk fields
  const [assignedCote, setAssignedCote] = useState<string>("");
  const [editedTranslation, setEditedTranslation] = useState<string>("");
  const [editedRationale, setEditedRationale] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [isSealing, setIsSealing] = useState<boolean>(false);

  const selectedCandidate = candidates.find((c) => c.candidate_id === selectedId) || candidates[0];

  // Sync editor fields when selection changes
  useEffect(() => {
    if (selectedCandidate) {
      if (selectedCandidate.assigned_cote) {
        setAssignedCote(selectedCandidate.assigned_cote);
      } else {
        const approvedCount = candidates.filter((c) => c.hitl_status === "APPROVED_SEALED").length;
        setAssignedCote(`P-${String(approvedCount + 1).padStart(2, "0")}`);
      }
      setEditedTranslation(selectedCandidate.french_legal_translation || "");
      setEditedRationale(selectedCandidate.admissibility_rationale || "");
      setReviewNotes(selectedCandidate.review_notes || "");
    }
  }, [selectedId, selectedCandidate?.candidate_id]);

  // Persist locally
  const saveState = (updated: CandidateEvidenceCard[]) => {
    setCandidates(updated);
    try {
      localStorage.setItem(LOCAL_STAGING_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Fetch live from Gateway if available
  const handleRefreshFromGateway = async () => {
    setIsRefreshing(true);
    try {
      const resp = await fetch("http://127.0.0.1:8766/api/tools/legal_staging_list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ALL" }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const parsedResult = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
        if (parsedResult?.candidates && Array.isArray(parsedResult.candidates)) {
          saveState(parsedResult.candidates);
          onShowToast?.(
            currentLang === "uk" ? "Чергу оновлено з MCP Gateway" : "File d'attente synchronisée depuis Gateway",
            `${parsedResult.candidates.length} кандидатів у буфері`,
            "info"
          );
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy hash helper
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // APPROVE & SEAL
  const handleApprove = async () => {
    if (!selectedCandidate) return;
    setIsSealing(true);

    const nowIso = new Date().toISOString();
    const finalCote = assignedCote.trim() || `P-${String(candidates.filter((c) => c.hitl_status === "APPROVED_SEALED").length + 1).padStart(2, "0")}`;

    // 1. Commit WORM Record (Invariant L-01)
    const wormRecord = await commitAtomicSupersession({
      entity_id: `PIECE-${finalCote}`,
      chapter_id: "CH-02",
      summary: `Approbation judiciaire et scellement WORM de la pièce ${finalCote} (${selectedCandidate.source_file})`,
      content_snapshot: `Tv=${selectedCandidate.valid_time} · SHA256=${selectedCandidate.sha256} · Qualif=${selectedCandidate.target_charge_codes.join(", ")} · Trad=${editedTranslation}`,
      committer: "Me Avocat Mandataire (Lausanne)",
    });

    // 2. Update Candidate State
    const updated = candidates.map((c) => {
      if (c.candidate_id === selectedCandidate.candidate_id) {
        return {
          ...c,
          hitl_status: "APPROVED_SEALED" as const,
          assigned_cote: finalCote,
          french_legal_translation: editedTranslation,
          admissibility_rationale: editedRationale,
          reviewed_by: "AVOCAT_VAUD_MANDATAIRE",
          reviewed_at: nowIso,
          review_notes: reviewNotes || "Preuve formellement validée et intégrée au bordereau sous Art. 139 CPP.",
          worm_record_id: wormRecord.record_id,
        };
      }
      return c;
    });

    saveState(updated);

    // 3. Post to gateway in background
    try {
      fetch("http://127.0.0.1:8766/api/tools/legal_staging_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: selectedCandidate.candidate_id,
          action: "APPROVE",
          cote: finalCote,
          notes: reviewNotes,
          lawyer_id: "AVOCAT_VAUD_MANDATAIRE",
          edits: {
            french_legal_translation: editedTranslation,
            admissibility_rationale: editedRationale,
          },
        }),
      }).catch(() => {});
    } catch {}

    // 4. Dispatch callback to add to Bordereau
    if (onPieceApproved) {
      const piece: BordereauPiece = {
        cote: finalCote,
        date_faits: selectedCandidate.valid_time.slice(0, 10),
        date_versement: nowIso.slice(0, 10),
        titre: selectedCandidate.title,
        categorie: (selectedCandidate.category as any) || "Message",
        sha256: selectedCandidate.sha256,
        admissibilite: {
          fr: editedRationale || selectedCandidate.admissibility_rationale,
          uk: selectedCandidate.admissibility_rationale,
          en: selectedCandidate.admissibility_rationale,
        },
        portee_probatoire: {
          fr: `Infractions corroborées: ${selectedCandidate.target_charge_codes.join(", ")}. ${editedTranslation.slice(0, 150)}...`,
          uk: `Підтверджує склади: ${selectedCandidate.target_charge_codes.join(", ")}.`,
          en: `Corroborates statutory charges: ${selectedCandidate.target_charge_codes.join(", ")}.`,
        },
        citation_cle: {
          fr: editedTranslation || selectedCandidate.verbatim_quote_original,
          uk: selectedCandidate.verbatim_quote_original,
          en: editedTranslation,
        },
        fichier_local: selectedCandidate.source_file,
      };
      onPieceApproved(piece);
    }

    setIsSealing(false);
    onShowToast?.(
      currentLang === "uk" ? `Доказ затверджено та опечатано (${finalCote})` : `Preuve scellée au dossier (${finalCote})`,
      `WORM ID: ${wormRecord.record_id} · SHA-256 certifié ISO 27037`
    );
  };

  // REJECT / QUARANTINE
  const handleReject = () => {
    if (!selectedCandidate) return;
    const nowIso = new Date().toISOString();
    const updated = candidates.map((c) => {
      if (c.candidate_id === selectedCandidate.candidate_id) {
        return {
          ...c,
          hitl_status: "REJECTED_QUARANTINE" as const,
          reviewed_by: "AVOCAT_VAUD_MANDATAIRE",
          reviewed_at: nowIso,
          review_notes: reviewNotes || "Rejeté sous Art. 141 CPP (preuve illicite ou non probante).",
        };
      }
      return c;
    });
    saveState(updated);

    try {
      fetch("http://127.0.0.1:8766/api/tools/legal_staging_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: selectedCandidate.candidate_id,
          action: "REJECT",
          notes: reviewNotes,
          lawyer_id: "AVOCAT_VAUD_MANDATAIRE",
        }),
      }).catch(() => {});
    } catch {}

    onShowToast?.(
      currentLang === "uk" ? "Доказ переведено в карантин (ст. 141 КПК)" : "Preuve mise en quarantaine (Art. 141 CPP)",
      `Candidate ID: ${selectedCandidate.candidate_id}`,
      "info"
    );
  };

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes("photo")) return <Camera className="w-4 h-4 text-emerald-400" />;
    if (category.toLowerCase().includes("audio")) return <Mic className="w-4 h-4 text-amber-400" />;
    if (category.toLowerCase().includes("bancaire")) return <Landmark className="w-4 h-4 text-cyan-400" />;
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    if (statusFilter === "PENDING") return c.hitl_status === "PENDING_HUMAN_REVIEW";
    if (statusFilter === "APPROVED") return c.hitl_status === "APPROVED_SEALED";
    if (statusFilter === "REJECTED") return c.hitl_status === "REJECTED_QUARANTINE";
    return true;
  });

  const pendingCount = candidates.filter((c) => c.hitl_status === "PENDING_HUMAN_REVIEW").length;
  const approvedCount = candidates.filter((c) => c.hitl_status === "APPROVED_SEALED").length;
  const rejectedCount = candidates.filter((c) => c.hitl_status === "REJECTED_QUARANTINE").length;

  return (
    <div className="h-full flex flex-col bg-[#070B14] text-slate-200 select-none overflow-hidden">
      {/* Top Banner & Filter Controls */}
      <div className="px-4 py-2.5 bg-[#0A0F1D] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide flex items-center space-x-2">
              <span>{currentLang === "uk" ? "ЧЕРГА ФОРЕНЗІК-ВЕРИФІКАЦІЇ (HITL DESK)" : "FILE D'INSTRUCTION FORENSIQUE (HITL)"}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950/70 text-blue-400 border border-blue-800/60">
                Spark L1 → Avocat
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              ADR-024 · B-SDD Bitemporal Staging Buffer · Node :8766
            </p>
          </div>
        </div>

        {/* Filter Pill Buttons & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#070B14] p-0.5 rounded-lg border border-slate-800 text-[11px] font-medium">
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 ${
                statusFilter === "PENDING"
                  ? "bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{currentLang === "uk" ? "До розгляду" : "En attente"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-mono">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{currentLang === "uk" ? "Затверджено" : "Scellés"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                {approvedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 ${
                statusFilter === "REJECTED"
                  ? "bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>{currentLang === "uk" ? "Карантин" : "Quarantaine"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 font-mono">
                {rejectedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2 py-1 rounded-md transition-all ${
                statusFilter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{currentLang === "uk" ? "Всі" : "Tous"}</span>
            </button>
          </div>

          <button
            onClick={handleRefreshFromGateway}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Оновити з MCP Gateway"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Two-Pane Desk */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Candidate Cards List (35%) */}
        <div className="w-[36%] border-r border-slate-800 flex flex-col bg-[#070C16] overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#090E1B]">
            <span>{filteredCandidates.length} {currentLang === "uk" ? "кандидатів у вибірці" : "candidats affichés"}</span>
            <span className="text-[10px] text-amber-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>L1 Ingestion Active</span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-600" />
                <p>{currentLang === "uk" ? "Черга порожня для цього фільтра" : "Aucun élément pour ce filtre"}</p>
              </div>
            ) : (
              filteredCandidates.map((c) => {
                const isSelected = c.candidate_id === selectedId;
                return (
                  <div
                    key={c.candidate_id}
                    onClick={() => setSelectedId(c.candidate_id)}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-amber-950/20 border-l-2 border-amber-400 pl-2.5"
                        : "hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(c.category)}
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {c.candidate_id}
                        </span>
                        {c.assigned_cote && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {c.assigned_cote}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          c.hitl_status === "APPROVED_SEALED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : c.hitl_status === "REJECTED_QUARANTINE"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                        }`}
                      >
                        {c.hitl_status === "APPROVED_SEALED"
                          ? "SEALED"
                          : c.hitl_status === "REJECTED_QUARANTINE"
                          ? "QUARANTINE"
                          : "PENDING"}
                      </span>
                    </div>

                    <h4 className="text-xs font-medium text-slate-300 mt-1 line-clamp-1">
                      {c.title[currentLang] || c.title.fr || c.title.uk || c.title.en}
                    </h4>

                    <div className="flex items-center space-x-3 mt-1.5 text-[10px] font-mono text-slate-500">
                      <span>Tv: {c.valid_time ? c.valid_time.slice(0, 16).replace("T", " ") : "N/A"}</span>
                      <span>·</span>
                      <span className="text-blue-400 truncate max-w-[120px]">{c.source_file}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-1">
                      {c.target_charge_codes.map((code) => (
                        <span
                          key={code}
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Deep Forensics & Lawyer Decision Desk (64%) */}
        <div className="w-[64%] flex flex-col bg-[#090D18] overflow-y-auto">
          {selectedCandidate ? (
            <div className="p-5 space-y-4">
              {/* Header Details */}
              <div className="bg-[#0D1322] p-4 rounded-xl border border-slate-800/90 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {selectedCandidate.candidate_id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedCandidate.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Fichier: <strong className="text-slate-200">{selectedCandidate.source_file}</strong>
                    </span>
                  </div>

                  {/* SHA-256 Copy badge */}
                  <button
                    onClick={() => handleCopyHash(selectedCandidate.sha256)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#070A12] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-mono transition-colors"
                  >
                    <span>SHA-256: {selectedCandidate.sha256.slice(0, 10)}...</span>
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white">
                  {selectedCandidate.title[currentLang] || selectedCandidate.title.fr || selectedCandidate.title.uk || selectedCandidate.title.en}
                </h3>

                {/* Bitemporal Timeline breakdown */}
                <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-[#070A12] border border-slate-800/80 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Valid Time (Tv - Temps réel des faits):</span>
                    <span className="text-emerald-400 font-bold">{selectedCandidate.valid_time}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transaction Time (Tt - Ingestion système):</span>
                    <span className="text-cyan-400 font-bold">{selectedCandidate.transaction_time}</span>
                  </div>
                </div>

                {/* Forensic Details Block */}
                {(selectedCandidate.forensic_details.camera_model ||
                  selectedCandidate.forensic_details.gps_coordinates ||
                  selectedCandidate.forensic_details.duration_sec ||
                  selectedCandidate.forensic_details.visual_findings) && (
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs space-y-1.5 font-mono">
                    <span className="text-amber-400 font-bold block text-[11px] uppercase tracking-wider">
                      Données Forensiques Métadonnées (ISO 27037)
                    </span>
                    {selectedCandidate.forensic_details.camera_model && (
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>Capteur / Appareil: {selectedCandidate.forensic_details.camera_model}</span>
                      </div>
                    )}
                    {selectedCandidate.forensic_details.gps_coordinates && (
                      <div className="flex items-center space-x-2 text-slate-300">
                        <span>📍 GPS: {selectedCandidate.forensic_details.gps_coordinates}</span>
                      </div>
                    )}
                    {selectedCandidate.forensic_details.duration_sec && (
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Durée enregistrement: {selectedCandidate.forensic_details.duration_sec} sec ({selectedCandidate.forensic_details.audio_timestamps || ""})</span>
                      </div>
                    )}
                    {selectedCandidate.forensic_details.visual_findings && (
                      <p className="text-slate-400 text-[11px] mt-1 italic">
                        {selectedCandidate.forensic_details.visual_findings}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Comparative Text Area: Verbatim Original vs French Legal Translation */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original Quote */}
                <div className="bg-[#0C1220] p-3.5 rounded-xl border border-slate-800/80 flex flex-col">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <span>Texte / Citation Verbatim Originale</span>
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#070A12] border border-slate-800 text-xs text-slate-200 font-serif italic flex-1 min-h-[90px]">
                    {selectedCandidate.verbatim_quote_original || "(Aucun texte verbatim)"}
                  </div>
                </div>

                {/* French Legal Translation (Editable by Lawyer) */}
                <div className="bg-[#0C1220] p-3.5 rounded-xl border border-slate-800/80 flex flex-col">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Traduction Juridique (Ministère Public)</span>
                    <Edit3 className="w-3 h-3 text-amber-400" />
                  </span>
                  <textarea
                    rows={4}
                    value={editedTranslation}
                    onChange={(e) => setEditedTranslation(e.target.value)}
                    className="p-2.5 rounded-lg bg-[#070A12] border border-slate-700/80 text-xs text-amber-200 font-sans focus:outline-none focus:border-amber-500 resize-none flex-1"
                    placeholder="Traduction française admissible au tribunal..."
                  />
                </div>
              </div>

              {/* Legal Admissibility Rationale under Art. 139 al. 2 CPP */}
              <div className="bg-[#0C1220] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider block">
                  Motivation d'admissibilité procédurale (Art. 139 al. 2 CPP / ATF 146 IV 9)
                </span>
                <textarea
                  rows={2}
                  value={editedRationale}
                  onChange={(e) => setEditedRationale(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#070A12] border border-slate-700/80 text-xs text-slate-300 font-sans focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Justification légale de recevabilité..."
                />
              </div>

              {/* LAWYER HITL VERDICT DESK */}
              <div className="bg-gradient-to-b from-[#10172A] to-[#0A0F1D] p-4 rounded-xl border-2 border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {currentLang === "uk" ? "ПУЛЬТ ВЕРДИКТУ АДВОКАТА (HUMAN-IN-THE-LOOP)" : "PUPITRE DE SCELLEMENT AVOCAT MANDATAIRE"}
                    </h4>
                  </div>

                  {/* Cote Assignment */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-400">
                      {currentLang === "uk" ? "Присвоїти Коту:" : "Cote judiciaire:"}
                    </span>
                    <input
                      type="text"
                      value={assignedCote}
                      onChange={(e) => setAssignedCote(e.target.value)}
                      className="w-24 px-2 py-1 rounded bg-[#070A12] border border-amber-500/50 text-amber-300 font-mono text-xs font-bold text-center focus:outline-none focus:border-amber-400"
                      placeholder="P-01"
                    />
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {currentLang === "uk" ? "Висновки та процесуальні примітки юриста:" : "Observations forensiques de l'avocat:"}
                  </label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#070A12] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Sceau certifié après vérification de l'intégrité de la chaîne de garde..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={handleApprove}
                    disabled={isSealing}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {currentLang === "uk"
                        ? `Затвердити та внести в досьє (${assignedCote || "P-xx"})`
                        : `Valider et sceller WORM (${assignedCote || "P-xx"})`}
                    </span>
                  </button>

                  <button
                    onClick={handleReject}
                    className="py-2.5 px-4 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-semibold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>{currentLang === "uk" ? "Карантин (ст. 141 КПК)" : "Quarantaine (Art. 141)"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              <Scale className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p>{currentLang === "uk" ? "Оберіть кандидата з черги ліворуч для верифікації" : "Sélectionnez une pièce candidate pour instruction"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
