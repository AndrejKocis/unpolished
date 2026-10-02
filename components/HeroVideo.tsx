"use client";

import { useEffect, useRef } from "react";

export function HeroVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React pri SSR nevypíše atribút `muted`, bez neho iOS Safari autoplay nepustí.
    video.muted = true;
    video.play().catch(() => {
      // Autoplay zablokovaný — ostane prvá snímka, ktorá je zhodná s fotkou pod ňou.
    });
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      className={className}
    />
  );
}
