# Regras regulatórias e como o build as aplica

Princípio: **o site só anuncia o que a pessoa executora está habilitada a executar.**
Este documento não é parecer jurídico. Cada norma citada precisa ter o texto vigente conferido antes de ser aplicada.

## Onde fica cada regra
| Arquivo | Conteúdo |
|---|---|
| `src/config/profile.config.ts` | Responsável, `perfilRegulatorio`, `tratamento` (vazio = nunca "Dra."), conselho, equipe (conselho, registro, conferência), unidades, contatos |
| `src/config/servicos.config.ts` | Serviços via `defineServico` (deriva `exigeHabilitacao` e a rota reservada de sensíveis) |
| `src/config/compliance.config.ts` | Regras por perfil (tratamentos, promoção, antes/depois, identificação, termos vetados, normas), matriz conselho × categoria, rota reservada |
| `src/lib/regras/index.ts` | Motor: funções puras, testadas em `tests/regras.test.ts` |
| `scripts/validate-config.ts` | Roda em `check` e `build` |
| `scripts/pendencias.ts` | `pnpm pendencias` → `docs/PENDENCIAS.md`, agrupado |

Trocar o perfil em `profile.config.ts` troca as regras; nenhum componente muda.

## O que bloqueia o build de produção
| Regra | Grupo |
|---|---|
| `perfilRegulatorio` CONFIRMAR; tratamento que o perfil não comporta; perfil com conselho sem nº/UF; "Dra./Dr." escrito em texto livre ou no HTML fora do componente | Identidade profissional |
| Serviço publicável invasivo sem executor com conselho, registro, `registroConferido` e habilitação conselho × categoria conferida | Serviços |
| Serviço sensível fora de `/reservado/` ou sem noindex; link para rota reservada em página pública | Serviços |
| Equipamento/produto de serviço publicável sem registro ANVISA conferido | ANVISA |
| Mídia de serviço publicável sem consentimento, autoria própria, OCR aprovado e sem problemas | Mídia |
| Termo vetado (base + perfil + promoção quando o perfil não permite) no config ou no HTML | Termos |
| CONFIRMAR em dado que aparece no site | Identidade / Outros |

Em dev/preview tudo vira aviso: o site sai `noindex` com a faixa "em revisão", e itens com impedimento não renderizam. Serviços e mídias **não publicados** nunca bloqueiam: aparecem como pendência. Não existe flag para pular a validação.

## Medicamentos de prescrição
Nunca marca, nunca o nome do produto. Insumo com `prescricao: true` nunca aparece; o serviço fala só de "avaliação" e "procedimento".

## LGPD
Sem formulário, sem analytics, sem embeds, sem fontes externas. Contato por link de WhatsApp. Qualquer terceiro futuro só depois de banner de consentimento (bloqueio prévio, não "opt-out").
