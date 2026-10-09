/**
 * URL allow-listing helpers for admin-editable values rendered on the public
 * site. Render-time defence in depth: even if a content/settings admin saves
 * a malformed value, it can never become active code (javascript:/data:/…)
 * in an href or src.
 */

export function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Only embed hosts we trust for the site map iframe (Google Maps and
 * OpenStreetMap). Everything else — including arbitrary attacker URLs — is
 * rejected at render time.
 */
export function isAllowedEmbedUrl(value: string): boolean {
  if (!isHttpUrl(value)) return false;
  try {
    const { host } = new URL(value);
    return (
      host === "www.google.com" ||
      host === "maps.google.com" ||
      host.endsWith(".openstreetmap.org") ||
      host === "openstreetmap.org"
    );
  } catch {
    return false;
  }
}

export function safeEmbedUrl(value: string): string {
  return isAllowedEmbedUrl(value) ? value : "";
}