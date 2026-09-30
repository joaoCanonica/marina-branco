/**
 * Gera derivados a partir do manifesto. Operações permitidas, e só estas:
 *  - recorte (extract)
 *  - cobertura de identificador / texto de promessa com retângulo sólido opaco
 * Nada de retoque, suavização, cor, luz ou forma. O original é só lido, e o
 * sha256 é conferido antes de derivar. Sem compressão agressiva: qualidade 90.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { midia } from '../src/config/midia.ts';

let falhas = 0;
for (const m of midia) {
  if (!m.derivado) continue;
  const orig = join('midia/originais', m.original);
  if (!existsSync(orig)) { console.warn(`pulando ${m.id}: original ausente (fica fora do repo)`); continue; }
  const buf = readFileSync(orig);
  const hash = createHash('sha256').update(buf).digest('hex');
  if (m.originalSha256 && m.originalSha256 !== hash) { console.error(`${m.id}: sha256 do original mudou`); falhas++; continue; }

  // Coberturas são aplicadas nas coordenadas do original, antes do recorte.
  const meta = await sharp(buf).metadata();
  const coberturas = (m.edicoes ?? []).filter((e) => e.tipo !== 'recorte').map((e) => {
    const [left, top, width, height] = e.area as [number, number, number, number];
    return { input: { create: { width, height, channels: 3 as const, background: '#000000' } }, left, top };
  });
  let img = sharp(buf).rotate(); // só orientação EXIF
  if (coberturas.length) img = sharp(await img.composite(coberturas).toBuffer());
  const recorte = (m.edicoes ?? []).find((e) => e.tipo === 'recorte');
  if (recorte) {
    const [left, top, width, height] = recorte.area as [number, number, number, number];
    img = img.extract({ left, top, width, height });
  }
  // withMetadata não é usado: EXIF (GPS, aparelho) é descartado.
  await img.jpeg({ quality: 90 }).toFile(join('midia/derivados', m.derivado));
  console.log(`${m.id}: ${meta.width}x${meta.height} -> ${m.derivado} (${m.edicoes?.length ?? 0} edição(ões))`);
}
process.exit(falhas ? 1 : 0);
