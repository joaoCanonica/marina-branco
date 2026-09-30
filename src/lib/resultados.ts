/**
 * Regras do módulo de Resultados. Funções puras (testadas).
 *  - Toda mídia usada: publicavel, consentimento 'ok', autoria própria, OCR ok, sem problemas.
 *  - Nunca mama, glúteo ou região íntima; nunca colagem; nunca filtro/edição que melhore.
 *  - Perfil CFM (Res. CFM 2.336/2023 — CONFIRMAR texto vigente): por procedimento,
 *    condição apresentada, antes e depois de ≥ 4 pacientes, e descrição de resultados
 *    insatisfatórios e complicações possíveis.
 *  - Demais perfis (padrão conservador): mesma pose/luz/ângulo, tempo decorrido e nº de
 *    sessões informados, aviso "resultados variam".
 */
import type { ItemMidia, PerfilRegulatorio, Servico } from './esquemas.ts';
import { impedimentosMidia } from './regras/index.ts';

export const regioesVetadas = ['mama', 'gluteo', 'intima'] as const;
export type Regiao = 'face' | 'labios' | 'nariz' | 'mento-papada' | 'sobrancelhas' | 'pescoco' | 'maos' | 'corpo-outra' | (typeof regioesVetadas)[number];

export interface CasoResultado {
  id: string;
  servico: string;
  pacienteRef: string;
  antesId: string;
  depoisId: string;
  regiao: Regiao;
  /** Ex.: "30 dias após o procedimento". Obrigatório. */
  tempoDecorrido: string;
  /** Ex.: "1 sessão". Obrigatório. */
  sessoes: string;
  /** Confirmação humana de que as duas fotos têm mesma pose, luz, ângulo e fundo. */
  padronizacaoConferida: boolean;
  /** Confirmação humana: sem filtro, retoque ou edição que melhore o resultado. */
  semEdicaoQueMelhore: boolean;
  /** Imagem única de um caso (não colagem de pacientes/fotos). */
  semColagem: boolean;
  legenda?: string;
}

export interface TextoProcedimento {
  servico: string;
  /** CFM: condição apresentada antes do procedimento. */
  condicao: string;
  /** CFM: resultados insatisfatórios e complicações possíveis. */
  insatisfatoriosEComplicacoes: string;
}

export interface ConfigResultados {
  ativo: boolean;
  procedimentos: TextoProcedimento[];
  casos: CasoResultado[];
}

export interface Contexto {
  perfil: PerfilRegulatorio;
  midia: ItemMidia[];
  /** Serviços publicáveis (com executor habilitado). */
  servicosPublicaveis: Servico[];
}

export const MIN_PACIENTES_CFM = 4;

export function verificarResultados(cfg: ConfigResultados, ctx: Contexto): string[] {
  if (!cfg.ativo) return [];
  const erros: string[] = [];
  const porId = new Map(ctx.midia.map((m) => [m.id, m]));
  for (const c of cfg.casos) {
    const pre = `caso ${c.id}`;
    if ((regioesVetadas as readonly string[]).includes(c.regiao)) erros.push(`${pre}: região vetada (${c.regiao})`);
    if (!ctx.servicosPublicaveis.some((s) => s.id === c.servico)) erros.push(`${pre}: serviço ${c.servico} não é publicável`);
    if (!/^P-\d{3,}$/.test(c.pacienteRef)) erros.push(`${pre}: pacienteRef inválido`);
    if (!c.semColagem) erros.push(`${pre}: colagem não é permitida`);
    if (!c.semEdicaoQueMelhore) erros.push(`${pre}: edição/filtro que melhora o resultado não é permitido`);
    for (const [papel, id] of [['antes', c.antesId], ['depois', c.depoisId]] as const) {
      const m = porId.get(id);
      if (!m) { erros.push(`${pre}: mídia ${papel} "${id}" não está no manifesto`); continue; }
      if (m.consentimento !== 'ok') erros.push(`${pre}: mídia ${papel} ${id} sem consentimento "ok"`);
      for (const x of impedimentosMidia(m)) erros.push(`${pre}: mídia ${papel} ${id} — ${x}`);
      if (m.pacienteRef !== c.pacienteRef) erros.push(`${pre}: mídia ${papel} ${id} é de outra pacienteRef`);
    }
    if (ctx.perfil !== 'cfm') {
      if (!c.padronizacaoConferida) erros.push(`${pre}: pose/luz/ângulo não conferidos como iguais`);
      if (!c.tempoDecorrido.trim()) erros.push(`${pre}: tempo decorrido não informado`);
      if (!c.sessoes.trim()) erros.push(`${pre}: número de sessões não informado`);
    }
  }
  if (ctx.perfil === 'cfm') {
    for (const servico of new Set(cfg.casos.map((c) => c.servico))) {
      const t = cfg.procedimentos.find((p) => p.servico === servico);
      if (!t?.condicao.trim()) erros.push(`CFM ${servico}: falta a condição apresentada`);
      if (!t?.insatisfatoriosEComplicacoes.trim()) erros.push(`CFM ${servico}: falta descrição de resultados insatisfatórios e complicações`);
      const pacientes = new Set(cfg.casos.filter((c) => c.servico === servico).map((c) => c.pacienteRef));
      if (pacientes.size < MIN_PACIENTES_CFM) erros.push(`CFM ${servico}: antes e depois de ${pacientes.size} paciente(s); mínimo ${MIN_PACIENTES_CFM}`);
    }
  }
  if (ctx.perfil === 'CONFIRMAR') erros.push('perfil regulatório CONFIRMAR: resultados não podem ser publicados');
  return erros;
}

/** Casos que podem aparecer (só quando ativo e sem nenhum erro). */
export function casosExibiveis(cfg: ConfigResultados, ctx: Contexto): CasoResultado[] {
  return cfg.ativo && verificarResultados(cfg, ctx).length === 0 ? cfg.casos : [];
}
