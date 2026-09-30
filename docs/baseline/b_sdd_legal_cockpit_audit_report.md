# B-SDD Legal Cockpit — аудит Legal AI та доказових конвеєрів

**Дата аудиту:** 30 September 2026 (UTC)  
**Репозиторій / ревізія:** `maxfraieho/b-sdd-legal-cockpit`, гілка `cow/s00b_remediation`, `2b33905`  
**Метод:** статичний аудит у режимі read-only; робочий код не змінювався. Виконано `python -m unittest discover -s tests -v`: **26 PASS, 2 SKIP** (віддалений MCP URL не налаштований). `npm test` відсутній у `package.json`.

> Це технічний аудит, а не юридична порада і не висновок про допустимість конкретного доказу. Відповідність вимогам швейцарського процесу має підтвердити допущений у справі швейцарський адвокат / forensic expert.

## 1. Executive Summary

### Висновок

Репозиторій є переконливим **демонстраційним LegalTech cockpit** з типами домену, WORM-подібною бітемпоральною моделлю, Swiss claim charts, локальними UI-потоками та добре покритим stdlib Python ядром. Він **не готовий до production-імпорту судових доказів** і не може в поточному вигляді заявляти court-grade provenance, OCR-обґрунтованість чи фактичну інтеграцію з MemPalace/KùzuDB.

Найсуттєвіша проблема: `EvidenceIngestionWizard.tsx` хешує файл, але для зображень та аудіо формує описовий текст-заглушку; потім класифікує його локальними ключовими словами і створює цитату через `inputText.slice(0, 180)`. Немає сервісу завантаження в Appwrite у цьому потоці, OCR, parser/layout model, page/word offsets, bounding boxes, transcript provenance або server-side acceptance gate. Назва “WORM” не дорівнює криптографічно незмінному журналу: UI може переписати `localStorage`, а `commitAtomicSupersession` змінює попередній запис у масиві перед повторним збереженням.

### Рівень готовності

| Напрям | Оцінка | Підстава |
|---|---:|---|
| UI та локальний workflow | частково готово | wizard, Google Drive picker, claim-chart views, RBAC типи |
| Ланцюг зберігання доказу | критично недостатньо | хеш є, але provenance, immutable storage, upload/commit linkage відсутні |
| OCR, верстка і spatial grounding | відсутньо | у коді немає Docling/Marker/Surya/Tesseract/PDF layout pipeline, `bbox` чи `page` моделі |
| Факти / timeline / claim charts | частково готово | Python dataclasses підтримують Tv/Tt, citations і conflict flag, але це benchmark/in-memory data |
| Utopia DB | частково / небезпечно | є read-only SQL guard у gateway, але клієнт містить hard-coded пароль та SSH host-key bypass |
| MemPalace KùzuDB | декларативно | UI flags і текстові “matches”; немає Kùzu client, schema, Cypher або graph persistence |
| Дедуплікація / hybrid retrieval | відсутньо | SHA-256 є лише як хеш; немає pgvector, HNSW, BM25/GIN, RRF(k=60) |
| HITL і anti-hallucination | частково / недостатньо | є chat і кнопка commit, проте немає незмінного reviewer decision, exact-source verifier або mandatory approval policy |

**Рішення для експлуатації:** не приймати AI-висновки, generated citations або статус `admissible` як факти справи до реалізації Phase 1–3 нижче. Застосовувати поточну версію лише як sandbox/демо або інтерфейс ручної роботи.

## 2. Детальний аудит кодової бази

### 2.1 Імпорт та первинний аналіз

**Знайдено.**

- `b-sdd-legal-ui/src/components/EvidenceIngestionWizard.tsx` має джерела `gdocs | file | audio | photo | manual`; Web Crypto SHA-256 обчислюється для тексту або bytes локального файлу.
- `b-sdd-legal-ui/src/lib/googleDrivePicker.ts` розбирає Drive URL, завантажує Google Docs як `format=txt` або файл як bytes, і обчислює SHA-256.
- `GoogleDriveBrowserModal.tsx` містить каталог canonical demo items і preview-URL у `public/evidence/`.
- `appwriteDb.ts` має окремі функції `uploadEvidenceFile`, `pushWormRecordToCloud`, але wizard їх не викликає. Його `handleFinalCommit` лише передає сформований `BordereauPiece` callback-у; callback в `App.tsx` показує toast без додавання до централізованого evidence store чи WORM/Appwrite commit.

**Критичні прогалини.**

