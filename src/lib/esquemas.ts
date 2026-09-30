/**
 * Esquemas de dados do site. Tudo que é específico da clínica vive em
 * src/config/*; os componentes só leem dados validados por estes esquemas.
 *
 * Convenção: qualquer string contendo "CONFIRMAR" é um pendente. Em build de
 * produção, pendente em dado publicado bloqueia o build.
 */
import { z } from 'zod';

export const PENDENTE = 'CONFIRMAR';

export const conselhos = [
  'CFM', // medicina
  'CFBM', // biomedicina
  'COFEN', // enfermagem
  'CFF', // farmácia
  'COFFITO', // fisioterapia
  'CFO', // odontologia
  'NENHUM', // esteticista/cosmetóloga (Lei 13.643/2018) — sem conselho
] as const;
export type Conselho = (typeof conselhos)[number];

/**
 * Categorias de procedimento. `invasivo: true` = só publica com executor
 * habilitado, registro conferido e habilitação conselho×categoria conferida.
 */
export const categorias = {
  'facial-nao-invasivo': { invasivo: false, rotulo: 'Cuidados faciais não invasivos' },
  'corporal-nao-invasivo': { invasivo: false, rotulo: 'Cuidados corporais não invasivos' },
  'injetavel': { invasivo: true, rotulo: 'Procedimento injetável' },
  'laser-luz': { invasivo: true, rotulo: 'Laser e luz intensa pulsada' },
  'micropigmentacao': { invasivo: true, rotulo: 'Micropigmentação' },
  'microagulhamento': { invasivo: true, rotulo: 'Microagulhamento' },
  'peeling-quimico': { invasivo: true, rotulo: 'Peeling químico' },
  'radiofrequencia-ultrassom': { invasivo: true, rotulo: 'Radiofrequência / ultrassom' },
  'criolipolise': { invasivo: true, rotulo: 'Criolipólise' },
} as const;
export type Categoria = keyof typeof categorias;
const categoriaEnum = z.enum(Object.keys(categorias) as [Categoria, ...Categoria[]]);

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data AAAA-MM-DD');

/** Profissional executor. Título ("Dra.") só aparece se tituloConfirmado. */
export const profissionalSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nomeExibicao: z.string().min(2),
  titulo: z.enum(['Dra.', 'Dr.']).optional(),
  tituloConfirmado: z.boolean().default(false),
  formacao: z.string(),
  conselho: z.enum(conselhos),
  uf: z.string().length(2).optional(),
  registro: z.string().optional(), // ex.: "CRBM-5 12345"
  rqe: z.string().optional(), // só CFM
  /** Documento de registro visto e conferido por pessoa da equipe (não pela IA). */
  registroConferido: z.object({ em: data, por: z.string().min(2) }).optional(),
});
export type Profissional = z.input<typeof profissionalSchema>;

/**
 * Matriz de habilitação conselho × categoria. Cada entrada precisa de
 * fundamento normativo e conferência do texto VIGENTE. Sem entrada conferida,
 * nenhum serviço invasivo daquela combinação publica.
 */
export const habilitacaoSchema = z.object({
  conselho: z.enum(conselhos),
  categoria: categoriaEnum,
  fundamento: z.string().min(5),
  textoVigenteConferido: z.object({ em: data, por: z.string().min(2), url: z.url() }).optional(),
});
export type Habilitacao = z.infer<typeof habilitacaoSchema>;

export const equipamentoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Nome genérico/tecnologia. Marca só se registro ANVISA conferido. */
  descricaoGenerica: z.string(),
  marcaModelo: z.string().optional(),
  registroAnvisa: z.string().optional(),
  registroConferido: z.object({ em: data, por: z.string().min(2), url: z.url() }).optional(),
  /** Como o fabricante/registro descreve a indicação — base do nome do serviço. */
  indicacaoRegistrada: z.string().optional(),
});
export type Equipamento = z.infer<typeof equipamentoSchema>;

export const servicoSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(3),
  categoria: categoriaEnum,
  executorId: z.string(),
  equipamentoId: z.string().optional(),
  resumo: z.string().min(10),
  /** false = não aparece em lugar nenhum do site. */
  publicar: z.boolean(),
  /** true = ganha página própria; exige docs/pesquisa/<slug>.md aprovado. */
  paginaConteudo: z.boolean().default(false),
  /** Envolve medicamento de prescrição: texto fala só em avaliação/procedimento. */
  envolvePrescricao: z.boolean().default(false),
});
export type Servico = z.input<typeof servicoSchema>;

export const clinicaSchema = z.object({
  nome: z.string(),
  cidade: z.string(),
  uf: z.string().length(2),
  endereco: z.string(),
  whatsapp: z.string(), // só dígitos com DDI, ex.: 5549...
  instagram: z.string().optional(),
  cnpj: z.string(),
  alvaraSanitario: z.string(),
  responsavelTecnicoId: z.string(),
  encarregadoLgpd: z.object({ nome: z.string(), contato: z.string() }),
  horario: z.string(),
});
export type Clinica = z.infer<typeof clinicaSchema>;

/* ---------------------------------------------------------------- mídia --- */

export const regioesProibidas = ['mama', 'gluteo', 'intima'] as const;

export const edicaoSchema = z.object({
  tipo: z.enum(['recorte', 'cobertura-identificador', 'cobertura-texto-promessa']),
  /** recorte: [x,y,largura,altura]; cobertura: lista de retângulos. */
  area: z.array(z.number().int().nonnegative()).length(4),
  motivo: z.string().min(3),
});

export const midiaSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    tipo: z.enum(['paciente', 'ambiente', 'equipe', 'equipamento', 'decorativa']),
    /** Caminho relativo a midia/originais (fora do git). */
    original: z.string(),
    /** sha256 do original; garante que o original não foi alterado. */
    originalSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    /** Caminho relativo a midia/derivados, gerado por `pnpm midia:derivar`. */
    derivado: z.string().optional(),
    edicoes: z.array(edicaoSchema).default([]),
    alt: z.string().min(5),
    autoriaPropria: z.boolean(),
    /** Há texto de promessa na imagem sem cobertura registrada. */
    textoPromessa: z.boolean(),
    provisoria: z.boolean(),
    // Campos de paciente — sem nome/@, só referência opaca.
    pacienteRef: z.string().regex(/^P-\d{3,}$/, 'use P-001, nunca nome ou @').optional(),
    regiaoCorporal: z.string().optional(),
    termoAutorizacao: z
      .object({ assinadoEm: data, refDocumento: z.string().regex(/^T-\d{3,}$/), semContrapartida: z.literal(true) })
      .optional(),
    antesDepois: z.boolean().default(false),
  })
  .superRefine((m, ctx) => {
    if (m.tipo === 'paciente' && !m.pacienteRef)
      ctx.addIssue({ code: 'custom', message: 'mídia de paciente exige pacienteRef' });
    for (const [k, v] of Object.entries(m))
      if (typeof v === 'string' && /@\w/.test(v))
        ctx.addIssue({ code: 'custom', message: `campo "${k}" contém "@" (possível identificador)` });
  });
export type Midia = z.input<typeof midiaSchema>;
