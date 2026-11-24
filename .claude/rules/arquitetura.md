---
paths:
  - "src/**"
---
# Arquitetura (checklist)

- [ ] Módulo só depende de outro pela interface injetada (token NestJS), nunca da implementação
- [ ] `atendimento/` não importa nada de `canal/` nem de Baileys; `canal/` não sabe que existe LLM
- [ ] Toda fronteira (HTTP, fila, saída do modelo) valida com schema Zod; request ≠ response ≠ model
- [ ] Destinatário é `conversationId` opaco (LID ou número) — nunca remontar a partir do telefone
- [ ] Sem estado global (`global.*`); estado vai para Redis/Mongo via repositório
- [ ] Um único cliente MongoDB (repositórios), não Mongoose + driver lado a lado
- [ ] Textos de atendimento ficam em `conhecimento/`, nunca hard-coded em handler
- [ ] Versão do Baileys fixada (sem `^`); atualização é tarefa própria
- [ ] Reconexão com backoff exponencial e limite de tentativas
- [ ] Arquivo novo < 300 linhas; acima disso, dividir por responsabilidade
