# Reputação: avaliações, respostas e Perfil da Empresa no Google

> ⚠️ **VALIDAR COM O CONSELHO APLICÁVEL ANTES DE USAR.** Pedir avaliações e respondê-las é publicidade em saúde. As regras mudam conforme o perfil regulatório da responsável (CFM, CFO, CFBM, CFF ou estética sem conselho) e conforme o CDC e a LGPD. Este documento é um ponto de partida conservador, **não é parecer jurídico**. Registrar aqui a data e quem validou: **PENDENTE**.

## Princípios
1. **Pedir a todos, sem filtro.** A mensagem vai para TODAS as pessoas atendidas, e não só para quem pareceu satisfeita. Nada de perguntar "gostou?" antes de enviar o link (isso é filtro de satisfação, o chamado *review gating*, e as políticas do Google o vedam).
2. **Sem incentivo.** Nenhum brinde, desconto, sorteio, sessão, cupom ou vantagem em troca de avaliação, nem para a equipe por número de avaliações.
3. **Sigilo.** Nunca confirmar, nem por implicação, que alguém é ou foi paciente. Nunca citar procedimento, resultado, data ou qualquer dado de saúde em resposta pública.
4. **Nada de avaliação falsa.** Nem da equipe, nem de familiares, nem comprada.

## Onde está no site
- `/avaliar` (noindex, fora do menu): um botão direto para o Google, sem pergunta prévia. Texto e link em `src/config/reputacao.config.ts`.
- Plaquinha A5 com QR para `/avaliar`: `pnpm impressos` → `print/plaquinha-avaliacao.pdf`. O QR aponta para o site, e não direto para o Google, para que o link possa mudar sem reimprimir. Enquanto domínio ou link estiverem CONFIRMAR, a plaquinha sai com a faixa "PROVISÓRIO — NÃO IMPRIMIR".

## Mensagem pós-atendimento (enviar a TODAS as pessoas atendidas)
Enviar pelo mesmo canal do agendamento, 1 a 3 dias depois, **uma única vez**:

> Olá! Obrigada pela visita à clínica. Se quiser, você pode deixar sua opinião sobre o atendimento no Google: [link /avaliar]. É voluntário, nada é oferecido em troca, e não é preciso mencionar procedimentos ou informações de saúde. Qualquer dúvida sobre seus cuidados, fale com a gente por aqui.

Não enviar: lembretes repetidos, pedidos de "5 estrelas", pedidos de foto ou de relato de resultado.

## Modelos de resposta pública
Regra: responder a todas as avaliações (positivas e negativas) em até 7 dias, com o mesmo tom, sem nomes, sem procedimento, sem confirmar vínculo.

**Positiva**
> Agradecemos por compartilhar sua opinião. Ficamos à disposição.

**Neutra**
> Obrigada pelo retorno. Toda opinião nos ajuda a melhorar. Se quiser conversar, estamos no [telefone/WhatsApp da clínica].

**Negativa**
> Lamentamos que a experiência relatada não tenha correspondido às expectativas. Por respeito à privacidade de todas as pessoas, não comentamos casos em público. Pedimos que entre em contato pelo [telefone/WhatsApp] para que possamos conversar.

**Menciona procedimento, resultado ou dado de saúde**
> Agradecemos a mensagem. Por sigilo, não comentamos atendimentos em público. Estamos à disposição pelo [telefone/WhatsApp].
(E, se a pessoa se expôs demais, orientá-la em privado a editar a avaliação. Nunca editar ou pedir remoção por ela ser negativa.)

**Suspeita de avaliação falsa ou ofensiva**
Não discutir em público. Usar "Denunciar avaliação" no Google só quando violar a política (conflito de interesses, ofensa, spam), e nunca por ser negativa.

**Nunca escrever:** "como você sabe, seu procedimento...", "no seu caso...", "o resultado do seu preenchimento...", o nome da pessoa, datas de atendimento, "desconto na próxima".

## Checklist do Perfil da Empresa no Google
- [ ] Nome exatamente igual ao da fachada (sem palavras-chave extras)
- [ ] Categoria principal coerente com o perfil regulatório (ex.: "Clínica de estética"; **não** usar categoria médica se a responsável não for médica)
- [ ] Serviços: **só os publicáveis** no site (mesma regra de executora habilitada); sem preço promocional
- [ ] Endereço de Lages; Balneário Camboriú só se houver atendimento fixo com alvará próprio (**CONFIRMAR**)
- [ ] Horários de cada unidade e feriados
- [ ] Telefone e WhatsApp iguais aos do site
- [ ] Link do site (página inicial)
- [ ] Fotos: fachada, recepção, salas, equipamentos e equipe, todas de autoria própria. **Nenhuma foto de paciente** e nenhum antes/depois
- [ ] Descrição sem superlativo, sem promessa, sem marca de medicamento
- [ ] Perguntas e respostas: responder com as mesmas regras de sigilo
- [ ] Posts: seguir as mesmas regras de conteúdo do site

## Política de moderação (interna)
- Responsável pelas respostas: **CONFIRMAR** (uma pessoa; substituta definida).
- Prazo: até 7 dias; negativas, em até 2 dias úteis.
- Registro interno de avaliações negativas e da conversa privada, **fora do repositório** e sem dado de saúde.
- Revisão trimestral destes modelos e da validação com o conselho.
