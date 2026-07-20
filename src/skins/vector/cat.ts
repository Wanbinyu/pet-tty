import type { VectorCharacter } from "./types";

/** Layered tabby mascot with independently animated tail, ears, paws and eyes. */
export const cat: VectorCharacter = {
  id: "cat",
  nameEn: "Tabby Cat",
  nameZh: "橘喵",
  emoji: "🐱",
  svg: `
<svg class="vc vc-cat" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cat-fur" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#FFD48B"/>
      <stop offset="1" stop-color="#E98A32"/>
    </linearGradient>
    <linearGradient id="cat-chest" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFF7E7"/>
      <stop offset="1" stop-color="#F5D6AF"/>
    </linearGradient>
  </defs>
  <ellipse class="vc-shadow" cx="50" cy="91" rx="29" ry="5" fill="#1E1720" opacity=".16"/>

  <g class="vc-cat-tail">
    <path d="M73 76 C91 77 94 62 86 54 C80 48 82 41 89 39" fill="none" stroke="#673722" stroke-width="11" stroke-linecap="round"/>
    <path d="M73 76 C91 77 94 62 86 54 C80 48 82 41 89 39" fill="none" stroke="#E98A32" stroke-width="7" stroke-linecap="round"/>
    <path d="M84 52 C87 51 89 49 90 46" fill="none" stroke="#B45F27" stroke-width="3" stroke-linecap="round"/>
  </g>

  <g class="vc-cat-body" stroke="#673722" stroke-width="2.2" stroke-linejoin="round">
    <ellipse cx="50" cy="72" rx="27" ry="20" fill="url(#cat-fur)"/>
    <path d="M37 58 C35 69 36 82 42 88 L58 88 C64 82 65 69 63 58" fill="url(#cat-chest)" stroke="none"/>
    <path d="M28 70 C24 75 25 84 32 87 C37 89 40 85 38 81" fill="#F5A84D"/>
    <path d="M72 70 C76 75 75 84 68 87 C63 89 60 85 62 81" fill="#F5A84D"/>
  </g>

  <g class="vc-cat-paws" stroke="#673722" stroke-width="2" stroke-linecap="round">
    <path class="vc-cat-paw-l" d="M35 72 C30 77 29 87 36 90 C42 92 46 88 45 82 L44 75" fill="#FFF0D5"/>
    <path class="vc-cat-paw-r" d="M65 72 C70 77 71 87 64 90 C58 92 54 88 55 82 L56 75" fill="#FFF0D5"/>
    <path d="M35 86 l2 2 M40 86 l1 2 M65 86 l-2 2 M60 86 l-1 2" fill="none" opacity=".55"/>
  </g>

  <g class="vc-cat-head">
    <path d="M30 34 L24 15 Q23 12 27 14 L44 23 Q50 20 56 23 L73 14 Q77 12 76 16 L71 35" fill="url(#cat-fur)" stroke="#673722" stroke-width="2.3" stroke-linejoin="round"/>
    <path class="vc-cat-ear vc-cat-ear-l" d="M28 18 L33 31 L41 24 Z" fill="#F08E88"/>
    <path class="vc-cat-ear vc-cat-ear-r" d="M72 18 L67 31 L59 24 Z" fill="#F08E88"/>
    <path d="M50 21 C66 21 76 32 74 47 C72 61 62 68 50 68 C38 68 28 61 26 47 C24 32 34 21 50 21 Z" fill="url(#cat-fur)" stroke="#673722" stroke-width="2.3"/>
    <path d="M33 29 C37 26 42 24 47 24 L43 35 L50 31 L57 35 L53 24 C59 24 65 27 68 31" fill="none" stroke="#B45F27" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M29 42 l8 2 M28 48 l9 0 M71 42 l-8 2 M72 48 l-9 0" stroke="#B45F27" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="50" cy="55" rx="14" ry="10" fill="#FFF2D9"/>
    <ellipse class="vc-cat-eye vc-cat-eye-l" cx="40" cy="44" rx="4.1" ry="5.2" fill="#3A2A24"/>
    <ellipse class="vc-cat-eye vc-cat-eye-r" cx="60" cy="44" rx="4.1" ry="5.2" fill="#3A2A24"/>
    <circle cx="38.8" cy="42.3" r="1.3" fill="#FFF"/>
    <circle cx="58.8" cy="42.3" r="1.3" fill="#FFF"/>
    <circle cx="40.8" cy="46.4" r=".7" fill="#D79B3D"/>
    <circle cx="60.8" cy="46.4" r=".7" fill="#D79B3D"/>
    <path d="M46.5 52 Q50 49 53.5 52 Q50 56 46.5 52" fill="#A95454"/>
    <path d="M50 55 Q46 59 42 56 M50 55 Q54 59 58 56" fill="none" stroke="#563126" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M36 53 L21 50 M36 57 L20 58 M64 53 L79 50 M64 57 L80 58" stroke="#765044" stroke-width="1.1" stroke-linecap="round" opacity=".75"/>
    <ellipse cx="35" cy="52" rx="3" ry="1.5" fill="#EE8B83" opacity=".45"/>
    <ellipse cx="65" cy="52" rx="3" ry="1.5" fill="#EE8B83" opacity=".45"/>
  </g>

  <g class="vc-cat-collar">
    <path d="M37 65 Q50 70 63 65" fill="none" stroke="#3F8D8A" stroke-width="3.3" stroke-linecap="round"/>
    <circle cx="50" cy="69" r="4" fill="#F5C94A" stroke="#70481F" stroke-width="1.5"/>
    <path d="M48 68 h4 M50 69 v2" stroke="#A56B24" stroke-width="1" stroke-linecap="round"/>
  </g>
</svg>`.trim(),
};
