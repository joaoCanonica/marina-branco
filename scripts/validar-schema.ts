// Valida todo JSON-LD do dist/ contra schema.org 28.1 (offline). Uso: pnpm schema:validar (após o build)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { carregarVocabulario, validarJsonLd } from '../src/lib/validar-jsonld.ts';

const raiz = process.cwd();
const voc = carregarVocabulario(join(raiz, 'vendor/schemaorg-28.1.jsonld'));
const htmls = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? htmls(p) : p.endsWith('.html') ? [p] : []; });
let blocos = 0; const erros: string[] = []; const tipos = new Map<string, number>();
for (const f of htmls(join(raiz, 'dist'))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    blocos++;
    let obj: unknown;
    try { obj = JSON.parse(m[1]!); } catch { erros.push(`${f}: JSON inválido`); continue; }
    const t = (obj as { '@type'?: string })['@type'] ?? '?'; tipos.set(t, (tipos.get(t) ?? 0) + 1);
    if ((obj as { '@context'?: string })['@context'] !== 'https://schema.org') erros.push(`${f}: @context ausente`);
    erros.push(...validarJsonLd(obj, voc).map((e) => `${f.replace(raiz + '/', '')}: ${e}`));
  }
}
console.log(`JSON-LD: ${blocos} bloco(s) — ${[...tipos].map(([t, n]) => `${t}×${n}`).join(', ')}`);
for (const e of erros) console.error('ERRO:', e);
process.exit(erros.length ? 1 : 0);
