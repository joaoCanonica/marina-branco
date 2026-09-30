// Gera docs/MIDIA.md (regras + inventário) a partir de media.manifest.json.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { impedimentosProducao, lerManifesto, raiz } from './lib/manifesto.mjs';

const m = await lerManifesto();
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const kb = (b) => `${(b / 1024).toFixed(0)} KB`;

const linhas = m.itens.map((i) => {
  const imp = impedimentosProducao(i);
  return `| \`${i.id}\` | ${i.categoria} | ${i.largura}×${i.altura} · ${kb(i.bytes)} | ${i.autoria} | ${i.consentimento} | ${i.ocr.ok === null ? 'não rodado' : i.ocr.ok ? 'ok' : 'reprovado'} | ${i.previewOk ? 'sim' : 'não'} | ${i.publicavel ? 'sim' : 'não'} | ${esc(imp.join('; ') || '—')} |`;
});
const detalhes = m.itens.map((i) => `### \`${i.id}\`
- Arquivo: \`${i.arquivo}\` · sha256 \`${i.sha256.slice(0, 16)}…\`
- Descrição: ${esc(i.descricao)}
- Alt: ${esc(i.alt) || '(decorativa)'}
- Uso sugerido: ${esc(i.usoSugerido)}
- Crop: ${i.crop ? JSON.stringify(i.crop) : 'nenhum'} · Edições: ${i.edicoes.length ? i.edicoes.map((e) => `${e.tipo} (${esc(e.motivo)})`).join('; ') : 'nenhuma'}
- OCR: ${i.ocr.texto ? `"${esc(i.ocr.texto)}"` : '(sem texto)'}
- Problemas:${i.problemas.length ? '\n' + i.problemas.map((p) => `  - ${esc(p)}`).join('\n') : ' nenhum'}
`);

const doc = `# Mídia

> Gerado por \`pnpm midia:inventario\` a partir de \`media.manifest.json\`. Não editar à mão.

## Regras
- Originais em \`assets-originais/<marca|equipe|espaco|resultados|videos>/\`, versionados e **nunca modificados** (sha256 conferido a cada geração).
- Derivados em \`src/assets/media/\` (fora do git), gerados por \`scripts/prepare-media.mjs\` antes de \`dev\`/\`build\`: só recorte e cobertura sólida; AVIF + WebP em várias larguras; metadados (EXIF/GPS) descartados.
- Produção gera só \`publicavel: true\` e falha se algum tiver consentimento ≠ ok/nao-se-aplica, autoria ≠ propria, OCR não aprovado ou problema em aberto.
- Dev/preview gera também \`previewOk: true\`, marcados como provisórios (selo PROVISÓRIO; deploy de preview protegido por senha).
- Nunca nome ou @ de paciente: \`pacienteRef\` (P-001); o vínculo fica fora do repo.
- OCR: \`pnpm midia:ocr\` (local, sem rede) grava \`ocr.texto\`/\`ocr.ok\`.

## Inventário (${m.itens.length} itens)

| id | categoria | dimensões | autoria | consentimento | OCR | preview | publicável | bloqueios para produção |
|---|---|---|---|---|---|---|---|---|
${linhas.join('\n')}

## Detalhes

${detalhes.join('\n')}`;
await writeFile(path.join(raiz, 'docs/MIDIA.md'), doc);
console.log(`docs/MIDIA.md: ${m.itens.length} itens`);
