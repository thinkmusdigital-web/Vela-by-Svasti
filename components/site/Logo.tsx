import Image from "next/image";

/**
 * VELA by Svasti logo artwork (new uploaded set), served as-is so the aspect
 * ratio is preserved exactly. Variants are named by the surface they sit on:
 * - light-surface: transparent dark-brown artwork for light backgrounds (primary)
 * - dark-surface: transparent light copper/cream artwork for dark backgrounds
 * - cream-card / dark-card: full-bleed background versions for large logo treatments
 * - cream-alternate / solid-dark: alternate light-section treatments
 * Wordmarks are the transparent text-only lockups for compact navigation slots.
 */
export type LogoVariant =
  | "light-surface"
  | "dark-surface"
  | "cream-card"
  | "dark-card"
  | "cream-alternate"
  | "solid-dark";

export type LogoLayout = "full" | "wordmark";

type Source = { src: string; ratio: number };

const FULL_LIGHT: Source = { src: "/brand/vela-logo-6-transparent-copper.png", ratio: 3736 / 3674 };
const FULL_DARK: Source = { src: "/brand/vela-logo-5-transparent-light.png", ratio: 3736 / 3674 };
const FULL_CREAM: Source = { src: "/brand/vela-logo-1-cream.png", ratio: 4673 / 4628 };
const FULL_BROWN: Source = { src: "/brand/vela-logo-2-dark.png", ratio: 4673 / 4628 };
const FULL_CREAM_ALT: Source = { src: "/brand/vela-logo-3-cream-solid.png", ratio: 4673 / 4628 };
const FULL_SOLID_DARK: Source = { src: "/brand/vela-logo-4-transparent-dark.png", ratio: 3736 / 3674 };
const WORDMARK_DARK: Source = { src: "/brand/vela-wordmark-7-dark.png", ratio: 2226 / 892 };
const WORDMARK_LIGHT: Source = { src: "/brand/vela-wordmark-8-cream.png", ratio: 2226 / 892 };

const SOURCES: Record<LogoVariant, Record<LogoLayout, Source>> = {
  "light-surface": { full: FULL_LIGHT, wordmark: WORDMARK_DARK },
  "dark-surface": { full: FULL_DARK, wordmark: WORDMARK_LIGHT },
  "cream-card": { full: FULL_CREAM, wordmark: WORDMARK_DARK },
  "dark-card": { full: FULL_BROWN, wordmark: WORDMARK_LIGHT },
  "cream-alternate": { full: FULL_CREAM_ALT, wordmark: WORDMARK_DARK },
  "solid-dark": { full: FULL_SOLID_DARK, wordmark: WORDMARK_DARK },
};

interface LogoProps {
  variant?: LogoVariant;
  layout?: LogoLayout;
  /** Rendered height in pixels; width follows the artwork's aspect ratio. */
  height: number;
  priority?: boolean;
  className?: string;
}

export function Logo({
  variant = "light-surface",
  layout = "full",
  height,
  priority = false,
  className,
}: LogoProps) {
  const source = SOURCES[variant][layout];
  const width = Math.round(height * source.ratio);

  return (
    <Image
      src={source.src}
      alt="Vela by Svasti logo"
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes={`${width}px`}
    />
  );
}
