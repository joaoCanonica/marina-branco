/**
 * Gera public/og.png (1200 × 630) — imagem de compartilhamento, sem foto de
 * paciente: preto, monograma tipográfico, nome, cidades e a curva dourada.
 * Uso: pnpm og (rodar quando mudar nome, cidades ou identidade).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { paleta } from '../src/config/theme.config.ts';
import { profile } from '../src/config/profile.config.ts';
import { marca } from '../src/config/marca.config.ts';

const raiz = process.cwd();
const fonte = (a: string) => `data:font/woff2;base64,${readFileSync(join(raiz, 'node_modules', a)).toString('base64')}`;
const bodoni = fonte('@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-opsz-normal.woff2');
const figtree = fonte('@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2');
const nome = profile.nome;
const complemento = profile.nomeClinica.replace(nome, '').trim();
const cidades = profile.unidades.map((u) => `${u.cidade}`).join(' · ') + ` · ${profile.unidades[0]!.uf}`;
const iniciais = nome.split(/\s+/).map((p) => p[0]).slice(0, 2).join('');

const html = `<!doctype html><html><head><style>
@font-face{font-family:B;src:url(${bodoni}) format('woff2')}
@font-face{font-family:F;src:url(${figtree}) format('woff2');font-weight:100 900}
html,body{margin:0;width:1200px;height:630px;background:${paleta.preto};color:${paleta.marfim};overflow:hidden}
.m{position:absolute;right:80px;top:50%;transform:translateY(-52%);font:italic 400 260px/1 B;color:${paleta.ouro};opacity:.9;letter-spacing:-20px}
.t{position:absolute;left:80px;top:170px}
h1{font:400 92px/1 B;margin:0;letter-spacing:1px}
p{font:600 22px/1.4 F;letter-spacing:8px;text-transform:uppercase;color:${paleta.ouroClaro};margin:22px 0 0}
.c{font:500 24px/1 F;letter-spacing:3px;color:${paleta.marfimSuave};text-transform:none;margin-top:60px}
svg{position:absolute;left:80px;top:360px;width:520px;height:24px}
.b{position:absolute;inset:28px;border:1px solid ${paleta.ouro};opacity:.6}
</style></head><body><div class="b"></div><div class="m">${iniciais}</div>
<div class="t"><h1>${nome}</h1><p>${complemento}</p></div>
<svg viewBox="${marca.curva.viewBox}" preserveAspectRatio="none"><path d="${marca.curva.area}" fill="${paleta.ouro}"/></svg>
<div class="t" style="top:420px"><p class="c">${cidades}</p></div></body></html>`;

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: join(raiz, 'public/og.png') });
await b.close();
console.log('public/og.png gerada (1200 × 630)');
