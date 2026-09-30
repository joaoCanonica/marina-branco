/** Acesso de leitura para componentes: só dados já filtrados pelas regras. */
import { avisos, rotaReservada } from '../config/compliance.config.ts';
import { categorias, type Membro, type Servico } from './esquemas.ts';
import { ambiente, dados } from './contexto.ts';
import { membro, regrasDoMembro, regrasDoPerfil, servicosPublicaveis, tratamentoExibivel } from './regras/index.ts';

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
  membro: (id: string | null): Membro => {
    const m = membro(d, id);
    if (!m) throw new Error(`membro ${id} inexistente em profile.equipe`);
    return m;
  },
  responsavel: (): Membro => site.membro(d.profile.responsavelId),
  categoria: (s: Servico) => categorias[s.categoria],
  whatsappUrl: () => {
    const n = d.profile.whatsapp.replace(/\D/g, '');
    return /CONFIRMAR/.test(d.profile.whatsapp) || !/^\d{12,13}$/.test(n) ? undefined : `https://wa.me/${n}`;
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
