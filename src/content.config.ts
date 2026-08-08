import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogCtaSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    primaryLabel: z.string().optional(),
    primaryHref: z.string().optional(),
    secondaryLabel: z.string().optional(),
    secondaryHref: z.string().optional(),
  })
  .optional();

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    image: z.string().optional(),
    category: z.enum(["Business", "Community", "Security", "Personal"]),
    excerpt: z.string().optional(),
    // Optional end-of-article CTA. Editors can turn off with showCta: false.
    showCta: z.boolean().optional().default(true),
    cta: blogCtaSchema,
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    hero_tagline: z.string().optional(),
    hero_headline: z.string().optional(),
    hero_headline_accent: z.string().optional(),
    hero_subtext: z.string().optional(),
    hero_primary_cta: z.string().optional(),
    hero_secondary_cta: z.string().optional(),
    story_headline: z.string().optional(),
    story_headline_accent: z.string().optional(),
    story_body_1: z.string().optional(),
    story_body_2: z.string().optional(),
    story_stat_1_number: z.string().optional(),
    story_stat_1_label: z.string().optional(),
    story_stat_2_number: z.string().optional(),
    story_stat_2_label: z.string().optional(),
    story_stat_3_number: z.string().optional(),
    story_stat_3_label: z.string().optional(),
    cta_headline: z.string().optional(),
    cta_headline_accent: z.string().optional(),
    cta_subtext: z.string().optional(),
    cta_primary_button: z.string().optional(),
    cta_phone: z.string().optional(),
    features_headline: z.string().optional(),
  }),
});

const data = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/data" }),
  schema: z.object({
    title: z.string(),
    published: z.string().optional(),
    disclaimer: z.string().optional(),
    full_rates_url: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          detail: z.string().optional(),
          value: z.string(),
        })
      )
      .min(1),
  }),
});

const fees = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/fees" }),
  schema: z.object({
    title: z.string(),
    published: z.string().optional(),
    disclaimer: z.string().optional(),
    full_schedule_url: z.string().optional(),
    sections: z
      .array(
        z.object({
          name: z.string(),
          note: z.string().optional(),
          items: z
            .array(
              z.object({
                name: z.string(),
                detail: z.string().optional(),
                value: z.string(),
              })
            )
            .min(1),
        })
      )
      .min(1),
  }),
});

const hoursRow = z.object({
  days: z.string(),
  open: z.string(),
  close: z.string(),
  open24: z.string().optional(),
  close24: z.string().optional(),
});

const locations = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/locations" }),
  schema: z.object({
    title: z.string(),
    name: z.string(),
    region: z.string(),
    street: z.string(),
    suite: z.string().optional(),
    city: z.string(),
    state: z.string().default("TX"),
    zip: z.string(),
    phone: z.string(),
    has_atm: z.boolean().default(true),
    has_drive_thru: z.boolean().default(true),
    atm_types: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    lat: z.number(),
    lng: z.number(),
    photo: z.string().optional(),
    hours: z
      .object({
        lobby: z.array(hoursRow).default([]),
        drive_thru: z.array(hoursRow).default([]),
      })
      .default({ lobby: [], drive_thru: [] }),
    notes: z.string().optional(),
  }),
});

export const collections = { blog, pages, data, fees, locations };
