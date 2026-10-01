import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { politica } from '../scripts/gerar-csp.ts';
import { auditarHtml } from '../src/lib/auditoria-html.ts';

test('CSP: hash de cada script inline, sem unsafe-inline em script-src, ignora JSON-LD', () => {
  const js = 'console.log(1)';
  const html = `<script>${js}</script><script type="application/ld+json">{"a":1}</script><script type="module" src="/_astro/x.js"></script>`;
  const csp = politica(html, 'CONFIRMAR: endpoint');
  const hash = createHash('sha256').update(js).digest('base64');
  const script = csp.split('; ').find((d) => d.startsWith('script-src'))!;
  assert.equal(script, `script-src 'self' 'sha256-${hash}'`);
  assert.match(csp, /form-action 'self';/);
  assert.match(politica('', 'https://api.exemplo.com/f'), /form-action 'self' https:\/\/api\.exemplo\.com/);
});

test('auditoria do HTML: página de procedimento sem identificação da executora é reprovada', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dist-'));
  mkdirSync(join(dist, 'procedimentos'));
  const pagina = '<html><head><meta name="robots" content="noindex"></head><body><main><p>Texto.</p></main></body></html>';
  writeFileSync(join(dist, 'procedimentos', 'x.html'), pagina);
  assert.ok(auditarHtml(process.cwd(), dist).some((e) => /sem identificação/.test(e)));
  writeFileSync(join(dist, 'procedimentos', 'x.html'), pagina.replace('<p>', '<p data-identificacao>'));
  assert.ok(!auditarHtml(process.cwd(), dist).some((e) => /sem identificação/.test(e)));
});
