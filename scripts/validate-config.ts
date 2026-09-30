/**
 * Valida o núcleo regulatório. Roda em `check` e `build`.
 *  - produção (SITE_ENV=production ou --production): qualquer achado que afete o
 *    site publicado vira ERRO e o processo sai com código 1;
 *  - dev/preview: tudo vira aviso; o site sai provisório (noindex + faixa "em revisão")
 *    e itens com impedimento não renderizam.
 */
import { ambiente, dados } from '../src/lib/contexto.ts';
import { validar } from '../src/lib/regras/index.ts';

const raiz = process.cwd();
if (process.argv.includes('--production')) process.env['SITE_ENV'] = 'production';
const amb = ambiente(raiz);
const r = validar(dados(raiz), amb);
const silencioso = process.argv.includes('--resumo');
if (!silencioso) for (const a of r.avisos) console.warn('aviso:', a);
for (const e of r.erros) console.error('ERRO:', e);
console.log(`\nvalidate-config (SITE_ENV=${amb.siteEnv}): ${r.erros.length} erro(s), ${r.avisos.length} aviso(s)`);
if (r.erros.length) console.error('Build de produção bloqueado. Rode `pnpm pendencias` para a lista completa por grupo.');
process.exit(r.erros.length ? 1 : 0);
