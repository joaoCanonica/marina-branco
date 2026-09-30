/**
 * Regras do conteúdo de procedimentos (src/conteudo/servicos/<id>.md):
 *  - todo texto tem pesquisa correspondente em docs/pesquisa/<id>.md;
 *  - toda citação [n] aponta para um item da lista "## Fontes";
 *  - sem termos vetados do perfil;
 *  - todo serviço com paginaPropria tem texto.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { termosSensiveis, type TermoVetado } from '../config/compliance.config.ts';
import type { Servico } from './esquemas.ts';
import { verificarTexto } from './regras/texto.ts';

export interface ProblemaConteudo { id: string; msg: string }

export function verificarTextoProcedimento(id: string, md: string, termos: TermoVetado[]): ProblemaConteudo[] {
  const p: ProblemaConteudo[] = [];
  const [corpo, fontes] = md.split(/^## Fontes\s*$/m) as [string, string | undefined];
  if (fontes === undefined) return [{ id, msg: 'sem seção "## Fontes"' }];
  const numeradas = new Set([...fontes.matchAll(/^(\d+)\.\s+\S/gm)].map((m) => Number(m[1])));
  if (numeradas.size === 0) p.push({ id, msg: 'lista de fontes vazia' });
  const citadas = new Set([...corpo.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  for (const c of citadas) if (!numeradas.has(c)) p.push({ id, msg: `citação [${c}] sem fonte correspondente` });
  for (const n of numeradas) if (!citadas.has(n)) p.push({ id, msg: `fonte ${n} listada mas não citada` });
  const secoes = ['O que é', 'Para quem costuma ser indicado', 'Como é a avaliação', 'Como é o procedimento', 'Riscos e cuidados', 'O que esperar'];
  for (const s of secoes) if (!new RegExp(`^## ${s}`, 'm').test(corpo)) p.push({ id, msg: `falta a seção "${s}"` });
  if (/ideal para/i.test(md)) p.push({ id, msg: 'não usar "ideal para"' });
  for (const o of verificarTexto(md, termos)) p.push({ id, msg: `${o.motivo} — "${o.trecho}"` });
  return p;
}

export function verificarConteudo(raiz: string, servicos: Servico[], termos: TermoVetado[]): ProblemaConteudo[] {
  const dir = join(raiz, 'src/conteudo/servicos');
  const arquivos = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
  const p: ProblemaConteudo[] = [];
  for (const f of arquivos) {
    const id = f.replace(/\.md$/, '');
    if (!existsSync(join(raiz, 'docs/pesquisa', `${id}.md`))) p.push({ id, msg: `texto sem pesquisa em docs/pesquisa/${id}.md` });
    if (!servicos.some((s) => s.id === id)) p.push({ id, msg: 'texto de serviço que não existe em servicos.config.ts' });
    const sensivel = servicos.find((s) => s.id === id)?.sensivel ?? false;
    p.push(...verificarTextoProcedimento(id, readFileSync(join(dir, f), 'utf8'), sensivel ? [...termos, ...termosSensiveis] : termos));
  }
  for (const s of servicos)
    if (s.paginaPropria && !arquivos.includes(`${s.id}.md`)) p.push({ id: s.id, msg: 'paginaPropria sem texto em src/conteudo/servicos' });
  return p;
}
