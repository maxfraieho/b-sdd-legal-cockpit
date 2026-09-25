// =========================================================================
// B-SDD LEGAL FRAMEWORK · MULTI-CASE MANAGEMENT ENGINE (ADR-009, ADR-011)
// Multi-tenancy isolation for Swiss legal proceedings
// =========================================================================

import { SupportedLanguage } from '../types/i18n';
import { ACTORS, ActorItem, BORDEREAU_PIECES, BordereauPiece } from '../data/legalData';

export type CaseType = 'penal' | 'civil' | 'administrative' | 'arbitration';

export interface LegalCase {
  id: string;
  reference: string; // e.g. "PE24.014624-SBA"
  title: Record<SupportedLanguage, string>;
  court: Record<SupportedLanguage, string>;
  canton: string; // "Vaud", "Genève", "Zurich", "Berne", etc.
  type: CaseType;
  client_name: string;
  client_role: Record<SupportedLanguage, string>;
  status: 'active' | 'archived' | 'closed';
  is_benchmark: boolean; // Protected benchmark case
  created_at: string;
  updated_at: string;
  description: Record<SupportedLanguage, string>;
  sequestration_target_chf: number;
}

export const CASES_STORAGE_KEY = 'b_sdd_legal_cases_registry_v1';
export const ACTIVE_CASE_ID_STORAGE_KEY = 'b_sdd_active_case_id_v1';

export const BENCHMARK_CASE_ID = 'PE24.014624-SBA';

export const BENCHMARK_CASES: LegalCase[] = [
  {
    id: BENCHMARK_CASE_ID,
    reference: 'PE24.014624-SBA',
    title: {
      uk: 'Справа Коваленко проти Суворової (Шахрайство, погрози, наклеп)',
      fr: 'Affaire Kovalenko c/ Suvorova (Escroquerie, menaces, dénonciation calomnieuse)',
      en: 'Kovalenko v. Suvorova (Fraud, threats, malicious false accusation)',
    },
    court: {
      uk: 'Прокуратура кантону Во · Округ Лозанна',
      fr: 'Ministère public du Canton de Vaud · Arrondissement de Lausanne',
      en: 'Public Prosecutor of the Canton of Vaud · Lausanne District',
    },
    canton: 'Vaud',
    type: 'penal',
    client_name: 'Arsen KOVALENKO',
    client_role: {
      uk: 'Потерпілий & Цивільний позивач (Повнолітній, 26 років)',
      fr: 'Partie plaignante & Demandeur civil (Majeur, 26 ans)',
      en: 'Complainant & Civil Plaintiff (Adult, 26 yo)',
    },
    status: 'active',
    is_benchmark: true,
    created_at: '2024-07-23T10:00:00Z',
    updated_at: '2026-09-25T12:00:00Z',
    description: {
      uk: 'Основна еталонна справа щодо привласнення $15 000 USD, тяжких погроз розправою, фальсифікації нападу та клопотання про арешт банківських рахунків на CHF 46 850.00 (ст. 146, 180, 181, 186, 303 CP / ст. 263 CPP).',
      fr: 'Dossier pénal de référence concernant la captation de $15 000 USD, menaces graves de mort, agression fabriquée et séquestre conservatoire de CHF 46 850.00.',
      en: 'Benchmark criminal proceeding concerning $15,000 USD fraud, death threats, fabricated assault, and conservative asset freeze of CHF 46,850.00.',
    },
    sequestration_target_chf: 46850,
  },
  {
    id: 'GE25.004112-CIV',
    reference: 'GE25.004112-CIV',
    title: {
      uk: 'Справа Фідуція Лемáн проти Приватного Банку (Комерційний шантаж)',
      fr: 'Fiduciaire Lémanique SA c/ Banque Privée de Genève (Rupture abusive & Chantage)',
      en: 'Fiduciaire Lémanique SA v. Private Bank of Geneva (Commercial Breach & Blackmail)',
    },
    court: {
      uk: 'Цивільний суд Республіки та Кантону Женева',
      fr: 'Tribunal civil de la République et Canton de Genève',
      en: 'Civil Court of the Republic and Canton of Geneva',
    },
    canton: 'Genève',
    type: 'civil',
    client_name: 'Fiduciaire Lémanique SA',
    client_role: {
      uk: 'Позивач (Demandeur)',
      fr: 'Demandeur au civil',
      en: 'Civil Plaintiff',
    },
    status: 'active',
    is_benchmark: false,
    created_at: '2025-02-10T09:30:00Z',
    updated_at: '2025-08-14T15:20:00Z',
    description: {
      uk: 'Цивільний позов про відшкодування збитків за порушення банківської таємниці та неправомірне замороження операційного рахунку (ст. 97 CO / ст. 47 LB).',
      fr: 'Action en dommages-intérêts pour rupture intempestive de relations bancaires et blocage illicite de compte.',
      en: 'Civil damages action for wrongful termination of banking relationship and unlawful account freeze.',
    },
    sequestration_target_chf: 120000,
  },
  {
    id: 'VD25.019842-COM',
    reference: 'VD25.019842-COM',
    title: {
      uk: 'Спадковий спір Лаво-Орон (Фальсифікація заповіту & Відчуження)',
      fr: 'Succession de V. c/ Tiers acquéreur (Contestation testamentaire & Captation)',
      en: 'Estate of V. v. Third-party buyer (Will forgery & Unlawful appropriation)',
    },
    court: {
      uk: 'Мировий суд округу Лаво-Орон (Canton de Vaud)',
      fr: 'Justice de paix du district de Lavaux-Oron · Cully',
      en: 'Justice of the Peace of Lavaux-Oron District',
    },
    canton: 'Vaud',
    type: 'civil',
    client_name: 'Éléonore DE VALMONT',
    client_role: {
      uk: 'Спадкоємець за законом (Héritière réservataire)',
      fr: 'Héritière réservataire',
      en: 'Forced Heir',
    },
    status: 'active',
    is_benchmark: false,
    created_at: '2025-05-18T14:00:00Z',
    updated_at: '2025-09-01T11:15:00Z',
    description: {
      uk: 'Позов про визнання недійсним заповіту та витребування нерухомості з чужого незаконного володіння (ст. 467 ss, 519 CC).',
      fr: 'Action en nullité de testament pour incapacité de discernement et pétition d hérédité (Art. 467 ss CC).',
      en: 'Action for annulment of testamentary disposition and inheritance petition.',
    },
    sequestration_target_chf: 350000,
  },
];

