/**
 * Sitemap: só páginas públicas e indexáveis. Nunca: rota reservada, /avaliar,
 * /_kit, rascunhos, /resultados sem casos. Fora de produção, vazio.
 */
import type { APIRoute } from 'astro';
import { site } from '../lib/site.ts';

export const GET: APIRoute = ({ site: base }) => {
  const urls: string[] = [];
  if (site.ambiente.producao && base) {
    const caminhos = ['/', '/procedimentos', '/equipe', '/contato', '/privacidade', '/termos'];
    if (site.artigos().length) caminhos.push('/leitura', ...site.artigos().map((a) => `/leitura/${a.slug}`));
    caminhos.push(...site.paginasProcedimento().filter((p) => p.rascunho.length === 0).map((p) => p.s.rota));
    if (site.resultados().casos.length) caminhos.push('/resultados');
    for (const c of caminhos) if (!c.startsWith(site.rotaReservada)) urls.push(new URL(c, base).href);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
