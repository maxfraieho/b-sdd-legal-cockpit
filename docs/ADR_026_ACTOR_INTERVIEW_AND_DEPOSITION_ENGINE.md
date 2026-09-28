# ADR-026: Advocate Voice Notes & Deposition Ingestion Engine
**Status:** Accepted & Implemented (Backend Core: Sprint 013/014)  
**Date:** 2026-09-28  
**Author:** Principal Legaltech Systems Architect & B-SDD Autonomous Systems  
**Dossier Reference:** `PE24.014624-SBA` (Ministère public du Canton de Vaud)  
**Standard:** B-SDD Methodology v1.2, ISO/IEC 27037, Invariants L-01 to L-05  

---

## 1. Context & Problem Statement
In complex Swiss criminal and civil proceedings (such as `PE24.014624-SBA`), legal counsel and judicial operators require rapid, high-fidelity capture of courtroom debriefs, witness interrogations, client updates, and strategy reflections immediately following procedural events.

Existing interview modules address structured, bidirectional Q&A with the client. However, an advocate's operational debrief differs fundamentally:
1. **Unilateral Attorney Work Product:** Dictations reflect confidential tactical assessments, direct statutory qualifications, and evidence cross-references.
2. **Procedural Invariant Sensitivity:** Voice transcriptions frequently risk accidental misqualification (e.g., misnaming a bona fide third party as an accused, or inadvertently reverting to outdated statutes).
3. **Bitemporality ($T_v$ vs $T_t$):** An advocate dictation recorded today ($T_t$) often relates to facts occurring months or days earlier ($T_v$), requiring strict separation.
4. **WORM Chain of Custody:** Under ISO/IEC 27037 and Art. 73 CPP, tactical debriefs and corroborative notes must be cryptographically sealed with SHA-256 to prove non-tampering.

---

## 2. Decision & Architectural Specification

### 2.1. Pure Python Stdlib Core (`src/legal/advocate_voice_notes.py`)
In accordance with **Invariant L-02 (ADR-002)**, the backend engine is written entirely with Python 3.11+ standard library modules (`dataclasses`, `datetime`, `hashlib`, `json`, `enum`, `typing`, `re`).

The module exposes:
- `AdvocateVoiceNote`: Immutable data class capturing audio metadata, segments, timestamps ($T_v, T_t$), raw transcript, legal observations, statutory subsumptions, and SHA-256 seal.
- `SwissArticleSubsumption`: Qualification against Swiss Penal Code (Art. 138, 146, 156, 180, 181, 186, 303, 304 CP) and LEI (Art. 118).
- `AdvocateVoiceNoteEngine`: Central business manager enforcing:
  1. **Invariant L-01 (WORM Bitemporality):** Non-destructive supersession (`supersede_note`). Historical records are preserved with `valid_to` and `superseded_by`.
  2. **Invariant L-03 (Bona Fide Shield):** Absolute immunity for Adriano MILLI (`ACT-ADRIANO-MILLI`, Art. 933 CC / Art. 105 al. 2 CPP). Any attempt to set Adriano MILLI as `accused_actor_id` or mention him as prévenu raises `BonaFideProtectionViolation`.
  3. **Invariant L-04 (Adult Victim Protection):** Arsen KOVALENKO (b. 05.11.1999, 26 years old) is legally protected as an adult victim/claimant (Art. 115, 118, 122 CPP). Inadvertent inclusion of Art. 219 CP (minor offenses) or designating Arsen as accused raises `AdultVictimProtectionViolation`.
  4. **Invariant L-05 (Cryptographic Evidence Seal):** Canonical JSON serialization sealed with SHA-256. Tampering invalidates the seal immediately.
  5. **Blast Radius Analysis:** Automates impact calculation across chapters `CH-01` to `CH-18` of the legal dossier.

### 2.2. Complementary Separation: Voice Notes vs. Client Interview
- **Client Interview Service:** Structured factual questionnaire and interactive intake.
- **Advocate Voice Notes Engine:** Sovereign attorney debriefing, AI-assisted subsumption extraction, participant binding, and blast radius calculation. The voice notes engine directly enriches the legal docket without duplicating interview flows.

### 2.3. Frontend Implementation Strategy
Per architectural directive, the frontend interface for voice recording, waveform visualization, and real-time AI transcription review is dispatched to Google AI Studio via a comprehensive prompt specification (`AI_STUDIO_ADVOCATE_VOICE_NOTES_PROMPT.md`).

---

## 3. Invariants & Guardrails

| Invariant | Scope | Verification Mechanism |
| :--- | :--- | :--- |
| **L-01** | Bitemporality WORM | `test_invariant_l01_worm_bitemporal_supersession` |
| **L-02** | Pure Standard Library | `test_pure_stdlib_in_src_legal` (AST inspection) |
| **L-03** | Bona Fide Immunity | `BonaFideProtectionViolation` check on Adriano MILLI |
| **L-04** | Adult Victim Status | `AdultVictimProtectionViolation` check on Arsen KOVALENKO |
| **L-05** | Cryptographic Seal | `verify_seal()` SHA-256 deterministic digest |

---

## 4. Consequences & Benefits
- **Zero Invariant Drift:** Legal safeguards are enforced at the compiler/engine level before any LLM output can be committed.
- **Rapid Ingestion:** Attorneys can dictate 2–10 minute debriefings, immediately receiving auto-extracted Swiss CP article candidates with exact chapter impacts.
- **Traceability:** Full WORM compatibility allows seamless synchronization with Utopia DB and local audit trails.
