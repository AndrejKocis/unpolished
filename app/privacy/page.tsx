import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/constants";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: dictionaries[locale].privacy.title };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.privacy.title}</h1>
      </div>

      <SectionDivider />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6 text-15 leading-relaxed text-ink-muted">
        {dict.privacy.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          {dict.privacy.deletePrefix}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-[3px]">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
