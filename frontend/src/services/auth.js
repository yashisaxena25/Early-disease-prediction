const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const STORAGE_KEY = 'healthwise.auth.session';

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function authRequest(path, body) {
  if (!configured()) throw new Error('Sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.');
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.msg || payload.message || payload.error_description || 'Authentication failed. Please try again.');
  return payload;
}

export function isAuthConfigured() { return configured(); }

export async function requestEmailCode(email) {
  return authRequest('otp', { email: email.trim().toLowerCase(), create_user: true });
}

export async function verifyEmailCode(email, token) {
  const verified = await authRequest('verify', { email: email.trim().toLowerCase(), token: token.trim(), type: 'email' });
  const session = { ...verified, expires_at: verified.expires_at || Math.floor(Date.now() / 1000) + (verified.expires_in || 3600) };
  saveSession(session);
  return session;
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() { localStorage.removeItem(STORAGE_KEY); }

export async function signOutSession() {
  const session = await getSession();
  clearSession();
  if (!session?.access_token || !configured()) return;
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
    });
  } catch { /* Local sign-out still succeeds if the auth server is unreachable. */ }
}

export async function getSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  let session;
  try { session = JSON.parse(raw); } catch { clearSession(); return null; }
  if (!session.access_token || !session.refresh_token) { clearSession(); return null; }
  if (session.expires_at && session.expires_at * 1000 > Date.now() + 60_000) return session;
  try {
    const refreshed = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
    const next = { ...refreshed, expires_at: Math.floor(Date.now() / 1000) + (refreshed.expires_in || 3600) };
    saveSession(next);
    return next;
  } catch {
    clearSession();
    return null;
  }
}
