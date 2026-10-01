# Conformidade — checklist de publicação

Este documento junta o que a máquina verifica sozinha e o que **só uma pessoa pode validar**. A lista viva, gerada a partir do config, está em [`PENDENCIAS.md`](PENDENCIAS.md) (`pnpm pendencias`). Regras de fundo: [`REGULATORIO.md`](REGULATORIO.md), [`MIDIA.md`](MIDIA.md), [`REPUTACAO.md`](REPUTACAO.md).

> Estado em 2026-10-01: **o site não pode ir para produção.** `pnpm validate:prod` falha com 10 bloqueios (identidade profissional, executores, registros ANVISA, mídia sem termo, dados da clínica). O deploy atual é **provisório**: `noindex`, faixa "Versão em revisão", mídia com selo "Provisório" e nenhum serviço invasivo anunciado.

## 1. O que o build bloqueia sozinho

`SITE_ENV=production pnpm build` falha — sem flag para ignorar — se houver:

| Bloqueio | Onde é verificado |
|---|---|
| Qualquer `CONFIRMAR` em dado publicado ou no HTML final | `validate-config` + varredura do HTML (`src/lib/auditoria-html.ts`) |
| Serviço invasivo publicável sem executor habilitado, conselho/registro e habilitação conferida | `src/lib/regras/index.ts` |
| Equipamento/produto sem registro ANVISA conferido (número, data, quem conferiu) | `src/lib/regras/index.ts` |
| Página de procedimento sem pesquisa aprovada (`docs/pesquisa/<slug>.md`) | `src/lib/conteudo.ts` |
| Página de procedimento sem identificação da profissional executora | `src/lib/auditoria-html.ts` |
| Mídia sem termo assinado, sem autoria própria, com OCR não aprovado ou problema aberto | `prepare-media` + `Midia.astro` + `audit:compliance` |
| Termo vetado (promessa, superlativo, "definitivo", urgência, preço promocional, marca de medicamento) no HTML visível | `src/lib/regras/texto.ts` |
| "Dra."/"Dr." fora do componente de identificação, ou sem título confirmado | idem |
| Serviço sensível citado fora da rota reservada, rota reservada indexável, com imagem ou dados estruturados | idem |
| Campo de formulário fora da lista permitida, upload de arquivo, recurso de terceiro carregado | idem |
| `VERCEL_ENV=production` sem `SITE_ENV=production` | `src/lib/ambiente.ts` |

Auditorias avulsas sobre um `dist/` já gerado:

```sh
pnpm build                 # SITE_ENV=development|preview|production
pnpm audit:compliance      # regras + HTML final + mídia derivada × manifesto
pnpm audit:orcamento       # JS por página (home ≤ 6 KB gzip, demais ≤ 4 KB) e AVIF/WebP/srcset/poster
pnpm audit:a11y            # axe-core WCAG 2.2 AA, teclado, foco visível, reduced-motion, slider
pnpm audit:lighthouse      # Lighthouse mobile: P ≥ 95, A = 100, BP ≥ 95, SEO ≥ 95
pnpm schema:validar        # JSON-LD contra o vocabulário schema.org
```

## 2. Resultado da auditoria técnica (build de preview, 2026-10-01)

| Verificação | Resultado |
|---|---|
| `audit:compliance` | OK — 26 páginas, 3 mídias provisórias (só fora de produção) |
| `audit:orcamento` | OK — home 1,22 KB; demais ≤ 1,08 KB de JS gzip |
| `audit:a11y` | OK — 25 páginas × móvel e desktop, zero violações axe |
| `audit:lighthouse` | `/`, `/procedimentos`, `/contato`, `/leitura`, `/privacidade`: Performance 99 · Acessibilidade 100 · Boas práticas 100 · SEO 100; LCP ≈ 2,0 s, CLS 0 (Lighthouse 13.5, mobile, servidor local) |
| CSP | `script-src 'self'` + hash SHA-256 de cada script inline, por página (`scripts/gerar-csp.ts`); `frame-ancestors 'none'` no cabeçalho |
| Terceiros | nenhum recurso externo carregado; WhatsApp/mapa são links |

O controle deslizante antes/depois (`AntesDepois.astro`) só aparece quando `resultados.config.ts → ativo` e há caso publicável; a partir daí `audit:a11y` passa a exercitá-lo (rótulo, setas, `aria-valuetext`). Sem JS, as duas fotos aparecem lado a lado.

## 3. Validação humana obrigatória

Marque cada item **com nome de quem conferiu e data** no config correspondente (`conferido: { por, em }`). Nada aqui pode ser preenchido por suposição.

### 3.1 Identidade profissional e conselho
- [ ] Formação de Marina Branco (curso, instituição, ano) e **se há conselho profissional** (ex.: biomedicina → CRBM; enfermagem → COREN; odontologia → CRO; medicina → CRM; farmácia → CRF). Hoje: `estetica-sem-conselho` — CONFIRMAR.
- [ ] Número de registro e situação ativa no site do conselho (print com data arquivado fora do repo).
- [ ] Título a exibir. "Dra." só se o conselho permitir **e** o título for confirmado; nunca por cortesia.
- [ ] Se o perfil mudar para CFM: aplicar Res. CFM 2.336/2023 (CRM/RQE, antes/depois só no formato de 4 etapas) e revisar todo o texto; se CFO/CFBM/CFF/COREN, conferir a resolução vigente de publicidade do conselho.

