"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DASHBOARD_URL,
  LOGIN_URL,
  NAV_LINKS,
  REGISTER_URL,
} from "../site-config";
import { useSession } from "../use-session";

export default function Header() {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const firstName = session.name?.trim().split(/\s+/)[0] ?? null;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/srolanh-logo.png"
            alt="Srolanh"
            width={96}
            height={64}
            className="h-auto w-24 object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-emerald"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session.signedIn ? (
            <>
              {firstName && (
                <span className="text-sm font-medium text-muted">
                  Hi, {firstName}
                </span>
              )}
              <a
                href={DASHBOARD_URL}
                className="rounded-full bg-linear-to-r from-emerald via-[#2f7a57] to-gold px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Go to dashboard
              </a>
            </>
          ) : (
            <>
              <a
                href={LOGIN_URL}
                className="text-sm font-medium text-foreground transition-colors hover:text-emerald"
              >
                Log in
              </a>
              <a
                href={REGISTER_URL}
                className="rounded-full bg-linear-to-r from-emerald via-[#2f7a57] to-gold px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Get started
              </a>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-background md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-line/60"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
              {session.signedIn ? (
                <>
                  {firstName && (
                    <span className="px-3 pb-1 text-sm font-medium text-muted">
                      Hi, {firstName}
                    </span>
                  )}
                  <a
                    href={DASHBOARD_URL}
                    className="rounded-full bg-linear-to-r from-emerald via-[#2f7a57] to-gold px-5 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Go to dashboard
                  </a>
                </>
              ) : (
                <>
                  <a
                    href={LOGIN_URL}
                    className="rounded-full border border-line px-5 py-2.5 text-center text-sm font-medium text-foreground"
                  >
                    Log in
                  </a>
                  <a
                    href={REGISTER_URL}
                    className="rounded-full bg-linear-to-r from-emerald via-[#2f7a57] to-gold px-5 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Get started
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
