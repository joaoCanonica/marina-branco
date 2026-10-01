/**
 * Auditoria de conformidade de um build já gerado (dist/).
 *  1. regras do núcleo (mesmas de validate-config) no ambiente atual;
 *  2. HTML final: termos vetados, tratamento, identificação profissional,
 *     serviço sensível, campos de formulário, recursos de terceiros, CONFIRMAR;
 *  3. mídia: tudo o que foi derivado para o build existe no manifesto e, em
 *     produção, é publicável (consentimento, autoria, OCR, sem problemas).
 * Uso: `pnpm build && pnpm audit:compliance` (SITE_ENV igual ao do build).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ambiente, dados } from '../src/lib/contexto.ts';
import { impedimentosMidia, validar } from '../src/lib/regras/index.ts';
import { auditarHtml, htmls } from '../src/lib/auditoria-html.ts';

const raiz = process.cwd();
const dist = join(raiz, 'dist');
if (!existsSync(dist)) {
  console.error('dist/ não existe: rode `pnpm build` antes.');
  process.exit(1);
}
const amb = ambiente(raiz);
const d = dados(raiz);
const erros: string[] = [...validar(d, amb).erros.map((e) => `[regras] ${e}`)];
erros.push(...auditarHtml(raiz, dist).map((e) => `[html] ${e.replace(dist, 'dist')}`));

const indiceArq = join(raiz, 'src/assets/media/index.json');
const indice = existsSync(indiceArq) ? (JSON.parse(readFileSync(indiceArq, 'utf8')) as { siteEnv: string; itens: Record<string, unknown> }) : { siteEnv: '?', itens: {} };
if (indice.siteEnv !== amb.siteEnv) erros.push(`[mídia] derivados gerados para SITE_ENV=${indice.siteEnv}, auditoria em ${amb.siteEnv}: refaça o build`);
for (const id of Object.keys(indice.itens)) {
  const m = d.midia.find((x) => x.id === id);
  if (!m) erros.push(`[mídia] ${id}: derivado sem item no manifesto`);
  else if (amb.producao) for (const i of impedimentosMidia(m)) erros.push(`[mídia] ${id}: ${i}`);
}

const paginas = htmls(dist).length;
if (erros.length) {
  console.error(`Auditoria de conformidade (${amb.siteEnv}): ${erros.length} problema(s) em ${paginas} página(s)`);
  for (const e of erros) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`Auditoria de conformidade (${amb.siteEnv}): OK — ${paginas} página(s), ${Object.keys(indice.itens).length} mídia(s) derivada(s).`);
