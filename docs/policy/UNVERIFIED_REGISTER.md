# REGISTER OF UNVERIFIED FIGURES, CITATIONS, AND PROCEDURAL CLAIMS

Standard: B-SDD Methodology v1.3 (S00 Pre-Stage-0 Corrections)
Status: ACTIVE POLICY REGISTER
Authority: GATE F — T6 Claims & Citation Hygiene

---

## 1. UNVERIFIED PERFORMANCE AND RESOURCE FIGURES

The following performance metrics and resource estimates previously mentioned in proposals, brainstorming dossiers, and UI concepts are formal targets. None of them have been forensically benchmarked on the production cluster under verified load conditions. Under Rule T6, each figure is strictly classified as `TARGET (unmeasured)` and must never be represented as an achieved SLA or verified capability.

| # | Item / Metric Description | Claimed Value | Status | Forensic Verification Requirement |
|---|---|---|---|---|
| 1 | Guaranteed Compiler Latency | 12 ms | `TARGET (unmeasured)` | Real-time compiler benchmark across 10,000 WORM ledger states on host `.234`. |
| 2 | Model Generation Throughput | 25–40 tokens/s | `TARGET (unmeasured)` | Measured on local inference host with quantized llama.cpp / vLLM. |
| 3 | Telemetry Noise Filtering | 95% | `TARGET (unmeasured)` | Corroboration benchmark on raw sensor/intake streams. |
| 4 | Context Token Compression Savings | up to 90% | `TARGET (unmeasured)` | Differential token accounting vs raw uncompressed legal transcripts. |
| 5 | Instant Emergency Shred / Wipe | 180 ms | `TARGET (unmeasured)` | Suspended under Policy `docs/policy/PANIC_BUTTON_SUSPENSION.md`; legal review pending. |
| 6 | Layered Memory Model Footprint | 2.4–3.8 GB RAM | `TARGET (unmeasured)` | Measured resident set size (RSS) of Kùzu/graph memory daemon under continuous intake. |

---

## 2. UNVERIFIED JURISPRUDENCE & STATUTORY CITATIONS

The following judicial precedents (Arrêts du Tribunal fédéral - ATF) and procedural statutory references have been incorporated into analytical routines and claim charts. Because none of them have been verified against the official Swiss Federal Supreme Court database (`bger.ch`) or reviewed by admitted Swiss legal counsel for this specific proceeding, they carry the mandatory classification `citation_status: UNVERIFIED — must not appear in any generated filing`.

No filing, formal complaint (*plainte pénale*), appeal (*recours*), or civil conclusion submitted to the *Ministère public du canton de Vaud* or any court may cite these authorities until explicit confirmation by counsel of record.

| # | Legal Authority / Precedent | Context in Codebase | Mandatory Status Tag | Legal Risk / Reason |
|---|---|---|---|---|
| 1 | **ATF 143 III 600** | General civil liability & interest balancing | `citation_status: UNVERIFIED — must not appear in any generated filing` | Not independently verified in context of criminal evidence exploitation. |
| 2 | **ATF 146 IV 9** (consid. 2.1) | Pesée des intérêts for clandestine audio recordings (Art. 139 al. 1, 140, 141 al. 2 CPP) | `citation_status: UNVERIFIED — must not appear in any generated filing` | Question of admissibility of clandestine recordings under Art. 179ter CP / 141 CPP requires formal lawyer confirmation for this specific case. |
| 3 | **ATF 147 IV 9** | Admissibility & proportionality of non-consensual recordings | `citation_status: UNVERIFIED — must not appear in any generated filing` | Strict admissibility conditions must be confirmed by legal counsel prior to formal submission. |
| 4 | **Art. 393 CPP** (as 10-day appeal deadline) | Procedural recourse clock | `citation_status: UNVERIFIED — must not appear in any generated filing` | Procedural deadlines depend on notification dates and authority document type; automatic derivation strictly prohibited (T4). |

---

## 3. L-04 TITLE AUDIT & STANDARDIZATION

The title of Invariant L-04 has been audited across all specifications, ADRs, runtime compilers, and source modules.

- **Canonical Title:** `Adult Victim Standing`
- **Identifier:** `PARTY-L04`
- **Rule Definition:** The system never infers, suggests or generates a statement that PARTY-L04 is accused or suspected. Procedural status is taken only from a recorded authority document (`status_source = authority_decision`); anything else is labelled as a party assertion or a lawyer assessment. Outdated references to Art. 219 CP remain strictly annulled.
- **De-identification:** All public/cloud-facing documentation, prompt injectors, and active rules use `PARTY-L04`. Real personal identities are resolved strictly at the local rendering layer on the sovereign node.

---

## 4. CODEBASE ENFORCEMENT & TEMPLATE SCHEMA

All L2 routine templates, statutory elements, criminal charge charts, and admissibility evaluations in `src/legal/claim_chart.py` and `src/legal/admissibility.py` expose the canonical field:

```python
citation_status: str = "citation_status: UNVERIFIED — must not appear in any generated filing"
```

Any downstream routine, EPUB generator, or export filter encountering this status MUST suppress the citation from external legal filings or flag it for human lawyer review.
