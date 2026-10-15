"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type TextEffectPer = "char" | "word";
export type TextEffectPreset = "fade" | "blur" | "slide";
export type TextEffectState = "static" | "armed" | "animate";

export interface TextEffectProps {
  /** Plain text to animate. */
  children: string;
  /** Split granularity: "char" animates letters, "word" animates words. */
  per?: TextEffectPer;
  /** Visual preset for each unit. */
  preset?: TextEffectPreset;
  /** Play once when scrolled into view instead of immediately on load. */
  inView?: boolean;
  /** Delay before the first unit starts (ms). */
  delay?: number;
  /** Stagger between consecutive units (ms). */
  stagger?: number;
  /** Duration of each unit's animation (ms). */
  duration?: number;
  className?: string;
}

export function TextEffect({
  children,
  per = "char",
  preset = "fade",
  inView = false,
  delay = 0,
  stagger,
  duration = 380,
  className,
}: TextEffectProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<TextEffectState>(
    inView ? "static" : "animate",
  );

  useIsoLayoutEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setState("animate");
      return;
    }

    setState("armed");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("animate");
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  const words = children.split(" ");
  const staggerMs = stagger ?? (per === "word" ? 44 : 20);
  let unitIndex = 0;

  return (
    <span
      ref={ref}
      className={className}
      data-te-state={state}
      data-te-preset={preset}
      style={
        {
          "--te-stagger": `${staggerMs}ms`,
          "--te-duration": `${duration}ms`,
          "--te-delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => {
          const separator = wordIndex > 0 ? " " : "";
          if (per === "word") {
            const index = unitIndex++;
            return (
              <span
                key={wordIndex}
                className="te-unit"
                style={{ "--te-i": String(index) } as CSSProperties}
              >
                {separator}
                {word}
              </span>
            );
          }
          return (
            <span key={wordIndex}>
              {separator}
              {Array.from(word).map((char, charIndex) => {
                const index = unitIndex++;
                return (
                  <span
                    key={charIndex}
                    className="te-unit"
                    style={{ "--te-i": String(index) } as CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </span>
  );
}
