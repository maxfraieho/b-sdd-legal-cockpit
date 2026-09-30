# 🛠️ Документація Розробника та Інженера · B-SDD Legal Advocate Cockpit
### Developer, Architecture & Integration Guide (v2.7 Release)
**Архітектура:** Bitemporal Spec-Driven Development (B-SDD) · **Стандарт:** ISO/IEC 27037 / CPP RS 312.0  
**Стек:** TypeScript, React 19, Tailwind CSS v4, Pure Python 3 (Stdlib-only Core), Appwrite Cloud SDK, Vite, Cloudflare Pages, Amazon Kindle Whispersync.

---

## 1. Архітектура Системи та Методологія B-SDD

**B-SDD Legal Advocate Cockpit** спроєктовано за принципами **Bitemporal Spec-Driven Development (B-SDD)** — методології розробки програмного забезпечення для судових, фінансових та регуляторних систем із математичним контролем незмінності фактів.

```
       Valid Time (Tv)  ──────────────────────────────► [Реальні факти у фізичному світі]
             │
             │ Бітемпоральне калібрування (Timeline Calibrator)
             ▼
    Transaction Time (Tt) ────────────────────────────► [WORM Vault: Appwrite Cloud / Utopia DB / SHA-256]
```

### 1.1. Двовимірний часовий простір (Bitemporality)
1. **$T_v$ (Valid Time / Час факту)**: Інтервал часу $[T_{v\_start}, T_{v\_end}]$, протягом якого діяння відбулося в реальному світі (наприклад, телефонний контакт о 19:30 UTC).
2. **$T_t$ (Transaction Time / Час фіксації)**: Момент часу, коли інформація про подію була зафіксована слідчим у протоколі або внесена до реєстру Utopia DB / Appwrite Cloud WORM.
- Дельта $\Delta T = |T_t - T_v|$ є об'єктивним криміналістичним індикатором для викриття маніпуляцій датами та ретроспективних правок протилежної сторони.

### 1.2. П'ять Базових Інваріантів Системи (Invariants L-01 – L-05)
Кожна операція у кодовій базі суворо валідується модулем `tests/legal/test_legal_invariants.py`:
- **L-01 (Bitemporal Immutability)**: Заборона перезапису записів `in-place`. Оновлення здійснюється виключно через атомарну суперсесію (supersession) відповідно до DataADR-022: режим `CHANGE` (закриття `valid_to = NOW`) для змін у реальності, або режим `CORRECTION` (закриття `tx_to = NOW` зі збереженням дійсного інтервалу) для виправлення помилок запису.
- **L-02 (Zero External Dependencies)**: Юридичне ядро міркувань (`src/legal/`) виконується виключно на чистому Python без сторонніх бібліотек (stdlib-only), що унеможливлює вразливості в ланцюгу постачання (ADR-002).
- **L-03 (Bona Fide Intermediary Flag / PARTY-L03)**: Система ніколи не генерує звинувачень, арештів чи конфіскацій проти добросовісного посередника PARTY-L03 без явного прапорця підтвердження юристом (`PROTECTIVE_FLAG(L-03)` із семантикою flag-and-stop, SpecADR-021).
- **L-04 (Adult Victim Standing / PARTY-L04)**: Повнолітній потерпілий PARTY-L04 є повнолітньою дієздатною особою. Система ніколи не стверджує і не припускає наявності підозри проти нього. Процесуальний статус визначається виключно за рішеннями компетентних органів влади (`status_source = authority_decision`). Будь-яке посилання на ст. 219 CP (злочини проти неповнолітніх) залишається суворо анульованим.
- **L-05 (Cryptographic Proof & Intake Integrity)**: Кожен доказ містить валідний контрольний геш SHA-256 (ISO/IEC 27037). Прийом доказів регулюється Протоколом прийому доказів (`docs/policy/EVIDENCE_INTAKE_PROTOCOL.md`) та правилами SpecADR-023.

---

## 2. Структура Каталогів Проєкту

