/**
 * B-SDD Legal Operator Workbench - Type Definitions (DTOs)
 * Compliant with B-SDD Methodology v1.2, ADR-001..020
 * Mirrors pure Python models in src/legal/actors.py & src/legal/timeline_calibrator.py
 */

export type ProceduralStatus =
  | "victime_partie_plaignante"
  | "partie_plaignante_demandeur_civil"
  | "prevenue_auteur_principal"
  | "prevenue_complice"
  | "auteur_sous_emprise"
  | "tiers_de_bonne_foi";

export type RelationType =
  | "co_perpetration"
  | "instigation"
  | "alleged_victim_of"
  | "financial_claimant"
  | "asset_appropriation"
  | "assistance"
  | "representation"
  | "co_residence";

export interface ActorEntity {
  actor_id: string;
  name: string;
  procedural_status: ProceduralStatus;
  role_description: string;
  legal_aliases: string[];
  /** Invariant L-03: Protection flag for bona fide third parties (Jean-Paul VERNON) */
  bona_fide_protection: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ActorRelation {
  source_actor_id: string;
  target_actor_id: string;
  relation_type: RelationType;
  basis_evidence_hashes: string[];
  confidence_score: number;
  created_at: string;
}

export type FactStatus = "active" | "superseded" | "disputed";

export interface BitemporalFactEvent {
  fact_id: string;
  label: string;
  /** Valid Time (Tv): When the event actually took place in reality */
  t_v: string;
  /** Transaction Time (Tt): When the event was recorded/asserted in the procedural record */
  t_t: string;
  source_evidence_hashes: string[];
  actor_ids: string[];
  location?: string;
  status: FactStatus;
  conflict_flag: boolean;
  superseded_by?: string;
  supersedes?: string;
  valid_to?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface FactCalibrationRequest {
  fact_id: string;
  calibrated_tv: string;
  rationale: string;
  evidence_hashes: string[];
  conflict_flag?: boolean;
}

export interface DossierSummary {
  dossier_id: string;
  code: string;
  title: string;
  jurisdiction: string;
  canton: string;
  procedure_number: string;
  procedural_stage: string;
  actors_count: number;
  facts_count: number;
  conflicts_count: number;
  last_updated: string;
}

export interface EvidenceDocument {
  doc_id: string;
  title: string;
  filename: string;
  sha256_hash: string;
  doc_type: "audio_transcript" | "judicial_decision" | "contract" | "police_report" | "bank_statement";
  pages_count: number;
  recorded_tt: string;
  associated_actors: string[];
  snippet: string;
}
