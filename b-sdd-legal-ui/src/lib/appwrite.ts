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

/**
 * Initiates the Google OAuth2 session flow.
 * Uses createOAuth2Session so existing users are seamlessly authenticated
 * without 409 user_already_exists conflicts.
 */
export async function signInWithProvider(): Promise<void> {
  const success = `${window.location.origin}/auth/success`;
  const failure = `${window.location.origin}/auth/failure`;

  // createOAuth2Session handles both initial login and re-authentication for existing users
  account.createOAuth2Session(
    OAuthProvider.Google,
    success,
    failure
  );
}

/**
 * Handles the OAuth success callback on /auth/success.
 * Reads userId + secret if present (token flow), or verifies existing session (session flow).
 */
export async function handleOAuthSuccess(): Promise<Models.Session | Models.User<Models.Preferences> | null> {
  const url = new URL(window.location.href);
  const secret = url.searchParams.get('secret');
  const userId = url.searchParams.get('userId');

  if (secret && userId) {
    try {
      const session = await account.createSession({ userId, secret });
      return session;
    } catch (err) {
      console.warn('createSession error:', err);
    }
  }

  try {
    const user = await account.get();
    return user;
  } catch (err) {
    console.warn('Appwrite account.get error (cross-domain cookies blocked):', err);
    return null;
  }
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
