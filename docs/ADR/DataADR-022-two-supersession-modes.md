# DataADR-022: Two Supersession Modes (CHANGE vs CORRECTION)

- **Status:** Proposed
- **Version:** S00 Interim Draft
- **Domain:** Bitemporal Data Architecture (WORM Ledger & Utopia DB)
- **Supersedes:** Implicit single-mode supersession in Sprint 008 / Invariant L-01
- **Related Specifications:** `specs/drakon/supersession_modes.drakon.json`

---

## 1. Context & Architectural Problem

Under the B-SDD bitemporal data model (Invariant L-01), every recorded legal fact is indexed by two independent time dimensions:
1. **Valid Time ($T_v$):** The period during which the fact was true in real-world physical or procedural reality.
2. **Transaction Time ($T_t$):** The period during which the fact was recorded and asserted as true in the database.

In real-world legal proceedings, updates to facts fall into two distinct ontological categories:

### A. CHANGE (Reality Changed)
- **Definition:** The underlying reality itself transitioned (e.g., an actor moved from *personne appelée à donner des renseignements* to *partie plaignante*, a payment was received, or an ordonnance was served).
- **Semantics:**
  - Old record: Closes its valid interval: `valid_to = NOW_UTC`. Its transaction interval remains open (`tx_to = INF`) because it was truly valid during that historical window.
  - New record: Begins its valid interval at `valid_from = NOW_UTC`, `valid_to = INF`, recorded at `tx_from = NOW_UTC`, `tx_to = INF`.

### B. CORRECTION (Recording Error Rectification)
- **Definition:** The recorded data was factually erroneous from the beginning (e.g., a misspelled surname, an incorrect date of birth, or an erroneous IBAN). Reality did NOT change.
- **Semantics:**
  - Old record: Closes its transaction interval: `tx_to = NOW_UTC`. It is retracted as of now, but preserved forever for auditability. Its valid interval $[valid\_from, valid\_to]$ remains UNCHANGED.
  - New record: Retains the *identical* valid interval $[old.valid\_from, old.valid\_to]$, but starts a new transaction interval at `tx_from = NOW_UTC`, `tx_to = INF`. Nothing is deleted.

---

## 2. Audit of Current Implementation

### Repository & Utopia DB Verdict: `PARTIAL`

- **Current API (`src/legal/server.py:175-189`):**
  The endpoint `POST /api/v1/facts/calibrate` implements only:
  ```python
  "superseded_valid_to": now_utc,
  "new_tv": new_tv or original_tv,
  ```
- **Consequence:** Current supersession logic is strictly a **CHANGE** implementation. It lacks `tx_to` tracking and always closes `valid_to`.

### Historical Distortion Caused by Applying CHANGE to Corrections
If an operator attempts to rectify an erroneous date of birth using `valid_to = NOW`:
1. The system records that the erroneous date was physically true from birth until today (`valid_to = NOW_UTC`).
2. The system records that the correct date became true only today (`valid_from = NOW_UTC`).
3. Any point-in-time query ($As-Of(T_v = T_{incident})$) executed for a court filing will mathematically extract the **erroneous** date as the historical truth, corrupting judicial filings.

---

## 3. Decision & Target Architecture

1. **Two Explicit Modes:** The WORM ledger schema and all calibration endpoints must require an explicit parameter:
   `mode: Literal["CHANGE", "CORRECTION"]`
2. **Schema Invariant:**
   - For `CHANGE`: Old row sets `valid_to = NOW_UTC`.
   - For `CORRECTION`: Old row sets `tx_to = NOW_UTC`; new row inherits `valid_from` and `valid_to` from old row.
3. **Mandatory Provenance Fields:**
   - `supersession_reason`: Non-empty description of why the change or correction occurred.
   - `source_document_hash`: SHA-256 seal of the vault item proving the correction or change.
   - `operator_id`: Identity of the user recording the entry.

---

## 4. DRAKON Formalization

The branching and rejoining logic is formalized in `specs/drakon/supersession_modes.drakon.json`, strictly complying with:
- Planar Invariant: $C = 0$ (Zero line crossings).
- Skewer Invariant: $X = 0$ (Primary execution path on canonical vertical axis).
- Branching: Branches after `read_current_active` and rejoins before `atomic_worm_insert`.

---

## 5. Specification of Failing Tests (Pre-Implementation Verification)

When implemented, the following test cases must pass:

```python
def test_correction_mode_preserves_valid_time_interval():
    # GIVEN an existing record with valid_from=T_PAST_START, valid_to=INF
    # WHEN a CORRECTION is applied with new attribute
    # THEN old_record.tx_to == now_utc
    # AND old_record.valid_to == INF (not modified)
    # AND new_record.valid_from == T_PAST_START
    # AND new_record.valid_to == INF
    pass

def test_correction_mode_closes_transaction_time():
    # Verifies that old row tx_to is terminated at NOW_UTC
    pass

def test_point_in_time_query_returns_corrected_value_for_past_valid_time():
    # Verifies that AsOf(Tv=T_PAST, Tt=NOW) returns the corrected value,
    # whereas AsOf(Tv=T_PAST, Tt=Yesterday) returns the uncorrected value.
    pass
```

---

## 6. Safest Interim Procedure Under Current API

Until DataADR-022 engine support is deployed:
1. **Rule:** **NEVER** use `POST /api/v1/facts/calibrate` to fix data errors (names, birth dates, document dates).
2. **Procedure:** Record corrections in an audit note log (`docs/policy/INTERIM_CORRECTIONS_LOG.jsonl`) referencing the `entity_id`, the corrected value, `reason`, and the `source_vault_hash`, without mutating `valid_to`.
3. **Distortion Identified:** The system will retain the uncorrected value in active queries until migration; however, this avoids the irreversible mathematical poisoning of valid-time history that `valid_to = NOW` would inflict.
