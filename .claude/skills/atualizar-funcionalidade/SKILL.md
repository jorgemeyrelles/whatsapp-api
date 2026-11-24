---
name: atualizar-funcionalidade
description: Altera uma funcionalidade existente preservando o comportamento que não deve mudar. Use para mudar rota, regra, contrato, texto de atendimento ou integração já existente.
argument-hint: <o que muda> [arquivo ou rota]
---
Mudança: $ARGUMENTS

1. Localize o ponto com `grep -n` e `.claude/guias/mapa-codigo-atual.md` (legado) ou o módulo alvo.
   Leia só as funções afetadas e quem as chama (`grep -rn "<nome>" src`).
2. Escreva em 3–5 linhas: comportamento atual → comportamento novo → o que NÃO pode mudar → impacto em contratos.
3. Garanta rede de segurança: teste existente cobre o comportamento atual? Se não, escreva-o primeiro e
   confirme que passa **antes** de alterar.
4. Altere o mínimo. Se o contrato Zod mudar, atualize request/response e testes juntos.
5. Rode `yarn test` e `yarn lint:check`. Se a mudança for maior que ~3 arquivos ou tocar atendimento/canal,
   crie plano com `/nova-tarefa` em vez de seguir aqui.
6. Responda com: arquivos alterados, testes adicionados, risco residual (1 linha cada).
