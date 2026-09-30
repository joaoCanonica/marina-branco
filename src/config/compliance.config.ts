/**
 * Regras de conformidade por perfil regulatório. Trocar `perfilRegulatorio` em
 * profile.config.ts troca as regras aqui — nenhum componente muda.
 *
 * Nada aqui é parecer jurídico: cada norma precisa ter o texto VIGENTE
 * conferido por pessoa da equipe (campo `conferido`) antes de valer.
 */
import type { Categoria, PerfilRegulatorio, SiglaConselho } from '../lib/esquemas.ts';

export interface TermoVetado {
  padrao: RegExp;
  motivo: string;
}

export interface RegrasPerfil {
  rotulo: string;
  /** Conselho exigido da responsável; null = sem conselho. */
  conselho: SiglaConselho | null;
  /** Tratamentos que o perfil comporta. Vazio = o site nunca usa "Dra."/"Dr.". */
  tratamentosPermitidos: readonly ('Dra.' | 'Dr.')[];
  /** Pode anunciar promoção/desconto? */
  permitePromocao: boolean;
  /** Antes/depois permitido e em qual formato. */
  antesDepois: 'proibido' | 'cfm-4-etapas' | 'CONFIRMAR';
  /** Identificação exigida no rodapé e nas páginas de serviço. */
  identificacao: { conselho: boolean; registro: boolean; rqe: boolean };
  termosVetados: TermoVetado[];
  normas: string[];
}

/** Valem para todos os perfis. */
export const termosVetadosBase: TermoVetado[] = [
  { padrao: /\bdefinitiv[oa]s?\b/i, motivo: 'sem "definitivo": use "redução de pelos" / "depilação a laser" / "fotodepilação"' },
  { padrao: /\bgarant(e|ia|ido|ida|imos)\b/i, motivo: 'sem promessa ou garantia de resultado' },
  { padrao: /\bresultados?\s+(imediatos?|certos?|permanentes?|garantidos?)\b/i, motivo: 'promessa de resultado' },
  { padrao: /\b100\s?%/i, motivo: 'promessa de resultado' },
  { padrao: /\bsem\s+dor\b|\bindolor\b/i, motivo: 'promessa sobre a experiência do procedimento' },
  { padrao: /\bmilagr|\btransforma(ç|c)(ã|a)o\b/i, motivo: 'sensacionalismo' },
  { padrao: /\b(a|o)\s+(melhor|maior)\b/i, motivo: 'superlativo' },
  { padrao: /\bmelhores\b/i, motivo: 'superlativo' },
  { padrao: /\bmais\s+complet[oa]\b/i, motivo: 'superlativo' },
  { padrao: /\breferência\b/i, motivo: 'superlativo/autopromoção' },
  { padrao: /\búnic[oa]\s+(em|na|no|da|do)\b/i, motivo: 'superlativo/comparação' },
  { padrao: /\bmelhor\s+que\b|\bdiferente\s+das?\s+outr/i, motivo: 'comparação com concorrentes' },
  { padrao: /\b(botox|dysport|xeomin|botulift|prosigne|nabota|jeuveau|relatox|juvederm|restylane|radiesse|sculptra|kybella)\b/i, motivo: 'marca de medicamento/produto de prescrição' },
  { padrao: /\btoxina\s+botul/i, motivo: 'não anunciar medicamento de prescrição; fale de "avaliação" e "procedimento"' },
  { padrao: /\bmanipulad[oa]s?\b/i, motivo: 'não anunciar manipulados' },
  { padrao: /\bsorteio|\bbrinde\b/i, motivo: 'vantagem comercial em procedimento' },
  { padrao: /\b(vagas?\s+limitad|[úu]ltimas?\s+vagas?|s[óo]\s+hoje|corra\b|n[ãa]o\s+perca|por\s+tempo\s+limitado|agenda\s+(quase\s+)?(lotada|esgotad))/i, motivo: 'urgência artificial' },
  { padrao: /\bharmoniza(ç|c)(ã|a)o\s+(perfeita|natural\s+garantida)/i, motivo: 'promessa de resultado' },
  { padrao: /\bporsch\b|\bm[ée]todo\s+[A-ZÁÉÍÓÚ][\wÀ-ú]+/, motivo: 'método de terceiro: só com formação/autorização documentada (padrão: não citar)' },
];

/** Vetados quando o perfil não permite promoção. */
export const termosPromocao: TermoVetado[] = [
  { padrao: /\bpromo(ç|c)(ã|a)o|\bdesconto|\bpacote\s+promocional|\bblack\s+friday\b|\bcondi(ç|c)(ã|a)o\s+especial/i, motivo: 'promoção vetada neste perfil' },
];

/** Tratamento de título no texto: só permitido se o perfil comportar. */
export const padraoTratamento = /\b(Dra?\.|Doutora?)(?=\s)/;

const semTitulo = [] as const;

