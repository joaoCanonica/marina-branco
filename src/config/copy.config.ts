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

  barra: { whatsapp: 'WhatsApp', ligar: 'Ligar' },

  comoAgendar: {
    titulo: 'Como agendar',
    passos: [
      { titulo: 'Chame no WhatsApp', texto: 'A mensagem já vem pronta, sem nenhum dado de saúde. Se preferir, ligue.' },
      { titulo: 'Escolha dia e horário', texto: 'Combinamos pelo chat o horário e a unidade que funcionam para você. O procedimento de interesse pode ser conversado aqui ou só na avaliação.' },
      { titulo: 'Venha para a avaliação', texto: 'É nela que se conversa sobre histórico, expectativas, riscos e se algum procedimento faz sentido.' },
    ],
  },

  primeiraAvaliacao: {
    titulo: 'Como é a primeira avaliação',
    oQueLevar: ['Documento com foto', 'Lista dos medicamentos em uso', 'Informações sobre alergias e procedimentos estéticos anteriores'],
    oQueAcontece: [
      'Conversa reservada sobre o que você procura e sobre seu histórico de saúde.',
      'Exame da região de interesse.',
      'Explicação dos procedimentos possíveis, dos riscos, dos cuidados e dos limites — ou a recomendação de não fazer nada.',
      'Você decide com calma; não é preciso decidir no mesmo dia.',
    ],
    duracao: 'CONFIRMAR: duração média da avaliação',
    conduta: 'CONFIRMAR: se a avaliação tem custo e se é feita pela própria executora do procedimento',
  },

  formulario: {
    titulo: 'Prefere que a clínica entre em contato?',
    texto: 'Deixe só nome, telefone e o período de sua preferência. Não inclua informações de saúde: elas são tratadas na avaliação.',
    consentimento: 'Autorizo a clínica a usar meu nome e telefone apenas para retornar este contato, conforme a Política de Privacidade.',
    enviar: 'Pedir contato',
    sucesso: 'Recebemos seu pedido. A clínica vai entrar em contato no período escolhido.',
    erro: 'Não foi possível enviar agora. Você pode chamar no WhatsApp ou ligar.',
    periodos: ['Manhã', 'Tarde', 'Noite'],
  },
} as const;
