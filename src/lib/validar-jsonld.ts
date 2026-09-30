/**
 * Validador offline de JSON-LD contra o vocabulário oficial schema.org
 * (vendor/schemaorg-28.1.jsonld): todo @type existe; toda propriedade existe e
 * é aceita pelo tipo (domínio, incluindo superclasses). Recursivo.
 */
import { readFileSync } from 'node:fs';

type No = { '@id': string; '@type': string | string[]; 'rdfs:subClassOf'?: { '@id': string } | { '@id': string }[]; 'schema:domainIncludes'?: { '@id': string } | { '@id': string }[] };
const lista = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function carregarVocabulario(arquivo: string) {
  const grafo = (JSON.parse(readFileSync(arquivo, 'utf8')) as { '@graph': No[] })['@graph'];
  const classes = new Map<string, string[]>();
  const props = new Map<string, string[]>();
  for (const n of grafo) {
    const tipos = lista(n['@type']);
    const id = n['@id'].replace(/^schema:/, '');
    if (tipos.includes('rdfs:Class')) classes.set(id, lista(n['rdfs:subClassOf']).map((s) => s['@id'].replace(/^schema:/, '')));
    if (tipos.includes('rdf:Property')) props.set(id, lista(n['schema:domainIncludes']).map((s) => s['@id'].replace(/^schema:/, '')));
  }
  const ancestrais = (c: string, visto = new Set<string>()): Set<string> => {
    if (visto.has(c)) return visto;
    visto.add(c);
    for (const p of classes.get(c) ?? []) ancestrais(p, visto);
    return visto;
  };
  return { classes, props, ancestrais };
}

export type Vocabulario = ReturnType<typeof carregarVocabulario>;

export function validarJsonLd(obj: unknown, voc: Vocabulario, caminho = '$'): string[] {
  const erros: string[] = [];
  if (Array.isArray(obj)) { obj.forEach((o, i) => erros.push(...validarJsonLd(o, voc, `${caminho}[${i}]`))); return erros; }
  if (!obj || typeof obj !== 'object') return erros;
  const o = obj as Record<string, unknown>;
  const tipo = o['@type'];
  if (typeof tipo !== 'string') return erros;
  if (!voc.classes.has(tipo)) { erros.push(`${caminho}: @type "${tipo}" não existe em schema.org`); return erros; }
  const anc = voc.ancestrais(tipo);
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('@')) continue;
    const dominio = voc.props.get(k);
    if (!dominio) { erros.push(`${caminho}.${k}: propriedade inexistente em schema.org`); continue; }
    if (!dominio.some((d) => anc.has(d))) erros.push(`${caminho}.${k}: não se aplica a ${tipo}`);
    erros.push(...validarJsonLd(v, voc, `${caminho}.${k}`));
  }
  return erros;
}
