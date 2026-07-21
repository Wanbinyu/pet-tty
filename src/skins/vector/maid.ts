import type { VectorCharacter } from "./types";

/** Original chibi maid mascot with an animated headdress, blinking eyes and
 *  arms that wave / cheer / work per agent state. Hand-written SVG, no external
 *  art - safe as a built-in default skin. */
export const maid: VectorCharacter = {
  id: "maid",
  nameEn: "Maid",
  nameZh: "女仆",
  emoji: "🎀",
  svg: `
<svg class="vc vc-maid" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="maid-dress" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#43496B"/>
      <stop offset="1" stop-color="#2B3050"/>
    </linearGradient>
    <linearGradient id="maid-hair" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#5A4870"/>
      <stop offset="1" stop-color="#3C2E50"/>
    </linearGradient>
  </defs>
  <ellipse class="vc-shadow" cx="50" cy="92" rx="24" ry="4.5" fill="#1E1720" opacity=".16"/>

  <g class="vc-maid-body">
    <path d="M36 56 Q50 52 64 56 L74 86 Q50 92 26 86 Z" fill="url(#maid-dress)" stroke="#222538" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M42 56 Q50 54 58 56 L62 84 Q50 87 38 84 Z" fill="#F6F6FB"/>
    <path d="M44 56 L43 72 M56 56 L57 72" stroke="#F6F6FB" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M38 84 q3 4 6 0 q3 4 6 0 q3 4 6 0 q3 4 6 0 q3 4 6 0" fill="none" stroke="#F6F6FB" stroke-width="3" stroke-linecap="round"/>
  </g>

  <g class="vc-maid-arms">
    <ellipse class="vc-maid-arm vc-maid-arm-l" cx="31" cy="70" rx="4.2" ry="9" fill="url(#maid-dress)" stroke="#222538" stroke-width="1.2"/>
    <ellipse class="vc-maid-arm vc-maid-arm-r" cx="69" cy="70" rx="4.2" ry="9" fill="url(#maid-dress)" stroke="#222538" stroke-width="1.2"/>
    <circle cx="31" cy="79" r="3.4" fill="#FDE4D4"/>
    <circle cx="69" cy="79" r="3.4" fill="#FDE4D4"/>
  </g>

  <rect x="46" y="50" width="8" height="7" fill="#FDE4D4"/>
  <g class="vc-maid-collar">
    <path d="M38 54 Q50 49 62 54 L60 58 Q50 55 40 58 Z" fill="#F6F6FB"/>
    <path d="M50 56 L44 53 L44 59 Z M50 56 L56 53 L56 59 Z" fill="#C45A5A" stroke="#8E3C3C" stroke-width="1"/>
    <circle cx="50" cy="56" r="1.6" fill="#8E3C3C"/>
  </g>

  <g class="vc-maid-head">
    <path d="M32 36 Q31 18 50 17 Q69 18 68 36 L66 46 Q60 30 50 28 Q40 30 34 46 Z" fill="url(#maid-hair)"/>
    <circle cx="50" cy="37" r="15.5" fill="#FDE4D4"/>
    <path class="vc-maid-hair-l" d="M34 34 Q31 50 38 54 L41 38 Z" fill="url(#maid-hair)"/>
    <path class="vc-maid-hair-r" d="M66 34 Q69 50 62 54 L59 38 Z" fill="url(#maid-hair)"/>
    <path d="M35 30 Q42 23 50 26 Q58 23 65 30 Q58 28 50 30 Q42 28 35 30 Z" fill="url(#maid-hair)"/>

    <ellipse class="vc-maid-eye vc-maid-eye-l" cx="44" cy="39" rx="2.3" ry="3.2" fill="#3A3F5C"/>
    <ellipse class="vc-maid-eye vc-maid-eye-r" cx="56" cy="39" rx="2.3" ry="3.2" fill="#3A3F5C"/>
    <circle cx="44.8" cy="38" r="0.8" fill="#FFF"/>
    <circle cx="56.8" cy="38" r="0.8" fill="#FFF"/>
    <ellipse cx="40" cy="43" rx="2.2" ry="1.4" fill="#F5A9A9" opacity=".65"/>
    <ellipse cx="60" cy="43" rx="2.2" ry="1.4" fill="#F5A9A9" opacity=".65"/>
    <path class="vc-maid-mouth" d="M47 45 Q50 47 53 45" stroke="#7A4A4A" stroke-width="1.3" fill="none" stroke-linecap="round"/>

    <g class="vc-maid-headband">
      <path d="M34 26 Q50 16 66 26 L63 30 Q50 23 37 30 Z" fill="#FCFCFF" stroke="#D8D8E4" stroke-width="1"/>
      <path d="M34 26 q3 -4 6 0 q3 -4 6 0 q3 -4 6 0 q3 -4 6 0 q3 -4 6 0 q3 -4 6 0" fill="none" stroke="#FCFCFF" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M37 28 Q50 24 63 28" fill="none" stroke="#E4B4B4" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  </g>
</svg>`.trim(),
};
