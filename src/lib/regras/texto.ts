/**
 * Verificação de texto contra termos vetados (lista montada por perfil em
 * termosDoPerfil). Usada no config e no HTML final.
 */
import type { TermoVetado } from '../../config/compliance.config.ts';

export interface Ocorrencia {
  trecho: string;
  motivo: string;
}

export function verificarTexto(texto: string, termos: TermoVetado[]): Ocorrencia[] {
  const achados: Ocorrencia[] = [];
  for (const r of termos) {
    const re = new RegExp(r.padrao.source, r.padrao.flags.replace('g', '') + 'g');
    for (const m of texto.matchAll(re)) {
      const i = m.index ?? 0;
      achados.push({ trecho: texto.slice(Math.max(0, i - 30), i + m[0].length + 30).replace(/\s+/g, ' ').trim(), motivo: r.motivo });
    }
  }
  return achados;
}

/**
 * Texto visível do HTML + atributos lidos por humanos. Títulos emitidos pelo
 * componente de identificação (data-titulo-confirmado) só existem quando o
 * perfil os comporta, e por isso são ignorados aqui.
 */
export function textoVisivelDoHtml(html: string): string {
  const atributos = [...html.matchAll(/\s(?:alt|title|aria-label|content)="([^"]*)"/g)].map((m) => m[1]).join(' \n ');
  return (html + ' \n ' + atributos)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<span data-titulo-confirmado>[^<]*<\/span>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');
}
