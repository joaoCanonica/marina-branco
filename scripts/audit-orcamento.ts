/**
 * Orçamento de JS e regras de imagem/vídeo no dist/ (sem navegador).
 *  - JS por página (externos + inline, gzip): home ≤ 6 KB, demais ≤ 4 KB;
 *  - toda <img> de conteúdo dentro de <picture> com <source type="image/avif">
 *    e srcset WebP, width/height e loading definidos;
 *  - todo <video> com poster e preload="none" (ou "metadata").
 * Uso: `pnpm build && pnpm audit:orcamento`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { htmls } from '../src/lib/auditoria-html.ts';
import { paginas } from './lib/servidor.ts';

export const ORCAMENTO_JS = { home: 6 * 1024, demais: 4 * 1024 };
const dist = join(process.cwd(), 'dist');
const falhas: string[] = [];
const linhas: string[] = [];

for (const f of htmls(dist)) {
  const rota = paginas([f], dist)[0];
  if (!rota) continue;
  const html = readFileSync(f, 'utf8');
  let js = '';
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1]!;
    if (/type="application\/ld\+json"/.test(attrs)) continue;
    const src = attrs.match(/\bsrc="([^"]+)"/)?.[1];
    if (src) { const a = join(dist, src); if (existsSync(a)) js += readFileSync(a, 'utf8'); }
    else js += m[2];
  }
  const kb = gzipSync(js, { level: 9 }).length;
  const limite = rota === '/' ? ORCAMENTO_JS.home : ORCAMENTO_JS.demais;
  linhas.push(`${rota.padEnd(48)} ${(kb / 1024).toFixed(2)} KB / ${(limite / 1024).toFixed(0)} KB`);
  if (kb > limite) falhas.push(`${rota}: JS ${(kb / 1024).toFixed(2)} KB gzip > ${(limite / 1024).toFixed(0)} KB`);

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (/\.svg"/.test(tag) || /data-decorativa/.test(tag)) continue;
    const antes = html.slice(Math.max(0, m.index! - 2000), m.index!);
    if (!/<picture\b[^>]*>[\s\S]*<source type="image\/avif"[^>]*srcset=/.test(antes)) falhas.push(`${rota}: <img> sem <picture> AVIF — ${tag.slice(0, 80)}`);
    if (!/srcset="[^"]*\.webp/.test(tag)) falhas.push(`${rota}: <img> sem srcset WebP`);
    if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) falhas.push(`${rota}: <img> sem width/height`);
    if (!/\bloading="(lazy|eager)"/.test(tag)) falhas.push(`${rota}: <img> sem loading`);
  }
  for (const m of html.matchAll(/<video\b[^>]*>/g)) {
    if (!/\bposter="/.test(m[0])) falhas.push(`${rota}: <video> sem poster`);
    if (!/\bpreload="(none|metadata)"/.test(m[0])) falhas.push(`${rota}: <video> sem preload="none"`);
  }
}
console.log(linhas.sort().join('\n'));
if (falhas.length) {
  console.error(`Orçamento/mídia: ${falhas.length} falha(s)`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('Orçamento de JS e regras de imagem/vídeo: OK.');
