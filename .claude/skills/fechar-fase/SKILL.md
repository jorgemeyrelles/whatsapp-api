---
name: fechar-fase
description: Confere o checklist de saída da fase atual contra o código real e só então marca a fase como concluída no plano.
argument-hint: [slug]
---
1. Abra `.claude/plans/$ARGUMENTS/00-plano.md` e o arquivo da fase em aberto.
2. Verifique cada item do checklist de saída contra o repositório (arquivo existe, teste roda e passa,
   lint limpo) — não contra o que foi dito na conversa.
3. Rode `yarn test` e `yarn lint:check`.
4. Faltou algo → liste o que falta e **não marque**. Tudo ok → marque `[x]` no plano, registre em
   "Notas" 1–3 linhas do que a próxima sessão precisa saber (decisões, arquivos-chave).
5. Se foi a última fase: mova a tarefa para "Concluídas" no roadmap e sugira `/revisao` e `/entregar`.
