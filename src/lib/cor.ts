/** Contraste WCAG 2.x e auditoria de cores escritas à mão. */
import { paresContraste, sistema, tons, type NomeTom } from '../config/theme.config.ts';

function luminancia(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

export interface ResultadoContraste {
  tom: NomeTom;
  modo: 'claro' | 'escuro';
  par: string;
  razao: number;
  minimo: number;
  ok: boolean;
}

export function verificarTema(): ResultadoContraste[] {
  const r: ResultadoContraste[] = [];
  for (const [tom, modos] of Object.entries(tons) as [NomeTom, (typeof tons)[NomeTom]][])
    for (const modo of ['claro', 'escuro'] as const)
      for (const [f, b, min, uso] of paresContraste) {
        const razao = contraste(modos[modo][f], modos[modo][b]);
        r.push({ tom, modo, par: `${f}/${b} (${uso})`, razao, minimo: min, ok: razao >= min });
      }
  const a = contraste(sistema.alerta.texto, sistema.alerta.fundo);
  r.push({ tom: 'preto', modo: 'claro', par: 'alerta texto/fundo', razao: a, minimo: 4.5, ok: a >= 4.5 });
  return r;
}

/** Cor literal (hex, rgb/hsl/oklch, nome) em código de estilo fora do theme.config. */
export const padraoCorLiteral = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(|(?<![-\w])(?:white|black|red|gold|ivory)(?![-\w])/;

export function coresLiterais(conteudo: string): string[] {
  const achados: string[] = [];
  conteudo.split('\n').forEach((linha, i) => {
    const semComentario = linha.replace(/\/\/.*$|\/\*.*?\*\//g, '');
    // Âncoras (#id) em href e seletores de id não são cor.
    const limpa = semComentario.replace(/href="#[^"]*"|href={`#[^`]*`}|['"`]#[a-z][\w-]*['"`]/g, '');
    const m = limpa.match(padraoCorLiteral);
    if (m) achados.push(`linha ${i + 1}: "${m[0]}"`);
  });
  return achados;
}
