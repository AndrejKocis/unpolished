import Link from "next/link";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_NAME } from "@/lib/constants";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function Footer({ locale, showArchive }: { locale: Locale; showArchive: boolean }) {
  const dict = dictionaries[locale];
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: dict.footer.shop,
      links: [
        { href: "/watches", label: dict.footer.watches },
        // Archív ukáž až po prvom predanom kuse.
        ...(showArchive ? [{ href: "/archive", label: dict.footer.archive }] : []),
      ],
    },
    {
      heading: dict.footer.info,
      links: [
        { href: "/about", label: dict.footer.about },
        { href: "/faq", label: dict.footer.faq },
        { href: "/contact", label: dict.footer.contact },
      ],
    },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {columns.map((column) => (
          <div key={column.heading}>
            <h2 className="text-11 uppercase tracking-[0.06em] text-ink-muted font-mono mb-4">
              {column.heading}
            </h2>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-15 hover:opacity-70 transition-opacity duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-11 uppercase tracking-[0.06em] text-ink-muted font-mono">
          <span>
            © {year} {SITE_NAME}
          </span>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity duration-150"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
            </svg>
            {INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </footer>
  );
}
