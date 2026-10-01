# SpecADR-023: Evidence and Actor Data Rules

- **Status:** Proposed
- **Version:** S00 Interim Draft
- **Domain:** Data Architecture, Forensic Ingestion & Actor Registry
- **Standard:** B-SDD Methodology v1.3 (S00 Pre-Stage-0 Corrections)
- **Supersedes:** Legacy hardcoded figures and ungrounded actor claims in Sprint 003-010
- **Enforcement:** Invariant L-01, Invariant L-02, Invariant L-03, Invariant L-04, Invariant L-05

---

## 1. Context & Rationale

Prior iterations of the legal co-pilot stored hardcoded derived figures (ages, aggregated damage amounts, transcript counts) as static text fields. Furthermore, actor roles lacked explicit provenance attribution, and evidence intake lacked formal verification procedures before ingestion.

This SpecADR establishes the 5 mandatory data rules governing all future state representations across the knowledge graph, WORM ledger, and application layers.

---

## 2. The Five Mandatory Data Rules

### Rule 1: Derived Values Are Never Stored
- **Principle:** Stored data represents elementary atomic observations only. No ages, sum totals, days remaining, deadline countdowns, or entity counts may be persisted in schemas, JSON stores, or database tables.
- **Computation at Display Time:**
  - Age is computed at query time: `age_years = floor((query_date - birth_date) / 365.25)`.
  - Financial totals are computed dynamically from validated line items.
  - Days remaining on procedural deadlines are never displayed or counted down (Rule T4).
  - Transcript and chapter counts are derived dynamically from verified manifest records, never typed as integer literals in code or documentation.

### Rule 2: Line-Item Accounting for Monetary Values
- **Principle:** All financial claims, damages, and restitution figures must be stored strictly as individual line items.
- **Mandatory Fields per Item:**
  - `amount`: Exact numeric value (DECIMAL / float).
  - `currency`: Standard 3-letter currency code (e.g., `CHF`, `USD`, `EUR`).
  - `exchange_rate`: Exchange rate applied (if conversion occurs).
  - `rate_date`: Exact date for the conversion rate.
  - `source`: Citation to evidence vault item hash or bank record proving the transaction.
- **Total Aggregation:** Totals are always computed dynamically at runtime; discrepancies between claimed amounts and line items trigger a verification flag.

### Rule 3: Actor Registry Provenance & Multi-Variant Identity
- **De-identified Primary Keys:** All actor entities use canonical keys `PARTY-L03`, `PARTY-L04`, `ACT-*`. Real identities are strictly mapped in local `.private/` storage.
- **Procedural Role Provenance:** Every role assigned to an actor must carry:
  - `role_name`: Standard procedural role (e.g., `partie_plaignante`, `victime`, `prevenu`, `tiers_interesse`).
  - `status_source`: Mandatory provenance enum:
    - `authority_decision`: Formal order/decision from Ministère public or court.
    - `party_filing`: Assertion made in a formal submission by a party.
    - `lawyer_assessment`: Evaluation by legal counsel.
    - `unverified`: Raw assertion pending review.
  - `valid_from` / `valid_to`: Temporal validity of the role.
- **Identity Fields:**
  - Name variants and transliterations (Cyrillic, Latin, French, German spellings).
  - Date of birth (`YYYY-MM-DD`).
  - Nationality.
  - Document references pointing to vault items by SHA-256 hash (no raw passport numbers in the graph).
  - Relation edges (family, corporate, mandate).
- **Subjective Classifications:** Labels such as "principal perpetrator" or "instigator" MUST be attributed with `asserted_by = lawyer` and must not be asserted as uncontested facts.

### Rule 4: Explicit Bitemporal Supersession Modes
- Updates to existing data must declare their mode:
  - **CORRECTION Mode:** For errors in recording. Closes `tx_to = NOW_UTC`, preserves `[valid_from, valid_to]`. Requires `reason` and `source_document`.
  - **CHANGE Mode:** For changes in physical or legal reality. Closes `valid_to = NOW_UTC`, creates new validity window.

### Rule 5: Evidence Item Forensic Metadata
Every evidence item registered in the system must contain:
1. `sha256`: Authentic 64-character lowercase SHA-256 hash.
2. `size_bytes`: Exact byte count.
3. `original_filename`: Base filename at acquisition.
4. `source`: Provenance of who provided the file and method of transfer.
5. `acquisition_time_zurich`: Timestamp in `Europe/Zurich` time.
6. `acquisition_time_utc`: ISO 8601 UTC timestamp.
7. `device_or_app`: Source recording device, camera, or communication application.
8. `copy_type`: `original`, `photograph_of_original`, `scan`, or `transcript`.
9. `authenticity_status`: Default `unverified` until forensic confirmation.
10. `legality_review`: Default `pending` for all audio/video recordings (Art. 179ter CP / Art. 141 CPP).
11. `derivatives`: List of linked derivative files (e.g., transcripts or enhanced audio) referenced by SHA-256 hash. Audio originals and their transcripts must both be hashed and bidirectionally linked.

---

## 3. Protocol Binding

Operational ingestion of evidence according to these rules is governed by `docs/policy/EVIDENCE_INTAKE_PROTOCOL.md`.
