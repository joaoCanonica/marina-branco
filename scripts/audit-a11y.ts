/**
 * Auditoria de acessibilidade do dist/ (WCAG 2.2 AA), em viewport móvel e desktop:
 *  - axe-core (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa): zero violações;
 *  - teclado: percorre com Tab; todo elemento focado é visível e tem indicador
 *    de foco (outline ou box-shadow); o primeiro Tab chega ao "pular para o conteúdo";
 *  - prefers-reduced-motion: nenhuma animação/transição com duração > 0 após carregar;
 *  - slider antes/depois: input range com rótulo e aria-valuetext atualizado pelas setas.
 * Uso: `pnpm build && pnpm audit:a11y`.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright-core';
import { htmls } from '../src/lib/auditoria-html.ts';
import { CHROME, paginas, servir } from './lib/servidor.ts';

const raiz = process.cwd();
const dist = join(raiz, 'dist');
const axe = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const { url, servidor } = await servir(dist);
const navegador = await chromium.launch({ executablePath: CHROME });
const falhas: string[] = [];
const lista = paginas(htmls(dist), dist);

async function teclado(p: Page, rota: string) {
  await p.keyboard.press('Tab');
  await p.waitForTimeout(50); // reduced-motion encurta transições a 0,01 ms; espera o frame
  const primeiro = await p.evaluate(() => (document.activeElement as HTMLElement | null)?.getAttribute('href'));
  if (primeiro !== '#conteudo') falhas.push(`${rota}: primeiro Tab não leva ao "pular para o conteúdo" (foi ${primeiro})`);
  for (let i = 0; i < 40; i++) {
    const r = await p.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      const indicador = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2) || (s.boxShadow !== 'none' && s.boxShadow !== '');
      return { nome: el.tagName + (el.id ? '#' + el.id : '') + ' ' + (el.textContent ?? '').trim().slice(0, 30), indicador, visivel: b.width > 0 && b.height > 0 };
    });
    if (!r) break;
    if (!r.indicador) falhas.push(`${rota}: foco sem indicador visível em ${r.nome}`);
    if (!r.visivel) falhas.push(`${rota}: foco em elemento invisível ${r.nome}`);
    await p.keyboard.press('Tab');
    await p.waitForTimeout(50);
  }
}

for (const [rotulo, viewport] of [['móvel', { width: 390, height: 844 }], ['desktop', { width: 1366, height: 900 }]] as const) {
  const ctx = await navegador.newContext({ viewport, reducedMotion: 'reduce', bypassCSP: true });
  for (const rota of lista) {
    const p = await ctx.newPage();
    await p.goto(url + rota, { waitUntil: 'load' });
    await p.addScriptTag({ content: axe });
    const res = await p.evaluate(async () => {
      // @ts-expect-error axe injetado
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      return (r.violations as { id: string; impact: string; nodes: { target: string[] }[] }[]).map((v) => `${v.id} (${v.impact}) em ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
    });
    for (const v of res) falhas.push(`${rota} [${rotulo}] axe: ${v}`);
    const animadas = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && Number(a.effect?.getComputedTiming().duration ?? 0) > 1).length);
    if (animadas) falhas.push(`${rota} [${rotulo}]: ${animadas} animação(ões) rodando com prefers-reduced-motion`);
    if (rotulo === 'desktop') await teclado(p, rota);
    const slider = await p.$('input[type="range"]');
    if (slider) {
      const rotuloOk = await slider.evaluate((el) => !!((el as HTMLInputElement).labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')));
      if (!rotuloOk) falhas.push(`${rota}: slider sem rótulo`);
      await slider.focus();
      const antes = await slider.getAttribute('aria-valuetext');
      await p.keyboard.press('ArrowRight');
      if ((await slider.getAttribute('aria-valuetext')) === antes) falhas.push(`${rota}: slider não atualiza aria-valuetext pelo teclado`);
    }
    await p.close();
  }
  await ctx.close();
}
await navegador.close();
servidor.close();

if (falhas.length) {
  console.error(`Acessibilidade: ${falhas.length} falha(s) em ${lista.length} página(s)`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`Acessibilidade: OK — ${lista.length} página(s) × 2 viewports (axe WCAG 2.2 AA, teclado, foco, reduced-motion, slider).`);
