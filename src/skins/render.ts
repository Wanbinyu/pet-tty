import type { AgentState } from "../events/types";
import { PET_VISUAL } from "../pet/mood";
import type { SkinMeta } from "./types";

/**
 * Apply active skin + agent state to the #pet element tree.
 */
export function applySkinToDom(
  petRoot: HTMLElement,
  skin: SkinMeta,
  state: AgentState,
) {
  const visual = PET_VISUAL[state];
  const cssBody = petRoot.querySelector(".pet-css") as HTMLElement | null;
  const img = petRoot.querySelector(".pet-img") as HTMLImageElement | null;
  const face = petRoot.querySelector(".pet-face") as HTMLElement | null;

  petRoot.className = `pet ${visual.bodyClass}`;
  petRoot.dataset.skinKind = skin.kind;
  petRoot.dataset.theme = skin.theme ?? "";
  petRoot.dataset.skinId = skin.id;

  if (skin.kind === "image" && skin.imageDataUrl && img && cssBody) {
    cssBody.classList.add("hidden");
    img.classList.remove("hidden");
    img.src = skin.imageDataUrl;
    img.classList.toggle("pixelated", !!skin.pixelated);
    img.alt = skin.nameEn;
  } else if (cssBody && img) {
    img.classList.add("hidden");
    img.removeAttribute("src");
    cssBody.classList.remove("hidden");
    petRoot.classList.add(`theme-${skin.theme ?? "ember"}`);
    // remove other themes
    for (const t of ["ember", "mint", "pixel-blob", "ghost"]) {
      if (t !== skin.theme) petRoot.classList.remove(`theme-${t}`);
    }
    if (face) face.textContent = visual.face;
  }
}
