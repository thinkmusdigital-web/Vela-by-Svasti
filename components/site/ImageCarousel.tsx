"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export interface CarouselSlide {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselSlide[];
  label: string;
  sizes?: string;
  className?: string;
}

const isSvg = (src: string) => src.toLowerCase().endsWith(".svg");

export function ImageCarousel({ images, label, sizes, className }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [drag, setDrag] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const startX = useRef(0);

  const count = images.length;

  const goTo = (index: number) => {
    setCurrent(((index % count) + count) % count);
    setDrag(0);
    setDragging(false);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    startX.current = event.clientX;
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - startX.current;
    setDrag(Math.max(-240, Math.min(240, dx)));
  };

  const endDrag = () => {
    if (!dragging) return;
    if (Math.abs(drag) > 80) {
      goTo(drag < 0 ? current + 1 : current - 1);
    } else {
      setDrag(0);
      setDragging(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current + 1);
    }
  };

  return (
    <figure
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative overflow-hidden bg-espresso ${className ?? "aspect-[4/3]"}`}
    >
      <div
        tabIndex={0}
        className={`flex h-full touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brass ${
          dragging ? "" : "transition-transform duration-700 ease-out motion-reduce:transition-none"
        }`}
        style={{ transform: `translateX(calc(${-current * 100}% + ${drag}px))` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={() => {
          setDrag(0);
          setDragging(false);
        }}
        onKeyDown={onKeyDown}
      >
        {images.map((image, index) => (
          <div
            key={image.src}
            className="relative h-full w-full shrink-0"
            aria-hidden={index !== current}
            inert={index !== current}
          >
            {failed[index] ? (
              <div className="absolute inset-0 flex items-center justify-center bg-espresso px-6">
                <p className="eyebrow text-brass">{label}</p>
              </div>
            ) : isSvg(image.src) ? (
              <img
                src={image.src}
                alt={image.alt}
                loading={index === current ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
                onError={() => setFailed((currentFailed) => ({ ...currentFailed, [index]: true }))}
              />
            ) : (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={sizes}
                loading={index === current ? "eager" : "lazy"}
                className="object-cover"
                draggable={false}
                onError={() => setFailed((currentFailed) => ({ ...currentFailed, [index]: true }))}
              />
            )}
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/45 to-transparent"
      />

      <p className="absolute bottom-4 left-5 z-10 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cream">
        {String(current + 1).padStart(2, "0")}
        <span className="ml-1.5 text-cream/55">/ {String(count).padStart(2, "0")}</span>
      </p>

      <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1.5 sm:flex">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === current ? "w-5 bg-brass" : "w-1.5 bg-cream/55 hover:bg-cream"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          aria-label="Previous slide"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso/55 text-cream backdrop-blur-sm transition-colors hover:bg-espresso/85 focus-visible:ring-2 focus-visible:ring-brass"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => goTo(current + 1)}
          aria-label="Next slide"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso/55 text-cream backdrop-blur-sm transition-colors hover:bg-espresso/85 focus-visible:ring-2 focus-visible:ring-brass"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <span className="sr-only" role="status">
        Slide {current + 1} of {count}
      </span>
    </figure>
  );
}