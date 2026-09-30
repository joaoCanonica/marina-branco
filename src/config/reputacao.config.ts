/**
 * Reputação. Validar a estratégia de avaliações com o conselho aplicável
 * antes de usar (docs/REPUTACAO.md).
 */
import { CONFIRMAR } from '../lib/esquemas.ts';

export const reputacao = {
  /** Link "escrever avaliação" do Perfil da Empresa no Google (g.page/r/.../review). */
  linkAvaliacaoGoogle: `${CONFIRMAR}: link de avaliação do Perfil da Empresa no Google`,
  textoPagina: 'Se quiser, deixe sua opinião sobre o atendimento no Google. Ela é pública e ajuda outras pessoas a conhecerem a clínica.',
  textoBotao: 'Avaliar no Google',
  /** Aviso fixo: nada é oferecido em troca. */
  semIncentivo: 'A avaliação é voluntária e nada é oferecido em troca dela.',
} as const;
