/**
 * Elementos da marca usados como assinatura visual. Nada disso é mídia de
 * paciente; mesmo assim, o monograma traçado é APROXIMADO (feito a partir do
 * JPEG 150×150) e só aparece em produção quando o vetor original chegar e
 * `aprovado` for true. Até lá, produção usa a versão tipográfica.
 */
export const marca = {
  monograma: {
    /** SVG com dois paths (letra clara e letra dourada), em assets-originais. */
    arquivo: '/assets-originais/marca/derivados/monograma-mb-cor.svg',
    aprovado: true,
    origem: 'Traçado automático do monograma (docs/MIDIA.md → logo-monograma-mb). Substituir pelo vetor original.',
  },
  /**
   * "A Curva": traço dourado do letreiro da fachada (fino nas pontas, cheio no
   * meio, subindo da esquerda para a direita). Área fechada, viewBox 0 0 240 16.
   */
  curva: {
    viewBox: '0 0 240 16',
    area: 'M0 14 C60 13 120 2 240 1 C120 5 60 15 0 14 Z',
    /** Mesma curva como linha (centro do traço), para stroke-dashoffset. */
    linha: 'M0 14 C60 13.5 120 3.5 240 1',
  },
} as const;
