import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defineServico } from '../src/config/servicos.config.ts';
import { profile as profileReal } from '../src/config/profile.config.ts';
import { servicos as servicosReais } from '../src/config/servicos.config.ts';
import type { ItemMidia, Profile } from '../src/lib/esquemas.ts';
import { servicosPublicaveis, termosDoPerfil, regrasDoPerfil, validar, type Ambiente, type Dados } from '../src/lib/regras/index.ts';
import { verificarTexto } from '../src/lib/regras/texto.ts';
import { habilitacoes } from '../src/config/compliance.config.ts';

const conferido = { em: '2026-09-01', por: 'Equipe' };
const prod: Ambiente = { producao: true, pesquisaAprovada: () => false };
const dev: Ambiente = { ...prod, producao: false };

/** Dados de teste completos e válidos: biomédica (CFBM) com habilitação conferida. */
function valido(): Dados {
  const profile: Profile = {
    nome: 'Pessoa Teste',
    nomeClinica: 'Clínica Teste',
    tratamento: '',
    titulo: 'Biomédica esteta',
    conselho: { sigla: 'CFBM', numero: '12345', uf: 'SC' },
    perfilRegulatorio: 'cfbm',
    responsavelId: 'exec',
    equipe: [{ id: 'exec', nome: 'Pessoa Teste', titulo: 'Biomédica esteta', tratamento: '', conselho: 'CFBM', registro: { numero: '12345', uf: 'SC' }, rqe: [], registroConferido: conferido, funcao: 'Responsável técnica', fotoId: null }],
    unidades: [{ id: 'lages', cidade: 'Lages', uf: 'SC', endereco: 'Rua X, 335', dias: 'Seg a sex', fixa: true }],
    instagram: [{ rotulo: 'Clínica', usuario: 'clinica.teste' }],
    whatsapp: '5549999999999',
    telefone: '(49) 3000-0000',
    cnpj: '00.000.000/0001-00',
    alvaraSanitario: '123',
    encarregadoLgpd: { nome: 'Encarregada', contato: 'lgpd@exemplo.com' },
    dominio: 'https://exemplo.com.br',
  };
  const servicos = [
    defineServico({
      id: 'labial', nome: 'Preenchimento labial', categoria: 'injetavel', invasivo: true, sensivel: false, executor: 'exec',
      produto: { descricao: 'Preenchedor injetável', registroAnvisa: '80000000001', registroConferido: { ...conferido, url: 'https://consultas.anvisa.gov.br/' } },
      resumo: 'Procedimento injetável indicado após avaliação.', publicavel: true, midiaIds: ['foto-ok'],
    }),
  ];
  const midia: ItemMidia[] = [{ id: 'foto-ok', consentimento: 'ok', autoria: 'propria', publicavel: true, previewOk: false, ocr: { ok: true }, problemas: [], pacienteRef: 'P-001' }];
  const habs = habilitacoes.map((h) => (h.conselho === 'CFBM' && h.categoria === 'injetavel' ? { ...h, conferido: { ...conferido, url: 'https://exemplo.gov.br/norma' } } : h));
  return { profile, servicos, midia, habilitacoes: habs };
}

test('dados de teste válidos passam em produção', () => {
  const r = validar(valido(), prod);
  assert.deepEqual(r.erros, []);
  assert.equal(servicosPublicaveis(valido(), prod).length, 1);
});

test('config real (incompleta) bloqueia produção com mensagens por grupo', () => {
  const r = validar({ profile: profileReal, servicos: servicosReais, midia: [] }, prod);
  assert.ok(r.erros.length > 0);
  assert.ok(r.erros.some((e) => e === '[Identidade profissional] profile.titulo com CONFIRMAR'));
  assert.ok(r.erros.some((e) => e === '[Outros campos CONFIRMAR] profile.cnpj com CONFIRMAR'));
  // Serviços não publicados não bloqueiam, mas aparecem como aviso.
  assert.ok(r.avisos.some((a) => a.includes('(não publicado) preenchimento-labial: invasivo sem executor')));
});

test('config real: em dev tudo vira aviso', () => {
  const r = validar({ profile: profileReal, servicos: servicosReais, midia: [] }, dev);
  assert.deepEqual(r.erros, []);
  assert.ok(r.avisos.length > 0);
});

test('(a) perfil CONFIRMAR bloqueia', () => {
  const d = valido();
  d.profile.perfilRegulatorio = 'CONFIRMAR';
  assert.ok(validar(d, prod).erros.some((e) => e.includes('perfilRegulatorio é CONFIRMAR')));
});