- Для image/audio wizard не витягає EXIF, не робить OCR/ASR, а записує шаблонний опис. PDF/DOCX не парсяться: тільки text/markdown читаються у `inputText`; решта файлів не має content extraction.
- Немає `Document`, `Page`, `LayoutBlock`, `Table`, `Token`, `BoundingBox`, `TextAnchor` або coordinate transform. Отже неможливі click-to-source, підсвічування фрагмента, перевірка таблиці чи цитата “сторінка + прямокутник”.
- Google Drive fetch має fallback, який у разі HTTP/CORS/permission failure створює синтетичний текст “матеріал зареєстровано…”, хешує **його**, а не оригінал. Це неприпустимий provenance failure: такого об’єкта не слід дозволяти до evidence commit.
- `citation_cle` утворюється урізанням введеного тексту, а не посиланням на доказовий текст і offsets. `confidence_score=98.4` задано статично.
- Канонічні Drive items та численні SHA-256 у demo data — літерали. Не встановлено, що вони відповідають файлам в `public/evidence`.

### 2.2 Розмежування demo та приватних даних

`legalData.ts` оголошує `DataMode = 'demo' | 'real'`, а `vite.config.ts` підміняє alias `@case-data` залежно від `VITE_DATA_MODE`. Це правильний напрям. Однак `b-sdd-legal-ui/src/data/realLegalData.ts` **відсутній**. Якщо встановити `VITE_DATA_MODE=real`, build-resolve зламається; production separation не реалізовано. Demo-матеріали, ідентифікатори та персональні дані також вбудовані у bundle/public assets, що потребує окремої перевірки на privacy/retention.

### 2.3 Utopia DB, MemPalace та WORM

**Utopia.** `src/legal/utopia_client.py` і `daemon/legal_mcp_gateway.py` реалізують SSH + `docker exec psql` до `192.168.3.251`. Gateway обмежує SQL `SELECT`; це корисна boundary control. Але `utopia_client.py` містить облікові дані в коді (`UTOPIA_PASS`), запускає `sshpass` і `StrictHostKeyChecking=no`; це P0 security finding. У `LegalPreflightCompiler` live query опціональний, а типовий результат — хардкоджений fallback matrix F_1…F_4.

**MemPalace.** Є `AIProviderMode = 'mempalace_builtin'`, settings flags, UI-тексти і heuristic `mempalace_matches`; наявні також callback names `onTriggerKuzuAnalysis`. Пошук не знаходить Kùzu driver, database path, graph schema/migration, Cypher calls або API client. Твердження про Kùzu graph є UX/configuration intent, а не підтверджена runtime integration.

**WORM.** `wormLedger.ts` має record із `valid_from`, `valid_to`, `supersedes_id`, hash і `commitAtomicSupersession`; `appwriteDb.ts` використовує `createDocument` для WORM sync. Це добра доменна основа, проте:

- `saveWormLedger` записує весь масив у browser `localStorage`; user/devtools/XSS може змінити або стерти history.
- Під час supersession mutable `current[prevIndex]` змінює старий запис і вся колекція перезаписується. Це logical versioning, але не append-only physical ledger.
- Відсутні hash-chain (`previous_hash`, `record_hash` canonicalized payload), server timestamp, signature/key ID, Merkle/notary checkpoint, immutable Appwrite permissions і незалежна verify job.
- `computeSha256` має небезпечний не-криптографічний fallback, що маскується як 64-hex SHA-256. У regulated chain of custody за відсутності WebCrypto операцію треба відхилити.
- `pushWormRecordToCloud` не викликається в `App.tsx` global seal та evidence wizard, тому UI повідомляє “Utopia DB WORM”, коли фактичний запис лишається браузерним.

### 2.4 Legal AI, факти, хронологія, Claim Charts

- `src/legal/timeline_calibrator.py` моделює valid time (`t_v`) та transaction time (`t_t`), supersession та `conflict_flag`. Це корисна in-memory бітемпоральна модель.
- `src/legal/claim_chart.py` має `EvidenceCitation` з SHA-256, `timecode_or_loc`, verbatim quote, admissibility tier; `SwissClaimChartManager` формує статутні елементи та corroboration status.
- `src/legal/advocate_voice_notes.py` створює sealed note, heuristic statutory subsumption, бітемпоральні факти та blast radius; `feedback_supervisor.py` має п’ять послідовних verification steps й invariant checks.
- `src/types/auth.ts` реалізує requested `OwnerPersona = 'plaintiff' | 'lawyer'` як optional field.

**Обмеження достовірності.** Python модулі працюють на benchmark fixtures і keyword/regex heuristics, не на імпортованій доказовій базі. `EvidenceCitation.verbatim_quote` — вільний string; не перевіряється проти immutable canonical extraction, hash, page/offset або media transcript. Немає IRAC/CREAC data model (issue/rule/application/conclusion і authority anchors), structured opposition/evidence matrix, provenance graph чи review state для кожного conclusion. Конфлікти — boolean/list, а не first-class contradiction relation із assertion, scope, confidence, reviewer and resolution history.