### 3.2 Executor de cada serviço invasivo
Para cada serviço em `servicos.config.ts`: quem executa, com qual habilitação e base normativa (resolução do conselho que autoriza aquele procedimento àquela profissão).

- [ ] preenchimento-labial · [ ] estetica-do-nariz · [ ] perfiloplastia · [ ] papada · [ ] harmonizacao-facial
- [ ] remocao-de-tatuagem · [ ] micropigmentacao-e-remocao · [ ] remocao-de-manchas · [ ] depilacao · [ ] sobrancelhas
- [ ] estetica-intima-masculina (atendimento reservado — exige também confirmação de indicação registrada do produto para a região)

Sem executor habilitado o serviço **não aparece** no site nem no Instagram (`docs/CALENDARIO_INSTAGRAM.md`).

### 3.3 Registros ANVISA
- [ ] Cada equipamento (laser/LIP, dermógrafo) e produto (preenchedor etc.): nome comercial **só no config**, número de registro, conferência na consulta pública da ANVISA com data e responsável.
- [ ] Medicamentos de prescrição (ex.: toxina botulínica): nunca anunciados nem citados por marca — conferir que continua assim em qualquer texto novo.
- [ ] Equipamento de depilação: confirmar a tecnologia real para escolher o termo ("depilação a laser" ou "fotodepilação/luz intensa pulsada").

### 3.4 Termo de autorização de imagem
- [ ] Revisão jurídica do modelo em [`TERMO_IMAGEM.md`](TERMO_IMAGEM.md) (LGPD art. 11, CDC, Código Civil art. 20, regra do conselho aplicável).
- [ ] Termos assinados para cada `pacienteRef` que se queira publicar (P-001 … P-010) — o vínculo ref ↔ nome fica **fora do repositório**.
- [ ] Nenhuma vantagem oferecida em troca da imagem; revogação possível a qualquer tempo.
- [ ] Mídia institucional (`retrato-espelho-sala`, fachada): autoria e autorização confirmadas.

### 3.5 Política de privacidade e termos de uso
- [ ] Revisão jurídica de `legal.config.ts` (texto-base conservador).
- [ ] CNPJ, encarregado(a) de dados (nome e canal), data de vigência, hospedagem e país (Vercel, EUA → transferência internacional, art. 33).
- [ ] Formulário de contato: definir operador e endpoint **ou** desativar (`contato.config.ts → formulario.ativo`). Hoje ativo sem endpoint: o envio fica bloqueado e há aviso na página.
- [ ] Retenção de 90 dias e rotina de exclusão definidas com quem recebe os pedidos.

### 3.6 Estratégia de avaliações
- [ ] Link de avaliação do Google (Perfil da Empresa) em `reputacao.config.ts`; plaquinha só é impressa depois.
- [ ] Equipe ciente de [`REPUTACAO.md`](REPUTACAO.md): pedido sem incentivo, sem filtrar quem é convidado, respostas sem confirmar que alguém é paciente.
- [ ] Depoimentos não são publicados no site (decisão atual) — rever com o conselho antes de mudar.

### 3.7 Dados da clínica
- [ ] Endereço completo de Lages (número 335 a confirmar) e da unidade de Balneário Camboriú, horários, link de mapa.
- [ ] WhatsApp e telefone oficiais; segundo perfil de Instagram (se houver).
- [ ] Alvará sanitário (número e validade) de cada unidade.
- [ ] Domínio definitivo (o redirect `www → raiz` já é genérico no `vercel.json`).

## 4. Deploy provisório (Vercel)

- Projeto `marina-branco` (time "Joao Canonica's projects"), ligado ao GitHub. Proteção "Vercel Authentication" ligada para **todos** os deploys.
- Deploy provisório em staging: `marina-branco-3bh9fuk32-joao-canonicas-projects.vercel.app` (commit 5195bfc) — conferido no ar: `noindex, nofollow`, faixa "Versão em revisão", CSP por página.
- A Vercel definiu `claude/gifted-meitner-x17esf` como branch de produção. O deploy de produção desse branch **falhou de propósito** (`VERCEL_ENV=production exige SITE_ENV=production`). **Ação manual:** em Settings → Git, trocar o branch de produção para `main`; os pushes neste branch passam a sair como preview.

## 5. Passos para publicar

1. Resolver as seções 3.1–3.7 e preencher os configs; `pnpm pendencias` deve mostrar **0 bloqueios**.
2. `pnpm test && pnpm check && SITE_ENV=production pnpm build && pnpm auditar && pnpm audit:lighthouse`.
3. Na Vercel: variável `SITE_ENV=production` **só** no ambiente Production; domínio adicionado; proteção de deploy mantida nos previews.
4. Promover o deploy e conferir no ar: cabeçalhos (CSP, HSTS), `robots.txt`, `sitemap.xml`, `/atendimento-reservado` com `noindex` e `no-store`.
5. Registrar aqui a data, o commit e quem aprovou.

| Data | Commit | Aprovado por | Observação |
|---|---|---|---|
| — | — | — | aguardando validações humanas |

> **Preview público (2026-10-01):** a proteção de deploy foi desligada a pedido do responsável. Para isso não expor fotos de pacientes sem termo, o build na Vercel só gera mídia provisória com `PREVIEW_PROTECAO_CONFIRMADA=true` (`scripts/lib/manifesto.mjs`). Sem ela, o preview público sai sem nenhuma foto de paciente, continua com `noindex` e a faixa "Versão em revisão". Se religar a proteção, defina a variável para ver as fotos provisórias.
