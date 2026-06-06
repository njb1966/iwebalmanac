import { defineCollection, z } from "astro:content";

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  author: z.string().optional(),
  editor: z.string().optional(),
  processNote: z.string().optional(),
  disclosure: z.string().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  coverImage: z.string().optional(),
});

const fiction = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    format: z
      .enum(["Short story", "Flash fiction", "Serial", "Excerpt", "Experimental"])
      .optional(),
  }),
});

const essays = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    topic: z.string().optional(),
  }),
});

const reviews = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    subject: z.string().optional(),
    subjectType: z
      .enum(["Novel", "Story collection", "Software", "Tool", "Platform", "Other"])
      .optional(),
    rating: z.string().optional(),
  }),
});

const interviews = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    guest: z.string().optional(),
    role: z.string().optional(),
  }),
});

const resources = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    resourceType: z
      .enum(["Guide", "Reference", "Template", "Case study", "Comparison"])
      .optional(),
  }),
});

export const collections = {
  fiction,
  essays,
  reviews,
  interviews,
  resources,
};
