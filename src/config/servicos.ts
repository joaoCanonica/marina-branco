import type { Servico } from '../lib/esquemas.ts';

/**
 * Catálogo. `publicar: false` até executor, registro, habilitação e (se houver
 * página) pesquisa estarem conferidos. O build recusa publicar invasivo sem isso.
 */
export const servicos: Servico[] = [
  {
    slug: 'limpeza-de-pele',
    nome: 'Limpeza de pele',
    categoria: 'facial-nao-invasivo',
    executorId: 'marina',
    resumo: 'Higienização profunda da pele, com etapas definidas após avaliação.',
    publicar: false,
  },
  {
    slug: 'avaliacao-injetaveis',
    nome: 'Avaliação para procedimentos injetáveis',
    categoria: 'injetavel',
    executorId: 'marina', // CONFIRMAR executor habilitado
    resumo: 'Consulta de avaliação para indicar, ou não, um procedimento injetável.',
    publicar: false,
    envolvePrescricao: true,
  },
  {
    slug: 'depilacao-a-laser',
    // CONFIRMAR: "depilação a laser" (laser) ou "fotodepilação" (luz pulsada) conforme o equipamento.
    nome: 'Redução de pelos com laser',
    categoria: 'laser-luz',
    executorId: 'marina',
    equipamentoId: 'laser-depilacao',
    resumo: 'Redução progressiva de pelos, com número de sessões variável de pessoa para pessoa.',
    publicar: false,
  },
  {
    slug: 'micropigmentacao-sobrancelhas',
    nome: 'Micropigmentação de sobrancelhas',
    categoria: 'micropigmentacao',
    executorId: 'marina',
    resumo: 'Pigmentação superficial da região das sobrancelhas, planejada em avaliação.',
    publicar: false,
  },
];
