---
name: continuar
description: Retoma a tarefa ativa do ponto onde parou, lendo só o plano e a fase em aberto. Use no início de uma sessão ou quando o usuário disser "continua".
argument-hint: [slug]
---
1. Plano: `.claude/plans/$ARGUMENTS/00-plano.md` (sem argumento: a primeira tarefa ativa do roadmap).
2. Identifique a primeira fase não marcada e leia **só** o arquivo dessa fase e as rules/guias que o plano lista.
3. Confira o estado real (`git status`, `git log --oneline -5`, arquivos citados na fase) — o plano pode estar desatualizado.
4. Diga em 2 linhas onde a tarefa está e o próximo passo; então execute a fase.
5. Ao concluir a fase, chame `/fechar-fase`.
