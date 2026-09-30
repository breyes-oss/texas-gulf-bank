#!/usr/bin/env node
// Generate EmDash seed.json from TGB's existing flat-file content.
// Preserves blog markdown bodies verbatim and nested YAML structures as JSON.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.resolve(__dirname, "../src/content");
const OUT = path.resolve(__dirname, "../seed/seed.json");

const loadYaml = (p) => yaml.load(fs.readFileSync(p, "utf8"));

function readBlog(p) {
  const txt = fs.readFileSync(p, "utf8");
  const m = /^---\n(.*?)\n---\n(.*)$/s.exec(txt);
  return [yaml.load(m[1]), m[2]];
}

const collections = [
  {
    slug: "blog", label: "Blog Posts", labelSingular: "Blog Post",
    description: "News and updates from Texas Gulf Bank", icon: "newspaper",
    supports: ["drafts", "revisions", "scheduling", "search", "seo"],
    urlPattern: "/blog/{slug}", routable: true, titleField: "title",
    admin: { listColumns: ["date", "category"] },
    fields: [
      { slug: "title", label: "Title", type: "string", required: true, searchable: true },
      { slug: "date", label: "Publish Date", type: "string", required: true, indexed: true },
      { slug: "image", label: "Featured Image", type: "string" },
      { slug: "category", label: "Category", type: "select", required: true, options: ["Business", "Community", "Security", "Personal"] },
      { slug: "excerpt", label: "Excerpt", type: "text", searchable: true },
      { slug: "show_cta", label: "Show end-of-article CTA", type: "boolean", defaultValue: true },
      { slug: "cta", label: "End-of-article CTA", type: "json" },
      { slug: "body", label: "Body (Markdown)", type: "text", required: true },
    ],
  },
  {
    slug: "locations", label: "Locations", labelSingular: "Location",
    description: "Banking centers and branches", icon: "map-pin",
    supports: ["drafts", "revisions", "search", "seo"],
    urlPattern: "/locations/{slug}", routable: true, titleField: "title",
    admin: { listColumns: ["name", "city"] },
    fields: [
      { slug: "title", label: "Title", type: "string", required: true },
      { slug: "name", label: "Name", type: "string", required: true },
      { slug: "region", label: "Region", type: "string", required: true },
      { slug: "street", label: "Street", type: "string", required: true },
      { slug: "suite", label: "Suite", type: "string" },
      { slug: "city", label: "City", type: "string", required: true },
      { slug: "state", label: "State", type: "string", defaultValue: "TX" },
      { slug: "zip", label: "ZIP", type: "string", required: true },
      { slug: "phone", label: "Phone", type: "string", required: true },
      { slug: "has_atm", label: "Has ATM", type: "boolean", defaultValue: true },
      { slug: "has_drive_thru", label: "Has Drive-Thru", type: "boolean", defaultValue: true },
      { slug: "atm_types", label: "ATM Types", type: "json" },
      { slug: "services", label: "Services", type: "json" },
      { slug: "languages", label: "Languages", type: "json" },
      { slug: "lat", label: "Latitude", type: "number", required: true },
      { slug: "lng", label: "Longitude", type: "number", required: true },
      { slug: "photo", label: "Photo", type: "string" },
      { slug: "hours", label: "Hours", type: "json" },
      { slug: "notes", label: "Notes", type: "text" },
    ],
  },
  {
    slug: "products", label: "Products", labelSingular: "Product Page",
    description: "Product comparison pages", icon: "cards",
    supports: ["drafts", "revisions", "search", "seo"], routable: false, titleField: "title",
    fields: [
      { slug: "title", label: "Title", type: "string", required: true },
      { slug: "published", label: "Published Note", type: "string" },
      { slug: "products", label: "Products", type: "json", required: true },
      { slug: "compare_rows", label: "Compare Rows", type: "json" },
      { slug: "disclaimer_short", label: "Short Disclaimer", type: "text" },
      { slug: "secondary", label: "Secondary Products", type: "json" },
    ],
  },
  {
    slug: "pages", label: "Pages", labelSingular: "Page",
    description: "Page content blocks", icon: "file-text",
    supports: ["drafts", "revisions", "search", "seo"], routable: false, titleField: "title",
    fields: [
      { slug: "title", label: "Title", type: "string", required: true },
      { slug: "hero_tagline", label: "Hero Tagline", type: "string" },
      { slug: "hero_headline", label: "Hero Headline", type: "string" },
      { slug: "hero_headline_accent", label: "Hero Headline Accent", type: "string" },
      { slug: "hero_subtext", label: "Hero Subtext", type: "text" },
      { slug: "hero_primary_cta", label: "Hero Primary CTA", type: "string" },
      { slug: "hero_secondary_cta", label: "Hero Secondary CTA", type: "string" },
      { slug: "story_headline", label: "Story Headline", type: "string" },
      { slug: "story_headline_accent", label: "Story Headline Accent", type: "string" },
      { slug: "story_body_1", label: "Story Body 1", type: "text" },
      { slug: "story_body_2", label: "Story Body 2", type: "text" },
      { slug: "story_stat_1_number", label: "Stat 1 Number", type: "string" },
      { slug: "story_stat_1_label", label: "Stat 1 Label", type: "string" },
      { slug: "story_stat_2_number", label: "Stat 2 Number", type: "string" },
      { slug: "story_stat_2_label", label: "Stat 2 Label", type: "string" },
      { slug: "story_stat_3_number", label: "Stat 3 Number", type: "string" },
      { slug: "story_stat_3_label", label: "Stat 3 Label", type: "string" },
      { slug: "cta_headline", label: "CTA Headline", type: "string" },
      { slug: "cta_headline_accent", label: "CTA Headline Accent", type: "string" },
      { slug: "cta_subtext", label: "CTA Subtext", type: "text" },
      { slug: "cta_primary_button", label: "CTA Primary Button", type: "string" },
      { slug: "cta_phone", label: "CTA Phone", type: "string" },
      { slug: "features_headline", label: "Features Headline", type: "string" },
    ],
  },
  {
    slug: "data", label: "Rate Data", labelSingular: "Rate Sheet",
    description: "Featured rates and rate tables", icon: "chart-line",
    supports: ["drafts", "revisions", "search"], routable: false, titleField: "title",
    fields: [
      { slug: "title", label: "Title", type: "string", required: true },
      { slug: "published", label: "Published Note", type: "string" },
      { slug: "disclaimer", label: "Disclaimer", type: "text" },
      { slug: "full_rates_url", label: "Full Rates URL", type: "url" },
      { slug: "items", label: "Featured Items", type: "json", required: true },
      { slug: "sections", label: "Rate Sections", type: "json" },
      { slug: "sections_footnote", label: "Sections Footnote", type: "text" },
    ],
  },
  {
    slug: "fees", label: "Fee Schedules", labelSingular: "Fee Schedule",
    description: "Fee schedule pages", icon: "receipt",
    supports: ["drafts", "revisions", "search"], routable: false, titleField: "title",
    fields: [
      { slug: "title", label: "Title", type: "string", required: true },
      { slug: "published", label: "Published Note", type: "string" },
      { slug: "disclaimer", label: "Disclaimer", type: "text" },
      { slug: "full_schedule_url", label: "Full Schedule URL", type: "url" },
      { slug: "sections", label: "Fee Sections", type: "json", required: true },
    ],
  },
];

