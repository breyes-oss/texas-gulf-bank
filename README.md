# Texas Gulf Bank concept site

Concept redesign only. It is not the official Texas Gulf Bank website. Every response sends `X-Robots-Tag: noindex, nofollow`, pages include a noindex meta tag and the concept banner, and `public/robots.txt` disallows all crawlers.

Page copy for Home, About, Contact, Locations, and Rates is edited in EmDash at `/_emdash/admin`. Deposit rates are one Rate group entry per product (Certificates of Deposit, Money Market, and the rest). Each entry has a Rates repeater with Key, Term or tier, Interest rate, APY, and Minimum or notes. Every page reads those rows, so one edit updates the whole site. The CD "Rates as of" line uses the Certificates of Deposit entry's last update, unless that entry's CD as-of date is set. Images uploaded in EmDash are stored in the `MEDIA` R2 bucket. Do not create an admin user in the repo. After the first deploy, open `/_emdash/admin`, claim the admin passkey, and include the sample content so the placeholder pages are published.

Other pages (personal checking, savings, money market, blog) still render account copy from files in `src/content`. The rates inside that copy come from the EmDash rate groups.

## Workers Builds

These commands are unchanged:

| Step | Command |
| --- | --- |
| Build | `npm run build` |
| Deploy | `npx wrangler deploy` |
| Preview upload | `npx wrangler versions upload` |
| Node | `22.23.4` |

`npm run build` writes `seed/seed.json`, then runs `astro build`. EmDash applies D1 core migrations and the seed schema on the first request (`migrations.runtime` stays `auto`). Sample entries are applied when setup includes sample content. No migration command was added to the deploy step. An existing rates sheet is reshaped in place on the first request that renders a rate: pages, locations, users, and credentials are not modified.

Set `EMDASH_ENCRYPTION_KEY` with `npx wrangler secret put EMDASH_ENCRYPTION_KEY` before saving a plugin secret. Do not commit the key. It is not required to claim the first admin passkey.

## Local

```sh
npm ci
npm run build
npx wrangler dev
```

`wrangler dev` uses local D1 and R2. The first request creates the local schema. In `/_emdash/admin`, leave **Include sample content** selected so the placeholder entries are published, then register your passkey. No admin user is stored in this repo.
