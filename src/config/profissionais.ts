import type { Profissional } from '../lib/esquemas.ts';

// Formação, conselho e registro precisam ser conferidos em documento.
// Não usar "Dra."/"Dr." sem tituloConfirmado: true.
export const profissionais: Profissional[] = [
  {
    id: 'marina',
    nomeExibicao: 'Marina Branco',
    tituloConfirmado: false,
    formacao: 'CONFIRMAR formação',
    conselho: 'NENHUM', // CONFIRMAR: trocar pelo conselho real, se houver
  },
];
