# Mídia

> Gerado por `pnpm midia:inventario` a partir de `media.manifest.json`. Não editar à mão.

## Regras
- Originais em `assets-originais/<marca|equipe|espaco|resultados|videos>/`, versionados e **nunca modificados** (sha256 conferido a cada geração).
- Derivados em `src/assets/media/` (fora do git), gerados por `scripts/prepare-media.mjs` antes de `dev`/`build`: só recorte e cobertura sólida; AVIF + WebP em várias larguras; metadados (EXIF/GPS) descartados.
- Produção gera só `publicavel: true` e falha se algum tiver consentimento ≠ ok/nao-se-aplica, autoria ≠ propria, OCR não aprovado ou problema em aberto.
- Dev/preview gera também `previewOk: true`, marcados como provisórios (selo PROVISÓRIO; deploy de preview protegido por senha).
- Nunca nome ou @ de paciente: `pacienteRef` (P-001); o vínculo fica fora do repo.
- OCR: `pnpm midia:ocr` (local, sem rede) grava `ocr.texto`/`ocr.ok`.

## Inventário (9 itens)

| id | categoria | dimensões | autoria | consentimento | OCR | preview | publicável | bloqueios para produção |
|---|---|---|---|---|---|---|---|---|
| `fachada-street-view` | espaco | 773×856 · 88 KB | terceiro | nao-se-aplica | reprovado | não | não | autoria "terceiro"; OCR reprovado; 7 problema(s) em aberto |
| `retrato-espelho-sala` | equipe | 723×900 · 91 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 4 problema(s) em aberto |
| `logo-monograma-mb` | marca | 150×150 · 3 KB | CONFIRMAR | nao-se-aplica | ok | não | não | autoria "CONFIRMAR"; 3 problema(s) em aberto |
| `letreiro-fachada-street-view` | marca | 243×511 · 142 KB | CONFIRMAR | nao-se-aplica | ok | não | não | autoria "CONFIRMAR"; 3 problema(s) em aberto |
| `resultado-nariz-perfil-p001` | resultados | 405×729 · 128 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 10 problema(s) em aberto |
| `resultado-labios-frontal-p002` | resultados | 512×515 · 332 KB | CONFIRMAR | pendente | reprovado | sim | não | consentimento "pendente"; autoria "CONFIRMAR"; OCR reprovado; 14 problema(s) em aberto |
| `resultado-labios-perfil-p003` | resultados | 902×902 · 139 KB | CONFIRMAR | pendente | reprovado | sim | não | consentimento "pendente"; autoria "CONFIRMAR"; OCR reprovado; 8 problema(s) em aberto |
| `resultado-mao-manchas-p004` | resultados | 495×493 · 283 KB | CONFIRMAR | pendente | ok | sim | não | consentimento "pendente"; autoria "CONFIRMAR"; 9 problema(s) em aberto |
| `resultado-labios-frontal-p005` | resultados | 508×530 · 304 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 8 problema(s) em aberto |

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

### `resultado-nariz-perfil-p001`
- Arquivo: `assets-originais/resultados/resultado-nariz-perfil-p001.png` · sha256 `63ec34181e79a7ab…`
- Descrição: Montagem lado a lado de duas fotos de perfil esquerdo do nariz e dos lábios, em fundo preto; à esquerda o dorso nasal com leve irregularidade, à direita o dorso mais retilíneo. Uma seta branca desenhada aponta o dorso em cada foto. Monograma da clínica sobreposto na parte inferior central da foto da esquerda. No original: título promocional no topo e @ de um perfil na margem inferior (removidos por recorte no derivado).
- Alt: Perfil do nariz antes e depois de procedimento no dorso nasal
- Uso sugerido: Nenhum até confirmar origem: o @ indica que a foto pode ser de outra profissional. Se for de terceiro, descartar.
- Crop: {"x":24,"y":213,"w":348,"h":439} · Edições: recorte (remove o título sobreposto no fundo preto superior (frase de efeito) e o @ de perfil na margem inferior)
- OCR: (sem texto)
- Problemas:
  - Setas desenhadas sobre as duas fotos; removê-las exigiria reconstruir a imagem
  - Foto da direita (depois) com pele visivelmente mais lisa e luz mais difusa: possível filtro ou edição
  - Monograma da clínica sobreposto à foto (selo)
  - Original tinha frase promocional sobreposta e @ de outro perfil (crédito de terceiro: pode ser de outra profissional; autoria provavelmente de terceiro)
  - Não se sabe se as duas fotos são do mesmo dia/luz: enquadramento e exposição levemente diferentes
  - Procedimento sugerido (rinomodelação com preenchedor) é de alto risco (evento vascular): CONFIRMAR se foi feito na clínica e por quem
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada

