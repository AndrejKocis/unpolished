import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { articleFrontmatterSchema, type Article } from "@/lib/schema";

const JOURNAL_DIR = path.join(process.cwd(), "content", "journal");

export function getAllArticles(): Article[] {
  const files = fs.readdirSync(JOURNAL_DIR).filter((f) => f.endsWith(".mdx"));

  const articles = files.map((file) => {
    const raw = fs.readFileSync(path.join(JOURNAL_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const frontmatter = articleFrontmatterSchema.parse(data);
    return { ...frontmatter, content };
  });

  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}
