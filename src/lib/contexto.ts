/** Monta dados + ambiente a partir do disco. Só roda em Node (build/scripts). */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { profile } from '../config/profile.config.ts';
import { servicos } from '../config/servicos.config.ts';
import { lerAmbiente } from './ambiente.ts';
import type { ItemMidia } from './esquemas.ts';
import type { Ambiente, Dados } from './regras/index.ts';

export function lerMidia(raiz: string): ItemMidia[] {
  const f = join(raiz, 'media.manifest.json');
  return existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as { itens: ItemMidia[] }).itens : [];
}

export function dados(raiz: string): Dados {
  return { profile, servicos, midia: lerMidia(raiz) };
}

export function pesquisaAprovada(raiz: string, id: string): boolean {
  const f = join(raiz, 'docs/pesquisa', `${id}.md`);
  return existsSync(f) && /^Status:\s*aprovado\s*$/im.test(readFileSync(f, 'utf8'));
}

export function ambiente(raiz: string): Ambiente & ReturnType<typeof lerAmbiente> {
  return { ...lerAmbiente(), pesquisaAprovada: (id) => pesquisaAprovada(raiz, id) };
}
