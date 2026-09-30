#!/usr/bin/env node
// =========================================================================
// B-SDD LEGAL COCKPIT · APPWRITE CLOUD PROVISIONING SCRIPT
// Automates creation of Database, Collections, Attributes & Storage Bucket
// =========================================================================

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6abab6b5003a4b7b1560';
const API_KEY = process.env.APPWRITE_API_KEY || process.argv.find(a => a.startsWith('--key='))?.split('=')[1];

const DATABASE_ID = 'legal_vault';
const BUCKET_ID = 'legal-evidence-vault';

if (!API_KEY) {
  console.error(`
=============================================================================
❌ ПОМИЛКА: Не знайдено APPWRITE_API_KEY.
-----------------------------------------------------------------------------
Для створення колекцій та сховища потрібен API Key з правами адміністратора.
Як отримати ключ за 30 секунд:
1. Відкрийте Appwrite Console: https://cloud.appwrite.io/console/project-${PROJECT_ID}
2. Перейдіть в "Settings" ➔ "API Keys" ➔ "Create API Key".
3. Назва: "B-SDD CLI Provisioner".
4. Відмітьте права (Scopes):
   - databases.write, collections.write, attributes.write, documents.write
   - buckets.write, files.write
5. Запустіть скрипт:
   APPWRITE_API_KEY="ваш_ключ" node scripts/provision_appwrite.mjs
   або
   node scripts/provision_appwrite.mjs --key="ваш_ключ"
=============================================================================
`);
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

async function api(path, options = {}) {
  const url = `${ENDPOINT}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`\n🚀 Запуск автоматичної ініціалізації Appwrite для проєкту: ${PROJECT_ID}`);
  console.log(`📍 Endpoint: ${ENDPOINT}`);

  // 1. Створення бази даних
  console.log(`\n[1/5] Перевірка бази даних '${DATABASE_ID}'...`);
  const dbCheck = await api(`/databases/${DATABASE_ID}`, { method: 'GET' });
  if (dbCheck.ok) {
    console.log(`  ✓ База даних '${DATABASE_ID}' вже існує.`);
  } else {
    console.log(`  ➔ Створення бази даних '${DATABASE_ID}'...`);
    const dbCreate = await api('/databases', {
      method: 'POST',
      body: JSON.stringify({
        databaseId: DATABASE_ID,
        name: 'B-SDD Legal Sovereign Vault',
        enabled: true,
      }),
    });
    if (dbCreate.ok) {
      console.log(`  ✓ Базу даних успішно створено.`);
    } else {
      console.error(`  ❌ Помилка створення бази:`, dbCreate.data?.message || dbCreate.data);
      process.exit(1);
    }
  }

  // Helper для створення колекції з точним контролем прав доступу
  async function ensureCollection(colId, name, attributes, customPermissions = null) {
    console.log(`\nПеревірка колекції '${colId}' (${name})...`);
    // Default: mutable collections have read/create/update/delete for authenticated users
    // WORM collection is strictly append-only (read/create only; no update/delete)
    const effectivePermissions = customPermissions || [
      'read("users")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ];

    const check = await api(`/databases/${DATABASE_ID}/collections/${colId}`, { method: 'GET' });
    if (!check.ok) {
      console.log(`  ➔ Створення колекції '${colId}'...`);
      const create = await api(`/databases/${DATABASE_ID}/collections`, {
        method: 'POST',
        body: JSON.stringify({
          collectionId: colId,
          name: name,
          permissions: effectivePermissions,
          documentSecurity: false,
          enabled: true,
        }),
      });
      if (!create.ok) {
        console.error(`  ❌ Помилка створення колекції '${colId}':`, create.data?.message || create.data);
        return;
      }
      console.log(`  ✓ Колекцію '${colId}' створено.`);
      await sleep(1000);
    } else {
      console.log(`  ✓ Колекція '${colId}' вже існує. Оновлення політики прав (B-SDD WORM / Role Hardening)...`);
      const updateRes = await api(`/databases/${DATABASE_ID}/collections/${colId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name,
          permissions: effectivePermissions,
          documentSecurity: false,
          enabled: true,
        }),
      });
      if (updateRes.ok) {
        console.log(`  ✓ Права доступу для '${colId}' успішно синхронізовано.`);
      }
    }

    // Створення атрибутів
    for (const attr of attributes) {
      const attrPath = `/databases/${DATABASE_ID}/collections/${colId}/attributes/${attr.type}`;
      const payload = {
        key: attr.key,
        required: Boolean(attr.required),
        default: attr.default ?? null,
      };

      if (attr.type === 'string') {
        payload.size = attr.size || 255;
      }

      const res = await api(attrPath, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log(`    + Атрибут '${attr.key}' (${attr.type}) створено.`);
      } else if (res.data?.type === 'attribute_already_exists' || res.status === 409) {
        // Вже є
      } else {
        console.log(`    ℹ Атрибут '${attr.key}': ${res.data?.message || 'ОК'}`);
      }
      await sleep(300);
    }
  }

  // 2. Колекція CASES
  await ensureCollection('cases', 'Legal Cases Registry', [
    { key: 'case_id', type: 'string', size: 255, required: true },
    { key: 'reference', type: 'string', size: 255, required: true },
    { key: 'title_json', type: 'string', size: 4000, required: true },
    { key: 'court_json', type: 'string', size: 4000, required: true },
    { key: 'canton', type: 'string', size: 100, required: true },
    { key: 'type', type: 'string', size: 50, required: true },
    { key: 'client_name', type: 'string', size: 255, required: true },
    { key: 'client_role_json', type: 'string', size: 2000, required: true },
    { key: 'status', type: 'string', size: 50, required: true },
    { key: 'is_benchmark', type: 'boolean', required: true },
    { key: 'created_at', type: 'string', size: 50, required: true },
    { key: 'updated_at', type: 'string', size: 50, required: true },
    { key: 'description_json', type: 'string', size: 10000, required: true },
    { key: 'sequestration_target_chf', type: 'float', required: false, default: 0 },
  ]);

  // 3. Колекція WORM_RECORDS (Strictly Append-Only under Invariant L-01: NO update, NO delete)
  const wormPermissions = [
    'read("users")',
    'create("users")',
  ];
  await ensureCollection('worm_records', 'WORM Bitemporal Ledger', [
    { key: 'record_id', type: 'string', size: 255, required: true },
    { key: 'entity_id', type: 'string', size: 255, required: true },
    { key: 'chapter_id', type: 'string', size: 100, required: false, default: '' },
    { key: 'valid_from', type: 'string', size: 50, required: true },
    { key: 'valid_to', type: 'string', size: 50, required: true },
    { key: 'superseded_by', type: 'string', size: 255, required: false, default: '' },
    { key: 'supersedes_id', type: 'string', size: 255, required: false, default: '' },
    { key: 'sha256_hash', type: 'string', size: 128, required: true },
    { key: 'committer', type: 'string', size: 255, required: true },
    { key: 'summary', type: 'string', size: 4000, required: true },
    { key: 'content_snapshot', type: 'string', size: 65535, required: true },
    { key: 'status', type: 'string', size: 50, required: true },
    { key: 'timestamp', type: 'string', size: 50, required: true },
  ], wormPermissions);

  // 4. Колекція ACTORS
  await ensureCollection('actors', 'Procedural Actors Registry', [
    { key: 'case_id', type: 'string', size: 255, required: true },
    { key: 'actor_id', type: 'string', size: 255, required: true },
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'status_json', type: 'string', size: 2000, required: true },
    { key: 'badge_color', type: 'string', size: 100, required: false, default: '' },
    { key: 'role_json', type: 'string', size: 4000, required: true },
    { key: 'protected_bona_fide', type: 'boolean', required: false, default: false },
    { key: 'legal_reference', type: 'string', size: 255, required: false, default: '' },
    { key: 'procedural_standing', type: 'string', size: 100, required: false, default: '' },
    { key: 'cpp_article', type: 'string', size: 255, required: false, default: '' },
    { key: 'financial_claim_chf', type: 'float', required: false, default: 0 },
    { key: 'risk_level', type: 'string', size: 50, required: false, default: 'low' },
    { key: 'droits_json', type: 'string', size: 4000, required: false, default: '{}' },
  ]);

  // 5. Створення Storage Bucket
  console.log(`\n[5/5] Перевірка Storage Bucket '${BUCKET_ID}'...`);
  const bucketCheck = await api(`/storage/buckets/${BUCKET_ID}`, { method: 'GET' });
  if (bucketCheck.ok) {
    console.log(`  ✓ Сховище '${BUCKET_ID}' вже існує.`);
  } else {
    console.log(`  ➔ Створення сховища '${BUCKET_ID}'...`);
    const bucketCreate = await api('/storage/buckets', {
      method: 'POST',
      body: JSON.stringify({
        bucketId: BUCKET_ID,
        name: 'Legal Evidence Vault',
        permissions: [
          'read("users")',
          'create("users")',
          'update("users")',
          'delete("users")',
        ],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 52428800, // 50 MB
        allowedFileExtensions: ['pdf', 'mp3', 'm4a', 'wav', 'jpg', 'jpeg', 'png', 'epub', 'txt', 'json'],
        encryption: true,
        antivirus: false,
      }),
    });
    if (bucketCreate.ok) {
      console.log(`  ✓ Сховище успішно створено.`);
    } else {
      console.error(`  ❌ Помилка створення сховища:`, bucketCreate.data?.message || bucketCreate.data);
    }
  }

  console.log(`\n=============================================================================`);
  console.log(`🎉 Ініціалізація структури Appwrite завершена успішно!`);
  console.log(`База: ${DATABASE_ID} | Бакет: ${BUCKET_ID}`);
  console.log(`=============================================================================\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
