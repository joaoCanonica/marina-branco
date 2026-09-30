// Gera derivados em src/assets/media/ (fora do git) a partir de media.manifest.json.
// Operações permitidas, e só estas: cobertura sólida opaca (coordenadas do original)
// e recorte (crop / edições "recorte"). Sem retoque, suavização, cor, luz ou forma.
// O original é só lido e o sha256 é conferido.
//
// Produção (SITE_ENV=production): gera SOMENTE `publicavel: true` e falha se algum
// deles tiver impedimento. Dev/preview: gera também `previewOk: true`, marcados
// como provisórios no índice (o componente mostra o selo PROVISÓRIO).
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ambiente, impedimentosProducao, lerManifesto, raiz } from './lib/manifesto.mjs';

const SAIDA = path.join(raiz, 'src/assets/media');
const LARGURAS = [480, 800, 1200, 1600];

/** Aplica coberturas e recortes; devolve buffer sem metadados (EXIF/GPS descartados). */
export async function derivar(item, buf) {
  const coberturas = item.edicoes.filter((e) => e.tipo === 'cobertura');
  let img = sharp(buf);
  if (coberturas.length) {
    img = sharp(
      await img
        .composite(coberturas.map(({ regiao: r }) => ({
          input: { create: { width: r.w, height: r.h, channels: 3, background: '#000000' } },
          left: r.x,
          top: r.y,
        })))
        .png()
        .toBuffer(),
    );
  }
  // Recortes em sequência: crop do item e depois edições "recorte" (coordenadas do original).
  const recortes = [item.crop, ...item.edicoes.filter((e) => e.tipo === 'recorte').map((e) => e.regiao)].filter(Boolean);
  if (recortes.length) {
    // Interseção de todos os recortes, para que sejam sempre relativos ao original.
    const x = Math.max(...recortes.map((r) => r.x));
    const y = Math.max(...recortes.map((r) => r.y));
    const x2 = Math.min(...recortes.map((r) => r.x + r.w));
    const y2 = Math.min(...recortes.map((r) => r.y + r.h));
    if (x2 <= x || y2 <= y) throw new Error(`${item.id}: recortes sem interseção`);
    img = img.extract({ left: x, top: y, width: x2 - x, height: y2 - y });
  }
  return img.png().toBuffer();
}

export async function lerOriginal(item) {
  const buf = await readFile(path.join(raiz, item.arquivo));
  const hash = createHash('sha256').update(buf).digest('hex');
  if (hash !== item.sha256) throw new Error(`${item.id}: sha256 do original não confere (o original foi alterado?)`);
  if (buf.length !== item.bytes) throw new Error(`${item.id}: tamanho do original não confere`);
  return buf;
}

async function main() {
  const amb = ambiente();
  const manifesto = await lerManifesto();

  const selecionados = manifesto.itens.filter((i) => i.tipo === 'imagem' && (i.publicavel || (!amb.producao && i.previewOk)));
  const erros = [];
  for (const i of manifesto.itens.filter((i) => i.publicavel)) {
    const imp = impedimentosProducao(i);
    if (imp.length && amb.producao) erros.push(`${i.id}: publicavel=true com ${imp.join(', ')}`);
  }
  if (erros.length) throw new Error(`prepare-media bloqueado em produção:\n  ${erros.join('\n  ')}`);

  await rm(SAIDA, { recursive: true, force: true });
  await mkdir(SAIDA, { recursive: true });
  const indice = {};
  for (const item of selecionados) {
    const base = await derivar(item, await lerOriginal(item));
    const { width, height } = await sharp(base).metadata();
    const provisorio = !item.publicavel || impedimentosProducao(item).length > 0;
    const larguras = [...new Set([...LARGURAS.filter((w) => w < width), width])];
    const variantes = { avif: [], webp: [] };
    for (const w of larguras) {
      for (const fmt of ['avif', 'webp']) {
        const nome = `${item.id}-${w}.${fmt}`;
        const pipe = sharp(base).resize({ width: w, withoutEnlargement: true });
        await (fmt === 'avif' ? pipe.avif({ quality: 70 }) : pipe.webp({ quality: 85 })).toFile(path.join(SAIDA, nome));
        variantes[fmt].push({ arquivo: nome, largura: w });
      }
    }
    indice[item.id] = {
      alt: item.alt,
      largura: width,
      altura: height,
      provisorio,
      srcset: Object.fromEntries(Object.entries(variantes).map(([f, v]) => [f, v.map((x) => `${x.arquivo} ${x.largura}w`).join(', ')])),
    };
    console.log(`media: ${item.id} -> ${larguras.length} largura(s)${provisorio ? ' [PROVISÓRIO]' : ''}`);
  }
  await writeFile(path.join(SAIDA, 'index.json'), JSON.stringify({ siteEnv: amb.siteEnv, itens: indice }, null, 2) + '\n');
  console.log(`media: ${selecionados.length} de ${manifesto.itens.length} item(ns) gerado(s) para SITE_ENV=${amb.siteEnv}`);
}

if (import.meta.filename === process.argv[1]) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
