/**
 * Valida o núcleo regulatório. Roda em `check` e `build`.
 *  - produção (SITE_ENV=production ou --production): qualquer achado que afete o
 *    site publicado vira ERRO e o processo sai com código 1;
 *  - dev/preview: tudo vira aviso; o site sai provisório (noindex + faixa "em revisão")
 *    e itens com impedimento não renderizam.
 */
import { ambiente, dados } from '../src/lib/contexto.ts';
import { validar } from '../src/lib/regras/index.ts';
import { auditarTema } from '../src/lib/auditoria-tema.ts';
import { copy } from '../src/config/copy.config.ts';
import { verificarConteudo } from '../src/lib/conteudo.ts';
import { resultados } from '../src/config/resultados.config.ts';
import { reputacao } from '../src/config/reputacao.config.ts';
import { contato } from '../src/config/contato.config.ts';
import { legal } from '../src/config/legal.config.ts';
import { copy as copyTextos } from '../src/config/copy.config.ts';
import { verificarResultados } from '../src/lib/resultados.ts';
import { servicosPublicaveis } from '../src/lib/regras/index.ts';
import { regrasDoPerfil, termosDoPerfil } from '../src/lib/regras/index.ts';
import { marca } from '../src/config/marca.config.ts';

const raiz = process.cwd();
if (process.argv.includes('--production')) process.env['SITE_ENV'] = 'production';
const amb = ambiente(raiz);
const r = validar(dados(raiz), amb);
// Design system: contraste AA e cores só via tokens — erro em qualquer ambiente.
r.erros.push(...auditarTema(raiz).map((e) => `[Design system] ${e}`));
// Conteúdo de procedimentos: pesquisa correspondente, citações e termos — erro em qualquer ambiente.
const d = dados(raiz);
r.erros.push(...verificarConteudo(raiz, d.servicos, termosDoPerfil(regrasDoPerfil(d.profile))).map((c) => `[Conteúdo] ${c.id}: ${c.msg}`));
// Resultados: qualquer caso configurado com problema bloqueia (em qualquer ambiente, se ativo).
r.erros.push(...verificarResultados(resultados, { perfil: d.profile.perfilRegulatorio, midia: d.midia, servicosPublicaveis: servicosPublicaveis(d, amb) }).map((e) => `[Resultados] ${e}`));
const pendCopy = [
  contato.formulario.ativo && /CONFIRMAR/.test(contato.formulario.endpoint + contato.formulario.operador) && 'formulário ativo com endpoint/operador CONFIRMAR (desative ou configure)',
  /CONFIRMAR/.test(JSON.stringify(legal)) && 'textos legais com CONFIRMAR (vigência, revisão jurídica, hospedagem)',
  /CONFIRMAR/.test(copyTextos.primeiraAvaliacao.duracao + copyTextos.primeiraAvaliacao.conduta) && 'primeira avaliação: duração e condições CONFIRMAR',
  /CONFIRMAR/.test(reputacao.linkAvaliacaoGoogle) && 'reputacao.linkAvaliacaoGoogle com CONFIRMAR (página /avaliar e plaquinha)',!copy.hero.confirmado && 'copy.hero não confirmado (título da home: CONFIRMAR com a cliente)'].filter(Boolean) as string[];
if (amb.producao) r.erros.push(...pendCopy.map((e) => `[Outros campos CONFIRMAR] ${e}`));
else r.avisos.push(...pendCopy.map((e) => `[Outros campos CONFIRMAR] ${e}`));
if (!marca.monograma.aprovado) r.avisos.push('[Identidade] monograma traçado não aprovado: produção usa a versão tipográfica');
const silencioso = process.argv.includes('--resumo');
if (!silencioso) for (const a of r.avisos) console.warn('aviso:', a);
for (const e of r.erros) console.error('ERRO:', e);
console.log(`\nvalidate-config (SITE_ENV=${amb.siteEnv}): ${r.erros.length} erro(s), ${r.avisos.length} aviso(s)`);
if (r.erros.length) console.error('Build bloqueado. Rode `pnpm pendencias` para a lista completa por grupo.');
process.exit(r.erros.length ? 1 : 0);
