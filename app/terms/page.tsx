import type { Metadata } from "next";
import { CONTACT_EMAIL, VAT_INFO } from "@/lib/constants";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: dictionaries[locale].terms.title };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.terms.title}</h1>
      </div>

      <SectionDivider />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6 text-15 leading-relaxed text-ink-muted">
        {dict.terms.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>{VAT_INFO}</p>
        <p>
          {dict.terms.contactPrefix}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-[3px]">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
