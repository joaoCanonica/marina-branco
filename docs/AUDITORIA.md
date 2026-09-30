# Auditoria de reaproveitamento

Data: 2026-09-30 · Fontes lidas (somente leitura, clones fora do repo):
- `joaoCanonica/dra-nicole` (template, Astro 5.18.2, npm 10.9.7, Node 22)
- `joaoCanonica/L-amour-clinica` (Next 16 + React 19 + GSAP + Lenis + Motion + Tailwind 4)

## 0. Estado do repositório (bloqueio)

O repo `marina-branco` **não estava vazio**: já tinha um primeiro commit (base Astro 7 feita na sessão anterior, com as regras regulatórias em `src/lib/regras/`). A troca desse conteúdo pelo template `dra-nicole` foi **bloqueada pela permissão do ambiente** (ela apaga arquivos rastreados), então ainda não foi feita. Falta a pessoa responsável autorizar a troca.

Enquanto isso, o template foi verificado numa cópia fora do repo (`git archive` sem histórico → `npm ci` → `npm run check` → `npm run build`):

| Etapa | Resultado |
|---|---|
| `npm run check` (validate-config + astro check, 59 arquivos) | 0 erros, 0 avisos, 1 dica |
| `npm run build` | 14 páginas; CSP com hashes injetada em 14; `audit-compliance` OK |

**Proposta para a troca:** um commit "template dra-nicole" que substitui a árvore, seguido de um commit que porta da base anterior só o que falta no template (ver 1.2). O histórico git do `dra-nicole` não entra.

## 1. (a) O que fica do template `dra-nicole`

### 1.1 Mantido como está (genérico, já testado)
| Item | Por quê |
|---|---|
| Stack: Astro estático, TS strict, `astro/zod`, `packageManager: npm@10.9.7`, `engines` + `.nvmrc` + `.npmrc` | Atende "fixar Node e gerenciador". Decisão: **ficar em npm** (o template usa npm) em vez do pnpm da base anterior. |
| `src/config/*` separado em profile, theme, compliance, contato, copy, legal, calendario | É exatamente a divisão pedida em ARQUITETURA; nada da cliente nos componentes. |
| `scripts/validate-config.ts` (zod + contraste AA dos pares do tema + `CONFIRMAR` bloqueia produção + termos vetados + `--relatorio` → `docs/PENDENCIAS.md`) | Base de `validate-config` e `pendencias`. |
| `scripts/audit-compliance.ts` (varre `dist/`: termos vetados no texto visível e em `alt/title/aria-label/meta`; identificação obrigatória em toda página; nenhum recurso de terceiro sem interação; campos de formulário permitidos) | Base de `audit-compliance`. |
| `scripts/gerar-csp.ts` (CSP com hashes por página) | Sem mudança. |
| `scripts/audit-a11y.ts` (axe-core + playwright-core) e `audit-lighthouse.ts` | Metas de A11y/perf mensuráveis. |
| `scripts/gerar-impressos.ts` (+ `qrcode`) | Base de `impressos` (plaquinha de avaliação). |
| `src/lib/ambiente.ts` (`SITE_ENV=production` = go-live; senão noindex + faixa provisória), `src/lib/termos.ts`, `src/lib/color.ts`, `src/lib/schema.ts` (JSON-LD) | Genéricos. |
| `Consentimento.astro` (banner LGPD por categoria, versionado, nada de terceiro antes do aceite) | Atende "terceiros só após consentimento". |
| `vercel.json` (cabeçalhos de segurança, cache imutável de `/_astro`, redirect www) | Sem mudança. |
| `RodapeLegal`, `PaginaLegal`, `privacidade`, `termos`, `robots.txt.ts`, sitemap | Genéricos. |
| Componentes base: `Container`, `Section`, `Button`, `Link`, `Icon`, `Eyebrow`, `Tag`, `Texto`, `Card`, `Breadcrumbs`, `BotaoWhatsapp`, `BarraContato` | Genéricos; só herdam tokens. |
| Coleções `content.config.ts` (artigos, faq) | Estrutura fica; **conteúdo é trocado** (ver 3). |
| `docs/A11Y.md`, `PERFORMANCE.md`, `COMPLIANCE.md`, `PENDENCIAS.md` | Formatos ficam, conteúdo refeito. |

