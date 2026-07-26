import { marked } from "marked";

export type BlogCtaData = {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export type BlogSegment =
  | { type: "html"; html: string }
  | { type: "rates" }
  | { type: "cta"; cta: BlogCtaData };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;")
    .replaceAll("'", "&#39;");
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z][\w-]*)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function normalizeCta(attrs: Record<string, string>, fallback?: BlogCtaData): BlogCtaData {
  return {
    eyebrow: attrs.eyebrow ?? fallback?.eyebrow,
    title: attrs.title ?? fallback?.title,
    body: attrs.body ?? fallback?.body,
    primaryLabel: attrs.primaryLabel ?? fallback?.primaryLabel,
    primaryHref: attrs.primaryHref ?? fallback?.primaryHref,
    secondaryLabel: attrs.secondaryLabel ?? fallback?.secondaryLabel,
    secondaryHref: attrs.secondaryHref ?? fallback?.secondaryHref,
  };
}

const RATES_TOKEN = "%%RATES_TABLE%%";
const CTA_TOKEN = (n: number) => "%%CTA_BLOCK_" + n + "%%";

function unwrapParagraphToken(html: string, token: string): string {
  return html
    .split("<p>" + token + "</p>")
    .join(token)
    .split("<p>" + token + "\n</p>")
    .join(token);
}

/**
 * Convert blog markdown + shortcodes into ordered segments.
 * Shortcodes (prefer own line):
 *   {{rates}}
 *   {{cta}}
 *   {{cta title="..." body="..." primaryLabel="..." primaryHref="..." secondaryLabel="..." secondaryHref="..."}}
 *
 * CTA/rate embeds are returned as structured segments so Astro can render
 * them outside article prose styles (avoids color cascade bugs).
 */
export async function renderBlogSegments(
  markdown: string,
  options?: { cta?: BlogCtaData }
): Promise<{ segments: BlogSegment[]; hasInlineCta: boolean }> {
  const ctaBlocks: BlogCtaData[] = [];
  let hasInlineCta = false;

  const withPlaceholders = markdown.replace(
    /\{\{\s*(rates|cta)((?:\s+[a-zA-Z][\w-]*\s*=\s*"[^"]*")*)\s*\}\}/g,
    (_full, kind: string, rawAttrs: string) => {
      if (kind === "rates") {
        return "\n\n" + RATES_TOKEN + "\n\n";
      }
      hasInlineCta = true;
      const attrs = parseAttrs(rawAttrs || "");
      const token = CTA_TOKEN(ctaBlocks.length);
      ctaBlocks.push(normalizeCta(attrs, options?.cta));
      return "\n\n" + token + "\n\n";
    }
  );

  let html = await marked.parse(withPlaceholders, {
    gfm: true,
    breaks: false,
  });

  html = unwrapParagraphToken(html, RATES_TOKEN);
  ctaBlocks.forEach((_block, index) => {
    html = unwrapParagraphToken(html, CTA_TOKEN(index));
  });

  // Tokenize into ordered segments on rates + CTA markers.
  const splitter = /(%%RATES_TABLE%%|%%CTA_BLOCK_\d+%%)/g;
  const chunks = html.split(splitter).filter((chunk) => chunk.length > 0);
  const segments: BlogSegment[] = [];

  for (const chunk of chunks) {
    if (chunk === RATES_TOKEN) {
      segments.push({ type: "rates" });
      continue;
    }
    const ctaMatch = /^%%CTA_BLOCK_(\d+)%%$/.exec(chunk);
    if (ctaMatch) {
      const idx = Number(ctaMatch[1]);
      segments.push({ type: "cta", cta: ctaBlocks[idx] || {} });
      continue;
    }
    // Skip empty HTML husks from split points.
    if (chunk.replace(/<p>\s*<\/p>/g, "").trim() === "") continue;
    segments.push({ type: "html", html: chunk });
  }

  return { segments, hasInlineCta };
}

// Keep a tiny helper used by any older import path.
export function escapeAttr(value: string): string {
  return escapeHtml(value);
}
