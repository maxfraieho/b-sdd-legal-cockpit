import { SupportedLanguage } from "./i18n";

export type ProceduralStageStatus = "completed" | "in_progress" | "pending";

export interface ProceduralCheckpoint {
  id: string;
  label: Record<SupportedLanguage, string>;
  description?: Record<SupportedLanguage, string>;
  isCompleted: boolean;
  legalBasis?: string;
  pieceCote?: string;
}

export interface ProceduralStage {
  id: string;
  order: number;
  stageCode: string; // e.g. "STAGE-1-OUVERTURE"
  title: Record<SupportedLanguage, string>;
  subtitle: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  articles: string[]; // e.g. ["Art. 115 CPP", "Art. 303 CP", "Art. 933 CC"]
  status: ProceduralStageStatus;
  keyActors: string[]; // actor IDs e.g. ["ACT-ARSEN-KOVALENKO", "ACT-ADRIANO-MILLI"]
  keyExhibits: string[]; // piece cotes e.g. ["P-03", "P-06", "P-16"]
  financialTargetChf?: number;
  recommendedTools: string[]; // tool identifiers for context launching
  checkpoints: ProceduralCheckpoint[];
  courtAuthority: Record<SupportedLanguage, string>;
  summaryActionLabel: Record<SupportedLanguage, string>;
}