// --- Case Storage Functions ---

export function loadAllCases(): LegalCase[] {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY);
    if (!raw) {
      saveAllCases(BENCHMARK_CASES);
      return BENCHMARK_CASES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return BENCHMARK_CASES;
  } catch (err) {
    console.error('Failed to load legal cases:', err);
    return BENCHMARK_CASES;
  }
}

export function saveAllCases(cases: LegalCase[]): void {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save legal cases:', err);
  }
}

export function loadActiveCaseId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_CASE_ID_STORAGE_KEY);
    if (active) return active;
  } catch {}
  return BENCHMARK_CASE_ID;
}

export function saveActiveCaseId(caseId: string): void {
  try {
    localStorage.setItem(ACTIVE_CASE_ID_STORAGE_KEY, caseId);
  } catch {}
}

export function createNewCase(newCase: Omit<LegalCase, 'id' | 'created_at' | 'updated_at'>): LegalCase {
  const id = newCase.reference.trim() || `CASE-${Date.now().toString().slice(-6)}`;
  const fullCase: LegalCase = {
    ...newCase,
    id,
    is_benchmark: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const cases = loadAllCases();
  const updated = [fullCase, ...cases.filter((c) => c.id !== id)];
  saveAllCases(updated);
  saveActiveCaseId(id);

  // Initialize isolated case actors and pieces
  initializeCaseNamespace(id, fullCase);

  return fullCase;
}

export function updateCase(updatedCase: LegalCase): LegalCase[] {
  const cases = loadAllCases();
  const updated = cases.map((c) => (c.id === updatedCase.id ? { ...updatedCase, updated_at: new Date().toISOString() } : c));
  saveAllCases(updated);
  return updated;
}

export function deleteCase(caseId: string): { success: boolean; error?: string; remaining: LegalCase[] } {
  if (caseId === BENCHMARK_CASE_ID) {
    return {
      success: false,
      error: 'La suppression du dossier étalon PE24.014624-SBA est strictement interdite (Invariant L-01 / L-04).',
      remaining: loadAllCases(),
    };
  }

  const cases = loadAllCases();
  const remaining = cases.filter((c) => c.id !== caseId);
  saveAllCases(remaining);

  // Clear case namespace
  try {
    localStorage.removeItem(`b_sdd_case_${caseId}_actors_v1`);
    localStorage.removeItem(`b_sdd_case_${caseId}_evidence_v1`);
    localStorage.removeItem(`b_sdd_case_${caseId}_worm_v1`);
  } catch {}

  const currentActive = loadActiveCaseId();
  if (currentActive === caseId) {
    saveActiveCaseId(BENCHMARK_CASE_ID);
  }

  return { success: true, remaining };
}

// Initialize default storage namespace for a newly created case
function initializeCaseNamespace(caseId: string, caseData: LegalCase): void {
  // Provide client as initial actor
  const initialActor: ActorItem = {
    id: `ACT-${caseId}-CLIENT`,
    name: caseData.client_name,
    status: {
      uk: caseData.client_role.uk,
      fr: caseData.client_role.fr,
      en: caseData.client_role.en,
    },
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    role: {
      uk: `Клієнт та представництво інтересів у справі ${caseData.reference}.`,
      fr: `Mandant principal et partie constituée dans le dossier ${caseData.reference}.`,
      en: `Principal client and standing party in case ${caseData.reference}.`,
    },
    protected_bona_fide: false,
    legal_reference: caseData.type === 'penal' ? 'Art. 115, 118 CPP' : 'Art. 59 ss CPC',
    procedural_standing: caseData.type === 'penal' ? 'victime_plaignante' : 'temoin',
    cpp_article: caseData.type === 'penal' ? 'Art. 115, 118, 122 CPP' : 'Art. 59 CPC',
    financial_claim_chf: caseData.sequestration_target_chf || 0,
    risk_level: 'low',
    droits_proceduraux: {
      uk: ['Повноправний доступ до матеріалів провадження', 'Право подання клопотань та доказів'],
      fr: ['Plein accès au dossier de la procédure', 'Droit d exiger des mesures d instruction'],
      en: ['Full file inspection right', 'Right to submit evidence & motions'],
    },
  };

  try {
    localStorage.setItem(`b_sdd_case_${caseId}_actors_v1`, JSON.stringify([initialActor]));
  } catch {}
}

// Case-aware loader for actors
export function loadActorsForCase(caseId: string): ActorItem[] {
  if (caseId === BENCHMARK_CASE_ID) {
    // Return canonical benchmark actors
    const raw = localStorage.getItem('b_sdd_legal_case_actors_v1');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ACTORS;
  }

  // Generic custom case
  const key = `b_sdd_case_${caseId}_actors_v1`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export function saveActorsForCase(caseId: string, actors: ActorItem[]): void {
  const key = caseId === BENCHMARK_CASE_ID ? 'b_sdd_legal_case_actors_v1' : `b_sdd_case_${caseId}_actors_v1`;
  try {
    localStorage.setItem(key, JSON.stringify(actors));
  } catch {}
}
