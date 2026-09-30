// Imprime o sha256 de um original, para registrar em originalSha256 no manifesto.
// Uso: pnpm midia:hash <arquivo em midia/originais>
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const arq = process.argv[2];
if (!arq) throw new Error('uso: pnpm midia:hash <arquivo>');
console.log(createHash('sha256').update(readFileSync(join('midia/originais', arq))).digest('hex'));
