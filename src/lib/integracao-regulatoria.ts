/**
 * Integração Astro: valida antes do build e varre o HTML final.
 * Qualquer erro interrompe o build — não há flag para ignorar.
 */
import type { AstroIntegration } from 'astro';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ambiente, dados, midiaReferenciada } from './contexto.ts';
import { validar } from './regras/index.ts';
import { textoVisivelDoHtml, verificarTexto } from './regras/texto.ts';

function htmls(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmls(p) : p.endsWith('.html') ? [p] : [];
  });
}

export function regulatorio(): AstroIntegration {
  let raiz = process.cwd();
  return {
    name: 'marina-branco:regulatorio',
    hooks: {
      'astro:config:setup': ({ config, command, logger }) => {
        raiz = fileURLToPath(config.root);
        if (command !== 'build') return;
        const amb = ambiente(raiz);
        const r = validar(dados, amb, midiaReferenciada(raiz));
        r.avisos.forEach((a) => logger.warn(a));
        if (r.erros.length) {
          r.erros.forEach((e) => logger.error(e));
          throw new Error(`Build bloqueado (${amb.siteEnv}): ${r.erros.length} erro(s) regulatório(s).`);
        }
        logger.info(`regras OK para SITE_ENV=${amb.siteEnv}`);
      },
      'astro:build:done': ({ dir, logger }) => {
        const erros: string[] = [];
        const amb = ambiente(raiz);
        for (const f of htmls(fileURLToPath(dir))) {
          const html = readFileSync(f, 'utf8');
          for (const o of verificarTexto(textoVisivelDoHtml(html))) erros.push(`${f}: ${o.motivo} — "${o.trecho}"`);
          if (amb.producao && /data-provisoria/.test(html)) erros.push(`${f}: mídia provisória no HTML de produção`);
          if (amb.producao && /CONFIRMAR/.test(html)) erros.push(`${f}: texto CONFIRMAR no HTML de produção`);
        }
        if (erros.length) {
          erros.forEach((e) => logger.error(e));
          throw new Error(`HTML final reprovado: ${erros.length} ocorrência(s).`);
        }
      },
    },
  };
}
