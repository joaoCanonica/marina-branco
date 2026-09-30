/**
 * Regras de publicação. Funções puras: recebem dados + ambiente e devolvem
 * erros (bloqueiam) e avisos. Usadas pelo build (integração Astro), pelo
 * `pnpm validar` e pelos testes.
 */
import {
  categorias,
  clinicaSchema,
  equipamentoSchema,
  habilitacaoSchema,
  midiaSchema,
  PENDENTE,
  profissionalSchema,
  regioesProibidas,
  servicoSchema,
  type Clinica,
  type Equipamento,
  type Habilitacao,
  type Midia,
  type Profissional,
  type Servico,
} from '../esquemas.ts';
import { verificarTexto } from './texto.ts';

export interface Dados {
  clinica: Clinica;
  profissionais: Profissional[];
  habilitacoes: Habilitacao[];
  equipamentos: Equipamento[];
  servicos: Servico[];
  midia: Midia[];
}

export interface Ambiente {
  producao: boolean;
  /** Em preview com mídia provisória, exige confirmação de proteção por senha. */
  previewProtegido: boolean;
  /** Existe docs/pesquisa/<slug>.md com "Status: aprovado". */
  pesquisaAprovada: (slug: string) => boolean;
}

export interface Relatorio {
  erros: string[];
  avisos: string[];
}

const temPendente = (v: unknown): boolean => JSON.stringify(v ?? '').includes(PENDENTE);

export function habilitacaoConferida(d: Dados, p: Profissional, s: Servico): Habilitacao | undefined {
  return d.habilitacoes.find((h) => h.conselho === p.conselho && h.categoria === s.categoria && h.textoVigenteConferido);
}

/** Motivos que impedem o serviço de ser publicado (vazio = publicável). */
export function impedimentosServico(d: Dados, s: Servico, amb: Pick<Ambiente, 'pesquisaAprovada'>): string[] {
  const m: string[] = [];
  const p = d.profissionais.find((x) => x.id === s.executorId);
  if (!p) return [`executor "${s.executorId}" não existe em profissionais`];
  if (temPendente(s)) m.push('serviço tem campo CONFIRMAR');

  if (categorias[s.categoria].invasivo) {
    if (p.conselho !== 'NENHUM' && (!p.registro || !p.uf || temPendente(p.registro)))
      m.push(`executor ${p.id} sem registro/UF no ${p.conselho}`);
    if (!p.registroConferido) m.push(`registro/formação de ${p.id} não conferidos em documento (registroConferido)`);
    if (temPendente(p)) m.push(`profissional ${p.id} tem campo CONFIRMAR`);
    if (!habilitacaoConferida(d, p, s))
      m.push(`sem habilitação conferida para ${p.conselho} × ${s.categoria} (src/config/habilitacoes.ts)`);
  }
  if (s.equipamentoId) {
    const e = d.equipamentos.find((x) => x.id === s.equipamentoId);
    if (!e) m.push(`equipamento "${s.equipamentoId}" inexistente`);
    else if (!e.registroAnvisa || !e.registroConferido || temPendente(e))
      m.push(`equipamento ${e.id} sem registro ANVISA conferido`);
  }
  if (s.paginaConteudo && !amb.pesquisaAprovada(s.slug))
    m.push(`página de conteúdo exige docs/pesquisa/${s.slug}.md com "Status: aprovado"`);
  return m;
}

export function servicosPublicaveis(d: Dados, amb: Pick<Ambiente, 'pesquisaAprovada'>): Servico[] {
  return d.servicos.filter((s) => s.publicar && impedimentosServico(d, s, amb).length === 0);
}

