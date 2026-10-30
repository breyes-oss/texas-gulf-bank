#!/usr/bin/env node
// Build seed/seed.json for the five editable concept pages.
// Locations and rates reuse src/content. No users, credentials, or new bank facts.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "src/content");
const outPath = path.join(root, "seed/seed.json");
const PLACE = "[Placeholder]";

function mark(value) {
  if (typeof value !== "string" || !value.trim() || value.startsWith(PLACE)) return value ?? "";
  return `${PLACE} ${value}`;
}

function markRate(value) {
  const text = value == null ? "" : String(value);
  if (!text.includes("%") || text.includes(PLACE)) return text;
  return `${PLACE} ${text}`;
}

function labels(items) {
  return (items ?? []).filter(Boolean).map((label) => ({ label: String(label) }));
}

function hours(rows) {
  return (rows ?? []).map((row) => ({
    days: row.days ?? "",
    open: row.open ?? "",
    close: row.close ?? "",
    open24: row.open24 ?? "",
    close24: row.close24 ?? "",
  }));
}

const stringField = (slug, label, extra = {}) => ({ slug, label, type: "string", ...extra });
const textField = (slug, label) => ({ slug, label, type: "text" });

const labelRepeater = (slug, label) => ({
  slug,
  label,
  type: "repeater",
  validation: {
    subFields: [{ slug: "label", label: "Label", type: "string", required: true }],
  },
});

const hoursRepeater = (slug, label) => ({
  slug,
  label,
  type: "repeater",
  validation: {
    subFields: [
      { slug: "days", label: "Days", type: "string", required: true },
      { slug: "open", label: "Opens", type: "string", required: true },
      { slug: "close", label: "Closes", type: "string", required: true },
      { slug: "open24", label: "Opens (24-hour)", type: "string" },
      { slug: "close24", label: "Closes (24-hour)", type: "string" },
    ],
  },
});

