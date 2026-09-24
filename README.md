# B-SDD Legal Advocate Cockpit
### Sovereign AI Pair-Programming & Decision Architecture for Legal Practice

[![B-SDD Invariants](https://img.shields.io/badge/B--SDD-Invariants%20Verified-emerald?style=flat-square)](docs/ARCHITECTURE.md)
[![Model Context Protocol](https://img.shields.io/badge/MCP-2024--11--05%20SSE-blue?style=flat-square)](https://modelcontextprotocol.io)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-Live%20Deploy-orange?style=flat-square)](https://pages.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=flat-square)](LICENSE)
[![Python Stdlib Core](https://img.shields.io/badge/Core-100%25%20Pure%20Python-yellow?style=flat-square)](src/legal/)

---

## Overview

**B-SDD Legal Advocate Cockpit** is an open-source, sovereign framework designed for attorneys, advocates, and judicial scholars seeking to integrate modern AI capabilities into complex legal proceedings without hallucination risks or loss of evidentiary chain of custody.

Built upon the principles of **B-SDD (Bitemporal Spec-Driven Development)**, the cockpit enforces:
- **Bitemporal Fact Verification**: Distinguishes valid time ($T_v$, when events occurred) from transaction time ($T_x$, when evidence was logged).
- **Cryptographic Chain of Custody**: Seals every document, audio exhibit, and medical report with immutable SHA-256 hashes.
- **Model Context Protocol (MCP)**: Exposes 24 specialized tools via SSE & Streamable HTTP for seamless integration with **Gemini Spark**, **Google AI Studio**, **Claude Desktop**, and local AI agents.
- **Multi-Language Advocate Cockpit**: Responsive React application (Astryx design system) featuring triple-language support (Ukrainian, French, English), PIN-protected authorization gate, and manual translation override modes.

---

## Architecture

```
                    ┌────────────────────────────────────────┐
                    │      AI Client Ecosystem               │
                    │  (Gemini Spark / Claude / Cursor)      │
                    └───────────────────┬────────────────────┘
                                        │ (MCP SSE Transport)
                                        ▼
                    ┌────────────────────────────────────────┐
                    │      Cloudflare Edge / Tunnel          │
                    │   - Public HTTPS & CORS Proxy          │
                    │   - Probe HEAD Handshake (200 OK)      │
                    └───────────────────┬────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   B-SDD Legal MCP Gateway (:8766)                      │
│                                                                        │
│  [Legal Toolkit]       [Utopia Bitemporal]     [GitNexus Code AST]    │
│  • Dossier Search      • Bitemporal Graph      • AST Query            │
│  • Transcript Query    • WORM Ledger           • Blast Radius         │
│  • Actor Matrix        • Invariant Checks      • Symbol Search        │
│  • Evidence Hashes                                                     │
│                                                                        │
│  [DRAKON Visual Flows] [Astryx Canvas]         [Procedural Skills]    │
│  • Planar Validation   • Real-Time Push        • Rule of Two          │
│  • SVG Vector Export   • Cloudflare Deploy     • Immutability Audit   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Advocate Cockpit Web UI                            │
│  - Cloudflare Pages SPA (Astryx Primitives & Tailwind CSS)             │
│  - Triple-Language Support (UK / FR / EN) with Manual Override         │
│  - AuthGate Emergency PIN Lock & Auto-Lock Timer                       │
│  - Live Claim Charts, Confrontation Matrix & DRAKON Renderers          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. 24 Sovereign MCP Tools
The gateway provides full coverage across legal analysis, evidence verification, and bitemporal data retrieval:
- **Legal Practice (8 tools):** `legal_dossier_search`, `legal_transcripts_query`, `legal_actor_matrix_get`, `legal_evidence_get`, `legal_sprint_dispatch`, `legal_supervisor_status`, `legal_epub_rebuild`, `utopia_db_query`.
- **Utopia DB & WORM (3 tools):** `utopia_bitemporal_query`, `utopia_record_worm_ledger`, `utopia_check_invariants`.
- **GitNexus Code Intelligence (3 tools):** `gitnexus_ast_query`, `gitnexus_blast_radius`, `gitnexus_symbol_search`.
- **DRAKON Visual Algorithms (4 tools):** `drakon_planar_validate`, `drakon_svg_export`, `drakon_code_compile`, `drakon_macro_flow_synthesis`.
- **Astryx Cockpit Primitives (3 tools):** `astryx_canvas_push`, `astryx_canvas_get`, `astryx_deploy_trigger`.
- **Procedural Skills (3 tools):** `skills_catalog_inspect`, `skills_rule_of_two_crystallize`, `skills_verify_immutability`.

### 2. Five B-SDD Invariants (L-01 to L-05)
1. **L-01 (Bitemporal Immutability):** Records cannot be overwritten in place; historical snapshots remain queryable.
2. **L-02 (Zero External Dependencies):** The legal reasoning core runs on pure Python standard library modules.
3. **L-03 (Bona Fide Shield):** Absolute procedural immunity for good-faith third-party assistants.
4. **L-04 (Minor Victim Protection):** Vulnerable minor victims strictly retain plaintiff/victim status and cannot be reclassified as accused.
5. **L-05 (Cryptographic Proof):** Every factual exhibit must carry a verifiable SHA-256 hash.

### 3. Five Continuous Feedback Loops
- **Loop 1 (Autonomous Task Supervisor):** Background task scheduling and health monitoring.
- **Loop 2 (Claim Chart & Corroboration Matrix):** Triangulates statutory elements against evidence citations.
- **Loop 3 (WORM Ledger):** Immutable audit trail recording every state transition.
- **Loop 4 (Automated Pre-Flight Gate):** 15 unit tests executed before any deployment.
- **Loop 5 (Human-in-the-Loop Refinement):** In-cockpit lawyer overrides for translations and notes.

---

## Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm (for frontend cockpit)

### 1. Launch the Legal MCP Gateway
```bash
# Clone the repository
git clone https://github.com/maxfraieho/b-sdd-legal-cockpit.git
cd b-sdd-legal-cockpit

# Start the gateway on port 8766
python3 deploy/mcp_gateway/legal_gateway.py
```

### 2. Run the Advocate Cockpit UI
```bash
cd b-sdd-legal-ui
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. Enter default PIN `0523` to unlock the cockpit.

### 3. Connect to Gemini Spark / Google AI Studio
In your MCP client or AI Studio Custom Tools configuration, specify:
```json
{
  "mcpServers": {
    "b-sdd-legal": {
      "url": "https://legal-mcp.exodus.pp.ua/sse"
    }
  }
}
```

---

## Project Structure

```
b-sdd-legal-cockpit/
├── b-sdd-legal-ui/             # React 18 + Vite + Tailwind CSS Advocate Cockpit
│   ├── src/components/         # Astryx components, AuthGate, SettingsModal
│   ├── src/data/               # Anonymized benchmark charges, exhibits & translations
│   └── src/lib/                # Translation engine and legal type definitions
├── daemon/                     # Autonomous legal supervisor daemon
├── deploy/mcp_gateway/         # Production FastAPI MCP Gateway & Toolkits
│   ├── legal_gateway.py        # Gateway server (SSE, StreamableHTTP, HEAD probes)
│   ├── toolkit_legal.py        # Legal tools specification & handlers
│   └── legal_config.json       # Upstream endpoints and CORS configuration
├── docs/                       # Technical architecture & feedback loop specs
├── src/legal/                  # Pure Python B-SDD reasoning core
│   ├── actors.py               # Procedural actor matrix and graph
│   ├── claim_chart.py          # Statutory elements and corroboration engine
│   ├── preflight_compiler.py   # Sub-500 word deterministic snapshot compiler
│   └── timeline_calibrator.py  # Bitemporal calibration & DRAKON schema synthesis
├── tests/                      # Python unit test suite (Invariants L-01..L-05)
└── README.md                   # Project overview & documentation
```

---

## Verification & Testing

Run the pre-flight verification test suite:
```bash
python3 -m unittest discover tests
```
Expected output:
```text
...............
----------------------------------------------------------------------
Ran 15 tests in 0.292s

OK
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
