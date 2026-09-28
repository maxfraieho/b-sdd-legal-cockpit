# 🛠️ Документація Розробника та Інженера · B-SDD Legal Advocate Cockpit
### Developer, Architecture & Integration Guide (v2.6 Release)
**Архітектура:** Bitemporal Spec-Driven Development (B-SDD) · **Стандарт:** ISO/IEC 27037 / CPP RS 312.0  
**Стек:** TypeScript, React 19, Tailwind CSS v4, Pure Python 3 (Stdlib-only Core), Vite, Cloudflare Pages, Amazon Kindle Whispersync.

---

## 1. Архітектура Системи та Методологія B-SDD

**B-SDD Legal Advocate Cockpit** спроєктовано за принципами **Bitemporal Spec-Driven Development (B-SDD)** — методології розробки програмного забезпечення для судових, фінансових та регуляторних систем із математичним контролем незмінності фактів.

```
       Valid Time (Tv)  ──────────────────────────────► [Реальні факти у фізичному світі]
             │
             │ Бітемпоральне калібрування (Timeline Calibrator)
             ▼
    Transaction Time (Tt) ────────────────────────────► [WORM Ledger Utopia DB / SHA-256]
```

### 1.1. Двовимірний часовий простір (Bitemporality)
1. **$T_v$ (Valid Time / Час факту)**: Інтервал часу $[T_{v\_start}, T_{v\_end}]$, протягом якого діяння відбулося в реальному світі (наприклад, погроза телефоном 15.07.2024 о 19:30).
2. **$T_t$ (Transaction Time / Час фіксації)**: Момент часу, коли інформація про подію була зафіксована слідчим у протоколі або внесена до реєстру Utopia DB.
- Дельта $\Delta T = |T_t - T_v|$ є об'єктивним криміналістичним індикатором для викриття маніпуляцій датами та ретроспективних правок протилежної сторони.

### 1.2. П'ять Базових Інваріантів Системи (Invariants L-01 – L-05)
Кожна операція у кодовій базі суворо валідується модулем `tests/test_invariants.py`:
- **L-01 (Bitemporal Immutability)**: Заборона перезапису записів `in-place`. Будь-яке оновлення здійснюється виключно через *атомарну суперсесію (supersession)* зі створенням нового вузла в ланцюгу та деактивацією старого.
- **L-02 (Zero External Dependencies)**: Юридичне ядро міркувань (`src/legal/`) виконується на чистому Python без сторонніх бібліотек (stdlib-only), що унеможливлює вразливості в ланцюгу постачання (supply chain attacks).
- **L-03 (Bona Fide Shield / Імунітет третіх осіб)**: Автоматичний процесуальний імунітет для добросовісних помічників за ст. 933 Цивільного кодексу Швейцарії (імунітет волонтера Адріано Міллі від зустрічних позовів).
- **L-04 (Minor / Victim Standing)**: Неповнолітня чи вразлива жертва безумовно зберігає статус цивільного позивача (partie plaignante / ст. 115, 118 КПК) незалежно від процесуальних заперечень обвинуваченого.
- **L-05 (Cryptographic Proof)**: Кожен доказ (аудіозапис, світлина EXIF, довідка Unisanté, банківська виписка) обов'язково містить валідний контрольний геш SHA-256.

---

## 2. Структура Каталогів Проєкту

