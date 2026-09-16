"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-line">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setIndex(i);
            }}
            className={[
              "relative w-full bg-paper block",
              img.aspect === "square" ? "aspect-square" : "aspect-[4/5]",
              i === 0 ? "lg:col-span-2" : "",
            ].join(" ")}
            aria-label={`${dict.gallery.zoomAlt}: ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={i === 0}
            />
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
