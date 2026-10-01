/**
 * Lighthouse mobile (emulação padrão: Moto G Power, 4G lento) nas páginas-chave.
 * Metas: Performance ≥ 95, Acessibilidade = 100, Boas práticas ≥ 95, SEO ≥ 95.
 * SEO é medido como em produção: o HTML provisório tem noindex de propósito,
 * então a auditoria "is-crawlable" é ignorada fora de SITE_ENV=production.
 * Requer o binário `lighthouse` (npx lighthouse@13 ou LIGHTHOUSE_BIN).
 * Uso: `pnpm build && pnpm audit:lighthouse`.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CHROME, servir } from './lib/servidor.ts';

const METAS = { performance: 95, accessibility: 100, 'best-practices': 95, seo: 95 } as const;
const ROTAS = (process.env['LH_ROTAS'] ?? '/,/procedimentos,/contato,/leitura,/privacidade,/atendimento-reservado').split(',')
  // A rota reservada só existe se houver serviço sensível publicável.
  .filter((r) => r === '/' || existsSync(join(process.cwd(), 'dist', `${r}.html`)));
const bin = process.env['LIGHTHOUSE_BIN'] ?? 'lighthouse';
const producao = process.env['SITE_ENV'] === 'production';
const { url, servidor } = await servir(join(process.cwd(), 'dist'));
const tmp = mkdtempSync(join(tmpdir(), 'lh-'));
const falhas: string[] = [];

for (const rota of ROTAS) {
  const saida = join(tmp, `${rota.replace(/\W+/g, '_') || 'home'}.json`);
  // Assíncrono: o servidor estático roda neste mesmo processo.
  await promisify(execFile)(bin, [url + rota, '--quiet', '--output=json', `--output-path=${saida}`, '--chrome-flags=--headless=new --no-sandbox',
    ...(producao ? [] : ['--skip-audits=is-crawlable'])], { env: { ...process.env, CHROME_PATH: CHROME }, maxBuffer: 64 * 1024 * 1024 });
  const r = JSON.parse(readFileSync(saida, 'utf8')) as { categories: Record<string, { score: number }>; audits: Record<string, { numericValue?: number }> };
  const notas = Object.fromEntries(Object.keys(METAS).map((k) => [k, Math.round(r.categories[k]!.score * 100)]));
  console.log(`${rota.padEnd(28)} P ${notas['performance']} · A ${notas['accessibility']} · BP ${notas['best-practices']} · SEO ${notas['seo']} · LCP ${Math.round(r.audits['largest-contentful-paint']?.numericValue ?? 0)} ms · CLS ${(r.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3)}`);
  for (const [k, meta] of Object.entries(METAS)) if (notas[k]! < meta) falhas.push(`${rota}: ${k} ${notas[k]} < ${meta}`);
}
servidor.close();
if (falhas.length) {
  console.error(`Lighthouse: ${falhas.length} meta(s) não atingida(s)`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('Lighthouse mobile: todas as metas atingidas.');
