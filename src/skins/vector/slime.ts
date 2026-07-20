import type { VectorCharacter } from "./types";

/** Translucent tea-jelly slime with layered highlights and floating bubbles. */
export const slime: VectorCharacter = {
  id: "slime",
  nameEn: "Tea Slime",
  nameZh: "茶冻史莱姆",
  emoji: "🟢",
  svg: `
<svg class="vc vc-slime" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="slime-jelly" x1=".15" y1="0" x2=".85" y2="1">
      <stop offset="0" stop-color="#B8F5E5"/>
      <stop offset=".55" stop-color="#62CDBC"/>
      <stop offset="1" stop-color="#32998F"/>
    </linearGradient>
    <radialGradient id="slime-core" cx="45%" cy="40%" r="60%">
      <stop offset="0" stop-color="#FFF6B8" stop-opacity=".95"/>
      <stop offset="1" stop-color="#E6AE4A" stop-opacity=".4"/>
    </radialGradient>
  </defs>
  <ellipse class="vc-shadow" cx="50" cy="89" rx="31" ry="5" fill="#163C42" opacity=".2"/>

  <g class="vc-slime-leaf" stroke="#315D45" stroke-width="1.8" stroke-linejoin="round">
    <path d="M50 29 C45 21 47 14 55 10 C59 18 57 25 50 29 Z" fill="#78B85D"/>
    <path d="M51 27 C57 20 65 20 70 24 C65 31 58 33 51 27 Z" fill="#A5D570"/>
    <path d="M51 27 C55 22 59 19 64 17" fill="none" stroke-linecap="round"/>
  </g>

  <g class="vc-slime-bubbles" fill="#CFFAF0" stroke="#367E78" stroke-width="1.2">
    <circle cx="24" cy="42" r="3.5"/>
    <circle cx="78" cy="34" r="2.5"/>
    <circle cx="83" cy="47" r="1.8"/>
  </g>

  <g class="vc-slime-body">
    <path d="M18 66 C18 48 25 31 39 27 C42 24 46 22 50 23 C54 22 58 24 61 27 C75 31 82 48 82 66 C82 80 72 87 50 87 C28 87 18 80 18 66 Z" fill="url(#slime-jelly)" stroke="#285D5D" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M27 61 C27 45 34 34 44 31 C36 39 34 54 35 70 C36 77 31 79 28 73 C27 70 27 66 27 61 Z" fill="#E4FFF8" opacity=".42"/>
    <path d="M70 40 C77 49 78 64 73 74" fill="none" stroke="#177D78" stroke-width="2" stroke-linecap="round" opacity=".35"/>
    <ellipse class="vc-slime-core" cx="51" cy="70" rx="14" ry="10" fill="url(#slime-core)" opacity=".5"/>
    <circle cx="34" cy="42" r="3.5" fill="#FFF" opacity=".46"/>
    <circle cx="40" cy="36" r="1.8" fill="#FFF" opacity=".65"/>
    <circle cx="31" cy="50" r="1.4" fill="#FFF" opacity=".38"/>
  </g>

  <g class="vc-slime-face">
    <ellipse class="vc-slime-eye vc-slime-eye-l" cx="41" cy="57" rx="5.4" ry="6.8" fill="#173F45"/>
    <ellipse class="vc-slime-eye vc-slime-eye-r" cx="60" cy="57" rx="5.4" ry="6.8" fill="#173F45"/>
    <circle cx="39.5" cy="54.5" r="1.7" fill="#FFF"/>
    <circle cx="58.5" cy="54.5" r="1.7" fill="#FFF"/>
    <circle cx="42.5" cy="59.5" r=".9" fill="#80DED4"/>
    <circle cx="61.5" cy="59.5" r=".9" fill="#80DED4"/>
    <path d="M43 69 Q50 75 58 68" fill="#FFF0E6" stroke="#173F45" stroke-width="2" stroke-linecap="round"/>
    <path d="M47 71 Q51 74 55 70" fill="#EF8F9D"/>
    <ellipse cx="33" cy="66" rx="4.5" ry="2" fill="#F28CA0" opacity=".42"/>
    <ellipse cx="68" cy="66" rx="4.5" ry="2" fill="#F28CA0" opacity=".42"/>
  </g>

  <g class="vc-slime-feet" fill="#55BEB1" stroke="#285D5D" stroke-width="2">
    <path d="M28 81 C24 84 24 89 31 90 C36 91 40 87 39 84"/>
    <path d="M72 81 C76 84 76 89 69 90 C64 91 60 87 61 84"/>
  </g>
</svg>`.trim(),
};
