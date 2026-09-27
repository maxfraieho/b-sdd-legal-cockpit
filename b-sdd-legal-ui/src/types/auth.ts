// =========================================================================
// B-SDD LEGAL COCKPIT · СИСТЕМА АВТОРИЗАЦІЇ ТА РОЛЬОВОГО ДОСТУПУ (RBAC)
// Захист таємниці слідства (ст. 73 КПК), прав потерпілої сторони (ст. 115, 118, 122 КПК)
// =========================================================================

export type UserRole = 'super_admin' | 'admin' | 'lawyer' | 'user' | 'viewer';

export interface UserPermissions {
  canManageUsers: boolean;
  canEditEvidence: boolean;
  canEditActors: boolean;
  canWormSeal: boolean;
  canExportJudicialBundle: boolean;
  canEditCaseMetadata: boolean;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  addedAt: string;
  lastLogin?: string;
  notes?: string;
  permissions: UserPermissions;
}

export interface AuthSession {
  user: AuthorizedUser;
  authMethod: 'google' | 'pin';
  token?: string;
  timestamp: number;
}

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    titleUk: string;
    titleFr: string;
    titleDe: string;
    titleIt: string;
    titleEn: string;
    badgeColor: string;
    defaultPermissions: UserPermissions;
  }
> = {
  super_admin: {
    titleUk: 'Головний Адміністратор',
    titleFr: 'Administrateur Principal',
    titleDe: 'Hauptadministrator',
    titleIt: 'Amministratore Principale',
    titleEn: 'Super Administrator',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    defaultPermissions: {
      canManageUsers: true,
      canEditEvidence: true,
      canEditActors: true,
      canWormSeal: true,
      canExportJudicialBundle: true,
      canEditCaseMetadata: true,
    },
  },
  admin: {
    titleUk: 'Адміністратор справи',
    titleFr: 'Administrateur du dossier',
    titleDe: 'Falladministrator',
    titleIt: 'Amministratore del caso',
    titleEn: 'Case Administrator',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    defaultPermissions: {
      canManageUsers: false,
      canEditEvidence: true,
      canEditActors: true,
      canWormSeal: true,
      canExportJudicialBundle: true,
      canEditCaseMetadata: true,
    },
  },
  lawyer: {
    titleUk: 'Адвокат / Юрист',
    titleFr: 'Avocat / Mandataire',
    titleDe: 'Rechtsanwalt / Mandatar',
    titleIt: 'Avvocato / Difensore',
    titleEn: 'Counsel / Legal Advocate',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    defaultPermissions: {
      canManageUsers: false,
      canEditEvidence: true,
      canEditActors: true,
      canWormSeal: true,
      canExportJudicialBundle: true,
      canEditCaseMetadata: false,
    },
  },
  user: {
    titleUk: 'Користувач / Довіритель',
    titleFr: 'Partie plaignante / Utilisateur',
    titleDe: 'Privatklägerschaft / Benutzer',
    titleIt: 'Parte lesa / Utente',
    titleEn: 'Client / Authorized User',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    defaultPermissions: {
      canManageUsers: false,
      canEditEvidence: true,
      canEditActors: true,
      canWormSeal: false,
      canExportJudicialBundle: true,
      canEditCaseMetadata: false,
    },
  },
  viewer: {
    titleUk: 'Спостерігач (Тільки перегляд)',
    titleFr: 'Lecteur seul',
    titleDe: 'Nur Leserechte',
    titleIt: 'Solo visualizzazione',
    titleEn: 'Read-only Viewer',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    defaultPermissions: {
      canManageUsers: false,
      canEditEvidence: false,
      canEditActors: false,
      canWormSeal: false,
      canExportJudicialBundle: true,
      canEditCaseMetadata: false,
    },
  },
};
