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
```

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
