/** Skin package for PetDeck M2 */

export type SkinKind = "css" | "image" | "vector" | "sprite";

export type CssThemeId = "ember" | "mint" | "pixel-blob" | "ghost";

/** Per-state frame sequence for sprite characters (Phase 2 imports). */
export interface SpriteFrame {
  src: string;
  /** ms to show this frame (optional; falls back to manifest fps) */
  duration?: number;
}
export interface SpriteManifest {
  /** frames per agent state; missing states fall back to "idle" */
  states: Partial<Record<string, { frames: SpriteFrame[]; fps?: number; loop?: boolean }>>;
}

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
  /** vector character id when kind === vector */
  vectorId?: string;
  /** sprite manifest when kind === sprite (Phase 2) */
  manifest?: SpriteManifest;
  createdAt?: string;
}

export interface PixelizeOptions {
  /** output width in pixels (height keeps aspect) */
  size: number;
  /** max colors in palette (approx) */
  colors: number;
}