```
b-sdd-legal-cockpit/
├── b-sdd-legal-ui/                  # Frontend SPA (React 19 + TypeScript + Vite)
│   ├── public/                      # Статичні активи, докази, аудіо, світлини EXIF
│   ├── src/
│   │   ├── components/              # UI компоненти
│   │   │   ├── AuthGate.tsx         # Двоетапний шлюз авторизації (Stealth PIN + Appwrite/Google OAuth)
│   │   │   ├── LegalStrategyModal.tsx # Модальне вікно швейцарської стратегії, доктрини та шаблонів
│   │   │   ├── Topbar.tsx           # Верхня навігаційна панель, мовний перемикач, профіль користувача
│   │   │   ├── SettingsModal.tsx    # Налаштування, вибір моделей ШІ та керування Google RBAC
│   │   │   ├── KindleVoiceReview.tsx# Split-Diff редактор досьє, диктування, відправка на Kindle
│   │   │   ├── EvidenceFactbook.tsx # Опис речових доказів (Bordereau), аудіоплеєр, EXIF Lightbox
│   │   │   ├── EvidenceIngestionWizard.tsx # Майстер додавання доказів через ШІ
│   │   │   ├── JudicialBundleModal.tsx # Компілятор судового пакету PDF/A
│   │   │   ├── CaseSyncModal.tsx    # ШІ-синхронізація справи та послідовне мислення
│   │   │   ├── SwissCodesModal.tsx  # Переглядач 35 статей кодексів Швейцарії (CP, CPP, CC, CO)
│   │   │   └── WormLedgerView.tsx   # Аудит журналу незмінності WORM Utopia DB / Appwrite
│   │   ├── data/
│   │   │   ├── legalData.ts         # Масив доказів (P-01..P-15), 18 розділів досьє, актори
│   │   │   ├── legalStrategyData.ts # Доктрина LLCA, норми CO/LAVI, шаблони договорів та заяви LAVI
│   │   │   └── swissLawCodes.ts     # Тексти статей кодексів швейцарського та кантонального права
│   │   ├── lib/
│   │   │   ├── appwrite.ts          # Клієнт Appwrite SDK та сесії OAuth2
│   │   │   ├── appwriteDb.ts        # WORM-адаптер Appwrite Cloud із локальним кешем та захистом від збоїв
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
│   ├── SPRINT_014_APPWRITE_CLOUD_AND_PRIVACY_HARDENING_REPORT.md # Звіт спринту 014
│   ├── KINDLE_USER_GUIDE_CH_LEGAL_TECH.md # Kindle-версія посібника користувача
│   └── KINDLE_DEVELOPER_ARCH_SPEC.md      # Kindle-версія документації розробника
│
├── scripts/                         # Автоматизація
│   ├── provision_appwrite.mjs       # Декларативне створення БД, колекцій та бакетів Appwrite
│   ├── seed_appwrite.mjs            # Початкове завантаження еталонної справи та WORM доказів
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
└── tests/                           # Набір автоматичних тестів Python (26/26 OK)
    ├── test_actors.py               # Тести імунітету L-03 та статусу неповнолітнього L-04
    ├── test_advocate_voice_notes.py # Тести обробки нотаток адвоката та інваріантів WORM
    ├── test_claim_chart.py          # Тести кореляції доказів
    ├── test_feedback_supervisor.py  # Тести супервайзера зворотного зв'язку
    ├── test_invariants.py           # Перевірка виконання всіх 5 інваріантів B-SDD
    ├── test_legal_core.py           # Тести базового юридичного ядра
    ├── test_planar.py               # Тести планарного розв'язувача ДРАКОН
    └── test_preflight.py            # Тестування обмеження на обсяг висновків (<500 слів)
```

---

## 3. Модуль Авторизації, Google Whitelist, RBAC та Appwrite Cloud

Модуль `src/lib/authManager.ts`, адаптер `src/lib/appwrite.ts`, `src/lib/appwriteDb.ts` та компонент `src/components/AuthGate.tsx` реалізують дворівневу модель доступу відповідно до вимог таємниці слідства (**ст. 73 КПК Швейцарії**) та адвокатської таємниці (**ст. 13 LLCA**):

### 3.1. Ролі та дозволи (RBAC Matrix)

| Роль | Системний ідентифікатор | Права доступу | Типові користувачі |
|---|---|---|---|
| **Super Admin** | `super_admin` | Повний контроль: білий список, редагування коду, WORM-печатки, додавання користувачів | Автор системи (Головний адміністратор) |
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

### 3.4. Архітектура інтеграції Appwrite Cloud (`appwrite.ts`, `appwriteDb.ts`)
- **Хмарний інстанс:** Frankfurt Region (`https://fra.cloud.appwrite.io/v1`), Project ID: `6abab6b5003a4b7b1560`.
- **База даних `legal_vault`:**
  - Колекція `cases`: зберігання метаданих судових проваджень (номер справи, орган юстиції, процесуальний статус).
  - Колекція `worm_records`: журнал бітемпоральних записів із суворим дотриманням інваріанту L-01 (immutable append-only / supersession pattern).
  - Колекція `actors`: реєстр фігурантів із процесуальними імунітетами (Art. 933 CC для bona fide осіб).
- **Сховище `legal-evidence-vault`:** бакет для криптографічно верифікованих файлів доказів із контрольною сумою SHA-256 (ISO/IEC 27037).
- **Web OAuth2 Session Flow:** використання методу `account.createOAuth2Session(OAuthProvider.Google, ...)` замість токенів реєстрації, що гарантує ідемпотентний вхід без конфліктів 409 (`user_already_exists`).
- **Offline-First Resilience:** клієнтський адаптер `appwriteDb.ts` реалізує безпечні обгортки викликів із автоматичним перемиканням на локальний WORM-кеш у разі мережевих збоїв.

### 3.5. Безпека секретів та конфіденційність (Art. 73 CPP / Art. 13 LLCA)
- **Zero Client Secret Exposure:** Клієнтський код Vite використовує виключно публічний Client SDK Appwrite (Project ID). Жодні Server API Keys не потрапляють у клієнтський бандл.
- **Повна деідентифікація адміністраторів:** Пошта головного адміністратора повністю вилучена з публічного рендерингу JSX, тостів та модальних вікон блокування доступу. Відображається виключно системне позначення *«B-SDD SecOps & Case Registry»*.
- **Суворе обмеження делегування прав:** додавання нових авторизованих поштових скриньок у налаштуваннях заблоковано для всіх, окрім головного адміністратора (`isSuperAdmin`).

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
- `CLOUDFLARE_ACCOUNT_ID`: Ідентифікатор облікового запису Cloudflare (`<your_cloudflare_account_id>`).

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
