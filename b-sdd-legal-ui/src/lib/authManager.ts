// =========================================================================
// B-SDD LEGAL COCKPIT · МЕНЕДЖЕР АВТОРИЗАЦІЇ ТА БІЛОГО СПИСКУ GOOGLE (AUTH MANAGER)
// Відповідність нормам швейцарського кримінального процесу (ст. 73 КПК — таємниця слідства)
// =========================================================================

import { AuthorizedUser, AuthSession, UserRole, ROLE_DEFINITIONS } from '../types/auth';

const STORAGE_USERS_KEY = 'b_sdd_authorized_google_users_v1';
const STORAGE_SESSION_KEY = 'b_sdd_auth_session_v1';
const STORAGE_STRICT_MODE_KEY = 'b_sdd_strict_whitelist_mode';

// Canonical Super Admin and initial team configuration
export const PRIMARY_SUPER_ADMIN_EMAIL = 'TUkroschu@gmail.com';

export const INITIAL_AUTHORIZED_USERS: AuthorizedUser[] = [
  {
    id: 'user-superadmin-01',
    email: PRIMARY_SUPER_ADMIN_EMAIL,
    name: 'Арсен Коваленко (Головний Адміністратор)',
    avatar: 'https://lh3.googleusercontent.com/a/default-user',
    role: 'super_admin',
    isActive: true,
    addedAt: '2024-07-20T08:00:00Z',
    notes: 'Власник досьє та головний системний адміністратор шлюзу B-SDD',
    permissions: ROLE_DEFINITIONS.super_admin.defaultPermissions,
  },
  {
    id: 'user-client-02',
    email: 'arsen.k111999@gmail.com',
    name: 'Арсен Коваленко (Довіритель / Потерпілий ст. 115, 118 КПК)',
    avatar: 'https://lh3.googleusercontent.com/a/default-user',
    role: 'user',
    isActive: true,
    addedAt: '2024-07-21T10:00:00Z',
    notes: 'Потерпіла сторона у справі PE24.014624-SBA, право повного доступу до матеріалів',
    permissions: ROLE_DEFINITIONS.user.defaultPermissions,
  },
  {
    id: 'user-counsel-03',
    email: 'counsel.vaud.vd@gmail.com',
    name: 'Юридичний повірений (Ordre des Avocats Vaudois)',
    avatar: 'https://lh3.googleusercontent.com/a/default-user',
    role: 'lawyer',
    isActive: true,
    addedAt: '2024-08-01T12:00:00Z',
    notes: 'Адвокат представництва інтересів у Ministère public та Tribunal d’arrondissement',
    permissions: ROLE_DEFINITIONS.lawyer.defaultPermissions,
  },
];

/**
 * Loads all authorized users from persistent storage
 */
export function loadAuthorizedUsers(): AuthorizedUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      saveAuthorizedUsers(INITIAL_AUTHORIZED_USERS);
      return INITIAL_AUTHORIZED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveAuthorizedUsers(INITIAL_AUTHORIZED_USERS);
      return INITIAL_AUTHORIZED_USERS;
    }
    // Ensure primary superadmin is ALWAYS present
    const hasSuperAdmin = parsed.some(
      (u: AuthorizedUser) => u.email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase()
    );
    if (!hasSuperAdmin) {
      const merged = [INITIAL_AUTHORIZED_USERS[0], ...parsed];
      saveAuthorizedUsers(merged);
      return merged;
    }
    return parsed;
  } catch (e) {
    console.warn('Failed to load authorized users from localStorage:', e);
    return INITIAL_AUTHORIZED_USERS;
  }
}

/**
 * Saves authorized users list to persistent storage
 */
export function saveAuthorizedUsers(users: AuthorizedUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save authorized users to localStorage:', e);
  }
}

/**
 * Check if strict whitelist mode is active
 */
export function isStrictWhitelistMode(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_STRICT_MODE_KEY);
    return raw !== null ? raw === 'true' : true; // Default is strict = true
  } catch {
    return true;
  }
}

/**
 * Set strict whitelist mode
 */
export function setStrictWhitelistMode(strict: boolean): void {
  try {
    localStorage.setItem(STORAGE_STRICT_MODE_KEY, strict ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save strict whitelist mode:', e);
  }
}

/**
 * Add a new user to the authorized list
 */
export function addAuthorizedUser(params: {
  email: string;
  name: string;
  role: UserRole;
  notes?: string;
  avatar?: string;
  customPermissions?: Partial<AuthorizedUser['permissions']>;
}): AuthorizedUser {
  const users = loadAuthorizedUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  const defaultPerms = ROLE_DEFINITIONS[params.role].defaultPermissions;

  const newUser: AuthorizedUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    name: params.name.trim() || normalizedEmail.split('@')[0],
    role: params.role,
    avatar: params.avatar,
    isActive: true,
    addedAt: new Date().toISOString(),
    notes: params.notes,
    permissions: {
      ...defaultPerms,
      ...params.customPermissions,
    },
  };

  if (existingIdx >= 0) {
    users[existingIdx] = {
      ...users[existingIdx],
      ...newUser,
      id: users[existingIdx].id,
      addedAt: users[existingIdx].addedAt,
    };
  } else {
    users.unshift(newUser);
  }

  saveAuthorizedUsers(users);
  return newUser;
}

