/** Single image -> transparent PNG sequences. Whole-image affine animation is
 * the default; independent limb rotation requires human-confirmed masks/pivots. */
import type { SkinMeta, SpriteState } from "./types";
import { loadImage } from "./pixelize";
import * as spriteStore from "./spriteStore";
import { EMPTY_RIG, FRAME_COUNT, MOTION_FPS, MOTION_STATES, MotionRenderer, type MotionRig } from "./motion";

export interface SynthProgress { ratio: number; label: string }

export async function synthesizeSpriteFromImage(
  dataUrl: string, name: string, onProgress?: (p: SynthProgress) => void,
  rig: MotionRig = EMPTY_RIG,
): Promise<SkinMeta> {
  const renderer = new MotionRenderer(await loadImage(dataUrl), rig);
  const canvas = document.createElement("canvas");
  canvas.width = 180; canvas.height = 240;
  const skinId = `synth-${crypto.randomUUID()}`;
  const states: Partial<Record<string, SpriteState>> = {};
  let done = 0;
  try {
    for (const state of MOTION_STATES) {
      // toBlob snapshots the bitmap at invocation. Queue one state's encodes
      // together so background-tab idle scheduling cannot add one delay per frame.
      const encodes: Promise<Blob>[] = [];
      for (let i = 0; i < FRAME_COUNT; i++) {
        renderer.draw(canvas, state, i / FRAME_COUNT);
        encodes.push(new Promise<Blob>((resolve, reject) => canvas.toBlob(b => {
          if (!b) { reject(new Error("PNG encoding failed")); return; }
          onProgress?.({ ratio: ++done / (MOTION_STATES.length * FRAME_COUNT), label: `${state} ${done}/192` });
          resolve(b);
        }, "image/png")));
      }
      const blobs = await Promise.all(encodes);
      await spriteStore.saveFrames(skinId, state, blobs);
      states[state] = { frameCount: FRAME_COUNT, fps: MOTION_FPS, loop: true };
    }
    return { id: skinId, nameEn: name, nameZh: name, kind: "sprite", builtin: false,
      manifest: { states }, createdAt: new Date().toISOString() };
  } catch (error) {
    await spriteStore.deleteSkin(skinId).catch(() => {});
    throw error;
  } finally {
    renderer.dispose(); canvas.width = canvas.height = 0;
  }
}
