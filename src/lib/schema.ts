/**
 * JSON-LD. Tipos conferidos em tempo de compilação por `schema-dts`.
 *  - Entidade: BeautySalon (perfis não médicos) ou MedicalClinic (subtipo de
 *    MedicalBusiness, só perfil CFM). Nunca Physician sem médica.
 *  - Lages é a entidade principal; outra unidade entra como `department` só com
 *    endereço real. Sem CONFIRMAR em nada que vá para o schema.
 *  - Nunca inclui serviços nem a rota reservada.
 */
import type { Article, BreadcrumbList, DayOfWeek, MedicalWebPage, OpeningHoursSpecification, WithContext } from 'schema-dts';
import type { Profile } from './esquemas.ts';

const real = (v: unknown) => !JSON.stringify(v ?? '').includes('CONFIRMAR');
type Unidade = Profile['unidades'][number];

function horarios(u: Unidade): OpeningHoursSpecification[] {
  return (u.horarios ?? []).map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dias.map((d) => `https://schema.org/${d}` as DayOfWeek),
    opens: h.abre,
    closes: h.fecha,
  }));
}

function local(p: Profile, u: Unidade) {
  const oh = horarios(u);
  return {
    name: u.fixa ? p.nomeClinica : `${p.nomeClinica} — ${u.cidade}`,
    address: { '@type': 'PostalAddress' as const, streetAddress: u.endereco, addressLocality: u.cidade, addressRegion: u.uf, addressCountry: 'BR' },
    ...(u.geo ? { geo: { '@type': 'GeoCoordinates' as const, latitude: u.geo.lat, longitude: u.geo.lng } } : {}),
    ...(oh.length ? { openingHoursSpecification: oh } : {}),
  };
}

export function sameAs(p: Profile): string[] {
  return p.instagram.filter((i) => real(i.usuario) && /^[\w.]+$/.test(i.usuario)).map((i) => `https://www.instagram.com/${i.usuario}/`);
}

/** Retorna o objeto JSON-LD ou null (sem endereço real da unidade principal, não há schema). */
export function schemaClinica(p: Profile, url: string): WithContext<{ '@type': 'BeautySalon' | 'MedicalClinic' } & Record<string, unknown>> | null {
  const principal = p.unidades.find((u) => u.fixa);
  if (!principal || !real(principal.endereco) || !real(p.nomeClinica)) return null;
  const tipo = p.perfilRegulatorio === 'cfm' ? 'MedicalClinic' : 'BeautySalon';
  const outras = p.unidades.filter((u) => u !== principal && real(u.endereco) && real(u.cidade));
  const links = sameAs(p);
  return {
    '@context': 'https://schema.org',
    '@type': tipo,
    '@id': `${url}#clinica`,
    ...local(p, principal),
    url,
    ...(real(p.telefone) ? { telephone: p.telefone } : {}),
    ...(links.length ? { sameAs: links } : {}),
    ...(outras.length ? { department: outras.map((u) => ({ '@type': tipo, ...local(p, u) })) } : {}),
  };
}

export function schemaTrilha(itens: { nome: string; url: string }[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.nome, item: i.url })),
  };
}

/** Artigo: MedicalWebPage só no perfil CFM; nos demais, Article (sem sugerir autoria médica). */
export function schemaArtigo(
  p: Profile,
  a: { titulo: string; descricao: string; publicadoEm: string; revisadoEm: string; url: string; urlSite: string },
): WithContext<Article> | WithContext<MedicalWebPage> {
  const revisado = /^\d{4}-\d{2}-\d{2}$/.test(a.revisadoEm) ? a.revisadoEm : undefined;
  const comum = {
    name: a.titulo,
    description: a.descricao,
    url: a.url,
    datePublished: a.publicadoEm,
    ...(revisado ? { dateModified: revisado } : {}),
    inLanguage: 'pt-BR',
    publisher: { '@type': 'Organization' as const, name: p.nomeClinica, url: a.urlSite },
  };
  if (p.perfilRegulatorio === 'cfm')
    return { '@context': 'https://schema.org', '@type': 'MedicalWebPage', ...comum, ...(revisado ? { lastReviewed: revisado } : {}) };
  return { '@context': 'https://schema.org', '@type': 'Article', headline: a.titulo, ...comum };
}
