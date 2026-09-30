/**
 * Design system Marina Branco. Única fonte de cor, tipo e movimento do site:
 * src/styles/tokens.ts converte isto em CSS custom properties e
 * scripts/validate-config.ts verifica o contraste (WCAG 2.2 AA) de cada tom,
 * em modo claro e escuro, e barra cor escrita à mão fora daqui.
 *
 * Origem das cores (ver docs/MIDIA.md e assets-originais/marca/derivados/cores.json):
 *  - ouro #BB9C62, branco #EEEDEB e preto #020202: média por pixel do monograma;
 *  - caramelo #9E7658: roupa da proprietária em retrato-espelho-sala (nude/bege);
 *  - curva dourada: letreiro da fachada.
 */

/** Paleta bruta. Componentes nunca usam isto diretamente: usam os papéis do tom. */
export const paleta = {
  preto: '#0B0A09',
  grafite: '#1C1A18',
  grafiteClaro: '#2A2724',
  ouro: '#BB9C62', // do logo — texto grande e detalhes sobre escuro
  ouroClaro: '#D2B784', // ouro para texto pequeno sobre escuro
  bronze: '#6F5325', // "ouro" para texto pequeno sobre claro (ouro puro não passa AA)
  marfim: '#F6F1E8',
  brancoMarca: '#EEEDEB',
  nude: '#E6D3C1',
  nudeEscuro: '#2B221B',
  caramelo: '#9E7658', // da foto da proprietária — só decorativo / texto grande sobre claro
  ouroSutil: '#F0E6D2',
  ouroSutilEscuro: '#211C13',
  tinta: '#1A1714',
  tintaSuave: '#4A423A',
  marfimSuave: '#C9C0B3',
  branco: '#FFFFFF',
  alerta: '#B3261E',
  alertaTexto: '#FFFFFF',
} as const;

export type NomeTom = 'preto' | 'marfim' | 'nude' | 'ouro-sutil';

/** Papéis de cor de um tom. Todo componente usa só estes (via --cor-*). */
export interface PapeisTom {
  fundo: string;
  superficie: string;
  texto: string;
  textoSuave: string;
  /** Destaque decorativo e texto GRANDE (≥ 24px ou ≥ 18,66px bold): mínimo 3:1. */
  destaque: string;
  /** Destaque em texto pequeno (links, eyebrow): mínimo 4,5:1. */
  destaqueTexto: string;
  borda: string;
  foco: string;
  botaoFundo: string;
  botaoTexto: string;
}

const t = paleta;

export const tons: Record<NomeTom, { claro: PapeisTom; escuro: PapeisTom }> = {
  preto: {
    claro: { fundo: t.preto, superficie: t.grafite, texto: t.marfim, textoSuave: t.marfimSuave, destaque: t.ouro, destaqueTexto: t.ouroClaro, borda: t.grafiteClaro, foco: t.ouroClaro, botaoFundo: t.ouroClaro, botaoTexto: t.preto },
    escuro: { fundo: t.preto, superficie: t.grafite, texto: t.marfim, textoSuave: t.marfimSuave, destaque: t.ouro, destaqueTexto: t.ouroClaro, borda: t.grafiteClaro, foco: t.ouroClaro, botaoFundo: t.ouroClaro, botaoTexto: t.preto },
  },
  marfim: {
    claro: { fundo: t.marfim, superficie: t.branco, texto: t.tinta, textoSuave: t.tintaSuave, destaque: t.caramelo, destaqueTexto: t.bronze, borda: t.marfimSuave, foco: t.bronze, botaoFundo: t.preto, botaoTexto: t.marfim },
    escuro: { fundo: t.grafite, superficie: t.grafiteClaro, texto: t.marfim, textoSuave: t.marfimSuave, destaque: t.ouro, destaqueTexto: t.ouroClaro, borda: t.grafiteClaro, foco: t.ouroClaro, botaoFundo: t.ouroClaro, botaoTexto: t.preto },
  },
  nude: {
    claro: { fundo: t.nude, superficie: t.marfim, texto: t.tinta, textoSuave: t.tintaSuave, destaque: t.bronze, destaqueTexto: t.bronze, borda: t.caramelo, foco: t.tinta, botaoFundo: t.preto, botaoTexto: t.marfim },
    escuro: { fundo: t.nudeEscuro, superficie: t.grafite, texto: t.marfim, textoSuave: t.marfimSuave, destaque: t.ouro, destaqueTexto: t.ouroClaro, borda: t.caramelo, foco: t.ouroClaro, botaoFundo: t.ouroClaro, botaoTexto: t.preto },
  },
  'ouro-sutil': {
    claro: { fundo: t.ouroSutil, superficie: t.marfim, texto: t.tinta, textoSuave: t.tintaSuave, destaque: t.bronze, destaqueTexto: t.bronze, borda: t.ouro, foco: t.tinta, botaoFundo: t.preto, botaoTexto: t.marfim },
    escuro: { fundo: t.ouroSutilEscuro, superficie: t.grafite, texto: t.marfim, textoSuave: t.marfimSuave, destaque: t.ouro, destaqueTexto: t.ouroClaro, borda: t.ouro, foco: t.ouroClaro, botaoFundo: t.ouroClaro, botaoTexto: t.preto },
  },
};

