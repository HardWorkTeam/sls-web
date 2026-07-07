"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders an invitation-template thumbnail for the landing-page grid.
 *
 * Each live preview is the sls-rsvp `/preview/<slug>` page — an *entire* Next.js
 * app (canvas + framer-motion) — embedded in a scaled iframe. Mounting several of
 * those at once blows past the memory ceiling of mobile WebViews (iOS Safari and,
 * worse, in-app browsers like Messenger), which crash/reload the page the moment
 * the Templates section scrolls into view. `loading="lazy"` doesn't save us — it
 * never unloads an iframe once loaded, and it still loads every card on mobile.
 *
 * So the live iframe is treated as a DESKTOP-ONLY enhancement:
 *   - Touch / coarse-pointer devices never mount it. They get a lightweight
 *     branded poster (accent-tinted gradient + title). The card still links to
 *     the full invitation, so mobile users are one tap from the real thing.
 *   - Pointer-capable devices mount the iframe, but only while the card is near
 *     the viewport (IntersectionObserver), unmounting once scrolled past so no
 *     more than a couple are ever alive at once.
 * The poster always renders underneath, so it also covers the iframe's load time.
 */
const DESIGN_WIDTH = 1280; // logical px the iframe is rendered at before scaling

export default function TemplatePreview({
  src,
  title,
  ratio = 4 / 3, // card height / width
  accentColor = "#C9A84C",
}: {
  src: string;
  title: string;
  ratio?: number;
  accentColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.27);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  // Whether this device can afford a live-app iframe. Defaults to false so the
  // server render (and mobile) never emit one; flipped on after mount only for
  // pointer-capable devices, which avoids a hydration mismatch too.
  const [canEmbed, setCanEmbed] = useState(false);

  useEffect(() => {
    setCanEmbed(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / DESIGN_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Mount the iframe only while the card is near the viewport; unmount it once
  // it has scrolled well out of view so we never hold every preview at once.
  useEffect(() => {
    if (!canEmbed) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setInView(visible);
        if (!visible) setLoaded(false); // reset the fade so it re-fades on remount
      },
      { rootMargin: "200px 0px" }, // preload just before on-screen, keeping the
      // number of simultaneously-live previews low for the WebView memory ceiling
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canEmbed]);

  const designHeight = DESIGN_WIDTH * ratio;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#241c14]"
      style={{ aspectRatio: String(1 / ratio) }}
    >
      {/* Branded poster — always present; the sole thumbnail on mobile and the
          load-time backdrop on desktop. */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
        style={{
          background: `radial-gradient(circle at 50% 32%, ${accentColor}40 0%, transparent 62%), #241c14`,
        }}
      >
        <span className="font-serif text-xl leading-tight text-white/90">
          {title}
        </span>
        <span className="text-[0.65rem] uppercase tracking-[0.22em] text-white/45">
          Invitation preview
        </span>
      </div>

      {canEmbed && inView && (
        <iframe
          src={src}
          title={`${title} invitation preview`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={() => setLoaded(true)}
          scrolling="no"
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{
            width: `${DESIGN_WIDTH}px`,
            height: `${designHeight}px`,
            transform: `scale(${scale})`,
            opacity: loaded ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        />
      )}
    </div>
  );
}
