// =========================================================================
// B-SDD LEGAL COCKPIT · APPWRITE CLIENT & AUTH SERVICE
// Sovereign Authentication & Storage Client for Project B-SDD Legal UI
// Project ID: 6abab6b5003a4b7b1560
// Endpoint: https://fra.cloud.appwrite.io/v1
// =========================================================================

import { Client, Account, Databases, Storage, OAuthProvider, Models } from 'appwrite';

export const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '6abab6b5003a4b7b1560';
export const APPWRITE_PROJECT_NAME = 'B-SDD Legal UI';

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { OAuthProvider };
export type { Models };

// Ping test on start to confirm connection setup
if (typeof window !== 'undefined') {
  client.ping().then(
    (res) => console.log('✓ Appwrite B-SDD Legal UI Connected:', res),
    (err) => console.warn('Appwrite ping status:', err?.message || err)
  );
}

export interface OAuthSuccessResult {
  session?: Models.Session | null;
  user: {
    $id: string;
    email: string;
    name?: string;
  };
}

/**
 * Initiates the Google OAuth2 token flow.
 * Uses createOAuth2Token which appends userId and secret as query parameters
 * to the success redirect URL, eliminating cross-domain third-party cookie blocks.
 */
export async function signInWithProvider(): Promise<void> {
  const success = `${window.location.origin}/auth/success`;
  const failure = `${window.location.origin}/auth/failure`;

  account.createOAuth2Token({
    provider: OAuthProvider.Google,
    success,
    failure,
    scopes: ['email', 'profile', 'openid'],
  });
}

/**
 * Handles the OAuth success callback on /auth/success.
 * Reads userId + secret from query parameters (token flow), creates the session,
 * and extracts the verified Google identity.
 */
export async function handleOAuthSuccess(): Promise<OAuthSuccessResult> {
  const url = new URL(window.location.href);
  const secret = url.searchParams.get('secret');
  const userId = url.searchParams.get('userId');

  let session: Models.Session | null = null;
  if (secret && userId) {
    try {
      session = await account.createSession({ userId, secret });
    } catch (err) {
      console.warn('createSession error:', err);
    }
  }

  // 1. Try account.get() directly (works when session was created in same origin)
  try {
    const user = await account.get();
    if (user && user.email) {
      return {
        session,
        user: {
          $id: user.$id,
          email: user.email,
          name: user.name,
        },
      };
    }
  } catch (err) {
    console.warn('account.get error:', err);
  }

  // 2. Fallback: Google UserInfo API using session.providerAccessToken
  if (session?.providerAccessToken) {
    try {
      const gRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${session.providerAccessToken}` },
      });
      if (gRes.ok) {
        const gUser = await gRes.json();
        if (gUser.email) {
          return {
            session,
            user: {
              $id: session.userId || gUser.id,
              email: gUser.email,
              name: gUser.name,
            },
          };
        }
      }
    } catch (gErr) {
      console.warn('Google userinfo fetch failed:', gErr);
    }
  }

  throw new Error('Не вдалося отримати підтверджену електронну адресу від Google.');
}

/**
 * Loads current signed-in user for /dashboard.
 */
export async function loadDashboard(): Promise<Models.User<Models.Preferences>> {
  const user = await account.get();
  return user;
}

/**
 * Signs out current session and redirects to /auth.
 */
export async function signOut(): Promise<void> {
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch (err) {
    console.warn('Error deleting session:', err);
  }
  window.location.assign('/auth');
}
