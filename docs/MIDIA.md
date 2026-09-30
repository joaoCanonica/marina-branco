# Mídia

> Gerado por `pnpm midia:inventario` a partir de `media.manifest.json`. Não editar à mão.

## Regras
- Originais em `assets-originais/<marca|equipe|espaco|resultados|videos>/`, versionados e **nunca modificados** (sha256 conferido a cada geração).
- Derivados em `src/assets/media/` (fora do git), gerados por `scripts/prepare-media.mjs` antes de `dev`/`build`: só recorte e cobertura sólida; AVIF + WebP em várias larguras; metadados (EXIF/GPS) descartados.
- Produção gera só `publicavel: true` e falha se algum tiver consentimento ≠ ok/nao-se-aplica, autoria ≠ propria, OCR não aprovado ou problema em aberto.
- Dev/preview gera também `previewOk: true`, marcados como provisórios (selo PROVISÓRIO; deploy de preview protegido por senha).
- Nunca nome ou @ de paciente: `pacienteRef` (P-001); o vínculo fica fora do repo.
- OCR: `pnpm midia:ocr` (local, sem rede) grava `ocr.texto`/`ocr.ok`.

## Inventário (15 itens)

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
| `resultado-perfil-rosto-p006` | resultados | 462×782 · 232 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 9 problema(s) em aberto |
| `resultado-papada-perfil-p007` | resultados | 472×718 · 180 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 9 problema(s) em aberto |
| `resultado-nariz-perfil-p008` | resultados | 444×661 · 222 KB | CONFIRMAR | pendente | reprovado | não | não | consentimento "pendente"; autoria "CONFIRMAR"; OCR reprovado; 11 problema(s) em aberto |
| `resultado-perfil-rosto-antes-p009` | resultados | 461×723 · 295 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 8 problema(s) em aberto |
| `resultado-perfil-rosto-depois-p009` | resultados | 478×697 · 273 KB | CONFIRMAR | pendente | ok | não | não | consentimento "pendente"; autoria "CONFIRMAR"; 8 problema(s) em aberto |
| `video-laser-fracionado-facial` | videos | 720×1280 · 4894 KB | CONFIRMAR | pendente | não rodado | não | não | consentimento "pendente"; autoria "CONFIRMAR"; OCR não rodado; 7 problema(s) em aberto |

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

### `resultado-perfil-rosto-p006`
- Arquivo: `assets-originais/resultados/resultado-perfil-rosto-p006.png` · sha256 `e9535d7d039fca78…`
- Descrição: Colagem de quatro fotos em fundo preto de uma mulher com faixa preta no cabelo: acima, duas fotos do rosto inclinado para cima em perfil direito (contorno do queixo e pescoço); abaixo, duas fotos em perfil direito com a cabeça reta, a da esquerda com blazer branco e a da direita com blusa escura e cabelo solto. Brincos dourados de argola. Monograma da clínica sobreposto em duas das fotos.
- Alt: Perfil do rosto e do contorno do queixo, antes e depois
- Uso sugerido: Descartar: identifica a paciente e a comparação não é padronizada.
- Crop: {"x":0,"y":0,"w":462,"h":766} · Edições: recorte (remove a barra de resposta da interface do Instagram na base)
- OCR: "\| Y BPe—"
- Problemas:
  - Rosto inteiro identificável (olhos, nariz, boca, orelha, brincos): identificação da paciente
  - Colagem de quatro fotos sem indicação de qual é antes e qual é depois
  - Ângulo, roupa, cabelo e luz diferentes entre as fotos de baixo (sessões distintas)
  - Monograma da clínica sobreposto em duas fotos (selo)
  - Original é captura de tela de story do Instagram (interface removida por recorte no derivado)
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada

### `resultado-papada-perfil-p007`
- Arquivo: `assets-originais/resultados/resultado-papada-perfil-p007.png` · sha256 `bc7dab3f8194e481…`
- Descrição: Duas fotos empilhadas de uma mulher em perfil direito com o rosto inclinado para cima, em fundo cinza-escuro, com faixa preta na testa (com monograma) e touca descartável. Linhas tracejadas brancas desenhadas sobre a região da mandíbula/papada e um arco sobre a bochecha em cada foto. Na foto de baixo, bochecha mais avermelhada e cabelo solto. Monograma da clínica no canto inferior direito.
- Alt: Perfil do rosto com contorno da papada, antes e depois
- Uso sugerido: Descartar: identifica a paciente e tem linhas desenhadas.
- Crop: {"x":0,"y":117,"w":470,"h":601} · Edições: recorte (remove o título "PAPADA" da faixa preta superior)
- OCR: (sem texto)
- Problemas:
  - Rosto inteiro identificável (olhos, nariz, boca, pintas na bochecha): identificação da paciente
  - Linhas tracejadas desenhadas sobre as duas fotos; removê-las exigiria reconstruir a imagem
  - Vermelhidão na bochecha e cabelo diferentes na foto de baixo: condições diferentes entre antes e depois
  - Monograma da clínica sobreposto à foto e na faixa de cabelo (selo)
  - Procedimento de papada não identificado (injetável lipolítico? equipamento?): CONFIRMAR; se for medicamento de prescrição, não anunciar o produto
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada

