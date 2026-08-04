"use client";

import { useEffect, useState } from "react";
import { APP_URL } from "./site-config";

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

/** Fallback when the portal is on a sibling host (e.g. two *.vercel.app URLs). */
async function fetchPortalSession(appUrl: string): Promise<SessionState> {
  try {
    const res = await fetch(`${appUrl.replace(/\/$/, "")}/api/session-marker`, {
      credentials: "include",
      mode: "cors",
    });
    if (!res.ok) return SIGNED_OUT;
    return (await res.json()) as SessionState;
  } catch {
    return SIGNED_OUT;
  }
}

async function resolveSession(): Promise<SessionState> {
  const local = readSessionCookie();
  if (local.signedIn) return local;

  if (typeof window === "undefined" || isSameHostname(APP_URL)) {
    return local;
  }

  return fetchPortalSession(APP_URL);
}

/**
 * Reflects whether a couple is signed into the portal.
 *
 * - localhost / custom parent domain: reads the shared `sls_session` cookie.
 * - sibling *.vercel.app hosts: credentialed fetch to the portal's
 *   /api/session-marker (parent-domain cookies are impossible there).
 *
 * Starts signed-out so SSR and the first client render agree, then syncs after
 * mount and whenever the tab regains focus.
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<SessionState>(SIGNED_OUT);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const next = await resolveSession();
      if (!cancelled) setSession(next);
    };

    void sync();
    const onFocus = () => void sync();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return session;
}
