/**
 * Textos de interface da home. `confirmado: false` bloqueia produção
 * (scripts/validate-config.ts). Sem superlativo, sem promessa.
 */
export const copy = {
  hero: {
    eyebrow: 'Clínica de estética',
    titulo: 'Estética avançada em Lages, com avaliação individual',
    destaque: 'avaliação individual',
    apoio: 'Cada procedimento começa por uma conversa: o que você procura, o que é possível para a sua pele e quais são os limites e os riscos de cada técnica.',
    ctaPrimario: 'Agendar avaliação pelo WhatsApp',
    ctaSecundario: 'Ver procedimentos',
    confirmado: false,
  },
  intro: {
    pular: 'Pular introdução',
  },
  /** Mensagem pré-preenchida no WhatsApp: neutra, sem dado de saúde. */
  whatsappMensagem: 'Olá! Gostaria de agendar uma avaliação.',
  avisoWhatsapp: 'Por privacidade, não envie fotos nem informações de saúde pelo WhatsApp; isso é tratado na avaliação.',
} as const;
