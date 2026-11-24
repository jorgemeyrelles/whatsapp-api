# whatsapp-api — CLAUDE.md

API REST sobre Baileys (WhatsApp Web não oficial) em **migração** para uma assistente de
portfólio com LLM. Hoje: JS/CommonJS, Express 4, Baileys 6.6, Mongo. Alvo: Node 24 LTS,
TypeScript ESM, NestJS + Zod, Baileys 7, Redis + BullMQ, duas LLMs gratuitas (Groq + Gemini).

## Como trabalhar aqui (economia de tokens)
1. Comece por `.claude/plans/00-roadmap.md` e pelo plano ativo (o hook de início de sessão mostra qual).
2. Leia **só** as rules/guias listados no plano da tarefa. Não leia `src/api/class/instance.js`
   inteiro (1.097 linhas): use `.claude/guias/mapa-codigo-atual.md` e `grep -n`.
3. Use as skills em vez de prompt livre: `/nova-tarefa`, `/atualizar-funcionalidade`,
   `/corrigir-bug`, `/continuar`, `/fechar-fase`, `/revisao`, `/analise-seguranca`,
   `/analise-arquitetura`, `/decisao`, `/entregar`.
4. Ao fim de cada fase, atualize o checklist do plano — é a memória entre sessões.

## Mapa do harness
- `.claude/rules/` — O QUE é exigido (checklist verificável; carregam sozinhas por caminho).
- `.claude/guias/` — POR QUÊ e COMO (narrativa; leia sob demanda).
- `.claude/skills/` — procedimentos (`/nome`). `.claude/agents/` — revisores read-only.
- `.claude/plans/` — estado das tarefas. `docs/adr/` — decisões registradas.

## Comandos
- `yarn dev` · `yarn test` · `yarn lint:check` · `yarn format:check`
- Local completo: `docker compose up -d` (Mongo + API na 3333)

## Inegociáveis
- Nunca leia nem escreva `.env`; segredos só em variável de ambiente / Vault.
- Trabalhe em branch; `master` só recebe PR. Nada de push sem pedido explícito.
- Mudança de comportamento exige teste (ou conversa gravada) antes do código.
- Decisão ainda em aberto (cloud, Terraform, pipeline) → `/decisao`, não implemente por suposição.
- O modelo escreve texto; o **código** decide escopo, próximo passo e envio (ver `rules/llm.md`).
