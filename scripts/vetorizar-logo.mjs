// Gera traçados SVG aproximados do monograma a partir do JPEG 150×150 (original intacto).
// Uso único/manual: node scripts/vetorizar-logo.mjs. Resultado é REFERÊNCIA até chegar o vetor original.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import potrace from 'potrace';
import sharp from 'sharp';
import { raiz } from './lib/manifesto.mjs';

const ORIGINAL = path.join(raiz, 'assets-originais/marca/logo-monograma-mb.jpg');
const SAIDA = path.join(raiz, 'assets-originais/marca/derivados');
const ESCALA = 8;

const { data, info } = await sharp(ORIGINAL).resize({ width: 150 * ESCALA, kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
const n = info.width * info.height;
// Classificação por pixel: fundo (escuro), branco (claro e pouco saturado), ouro (saturado, tom amarelo).
const classe = new Uint8Array(n); // 0 fundo, 1 branco, 2 ouro
const soma = { 0: [0, 0, 0, 0], 1: [0, 0, 0, 0], 2: [0, 0, 0, 0] };
for (let i = 0; i < n; i++) {
  const [r, g, b] = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const c = max < 70 ? 0 : sat > 0.25 && r > b ? 2 : max > 150 ? 1 : 0;
  classe[i] = c;
  soma[c][0] += r; soma[c][1] += g; soma[c][2] += b; soma[c][3]++;
}
const hex = ([r, g, b, k]) => '#' + [r, g, b].map((v) => Math.round(v / Math.max(k, 1)).toString(16).padStart(2, '0')).join('');

async function mascara(filtro) {
  const px = Buffer.alloc(n);
  for (let i = 0; i < n; i++) px[i] = filtro(classe[i]) ? 0 : 255; // potrace traça o escuro
  return sharp(px, { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
}
const tracar = (buf) =>
  new Promise((ok, erro) =>
    potrace.trace(buf, { threshold: 128, turdSize: 40, optTolerance: 0.4, color: 'currentColor', background: 'transparent' }, (e, svg) => (e ? erro(e) : ok(svg))),
  );
const caminhoDe = (svg) => svg.match(/ d="([^"]+)"/)[1];

await mkdir(SAIDA, { recursive: true });
const vb = `0 0 ${info.width} ${info.height}`;
const dBranco = caminhoDe(await tracar(await mascara((c) => c === 1)));
const dOuro = caminhoDe(await tracar(await mascara((c) => c === 2)));
const dTudo = caminhoDe(await tracar(await mascara((c) => c !== 0)));
const cores = { fundo: hex(soma[0]), branco: hex(soma[1]), ouro: hex(soma[2]) };
const cab = `<!-- Traçado aproximado de assets-originais/marca/logo-monograma-mb.jpg (150×150). Referência; substituir pelo vetor original. -->\n`;
const svg = (corpo) => `${cab}<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Monograma MB">${corpo}</svg>\n`;

await writeFile(path.join(SAIDA, 'monograma-mb-mono.svg'), svg(`<path fill="currentColor" fill-rule="evenodd" d="${dTudo}"/>`));
await writeFile(path.join(SAIDA, 'monograma-mb-cor.svg'), svg(`<path fill="${cores.branco}" fill-rule="evenodd" d="${dBranco}"/><path fill="${cores.ouro}" fill-rule="evenodd" d="${dOuro}"/>`));
await writeFile(path.join(SAIDA, 'monograma-mb-cor-fundo-preto.svg'), svg(`<rect width="100%" height="100%" fill="${cores.fundo}"/><path fill="${cores.branco}" fill-rule="evenodd" d="${dBranco}"/><path fill="${cores.ouro}" fill-rule="evenodd" d="${dOuro}"/>`));
await writeFile(path.join(SAIDA, 'cores.json'), JSON.stringify({ origem: 'logo-monograma-mb.jpg (média por classe de pixel)', ...cores }, null, 2) + '\n');
console.log(cores);
