// =========================================================================
// B-SDD LEGAL COCKPIT · APPWRITE CLIENT
// Sovereign Authentication & Storage Client for Project B-SDD Legal UI
// Project ID: 6abab6b5003a4b7b1560
// Endpoint: https://fra.cloud.appwrite.io/v1
// =========================================================================

import { Client, Account, Databases, Storage } from 'appwrite';

export const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '6abab6b5003a4b7b1560';
export const APPWRITE_PROJECT_NAME = 'B-SDD Legal UI';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Ping test on start to confirm connection setup
if (typeof window !== 'undefined') {
  client.ping().then(
    (res) => console.log('✓ Appwrite B-SDD Legal UI Connected:', res),
    (err) => console.warn('Appwrite ping status:', err?.message || err)
  );
}

export { client, account, databases, storage };
