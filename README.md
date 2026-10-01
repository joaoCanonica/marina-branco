# Marina Branco Clínica de Estética — site

Astro (estático) + TypeScript strict. Node 22 (`.nvmrc`), pnpm 10.33 (`packageManager`).

```sh
pnpm install
pnpm dev                 # desenvolvimento
pnpm test                # testes das regras
pnpm validate            # regras sem build (SITE_ENV do ambiente)
pnpm validate:prod       # régua de produção
pnpm pendencias          # pendências agrupadas
SITE_ENV=production pnpm build
pnpm auditar             # conformidade + orçamento de JS/imagens + acessibilidade (sobre dist/)
pnpm audit:lighthouse    # Lighthouse mobile (requer `lighthouse` no PATH ou LIGHTHOUSE_BIN)
```

Checklist de publicação e o que depende de validação humana: **[`docs/COMPLIANCE.md`](docs/COMPLIANCE.md)**.

O build aplica as regras regulatórias e **falha** quando algo não pode ser publicado — ver `docs/REGULATORIO.md`. Mídia: `docs/MIDIA.md`. Pesquisa de conteúdo: `docs/pesquisa/`.

## Onde ficam os dados
| Arquivo | Conteúdo |
|---|---|
| `src/config/profile.config.ts` | responsável, perfil regulatório, equipe, unidades, contatos, CNPJ, alvará, LGPD |
| `src/config/servicos.config.ts` | catálogo (executor, insumos/ANVISA, `publicavel`, rota) |
| `src/config/compliance.config.ts` | regras por perfil, termos vetados, matriz de habilitação |
| `media.manifest.json` | manifesto de mídia (ver `docs/MIDIA.md`) |

`pnpm pendencias` lista o que falta, por grupo, e grava `docs/PENDENCIAS.md`.

## Pendências para publicar (a clínica precisa fornecer)
1. Endereço, WhatsApp, Instagram, horário, CNPJ, alvará sanitário, encarregado LGPD, domínio.
2. Formação, conselho, nº de registro e UF de cada executora, com cópia do documento; se houver título "Dra.", o fundamento.
3. Lista real de serviços, com quem executa cada um.
4. Equipamentos: marca, modelo e nº de registro ANVISA (define se o serviço se chama "depilação a laser" ou "fotodepilação").
5. Conferência, por pessoa da equipe, do texto vigente de cada norma da matriz de habilitação.
6. Termos de autorização de imagem já assinados (sem nomes no repo: só P-001/T-001).
7. Proteção por senha do deploy de preview antes de subir as fotos provisórias.

## Design system
Tokens em `src/config/theme.config.ts` (paleta do logo e da foto da proprietária, tons `preto | marfim | nude | ouro-sutil` em claro e escuro, tipografia Bodoni Moda + Figtree, movimento). `src/styles/tokens.ts` gera as variáveis `--cor-*`; componentes em `src/components/base/`. O build falha se algum par de contraste do tema ficar abaixo de AA ou se houver cor literal fora de `theme.config.ts`. Vitrine: `/_kit` (só fora de produção, noindex).

## Deploy (Vercel)
- `vercel.json`: `pnpm install --frozen-lockfile`, `pnpm build`, cabeçalhos de segurança (HSTS, nosniff, `frame-ancestors 'none'`, COOP, Permissions-Policy), `no-store` + `X-Robots-Tag` na rota reservada, redirect genérico `www.<domínio> → <domínio>`.
- CSP por página: `scripts/gerar-csp.ts` roda no fim do `build` e grava um `<meta http-equiv="Content-Security-Policy">` com o hash de cada script inline (sem `'unsafe-inline'` em scripts).
- **Preview/provisório** (padrão): sem `SITE_ENV=production` o site sai com `noindex`, faixa "Versão em revisão" e selo "Provisório" na mídia. Mantenha a Deployment Protection da Vercel ligada nos previews.
- **Produção**: defina `SITE_ENV=production` só no ambiente Production do projeto. Se o deploy de produção rodar sem ela, o build falha (`VERCEL_ENV=production exige SITE_ENV=production`); se houver qualquer pendência regulatória, também falha.

## Criar o próximo site de clínica a partir deste template
Nada específico da cliente fica em componente: trocar de clínica é trocar **config, conteúdo, mídia e marca**.

1. **Copiar o repositório** sem histórico (`git clone --depth 1` + novo `git init`) e trocar `name` no `package.json`. Manter `.nvmrc`, `packageManager` e o lockfile.
2. **Zerar o que é da cliente anterior** (nunca levar foto, nome ou dado de paciente para outro projeto):
   - `assets-originais/`, `src/assets/media/`, `media.manifest.json` (`{"itens": []}`), `public/og.png`, `print/`;
   - `src/conteudo/servicos/*.md`, `src/conteudo/artigos/*.md`, `docs/pesquisa/*` (exceto `_modelo.md` e `_fontes-comuns.md`, que devem ser reconferidos);
   - `docs/ACERVO.md`, `PENDENCIAS_MIDIA.md`, `CALENDARIO_INSTAGRAM.md`, `PENDENCIAS.md`.
3. **Perfil regulatório primeiro** (`src/config/profile.config.ts`): `perfilRegulatorio` (`cfm`, `cfo`, `cfbm`, `cff`, `estetica-sem-conselho`), equipe com conselho/registro/UF, unidades, contatos. Tudo que não foi confirmado com documento fica `CONFIRMAR`. Conferir o texto vigente das normas em `compliance.config.ts → habilitacoes` e registrar quem conferiu.
4. **Serviços** (`servicos.config.ts`): um `defineServico` por serviço real, com executor, insumos/equipamentos e registro ANVISA. Serviços sensíveis usam `sensivel: true` (vão para a rota reservada).
5. **Pesquisa antes do texto**: para cada página, `docs/pesquisa/<slug>.md` a partir de `_modelo.md` (fontes primárias, nível de evidência, riscos, contraindicações, limites) e só depois `src/conteudo/servicos/<slug>.md`. Artigos de `/leitura` seguem o mesmo fluxo (`artigo-<slug>.md`, 400–700 palavras, citações [n]).
6. **Marca e tema** (`theme.config.ts`, `marca.config.ts`): paleta própria derivada do logo da nova cliente — **não** reaproveitar as cores nem a assinatura visual (A Curva) deste site; o build reprova contraste abaixo de AA. Logo vetorizado com `scripts/vetorizar-logo.mjs`.
7. **Textos e legais** (`copy.config.ts`, `contato.config.ts`, `legal.config.ts`, `reputacao.config.ts`): rodar `pnpm validate` a cada mudança — o linter recusa promessa, superlativo, urgência e "definitivo".
8. **Mídia**: originais em `assets-originais/`, uma entrada por arquivo no manifesto com `pacienteRef` (P-001…), nunca nome/@. `pnpm midia:ocr`, `pnpm media`, termo de imagem conforme `docs/TERMO_IMAGEM.md`.
9. **Validar**: `pnpm test && pnpm check && pnpm build && pnpm auditar && pnpm audit:lighthouse`, depois `pnpm pendencias` e preencher `docs/COMPLIANCE.md`.
10. **Publicar**: projeto novo na Vercel ligado ao repositório, preview protegido; `SITE_ENV=production` só depois de `validate:prod` sem bloqueios e das validações humanas.

O que **não** se altera para fazer o build passar: `src/lib/regras/`, `src/config/compliance.config.ts` (exceto acrescentar perfis/termos), `src/lib/auditoria-html.ts`. Corrige-se o dado ou o texto.
