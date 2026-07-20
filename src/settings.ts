import type { Locale } from "./i18n";

const KEY = "petdeck.settings.v1";

export interface PetSettings {
  locale: Locale | null;
  alwaysOnTop: boolean;
  showBubble: boolean;
  windowX: number | null;
  windowY: number | null;
  /** logical scale 1 | 1.25 | 1.5 */
  scale: number;
}

const defaults: PetSettings = {
  locale: null,
  alwaysOnTop: true,
  showBubble: true,
  windowX: null,
  windowY: null,
  scale: 1,
};

export function loadSettings(): PetSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(partial: Partial<PetSettings>) {
  const next = { ...loadSettings(), ...partial };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
