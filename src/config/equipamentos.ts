import type { Equipamento } from '../lib/esquemas.ts';

// Marca/modelo só aparece no site com registroAnvisa conferido na consulta pública da ANVISA.
export const equipamentos: Equipamento[] = [
  {
    id: 'laser-depilacao',
    descricaoGenerica: 'CONFIRMAR: laser de diodo, alexandrite ou luz intensa pulsada?',
  },
];
