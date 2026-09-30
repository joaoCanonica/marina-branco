/**
 * Converte theme.config em CSS custom properties. Injetado no <head> pelo layout.
 * Cada [data-tone] redefine os papéis --cor-*; componentes só usam --cor-*.
 */
import { espaco, movimento, sistema, tipografia, tomPadrao, tons, type NomeTom, type PapeisTom } from '../config/theme.config.ts';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const papeis = (p: PapeisTom) => Object.entries(p).map(([k, v]) => `--cor-${kebab(k)}:${v};`).join('');
const blocoTons = (modo: 'claro' | 'escuro') =>
  (Object.keys(tons) as NomeTom[]).map((t) => `[data-tone="${t}"]{${papeis(tons[t][modo])}}`).join('');

const raiz = [
  `--fonte-display:${tipografia.display};`,
  `--fonte-texto:${tipografia.texto};`,
  ...Object.entries(tipografia.escala).map(([k, v]) => `--texto-${k}:${v};`),
  `--entrelinha-display:${tipografia.entrelinha.display};--entrelinha-titulo:${tipografia.entrelinha.titulo};--entrelinha-texto:${tipografia.entrelinha.texto};`,
  `--versalete:${tipografia.espacamentoVersalete};`,
  `--medida:${espaco.medida};--medida-texto:${espaco.medidaTexto};--secao:${espaco.secao};--raio:${espaco.raio};`,
  ...Object.entries(movimento.duracao).map(([k, v]) => `--mov-${k}:${v};`),
  ...Object.entries(movimento.curva).map(([k, v]) => `--curva-${k}:${v};`),
  ...Object.entries(movimento.distancia).map(([k, v]) => `--dist-${k}:${v};`),
  `--cor-alerta:${sistema.alerta.fundo};--cor-alerta-texto:${sistema.alerta.texto};`,
].join('');

const semMovimento = [
  ...Object.keys(movimento.duracao).map((k) => `--mov-${k}:0.01ms;`),
  ...Object.keys(movimento.distancia).map((k) => `--dist-${k}:0px;`),
].join('');

export const cssTokens =
  `:root{${raiz}${papeis(tons[tomPadrao].claro)}color-scheme:light dark;}` +
  blocoTons('claro') +
  `@media (prefers-color-scheme:dark){:root{${papeis(tons[tomPadrao].escuro)}}${blocoTons('escuro')}}` +
  `@media (prefers-reduced-motion:reduce){:root{${semMovimento}}}`;
