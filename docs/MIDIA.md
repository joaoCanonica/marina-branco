# Mídia

## Fluxo
1. O original fica em `midia/originais/` (fora do git, ver `.gitignore`) e **nunca é alterado**.
2. `pnpm midia:hash <arquivo>` → registrar em `originalSha256` no manifesto (`src/config/midia.ts`).
3. Registrar as edições em `edicoes` (só `recorte`, `cobertura-identificador`, `cobertura-texto-promessa`) com a área em pixels e o motivo.
4. `pnpm midia:derivar` gera o derivado em `midia/derivados/` (recorte e retângulo opaco apenas; EXIF descartado).
5. Usar no site apenas via `<Midia id="..." />`.

Proibido: retoque, suavização, cor/luz, forma, selo, filtro, texto de promessa por cima.

## Pacientes
- Sem nome ou @ no manifesto, no código ou em mensagens de commit. Usar `pacienteRef: 'P-001'` e `termoAutorizacao.refDocumento: 'T-001'`.
- O vínculo P-001 → pessoa fica fora do repositório, com a clínica.
- Termo assinado, sem contrapartida (`semContrapartida: true`), sem identificação na imagem.
- Mama, glúteo e região íntima: nunca.

## Mídia provisória
Fotos atuais (sem termo/autoria confirmados): `provisoria: true`. Renderizam só com `SITE_ENV` ≠ production **e** `PREVIEW_PROTECAO_CONFIRMADA=true` (depois de ligar a proteção por senha/Deployment Protection no provedor), com selo "PROVISÓRIO". Em produção o build falha se alguma for referenciada.
