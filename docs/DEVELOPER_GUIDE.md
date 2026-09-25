# Документація Розробника та Інженера · B-SDD Legal Advocate Cockpit
### Developer, Architecture & Integration Guide (v2.5 Release)

---

## 1. Архітектура Системи та Філософія B-SDD

**B-SDD Legal Advocate Cockpit** розроблено на засадах **Bitemporal Spec-Driven Development (B-SDD)** — методології розробки програмного забезпечення для юридичних, фінансових та регуляторних систем, де будь-яка інформація розглядається у двох часових вимірах з абсолютним математичним та криптографічним контролем незмінності.

### 1.1. Двовимірний часовий простір (Bitemporality)
1. **$T_v$ (Valid Time / Час факту)**: інтервал часу $[T_{v\_start}, T_{v\_end}]$, протягом якого подія відбулася в реальному світі (наприклад, здійснення телефонного дзвінка з погрозами 15.07.2024 о 19:30).
2. **$T_t$ (Transaction Time / Час фіксації)**: момент часу, коли інформація про подію була внесена до протоколу поліції або зафіксована в реєстрі Utopia DB.

Різниця $\Delta T = |T_t - T_v|$ є ключовим індикатором для детекції фальсифікацій: штучна затримка внесення протоколу або ретроспективна зміна версій однозначно виявляється аналітичним ядром.

```
       Valid Time (Tv)  ──────────────────────────────► [Реальні факти]
             │
             │ Бітемпоральне зіставлення (Timeline Calibrator)
             ▼
    Transaction Time (Tt) ────────────────────────────► [WORM Ledger Utopia DB]
```

### 1.2. П'ять Базових Інваріантів (Invariants L-01 – L-05)
Кожна операція в системі перевіряється на відповідність незмінним законам цілісності:
- **L-01 (Bitemporal Immutability)**: Заборона перезапису записів `in-place`. Оновлення здійснюється виключно через *атомарну суперсесію (supersession)* зі створенням нового вузла в ланцюгу та деактивацією старого.
- **L-02 (Zero External Dependencies)**: Юридичне ядро міркувань (`src/legal/`) виконується на чистому Python без зовнішніх бібліотек (stdlib-only), що унеможливлює збої від оновлень сторонніх пакетів.
- **L-03 (Bona Fide Shield / Імунітет добросовісної особи)**: Абсолютний процедурний імунітет для добросовісних помічників за ст. 933 Цивільного кодексу Швейцарії (захист волонтера Адріано Міллі від зловмисних зустрічних звинувачень).
- **L-04 (Minor Victim Protection)**: Неповнолітня жертва зберігає процесуальний статус потерпілого / цивільного позивача за будь-яких обставин.
- **L-05 (Cryptographic Proof)**: Кожен речовий доказ (аудіо, фото, документ, експертиза) обов'язково містить валідний контрольний геш SHA-256.

---

## 2. Структура Репозиторію

