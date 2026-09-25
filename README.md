# B-SDD Legal Advocate Cockpit
### Sovereign AI Pair-Programming & Decision Architecture for Legal Practice

[![B-SDD Invariants](https://img.shields.io/badge/B--SDD-Invariants%20Verified-emerald?style=flat-square)](docs/ARCHITECTURE.md)
[![User Guide](https://img.shields.io/badge/Documentation-User%20Guide-blue?style=flat-square)](docs/USER_GUIDE.md)
[![Developer Guide](https://img.shields.io/badge/Documentation-Developer%20Guide-purple?style=flat-square)](docs/DEVELOPER_GUIDE.md)
[![Model Context Protocol](https://img.shields.io/badge/MCP-2024--11--05%20SSE-blue?style=flat-square)](https://modelcontextprotocol.io)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-Live%20Deploy-orange?style=flat-square)](https://pages.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=flat-square)](LICENSE)
[![Python Stdlib Core](https://img.shields.io/badge/Core-100%25%20Pure%20Python-yellow?style=flat-square)](src/legal/)

---

## Documentation

- 📘 **[Посібник Користувача (User Guide)](docs/USER_GUIDE.md)**: Детальне керівництво для адвокатів, слідчих аналітиків та потерпілих. Охоплює роботу з речовими доказами (аудіо, EXIF фото), Майстер додавання доказів через ШІ, вибір провайдерів (проксі .184 / Gemini), управління базою кодексів та експорт на Kindle.
- 🛠️ **[Керівництво Розробника (Developer Guide)](docs/DEVELOPER_GUIDE.md)**: Повний технічний опис архітектури B-SDD, стек React 19 + TypeScript + Tailwind 4, 30 інструментів MCP Gateway, конфігурація OpenAI-сумісного проксі та інваріанти L-01..L-05.
- 📐 **[Архітектурна Специфікація (Architecture Spec)](docs/ARCHITECTURE.md)**: Деталі розподіленої топології вузлів, шлюзів та форматів протоколів.
- 🔄 **[Специфікація Контурів Зворотного Зв'язку (Feedback Loops)](docs/FEEDBACK_LOOP_SPEC.md)**: 5 безперервних контурів верифікації фактів та супервайзера.

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

### 1. 30 Sovereign MCP Tools
The gateway provides full coverage across legal analysis, architecture documentation, planning, and bitemporal data retrieval:
- **Legal Practice (8 tools):** `legal_dossier_search`, `legal_transcripts_query`, `legal_actor_matrix_get`, `legal_evidence_get`, `legal_sprint_dispatch`, `legal_supervisor_status`, `legal_epub_rebuild`, `utopia_db_query`.
- **Documentation & Plan Management (6 tools):** `legal_docs_list`, `legal_docs_read`, `legal_docs_write`, `legal_plan_save`, `legal_plans_list`, `legal_plan_get`. Enables Gemini Spark & AI architects to read, update, and manage specs and implementation plans.
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

### 4. AI-Powered Legal Evidence Ingestion Wizard
- **Multi-Source Ingestion**: Load exhibits from Google Docs links, local audio files (MP3/WAV/M4A), EXIF-bearing crime scene photos, or court depositions.
- **Automated AI Qualification**: Evaluates admissibility under Swiss Federal Supreme Court jurisprudence (ATF 146 IV 9), establishes statutory elements, intent, aggravating factors, and civil sequestration damages (CHF 46'850).
- **Human-in-the-Loop Refinement**: Advocate reviews, adjusts, and signs evidence into the permanent docket with instant SHA-256 verification.

### 5. Multi-Provider AI Architecture
- **Free Sovereign AI Proxy**: Connects to on-premise or remote OpenAI-compatible proxies (host `192.168.3.184:18880/v1`) with model slots for Qwen 2.5 72B, LLaMA 3.3 70B Instruct, and Mistral Large.
- **Google Gemini 3.8 Cloud**: High-speed semantic analysis with `gemini-3.8-flash` and `gemini-3.8-pro` with calibrated legal temperature (0.1–0.2).
- **100% Offline MemPalace Engine**: Graph traversal over 8'746 semantic nodes in KùzuDB and Utopia DB WORM Ledger without external network requests.

### 6. Swiss Codes & Cantonal Vaud Corpus Manager
- **Complete Statutory Coverage**: Pre-loaded with Swiss Criminal Code (CP), Criminal Procedure Code (CPP), Civil Code (CC), Code of Obligations (CO), Canton de Vaud laws (LOJV, CDPJ), and ATF rulings.
- **Active Filter Toggles**: Toggle individual articles active or inactive to customize the AI's evidentiary evaluation criteria.
- **JSON Import & Export**: One-click JSON backup and import of customized legal corpora.

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
