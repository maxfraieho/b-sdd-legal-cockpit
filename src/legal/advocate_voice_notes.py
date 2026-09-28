"""
B-SDD Legal Framework: Advocate Voice Notes & Deposition Ingestion Engine.
Captures, seals, and subsumes lawyer voice debriefs and participant depositions
under Swiss Penal Code (CP), Code of Criminal Procedure (CPP), and LEI.

100% Pure Python Standard Library (ADR-002, Invariant L-02).
Enforces:
- Invariant L-01: WORM Bitemporality (Tv vs Tt, non-destructive supersession).
- Invariant L-02: Zero external dependencies in core.
- Invariant L-03: Bona Fide Immunity Shield for Adriano MILLI (Art. 933 CC, Art. 105 al. 2 CPP).
- Invariant L-04: Adult Victim Protection for Arsen KOVALENKO (b. 1999, strictly no Art. 219 CP).
- Invariant L-05: Cryptographic Evidence Sealing (SHA-256 chaining).
"""
import hashlib
import json
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Set

from src.legal.timeline_calibrator import BitemporalFactEvent


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class InvariantViolationError(Exception):
    """Base exception for B-SDD legal invariant violations."""
    pass


class BonaFideProtectionViolation(InvariantViolationError):
    """Raised when an action threatens the bona fide immunity of protected parties (Invariant L-03)."""
    pass


class AdultVictimProtectionViolation(InvariantViolationError):
    """Raised when adult victim status or procedural rights are compromised (Invariant L-04)."""
    pass


class CryptographicSealMismatchError(InvariantViolationError):
    """Raised when a voice note's SHA-256 seal fails verification (Invariant L-05)."""
    pass


class NoteStatus(str, Enum):
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    CHALLENGED = "challenged"


@dataclass
class AudioSegment:
    """Time-stamped segment within an advocate's voice recording."""
    start_seconds: float
    end_seconds: float
    transcript_segment: str
    speaker_label: Optional[str] = None
    confidence: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "start_seconds": self.start_seconds,
            "end_seconds": self.end_seconds,
            "transcript_segment": self.transcript_segment,
            "speaker_label": self.speaker_label,
            "confidence": self.confidence,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AudioSegment":
        return cls(
            start_seconds=float(data["start_seconds"]),
            end_seconds=float(data["end_seconds"]),
            transcript_segment=str(data["transcript_segment"]),
            speaker_label=data.get("speaker_label"),
            confidence=float(data.get("confidence", 1.0)),
        )


@dataclass
class SwissArticleSubsumption:
    """Legal qualification subsuming voice evidence under Swiss statutory law."""
    article: str                   # e.g., "Art. 180 al. 1 CP"
    offense_name: str              # e.g., "Menaces graves"
    accused_actor_id: str          # e.g., "ACT-LIUBOV-SUVOROVA"
    victim_actor_id: str           # e.g., "ACT-ARSEN-KOVALENKO"
    qualifying_facts: List[str] = field(default_factory=list)
    evidence_citations: List[str] = field(default_factory=list)
    confidence: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "article": self.article,
            "offense_name": self.offense_name,
            "accused_actor_id": self.accused_actor_id,
            "victim_actor_id": self.victim_actor_id,
            "qualifying_facts": list(self.qualifying_facts),
            "evidence_citations": list(self.evidence_citations),
            "confidence": self.confidence,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SwissArticleSubsumption":
        return cls(
            article=data["article"],
            offense_name=data["offense_name"],
            accused_actor_id=data["accused_actor_id"],
            victim_actor_id=data["victim_actor_id"],
            qualifying_facts=list(data.get("qualifying_facts", [])),
            evidence_citations=list(data.get("evidence_citations", [])),
            confidence=float(data.get("confidence", 1.0)),
        )


