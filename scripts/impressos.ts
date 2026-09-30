/**
 * Gera a plaquinha A5 (148 × 210 mm) com QR para /avaliar, em SVG e PDF
 * (print/plaquinha-avaliacao.{svg,pdf}). Uso: pnpm impressos
 *  - QR aponta para <domínio>/avaliar (não para o Google direto: o link pode mudar
 *    sem reimprimir). QR escuro sobre claro, zona de silêncio de 4 módulos.
 *  - Identidade preto/ouro a partir de theme.config; fontes self-hosted.
 *  - Com domínio ou link CONFIRMAR, marca "PROVISÓRIO — NÃO IMPRIMIR".
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { chromium } from 'playwright-core';
import { paleta } from '../src/config/theme.config.ts';
import { profile } from '../src/config/profile.config.ts';
import { marca } from '../src/config/marca.config.ts';
import { reputacao } from '../src/config/reputacao.config.ts';

const raiz = process.cwd();
const provisorio = /CONFIRMAR/.test(profile.dominio) || /CONFIRMAR/.test(reputacao.linkAvaliacaoGoogle);
const destino = `${profile.dominio.replace(/\/$/, '')}/avaliar`;

const qr = QRCode.create(destino, { errorCorrectionLevel: 'M' });
const n = qr.modules.size;
const mod = (x: number, y: number) => qr.modules.get(x, y);
let caminho = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (mod(x, y)) caminho += `M${x} ${y}h1v1h-1z`;

const fonte = (arquivo: string) => `data:font/woff2;base64,${readFileSync(join(raiz, 'node_modules', arquivo)).toString('base64')}`;
const bodoni = fonte('@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-opsz-normal.woff2');
const figtree = fonte('@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2');
const nome = profile.nome;
const complemento = profile.nomeClinica.replace(nome, '').trim();
const cidades = profile.unidades.map((u) => u.cidade).join(' · ');

// Coordenadas em mm (viewBox 148 × 210).
const qrLado = 62;
const qrX = (148 - qrLado) / 2;
const qrY = 98;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="148mm" height="210mm" viewBox="0 0 148 210">
  <defs><style>
    @font-face { font-family: 'Bodoni'; src: url(${bodoni}) format('woff2'); }
    @font-face { font-family: 'Figtree'; src: url(${figtree}) format('woff2'); font-weight: 100 900; }
    .display { font-family: 'Bodoni'; }
    .texto { font-family: 'Figtree'; }
  </style></defs>
  <rect width="148" height="210" fill="${paleta.preto}"/>
  <rect x="6" y="6" width="136" height="198" fill="none" stroke="${paleta.ouro}" stroke-width="0.3"/>
  <text x="74" y="36" text-anchor="middle" class="display" font-size="13" fill="${paleta.marfim}" letter-spacing="0.3">${nome}</text>
  <text x="74" y="44" text-anchor="middle" class="texto" font-size="3.2" font-weight="600" letter-spacing="1.1" fill="${paleta.ouroClaro}">${complemento.toUpperCase()}</text>
  <svg x="44" y="48" width="60" height="4" viewBox="${marca.curva.viewBox}" preserveAspectRatio="none"><path d="${marca.curva.area}" fill="${paleta.ouro}"/></svg>
  <text x="74" y="68" text-anchor="middle" class="display" font-size="8.5" fill="${paleta.marfim}">Sua opinião é bem-vinda</text>
  <text x="74" y="78" text-anchor="middle" class="texto" font-size="3.6" fill="${paleta.marfimSuave}">Aponte a câmera do celular para o código</text>
  <text x="74" y="83" text-anchor="middle" class="texto" font-size="3.6" fill="${paleta.marfimSuave}">e deixe sua avaliação no Google.</text>
  <rect x="${qrX - 5}" y="${qrY - 5}" width="${qrLado + 10}" height="${qrLado + 10}" fill="${paleta.marfim}"/>
  <svg x="${qrX}" y="${qrY}" width="${qrLado}" height="${qrLado}" viewBox="-4 -4 ${n + 8} ${n + 8}" shape-rendering="crispEdges"><path d="${caminho}" fill="${paleta.preto}"/></svg>
  <text x="74" y="180" text-anchor="middle" class="texto" font-size="2.9" fill="${paleta.marfimSuave}">Avaliação voluntária: nada é oferecido em troca dela.</text>
  <text x="74" y="185" text-anchor="middle" class="texto" font-size="2.9" fill="${paleta.marfimSuave}">Não é preciso mencionar procedimentos ou dados de saúde.</text>
  <text x="74" y="196" text-anchor="middle" class="texto" font-size="3" letter-spacing="0.6" fill="${paleta.ouroClaro}">${cidades}</text>
  ${provisorio ? `<rect x="6" y="88" width="136" height="7" fill="${paleta.alerta}"/><text x="74" y="93" text-anchor="middle" class="texto" font-size="3.6" font-weight="700" letter-spacing="0.4" fill="${paleta.alertaTexto}">PROVISÓRIO — NÃO IMPRIMIR (domínio ou link a confirmar)</text>` : ''}
</svg>
`;

const saida = join(raiz, 'print');
mkdirSync(saida, { recursive: true });
writeFileSync(join(saida, 'plaquinha-avaliacao.svg'), svg);

const navegador = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
// 148 × 210 mm a 96 dpi ≈ 559 × 794 px; escala 3 para a prévia PNG.
const pagina = await navegador.newPage({ viewport: { width: 559, height: 794 }, deviceScaleFactor: 3 });
await pagina.setContent(`<!doctype html><html><head><style>@page{size:148mm 210mm;margin:0}html,body{margin:0}svg{display:block}</style></head><body>${svg}</body></html>`);
await pagina.pdf({ path: join(saida, 'plaquinha-avaliacao.pdf'), width: '148mm', height: '210mm', printBackground: true });
await pagina.screenshot({ path: join(saida, 'plaquinha-avaliacao.png'), fullPage: true });
await navegador.close();
console.log(`print/plaquinha-avaliacao.{svg,pdf,png} → QR: ${destino}${provisorio ? '  [PROVISÓRIO: domínio/link com CONFIRMAR]' : ''}`);