export const perfis: Record<Exclude<PerfilRegulatorio, 'CONFIRMAR'>, RegrasPerfil> = {
  cfm: {
    rotulo: 'Medicina (CFM)',
    conselho: 'CFM',
    tratamentosPermitidos: ['Dra.', 'Dr.'],
    permitePromocao: false,
    antesDepois: 'cfm-4-etapas',
    identificacao: { conselho: true, registro: true, rqe: true },
    termosVetados: [{ padrao: /\bespecialista\b/i, motivo: 'CFM: "especialista" só com RQE registrado (conferir)' }],
    normas: ['Res. CFM 2.336/2023 (publicidade médica) — CONFIRMAR texto vigente'],
  },
  cfo: {
    rotulo: 'Odontologia (CFO)',
    conselho: 'CFO',
    tratamentosPermitidos: semTitulo, // CONFIRMAR no Código de Ética Odontológica vigente
    permitePromocao: false,
    antesDepois: 'CONFIRMAR',
    identificacao: { conselho: true, registro: true, rqe: false },
    termosVetados: [],
    normas: ['Código de Ética Odontológica (CFO) — CONFIRMAR texto vigente sobre publicidade'],
  },
  cfbm: {
    rotulo: 'Biomedicina (CFBM)',
    conselho: 'CFBM',
    tratamentosPermitidos: semTitulo,
    permitePromocao: false,
    antesDepois: 'CONFIRMAR',
    identificacao: { conselho: true, registro: true, rqe: false },
    termosVetados: [],
    normas: ['Resoluções CFBM sobre biomedicina estética e publicidade — CONFIRMAR número, vigência e situação judicial'],
  },
  cff: {
    rotulo: 'Farmácia (CFF)',
    conselho: 'CFF',
    tratamentosPermitidos: semTitulo,
    permitePromocao: false,
    antesDepois: 'CONFIRMAR',
    identificacao: { conselho: true, registro: true, rqe: false },
    termosVetados: [],
    normas: ['Resoluções CFF sobre saúde estética — CONFIRMAR número, vigência e situação judicial'],
  },
  'estetica-sem-conselho': {
    rotulo: 'Estética (sem conselho profissional)',
    conselho: null,
    tratamentosPermitidos: semTitulo,
    permitePromocao: false, // CDC permite promoção em geral; mantido vetado por prudência até decisão
    antesDepois: 'CONFIRMAR',
    identificacao: { conselho: false, registro: false, rqe: false },
    termosVetados: [],
    normas: ['Lei 13.643/2018 (esteticista)', 'CDC arts. 30–37 (publicidade)', 'Vigilância sanitária municipal/estadual — CONFIRMAR'],
  },
};

/**
 * Matriz conselho × categoria invasiva. Sem `conferido`, nenhum serviço
 * invasivo daquela combinação publica. Ponto de partida para pesquisa.
 */
export const habilitacoes: {
  conselho: SiglaConselho;
  categoria: Categoria;
  fundamento: string;
  conferido: { em: string; por: string; url: string } | null;
}[] = [
  { conselho: 'CFM', categoria: 'injetavel', fundamento: 'Lei 12.842/2013 (Ato Médico) — CONFIRMAR', conferido: null },
  { conselho: 'CFM', categoria: 'laser-luz', fundamento: 'Lei 12.842/2013 — CONFIRMAR', conferido: null },
  { conselho: 'CFM', categoria: 'procedimento-intimo', fundamento: 'Lei 12.842/2013 — CONFIRMAR', conferido: null },
  { conselho: 'CFO', categoria: 'injetavel', fundamento: 'Resolução CFO sobre harmonização orofacial — CONFIRMAR número, vigência e limites anatômicos', conferido: null },
  { conselho: 'CFBM', categoria: 'injetavel', fundamento: 'Resolução CFBM de biomedicina estética — CONFIRMAR número, vigência e situação judicial', conferido: null },
  { conselho: 'CFBM', categoria: 'laser-luz', fundamento: 'Resolução CFBM de biomedicina estética — CONFIRMAR', conferido: null },
  { conselho: 'CFBM', categoria: 'micropigmentacao', fundamento: 'Resolução CFBM — CONFIRMAR', conferido: null },
  { conselho: 'CFF', categoria: 'injetavel', fundamento: 'Resolução CFF sobre saúde estética — CONFIRMAR número, vigência e situação judicial', conferido: null },
  { conselho: 'COFEN', categoria: 'injetavel', fundamento: 'Resolução COFEN sobre enfermagem estética — CONFIRMAR', conferido: null },
];

/**
 * Rota reservada para serviços sensíveis: noindex, sem cache público, fora de
 * menus, listas, sitemap, schema e anúncios. Um único link discreto no rodapé.
 */
export const rotaReservada = '/atendimento-reservado';

/** Termos adicionais vetados no texto de serviços sensíveis. */
export const termosSensiveis: TermoVetado[] = [
  { padrao: /\d+\s?(cm|mm|cent[ií]metros?|mil[ií]metros?)\b|cent[ií]metro/i, motivo: 'sensível: não citar medidas nem ganho em centímetros' },
  { padrao: /\b(aumento|ganho)\s+(de|do)\s+(tamanho|comprimento|p[êe]nis)/i, motivo: 'sensível: não prometer ganho de tamanho' },
  { padrao: /\b(desempenho|performance|pot[êe]ncia|autoestima\s+sexual|melhora\s+(sexual|da\s+vida\s+sexual|do\s+prazer))/i, motivo: 'sensível: não prometer melhora sexual' },
  { padrao: /\bindolor|\bconfort[áa]vel\b/i, motivo: 'sensível: não prometer ausência de dor' },
  { padrao: /\bdepoimento|\bantes\s+e\s+depois/i, motivo: 'sensível: sem depoimento nem antes/depois' },
];

/** Analytics: nenhum. Se um dia houver, NUNCA registrar nome de serviço sensível nem a rota reservada. */
export const analytics = { tipo: 'nenhum' as const };

export const avisos = {
  resultado: 'Procedimentos são indicados somente após avaliação individual. Resultados variam de pessoa para pessoa.',
  faixaRevisao: 'Versão em revisão: conteúdo provisório, fora dos buscadores.',
};
