/** Input sanitisation helpers (server-side; React also escapes on render). */

export function stripControlChars(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

/** Single-line text: collapses whitespace, trims, strips control chars. */
export function singleLine(value: string): string {
  return stripControlChars(value).replace(/\s+/g, " ").trim();
}

/** Multi-line text: normalises newlines, caps blank runs, trims. */
export function paragraph(value: string): string {
  return stripControlChars(value)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Normalises Indian mobile numbers to 10 digits (6-9 starting digit checked in validation). */
export function normalizeMobile(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function isValidMobile(value: string): boolean {
  const digits = normalizeMobile(value);
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Serialises a value into an inline JSON script (e.g. application/ld+json)
 * without letting its content break out of the <script> tag. JSON.stringify
 * does not escape `<`/`>`/`&`, so admin-editable strings could otherwise
 * close the tag and inject script.
 */
export function jsonLdString(value: unknown): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
    .replace(/&/g, "\\u0026")
    .replace(/>/g, "\\u003e")
    .replace(/</g, "\\u003c");
}
