import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verificarConteudo, verificarTextoProcedimento } from '../src/lib/conteudo.ts';
import { servicos } from '../src/config/servicos.config.ts';
import { profile } from '../src/config/profile.config.ts';
import { regrasDoPerfil, termosDoPerfil } from '../src/lib/regras/index.ts';

const termos = termosDoPerfil(regrasDoPerfil(profile));
const base = (corpo: string, fontes = '1. Autor. Título. 2020.') =>
  ['## O que é', '## Para quem costuma ser indicado', '## Como é a avaliação', '## Como é o procedimento', '## Riscos e cuidados', '## O que esperar'].join('\n\nx\n\n') + `\n\n${corpo}\n\n## Fontes\n\n${fontes}\n`;

test('textos reais: cada um tem pesquisa, fontes citadas e nenhum termo vetado', () => {
  assert.deepEqual(verificarConteudo(process.cwd(), servicos, termos), []);
});

test('citação sem fonte e fonte não citada são apontadas', () => {
  const p = verificarTextoProcedimento('x', base('Afirmação [2].'), termos).map((i) => i.msg);
  assert.ok(p.includes('citação [2] sem fonte correspondente'));
  assert.ok(p.includes('fonte 1 listada mas não citada'));
});

test('sem seção de fontes é erro', () => {
  assert.deepEqual(verificarTextoProcedimento('x', '## O que é\n\ntexto', termos).map((i) => i.msg), ['sem seção "## Fontes"']);
});

test('termos vetados e "ideal para" são barrados no texto', () => {
  const p = verificarTextoProcedimento('x', base('Resultado definitivo, ideal para você [1].'), termos).map((i) => i.msg).join('\n');
  assert.match(p, /definitivo/);
  assert.match(p, /ideal para/);
});

test('todo serviço com página própria tem texto e pesquisa', () => {
  const comPagina = servicos.filter((s) => s.paginaPropria).map((s) => s.id).sort();
  assert.deepEqual(comPagina, ['depilacao', 'estetica-do-nariz', 'micropigmentacao-e-remocao', 'preenchimento-labial', 'remocao-de-manchas', 'remocao-de-tatuagem', 'sobrancelhas']);
});
