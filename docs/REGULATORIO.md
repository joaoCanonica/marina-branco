# Regras regulatórias e como o build as aplica

Princípio: **o site só anuncia o que a pessoa executora está habilitada a executar.**
Este documento não é parecer jurídico. Cada norma citada precisa ter o texto vigente conferido antes de ser aplicada.

## O que bloqueia o build

| Regra | Onde | Ambiente |
|---|---|---|
| Serviço `publicar: true` invasivo sem executor com registro, `registroConferido` e habilitação conselho×categoria conferida | `src/lib/regras/index.ts` | todos |
| Equipamento sem registro ANVISA conferido | idem | todos |
| Página de conteúdo sem `docs/pesquisa/<slug>.md` com `Status: aprovado` | idem | todos |
| "Dra./Dr." sem `tituloConfirmado`; RQE fora do CFM | idem + HTML final | todos |
| Termos proibidos (definitivo, garantia, superlativos, marcas de medicamento, "toxina botulínica", manipulados, promoções) | `src/lib/regras/texto.ts`, config + HTML final | todos |
| Qualquer `CONFIRMAR` na clínica, no executor de serviço publicado ou no HTML | idem | produção |
| Mídia referenciada que não passa em `impedimentosMidiaProducao` | idem + componente `Midia` | produção |
| Mídia provisória sem `PREVIEW_PROTECAO_CONFIRMADA=true` | idem | preview/dev |
| `VERCEL_ENV=production` sem `SITE_ENV=production` | `src/lib/ambiente.ts` | — |

Não existe flag para pular essas verificações. Para publicar, o dado precisa ser corrigido.

## Perfil regulatório (pendente)
Depende do conselho real de cada executora (`src/config/profissionais.ts`):

- **CFM (médica):** seguir a Res. CFM 2.336/2023 (publicidade médica) — identificação com CRM/RQE; antes/depois só no formato que a resolução admite. Conferir texto vigente.
- **Outro conselho ou nenhum:** Código de Defesa do Consumidor (arts. 30–37, publicidade), vigilância sanitária (municipal/estadual e RDCs ANVISA aplicáveis ao estabelecimento), resolução de publicidade do conselho aplicável. Injetáveis tratados como altíssimo risco.

Enquanto o perfil não estiver definido, `antesDepois: true` bloqueia produção.

## Matriz de habilitação
`src/config/habilitacoes.ts` lista combinações conselho×categoria como **ponto de partida para pesquisa**. Nenhuma vem conferida. Várias resoluções de conselhos não médicos sobre estética já foram questionadas na Justiça: conferir a situação atual (vigência e decisões) antes de preencher `textoVigenteConferido`.

## Medicamentos de prescrição
Nunca marca, nunca o nome do produto. Serviço com `envolvePrescricao: true` fala só de "avaliação" e "procedimento".

## LGPD
Sem formulário, sem analytics, sem embeds, sem fontes externas. Contato por link de WhatsApp. Qualquer terceiro futuro só depois de banner de consentimento (bloqueio prévio, não "opt-out").
