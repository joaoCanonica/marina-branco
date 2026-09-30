/**
 * Núcleo regulatório: funções puras sobre dados + ambiente. Devolve achados
 * agrupados; em produção todo achado é erro (bloqueia), fora dela é aviso e o
 * item com impedimento simplesmente não renderiza.
 */
import {
  CONFIRMAR,
  categorias,
  membroSchema,
  profileSchema,
  servicoSchema,
  type ItemMidia,
  type Membro,
  type Profile,
  type Servico,
} from '../esquemas.ts';
import {
  habilitacoes as habilitacoesPadrao,
  padraoTratamento,
  perfis,
  rotaReservada,
  termosPromocao,
  termosVetadosBase,
  type RegrasPerfil,
  type TermoVetado,
} from '../../config/compliance.config.ts';
import { verificarTexto } from './texto.ts';

export type Grupo = 'identidade' | 'servicos' | 'midia' | 'anvisa' | 'texto' | 'pendente';

export const rotulosGrupo: Record<Grupo, string> = {
  identidade: 'Identidade profissional',
  servicos: 'Serviços sem executor habilitado',
  midia: 'Mídia sem consentimento',
  anvisa: 'ANVISA (equipamentos e produtos)',
  texto: 'Termos vetados e títulos',
  pendente: 'Outros campos CONFIRMAR',
};

export interface Achado {
  grupo: Grupo;
  msg: string;
}

export interface Dados {
  profile: Profile;
  servicos: Servico[];
  midia: ItemMidia[];
  habilitacoes?: typeof habilitacoesPadrao;
}

export interface Ambiente {
  producao: boolean;
  /** docs/pesquisa/<id>.md com "Status: aprovado". */
  pesquisaAprovada: (id: string) => boolean;
}

export interface Relatorio {
  erros: string[];
  avisos: string[];
  achados: Achado[];
}

const pendente = (v: unknown): boolean => JSON.stringify(v ?? '').includes(CONFIRMAR);

/** Regras do perfil da clínica. Perfil CONFIRMAR usa o mais restritivo (sem título, sem promoção). */
export function regrasDoPerfil(p: Profile): RegrasPerfil {
  return p.perfilRegulatorio === CONFIRMAR ? perfis['estetica-sem-conselho'] : perfis[p.perfilRegulatorio];
}

/** Perfil aplicável a um membro, pelo conselho dele. */
export function regrasDoMembro(m: Membro): RegrasPerfil {
  const achado = Object.values(perfis).find((r) => r.conselho === m.conselho);
  return achado ?? perfis['estetica-sem-conselho'];
}

export function termosDoPerfil(r: RegrasPerfil): TermoVetado[] {
  return [...termosVetadosBase, ...r.termosVetados, ...(r.permitePromocao ? [] : termosPromocao)];
}

/** Tratamento exibível de um membro: vazio se o perfil do conselho dele não comporta. */
export function tratamentoExibivel(m: Membro): string {
  const t = m.tratamento ?? '';
  return t && (regrasDoMembro(m).tratamentosPermitidos as readonly string[]).includes(t) ? t : '';
}

export function membro(d: Dados, id: string | null): Membro | undefined {
  return d.profile.equipe.find((m) => m.id === id);
}

/** Motivos que impedem o serviço de publicar (vazio = publicável). */
export function impedimentosServico(d: Dados, s: Servico, amb: Pick<Ambiente, 'pesquisaAprovada'>): Achado[] {
  const r: Achado[] = [];
  const e = membro(d, s.executor);
  if (s.invasivo) {
    if (!e) r.push({ grupo: 'servicos', msg: `${s.id}: invasivo sem executor definido em profile.equipe (executor: "${s.executor}")` });
    else {
      if (!e.conselho) r.push({ grupo: 'servicos', msg: `${s.id}: executor ${e.id} sem conselho profissional — serviço invasivo não pode ser anunciado` });
      if (!e.registro || pendente(e.registro)) r.push({ grupo: 'servicos', msg: `${s.id}: executor ${e.id} sem nº de registro/UF no conselho` });
      if (!e.registroConferido) r.push({ grupo: 'servicos', msg: `${s.id}: registro de ${e.id} não conferido em documento (registroConferido)` });
      const hab = (d.habilitacoes ?? habilitacoesPadrao).find((h) => h.conselho === e.conselho && h.categoria === s.categoria && h.conferido);
      if (e.conselho && !hab) r.push({ grupo: 'servicos', msg: `${s.id}: sem habilitação conferida para ${e.conselho} × ${s.categoria} (compliance.config.ts → habilitacoes)` });
    }
  } else if (!e) r.push({ grupo: 'servicos', msg: `${s.id}: sem executor definido` });

  for (const [campo, insumo] of [['equipamento', s.equipamento], ['produto', s.produto]] as const) {
    if (!insumo) continue;
    if (pendente(insumo.registroAnvisa) || !insumo.registroConferido)
      r.push({ grupo: 'anvisa', msg: `${s.id}: ${campo} "${insumo.descricao}" sem registro ANVISA conferido` });
  }
  if (s.sensivel) {
    const insumos = [s.equipamento, s.produto].filter(Boolean);
    if (insumos.length === 0) r.push({ grupo: 'anvisa', msg: `${s.id}: serviço sensível sem produto/equipamento declarado (registro e indicação obrigatórios)` });
    for (const i of insumos) if (!i!.indicacaoConferida) r.push({ grupo: 'anvisa', msg: `${s.id}: "${i!.descricao}" sem indicação para a região conferida na instrução de uso registrada` });
  }
  if (s.sensivel && (!s.rota.startsWith(rotaReservada) || !s.noindex))
    r.push({ grupo: 'servicos', msg: `${s.id}: serviço sensível fora da rota reservada ${rotaReservada} ou sem noindex (rota: ${s.rota})` });
  if (!s.sensivel && s.rota.startsWith(rotaReservada))
    r.push({ grupo: 'servicos', msg: `${s.id}: rota reservada é só para serviços sensíveis` });
  if (s.paginaPropria && !amb.pesquisaAprovada(s.id))
    r.push({ grupo: 'servicos', msg: `${s.id}: página própria exige docs/pesquisa/${s.id}.md com "Status: aprovado"` });
  if (pendente({ ...s, executor: null, equipamento: null, produto: null }))
    r.push({ grupo: 'pendente', msg: `${s.id}: campos com CONFIRMAR` });
  return r;
}