```
b-sdd-legal-cockpit/
├── b-sdd-legal-ui/                  # Frontend SPA (React 19 + TypeScript + Vite)
│   ├── public/                      # Статичні активи, докази, аудіо, світлини EXIF
│   ├── src/
│   │   ├── components/              # UI компоненти
│   │   │   ├── AuthGate.tsx         # Двоетапний шлюз авторизації (Stealth PIN + Google RBAC)
│   │   │   ├── LegalStrategyModal.tsx # Модальне вікно швейцарської стратегії, доктрини та шаблонів
│   │   │   ├── Topbar.tsx           # Верхня навігаційна панель, мовний перемикач, профіль користувача
│   │   │   ├── SettingsModal.tsx    # Налаштування, вибір моделей ШІ та керування Google RBAC
│   │   │   ├── KindleVoiceReview.tsx# Split-Diff редактор досьє, диктування, відправка на Kindle
│   │   │   ├── EvidenceFactbook.tsx # Опис речових доказів (Bordereau), аудіоплеєр, EXIF Lightbox
│   │   │   ├── EvidenceIngestionWizard.tsx # Майстер додавання доказів через ШІ
│   │   │   ├── JudicialBundleModal.tsx # Компілятор судового пакету PDF/A
│   │   │   ├── CaseSyncModal.tsx    # ШІ-синхронізація справи та послідовне мислення
│   │   │   ├── SwissCodesModal.tsx  # Переглядач 35 статей кодексів Швейцарії (CP, CPP, CC, CO)
│   │   │   └── WormLedgerView.tsx   # Аудит журналу незмінності WORM Utopia DB
│   │   ├── data/
│   │   │   ├── legalData.ts         # Масив доказів (P-01..P-15), 18 розділів досьє, актори
│   │   │   ├── legalStrategyData.ts # Доктрина LLCA, норми CO/LAVI, шаблони договорів та заяви LAVI
│   │   │   └── swissLawCodes.ts     # Тексти статей кодексів швейцарського та кантонального права
│   │   ├── lib/
│   │   │   ├── authManager.ts       # Менеджер білого списку Google, ролей та сесій
│   │   │   ├── casesManager.ts      # Менеджер мульти-кейсів (ADR-011)
│   │   │   ├── bitemporal.ts        # Обчислення SHA-256, WORM-суперсесія
│   │   │   └── translator.ts        # Клієнт взаємодії з ШІ-проксі (.184) та Gemini API
│   │   ├── types/
│   │   │   ├── auth.ts              # Типи ролей (RBAC), дозволів та сесій
│   │   │   ├── i18n.ts              # Типи локалізації (uk, fr, de, it, en)
│   │   │   └── legal.ts             # Типи процесуальних одиниць, акторів та доказів
│   │   ├── index.css                # Глобальні стилі Tailwind CSS v4
│   │   └── main.tsx                 # Точка входу додатку з ErrorBoundary
│   ├── package.json                 # Специфікація залежностей Frontend
│   └── vite.config.ts               # Конфігурація Vite (порт 3000, host 0.0.0.0)
│
├── daemon/                          # Супервайзер процесів
│   └── legal_supervisor_daemon.py   # Сервісний демон моніторингу фонових задач
│
├── deploy/                          # Шлюз MCP (Model Context Protocol)
│   └── mcp_gateway/
│       ├── legal_gateway.py         # FastAPI сервер Model Context Protocol (:8766)
│       └── toolkit_legal.py         # 30 юридичних інструментів процедурного аналізу
│
├── docs/                            # Повна проєктна документація
│   ├── USER_GUIDE.md                # Посібник користувача та адвоката
│   ├── DEVELOPER_GUIDE.md           # Посібник інженера та архітектора (цей документ)
│   ├── ARCHITECTURE.md              # Системна специфікація топології та протоколів
│   ├── CLOUDFLARE_PAGES_DEPLOYMENT_AGENT_PROMPT.md # Промпт автономного агента публікації
│   ├── KINDLE_USER_GUIDE_CH_LEGAL_TECH.md # Kindle-версія посібника користувача
│   └── KINDLE_DEVELOPER_ARCH_SPEC.md      # Kindle-версія документації розробника
│
├── scripts/                         # Автоматизація
│   ├── deploy_cloudflare_pages.sh   # Скрипт збірки та публікації на Cloudflare Pages
│   ├── generate_legal_book.py       # Компілятор EPUB 3.0 книг для Amazon Kindle
│   └── run_legal_sprint.sh          # Скрипт запуску автономного юридичного спринту
│
├── src/legal/                       # Sovereign Python Core (Чистий Python без залежностей)
│   ├── actors.py                    # Матриця процесуальних статусів та зв'язків
│   ├── claim_chart.py               # Кореляція складів злочинів зі статтями кодексів
│   ├── preflight_compiler.py        # Детермінований компілятор юридичних рішень
│   └── timeline_calibrator.py       # Алгоритми калібрації бітемпоральних міток
│
└── tests/                           # Набір автоматичних тестів Python
    ├── test_actors.py               # Тести імунітету L-03 та статусу неповнолітнього L-04
    ├── test_claim_chart.py          # Тести кореляції доказів
    ├── test_invariants.py           # Перевірка виконання всіх 5 інваріантів B-SDD
    └── test_preflight.py            # Тестування обмеження на обсяг висновків (<500 слів)
```

