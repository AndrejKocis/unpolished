import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/journal";
import { formatDate } from "@/lib/format";
import { Prose } from "@/components/Prose";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const locale = await getLocale();

  return (
    <article>
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-4">
          {formatDate(article.date, locale)}
        </p>
        <h1 className="font-serif text-24 sm:text-32">{article.title}</h1>
      </div>

      <SectionDivider />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
        <Prose content={article.content} />
      </div>
    </article>
  );
}
