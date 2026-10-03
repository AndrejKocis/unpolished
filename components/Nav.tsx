import Link from "next/link";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { MobileMenu } from "@/components/MobileMenu";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

export function Nav({ locale }: { locale: Locale }) {
  const dict = dictionaries[locale];

  const navLinks = [
    { href: "/watches", label: dict.nav.watches },
    { href: "/about", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-line">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={dict.nav.home}>
          <Logo className="text-[14px] sm:text-[16px]" />
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-15 hover:opacity-70 transition-opacity duration-150"
            >
              {link.label}
            </Link>
          ))}
          <span className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-line">/</span>
            <LanguageToggle />
          </span>
        </nav>

        <MobileMenu locale={locale} />
      </div>
    </header>
  );
}
