# CLOUD EGRESS POLICY

Standard: B-SDD Methodology v1.3 (Stage 0 / S00 Pre-Corrections)
Status: Approved Policy
Enforcement: Mandatory

## Egress Destination Boundaries

| System | May receive | Must not receive |
|---|---|---|
| Cloud LLMs (agy model, Gemini Deep Research, Claude) | Architecture, code, ADRs, roles (`PARTY-*`), statute text, anonymised examples | Real names, birth dates, addresses, case numbers, passport or ID data, dossier text, transcripts, audio, photos, bank data, amounts tied to identifiable persons |
| NotebookLM SSoT | ADR ledger, methodology, code documentation | Same list as above |
| Telegram bot and n8n | Sprint status, gate names, pass/fail counts | Any case data, names, file contents |
| Git remote | Code, specs, ADRs, manifests without personal data | Scans, dossier files, `.private/`, vault |
| Local only (phone, dev node, vault) | Everything else | — |

## Operational Rules
1. Pre-commit hook runs `scripts/pii_scan.py` on staged files.
2. Binary files (PDF, image, audio, video) outside test fixtures are blocked from git.
3. Vault directories and `.private/` are permanently ignored.
