// OCR local das imagens do manifesto (após recorte/cobertura, como sairão no site).
// Rodar à mão: `pnpm midia:ocr`. Sem rede: dados de idioma em vendor/tessdata.
// Grava ocr.texto e ocr.ok. ok=false se achar termo de promessa, @ de perfil ou
// possível nome próprio fora da lista de nomes da marca. O build só lê as flags.
import path from 'node:path';
import { createWorker } from 'tesseract.js';
import { gravarManifesto, lerManifesto, raiz } from './lib/manifesto.mjs';
import { derivar, lerOriginal } from './prepare-media.mjs';

const VETADOS = [
  /transforma(ç|c)(ã|a)o/i, /milagr/i, /garant/i, /definitiv/i, /resultados?\s+imediat/i, /\b100\s?%/,
  /sem\s+dor/i, /indolor/i, /rejuvenes/i, /antes\s+e\s+depois/i, /\bo\s+melhor\b|\ba\s+melhor\b/i,
  /\bbotox\b/i, /toxina/i, /promo(ç|c)(ã|a)o/i, /desconto/i,
];
// Palavras da marca que podem aparecer sem acusar "nome próprio".
const PERMITIDAS = new Set(['marina', 'branco', 'clínica', 'clinica', 'estética', 'estetica', 'mb']);

// Fragmento de palavra da marca (ex.: "RANCO" de "BRANCO" quebrado pelo OCR) não conta como nome.
const daMarca = (w) => [...PERMITIDAS].some((p) => p.includes(w.toLowerCase()));

/** Palavras em CAIXA ALTA (letreiros, adesivos) com confiança mínima: possíveis nomes. */
function nomesEmCaixaAlta(palavras) {
  return palavras
    .filter((p) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{4,}$/.test(p.text) && p.confidence >= 15 && !daMarca(p.text))
    .map((p) => `possível nome próprio: "${p.text}" (confiança ${Math.round(p.confidence)}%)`);
}

function avaliar(texto) {
  const achados = [];
  for (const re of VETADOS) if (re.test(texto)) achados.push(`termo vetado (${re.source})`);
  if (/@[\w.]{2,}/.test(texto)) achados.push('@ de perfil');
  // Heurística conservadora: duas palavras capitalizadas seguidas fora da marca.
  for (const m of texto.matchAll(/\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]{2,})\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]{2,})\b/g))
    if (!daMarca(m[1]) || !daMarca(m[2])) achados.push(`possível nome próprio: "${m[0]}"`);
  return achados;
}

const manifesto = await lerManifesto();
const worker = await createWorker('por', 1, {
  langPath: path.join(raiz, 'vendor/tessdata'),
  cacheMethod: 'none',
  gzip: true,
});
try {
  for (const item of manifesto.itens.filter((i) => i.tipo === 'imagem')) {
    const buf = await derivar(item, await lerOriginal(item));
    // Amplia só a cópia usada no OCR: imagens pequenas perdem texto miúdo (ex.: marca d'água).
    const { default: sharp } = await import('sharp');
    const ampliada = await sharp(buf).resize({ width: 2400, withoutEnlargement: false }).png().toBuffer();
    const { data } = await worker.recognize(ampliada, {}, { blocks: true });
    const palavras = (data.blocks ?? []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines.flatMap((l) => l.words)));
    // Mantém só linhas com alguma palavra legível (descarta ruído de 1–2 caracteres).
    const texto = data.text.split('\n').map((l) => l.trim()).filter((l) => /[\p{L}\d]{3,}/u.test(l)).join('\n');
    const achados = [...avaliar(texto), ...nomesEmCaixaAlta(palavras)];
    item.ocr = { texto, ok: achados.length === 0 };
    const anteriores = item.problemas.filter((p) => !p.startsWith('OCR: '));
    item.problemas = [...anteriores, ...achados.map((a) => `OCR: ${a}`)];
    console.log(`ocr: ${item.id} -> ${item.ocr.ok ? 'ok' : achados.join('; ')}`);
  }
} finally {
  await worker.terminate();
}
await gravarManifesto(manifesto);
