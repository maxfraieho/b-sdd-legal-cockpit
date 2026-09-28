// =========================================================================
// B-SDD LEGAL COCKPIT · APPWRITE DATABASE & STORAGE ADAPTER
// Offline-First Sovereign Data Layer (Databases + Storage Buckets)
// ADR-001 (WORM Invariant), ADR-009 (Bitemporal), ADR-011 (Multi-Case)
// =========================================================================

import { ID, Query } from 'appwrite';
import { databases, storage, APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from './appwrite';
import { LegalCase } from './casesManager';
import { WormLedgerRecord } from './wormLedger';
import { ActorItem } from '../data/legalData';

export const APPWRITE_DATABASE_ID = 'legal_vault';
export const APPWRITE_BUCKET_ID = 'legal-evidence-vault';

export const APPWRITE_COLLECTIONS = {
  CASES: 'cases',
  ACTORS: 'actors',
  WORM: 'worm_records',
  EVIDENCE: 'evidence_pieces',
} as const;

export interface CloudSyncStatus {
  isConfigured: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

/**
 * Checks if Appwrite Cloud Database is accessible.
 */
export async function checkAppwriteHealth(): Promise<boolean> {
  try {
    await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.CASES, [Query.limit(1)]);
    return true;
  } catch (err: any) {
    // 404 means database or collection not yet provisioned, which is handled gracefully
    if (err?.code === 404) {
      console.info('Appwrite database/collection not yet provisioned. Operating in offline/local mode.');
    } else {
      console.warn('Appwrite database check:', err?.message || err);
    }
    return false;
  }
}

// =========================================================================
// CASES SYNC (ADR-011)
// =========================================================================

export async function fetchCasesFromCloud(): Promise<LegalCase[] | null> {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.CASES, [
      Query.limit(100),
      Query.orderDesc('$createdAt'),
    ]);

    if (!res.documents || res.documents.length === 0) return null;

    return res.documents.map((doc: any) => ({
      id: doc.case_id || doc.$id,
      reference: doc.reference,
      title: JSON.parse(doc.title_json || '{}'),
      court: JSON.parse(doc.court_json || '{}'),
      canton: doc.canton,
      type: doc.type,
      client_name: doc.client_name,
      client_role: JSON.parse(doc.client_role_json || '{}'),
      status: doc.status,
      is_benchmark: Boolean(doc.is_benchmark),
      created_at: doc.created_at || doc.$createdAt,
      updated_at: doc.updated_at || doc.$updatedAt,
      description: JSON.parse(doc.description_json || '{}'),
      sequestration_target_chf: Number(doc.sequestration_target_chf || 0),
    }));
  } catch (err: any) {
    console.warn('fetchCasesFromCloud fallback to localStorage:', err?.message || err);
    return null;
  }
}

export async function upsertCaseToCloud(caseData: LegalCase): Promise<boolean> {
  try {
    const payload = {
      case_id: caseData.id,
      reference: caseData.reference,
      title_json: JSON.stringify(caseData.title),
      court_json: JSON.stringify(caseData.court),
      canton: caseData.canton,
      type: caseData.type,
      client_name: caseData.client_name,
      client_role_json: JSON.stringify(caseData.client_role),
      status: caseData.status,
      is_benchmark: caseData.is_benchmark,
      created_at: caseData.created_at,
      updated_at: caseData.updated_at,
      description_json: JSON.stringify(caseData.description),
      sequestration_target_chf: caseData.sequestration_target_chf,
    };

    // Try update existing by doc ID or case_id
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.CASES, caseData.id, payload);
      return true;
    } catch {
      await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.CASES, caseData.id, payload);
      return true;
    }
  } catch (err: any) {
    console.warn('upsertCaseToCloud error:', err?.message || err);
    return false;
  }
}

// =========================================================================
// WORM BITEMPORAL LEDGER SYNC (ADR-001 / INVARIANT L-01)
// =========================================================================