## 3. Матриця прогалин

| Вимога | Стан | Доказ / ризик | Пріоритет |
|---|---|---|---:|
| Імпорт Google Drive / local | частковий | fetch + hash є; fallback створює synthetic content | P0 |
| OCR із збереженням layout/таблиць | відсутній | жодного OCR/parser dependency або service | P0 |
| Page + bbox + spatial citation | відсутній | models не містять page/bbox/offset | P0 |
| Character-exact / Drop-Only verification | відсутній | slice-based quote, no verifier | P0 |
| Original binary + immutable provenance | частковий | storage adapter не зв’язаний із wizard; no immutable evidence object | P0 |
| WORM L-01 | частковий | logical supersession, але localStorage rewrite і no hash chain | P0 |
| Utopia .251 validation | частковий | SELECT gateway, але secrets/SSH bypass і fallback data | P0 |
| MemPalace KùzuDB integration | відсутній | only flags/text/heuristics | P1 |
| SHA-256 deterministic dedup | частковий | hashes computed but no registry/index/collision workflow | P1 |
| Hybrid retrieval (dense+sparse) | відсутній | no pgvector/HNSW/BM25/GIN | P1 |
| RRF k=60 | відсутній | no fusion/rank audit | P1 |
| Contradiction modelling | частковий | flag + fallback matrix, not evidence-linked resolution | P1 |
| Bitemporal facts | частковий | in-memory dataclass only; no persistent transactions | P1 |
| Owner persona | частковий | type exists but optional; no authorization-policy mapping audit | P2 |
| HITL approval | частковий | manual chat/commit UX, no durable reviewer attestation | P0 |
| State-reset protection | недостатньо | ErrorBoundary calls `localStorage.clear()` after one confirm; deleteCase removes case namespaces | P1 |
| Test evidence | частковий | 26 unit tests pass; no OCR/integration/e2e/negative provenance tests | P1 |

## 4. Архітектурні ризики та слабкі місця Legal AI

1. **Hallucination-to-record risk (P0).** Wizard fabricates confidence, legal qualification, citations and graph matches from client heuristics. A toast implies sealing without durable evidence commit. Make every AI output `PROPOSED`, never fact/evidence/claim-chart status, until reviewer approval with exact anchor validation.
2. **Chain-of-custody break (P0).** Synthetic Google fallback, local blob URLs, no original/derivative relationship and non-cryptographic fallback hash make it impossible to prove which bytes informed a conclusion.
3. **Spatial/context loss (P0).** Tables, pagination, headers/footnotes, redactions and scanned layouts vanish. This is especially harmful for contracts, bank statements, expert reports and bilingual judicial filings.
4. **False WORM assurance (P0).** Browser-owned state is mutable and old records are physically rewritten. “Append-only” must be enforced by a server identity and storage policy, with independently verifiable sequence/hash chain.
5. **Secrets / transport (P0).** Hard-coded Utopia credential and disabled host checking expose the knowledge base and undermine auditability. Rotate credential immediately; move to secret manager, mTLS/SSH host pinning and short-lived service tokens.
6. **Demo leakage / real-mode outage (P1).** Alias architecture exists but production source is absent. Public demo evidence and case identifiers must never share deployment/storage tenancy with private matters.
7. **Retrieval blind spots (P1).** SHA-only equality misses near duplicate scans, edits, language variants and contract identifiers; pure semantic matching can merge distinct evidence. No hybrid retrieval or RRF audit trail exists.
8. **State-loss risk (P1).** Error recovery calls `localStorage.clear()`; case deletion clears namespaces. Require export/sync checkpoint, strong scope confirmation and server retention prior to any destructive local action.
9. **Legal standards mismatch (P1).** CP/CPP labels and ATF references are not an admissibility engine. Lack of source authority versioning, jurisdictional rules, counsel validation and rule-effective dates prevents reliance in proceedings.

## 5. Покроковий план доопрацювання

### Phase 1 — Trusted intake and evidence custody (P0)

