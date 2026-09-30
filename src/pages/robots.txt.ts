/**
 * robots.txt. Produção: tudo liberado + sitemap. A rota reservada NÃO é
 * bloqueada aqui de propósito: o bloqueio impediria o buscador de ler o
 * "noindex" dela (e listaria a URL no robots, chamando atenção). Ela fica fora
 * por noindex + X-Robots-Tag + nofollow + ausência no sitemap.
 * Fora de produção: tudo bloqueado.
 */
import type { APIRoute } from 'astro';
import { site } from '../lib/site.ts';

export const GET: APIRoute = ({ site: base }) => {
  const corpo = site.ambiente.producao && base
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', base).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
