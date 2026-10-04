"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const FADE_MS = 150;

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

  return (
    <div className="absolute inset-0" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {/* Statický základ — mimo hoveru buď zvolená fotka, alebo prvá snímka videa */}
      {posterSrc ? (
        <Image src={posterSrc} alt={ariaLabel} fill sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      ) : (
        <video
          src={src}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Živé video — prehráva sa na hover, mimo neho sa jemne odfaduje */}
      <video
        ref={liveRef}
        src={src}
        poster={posterSrc}
        muted
        loop
        playsInline
        preload="auto"
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
