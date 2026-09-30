import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contraste, coresLiterais, verificarTema } from '../src/lib/cor.ts';
import { paleta, tons } from '../src/config/theme.config.ts';
import { auditarTema } from '../src/lib/auditoria-tema.ts';

test('todos os tons passam AA em claro e escuro', () => {
  const falhas = verificarTema().filter((c) => !c.ok);
  assert.deepEqual(falhas, []);
});

test('ouro do logo nunca é usado como texto pequeno sobre claro', () => {
  assert.ok(contraste(paleta.ouro, paleta.marfim) < 4.5); // por isso existe o bronze
  for (const t of Object.values(tons)) {
    if (contraste(t.claro.fundo, paleta.preto) > 10) assert.notEqual(t.claro.destaqueTexto, paleta.ouro);
  }
});

test('detector de cor literal', () => {
  assert.ok(coresLiterais('.x { color: #fff; }').length === 1);
  assert.ok(coresLiterais('a { background: rgb(0 0 0 / .5) }').length === 1);
  assert.deepEqual(coresLiterais('<a href="#conteudo">pular</a>'), []);
  assert.deepEqual(coresLiterais('.x { color: var(--cor-texto); }'), []);
});

test('código do site não tem cor fora dos tokens', () => {
  assert.deepEqual(auditarTema(process.cwd()), []);
});
