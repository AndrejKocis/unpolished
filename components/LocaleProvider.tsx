"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";
import { readLocaleCookie, type Locale } from "@/lib/i18n/locale";
import { IS_STATIC_EXPORT } from "@/lib/constants";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [current, setCurrent] = useState<Locale>(locale);

  useEffect(() => {
    if (!IS_STATIC_EXPORT) return;
    // Statická stránka je predrenderovaná v predvolenom jazyku — jazyk z cookie
    // uplatníme po hydratácii a odkryjeme stránku skrytú skriptom v <head>.
    setCurrent(readLocaleCookie(document.cookie));
    document.documentElement.removeAttribute("data-locale-pending");
  }, []);

  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);

  function setLocale(next: Locale) {
    setCurrent(next);
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
  }

  return (
    <LocaleContext.Provider value={{ locale: current, dict: dictionaries[current], setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function LocaleSwitch(versions: Record<Locale, ReactNode>) {
  const { locale } = useLocale();
  return versions[locale];
}
