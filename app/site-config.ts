/**
 * Shared marketing-site config. The couple portal (sls-client) lives on a
 * separate origin, so point CTAs at it via env var with a sensible default.
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

/** Laravel backend API base. Matches the couple portal's convention. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

/**
 * RSVP/invitation app (sls-rsvp). It exposes a public `/preview/<slug>` route
 * that renders each template with sample data — embedded as live previews.
 */
export const RSVP_URL =
  process.env.NEXT_PUBLIC_RSVP_URL ?? "http://localhost:3102";

export const templatePreviewUrl = (slug: string) =>
  `${RSVP_URL}/preview/${slug}`;

export const LOGIN_URL = `${APP_URL}/`;
export const REGISTER_URL = `${APP_URL}/register`;

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#templates", label: "Invitations" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
] as const;