const collections = [
  {
    slug: "pages",
    label: "Pages",
    labelSingular: "Page",
    description: "Home, About, Contact, Locations, and Rates page copy",
    icon: "file-text",
    supports: ["drafts", "revisions", "search"],
    routable: false,
    titleField: "title",
    sortOrder: 1,
    fields: [
      stringField("title", "Title", { required: true, searchable: true }),
      stringField("headline", "Headline", { searchable: true }),
      textField("summary", "Summary"),
      textField("body", "Body"),
      stringField("phone", "Phone"),
      stringField("hero_tagline", "Hero tagline"),
      stringField("hero_headline", "Hero headline"),
      stringField("hero_headline_accent", "Hero headline accent"),
      textField("hero_subtext", "Hero subtext"),
      stringField("hero_primary_cta", "Hero primary button"),
      stringField("hero_secondary_cta", "Hero secondary button"),
      { slug: "hero_image", label: "Hero image", type: "image" },
      stringField("story_headline", "Story headline"),
      stringField("story_headline_accent", "Story headline accent"),
      textField("story_body_1", "Story paragraph 1"),
      textField("story_body_2", "Story paragraph 2"),
      stringField("story_stat_1_number", "Stat 1 number"),
      stringField("story_stat_1_label", "Stat 1 label"),
      stringField("story_stat_2_number", "Stat 2 number"),
      stringField("story_stat_2_label", "Stat 2 label"),
      stringField("story_stat_3_number", "Stat 3 number"),
      stringField("story_stat_3_label", "Stat 3 label"),
      stringField("cta_headline", "CTA headline"),
      stringField("cta_headline_accent", "CTA headline accent"),
      textField("cta_subtext", "CTA subtext"),
      stringField("cta_primary_button", "CTA button"),
      stringField("cta_phone", "CTA phone"),
      stringField("features_headline", "Features headline"),
    ],
  },
  {
    slug: "locations",
    label: "Locations",
    labelSingular: "Location",
    description: "Banking center records shown on the locations page",
    icon: "map-pin",
    supports: ["drafts", "revisions", "search"],
    urlPattern: "/locations/{slug}",
    routable: true,
    titleField: "title",
    sortOrder: 2,
    admin: { listColumns: ["name", "city"] },
    fields: [
      stringField("title", "Title", { required: true }),
      stringField("name", "Name", { required: true, searchable: true }),
      stringField("region", "Region", { required: true }),
      stringField("street", "Street", { required: true }),
      stringField("suite", "Suite"),
      stringField("city", "City", { required: true }),
      stringField("state", "State", { defaultValue: "TX" }),
      stringField("zip", "ZIP", { required: true }),
      stringField("phone", "Phone", { required: true }),
      { slug: "has_atm", label: "Has ATM", type: "boolean", defaultValue: true },
      { slug: "has_drive_thru", label: "Has drive-thru", type: "boolean", defaultValue: true },
      labelRepeater("atm_types", "ATM types"),
      labelRepeater("services", "Services"),
      labelRepeater("languages", "Languages"),
      { slug: "lat", label: "Latitude", type: "number", required: true },
      { slug: "lng", label: "Longitude", type: "number", required: true },
      { slug: "photo", label: "Photo", type: "image" },
      hoursRepeater("lobby_hours", "Lobby hours"),
      hoursRepeater("drive_hours", "Drive-thru hours"),
      textField("notes", "Notes"),
    ],
  },
  {
    slug: "rates",
    label: "Rates",
    labelSingular: "Rate sheet",
    description: "Placeholder deposit rates. Not current offers.",
    icon: "chart-line",
    supports: ["drafts", "revisions", "search"],
    routable: false,
    titleField: "title",
    sortOrder: 3,
    fields: [
      stringField("title", "Title", { required: true }),
      stringField("published", "Published note"),
      textField("disclaimer", "Disclaimer"),
      { slug: "full_rates_url", label: "Full rates URL", type: "url" },
      textField("sections_footnote", "Footnote"),
      {
        slug: "items",
        label: "Featured rates",
        type: "repeater",
        validation: {
          subFields: [
            { slug: "name", label: "Name", type: "string", required: true },
            { slug: "detail", label: "Detail", type: "string" },
            { slug: "value", label: "Rate", type: "string", required: true },
          ],
        },
      },
      {
        slug: "sections",
        label: "Rate tables",
        type: "repeater",
        validation: {
          subFields: [
            { slug: "id", label: "Section id", type: "string", required: true },
            { slug: "title", label: "Title", type: "string", required: true },
            { slug: "note", label: "Note", type: "text" },
            { slug: "columns", label: "Columns (comma-separated)", type: "string", required: true },
            { slug: "rows", label: "Rows (one per line, cells separated by |)", type: "text", required: true },
          ],
        },
      },
    ],
  },
];

const homeYaml = parse(readFileSync(path.join(contentDir, "pages/home.yaml"), "utf8"));
const homeKeys = [
  "hero_tagline",
  "hero_headline",
  "hero_headline_accent",
  "hero_subtext",
  "hero_primary_cta",
  "hero_secondary_cta",
  "story_headline",
  "story_headline_accent",
  "story_body_1",
  "story_body_2",
  "story_stat_1_number",
  "story_stat_1_label",
  "story_stat_2_number",
  "story_stat_2_label",
  "story_stat_3_number",
  "story_stat_3_label",
  "cta_headline",
  "cta_headline_accent",
  "cta_subtext",
  "cta_primary_button",
  "cta_phone",
  "features_headline",
];
const home = { title: mark("Home"), headline: mark("Home") };
for (const key of homeKeys) {
  if (homeYaml[key] != null && homeYaml[key] !== "") home[key] = mark(String(homeYaml[key]));
}
home.hero_primary_cta = "Explore checking";

