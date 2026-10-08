interface SectionHeadingProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  align?: "left" | "center";
  dark?: boolean;
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  dark = false,
  id,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className={`eyebrow ${dark ? "text-brass" : ""}`}>{eyebrow}</p>
      )}
      {title && (
        <h2
          id={id}
          className={`h-section mt-4 ${dark ? "text-cream" : "text-ink"}`}
        >
          {title}
        </h2>
      )}
      {body && (
        <p className={`mt-5 text-[1.02rem] leading-relaxed ${dark ? "text-cream/75" : "text-stone"}`}>
          {body}
        </p>
      )}
    </div>
  );
}