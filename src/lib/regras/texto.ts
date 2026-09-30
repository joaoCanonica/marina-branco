/**
 * Termos proibidos em qualquer texto publicado (config e HTML final).
 * Cada regra explica o motivo, para que o erro de build seja acionável.
 */
export interface RegraTexto {
  padrao: RegExp;
  motivo: string;
}

export const regrasTexto: RegraTexto[] = [
  { padrao: /\bdefinitiv[oa]s?\b/i, motivo: 'sem "definitivo": use "redução de pelos" / "depilação a laser" / "fotodepilação"' },
  { padrao: /\bgarant(e|ia|ido|ida|imos)\b/i, motivo: 'sem promessa ou garantia de resultado' },
  { padrao: /\bresultados?\s+(imediatos?|certos?|permanentes?)\b/i, motivo: 'promessa de resultado' },
  { padrao: /\b100\s?%/i, motivo: 'promessa de resultado' },
  { padrao: /\bsem\s+dor\b|\bindolor\b/i, motivo: 'promessa sobre experiência do procedimento' },
  { padrao: /\bmilagr/i, motivo: 'sensacionalismo' },
  { padrao: /\b(a|o)\s+(melhor|maior|mais\s+\w+)\s+(clínica|de\s+lages|da\s+região|do\s+sul)/i, motivo: 'superlativo/comparação' },
  { padrao: /\b(melhor|maior)\s+(clínica|resultado|preço)/i, motivo: 'superlativo/comparação' },
  { padrao: /\bmais\s+complet[oa]\b/i, motivo: 'superlativo' },
  { padrao: /\breferência\s+(em|no|na|regional)\b/i, motivo: 'superlativo' },
  { padrao: /\búnic[oa]\s+(em|na|no|da|do)\b/i, motivo: 'superlativo/comparação' },
  { padrao: /\b(botox|dysport|xeomin|botulift|prosigne|nabota|jeuveau|relatox)\b/i, motivo: 'marca de medicamento de prescrição' },
  { padrao: /\btoxina\s+botul/i, motivo: 'não anunciar medicamento de prescrição; fale de "avaliação" e "procedimento"' },
  { padrao: /\bmanipulad[oa]s?\b/i, motivo: 'não anunciar manipulados' },
  { padrao: /\b(promoção|desconto|pacote\s+promocional|brinde|sorteio)\b/i, motivo: 'vantagem comercial em procedimento de saúde' },
  { padrao: /\bDra?\.\s/, motivo: 'título só via config com tituloConfirmado (use data-titulo-confirmado)' },
];

export interface Ocorrencia {
  trecho: string;
  motivo: string;
}

export function verificarTexto(texto: string): Ocorrencia[] {
  const achados: Ocorrencia[] = [];
  for (const r of regrasTexto) {
    const re = new RegExp(r.padrao.source, r.padrao.flags.includes('g') ? r.padrao.flags : r.padrao.flags + 'g');
    for (const m of texto.matchAll(re)) {
      const i = m.index ?? 0;
      achados.push({ trecho: texto.slice(Math.max(0, i - 30), i + m[0].length + 30).replace(/\s+/g, ' '), motivo: r.motivo });
    }
  }
  return achados;
}

/**
 * Para o HTML final: remove tags, e ignora títulos emitidos pelo componente
 * de profissional (marcados com data-titulo-confirmado, só gerados quando o
 * título está confirmado no config).
 */
export function textoVisivelDoHtml(html: string): string {
  // Atributos lidos por humanos/buscadores também contam.
  const atributos = [...html.matchAll(/\s(?:alt|title|aria-label|content)="([^"]*)"/g)].map((m) => m[1]).join(' \n ');
  return (html + ' \n ' + atributos)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<span data-titulo-confirmado>[^<]*<\/span>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');
}
