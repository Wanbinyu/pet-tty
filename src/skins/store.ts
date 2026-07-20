import { BUILTIN_SKINS, DEFAULT_SKIN_ID } from "./presets";
import type { SkinMeta } from "./types";

const CUSTOM_KEY = "petdeck.skins.custom.v1";
const ACTIVE_KEY = "petdeck.skins.active";

export function listCustomSkins(): SkinMeta[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SkinMeta[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveCustomSkins(skins: SkinMeta[]) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(skins));
  } catch (e) {
    console.warn("Failed to save skins (quota?)", e);
    throw e;
  }
}

export function listAllSkins(): SkinMeta[] {
  return [...BUILTIN_SKINS, ...listCustomSkins()];
}

export function getSkin(id: string): SkinMeta | undefined {
  return listAllSkins().find((s) => s.id === id);
}

export function getActiveSkinId(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) || DEFAULT_SKIN_ID;
  } catch {
    return DEFAULT_SKIN_ID;
  }
}

export function setActiveSkinId(id: string) {
  const skin = getSkin(id);
  if (!skin) return getActiveSkinId();
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

export function getActiveSkin(): SkinMeta {
  return getSkin(getActiveSkinId()) ?? BUILTIN_SKINS[0];
}

export function addCustomSkin(skin: SkinMeta): SkinMeta {
  const customs = listCustomSkins().filter((s) => s.id !== skin.id);
  customs.unshift(skin);
  // keep last 20 customs to avoid quota blow-up
  saveCustomSkins(customs.slice(0, 20));
  return skin;
}

export function removeCustomSkin(id: string) {
  const customs = listCustomSkins().filter((s) => s.id !== id);
  saveCustomSkins(customs);
  if (getActiveSkinId() === id) {
    setActiveSkinId(DEFAULT_SKIN_ID);
  }
}

export function makeCustomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}
