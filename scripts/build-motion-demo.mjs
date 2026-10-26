/** Produce one self-contained HTML: no server, model, CDN or external images. */
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const destination = path.resolve(process.argv[2] ?? 'dist/petdeck-motion-demo.html');
const result = await build({ entryPoints: ['src/motion-demo/main.ts'], bundle: true,
  format: 'iife', target: 'es2020', minify: true, write: false, outfile: 'demo.js' });
const js = result.outputFiles.find(f => f.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script');
const css = result.outputFiles.find(f => f.path.endsWith('.css')).text;
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PetDeck · 单图动作实验室</title><style>${css}</style></head><body><div id="demo"></div><script>${js}</script></body></html>`;
await mkdir(path.dirname(destination), { recursive: true });
await writeFile(destination, html, 'utf8');
console.log(`${destination} (${Buffer.byteLength(html)} bytes)`);
