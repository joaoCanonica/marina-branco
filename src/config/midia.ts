import type { Midia } from '../lib/esquemas.ts';

/**
 * Manifesto de mídia. Nunca gravar nome ou @ de paciente aqui: usar
 * pacienteRef (P-001) e refDocumento do termo (T-001). O vínculo fica fora do repo.
 * Itens `provisoria: true` só renderizam fora de produção.
 */
export const midia: Midia[] = [];
