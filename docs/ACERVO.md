# Acervo de mídia — consolidação

Data: 2026-09-30 · Base: `media.manifest.json` (15 itens, lotes 1–4). Detalhe por item em `docs/MIDIA.md`; o que falta para publicar em `docs/PENDENCIAS_MIDIA.md`.

**Resumo:** 0 itens publicáveis. 3 servem só como placeholder de preview (com selo PROVISÓRIO). 12 são referência ou descarte. Nenhum serviço do catálogo tem hoje uma única peça utilizável em produção.

Escala de qualidade: **A** alta resolução, padronizada · **B** utilizável com ressalvas · **C** baixa resolução ou não padronizada · **D** inutilizável (identificação, marcações, promessa, terceiro).
Risco: regulatório/LGPD caso a peça fosse publicada como está.

## Por serviço

| Serviço (config) | Peças | Qualidade | Preview | Lacunas | Risco |
|---|---|---|---|---|---|
| `avaliacao-injetaveis` (preenchimentos labial e nasal, "harmonização") | 7 fotos: P-001, P-002, P-003, P-005, P-008, P-009 (par antes/depois) | 2× **B** (P-002, P-003), 1× **C** (P-001), 4× **D** (P-005, P-008, P-009 ×2) | P-002, P-003 | Nenhuma com termo; nenhuma com tempo decorrido; nenhuma padronizada; nenhuma sem selo; executora não confirmada | **Altíssimo**: injetáveis, rosto identificável em 3 peças, setas/traços em 2, possível filtro em 2, crédito de outro perfil em 1 |
| `depilacao-a-laser` | 0 (o vídeo recebido com esse nome é de laser fracionado) | — | — | Tudo: equipamento, sala, aplicação, nenhuma foto de resultado | Alto: equipamento sem registro ANVISA; nome do serviço depende do equipamento real |
| `micropigmentacao-sobrancelhas` | 0 | — | — | Tudo | Alto |
| `limpeza-de-pele` | 0 | — | — | Tudo | Baixo (não invasivo) |
| Sem serviço no catálogo: manchas na mão (laser/peeling?) | 1 foto: P-004 ("em cicatrização") | **B** | P-004 | Procedimento, equipamento e resultado final | Alto: mostra fase de cicatrização; procedimento desconhecido |
| Sem serviço no catálogo: papada | 1 foto: P-007 | **D** | — | Procedimento (injetável lipolítico? equipamento?) | Altíssimo: rosto identificável, traços desenhados; pode envolver medicamento de prescrição |
| Sem serviço no catálogo: contorno facial | 1 colagem: P-006 | **D** | — | Procedimento; antes/depois indefinidos | Alto: rosto identificável |
| Sem serviço no catálogo: laser fracionado facial | 1 vídeo (33 s) + poster | **D** para o site | — | Vídeo sem legendas de resultado; registro ANVISA; executora | Alto: legendas com promessa em todas as cenas; profissional e paciente identificáveis |

## Institucional

| Uso | Peças | Qualidade | Lacunas | Risco |
|---|---|---|---|---|
| Marca | Monograma 150×150 JPEG + traçado SVG aproximado; letreiro (recorte de Street View) | **C** / **D** | Vetor original do logo; manual de marca; titularidade | Baixo (sem pessoas), mas autoria não confirmada |
| Espaço | Fachada (Google Street View) | **D** | Fachada, recepção, salas, equipamentos — tudo com foto própria | Médio: foto de terceiro com marca d'água |
| Equipe / proprietária | Selfie de espelho na sala | **D** | Retratos profissionais; identificação de quem é quem | Médio: rosto identificável, autoria incerta |

## Leitura do acervo
1. **Todo o acervo veio de redes sociais.** Os padrões que se repetem são exatamente os vetados: título e chamada de story sobre a foto, selo da marca sobre a pele, setas e traços desenhados, luz e ângulo diferentes entre antes e depois, rosto identificável.
2. **Concentração em injetáveis faciais**, que é a área de maior risco e só publica com executora habilitada e registro conferido.
3. **Não há nenhuma peça dos serviços não invasivos**, que seriam os mais simples de publicar primeiro.
4. **A sessão de fotos é o caminho crítico** do site: ver `docs/PRODUCAO_DE_MIDIA.md`.

## Decisões pendentes (acumuladas)
- Tirar `assets-originais/resultados/` e `videos/` do git (e do histórico): hoje há 9 originais de pacientes versionados, a maioria com rosto.
- Origem do @ na P-001 (foto de outra profissional?).
- Selo da marca sobre as fotos: aceitar ou exigir fotos sem selo.
- Catálogo real de serviços e executoras (vários procedimentos do acervo não estão no config).
- Equipamentos de laser: marca, modelo e registro ANVISA.
