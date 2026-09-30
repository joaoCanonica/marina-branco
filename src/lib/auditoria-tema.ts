/** Verificações do design system usadas por scripts/validate-config.ts e testes. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { coresLiterais, verificarTema } from './cor.ts';

/** Únicos arquivos onde cor literal é permitida. */
const PERMITIDOS = ['src/config/theme.config.ts', 'src/lib/cor.ts'];

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}

export function auditarTema(raiz: string): string[] {
  const erros: string[] = [];
  for (const c of verificarTema())
    if (!c.ok) erros.push(`contraste ${c.tom}/${c.modo} ${c.par}: ${c.razao.toFixed(2)}:1 (mínimo ${c.minimo}:1)`);
  for (const f of arquivos(join(raiz, 'src')).filter((f) => /\.(astro|css|ts|tsx|mjs)$/.test(f))) {
    const rel = relative(raiz, f);
    if (PERMITIDOS.includes(rel) || rel.startsWith('src/assets/')) continue;
    for (const a of coresLiterais(readFileSync(f, 'utf8'))) erros.push(`cor literal fora dos tokens em ${rel} ${a}`);
  }
  return erros;
}