const content = {};

// Blog
content.blog = [];
for (const p of fs.readdirSync(path.join(BASE, "blog")).filter((f) => f.endsWith(".md")).sort()) {
  const [fm, body] = readBlog(path.join(BASE, "blog", p));
  const slug = path.basename(p, ".md");
  content.blog.push({
    id: `blog-${slug}`, slug, status: "published",
    data: {
      title: fm.title ?? "", date: fm.date ?? "", image: fm.image ?? null,
      category: fm.category ?? "Business", excerpt: fm.excerpt ?? null,
      show_cta: fm.showCta ?? true, cta: fm.cta ?? {}, body,
    },
  });
}

// Locations
content.locations = [];
for (const p of fs.readdirSync(path.join(BASE, "locations")).filter((f) => f.endsWith(".yaml")).sort()) {
  const d = loadYaml(path.join(BASE, "locations", p));
  const slug = path.basename(p, ".yaml");
  const keys = ["title","name","region","street","suite","city","state","zip","phone","has_atm","has_drive_thru","atm_types","services","languages","lat","lng","photo","hours","notes"];
  const data = {};
  for (const k of keys) data[k] = d[k] ?? null;
  content.locations.push({ id: `loc-${slug}`, slug, status: "published", data });
}

// Products
content.products = [];
for (const p of fs.readdirSync(path.join(BASE, "products")).filter((f) => f.endsWith(".yaml")).sort()) {
  const d = loadYaml(path.join(BASE, "products", p));
  const slug = path.basename(p, ".yaml");
  const keys = ["title","published","products","compare_rows","disclaimer_short","secondary"];
  const data = {};
  for (const k of keys) data[k] = d[k] ?? null;
  content.products.push({ id: `prod-${slug}`, slug, status: "published", data });
}

