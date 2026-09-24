# B-SDD Legal Advocate Cockpit: Architecture & System Specification

> **Version:** 1.0.0 (Open-Source Architecture Release)  
> **Framework:** B-SDD (Bitemporal Spec-Driven Development)  
> **Protocols:** Model Context Protocol (MCP 2024-11-05 SSE & Streamable HTTP), JSON-RPC 2.0  
> **User Interface:** Astryx Design System React SPA (Cloudflare Pages)

---

## 1. Executive Summary

**B-SDD Legal Advocate Cockpit** is an open-source, sovereign AI pair-programming and decision-support architecture designed specifically for legal practitioners, advocates, and judicial scholars.

Unlike traditional LLM wrappers that hallucinate facts and blend historical context, B-SDD enforces:
1. **Mathematical Bitemporality ($T_v$ vs $T_x$)**: Distinguishes the valid time of real-world events from the transaction time when evidence was recorded or entered into the legal docket.
2. **Cryptographic Chain of Custody**: Seals every piece of evidence (audio recordings, medical reports, bank statements, affidavits) with immutable SHA-256 hashes and WORM (Write Once, Read Many) audit logs.
3. **Deterministic Pre-flight Compilation**: Verifies that any AI-generated legal reasoning strictly adheres to statutory invariants, procedural rights, and word-budget constraints (<500 words per decision packet) before being accepted.
4. **Universal MCP Ecosystem**: Connects AI models (Gemini Spark, Google AI Studio, Claude Desktop, Cursor) to 24 domain-specific tools via the Model Context Protocol.

---

## 2. Distributed Node Topology

```
                          [ EXTERNAL AI AGENTS & CLIENTS ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         Gemini Spark / Claude Desktop             Advocate Browser Cockpit
         (Model Context Protocol SSE)               (Cloudflare Pages CDN)
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                     ┌───────────────────────────────────────┐
                     │    Edge Gateway / Cloudflare Tunnel   │
                     │    - MCP Endpoint: /sse & /messages   │
                     │    - Full CORS & Probe HEAD Support   │
                     └───────────────────┬───────────────────┘
                                         │  (Encrypted QUIC)
                                         ▼
               ┌───────────────────────────────────────────────────┐
               │              Local Gateway SBC / Proxy            │
               │   - Secure tunnel connector (cloudflared)         │
               │   - AST Code Intelligence Graph (GitNexus :4747)  │
               │   - Sovereign LLM Proxy (:18880)                  │
               └───────────────────┬───────────────────────────────┘
                                   │  (Private LAN)
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│ Production MCP Node  │ │  Evidence & Tasks    │ │  Bitemporal Ledger   │
│                      │ │                      │ │                      │
│ - FastAPI / Uvicorn  │ │ - Autonomous Legal   │ │ - Utopia DB WORM     │
│   Gateway (:8766)    │ │   Supervisor Daemon  │ │   Ledger (:9622)     │
│ - 24 Active MCP      │ │ - Verbatim dossier   │ │ - Relational Graph   │
│   Tools Catalog      │ │   chapters & corpus  │ │   (:9922)            │
│ - Async SSE delivery │ │ - EPUB 3.0 compiler  │ │ - Active invariant   │
│   via Queue          │ │   for tablet readers │ │   verification       │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## 3. Registered Tool Inventory (24 Sovereign MCP Tools)

The gateway exposes 24 specialized tools enabling AI agents to query dossiers, audit contradictions, and synthesize procedural requests:

### Domain 1: Legal Practice & Criminal Procedure
1. `legal_dossier_search`: Semantic search across dossier chapters and statutory articles.
2. `legal_transcripts_query`: Searches audio and message transcripts by timecode, speaker, and keyword.
3. `legal_actor_matrix_get`: Retrieves legal actors and procedural roles with bona fide protection flags.
4. `legal_evidence_get`: Fetches physical and digital evidence records with verified SHA-256 hashes.
5. `legal_sprint_dispatch`: Dispatches autonomous background tasks to the supervisor.
6. `legal_supervisor_status`: Inspects active queues and supervisor health.
7. `legal_epub_rebuild`: Recompiles verified case chapters into standard EPUB 3.0 ebooks.
8. `utopia_db_query`: Runs direct analytical SQL queries against the legal database.

### Domain 2: Bitemporal Data & WORM Ledger
9. `utopia_bitemporal_query`: Queries the bitemporal graph ($T_v$ valid time vs $T_x$ transaction time).
10. `utopia_record_worm_ledger`: Records tamper-proof audit trail entries into the distributed WORM ledger.
11. `utopia_check_invariants`: Verifies active architectural rules and legal boundaries.

### Domain 3: Code Intelligence & AST
12. `gitnexus_ast_query`: Traverses codebase AST dependencies using graph databases.
13. `gitnexus_blast_radius`: Audits the blast radius of structural changes across files.
14. `gitnexus_symbol_search`: Searches symbols, interfaces, and types across workspaces.

### Domain 4: DRAKON Visual Workflows & Cockpit UI
15. `drakon_planar_validate`: Validates algorithmic diagrams for strict planarity (no intersecting lines).
16. `drakon_svg_export`: Renders visual DRAKON decision trees to clean SVG vector graphics.
17. `drakon_code_compile`: Compiles visual logic into verified executable Python or pseudocode.
18. `drakon_macro_flow_synthesis`: Synthesizes multi-step algorithmic workflows.
19. `astryx_canvas_push`: Updates the live visual canvas in the advocate cockpit.
20. `astryx_canvas_get`: Reads the current state of the visual canvas.
21. `astryx_deploy_trigger`: Triggers production builds and deployments to Cloudflare Pages.

### Domain 5: Procedural Skills
22. `skills_catalog_inspect`: Inspects the active procedural skills catalog.
23. `skills_rule_of_two_crystallize`: Crystallizes recurring patterns into formal rules.
24. `skills_verify_immutability`: Verifies that core invariants remain untampered.

---

## 4. B-SDD Legal Invariants (L-01 to L-05)

Every legal application deployed under B-SDD must satisfy five core invariants:

| Invariant | Title | Description |
| :--- | :--- | :--- |
| **L-01** | *Bitemporal Immutability* | Historical facts can never be overwritten in-place. Updates create a new record with a new transaction timestamp ($T_x$) preserving the original valid time ($T_v$). |
| **L-02** | *Zero External Dependencies* | The legal reasoning core must execute on pure Python standard library modules with zero pip dependencies. |
| **L-03** | *Bona Fide Third-Party Shield* | Third-party assistants acting in good faith carry absolute immunity (`bona_fide_protection = True`) and cannot be reclassified as accused parties. |
| **L-04** | *Minor Victim Strict Protection* | Vulnerable minor parties strictly maintain victim status (`VICTIME_PARTIE_PLAIGNANTE`) and can never be characterized as accused. |
| **L-05** | *Cryptographic Evidence Chain* | All media, documents, and transcripts must have an immutable SHA-256 fingerprint before submission or citation. |

---

## 5. Feedback Loops Architecture

```
[ New Event / Evidence ] ──► [ Loop 1: Supervisor Daemon ] ──► [ Queue Processing ]
           │
           ▼
