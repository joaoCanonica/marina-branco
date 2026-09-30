/** Acesso de leitura para componentes: só dados já filtrados pelas regras. */
import { categorias, type Profissional, type Servico } from './esquemas.ts';
import { ambiente, dados } from './contexto.ts';
import { impedimentosMidiaProducao, servicosPublicaveis } from './regras/index.ts';

const amb = ambiente(process.cwd());

export const site = {
  clinica: dados.clinica,
  ambiente: amb,
  servicos: servicosPublicaveis(dados, amb),
  profissional: (id: string): Profissional => {
    const p = dados.profissionais.find((x) => x.id === id);
    if (!p) throw new Error(`profissional ${id} inexistente`);
    return p;
  },
  categoria: (s: Servico) => categorias[s.categoria],
  whatsappUrl: () => (/^\d{12,13}$/.test(dados.clinica.whatsapp) ? `https://wa.me/${dados.clinica.whatsapp}` : undefined),
  midia: (id: string) => {
    const m = dados.midia.find((x) => x.id === id);
    if (!m) throw new Error(`mídia ${id} fora do manifesto`);
    // Segunda barreira (a primeira é a validação no início do build).
    if (amb.producao && impedimentosMidiaProducao(m).length) throw new Error(`mídia ${id} bloqueada em produção`);
    if (!amb.producao && m.provisoria && !amb.previewProtegido) throw new Error(`mídia ${id} provisória sem preview protegido`);
    return m;
  },
};

/** Identificação regulatória do executor, ex.: "Biomédica · CRBM-5 12345/SC". */
export function identificacao(p: Profissional): string {
  const partes = [p.formacao];
  if (p.conselho !== 'NENHUM' && p.registro) partes.push(p.uf ? `${p.registro}/${p.uf}` : p.registro);
  if (p.conselho === 'CFM' && p.rqe) partes.push(`RQE ${p.rqe}`);
  return partes.join(' · ');
}
