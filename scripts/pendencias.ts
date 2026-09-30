// Lista pendências agrupadas (sempre com a régua de produção) e grava docs/PENDENCIAS.md.
import { writeFileSync } from 'node:fs';
import { dados, pesquisaAprovada } from '../src/lib/contexto.ts';
import { rotulosGrupo, validar, type Grupo } from '../src/lib/regras/index.ts';

const raiz = process.cwd();
const r = validar(dados(raiz), { producao: true, pesquisaAprovada: (id) => pesquisaAprovada(raiz, id) });
const ordem: Grupo[] = ['identidade', 'servicos', 'midia', 'anvisa', 'texto', 'pendente'];
const linhas: string[] = ['# Pendências para publicar', '', '> Gerado por `pnpm pendencias`. Não editar à mão.', ''];
for (const g of ordem) {
  const itens = r.achados.filter((a) => a.grupo === g);
  linhas.push(`## ${rotulosGrupo[g]} (${itens.length})`, '', ...(itens.length ? itens.map((a) => `- [ ] ${a.msg}`) : ['Nenhuma.']), '');
  console.log(`\n${rotulosGrupo[g]} (${itens.length})`);
  for (const a of itens) console.log(`  - ${a.msg}`);
}
linhas.push(`Bloqueiam produção hoje: **${r.erros.length}**.`, '');
writeFileSync('docs/PENDENCIAS.md', linhas.join('\n'));
console.log(`\n${r.erros.length} bloqueio(s) de produção. docs/PENDENCIAS.md atualizado.`);
