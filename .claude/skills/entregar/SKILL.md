---
name: entregar
description: Fecha a entrega - confere testes, faz commit em branch e (com pedido explícito) push e PR.
argument-hint: [mensagem de commit]
disable-model-invocation: true
---
1. Confirme que não está em `master`; se estiver, crie branch `feat|fix|chore/<slug>`.
2. `yarn test` e `yarn lint:check` verdes; `git status` sem `.env` ou segredos.
3. Commit em português, no padrão do repo (`feat: ...`, `fix: ...`), mensagem: ${ARGUMENTS:-derivada do plano}.
4. Pergunte antes de `git push` e de abrir PR (`gh pr create`). Corpo do PR: objetivo, mudanças,
   testes, link do plano, resultado de `/revisao` e `/analise-seguranca` se rodados.