// Pages
content.pages = [];
for (const p of fs.readdirSync(path.join(BASE, "pages")).filter((f) => f.endsWith(".yaml")).sort()) {
  const d = loadYaml(path.join(BASE, "pages", p));
  const slug = path.basename(p, ".yaml");
  const keys = ["title","hero_tagline","hero_headline","hero_headline_accent","hero_subtext","hero_primary_cta","hero_secondary_cta","story_headline","story_headline_accent","story_body_1","story_body_2","story_stat_1_number","story_stat_1_label","story_stat_2_number","story_stat_2_label","story_stat_3_number","story_stat_3_label","cta_headline","cta_headline_accent","cta_subtext","cta_primary_button","cta_phone","features_headline"];
  const data = {};
  for (const k of keys) data[k] = d[k] ?? null;
  content.pages.push({ id: `page-${slug}`, slug, status: "published", data });
}

// Data (rates)
content.data = [];
for (const p of fs.readdirSync(path.join(BASE, "data")).filter((f) => f.endsWith(".yaml")).sort()) {
  const d = loadYaml(path.join(BASE, "data", p));
  const slug = path.basename(p, ".yaml");
  const keys = ["title","published","disclaimer","full_rates_url","items","sections","sections_footnote"];
  const data = {};
  for (const k of keys) data[k] = d[k] ?? null;
  content.data.push({ id: `data-${slug}`, slug, status: "published", data });
}

// Fees
content.fees = [];
for (const p of fs.readdirSync(path.join(BASE, "fees")).filter((f) => f.endsWith(".yaml")).sort()) {
  const d = loadYaml(path.join(BASE, "fees", p));
  const slug = path.basename(p, ".yaml");
  const keys = ["title","published","disclaimer","full_schedule_url","sections"];
  const data = {};
  for (const k of keys) data[k] = d[k] ?? null;
  content.fees.push({ id: `fee-${slug}`, slug, status: "published", data });
}

const seed = {
  $schema: "https://emdashcms.com/seed.schema.json",
  version: "1",
  defaultLocale: "en",
  meta: { name: "Texas Gulf Bank", description: "Texas Gulf Bank website content", author: "Texas Gulf Bank" },
  settings: { title: "Texas Gulf Bank", tagline: "Community banking on the Texas Gulf Coast" },
  collections,
  content,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(seed, null, 2));

console.log("Seed written to", OUT);
console.log("Collections:", collections.map((c) => c.slug).join(", "));
for (const [k, v] of Object.entries(content)) console.log(`  ${k}: ${v.length} entries`);
