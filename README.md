# Texas Gulf Bank concept site

Concept redesign only. It is not the official Texas Gulf Bank website. Every response sends `X-Robots-Tag: noindex, nofollow`, pages include a noindex meta tag and the concept banner, and `public/robots.txt` disallows all crawlers.

Page copy for Home, About, Contact, Locations, and Rates is edited in EmDash at `/_emdash/admin`. Images uploaded there are stored in the `MEDIA` R2 bucket. Do not create an admin user in the repo. After the first deploy, open `/_emdash/admin`, claim the admin passkey, and include the sample content so the placeholder pages are published.

Other pages (personal checking, savings, money market, blog) still render from files in `src/content`.

## Workers Builds

These commands are unchanged:

| Step | Command |
| --- | --- |
| Build | `npm run build` |
| Deploy | `npx wrangler deploy` |
| Preview upload | `npx wrangler versions upload` |
| Node | `22.23.4` |

`npm run build` writes `seed/seed.json`, then runs `astro build`. EmDash applies D1 core migrations and the seed schema on the first request (`migrations.runtime` stays `auto`). Sample entries are applied when setup includes sample content. No migration command was added to the deploy step.

Set `EMDASH_ENCRYPTION_KEY` with `npx wrangler secret put EMDASH_ENCRYPTION_KEY` before saving a plugin secret. Do not commit the key. It is not required to claim the first admin passkey.

## Local

```sh
npm ci
npm run build
npx wrangler dev
```

`wrangler dev` uses local D1 and R2. The first request creates the local schema. In `/_emdash/admin`, leave **Include sample content** selected so the placeholder entries are published, then register your passkey. No admin user is stored in this repo.
