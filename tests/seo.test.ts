import assert from 'node:assert/strict';
import { test } from 'node:test';
import { join } from 'node:path';
import { carregarVocabulario, validarJsonLd } from '../src/lib/validar-jsonld.ts';
import { schemaArtigo, schemaClinica, schemaTrilha } from '../src/lib/schema.ts';
import { profile } from '../src/config/profile.config.ts';
import { contarPalavras, listarArtigos, verificarArtigos, verificarCitacoes } from '../src/lib/artigos.ts';
import { regrasDoPerfil, termosDoPerfil } from '../src/lib/regras/index.ts';
import type { Profile } from '../src/lib/esquemas.ts';

const voc = carregarVocabulario(join(process.cwd(), 'vendor/schemaorg-28.1.jsonld'));
const completo: Profile = {
  ...profile, telefone: '(49) 3000-0000',
  unidades: [
    { id: 'lages', cidade: 'Lages', uf: 'SC', endereco: 'Rua Teste, 335', dias: 'Seg a sex', fixa: true, geo: { lat: -27.8, lng: -50.3 }, horarios: [{ dias: ['Monday'], abre: '09:00', fecha: '18:00' }] },
    { id: 'bc', cidade: 'Balneário Camboriú', uf: 'SC', endereco: 'Av. Teste, 100', dias: 'Sábados', fixa: false },
  ],
};

test('validador acusa tipo e propriedade inexistentes', () => {
  const e = validarJsonLd({ '@type': 'BeautySalon', nome: 'x', address: { '@type': 'Endereco' } }, voc).join('\n');
  assert.match(e, /nome: propriedade inexistente/);
  assert.match(e, /"Endereco" não existe/);
  assert.match(validarJsonLd({ '@type': 'PostalAddress', headline: 'x' }, voc).join('\n'), /não se aplica a PostalAddress/);
});

test('schema da clínica: BeautySalon fora do CFM, MedicalClinic no CFM, nunca Physician; válido no vocabulário', () => {
  const s = schemaClinica(completo, 'https://exemplo.com.br/')!;
  assert.equal(s['@type'], 'BeautySalon');
  assert.deepEqual(validarJsonLd(s, voc), []);
  const cfm = schemaClinica({ ...completo, perfilRegulatorio: 'cfm' }, 'https://exemplo.com.br/')!;
  assert.equal(cfm['@type'], 'MedicalClinic');
  assert.ok(voc.ancestrais('MedicalClinic').has('MedicalBusiness'));
  assert.ok(!JSON.stringify(cfm).includes('Physician'));
  assert.deepEqual(validarJsonLd(cfm, voc), []);
});

test('sameAs só com contas reais do Instagram', () => {
  const s = schemaClinica(completo, 'https://x/')!;
  assert.deepEqual(s['sameAs'], ['https://www.instagram.com/esteticamarinabranco/']);
});

test('BreadcrumbList e Article/MedicalWebPage válidos', () => {
  assert.deepEqual(validarJsonLd(schemaTrilha([{ nome: 'Início', url: 'https://x/' }, { nome: 'Leitura', url: 'https://x/leitura' }]), voc), []);
  const a = { titulo: 'T', descricao: 'D', publicadoEm: '2026-09-30', revisadoEm: '2026-09-30', url: 'https://x/leitura/t', urlSite: 'https://x/' };
  assert.deepEqual(validarJsonLd(schemaArtigo(completo, a), voc), []);
  const m = schemaArtigo({ ...completo, perfilRegulatorio: 'cfm' }, a);
  assert.equal(m['@type'], 'MedicalWebPage');
  assert.deepEqual(validarJsonLd(m, voc), []);
});

test('8 artigos, 400–700 palavras, fontes citadas e sem termos vetados', () => {
  const artigos = listarArtigos(process.cwd());
  assert.equal(artigos.length, 8);
  assert.deepEqual(verificarArtigos(process.cwd(), termosDoPerfil(regrasDoPerfil(profile))), []);
});

test('regras de artigo: contagem e citações', () => {
  assert.equal(contarPalavras('um dois três\n\n## Fontes\n\n1. quatro'), 3);
  assert.deepEqual(verificarCitacoes('texto [1] e [2]\n\n## Fontes\n\n1. A.'), ['citação [2] sem fonte correspondente']);
});