- Add `services/evidence-ingest/` (server-side) and replace direct wizard commit in `EvidenceIngestionWizard.tsx` with resumable upload + server-issued `evidence_id`.
- Extend `appwriteDb.ts` or preferably a protected backend adapter: original binary to private bucket, content-addressed SHA-256 calculated server-side, MIME sniffing, size limits, AV/malware status, source URL/Drive revision, collector identity, timestamps.
- Delete the synthetic-success fallback in `googleDrivePicker.ts`; return explicit `SOURCE_UNAVAILABLE` and prohibit analysis/commit.
- Add `EvidenceStatus = STAGED | EXTRACTED | REVIEW_REQUIRED | APPROVED | REJECTED | SEALED` and enforce legal transitions server-side.
- Rotate the Utopia credential in `src/legal/utopia_client.py`; remove `sshpass`, password literal and `StrictHostKeyChecking=no`. Restrict service account to a parameterized read-only DB role.

### Phase 2 — OCR, layout and exact source grounding (P0)

- Implement `services/document-extraction/` with an adapter interface: PDF native text first; Docling/Marker/Surya (selection by benchmark) for scanned documents; dedicated ASR with diarization/timecodes for audio; EXIF parser for media.
- Add data model / migrations: `DocumentPage`, `LayoutBlock`, `TableCell`, `TextSpan`, `MediaSegment`, `ExtractionRun`. Store `page_no`, normalized `[x0,y0,x1,y1]`, reading order, UTF-8 character offsets, extraction engine/version, language and confidence.
- Preserve original bytes, derived page image and canonical UTF-8 extraction; use immutable IDs and parent `evidence_id` for every derivative.
- Implement `POST /v1/citations/verify` as drop-only: request must contain `evidence_id + extraction_id + start_offset + end_offset`; server returns the canonical substring and refuses altered text. For PDF/table claims, require page+bbox anchor. Do not accept LLM-provided quote strings.
- Add golden corpus tests: scans, rotated pages, tables, redactions, multilingual French/German/Italian/Ukrainian documents, and audio timestamp examples.

### Phase 3 — Immutable ledger, timeline and HITL (P0/P1)

- Replace browser `wormLedger.ts` authority with `POST /v1/ledger/append` using server transaction. Record `sequence_no`, `previous_record_hash`, canonical JSON `record_hash`, signer/key id, server time and evidence hash.
- Configure Appwrite (or a dedicated ledger store) so client roles cannot update/delete WORM records; client may append through a function that verifies authorization and signature. Add periodic external checkpoint/notarization.
- Persist `FactAssertion` and `Contradiction` rather than bare `conflict_flag`; support valid interval and system interval, assertion author, source anchors, reviewer decision and supersession relation.
- Add `ReviewTask` and `ReviewDecision`. A lawyer with `OwnerPersona='lawyer'` must approve/reject extracted facts, citations and claim elements; plaintiff may submit or comment but cannot promote an AI proposition under the defined policy.
- Replace ErrorBoundary clear with a recovery screen that exports a signed local recovery bundle and asks for a case-specific confirmation. Never call broad `localStorage.clear()`.

### Phase 4 — Utopia/MemPalace and hybrid dedup/retrieval (P1)

- Define a concrete Utopia schema adapter and a real MemPalace Kùzu adapter (`graph_node`, `graph_edge`, provenance links, migrations, health checks). Settings flags must display actual connection health/version, not assumed availability.
- Add deterministic duplicate indexes: SHA-256, normalized document identifier, contract/account/case reference, file fingerprint and source revision. Same hash is an automatic duplicate; conflicting metadata creates a conflict task.
- In PostgreSQL: pgvector embedding column with HNSW, `tsvector` with GIN/BM25 equivalent. Retrieve independent top-N dense and sparse candidates, then fuse:

  `RRF(d) = Σ 1 / (60 + rank_i(d))`

  Store query version, candidates, individual ranks, `k=60`, final score and reviewer resolution. Vector similarity must never silently merge evidence.
- Model contradiction edges in Kùzu / Utopia with each side’s exact citations, scope and adjudication state; surface to claim charts and timeline.

### Phase 5 — Legal reasoning controls, testing and release gate (P1/P2)

- Implement typed `LegalIssue`, `RuleAuthority`, `Application`, `Conclusion` (IRAC/CREAC), each with jurisdiction/version/effective dates and verified citation anchors.
- Use retrieval-only evidence context; LLM response schema must distinguish `asserted`, `inferred`, `unknown`, and `contradicted`. Run a second verifier over all citations and reject any mismatch before display as a claim.
- Add integration tests for Appwrite permissions, Utopia read-only query policy, Kùzu graph persistence, exact citation verifier, RRF determinism, concurrent ledger append and recovery/no data-loss tests.
- Add E2E test: Drive original → staging → extraction → review → sealed ledger → claim chart → judicial export. Publish a release checklist signed by security, data protection and Swiss counsel.

## 6. Специфікація API-контрактів та моделей даних

### Core immutable models

