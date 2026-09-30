import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Midia } from '../src/lib/esquemas.ts';
import { servicosPublicaveis, validar, type Ambiente, type Dados } from '../src/lib/regras/index.ts';
import { verificarTexto } from '../src/lib/regras/texto.ts';

const conferido = { em: '2026-09-01', por: 'Equipe', url: 'https://exemplo.gov.br/norma' };

function base(): Dados {
  return {
    clinica: {
      nome: 'Clínica', cidade: 'Lages', uf: 'SC', endereco: 'Rua X, 1', whatsapp: '5549000000000',
      cnpj: '00.000.000/0001-00', alvaraSanitario: '123', responsavelTecnicoId: 'exec',
      encarregadoLgpd: { nome: 'Fulana', contato: 'lgpd@exemplo.com' }, horario: 'Seg a sex',
    },
    profissionais: [{ id: 'exec', nomeExibicao: 'Pessoa', tituloConfirmado: false, formacao: 'Biomedicina', conselho: 'CFBM', uf: 'SC', registro: 'CRBM-5 1', registroConferido: { em: '2026-09-01', por: 'Equipe' } }],
    habilitacoes: [{ conselho: 'CFBM', categoria: 'injetavel', fundamento: 'Resolução X', textoVigenteConferido: conferido }],
    equipamentos: [],
    servicos: [{ slug: 'inj', nome: 'Avaliação injetáveis', categoria: 'injetavel', executorId: 'exec', resumo: 'Avaliação individual.', publicar: true, paginaConteudo: false, envolvePrescricao: true }],
    midia: [],
  };
}
const prod: Ambiente = { producao: true, previewProtegido: false, pesquisaAprovada: () => false };
const dev: Ambiente = { ...prod, producao: false };

test('invasivo publicável quando tudo conferido', () => {
  assert.deepEqual(validar(base(), prod).erros, []);
});

test('invasivo sem registro bloqueia em qualquer ambiente', () => {
  const d = base();
  delete d.profissionais[0]!.registro;
  assert.ok(validar(d, dev).erros.some((e) => e.includes('sem registro')));
  assert.equal(servicosPublicaveis(d, dev).length, 0);
});

test('invasivo sem habilitação conferida bloqueia', () => {
  const d = base();
  delete d.habilitacoes[0]!.textoVigenteConferido;
  assert.ok(validar(d, prod).erros.some((e) => e.includes('sem habilitação conferida')));
});

test('conselho sem habilitação para a categoria bloqueia', () => {
  const d = base();
  d.profissionais[0]!.conselho = 'NENHUM';
  assert.ok(validar(d, prod).erros.some((e) => e.includes('NENHUM × injetavel')));
});

test('"Dra." sem confirmação bloqueia', () => {
  const d = base();
  d.profissionais[0]!.titulo = 'Dra.';
  assert.ok(validar(d, dev).erros.some((e) => e.startsWith('[titulo]')));
});

test('página de conteúdo exige pesquisa aprovada', () => {
  const d = base();
  d.servicos[0]!.paginaConteudo = true;
  assert.ok(validar(d, prod).erros.some((e) => e.includes('docs/pesquisa/inj.md')));
  assert.deepEqual(validar(d, { ...prod, pesquisaAprovada: () => true }).erros, []);
});

test('equipamento sem registro ANVISA bloqueia', () => {
  const d = base();
  d.equipamentos.push({ id: 'eq', descricaoGenerica: 'Laser de diodo' });
  d.servicos[0]!.equipamentoId = 'eq';
  assert.ok(validar(d, prod).erros.some((e) => e.includes('ANVISA')));
});

const foto = (x: Partial<Midia> = {}): Midia => ({
  id: 'f1', tipo: 'paciente', original: 'a.jpg', edicoes: [], alt: 'Foto de rosto', autoriaPropria: true,
  textoPromessa: false, provisoria: true, pacienteRef: 'P-001', regiaoCorporal: 'face', antesDepois: false, ...x,
});

test('mídia provisória: nunca em produção; em preview só protegida', () => {
  const d = base();
  d.midia.push(foto());
  assert.ok(validar(d, prod, ['f1']).erros.some((e) => e.includes('provisória')));
  assert.ok(validar(d, dev, ['f1']).erros.some((e) => e.includes('PREVIEW_PROTECAO')));
  assert.deepEqual(validar(d, { ...dev, previewProtegido: true }, ['f1']).erros, []);
});

test('mídia de paciente sem termo e região proibida bloqueiam produção', () => {
  const d = base();
  d.midia.push(foto({ provisoria: false, regiaoCorporal: 'gluteo', originalSha256: 'a'.repeat(64) }));
  const e = validar(d, prod, ['f1']).erros.join('\n');
  assert.match(e, /termo de autorização/);
  assert.match(e, /região proibida/);
});

test('manifesto rejeita @ e nome no lugar de pacienteRef', () => {
  const d = base();
  d.midia.push(foto({ alt: 'Foto de @fulana', pacienteRef: 'Fulana' as never }));
  const e = validar(d, dev).erros.join('\n');
  assert.match(e, /contém "@"/);
  assert.match(e, /P-001/);
});

test('referência a mídia fora do manifesto bloqueia', () => {
  assert.ok(validar(base(), dev, ['nao-existe']).erros.length > 0);
});

test('linter de texto', () => {
  for (const t of ['Depilação definitiva', 'Resultado garantido', 'A melhor clínica de Lages', 'Aplicação de Botox', 'A mais completa', 'Dra. Fulana', 'toxina botulínica'])
    assert.ok(verificarTexto(t).length > 0, t);
  for (const t of ['Redução de pelos com laser', 'Avaliação individual', 'Os resultados variam de pessoa para pessoa'])
    assert.deepEqual(verificarTexto(t), [], t);
});