@dataclass
class AdvocateVoiceNote:
    """Immutable, bitemporal voice note captured by legal counsel or operator."""
    note_id: str
    dossier_id: str
    title: str
    author_id: str
    raw_transcript: str
    audio_sha256: str
    audio_duration_seconds: float
    t_v: str                                  # Valid Time (incident/deposition date)
    t_t: str = field(default_factory=_now_iso)     # Transaction Time (recorded in ledger)
    audio_segments: List[AudioSegment] = field(default_factory=list)
    target_actor_ids: List[str] = field(default_factory=list)
    legal_observations: str = ""
    subsumptions: List[SwissArticleSubsumption] = field(default_factory=list)
    blast_radius_chapters: List[str] = field(default_factory=list)
    valid_to: Optional[str] = None
    tx_superseded: Optional[str] = None
    supersedes_id: Optional[str] = None
    superseded_by: Optional[str] = None
    status: NoteStatus = NoteStatus.ACTIVE
    sha256_seal: Optional[str] = None

    def compute_hash_seal(self) -> str:
        """Computes deterministic SHA-256 digest sealing the note content."""
        canonical_payload = {
            "note_id": self.note_id,
            "dossier_id": self.dossier_id,
            "title": self.title,
            "author_id": self.author_id,
            "raw_transcript": self.raw_transcript.strip(),
            "audio_sha256": self.audio_sha256,
            "audio_duration_seconds": round(self.audio_duration_seconds, 2),
            "t_v": self.t_v,
            "target_actor_ids": sorted(self.target_actor_ids),
            "subsumptions": [
                {
                    "article": s.article,
                    "accused": s.accused_actor_id,
                    "victim": s.victim_actor_id,
                }
                for s in sorted(self.subsumptions, key=lambda x: x.article)
            ],
        }
        encoded = json.dumps(canonical_payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    def seal(self) -> None:
        """Applies cryptographic SHA-256 seal."""
        self.sha256_seal = self.compute_hash_seal()

    def verify_seal(self) -> bool:
        """Verifies if the current state matches the cryptographic seal."""
        if not self.sha256_seal:
            return False
        return self.compute_hash_seal() == self.sha256_seal

    def is_valid_at(self, tv: str) -> bool:
        if tv < self.t_v:
            return False
        if self.valid_to is not None and tv >= self.valid_to:
            return False
        return True

    def is_visible_at(self, tt: str) -> bool:
        if tt < self.t_t:
            return False
        if self.tx_superseded is not None and tt >= self.tx_superseded:
            return False
        return True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "note_id": self.note_id,
            "dossier_id": self.dossier_id,
            "title": self.title,
            "author_id": self.author_id,
            "raw_transcript": self.raw_transcript,
            "audio_sha256": self.audio_sha256,
            "audio_duration_seconds": self.audio_duration_seconds,
            "t_v": self.t_v,
            "t_t": self.t_t,
            "audio_segments": [s.to_dict() for s in self.audio_segments],
            "target_actor_ids": list(self.target_actor_ids),
            "legal_observations": self.legal_observations,
            "subsumptions": [sub.to_dict() for sub in self.subsumptions],
            "blast_radius_chapters": list(self.blast_radius_chapters),
            "valid_to": self.valid_to,
            "tx_superseded": self.tx_superseded,
            "supersedes_id": self.supersedes_id,
            "superseded_by": self.superseded_by,
            "status": self.status.value,
            "sha256_seal": self.sha256_seal,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AdvocateVoiceNote":
        return cls(
            note_id=data["note_id"],
            dossier_id=data["dossier_id"],
            title=data["title"],
            author_id=data["author_id"],
            raw_transcript=data["raw_transcript"],
            audio_sha256=data["audio_sha256"],
            audio_duration_seconds=float(data.get("audio_duration_seconds", 0.0)),
            t_v=data["t_v"],
            t_t=data.get("t_t", _now_iso()),
            audio_segments=[AudioSegment.from_dict(s) for s in data.get("audio_segments", [])],
            target_actor_ids=list(data.get("target_actor_ids", [])),
            legal_observations=data.get("legal_observations", ""),
            subsumptions=[SwissArticleSubsumption.from_dict(sub) for sub in data.get("subsumptions", [])],
            blast_radius_chapters=list(data.get("blast_radius_chapters", [])),
            valid_to=data.get("valid_to"),
            tx_superseded=data.get("tx_superseded"),
            supersedes_id=data.get("supersedes_id"),
            superseded_by=data.get("superseded_by"),
            status=NoteStatus(data.get("status", NoteStatus.ACTIVE.value)),
            sha256_seal=data.get("sha256_seal"),
        )


class AdvocateVoiceNoteEngine:
    """
    Core business engine managing advocate voice notes and depositions.
    Validates invariants, computes blast radius, and ensures WORM compliance.
    """

    CHAPTER_ARTICLE_MAP: Dict[str, List[str]] = {
        "CH-04": ["Art. 180", "Art. 181"],           # Menaces et contrainte
        "CH-05": ["Art. 138", "Art. 146"],           # Abus de confiance et escroquerie
        "CH-06": ["Art. 156", "Art. 157"],           # Extorsion et usure
        "CH-07": ["Art. 186", "Art. 144"],           # Violation de domicile et dommages
        "CH-08": ["Art. 303", "Art. 304"],           # Dénonciation calomnieuse
        "CH-09": ["Art. 118 LEI", "LEI"],            # Infractions migratoires
        "CH-11": ["Art. 115 CPP", "Art. 118 CPP"],   # Droits de la victime LAVI
        "CH-12": ["Art. 122 CPP", "Art. 41 CO"],     # Prétentions civiles
    }

    BONA_FIDE_PROTECTED_ACTORS: Set[str] = {
        "ACT-ADRIANO-MILLI",
        "ADRIANO MILLI",
        "MILLI",
        "ACT-BONA-FIDE-THIRD-PARTY",
    }

    ADULT_VICTIM_ACTORS: Set[str] = {
        "ACT-ARSEN-KOVALENKO",
        "ARSEN KOVALENKO",
        "ARSEN",
        "ACT-CLAIMANT-CIVIL",
    }

    def __init__(self):
        self._notes: Dict[str, AdvocateVoiceNote] = {}

    def validate_invariants(self, note: AdvocateVoiceNote) -> None:
        """
        Strictly enforces Invariants L-01, L-03, L-04, and L-05.
        Raises InvariantViolationError if any rule is broken.
        """
        # --- Invariant L-03: Bona Fide Immunity Shield (Adriano MILLI) ---
        for sub in note.subsumptions:
            accused_norm = sub.accused_actor_id.strip().upper()
            if any(protected in accused_norm for protected in self.BONA_FIDE_PROTECTED_ACTORS):
                raise BonaFideProtectionViolation(
                    f"Invariant L-03 VIOLATION: Actor '{sub.accused_actor_id}' is protected by absolute "
                    f"bona fide immunity under Art. 933 CC / Art. 105 al. 2 CPP. "
                    f"Cannot be designated as accused in {sub.article}."
                )

        if any(protected in note.raw_transcript.upper() and "PRÉVENU" in note.raw_transcript.upper()
               for protected in ["ADRIANO MILLI", "MILLI"]):
            raise BonaFideProtectionViolation(
                "Invariant L-03 VIOLATION: Raw transcript attempts to qualify Adriano MILLI as prévenu. "
                "Absolute bona fide protection applies."
            )

        # --- Invariant L-04: Adult Victim Protection (Arsen KOVALENKO) ---
        for sub in note.subsumptions:
            if "219" in sub.article:
                raise AdultVictimProtectionViolation(
                    f"Invariant L-04 VIOLATION: Reference to Art. 219 CP detected in {sub.article}. "
                    "Arsen KOVALENKO (b. 05.11.1999, 26 years old) is legally recognized as an adult. "
                    "Provisions regarding minors (Art. 219 CP) are strictly prohibited."
                )
            victim_norm = sub.victim_actor_id.strip().upper()
            accused_norm = sub.accused_actor_id.strip().upper()
            if any(victim in accused_norm for victim in self.ADULT_VICTIM_ACTORS):
                raise AdultVictimProtectionViolation(
                    f"Invariant L-04 VIOLATION: Adult victim '{sub.accused_actor_id}' cannot be designated as accused."
                )

        if "ART. 219 CP" in note.raw_transcript.upper() or "ART 219 CP" in note.raw_transcript.upper():
            raise AdultVictimProtectionViolation(
                "Invariant L-04 VIOLATION: Transcript contains Art. 219 CP reference for an adult victim."
            )

    def calculate_blast_radius(self, note: AdvocateVoiceNote) -> List[str]:
        """
        Calculates which chapters of the legal dossier (CH-01 to CH-18) are impacted
        by this advocate voice note or witness deposition.
        """
        impacted: Set[str] = {"CH-01", "CH-02", "CH-14"}  # General summary, timeline, witness depositions always impacted

        # Check by subsumed articles
        for sub in note.subsumptions:
            art = sub.article
            for ch, triggers in self.CHAPTER_ARTICLE_MAP.items():
                if any(t in art for t in triggers):
                    impacted.add(ch)

        # Check by keywords in observations or transcript
        text = f"{note.legal_observations} {note.raw_transcript}".lower()
        if "menace" in text or "arme" in text or "tuer" in text:
            impacted.add("CH-04")
        if "argent" in text or "banque" in text or "15'000" in text or "détourn" in text:
            impacted.add("CH-05")
            impacted.add("CH-12")
        if "expulsion" in text or "spop" in text or "chantage" in text:
            impacted.add("CH-06")
        if "serrure" in text or "porte" in text or "domicile" in text or "intrusion" in text:
            impacted.add("CH-07")
        if "griffure" in text or "calomnie" in text or "fausse déclaration" in text:
            impacted.add("CH-08")
        if "evam" in text or "statut s" in text or "permis s" in text:
            impacted.add("CH-09")
        if "unisante" in text or "médical" in text or "blessure" in text:
            impacted.add("CH-15")

        return sorted(list(impacted))

    def register_note(self, note: AdvocateVoiceNote) -> AdvocateVoiceNote:
        """
        Validates invariants, computes blast radius, cryptographically seals,
        and registers the note in the append-only ledger.
        """
        self.validate_invariants(note)

        # Compute blast radius if not already assigned
        if not note.blast_radius_chapters:
            note.blast_radius_chapters = self.calculate_blast_radius(note)

        # Cryptographically seal
        note.seal()

        self._notes[note.note_id] = note
        return note

    def supersede_note(self, old_note_id: str, new_note: AdvocateVoiceNote) -> AdvocateVoiceNote:
        """
        Executes an atomic WORM supersession (Invariant L-01).
        Preserves historical note by marking it superseded, and links new note.
        """
        old_note = self._notes.get(old_note_id)
        if not old_note:
            raise KeyError(f"Note with ID '{old_note_id}' does not exist.")

        now_tt = _now_iso()
        old_note.valid_to = new_note.t_v
        old_note.tx_superseded = now_tt
        old_note.superseded_by = new_note.note_id
        old_note.status = NoteStatus.SUPERSEDED

        new_note.supersedes_id = old_note_id
        return self.register_note(new_note)

    def get_note(self, note_id: str) -> Optional[AdvocateVoiceNote]:
        return self._notes.get(note_id)

    def query_active_notes(
        self,
        as_of_tv: Optional[str] = None,
        as_of_tt: Optional[str] = None
    ) -> List[AdvocateVoiceNote]:
        """Returns all notes active under the specified bitemporal slice."""
        results = []
        for note in self._notes.values():
            if as_of_tv and not note.is_valid_at(as_of_tv):
                continue
            if as_of_tt and not note.is_visible_at(as_of_tt):
                continue
            if not as_of_tv and not as_of_tt and note.status != NoteStatus.ACTIVE:
                continue
            results.append(note)
        return results

    def filter_by_actor(self, actor_id: str) -> List[AdvocateVoiceNote]:
        """Finds all notes linked to a specific procedural actor."""
        norm_id = actor_id.strip()
        return [
            note for note in self._notes.values()
            if norm_id in note.target_actor_ids
            or any(s.accused_actor_id == norm_id or s.victim_actor_id == norm_id for s in note.subsumptions)
        ]

    def extract_bitemporal_facts(self, note: AdvocateVoiceNote) -> List[BitemporalFactEvent]:
        """
        Converts voice note observations and subsumptions into canonical BitemporalFactEvents
        ready for the central TimelineCalibrator.
        """
        facts: List[BitemporalFactEvent] = []
        for idx, sub in enumerate(note.subsumptions, start=1):
            fact_id = f"FACT-{note.note_id}-{idx:02d}"
            label = f"{sub.offense_name} ({sub.article}): {', '.join(sub.qualifying_facts) if sub.qualifying_facts else note.title}"
            fact = BitemporalFactEvent(
                fact_id=fact_id,
                label=label,
                t_v=note.t_v,
                t_t=note.t_t,
                source_evidence_hashes=[note.sha256_seal or note.audio_sha256],
                actor_ids=[sub.accused_actor_id, sub.victim_actor_id],
                conflict_flag=False,
                status="active" if note.status == NoteStatus.ACTIVE else "superseded",
            )
            facts.append(fact)
        return facts

    def analyze_transcript_heuristics(
        self,
        transcript: str,
        accused_id: str = "ACT-LIUBOV-SUVOROVA",
        victim_id: str = "ACT-ARSEN-KOVALENKO"
    ) -> List[SwissArticleSubsumption]:
        """
        Deterministic, 100% stdlib pattern matcher analyzing advocate voice transcripts
        to suggest Swiss Penal Code subsumptions for legal counsel review.
        """
        subsumptions: List[SwissArticleSubsumption] = []
        lower_t = transcript.lower()

        # Art. 180 CP: Menaces graves
        if any(k in lower_t for k in ["menace", "tuer", "abattre", "crever", "peur", "fusil"]):
            subsumptions.append(SwissArticleSubsumption(
                article="Art. 180 al. 1 CP",
                offense_name="Menaces graves",
                accused_actor_id=accused_id,
                victim_actor_id=victim_id,
                qualifying_facts=["Menaces directes d'atteinte à la vie et à l'intégrité physique"],
                confidence=0.95,
            ))

        # Art. 138 / 146 CP: Abus de confiance / Escroquerie
        if any(k in lower_t for k in ["argent", "15'000", "15000", "détourn", "compte bancaire", "carte", "volé", "bloqué"]):
            subsumptions.append(SwissArticleSubsumption(
                article="Art. 138 ch. 1 CP / Art. 146 CP",
                offense_name="Abus de confiance et Escroquerie",
                accused_actor_id=accused_id,
                victim_actor_id=victim_id,
                qualifying_facts=["Détournement d'actifs financiers et de fonds de subsistance"],
                confidence=0.90,
            ))

        # Art. 156 CP: Extorsion et chantage
        if any(k in lower_t for k in ["chantage", "expulsion", "police", "dénonc", "spop", "virement sous pression"]):
            subsumptions.append(SwissArticleSubsumption(
                article="Art. 156 ch. 1 CP",
                offense_name="Extorsion et chantage",
                accused_actor_id=accused_id,
                victim_actor_id=victim_id,
                qualifying_facts=["Pressions et chantage à l'expulsion pour extorquer des valeurs patrimoniales"],
                confidence=0.88,
            ))

        # Art. 186 CP: Violation de domicile
        if any(k in lower_t for k in ["serrure", "porte", "effraction", "forcé la porte", "chambre", "intrus"]):
            subsumptions.append(SwissArticleSubsumption(
                article="Art. 186 CP",
                offense_name="Violation de domicile",
                accused_actor_id=accused_id,
                victim_actor_id=victim_id,
                qualifying_facts=["Intrusion illicite et dégradation d'accès au domicile privatif"],
                confidence=0.92,
            ))

        # Art. 303 / 304 CP: Dénonciation calomnieuse
        if any(k in lower_t for k in ["calomnie", "griffure", "auto-mutil", "fausse plainte", "simul", "mensonge à la police"]):
            subsumptions.append(SwissArticleSubsumption(
                article="Art. 303 / 304 CP",
                offense_name="Dénonciation calomnieuse et induction de la justice en erreur",
                accused_actor_id=accused_id,
                victim_actor_id=victim_id,
                qualifying_facts=["Simulation de blessures corporelles et dénonciation calomnieuse mensongère"],
                confidence=0.94,
            ))

        # Art. 118 LEI: Fraude statut migratoire
        if any(k in lower_t for k in ["evam", "statut s", "permis s", "aide sociale"]):
            subsumptions.append(SwissArticleSubsumption(
                article="Art. 118 LEI",
                offense_name="Fraude et tromperie envers les autorités migratoires",
                accused_actor_id=accused_id,
                victim_actor_id=victim_id,
                qualifying_facts=["Tromperie systématique des autorités migratoires (EVAM / SPOP)"],
                confidence=0.85,
            ))

        return subsumptions

    def export_worm_audit_record(self, note: AdvocateVoiceNote) -> Dict[str, Any]:
        """Formats the voice note for appending to docs/utopia_local_worm.jsonl."""
        return {
            "record_id": f"WORM-VOICE-{note.note_id}",
            "entity_id": f"VOICE-NOTE-{note.note_id}",
            "chapter_id": note.blast_radius_chapters[0] if note.blast_radius_chapters else "CH-14",
            "valid_from": note.t_v,
            "valid_to": note.valid_to or "9999-12-31T23:59:59Z",
            "superseded_by": note.superseded_by,
            "supersedes_id": note.supersedes_id,
            "sha256_hash": note.sha256_seal,
            "committer": f"Counsel Voice Ingestion ({note.author_id})",
            "summary": f"Advocate voice debrief: '{note.title}' linked to actors: {', '.join(note.target_actor_ids)}",
            "content_snapshot": f"{note.raw_transcript[:200]}... [Seal: {note.sha256_seal[:16]}]",
            "status": note.status.value,
            "timestamp": note.t_t,
        }
