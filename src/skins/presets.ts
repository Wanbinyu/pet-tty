import type { SkinMeta } from "./types";

/** Built-in skins (no external assets). */
export const BUILTIN_SKINS: SkinMeta[] = [
  {
    id: "ember",
    nameEn: "Ember Fox",
    nameZh: "焰狐",
    kind: "css",
    builtin: true,
    theme: "ember",
  },
  {
    id: "mint",
    nameEn: "Mint Bun",
    nameZh: "薄荷包",
    kind: "css",
    builtin: true,
    theme: "mint",
  },
  {
    id: "pixel-blob",
    nameEn: "Pixel Blob",
    nameZh: "像素团",
    kind: "css",
    builtin: true,
    theme: "pixel-blob",
  },
  {
    id: "ghost",
    nameEn: "Mono Ghost",
    nameZh: "幽灵",
    kind: "css",
    builtin: true,
    theme: "ghost",
  },
];

export const DEFAULT_SKIN_ID = "ember";
