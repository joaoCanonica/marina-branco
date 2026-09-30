/** Monta dados + ambiente a partir do disco. Só roda em Node (build/scripts). */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { clinica } from '../config/clinica.ts';
import { equipamentos } from '../config/equipamentos.ts';
import { habilitacoes } from '../config/habilitacoes.ts';
import { midia } from '../config/midia.ts';
import { profissionais } from '../config/profissionais.ts';
import { servicos } from '../config/servicos.ts';
import { lerAmbiente } from './ambiente.ts';
import type { Ambiente, Dados } from './regras/index.ts';

export const dados: Dados = { clinica, profissionais, habilitacoes, equipamentos, servicos, midia };

export function pesquisaAprovada(raiz: string, slug: string): boolean {
  const f = join(raiz, 'docs/pesquisa', `${slug}.md`);
  return existsSync(f) && /^Status:\s*aprovado\s*$/im.test(readFileSync(f, 'utf8'));
}

export function ambiente(raiz: string): Ambiente & ReturnType<typeof lerAmbiente> {
  return { ...lerAmbiente(), pesquisaAprovada: (s) => pesquisaAprovada(raiz, s) };
}

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}

/** IDs de mídia usados no código: <Midia id="..." />. */
export function midiaReferenciada(raiz: string): string[] {
  const ids = new Set<string>();
  for (const f of arquivos(join(raiz, 'src')).filter((f) => /\.(astro|ts|mdx?)$/.test(f)))
    for (const m of readFileSync(f, 'utf8').matchAll(/<Midia\b[^>]*\bid="([a-z0-9-]+)"/g)) ids.add(m[1]!);
  return [...ids];
}