### `resultado-nariz-perfil-p008`
- Arquivo: `assets-originais/resultados/resultado-nariz-perfil-p008.png` · sha256 `c305494406de7688…`
- Descrição: Duas fotos empilhadas em fundo preto de uma mulher em perfil esquerdo, rosto inclinado para cima, com faixa preta na testa (monograma bordado). Um traço branco curvo desenhado acima do dorso nasal em cada foto; na de baixo o traço é mais reto. Olho, sobrancelha, cílios, nariz e boca visíveis. Monograma da clínica no canto inferior direito.
- Alt: Perfil do nariz antes e depois de procedimento no dorso nasal
- Uso sugerido: Descartar: identifica a paciente e tem traços desenhados.
- Crop: nenhum · Edições: nenhuma
- OCR: "ESA ' VADE Cia Ala e Dada"
- Problemas:
  - Rosto identificável (olho, sobrancelha, nariz e boca de perfil)
  - Traços desenhados sobre as duas fotos indicando o contorno; removê-los exigiria reconstruir a imagem
  - Diferença de luz e de inclinação da cabeça entre as fotos
  - Monograma da clínica sobreposto e bordado na faixa (selo)
  - Procedimento sugerido (rinomodelação com preenchedor) é de alto risco (evento vascular)
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada
  - OCR: possível nome próprio: "Cia Ala"
  - OCR: possível nome próprio: "VADE" (confiança 35%)

### `resultado-perfil-rosto-antes-p009`
- Arquivo: `assets-originais/resultados/resultado-perfil-rosto-antes-p009.png` · sha256 `21455fb0fc735dff…`
- Descrição: Foto de uma mulher deitada em perfil direito, rosto inclinado para cima, com faixa preta na testa, brinco preto em forma de trevo, fundo de estofado preto. Olho aberto, nariz, boca e queixo visíveis; pele com sardas. Primeira de um par (a segunda é o arquivo "depois").
- Alt: Perfil do rosto antes de procedimento de harmonização
- Uso sugerido: Descartar: identifica a paciente; o par depende do arquivo com texto de promessa.
- Crop: {"x":0,"y":110,"w":461,"h":613} · Edições: recorte (remove a chamada de story sobreposta no fundo superior ("toque para harmonizar"))
- OCR: (sem texto)
- Problemas:
  - Rosto inteiro identificável (olho, nariz, boca, sardas, brinco)
  - Original é tela de story com chamada de interação sobreposta (removida por recorte no derivado)
  - Antes e depois estão em arquivos separados, sem enquadramento idêntico
  - Procedimento de "harmonização" não especificado: pode envolver vários injetáveis; CONFIRMAR
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada

### `resultado-perfil-rosto-depois-p009`
- Arquivo: `assets-originais/resultados/resultado-perfil-rosto-depois-p009.png` · sha256 `a7fbecc18f4f61be…`
- Descrição: Mesma pessoa e cenário do arquivo "antes": perfil direito, rosto inclinado para cima, faixa preta, brinco em trevo. Olho fechado, lábios com batom/brilho, pele com aspecto mais brilhante. Segunda foto do par.
- Alt: Perfil do rosto depois de procedimento de harmonização
- Uso sugerido: Descartar pelo mesmo motivo do "antes".
- Crop: {"x":0,"y":160,"w":478,"h":537} · Edições: recorte (remove texto de promessa sobreposto no fundo superior ("que transformação" e chamada de story))
- OCR: "ESA À 6» ais"
- Problemas:
  - Rosto inteiro identificável (nariz, boca, sardas, brinco)
  - Original tinha texto de promessa sobreposto ("que transformação"), removido por recorte no derivado
  - Lábios com batom/brilho e pele mais brilhante que no "antes": condições diferentes realçam a diferença
  - Ângulo e inclinação diferentes do "antes"
  - Sem termo de autorização de imagem assinado (consentimento pendente)
  - Autoria da foto não confirmada (quem fotografou; se é da clínica)
  - Tempo decorrido entre antes e depois não informado
  - Procedimento e executora não informados: CONFIRMAR qual procedimento, quem executou e se é habilitada

### `video-laser-fracionado-facial`
- Arquivo: `assets-originais/videos/laser-fracionado-facial-demonstracao.mp4` · sha256 `5f43fea3c09830fa…`
- Descrição: Vídeo vertical de 33,2 s (720×1280, H.264 30 fps + áudio AAC estéreo 44,1 kHz, 1,2 Mb/s). Começa com uma profissional de preto segurando a ponteira de um equipamento de laser e falando para a câmera; depois, close de uma paciente deitada com protetores oculares recebendo disparos de laser fracionado na testa e na face, aplicados por mãos de luvas azuis; tela do equipamento aparece ao fundo. Legendas embutidas em todo o vídeo. Poster (21 s) em assets-originais/videos/_gerados/; versões web mudas de 540 px (MP4 H.264 2,3 MB, WebM VP9 2,1 MB) geradas fora do git em midia-web/videos/.
- Alt: Demonstração de aplicação de laser fracionado no rosto
- Uso sugerido: Descartar para o site. Não é possível loop de hero: todas as cenas têm legenda de promessa e pessoas identificáveis. Serve de referência para gravar um vídeo novo do equipamento, sem legendas de resultado.
- Crop: nenhum · Edições: nenhuma
- OCR: (sem texto)
- Problemas:
  - O nome do arquivo recebido fala em depilação a laser, mas o conteúdo é laser fracionado facial (outro procedimento, outro serviço)
  - Legendas embutidas com afirmações de resultado ("pele com textura mais bonita", "poros menos aparentes", "linhas suavizadas", "aspecto mais firme e iluminado", "produzindo colágeno novo"); não dá para recortar sem perder o vídeo
  - Rosto da profissional identificável: CONFIRMAR quem é, se é habilitada para laser e autorização de imagem
  - Paciente parcialmente identificável (rosto com protetores oculares) sem termo
  - Equipamento sem registro ANVISA confirmado; marca/modelo não identificados
  - Trecho falado não transcrito nem revisado (áudio mantido só no original)
  - Autoria não confirmada (provável reels de rede social)
