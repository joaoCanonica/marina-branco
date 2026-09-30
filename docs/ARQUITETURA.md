# Arquitetura proposta

Base: template `dra-nicole` (Astro estático, TS strict, npm fixado) + regras regulatórias da base anterior + portes do L'Amour descritos em `docs/AUDITORIA.md`. Proposta — nada abaixo foi implementado ainda.

```
marina-branco/
├─ .nvmrc  .npmrc  package.json (packageManager npm@10.9.7, engines node 22)
├─ astro.config.ts           # integração que roda validate-config no início do build
├─ vercel.json               # cabeçalhos de segurança, cache; CSP gerada por script
├─ media.manifest.json       # ÚNICA fonte da verdade da mídia (ver abaixo)
│
├─ assets-originais/         # mídia bruta, IMUTÁVEL. Somente leitura para scripts.
│  ├─ README.md              # regras: nunca editar, nunca sobrescrever, nunca nomes de paciente
│  ├─ clinica/  equipe/  equipamentos/
│  └─ pacientes/             # NÃO versionado (.gitignore); arquivos nomeados por pacienteRef (P-001-a.jpg)
│
├─ public/
│  └─ media/                 # GERADO por prepare-media (.gitignore). Nunca editar à mão.
│
├─ src/
│  ├─ config/                # tudo que é da cliente vive aqui; componentes só leem
│  │  ├─ profile.config.ts       # clínica + profissionais (conselho, registro, UF, título confirmado)
│  │  ├─ theme.config.ts         # tokens: preto, ouro, marfim, nude; tons de seção (data-tone); pares de contraste
│  │  ├─ compliance.config.ts    # perfil regulatório, termos vetados, matriz conselho×categoria, normas conferidas
│  │  ├─ copy.pt-BR.ts           # textos de interface (sem conteúdo de saúde)
│  │  ├─ contato.config.ts       # WhatsApp, Instagram, mapa (link), analytics = 'nenhum'
│  │  ├─ servicos.config.ts      # serviço → categoria, executor, equipamento, publicar, paginaConteudo
│  │  ├─ calendario.config.ts    # calendário editorial (se mantido)
│  │  └─ legal.pt-BR.ts          # privacidade e termos, versionados
│  ├─ content/
│  │  ├─ servicos/<slug>.md      # texto de página de serviço; só com docs/pesquisa/<slug>.md aprovado
│  │  └─ faq/*.md
│  ├─ lib/
│  │  ├─ ambiente.ts             # SITE_ENV; VERCEL_ENV=production exige SITE_ENV=production
│  │  ├─ regras/                 # funções puras: habilitação, mídia, texto (testadas)
│  │  ├─ midia.ts                # resolve item do manifesto; lança erro se bloqueado no ambiente
│  │  ├─ termos.ts  color.ts  schema.ts
│  ├─ components/
│  │  ├─ base/                   # Container, Section (com data-tone), Button, Link, Icon, Eyebrow…
│  │  ├─ midia/Midia.astro       # única porta para imagem de conteúdo; selo PROVISÓRIO fora de produção
│  │  ├─ legal/                  # Consentimento, RodapeLegal, PaginaLegal, IdentificacaoProfissional
│  │  └─ movimento/              # ilhas pequenas, todas com reduced-motion e estado final sem JS
│  │     ├─ Revelar.astro            # IO comum (~0,4 KB) para texto/imagem
│  │     ├─ FioOuro.astro            # traço desenhado via animation-timeline: view()
│  │     ├─ TomCabecalho.astro       # data-tone → cabeçalho, via IntersectionObserver
│  │     └─ Abertura.astro           # intro opcional da Home (boot inline + CSS keyframes)
│  ├─ layouts/BaseLayout.astro   # @view-transition nativo; faixa provisória; noindex fora de produção
│  ├─ pages/                     # index, servicos/, servicos/[slug], equipe, contato, privacidade, termos, 404
│  └─ styles/ global.css  tokens.ts
│
├─ scripts/
│  ├─ prepare-media.ts       # manifesto → public/media: só extract + retângulo opaco; sha256 do original;
│  │                         # EXIF removido; recusa item bloqueado quando SITE_ENV=production
│  ├─ extract-posters.ts     # ffmpeg (manual, fora do build) → poster em assets-originais/_gerados/
│  ├─ validate-config.ts     # zod + contraste AA + CONFIRMAR + habilitação + ANVISA + pesquisa aprovada
│  ├─ audit-compliance.ts    # dist/: termos vetados, identificação por perfil, terceiros, campos, mídia provisória
│  ├─ gerar-csp.ts           # CSP com hashes por página
│  ├─ pendencias.ts          # gera docs/PENDENCIAS.md (o que falta para publicar, por responsável)
│  ├─ impressos.ts           # plaquinha/QR com a nova identidade
│  ├─ audit-a11y.ts          # axe-core, WCAG 2.2 AA
│  └─ audit-lighthouse.ts    # inclui teto de JS por página (falha se estourar)
│
├─ tests/                    # node:test das regras (habilitação, mídia, termos)
│
└─ docs/
   ├─ AUDITORIA.md  ARQUITETURA.md  REGULATORIO.md  MIDIA.md
   ├─ A11Y.md  PERFORMANCE.md  COMPLIANCE.md  PENDENCIAS.md (gerado)
   └─ pesquisa/
      ├─ _modelo.md          # fonte, nível de evidência, riscos, contraindicações, limites, norma, "Status:"
      └─ <servico>.md
```

