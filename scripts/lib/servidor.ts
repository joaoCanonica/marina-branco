/** Servidor estático mínimo para auditar dist/ (cleanUrls como na Vercel). */
import { createServer, type Server } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const tipos: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.avif': 'image/avif', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain', '.json': 'application/json', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.pdf': 'application/pdf',
};

export function servir(dist: string, porta = 4329): Promise<{ url: string; servidor: Server }> {
  const servidor = createServer((req, res) => {
    const caminho = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    const candidatos = [join(dist, caminho), join(dist, `${caminho}.html`), join(dist, caminho, 'index.html')];
    const arq = candidatos.find((c) => existsSync(c) && statSync(c).isFile());
    if (!arq) { res.writeHead(404, { 'content-type': tipos['.html']! }); res.end(existsSync(join(dist, '404.html')) ? readFileSync(join(dist, '404.html')) : ''); return; }
    res.writeHead(200, { 'content-type': tipos[extname(arq)] ?? 'application/octet-stream' });
    res.end(readFileSync(arq));
  });
  return new Promise((ok) => servidor.listen(porta, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${porta}`, servidor })));
}

/** Páginas a auditar: todas as .html de dist (exceto _kit), como caminhos limpos. */
export function paginas(arquivos: string[], dist: string): string[] {
  return arquivos
    .map((f) => '/' + f.slice(dist.length).replace(/^\/+/, '').replace(/(index)?\.html$/, ''))
    .map((p) => (p.length > 1 ? p.replace(/\/$/, '') : p))
    .filter((p) => !p.startsWith('/_kit'))
    .sort();
}

export const CHROME = process.env['CHROME_PATH'] ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
