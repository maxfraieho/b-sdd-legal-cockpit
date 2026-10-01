# SpecADR-021: Interim Invariant Rewording & De-identification (L-01..L-05)

**Status:** Proposed  
**Date:** September 2026  
**Standard:** B-SDD Methodology v1.3 (Stage 0 / S00 Pre-Corrections)  
**Supercedes:** Prior hardcoded invariant formulations in ADR-001..020  

---

## 1. Context and Problem Statement
Previous formulations of architectural invariants L-03 and L-04 contained hardcoded real personal names, unverified absolute immunity claims, and hard exceptions that could block truthful recording of authority acts. Furthermore, `.context/active_rules.md` leaked real names directly into LLM prompts during automated sessions.

## 2. Decision and Interim Wordings

### **Invariant L-01: Bitemporal Consistency & WORM Ledger**
- Unchanged in core principle.
- Every legal fact and evidence record is tracked with Valid Time ($T_v$) and Transaction Time ($T_t$). Supersessions are append-only.

### **Invariant L-02: Pure Stdlib Core Runtime**
- Unchanged.
- Modules in `src/legal/` strictly utilize Python standard library.

### **Invariant L-03: Bona Fide Intermediary Flag (PARTY-L03)**
- **Interim Wording:**
  > The system never proposes, generates or executes a seizure, confiscation or accusation against `PARTY-L03` without an explicit lawyer-confirmation flag. Any attempt raises `PROTECTIVE_FLAG(L-03)` and stops until a human confirms. The legal basis is stored as data (`legal_basis`) pending the legal citation audit.
- Rule and code texts use `PARTY-L03`; the local display layer resolves IDs to human-readable names via local mapping.

### **Invariant L-04: Adult Victim Standing (PARTY-L04)**
- **Title:** `Adult Victim Standing`
- **Interim Wording:**
  > The system never infers, suggests or generates a statement that `PARTY-L04` is accused or suspected. Procedural status is taken only from a recorded authority document (`status_source = authority_decision`); anything else is labelled as a party assertion or a lawyer assessment. Outdated references to Art. 219 CP stay annulled.
- Rule and code texts use `PARTY-L04`.

### **Invariant L-05: Cryptographic Evidence Seal & Intake Integrity**
- **Interim Wording:**
  > Unchanged in cryptographic verification (ISO/IEC 27037 64-char SHA-256 seal), plus mandatory compliance with the Evidence Intake Protocol (T8 / `docs/policy/EVIDENCE_INTAKE_PROTOCOL.md`).

---

## 3. Test-Impact Analysis
1. **`test_invariant_l03_bona_fide_shield`**:
   - Changes from hard unconditional `RuntimeError` on matrix compilation to verifying that an attempt without confirmation raises `PROTECTIVE_FLAG(L-03)` and requires `lawyer_confirmed = True`.
   - References switch from hardcoded party names to `PARTY-L03`.
2. **`test_invariant_l04_partie_plaignante_protection`**:
   - Renamed test suite to reflect "Adult Victim Standing".
   - Verifies `status_source = authority_decision` and flags non-authority assertions as `party_assertion` or `lawyer_assessment`.
   - References switch from hardcoded party names to `PARTY-L04`.
3. **`test_preflight_compiler_budget_and_speed`**:
   - Updates assertion checks to look for `PARTY-L04` and `PARTY-L03` rather than real personal names.
   - Enforces word count budget $\le 500$ words and compilation speed $< 50$ ms.

---

## 4. Compliance and Safety
- Adheres to Art. 73 CPP / Art. 13 LLCA confidentiality.
- Eliminates hardcoded PII from model context rules and prompts.
