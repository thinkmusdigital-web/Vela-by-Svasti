import Image from "next/image";

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * Local SVGs are served unoptimized via <img>. Everything else goes through
 * next/image for responsive, compressed delivery (WebP/AVIF where supported).
 */
export function MediaImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  fill = false,
  width,
  height,
}: MediaImageProps) {
  const isSvg = src.toLowerCase().endsWith(".svg");
  const useFill = fill || (!width && !height);

  if (isSvg) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        width={width}
        height={height}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      sizes={sizes ?? "100vw"}
      className={className}
      priority={priority}
      fill={useFill}
      width={useFill ? undefined : width}
      height={useFill ? undefined : height}
    />
  );
}
