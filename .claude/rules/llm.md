---
paths:
  - "src/**/atendimento/**"
  - "src/**/modelos/**"
  - "conhecimento/**"
---
# Atendimento com LLM (checklist)

- [ ] Escopo fechado: trabalho/projetos, forma de trabalhar, soft skills, serviços
- [ ] Recusa é constante escrita pelo Jorge — o modelo nunca redige a recusa
- [ ] Guarda de entrada (regra + injeção) antes do modelo; `judge()` depois dele
- [ ] Resposta só passa se `sources` ⊆ trechos enviados; preço/prazo só se literal na base
- [ ] Mensagem do visitante vai delimitada como dado; prefixo do prompt estável
- [ ] Saída do modelo validada pelo schema `ModelReply`; inválida → frase segura
- [ ] Fallback para o modelo reserva no máximo uma vez por turno
- [ ] Encerrar/encaminhar/enviar resumo é decisão do código lendo campos, nunca texto livre
- [ ] Resumo ao dono só com `consent === true`; nome/contato/serviço vêm do estado
- [ ] Cada turno registra modelo, tokens in/out, ms e veredito (sem `conversationId` em métrica)
- [ ] Sem urgência/escassez inventada; um convite por resposta