[ Allegation / Charge ]  ──► [ Loop 2: Claim Chart Matrix ] ──► [ Evidence Triangulation ]
           │
           ▼
[ State Update ]         ──► [ Loop 3: WORM Audit Ledger ] ──► [ Tamper-Proof Cryptographic Hash ]
           │
           ▼
[ Pre-Deployment Gate ]  ──► [ Loop 4: Invariant Test Suite ]──► [ Automated Pass / Fail ]
           │
           ▼
[ Advocate Review ]      ──► [ Loop 5: Cockpit UI Overrides ] ──► [ Human-in-the-Loop Refinement ]
```

1. **Loop 1 (Autonomous Supervisor):** Monitors background legal tasks and provides task status reports.
2. **Loop 2 (Claim Chart & Corroboration Matrix):** Cross-checks each legal allegation against verbatim quotes, medical records, and judicial precedents.
3. **Loop 3 (WORM Ledger):** Writes immutable audit logs with commit hashes to prevent retrospective tampering.
4. **Loop 4 (Automated Pre-Flight Gate):** Enforces a test suite verifying invariants L-01 through L-05 before any deployment.
5. **Loop 5 (Human-in-the-Loop Overrides):** Allows practitioners to manually override translations, refine legal terms, and save encrypted notes in the UI.

---

## 6. Security and Authentication

- **Web Cockpit Auth Gate:** Features an emergency PIN lock screen (`0523` default, customizable) with auto-lock timer (15 minutes idle) and session-based security.
- **MCP Gateway Authentication:** Configurable Bearer token authentication or open zero-trust tunnel mode for private Cloudflare tunnels.
- **CORS Architecture:** Configured with wildcard origin headers allowing web-based MCP clients (Google AI Studio, Gemini Spark) to connect securely over HTTPS.
