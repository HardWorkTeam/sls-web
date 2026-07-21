"use client";

import { useEffect, useState } from "react";

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

/**
 * Reflects whether a couple is signed into the portal, read from the
 * non-sensitive `sls_session` marker cookie the portal sets on the shared
 * parent domain. Starts signed-out so the server render and first client render
 * agree (no hydration mismatch), then syncs after mount and whenever the tab
 * regains focus (covers logging in/out in another tab).
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<SessionState>(SIGNED_OUT);

  useEffect(() => {
    setSession(readSessionCookie());
    const onFocus = () => setSession(readSessionCookie());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return session;
}