export async function fetchWormRecordsFromCloud(): Promise<WormLedgerRecord[] | null> {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.WORM, [
      Query.limit(200),
      Query.orderDesc('$createdAt'),
    ]);

    if (!res.documents || res.documents.length === 0) return null;

    return res.documents.map((doc: any) => ({
      record_id: doc.record_id || doc.$id,
      entity_id: doc.entity_id,
      chapter_id: doc.chapter_id || undefined,
      valid_from: doc.valid_from,
      valid_to: doc.valid_to,
      superseded_by: doc.superseded_by || null,
      supersedes_id: doc.supersedes_id || null,
      sha256_hash: doc.sha256_hash,
      committer: doc.committer,
      summary: doc.summary,
      content_snapshot: doc.content_snapshot,
      status: doc.status as 'active' | 'superseded' | 'immutable',
      timestamp: doc.timestamp || doc.$createdAt,
    }));
  } catch (err: any) {
    console.warn('fetchWormRecordsFromCloud fallback to localStorage:', err?.message || err);
    return null;
  }
}

export async function pushWormRecordToCloud(record: WormLedgerRecord): Promise<boolean> {
  try {
    const payload = {
      record_id: record.record_id,
      entity_id: record.entity_id,
      chapter_id: record.chapter_id || '',
      valid_from: record.valid_from,
      valid_to: record.valid_to,
      superseded_by: record.superseded_by || '',
      supersedes_id: record.supersedes_id || '',
      sha256_hash: record.sha256_hash,
      committer: record.committer,
      summary: record.summary,
      content_snapshot: record.content_snapshot,
      status: record.status,
      timestamp: record.timestamp,
    };

    await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.WORM, ID.unique(), payload);
    return true;
  } catch (err: any) {
    console.warn('pushWormRecordToCloud error:', err?.message || err);
    return false;
  }
}

// =========================================================================
// ACTORS REGISTRY SYNC (ADR-009)
// =========================================================================

export async function fetchActorsFromCloud(caseId: string): Promise<ActorItem[] | null> {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.ACTORS, [
      Query.equal('case_id', caseId),
      Query.limit(100),
    ]);

    if (!res.documents || res.documents.length === 0) return null;

    return res.documents.map((doc: any) => ({
      id: doc.actor_id || doc.$id,
      name: doc.name,
      status: JSON.parse(doc.status_json || '{}'),
      badgeColor: doc.badge_color || 'bg-slate-800 text-slate-300 border-slate-700',
      role: JSON.parse(doc.role_json || '{}'),
      protected_bona_fide: Boolean(doc.protected_bona_fide),
      legal_reference: doc.legal_reference,
      procedural_standing: doc.procedural_standing,
      cpp_article: doc.cpp_article,
      financial_claim_chf: Number(doc.financial_claim_chf || 0),
      risk_level: doc.risk_level || 'low',
      droits_proceduraux: JSON.parse(doc.droits_json || '{}'),
    }));
  } catch (err: any) {
    console.warn('fetchActorsFromCloud fallback to localStorage:', err?.message || err);
    return null;
  }
}

// =========================================================================
// EVIDENCE STORAGE VAULT (Storage Buckets)
// =========================================================================

/**
 * Uploads an evidence file (audio recording, document, image) to Appwrite Storage.
 */
export async function uploadEvidenceFile(file: File): Promise<{ fileId: string; viewUrl: string }> {
  try {
    const res = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
    const viewUrl = getEvidenceFileViewUrl(res.$id);
    return {
      fileId: res.$id,
      viewUrl,
    };
  } catch (err: any) {
    console.error('Failed to upload evidence to Appwrite Storage:', err);
    throw err;
  }
}

/**
 * Generates direct view URL for an evidence file stored in Appwrite Storage.
 */
export function getEvidenceFileViewUrl(fileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

/**
 * Generates direct download URL for an evidence file stored in Appwrite Storage.
 */
export function getEvidenceFileDownloadUrl(fileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
}