### 1.2 Fica, mas precisa ser generalizado (o template é "uma médica, perfil CFM")
| Limitação no template | Mudança necessária (em tarefa futura) |
|---|---|
| `profile.config.ts` modela **uma** pessoa com `crm` + `rqe` obrigatórios | Lista de profissionais com `conselho` (CFM, CFBM, COFEN, CFF, COFFITO, NENHUM…), registro, UF, `registroConferido`, `tituloConfirmado`. |
| `audit-compliance` exige identificação CFM em toda página | Identificação conforme o **perfil regulatório** de cada executora. |
| Não existe o conceito de serviço × executor × habilitação | Portar da base anterior: `servicos` com `categoria` (invasivo ou não), matriz `habilitacoes` conselho×categoria com norma conferida, `equipamentos` com registro ANVISA. |
| `tratamento: 'Dra.'` sem confirmação | Exigir `tituloConfirmado`. |
| `termosVetados` pensados para medicina | Somar: "definitivo/a", marcas de medicamentos de prescrição, "toxina botulínica", manipulados, promoções/brindes, "sem dor". |
| Sem manifesto de mídia com consentimento | Portar o esquema da base anterior (pacienteRef, termo, região proibida, provisória, sha256 do original) para `media.manifest.json`. |
| `FormContato.astro` coleta nome/telefone/período | Avaliar remover (preferir só WhatsApp). Se ficar, os campos continuam limitados e **nunca** coletam sintoma/foto. |

## 2. (b) O que do L'Amour será PORTADO (como ilha ou script pequeno)

Princípio: nada de React, GSAP, Lenis ou Motion por padrão. CSS scroll-driven (`animation-timeline: view()`) primeiro; IntersectionObserver como fallback; `prefers-reduced-motion` = estado final estático. O padrão já existe no template (`linha/Trecho.astro`: ~0,4 KB).

