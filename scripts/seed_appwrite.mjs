#!/usr/bin/env node
// =========================================================================
// B-SDD LEGAL COCKPIT · SEED INITIAL BENCHMARK DATA TO APPWRITE CLOUD
// ADR-001 (WORM), ADR-009 (Bitemporal), ADR-011 (Multi-Case)
// =========================================================================

const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '6abab6b5003a4b7b1560';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error('Missing APPWRITE_API_KEY');
  process.exit(1);
}

const DATABASE_ID = 'legal_vault';

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

async function main() {
  console.log('🌱 Заповнення хмарної бази Appwrite початковими еталонними даними...');

  const CASE_ID = process.env.CASE_ID || 'DEMO-CASE-SBA';
  const CASE_REF = process.env.CASE_REFERENCE || 'Dossier SBA (Demo)';
  const CLIENT_NAME = process.env.CLIENT_NAME || 'Partie Plaignante (L-04)';
  const BONA_FIDE_NAME = process.env.BONA_FIDE_NAME || 'Tiers de Bonne Foi (L-03)';

  // 1. Benchmark Case
  console.log(`1. Додавання справи (${CASE_ID})...`);
  const casePayload = {
    case_id: CASE_ID,
    reference: CASE_REF,
    title_json: JSON.stringify({
      uk: 'Справа щодо кримінальних правопорушень (Шахрайство, погрози, наклеп)',
      fr: 'Affaire pénale de référence (Escroquerie, menaces, dénonciation calomnieuse)',
      en: 'Criminal proceeding benchmark (Fraud, threats, malicious false accusation)',
    }),
    court_json: JSON.stringify({
      uk: 'Прокуратура кантону Во · Округ Лозанна',
      fr: 'Ministère public du Canton de Vaud · Arrondissement de Lausanne',
      en: 'Public Prosecutor of the Canton of Vaud · Lausanne District',
    }),
    canton: 'Vaud',
    type: 'penal',
    client_name: CLIENT_NAME,
    client_role_json: JSON.stringify({
      uk: 'Потерпілий & Цивільний позивач (Повнолітній, 26 років)',
      fr: 'Partie plaignante & Demandeur civil (Majeur, 26 ans)',
      en: 'Complainant & Civil Plaintiff (Adult, 26 yo)',
    }),
    status: 'active',
    is_benchmark: true,
    created_at: '2024-07-23T10:00:00Z',
    updated_at: '2026-09-25T12:00:00Z',
    description_json: JSON.stringify({
      uk: 'Основна еталонна справа щодо привласнення коштів, погроз, пошкодження майна та арешту рахунків на CHF 47 700.00.',
      fr: 'Dossier pénal de référence concernant la captation de fonds, menaces graves, dégâts matériels et séquestre conservatoire de CHF 47 700.00.',
    }),
    sequestration_target_chf: 47700,
  };

  const caseRes = await api(`/databases/${DATABASE_ID}/collections/cases/documents`, {
    method: 'POST',
    body: JSON.stringify({
      documentId: CASE_ID,
      data: casePayload,
      permissions: ['read("users")', 'update("users")', 'delete("users")'],
    }),
  });
  console.log('  Статус справи:', caseRes.ok ? '✓ Додано' : caseRes.status === 409 ? '✓ Вже існує' : caseRes.data?.message);

  // 2. Initial WORM Records
  console.log('2. Додавання первинних WORM-записів (L-01)...');
  const wormSeeds = [
    {
      record_id: 'WORM-REC-0001',
      entity_id: 'ACT-VICTIM-ADULT',
      chapter_id: 'CH-01',
      valid_from: '2024-07-23T10:00:00Z',
      valid_to: '9999-12-31T23:59:59Z',
      superseded_by: '',
      supersedes_id: '',
      sha256_hash: '8c94fa10b98144298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7',
      committer: 'Me B. Kamber (Avocat plaidant / Lausanne)',
      summary: "Purge de la mention erronée de minorité : fixation du statut d'adulte (26 ans) et partie plaignante (Art. 115, 118 CPP).",
      content_snapshot: `${CLIENT_NAME}, majeur capable de discernement. Victime et partie plaignante constituée.`,
      status: 'active',
      timestamp: '2024-07-23T10:00:00Z',
    },
    {
      record_id: 'WORM-REC-0002',
      entity_id: 'ACT-BONA-FIDE-THIRD-PARTY',
      chapter_id: 'CH-02',
      valid_from: '2024-07-23T11:30:00Z',
      valid_to: '9999-12-31T23:59:59Z',
      superseded_by: '',
      supersedes_id: '',
      sha256_hash: 'd4af37c5a0591234567890abcdef1234567890abcdef1234567890abcdef1234',
      committer: 'Me B. Kamber (Avocat plaidant / Lausanne)',
      summary: "Sanctuarisation de l'immunité du tiers de bonne foi sous le bouclier de l'Art. 933 CC et Art. 105 al. 2 CPP (Invariant L-03).",
      content_snapshot: `${BONA_FIDE_NAME} : Tiers de bonne foi absolu. Interdiction d'office de toute poursuite pénale ou action récursoire.`,
      status: 'active',
      timestamp: '2024-07-23T11:30:00Z',
    },
    {
      record_id: 'WORM-REC-0003',
      entity_id: 'CLAIM-SEQUESTRE-47700',
      chapter_id: 'CH-14',
      valid_from: '2024-07-26T10:00:00Z',
      valid_to: '9999-12-31T23:59:59Z',
      superseded_by: '',
      supersedes_id: 'WORM-REC-0002',
      sha256_hash: '7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
      committer: 'Me B. Kamber (Avocat plaidant / Lausanne)',
      summary: "Mise à jour du séquestre conservatoire Art. 263 CPP à concurrence de CHF 47'700.00.",
      content_snapshot: "Séquestre de CHF 47'700.00 : Restitution de fonds, dégâts matériels, tort moral.",
      status: 'active',
      timestamp: '2024-07-26T10:00:00Z',
    }
  ];

  for (const w of wormSeeds) {
    const wRes = await api(`/databases/${DATABASE_ID}/collections/worm_records/documents`, {
      method: 'POST',
      body: JSON.stringify({
        documentId: w.record_id,
        data: w,
        permissions: ['read("users")'],
      }),
    });
    console.log(`  WORM ${w.record_id}:`, wRes.ok ? '✓ Додано' : wRes.status === 409 ? '✓ Вже існує' : wRes.data?.message);
  }

  // 3. Initial Actors
  console.log('3. Додавання фігурантів справи (Actors)...');
  const actors = [
    {
      case_id: CASE_ID,
      actor_id: 'ACT-VICTIM-ADULT',
      name: CLIENT_NAME,
      status_json: JSON.stringify({
        uk: 'Потерпілий & Цивільний позивач',
        fr: 'Partie plaignante & Demandeur civil',
        en: 'Complainant & Civil Plaintiff',
      }),
      badge_color: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      role_json: JSON.stringify({
        uk: 'Потерпілий, жертва шахрайства та тяжких погроз розправою.',
        fr: 'Victime directe d escroquerie et menaces graves.',
      }),
      protected_bona_fide: false,
      legal_reference: 'Art. 115, 118 CPP',
      procedural_standing: 'victime_plaignante',
      cpp_article: 'Art. 115, 118, 122 CPP',
      financial_claim_chf: 47700,
      risk_level: 'low',
      droits_json: JSON.stringify({
        uk: ['Повний доступ до матеріалів', 'Право подання клопотань'],
        fr: ['Plein accès au dossier', 'Droit d exiger des mesures d instruction'],
      }),
    },
    {
      case_id: CASE_ID,
      actor_id: 'ACT-BONA-FIDE-THIRD-PARTY',
      name: BONA_FIDE_NAME,
      status_json: JSON.stringify({
        uk: 'Добросовісний третій набувач (Bouclier Art. 933 CC)',
        fr: 'Tiers de bonne foi protégé (Bouclier Art. 933 CC)',
        en: 'Protected Bona Fide Third Party',
      }),
      badge_color: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
      role_json: JSON.stringify({
        uk: 'Добросовісна третя особа. Повний захист від переслідування.',
        fr: 'Acquéreur de bonne foi. Immunité totale.',
      }),
      protected_bona_fide: true,
      legal_reference: 'Art. 933 CC / Art. 105 al. 2 CPP',
      procedural_standing: 'tiers_touche',
      cpp_article: 'Art. 105 al. 2 CPP',
      financial_claim_chf: 0,
      risk_level: 'none',
      droits_json: JSON.stringify({
        uk: ['Абсолютний імунітет добросовісного набувача'],
        fr: ['Immunité absolue contre toute poursuite pénale'],
      }),
    }
  ];

  for (const a of actors) {
    const aRes = await api(`/databases/${DATABASE_ID}/collections/actors/documents`, {
      method: 'POST',
      body: JSON.stringify({
        documentId: a.actor_id,
        data: a,
        permissions: ['read("users")', 'update("users")', 'delete("users")'],
      }),
    });
    console.log(`  Фігурант ${a.name}:`, aRes.ok ? '✓ Додано' : aRes.status === 409 ? '✓ Вже існує' : aRes.data?.message);
  }

  console.log('✅ Усі початкові дані успішно синхронізовано з Appwrite Cloud!');
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
