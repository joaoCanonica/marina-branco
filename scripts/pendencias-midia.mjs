// Gera docs/PENDENCIAS_MIDIA.md: o que falta para cada item virar publicavel: true.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { impedimentosProducao, lerManifesto, raiz } from './lib/manifesto.mjs';

const m = await lerManifesto();
const esc = (s) => String(s).replace(/\|/g, '\\|');
const blocos = m.itens.map((i) => {
  const passos = [];
  if (i.consentimento === 'pendente') passos.push(i.pacienteRef ? `Termo de autorização de imagem assinado por ${i.pacienteRef} (modelo em docs/TERMO_IMAGEM.md), guardado fora do repo; registrar consentimento: 'ok'` : "Autorização de imagem da pessoa retratada; registrar consentimento: 'ok'");
  if (i.autoria !== 'propria') passos.push(`Confirmar autoria (hoje: "${i.autoria}"); só "propria" publica`);
  if (i.ocr.ok !== true) passos.push(i.ocr.ok === null ? 'Rodar `pnpm midia:ocr`' : 'Resolver o apontado pelo OCR (ou confirmar falso positivo após correção do script)');
  if (i.servico) passos.push(`Serviço \`${i.servico}\` publicável (executora habilitada, registro e habilitação conferidos)`);
  if (i.categoria === 'resultados' && !i.servico) passos.push('Identificar o serviço/procedimento e vinculá-lo');
  for (const p of i.problemas) passos.push(`Resolver: ${p}`);
  const veredito = /descartar|refazer|não usar/i.test(i.usoSugerido) ? '**Recomendação: descartar e refazer** (resolver os itens abaixo não compensa)' : 'Recomendação: seguir a lista';
  return `### \`${i.id}\` — ${i.categoria}${i.pacienteRef ? ` · ${i.pacienteRef}` : ''}
Bloqueios atuais: ${esc(impedimentosProducao(i).join('; ') || 'nenhum')}
${veredito}

${passos.map((p) => `- [ ] ${p}`).join('\n')}
`;
});
const doc = `# Pendências de mídia

> Gerado por \`pnpm midia:pendencias\` a partir de \`media.manifest.json\`. Não editar à mão.
> Um item só vira \`publicavel: true\` quando **todas** as caixas estiverem resolvidas; a decisão final é humana e fica registrada no manifesto.

Itens: ${m.itens.length} · publicáveis: ${m.itens.filter((i) => i.publicavel).length} · só preview: ${m.itens.filter((i) => i.previewOk).length}

${blocos.join('\n')}`;
await writeFile(path.join(raiz, 'docs/PENDENCIAS_MIDIA.md'), doc);
console.log(`docs/PENDENCIAS_MIDIA.md: ${m.itens.length} itens`);
