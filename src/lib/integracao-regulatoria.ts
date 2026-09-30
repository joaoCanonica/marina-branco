/**
 * Integração Astro: valida no início do build (mesmas regras de
 * scripts/validate-config.ts) e varre o HTML final. Sem flag para ignorar.
 */
import type { AstroIntegration } from 'astro';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { padraoTratamento, rotaReservada } from '../config/compliance.config.ts';
import { ambiente, dados } from './contexto.ts';
import { regrasDoPerfil, termosDoPerfil, validar } from './regras/index.ts';
import { auditarTema } from './auditoria-tema.ts';
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
        const r = validar(dados(raiz), amb);
        r.erros.push(...auditarTema(raiz).map((e) => `[Design system] ${e}`));
        if (r.erros.length) {
          r.erros.forEach((e) => logger.error(e));
          throw new Error(`Build bloqueado (${amb.siteEnv}): ${r.erros.length} erro(s) regulatório(s). Rode \`pnpm pendencias\`.`);
        }
        logger.info(`regras OK para SITE_ENV=${amb.siteEnv} (${r.avisos.length} aviso(s))`);
      },
      'astro:build:done': ({ dir, logger }) => {
        const amb = ambiente(raiz);
        const d = dados(raiz);
        const termos = termosDoPerfil(regrasDoPerfil(d.profile));
        const raizDist = fileURLToPath(dir);
        const erros: string[] = [];
        for (const f of htmls(raizDist)) {
          const html = readFileSync(f, 'utf8');
          const texto = textoVisivelDoHtml(html);
          for (const o of verificarTexto(texto, termos)) erros.push(`${f}: ${o.motivo} — "${o.trecho}"`);
          if (padraoTratamento.test(texto)) erros.push(`${f}: tratamento ("Dra."/"Dr.") fora do componente de identificação`);
          const rel = '/' + f.slice(raizDist.length).replace(/^\/+/, '');
          if (rel.startsWith(rotaReservada) && !/<meta name="robots" content="noindex/.test(html)) erros.push(`${f}: rota reservada sem noindex`);
          if (!rel.startsWith(rotaReservada) && html.includes(`href="${rotaReservada}`)) erros.push(`${f}: link para rota reservada em página pública`);
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
