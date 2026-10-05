"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useLocale } from "@/components/LocaleProvider";

export type GalleryImage = { src: string; alt: string; aspect: "square" | "portrait" };

export function Gallery({ images }: { images: GalleryImage[] }) {
  const { dict } = useLocale();
  const [index, setIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (index === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [index, images.length]);

  useEffect(() => {
    if (index === null) triggerRef.current?.focus();
  }, [index]);

  // Mobil a tablet: jedna fotka na posúvanie prstom (scroll-snap) + pás náhľadov pod ňou,
  // aby názov a cena boli hneď pod galériou. Desktop ostáva mriežka.
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onTrackScroll() {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== active) setActive(i);
  }

  function goTo(i: number) {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  // Aktívny náhľad drž v pruhu viditeľný (bez rolovania celej stránky).
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const openLightbox = (i: number) => (e: MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = e.currentTarget;
    setIndex(i);
  };

  // Rovnaké `sizes` v karuseli aj v mriežke → prehliadač stiahne prvú fotku len raz.
  const sizes = "(min-width: 1024px) 60vw, 100vw";

  return (
    <>
      <div className="lg:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={openLightbox(i)}
              className={[
                "relative w-full shrink-0 snap-center bg-paper block",
                img.aspect === "square" ? "aspect-square" : "aspect-[4/5]",
              ].join(" ")}
              aria-label={`${dict.gallery.zoomAlt}: ${img.alt}`}
            >
              <Image src={img.src} alt={img.alt} fill sizes={sizes} className="object-cover" priority={i === 0} />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto px-4 sm:px-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${dict.gallery.showPhoto} ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={[
                  "relative w-16 sm:w-20 aspect-[4/5] shrink-0 bg-paper border transition-opacity",
                  i === active ? "border-ink opacity-100" : "border-transparent opacity-50",
                ].join(" ")}
              >
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:grid grid-cols-2 gap-px bg-line">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={openLightbox(i)}
            className={[
              "relative w-full bg-paper block",
              img.aspect === "square" ? "aspect-square" : "aspect-[4/5]",
              i === 0 ? "col-span-2" : "",
            ].join(" ")}
            aria-label={`${dict.gallery.zoomAlt}: ${img.alt}`}
          >
            <Image src={img.src} alt={img.alt} fill sizes={sizes} className="object-cover" priority={i === 0} />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.gallery.lightboxAlt}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center"
          onClick={() => setIndex(null)}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex(null);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-15 underline underline-offset-[3px]"
          >
            {dict.common.close}
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 font-serif text-32 px-2"
              aria-label={dict.gallery.prev}
            >
              ‹
            </button>
          )}

          <div
            className="relative w-[92vw] h-[78vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="92vw"
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => (i === null ? null : (i + 1) % images.length));
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 font-serif text-32 px-2"
              aria-label={dict.gallery.next}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
