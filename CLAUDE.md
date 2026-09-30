# Marina Branco — instruções para agentes

Leia `docs/REGULATORIO.md` e `docs/MIDIA.md` antes de mudar conteúdo, serviços ou imagens.

- Dados da clínica só em `src/config/*`; componentes não têm nada específico da cliente.
- Nunca inventar dado regulatório (registro, conselho, título, ANVISA). Pendente = `CONFIRMAR`.
- Nunca afrouxar regras em `src/lib/regras/` ou `src/config/compliance.config.ts` para fazer o build passar; corrigir o dado.
- Texto sobre procedimento só depois de `docs/pesquisa/<slug>.md` (modelo em `_modelo.md`).
- Nunca gravar nome ou @ de paciente em lugar nenhum do repo, nem em commits.
- Antes de commitar: `pnpm test && pnpm check && pnpm build (e `pnpm pendencias` para ver o que falta publicar)`.
