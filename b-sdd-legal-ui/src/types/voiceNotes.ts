// =========================================================================
// B-SDD LEGAL COCKPIT · ADVOCATE VOICE NOTES & DEPOSITION TYPES (ADR-026)
// Standards: Astryx Design System v2.5, ISO/IEC 27037, Invariants L-01..L-05
// =========================================================================

export interface AudioSegment {
  startSeconds: number;
  endSeconds: number;
  transcriptSegment: string;
  speakerLabel?: string;
  confidence: number;
}

export interface SwissArticleSubsumption {
  article: string;            // ex: "Art. 180 al. 1 CP"
  offenseName: string;        // ex: "Menaces graves"
  accusedActorId: string;     // ex: "ACT-LIUBOV-SUVOROVA"
  victimActorId: string;      // ex: "ACT-ARSEN-KOVALENKO"
  qualifyingFacts: string[];
  evidenceCitations: string[];
  confidence: number;
}

export interface AdvocateVoiceNote {
  noteId: string;
  dossierId: string;
  title: string;
  authorId: string;
  rawTranscript: string;
  audioSha256: string;
  audioDurationSeconds: number;
  tV: string;                 // Valid Time (ISO UTC)
  tT: string;                 // Transaction Time (ISO UTC)
  audioSegments: AudioSegment[];
  targetActorIds: string[];
  legalObservations: string;
  subsumptions: SwissArticleSubsumption[];
  blastRadiusChapters: string[];
  status: 'active' | 'superseded' | 'challenged';
  sha256Seal?: string;
}
