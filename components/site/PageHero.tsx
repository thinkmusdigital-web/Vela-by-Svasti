import { MediaImage } from "@/components/site/MediaImage";
import { TextEffect } from "@/components/core/text-effect";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
}

export function PageHero({ eyebrow, title, intro, image, imageAlt }: PageHeroProps) {
  return (
    <header className="bg-sand">
      <div className="shell py-16 sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-4 max-w-4xl text-[clamp(2.6rem,6vw,4.5rem)] text-ink">
          <TextEffect per="char" stagger={16}>
            {title}
          </TextEffect>
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-stone">
            <TextEffect per="word" stagger={24} duration={320} delay={350}>
              {intro}
            </TextEffect>
          </p>
        )}
      </div>
      {image && (
        <div className="border-t border-line">
          <div className="shell pb-8">
            <div className="relative aspect-[21/9] overflow-hidden">
              <MediaImage
                src={image}
                alt={imageAlt ?? title}
                sizes="(min-width: 1400px) 1344px, calc(100vw - 64px)"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
