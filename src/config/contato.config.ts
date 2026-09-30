/**
 * Canais de contato e formulário opcional. O formulário só coleta nome,
 * telefone e período (+ registro do consentimento). Nada clínico, nenhum upload.
 * O endpoint precisa estar descrito na Política de Privacidade (operador).
 */
import { CONFIRMAR } from '../lib/esquemas.ts';

export const contato = {
  formulario: {
    ativo: true,
    /** URL que recebe o POST (ex.: função serverless própria). CONFIRMAR bloqueia produção. */
    endpoint: `${CONFIRMAR}: endpoint do formulário`,
    /** Quem recebe e por quanto tempo guarda (vai para a política de privacidade). */
    operador: `${CONFIRMAR}: serviço que recebe o formulário`,
    retencaoDias: 90,
  },
  /** Único conjunto de campos permitido em qualquer formulário do site. */
  camposPermitidos: ['nome', 'telefone', 'periodo', 'consentimento'] as const,
} as const;
