import type { Metadata } from "next";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/constants";
import { ContactForm } from "@/components/ContactForm";
import { SectionDivider } from "@/components/SectionDivider";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { Localized } from "@/components/Localized";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    title: dict.contact.title,
    description:
      locale === "sk"
        ? "Napíšte nám e-mailom, cez WhatsApp alebo formulár nižšie."
        : "Write to us by email, WhatsApp, or the form below.",
  };
}

export default function ContactPage() {
  return <Localized>{(locale) => <ContactPageContent locale={locale} />}</Localized>;
}

function ContactPageContent({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-serif text-24 sm:text-32">{dict.contact.title}</h1>
      </div>

      <SectionDivider />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-2 text-15">
          <p>
            {dict.contact.emailLabel}:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-[3px]">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            {dict.contact.whatsappLabel}:{" "}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-[3px]"
            >
              +{WHATSAPP_NUMBER}
            </a>
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
