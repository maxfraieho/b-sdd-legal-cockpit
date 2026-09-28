// =========================================================================
// CLOUDFLARE PAGES FUNCTION · /api/auth/me
// Validates __Host-session cookie on page refresh without re-prompting
// =========================================================================

interface Env {
  SESSION_SECRET?: string;
}

const AUTHORIZED_WHITELIST: Record<string, { name: string; role: 'super_admin' | 'user' | 'admin' | 'lawyer' }> = {
  'tukroschu@gmail.com': { name: 'Володимир Анатолійович Коваленко', role: 'super_admin' },
  'arsen.k111999@gmail.com': { name: 'Арсен Коваленко', role: 'user' },
  'vokov.dev@gmail.com': { name: 'Інженер безпеки B-SDD', role: 'admin' },
  'counsel.vaud.vd@gmail.com': { name: 'Юридичний повірений (Ordre des Avocats)', role: 'lawyer' },
};

function base64UrlDecode(input: string): Uint8Array {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const sessionToken = cookies['__Host-session'];
  if (!sessionToken) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const [headerB64, payloadB64, sigB64] = sessionToken.split('.');
    if (!headerB64 || !payloadB64 || !sigB64) {
      throw new Error('Malformed session token');
    }

    const sessionSecret = env.SESSION_SECRET || 'b-sdd-sovereign-legal-session-secret-v3-2026-sba';
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(sigB64);

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!isValid) throw new Error('Invalid session signature');

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now || !payload.email || !AUTHORIZED_WHITELIST[payload.email]) {
      throw new Error('Session expired or account not in whitelist');
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: payload.email,
          email: payload.email,
          name: payload.name || AUTHORIZED_WHITELIST[payload.email].name,
          role: payload.role || AUTHORIZED_WHITELIST[payload.email].role,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': '__Host-session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0',
      },
    });
  }
};
