"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders a live invitation preview (the sls-rsvp `/preview/<slug>` page) as a
 * scaled, non-interactive thumbnail. The iframe is laid out at a fixed design
 * width and CSS-scaled to fit the card, so the actual template artwork — not a
 * flat colour — is shown. A ResizeObserver keeps the scale correct on resize.
 *
 * Each iframe embeds the *entire* sls-rsvp app (canvas + framer-motion), so
 * mounting all of them at once overwhelms Safari's per-tab memory ceiling and
 * crashes/reloads the tab when the section scrolls into view. To avoid that we
 * gate the iframe behind an IntersectionObserver: it only mounts while the card
 * is near the viewport and unmounts once scrolled well past, so at most a couple
 * of previews are ever alive at the same time. `loading="lazy"` alone is not
 * enough — it never unloads an iframe once it has loaded.
 */
const DESIGN_WIDTH = 1280; // logical px the iframe is rendered at before scaling

export default function TemplatePreview({
  src,
  title,
  ratio = 4 / 3, // card height / width
}: {
  src: string;
  title: string;
  ratio?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.27);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

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
  // it has scrolled well out of view so Safari never holds every preview at once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setInView(visible);
        if (!visible) setLoaded(false); // reset the fade so it re-fades on remount
      },
      { rootMargin: "200px 0px" }, // preload just before on-screen, keeping the
      // number of simultaneously-live previews low for Safari's memory ceiling
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const designHeight = DESIGN_WIDTH * ratio;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#241c14]"
      style={{ aspectRatio: String(1 / ratio) }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-sm italic text-white/50">
            Loading {title}…
          </span>
        </div>
      )}
      {inView && (
        <iframe
          src={src}
          title={`${title} invitation preview`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={() => setLoaded(true)}
          scrolling="no"
          className="pointer-events-none origin-top-left border-0"
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
