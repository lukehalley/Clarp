// Content Filter
// Rejects content containing slurs or hate speech before it enters the database

// Slur patterns - partial matches (case-insensitive)
// These catch variations like "niggercoin", "f4ggot", etc.
const SLUR_PATTERNS: RegExp[] = [
  /n[i1!]gg[e3]r/i,
  /f[a@4]gg?[o0]t/i,
  /k[i1!]ke/i,
  /sp[i1!]c[ks]?\b/i,
  /ch[i1!]nk/i,
  /w[e3]tb[a@]ck/i,
  /tr[a@4]nn[yi1!e3]/i,
  /d[yi1!]ke\b/i,
  /c[o0][o0]n\b/i,
  /g[o0][o0]k\b/i,
  /r[e3]t[a@]rd/i,
  /\bj[e3]w\b(?=.*\b(?:bag|boy|rat|ish\b))/i,  // only slur compounds, not the word itself
  /sch[i1!]z[o0]j[e3]w/i,
];

/**
 * Check if text contains slurs or hate speech.
 * Returns the matched pattern description if found, null if clean.
 */
export function containsSlurs(text: string): string | null {
  if (!text) return null;
  const normalized = text.toLowerCase();
  for (const pattern of SLUR_PATTERNS) {
    if (pattern.test(normalized)) {
      return 'Content contains a slur or hate speech';
    }
  }
  return null;
}

/**
 * Check multiple fields for slurs. Returns rejection reason or null.
 */
export function checkContentForSlurs(fields: Record<string, string | null | undefined>): string | null {
  for (const [field, value] of Object.entries(fields)) {
    if (!value) continue;
    const result = containsSlurs(value);
    if (result) {
      return `${result} (in ${field})`;
    }
  }
  return null;
}
