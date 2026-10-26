import { activeParts, blendPose, describeMotion, EMPTY_RIG, motionFor, MotionRenderer, MOTION_CONFIG, MOTION_STATES, TOTAL_MOTION_FRAMES, partAngle, poseFor, validPart } from "../skins/motion";
import { samplePlayback } from "../skins/motionPlayback";
import { loadImage } from "../skins/pixelize";
import { synthesizeSpriteFromImage } from "../skins/spriteSynth";
import { SpritePlayer } from "../skins/spritePlayer";
import * as store from "../skins/spriteStore";
import { applySkinToDom } from "../skins/render";
import { BUILTIN_SKINS, DEFAULT_SKIN_ID } from "../skins/presets";
import { astronaut, noHands, sampleRig, svgUrl } from "./samples";
import type { SkinMeta } from "../skins/types";
import { MotionEditor } from "../skins/motionEditor";

/** Runs against real browser Canvas, PNG codecs, IDB, timers and object URLs. */
export async function runMotionChecks(onProgress?: (message: string) => void): Promise<string[]> {
  const results: string[] = [];
  const check = (condition: unknown, name: string) => {
    if (!condition) throw new Error(name);
    results.push(`PASS ${name}`);
    onProgress?.(results.join('\n'));
  };
  const waitUntil = async (condition: () => boolean) => {
    const start = performance.now();
    while (!condition()) {
      if (performance.now() - start > 4000) throw new Error('播放器等待超时');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  };
  check(motionFor('success', .1).sy < 1 && motionFor('success', .1).sx > 1 && motionFor('success', .1).dy === 0, '成功：脚底着地、横向变宽、纵向压扁');
  check(motionFor('success', .5).dy < -20 && motionFor('success', .5).sy > 1, '成功：腾空时拉伸');
  check(Math.abs(motionFor('success', 0).sy - motionFor('success', 1).sy) < 1e-6, '循环首尾连续');
  check(activeParts(EMPTY_RIG).length === 0 && activeParts({ ...sampleRig, capability: 'none' }).length === 0, '未知 / 无手：不启用局部旋转');
  check(activeParts({ capability: 'manual', parts: { arm: { ...sampleRig.parts.arm!, confirmed: false } } }).length === 0, '未确认区域降级');
  check(!validPart({ ...sampleRig.parts.arm!, px: -1 }) && !validPart({ ...sampleRig.parts.arm!, x: NaN }), '无效关节 / 非有限坐标被拒绝');
  check(activeParts({ capability: 'manual', parts: { arm: sampleRig.parts.arm, legLeft: sampleRig.parts.arm } }).length === 0, '重叠切片被拒绝');
  check(partAngle('legLeft', 'tool_call', .125) === -partAngle('legRight', 'tool_call', .125), '左右腿相位相反');
  check(!describeMotion('waiting_user', EMPTY_RIG).includes('局部挥手'), '降级描述不冒充挥手');
  check(partAngle('arm', 'waiting_user', 0) === 0 && partAngle('arm', 'waiting_user', 1) === 0, '挥手从自然下垂开始，并完整收手');
  check(partAngle('arm', 'waiting_user', .2) < -40 && partAngle('arm', 'waiting_user', .9) > -25, '挥手包含抬手与收手过程');
  const gentle = poseFor('success', .5, 'gentle');
  const standard = poseFor('success', .5);
  check(Math.abs(gentle.dy) < Math.abs(standard.dy) && Math.abs(standard.dy) < Math.abs(poseFor('success', .5, 'lively').dy), '三档强度改变动作幅度');
  const from = poseFor('thinking', .25); const to = poseFor('idle', 0);
  check(blendPose(from, to, 0).rot === from.rot && Math.abs(blendPose(from, to, 1).rot - to.rot) < 1e-6, '姿态过渡起点与终点连续');
  check(samplePlayback(1500, MOTION_CONFIG.success, MOTION_CONFIG.idle).sequence === 'idle', '成功动作 1.5 秒后进入待机');
  check(samplePlayback(1000, MOTION_CONFIG.error, MOTION_CONFIG.idle).sequence === 'idle', '错误动作 1 秒后进入待机');
  check(samplePlayback(9999, MOTION_CONFIG.waiting_user, MOTION_CONFIG.idle).sequence === 'idle'
    && samplePlayback(10000, MOTION_CONFIG.waiting_user, MOTION_CONFIG.idle).sequence === 'action', '等待动作收手休息 8 秒后才再次提醒');
  check(samplePlayback(9999, { frameCount: 3, fps: 12, loop: false }).frame === 2, '旧版非循环素材仍停留在末帧');
  const canvas = document.createElement('canvas'); canvas.width = 180; canvas.height = 240;
  const noHandRenderer = new MotionRenderer(await loadImage(svgUrl(noHands)), { capability: 'none', parts: {} });
  try {
    for (const state of MOTION_STATES) {
      noHandRenderer.draw(canvas, state, .25);
      const pixels = canvas.getContext('2d')!.getImageData(0, 0, 180, 240).data;
      check(pixels.some((v, i) => i % 4 === 3 && v > 0), `无手素材 ${state} 有有效画面`);
    }
  } finally { noHandRenderer.dispose(); }
  const host = document.createElement('div');
  host.innerHTML = '<div class="pet-css"></div><img class="pet-img"><div class="pet-vector"></div><img class="pet-sprite">';
  const defaultSkin = BUILTIN_SKINS.find(s => s.id === DEFAULT_SKIN_ID)!;
  applySkinToDom(host, defaultSkin, 'waiting_user');
  check(host.dataset.vector === 'maid' && host.classList.contains('pet--wait'), '默认女仆：Agent 状态映射到真实 SVG');
  check(host.querySelector('.vc-maid-arm-r')?.querySelectorAll('path,ellipse,circle').length === 3, '女仆：袖子、袖口、手掌一起旋转');
  const arm = host.querySelector('.vc-maid-arm-r');
  applySkinToDom(host, defaultSkin, 'waiting_user');
  check(host.querySelector('.vc-maid-arm-r') === arm, '重复 Agent 事件保留 SVG 节点，不反复重启动作');

  // Exercise the actual editor lifecycle, including the costly Canvas draw path.
  const editorHost = document.createElement('div');
  const editor = new MotionEditor(editorHost, await loadImage(svgUrl(astronaut)), sampleRig);
  const preview = editorHost.querySelector<HTMLCanvasElement>('[data-field="preview"]')!;
  const originalDraw = MotionRenderer.prototype.draw;
  const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
  let draws = 0;
  MotionRenderer.prototype.draw = function (target, state, t, transition) {
    if (target === preview) draws++;
    return originalDraw.call(this, target, state, t, transition);
  };
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  try {
    await wait(550);
    check(draws > 0 && draws <= 18, '预览限制为 24 FPS，不随显示刷新率重复绘制');
    editorHost.querySelector<HTMLButtonElement>('[data-action="pause"]')!.click();
    draws = 0; await wait(120);
    check(draws === 0, '预览暂停后停止绘制');
    editorHost.querySelector<HTMLButtonElement>('[data-action="pause"]')!.click();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    draws = 0; await wait(120);
    check(draws === 0, '切到后台时停止预览');
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    await wait(120);
    check(draws > 0, '回到前台后恢复动画');
    editorHost.querySelector<HTMLSelectElement>('[data-field="intensity"]')!.value = 'gentle';
    editorHost.querySelector('[data-field="intensity"]')!.dispatchEvent(new Event('change'));
    check(editor.rig.intensity === 'gentle', '动作编辑器保存强度设置');
    editor.setState('success');
    await waitUntil(() => preview.dataset.motionState === 'idle');
    check(editor.state === 'success' && preview.dataset.motionPhase === 'idle', '预览播完成功后待机，保留原始 Agent 状态');
    editor.dispose(); draws = 0; await wait(120);
    document.dispatchEvent(new Event('visibilitychange'));
    await wait(80);
    check(draws === 0 && editorHost.childElementCount === 0, '关闭编辑器后不再绘制或因可见性事件复活');
  } finally {
    editor.dispose(); MotionRenderer.prototype.draw = originalDraw;
    if (hiddenDescriptor) Object.defineProperty(document, 'hidden', hiddenDescriptor);
    else Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  }

  const img = new Image(); const player = new SpritePlayer(); player.attach(img);
  const urls = new Set<string>();
  const originalCreate = URL.createObjectURL; const originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = blob => { const url = originalCreate.call(URL, blob); urls.add(url); return url; };
  URL.revokeObjectURL = url => { urls.delete(url); originalRevoke.call(URL, url); };
  let skin: SkinMeta | null = null;
  try {
    skin = await synthesizeSpriteFromImage(svgUrl(astronaut), 'QA 临时素材', p => onProgress?.(`${results.join('\n')}\n正在烘焙验证帧：${p.label}`), sampleRig);
    check(Object.keys(skin.manifest!.states).length === 8 && MOTION_STATES.every(state => skin!.manifest!.states[state]?.frameCount === MOTION_CONFIG[state].frameCount), `实际烘焙：8 状态 / ${TOTAL_MOTION_FRAMES} 帧，按动作节奏分配`);
    const frames = await store.getFrames(skin.id, 'waiting_user');
    const first = new Uint8Array(await frames[0].arrayBuffer());
    const middle = new Uint8Array(await frames[12].arrayBuffer());
    check(first.length !== middle.length || first.some((v, i) => v !== middle[i]), '异步 PNG 编码保留各帧快照，不全部变成末帧');
    const bitmap = await createImageBitmap(frames[6]);
    canvas.getContext('2d')!.clearRect(0, 0, 180, 240); canvas.getContext('2d')!.drawImage(bitmap, 0, 0); bitmap.close();
    const rgba = canvas.getContext('2d')!.getImageData(0, 0, 180, 240).data;
    check(frames[0].type === 'image/png' && rgba[3] === 0 && rgba.some((v, i) => i % 4 === 3 && v === 255), 'PNG alpha：背景透明、角色不透明');
    player.activate(skin); player.setState('waiting_user');
    await waitUntil(() => urls.size === TOTAL_MOTION_FRAMES && !!img.getAttribute('src'));
    check(img.src.startsWith('blob:'), '播放器实际读取 IndexedDB 帧');
    player.pause(); const frozen = img.src;
    await new Promise(resolve => setTimeout(resolve, 100)); check(img.src === frozen, '暂停后帧保持不变');
    player.setState('success'); player.resume();
    check(img.src !== frozen, '暂停期间切状态、恢复后进入成功帧');
    await waitUntil(() => img.dataset.motionState === 'idle');
    check(img.dataset.motionPhase === 'idle', 'PNG 播放器成功后切回真实 idle 帧');
    player.setState('success');
    check(img.dataset.motionState === 'idle', '重复成功通知不会再次庆祝');
    player.setState('success', true);
    check(img.dataset.motionState === 'success', '用户可以明确重播一次动作');
    const quick: SkinMeta = { id: 'qa-timing', nameEn: 'QA', nameZh: 'QA', kind: 'sprite', builtin: true,
      manifest: { states: {
        idle: { frames: [{ src: svgUrl(noHands) }, { src: svgUrl(astronaut) }], fps: 60 },
        waiting_user: { frames: [{ src: svgUrl(astronaut) }, { src: svgUrl(noHands) }], fps: 60,
          loop: false, returnToIdle: true, repeatAfterMs: 1000 },
        error: { frames: [{ src: svgUrl(astronaut) }, { src: svgUrl(noHands) }], fps: 10, loop: false },
      } } };
    player.activate(quick); player.setState('waiting_user');
    await waitUntil(() => img.dataset.motionPhase === 'idle');
    player.pause(); const paused = img.src;
    await wait(120);
    check(img.src === paused, '提醒休息期间暂停，帧与提醒时钟均冻结');
    player.resume();
    await waitUntil(() => img.dataset.motionPhase === 'action');
    check(img.dataset.motionState === 'waiting_user', '真实播放器休息后可以再次提醒');
    player.setState('error');
    await wait(100); player.pause(); const midFrame = img.src;
    player.resume();
    check(img.src === midFrame, '普通动画暂停恢复保持当前进度，不从头重播');
    await wait(180);
    const lastFrame = img.src; player.setState('error');
    check(img.src === lastFrame, '旧版非循环素材结束后，重复事件不重置末帧');
    const embedded: SkinMeta = { id: 'qa-embedded', nameEn: 'QA', nameZh: 'QA', kind: 'sprite', builtin: true,
      manifest: { states: { idle: { frames: [{ src: svgUrl(noHands) }], fps: 1 } } } };
    player.activate(embedded); player.setState('error');
    check(urls.size === 0 && img.src.startsWith('data:'), '切皮肤释放旧 URL；缺失状态回退 idle');
    // Deterministic race: leave immediately, before IDB request callbacks can run.
    player.activate(skin); player.deactivate();
    await new Promise(resolve => setTimeout(resolve, 200));
    check(urls.size === 0 && !img.getAttribute('src'), 'IDB 读取中退出：旧请求不创建 URL、不复活播放器');
    player.activate(skin); player.activate(embedded); player.setState('idle');
    await new Promise(resolve => setTimeout(resolve, 200));
    check(urls.size === 0 && img.src.startsWith('data:'), '快速切皮肤：旧读取不覆盖新素材');
  } finally {
    player.deactivate();
    URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke;
    if (skin) await store.deleteSkin(skin.id);
    canvas.width = canvas.height = 0;
  }
  check(urls.size === 0, '验证结束：对象 URL 全部释放');
  if (skin) check((await store.getFrames(skin.id, 'idle')).length === 0, '验证临时 IDB 帧已删除');
  results.push(`完成：${results.length} 项通过（真实浏览器执行）`);
  return results;
}
