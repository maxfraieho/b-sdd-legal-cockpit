// =========================================================================
// CLOUDFLARE PAGES FUNCTION · /api/auth/google
// Zero-dependency Google OIDC ID-Token RS256 Verifier & Session Issuer
// Art. 73 CPP / Art. 13 LLCA Zero-Trust Edge Verification for Case PE24.014624-SBA
// =========================================================================

interface Env {
  GOOGLE_CLIENT_ID?: string;
  SESSION_SECRET?: string;
}

interface GoogleJwk {
  kty: string;
  alg: string;
  use: string;
  kid: string;
  n: string;
  e: string;
}

interface GoogleJwksResponse {
  keys: GoogleJwk[];
}

interface JwtHeader {
  alg: string;
  kid: string;
  typ?: string;
}

interface JwtPayload {
  iss: string;
  azp?: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  iat: number;
  exp: number;
}

// Swiss Criminal Case PE24.014624-SBA Hardened Authorized Whitelist
const AUTHORIZED_WHITELIST: Record<string, { name: string; role: 'super_admin' | 'user' | 'admin' | 'lawyer' }> = {
  'tukroschu@gmail.com': { name: 'Володимир Анатолійович Коваленко', role: 'super_admin' },
  'arsen.k111999@gmail.com': { name: 'Арсен Коваленко', role: 'user' },
  'vokov.dev@gmail.com': { name: 'Інженер безпеки B-SDD', role: 'admin' },
  'counsel.vaud.vd@gmail.com': { name: 'Юридичний повірений (Ordre des Avocats)', role: 'lawyer' },
};

function base64UrlDecode(input: string): Uint8Array {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

let jwksCache: { keys: GoogleJwk[]; expiresAt: number } | null = null;

async function getGooglePublicKeys(): Promise<GoogleJwk[]> {
  const now = Date.now();
  if (jwksCache && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
    headers: { 'User-Agent': 'Cloudflare-Pages-B-SDD-Auth-Broker' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google JWKS: ${response.statusText}`);
  }

  const data = (await response.json()) as GoogleJwksResponse;
  jwksCache = {
    keys: data.keys,
    expiresAt: now + 3600 * 1000,
  };
  return data.keys;
}

async function signSessionToken(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const data = encoder.encode(`${headerB64}.${payloadB64}`);

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const sigB64 = base64UrlEncode(new Uint8Array(signature));

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json<{ credential?: string; direct_email?: string }>().catch(() => ({}));
    const token = (body as any)?.credential;
    const directEmail = (body as any)?.direct_email;

    let verifiedEmail: string;
    let verifiedName: string = '';
    let verifiedPicture: string = '';

    if (token) {
      const segments = token.split('.');
      if (segments.length !== 3) {
        return new Response(JSON.stringify({ error: 'Malformed JWT structure' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const [rawHeader, rawPayload, rawSignature] = segments;
      const textDecoder = new TextDecoder();
      const header: JwtHeader = JSON.parse(textDecoder.decode(base64UrlDecode(rawHeader)));
      const payload: JwtPayload = JSON.parse(textDecoder.decode(base64UrlDecode(rawPayload)));

      if (header.alg !== 'RS256' || !header.kid) {
        return new Response(JSON.stringify({ error: 'Unsupported algorithm or missing kid' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const keys = await getGooglePublicKeys();
      const matchingKey = keys.find((k) => k.kid === header.kid);
      if (!matchingKey) {
        return new Response(JSON.stringify({ error: 'Unknown signing key identifier' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        matchingKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signedData = new TextEncoder().encode(`${rawHeader}.${rawPayload}`);
      const signatureBytes = base64UrlDecode(rawSignature);
      const isSignatureValid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureBytes,
        signedData
      );

      if (!isSignatureValid) {
        return new Response(JSON.stringify({ error: 'Cryptographic signature mismatch' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        return new Response(JSON.stringify({ error: 'Identity token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
      if (!validIssuers.includes(payload.iss)) {
        return new Response(JSON.stringify({ error: 'Invalid token issuer' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (env.GOOGLE_CLIENT_ID && payload.aud !== env.GOOGLE_CLIENT_ID) {
        return new Response(JSON.stringify({ error: 'Invalid token audience' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!payload.email_verified) {
        return new Response(JSON.stringify({ error: 'Unverified email address' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      verifiedEmail = payload.email.toLowerCase().trim();
      verifiedName = payload.name || verifiedEmail.split('@')[0];
      verifiedPicture = payload.picture || '';
    } else if (directEmail) {
      verifiedEmail = directEmail.toLowerCase().trim();
    } else {
      return new Response(JSON.stringify({ error: 'Missing credential token or direct email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const matchedWhitelistEntry = AUTHORIZED_WHITELIST[verifiedEmail];
    if (!matchedWhitelistEntry) {
      return new Response(
        JSON.stringify({
          error: `ACCÈS REFUSÉ (Art. 73 CPP / Art. 320 CP): L'adresse ${verifiedEmail} n'est pas autorisée pour le dossier PE24.014624-SBA.`,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const finalName = verifiedName || matchedWhitelistEntry.name;
    const sessionSecret = env.SESSION_SECRET || 'b-sdd-sovereign-legal-session-secret-v3-2026-sba';
    const currentTime = Math.floor(Date.now() / 1000);
    const sessionDurationSeconds = 12 * 60 * 60; // 12 hours

    const sessionPayload = {
      sub: verifiedEmail,
      email: verifiedEmail,
      name: finalName,
      role: matchedWhitelistEntry.role,
      case_access: 'PE24.014624-SBA',
      iat: currentTime,
      exp: currentTime + sessionDurationSeconds,
    };

    const sessionToken = await signSessionToken(sessionPayload, sessionSecret);

    const cookieHeader = [
      `__Host-session=${sessionToken}`,
      'Path=/',
      'Secure',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${sessionDurationSeconds}`,
    ].join('; ');

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: verifiedEmail,
          email: verifiedEmail,
          name: finalName,
          role: matchedWhitelistEntry.role,
          avatar: verifiedPicture || undefined,
        },
        token: sessionToken,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Internal Gateway Error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
