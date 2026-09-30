/**
 * Esquemas do núcleo regulatório. Tudo que é específico da clínica vive em
 * src/config/*.config.ts; componentes só leem dados validados por estes esquemas.
 *
 * Convenção: qualquer string contendo "CONFIRMAR" é pendente. Em produção,
 * pendente em dado que aparece no site bloqueia o build.
 */
import { z } from 'zod';

export const CONFIRMAR = 'CONFIRMAR' as const;

/** Perfis regulatórios suportados. O perfil do site é o da responsável (profile). */
export const perfisRegulatorios = ['cfm', 'cfo', 'cfbm', 'cff', 'estetica-sem-conselho', CONFIRMAR] as const;
export type PerfilRegulatorio = (typeof perfisRegulatorios)[number];

export const siglasConselho = ['CFM', 'CFO', 'CFBM', 'CFF', 'COFEN', 'COFFITO'] as const;
export type SiglaConselho = (typeof siglasConselho)[number];

/**
 * Categorias de procedimento. `invasivo` é o padrão da categoria; o serviço
 * declara o seu próprio `invasivo` e a validação exige coerência.
 */
export const categorias = {
  'facial-nao-invasivo': { invasivo: false, rotulo: 'Cuidados faciais' },
  'design-sobrancelha': { invasivo: false, rotulo: 'Sobrancelhas' },
  injetavel: { invasivo: true, rotulo: 'Procedimento injetável' },
  'laser-luz': { invasivo: true, rotulo: 'Laser e luz' },
  micropigmentacao: { invasivo: true, rotulo: 'Micropigmentação' },
  'procedimento-intimo': { invasivo: true, rotulo: 'Procedimento íntimo' },
} as const;
export type Categoria = keyof typeof categorias;
const categoriaEnum = z.enum(Object.keys(categorias) as [Categoria, ...Categoria[]]);

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data AAAA-MM-DD');
const conferencia = z.object({ em: data, por: z.string().min(2) });

/** Registro no conselho. `numero`/`uf` podem ser CONFIRMAR enquanto pendentes. */
export const registroSchema = z.object({ numero: z.string().min(1), uf: z.string().min(2) });

export const membroSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(2),
  /** Título profissional por extenso (ex.: "Biomédica esteta"). Nunca "Dra." aqui. */
  titulo: z.string().min(2),
  /** Tratamento ("Dra."/"Dr."): só se o perfil do conselho da pessoa permitir. */
  tratamento: z.enum(['', 'Dra.', 'Dr.']).default(''),
  conselho: z.enum(siglasConselho).nullable(),
  registro: registroSchema.nullable(),
  /** RQE: só CFM. */
  rqe: z.array(z.string()).default([]),
  /** Documento de registro visto por pessoa da equipe (não pela IA). */
  registroConferido: conferencia.nullable().default(null),
  funcao: z.string().min(2),
  fotoId: z.string().nullable(),
});
export type Membro = z.input<typeof membroSchema>;

export const unidadeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  cidade: z.string(),
  uf: z.string().length(2),
  endereco: z.string(),
  dias: z.string(),
  fixa: z.boolean(),
});

export const profileSchema = z.object({
  nome: z.string().min(2),
  nomeClinica: z.string().min(2),
  /** "" = o site nunca usa tratamento. */
  tratamento: z.enum(['', 'Dra.', 'Dr.', CONFIRMAR]),
  titulo: z.string().min(2),
  conselho: z.object({ sigla: z.enum(siglasConselho), numero: z.string(), uf: z.string() }).nullable(),
  perfilRegulatorio: z.enum(perfisRegulatorios),
  /** Id do membro de `equipe` que é a própria responsável. */
  responsavelId: z.string(),
  equipe: z.array(membroSchema).min(1),
  unidades: z.array(unidadeSchema).min(1),
  instagram: z.array(z.object({ rotulo: z.string(), usuario: z.string() })),
  whatsapp: z.string(),
  telefone: z.string(),
  cnpj: z.string(),
  alvaraSanitario: z.string(),
  encarregadoLgpd: z.object({ nome: z.string(), contato: z.string() }),
  dominio: z.string(),
});
export type Profile = z.input<typeof profileSchema>;

export const insumoSchema = z.object({
  /** Descrição genérica (tecnologia/classe). Marca só com registro conferido. */
  descricao: z.string().min(3),
  marcaModelo: z.string().nullable().default(null),
  registroAnvisa: z.string(),
  registroConferido: conferencia.extend({ url: z.url() }).nullable().default(null),
  /** Medicamento de prescrição: nunca aparece no site, nem genérico nem marca. */
  prescricao: z.boolean().default(false),
});
export type Insumo = z.input<typeof insumoSchema>;

export const servicoSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    nome: z.string().min(3),
    categoria: categoriaEnum,
    invasivo: z.boolean(),
    sensivel: z.boolean(),
    /** Id de um membro de profile.equipe. */
    executor: z.string().nullable(),
    exigeHabilitacao: z.boolean(),
    equipamento: insumoSchema.nullable(),
    produto: insumoSchema.nullable(),
    resumo: z.string().min(10),
    paginaPropria: z.boolean(),
    publicavel: z.boolean(),
    noindex: z.boolean(),
    /** Rota da página própria. Sensível: obrigatoriamente sob a rota reservada. */
    rota: z.string().regex(/^\/[a-z0-9/-]+$/),
    midiaIds: z.array(z.string()),
  })
  .superRefine((s, ctx) => {
    if (s.exigeHabilitacao !== s.invasivo)
      ctx.addIssue({ code: 'custom', message: 'exigeHabilitacao deve ser igual a invasivo (use defineServico)' });
    if (categorias[s.categoria].invasivo && !s.invasivo)
      ctx.addIssue({ code: 'custom', message: `categoria ${s.categoria} é invasiva; invasivo não pode ser false` });
  });
export type Servico = z.input<typeof servicoSchema>;

/** Item do media.manifest.json (subconjunto usado pelas regras). */
export interface ItemMidia {
  id: string;
  consentimento: 'ok' | 'pendente' | 'nao-se-aplica';
  autoria: string;
  publicavel: boolean;
  previewOk: boolean;
  ocr: { ok: boolean | null };
  problemas: string[];
  pacienteRef: string | null;
}