export function servicosPublicaveis(d: Dados, amb: Pick<Ambiente, 'pesquisaAprovada'>): Servico[] {
  return d.servicos.filter((s) => s.publicavel && impedimentosServico(d, s, amb).length === 0);
}

/** Motivos que impedem uma mídia de ir para produção. */
export function impedimentosMidia(m: ItemMidia): string[] {
  const r: string[] = [];
  if (!['ok', 'nao-se-aplica'].includes(m.consentimento)) r.push(`consentimento "${m.consentimento}"`);
  if (m.autoria !== 'propria') r.push(`autoria "${m.autoria}"`);
  if (m.ocr.ok !== true) r.push('OCR não aprovado');
  if (m.problemas.length) r.push(`${m.problemas.length} problema(s) em aberto`);
  if (!m.publicavel) r.push('publicavel: false');
  return r;
}

export function validar(d: Dados, amb: Ambiente): Relatorio {
  const achados: Achado[] = [];
  const add = (grupo: Grupo, msg: string) => achados.push({ grupo, msg });

  // Esquemas.
  const ps = profileSchema.safeParse(d.profile);
  if (!ps.success) for (const i of ps.error.issues) add('identidade', `[esquema] profile.${i.path.join('.')}: ${i.message}`);
  d.profile.equipe.forEach((m) => {
    const r = membroSchema.safeParse(m);
    if (!r.success) for (const i of r.error.issues) add('identidade', `[esquema] equipe[${m.id}].${i.path.join('.')}: ${i.message}`);
  });
  d.servicos.forEach((s) => {
    const r = servicoSchema.safeParse(s);
    if (!r.success) for (const i of r.error.issues) add('servicos', `[esquema] servico[${s.id}].${i.path.join('.')}: ${i.message}`);
  });
  const ids = new Set<string>();
  for (const s of d.servicos) {
    if (ids.has(s.id)) add('servicos', `id de serviço duplicado: ${s.id}`);
    ids.add(s.id);
  }

  // (a) Perfil e títulos.
  const p = d.profile;
  const regras = regrasDoPerfil(p);
  if (p.perfilRegulatorio === CONFIRMAR) add('identidade', 'perfilRegulatorio é CONFIRMAR: defina o perfil da responsável');
  if (p.tratamento === CONFIRMAR) add('identidade', 'profile.tratamento é CONFIRMAR');
  else if (p.tratamento && !(regras.tratamentosPermitidos as readonly string[]).includes(p.tratamento))
    add('identidade', `tratamento "${p.tratamento}" não é comportado pelo perfil ${p.perfilRegulatorio}`);
  if (regras.conselho && (!p.conselho || p.conselho.sigla !== regras.conselho || pendente(p.conselho)))
    add('identidade', `perfil ${p.perfilRegulatorio} exige conselho ${regras.conselho} com nº e UF em profile.conselho`);
  if (!regras.conselho && p.conselho) add('identidade', `perfil ${p.perfilRegulatorio} não tem conselho, mas profile.conselho está preenchido`);
  if (!membro(d, p.responsavelId)) add('identidade', `responsavelId "${p.responsavelId}" não está em profile.equipe`);
  for (const m of p.equipe) {
    const rm = regrasDoMembro(m);
    if (m.tratamento && !(rm.tratamentosPermitidos as readonly string[]).includes(m.tratamento))
      add('identidade', `equipe[${m.id}]: tratamento "${m.tratamento}" não é comportado pelo conselho ${m.conselho ?? 'nenhum'}`);
    if ((m.rqe ?? []).length && m.conselho !== 'CFM') add('identidade', `equipe[${m.id}]: RQE só existe para CFM`);
    if (m.conselho && !m.registro) add('identidade', `equipe[${m.id}]: conselho ${m.conselho} sem registro`);
  }
  // Tratamento escrito à mão em textos: nunca (o componente é quem emite, se permitido).
  const textosLivres = [p.titulo, ...p.equipe.flatMap((m) => [m.titulo, m.funcao]), ...d.servicos.flatMap((s) => [s.nome, s.resumo])];
  for (const t of textosLivres)
    if (padraoTratamento.test(t)) add('texto', `tratamento escrito em texto livre ("${t}"): use o campo tratamento`);

  // (b)(c) Serviços.
  for (const s of d.servicos) {
    const imp = impedimentosServico(d, s, amb);
    if (s.publicavel) for (const x of imp) achados.push({ grupo: x.grupo, msg: `(publicavel) ${x.msg}` });
    else if (imp.length) for (const x of imp) achados.push({ grupo: x.grupo, msg: `(não publicado) ${x.msg}` });
  }

  // (d) Termos vetados no que pode aparecer.
  const termos = termosDoPerfil(regras);
  const visiveis = [p.nomeClinica, p.titulo, ...p.equipe.flatMap((m) => [m.titulo, m.funcao]), ...d.servicos.filter((s) => s.publicavel).flatMap((s) => [s.nome, s.resumo])];
  for (const t of visiveis) for (const o of verificarTexto(t, termos)) add('texto', `${o.motivo} — "${o.trecho}"`);

  // Mídia dos serviços publicáveis.
  const porId = new Map(d.midia.map((m) => [m.id, m]));
  for (const s of d.servicos) {
    for (const id of s.midiaIds) {
      const m = porId.get(id);
      if (!m) add('midia', `${s.id}: midiaId "${id}" não está no media.manifest.json`);
      else if (s.publicavel) for (const x of impedimentosMidia(m)) add('midia', `${s.id}: mídia ${id} — ${x}`);
    }
  }
  for (const m of d.midia)
    if (m.consentimento === 'pendente') add('midia', `${m.id}${m.pacienteRef ? ` (${m.pacienteRef})` : ''}: consentimento pendente`);

  // (e) CONFIRMAR no que aparece no site.
  const doSite = { ...p, equipe: p.equipe.filter((m) => m.id === p.responsavelId || d.servicos.some((s) => s.publicavel && s.executor === m.id)) };
  const camposIdentidade = new Set(['nome', 'titulo', 'tratamento', 'conselho', 'perfilRegulatorio']);
  for (const m of doSite.equipe)
    for (const [k, v] of Object.entries(m)) if (pendente(v)) add('identidade', `equipe[${m.id}].${k} com CONFIRMAR`);
  for (const [k, v] of Object.entries(doSite)) {
    if (k === 'equipe' || !pendente(v)) continue;
    add(camposIdentidade.has(k) ? 'identidade' : 'pendente', `profile.${k} com CONFIRMAR`);
  }
  // Informativo: com este perfil e esta equipe, que serviços invasivos são possíveis?
  const semConselho = p.equipe.every((m) => !m.conselho);
  if (semConselho && d.servicos.some((s) => s.invasivo))
    achados.push({ grupo: 'identidade', msg: `(não publicado) nenhum membro da equipe tem conselho profissional: nenhum dos ${d.servicos.filter((s) => s.invasivo).length} serviços invasivos pode ser anunciado` });

  // Em produção, pendências de serviços/mídia NÃO publicados não bloqueiam (não renderizam).
  const bloqueia = (a: Achado) => !a.msg.startsWith('(não publicado)') && !(a.grupo === 'midia' && a.msg.includes('consentimento pendente'));
  // Serviço sensível marcado como publicável com qualquer impedimento: erro em QUALQUER ambiente.
  const idsSensiveis = d.servicos.filter((s) => s.sensivel && s.publicavel).map((s) => s.id);
  const sempre = (a: Achado) => a.msg.startsWith('(publicavel)') && idsSensiveis.some((id) => a.msg.includes(` ${id}:`));
  const fmt = (a: Achado) => `[${rotulosGrupo[a.grupo]}] ${a.msg}`;
  const erros = achados.filter((a) => (amb.producao && bloqueia(a)) || sempre(a)).map(fmt);
  const avisos = achados.filter((a) => !((amb.producao && bloqueia(a)) || sempre(a))).map(fmt);
  return { erros, avisos, achados };
}

export { categorias };
