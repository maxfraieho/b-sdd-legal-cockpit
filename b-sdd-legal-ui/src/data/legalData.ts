// =========================================================================
// B-SDD LEGAL COCKPIT · BENCHMARK DATASET & LEGAL ONTOLOGY
// Judicial Context: Ministère public du Canton de Vaud, Dossier SBA
// Compliant with ADR-001..024 & Invariants L-01 to L-05
// =========================================================================

import { SupportedLanguage } from '../types/i18n';

export type LocalizedString = { [K in SupportedLanguage]?: string } & { uk?: string; fr?: string; en?: string };

export function resolveLocalized(val: LocalizedString | string | undefined, lang: SupportedLanguage): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val['fr'] || val['uk'] || val['en'] || val['de'] || val['it'] || '';
}

export function resolveLocalizedArray(
  val: Record<SupportedLanguage, string[]> | { [K in SupportedLanguage]?: string[] } | string[] | undefined,
  lang: SupportedLanguage
): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const map = val as { [K in SupportedLanguage]?: string[] };
  return map[lang] || map['fr'] || map['uk'] || map['en'] || map['de'] || map['it'] || [];
}

export interface CitationReference {
  evidence_id: string;
  cote: string;
  title: string;
  timecode: string;
  sha256: string;
  quote: LocalizedString;
  admissibility: LocalizedString;
}

export interface StatutoryElement {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  status: 'corroborated' | 'contested' | 'pending';
  citations: CitationReference[];
}

export interface CriminalCharge {
  id: string;
  code: string;
  title: LocalizedString;
  accused: string;
  accused_id: string;
  victim: LocalizedString;
  status: 'corroborated' | 'contested';
  atf_ruling: LocalizedString;
  conclusions_penales: LocalizedString;
  conclusions_civiles: LocalizedString;
  elements: StatutoryElement[];
  supporting_cotes: string[];
}

export interface BordereauPiece {
  cote: string;
  date_faits: string;
  date_versement: string;
  titre: LocalizedString;
  categorie: 'Audio' | 'Photo EXIF' | 'Médical' | 'Bancaire' | 'Message' | 'Procédure';
  sha256: string;
  admissibilite: LocalizedString;
  portee_probatoire: LocalizedString;
  citation_cle: LocalizedString;
  fichier_local: string;
  adr_id?: string;
  adr_title?: LocalizedString;
  adr_sync?: boolean;
  duration_sec?: number;
  exif_meta?: {
    camera: string;
    lens: string;
    timestamp: string;
    gps: string;
    iso: number;
    aperture: string;
    alibi_verification: LocalizedString | string;
  };
  audio_transcript?: Array<{ start: number; end: number; speaker: string; text: string }>;
}

export interface ConfrontationItem {
  id: string;
  theme: LocalizedString;
  prevenue_allegation: LocalizedString;
  corroborated_reality: LocalizedString;
  inconsistency_point: LocalizedString;
  exhibits: string[];
  certified_timestamp: string;
  investigation_questions: Partial<Record<SupportedLanguage, string[]>> & { uk?: string[]; fr?: string[]; en?: string[] };
  tactical_defense: LocalizedString;
}

export interface LegalRequisition {
  id: string;
  title: LocalizedString;
  norme: string;
  autorite: string;
  urgence: 'URGENT' | 'ORDINAIRE';
  category?: 'penal' | 'civil';
  conclusions_formelles: Partial<Record<SupportedLanguage, string[]>> & { uk?: string[]; fr?: string[]; en?: string[] };
  corps_texte: LocalizedString;
}

export interface ActorDocument {
  id: string;
  title: LocalizedString;
  type: string;
  sha256: string;
  date: string;
  url?: string;
  verified: boolean;
}

export interface ActorPhoto {
  url: string;
  caption: LocalizedString;
  timestamp?: string;
  sha256?: string;
}

export interface ActorItem {
  id: string;
  name: string;
  age?: number;
  birthdate?: string;
  status: LocalizedString;
  badgeColor: string;
  role: LocalizedString;
  /** Invariant L-03: Bona fide third party protection flag */
  protected_bona_fide: boolean;
  legal_reference: string;
  droits_proceduraux: Partial<Record<SupportedLanguage, string[]>> & { uk?: string[]; fr?: string[]; en?: string[] };
  forbidden_actions?: string[];
  avatarUrl?: string;
  photos?: ActorPhoto[];
  documents?: ActorDocument[];
  nationality?: LocalizedString;
  domicile?: LocalizedString;
  discernment_capacity?: boolean;
  procedural_standing?:
    | 'victime_plaignante'
    | 'prevenu_principal'
    | 'prevenu_complice'
    | 'tiers_bonne_foi'
    | 'temoin'
    | 'personne_renseignement'
    | 'magistrat'
    | 'avocat';
  cpp_article?: string;
  lawyer?: { name: string; bar: string; address?: string; phone?: string };
  financial_claim_chf?: number;
  financial_liability_chf?: number;
  linked_pieces?: string[];
  invariants?: string[];
  risk_level?: 'low' | 'medium' | 'high' | 'critical' | 'immune';
  bitemporal_valid_from?: string;
  bitemporal_tx_time?: string;
  custom_notes?: string;
}

export interface DossierChapter {
  id: string;
  number: string;
  title: LocalizedString;
  status: 'verified' | 'modified' | 'draft';
  summary: LocalizedString;
  outdated_claim: LocalizedString;
  lawyer_draft: LocalizedString;
  impacted_articles: string[];
  supporting_pieces: string[];
}

// =========================================================================
// DATA ACCESS LAYER: DEMO vs REAL DATA DISPATCHER (ADR-024 / S00b)
// =========================================================================

export type DataMode = 'demo' | 'real';
export const DATA_MODE: DataMode = (import.meta.env.VITE_DATA_MODE as DataMode) || 'demo';
export const isDemoMode = (): boolean => DATA_MODE === 'demo';

import {
  ACTORS as INGESTED_ACTORS,
  BORDEREAU_PIECES as INGESTED_PIECES,
  CHARGES as INGESTED_CHARGES,
  DOSSIER_CHAPTERS as INGESTED_CHAPTERS,
  CONFRONTATIONS as INGESTED_CONFRONTATIONS,
  LEGAL_REQUISITIONS as INGESTED_REQUISITIONS,
} from '@case-data';

export const ACTORS: ActorItem[] = INGESTED_ACTORS;
export const BORDEREAU_PIECES: BordereauPiece[] = INGESTED_PIECES;
export const CHARGES: CriminalCharge[] = INGESTED_CHARGES;
export const DOSSIER_CHAPTERS: DossierChapter[] = INGESTED_CHAPTERS;
export const CONFRONTATIONS: ConfrontationItem[] = INGESTED_CONFRONTATIONS;
export const LEGAL_REQUISITIONS: LegalRequisition[] = INGESTED_REQUISITIONS;

// Live runtime state handlers (persisted via actorsManager and appwriteDb)
let liveActors: ActorItem[] = [...INGESTED_ACTORS];
export const getLiveActors = (): ActorItem[] => liveActors;
export const setLiveActors = (actors: ActorItem[]): void => {
  liveActors = actors;
};
