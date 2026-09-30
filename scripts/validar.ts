// Mesmas regras do build, sem compilar o site. Uso: pnpm validar | pnpm validar:producao
import { ambiente, dados, midiaReferenciada } from '../src/lib/contexto.ts';
import { validar } from '../src/lib/regras/index.ts';

const raiz = process.cwd();
const amb = ambiente(raiz);
const r = validar(dados, amb, midiaReferenciada(raiz));
for (const a of r.avisos) console.warn('aviso:', a);
for (const e of r.erros) console.error('ERRO:', e);
console.log(`\nSITE_ENV=${amb.siteEnv}: ${r.erros.length} erro(s), ${r.avisos.length} aviso(s)`);
process.exit(r.erros.length ? 1 : 0);
