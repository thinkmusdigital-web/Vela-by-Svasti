import Image from "next/image";

export type LogoVariant = "dark" | "light";
export type LogoLayout = "full" | "wordmark";

/**
 * Supplied Vela by Svasti logo artwork. "full" is the emblem + wordmark lockup
 * (square-ish); "wordmark" is the text-only lockup (wide). "dark" is the
 * dark-brown artwork for light backgrounds; "light" is the cream artwork for
 * dark backgrounds. Artwork is served as-is — displayed size drives the
 * optimized request width and the aspect ratio is preserved exactly.
 */
const SOURCES: Record<LogoLayout, Record<LogoVariant, string>> = {
  full: {
    dark: "/brand/vela-logo-dark.png",
    light: "/brand/vela-logo-light.png",
  },
  wordmark: {
    dark: "/brand/vela-wordmark-dark.png",
    light: "/brand/vela-wordmark-light.png",
  },
};

const ASPECT_RATIO: Record<LogoLayout, number> = {
  full: 3736 / 3674,
  wordmark: 2226 / 892,
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
  variant = "dark",
  layout = "wordmark",
  height,
  priority = false,
  className,
}: LogoProps) {
  const width = Math.round(height * ASPECT_RATIO[layout]);

  return (
    <Image
      src={SOURCES[layout][variant]}
      alt="Vela by Svasti"
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes={`${width}px`}
    />
  );
}