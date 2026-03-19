"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Locale, translations, LOCALES, T } from "./translations";

interface I18nCtx {
  locale:    Locale;
  t:         (key: keyof T) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nCtx>({
  locale:    "de",
  t:         (k) => String(k),
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("de");

  useEffect(() => {
    const saved = localStorage.getItem("eucx_locale") as Locale | null;
    if (saved && LOCALES.find((l) => l.code === saved)) {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("eucx_locale", l);
  }

  function t(key: keyof T): string {
    const dict = translations[locale];
    const val  = dict[key];
    if (val !== undefined) return String(val);
    return String(translations["de"][key] ?? key);
  }

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
