import { MotionEditor } from "../skins/motionEditor";
import { EMPTY_RIG, MOTION_STATES, TOTAL_MOTION_FRAMES, type MotionRig } from "../skins/motion";
import { loadImage, fileToDataUrl } from "../skins/pixelize";
import { synthesizeSpriteFromImage } from "../skins/spriteSynth";
import { SpritePlayer } from "../skins/spritePlayer";
import * as store from "../skins/spriteStore";
import { astronaut, noHands, sampleRig, maidSample, svgUrl } from "./samples";
import "./style.css";

document.querySelector('#demo')!.innerHTML = `<main class="lab"><header><div class="brand"><span class="brand-icon">p.</span> PETDECK <span class="lab-tag">MOTION LAB / 01</span></div><span class="local-pill">● 本地 Canvas · 无模型下载</span></header>
<section class="intro"><p class="eyebrow">从一张图，到能解释的动作</p><h1>让角色动起来，<span>也把能力讲清楚。</span></h1><p class="lead">整图形变、局部关节和真实动作帧，在这里逐个验证。缺少手臂，就让它轻轻弹跳。</p></section>
<section class="workspace"><div class="toolbar"><div class="sample-tabs"><button data-sample="rigged">自制角色 · 人工预设</button><button data-sample="none">无手团子</button><button data-sample="unknown">未知区域</button><button data-sample="maid">默认女仆 · 平面图</button></div><label class="upload">导入自己的图片<input id="upload" type="file" accept="image/png,image/jpeg,image/webp"></label></div>
<div id="editor"></div></section>
<section class="bake"><div><p class="eyebrow">03 / 从预览到真正的帧播放器</p><h2>把当前方案烘焙为 ${TOTAL_MOTION_FRAMES} 张透明 PNG</h2><p>8 个 Agent 状态，按动作节奏分配帧数。图片自动生成，无需准备动画帧；成功与错误播完回到待机。</p><div class="bake-actions"><button id="bake" class="primary">烘焙并播放</button><button id="clear">释放播放资源</button><button id="qa">运行验证</button></div><p id="bake-status" role="status">尚未烘焙；修改素材、标记或强度后，请重新烘焙。</p><div id="baked-states"></div><pre id="qa-result" hidden></pre></div><div class="baked-board"><span>真实 PNG 帧播放器</span><img id="baked" alt="烘焙结果" hidden></div></section>
<section class="boundaries"><article><b>整图仿射</b><p>translate / rotate / scale 改变整张图的位置和形状，不能从中产生一只新手。</p></article><article><b>局部 mask + pivot</b><p>人工框选独立手臂、确认关节点，再旋转原有像素。遮挡后的身体不会自动补全。</p></article><article><b>已有动作序列</b><p>项目原有导入器可读取动作 PNG。要换姿势、转身或复杂步态，优先使用真正的动作帧。</p></article></section>
<footer>自制几何角色 + 项目 MIT SVG · 全部在本地运行 · 这是一套 2D 动作示意，不包含自动骨骼识别或生成式补手</footer></main>`;
let editor: MotionEditor;
let source = "";
let revision = 0;
let generated: string | null = null;
let busy = false;
let closed = false;
const player = new SpritePlayer();
const baked = document.querySelector<HTMLImageElement>('#baked')!;
const status = document.querySelector<HTMLElement>('#bake-status')!;
const bakeButton = document.querySelector<HTMLButtonElement>('#bake')!;
player.attach(baked);
async function release() {
  player.deactivate(); baked.hidden = true;
  if (generated) { const id = generated; generated = null; await store.deleteSkin(id); }
  document.querySelector('#baked-states')!.replaceChildren();
}
async function setSource(url: string, rig: MotionRig, sample?: string) {
  const version = ++revision;
  const image = await loadImage(url);
  if (version !== revision || closed) return;
  editor?.dispose(); source = url;
  editor = new MotionEditor(document.querySelector<HTMLElement>('#editor')!, image, rig);
  document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sample === sample)));
  await release();
  status.textContent = "新素材已载入；烘焙会保存当前标记的快照。";
}
document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach(b => b.onclick = () => {
  if (busy) return;
  const sample = b.dataset.sample;
  const svg = sample === 'none' ? noHands : sample === 'maid' ? maidSample : astronaut;
  void setSource(svgUrl(svg), sample === 'rigged' ? sampleRig : { capability: sample === 'none' ? 'none' : 'unknown', parts: {} }, sample);
});
document.querySelector<HTMLInputElement>('#upload')!.onchange = async e => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || busy) return;
  try { await setSource(await fileToDataUrl(file), EMPTY_RIG); }
  catch { status.textContent = "图片无法解码，请使用 PNG / JPEG / WebP。"; }
};
bakeButton.onclick = async () => {
  if (busy) return;
  busy = true; bakeButton.disabled = true;
  const version = revision;
  try {
    await release();
    const skin = await synthesizeSpriteFromImage(source, '演示快照', p => { status.textContent = `正在烘焙 ${Math.round(p.ratio * 100)}% · ${p.label}`; }, structuredClone(editor.rig));
    if (closed || version !== revision) { await store.deleteSkin(skin.id); return; }
    generated = skin.id; player.activate(skin); player.setState(editor.state); baked.hidden = false;
    for (const state of MOTION_STATES) {
      const b = document.createElement('button'); b.textContent = state;
      b.onclick = () => player.setState(state, true); document.querySelector('#baked-states')!.append(b);
    }
    status.textContent = `已生成 ${TOTAL_MOTION_FRAMES} 张透明 PNG · 已保存当前强度与标记 · 等待时收手休息，成功后回到待机`;
  } catch (error) { status.textContent = `烘焙失败：${String(error)}`; }
  finally { busy = false; bakeButton.disabled = false; }
};
document.querySelector<HTMLButtonElement>('#clear')!.onclick = () => {
  if (busy) return;
  void release().then(() => { status.textContent = '已停止计时器，撤销对象 URL，删除本次临时 PNG 帧。'; });
};
document.querySelector<HTMLButtonElement>('#qa')!.onclick = async e => {
  const button = e.currentTarget as HTMLButtonElement; button.disabled = true;
  const output = document.querySelector<HTMLElement>('#qa-result')!; output.hidden = false; output.textContent = '正在验证实际 Canvas / PNG / IndexedDB / 播放器…';
  try { const { runMotionChecks } = await import('./verify'); output.textContent = (await runMotionChecks(message => { output.textContent = message; })).join('\n'); }
  catch (error) { output.textContent = `FAIL ${String(error)}`; }
  finally { button.disabled = false; }
};
window.addEventListener('pagehide', () => { closed = true; revision++; editor?.dispose(); void release(); });
void setSource(svgUrl(astronaut), sampleRig, 'rigged');
