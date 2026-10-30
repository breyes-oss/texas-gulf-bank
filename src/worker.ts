/// <reference types="@cloudflare/workers-types" />
import handler, { createScheduledHandler } from "@emdash-cms/cloudflare/worker";

const scheduled = createScheduledHandler({ generalCron: "*/5 * * * *" });

const ROBOTS = "noindex, nofollow";
const BANNER =
  '<div role="region" aria-label="Concept site notice" style="position:sticky;top:0;z-index:2147483646;background:#19294b;color:#fff;text-align:center;padding:0.75rem 1.25rem;font:700 1rem/1.45 system-ui,sans-serif">Concept site, not the official Texas Gulf Bank website.</div>';

function withRobotsHeader(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", ROBOTS);
  const bodyless = response.status === 101 || response.status === 204 || response.status === 205 || response.status === 304;
  if (bodyless) {
    return new Response(null, { status: response.status, statusText: response.statusText, headers });
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    if (!handler.fetch) throw new Error("EmDash worker fetch handler is missing");
    const tagged = withRobotsHeader(await handler.fetch(request, env, ctx));
    const type = tagged.headers.get("content-type") ?? "";
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith("/_emdash") || !type.includes("text/html") || tagged.body === null) {
      return tagged;
    }
    return new HTMLRewriter()
      .on("head", {
        element(element) {
          element.append(`<meta name="robots" content="${ROBOTS}">`, { html: true });
        },
      })
      .on("body", {
        element(element) {
          element.prepend(BANNER, { html: true });
        },
      })
      .transform(tagged);
  },
  scheduled,
} satisfies ExportedHandler;
