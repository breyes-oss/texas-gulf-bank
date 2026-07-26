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

function renderCtaHtml(attrs: Record<string, string>, fallback?: BlogCtaData): string {
  const eyebrow = attrs.eyebrow ?? fallback?.eyebrow ?? "Next step";
  const title = attrs.title ?? fallback?.title ?? "Talk with a local Texas Gulf Banker";
  const body =
    attrs.body ??
    fallback?.body ??
    "Whether you need a branch visit or help choosing the right account, our local bankers are ready.";
  const primaryLabel = attrs.primaryLabel ?? fallback?.primaryLabel ?? "Find a Branch";
  const primaryHref =
    attrs.primaryHref ?? fallback?.primaryHref ?? "https://www.texasgulfbank.com/locations/";
  const secondaryLabel = attrs.secondaryLabel ?? fallback?.secondaryLabel ?? "Call 800.467.7216";
  const secondaryHref = attrs.secondaryHref ?? fallback?.secondaryHref ?? "tel:8004677216";

  return [
    '<aside class="not-prose my-10 rounded-2xl border border-brand-gold/25 bg-brand-navy text-white p-6 sm:p-8 shadow-[0_16px_40px_rgba(10,22,40,0.12)]">',
    eyebrow
      ? '<p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold-light mb-3">' +
        escapeHtml(eyebrow) +
        "</p>"
      : "",
    title
      ? '<h2 class="font-display text-2xl sm:text-3xl font-semibold leading-tight text-balance">' +
        escapeHtml(title) +
        "</h2>"
      : "",
    body
      ? '<p class="mt-3 text-white/80 leading-relaxed max-w-2xl">' + escapeHtml(body) + "</p>"
      : "",
    '<div class="mt-6 flex flex-col sm:flex-row gap-3">',
    primaryLabel && primaryHref
      ? '<a href="' +
        escapeHtml(primaryHref) +
        '" class="inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy px-5 py-3 rounded-lg text-sm font-bold hover:bg-brand-gold-light transition-colors">' +
        escapeHtml(primaryLabel) +
        "</a>"
      : "",
    secondaryLabel && secondaryHref
      ? '<a href="' +
        escapeHtml(secondaryHref) +
        '" class="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">' +
        escapeHtml(secondaryLabel) +
        "</a>"
      : "",
    "</div>",
    "</aside>",
  ].join("");
}

const RATES_TOKEN = "%%RATES_TABLE%%";
const CTA_TOKEN = (n: number) => "%%CTA_BLOCK_" + n + "%%";

function unwrapParagraphToken(html: string, token: string): string {
  const wrapped = "<p>" + token + "</p>";
  return html.split(wrapped).join(token).split("<p>" + token + "\n</p>").join(token);
}

/**
 * Convert blog markdown + shortcodes into HTML.
 * Shortcodes (on their own line recommended):
 *   {{rates}}
 *   {{cta}}
 *   {{cta title="..." body="..." primaryLabel="..." primaryHref="..." secondaryLabel="..." secondaryHref="..."}}
 */
export async function renderBlogHtml(
  markdown: string,
  options?: { cta?: BlogCtaData }
): Promise<{ html: string; hasRatesEmbed: boolean }> {
  const tokens: string[] = [];
  let hasRatesEmbed = false;

  const withPlaceholders = markdown.replace(
    /\{\{\s*(rates|cta)((?:\s+[a-zA-Z][\w-]*\s*=\s*"[^"]*")*)\s*\}\}/g,
    (_full, kind: string, rawAttrs: string) => {
      if (kind === "rates") {
        hasRatesEmbed = true;
        return "\n\n" + RATES_TOKEN + "\n\n";
      }
      const attrs = parseAttrs(rawAttrs || "");
      const token = CTA_TOKEN(tokens.length);
      tokens.push(renderCtaHtml(attrs, options?.cta));
      return "\n\n" + token + "\n\n";
    }
  );

  let html = await marked.parse(withPlaceholders, {
    gfm: true,
    breaks: false,
  });

  html = unwrapParagraphToken(html, RATES_TOKEN);
  tokens.forEach((_block, index) => {
    html = unwrapParagraphToken(html, CTA_TOKEN(index));
  });

  tokens.forEach((block, index) => {
    html = html.split(CTA_TOKEN(index)).join(block);
  });

  return { html, hasRatesEmbed };
}

export function splitOnRatesToken(html: string): string[] {
  return html.split(RATES_TOKEN);
}
