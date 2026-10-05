"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FADE_MS = 150;
// Dotykové zariadenia: video karty v strede obrazovky sa spustí, až keď tam karta vydrží.
const TOUCH_DWELL_MS = 1000;

// Karty, ktoré sú práve v strednom páse obrazovky, a karta, ktorá práve hrá —
// na dotykových zariadeniach hrá vždy len jedna (najbližšie k stredu).
const touchCandidates = new Map<Element, () => void>();
let stopActive: (() => void) | null = null;

// Pri šetrení dát alebo pomalom pripojení ostanú na dotykových zariadeniach len fotky.
function prefersLowData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  return Boolean(connection?.saveData || /(^|-)(2g|3g)$/.test(connection?.effectiveType ?? ""));
}

function distanceFromCenter(el: Element): number {
  const r = el.getBoundingClientRect();
  return Math.hypot(r.left + r.width / 2 - innerWidth / 2, r.top + r.height / 2 - innerHeight / 2);
}

export function CardVideo({
  src,
  ariaLabel,
  posterSrc,
}: {
  src: string;
  ariaLabel: string;
  posterSrc?: string;
}) {
  const liveRef = useRef<HTMLVideoElement>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovering, setHovering] = useState(false);

  function handleEnter() {
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    setHovering(true);
    liveRef.current?.play().catch(() => {
      // Autoplay môže prehliadač zablokovať — video ostane na statickom snímku.
    });
  }

  function handleLeave() {
    setHovering(false);
    // Počkáme, kým dobehne fade-out, až potom pretočíme späť na začiatok —
    // inak by sa skok na prvú snímku ukázal ešte pred zmiznutím vrstvy.
    resetTimeout.current = setTimeout(() => {
      const video = liveRef.current;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }, FADE_MS);
  }

  const rootRef = useRef<HTMLDivElement>(null);

  // Bez hoveru (telefón, tablet bez myši) prehrávaj kartu v strede obrazovky.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || matchMedia("(hover: hover)").matches || prefersLowData()) return;

    let dwell: ReturnType<typeof setTimeout> | null = null;
    function start() {
      // Spusti len kartu najbližšie k stredu — v riadku tabletu je v páse viac kariet naraz.
      const closest = [...touchCandidates.keys()].sort((a, b) => distanceFromCenter(a) - distanceFromCenter(b))[0];
      if (closest !== root) return;
      stopActive?.();
      stopActive = stop;
      handleEnter();
    }
    function stop() {
      if (stopActive === stop) stopActive = null;
      handleLeave();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          touchCandidates.set(root, start);
          dwell = setTimeout(start, TOUCH_DWELL_MS);
        } else {
          touchCandidates.delete(root);
          if (dwell) clearTimeout(dwell);
          if (stopActive === stop) {
            stop();
            // Hrajúca karta odišla zo stredu — po chvíli spusti tú, ktorá tam ostala.
            setTimeout(() => {
              if (!stopActive) [...touchCandidates.values()].forEach((startCandidate) => startCandidate());
            }, TOUCH_DWELL_MS);
          }
        }
      },
      // Stredný pás obrazovky (40 % výšky).
      { rootMargin: "-30% 0px -30% 0px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      touchCandidates.delete(root);
      if (dwell) clearTimeout(dwell);
      if (stopActive === stop) stopActive = null;
    };
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {/* Statický základ — mimo hoveru buď zvolená fotka, alebo prvá snímka videa */}
      {posterSrc ? (
        <Image src={posterSrc} alt={ariaLabel} fill sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      ) : (
        <video
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Živé video — prehráva sa na hover (na dotykových zariadeniach v strede obrazovky),
          inak sa jemne odfaduje. Sťahuje sa až pri prvom prehraní. */}
      <video
        ref={liveRef}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        aria-label={ariaLabel}
        className={[
          "absolute inset-0 h-full w-full object-cover transition-opacity",
          hovering ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      />
    </div>
  );
}
