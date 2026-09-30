/**
 * Catálogo de serviços. Tudo começa `publicavel: false`: só publica com
 * executor habilitado (conselho + registro conferidos), insumos com registro
 * ANVISA conferido e, se houver página própria, pesquisa aprovada.
 */
import { rotaReservada } from './compliance.config.ts';
import { CONFIRMAR, type Insumo, type Servico } from '../lib/esquemas.ts';

type Entrada = Omit<Servico, 'exigeHabilitacao' | 'rota' | 'noindex' | 'equipamento' | 'produto' | 'midiaIds' | 'paginaPropria' | 'publicavel'> &
  Partial<Pick<Servico, 'rota' | 'noindex' | 'equipamento' | 'produto' | 'midiaIds' | 'paginaPropria' | 'publicavel'>>;

/** Deriva exigeHabilitacao de invasivo; sensível vai para a rota reservada com noindex. */
export function defineServico(s: Entrada): Servico {
  return {
    equipamento: null,
    produto: null,
    midiaIds: [],
    paginaPropria: false,
    publicavel: false,
    ...s,
    exigeHabilitacao: s.invasivo,
    noindex: s.sensivel ? true : (s.noindex ?? false),
    rota: s.rota ?? `${s.sensivel ? rotaReservada : '/servicos/'}${s.id}`,
  };
}

const aConfirmar = (descricao: string, prescricao = false): Insumo => ({ descricao, registroAnvisa: CONFIRMAR, prescricao });

export const servicos: Servico[] = [
  defineServico({
    id: 'preenchimento-labial',
    nome: 'Preenchimento labial',
    categoria: 'injetavel',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    produto: aConfirmar('Preenchedor injetável (classe a CONFIRMAR)'),
    resumo: 'Procedimento injetável nos lábios, indicado ou não após avaliação individual.',
    midiaIds: ['resultado-labios-frontal-p002', 'resultado-labios-perfil-p003', 'resultado-labios-frontal-p005'],
  }),
  defineServico({
    id: 'estetica-do-nariz',
    nome: 'Estética do nariz',
    categoria: 'injetavel',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    produto: aConfirmar('Preenchedor injetável (classe a CONFIRMAR)'),
    resumo: 'Procedimento injetável no nariz, sem cirurgia, avaliado caso a caso quanto a riscos e limites.',
    midiaIds: ['resultado-nariz-perfil-p001', 'resultado-nariz-perfil-p008'],
  }),
  defineServico({
    id: 'perfiloplastia',
    nome: 'Perfiloplastia',
    categoria: 'injetavel',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    produto: aConfirmar('Preenchedor injetável (classe a CONFIRMAR)'),
    resumo: 'Combinação de procedimentos injetáveis no perfil do rosto, planejada após avaliação.',
    midiaIds: ['resultado-perfil-rosto-p006'],
  }),
  defineServico({
    id: 'papada',
    nome: 'Procedimento para papada',
    categoria: 'injetavel', // CONFIRMAR: injetável ou equipamento?
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    produto: aConfirmar('CONFIRMAR técnica e produto', true),
    resumo: 'Avaliação da região submentoniana e indicação, ou não, de procedimento.',
    midiaIds: ['resultado-papada-perfil-p007'],
  }),
  defineServico({
    id: 'harmonizacao-facial',
    nome: 'Harmonização facial',
    categoria: 'injetavel',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    resumo: 'Conjunto de procedimentos faciais definidos em avaliação individual, com riscos explicados.',
    midiaIds: ['resultado-perfil-rosto-antes-p009', 'resultado-perfil-rosto-depois-p009'],
  }),
  defineServico({
    id: 'remocao-de-tatuagem',
    nome: 'Remoção de tatuagem a laser',
    categoria: 'laser-luz',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    equipamento: aConfirmar('Laser para pigmentos (tecnologia a CONFIRMAR)'),
    resumo: 'Clareamento progressivo de tatuagens com laser, em sessões; o número varia de pessoa para pessoa.',
  }),
  defineServico({
    id: 'micropigmentacao-e-remocao',
    nome: 'Micropigmentação e remoção de micropigmentação',
    categoria: 'micropigmentacao',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    equipamento: aConfirmar('Dermógrafo e, para remoção, técnica a CONFIRMAR'),
    resumo: 'Aplicação de pigmento na pele e remoção de pigmentação anterior, planejadas em avaliação.',
  }),
  defineServico({
    id: 'remocao-de-manchas',
    nome: 'Tratamento de manchas',
    categoria: 'laser-luz', // CONFIRMAR: laser, luz pulsada ou peeling?
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    equipamento: aConfirmar('CONFIRMAR equipamento'),
    resumo: 'Tratamento de manchas na pele definido após avaliação, com fase de cicatrização.',
    midiaIds: ['resultado-mao-manchas-p004'],
  }),
  defineServico({
    id: 'depilacao',
    // CONFIRMAR: "Depilação a laser" (laser) ou "Fotodepilação" (luz intensa pulsada) conforme o equipamento.
    nome: 'Redução de pelos',
    categoria: 'laser-luz',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    equipamento: aConfirmar('CONFIRMAR: laser (diodo/alexandrite/Nd:YAG) ou luz intensa pulsada'),
    resumo: 'Redução progressiva de pelos em sessões; o número de sessões varia de pessoa para pessoa.',
  }),
  defineServico({
    id: 'sobrancelhas',
    nome: 'Design e micropigmentação de sobrancelhas',
    categoria: 'micropigmentacao',
    invasivo: true,
    sensivel: false,
    executor: CONFIRMAR,
    equipamento: aConfirmar('Dermógrafo (a CONFIRMAR)'),
    resumo: 'Desenho das sobrancelhas e, quando indicado, micropigmentação.',
  }),
  defineServico({
    id: 'estetica-intima-masculina',
    nome: 'Estética íntima masculina',
    categoria: 'procedimento-intimo',
    invasivo: true,
    sensivel: true,
    executor: CONFIRMAR,
    resumo: 'Atendimento reservado, apenas mediante avaliação.',
  }),
];
