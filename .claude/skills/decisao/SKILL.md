---
name: decisao
description: Registra uma decisão técnica como ADR em docs/adr/ (contexto, opções, recomendação, consequências). Use para decisões em aberto como cloud, Terraform, pipeline, troca de lib ou de provedor de LLM.
argument-hint: <tema da decisão>
---
Tema: $ARGUMENTS

1. Veja se já existe ADR sobre o tema em `docs/adr/` (ex.: `0001-deploy-nuvem.md`). Se existir, atualize-o.
2. Senão, copie `docs/adr/0000-template.md` para o próximo número livre com slug do tema.
3. Preencha contexto (fatos, com fonte quando externos), 2–4 opções com prós/contras e custo,
   uma **recomendação** explícita e as consequências. Status inicial: **Proposto**.
4. Liste as perguntas que só o usuário responde e pare. Só mude para **Aceito** com o ok explícito dele.
5. Depois de aceito, atualize o guia correspondente (ex.: `.claude/guias/deploy-infra.md`) e o roadmap.
