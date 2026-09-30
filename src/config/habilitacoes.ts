import type { Habilitacao } from '../lib/esquemas.ts';

/**
 * Matriz conselho × categoria. Nenhuma entrada vem conferida: alguém da
 * equipe precisa ler o texto VIGENTE da norma (e decisões judiciais que a
 * suspendam) e preencher `textoVigenteConferido`. Sem isso, serviço invasivo
 * não publica. Esta lista é ponto de partida para a pesquisa, não parecer.
 */
export const habilitacoes: Habilitacao[] = [
  { conselho: 'CFM', categoria: 'injetavel', fundamento: 'Lei 12.842/2013 (Ato Médico) — CONFIRMAR texto vigente' },
  { conselho: 'CFM', categoria: 'laser-luz', fundamento: 'Lei 12.842/2013 (Ato Médico) — CONFIRMAR texto vigente' },
  { conselho: 'CFM', categoria: 'peeling-quimico', fundamento: 'Lei 12.842/2013 (Ato Médico) — CONFIRMAR texto vigente' },
  { conselho: 'CFBM', categoria: 'injetavel', fundamento: 'Resolução CFBM de biomedicina estética — CONFIRMAR número, vigência e situação judicial' },
  { conselho: 'CFBM', categoria: 'laser-luz', fundamento: 'Resolução CFBM de biomedicina estética — CONFIRMAR' },
  { conselho: 'COFEN', categoria: 'injetavel', fundamento: 'Resolução COFEN sobre enfermagem estética — CONFIRMAR número, vigência e situação judicial' },
  { conselho: 'CFF', categoria: 'injetavel', fundamento: 'Resolução CFF sobre saúde estética — CONFIRMAR número, vigência e situação judicial' },
  { conselho: 'NENHUM', categoria: 'micropigmentacao', fundamento: 'Lei 13.643/2018 + RDC ANVISA/vigilância municipal — CONFIRMAR' },
  { conselho: 'NENHUM', categoria: 'laser-luz', fundamento: 'Lei 13.643/2018 — CONFIRMAR se o equipamento/indicação é permitido a esteticista' },
];
