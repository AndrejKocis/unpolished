import type { Metadata } from "next";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    title: dict.about.title,
    description:
      locale === "sk"
        ? "Filozofia unpolished: prečo predávame iba neleštené vintage hodinky."
        : "The unpolished philosophy: why we only sell unpolished vintage watches.",
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.about.title}</h1>
      </div>

      <SectionDivider />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10 text-15 leading-relaxed">
        {dict.about.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-18 mb-3">{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className={i < section.paragraphs.length - 1 ? "mb-4" : ""}>
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
