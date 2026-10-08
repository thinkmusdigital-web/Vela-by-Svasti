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
 * Local SVGs (our placeholders) are served unoptimized via <img>.
 * Everything else goes through next/image for responsive, compressed delivery.
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

  if (isSvg || (fill === false && (!width || !height))) {
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
      sizes={sizes}
      className={className}
      priority={priority}
      fill={fill}
      width={width}
      height={height}
      quality={82}
    />
  );
}