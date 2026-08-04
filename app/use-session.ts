"use client";

import { useEffect, useState } from "react";
import { APP_URL } from "./site-config";

const COOKIE_NAME = "sls_session";
const IFRAME_TIMEOUT_MS = 8_000;

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

/**
 * Hidden iframe on the portal origin (first-party there). postMessage back to
 * sls-web works when credentialed fetch cannot send third-party cookies between
 * sibling *.vercel.app hosts.
 */
function fetchSessionViaIframe(appUrl: string): Promise<SessionState> {
  return new Promise((resolve) => {
    let portalOrigin: string;
    try {
      portalOrigin = new URL(appUrl).origin;
    } catch {
      resolve(SIGNED_OUT);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.hidden = true;
    iframe.title = "Session check";
    iframe.src = `${appUrl.replace(/\/$/, "")}/embed/session-status`;

    const cleanup = () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      iframe.remove();
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(SIGNED_OUT);
    }, IFRAME_TIMEOUT_MS);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== portalOrigin) return;
      const data = event.data as {
        type?: string;
        signedIn?: boolean;
        name?: string | null;
      };
      if (data?.type !== "sls-session") return;

      cleanup();
      resolve({
        signedIn: Boolean(data.signedIn),
        name: typeof data.name === "string" ? data.name : null,
      });
    };

    window.addEventListener("message", onMessage);
    document.body.appendChild(iframe);
  });
}

async function resolveSession(): Promise<SessionState> {
  const local = readSessionCookie();
  if (local.signedIn) return local;

  if (typeof window === "undefined" || isSameHostname(APP_URL)) {
    return local;
  }

  return fetchSessionViaIframe(APP_URL);
}

/**
 * Reflects whether a couple is signed into the portal.
 *
 * - localhost / custom parent domain: reads the shared `sls_session` cookie.
 * - sibling *.vercel.app hosts: hidden iframe + postMessage (third-party
 *   cookies are blocked, so credentialed fetch to /api/session-marker cannot
 *   see the portal cookie).
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
