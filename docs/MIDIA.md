# Mídia

> Gerado por `pnpm midia:inventario` a partir de `media.manifest.json`. Não editar à mão.

## Regras
- Originais em `assets-originais/<marca|equipe|espaco|resultados|videos>/`, versionados e **nunca modificados** (sha256 conferido a cada geração).
- Derivados em `src/assets/media/` (fora do git), gerados por `scripts/prepare-media.mjs` antes de `dev`/`build`: só recorte e cobertura sólida; AVIF + WebP em várias larguras; metadados (EXIF/GPS) descartados.
- Produção gera só `publicavel: true` e falha se algum tiver consentimento ≠ ok/nao-se-aplica, autoria ≠ propria, OCR não aprovado ou problema em aberto.
- Dev/preview gera também `previewOk: true`, marcados como provisórios (selo PROVISÓRIO; deploy de preview protegido por senha).
- Nunca nome ou @ de paciente: `pacienteRef` (P-001); o vínculo fica fora do repo.
- OCR: `pnpm midia:ocr` (local, sem rede) grava `ocr.texto`/`ocr.ok`.

## Inventário (4 itens)

| id | categoria | dimensões | autoria | consentimento | OCR | preview | publicável | bloqueios para produção |
|---|---|---|---|---|---|---|---|---|
| `fachada-street-view` | espaco | 773×856 · 88 KB | terceiro | nao-se-aplica | reprovado | não | não | autoria "terceiro"; OCR reprovado; 7 problema(s) em aberto |
| `retrato-espelho-sala` | equipe | 723×900 · 91 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 4 problema(s) em aberto |
| `logo-monograma-mb` | marca | 150×150 · 3 KB | CONFIRMAR | nao-se-aplica | ok | não | não | autoria "CONFIRMAR"; 3 problema(s) em aberto |
| `letreiro-fachada-street-view` | marca | 243×511 · 142 KB | CONFIRMAR | nao-se-aplica | ok | não | não | autoria "CONFIRMAR"; 3 problema(s) em aberto |

## Detalhes

### `fachada-street-view`
- Arquivo: `assets-originais/espaco/fachada-street-view.webp` · sha256 `9fc361c7fbad071e…`
- Descrição: Fachada de prédio claro de dois pavimentos com brises horizontais escuros no andar superior e letreiro vertical preto com monograma MB dourado, 'Marina Branco — Clínica de estética' e dois telefones. No térreo, duas portas de vidro com o número 335; a porta da direita tem adesivo com lista de serviços (ilegível nesta resolução). Placa 'JF' dourada na parede, fachada vizinha à direita com placa parcial 'ENG', canteiro com arbustos e calçada de pedra portuguesa. Prédios altos ao fundo.
- Alt: Fachada da clínica, com letreiro preto e monograma dourado
- Uso sugerido: Referência para a sessão de fotos (enquadramento da fachada) e para confirmar endereço/telefones no config. Não usar no site: refazer foto própria da fachada.
- Crop: nenhum · Edições: nenhuma
- OCR: "fera ”. + Ts 7 e pão É det CA Aa MARINA BRANCO \| meme í eee o \| ' VIEIRA Ú pasa eme é " Dee Pr. 3018-0074 — SMS —. F sia REG s, \| \| \| A SAS o A o OO oa CRE Ao DA OD NE E LGPO NRO SE a EO NE SS AOIDO Sc APARADE"
- Problemas:
  - Captura do Google Street View: marca d'água '© 2025 Google' sobre os brises (aprox. x 125–290, y 300–330); autoria de terceiro, uso sujeito aos termos do Google
  - Baixa resolução (773×856) e compressão visível; não serve para hero em telas grandes
  - Borda inferior direita tem elemento de interface do Street View (círculo de navegação)
  - Portas de vidro com adesivo listando serviços: conteúdo não conferido (pode citar procedimentos sem executor habilitado)
  - Placa 'JF' de terceiro na parede e placa parcial de estabelecimento vizinho ('ENG')
  - Telefones visíveis no letreiro: conferir se são os números atuais antes de qualquer uso
  - OCR: possível nome próprio: "VIEIRA" (confiança 21%)

### `retrato-espelho-sala`
- Arquivo: `assets-originais/equipe/retrato-espelho-sala.webp` · sha256 `18b744d1bd8380ca…`
- Descrição: Foto de espelho (selfie) de uma mulher de cabelo escuro preso, de pé, com colete de lapela e calça em tom caramelo, segurando um celular diante do rosto parcialmente. Ao fundo, sala de atendimento com piso branco, cadeira estofada branca reclinável com base cromada, móvel branco com espelho redondo de mesa, bancada à direita e persianas horizontais claras.
- Alt: Profissional em sala de atendimento com cadeira estofada branca
- Uso sugerido: Referência de figurino, paleta (caramelo/nude sobre branco) e do espaço para briefing da sessão de fotos. Não usar no site: refazer retrato profissional com autorização.
- Crop: nenhum · Edições: nenhuma
- OCR: "() E ONFORA =" / eee = . \| PAR \| \| = o” fee \| DRI"
- Problemas:
  - Rosto identificável: CONFIRMAR quem é a pessoa (não inferido pela imagem) e obter autorização de imagem, mesmo que seja a proprietária
  - Formato de selfie de espelho, com o celular na mão e na frente do rosto: linguagem de rede social, não de retrato institucional
  - Baixa resolução (723×900) e compressão visível
  - Autoria incerta (provável repost de rede social); origem do arquivo não informada

### `logo-monograma-mb`
- Arquivo: `assets-originais/marca/logo-monograma-mb.jpg` · sha256 `eeaed057f7911ae3…`
- Descrição: Monograma com as letras M e B entrelaçadas sobre fundo preto: M em branco, B em dourado com leve degradê, ambos em serifa de alto contraste.
- Alt: Monograma MB, da Marina Branco Clínica de Estética
- Uso sugerido: Referência para o logo do site. Pedir o arquivo vetorial original (AI/SVG/PDF); até lá, usar os traçados em assets-originais/marca/derivados/ apenas em preview.
- Crop: nenhum · Edições: nenhuma
- OCR: (sem texto)
- Problemas:
  - Resolução muito baixa (150×150 JPEG): serve só como referência; o vetor gerado por traçado é aproximado
  - Arquivo-mestre do logo (vetor original do designer) não fornecido
  - Titularidade/autoria do logo não confirmada (quem criou, se há cessão de direitos)

### `letreiro-fachada-street-view`
- Arquivo: `assets-originais/marca/letreiro-fachada-street-view.png` · sha256 `8f48515f0da790d2…`
- Descrição: Recorte vertical do letreiro da fachada: placa preta com monograma MB, 'MARINA BRANCO', traço curvo dourado e 'Clínica de estética'; abaixo, painel preto com dois telefones com ícones e uma forma triangular dourada. Parte da parede clara e de uma janela à direita.
- Alt: Letreiro preto da clínica com monograma dourado
- Uso sugerido: Referência da aplicação da marca (lockup completo com 'Clínica de estética' e traço curvo) e dos telefones para o config. Descartar como imagem do site.
- Crop: nenhum · Edições: nenhuma
- OCR: "\| MARINA B RANCO Clínico de estética BI8856 6497 & 3018-0074"
- Problemas:
  - Provável recorte de captura do Google Street View (mesma cena da fachada): autoria de terceiro a confirmar
  - Resolução muito baixa (243×511), desfocada e em perspectiva
  - Telefones visíveis: conferir se são os atuais
