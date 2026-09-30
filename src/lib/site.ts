/** Acesso de leitura para componentes: só dados já filtrados pelas regras. */
import { avisos, rotaReservada } from '../config/compliance.config.ts';
import { categorias, type Membro, type Servico } from './esquemas.ts';
import { ambiente, dados } from './contexto.ts';
import { impedimentosServico, membro, regrasDoMembro, regrasDoPerfil, servicosPublicaveis, tratamentoExibivel } from './regras/index.ts';

const raiz = process.cwd();
const amb = ambiente(raiz);
const d = dados(raiz);
const publicaveis = servicosPublicaveis(d, amb);

export const site = {
  profile: d.profile,
  ambiente: amb,
  avisos,
  regras: regrasDoPerfil(d.profile),
  /** Serviços públicos (lista, menus, sitemap). Sensíveis ficam fora. */
  servicos: publicaveis.filter((s) => !s.sensivel),
  /** Serviços sensíveis publicáveis: só na rota reservada, nunca listados. */
  servicosReservados: publicaveis.filter((s) => s.sensivel),
  rotaReservada,
  /**
   * Páginas de procedimento a gerar. Produção: SÓ serviços publicáveis (executor
   * habilitado, ANVISA, pesquisa aprovada...). Fora de produção: também rascunhos,
   * marcados, para revisão no preview protegido.
   */
  paginasProcedimento: (): { s: Servico; rascunho: string[] }[] =>
    d.servicos
      .filter((s) => s.paginaPropria && !s.sensivel)
      .map((s) => ({ s, rascunho: impedimentosServico(d, s, amb).map((i) => i.msg).concat(s.publicavel ? [] : [`${s.id}: publicavel = false`]) }))
      .filter((p) => p.rascunho.length === 0 || !amb.producao),
  membroOuNada: (id: string | null): Membro | undefined => membro(d, id),
  membro: (id: string | null): Membro => {
    const m = membro(d, id);
    if (!m) throw new Error(`membro ${id} inexistente em profile.equipe`);
    return m;
  },
  responsavel: (): Membro => site.membro(d.profile.responsavelId),
  categoria: (s: Servico) => categorias[s.categoria],
  whatsappUrl: (mensagem?: string) => {
    const n = d.profile.whatsapp.replace(/\D/g, '');
    if (/CONFIRMAR/.test(d.profile.whatsapp) || !/^\d{12,13}$/.test(n)) return undefined;
    return `https://wa.me/${n}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}`;
  },
};

/** Identificação conforme o perfil do conselho do membro: "Título · CRBM-5 12345/SC · RQE 1". */
export function identificacao(m: Membro): string {
  const r = regrasDoMembro(m);
  const partes = [m.titulo];
  if (r.identificacao.conselho && m.conselho && m.registro)
    partes.push(`${m.conselho} ${m.registro.numero}/${m.registro.uf}`);
  if (r.identificacao.rqe && (m.rqe ?? []).length) partes.push(`RQE ${(m.rqe ?? []).join(', ')}`);
  return partes.join(' · ');
}

export { tratamentoExibivel };