## `media.manifest.json` (esquema proposto)

Uma entrada por item. Nenhum nome ou @ de paciente: só `pacienteRef` e `termoRef`, com o vínculo guardado fora do repo pela clínica.

```jsonc
{
  "itens": {
    "sala-atendimento": {
      "tipo": "ambiente",                    // paciente | ambiente | equipe | equipamento | decorativa
      "original": "assets-originais/clinica/sala-01.jpg",
      "originalSha256": "…",                 // conferido antes de derivar
      "out": "media/sala-atendimento.jpg",
      "edicoes": [                            // só estes tipos; cada uma com área e motivo
        { "tipo": "recorte", "area": [0, 40, 1200, 800], "motivo": "enquadramento" }
      ],
      "alt": "Sala de atendimento com maca e luminária",
      "autoriaPropria": true,
      "textoPromessa": false,
      "provisoria": false
    },
    "P-001-face": {
      "tipo": "paciente",
      "pacienteRef": "P-001",
      "termoRef": "T-001",                   // termo assinado, sem contrapartida
      "termoAssinadoEm": "AAAA-MM-DD",
      "regiaoCorporal": "face",              // mama, gluteo, intima → sempre bloqueado
      "antesDepois": false,                  // bloqueado até perfil regulatório definido
      "…": "mesmos campos acima"
    }
  },
  "videos": { "…": "mesmos campos + posterTime, posterOut" },
  "og": { "home": { "foto": "sala-atendimento", "fundo": "#0c0b0a", "tinta": "#c4a468" } }
}
```

## Fluxo de build

```
validate-config ──► prepare-media ──► astro build ──► gerar-csp ──► audit-compliance ──► (CI) audit-a11y / lighthouse
      │                  │                                                 │
      └── falha se: CONFIRMAR em produção, serviço invasivo sem habilitação/registro,
          equipamento sem ANVISA, página sem pesquisa aprovada, mídia bloqueada referenciada,
          termo vetado, contraste < AA, JS acima do teto
```

## Decisões registradas
- **npm** (do template) em vez de pnpm; Node 22.
- Sem React/GSAP/Lenis/Motion; animação = CSS scroll-driven + IO; transição = View Transitions nativa (MPA).
- `assets-originais/pacientes/` fora do git; o resto de `assets-originais/` versionado e imutável.
- Deploy de preview só com proteção por senha ligada quando houver mídia provisória.