```
b-sdd-legal-cockpit/
├── b-sdd-legal-ui/                  # Frontend SPA (React 19 + TypeScript + Vite)
│   ├── public/                      # Статичні активи, докази, іконки, svg
│   │   └── evidence/                # Фото EXIF (P-06, P-10), аудіозаписи (P-01..P-08), pdf
│   ├── src/
│   │   ├── components/              # UI компоненти робочого простору
│   │   │   ├── Topbar.tsx           # Верхня навігаційна панель, статус, мобільний таб
│   │   │   ├── KindleVoiceReview.tsx# Двоколонковий Diff-редактор, диктування, EPUB 3.0
│   │   │   ├── EvidenceFactbook.tsx # Кабінет речових доказів (Bordereau), аудіо, EXIF фото
│   │   │   ├── EvidenceIngestionWizard.tsx # Майстер додавання доказів через ШІ
│   │   │   ├── SettingsModal.tsx    # Модальне вікно вибору ШІ-провайдерів та бази законів
│   │   │   ├── SwissCodesModal.tsx  # Переглядач статей швейцарських та кантональних кодексів
│   │   │   ├── WormLedgerView.tsx   # Аудит незмінності Utopia DB WORM Ledger
│   │   │   ├── LegalInspector.tsx   # Акторська матриця, Claim Chart, розрахунок збитків
│   │   │   ├── GlossaryModal.tsx    # Декодер абревіатур та правничий глосарій
│   │   │   ├── AuthGate.tsx         # Екран авторизації за PIN-кодом (0523)
│   │   │   └── ActionDock.tsx       # Плаваюча док-панель швидких дій
│   │   ├── data/
│   │   │   ├── legalData.ts         # Масив доказів (P-01..P-15), 18 розділів досьє, актори
│   │   │   ├── swissLawCodes.ts     # База кодексів (CP, CPP, CC, CO, LOJV, ATF), сховище
│   │   │   └── translations.ts      # Словник тримовного інтерфейсу (UK, FR, EN)
│   │   ├── lib/
│   │   │   ├── translator.ts        # Клієнт взаємодії з ШІ-проксі (.184) та Gemini API
│   │   │   └── bitemporal.ts        # Розрахунок SHA-256, WORM-суперсесія, ledger state
│   │   ├── types/
│   │   │   ├── i18n.ts              # Типи локалізації, ролей ШІ та провайдерів
│   │   │   └── legal.ts             # Типи процесуальних одиниць, транзакцій, акторів
│   │   ├── index.css                # Глобальні стилі Tailwind CSS v4
│   │   └── main.tsx                 # Точка входу додатку з ErrorBoundary
│   ├── package.json                 # Залежності frontend (React 19, Lucide, Tailwind 4)
│   └── vite.config.ts               # Конфігурація Vite (порт 3000, host 0.0.0.0)
│
├── daemon/                          # Автономний супервайзер процесів
│   └── legal_supervisor_daemon.py   # Сервісний демон моніторингу фонових задач
│
├── deploy/                          # Скрипти розгортання та шлюз MCP
│   └── mcp_gateway/
│       ├── legal_gateway.py         # FastAPI сервер Model Context Protocol (:8766)
│       ├── toolkit_legal.py         # Опис та обробники 30 юридичних інструментів
│       └── legal_config.json        # Конфігурація хостів, портів та CORS
│
├── docs/                            # Документація проекту
│   ├── ARCHITECTURE.md              # Системна специфікація топології та протоколів
│   ├── USER_GUIDE.md                # Посібник користувача для юриста та клієнта
│   ├── DEVELOPER_GUIDE.md           # Посібник розробника (цей документ)
│   └── FEEDBACK_LOOP_SPEC.md        # Специфікація 5 контурів зворотного зв'язку
│
├── scripts/                         # Допоміжні скрипти автоматизації
│   ├── deploy_cloudflare_pages.sh   # Автоматичний білд та пуш на Cloudflare Pages
│   ├── run_legal_sprint.sh          # Скрипт запуску автономного юридичного спринту
│   └── generate_legal_book.py       # Компілятор EPUB 3.0 книги доказів для Kindle
│
├── src/legal/                       # Sovereign Python Core (Чистий Python без залежностей)
│   ├── actors.py                    # Матриця процесуальних статусів та зв'язків
│   ├── claim_chart.py               # Кореляція складів злочинів зі статтями кодексів
│   ├── preflight_compiler.py        # Детермінований компілятор юридичних рішень
│   └── timeline_calibrator.py       # Алгоритми калібрації бітемпоральних міток
│
├── tests/                           # Набір автоматичних тестів Python
│   ├── test_actors.py               # Тести імунітету L-03 та статусу неповнолітнього L-04
│   ├── test_claim_chart.py          # Тести кореляції доказів
│   ├── test_invariants.py           # Перевірка виконання всіх 5 інваріантів B-SDD
│   └── test_preflight.py            # Тестування обмеження на обсяг висновків (<500 слів)
│
├── metadata.json                    # Маніфест додатка Google AI Studio Build
└── package.json                     # Кореневий npm маніфест монорепозиторію
```

---

## 3. Технологічний Стек Frontend

- **Фреймворк**: React 19 (`19.2.6`) з React Hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
- **Мова програмування**: TypeScript 5.7+ з суворою типізацією (`strict: true`).
- **Стилізація**: Tailwind CSS v4 (`@tailwindcss/vite` 4.0.9). Усі стилі підключаються через `@import "tailwindcss";` у файлі `index.css`.
- **Набір іконок**: `lucide-react` (0.575+).
- **Збирач проекту**: Vite 6 (`6.0.0`) з HMR (налаштований на порт 3000 для середовища контейнера).

---

## 4. ШІ-Інфраструктура та Провайдери

Система підтримує три взаємозамінні варіанти виконання інтелектуальних завдань:

### 4.1. Локальний / Віддалений ШІ-проксі (хост `.184`)
- **Протокол**: OpenAI-compatible REST API.
- **Ендпоінт**: `http://192.168.3.184:18880/v1/chat/completions`.
- **Слоти моделей на сервері**:
  - `slot-1`: `qwen/qwen-2.5-72b-instruct` (глибока аналітика, розбір заплутаних фабул).
  - `slot-2`: `meta/llama-3.3-70b-instruct` (оптимальний баланс швидкості та строгості міркувань).
  - `slot-3`: `mistralai/mistral-large-2407` (перевага для процесуальних текстів французькою мовою).
  - `custom`: пряме ручне введення ідентифікатора моделі.
- **Діагностика**: функція `testLLMProxyConnection` надсилає пінг на `/models` або робить мінімальний запит генерації для підтвердження живості сокета.

### 4.2. Хмарний рушій Google Gemini
- **Моделі**: `gemini-3.8-flash` (миттєвий аналіз за 300–600 мс), `gemini-3.8-pro` (глибока правова експертиза).
- **Параметри**: `temperature: 0.1` – `0.2` (максимальна фактична точність без домислів).
- **Інтеграція**: через системний бекенд AI Studio Build (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) або клієнтський Bearer-запит.

### 4.3. Автономний MemPalace KùzuDB Engine
- **Автономність**: 100% Offline режим, що не потребує мережевих викликів.
- **Принцип роботи**: прямий збіг ознак доказу з графовими шаблонами правопорушень (Graph Traversal over 8,746 nodes) та застосування детермінованих евристик швейцарського кримінального процесу.

