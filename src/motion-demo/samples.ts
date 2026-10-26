import { maid } from "../skins/vector/maid";
import type { MotionRig } from "../skins/motion";

// Original geometric demo art, authored here. Coordinates are human-authored presets.
export const astronaut = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="210" viewBox="0 0 200 210">
<g stroke="#274b48" stroke-width="3" stroke-linejoin="round">
<path d="M62 156h24v32q-12 9-26 0z" fill="#42766b"/><path d="M107 156h24v32q-12 9-26 0z" fill="#42766b"/>
<path d="M61 184h25v10H59q-4-6 2-10zM106 184h25v10h-27q-4-6 2-10z" fill="#294d47"/>
<path d="M43 89q-18 10-20 35l13 6 16-30z" fill="#f1aa61"/><circle cx="29" cy="132" r="9" fill="#ffd09a"/>
<path d="M146 94q23 4 25 34l-15 4-10-28z" fill="#f1aa61"/><circle cx="164" cy="141" r="9" fill="#ffd09a"/>
<rect x="51" y="77" width="91" height="80" rx="27" fill="#e5f0d5"/>
<rect x="72" y="111" width="49" height="25" rx="7" fill="#75b9a6"/><path d="M80 123h14m-7-7v14" fill="none" stroke="#f9fff3"/>
<circle cx="111" cy="122" r="3" fill="#f3b36a"/>
<rect x="48" y="15" width="98" height="80" rx="38" fill="#eff4de"/>
<rect x="59" y="28" width="76" height="52" rx="24" fill="#2d5c54"/>
<path d="M67 43q8-9 21-8" fill="none" stroke="#6caa98" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="82" cy="54" rx="4" ry="6" fill="#eff6ce" stroke="none"/><ellipse cx="114" cy="54" rx="4" ry="6" fill="#eff6ce" stroke="none"/>
<path d="M91 66q7 7 14 0" fill="none" stroke="#f5c46f" stroke-linecap="round"/>
<path d="M96 15V7"/><circle cx="96" cy="6" r="4" fill="#f2b261"/>
</g></svg>`;
export const noHands = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="210" viewBox="0 0 200 210"><path d="M100 24C30 24 21 121 36 168Q45 194 100 194T164 168C179 121 170 24 100 24Z" fill="#f5b76c" stroke="#775538" stroke-width="3"/><path d="M60 54q12-15 30-17" stroke="#ffe0a5" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="77" cy="111" rx="5" ry="7" fill="#534738"/><ellipse cx="123" cy="111" rx="5" ry="7" fill="#534738"/><path d="M88 133q12 13 24 0" fill="none" stroke="#87513d" stroke-width="4" stroke-linecap="round"/><ellipse cx="61" cy="131" rx="9" ry="5" fill="#e88c63"/><ellipse cx="139" cy="131" rx="9" ry="5" fill="#e88c63"/></svg>`;
export const sampleRig: MotionRig = { capability: "manual", parts: {
  arm: { x: 144/200, y: 90/210, w: 33/200, h: 62/210, px: 146/200, py: 94/210, confirmed: true },
  legLeft: { x: 57/200, y: 157/210, w: 32/200, h: 40/210, px: 73/200, py: 159/210, confirmed: true },
  legRight: { x: 102/200, y: 157/210, w: 32/200, h: 40/210, px: 118/200, py: 159/210, confirmed: true },
} };
export const maidSample = maid.svg.replace('<svg ', '<svg width="200" height="200" ');
export function svgUrl(svg: string) { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; }
