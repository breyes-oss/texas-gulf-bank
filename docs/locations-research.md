# Branch & ATM Location Experience — Reference Research

**Project:** Texas Gulf Bank site (Astro 7 + Tailwind v4, tgbtest2.pages.dev)
**Scope:** Design basis for a new locations experience (locator + location detail pages)
**Reference banks:** Chase (national), Frost Bank (Texas regional), Stellar Bank (Texas community)
**Date:** August 2026 · All observations from live sites; findings are transferable patterns, not copied assets.

> Current state: the TGB test site has NO locations pages. All "Locations / Find a Branch" links
> point to texasgulfbank.com. This document defines what we should build.

---

## 1. Bank-by-Bank Findings

### 1.1 Chase — National / Enterprise Benchmark

**Entry points**
- Header link "Find a branch or ATM" → `locator.chase.com` (canonical: `chase.com/locator`).
- Note: the commonly shared URL `chase.com/digital/branch-locator` currently 404s ("Page not found") — a reminder that enterprise URLs churn and the TGB implementation should use stable, ownable URLs.
- Locator entry also exists via ATM product page (`chase.com/digital/atms`) and "Browse by state" for non-typed discovery.

**Locator page (`/locator`)**
- Single search input: "Search by address, city or ZIP" (Yext-style autocomplete).
- "Use my location" geolocation button + "Browse by state" fallback (progressive disclosure for people who don't want to type).
- "Search for ATMs internationally" (Visa locator) — enterprise scope, not needed for TGB.

**Search results**
- Branch vs ATM clearly differentiated: "Chase branch with ATM", "Chase ATM", distance shown first (`0.4 mi.`), name, address, live status ("Closed until 9:00 AM Monday", "Open until 2:00 PM today", "ATM open 24 hours").
- Card hierarchy: distance → type badge → name → address → status. List and map synchronize (Yext pattern).
- URL patterns: `/locator/banking/us/tx/houston/712-main-st` (branch), `/locator/us/tx` (state pages), city index pages — strong local SEO conventions.

**Branch detail page (`/locator/banking/us/tx/houston/712-main-st`)**
- Breadcrumb: Home / Search / Branch name.
- H1: "Chase branch with ATM — Houston Main" (type + name).
- Prominent status line: "Closed until 9:00 AM Monday".
- Actions: Directions (Google Maps query link), address, phone (`tel:` link).
- **Branch hours**: full weekly grid (Sun–Sat with open/close; `--` for closed days).
- **Drive-up banking hours**: separate weekly grid where available.
- **Schedule a meeting**: appointment CTA (meeting scheduler).
- **Branch services**: cards for Chase for Business, Private Client, Home Lending, Wealth Management — each with one-line description + deep link.
- **ATM info**: number of ATMs open (`0 of 2`), ATM type (Drive-up/Lobby/Vestibule), authentication methods, after-hours access, bills available, accessibility features (audio, volume, contrast, Braille).
- **ATM services**: cash, statements/balances, transfers, cash deposits, check deposits, bill pay.
- **ATM languages**: 13 languages listed.
- **Nearby branches & ATMs**: 3 items with distance, address, live status.

**Mobile:** list/map toggle, tap-to-call, tap-to-navigate, status-first cards.

**Friction points**
- Enterprise complexity: meeting scheduler, Private Client, Wealth Management deep links are irrelevant to a community bank and would overwhelm.
- ATM "0 of 2 open" stats require real-time telemetry TGB doesn't have.
- The 404 on the shared URL shows even Chase's cross-linking is fragile.

---

### 1.2 Frost Bank — Texas Regional Benchmark

**Entry points**
- Homepage "Find a location" → `locations.frostbank.com` (Yext store pages on a subdomain). Main-site `/locations` redirects there.
- Strong homepage trust signals around service: "24/7 live human support", "Live chat a person, not a bot", "4.9/5 rated app", JD Power #1 in TX 17 consecutive years, community photo-of-the-day.

**Locator page (`locations.frostbank.com/search`)**
- Search: "City, State/Province, Zip or City & Country" with Google autocomplete; "Search by geolocation".
- Filters (progressive disclosure, two groups):
  1. **Filter** = Financial Center / ATM / All.
  2. **Locator** = Planned / **Now Open** / Coming Soon — a genuinely useful status filter.
- List ↔ Map toggle; Google Maps tiles; "Powered by Google" attribution.

**City landing pages (local SEO)**
- `locations.frostbank.com/austin` lists every financial center with address — clean local-SEO entry points for "frost bank austin".

**Financial-center detail page (`locations.frostbank.com/texas-city/2831-palmer-highway`)**
- Status first: "Open Now – Closes at 1:00 PM" / "Closed – Opens at 9:00 AM Monday".
- Address block (street, city, state, ZIP, US), **Main Number (800) 513-7678** (central 24/7, not per-branch).
- Actions: **Get Directions**, **Schedule an Appointment** (deep link), **Call Now** — three explicit conversion CTAs.
- **Lobby Hours**: weekly table (Sat-first ordering, Sun "Closed").
- **Motor Bank Hours**: separate table; some locations show "Motor Bank at 300 W 9th St" (offsite drive-through annotation).
- **ATM Hours**: "Open 24 Hours" + "ATM availability based on building access" caveat.
- **Services**: Banking, Investments, Insurance, Mortgage, Motor Bank, Notary, Online Banking Center, **Deaf Link ASL Access**, Night Deposit, Safe Deposit Box, Drive-up ATM, Lobby ATM.
- **About paragraph**: regional brand voice ("Everyone is significant… since 1868").
- **Nearby Financial Centers**: 3 cards with live status, address, services, Get Directions + View Details.
- **Find Another Location** link; Careers block.
- Third-party-site interstitial modal for external links (trust/compliance pattern).

**Mobile:** click-to-call, tap-to-navigate, status-first; heavy but usable.

**Friction points**
- Central 800 number only (no per-branch local phone) — fine at scale, but a community bank should show both.
- Yext subdomain split (frostbank.com vs locations.frostbank.com) fragments the brand; TGB should keep locations on the same domain.
- Service list is a flat string list (no icons/grouping) — reads as a tag dump.
- "Open Now – Closes at 1:00 PM" assumes a known "now"; when the page is served stale it can mislead.

---

### 1.3 Stellar Bank — Texas Community Benchmark

**Entry points**
- Homepage "See Our Locations" → `/About/Locations/` (same-domain pages, no subdomain).
- Location URL convention: `/About/Locations/Eldridge/` (location-name slug).

**Locator index (`/About/Locations/`)**
- Intro + "Find my location / Clear location" (geolocation).
- **Filters**: Banking Services (Drive-Thru, Safe Deposit Boxes, Night Deposit, Notary, Medallion Services) and **Languages** (Spanish, Russian, Hindi, Greek, Arabic, Thai, Punjabi, Urdu, Korean, Vietnamese) and ATM Services (Drive-Thru ATM, Deposit-Taking ATM, Walk-Up ATM Only, ATM with Limited Hours) — language filtering is a community-bank differentiator (Houston market).
- Google map with numbered markers; result cards: distance, name, address, Get Directions (Google Maps dir link with origin coords), Closed status, Hours of Operation (Lobby / Drive-Thru ranges), "Load More".
- **Real-time location updates** block: weather/holiday status page + holiday schedule — great trust feature for Gulf Coast (hurricanes).

**Location detail page (`/About/Locations/Eldridge/`)**
- Fraud-alert banner (bank-impersonation warning) — compliance + security pattern.
- H1 "Eldridge" (short name only), exterior photo, **static Google map** (staticmap image, no pan/zoom/directions embed — a weakness).
- "Connect With Us": address, **local phone** (`tel:281.493.4002`), "Contact a Banker" (form link).
- **Hours of Operation**: "Closed" status line, Lobby Hours (Mon–Fri 9–5 range), Drive-Thru Hours (Mon–Fri 7:30–6), "All times US Central", Holiday hours ("Closed").
- **Banking Center Services**: Drive-Thru, Safe Deposit Box (with FDIC non-insurance footnote), Night Deposit, Notary, Instant Debit Card Availability, Spanish.
- **ATM Services**: Drive-Thru ATM, Deposit-Taking ATM.
- **Nearby Locations**: 3 cards (name, address, More Details) with a 1-2-3 carousel.

**Mobile:** works, but static map, no appointment CTA, no click-to-call button (only tel link), hours shown as ranges not per-day tables.

**Friction points / improvement opportunities**
- Static map (no interaction, no directions embed).
- No per-day hours table; ranges only.
- No appointment scheduling CTA.
- Local phone shown as a link but no dedicated "Call" button.
- "Nearby" is a carousel, not map-linked.
- Distance sorting on the index was geographically wrong from a default origin (Dallas listed at 556 mi from an apparent default geolocation) — evidence that its geolocation defaulting is unreliable.

---

## 2. Cross-Bank Comparison Matrix

| Dimension | Chase | Frost | Stellar |
|---|---|---|---|
| Locator entry / nav label | "Find a branch or ATM" in header; locator.chase.com | "Find a location" → locations.frostbank.com (subdomain) | "See Our Locations" → /About/Locations/ (same domain) |
| Search input types | Address/city/ZIP + autocomplete; "Use my location"; Browse by state | City/State/ZIP/country + Google autocomplete; geolocation button | "Find my location" geolocation + Clear; no typed search on index (results list) |
| Geolocation | ✅ "Use my location" | ✅ "Search by geolocation" | ✅ but default-origin distance bugs observed |
| Autocomplete | ✅ (Yext) | ✅ (Google) | ❌ |
| Branch/ATM/drive-through differentiation | ✅ Branch vs ATM; drive-up hours tables; ATM type | ✅ Financial Center vs ATM; Motor Bank hours; Drive-up ATM | ✅ Banking center vs ATM services; Drive-Thru listed |
| Filters | Implicit (type in results); no filter panel on landing | ✅ Financial Center/ATM + Planned/Now Open/Coming Soon | ✅ Services + Languages + ATM services (best-in-class for market) |
| Map/list layout & sync | ✅ map+list sync | ✅ List/Map toggle | ✅ numbered markers + list; weak default origin |
| Result card | Distance → type → name → address → status | Name → status → address → services → CTAs | Name → distance → address → Get Directions → status → hours |
| Distance / open-closed / hours | Distance on cards; status line; weekly grids | Status first; weekly tables; distance on nearby | Distance on cards; "Closed" status; hours ranges |
| Directions & click-to-call | Directions (Google) + tel: link | Get Directions + Call Now buttons + schedule | Get Directions link + tel: link (no button) |
| Appointment / contact CTAs | "Schedule a meeting" scheduler | ✅ Schedule an Appointment deep link | "Contact a Banker" form only |
| Services/amenities shown | Service cards w/ descriptions (Business, Private Client, Lending, Wealth) | Flat tag list (Banking, Investments, Insurance, Motor Bank, Notary, Deaf Link ASL, Night Deposit, SDB) | Simple list (Drive-Thru, SDB, Night Deposit, Notary, Instant Debit, Spanish) |
| Location-detail quality | Excellent: hours grids, ATM telemetry, languages, nearby | Very good: hours tables, motor bank, appointments, about text | Good but basic: static map, ranges, no appointment |
| Nearby discovery | ✅ 3 nearby with distance+status | ✅ 3 nearby cards w/ status | ✅ 3 nearby carousel |
| Mobile usability | ✅ status-first, tap actions | ✅ heavy but complete | ⚠️ static map; no call button |
| Accessibility observations | ATM accessibility features listed; tel links; semantic structure | Deaf Link ASL Access listed; status text; links | Basic; static image maps lack alt/interaction; carousel is weak a11y |
| Local SEO / URL structure | `/locator/banking/us/tx/houston/712-main-st` + state/city indexes | `locations.frostbank.com/austin` + `/texas-city/2831-palmer-highway` | `/About/Locations/Eldridge/` same-domain slugs |
| Strengths | Completeness, discovery scale, status-first, ATM detail depth | Regional polish, trust signals, appointment flow, Now-Open filter, motor bank | Simplicity, local phone, language filters, fraud banner, weather status |
| Friction | Enterprise bloat; telemetry we can't replicate; URL churn | Subdomain split; central-only phone; tag-dump services | Static map; no per-day hours; no appointment; distance bug |

---

## 3. Synthesis

### 3.1 Best patterns from each bank (to adopt)

**From Chase:**
1. Status-first result cards ("Closed until 9:00 AM Monday") with distance.
2. Separate weekly hours grids for lobby vs drive-up.
3. Breadcrumb + type-in-H1 ("Branch" vs "ATM") for clarity and SEO.
4. Nearby locations with distance + status.
5. State/city index pages for local SEO.

**From Frost:**
1. "Open Now / Closes at X" status + **Now Open filter**.
2. Three explicit CTAs: Get Directions / Call / Schedule Appointment.
3. Motor Bank (drive-through) as a first-class hours block with offsite annotation.
4. Accessibility services listed (Deaf Link ASL equivalent → TGB: language + accessibility services).
5. Trust content on the homepage (24/7 humans, no bots) reinforcing the locator's promise.

**From Stellar:**
1. Same-domain location pages with clean slugs (`/locations/<name>`).
2. Local per-branch phone number.
3. **Language filter** (Houston market relevance).
4. Fraud-alert banner on location pages.
5. Weather/holiday "location status" page (Gulf Coast hurricanes).
6. Simplicity — a location page that answers address/phone/hours in one glance.

### 3.2 Weaknesses / friction to avoid

- Chase-level bloat (meeting schedulers, Private Client, real-time ATM telemetry we can't operate).
- Frost's subdomain split (keep `/locations/` on tgbtest2/texasgulfbank domain).
- Frost's central-only phone (show local + central).
- Frost's flat service tag dump (group services with icons).
- Stellar's static map (use an interactive embed + directions link).
- Stellar's hours-as-ranges (use per-day tables like Frost/Chase).
- Stellar's unreliable default-origin distance.
- Any status logic that can't be kept current — stale "Open now" is worse than none.

### 3.3 Recommendations, classified

**Table stakes (must have for ANY bank location experience):**
- Address, local phone (tel:), and directions on every location page.
- Per-day lobby hours table; separate drive-up/motor bank table where applicable.
- Status line ("Open now · Closes 5:00 PM" / "Closed · Opens 9:00 AM Mon") computed at build time, with clear "hours may vary" caveat.
- Same-domain URL structure: `/locations/`, `/locations/<slug>/`.
- Breadcrumbs + descriptive `<title>`/meta per location (local SEO).
- Mobile: tap-to-call, tap-to-navigate, no horizontal scroll.
- FDIC digital sign + Equal Housing Lender compliance retained.

**High-value improvements for TGB:**
- Locator with typed search (address/ZIP/city) + "Use my location" + autocomplete (Yext or Google Places — decide by cost/privacy; Yext-class or a lightweight geocoder).
- List ↔ map sync (embedded map, numbered markers ↔ result cards).
- Branch vs ATM vs drive-through distinction on cards and detail pages.
- Grouped, iconified services (e.g., Notary, Night Deposit, Safe Deposit, Instant Debit Card, Spanish/Sign-language availability).
- Local + central phone (per-branch phone from the real texasgulfbank.com data; central 800.467.7216).
- Now-Open / ATM-only filters.
- Nearby locations (3) with distance and status.
- CMS-driven location data (Sveltia collection) so branch staff can update hours/services without code deploys.

**Differentiators appropriate for TGB:**
- Language availability filter (Spanish first; matches Stellar's pattern for the Houston market).
- Fraud-alert / security banner on location pages (matches Stellar, aligns with TGB's existing scam blog content).
- Weather/holiday "location status" page (Gulf Coast hurricanes; Frost/Stellar both nod at this).
- Real photography per branch (exterior shots) instead of stock.
- "Meet the local team" snippet per flagship branch (community feel, on-brand with "local decision-makers").
- Appointment CTA that links to a simple contact form (not a heavyweight scheduler).

**Future enhancements (need data/APIs/ops):**
- Real-time open/closed telemetry (needs branch status feed or operator updates).
- Live ATM availability ("0 of 2 open") — needs ATM monitoring.
- Store-hours-aware scheduling with calendar availability — needs booking backend.
- Directions ETA / transit integration — needs routing API (Google/OSRM).
- International ATM search — irrelevant for TGB; skip.

---

## 4. Target-Bank Solution Design (TGB)

### 4.1 Information architecture

```
/locations/                       → locator index (map + list + search + filters)
/locations/<slug>/                → location detail page (one per branch)
/locations/holiday-schedule/      → holiday closure dates
/locations/status/                → weather/temporary closures (future: ops feed)
```

- Same domain, clean slugs (`/locations/eldridge-parkway`, `/locations/angleton-main`).
- Data model: Sveltia CMS collection `locations` (YAML per branch) — fields: name, slug, street, city, state, zip, lat/lng, phone, lobby hours (per-day), drive-up hours, services (checkbox list), languages, ATM types, image, nearby order.
- Static build (Astro) — status computed from a timezone-aware build script; caveat text always present.

### 4.2 Locator page (`/locations/`)

- **Search bar** (address/ZIP/city) with autocomplete + **"Use my location"** — from Chase (discovery) simplified to Frost's single-input pattern.
- **Filters** (Frost-style progressive disclosure): Branch / ATM / Drive-thru, and **Open now** toggle; **Languages** filter (Stellar-style, Spanish-first).
- **Layout:** full-width map left (60%), scrollable result list right (40%) — synchronized (hover/click marker ↔ card) like Chase, but built with a lightweight embed (Leaflet + OSM tiles or Google Maps embed depending on Brandon's API preference) — no enterprise license needed.
- **Result card:** status line → name → distance → address → quick actions (Directions, Call) → chevron to detail. Branch/ATM/drive-thru badges.
- **No-result state:** friendly copy + "view all branches" + phone 800.467.7216.
- Footer note: "Hours are subject to change on holidays and during severe weather. Check our holiday schedule."

### 4.3 Location detail page (`/locations/<slug>/`)

Top-to-bottom:

1. **Breadcrumb** Home / Locations / {Name} (Chase pattern).
2. **H1** "Texas Gulf Bank — {Name}" with branch/ATM badge (Chase's type-in-H1, reworded).
3. **Status + hours**: status line; two weekly tables — Lobby Hours and Drive-Thru Hours (Frost/Chase pattern); "All times US Central"; holiday note.
4. **Contact block** ("Connect with us"): address, **local phone** (Stellar) + **central 800.467.7216** (Frost), Directions (Google Maps link), "Contact a banker" (form CTA).
5. **Services & amenities**: grouped icon chips — Banking, Drive-thru, ATM (type), Night Deposit, Safe Deposit, Notary, Instant Debit Card, Languages spoken (Spanish…), Accessibility (e.g., wheelchair access, Deaf Link-style note).
6. **ATM details** where known: drive-up/walk-up/deposit-taking.
7. **Photo** (real branch exterior) — not stock.
8. **Nearby locations** (3): distance + status + links (Chase/Frost).
9. **Fraud/security note** (Stellar pattern, TGB voice): "TGB will never call asking for your PIN or one-time code" linking to the existing scam blog post.
10. **SEO**: unique `<title>` ("Texas Gulf Bank {Name} — Hours, Directions, Services"), meta description with address, JSON-LD `BankOrCreditUnion`/`LocalBusiness` schema (lat/lng, hours, phone, geo).

### 4.4 Why each decision (research → decision traceability)

| Design decision | Research basis |
|---|---|
| Same-domain `/locations/<slug>/` | Stellar's clean slugs + Frost's subdomain split is a friction point to avoid; TGB owns its domain on Cloudflare Pages |
| Status-first cards + Open-now filter | Chase status cards + Frost "Now Open" filter — highest-utility patterns in the set |
| Per-day lobby/drive-up tables | Chase + Frost both use weekly grids; Stellar's ranges are the known weakness |
| Local + central phone | Stellar's local phone (community feel) + Frost's central 24/7 line (utility) |
| Branch/ATM/drive-thru badges | Chase's type differentiation, Frost's Motor Bank block |
| Services as grouped icon chips | Frost's tag dump is the anti-pattern; Stellar's short list is the model, grouped for scanability |
| Language filter | Stellar's language filter is the standout community-bank feature for the Houston market |
| Fraud banner on location pages | Stellar's security-first pattern; TGB already publishes scam-awareness content |
| Holiday/weather status page | Stellar's "Check Location Status" + Gulf Coast reality; Frost's holiday awareness |
| Interactive map (not static) | Stellar's static map is the documented weakness; Chase/Frost interactive sync is the bar |
| CMS-driven location data | TGB already runs Sveltia for rates/fees/blog — locations must be editor-editable, not hardcoded |
| JSON-LD LocalBusiness schema | Chase/Frost local SEO URL conventions + Stellar's title conventions; schema is the missing 3rd pillar |

### 4.5 Explicit non-goals (deliberate omissions)

- No meeting scheduler (Chase) — TGB uses a contact form CTA instead.
- No Private Client / Wealth deep links on location pages.
- No real-time ATM telemetry claims we can't deliver.
- No international ATM search.
- No Yext/enterprise license — static build + lightweight map embed keeps it free on Cloudflare Pages.

---

## 5. Build Order (recommended)

1. **Data:** Sveltia `locations` collection + seed with real TGB branches (from texasgulfbank.com: Angleton, Brazosport, Clute, CityCentre, Friendswood, Lake Jackson, Voss, River Oaks, West Columbia, Galveston area).
2. **Detail page** (`/locations/[slug].astro`) — highest value first: address, phone, per-day hours, directions, services.
3. **Index page** (`/locations/index.astro`) — list + map + search + filters.
4. **SEO pass** — titles, meta, JSON-LD, breadcrumbs, sitemap entry.
5. **CMS wiring** — Sveltia config for the locations collection.
6. **Holiday/status pages** — content pages, CMS-editable.