```ts
type EvidenceStatus = 'STAGED' | 'EXTRACTED' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED' | 'SEALED';
type BBox = { page: number; x0: number; y0: number; x1: number; y1: number; coordinateSpace: 'normalized_0_1' };

interface EvidenceAsset {
  evidenceId: string; caseId: string; status: EvidenceStatus;
  originalSha256: string; originalObjectUri: string; mimeDetected: string; bytes: number;
  source: { kind: 'upload' | 'google_drive'; uri?: string; driveFileId?: string; revisionId?: string };
  collectedAt: string; collectedBy: string; serverReceivedAt: string;
}
interface TextAnchor {
  evidenceId: string; extractionId: string; page?: number; startOffset: number; endOffset: number;
  bbox?: BBox; mediaStartMs?: number; mediaEndMs?: number; canonicalTextSha256: string;
}
interface FactAssertion {
  factId: string; caseId: string; statement: string; assertionKind: 'observed'|'testimony'|'inference';
  validFrom?: string; validTo?: string; transactionFrom: string; transactionTo?: string;
  anchors: TextAnchor[]; status: 'PROPOSED'|'REVIEWED'|'ACCEPTED'|'REJECTED'|'SUPERSEDED';
}
interface LedgerRecord {
  recordId: string; sequenceNo: number; previousRecordHash: string | null; recordHash: string;
  payloadCanonicalJson: string; signerKeyId: string; serverTimestamp: string; signature: string;
}
```

### Required API surface

| Endpoint | Contract / enforcement |
|---|---|
| `POST /v1/evidence/stage` | Returns upload session; authenticated case access, no evidence record until server hash verifies bytes |
| `POST /v1/evidence/{id}/extract` | Queues engine/versioned extraction; creates pages/layout/tables/segments; no AI legal conclusion |
| `GET /v1/evidence/{id}/anchors` | Returns canonical anchors and page render metadata under authorization |
| `POST /v1/citations/verify` | Accepts only anchor coordinates/offsets; returns exact canonical substring, hash and `verified=true/false` |
| `POST /v1/facts` | Creates `PROPOSED` assertion with anchors and Tv/Tt; rejects raw unanchored claims |
| `POST /v1/reviews/{id}/decision` | Lawyer HITL signature, reasons, reviewer identity, timestamp; append-only decision event |
| `POST /v1/ledger/append` | Server validates transition + authorization then appends hash-chained record; no update/delete API |
| `POST /v1/search/hybrid` | Explicit `dense`, `sparse`, `rrf_k: 60`; response contains per-source ranks, fused score and evidence anchors |
| `POST /v1/dedup/check` | SHA/identifier candidates plus semantic candidates, never auto-merge; emits review task for collision/conflict |
| `GET /v1/health/knowledge` | Separate Utopia and MemPalace reachability/schema/version/last-sync indicators; do not claim connection from a UI toggle |

### Mandatory security and governance constraints

- Private case assets must be tenant/case scoped; demo corpus uses separate project, bucket, API credentials and deployment environment.
- Client never holds database password or WORM-write privilege. All writes flow through authenticated backend policy enforcement.
- Audit payloads are canonicalized and signed; signatures, originals and extraction derivatives have retention/legal-hold policies.
- Every AI answer carries model/prompt/retrieval/extraction versions and anchor IDs; any assertion without verified anchors is rendered as unverified commentary only.

## Додаток A — перевірені артефакти

- `b-sdd-legal-ui/src/components/EvidenceIngestionWizard.tsx`: source selection, browser SHA, heuristic qualification, slice citation, callback-only final commit.
- `b-sdd-legal-ui/src/lib/googleDrivePicker.ts`: Drive download and unsafe synthetic fallback.
- `b-sdd-legal-ui/src/lib/wormLedger.ts`: browser ledger and mutable logical supersession.
- `b-sdd-legal-ui/src/lib/appwriteDb.ts`: Appwrite adapters, including unlinked evidence upload and WORM create.
- `src/legal/timeline_calibrator.py`, `claim_chart.py`, `feedback_supervisor.py`, `advocate_voice_notes.py`: domain models/heuristics and invariant tests.
- `src/legal/utopia_client.py`, `daemon/legal_mcp_gateway.py`: live DB access boundary and associated credential/transport concern.
- `b-sdd-legal-ui/vite.config.ts`, `src/data/legalData.ts`, `src/data/demoLegalData.ts`: demo/real dispatch; real target file absent.
- `b-sdd-legal-ui/src/main.tsx`, `src/lib/casesManager.ts`: state-clearing paths.
- `dist/dumps/`: не знайдено в tracked або worktree файлах на ревізії аудиту.

