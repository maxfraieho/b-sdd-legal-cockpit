import React, { useEffect, useState } from 'react';
import { handleOAuthSuccess } from '../lib/appwrite';
import { Loader2 } from 'lucide-react';
import {
  setAuthSession,
  findUserByEmail,
  PRIMARY_SUPER_ADMIN_EMAIL,
} from '../lib/authManager';
import { AuthorizedUser, AuthSession, UserRole, ROLE_DEFINITIONS } from '../types/auth';

const HARDENED_WHITELIST: Record<string, { name: string; role: UserRole }> = {
  'tukroschu@gmail.com': {
    name: 'Administrator (SBA Lead)',
    role: 'super_admin',
  },
  'arsen.k111999@gmail.com': {
    name: 'Authorized Party (Art. 115/118 CPP)',
    role: 'user',
  },
  'vokov.dev@gmail.com': {
    name: 'Security Engineer (SecOps)',
    role: 'admin',
  },
  'counsel.vaud.vd@gmail.com': {
    name: 'Legal Counsel (Ordre des Avocats)',
    role: 'lawyer',
  },
};

export const AuthSuccessPage: React.FC = () => {
  const [statusText, setStatusText] = useState<string>(
    'Верифікація Google Identity та допуску до справи...'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeSessionCreation() {
      try {
        const { session, user } = await handleOAuthSuccess();
        const normalizedEmail = (user.email || '').trim().toLowerCase();

        if (isMounted) {
          setStatusText(`Перевірка допуску для ${normalizedEmail} (ст. 73 КПК)...`);
        }

        // 1. Zero-trust check against whitelist
        const matched =
          HARDENED_WHITELIST[normalizedEmail] || findUserByEmail(normalizedEmail).user;

        if (!matched) {
          if (isMounted) {
            setError(
              `Доступ заборонено (Art. 73 CPP): Обліковий запис ${normalizedEmail} не має допуску.`
            );
            setTimeout(() => {
              window.location.replace(
                '/auth/failure?error=' +
                  encodeURIComponent(
                    `ACCÈS REFUSÉ (Art. 73 CPP / Art. 320 CP): L'adresse ${normalizedEmail} n'est pas autorisée pour ce dossier judiciaire.`
                  )
              );
            }, 1800);
          }
          return;
        }

        // 2. Build verified session
        const userRole = (matched.role ||
          (normalizedEmail === PRIMARY_SUPER_ADMIN_EMAIL ? 'super_admin' : 'admin')) as UserRole;
        const permissions =
          ROLE_DEFINITIONS[userRole]?.defaultPermissions ||
          ROLE_DEFINITIONS.super_admin.defaultPermissions;

        const sessionUser: AuthorizedUser = {
          id: user.$id || normalizedEmail,
          email: normalizedEmail,
          name: user.name || matched.name,
          role: userRole,
          isActive: true,
          addedAt: new Date().toISOString(),
          permissions,
        };

        const sessionToken = session?.$id || btoa(`bsdd_${Date.now()}_${normalizedEmail}`);
        const newSession: AuthSession = {
          user: sessionUser,
          authMethod: 'google_cloud_run',
          timestamp: Date.now(),
          token: sessionToken,
        };

        // 3. Persist session for AuthGate and App
        setAuthSession(newSession, true);
        localStorage.setItem(
          'b_sdd_legal_auth_state',
          JSON.stringify({
            isPinValid: true,
            isGoogleAuthenticated: true,
            email: normalizedEmail,
            timestamp: Date.now(),
          })
        );
        sessionStorage.setItem('b_sdd_pin_verified', 'true');
        sessionStorage.setItem('b_sdd_pin_stage_unlocked', 'true');
        localStorage.setItem('b_sdd_pin_verified', 'true');
        localStorage.setItem('b_sdd_pin_stage_unlocked_ts', Date.now().toString());
        sessionStorage.setItem('b_sdd_auth_unlocked', 'true');
        sessionStorage.setItem('b_sdd_auth_timestamp', Date.now().toString());

        if (isMounted) {
          setStatusText(`Допуск підтверджено: ${sessionUser.name}. Відкриваємо Кокпіт...`);
          // Redirect to /dashboard with verified parameters
          window.location.replace(
            `/dashboard?user_email=${encodeURIComponent(normalizedEmail)}&auth_token=${encodeURIComponent(sessionToken)}&pin_verified=true`
          );
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Помилка створення сесії');
          setTimeout(() => {
            window.location.replace(
              '/auth/failure?error=' +
                encodeURIComponent(err?.message || 'Помилка Google OAuth')
            );
          }, 1800);
        }
      }
    }

    completeSessionCreation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-mono text-slate-300">
          {error ? error : statusText}
        </p>
      </div>
    </div>
  );
};

