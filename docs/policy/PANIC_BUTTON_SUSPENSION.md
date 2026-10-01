# PANIC BUTTON & EMERGENCY WIPE MORATORIUM

**Status:** SUSPENDED — legal review  
**Standard:** B-SDD Methodology v1.3 (Stage 0 / S00 Pre-Corrections)  
**Classification:** Mandatory Architectural Policy  

---

## 1. Context and Legal Risk
Emergency data destruction mechanisms (such as "panic buttons", "180 ms instant shred", or local kill switches) pose severe legal and evidentiary risks under Swiss criminal procedure:
1. **Destruction of Evidence (Art. 305 CP):** Concealing, altering, or destroying evidence relevant to criminal proceedings carries direct criminal liability.
2. **Breach of B-SDD Core Invariant L-01 (WORM Ledger):** The foundational requirement of B-SDD is append-only immutability. Physical deletion or shredding of records contradicts the non-destructive supersession model.
3. **Loss of Exculpatory and Inculpatory Records:** Clandestine or unilateral destruction prevents independent judicial audit under Art. 139 al. 1 CPP.

---

## 2. Policy Enforcement
1. **Formal Suspension:** All architectural concepts, proposals, specifications, and exploratory code relating to panic buttons, StrongBox automated wiping, or instantaneous data shredding are formally **SUSPENDED — legal review**.
2. **Destructive Operations Guard:** In the event any maintenance or pruning functionality is introduced, it must be guarded by an immutable flag that strictly defaults to OFF:
   ```python
   ALLOW_DESTRUCTIVE_OPERATIONS = False
   ```
3. **Automated Verification:** The test suite verifies that zero automatic data destruction operations are enabled in runtime modules.
