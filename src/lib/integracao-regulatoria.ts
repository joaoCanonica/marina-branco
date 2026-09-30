/**
 * Integração Astro: valida no início do build (mesmas regras de
 * scripts/validate-config.ts) e varre o HTML final. Sem flag para ignorar.
 */
import type { AstroIntegration } from 'astro';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { padraoTratamento, rotaReservada } from '../config/compliance.config.ts';
import { contato } from '../config/contato.config.ts';
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
        const sensiveis = d.servicos.filter((x) => x.sensivel).map((x) => x.nome.toLowerCase());
        const raizDist = fileURLToPath(dir);
        const erros: string[] = [];
        for (const f of htmls(raizDist)) {
          const html = readFileSync(f, 'utf8');
          const texto = textoVisivelDoHtml(html);
          for (const o of verificarTexto(texto, termos)) erros.push(`${f}: ${o.motivo} — "${o.trecho}"`);
          if (padraoTratamento.test(texto)) erros.push(`${f}: tratamento ("Dra."/"Dr.") fora do componente de identificação`);
          const rel = '/' + f.slice(raizDist.length).replace(/^\/+/, '');
          const reservada = rel.replace(/(\/index)?\.html$/, '') === rotaReservada;
          if (reservada) {
            if (!/<meta name="robots" content="noindex/.test(html)) erros.push(`${f}: rota reservada sem noindex`);
            if (/<(img|picture|video|iframe|audio)\b|url\(\s*['"]?[^)'"]+\.(avif|webp|jpe?g|png|gif|mp4|webm)/i.test(html)) erros.push(`${f}: rota reservada com imagem/vídeo`);
            if (/application\/ld\+json/.test(html)) erros.push(`${f}: rota reservada com dados estruturados`);
          }
          // Único link permitido para a rota reservada: o do rodapé, marcado e com nofollow.
          const links = [...html.matchAll(new RegExp(`<a\\b[^>]*href="${rotaReservada}[^"]*"[^>]*>`, 'g'))].map((m) => m[0]);
          if (links.length > 1 || links.some((l) => !/data-link-reservado/.test(l) || !/rel="nofollow"/.test(l))) erros.push(`${f}: link para rota reservada fora do padrão (só um, no rodapé, nofollow)`);
          for (const ld of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
            if (ld[1]!.includes(rotaReservada) || sensiveis.some((n) => ld[1]!.toLowerCase().includes(n))) erros.push(`${f}: dados estruturados mencionam serviço sensível`);
          if (!reservada && sensiveis.some((n) => textoVisivelDoHtml(html).toLowerCase().includes(n))) erros.push(`${f}: nome de serviço sensível fora da rota reservada`);
          // LGPD: nenhum campo fora da lista, nenhum upload.
          for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
            const tag = m[0];
            const nome = tag.match(/\bname="([^"]*)"/)?.[1];
            if (/type="file"/.test(tag)) erros.push(`${f}: campo de upload não é permitido`);
            const dentroDoBanner = nome === 'essenciais' || nome === 'estatistica';
            if (nome && !dentroDoBanner && !(contato.camposPermitidos as readonly string[]).includes(nome)) erros.push(`${f}: campo "${nome}" fora da lista permitida (${contato.camposPermitidos.join(', ')})`);
          }
          // Nenhum recurso de terceiros carregado pela página (links <a> podem apontar para fora).
          for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio|embed|object)\b[^>]*\b(src|href|srcset|data)="(https?:)?\/\/[^"]+"/g))
            if (!/<link\b[^>]*rel="canonical"/.test(m[0])) erros.push(`${f}: recurso de terceiro carregado — ${m[0].slice(0, 120)}`);
          if (amb.producao && /data-provisoria/.test(html)) erros.push(`${f}: mídia provisória no HTML de produção`);
          if (amb.producao && /CONFIRMAR/.test(html)) erros.push(`${f}: texto CONFIRMAR no HTML de produção`);
        }
        // Sitemap: nenhuma URL reservada, e toda URL listada precisa ser indexável.
        const sm = join(raizDist, 'sitemap.xml');
        if (existsSync(sm)) {
          for (const m of readFileSync(sm, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
            const caminho = new URL(m[1]!).pathname.replace(/\/$/, '') || '/';
            if (caminho.startsWith(rotaReservada)) erros.push(`sitemap: contém a rota reservada`);
            const arq = caminho === '/' ? join(raizDist, 'index.html') : [join(raizDist, `${caminho}.html`), join(raizDist, caminho, 'index.html')].find((x) => existsSync(x));
            if (!arq || !existsSync(arq)) erros.push(`sitemap: ${caminho} sem página gerada`);
            else if (/<meta name="robots" content="noindex/.test(readFileSync(arq, 'utf8'))) erros.push(`sitemap: ${caminho} está com noindex`);
          }
        }
        if (erros.length) {
          erros.forEach((e) => logger.error(e));
          throw new Error(`HTML final reprovado: ${erros.length} ocorrência(s).`);
        }
      },
    },
  };
}
