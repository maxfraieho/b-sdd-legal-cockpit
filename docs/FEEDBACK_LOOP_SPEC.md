# B-SDD LEGAL: АВТОНОМНА ПЕТЛЯ ЗВОРОТНОГО ЗВ'ЯЗКУ ТА СПЕЦИФІКАЦІЯ ТРИГЕРІВ

**Цільовий вузол:** `192.168.3.234` (Tailscale: `100.80.16.33`)  
**Стратегічний планувальник:** Gemini Spark (Google Colab / Google Docs на ноутбуці `192.168.3.30`)  
**Виконавчий агент:** Antigravity (`agy`) у `/home/vokov/projects/b-sdd-legal`  
**Telegram Бот:** `@bsdd_legal_cockpit_bot` (Token: `<TELEGRAM_BOT_TOKEN>`)  
**Отримувач звітів (Chat ID):** `<TELEGRAM_CHAT_ID>` (System Operator / Lead Advocate)  
**Порти вузла .234:**
- **Supervisor Daemon:** `:8162` (`http://192.168.3.234:8162`)
- **Legal MCP Gateway:** `:8766` (`http://192.168.3.234:8766`)

---

## 1. Специфікація поштових тригерів (Gmail / n8n)

Щоб задачі для `b-sdd-legal` суворо відокремлювалися від загального коду `b-sdd`, налаштовано такі правила фільтрації листів на `tukroschu@gmail.com`:

### А. Вхідні тригери (Постановка задачі від Gemini Spark / користувача)
| Тема листа (Subject Pattern) | Призначення | Обробка в n8n |
| :--- | :--- | :--- |
| `[B-SDD-LEGAL] SPRINT_XXX: <Назва>` | Запуск повноцінного юридичного спринту (Φ1..Φ7) | Відправка JSON на `http://192.168.3.234:8162/dispatch` |
| `[LEGAL-VAUD] DISPATCH: <Інструкція>` | Швидке точкове завдання для agy (перевірка статті, виправлення) | Відправка JSON на `http://192.168.3.234:8162/dispatch` |
| `[LEGAL-DOSSIER] REBUILD-EPUB` | Перезбірка книги досьє та надсилання на Kindle | Виклик `legal_epub_rebuild` на `:8766` |

### Б. Тіло листа (Task Payload)
Тіло листа може містити довільний текст інструкції або параметри у форматі YAML/Markdown:
```markdown
---
sprint_id: sprint_003_legal
instruction: PREFLIGHT_COMPILER_INTEGRATION
delivery: kindle,telegram
---
Необхідно інтегрувати pre-flight компілятор доказів для зв'язування
транскрипцій 61 аудіофайлу зі статтями 180, 181, 157 CP.
```

### В. Вихідні листи-звіти (Telemetry Delivery)
Після завершення спринту n8n автоматично надсилає лист-відповідь:
- **Тема:** `[B-SDD-LEGAL-REPORT] SPRINT_XXX: SUCCESS (100% Invariants Compliant)`
- **Вкладення:** 
  1. `test_dossier.epub` (оновлене повне юридичне досьє)
  2. `telemetry_report.json` (детальний таймлайн виконання)

---

## 2. Підключення Gemini Spark з Google Colab (Ноутбук .30)

Оскільки ноутбук `.30` знаходиться в одній локальній мережі та підключений до Tailscale:

1. **Пряме підключення в браузері / Colab:**
   У клітинку Colab достатньо скопіювати код клієнта:
   ```python
   # Підключення до Legal MCP Gateway
   import urllib.request, json
   
   GATEWAY = "http://192.168.3.234:8766" # або Tailscale "http://100.80.16.33:8766"
   
   def call_legal_tool(name, args={}):
       req = urllib.request.Request(
           f"{GATEWAY}/api/tools/{name}",
           data=json.dumps(args).encode('utf-8'),
           headers={'Content-Type': 'application/json'}
       )
       with urllib.request.urlopen(req) as resp:
           return json.loads(resp.read().decode('utf-8'))['result']

   # Приклад 1: Пошук по досьє
   print(call_legal_tool("legal_dossier_search", {"query": "15'000 USD"}))

   # Приклад 2: Постановка задачі для agy
   print(call_legal_tool("legal_sprint_dispatch", {
       "sprint_id": "sprint_003_legal",
       "instruction": "RECONCILE_EVIDENCE_MATRICES"
   }))
   ```

---

## 3. Сервіси на хості 192.168.3.234

1. **`daemon/legal_supervisor.py` (Порт :8162)**:
   - Приймає задачі на `/dispatch`.
   - Запускає `scripts/run_legal_sprint.sh`.
   - Автоматично надсилає сповіщення у Telegram-бот `@bsdd_legal_cockpit_bot` (Chat ID `6412868393`).
   - Відправляє результат на n8n webhook `https://n8n.exodus.pp.ua/webhook/bsdd-legal-result`.
   - Оновлює блокнот NotebookLM `6813ab1c-ac22-4c3c-9c8e-9dd67e35da99`.

2. **`daemon/legal_mcp_gateway.py` (Порт :8766)**:
   - Обслуговує SSE-канал `/sse` та JSON-RPC `/rpc` для стандартних MCP-клієнтів.
   - Надає REST API `/api/tools/` для Colab та Google Docs скриптів.