test('(a) "Dra." com perfil sem conselho bloqueia; com CFM e CRM passa', () => {
  const d = valido();
  d.profile.perfilRegulatorio = 'estetica-sem-conselho';
  d.profile.conselho = null;
  d.profile.tratamento = 'Dra.';
  assert.ok(validar(d, prod).erros.some((e) => e.includes('tratamento "Dra." não é comportado')));

  const m = valido();
  m.profile.perfilRegulatorio = 'cfm';
  m.profile.tratamento = 'Dra.';
  m.profile.conselho = { sigla: 'CFM', numero: '999', uf: 'SC' };
  m.profile.equipe[0] = { ...m.profile.equipe[0]!, conselho: 'CFM', tratamento: 'Dra.', registro: { numero: '999', uf: 'SC' } };
  m.habilitacoes = habilitacoes.map((h) => (h.conselho === 'CFM' && h.categoria === 'injetavel' ? { ...h, conferido: { ...conferido, url: 'https://exemplo.gov.br' } } : h));
  assert.deepEqual(validar(m, prod).erros, []);
});

test('(a) "Dra." escrito em texto livre bloqueia', () => {
  const d = valido();
  d.servicos[0]!.resumo = 'Procedimento com a Dra. Fulana após avaliação.';
  assert.ok(validar(d, prod).erros.some((e) => e.includes('tratamento escrito em texto livre')));
});

test('(b) invasivo sem conselho/registro bloqueia', () => {
  const d = valido();
  d.profile.equipe[0]!.conselho = null;
  d.profile.equipe[0]!.registro = null;
  const e = validar(d, prod).erros.join('\n');
  assert.match(e, /sem conselho profissional/);
  assert.match(e, /sem nº de registro/);
});

test('(b) habilitação conselho × categoria não conferida bloqueia', () => {
  const d = valido();
  delete d.habilitacoes;
  assert.ok(validar(d, prod).erros.some((e) => e.includes('sem habilitação conferida para CFBM × injetavel')));
});

test('(c) sensível fora da rota reservada bloqueia; defineServico coloca na rota certa', () => {
  const d = valido();
  d.servicos[0] = { ...d.servicos[0]!, sensivel: true };
  assert.ok(validar(d, prod).erros.some((e) => e.includes('serviço sensível fora da rota reservada')));
  const ok = defineServico({ id: 'x', nome: 'Sensível', categoria: 'procedimento-intimo', invasivo: true, sensivel: true, executor: 'exec', resumo: 'Atendimento reservado.' });
  assert.equal(ok.rota, '/atendimento-reservado');
  assert.equal(ok.noindex, true);
});

test('(d) termo vetado bloqueia', () => {
  const d = valido();
  d.servicos[0]!.resumo = 'Resultado garantido e definitivo.';
  const e = validar(d, prod).erros.join('\n');
  assert.match(e, /garantia/);
  assert.match(e, /definitivo/);
});

test('ANVISA não conferida bloqueia', () => {
  const d = valido();
  d.servicos[0]!.produto = { descricao: 'Preenchedor', registroAnvisa: 'CONFIRMAR' };
  assert.ok(validar(d, prod).erros.some((e) => e.startsWith('[ANVISA')));
});

test('mídia sem consentimento em serviço publicável bloqueia', () => {
  const d = valido();
  d.midia[0]!.consentimento = 'pendente';
  assert.ok(validar(d, prod).erros.some((e) => e.includes('mídia foto-ok — consentimento "pendente"')));
});

test('troca de perfil muda as regras sem tocar componentes', () => {
  const d = valido();
  const cfbm = termosDoPerfil(regrasDoPerfil(d.profile));
  d.profile.perfilRegulatorio = 'cfm';
  const cfm = termosDoPerfil(regrasDoPerfil(d.profile));
  assert.ok(verificarTexto('especialista em lábios', cfm).length > 0);
  assert.equal(verificarTexto('especialista em lábios', cfbm).length, 0);
  // Perfil CFM exige conselho CFM na responsável: o mesmo dado agora bloqueia.
  assert.ok(validar(d, prod).erros.some((e) => e.includes('exige conselho CFM')));
});

test('promoção vetada quando o perfil não permite', () => {
  const termos = termosDoPerfil(regrasDoPerfil(valido().profile));
  assert.ok(verificarTexto('Promoção de outubro', termos).length > 0);
  assert.ok(verificarTexto('sorteio', termos).length > 0);
});

test('linter de texto', () => {
  const termos = termosDoPerfil(regrasDoPerfil(valido().profile));
  for (const t of ['Depilação definitiva', 'A melhor clínica', 'Aplicação de Botox', 'A mais completa', 'toxina botulínica', 'Que transformação'])
    assert.ok(verificarTexto(t, termos).length > 0, t);
  for (const t of ['Redução de pelos com laser', 'Avaliação individual', 'Os resultados variam de pessoa para pessoa'])
    assert.deepEqual(verificarTexto(t, termos), [], t);
});
