---
name: nova-tarefa
description: Abre uma tarefa nova (funcionalidade, módulo ou etapa do roadmap) criando um plano em .claude/plans/<slug>/ com fases. Use quando o pedido for construir algo que ainda não existe.
argument-hint: <slug-curto> <descrição em uma linha>
---
Tarefa: $ARGUMENTS

1. Leia `.claude/plans/00-roadmap.md` e identifique a etapa a que a tarefa pertence. Se depender de
   decisão em aberto (ex.: cloud/Terraform/pipeline), pare e sugira `/decisao`.
2. Copie `.claude/plans/_templates/00-plano.md` para `.claude/plans/<slug>/00-plano.md` e preencha:
   objetivo, escopo (dentro/fora), critério de pronto mensurável, rules e guias que se aplicam
   (só os necessários) e as fases.
3. Fases padrão (remova as que não cabem): 01 mapeamento → 02 testes primeiro → 03 implementação →
   04 revisão. Crie cada `NN-fase-*.md` a partir de `_templates/fase.md`, com passos curtos e checklist de saída.
4. Liste no máximo 3 perguntas que bloqueiam a Fase 1 e **pare para o usuário responder**.
5. Adicione a tarefa em "Tarefas ativas" do roadmap. Não escreva código nesta skill.
