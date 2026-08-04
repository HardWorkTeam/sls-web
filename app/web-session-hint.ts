import type { SessionState } from "./use-session";

const WEB_SESSION_KEY = "sls_web_session";
/** UI hint only — refreshed via /auth/marketing-sync when stale. */
const WEB_SESSION_TTL_MS = 30 * 60 * 1000;

interface WebSessionHint extends SessionState {
  at: number;
}

export function readWebSessionHint(): SessionState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(WEB_SESSION_KEY);
    if (!raw) return null;

    const hint = JSON.parse(raw) as WebSessionHint;
    if (Date.now() - hint.at > WEB_SESSION_TTL_MS) {
      localStorage.removeItem(WEB_SESSION_KEY);
      return null;
    }

    return { signedIn: hint.signedIn, name: hint.name };
  } catch {
    localStorage.removeItem(WEB_SESSION_KEY);
    return null;
  }
}

export function writeWebSessionHint(state: SessionState): void {
  const hint: WebSessionHint = { ...state, at: Date.now() };
  localStorage.setItem(WEB_SESSION_KEY, JSON.stringify(hint));
}

export function clearWebSessionHint(): void {
  localStorage.removeItem(WEB_SESSION_KEY);
}

export function shouldStartMarketingSync(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/auth/synced")) return false;
  return readWebSessionHint() === null;
}

export function startMarketingSync(appUrl: string): void {
  const returnUrl = `${window.location.origin}/auth/synced`;
  window.location.href = `${appUrl.replace(/\/$/, "")}/auth/marketing-sync?return=${encodeURIComponent(returnUrl)}`;
}
