/**
 * Integração Astro: valida no início do build (mesmas regras de
 * scripts/validate-config.ts) e varre o HTML final. Sem flag para ignorar.
 */
import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { ambiente, dados } from './contexto.ts';
import { validar } from './regras/index.ts';
import { auditarHtml } from './auditoria-html.ts';
import { auditarTema } from './auditoria-tema.ts';

export function regulatorio(): AstroIntegration {
  let raiz = process.cwd();
  return {
    name: 'marina-branco:regulatorio',
    hooks: {
      'astro:config:setup': ({ config, command, logger }) => {
        raiz = fileURLToPath(config.root);
        if (command !== 'build') return;
        const amb = ambiente(raiz);
        const r = validar(dados(raiz), amb);
        r.erros.push(...auditarTema(raiz).map((e) => `[Design system] ${e}`));
        if (r.erros.length) {
          r.erros.forEach((e) => logger.error(e));
          throw new Error(`Build bloqueado (${amb.siteEnv}): ${r.erros.length} erro(s) regulatório(s). Rode \`pnpm pendencias\`.`);
        }
        logger.info(`regras OK para SITE_ENV=${amb.siteEnv} (${r.avisos.length} aviso(s))`);
      },
      'astro:build:done': ({ dir, logger }) => {
        const erros = auditarHtml(raiz, fileURLToPath(dir));
        if (erros.length) {
          erros.forEach((e) => logger.error(e));
          throw new Error(`HTML final reprovado: ${erros.length} ocorrência(s).`);
        }
      },
    },
  };
}
