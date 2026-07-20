/** Skin package for PetDeck M2 */

export type SkinKind = "css" | "image";

export type CssThemeId = "ember" | "mint" | "pixel-blob" | "ghost";

export interface SkinMeta {
  id: string;
  /** display name EN */
  nameEn: string;
  nameZh: string;
  kind: SkinKind;
  /** built-in vs user-imported */
  builtin: boolean;
  /** css theme key when kind === css */
  theme?: CssThemeId;
  /** data URL when kind === image */
  imageDataUrl?: string;
  /** render with nearest-neighbor */
  pixelated?: boolean;
  createdAt?: string;
}

export interface PixelizeOptions {
  /** output width in pixels (height keeps aspect) */
  size: number;
  /** max colors in palette (approx) */
  colors: number;
}
