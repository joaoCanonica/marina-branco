/**
 * JSON-LD da clínica. A unidade fixa (Lages) é a entidade principal; outra
 * unidade só entra (como `department`) se ambas tiverem endereço real, sem
 * CONFIRMAR. Nunca inclui serviços (e jamais serviço sensível ou rota reservada).
 */
import type { Profile } from './esquemas.ts';

const real = (v: unknown) => !JSON.stringify(v ?? '').includes('CONFIRMAR');

type Unidade = Profile['unidades'][number];

function local(p: Profile, u: Unidade, tipo: string) {
  return {
    '@type': tipo,
    name: u.fixa ? p.nomeClinica : `${p.nomeClinica} — ${u.cidade}`,
    address: { '@type': 'PostalAddress', streetAddress: u.endereco, addressLocality: u.cidade, addressRegion: u.uf, addressCountry: 'BR' },
  };
}

/** Retorna o objeto JSON-LD ou null (sem endereço real da unidade principal, não há schema). */
export function schemaClinica(p: Profile, url: string): Record<string, unknown> | null {
  const principal = p.unidades.find((u) => u.fixa);
  if (!principal || !real(principal.endereco) || !real(p.nomeClinica)) return null;
  // Tipo neutro: sem conselho médico, não se declara MedicalClinic.
  const tipo = p.perfilRegulatorio === 'cfm' ? 'MedicalClinic' : 'HealthAndBeautyBusiness';
  const outras = p.unidades.filter((u) => u !== principal && real(u.endereco) && real(u.cidade));
  const telefone = real(p.telefone) ? p.telefone : undefined;
  return {
    '@context': 'https://schema.org',
    ...local(p, principal, tipo),
    url,
    ...(telefone ? { telephone: telefone } : {}),
    ...(outras.length ? { department: outras.map((u) => local(p, u, tipo)) } : {}),
  };
}