---

## 5. Архітектура Моделі Законодавства (`swissLawCodes.ts`)

Модель даних швейцарських законів спроектована для підтримки як загальнофедеральних нормативних актів, так і кантонального права кантону Во:

```typescript
export interface LawArticle {
  id: string;                      // Унікальний ідентифікатор ("CP-146", "LOJV-12")
  code: string;                    // Кодекс ("CP", "CPP", "CC", "CO", "LOJV", "ATF")
  jurisdiction: "federal" | "canton_vaud"; // Юрисдикція
  article: string;                 // Офіційне позначення ("Art. 146 CP")
  title: Record<SupportedLanguage, string>; // Тримовна назва (uk, fr, en)
  category: "penal" | "procedure" | "civil" | "obligations" | "foreigners" | "cantonal_vaud" | "jurisprudence";
  content_fr: string;              // Офіційний французький текст (Recueil systématique / BLV)
  content_uk: string;              // Авторизований переклад українською
  content_en: string;              // Англійський переклад
  sanction?: string;               // Санкція (наприклад, "Peine privative de liberté de 5 ans au plus")
  relevance_case: Record<SupportedLanguage, string>; // Зв'язок із поточною справою
  corroborating_cotes: string[];   // Прив'язані речові докази (["P-04", "P-05", "P-14"])
  mempalace_node_id: string;       // Ідентифікатор вузла в графі MemPalace
}
```

### Персистентність та Синхронізація:
1. **Збереження стану**: перелік активних статей зберігається у `localStorage` під ключем `b_sdd_enabled_laws_v1`.
2. **Користувацькі статті**: нові або відредаговані норми кешуються у `b_sdd_custom_laws_v1`.
3. **Експорт / Імпорт**: підтримується повна серіалізація корпусу у валідний JSON-файл за структурою `{ version: "2.5", exported_at: string, count: number, articles: LawArticle[] }`.

---

## 6. Model Context Protocol (MCP 2024-11-05) Gateway

Gateway розташований у каталозі `deploy/mcp_gateway/` і запущений як сервіс FastAPI на порту `:8766`.

### 6.1. Транспортні канали
- `GET /sse` — Server-Sent Events потік для підключення Claude Desktop, Gemini Spark та агентів.
- `POST /messages?session_id=...` — Прийом команд JSON-RPC 2.0.
- `HEAD /` та `HEAD /sse` — Підтримка зондуючих пінгів Cloudflare Edge (відповідь `200 OK` без затримки).

### 6.2. Каталог 30 Інструментів (MCP Tools)
- **Юридичні операції (8 інструментів)**:
  `legal_dossier_search`, `legal_transcripts_query`, `legal_actor_matrix_get`, `legal_evidence_get`, `legal_sprint_dispatch`, `legal_supervisor_status`, `legal_epub_rebuild`, `utopia_db_query`.
- **Документація та плани (6 інструментів)**:
  `legal_docs_list`, `legal_docs_read`, `legal_docs_write`, `legal_plan_save`, `legal_plans_list`, `legal_plan_get`.
- **WORM Ledger & Utopia DB (3 інструменти)**:
  `utopia_bitemporal_query`, `utopia_record_worm_ledger`, `utopia_check_invariants`.
- **GitNexus Code Intelligence (3 інструменти)**:
  `gitnexus_ast_query`, `gitnexus_blast_radius`, `gitnexus_symbol_search`.
- **DRAKON Візуальні Алгоритми (4 інструменти)**:
  `drakon_planar_validate`, `drakon_svg_export`, `drakon_code_compile`, `drakon_macro_flow_synthesis`.
- **Astryx Canvas Primitives (3 інструменти)**:
  `astryx_canvas_push`, `astryx_canvas_get`, `astryx_deploy_trigger`.
- **Процедурні навички (3 інструменти)**:
  `skills_catalog_inspect`, `skills_rule_of_two_crystallize`, `skills_verify_immutability`.

---

## 7. Компіляція, Тестування та Розгортання

### 7.1. Локальний запуск UI
```bash
# Перехід у робочу директорію клієнта
cd b-sdd-legal-ui

# Встановлення пакетів
npm install

# Запуск середовища розробки
npm run dev
```

### 7.2. Перевірка збірки та компіляція
```bash
# Збірка продакшн-бандлу
npm run build

# Лінтування та перевірка типів
npm run lint
```

### 7.3. Автоматичні тести бекенду (Python Invariants)
```bash
# Запуск повного комплекту з 15 модульних тестів
python3 -m unittest discover tests
```
Критерій успіху: 15/15 тестів завершуються статусом `OK` менш ніж за 0.5 секунди.

### 7.4. Системні служби Linux (systemd)
Для постійної роботи шлюзу та демона на виробничому сервері передбачені юніти:
- `/etc/systemd/system/legal-mcp-gateway.service`
- `/etc/systemd/system/legal-supervisor.service`

Перезапуск служб після оновлення коду:
```bash
sudo systemctl restart legal-mcp-gateway
sudo systemctl restart legal-supervisor
```
