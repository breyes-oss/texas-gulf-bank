import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    image: z.string().optional(),
    category: z.enum(["Business", "Community", "Security", "Personal"]),
    excerpt: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    hero_headline: z.string().optional(),
    hero_subtext: z.string().optional(),
    features_headline: z.string().optional(),
  }),
});

export const collections = { blog, pages };
