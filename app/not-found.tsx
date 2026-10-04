import { Button } from "@/components/ui/Button";
import { Localized } from "@/components/Localized";
import { dictionaries } from "@/lib/i18n/dictionaries";

export default function NotFound() {
  return (
    <Localized>
      {(locale) => {
        const dict = dictionaries[locale].notFound;
        return (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-24 flex flex-col items-start gap-4">
            <p className="font-mono text-11 uppercase tracking-[0.06em] text-ink-muted">404</p>
            <h1 className="font-serif text-32">{dict.title}</h1>
            <p className="text-15 text-ink-muted">{dict.text}</p>
            <Button href="/watches" className="mt-2">
              {dict.cta}
            </Button>
          </div>
        );
      }}
    </Localized>
  );
}
