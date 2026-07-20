/** An original vector (SVG + CSS) character. No external art assets.
 *  Animations are driven by `#pet[data-vector="<id>"].pet--<state>` in
 *  styles.css, hooked via the class names on SVG groups (`vc-<char>-<part>`). */
export interface VectorCharacter {
  id: string;
  nameEn: string;
  nameZh: string;
  /** emoji used in the skin-picker preview */
  emoji: string;
  /** SVG markup, viewBox 0 0 100 100. */
  svg: string;
}
