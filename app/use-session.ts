"use client";

import { useEffect, useState } from "react";
import { APP_URL } from "./site-config";
import {
  clearWebSessionHint,
  readWebSessionHint,
  shouldStartMarketingSync,
  startMarketingSync,
  writeWebSessionHint,
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

  // On same-hostname setups (shared cookie domain), if the cookie is absent
  // the user is signed out — the hint may be stale. Clear it immediately.
  if (typeof window !== "undefined" && isSameHostname(APP_URL)) {
    if (hint?.signedIn) {
      // Cookie is gone (logout cleared it) but hint still says signed-in: clear.
      clearWebSessionHint();
    }
    // No valid cookie → signed out regardless of hint.
    return SIGNED_OUT;
  }

  // Cross-origin (*.vercel.app): cookie isn't shared, rely on hint + sync.
  if (hint?.signedIn) {
    // We have a signedIn:true hint but no cookie. Trigger a fresh marketing
    // sync so we re-verify. Don't show the stale name; return SIGNED_OUT
    // optimistically — the sync will restore the name if still signed in.
    if (shouldStartMarketingSync()) {
      startMarketingSync(APP_URL);
    }
    return SIGNED_OUT;
  }

  if (hint) return hint; // hint.signedIn === false — safe to trust

  if (typeof window !== "undefined") {
    if (shouldStartMarketingSync()) {
      startMarketingSync(APP_URL);
    }
  }

  return SIGNED_OUT;
}

async function fetchSessionStatus(): Promise<SessionState | null> {
  try {
    const res = await fetch(`${APP_URL}/api/session-marker`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
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
    // 1. Resolve initial state synchronously from cookies/localStorage hint
    const initial = resolveSession();
    setSession(initial);

    // 2. Perform background validation against the portal's API to ensure the hint isn't stale
    let active = true;

    const validateSession = async (current: SessionState) => {
      const status = await fetchSessionStatus();
      if (!active || !status) return;

      if (status.signedIn !== current.signedIn || status.name !== current.name) {
        setSession(status);
        if (status.signedIn) {
          writeWebSessionHint(status);
        } else {
          clearWebSessionHint();
        }
      }
    };

    validateSession(initial);

    const onFocus = () => {
      const current = resolveSession();
      setSession(current);
      validateSession(current);
    };

    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return session;
}
