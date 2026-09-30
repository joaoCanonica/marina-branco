// Leitura, validação e regras do media.manifest.json (fonte da verdade da mídia).
// Usado por prepare-media, ocr-midia e gerar-inventario-midia.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

export const raiz = path.resolve(import.meta.dirname, '../..');
export const caminhoManifesto = path.join(raiz, 'media.manifest.json');

const retangulo = z.object({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative(), w: z.number().int().positive(), h: z.number().int().positive() });

/** Sem nome/@ de paciente: qualquer "@palavra" em texto livre é recusado. */
const semArroba = (s) => !/@\w/.test(s);
const textoLivre = z.string().refine(semArroba, 'contém "@" (possível identificador)');

export const itemSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case'),
    arquivo: z.string().regex(/^assets-originais\/(marca|equipe|espaco|resultados|videos)\//),
    categoria: z.enum(['marca', 'equipe', 'espaco', 'resultados', 'videos']),
    servico: z.string().nullable(),
    tipo: z.enum(['imagem', 'video']),
    largura: z.number().int().positive(),
    altura: z.number().int().positive(),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    descricao: textoLivre.min(10),
    alt: textoLivre,
    autoria: z.enum(['propria', 'terceiro', 'desconhecida', 'CONFIRMAR']),
    consentimento: z.enum(['ok', 'pendente', 'nao-se-aplica']),
    publicavel: z.boolean(),
    crop: retangulo.nullable(),
    edicoes: z.array(z.object({ tipo: z.enum(['recorte', 'cobertura']), regiao: retangulo, motivo: textoLivre.min(3) })),
    pacienteRef: z.string().regex(/^P-\d{3,}$/, 'use P-001; nunca nome ou @').nullable(),
    previewOk: z.boolean(),
    ocr: z.object({ texto: z.string(), ok: z.boolean().nullable() }),
    problemas: z.array(textoLivre),
    usoSugerido: textoLivre,
  })
  .strict()
  .superRefine((m, ctx) => {
    if (!m.arquivo.startsWith(`assets-originais/${m.categoria}/`))
      ctx.addIssue({ code: 'custom', message: 'arquivo fora da pasta da categoria' });
    if (m.categoria === 'resultados' && !m.pacienteRef)
      ctx.addIssue({ code: 'custom', message: 'resultado exige pacienteRef' });
    for (const e of m.edicoes) {
      const fora = e.regiao.x + e.regiao.w > m.largura || e.regiao.y + e.regiao.h > m.altura;
      if (fora) ctx.addIssue({ code: 'custom', message: `edição "${e.motivo}" fora da imagem` });
    }
    if (m.crop && (m.crop.x + m.crop.w > m.largura || m.crop.y + m.crop.h > m.altura))
      ctx.addIssue({ code: 'custom', message: 'crop fora da imagem' });
  });

export const manifestoSchema = z
  .object({ $comentario: z.string().optional(), itens: z.array(itemSchema) })
  .superRefine((m, ctx) => {
    const vistos = new Set();
    for (const i of m.itens) {
      if (vistos.has(i.id)) ctx.addIssue({ code: 'custom', message: `id duplicado: ${i.id}` });
      vistos.add(i.id);
    }
  });

export async function lerManifesto() {
  const bruto = JSON.parse(await readFile(caminhoManifesto, 'utf8'));
  const r = manifestoSchema.safeParse(bruto);
  if (!r.success) {
    const msgs = r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`media.manifest.json inválido:\n${msgs}`);
  }
  return r.data;
}

export async function gravarManifesto(m) {
  manifestoSchema.parse(m);
  await writeFile(caminhoManifesto, JSON.stringify(m, null, 2) + '\n');
}

/** Motivos que impedem o item de ir para produção (vazio = pode). */
export function impedimentosProducao(i) {
  const r = [];
  if (!['ok', 'nao-se-aplica'].includes(i.consentimento)) r.push(`consentimento "${i.consentimento}"`);
  if (i.autoria !== 'propria') r.push(`autoria "${i.autoria}"`);
  if (i.ocr.ok !== true) r.push(i.ocr.ok === false ? 'OCR reprovado' : 'OCR não rodado');
  if (i.problemas.length) r.push(`${i.problemas.length} problema(s) em aberto`);
  return r;
}

export function ambiente() {
  const siteEnv = process.env.SITE_ENV ?? 'development';
  if (!['production', 'preview', 'development'].includes(siteEnv)) throw new Error(`SITE_ENV inválido: ${siteEnv}`);
  if (process.env.VERCEL_ENV === 'production' && siteEnv !== 'production')
    throw new Error('VERCEL_ENV=production exige SITE_ENV=production');
  return { siteEnv, producao: siteEnv === 'production' };
}