---

## 3. Модуль Авторизації, Google Whitelist та RBAC (`authManager.ts`)

Модуль `src/lib/authManager.ts` та компонент `src/components/AuthGate.tsx` реалізують дворівневу модель доступу відповідно до вимог таємниці слідства (**ст. 73 КПК Швейцарії**) та адвокатської таємниці (**ст. 13 LLCA**):

### 3.1. Ролі та дозволи (RBAC Matrix)

| Роль | Системний ідентифікатор | Права доступу | Типові користувачі |
|---|---|---|---|
| **Super Admin** | `super_admin` | Повний контроль: білий список, редагування коду, WORM-печатки, скидання паролів | Автор системи (`TUkroschu@gmail.com`) |
| **Law Firm Admin** | `admin` | Керування досьє, додавання юристів бюро, експорт судового бандлу | Старший партнер швейцарського бюро |
| **Advocate / Lawyer** | `lawyer` | Редагування досьє, додавання доказів через майстер, диктування, відправка на Kindle | Провідний адвокат справи, судовий повірений |
| **Client / User** | `user` | Перегляд матеріалів справи, завантаження доказів у драфт, перегляд стану | Потерпілий (Арсен Коваленко) |

### 3.2. Алгоритм верифікації email (`verifyEmailAccess`)
```typescript
export function verifyEmailAccess(email: string): {
  allowed: boolean;
  user: AuthorizedUser | null;
  reason?: string;
}
```
1. Якщо режим «Суворого білого списку» активний (`isStrictWhitelistMode() === true`), система здійснює регістронезалежний пошук адреси в локальному реєстрі дозволених користувачів `localStorage.getItem('b_sdd_authorized_users_v2')`.
2. Якщо акаунт знайдено та його прапорець `isActive === true`, створюється сесія `AuthSession` у `sessionStorage` із міткою часу та методом авторизації (`google` або `pin`).
3. Якщо акаунт деактивовано, генерується відмова `account_suspended`.
4. Якщо пошта відсутня у списку, генерується відмова `not_in_whitelist` із блокуванням інтерфейсу за ст. 73 КПК Швейцарії.

### 3.3. Автоблокування та очищення чутливих даних у пам'яті
- Глобальний слухач дій користувача (`mousemove`, `keydown`, `click`) кожні 30 секунд оновлює мітку `b_sdd_auth_timestamp`.
- У разі бездіяльності понад `autoLockMinutes` (за замовчуванням 15 хв) автоматично викликається функція `handleLock()`, яка:
  - Видаляє активну сесію з оперативної пам'яті та `sessionStorage`;
  - Переводить інтерфейс у стан `isPinStageUnlocked = false`;
  - Очищає буфери введення.

---

## 4. Інтернаціоналізація та 5-мовна локалізація (i18n)

