"use client";

import { useEffect, useRef } from "react";

// Hero video so sekundovou ručičkou. Fotka pod ním sa zobrazí hneď; video sa začne
// sťahovať až po načítaní stránky a len vtedy, keď je viditeľné — svetlá a tmavá
// verzia sú dva prvky, z ktorých CSS (téma, prefers-reduced-motion) jeden skryje.
export function HeroVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    function loadIfVisible() {
      if (!video || video.getAttribute("src") || video.offsetParent === null) return;
      // React pri SSR nevypíše atribút `muted`, bez neho iOS Safari autoplay nepustí.
      video.muted = true;
      video.src = src;
      video.play().catch(() => {
        // Autoplay zablokovaný — ostane fotka pod videom.
      });
    }

    function start() {
      loadIfVisible();
      // Prepnutie témy môže skrytú verziu zobraziť — vtedy ju doťahni.
      const observer = new MutationObserver(loadIfVisible);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      const scheme = window.matchMedia("(prefers-color-scheme: dark)");
      scheme.addEventListener("change", loadIfVisible);
      cleanup = () => {
        observer.disconnect();
        scheme.removeEventListener("change", loadIfVisible);
      };
    }

    let cleanup = () => {};
    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
      cleanup = () => window.removeEventListener("load", start);
    }
    return () => cleanup();
  }, [src]);

  return <video ref={ref} muted loop playsInline preload="none" aria-hidden="true" className={className} />;
}
