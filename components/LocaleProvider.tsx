"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

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
