// =========================================================================
// CLOUDFLARE PAGES FUNCTION · /api/auth/logout
// Clears __Host-session cookie on logout
// =========================================================================

export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': '__Host-session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
};
