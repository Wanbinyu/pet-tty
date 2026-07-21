import type { VectorCharacter } from "./types";

/** Original chibi/loli maid mascot (generic cute anime style - not derived from
 *  any copyrighted character). Big head, big shiny eyes, twintails, frilly
 *  headdress. Arms wave / cheer / work per agent state; eyes blink on idle.
 *  Hand-written SVG, safe as a built-in default skin. */
export const maid: VectorCharacter = {
  id: "maid",
  nameEn: "Maid",
  nameZh: "女仆",
  emoji: "🎀",
  svg: `
<svg class="vc vc-maid" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="maid-dress" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#4A5078"/>
      <stop offset="1" stop-color="#2E3358"/>
    </linearGradient>
    <linearGradient id="maid-hair" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#F8CCDA"/>
      <stop offset="1" stop-color="#E89AB0"/>
    </linearGradient>
    <radialGradient id="maid-face" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#FFF1E6"/>
      <stop offset="1" stop-color="#FDDEC8"/>
    </radialGradient>
  </defs>
  <ellipse class="vc-shadow" cx="50" cy="93" rx="22" ry="4" fill="#1E1720" opacity=".15"/>

  <!-- twintails (behind body) -->
  <path class="vc-maid-tail-l" d="M28 42 Q17 47 17 59 Q17 70 26 71 Q31 60 31 50 Z" fill="url(#maid-hair)" stroke="#D98AA0" stroke-width="1"/>
  <path d="M21 64 l-3 5 M24 68 l-4 3" stroke="#D98AA0" stroke-width="1.4" stroke-linecap="round"/>
  <path class="vc-maid-tail-r" d="M72 42 Q83 47 83 59 Q83 70 74 71 Q69 60 69 50 Z" fill="url(#maid-hair)" stroke="#D98AA0" stroke-width="1"/>
  <path d="M79 64 l3 5 M76 68 l4 3" stroke="#D98AA0" stroke-width="1.4" stroke-linecap="round"/>

  <!-- dress (round, short) -->
  <g class="vc-maid-body">
    <path d="M38 54 Q50 50 62 54 L70 82 Q50 88 30 82 Z" fill="url(#maid-dress)" stroke="#252840" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M43 54 Q50 52 57 54 L60 80 Q50 83 40 80 Z" fill="#FBFBFF"/>
    <path d="M45 54 L44 68 M55 54 L56 68" stroke="#FBFBFF" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M40 80 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="#FBFBFF" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M30 82 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="#3A3F68" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- arms -->
  <g class="vc-maid-arms">
    <ellipse class="vc-maid-arm vc-maid-arm-l" cx="33" cy="66" rx="4" ry="8" fill="url(#maid-dress)" stroke="#252840" stroke-width="1.1"/>
    <ellipse class="vc-maid-arm vc-maid-arm-r" cx="67" cy="66" rx="4" ry="8" fill="url(#maid-dress)" stroke="#252840" stroke-width="1.1"/>
    <circle cx="33" cy="74" r="3.2" fill="#FDDEC8"/>
    <circle cx="67" cy="74" r="3.2" fill="#FDDEC8"/>
  </g>

  <!-- neck + collar + bow -->
  <rect x="47" y="48" width="6" height="6" fill="#FDDEC8"/>
  <g class="vc-maid-collar">
    <path d="M40 52 Q50 47 60 52 L58 56 Q50 53 42 56 Z" fill="#FBFBFF"/>
    <path d="M50 54 L43 50 L43 58 Z M50 54 L57 50 L57 58 Z" fill="#E05A6A" stroke="#A03A48" stroke-width="0.8"/>
    <circle cx="50" cy="54" r="1.5" fill="#A03A48"/>
  </g>

  <!-- head (big chibi) -->
  <g class="vc-maid-head">
    <path d="M30 32 Q29 11 50 10 Q71 11 70 32 L68 45 Q60 26 50 24 Q40 26 32 45 Z" fill="url(#maid-hair)" stroke="#D98AA0" stroke-width="1"/>
    <ellipse cx="50" cy="33" rx="19" ry="18.5" fill="url(#maid-face)"/>
    <path d="M32 26 Q40 15 50 18 Q60 15 68 26 Q60 21 50 23 Q40 21 32 26 Z" fill="url(#maid-hair)" stroke="#D98AA0" stroke-width="1"/>
    <path d="M31 30 Q28 41 34 47 L37 32 Z" fill="url(#maid-hair)" stroke="#D98AA0" stroke-width="1"/>
    <path d="M69 30 Q72 41 66 47 L63 32 Z" fill="url(#maid-hair)" stroke="#D98AA0" stroke-width="1"/>

    <g class="vc-maid-eye vc-maid-eye-l">
      <ellipse cx="42" cy="36" rx="3.9" ry="5.1" fill="#3A3F5C"/>
      <circle cx="43.1" cy="34.3" r="1.5" fill="#FFF"/>
      <circle cx="40.8" cy="38" r="0.8" fill="#FFF"/>
    </g>
    <g class="vc-maid-eye vc-maid-eye-r">
      <ellipse cx="58" cy="36" rx="3.9" ry="5.1" fill="#3A3F5C"/>
      <circle cx="59.1" cy="34.3" r="1.5" fill="#FFF"/>
      <circle cx="56.8" cy="38" r="0.8" fill="#FFF"/>
    </g>
    <ellipse cx="38" cy="42" rx="3" ry="1.9" fill="#F5A0B0" opacity=".6"/>
    <ellipse cx="62" cy="42" rx="3" ry="1.9" fill="#F5A0B0" opacity=".6"/>
    <path class="vc-maid-mouth" d="M47 44 Q50 46.2 53 44" stroke="#A05A6A" stroke-width="1.2" fill="none" stroke-linecap="round"/>

    <g class="vc-maid-headband">
      <path d="M30 22 Q50 7 70 22 L66 28 Q50 18 34 28 Z" fill="#FCFCFF" stroke="#E0E0EC" stroke-width="1"/>
      <path d="M30 22 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0" fill="none" stroke="#FCFCFF" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M34 26 Q50 20 66 26" fill="none" stroke="#F0B8C8" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M50 14 L46 11 L46 17 Z M50 14 L54 11 L54 17 Z" fill="#E05A6A"/>
      <circle cx="50" cy="14" r="1.5" fill="#A03A48"/>
    </g>
  </g>
</svg>`.trim(),
};
