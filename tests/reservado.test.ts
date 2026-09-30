import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schemaClinica } from '../src/lib/schema.ts';
import { profile as real } from '../src/config/profile.config.ts';
import { servicos, defineServico } from '../src/config/servicos.config.ts';
import { rotaReservada } from '../src/config/compliance.config.ts';
import { validar } from '../src/lib/regras/index.ts';
import type { Profile } from '../src/lib/esquemas.ts';

const base = (): Profile => ({
  ...real, nomeClinica: 'Clínica Teste', telefone: '(49) 3000-0000',
  unidades: [
    { id: 'lages', cidade: 'Lages', uf: 'SC', endereco: 'Rua Teste, 335', dias: 'Seg a sex', fixa: true },
    { id: 'bc', cidade: 'Balneário Camboriú', uf: 'SC', endereco: 'CONFIRMAR', dias: 'CONFIRMAR', fixa: false },
  ],
});

test('schema: config real (endereço CONFIRMAR) não gera JSON-LD', () => {
  assert.equal(schemaClinica(real, 'https://x'), null);
});

test('schema: Lages principal; Balneário só com endereço real', () => {
  const p = base();
  const s1 = schemaClinica(p, 'https://x')!;
  assert.equal((s1['address'] as { addressLocality: string }).addressLocality, 'Lages');
  assert.equal(s1['department'], undefined);
  p.unidades[1]!.endereco = 'Av. Teste, 100';
  const s2 = schemaClinica(p, 'https://x')!;
  assert.equal((s2['department'] as unknown[]).length, 1);
  assert.ok(!JSON.stringify(s2).includes(rotaReservada));
});

test('schema: tipo não médico fora do perfil CFM', () => {
  assert.equal(schemaClinica(base(), 'https://x')!['@type'], 'BeautySalon');
});

test('serviço sensível: rota única reservada, noindex, e não está nas rotas públicas', () => {
  const s = servicos.find((x) => x.sensivel)!;
  assert.equal(s.rota, rotaReservada);
  assert.equal(s.noindex, true);
  assert.ok(servicos.filter((x) => !x.sensivel).every((x) => !x.rota.startsWith(rotaReservada)));
});

test('serviço sensível publicável sem executor habilitado: erro mesmo em desenvolvimento', () => {
  const sens = defineServico({ id: 'sens', nome: 'Serviço sensível', categoria: 'procedimento-intimo', invasivo: true, sensivel: true, executor: 'CONFIRMAR', resumo: 'Atendimento reservado.', publicavel: true });
  const r = validar({ profile: real, servicos: [sens], midia: [] }, { producao: false, pesquisaAprovada: () => true });
  assert.ok(r.erros.some((e) => e.includes('sens: invasivo sem executor')));
  assert.ok(r.erros.some((e) => e.includes('sem indicação para a região') || e.includes('sem produto/equipamento')));
});

test('serviço sensível não publicado: só pendência (aviso), rota não gerada', () => {
  const r = validar({ profile: real, servicos, midia: [] }, { producao: false, pesquisaAprovada: () => false });
  assert.ok(r.avisos.some((a) => a.includes('(não publicado) estetica-intima-masculina')));
  assert.ok(!r.erros.some((e) => e.includes('estetica-intima-masculina')));
});
