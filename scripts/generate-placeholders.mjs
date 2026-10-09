/* eslint-disable no-undef */
/**
 * Generates the clearly-marked placeholder SVGs used until real Vela
 * photography is uploaded through Admin → Gallery / Room Types.
 *
 *   node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "public", "images");
mkdirSync(outDir, { recursive: true });

const images = [
  { file: "hero.svg", label: "Hero", caption: "Replace via Admin → Website Content", w: 1920, h: 1100, tone: "#14110f", accent: "#b08d57" },
  { file: "about.svg", label: "About Vela", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "dining.svg", label: "Fine Dining", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "cafe.svg", label: "Café", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "bar.svg", label: "Bar", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "spa.svg", label: "Spa", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "gym.svg", label: "Gym", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "pool.svg", label: "Rooftop Pool", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "events.svg", label: "Banquets & Events", caption: "Replace via Admin → Website Content", w: 1400, h: 1050 },
  { file: "location.svg", label: "VIP Chowk, Raipur", caption: "Replace via Admin → Website Content", w: 1400, h: 900 },
  { file: "experience.svg", label: "Experience", caption: "Stay · Dine · Meet · Unwind · Recharge · Celebrate", w: 1400, h: 1050 },
  { file: "room-deluxe.svg", label: "Deluxe Room", caption: "Replace via Admin → Room Types", w: 1400, h: 1000 },
  { file: "room-premium.svg", label: "Premium Room", caption: "Replace via Admin → Room Types", w: 1400, h: 1000 },
  { file: "room-suite.svg", label: "Executive Suite", caption: "Replace via Admin → Room Types", w: 1400, h: 1000 },
  { file: "gallery-exterior.svg", label: "Exterior", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-interior.svg", label: "Interior", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-restaurant.svg", label: "Restaurant", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-cafe.svg", label: "Café", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-bar.svg", label: "Bar", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-spa.svg", label: "Spa", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-gym.svg", label: "Gym", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-pool.svg", label: "Pool", caption: "Placeholder", w: 1200, h: 900 },
  { file: "gallery-events.svg", label: "Events", caption: "Placeholder", w: 1200, h: 900 },
];

function svg({ file, label, caption, w, h, tone = "#1b1714", accent = "#b08d57" }) {
  const titleId = `t-${file}`;
  const big = Math.round(Math.min(w, h) * 0.11);
  const small = Math.round(Math.min(w, h) * 0.032);
  const micro = Math.round(Math.min(w, h) * 0.024);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label} placeholder image">
  <title id="${titleId}">${label} — placeholder image</title>
  <defs>
    <linearGradient id="bg-${file}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tone}"/>
      <stop offset="55%" stop-color="#241e1a"/>
      <stop offset="100%" stop-color="#33291f"/>
    </linearGradient>
    <linearGradient id="sheen-${file}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${accent}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid-${file}" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg-${file})"/>
  <rect width="${w}" height="${h}" fill="url(#grid-${file})"/>
  <rect x="0" y="${Math.round(h * 0.62)}" width="${w}" height="2" fill="url(#sheen-${file})"/>
  <g transform="translate(${w / 2} ${h / 2 - Math.round(Math.min(w, h) * 0.1)})" text-anchor="middle">
    <circle r="${Math.round(Math.min(w, h) * 0.11)}" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.75"/>
    <text y="${Math.round(Math.min(w, h) * 0.045)}" font-family="Georgia, 'Times New Roman', serif" font-size="${big}" fill="${accent}">V</text>
  </g>
  <g text-anchor="middle" font-family="Georgia, 'Times New Roman', serif">
    <text x="${w / 2}" y="${Math.round(h / 2 + Math.round(Math.min(w, h) * 0.11))}" font-size="${small}" fill="#f4efe8" letter-spacing="6">${label.toUpperCase()}</text>
    <text x="${w / 2}" y="${Math.round(h / 2 + Math.round(Math.min(w, h) * 0.16))}" font-size="${micro}" fill="#a89f94" letter-spacing="3" font-family="Arial, Helvetica, sans-serif">${caption.toUpperCase()}</text>
  </g>
  <rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="none" stroke="#ffffff" stroke-opacity="0.08"/>
</svg>
`;
}

for (const image of images) {
  writeFileSync(join(outDir, image.file), svg(image), "utf8");
}
console.log(`Wrote ${images.length} placeholder images to public/images`);