### `resultado-labios-frontal-p002`
- Arquivo: `assets-originais/resultados/resultado-labios-frontal-p002.png` · sha256 `3b444e458eb5d63c…`
- Descrição: Duas fotos empilhadas dos lábios em vista frontal, em close: acima, lábios mais finos e secos; abaixo, lábios com mais volume e brilho, contorno mais definido. Logotipo da clínica (monograma e nome) sobreposto no canto inferior direito da foto de baixo.
- Alt: Lábios em vista frontal antes e depois de preenchimento
- Uso sugerido: Placeholder de preview (com selo PROVISÓRIO) para a área de preenchimento labial. Para produção, refazer com termo, luz e enquadramento padronizados.
- Crop: nenhum · Edições: nenhuma
- OCR: "Vs ANSA 1/7 dO SaA, Wi / VAIPLA, THA] TIA i » x. TEN: VA a NA XY A iWL DE "NWA SINAIS ACNE, x 15. " SM PIN Ú VA EAN SE VAO TUA % j VAR TA e POPA Ú ; ' Ds Sá \| Sds! A d ” - , ns À ”* >. \| jy o) Ade ” IA DERSE: / o Í ó ” SAN R ss. TE. - Y dd = ' . Seta Lis, o ” Pei \| d tas AAA 7 We P/ , MRS pts \| Adão e [XX PM o % sh CENT . ST AVNBEDI \| i 5 ESSO 7 INS AAA abr, A EUNDAR - 4) ” j ; IAK >) TA J . e. Eid ias. SERRAS Co cs ESSAS A OA À AE SS 1 TE o ARTS a a 4 em" > . á x > o. \| : aut é"
- Problemas:
  - Logotipo da clínica sobreposto à foto de baixo (selo); não é identificador nem promessa, então não foi coberto: decidir
  - Luz e brilho diferentes entre as fotos (depois com reflexo intenso, possivelmente produto labial), o que realça a diferença
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada
  - OCR: possível nome próprio: "Seta Lis"
  - OCR: possível nome próprio: "ANSA" (confiança 18%)
  - OCR: possível nome próprio: "SINAIS" (confiança 20%)
  - OCR: possível nome próprio: "POPA" (confiança 35%)
  - OCR: possível nome próprio: "CENT" (confiança 25%)
  - OCR: possível nome próprio: "ESSO" (confiança 15%)
  - OCR: possível nome próprio: "ESSAS" (confiança 19%)
  - OCR: possível nome próprio: "ARTS" (confiança 38%)

### `resultado-labios-perfil-p003`
- Arquivo: `assets-originais/resultados/resultado-labios-perfil-p003.webp` · sha256 `1b0aba4038695850…`
- Descrição: Duas fotos empilhadas dos lábios em perfil direito, close com pele e sulcos visíveis; abaixo, lábios com mais projeção e brilho. Fundo de parede bege com moldura à direita. Logotipo da clínica sobreposto no canto inferior direito.
- Alt: Lábios de perfil antes e depois de preenchimento
- Uso sugerido: Placeholder de preview (com selo PROVISÓRIO), resolução boa (902×902). Refazer para produção com padronização.
- Crop: nenhum · Edições: nenhuma
- OCR: "PEL d- Axe no DOS À Fei dá j VA Ara TEA + j 2X ia m Mage Auta Ao NR ARE: Es SN ALA MARINA BRANCO"
- Problemas:
  - Logotipo da clínica sobreposto à foto de baixo (selo): decidir
  - Diferença de ângulo e de luz entre antes e depois (depois mais quente e com mais brilho)
  - Pode ser a mesma paciente de outra foto: não verificável pela imagem (P-003 atribuído por arquivo)
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada
  - OCR: possível nome próprio: "Mage Auta"

### `resultado-mao-manchas-p004`
- Arquivo: `assets-originais/resultados/resultado-mao-manchas-p004.png` · sha256 `51263e59bfff32dd…`
- Descrição: Duas fotos lado a lado do dorso da mão esquerda sobre campo branco, com legendas "antes" e "em cicatrização" na faixa preta superior. Antes: várias manchas acastanhadas. Em cicatrização: manchas mais claras, áreas rosadas. Anel dourado com sinete no dedo; ao fundo, mão de outra pessoa com unha vermelha.
- Alt: Dorso da mão antes e em cicatrização após tratamento de manchas
- Uso sugerido: Placeholder de preview só em página de serviço de manchas, se esse serviço existir e for habilitado. Serve de exemplo honesto de fase de cicatrização.
- Crop: nenhum · Edições: nenhuma
- OCR: "antes em cicatrização"
- Problemas:
  - Serviço não identificado (laser, luz pulsada ou peeling?): CONFIRMAR procedimento e equipamento (registro ANVISA)
  - Foto "em cicatrização" não mostra resultado final: não pode ser apresentada como resultado
  - Anel com sinete pode ajudar a identificar a paciente; cobrir exigiria editar a foto (não permitido): decidir
  - Mão de outra pessoa (unha vermelha) aparece na foto
  - Legendas na faixa superior são neutras (não são promessa) e foram mantidas
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada

### `resultado-labios-frontal-p005`
- Arquivo: `assets-originais/resultados/resultado-labios-frontal-p005.png` · sha256 `971ceb487b9997f3…`
- Descrição: Duas fotos empilhadas da parte inferior do rosto (nariz, lábios e queixo), vista frontal, paciente em cadeira com encosto branco. Acima: sardas na pele, blusa roxa. Abaixo: pele sem sardas visíveis, lábios de tom mais claro, jaqueta jeans. Nome da clínica em letra cursiva sobreposto no centro da imagem, atravessando as duas fotos.
- Alt: Parte inferior do rosto antes e depois
- Uso sugerido: Descartar: a comparação não é confiável.
- Crop: nenhum · Edições: nenhuma
- OCR: "" EST - !"
- Problemas:
  - Sardas presentes no antes e ausentes no depois, sem relação com procedimento labial: indica maquiagem, filtro ou edição, e a comparação fica enganosa
  - Roupas, luz e cor diferentes entre as fotos (sessões distintas, sem padronização)
  - Nome da clínica em cursiva sobreposto no meio da foto (selo), cobrindo a pele
  - Padrão de sardas é característica que pode identificar a paciente
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada
