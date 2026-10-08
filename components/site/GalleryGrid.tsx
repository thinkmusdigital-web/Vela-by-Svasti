"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS, type GalleryCategory } from "@/lib/constants";

export interface GalleryItem {
  id: string;
  title: string | null;
  alt: string;
  category: string;
  url: string;
}

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [category, setCategory] = useState<string>("ALL");

  const visible = useMemo(
    () => (category === "ALL" ? images : images.filter((image) => image.category === category)),
    [images, category],
  );

  const categories: string[] = ["ALL", GALLERY_CATEGORIES[0], ...GALLERY_CATEGORIES.slice(1)];

  return (
    <div>
      <div
        role="group"
        aria-label="Filter gallery by category"
        className="flex flex-wrap gap-2 border-b border-line pb-6"
      >
        {categories.map((item) => {
          const label = item === "ALL" ? "All" : GALLERY_CATEGORY_LABELS[item as GalleryCategory];
          const count = item === "ALL" ? images.length : images.filter((image) => image.category === item).length;
          const active = category === item || (item === "ALL" && category === "");
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={active}
              className={`px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                active ? "bg-ink text-cream" : "bg-sand text-stone hover:bg-parchment hover:text-ink"
              }`}
            >
              {label}
              <span className={`ml-2 text-[0.68rem] ${active ? "text-brass" : "text-fog"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((image) => {
            const isSvg = image.url.toLowerCase().endsWith(".svg");
            return (
              <li key={image.id}>
                <figure className="group overflow-hidden border border-line bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {isSvg ? (
                      <img
                        src={image.url}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  {image.title && (
                    <figcaption className="px-4 py-3 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-stone">
                      {image.title}
                    </figcaption>
                  )}
                </figure>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-10 text-[0.95rem] text-stone">
          No images in this category yet — add them from Admin → Gallery.
        </p>
      )}
    </div>
  );
}