Система підтримує 5 мовних локалей у суворій відповідності до швейцарської та міжнародної правозастосовної практики:
1. **Українська (`uk`)**: Основна мова взаємодії автора та потерпілого.
2. **Français (`fr`)**: Офіційна мова судочинства кантону Во (**Langue de la procédure**, ст. 67 КПК Швейцарії). Усі клопотання, заяви LAVI та договори за замовчуванням формуються французькою.
3. **Deutsch (`de`)**: Офіційна мова Федерального суду Швейцарії (ATF) та німецькомовних кантонів (BGFA, OR, StPO).
4. **Italiano (`it`)**: Офіційна мова Швейцарської Конфедерації (Ticino / Grigioni).
5. **English (`en`)**: Міжнародна мова криміналістичних стандартів ISO/IEC 27037 та IT-експертизи.

Локалізаційні структури визначені у `src/types/i18n.ts`, словники — у `src/data/translations.ts`, а спеціальні переклади шлюзу доступу — у константі `AUTH_I18N` всередині `src/components/AuthGate.tsx`.

---

## 5. Компіляція та Автоматизована Публікація на Cloudflare Pages

Проєкт оптимізовано для безсерверного хостингу на високошвидкісній мережі **Cloudflare Pages** із захистом від DDoS, підтримкою custom headers та SSL.

### 5.1. Автоматичний скрипт публікації (`scripts/deploy_cloudflare_pages.sh`)
```bash
bash scripts/deploy_cloudflare_pages.sh
```

**Етапи виконання пайплайну:**
1. **Pre-flight Invariant Verification**: запуск модульних тестів Python (`python3 -m unittest discover tests`);
2. **Production Bundle Build**: компіляція React SPA через Vite (`npm run build` у каталозі `b-sdd-legal-ui/`);
3. **Синхронізація артефактів**: передача каталогу `dist/` на сервер розгортання;
4. **Cloudflare Deployment**: деплой через `wrangler pages deploy` на проєкт `b-sdd-legal-ui` із закріпленням production-гілки `main`.

### 5.2. Вимоги до змінних середовища Cloudflare
- `CLOUDFLARE_API_TOKEN`: Токен з правами *Cloudflare Pages: Edit*.
- `CLOUDFLARE_ACCOUNT_ID`: Ідентифікатор облікового запису Cloudflare (`c354ea45a11a1e1c14f1f41fe780cb34`).

---

## 6. Компілятор EPUB 3.0 та передача на Amazon Kindle

Для роботи адвоката під час судових засідань без підключення до мережі передбачено експорт досьє у сертифікований стандарт **EPUB 3.0** за допомогою скрипта `scripts/generate_legal_book.py`.

### 6.1. Особливості компілятора:
- **100% чистий Python (Stdlib-only)**: Використовує виключно стандартні модулі `zipfile`, `xml.etree`, `html`, `re`, `argparse`.
- **Сумісність з Amazon Kindle Whispersync**: Генерує валідні файли `mimetype`, `META-INF/container.xml`, `OEBPS/content.opf` та навігацію `OEBPS/nav.xhtml`.
- **Стилізація для E-Ink**: Вбудований файл `style.css` з оптимізованими гарнітурами для електронного чорнила, чіткими таблицями та блоками коду.

### 6.2. Команда компіляції документації у формат книги:
```bash
# Компіляція посібника користувача:
python3 scripts/generate_legal_book.py \
  --dossier docs/kindle/user_guide \
  --output docs/kindle/b-sdd-legal-user-guide.epub \
  --title "B-SDD Legal Advocate Cockpit · Керівництво Користувача" \
  --author "B-SDD Sovereign Engineering"

# Компіляція інженерної документації:
python3 scripts/generate_legal_book.py \
  --dossier docs/kindle/dev_guide \
  --output docs/kindle/b-sdd-legal-dev-guide.epub \
  --title "B-SDD Legal Advocate Cockpit · Документація Розробника" \
  --author "B-SDD Sovereign Engineering"
```

### 6.3. Відправка на пристрій Kindle:
Файл надсилається з дозволеної адреси електронної пошти на захищену адресу пристрою користувача:
`tu***@kindle.com` з темою листа `B-SDD Legal Dossier`.
