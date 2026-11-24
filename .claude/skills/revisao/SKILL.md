---
name: revisao
description: Revisão de código do diff atual (ou de uma branch/caminho) contra as rules do projeto, em contexto isolado. Use antes de abrir PR ou ao fechar uma tarefa.
argument-hint: [branch | caminho] (padrão: diff contra master)
context: fork
agent: revisor
---
Revise: ${ARGUMENTS:-o diff da branch atual contra master, incluindo alterações não commitadas}.
Siga suas instruções de revisor e devolva só a tabela de apontamentos.
