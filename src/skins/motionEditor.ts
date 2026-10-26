import type { AgentState } from "../events/types";
import { activeParts, describeMotion, EMPTY_RIG, FRAME_COUNT, MOTION_FPS, MotionRenderer, MOTION_STATES, validPart, type MotionRig, type PartSlot } from "./motion";
import "./motionEditor.css";

const names: Record<AgentState, string> = { idle: "待机", thinking: "思考", tool_call: "工具 / 走动", editing: "编辑", waiting_user: "等你 / 挥手", running_tests: "测试 / 小跑", success: "成功 / 弹起", error: "错误" };
export class MotionEditor {
  rig: MotionRig;
  state: AgentState = "waiting_user";
  private renderer: MotionRenderer;
  private frame = 0;
  private paused = false;
  private raf = 0;
  private disposed = false;
  private pivotMode = false;
  private source: HTMLCanvasElement;
  private preview: HTMLCanvasElement;
  private slot: HTMLSelectElement;
  private capability: HTMLSelectElement;
  private confirm: HTMLInputElement;
  private range: HTMLInputElement;
  private caption: HTMLElement;
  private started = performance.now();
  // Pause the scheduler itself, rather than waking it on every display refresh.
  private visibilityChanged = () => {
    this.stopAnimation();
    this.startAnimation();
  };
  private tick = (now: number) => {
    this.raf = 0;
    if (this.disposed || this.paused || document.hidden) return;
    const frame = Math.floor((now - this.started) / (1000 / MOTION_FPS)) % FRAME_COUNT;
    if (frame !== this.frame) { this.frame = frame; this.draw(); }
    this.raf = requestAnimationFrame(this.tick);
  };
  private stopAnimation() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
  private startAnimation() {
    if (this.disposed || this.paused || document.hidden || this.raf) return;
    this.started = performance.now() - this.frame / MOTION_FPS * 1000;
    this.raf = requestAnimationFrame(this.tick);
  }
  constructor(private root: HTMLElement, private image: HTMLImageElement, initial: MotionRig = EMPTY_RIG) {
    this.rig = structuredClone(initial);
    root.classList.add("motion-editor");
    root.innerHTML = `<div class="me-source"><div class="me-kicker">01 / 素材能力</div>
      <label>这张图能做什么？<select data-field="capability"><option value="unknown">未知 · 仅整图动作</option><option value="none">没有可用手腿 · 弹跳摇摆</option><option value="manual">手动标记 · 使用原有像素</option></select></label>
      <div class="me-source-board"><canvas data-field="source" aria-label="原图标记区域"></canvas></div>
      <div data-field="manual"><label>标记部位<select data-field="slot"><option value="arm">挥手手臂</option><option value="legLeft">左腿</option><option value="legRight">右腿</option></select></label>
      <p class="me-hint">① 拖动框选完整部位　② 点「关节」后点旋转中心</p>
      <div class="me-row"><button type="button" data-action="pivot">设置关节</button><button type="button" data-action="clear">清除部位</button></div>
      <label class="me-check"><input data-field="confirm" type="checkbox">我确认：区域不含躯干，关节位置正确</label></div>
      <p class="me-warning">没有自动部位识别。未知、未确认或重叠区域会降级。矩形切片不能补出被手臂遮住的身体，请选独立轮廓。</p></div>
      <div class="me-stage"><div class="me-kicker">02 / 同源动作预览</div><div class="me-preview-board"><span class="me-bubble">需要你确认一下 👋</span><canvas data-field="preview" width="360" height="480" aria-label="实时动作"></canvas><span class="me-ground"></span></div>
      <p data-field="caption" class="me-caption" aria-live="polite"></p><div class="me-states"></div>
      <div class="me-row"><button type="button" data-action="pause">暂停</button><label class="me-timeline">逐帧 <input data-field="range" type="range" min="0" max="23" value="0" aria-label="动画帧"></label><span data-field="frame">1 / 24</span></div></div>`;
    const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
    this.source = find<HTMLCanvasElement>('[data-field="source"]');
    this.preview = find<HTMLCanvasElement>('[data-field="preview"]');
    this.slot = find<HTMLSelectElement>('[data-field="slot"]');
    this.capability = find<HTMLSelectElement>('[data-field="capability"]');
    this.confirm = find<HTMLInputElement>('[data-field="confirm"]');
    this.range = find<HTMLInputElement>('[data-field="range"]');
    this.caption = find('[data-field="caption"]');
    const ratio = Math.min(300 / image.naturalWidth, 280 / image.naturalHeight);
    this.source.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    this.source.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    this.capability.value = this.rig.capability;
    this.renderer = new MotionRenderer(image, this.rig);
    const states = find('.me-states');
    for (const state of MOTION_STATES) {
      const button = document.createElement("button");
      button.type = "button"; button.textContent = names[state]; button.dataset.state = state;
      button.onclick = () => this.setState(state); states.append(button);
    }
    this.capability.onchange = () => { this.rig.capability = this.capability.value as MotionRig["capability"]; this.update(); };
    this.slot.onchange = () => { this.pivotMode = false; this.update(); };
    this.confirm.onchange = () => { const p = this.rig.parts[this.slot.value as PartSlot]; if (p) p.confirmed = this.confirm.checked; this.update(); };
    find('[data-action="pivot"]').onclick = () => { this.pivotMode = true; this.caption.textContent = "请在原图框选区域内点一下关节"; };
    find('[data-action="clear"]').onclick = () => { delete this.rig.parts[this.slot.value as PartSlot]; this.update(); };
    find('[data-action="pause"]').onclick = e => {
      this.paused = !this.paused; (e.currentTarget as HTMLElement).textContent = this.paused ? "播放" : "暂停";
      this.stopAnimation(); this.startAnimation();
    };
    this.range.oninput = () => {
      this.paused = true; find('[data-action="pause"]').textContent = "播放";
      this.stopAnimation();
      this.frame = Number(this.range.value); this.draw();
    };
    const point = (e: PointerEvent) => {
      const rect = this.source.getBoundingClientRect();
      return { x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)), y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)) };
    };
    let start: { x: number; y: number } | null = null;
    this.source.onpointerdown = e => {
      if (this.rig.capability !== "manual") return;
      const p = point(e); const slot = this.slot.value as PartSlot;
      if (this.pivotMode) {
        const region = this.rig.parts[slot];
        if (region) { region.px = p.x; region.py = p.y; region.confirmed = false; }
        this.pivotMode = false; this.update(); return;
      }
      start = p; this.source.setPointerCapture(e.pointerId);
    };
    this.source.onpointermove = e => {
      if (!start) return;
      const p = point(e);
      this.rig.parts[this.slot.value as PartSlot] = { x: Math.min(p.x, start.x), y: Math.min(p.y, start.y),
        w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y), px: (p.x + start.x) / 2, py: Math.min(p.y, start.y), confirmed: false };
      this.drawSource();
    };
    this.source.onpointerup = this.source.onpointercancel = () => { start = null; this.update(); };
    this.update();
    document.addEventListener("visibilitychange", this.visibilityChanged);
    this.startAnimation();
  }
  setState(state: AgentState) {
    this.state = state; this.frame = 0; this.started = performance.now();
    this.root.querySelectorAll<HTMLButtonElement>('[data-state]').forEach(b => b.setAttribute("aria-pressed", String(b.dataset.state === state)));
    const bubble = this.root.querySelector<HTMLElement>('.me-bubble')!;
    bubble.textContent = `${names[state]} · ${state}`;
    this.caption.textContent = describeMotion(state, this.rig); this.draw();
  }
  private update() {
    this.renderer.dispose(); this.renderer = new MotionRenderer(this.image, this.rig);
    this.root.querySelector<HTMLElement>('[data-field="manual"]')!.hidden = this.rig.capability !== "manual";
    const p = this.rig.parts[this.slot.value as PartSlot];
    this.confirm.checked = !!p?.confirmed;
    this.confirm.disabled = !p || !validPart({ ...p, confirmed: true });
    const count = activeParts(this.rig).length;
    this.setState(this.state);
    if (this.rig.capability === "manual" && !count) this.caption.textContent += " · 尚无有效确认区域";
    this.drawSource();
  }
  private drawSource() {
    const c = this.source; const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(this.image, 0, 0, c.width, c.height);
    if (this.rig.capability !== "manual") return;
    for (const [slot, p] of Object.entries(this.rig.parts)) {
      ctx.strokeStyle = p.confirmed ? "#18846e" : "#e39422"; ctx.lineWidth = slot === this.slot.value ? 2.5 : 1;
      ctx.setLineDash(p.confirmed ? [] : [4, 3]); ctx.strokeRect(p.x * c.width, p.y * c.height, p.w * c.width, p.h * c.height); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(p.px * c.width, p.py * c.height, 4, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
    }
  }
  private draw() {
    this.renderer.draw(this.preview, this.state, this.frame / 24);
    this.range.value = String(this.frame);
    this.root.querySelector<HTMLElement>('[data-field="frame"]')!.textContent = `${this.frame + 1} / 24`;
  }
  dispose() {
    this.disposed = true; this.stopAnimation();
    document.removeEventListener("visibilitychange", this.visibilityChanged);
    this.renderer.dispose(); this.root.replaceChildren();
  }
}

/** Existing desktop importer uses the same editor as the standalone demo. */
export function chooseMotionRig(image: HTMLImageElement): Promise<MotionRig | null> {
  return new Promise(resolve => {
    const dialog = document.createElement("dialog"); dialog.className = "motion-dialog";
    dialog.innerHTML = '<h2>单图动作 · 先确认素材能力</h2><div class="me-mount"></div><div class="me-row"><button type="button" data-done>使用这些动作</button><button type="button" data-cancel>取消</button></div>';
    document.body.append(dialog);
    const editor = new MotionEditor(dialog.querySelector<HTMLElement>('.me-mount')!, image);
    const finish = (rig: MotionRig | null) => { editor.dispose(); dialog.close(); dialog.remove(); resolve(rig); };
    dialog.querySelector<HTMLButtonElement>('[data-done]')!.onclick = () => finish(structuredClone(editor.rig));
    dialog.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => finish(null);
    dialog.oncancel = e => { e.preventDefault(); finish(null); };
    dialog.showModal();
  });
}
