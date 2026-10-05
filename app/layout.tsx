import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getSoldWatches } from "@/lib/watches";
import { LocaleProvider } from "@/components/LocaleProvider";
import { Localized } from "@/components/Localized";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { IS_STATIC_EXPORT, SITE_URL } from "@/lib/constants";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

// Statický export je predrenderovaný v predvolenom jazyku (čeština); pri inej jazykovej cookie skry stránku,
// kým LocaleProvider po hydratácii neprepne jazyk (poistka 3 s, ak by JS zlyhal).
const LOCALE_INIT_SCRIPT = `
(function () {
  try {
    if (/(?:^|;\\s*)locale=(sk|en)(?:;|$)/.test(document.cookie)) {
      var root = document.documentElement;
      root.setAttribute('data-locale-pending', '');
      setTimeout(function () { root.removeAttribute('data-locale-pending'); }, 3000);
    }
  } catch (e) {}
})();
`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = dictionaries[locale];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.siteTitle,
      template: `%s — unpolished`,
    },
    description: dict.meta.siteDescription,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const showArchive = getSoldWatches().length > 0;
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {IS_STATIC_EXPORT && <script dangerouslySetInnerHTML={{ __html: LOCALE_INIT_SCRIPT }} />}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <LocaleProvider locale={locale}>
          <Localized>{(l) => <Nav locale={l} />}</Localized>
          <main className="flex-1">{children}</main>
          <Localized>{(l) => <Footer locale={l} showArchive={showArchive} />}</Localized>
        </LocaleProvider>
      </body>
    </html>
  );
}
