// Helper to manage lms-session cookie in Next.js App Router (Server & Client side)

export interface UserSession {
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'super';
  picture?: string;
}

const COOKIE_NAME = 'lms-session';

// Client-side helper
export function getClientSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]*)'));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

export function setClientSession(session: UserSession) {
  if (typeof window === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(session));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
}

export function deleteClientSession() {
  if (typeof window === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax; Secure`;
}