/** Motivos que impedem a mídia de renderizar em PRODUÇÃO. */
export function impedimentosMidiaProducao(m: Midia): string[] {
  const r: string[] = [];
  if (m.provisoria) r.push('marcada como provisória');
  if (!m.autoriaPropria) r.push('sem autoria própria');
  if (m.textoPromessa) r.push('contém texto de promessa não coberto');
  if (m.tipo === 'paciente') {
    if (!m.termoAutorizacao) r.push('paciente sem termo de autorização de imagem assinado');
    if (!m.regiaoCorporal) r.push('região corporal não informada');
  }
  if (m.regiaoCorporal && (regioesProibidas as readonly string[]).includes(m.regiaoCorporal))
    r.push(`região proibida (${m.regiaoCorporal})`);
  if (m.antesDepois) r.push('antes/depois bloqueado até perfil regulatório definido (ver docs/REGULATORIO.md)');
  if ((m.edicoes ?? []).length > 0 && !m.derivado) r.push('edições registradas sem arquivo derivado');
  if (!m.originalSha256) r.push('original sem sha256 registrado');
  return r;
}

export function validar(d: Dados, amb: Ambiente, midiaReferenciada: string[] = []): Relatorio {
  const erros: string[] = [];
  const avisos: string[] = [];
  const esquema = (nome: string, r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) => {
    if (!r.success) for (const i of r.error!.issues) erros.push(`[esquema] ${nome}.${i.path.join('.')}: ${i.message}`);
  };

  esquema('clinica', clinicaSchema.safeParse(d.clinica));
  d.profissionais.forEach((p) => esquema(`profissional[${p.id}]`, profissionalSchema.safeParse(p)));
  d.habilitacoes.forEach((h, i) => esquema(`habilitacao[${i}]`, habilitacaoSchema.safeParse(h)));
  d.equipamentos.forEach((e) => esquema(`equipamento[${e.id}]`, equipamentoSchema.safeParse(e)));
  d.servicos.forEach((s) => esquema(`servico[${s.slug}]`, servicoSchema.safeParse(s)));
  d.midia.forEach((m) => esquema(`midia[${m.id}]`, midiaSchema.safeParse(m)));

  // Título só com confirmação.
  for (const p of d.profissionais)
    if (p.titulo && !p.tituloConfirmado) erros.push(`[titulo] ${p.id}: "${p.titulo}" sem tituloConfirmado`);
  for (const p of d.profissionais)
    if (p.rqe && p.conselho !== 'CFM') erros.push(`[titulo] ${p.id}: RQE só existe para CFM`);

  // Serviços: publicar:true com impedimento é ERRO em qualquer ambiente.
  for (const s of d.servicos) {
    if (!s.publicar) continue;
    const imp = impedimentosServico(d, s, amb);
    for (const x of imp) erros.push(`[servico] ${s.slug} (publicar: true): ${x}`);
    for (const o of verificarTexto(`${s.nome}\n${s.resumo}`)) erros.push(`[texto] ${s.slug}: ${o.motivo} — "${o.trecho}"`);
  }
  for (const s of d.servicos) if (!s.publicar) avisos.push(`[servico] ${s.slug} não publicado`);

  // Clínica: pendências bloqueiam produção.
  if (amb.producao && temPendente(d.clinica)) erros.push('[clinica] dados com CONFIRMAR bloqueiam produção');
  if (amb.producao) {
    const publicados = servicosPublicaveis(d, amb);
    const executores = new Set(publicados.map((s) => s.executorId));
    for (const id of executores) {
      const p = d.profissionais.find((x) => x.id === id);
      if (p && temPendente(p)) erros.push(`[profissional] ${id} tem CONFIRMAR e executa serviço publicado`);
    }
  }

  // Mídia.
  const porId = new Map(d.midia.map((m) => [m.id, m]));
  for (const id of midiaReferenciada) {
    const m = porId.get(id);
    if (!m) {
      erros.push(`[midia] referência a "${id}" que não está no manifesto`);
      continue;
    }
    if (amb.producao) for (const x of impedimentosMidiaProducao(m)) erros.push(`[midia] ${id} referenciada em produção: ${x}`);
    else if (m.provisoria && !amb.previewProtegido)
      erros.push(`[midia] ${id} provisória em build não-produção sem PREVIEW_PROTECAO_CONFIRMADA=true`);
  }

  return { erros, avisos };
}