const pages = [
  { id: "home", status: "published", data: home },
  {
    id: "about",
    status: "published",
    data: {
      title: mark("About"),
      headline: mark("About"),
      summary: mark("Editable concept copy. This page does not add people, history, or regulatory claims."),
      body: [mark(String(homeYaml.story_body_1)), mark(String(homeYaml.story_body_2))].join("\n\n"),
    },
  },
  {
    id: "contact",
    status: "published",
    data: {
      title: mark("Contact"),
      headline: mark("Contact"),
      summary: mark("This concept page does not collect personal or banking information."),
      phone: "800.467.7216",
      body: mark("Branch addresses and hours are on the locations page. The phone number already published on this concept site is listed below. There is no message form, application, or online banking here."),
    },
  },
  {
    id: "locations",
    status: "published",
    data: {
      title: mark("Locations"),
      headline: mark("Texas Gulf Bank Locations"),
      summary: mark("Banking centers already listed on this concept site. Addresses, hours, and phone numbers are unverified placeholders until confirmed."),
    },
  },
  {
    id: "rates",
    status: "published",
    data: {
      title: mark("Rates"),
      headline: mark("Rates & Fees"),
      summary: mark("Every figure on this page is a placeholder, not a current offer."),
    },
  },
];

const locations = readdirSync(path.join(contentDir, "locations"))
  .filter((file) => file.endsWith(".yaml"))
  .sort()
  .map((file) => {
    const slug = path.basename(file, ".yaml");
    const data = parse(readFileSync(path.join(contentDir, "locations", file), "utf8"));
    return {
      id: `loc-${slug}`,
      slug,
      status: "published",
      data: {
        title: data.title ?? "",
        name: data.name ?? "",
        region: data.region ?? "",
        street: data.street ?? "",
        suite: data.suite ?? "",
        city: data.city ?? "",
        state: data.state ?? "TX",
        zip: data.zip == null ? "" : String(data.zip),
        phone: data.phone == null ? "" : String(data.phone),
        has_atm: data.has_atm !== false,
        has_drive_thru: data.has_drive_thru !== false,
        atm_types: labels(data.atm_types),
        services: labels(data.services),
        languages: labels(data.languages),
        lat: data.lat,
        lng: data.lng,
        lobby_hours: hours(data.hours?.lobby),
        drive_hours: hours(data.hours?.drive_thru),
        notes: data.notes ?? "",
      },
    };
  });

const ratesYaml = parse(readFileSync(path.join(contentDir, "data/rates.yaml"), "utf8"));
const rates = [
  {
    id: "rates",
    status: "published",
    data: {
      title: mark(ratesYaml.title || "Featured Rates"),
      published: ratesYaml.published ?? "",
      disclaimer: mark(ratesYaml.disclaimer || "Rates may change."),
      full_rates_url: ratesYaml.full_rates_url ?? "",
      sections_footnote: ratesYaml.sections_footnote ? mark(String(ratesYaml.sections_footnote)) : "",
      items: (ratesYaml.items ?? []).map((item) => ({
        name: item.name ?? "",
        detail: item.detail ?? "",
        value: markRate(item.value),
      })),
      sections: (ratesYaml.sections ?? []).map((section) => ({
        id: section.id ?? "",
        title: section.title ?? "",
        note: section.note ?? "",
        columns: (section.columns ?? []).join(", "),
        rows: (section.rows ?? []).map((row) => row.map((cell) => markRate(cell)).join(" | ")).join("\n"),
      })),
    },
  },
];

const seed = {
  $schema: "https://emdashcms.com/seed.schema.json",
  version: "1",
  defaultLocale: "en",
  meta: {
    name: "Texas Gulf Bank concept",
    description: "Placeholder content for the concept site. Not the official Texas Gulf Bank website.",
    author: "Texas Gulf Bank concept site",
  },
  settings: {
    title: `${PLACE} Texas Gulf Bank`,
    tagline: `${PLACE} Concept site, not the official Texas Gulf Bank website.`,
  },
  collections,
  content: { pages, locations, rates },
};

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Wrote ${outPath}`);
console.log(`pages ${pages.length}, locations ${locations.length}, rates ${rates.length}`);
