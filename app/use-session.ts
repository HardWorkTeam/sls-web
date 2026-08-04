"use client";

import { useEffect, useState } from "react";
import { APP_URL } from "./site-config";
import {
  readWebSessionHint,
  shouldStartMarketingSync,
  startMarketingSync,
} from "./web-session-hint";

const COOKIE_NAME = "sls_session";

export interface SessionState {
  signedIn: boolean;
  name: string | null;
}

const SIGNED_OUT: SessionState = { signedIn: false, name: null };

function readSessionCookie(): SessionState {
  if (typeof document === "undefined") return SIGNED_OUT;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return SIGNED_OUT;
  const name = decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
  return { signedIn: true, name: name || null };
}

function isSameHostname(appUrl: string): boolean {
  try {
    return new URL(appUrl).hostname === window.location.hostname;
  } catch {
    return false;
  }
}

function resolveSession(): SessionState {
  const local = readSessionCookie();
  if (local.signedIn) return local;

  const hint = readWebSessionHint();
  if (hint) return hint;

  if (typeof window !== "undefined" && !isSameHostname(APP_URL)) {
    if (shouldStartMarketingSync()) {
      startMarketingSync(APP_URL);
    }
  }

  return SIGNED_OUT;
}

/**
 * Reflects whether a couple is signed into the portal.
 *
 * - localhost / custom parent domain: reads the shared `sls_session` cookie.
 * - sibling *.vercel.app hosts: one-time redirect through the portal's
 *   /auth/marketing-sync (third-party iframe/fetch cannot read portal storage).
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<SessionState>(SIGNED_OUT);

  useEffect(() => {
    setSession(resolveSession());

    const onFocus = () => setSession(resolveSession());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return session;
}