| Origem L'Amour | O que faz | Porte para Astro | Custo JS estimado (gzip) |
|---|---|---|---|
| `scripts/prepare-media.mjs` + `media.manifest.json` | sharp: `extract(crop)` da fonte → `public/media`, cache por mtime; cópia de vídeo + poster; OG 1200×630 composta | `scripts/prepare-media.ts` lendo o **nosso** manifesto (com consentimento). Operações limitadas a `extract` e retângulo opaco (cobertura); **sem** re-encode agressivo: qualidade alta, sem `mozjpeg` destrutivo nem sharpen; EXIF descartado; sha256 do original conferido; em produção recusa item bloqueado. OG: manter a composição (logo + foto **não** de paciente). | 0 (build) |
| `scripts/extract-posters.mjs` | ffmpeg extrai quadro de capa em `posterTime` | Portar quase igual, como ferramenta manual (ffmpeg fora do build). Poster de vídeo de paciente herda as regras de consentimento do vídeo. | 0 (build) |
| Sistema `data-tone` (Header lê o tom da seção sob ele com `elementsFromPoint`) | Cabeçalho fixo que troca cor conforme a seção | Seções recebem `data-tone="preto|marfim|nude"`; o cabeçalho troca por **IntersectionObserver** com `rootMargin` na faixa do header (sem listener de scroll, sem React). Tokens de cada tom em `theme`. Pares ink/bg entram no validador de contraste. | ~0,5 KB |
| `components/intro/IntroSplash.tsx` + `lib/intro.ts` | Abertura com o símbolo, 1× por sessão, só na Home, nunca com reduced-motion, rede de segurança 6 s, botão "Pular" | Script inline de boot (portado quase literal, já é vanilla) + animação em **CSS keyframes** sobre o SVG do monograma da Marina Branco (criar símbolo próprio; **não** reusar pétalas/molduras). Cortina via `clip-path`. Máx. 2,2 s, botão "Pular introdução" focável, `sessionStorage` com try/catch. **Opcional** — decidir com a proprietária (ver riscos). | ~0,6 KB |
| `RevealText` (SplitText, linhas mascaradas) | Título revelado linha a linha | Sem SplitText: título envolto em máscara `overflow: clip` animando o **bloco** (ou 2–3 linhas marcadas manualmente com `<span>` no copy). CSS `view()` + fallback IO. Texto nunca fica invisível para leitor de tela nem sem JS. | 0 (usa o IO comum) |
| `RevealImage` (clip-path + scale + parallax) | Foto revelada por cortina e "assentando" | CSS: `clip-path` + `scale` com `animation-timeline: view()`; parallax só via `view()` (sem fallback JS — sem suporte, fica estático). **Não** aplicar em foto de paciente (qualquer efeito sobre resultado pode ser lido como edição). | 0 |
| `DrawLine` | Fio que se desenha no scroll | Já existe no template como `Trecho` (SVG `pathLength` + `view()`). Adaptar para fio de ouro reto/vertical. | 0 (reuso) |
| `ContextShift` | Painel que se abre (clip-path) ao entrar numa seção de outro "lugar" | CSS `view()` puro; sem suporte → painel já aberto. | 0 |
| `PageTransition` (cortina com símbolo, Motion + router) | Transição entre rotas | **View Transitions API** nativa: `@view-transition { navigation: auto; }` (MPA, sem JS) + `::view-transition-*` com cortina no preto. Desligada em reduced-motion. Sem `ClientRouter` do Astro, para não carregar o router. | 0 |
| `lib/page-ready.ts` | Segura animações de entrada durante a cortina | Desnecessário com View Transitions nativas (a nova página já entra depois do snapshot). | 0 |
| `lib/consent.ts` | Consentimento versionado por `policyVersion`, evento para reabrir preferências | Ideias já cobertas pelo `Consentimento.astro` do template (versão, reabrir, try/catch). Portar só o **consentimento por conteúdo** (ex.: mapa carregado apenas após clique, com placeholder estático). | +0,2 KB |

## 3. (c) O que será descartado

