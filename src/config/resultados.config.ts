/**
 * Módulo de Resultados. DESLIGADO até existir material com termo assinado.
 * Cada caso liga duas mídias do media.manifest.json (antes/depois) de UMA
 * paciente (pacienteRef), com as condições de padronização declaradas.
 * As regras (por perfil regulatório) estão em src/lib/resultados.ts.
 */
import type { ConfigResultados } from '../lib/resultados.ts';

export const resultados: ConfigResultados = {
  ativo: false,
  /** Textos por procedimento (id do serviço). CFM exige condição e complicações. */
  procedimentos: [],
  casos: [],
};
