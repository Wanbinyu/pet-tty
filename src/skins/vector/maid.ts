import type { VectorCharacter } from "./types";

/** Original gothic / church-lolita maid mascot (dark elegant style - not derived
 *  from any copyrighted character). Hourglass dress with lace collar + cross,
 *  lace veil headdress, dark twintails, crimson accents. Arms wave / cheer /
 *  work per agent state; eyes blink on idle. Hand-written SVG, safe as a
 *  built-in default skin. */
export const maid: VectorCharacter = {
  id: "maid",
  nameEn: "Maid",
  nameZh: "女仆",
  emoji: "🎀",
  svg: `
<svg class="vc vc-maid" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="maid-dress" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#2D2A3D"/>
      <stop offset="1" stop-color="#15131F"/>
    </linearGradient>
    <linearGradient id="maid-hair" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#332B46"/>
      <stop offset="1" stop-color="#181122"/>
    </linearGradient>
    <radialGradient id="maid-face" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#FFF1E6"/>
      <stop offset="1" stop-color="#FDDEC8"/>
    </radialGradient>
  </defs>
  <ellipse class="vc-shadow" cx="50" cy="93" rx="24" ry="4" fill="#1E1720" opacity=".18"/>

  <!-- long dark twintails (behind body) -->
  <path class="vc-maid-tail-l" d="M30 42 Q16 50 16 66 Q16 80 26 84 Q32 70 32 52 Z" fill="url(#maid-hair)" stroke="#120C1C" stroke-width="1"/>
  <path d="M20 78 l-3 5 M23 81 l-4 3" stroke="#120C1C" stroke-width="1.3" stroke-linecap="round"/>
  <path class="vc-maid-tail-r" d="M70 42 Q84 50 84 66 Q84 80 74 84 Q68 70 68 52 Z" fill="url(#maid-hair)" stroke="#120C1C" stroke-width="1"/>
  <path d="M80 78 l3 5 M77 81 l4 3" stroke="#120C1C" stroke-width="1.3" stroke-linecap="round"/>

  <!-- dress: hourglass bodice + flared skirt -->
  <g class="vc-maid-body">
    <path d="M40 52 Q38 60 44 66 Q30 78 26 92 L74 92 Q70 78 56 66 Q62 60 60 52 Z" fill="url(#maid-dress)" stroke="#0E0A16" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M50 52 L50 92" stroke="#3A3550" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M43 64 Q50 67 57 64 L57 68 Q50 71 43 68 Z" fill="#8E2A3A" stroke="#5A1822" stroke-width="0.8"/>
    <path d="M26 90 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0" fill="none" stroke="#EDE9F0" stroke-width="2.4" stroke-linecap="round"/>
  </g>

  <!-- arms (long-sleeved, dark with white cuffs) -->
  <g class="vc-maid-arms">
    <path class="vc-maid-arm vc-maid-arm-l" d="M33 54 Q30 64 31 74" fill="none" stroke="url(#maid-dress)" stroke-width="6.5" stroke-linecap="round"/>
    <path class="vc-maid-arm vc-maid-arm-r" d="M67 54 Q70 64 69 74" fill="none" stroke="url(#maid-dress)" stroke-width="6.5" stroke-linecap="round"/>
    <ellipse cx="31" cy="74" rx="4" ry="2.4" fill="#EDE9F0" stroke="#C8C2D4" stroke-width="0.8"/>
    <ellipse cx="69" cy="74" rx="4" ry="2.4" fill="#EDE9F0" stroke="#C8C2D4" stroke-width="0.8"/>
    <circle cx="31" cy="77" r="2.8" fill="#FDDEC8"/>
    <circle cx="69" cy="77" r="2.8" fill="#FDDEC8"/>
  </g>

  <!-- neck + high lace collar + cross necklace -->
  <rect x="47" y="48" width="6" height="5" fill="#FDDEC8"/>
  <g class="vc-maid-collar">
    <path d="M39 52 Q50 48 61 52 L59 56 Q50 53 41 56 Z" fill="#EDE9F0" stroke="#C8C2D4" stroke-width="0.8"/>
    <path d="M41 56 l2 3 M46 56 l1 3 M50 56 l0 3 M54 56 l-1 3 M59 56 l-2 3" stroke="#C8C2D4" stroke-width="0.9" stroke-linecap="round"/>
    <path d="M50 57 v6 M47 59 h6" stroke="#D8D8E0" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="50" cy="57" r="0.8" fill="#D8D8E0"/>
  </g>

  <!-- head -->
  <g class="vc-maid-head">
    <path d="M30 32 Q29 11 50 10 Q71 11 70 32 L68 45 Q60 26 50 24 Q40 26 32 45 Z" fill="url(#maid-hair)" stroke="#120C1C" stroke-width="1"/>
    <ellipse cx="50" cy="33" rx="19" ry="18.5" fill="url(#maid-face)"/>
    <path d="M32 26 Q40 15 50 18 Q60 15 68 26 Q60 21 50 23 Q40 21 32 26 Z" fill="url(#maid-hair)" stroke="#120C1C" stroke-width="1"/>
    <path d="M31 30 Q28 41 34 47 L37 32 Z" fill="url(#maid-hair)" stroke="#120C1C" stroke-width="1"/>
    <path d="M69 30 Q72 41 66 47 L63 32 Z" fill="url(#maid-hair)" stroke="#120C1C" stroke-width="1"/>

    <g class="vc-maid-eye vc-maid-eye-l">
      <ellipse cx="42" cy="36" rx="3.9" ry="5.1" fill="#6A2A4A"/>
      <circle cx="43.1" cy="34.3" r="1.5" fill="#FFF"/>
      <circle cx="40.8" cy="38" r="0.8" fill="#FFF"/>
    </g>
    <g class="vc-maid-eye vc-maid-eye-r">
      <ellipse cx="58" cy="36" rx="3.9" ry="5.1" fill="#6A2A4A"/>
      <circle cx="59.1" cy="34.3" r="1.5" fill="#FFF"/>
      <circle cx="56.8" cy="38" r="0.8" fill="#FFF"/>
    </g>
    <ellipse cx="38" cy="42" rx="2.6" ry="1.7" fill="#E08A98" opacity=".55"/>
    <ellipse cx="62" cy="42" rx="2.6" ry="1.7" fill="#E08A98" opacity=".55"/>
    <path class="vc-maid-mouth" d="M47 44 Q50 46 53 44" stroke="#7A3A4A" stroke-width="1.2" fill="none" stroke-linecap="round"/>

    <!-- lace veil headdress (church-style) -->
    <g class="vc-maid-headband">
      <path d="M28 24 Q50 6 72 24 L70 30 Q50 19 30 30 Z" fill="#F4F2F6" stroke="#C8C2D4" stroke-width="0.9"/>
      <path d="M28 24 Q24 28 26 34 L30 30 Z" fill="#F4F2F6" stroke="#C8C2D4" stroke-width="0.8"/>
      <path d="M72 24 Q76 28 74 34 L70 30 Z" fill="#F4F2F6" stroke="#C8C2D4" stroke-width="0.8"/>
      <path d="M28 24 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0" fill="none" stroke="#F4F2F6" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M50 14 L46 11 L46 17 Z M50 14 L54 11 L54 17 Z" fill="#8E2A3A"/>
      <circle cx="50" cy="14" r="1.4" fill="#5A1822"/>
    </g>
  </g>
</svg>`.trim(),
};