| Item | Motivo |
|---|---|
| **Paleta, fontes e assinaturas visuais** dos dois sites: teal/lilás/rosa-seco e "Linha da Vida" em forma de ventre (Dra. Nicole); navy/linho/cacau, logo de pétalas, cortina navy (L'Amour); `Great Vibes`, `Hanken Grotesk` | Identidade própria obrigatória (preto profundo, ouro, marfim, nude). |
| `IlustracaoMaeBebe`, `CalendarioCuidado` (conteúdo de gestação), `GuiaConsulta`, `Convenios`, `AvisoEmergencia` (texto obstétrico), `avaliar.astro` (se for pedido de avaliação no Google — revisar) | Conteúdo específico de ginecologia/obstetrícia. `AvisoEmergencia` pode voltar com texto de intercorrência pós-procedimento, se a pesquisa indicar. |
| Todos os `src/content/artigos/*` e `faq/*` | Outra especialidade. FAQ reescrito do zero para a clínica. |
| `docs/CALENDARIO_INSTAGRAM.md`, `REPUTACAO.md` (conteúdo) | Específicos da Dra. Nicole; formatos podem inspirar. |
| `print/plaquinha-avaliacao.*` (arquivos gerados) | Regerados pelo script com a nova identidade. |
| L'Amour: React, Next, Tailwind, GSAP, `@gsap/react`, SplitText, ScrollTrigger, Lenis, Motion | Ver orçamento (4). Lenis especificamente: sequestra o scroll nativo — pior para acessibilidade, teclado e leitores de tela, e sem ganho que justifique. |
| L'Amour: Clube/Supabase (`actions.ts`, `GrupoForm`, `lib/server/grupo.ts`, migrations) | Formulário com dados pessoais + backend: fora do escopo e contra a regra de LGPD. |
| L'Amour: `MitosOzonio`, `programa-emagrecimento`, `Depoimento` | Conteúdo de terceiros; depoimento de paciente é risco regulatório. |
| L'Amour: `MapaClinica` com Google Maps | Substituir por imagem estática + link externo (ou carregar só com consentimento). |
| L'Amour: fluxo de mídia que recorta **prints de carrossel do Instagram** com texto embutido (ex.: `hero-01-blur-artistico-agende-consulta`) | É justamente o tipo de mídia que aqui só pode ser provisória. Nada disso vai para produção sem autoria própria e sem texto de promessa. |

## 4. (d) Orçamento de JS proposto

Referência medida: o template `dra-nicole` entrega **~1,0 KB gzip** de JS na Home (Lighthouse 100/100/100/100, `docs/PERFORMANCE.md`). No build verificado, os scripts externos somam ~3 KB sem compressão.

| Página | Teto (gzip, JS total transferido) |
|---|---|
| Home (com intro) | **6 KB** |
| Demais páginas | **4 KB** |
| Qualquer biblioteca de terceiro de animação | **0 KB por padrão** |

Composição estimada da Home: consentimento ~1 KB + IO comum de revelação ~0,4 KB + `data-tone` ~0,5 KB + intro ~0,6 KB + fallback de linha ~0,4 KB ≈ **3 KB**, com folga.

Regras:
1. O teto entra em `audit-lighthouse` / um script de medição no build e **falha** se estourar.
2. GSAP/Lenis/Motion só entram com proposta escrita: efeito que CSS + IO não fazem, custo medido (não estimado), e aprovação. Como ordem de grandeza (a medir antes de qualquer decisão): GSAP core + ScrollTrigger + SplitText passa de 40 KB gzip, sozinho mais que 6× o teto.
3. Toda animação: estado final visível sem JS; `prefers-reduced-motion: reduce` = sem movimento; nada de piscar > 3×/s; foco nunca escondido atrás de cortina.

## 5. (e) Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Template é **CFM/uma médica**; a clínica pode ter executoras de outros conselhos ou nenhum | Identificação errada, título indevido, serviço anunciado sem habilitação | Generalizar profile → profissionais + matriz de habilitação (1.2); audit por perfil. |
| Troca do conteúdo do repo ainda não autorizada | Base atual (Astro 7) e template (Astro 5.18) divergem | Decidir a troca antes de qualquer feature; portar as regras da base anterior como primeiro PR. |
| Versões: template em Astro 5.18.2 / TS 5.9; npm vs pnpm | Retrabalho se migrar depois | Manter as versões fixadas do template; atualizar para Astro 7 em PR isolado, medido. |
| Mídia atual vem de prints do Instagram (texto embutido, @, promessa) | Vazamento para produção; identificação de paciente | Manifesto com consentimento + build bloqueando em produção + selo PROVISÓRIO + deploy de preview protegido por senha. |
| `prepare-media` do L'Amour re-comprime com `mozjpeg` q92 e recorta por pixel | Re-encode pode ser questionado como "edição"; recorte errado pode expor identificador | Qualidade alta sem filtros; registrar cada operação no manifesto; revisão visual do derivado antes de `provisoria: false`. |
| Intro/cortinas | Atrasam o LCP, desorientam, prendem o foco | Intro opcional, 1×/sessão, ≤ 2,2 s, "Pular" focável, desligada com reduced-motion; LCP medido com e sem. |
| `animation-timeline` sem suporte em parte dos navegadores (Safari/Firefox, conforme versão) | Efeito ausente | Tudo tem estado final estático; fallback IO só onde faz falta. |
| Normas: Res. CFM 2.336/2023 e resoluções de conselhos não médicos (algumas contestadas na Justiça) | Aplicar texto revogado ou suspenso | Conferência humana do texto vigente registrada no config (data, pessoa, link) antes de publicar. |
| Mapa, WhatsApp e Instagram são terceiros | Cookies/LGPD | Nada embutido; só links. Mapa só com consentimento. |
| Identidade parecida com os sites anteriores (Cormorant é comum aos dois) | Violação da regra de identidade própria | Trocar a serifada de títulos; assinatura visual nova (fio de ouro reto + monograma), revisada lado a lado com os dois sites. |
