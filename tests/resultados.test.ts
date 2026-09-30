import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ItemMidia, Servico } from '../src/lib/esquemas.ts';
import { casosExibiveis, verificarResultados, type CasoResultado, type ConfigResultados } from '../src/lib/resultados.ts';
import { defineServico } from '../src/config/servicos.config.ts';
import { resultados as cfgReal } from '../src/config/resultados.config.ts';

const servico: Servico = defineServico({ id: 'labial', nome: 'Preenchimento labial', categoria: 'injetavel', invasivo: true, sensivel: false, executor: 'exec', resumo: 'Procedimento injetável indicado após avaliação.', publicavel: true });
const foto = (id: string, p: string, x: Partial<ItemMidia> = {}): ItemMidia => ({ id, consentimento: 'ok', autoria: 'propria', publicavel: true, previewOk: false, ocr: { ok: true }, problemas: [], pacienteRef: p, ...x });
const caso = (n: number, x: Partial<CasoResultado> = {}): CasoResultado => ({
  id: `c${n}`, servico: 'labial', pacienteRef: `P-00${n}`, antesId: `a${n}`, depoisId: `d${n}`, regiao: 'labios',
  tempoDecorrido: '30 dias', sessoes: '1 sessão', padronizacaoConferida: true, semEdicaoQueMelhore: true, semColagem: true, ...x,
});
const midia = [1, 2, 3, 4].flatMap((n) => [foto(`a${n}`, `P-00${n}`), foto(`d${n}`, `P-00${n}`)]);
const ctx = (perfil: 'cfm' | 'cfbm' | 'estetica-sem-conselho', m = midia) => ({ perfil, midia: m, servicosPublicaveis: [servico] });

test('config real: módulo desligado, nada exibido', () => {
  assert.equal(cfgReal.ativo, false);
  assert.deepEqual(casosExibiveis(cfgReal, ctx('estetica-sem-conselho')), []);
});

test('perfil conservador: caso completo passa', () => {
  const cfg: ConfigResultados = { ativo: true, procedimentos: [], casos: [caso(1)] };
  assert.deepEqual(verificarResultados(cfg, ctx('cfbm')), []);
  assert.equal(casosExibiveis(cfg, ctx('cfbm')).length, 1);
});

test('sem consentimento ou com problema no manifesto: bloqueia e nada renderiza', () => {
  const m = midia.map((x) => (x.id === 'a1' ? { ...x, consentimento: 'pendente' as const, problemas: ['Logotipo sobreposto'] } : x));
  const cfg: ConfigResultados = { ativo: true, procedimentos: [], casos: [caso(1)] };
  const e = verificarResultados(cfg, ctx('cfbm', m)).join('\n');
  assert.match(e, /sem consentimento "ok"/);
  assert.match(e, /problema\(s\) em aberto/);
  assert.deepEqual(casosExibiveis(cfg, ctx('cfbm', m)), []);
});

test('região vetada, colagem, edição e falta de padronização bloqueiam', () => {
  const cfg: ConfigResultados = { ativo: true, procedimentos: [], casos: [caso(1, { regiao: 'gluteo', semColagem: false, semEdicaoQueMelhore: false, padronizacaoConferida: false, tempoDecorrido: '', sessoes: '' })] };
  const e = verificarResultados(cfg, ctx('estetica-sem-conselho')).join('\n');
  for (const t of ['região vetada', 'colagem', 'edição/filtro', 'pose/luz/ângulo', 'tempo decorrido', 'número de sessões']) assert.ok(e.includes(t), t);
});

test('mídias de pacientes diferentes no mesmo caso bloqueiam', () => {
  const cfg: ConfigResultados = { ativo: true, procedimentos: [], casos: [caso(1, { depoisId: 'd2' })] };
  assert.match(verificarResultados(cfg, ctx('cfbm')).join('\n'), /outra pacienteRef/);
});

test('CFM: exige 4 pacientes, condição e complicações por procedimento', () => {
  const tres: ConfigResultados = { ativo: true, procedimentos: [], casos: [caso(1), caso(2), caso(3)] };
  const e = verificarResultados(tres, ctx('cfm')).join('\n');
  assert.match(e, /3 paciente\(s\); mínimo 4/);
  assert.match(e, /condição apresentada/);
  assert.match(e, /insatisfatórios e complicações/);
  const ok: ConfigResultados = { ativo: true, procedimentos: [{ servico: 'labial', condicao: 'Lábios com pouco volume.', insatisfatoriosEComplicacoes: 'Assimetria, nódulos, oclusão vascular.' }], casos: [caso(1), caso(2), caso(3), caso(4)] };
  assert.deepEqual(verificarResultados(ok, ctx('cfm')), []);
});

test('serviço não publicável não exibe resultados', () => {
  const cfg: ConfigResultados = { ativo: true, procedimentos: [], casos: [caso(1)] };
  assert.match(verificarResultados(cfg, { ...ctx('cfbm'), servicosPublicaveis: [] }).join('\n'), /não é publicável/);
});
