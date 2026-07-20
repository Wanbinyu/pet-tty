import type { VectorCharacter } from "./types";

/** Compact assistant robot with articulated limbs and an expressive face panel. */
export const robot: VectorCharacter = {
  id: "robot",
  nameEn: "Box Bot",
  nameZh: "小方块机器人",
  emoji: "🤖",
  svg: `
<svg class="vc vc-robot" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="robot-shell" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F4F7FC"/>
      <stop offset=".48" stop-color="#BBC6D7"/>
      <stop offset="1" stop-color="#7D899D"/>
    </linearGradient>
    <linearGradient id="robot-screen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#243044"/>
      <stop offset="1" stop-color="#111824"/>
    </linearGradient>
  </defs>
  <ellipse class="vc-shadow" cx="50" cy="92" rx="28" ry="4.5" fill="#111827" opacity=".2"/>

  <g class="vc-robot-antenna" stroke="#465269" stroke-width="2.3" stroke-linecap="round">
    <path d="M50 23 L50 12 L59 7" fill="none"/>
    <circle class="vc-robot-led" cx="60" cy="7" r="4.3" fill="#62E6D5" stroke="#285D68" stroke-width="1.6"/>
  </g>

  <g class="vc-robot-legs" stroke="#465269" stroke-width="2" stroke-linejoin="round">
    <path d="M36 78 L34 89 L45 90 L46 78" fill="#8793A7"/>
    <path d="M64 78 L66 89 L55 90 L54 78" fill="#8793A7"/>
    <path d="M31 87 Q38 85 46 88 L45 92 L31 92 Z" fill="#526077"/>
    <path d="M69 87 Q62 85 54 88 L55 92 L69 92 Z" fill="#526077"/>
  </g>

  <g class="vc-robot-arms" stroke="#465269" stroke-width="2" stroke-linejoin="round">
    <path class="vc-robot-arm-l" d="M29 58 C20 60 17 68 21 76 L29 73 L34 64" fill="#A9B5C7"/>
    <circle class="vc-robot-hand-l" cx="21" cy="77" r="5" fill="#F0F4FA"/>
    <path class="vc-robot-arm-r" d="M71 58 C80 60 83 68 79 76 L71 73 L66 64" fill="#A9B5C7"/>
    <circle class="vc-robot-hand-r" cx="79" cy="77" r="5" fill="#F0F4FA"/>
  </g>

  <g class="vc-robot-body" stroke="#465269" stroke-width="2.2" stroke-linejoin="round">
    <path d="M31 55 Q31 50 36 49 H64 Q69 50 69 55 L72 76 Q72 82 66 83 H34 Q28 82 28 76 Z" fill="url(#robot-shell)"/>
    <path d="M36 58 H64 V77 Q64 79 62 79 H38 Q36 79 36 77 Z" fill="#6F7B91" opacity=".7"/>
    <rect class="vc-robot-core" x="43" y="62" width="14" height="12" rx="3" fill="#62E6D5" stroke="#285D68" stroke-width="1.6"/>
    <path d="M46 65 h8 M46 68 h5" stroke="#E9FFFB" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>
    <circle cx="34" cy="56" r="2" fill="#F2C94C" stroke="none"/>
    <circle cx="66" cy="56" r="2" fill="#F28C8C" stroke="none"/>
  </g>

  <g class="vc-robot-head">
    <path d="M27 27 Q27 21 34 20 H66 Q73 21 73 27 V48 Q73 55 66 56 H34 Q27 55 27 48 Z" fill="url(#robot-shell)" stroke="#465269" stroke-width="2.4"/>
    <path d="M33 30 Q33 27 37 27 H63 Q67 27 67 30 V45 Q67 49 63 49 H37 Q33 49 33 45 Z" fill="url(#robot-screen)" stroke="#536278" stroke-width="1.6"/>
    <path d="M31 26 Q34 22 39 22" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <g class="vc-robot-eyes" fill="#67EFE1">
      <rect class="vc-robot-eye vc-robot-eye-l" x="38" y="34" width="7" height="8" rx="2.5"/>
      <rect class="vc-robot-eye vc-robot-eye-r" x="55" y="34" width="7" height="8" rx="2.5"/>
      <rect x="39.5" y="35" width="2" height="2" rx="1" fill="#EFFFFC"/>
      <rect x="56.5" y="35" width="2" height="2" rx="1" fill="#EFFFFC"/>
    </g>
    <path class="vc-robot-mouth" d="M45 45 Q50 48 55 45" fill="none" stroke="#67EFE1" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M23 33 h4 v12 h-4 q-3 0-3-3 v-6 q0-3 3-3 Z M77 33 h-4 v12 h4 q3 0 3-3 v-6 q0-3-3-3 Z" fill="#6B7890" stroke="#465269" stroke-width="1.7"/>
  </g>
</svg>`.trim(),
};
