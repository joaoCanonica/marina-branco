// Favicon gerado a partir dos tokens (nenhuma cor escrita à mão).
import { paleta } from '../config/theme.config.ts';
import { profile } from '../config/profile.config.ts';

const iniciais = profile.nome.split(/\s+/).map((p) => p[0]).slice(0, 2).join('');
export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${paleta.preto}"/><text x="16" y="22" text-anchor="middle" font-family="Didot,Georgia,serif" font-size="15" fill="${paleta.ouro}">${iniciais}</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