/**
 * Update an existing user in the authorized list
 */
export function updateAuthorizedUser(id: string, updates: Partial<AuthorizedUser>): AuthorizedUser | null {
  const users = loadAuthorizedUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;

  // Protect primary super admin from losing role or being deactivated
  if (users[idx].email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase()) {
    updates.role = 'super_admin';
    updates.isActive = true;
    if (updates.permissions) {
      updates.permissions.canManageUsers = true;
    }
  }

  users[idx] = {
    ...users[idx],
    ...updates,
  };

  saveAuthorizedUsers(users);
  return users[idx];
}

/**
 * Toggle user active/suspended status
 */
export function toggleUserStatus(id: string): boolean {
  const users = loadAuthorizedUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return false;

  if (users[idx].email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase()) {
    // Primary admin cannot be disabled
    return true;
  }

  users[idx].isActive = !users[idx].isActive;
  saveAuthorizedUsers(users);
  return users[idx].isActive;
}

/**
 * Remove user from authorized list
 */
export function removeAuthorizedUser(id: string): boolean {
  const users = loadAuthorizedUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return false;

  if (user.email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase()) {
    // Cannot delete main super admin
    return false;
  }

  const filtered = users.filter((u) => u.id !== id);
  saveAuthorizedUsers(filtered);
  return true;
}

/**
 * Check if a Google email is authorized to access the system
 */
export function verifyEmailAccess(email: string): {
  allowed: boolean;
  user?: AuthorizedUser;
  reason?: string;
} {
  const normalized = email.trim().toLowerCase();
  const users = loadAuthorizedUsers();
  const strict = isStrictWhitelistMode();

  const found = users.find((u) => u.email.toLowerCase() === normalized);

  if (found) {
    if (!found.isActive) {
      return {
        allowed: false,
        user: found,
        reason: 'account_suspended',
      };
    }
    return {
      allowed: true,
      user: found,
    };
  }

  // If not found in whitelist:
  if (!strict) {
    // Auto-provision basic viewer/user if strict mode is disabled
    const autoUser = addAuthorizedUser({
      email: normalized,
      name: normalized.split('@')[0],
      role: 'user',
      notes: 'Автоматично зареєстровано в режимі відкритого доступу',
    });
    return {
      allowed: true,
      user: autoUser,
    };
  }

  return {
    allowed: false,
    reason: 'not_whitelisted',
  };
}

/**
 * Get current active session
 */
export function getCurrentAuthSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Check if session user is still active in users registry
    const users = loadAuthorizedUsers();
    const current = users.find((u) => u.email.toLowerCase() === session.user.email.toLowerCase());
    if (!current || !current.isActive) {
      clearAuthSession();
      return null;
    }
    return {
      ...session,
      user: current,
    };
  } catch {
    return null;
  }
}

/**
 * Set active auth session
 */
export function setAuthSession(session: AuthSession, remember: boolean = true): void {
  try {
    const serialized = JSON.stringify(session);
    sessionStorage.setItem(STORAGE_SESSION_KEY, serialized);
    if (remember) {
      localStorage.setItem(STORAGE_SESSION_KEY, serialized);
    }
    // Also record last login
    const users = loadAuthorizedUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === session.user.email.toLowerCase());
    if (idx >= 0) {
      users[idx].lastLogin = new Date().toISOString();
      saveAuthorizedUsers(users);
    }
  } catch (e) {
    console.error('Failed to set auth session:', e);
  }
}

/**
 * Clear active session (Log out)
 */
export function clearAuthSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    sessionStorage.removeItem('b_sdd_auth_unlocked');
    sessionStorage.removeItem('b_sdd_auth_timestamp');
  } catch (e) {
    console.error('Failed to clear auth session:', e);
  }
}

/**
 * Export authorized users as JSON
 */
export function exportUsersToJson(): string {
  const users = loadAuthorizedUsers();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      caseReference: 'PE24.014624-SBA',
      strictMode: isStrictWhitelistMode(),
      usersCount: users.length,
      users,
    },
    null,
    2
  );
}

/**
 * Import authorized users from JSON
 */
export function importUsersFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const usersToImport: AuthorizedUser[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.users)
      ? parsed.users
      : null;

    if (!usersToImport) {
      return { success: false, count: 0, error: 'Некоректний формат JSON' };
    }

    const currentUsers = loadAuthorizedUsers();
    let importedCount = 0;

    usersToImport.forEach((imported) => {
      if (!imported.email) return;
      const normalized = imported.email.trim().toLowerCase();
      const existingIdx = currentUsers.findIndex((u) => u.email.toLowerCase() === normalized);
      if (existingIdx >= 0) {
        currentUsers[existingIdx] = {
          ...currentUsers[existingIdx],
          ...imported,
          email: normalized,
        };
      } else {
        currentUsers.push({
          ...imported,
          id: imported.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          email: normalized,
          addedAt: imported.addedAt || new Date().toISOString(),
        });
      }
      importedCount++;
    });

    saveAuthorizedUsers(currentUsers);
    return { success: true, count: importedCount };
  } catch (err) {
    return { success: false, count: 0, error: (err as Error).message };
  }
}