/** Tom da página quando nenhuma seção declara o seu. */
export const tomPadrao: NomeTom = 'marfim';

/** Cor fixa da assinatura "A Curva" (decorativa, igual em todos os tons). */
export const assinatura = { curva: paleta.ouro, brilho: paleta.ouroClaro } as const;

/** Cores fora dos tons (estado do sistema, não da marca). */
export const sistema = {
  alerta: { fundo: t.alerta, texto: t.alertaTexto },
};

/**
 * Regras de contraste verificadas automaticamente em cada tom e modo.
 * [frente, fundo, mínimo, uso]
 */
export const paresContraste: [keyof PapeisTom, keyof PapeisTom, number, string][] = [
  ['texto', 'fundo', 4.5, 'texto corrido'],
  ['texto', 'superficie', 4.5, 'texto em card'],
  ['textoSuave', 'fundo', 4.5, 'texto secundário'],
  ['textoSuave', 'superficie', 4.5, 'texto secundário em card'],
  ['destaqueTexto', 'fundo', 4.5, 'destaque em texto pequeno'],
  ['destaqueTexto', 'superficie', 4.5, 'destaque pequeno em card'],
  ['destaque', 'fundo', 3, 'destaque em texto grande/detalhe'],
  ['foco', 'fundo', 3, 'indicador de foco (1.4.11)'],
  ['botaoTexto', 'botaoFundo', 4.5, 'texto de botão'],
  ['botaoFundo', 'fundo', 3, 'limite do botão (1.4.11)'],
];

export const tipografia = {
  // "* Fallback": fontes locais com métricas ajustadas (global.css) para CLS ≈ 0 na troca.
  display: "'Bodoni Moda Variable', 'Bodoni Fallback', 'Times New Roman', serif",
  texto: "'Figtree Variable', 'Figtree Fallback', Arial, sans-serif",
  /** Escala fluida (min, preferido, max). */
  escala: {
    xs: 'clamp(0.75rem, 0.72rem + 0.1vw, 0.8rem)',
    sm: 'clamp(0.875rem, 0.85rem + 0.1vw, 0.925rem)',
    base: 'clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)',
    lg: 'clamp(1.2rem, 1.1rem + 0.4vw, 1.4rem)',
    xl: 'clamp(1.6rem, 1.3rem + 1.2vw, 2.2rem)',
    '2xl': 'clamp(2.1rem, 1.6rem + 2.2vw, 3.3rem)',
    '3xl': 'clamp(2.7rem, 1.8rem + 4vw, 5.2rem)',
  },
  entrelinha: { display: '1.05', titulo: '1.15', texto: '1.7' },
  espacamentoVersalete: '0.22em',
} as const;

export const espaco = {
  medida: 'min(76rem, 100% - 2rem)',
  medidaTexto: '40rem',
  secao: 'clamp(4rem, 3rem + 6vw, 9rem)',
  raio: '2px',
} as const;

/** Movimento. Com prefers-reduced-motion: durações ~0 e distâncias 0. */
export const movimento = {
  duracao: { rapida: '180ms', media: '420ms', lenta: '800ms', revelar: '1000ms' },
  curva: {
    padrao: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
    entrada: 'cubic-bezier(0.16, 1, 0.3, 1)',
    saida: 'cubic-bezier(0.7, 0, 0.84, 0)',
  },
  distancia: { curta: '0.5rem', media: '1.25rem', longa: '2.5rem' },
} as const;
