/**
 * Artigos de /leitura (src/conteudo/artigos/<slug>.md).
 * Regras: pesquisa em docs/pesquisa/artigo-<slug>.md; 400–700 palavras no corpo;
 * toda citação [n] ligada à lista "## Fontes" e toda fonte citada; sem termos
 * vetados. Produção só publica artigo com pesquisa aprovada e revisão datada.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TermoVetado } from '../config/compliance.config.ts';
import { verificarTexto } from './regras/texto.ts';

export interface MetaArtigo {
  slug: string;
  titulo: string;
  descricao: string;
  publicadoEm: string;
  revisadoEm: string;
  revisadoPor: string;
}

export const PALAVRAS_MIN = 400;
export const PALAVRAS_MAX = 700;

/** Frontmatter simples (chave: valor), sem dependência externa. */
export function lerFrontmatter(md: string): { dados: Record<string, string>; corpo: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { dados: {}, corpo: md };
  const dados = Object.fromEntries(
    m[1]!.split('\n').filter((l) => l.includes(':')).map((l) => {
      const i = l.indexOf(':');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')];
    }),
  );
  return { dados, corpo: md.slice(m[0].length) };
}

export function contarPalavras(corpo: string): number {
  const semFontes = corpo.split(/^## Fontes\s*$/m)[0] ?? '';
  return semFontes.replace(/[#*_>\-\[\]()]/g, ' ').split(/\s+/).filter((p) => /[\p{L}\d]/u.test(p)).length;
}

/** Citações [n] ↔ lista numerada em "## Fontes". */
export function verificarCitacoes(md: string): string[] {
  const [corpo, fontes] = md.split(/^## Fontes\s*$/m) as [string, string | undefined];
  if (fontes === undefined) return ['sem seção "## Fontes"'];
  const p: string[] = [];
  const numeradas = new Set([...fontes.matchAll(/^(\d+)\.\s+\S/gm)].map((m) => Number(m[1])));
  if (numeradas.size === 0) p.push('lista de fontes vazia');
  const citadas = new Set([...corpo.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  for (const c of citadas) if (!numeradas.has(c)) p.push(`citação [${c}] sem fonte correspondente`);
  for (const n of numeradas) if (!citadas.has(n)) p.push(`fonte ${n} listada mas não citada`);
  return p;
}

export function pesquisaArtigoAprovada(raiz: string, slug: string): boolean {
  const f = join(raiz, 'docs/pesquisa', `artigo-${slug}.md`);
  return existsSync(f) && /^Status:\s*aprovado\s*$/im.test(readFileSync(f, 'utf8'));
}

export function listarArtigos(raiz: string): (MetaArtigo & { md: string })[] {
  const dir = join(raiz, 'src/conteudo/artigos');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const md = readFileSync(join(dir, f), 'utf8');
    const { dados } = lerFrontmatter(md);
    return {
      slug: f.replace(/\.md$/, ''),
      titulo: dados['titulo'] ?? '',
      descricao: dados['descricao'] ?? '',
      publicadoEm: dados['publicadoEm'] ?? '',
      revisadoEm: dados['revisadoEm'] ?? '',
      revisadoPor: dados['revisadoPor'] ?? '',
      md,
    };
  });
}

/** Motivos que impedem o artigo de ser publicado em produção. */
export function pendenciasArtigo(raiz: string, a: MetaArtigo): string[] {
  const p: string[] = [];
  if (!pesquisaArtigoAprovada(raiz, a.slug)) p.push(`docs/pesquisa/artigo-${a.slug}.md sem "Status: aprovado"`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.revisadoEm)) p.push('revisadoEm não preenchido (AAAA-MM-DD)');
  if (/CONFIRMAR/.test(a.revisadoPor) || !a.revisadoPor) p.push('revisadoPor não preenchido');
  return p;
}

/** Erros de conteúdo (valem em qualquer ambiente). */
export function verificarArtigos(raiz: string, termos: TermoVetado[]): string[] {
  const erros: string[] = [];
  for (const a of listarArtigos(raiz)) {
    const pre = `artigo ${a.slug}`;
    const { corpo } = lerFrontmatter(a.md);
    if (!a.titulo || !a.descricao || !/^\d{4}-\d{2}-\d{2}$/.test(a.publicadoEm)) erros.push(`${pre}: frontmatter incompleto (titulo, descricao, publicadoEm)`);
    if (!existsSync(join(raiz, 'docs/pesquisa', `artigo-${a.slug}.md`))) erros.push(`${pre}: sem pesquisa em docs/pesquisa/artigo-${a.slug}.md`);
    const n = contarPalavras(corpo);
    if (n < PALAVRAS_MIN || n > PALAVRAS_MAX) erros.push(`${pre}: ${n} palavras (esperado ${PALAVRAS_MIN}–${PALAVRAS_MAX})`);
    for (const c of verificarCitacoes(corpo)) erros.push(`${pre}: ${c}`);
    for (const o of verificarTexto(`${a.titulo}\n${a.descricao}\n${corpo}`, termos)) erros.push(`${pre}: ${o.motivo} — "${o.trecho}"`);
  }
  return erros;
}
