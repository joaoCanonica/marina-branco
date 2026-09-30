/**
 * Identidade da clínica e da equipe. Valores CONFIRMAR bloqueiam produção.
 * Perfil inicial: estética sem conselho, sem tratamento — o site nunca usa "Dra.".
 */
import { CONFIRMAR, type Profile } from '../lib/esquemas.ts';

export const profile: Profile = {
  nome: 'Marina Branco',
  nomeClinica: 'Marina Branco Clínica de Estética',
  tratamento: '',
  titulo: `${CONFIRMAR}: formação/título profissional por extenso`,
  conselho: null,
  perfilRegulatorio: 'estetica-sem-conselho',
  responsavelId: 'marina',
  equipe: [
    {
      id: 'marina',
      nome: 'Marina Branco',
      titulo: `${CONFIRMAR}: formação`,
      tratamento: '',
      conselho: null,
      registro: null,
      rqe: [],
      registroConferido: null,
      funcao: 'Responsável técnica e proprietária',
      fotoId: null,
    },
  ],
  unidades: [
    {
      id: 'lages',
      cidade: 'Lages',
      uf: 'SC',
      endereco: `${CONFIRMAR}: logradouro, nº 335 (visto na fachada), bairro, CEP`,
      dias: `${CONFIRMAR}: dias e horários`,
      fixa: true,
    },
    {
      id: 'balneario-camboriu',
      cidade: 'Balneário Camboriú',
      uf: 'SC',
      endereco: `${CONFIRMAR}: endereço`,
      dias: `${CONFIRMAR}: dias de atendimento`,
      fixa: false,
    },
  ],
  instagram: [
    { rotulo: 'Clínica', usuario: CONFIRMAR },
    { rotulo: `${CONFIRMAR}: segunda conta`, usuario: CONFIRMAR },
  ],
  whatsapp: `${CONFIRMAR}: 55 49 98856-6497 (visto no letreiro)`,
  telefone: `${CONFIRMAR}: (49) 3018-0074 (visto no letreiro)`,
  cnpj: CONFIRMAR,
  alvaraSanitario: CONFIRMAR,
  encarregadoLgpd: { nome: CONFIRMAR, contato: CONFIRMAR },
  dominio: `https://${CONFIRMAR}-dominio.com.br`,
};
