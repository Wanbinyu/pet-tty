import { en, type Dict } from "./en";
import { zhCN } from "./zh-CN";

export type Locale = "en" | "zh-CN";

const STORAGE_KEY = "petdeck.locale";

const catalogs: Record<Locale, Dict> = {
  en,
  "zh-CN": zhCN,
};

let current: Locale = detectInitial();

function detectInitial(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "zh-CN") return saved;
  } catch {
    /* ignore */
  }
  const nav = navigator.language?.toLowerCase() ?? "en";
  if (nav.startsWith("zh")) return "zh-CN";
  return "en";
}

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale) {
  current = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
}

export function t(): Dict {
  return catalogs[current];
}

export function availableLocales(): { id: Locale; label: string }[] {
  return [
    { id: "zh-CN", label: catalogs["zh-CN"].ui.chinese },
    { id: "en", label: catalogs.en.ui.english },
  ];
}
