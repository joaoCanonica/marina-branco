import type { Clinica } from '../lib/esquemas.ts';

// Todos os campos "CONFIRMAR" bloqueiam o build de produção.
export const clinica: Clinica = {
  nome: 'Marina Branco Clínica de Estética',
  cidade: 'Lages',
  uf: 'SC',
  endereco: 'CONFIRMAR endereço completo',
  whatsapp: 'CONFIRMAR',
  instagram: 'CONFIRMAR',
  cnpj: 'CONFIRMAR',
  alvaraSanitario: 'CONFIRMAR número do alvará sanitário',
  responsavelTecnicoId: 'marina',
  encarregadoLgpd: { nome: 'CONFIRMAR', contato: 'CONFIRMAR' },
  horario: 'CONFIRMAR',
};
