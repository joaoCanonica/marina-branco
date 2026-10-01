/**
 * Content-Security-Policy por página, gerada depois do build.
 * Cada HTML recebe um <meta http-equiv="Content-Security-Policy"> logo após o
 * charset, com o hash SHA-256 de cada <script> inline daquela página: nenhum
 * 'unsafe-inline' em script-src. Diretivas que não funcionam em <meta>
 * (frame-ancestors) estão no cabeçalho do vercel.json.
 * O endpoint do formulário entra em form-action/connect-src só quando real.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contato } from '../src/config/contato.config.ts';
import { htmls } from '../src/lib/auditoria-html.ts';

export function politica(html: string, endpoint: string): string {
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((m) => !/\bsrc=/.test(m[1]!) && !/type="application\/ld\+json"/.test(m[1]!) && m[2]!.length)
    .map((m) => `'sha256-${createHash('sha256').update(m[2]!).digest('base64')}'`);
  const externo = /^https:\/\//.test(endpoint) ? ` ${new URL(endpoint).origin}` : '';
  return [
    "default-src 'self'",
    `script-src 'self'${hashes.length ? ' ' + [...new Set(hashes)].join(' ') : ''}`,
    // Astro injeta <style> e o tema usa atributos style (tokens): sem como usar hash em atributo.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self'${externo}`,
    `form-action 'self'${externo}`,
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

if (import.meta.main) {
  const dist = join(process.cwd(), 'dist');
  const arquivos = htmls(dist);
  for (const f of arquivos) {
    const html = readFileSync(f, 'utf8').replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
    const meta = `<meta http-equiv="Content-Security-Policy" content="${politica(html, contato.formulario.endpoint)}">`;
    if (!/<meta charset="utf-8">/.test(html)) throw new Error(`${f}: sem <meta charset> para ancorar a CSP`);
    writeFileSync(f, html.replace('<meta charset="utf-8">', `<meta charset="utf-8">${meta}`));
  }
  console.log(`CSP gerada em ${arquivos.length} página(s).`);
}
