import { z } from "zod";

export const watchStatusSchema = z.enum(["available", "reserved", "sold"]);
export type WatchStatus = z.infer<typeof watchStatusSchema>;

export const watchFrontmatterSchema = z.object({
  slug: z.string(),
  brand: z.string(),
  model: z.string(),
  reference: z.string(),
  year: z.number().int(),
  serialPrefix: z.string(),
  caliber: z.string(),
  caseSize: z.number(),
  caseMaterial: z.string(),
  dial: z.string(),
  casePolish: z.string(),
  set: z.string(),
  service: z.string(),
  warranty: z.string(),
  price: z.number(),
  currency: z.string(),
  status: watchStatusSchema,
  images: z.array(z.string()).min(1),
  // Voliteľné krátke slučkové video (napr. pre hover na karte v katalógu).
  video: z.string().optional(),
  // Rýchle stavové indikátory zobrazené v detaile ako zapnuté/vypnuté ikony.
  serviced: z.boolean().default(false),
  polished: z.boolean().default(false),
  keepsTime: z.boolean().default(false),
  missingParts: z.boolean().default(false),
});

export type WatchFrontmatter = z.infer<typeof watchFrontmatterSchema>;

export type Watch = WatchFrontmatter & {
  content: string;
};

export const articleFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  excerpt: z.string(),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export type Article = ArticleFrontmatter & {
  content: string;
};
