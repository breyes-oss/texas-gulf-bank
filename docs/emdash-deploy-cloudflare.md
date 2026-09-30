# Deploying TGB with EmDash to Cloudflare

This branch (`feat/emdash-cms`) migrates TGB's content management from Sveltia
CMS (Git-based flat files) to **EmDash 1.0** (server-backed CMS on Astro). This
document covers the Cloudflare deploy. For local development, see the "Local
dev" section at the bottom.

---

## 1. What changes — and what stays

**Two ways to read "can the local pages and EmDash both live on Cloudflare
at once?"**

### A. Both in the same Workers app (recommended)

EmDash is an **Astro integration**, so it does not replace the site — it *is*
the site. The whole TGB site (marketing pages + blog + admin) becomes **one
Cloudflare Workers deployment**. Within that single deployment:

- Pages that were static before can stay **pre-rendered** (`export const
  prerender = true`), so they're served as plain cached HTML at the edge —
  just like the current Cloudflare Pages setup, no DB round-trip on those
  requests.
- CMS-driven pages (blog index, blog posts, anything that reads
  `getEmDashCollection` / `getEmDashEntry`) are **server-rendered** and read
  the latest published revision live from D1.
- The EmDash admin lives at `/_emdash/admin/*`.

So the marketing pages and the CMS live side by side in one app. You don't
operate two deployments.

### B. Two separate deployments under different URLs

Not recommended, but possible: keep the existing static Cloudflare **Pages**
deploy running on `tgbtest2.pages.dev` while the EmDash Worker runs on a
second URL. The drawback is content lives in two places (git files + D1) and
the pages diverge. Treat this only as a rollback/test staging step, never the
final state.

---

## 2. Switch the Astro config to the Cloudflare adapter

The local config currently uses the Node.js + SQLite adapter (so it runs on
one machine for verification). For Cloudflare, replace `astro.config.mjs`:

```js
// astro.config.mjs — Cloudflare (replace the Node/SQLite version)
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(), // required — the admin UI is a React app
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
});
```

> **Keep these two files as-is — they're already correct:**
> - `src/live.config.ts` — registers the `_emdash` live collection with
>   `emdashLoader()`
> - `.gitignore` — `data.db`, `uploads/`, `.env` are excluded
>
> If you want the marketing pages to stay pre-rendered (recommended), set
> `output: "hybrid"` instead of `"server"` and add `export const prerender =
> true` to pages that read flat-file content. The blog pages are already
> server-rendered.

## 3. Create the Worker entry point

Create `src/worker.ts`:

```ts
import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

export default {
  ...handler,
  scheduled: createScheduledHandler(),
} satisfies ExportedHandler;
```

`PluginBridge` is harmless when no sandboxed plugin is installed; keep it so
plugins can be added later. `createScheduledHandler()` runs scheduled
publishing, plugin tasks, backups, and maintenance.

## 4. Create `wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tgb-emdash",
  "main": "./src/worker.ts",
  "compatibility_date": "2026-02-24",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    { "binding": "DB", "database_name": "tgb-emdash-db" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "tgb-emdash-media" }
  ],
  "worker_loaders": [{ "binding": "LOADER" }],
  "triggers": { "crons": ["* * * * *"] }
}
```

The `DB`, `MEDIA`, and `LOADER` binding names must match the adapters in step 2.
The cron trigger runs every minute for scheduled publishing. If you never use
sandboxed/marketplace plugins, you may omit `worker_loaders` and `LOADER`.

## 5. Build and deploy

```sh
# one-time: authenticate Wrangler with your Cloudflare account
npx wrangler login

# build (applies pending core migrations and the seed on first request)
npm run build

# deploy — first run provisions the named D1 database and R2 bucket
npx wrangler deploy
```

On the first request after deploy, EmDash:
1. applies pending core database migrations (auto mode), and
2. applies the seed (schema + content) once, then runs the setup wizard.

After setup completes, an administrator account + passkey is created and the
site is live. Content from this branch's flat files is already in
`seed/seed.json` — 21 entries across blog, locations, products, pages, rates,
and fees.

## 6. Point the custom domain

Your first deploy gets a `*.workers.dev` URL. Once it responds, add the
production domain as a Wrangler route (it must already be active on your
Cloudflare account):

```jsonc
{ "routes": [{ "pattern": "www.texasgulfbank.com", "custom_domain": true }] }
```

Deploy again and verify both the `workers.dev` URL and the custom domain.

## 7. Set the encryption-key secret

EmDash encrypts plugin secrets at rest using the key in `.env` (`EMDASH_ENCRYPTION_KEY`).
Set it as a Worker secret so it survives deploy without living in git:

```sh
npx wrangler secret put EMDASH_ENCRYPTION_KEY
```

> Never put the key in `import.meta.env` — Vite inlines that at build time.
> Keep `.env` out of version control (already gitignored) and back it up: losing
> it makes encrypted values unreadable.

## 8. Verify the deployment

- Request one public page (e.g. `/blog/`) and confirm live content.
- Sign in to `/_emdash/admin`.
- Upload and retrieve a test media file (exercises the R2 binding).
- Confirm the scheduled handler shows up: `npx wrangler tail` and check for the
  minute-level cron firing.

## 9. Retire the old CMS pieces (post-migration)

Once the EmDash deploy is verified, remove the Sveltia/Pages-only files. They
are safe to delete and cannot run on Workers anyway:

- `functions/api/auth.js`, `functions/api/callback.js` — old GitHub OAuth
  Pages Functions
- `public/admin/` — Sveltia admin shell + config
- `src/pages/admin/index.astro` — Sveltia admin page (EmDash admin now lives
  at `/_emdash/admin`)
- `src/content/blog/*.md` and the flat YAML content (now in D1 via seed) —
  keep only until the migration is confirmed, then remove to avoid drift

---

## Local development (current branch state)

The branch is configured for local verification with Node + SQLite so you can
run it on one machine without a Cloudflare account:

```sh
npm install
npx emdash seed seed/seed.json --database ./data.db   # load migrated content
npm run dev                                            # http://localhost:4321
```

- EmDash admin: `http://localhost:4321/_emdash/admin/` (setup wizard first run)
- Blog reads live from EmDash: `http://localhost:4321/blog/`

To switch this to Cloudflare locally, apply step 2–5 (requires `wrangler login`
and D1/R2 in your account).

## Known follow-ups on this branch

- Blog is fully wired to EmDash (index + detail, markdown + `{{rate}}`/`{{cta}}`
  shortcodes preserved). Locations, products, rates, fees, and home pages still
  read from the flat-file collections — they follow the same swap.
- Status check: blog content migration **verified**; Cloudflare deploy needs
  your account credentials (this step cannot be run from the hosted box).