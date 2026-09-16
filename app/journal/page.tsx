import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/journal";
import { formatDate } from "@/lib/format";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: dictionaries[locale].journal.title,
    description:
      locale === "sk"
        ? "Články o vintage hodinkách, materiáloch a overovaní pravosti."
        : "Articles on vintage watches, materials and authentication (Slovak only for now).",
  };
}

export default async function JournalPage() {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  const articles = getAllArticles();

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.journal.title}</h1>
      </div>

      <SectionDivider />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 flex flex-col">
        {articles.map((article, i) => (
          <div key={article.slug}>
            {i > 0 && <div className="h-px bg-line" />}
            <Link href={`/journal/${article.slug}`} className="block py-8">
              <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted mb-2">
                {formatDate(article.date, locale)}
              </p>
              <h2 className="font-serif text-18 mb-2">{article.title}</h2>
              <p className="text-15 text-ink-muted">{article.excerpt}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
